from fastapi import APIRouter, Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List
import asyncio
from datetime import datetime, timedelta
from ..database import get_db
from ..models import Task, User, TimeLog, Project
from ..schemas.task import TaskCreate, Task as TaskSchema, TaskUpdate, TimeLogCreate, TimeLog as TimeLogSchema
from ..auth import get_current_active_user
from ..email_service import send_task_assignment_email, send_task_update_email, send_task_completion_email

security = HTTPBearer()

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/", response_model=List[TaskSchema])
def get_tasks(
    skip: int = 0,
    limit: int = 100,
    project_id: int = None,
    assignee_id: int = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all tasks in the system (globally visible)."""
    from sqlalchemy.orm import joinedload
    
    query = db.query(Task).options(joinedload(Task.assignee))
    
    # Filter by project if specified
    if project_id:
        # Check if project exists (no ownership restriction)
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        query = query.filter(Task.project_id == project_id)
    
    # Filter by assignee if specified
    if assignee_id:
        query = query.filter(Task.assignee_id == assignee_id)
    
    tasks = query.offset(skip).limit(limit).all()
    
    # Add assignee information to each task
    for task in tasks:
        if task.assignee:
            task.assignee_name = task.assignee.full_name
            task.assignee_username = task.assignee.username
        else:
            task.assignee_name = None
            task.assignee_username = None
    
    return tasks

@router.post("/", response_model=TaskSchema)
async def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new task in any project."""
    # Verify project exists (no ownership restriction)
    project = db.query(Project).filter(Project.id == task.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Create task data with current user as default assignee if not specified
    task_data = task.dict()
    if not task_data.get('assignee_id'):
        task_data['assignee_id'] = current_user.id
    
    db_task = Task(**task_data)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Send email notification if task is assigned to someone other than the creator
    if db_task.assignee_id and db_task.assignee_id != current_user.id:
        assignee = db.query(User).filter(User.id == db_task.assignee_id).first()
        if assignee and assignee.email:
            # Send email notification asynchronously
            asyncio.create_task(
                send_task_assignment_email(
                    user_email=assignee.email,
                    user_name=assignee.full_name or assignee.username,
                    task_title=db_task.title,
                    project_name=project.name,
                    assigned_by=current_user.full_name or current_user.username
                )
            )
    
    return db_task

@router.get("/{task_id}", response_model=TaskSchema)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific task by ID (globally visible)."""
    from sqlalchemy.orm import joinedload
    
    task = db.query(Task).options(joinedload(Task.assignee)).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Add assignee information
    if task.assignee:
        task.assignee_name = task.assignee.full_name
        task.assignee_username = task.assignee.username
    else:
        task.assignee_name = None
        task.assignee_username = None
    
    return task

@router.post("/test-update", response_model=dict)
def test_task_update(
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Test endpoint to debug task update validation."""
    try:
        update_data = task_update.dict(exclude_unset=True)

        return {"message": "Validation successful", "data": update_data}
    except Exception as e:

        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=422, detail=str(e))

@router.put("/{task_id}", response_model=TaskSchema)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a task (project owner or task assignee can update)."""
    try:
        db_task = db.query(Task).filter(Task.id == task_id).first()
        if db_task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Check if user can update this task (project owner or task assignee)
        project = db.query(Project).filter(Project.id == db_task.project_id).first()
        can_update = (project.owner_id == current_user.id or db_task.assignee_id == current_user.id)
        
        # For global visibility, allow anyone to update tasks
        # can_update = (project.owner_id == current_user.id or db_task.assignee_id == current_user.id)
        can_update = True  # Allow anyone to update tasks for global visibility
        
        if not can_update:
            raise HTTPException(status_code=403, detail="You don't have permission to update this task")
        
        # Store old values for comparison
        old_assignee_id = db_task.assignee_id
        old_status = db_task.status
        
        update_data = task_update.dict(exclude_unset=True)
        
        # Log the update data for debugging

        
        for field, value in update_data.items():
            if hasattr(db_task, field):
                setattr(db_task, field, value)
        
        db.commit()
        db.refresh(db_task)
        
        # Send email notifications for different update types
        # Send email to the logged-in user for all updates
        
        if current_user.email:
            # Determine update type based on what actually changed
            update_type = "General Update"
            changed_fields = []
            
            # Check for specific field changes
            if 'status' in update_data:
                if db_task.status == "completed":
                    update_type = "Task Completed"
                    # Send completion email
                    asyncio.create_task(
                        send_task_completion_email(
                            user_email=current_user.email,
                            user_name=current_user.full_name or current_user.username,
                            task_title=db_task.title,
                            project_name=project.title,
                            completed_by=current_user.full_name or current_user.username
                        )
                    )
                else:
                    changed_fields.append(f"Status to {db_task.status}")
            
            if 'actual_hours' in update_data:
                changed_fields.append(f"Actual Hours to {db_task.actual_hours}")
            
            if 'estimated_hours' in update_data:
                changed_fields.append(f"Estimated Hours to {db_task.estimated_hours}")
            
            if 'priority' in update_data:
                changed_fields.append(f"Priority to {db_task.priority}")
            
            if 'title' in update_data:
                changed_fields.append("Task Title")
            
            if 'description' in update_data:
                changed_fields.append("Task Description")
            
            if 'assignee_id' in update_data and old_assignee_id != db_task.assignee_id:
                update_type = "Task Reassigned"
                # Send assignment email to new assignee
                asyncio.create_task(
                    send_task_assignment_email(
                        user_email=current_user.email,
                        user_name=current_user.full_name or current_user.username,
                        task_title=db_task.title,
                        project_name=project.title,
                        assigned_by=current_user.full_name or current_user.username
                    )
                )
            
            # Create update type from all changed fields
            if changed_fields:
                if len(changed_fields) == 1:
                    update_type = f"{changed_fields[0]} Updated"
                else:
                    update_type = f"Multiple fields updated: {', '.join(changed_fields)}"
            
            # Send general update email for all other cases
            if update_type != "Task Completed" and update_type != "Task Reassigned":

                email_task = asyncio.create_task(
                    send_task_update_email(
                        user_email=current_user.email,
                        user_name=current_user.full_name or current_user.username,
                        task_title=db_task.title,
                        project_name=project.title,
                        update_type=update_type,
                        updated_by=current_user.full_name or current_user.username
                    )
                )

        
        return db_task
    except Exception as e:

        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a task (only project owner can delete)."""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if user can delete this task (only project owner)
    project = db.query(Project).filter(Project.id == db_task.project_id).first()
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have permission to delete this task")
    
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted successfully"}

@router.get("/my-tasks", response_model=List[TaskSchema])
def get_my_tasks(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all tasks assigned to the current user."""
    tasks = db.query(Task).filter(
        Task.assignee_id == current_user.id
    ).offset(skip).limit(limit).all()
    return tasks

@router.get("/my-tasks/stats")
def get_my_task_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get task statistics for the current user by status."""
    # Get tasks assigned to current user
    user_tasks = db.query(Task).filter(Task.assignee_id == current_user.id)
    
    # Count by status using enum values
    from ..models import TaskStatus
    todo_count = user_tasks.filter(Task.status == TaskStatus.TODO).count()
    in_progress_count = user_tasks.filter(Task.status == TaskStatus.IN_PROGRESS).count()
    review_count = user_tasks.filter(Task.status == TaskStatus.REVIEW).count()
    ready_to_test_count = user_tasks.filter(Task.status == TaskStatus.READY_TO_TEST).count()
    in_test_count = user_tasks.filter(Task.status == TaskStatus.IN_TEST).count()
    closed_count = user_tasks.filter(Task.status == TaskStatus.CLOSED).count()
    
    total_tasks = todo_count + in_progress_count + review_count + ready_to_test_count + in_test_count + closed_count
    
    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "total_tasks": total_tasks,
        "todo": todo_count,
        "in_progress": in_progress_count,
        "review": review_count,
        "ready_to_test": ready_to_test_count,
        "in_test": in_test_count,
        "closed": closed_count
    }

# Time logging endpoints
@router.post("/{task_id}/time-logs", response_model=TimeLogSchema)
def create_time_log(
    task_id: int,
    time_log: TimeLogCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Log time for a task (anyone can log time for any task)."""
    # Verify task exists
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db_time_log = TimeLog(
        task_id=task_id,
        user_id=current_user.id,
        hours=time_log.hours,
        description=time_log.description,
        date=time_log.date
    )
    db.add(db_time_log)
    
    # Update task's actual hours
    task.actual_hours += time_log.hours
    
    db.commit()
    db.refresh(db_time_log)
    return db_time_log

@router.get("/{task_id}/time-logs", response_model=List[TimeLogSchema])
def get_task_time_logs(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get time logs for a specific task (globally visible)."""
    # Verify task exists
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    time_logs = db.query(TimeLog).filter(TimeLog.task_id == task_id).all()
    return time_logs

# Comment endpoints for tasks
from ..schemas.task import Comment as CommentSchema, CommentCreate as CommentCreateSchema

@router.get("/{task_id}/comments", response_model=List[CommentSchema])
def get_task_comments(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all comments for a specific task (globally visible)."""
    # Verify task exists
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    from ..models import Comment
    from sqlalchemy.orm import joinedload
    
    comments = db.query(Comment).options(joinedload(Comment.user)).filter(
        Comment.task_id == task_id
    ).order_by(Comment.created_at.desc()).all()
    return comments

@router.post("/{task_id}/comments", response_model=CommentSchema)
def create_task_comment(
    task_id: int,
    comment_data: CommentCreateSchema,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new comment on a task (anyone can comment on any task)."""
    # Verify task exists
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    from ..models import Comment
    
    db_comment = Comment(
        content=comment_data.content,
        user_id=current_user.id,
        task_id=task_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    # Fetch the comment with user information
    from sqlalchemy.orm import joinedload
    db_comment_with_user = db.query(Comment).options(joinedload(Comment.user)).filter(
        Comment.id == db_comment.id
    ).first()
    return db_comment_with_user 