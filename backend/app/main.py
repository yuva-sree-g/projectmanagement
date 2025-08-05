from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from .database import engine
from .models import Base
from .routers import auth, projects, tasks, users, comments, timelog
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from .database import get_db
from .models import Task, User, TimeLog, Project
from .auth import get_current_active_user

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed database with sample data automatically
import os
print("Starting application...")
print(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
print(f"Database URL: {os.getenv('DATABASE_URL', 'Not set')}")

try:
    from .seed_data import main as seed_main
    print("Importing seed data module...")
    seed_main()
    print("Seed data execution completed successfully!")
except Exception as e:
    print(f"Warning: Could not seed database: {e}")
    import traceback
    traceback.print_exc()

# Create FastAPI app
app = FastAPI(
    title="Project Management Dashboard API",
    description="A comprehensive API for managing projects, tasks, and team collaboration",
    version="1.0.0"
)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    
    # Add security scheme
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    
    # Add security to all protected endpoints and fix existing security
    for path in openapi_schema["paths"]:
        if path not in ["/auth/login", "/auth/register", "/health"]:  # Exclude auth and health endpoints
            for method in openapi_schema["paths"][path]:
                if method.lower() in ["get", "post", "put", "delete"]:
                    # Replace any existing security with the correct one
                    openapi_schema["paths"][path][method]["security"] = [{"BearerAuth": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

import os

# Configure CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
if cors_origins == "*":
    allow_origins = ["*"]
else:
    allow_origins = [origin.strip() for origin in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(users.router)
app.include_router(comments.router)
app.include_router(timelog.router)


@app.get("/")
def read_root():
    """Root endpoint."""
    return {
        "message": "Project Management Dashboard API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.get("/seed-status")
def seed_status(db: Session = Depends(get_db)):
    """Check if seed data exists."""
    try:
        user_count = db.query(User).count()
        project_count = db.query(Project).count()
        task_count = db.query(Task).count()
        timelog_count = db.query(TimeLog).count()
        
        return {
            "seed_data_exists": user_count > 0,
            "user_count": user_count,
            "project_count": project_count,
            "task_count": task_count,
            "timelog_count": timelog_count
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/seed-data")
def seed_data_manual(db: Session = Depends(get_db)):
    """Manually trigger seed data loading."""
    try:
        from .seed_data import main as seed_main
        seed_main()
        return {"message": "Seed data loaded successfully"}
    except Exception as e:
        return {"error": str(e)} 

# Performance Metrics endpoint
@app.get("/performance-metrics")
def get_performance_metrics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get performance metrics for the dashboard."""
    try:
        # Calculate date ranges
        now = datetime.utcnow()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)
        
        # 1. Tasks completed this week
        tasks_completed_this_week = db.query(Task).filter(
            and_(
                Task.status == 'closed',
                Task.updated_at >= week_ago
            )
        ).count()
        
        # 2. Average task completion time (in days)
        completed_tasks = db.query(Task).filter(
            and_(
                Task.status == 'closed',
                Task.created_at.isnot(None),
                Task.updated_at.isnot(None)
            )
        ).all()
        
        total_completion_days = 0
        valid_tasks = 0
        
        for task in completed_tasks:
            if task.created_at and task.updated_at:
                completion_time = (task.updated_at - task.created_at).days
                if completion_time >= 0:  # Only count valid completion times
                    total_completion_days += completion_time
                    valid_tasks += 1
        
        avg_completion_days = round(total_completion_days / valid_tasks, 1) if valid_tasks > 0 else 0
        
        # 3. Team productivity score (based on completed tasks vs total tasks)
        total_tasks = db.query(Task).count()
        completed_tasks_count = db.query(Task).filter(Task.status == 'closed').count()
        productivity_score = round((completed_tasks_count / total_tasks * 100), 1) if total_tasks > 0 else 0
        
        # 4. Project health indicators
        projects = db.query(Project).all()
        project_health = []
        
        for project in projects:
            project_tasks = db.query(Task).filter(Task.project_id == project.id).all()
            total_project_tasks = len(project_tasks)
            completed_project_tasks = len([t for t in project_tasks if t.status == 'closed'])
            
            if total_project_tasks > 0:
                completion_rate = round((completed_project_tasks / total_project_tasks * 100), 1)
                health_status = "healthy" if completion_rate >= 70 else "warning" if completion_rate >= 40 else "critical"
            else:
                completion_rate = 0
                health_status = "no_tasks"
            
            project_health.append({
                "project_id": project.id,
                "project_title": project.title,
                "completion_rate": completion_rate,
                "total_tasks": total_project_tasks,
                "completed_tasks": completed_project_tasks,
                "health_status": health_status
            })
        
        # 5. Time tracking metrics
        total_logged_hours = db.query(func.sum(TimeLog.hours)).scalar() or 0
        avg_hours_per_task = round(total_logged_hours / total_tasks, 1) if total_tasks > 0 else 0
        
        # 6. Weekly trends
        weekly_completed_tasks = []
        for i in range(7):
            day_start = week_ago + timedelta(days=i)
            day_end = day_start + timedelta(days=1)
            daily_completed = db.query(Task).filter(
                and_(
                    Task.status == 'closed',
                    Task.updated_at >= day_start,
                    Task.updated_at < day_end
                )
            ).count()
            weekly_completed_tasks.append({
                "day": day_start.strftime("%A"),
                "completed": daily_completed
            })
        
        return {
            "tasks_completed_this_week": tasks_completed_this_week,
            "avg_completion_days": avg_completion_days,
            "productivity_score": productivity_score,
            "project_health": project_health,
            "total_logged_hours": total_logged_hours,
            "avg_hours_per_task": avg_hours_per_task,
            "weekly_trends": weekly_completed_tasks,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating performance metrics: {str(e)}") 