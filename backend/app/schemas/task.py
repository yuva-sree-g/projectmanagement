from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..models import TaskStatus, TaskPriority

# User schema for comments
class UserBase(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    estimated_hours: Optional[int] = None
    project_id: int
    assignee_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    estimated_hours: Optional[int] = None
    actual_hours: Optional[int] = None
    project_id: Optional[int] = None
    assignee_id: Optional[int] = None

class Task(TaskBase):
    id: int
    actual_hours: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    assignee_name: Optional[str] = None
    assignee_username: Optional[str] = None

    class Config:
        from_attributes = True

class TimeLogBase(BaseModel):
    hours: int
    description: Optional[str] = None
    date: datetime

class TimeLogCreate(TimeLogBase):
    task_id: int

class TimeLog(TimeLogBase):
    id: int
    task_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Comment schemas
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    task_id: Optional[int] = None
    project_id: Optional[int] = None

class CommentUpdate(BaseModel):
    content: str

class Comment(CommentBase):
    id: int
    user_id: int
    task_id: Optional[int] = None
    project_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    user: UserBase

    class Config:
        from_attributes = True

 