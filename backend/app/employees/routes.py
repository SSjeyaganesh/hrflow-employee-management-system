from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth.dependencies import get_current_user, admin_required
from app.auth.security import hash_password

router = APIRouter(
    prefix="/employees",
    tags=["Employees"]
)


def _validate_department(db: Session, department_id: Optional[int]) -> None:
    if department_id is not None and not db.query(models.Department).filter(
        models.Department.id == department_id
    ).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department not found",
        )


@router.post("/", response_model=schemas.EmployeeOut, status_code=201)
def create_employee(
    employee_data: schemas.EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(admin_required),
):
    _validate_department(db, employee_data.department_id)

    existing_user = db.query(models.User).filter(
        func.lower(models.User.email) == employee_data.email.lower()
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )

    new_user = models.User(
        email=employee_data.email,
        password_hash=hash_password(employee_data.password),
        role="employee",
    )

    db.add(new_user)
    db.flush()

    new_employee = models.Employee(
        user_id=new_user.id,
        full_name=employee_data.full_name,
        phone=employee_data.phone,
        department_id=employee_data.department_id,
        designation=employee_data.designation,
        joining_date=employee_data.joining_date,
        status=employee_data.status,
    )

    db.add(new_employee)

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        print("EMPLOYEE CREATION ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail=f"Employee creation failed: {e}",
        )

    db.refresh(new_employee)
    return new_employee

@router.get("/", response_model=list[schemas.EmployeeOut])
def get_all_employees(
    search: str = Query(default=None),
    department_id: int = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Employee)

    if search:
        query = query.filter(
            models.Employee.full_name.ilike(f"%{search}%")
        )

    if department_id:
        query = query.filter(
            models.Employee.department_id == department_id
        )

    offset = (page - 1) * limit

    return query.offset(offset).limit(limit).all()


@router.get("/me", response_model=schemas.EmployeeOut)
def get_my_employee_profile(
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

    return employee


@router.get("/{employee_id}", response_model=schemas.EmployeeOut)
def get_employee_by_id(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    employee = db.query(models.Employee).filter(
        models.Employee.id == employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )

    return employee


@router.put("/{employee_id}", response_model=schemas.EmployeeOut)
def update_employee(
    employee_id: int,
    employee_data: schemas.EmployeeUpdate,
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

    update_data = employee_data.model_dump(exclude_unset=True)
    if "department_id" in update_data:
        _validate_department(db, update_data["department_id"])

    new_password = update_data.pop("password", None)
    if new_password is not None:
        if employee.user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee account not found",
            )
        employee.user.password_hash = hash_password(new_password)

    for field, value in update_data.items():
        setattr(employee, field, value)

    db.commit()
    db.refresh(employee)

    return employee


@router.delete("/{employee_id}", status_code=204)
def delete_employee(
    employee_id: int,
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

    db.delete(employee)
    db.commit()