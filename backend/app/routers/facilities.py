"""Facility endpoints for map data."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Facility

router = APIRouter(prefix="/api/facilities", tags=["Facilities"])


@router.get("/")
def get_facilities(db: Session = Depends(get_db)):
    """Get all facilities (recycling centers, repair shops, collection points)."""
    facilities = db.query(Facility).all()

    # Transform to match frontend expected format
    return [
        {
            "id": f.facility_id,
            "name": f.name,
            "type": f.facility_type,
            "lat": float(f.latitude),
            "lng": float(f.longitude),
            "materials": f.materials,
            "sector": f.sector,
        }
        for f in facilities
    ]
