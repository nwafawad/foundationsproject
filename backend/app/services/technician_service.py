"""Technician search, ranking, and service request management."""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import (
    User, TechnicianProfile, ServiceRequest, Notification,
    VerificationStatus, ServiceRequestStatus,
)
from app.schemas.schemas import (
    TechnicianProfileOut, ServiceRequestCreate, ServiceRequestOut,
)
from typing import Optional


def search_technicians(
    db: Session,
    device_type: Optional[str] = None,
    district: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
) -> list[TechnicianProfileOut]:
    """Search verified technicians filtered by device type and district, ranked by rating."""
    query = (
        db.query(TechnicianProfile, User)
        .join(User, TechnicianProfile.user_id == User.user_id)
        .filter(TechnicianProfile.verification_status == VerificationStatus.approved)
        .filter(User.is_verified.is_(True))
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
            # Additional fields for frontend compatibility
            latitude=float(
                profile.location_lat) if profile.location_lat else None,
            longitude=float(
                profile.location_lng) if profile.location_lng else None,
        )
        for profile, user in results
    ]


def create_service_request(
    db: Session, citizen_id: int, data: ServiceRequestCreate
) -> ServiceRequestOut:
    """Create a repair service request from a citizen to a technician."""
    technician = db.query(User).filter(
        User.user_id == data.technician_id,
        User.is_verified.is_(True),
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

    citizen = db.query(User).filter(User.user_id == citizen_id).first()
    citizen_name = citizen.full_name if citizen else "A user"

    request = ServiceRequest(
        citizen_id=citizen_id,
        technician_id=data.technician_id,
        device_type=data.device_type,
        issue_description=data.issue_description,
        scheduled_date=data.scheduled_date,
    )
    db.add(request)

    notif = Notification(
        user_id=data.technician_id,
        type="service_request_received",
        message=(
            f"New booking from {citizen_name}: "
            f"{data.device_type} — {data.issue_description or 'No description'}."
        ),
    )
    db.add(notif)

    db.commit()
    db.refresh(request)
    return ServiceRequestOut.model_validate(request)


def get_user_service_requests(
    db: Session, user_id: int
) -> list[ServiceRequestOut]:
    """Get all service requests for a user (as citizen or technician), with citizen name."""
    results = (
        db.query(ServiceRequest, User)
        .join(User, ServiceRequest.citizen_id == User.user_id)
        .filter(
            (ServiceRequest.citizen_id == user_id)
            | (ServiceRequest.technician_id == user_id)
        )
        .order_by(ServiceRequest.created_at.desc())
        .all()
    )
    return [
        ServiceRequestOut(
            request_id=req.request_id,
            citizen_id=req.citizen_id,
            technician_id=req.technician_id,
            device_type=req.device_type,
            issue_description=req.issue_description,
            status=req.status.value,
            scheduled_date=req.scheduled_date,
            created_at=req.created_at,
            citizen_name=citizen.full_name,
        )
        for req, citizen in results
    ]


def update_service_request_status(
    db: Session, request_id: int, technician_id: int, new_status: str
) -> ServiceRequestOut:
    """Allow a technician to update the status of a service request."""
    req = db.query(ServiceRequest).filter(
        ServiceRequest.request_id == request_id
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Service request not found")
    if req.technician_id != technician_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this request")

    try:
        req.status = ServiceRequestStatus(new_status)
    except ValueError:
        raise HTTPException(status_code=422, detail=f"Invalid status '{new_status}'")

    if req.status == ServiceRequestStatus.completed:
        profile = db.query(TechnicianProfile).filter(
            TechnicianProfile.user_id == technician_id
        ).first()
        if profile:
            profile.total_jobs = (profile.total_jobs or 0) + 1

    db.commit()
    db.refresh(req)

    citizen = db.query(User).filter(User.user_id == req.citizen_id).first()
    return ServiceRequestOut(
        request_id=req.request_id,
        citizen_id=req.citizen_id,
        technician_id=req.technician_id,
        device_type=req.device_type,
        issue_description=req.issue_description,
        status=req.status.value,
        scheduled_date=req.scheduled_date,
        created_at=req.created_at,
        citizen_name=citizen.full_name if citizen else None,
    )
