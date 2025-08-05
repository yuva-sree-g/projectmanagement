from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TimeLogBase(BaseModel):
    hours: int
    description: Optional[str] = None
    date: datetime

class TimeLogCreate(TimeLogBase):
    task_id: int

class TimeLogUpdate(BaseModel):
    hours: Optional[int] = None
    description: Optional[str] = None
    date: Optional[datetime] = None

class TimeLog(TimeLogBase):
    id: int
    task_id: int
    user_id: int
    created_at: datetime
    description: Optional[str] = None

    class Config:
        from_attributes = True

class TimeLogWithTask(BaseModel):
    id: int
    hours: int
    description: Optional[str] = None
    date: datetime
    task_id: int
    task_title: str
    project_title: str
    created_at: datetime

    class Config:
        from_attributes = True 