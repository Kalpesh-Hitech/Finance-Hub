from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi import BackgroundTasks
from pydantic import BaseModel, EmailStr
from sentry_sdk import HttpTransport
from models import User
from database import get_db
from sqlalchemy.orm import Session
import string
import random
from helper import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
    is_valid_email,
)
from RequestModel import (
    ChangeEmail,
    ChangePassword,
    ForgetPassword,
    ResetPassword,
    Token,
    UserOtp,
)
from datetime import datetime, timedelta, timezone
from jose import jwt
from config import settings
from RequestModel import UserCreate

router = APIRouter()


@router.post("/signup", status_code=201)
def signup(
    user: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered!!")
    hashed_pw = hash_password(user.password)

    new_user = User(email=user.email, password=hashed_pw)

    otp = "".join(random.choices(string.ascii_letters + string.digits, k=6))
    new_user.otp = otp
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User Created SuccessFully!!"}


@router.post("/signin")
def signin(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid Credential")
    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid Credential")
    if not db_user.is_active:
        raise HTTPException(status_code=401, detail="this account is inactive")

    access_token = create_access_token(data={"sub": db_user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": db_user.email,
            # add more fields if your User model has them e.g. name, id
        }
    }


@router.patch("/deactive")
def deactive_user(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    if not user.is_active:
        raise HTTPException(status_code=400, detail="this account is deactivated!!")
    user.is_active = False
    db.commit()
    return {"message": "your account is deactivated!!"}


@router.post("/change_password")
def change_password(
    new_info: ChangePassword,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not user.is_active:
        raise HTTPException(status_code=400, detail="this account is deactivated!!")
    if not (verify_password(new_info.old_password, user.password)):
        raise HTTPException(status_code=400, detail="please enter the right password!!")
    hashed_password = hash_password(new_info.new_password)
    user.password = hashed_password
    db.commit()
    return {"password": "password badal gya hai"}


@router.post("/forgetpassword")
def forget_password(data: ForgetPassword, db: Session = Depends(get_db)):
    db_email = db.query(User).filter(User.email == data.email).first()
    if not db_email:
        raise HTTPException(status_code=400, detail="email is not existed!!")
    if not db_email.is_active:
        raise HTTPException(status_code=400, detail="this account is deactivated!!")
    db_email.reset_token_expiry = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode = {"sub": data.email}
    to_encode.update({"exp": db_email.reset_token_expiry})
    db_email.reset_token = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    db.commit()
    return {
        "reset token": db_email.reset_token,
        "expire": "please reset password in 15 minutes",
    }



