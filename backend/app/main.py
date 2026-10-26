from fastapi import FastAPI, Depends
from app.database import Base, engine, get_db
from app import models, schemas
from app.auth.routes import router as auth_router
from app.auth.dependencies import get_current_user

app = FastAPI(
    title="HRFlow API",
    description="Employee, Attendance and Leave Management System API",
    version="1.0.0"
)

@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)

app.include_router(auth_router)


@app.get("/")
def home():
    return {"message": "Welcome to HRFlow API", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/auth/me", response_model=schemas.UserOut)
def get_my_profile(current_user: models.User = Depends(get_current_user)):
    return current_user