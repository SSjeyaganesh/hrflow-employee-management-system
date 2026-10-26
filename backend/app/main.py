from fastapi import FastAPI

app = FastAPI(
    title="HRFlow API",
    description="Employee, Attendance and Leave Management System API",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "Welcome to HRFlow API",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }