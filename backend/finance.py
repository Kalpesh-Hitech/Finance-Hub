from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from RequestModel import BudgetCreate, BudgetOut, TransactionCreate, TransactionOut
from database import get_db
from models import User, Transaction, Budget
from helper import get_current_user
from datetime import datetime

financerouter = APIRouter()
@financerouter.get("/transactions", response_model=List[TransactionOut])
def get_transactions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Transaction).filter(Transaction.user_id == user.id).order_by(Transaction.id.desc()).all()


@financerouter.post("/transactions", response_model=TransactionOut, status_code=201)
def create_transaction(
    data: TransactionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = Transaction(**data.dict(), user_id=user.id)
    db.add(tx)

    # Auto-update budget spent amount for expense transactions
    if data.type == "expense":
        budget = db.query(Budget).filter(
            Budget.user_id == user.id,
            Budget.category == data.category
        ).first()
        if budget:
            budget.spent += data.amount

    db.commit()
    db.refresh(tx)
    return tx


@financerouter.delete("/transactions/{tx_id}")
def delete_transaction(
    tx_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == user.id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Reverse spent amount on budget
    if tx.type == "expense":
        budget = db.query(Budget).filter(
            Budget.user_id == user.id,
            Budget.category == tx.category
        ).first()
        if budget:
            budget.spent = max(0, budget.spent - tx.amount)

    db.delete(tx)
    db.commit()
    return {"message": "Transaction deleted"}



@financerouter.get("/budgets", response_model=List[BudgetOut])
def get_budgets(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Budget).filter(Budget.user_id == user.id).all()


@financerouter.post("/budgets", response_model=BudgetOut, status_code=201)
def create_budget(
    data: BudgetCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Budget).filter(
        Budget.user_id == user.id,
        Budget.category == data.category
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Budget for this category already exists")

    budget = Budget(**data.dict(), spent=0.0, user_id=user.id)
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


@financerouter.patch("/budgets/{budget_id}", response_model=BudgetOut)
def update_budget(
    budget_id: int,
    data: BudgetCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user.id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    budget.category     = data.category
    budget.budget_amount = data.budget_amount
    budget.color        = data.color
    db.commit()
    db.refresh(budget)
    return budget


@financerouter.delete("/budgets/{budget_id}")
def delete_budget(
    budget_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user.id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted"}