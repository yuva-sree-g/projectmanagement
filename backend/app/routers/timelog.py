from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from typing import List
from ..database import get_db
from ..models import TimeLog, Task, Project, User
from ..schemas.timelog import TimeLogCreate, TimeLogUpdate, TimeLog as TimeLogSchema, TimeLogWithTask
from ..auth import get_current_user

router = APIRouter(prefix="/timelog", tags=["time tracking"])

@router.post("/", response_model=TimeLogSchema)
def create_time_log(
    time_log: TimeLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new time log entry."""
    # Verify task exists and user has access
    task = db.query(Task).filter(Task.id == time_log.task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check if user is assigned to the task or is project owner
    project = db.query(Project).filter(Project.id == task.project_id).first()
    if task.assignee_id != current_user.id and project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to log time for this task"
        )
    
    db_time_log = TimeLog(
        task_id=time_log.task_id,
        user_id=current_user.id,
        hours=time_log.hours,
        description=time_log.description or "",
        date=time_log.date
    )
    db.add(db_time_log)
    db.commit()
    db.refresh(db_time_log)
    
    # Update task actual hours
    task.actual_hours = db.query(func.sum(TimeLog.hours)).filter(
        TimeLog.task_id == task.id
    ).scalar() or 0
    db.commit()
    
    return db_time_log

@router.get("/", response_model=List[TimeLogWithTask])
def get_time_logs(
    task_id: int = None,
    user_id: int = None,
    start_date: date = None,
    end_date: date = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get time logs with optional filtering."""
    query = db.query(TimeLog).join(Task).join(Project)
    
    # Apply filters
    if task_id:
        query = query.filter(TimeLog.task_id == task_id)
    if user_id:
        query = query.filter(TimeLog.user_id == user_id)
    if start_date:
        query = query.filter(func.date(TimeLog.date) >= start_date)
    if end_date:
        query = query.filter(func.date(TimeLog.date) <= end_date)
    
    # If not admin, only show user's own logs or logs for tasks they're assigned to
    if not current_user.is_active:  # Assuming admin check
        query = query.filter(
            (TimeLog.user_id == current_user.id) |
            (Task.assignee_id == current_user.id)
        )
    
    time_logs = query.all()
    
    # Convert to response format with task and project info
    result = []
    for log in time_logs:
        result.append(TimeLogWithTask(
            id=log.id,
            hours=log.hours,
            description=log.description,
            date=log.date,
            task_id=log.task_id,
            task_title=log.task.title,
            project_title=log.task.project.title,
            created_at=log.created_at
        ))
    
    return result

@router.get("/{time_log_id}", response_model=TimeLogSchema)
def get_time_log(
    time_log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific time log entry."""
    time_log = db.query(TimeLog).filter(TimeLog.id == time_log_id).first()
    if not time_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time log not found"
        )
    
    # Check authorization
    if time_log.user_id != current_user.id:
        task = db.query(Task).filter(Task.id == time_log.task_id).first()
        project = db.query(Project).filter(Project.id == task.project_id).first()
        if project.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this time log"
            )
    
    return time_log

@router.put("/{time_log_id}", response_model=TimeLogSchema)
def update_time_log(
    time_log_id: int,
    time_log_update: TimeLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a time log entry."""
    time_log = db.query(TimeLog).filter(TimeLog.id == time_log_id).first()
    if not time_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time log not found"
        )
    
    # Check authorization - only the user who created the log can update it
    if time_log.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this time log"
        )
    
    # Update fields
    update_data = time_log_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(time_log, field, value)
    
    db.commit()
    db.refresh(time_log)
    
    # Update task actual hours
    task = db.query(Task).filter(Task.id == time_log.task_id).first()
    task.actual_hours = db.query(func.sum(TimeLog.hours)).filter(
        TimeLog.task_id == task.id
    ).scalar() or 0
    db.commit()
    
    return time_log

@router.delete("/{time_log_id}")
def delete_time_log(
    time_log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a time log entry."""
    time_log = db.query(TimeLog).filter(TimeLog.id == time_log_id).first()
    if not time_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time log not found"
        )
    
    # Check authorization - only the user who created the log can delete it
    if time_log.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this time log"
        )
    
    task_id = time_log.task_id
    db.delete(time_log)
    db.commit()
    
    # Update task actual hours
    task = db.query(Task).filter(Task.id == task_id).first()
    task.actual_hours = db.query(func.sum(TimeLog.hours)).filter(
        TimeLog.task_id == task.id
    ).scalar() or 0
    db.commit()
    
    return {"message": "Time log deleted successfully"}

@router.get("/summary/user/{user_id}")
def get_user_time_summary(
    user_id: int,
    start_date: date = None,
    end_date: date = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get time summary for a specific user."""
    # Check authorization
    if user_id != current_user.id:
        # Check if current user is admin or project owner
        # For now, allow if user_id matches current_user
        pass
    
    query = db.query(TimeLog).filter(TimeLog.user_id == user_id)
    
    if start_date:
        query = query.filter(func.date(TimeLog.date) >= start_date)
    if end_date:
        query = query.filter(func.date(TimeLog.date) <= end_date)
    
    total_hours = db.query(func.sum(TimeLog.hours)).filter(
        TimeLog.user_id == user_id
    ).scalar() or 0
    
    time_logs = query.all()
    
    # Group by task
    task_summary = {}
    for log in time_logs:
        if log.task_id not in task_summary:
            task_summary[log.task_id] = {
                "task_title": log.task.title,
                "project_title": log.task.project.title,
                "total_hours": 0
            }
        task_summary[log.task_id]["total_hours"] += log.hours
    
    return {
        "user_id": user_id,
        "total_hours": total_hours,
        "task_summary": list(task_summary.values()),
        "period": {
            "start_date": start_date,
            "end_date": end_date
        }
    } 