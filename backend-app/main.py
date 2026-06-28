import os
import enum
from datetime import datetime, timedelta
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, validator
from sqlalchemy import Column, Integer, String, Enum, Float, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt


DATABASE_URL = "postgresql://postgres:your_password@localhost:5432/internship_db"
SECRET_KEY = "your_super_secret_jwt_key_change_this_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base            ()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

Base.metadata.create_all(bind=engine)  

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
   
class InvoiceStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    amount = Column(Float, nullable=False)  
    status = Column(String, default="pending", nullable=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserRegister(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=6)
    confirm_password: str

    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str



def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(session_token: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    if not session_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = jwt.decode(session_token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user = db.query(UserDB).filter(UserDB.email == email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user



@app.post("/api/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    
    existing_user = db.query(UserDB).filter(UserDB.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered.")
    
    hashed = hash_password(user_data.password)
    new_user = UserDB(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        phone=user_data.phone,
        hashed_password=hashed
    )
    db.add(new_user)
    db.commit()
    return {"message": "Registration successful"}

@app.post("/api/login")
def login(credentials: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
   
    token = create_access_token(data={"sub": user.email})
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,  
        max_age=1800,   
        samesite="lax",
        secure=False     
    )
    return {"message": "Login successful"}

@app.post("/invoices")
def create_invoice(title: str, amount: float, status: str = "pending", db: Session = Depends(get_db)):
    try:
        new_invoice = Invoice(
            title=title,
            amount=amount,
            status=status.lower()
        )
        db.add(new_invoice)
        db.commit()
        db.refresh(new_invoice)
        return new_invoice
    except Exception as e:
        db.rollback()
        print(f"DATABASE ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/invoices")
def get_invoices(db: Session = Depends(get_db)):
    return db.query(Invoice).all()

@app.patch("/invoices/{invoice_id}/status")
def update_status(invoice_id: int, status: str, db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if status.lower() == "approved":
        invoice.status = InvoiceStatus.APPROVED
    elif status.lower() == "rejected":
        invoice.status = InvoiceStatus.REJECTED
    else:
        invoice.status = InvoiceStatus.PENDING
    db.commit()
    db.refresh(invoice)
    return invoice

@app.put("/invoices/{invoice_id}")
def edit_invoice(invoice_id: int, title: str, amount: float, db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.status !="pending":
        raise HTTPException(status_code=400, detail=f"Cannot edit an invoice that is already {invoice.status}")
    invoice.title = title
    invoice.amount = amount
    db.commit()
    db.refresh(invoice)
    return invoice

@app.get("/api/dashboard")
def get_dashboard_data(current_user: UserDB = Depends(get_current_user)):
    return {
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "phone": current_user.phone
    }

@app.post("/api/logout")
def logout(response: Response):
    response.delete_cookie(key="session_token")
    return {"message": "Logged out successfully"}