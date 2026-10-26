from pydantic import BaseModel, EmailStr
from datetime import date, datetime
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



class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    department_id: Optional[int] = None
    designation: Optional[str] = None
    joining_date: Optional[date] = None
    status: Optional[str] = None

class LeaveRequestCreate(BaseModel):
    leave_type: str
    start_date: date
    end_date: date
    reason: str


class LeaveRequestOut(BaseModel):
    id: int
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    reason: str
    status: str
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class LeaveReview(BaseModel):
    status: str


class AttendanceCreate(BaseModel):
    date: date
    status: str = "present"


class AttendanceOut(BaseModel):
    id: int
    employee_id: int
    date: date
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class AttendanceSummary(BaseModel):
    employee_id: int
    month: int
    year: int
    total_days: int
    present_days: int
    absent_days: int
    leave_days: int

class DashboardStats(BaseModel):
    total_employees: int
    active_employees: int
    total_departments: int
    pending_leaves: int
    approved_leaves: int
    rejected_leaves: int
    present_today: int
    absent_today: int
    leave_today: int