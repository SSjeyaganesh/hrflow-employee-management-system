from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app import models, schemas
from app.auth.routes import router as auth_router
from app.employees.routes import router as employee_router
from app.leaves.routes import router as leave_router
from app.attendance.routes import router as attendance_router
from app.reports.routes import router as report_router
from app.auth.dependencies import get_current_user

app = FastAPI(
    title="HRFlow API",
    description="Employee, Attendance and Leave Management System API",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(employee_router)
app.include_router(leave_router)
app.include_router(attendance_router)
app.include_router(report_router)


@app.get("/")
def home():
    return {"message": "Welcome to HRFlow API", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/auth/me", response_model=schemas.UserOut)
def get_my_profile(current_user: models.User = Depends(get_current_user)):
    return current_user