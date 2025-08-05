from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from ..database import get_db
from ..models import Comment, User, Task, Project
from ..schemas.task import CommentCreate, Comment as CommentSchema, CommentUpdate
from ..auth import get_current_active_user

router = APIRouter(prefix="/comments", tags=["comments"])

@router.post("/", response_model=CommentSchema)
def create_comment(
    comment: CommentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new comment on a task or project."""
    # Validate that either task_id or project_id is provided
    if not comment.task_id and not comment.project_id:
        raise HTTPException(status_code=400, detail="Either task_id or project_id must be provided")
    
    if comment.task_id and comment.project_id:
        raise HTTPException(status_code=400, detail="Cannot comment on both task and project simultaneously")
    
    # Verify task/project ownership if commenting on task
    if comment.task_id:
        task = db.query(Task).join(Project).filter(
            Task.id == comment.task_id,
            Project.owner_id == current_user.id
        ).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
    
    # Verify project ownership if commenting on project
    if comment.project_id:
        project = db.query(Project).filter(
            Project.id == comment.project_id,
            Project.owner_id == current_user.id
        ).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
    
    db_comment = Comment(
        content=comment.content,
        user_id=current_user.id,
        task_id=comment.task_id,
        project_id=comment.project_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    # Fetch the comment with user information
    db_comment_with_user = db.query(Comment).options(joinedload(Comment.user)).filter(Comment.id == db_comment.id).first()
    return db_comment_with_user

@router.get("/task/{task_id}", response_model=List[CommentSchema])
def get_task_comments(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all comments for a specific task."""
    # Verify task ownership
    task = db.query(Task).join(Project).filter(
        Task.id == task_id,
        Project.owner_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    comments = db.query(Comment).options(joinedload(Comment.user)).filter(Comment.task_id == task_id).order_by(Comment.created_at.desc()).all()
    return comments

@router.get("/project/{project_id}", response_model=List[CommentSchema])
def get_project_comments(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all comments for a specific project."""
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    comments = db.query(Comment).options(joinedload(Comment.user)).filter(Comment.project_id == project_id).order_by(Comment.created_at.desc()).all()
    return comments

@router.put("/{comment_id}", response_model=CommentSchema)
def update_comment(
    comment_id: int,
    comment_update: CommentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a comment."""
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Verify comment ownership
    if db_comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this comment")
    
    db_comment.content = comment_update.content
    db.commit()
    db.refresh(db_comment)
    
    # Fetch the comment with user information
    db_comment_with_user = db.query(Comment).options(joinedload(Comment.user)).filter(Comment.id == db_comment.id).first()
    return db_comment_with_user

@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a comment."""
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Verify comment ownership
    if db_comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    db.delete(db_comment)
    db.commit()
    return {"message": "Comment deleted successfully"} 