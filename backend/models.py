import datetime

from database import Base
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Boolean
from sqlalchemy.orm import Mapped,mapped_column
from datetime import datetime
from sqlalchemy.orm import relationship
# class User(Base):
#     __tablename__ = "users"

#     id = Column(Integer, primary_key=True, index=True)
#     email = Column(String(50), unique=True)
#     password = Column(String(100))
#     otp = Column(String(6), nullable=True)
#     isvalid = Column(Boolean, default=False)
#     is_active = Column(Boolean, default=True)
#     reset_token = Column(String(200), nullable=True)
#     reset_token_expiry = Column(DateTime(timezone=True), nullable=True)

class User(Base):
    __tablename__ = "user"

    id:Mapped[int]=mapped_column(primary_key=True,index=True)
    email:Mapped[str]=mapped_column(String(50),unique=True)
    password:Mapped[str] = mapped_column(String(100))
    is_active:Mapped[bool] = mapped_column(Boolean, default=True)
    reset_token:Mapped[str] = mapped_column(String(200), nullable=True)
    reset_token_expiry:Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    transactions    = relationship("Transaction", back_populates="owner", cascade="all, delete")
    budgets         = relationship("Budget",      back_populates="owner", cascade="all, delete")

class Transaction(Base):
    __tablename__ = "transactions"
    id       = Column(Integer, primary_key=True, index=True)
    date     = Column(String(20))
    category = Column(String(20))
    label    = Column(String(20))
    amount   = Column(Float)
    type     = Column(String(20))   # "income" | "expense"
    user_id  = Column(Integer, ForeignKey("user.id"))
    owner    = relationship("User", back_populates="transactions")


class Budget(Base):
    __tablename__ = "budgets"
    id            = Column(Integer, primary_key=True, index=True)
    category      = Column(String(20))
    budget_amount = Column(Float)
    spent         = Column(Float, default=0.0)
    color         = Column(String(20), default="#6366f1")
    user_id       = Column(Integer, ForeignKey("user.id"))
    owner         = relationship("User", back_populates="budgets")