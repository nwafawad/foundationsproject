"""Technician search, ranking, and service request management."""

from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.models import (
    User, TechnicianProfile, ServiceRequest, Review,
    VerificationStatus, ServiceRequestStatus, InteractionType,
)
from app.schemas.schemas import (
    TechnicianProfileOut, ServiceRequestCreate, ServiceRequestOut,
)
from typing import List, Optional


def search_technicians(
    db: Session,
    device_type: Optional[str] = None,
    district: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
) -> List[TechnicianProfileOut]:
    """Search verified technicians filtered by device type and district, ranked by rating."""
    query = (
        db.query(TechnicianProfile, User)
        .join(User, TechnicianProfile.user_id == User.user_id)
        .filter(TechnicianProfile.verification_status == VerificationStatus.approved)
        .filter(User.is_verified == True)
    )

    if device_type:
        query = query.filter(
            TechnicianProfile.specialisation.ilike(f"%{device_type}%")
        )
    if district:
        query = query.filter(User.district == district)

    query = query.order_by(
        TechnicianProfile.average_rating.desc(),
        TechnicianProfile.total_jobs.desc(),
    )

    offset = (page - 1) * limit
    results = query.offset(offset).limit(limit).all()

    return [
        TechnicianProfileOut(
            profile_id=profile.profile_id,
            user_id=user.user_id,
            full_name=user.full_name,
            email=user.email,
            specialisation=profile.specialisation,
            years_experience=profile.years_experience,
            verification_status=profile.verification_status.value,
            average_rating=float(profile.average_rating or 0),
            total_jobs=profile.total_jobs or 0,
            district=user.district,
            phone=user.phone,
        )
        for profile, user in results
    ]


def create_service_request(
    db: Session, citizen_id: int, data: ServiceRequestCreate
) -> ServiceRequestOut:
    """Create a repair service request from a citizen to a technician."""
    technician = db.query(User).filter(
        User.user_id == data.technician_id,
        User.is_verified == True,
    ).first()
    if not technician:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verified technician not found",
        )
    if citizen_id == data.technician_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Cannot request service from yourself",
        )

    request = ServiceRequest(
        citizen_id=citizen_id,
        technician_id=data.technician_id,
        device_type=data.device_type,
        issue_description=data.issue_description,
        scheduled_date=data.scheduled_date,
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return ServiceRequestOut.model_validate(request)


def get_user_service_requests(
    db: Session, user_id: int
) -> List[ServiceRequestOut]:
    """Get all service requests for a user (as citizen or technician)."""
    requests = (
        db.query(ServiceRequest)
        .filter(
            (ServiceRequest.citizen_id == user_id)
            | (ServiceRequest.technician_id == user_id)
        )
        .order_by(ServiceRequest.created_at.desc())
        .all()
    )
    return [ServiceRequestOut.model_validate(r) for r in requests]
