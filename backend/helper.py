from datetime import datetime, timezone, timedelta
from models import User
from config import settings
from jose import jwt, JWTError
import bcrypt
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from database import get_db
from sqlalchemy.orm import Session
import requests
import re
from config import settings 


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed_password.decode("utf-8")


def send_otp_email(to_email: str, otp: str):

    message = Mail(
        from_email=settings.EMAIL_ADDRESS,
        to_emails=to_email,
        subject="Your OTP Verification Code",
        html_content=f"<h3>Your OTP is: <strong>{otp}</strong></h3>"
    )

    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)

        return {
            "status_code": response.status_code,
            "otp": otp,
            "message": "OTP email sent successfully"
        }

    except Exception as e:
        return {"error": str(e)}

def verify_password(palin_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        palin_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=settings.ALGORITHM)
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=401, detail="User Not Found!!")
    return user


email_pattern = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"


def is_valid_email(email):
    return re.match(email_pattern, email) is not None
