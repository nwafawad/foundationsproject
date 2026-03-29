"""Review and rating endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.schemas import ReviewCreate, ReviewOut
from app.models.models import User, Review, TechnicianProfile, InteractionType
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])


@router.post("/", response_model=ReviewOut, status_code=201)
def create_review(
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit a review for a completed interaction."""
    if current_user.user_id == data.reviewed_user_id:
        raise HTTPException(status_code=422, detail="Cannot review yourself")

    existing = db.query(Review).filter(
        Review.reviewer_id == current_user.user_id,
        Review.interaction_type == InteractionType(data.interaction_type),
        Review.interaction_id == data.interaction_id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Already reviewed this interaction")

    review = Review(
        reviewer_id=current_user.user_id,
        reviewed_user_id=data.reviewed_user_id,
        interaction_type=InteractionType(data.interaction_type),
        interaction_id=data.interaction_id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Recalculate TechnicianProfile.average_rating from all reviews
    profile = db.query(TechnicianProfile).filter(
        TechnicianProfile.user_id == data.reviewed_user_id
    ).first()
    if profile:
        avg = db.query(func.avg(Review.rating)).filter(
            Review.reviewed_user_id == data.reviewed_user_id
        ).scalar()
        profile.average_rating = round(float(avg), 2) if avg else 0
        db.commit()

    return ReviewOut.model_validate(review)


@router.get("/user/{user_id}", response_model=List[ReviewOut])
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    """Get all reviews received by a user."""
    reviews = (
        db.query(Review)
        .filter(Review.reviewed_user_id == user_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return [ReviewOut.model_validate(r) for r in reviews]
