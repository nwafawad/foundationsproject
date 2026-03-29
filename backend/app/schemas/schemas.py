"""Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# ── Auth ──

class UserRegister(BaseModel):
    """Schema for user registration, including validation for full name, email, password, and optional contact details."""
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone: Optional[str] = None
    district: Optional[str] = None
    role: str = "citizen"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    user_id: int
    full_name: str
    email: str
    role: str
    phone: Optional[str] = None
    district: Optional[str] = None
    sector: Optional[str] = None  # Specific area within district
    is_verified: bool
    verification_status: str
    avatar: Optional[str] = None  # Initials for avatar display
    created_at: datetime

    class Config:
        from_attributes = True


TokenResponse.model_rebuild()


# ── Technician ──

class TechnicianProfileOut(BaseModel):
    profile_id: int
    user_id: int
    full_name: str
    email: str
    specialisation: Optional[str] = None
    years_experience: int = 0
    verification_status: str
    average_rating: float = 0
    total_jobs: int = 0
    district: Optional[str] = None
    phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        from_attributes = True


class TechnicianSearchParams(BaseModel):
    device_type: Optional[str] = None # Specific device type for filtering technicians based on their specialization
    district: Optional[str] = None
    page: int = 1
    limit: int = 20


class ServiceRequestCreate(BaseModel):
    technician_id: int
    device_type: str
    issue_description: str
    scheduled_date: Optional[datetime] = None


class ServiceRequestOut(BaseModel):
    """Represents a service request from a citizen to a technician for device repair, including details about the device, issue, and status of the request."""
    request_id: int
    citizen_id: int
    technician_id: int
    device_type: str
    issue_description: str
    status: str
    scheduled_date: Optional[datetime] = None
    created_at: datetime
    citizen_name: Optional[str] = None

    class Config:
        from_attributes = True


class ServiceRequestStatusUpdate(BaseModel):
    status: str


# ── Listings ──

class ListingCreate(BaseModel):
    title: str
    material_type: str
    quantity_kg: float = Field(..., gt=0) # Ensure quantity is a positive number
    condition: str
    description: Optional[str] = None
    district: str
    sector: Optional[str] = None
    price: float = 0
    image: Optional[str] = None
    payment_method: str = 'mtn'
    payment_number: Optional[str] = None


class ListingOut(BaseModel):
    listing_id: int
    posted_by: int
    poster_name: Optional[str] = None
    # Alias for poster_name for frontend compatibility
    seller_name: Optional[str] = None
    material_type: str
    material: Optional[str] = None  # Alias for material_type for frontend
    quantity_kg: float
    qty: Optional[float] = None  # Alias for quantity_kg for frontend
    condition: str
    title: Optional[str] = None
    description: Optional[str] = None
    district: str
    sector: Optional[str] = None
    status: str
    price: float = 0
    date: Optional[str] = None  # Formatted date string for frontend
    views: int = 0
    favorites: int = 0
    image: Optional[str] = None
    images: Optional[str] = None  # JSON string
    payment_method: Optional[str] = 'mtn'
    payment_number: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ListingSearchParams(BaseModel):
    material_type: Optional[str] = None
    condition: Optional[str] = None
    district: Optional[str] = None
    status: Optional[str] = None
    page: int = 1
    limit: int = 20


# ── Transactions ──

class TransactionCreate(BaseModel):
    listing_id: int
    offered_price: Optional[float] = None


class TransactionStatusUpdate(BaseModel):
    status: str


class TransactionOut(BaseModel):
    transaction_id: int
    listing_id: int
    seller_id: int
    buyer_id: int
    buyer_name: Optional[str] = None
    agreed_price: Optional[float] = None # Price agreed upon after negotiation, which may differ from the initial offer
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Reviews ──

class ReviewCreate(BaseModel):
    reviewed_user_id: int
    interaction_type: str
    interaction_id: int
    rating: int = Field(..., ge=1, le=5) # Ensure rating is between 1 and 5
    comment: Optional[str] = None


class ReviewOut(BaseModel):
    review_id: int
    reviewer_id: int
    reviewed_user_id: int
    interaction_type: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Admin ──

class AdminVerifyUser(BaseModel):
    admin_notes: Optional[str] = None


class AdminVerifyListing(BaseModel):
    visit_required: bool = False
    visit_scheduled_at: Optional[datetime] = None
    admin_notes: Optional[str] = None


class AdminStatsOut(BaseModel):
    total_users: int
    total_listings: int
    completed_transactions: int
    average_rating: float
    pending_users: int
    pending_listings: int


# ── Notifications ──

class NotificationOut(BaseModel):
    """Represents a notification sent to a user, such as for new offers, messages, or updates on their listings or service requests."""
    notification_id: int
    user_id: Optional[int] = None
    type: str
    message: str
    is_read: bool
    read: Optional[bool] = None  # Alias for is_read
    listing_id: Optional[int] = None
    created_at: datetime
    date: Optional[str] = None  # Formatted date string

    class Config:
        from_attributes = True


# ── Facilities (Map) ──

class FacilityOut(BaseModel):
    id: int
    name: str
    type: str
    lat: float
    lng: float
    materials: Optional[str] = None # Types of materials accepted or processed at the facility
    sector: Optional[str] = None # Specific area within the district where the facility is located

    class Config:
        from_attributes = True


# ── Service Requests (Extended for frontend) ──

class ServiceRequestExtendedOut(BaseModel):
    """Represents a service request with additional details for frontend display."""
    request_id: int
    citizen_id: int
    technician_id: int
    tech_name: Optional[str] = None
    user_id: Optional[int] = None  # Alias for citizen_id
    user_name: Optional[str] = None
    device_type: str
    device: Optional[str] = None  # Alias for device_type
    issue_description: str
    problem: Optional[str] = None  # Alias for issue_description
    status: str
    scheduled_date: Optional[datetime] = None
    date: Optional[str] = None  # Formatted date
    time: Optional[str] = None
    contact: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Offers (Extended for frontend) ──

class OfferOut(BaseModel):
    id: int
    listing_id: int
    buyer_id: int
    buyer_name: Optional[str] = None
    amount: float
    status: str
    date: str
    message: Optional[str] = None
    counter_amount: Optional[float] = None
    counter_message: Optional[str] = None
    tx_status: Optional[str] = None
    paid: Optional[bool] = None

    class Config:
        from_attributes = True


# ── Reviews/Testimonials ──

class ReviewOutExtended(BaseModel):
    id: Optional[int] = None # Unique identifier for the review, which may be None when creating a new review before it is saved to the database
    review_id: Optional[int] = None
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    listing_id: Optional[int] = None
    listing_title: Optional[str] = None
    rating: int
    message: Optional[str] = None
    comment: Optional[str] = None
    date: str
    status: str = 'approved'

    class Config:
        from_attributes = True
