"""Authentication API endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import UserRegister, UserLogin, TokenResponse, UserOut
from app.services import auth_service
from app.middleware.auth import get_current_user
from app.models.models import User

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
