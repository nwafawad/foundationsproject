"""Authentication API endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import UserRegister, UserLogin, TokenResponse, UserOut
from app.services import auth_service
from app.middleware.auth import get_current_user
from app.models.models import User


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    district: Optional[str] = None

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account."""
    return auth_service.register_user(db, data)


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Login and receive JWT tokens."""
    return auth_service.login_user(db, data)


@router.post("/refresh")
def refresh(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh an expired access token."""
    return auth_service.refresh_access_token(refresh_token)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user profile."""
    return UserOut.model_validate(current_user)


@router.put("/me", response_model=UserOut)
def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update current user's profile."""
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.phone is not None:
        current_user.phone = data.phone
    if data.district is not None:
        current_user.district = data.district
    db.commit()
    db.refresh(current_user)
    return UserOut.model_validate(current_user)
