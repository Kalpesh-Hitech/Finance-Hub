from datetime import datetime, timezone, timedelta
from models import User
from config import settings
from jose import jwt, JWTError
import bcrypt
import smtplib
import socket
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY, # Use your real API key from settings
        "content-type": "application/json"
    }
    payload = {
        "sender": {
            "name": "Team Manager App",  # <--- Put your App Name here
            "email": settings.EMAIL_ADDRESS # <--- Must be your Brevo login email
        },
        "to": [{"email": to_email}],
        "subject": "Your OTP Verification Code",
        "htmlContent": f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Welcome!</h2>
                <p>Your one-time password (OTP) is: <strong>{otp}</strong></p>
                <p>This code will expire in 10 minutes.</p>
            </body>
        </html>
        """
    }
    
    response = requests.post(url, json=payload, headers=headers)
    return response.json()


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
