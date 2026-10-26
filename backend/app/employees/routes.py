from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth.dependencies import get_current_user, admin_required

router = APIRouter(
    prefix="/employees",
    tags=["Employees"]
)


@router.post("/", response_model=schemas.EmployeeOut, status_code=201)
def create_employee(
    employee_data: schemas.EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(admin_required)
):
    existing = db.query(models.Employee).filter(
        models.Employee.user_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee profile already exists for this user"
        )

    new_employee = models.Employee(
        user_id=current_user.id,
        **employee_data.model_dump()
    )

    db.add(new_employee)
    db.commit()
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