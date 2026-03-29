"""Authentication service — registration, login, token refresh."""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import User, Notification, TechnicianProfile, UserRole, VerificationStatus
from app.schemas.schemas import UserRegister, UserLogin, TokenResponse, UserOut
from app.middleware.auth import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
)


def register_user(db: Session, data: UserRegister) -> UserOut:
    """Register a new user. Technicians/recyclers require admin verification."""
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    auto_verify = data.role in ("citizen", "buyer")

    user = User(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=UserRole(data.role),
        phone=data.phone,
        district=data.district,
        is_verified=auto_verify,
        verification_status=(
            VerificationStatus.approved if auto_verify
            else VerificationStatus.pending
        ),
    )
    db.add(user)
    db.flush()

    if data.role == "technician":
        profile = TechnicianProfile(
            user_id=user.user_id,
            verification_status=VerificationStatus.pending,
        )
        db.add(profile)

    if not auto_verify:
        admins = db.query(User).filter(User.role == UserRole.admin).all()
        for admin in admins:
            notif = Notification(
                user_id=admin.user_id,
                type="new_registration",
                message=(
                    f"New {data.role} registration: "
                    f"{data.full_name} ({data.email}) — requires verification."
                ),
            )
            db.add(notif)

    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)


def login_user(db: Session, data: UserLogin) -> TokenResponse:
    """Authenticate user and return JWT tokens."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_verified and user.role.value not in ("citizen", "buyer"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account pending admin verification",
        )

    token_data = {"sub": str(user.user_id), "role": user.role.value}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user),
    )


def refresh_access_token(refresh_token: str) -> dict:
    """Generate a new access token from a valid refresh token."""
    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    new_access = create_access_token(
        {"sub": payload["sub"], "role": payload["role"]}
    )
    return {"access_token": new_access, "token_type": "bearer"}
