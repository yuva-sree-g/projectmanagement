from fastapi import APIRouter, Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas.user import User as UserSchema, UserUpdate
from ..auth import get_current_active_user, get_password_hash

security = HTTPBearer()

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserSchema)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information."""
    return current_user

@router.put("/me", response_model=UserSchema)
def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user information."""
    update_data = user_update.dict(exclude_unset=True)
    
    # Hash password if provided
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/", response_model=list[UserSchema])
def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all users (for project assignment purposes)."""
    users = db.query(User).filter(User.is_active == True).offset(skip).limit(limit).all()
    return users 