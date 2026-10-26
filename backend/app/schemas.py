from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "employee"


class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class EmployeeCreate(BaseModel):
    full_name: str
    phone: Optional[str] = None
    department_id: Optional[int] = None
    designation: Optional[str] = None
    joining_date: Optional[date] = None


class EmployeeOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    phone: Optional[str]
    department_id: Optional[int]
    designation: Optional[str]
    joining_date: Optional[date]
    status: str

    class Config:
        from_attributes = True