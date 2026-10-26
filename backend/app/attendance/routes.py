from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.database import get_db
from app import models, schemas
from app.auth.dependencies import get_current_user, admin_required

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)


@router.post("/mark", response_model=schemas.AttendanceOut, status_code=201)
def mark_attendance(
    attendance_data: schemas.AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    employee = db.query(models.Employee).filter(
        models.Employee.user_id == current_user.id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee profile not found"
        )

    if attendance_data.status not in ["present", "absent", "leave"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be present, absent, or leave"
        )

    existing = db.query(models.Attendance).filter(
        models.Attendance.employee_id == employee.id,
        models.Attendance.date == attendance_data.date
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance already marked for this date"
        )

    now = datetime.utcnow()

    new_attendance = models.Attendance(
        employee_id=employee.id,
        date=attendance_data.date,
        status=attendance_data.status,
        check_in=now if attendance_data.status == "present" else None
    )

    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)

    return new_attendance


@router.put("/checkout", response_model=schemas.AttendanceOut)
def mark_checkout(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    employee = db.query(models.Employee).filter(
        models.Employee.user_id == current_user.id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee profile not found"
        )

    today = datetime.utcnow().date()

    attendance = db.query(models.Attendance).filter(
        models.Attendance.employee_id == employee.id,
        models.Attendance.date == today
    ).first()

    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance not marked for today"
        )

    if attendance.check_out:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Checkout already marked for today"
        )

    attendance.check_out = datetime.utcnow()
    db.commit()
    db.refresh(attendance)

    return attendance


@router.get("/me", response_model=list[schemas.AttendanceOut])
def get_my_attendance(
    month: int = Query(default=None, ge=1, le=12),
    year: int = Query(default=None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    employee = db.query(models.Employee).filter(
        models.Employee.user_id == current_user.id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee profile not found"
        )

    query = db.query(models.Attendance).filter(
        models.Attendance.employee_id == employee.id
    )

    if month:
        query = query.filter(extract("month", models.Attendance.date) == month)

    if year:
        query = query.filter(extract("year", models.Attendance.date) == year)

    return query.order_by(models.Attendance.date.desc()).all()


@router.get("/summary/{employee_id}", response_model=schemas.AttendanceSummary)
def get_attendance_summary(
    employee_id: int,
    month: int = Query(..., ge=1, le=12),
    year: int = Query(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(admin_required)
):
    employee = db.query(models.Employee).filter(
        models.Employee.id == employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )

    attendance_records = db.query(models.Attendance).filter(
        models.Attendance.employee_id == employee_id,
        extract("month", models.Attendance.date) == month,
        extract("year", models.Attendance.date) == year
    ).all()

    present_days = sum(1 for record in attendance_records if record.status == "present")
    absent_days = sum(1 for record in attendance_records if record.status == "absent")
    leave_days = sum(1 for record in attendance_records if record.status == "leave")

    return {
        "employee_id": employee_id,
        "month": month,
        "year": year,
        "total_days": len(attendance_records),
        "present_days": present_days,
        "absent_days": absent_days,
        "leave_days": leave_days
    }