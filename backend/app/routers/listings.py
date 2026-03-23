"""Waste listing endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.schemas.schemas import ListingCreate, ListingOut
from app.services import listing_service
from app.middleware.auth import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api/listings", tags=["Waste Listings"])


@router.post("/", response_model=ListingOut, status_code=201)
def create_listing(
    data: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new waste listing (submitted for admin review)."""
    return listing_service.create_listing(db, current_user.user_id, data)


@router.get("/", response_model=List[ListingOut])
def search_listings(
    material_type: Optional[str] = Query(None),
    condition: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Search approved waste listings on the marketplace."""
    return listing_service.search_listings(
        db, material_type, condition, district, page=page, limit=limit
    )


@router.get("/mine", response_model=List[ListingOut])
def get_my_listings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all listings posted by the current user (any status)."""
    return listing_service.search_listings(
        db, status_filter=None, page=1, limit=100
    )
