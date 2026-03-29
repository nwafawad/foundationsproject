"""Waste listing endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.schemas.schemas import ListingCreate, ListingOut
from app.services import listing_service
from app.middleware.auth import get_current_user
from app.models.models import User, WasteListing, Favorite

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


@router.get("/favorites", response_model=List[ListingOut])
def get_my_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all listings favorited by the current user."""
    results = (
        db.query(WasteListing, User)
        .join(Favorite, Favorite.listing_id == WasteListing.listing_id)
        .join(User, WasteListing.posted_by == User.user_id)
        .filter(Favorite.user_id == current_user.user_id)
        .order_by(Favorite.created_at.desc())
        .all()
    )
    return [
        ListingOut(
            listing_id=listing.listing_id,
            posted_by=listing.posted_by,
            poster_name=user.full_name,
            seller_name=user.full_name,
            material_type=listing.material_type.value,
            material=listing.material_type.value,
            quantity_kg=float(listing.quantity_kg),
            qty=float(listing.quantity_kg),
            condition=listing.condition.value,
            title=listing.title,
            description=listing.description,
            district=listing.district,
            sector=listing.sector,
            status=listing.status.value,
            price=float(listing.price) if listing.price else 0,
            date=listing.created_at.strftime("%Y-%m-%d") if listing.created_at else None,
            views=listing.views or 0,
            favorites=listing.favorites or 0,
            image=listing.image,
            images=listing.images,
            payment_method=listing.payment_method,
            payment_number=listing.payment_number,
            created_at=listing.created_at,
        )
        for listing, user in results
    ]


@router.get("/mine", response_model=List[ListingOut])
def get_my_listings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all listings posted by the current user (any status)."""
    return listing_service.get_user_listings(db, current_user.user_id)


@router.post("/{listing_id}/view")
def increment_view(listing_id: int, db: Session = Depends(get_db)):
    """Increment the view count for a listing."""
    listing = db.query(WasteListing).filter(WasteListing.listing_id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    listing.views = (listing.views or 0) + 1
    db.commit()
    return {"views": listing.views}


@router.get("/{listing_id}/favorite")
def check_favorite(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Check if the current user has favorited a listing."""
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.user_id,
        Favorite.listing_id == listing_id,
    ).first()
    return {"favorited": bool(existing)}


@router.post("/{listing_id}/favorite")
def toggle_favorite(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Toggle favorite status for a listing. Returns new state and count."""
    listing = db.query(WasteListing).filter(WasteListing.listing_id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.user_id,
        Favorite.listing_id == listing_id,
    ).first()
    if existing:
        db.delete(existing)
        listing.favorites = max(0, (listing.favorites or 0) - 1)
        db.commit()
        return {"favorited": False, "favorites": listing.favorites}
    else:
        db.add(Favorite(user_id=current_user.user_id, listing_id=listing_id))
        listing.favorites = (listing.favorites or 0) + 1
        db.commit()
        return {"favorited": True, "favorites": listing.favorites}
