"""Admin endpoints — user verification, listing approval, analytics."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.schemas import (
    AdminVerifyUser, AdminVerifyListing, AdminStatsOut, UserOut, ListingOut,
)
from app.services import admin_service
from app.middleware.auth import require_roles
from app.models.models import User

router = APIRouter(prefix="/api/admin", tags=["Admin"])

admin_only = require_roles(["admin"])


@router.get("/stats", response_model=AdminStatsOut)
def get_stats(
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    """Get platform-wide analytics."""
    return admin_service.get_admin_stats(db)


@router.get("/users", response_model=List[UserOut])
def get_all_users(
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    """Get all non-admin users."""
    return admin_service.get_all_users(db)


@router.get("/pending-users", response_model=List[UserOut])
def get_pending_users(
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    """Get users awaiting verification."""
    return admin_service.get_pending_users(db)


@router.post("/verify-user/{user_id}", response_model=UserOut)
def verify_user(
    user_id: int,
    data: AdminVerifyUser = None,
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    """Approve a user's registration."""
    notes = data.admin_notes if data else None
    return admin_service.verify_user(db, user_id, current_user.user_id, notes)


@router.post("/reject-user/{user_id}", response_model=UserOut)
def reject_user(
    user_id: int,
    data: AdminVerifyUser = None,
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    """Reject a user's registration."""
    notes = data.admin_notes if data else None
    return admin_service.reject_user(db, user_id, current_user.user_id, notes)


@router.get("/listings", response_model=List[ListingOut])
def get_all_listings(
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    """Get all listings for admin management (all statuses)."""
    return admin_service.get_all_listings(db)


@router.get("/pending-listings", response_model=List[ListingOut])
def get_pending_listings(
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    """Get listings awaiting admin review."""
    return admin_service.get_pending_listings(db)


@router.post("/approve-listing/{listing_id}", response_model=ListingOut)
def approve_listing(
    listing_id: int,
    data: AdminVerifyListing = None,
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    """Approve a waste listing for the marketplace."""
    notes = data.admin_notes if data else None
    return admin_service.approve_listing(db, listing_id, current_user.user_id, notes)


@router.post("/reject-listing/{listing_id}")
def reject_listing(
    listing_id: int,
    data: AdminVerifyListing = None,
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    """Reject a waste listing."""
    notes = data.admin_notes if data else None
    return admin_service.reject_listing(db, listing_id, current_user.user_id, notes)
