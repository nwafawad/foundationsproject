"""Admin service — user verification, listing approval, analytics."""

from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from app.models.models import (
    User, WasteListing, Transaction, Review, Notification, TechnicianProfile,
    UserRole, VerificationStatus, ListingStatus, TransactionStatus,
)
from app.schemas.schemas import AdminStatsOut, UserOut, ListingOut
from app.services.listing_service import match_recyclers


def get_all_users(db: Session) -> list[UserOut]:
    """Get all non-admin users."""
    users = (
        db.query(User)
        .filter(User.role != UserRole.admin)
        .order_by(User.created_at.desc())
        .all()
    )
    return [UserOut.model_validate(u) for u in users]


def get_pending_users(db: Session) -> list[UserOut]:
    """Get all users awaiting admin verification."""
    users = (
        db.query(User)
        .filter(
            User.verification_status == VerificationStatus.pending,
            User.role.in_([UserRole.technician, UserRole.recycler]),
        )
        .order_by(User.created_at.desc())
        .all()
    )
    return [UserOut.model_validate(u) for u in users]


def verify_user(
    db: Session, user_id: int, admin_id: int, admin_notes: str = None
) -> UserOut:
    """Approve a user's registration."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_verified = True
    user.verification_status = VerificationStatus.approved
    user.verified_by = admin_id
    user.verified_at = datetime.utcnow()
    user.admin_notes = admin_notes

    if user.role == UserRole.technician:
        profile = db.query(TechnicianProfile).filter(
            TechnicianProfile.user_id == user.user_id
        ).first()
        if profile:
            profile.verification_status = VerificationStatus.approved
        else:
            # Profile was not created at registration (legacy account) — create it now
            db.add(TechnicianProfile(
                user_id=user.user_id,
                verification_status=VerificationStatus.approved,
            ))

    notif = Notification(
        user_id=user.user_id,
        type="verification_approved",
        message="Your account has been verified! You can now access all platform features.",
    )
    db.add(notif)
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)


def reject_user(
    db: Session, user_id: int, admin_id: int, admin_notes: str = None
) -> UserOut:
    """Reject a user's registration."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.verification_status = VerificationStatus.rejected
    user.verified_by = admin_id
    user.verified_at = datetime.utcnow()
    user.admin_notes = admin_notes

    notif = Notification(
        user_id=user.user_id,
        type="verification_rejected",
        message="Your registration was not approved. Please contact support for details.",
    )
    db.add(notif)
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)


def get_all_listings(db: Session) -> list[ListingOut]:
    """Get all listings for admin view (all statuses)."""
    results = (
        db.query(WasteListing, User)
        .join(User, WasteListing.posted_by == User.user_id)
        .order_by(WasteListing.created_at.desc())
        .all()
    )
    return [
        ListingOut(
            listing_id=listing.listing_id,
            posted_by=listing.posted_by,
            poster_name=poster.full_name,
            seller_name=poster.full_name,
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
            payment_method=listing.payment_method,
            payment_number=listing.payment_number,
            created_at=listing.created_at,
        )
        for listing, poster in results
    ]


def get_pending_listings(db: Session) -> list[ListingOut]:
    """Get all listings awaiting admin review."""
    results = (
        db.query(WasteListing, User)
        .join(User, WasteListing.posted_by == User.user_id)
        .filter(WasteListing.status == ListingStatus.pending_review)
        .order_by(WasteListing.created_at.desc())
        .all()
    )
    return [
        ListingOut(
            listing_id=listing.listing_id,
            posted_by=listing.posted_by,
            poster_name=poster.full_name,
            material_type=listing.material_type.value,
            quantity_kg=float(listing.quantity_kg),
            condition=listing.condition.value,
            description=listing.description,
            district=listing.district,
            status=listing.status.value,
            created_at=listing.created_at,
        )
        for listing, poster in results
    ]


def approve_listing(
    db: Session, listing_id: int, admin_id: int, admin_notes: str = None
) -> ListingOut:
    """Approve a listing — sets it as available and triggers recycler matching."""
    listing = db.query(WasteListing).filter(
        WasteListing.listing_id == listing_id
    ).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing.status = ListingStatus.available
    listing.verified_by = admin_id
    listing.verified_at = datetime.utcnow()
    listing.admin_notes = admin_notes

    poster = db.query(User).filter(User.user_id == listing.posted_by).first()
    notif = Notification(
        user_id=listing.posted_by,
        type="listing_approved",
        message=(
            f"Your listing #{listing.listing_id} has been approved "
            f"and is now live on the marketplace."
        ),
    )
    db.add(notif)
    db.commit()

    match_recyclers(db, listing_id)

    db.refresh(listing)
    return ListingOut(
        listing_id=listing.listing_id,
        posted_by=listing.posted_by,
        poster_name=poster.full_name if poster else None,
        material_type=listing.material_type.value,
        quantity_kg=float(listing.quantity_kg),
        condition=listing.condition.value,
        description=listing.description,
        district=listing.district,
        status=listing.status.value,
        created_at=listing.created_at,
    )


def reject_listing(
    db: Session, listing_id: int, admin_id: int, admin_notes: str = None
) -> dict:
    """Reject a listing."""
    listing = db.query(WasteListing).filter(
        WasteListing.listing_id == listing_id
    ).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing.status = ListingStatus.rejected
    listing.verified_by = admin_id
    listing.verified_at = datetime.utcnow()
    listing.admin_notes = admin_notes

    notif = Notification(
        user_id=listing.posted_by,
        type="listing_rejected",
        message=(
            f"Your listing #{listing.listing_id} was not approved. "
            f"Reason: {admin_notes or 'Contact support for details.'}"
        ),
    )
    db.add(notif)
    db.commit()
    return {"detail": "Listing rejected"}


def get_admin_stats(db: Session) -> AdminStatsOut:
    """Get platform-wide statistics for the admin dashboard."""
    total_users = db.query(func.count(User.user_id)).scalar()
    total_listings = db.query(func.count(WasteListing.listing_id)).scalar()
    completed_tx = db.query(func.count(Transaction.transaction_id)).filter(
        Transaction.status == TransactionStatus.completed
    ).scalar()
    avg_rating = db.query(func.avg(Review.rating)).scalar() or 0
    pending_users = db.query(func.count(User.user_id)).filter(
        User.verification_status == VerificationStatus.pending,
        User.role.in_([UserRole.technician, UserRole.recycler]),
    ).scalar()
    pending_listings = db.query(func.count(WasteListing.listing_id)).filter(
        WasteListing.status == ListingStatus.pending_review
    ).scalar()

    return AdminStatsOut(
        total_users=total_users,
        total_listings=total_listings,
        completed_transactions=completed_tx,
        average_rating=round(float(avg_rating), 1),
        pending_users=pending_users,
        pending_listings=pending_listings,
    )
