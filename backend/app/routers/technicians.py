"""Technician search and service request endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.schemas.schemas import TechnicianProfileOut, ServiceRequestCreate, ServiceRequestOut
from app.services import technician_service
from app.middleware.auth import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api/technicians", tags=["Technicians"])


@router.get("/", response_model=List[TechnicianProfileOut])
def search_technicians(
    device_type: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Search verified technicians by device type and district."""
    return technician_service.search_technicians(db, device_type, district, page, limit)


@router.post("/service-requests", response_model=ServiceRequestOut, status_code=201)
def create_service_request(
    data: ServiceRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a repair service request."""
    return technician_service.create_service_request(db, current_user.user_id, data)


@router.get("/service-requests/mine", response_model=List[ServiceRequestOut])
def get_my_service_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all service requests for the current user."""
    return technician_service.get_user_service_requests(db, current_user.user_id)
