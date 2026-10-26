import io
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

from app.database import get_db
from app import models, schemas
from app.auth.dependencies import admin_required

router = APIRouter(
    prefix="/reports",
    tags=["Dashboard & Reports"]
)


@router.get("/dashboard", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(admin_required)
):
    today = date.today()

    total_employees = db.query(models.Employee).count()
    active_employees = db.query(models.Employee).filter(
        models.Employee.status == "active"
    ).count()
    total_departments = db.query(models.Department).count()

    pending_leaves = db.query(models.LeaveRequest).filter(
        models.LeaveRequest.status == "pending"
    ).count()
    approved_leaves = db.query(models.LeaveRequest).filter(
        models.LeaveRequest.status == "approved"
    ).count()
    rejected_leaves = db.query(models.LeaveRequest).filter(
        models.LeaveRequest.status == "rejected"
    ).count()

    present_today = db.query(models.Attendance).filter(
        models.Attendance.date == today,
        models.Attendance.status == "present"
    ).count()
    absent_today = db.query(models.Attendance).filter(
        models.Attendance.date == today,
        models.Attendance.status == "absent"
    ).count()
    leave_today = db.query(models.Attendance).filter(
        models.Attendance.date == today,
        models.Attendance.status == "leave"
    ).count()

    return {
        "total_employees": total_employees,
        "active_employees": active_employees,
        "total_departments": total_departments,
        "pending_leaves": pending_leaves,
        "approved_leaves": approved_leaves,
        "rejected_leaves": rejected_leaves,
        "present_today": present_today,
        "absent_today": absent_today,
        "leave_today": leave_today
    }


@router.get("/employees/pdf")
def export_employee_report(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(admin_required)
):
    employees = db.query(models.Employee).all()

    buffer = io.BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        title="HRFlow Employee Report"
    )

    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("HRFlow Employee Report", styles["Title"]))
    story.append(Paragraph(f"Generated on: {date.today()}", styles["Normal"]))
    story.append(Spacer(1, 20))

    data = [
        ["ID", "Name", "Designation", "Department", "Status"]
    ]

    for employee in employees:
        department_name = employee.department.name if employee.department else "N/A"

        data.append([
            str(employee.id),
            employee.full_name,
            employee.designation or "N/A",
            department_name,
            employee.status
        ])

    table = Table(data)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#003366")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
        ("TOPPADDING", (0, 0), (-1, 0), 10)
    ]))

    story.append(table)
    document.build(story)

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=employee_report.pdf"
        }
    )