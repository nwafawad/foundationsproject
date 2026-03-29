"""Waste listing management with admin approval workflow."""

from sqlalchemy.orm import Session
from app.models.models import (
    User, WasteListing, Notification, RecyclerProfile,
    ListingStatus, MaterialType, WasteCondition, UserRole,
)
from app.schemas.schemas import ListingCreate, ListingOut
from typing import Optional


def create_listing(db: Session, user_id: int, data: ListingCreate) -> ListingOut:
    """Create a waste listing — starts as pending_review for admin approval."""
    listing = WasteListing(
        posted_by=user_id,
        material_type=MaterialType(data.material_type),
        quantity_kg=data.quantity_kg,
        condition=WasteCondition(data.condition),
        title=data.title,
        description=data.description,
        district=data.district,
        sector=data.sector,
        status=ListingStatus.pending_review,
        price=data.price or 0,
        image=data.image,
        payment_method=data.payment_method,
        payment_number=data.payment_number,
    )
    db.add(listing)
    db.flush()

    admins = db.query(User).filter(User.role == UserRole.admin).all()
    poster = db.query(User).filter(User.user_id == user_id).first()
    for admin in admins:
        notif = Notification(
            user_id=admin.user_id,
            type="new_listing",
            message=(
                f"New listing #{listing.listing_id} by {poster.full_name}: "
                f"{data.material_type} ({data.quantity_kg}kg) — requires review."
            ),
        )
        db.add(notif)

    db.commit()
    db.refresh(listing)

    return ListingOut(
        listing_id=listing.listing_id,
        posted_by=listing.posted_by,
        poster_name=poster.full_name if poster else None,
        seller_name=poster.full_name if poster else None,
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
        date=listing.created_at.strftime(
            "%Y-%m-%d") if listing.created_at else None,
        views=listing.views or 0,
        favorites=listing.favorites or 0,
        image=listing.image,
        payment_method=listing.payment_method,
        payment_number=listing.payment_number,
        created_at=listing.created_at,
    )


def search_listings(
    db: Session,
    material_type: Optional[str] = None,
    condition: Optional[str] = None,
    district: Optional[str] = None,
    status_filter: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
) -> list[ListingOut]:
    """Search available waste listings with filters."""
    query = db.query(WasteListing, User).join(
        User, WasteListing.posted_by == User.user_id
    )

    if status_filter:
        query = query.filter(WasteListing.status ==
                             ListingStatus(status_filter))
    else:
        query = query.filter(WasteListing.status == ListingStatus.available)

    if material_type:
        query = query.filter(WasteListing.material_type ==
                             MaterialType(material_type))
    if condition:
        query = query.filter(WasteListing.condition ==
                             WasteCondition(condition))
    if district:
        query = query.filter(WasteListing.district == district)

    query = query.order_by(WasteListing.created_at.desc())
    offset = (page - 1) * limit
    results = query.offset(offset).limit(limit).all()

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
            date=listing.created_at.strftime(
                "%Y-%m-%d") if listing.created_at else None,
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


def get_user_listings(db: Session, user_id: int) -> list[ListingOut]:
    """Get all listings posted by a specific user (any status)."""
    results = (
        db.query(WasteListing, User)
        .join(User, WasteListing.posted_by == User.user_id)
        .filter(WasteListing.posted_by == user_id)
        .order_by(WasteListing.created_at.desc())
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


def match_recyclers(db: Session, listing_id: int) -> int:
    """Match a listing with recyclers who accept the material type."""
    listing = db.query(WasteListing).filter(
        WasteListing.listing_id == listing_id
    ).first()
    if not listing:
        return 0

    recyclers = (
        db.query(RecyclerProfile, User)
        .join(User, RecyclerProfile.user_id == User.user_id)
        .filter(
            RecyclerProfile.accepted_materials.contains(
                listing.material_type.value
            )
        )
        .all()
    )

    matched_count = 0
    for _profile, matched_user in recyclers:
        notif = Notification(
            user_id=matched_user.user_id,
            type="listing_match",
            message=(
                f"New listing matches your profile: "
                f"{listing.material_type.value} "
                f"({listing.quantity_kg}kg) in {listing.district}."
            ),
        )
        db.add(notif)
        matched_count += 1

    if matched_count > 0:
        db.commit()

    return matched_count
