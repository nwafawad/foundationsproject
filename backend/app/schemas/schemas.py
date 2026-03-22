"""Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.models import (
    InteractionType,
    ListingStatus,
    MaterialType,
    ServiceRequestStatus,
    TransactionStatus,
    UserRole,
    VerificationStatus,
    WasteCondition,
)


# ── Auth ──

class UserRegister(BaseModel):
    """Payload used to register a new user account."""

    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone: Optional[str] = None
    district: Optional[str] = None
    role: UserRole = UserRole.citizen


class UserLogin(BaseModel):
    """Payload used to authenticate a user and obtain access tokens."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Response schema for successful authentication, containing access and refresh tokens along with user details."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    """Schema representing a user's public profile information, returned in API responses."""

    user_id: int
    full_name: str
    email: str
    role: UserRole
    phone: Optional[str] = None
    district: Optional[str] = None
    is_verified: bool
    verification_status: VerificationStatus
    created_at: datetime

    class Config:
        from_attributes = True


TokenResponse.model_rebuild()


# ── Technician ──

class TechnicianProfileOut(BaseModel):
    """Schema representing a technician's profile information, returned in API responses."""

    profile_id: int
    user_id: int
    full_name: str
    email: str
    specialisation: Optional[str] = None
    years_experience: int = 0
    verification_status: VerificationStatus
    average_rating: float = 0
    total_jobs: int = 0
    district: Optional[str] = None
    phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        from_attributes = True


class TechnicianSearchParams(BaseModel):
    """Schema for filtering technicians based on search criteria."""

    device_type: Optional[str] = None
    district: Optional[str] = None
    page: int = 1
    limit: int = 20


class ServiceRequestCreate(BaseModel):
    """Payload used to create a new service request."""

    technician_id: int
    device_type: str
    issue_description: str
    scheduled_date: Optional[datetime] = None


class ServiceRequestOut(BaseModel):
    """Schema representing a service request, returned in API responses."""

    request_id: int
    citizen_id: int
    technician_id: int
    device_type: str
    issue_description: str
    status: ServiceRequestStatus
    scheduled_date: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Listings ──

class ListingCreate(BaseModel):
    """Payload used to create a new waste listing."""

    material_type: MaterialType
    quantity_kg: float = Field(..., gt=0)
    condition: WasteCondition
    description: Optional[str] = None
    district: str


class ListingOut(BaseModel):
    """Schema representing a waste listing, returned in API responses."""

    listing_id: int
    posted_by: int
    poster_name: Optional[str] = None
    material_type: MaterialType
    quantity_kg: float
    condition: WasteCondition
    description: Optional[str] = None
    district: str
    status: ListingStatus
    created_at: datetime

    class Config:
        from_attributes = True


class ListingSearchParams(BaseModel):
    """Schema for filtering waste listings based on search criteria."""

    material_type: Optional[MaterialType] = None
    condition: Optional[WasteCondition] = None
    district: Optional[str] = None
    status: Optional[ListingStatus] = None
    page: int = 1
    limit: int = 20


# ── Transactions ──

class TransactionCreate(BaseModel):
    """Payload used to initiate a new transaction for a waste listing."""

    listing_id: int
    offered_price: Optional[float] = None


class TransactionStatusUpdate(BaseModel):
    """Payload used to update the status of an existing transaction."""

    status: TransactionStatus


class TransactionOut(BaseModel):
    """Schema representing a transaction, returned in API responses."""
    transaction_id: int
    listing_id: int
    seller_id: int
    buyer_id: int
    agreed_price: Optional[float] = None
    status: TransactionStatus
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Reviews ──

class ReviewCreate(BaseModel):
    """Payload used to create a new review."""

    reviewed_user_id: int
    interaction_type: InteractionType
    interaction_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewOut(BaseModel):
    """Schema representing a review, returned in API responses."""

    review_id: int
    reviewer_id: int
    reviewed_user_id: int
    interaction_type: InteractionType
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Admin ──

class AdminVerifyUser(BaseModel):
    """Payload used by admins to verify a user's account."""

    admin_notes: Optional[str] = None


class AdminVerifyListing(BaseModel):
    """Payload used by admins to verify a waste listing."""

    visit_required: bool = False
    visit_scheduled_at: Optional[datetime] = None
    admin_notes: Optional[str] = None


class AdminStatsOut(BaseModel):
    """Schema representing key statistics for the admin dashboard, returned in API responses."""

    total_users: int
    total_listings: int
    completed_transactions: int
    average_rating: float
    pending_users: int
    pending_listings: int


# ── Notifications ──

class NotificationOut(BaseModel):
    """Schema representing a notification, returned in API responses."""
    
    notification_id: int
    type: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
