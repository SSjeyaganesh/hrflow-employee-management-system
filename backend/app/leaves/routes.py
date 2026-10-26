from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth.dependencies import get_current_user, admin_required

router = APIRouter(
    prefix="/leaves",
    tags=["Leave Requests"]
)


@router.post("/", response_model=schemas.LeaveRequestOut, status_code=201)
def apply_leave(
    leave_data: schemas.LeaveRequestCreate,
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

    if leave_data.end_date < leave_data.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date cannot be before start date"
        )

    overlapping_leave = db.query(models.LeaveRequest).filter(
        models.LeaveRequest.employee_id == employee.id,
        models.LeaveRequest.status.in_(["pending", "approved"]),
        models.LeaveRequest.start_date <= leave_data.end_date,
        models.LeaveRequest.end_date >= leave_data.start_date
    ).first()

    if overlapping_leave:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a pending or approved leave for these dates"
        )

    new_leave = models.LeaveRequest(
        employee_id=employee.id,
        **leave_data.model_dump()
    )

    db.add(new_leave)
    db.commit()
    db.refresh(new_leave)

    return new_leave


@router.get("/me", response_model=list[schemas.LeaveRequestOut])
def get_my_leaves(
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

    return db.query(models.LeaveRequest).filter(
        models.LeaveRequest.employee_id == employee.id
    ).order_by(models.LeaveRequest.created_at.desc()).all()


@router.get("/", response_model=list[schemas.LeaveRequestOut])
def get_all_leaves(
    status_filter: str = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(admin_required)
):
    query = db.query(models.LeaveRequest)

    if status_filter:
        query = query.filter(models.LeaveRequest.status == status_filter)

    return query.order_by(models.LeaveRequest.created_at.desc()).all()


@router.put("/{leave_id}/review", response_model=schemas.LeaveRequestOut)
def review_leave(
    leave_id: int,
    review_data: schemas.LeaveReview,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(admin_required)
):
    if review_data.status not in ["approved", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be approved or rejected"
        )

    leave = db.query(models.LeaveRequest).filter(
        models.LeaveRequest.id == leave_id
    ).first()

    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found"
        )

    if leave.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This leave request has already been reviewed"
        )

    leave.status = review_data.status
    leave.reviewed_by = current_user.id
    leave.reviewed_at = datetime.utcnow()

    db.commit()
    db.refresh(leave)

    return leave