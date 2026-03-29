"""SQLAlchemy ORM models for RECYX database."""

import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Numeric, Enum,
    ForeignKey, DateTime, CheckConstraint, UniqueConstraint, Text,
)
from sqlalchemy.orm import relationship
try:
    from geoalchemy2 import Geometry
    HAS_POSTGIS = True
except ImportError:
    HAS_POSTGIS = False
from app.database import Base


# ── Enums ──

class UserRole(str, enum.Enum):
    citizen = "citizen"
    technician = "technician"
    recycler = "recycler"
    buyer = "buyer"
    admin = "admin"


class VerificationStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class MaterialType(str, enum.Enum):
    electronics = "electronics"
    plastic = "plastic"
    metal = "metal"
    paper = "paper"
    glass = "glass"
    mixed = "mixed"
    other = "other"


class WasteCondition(str, enum.Enum):
    functional = "functional"
    repairable = "repairable"
    scrap = "scrap"


class ListingStatus(str, enum.Enum):
    pending_review = "pending_review"
    available = "available"
    matched = "matched"
    transacting = "transacting"
    completed = "completed"
    rejected = "rejected"


class TransactionStatus(str, enum.Enum):
    offer_received = "offer_received"
    offer_accepted = "offer_accepted"
    in_transit = "in_transit"
    completed = "completed"
    cancelled = "cancelled"


class ServiceRequestStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class InteractionType(str, enum.Enum):
    repair = "repair"
    waste_transaction = "waste_transaction"


# ── Models ──

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.citizen, nullable=False)
    phone = Column(String(20))
    district = Column(String(80))
    is_verified = Column(Boolean, default=False)
    verified_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    verification_status = Column(
        Enum(VerificationStatus), default=VerificationStatus.pending
    )
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    technician_profile = relationship(
        "TechnicianProfile", back_populates="user", uselist=False
    )
    recycler_profile = relationship(
        "RecyclerProfile", back_populates="user", uselist=False
    )
    listings = relationship(
        "WasteListing", back_populates="poster", foreign_keys="WasteListing.posted_by")
    reviews_written = relationship(
        "Review", foreign_keys="Review.reviewer_id", back_populates="reviewer"
    )
    reviews_received = relationship(
        "Review", foreign_keys="Review.reviewed_user_id", back_populates="reviewed_user"
    )
    notifications = relationship("Notification", back_populates="user")


class TechnicianProfile(Base):
    __tablename__ = "technician_profiles"

    profile_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True
    )
    specialisation = Column(String(200))
    years_experience = Column(Integer, default=0)
    national_id_ref = Column(String(255))  # Hashed reference
    verification_status = Column(
        Enum(VerificationStatus), default=VerificationStatus.pending
    )
    location_lat = Column(Numeric(10, 7), nullable=True)
    location_lng = Column(Numeric(10, 7), nullable=True)
    average_rating = Column(Numeric(3, 2), default=0)
    total_jobs = Column(Integer, default=0)

    user = relationship("User", back_populates="technician_profile")


class RecyclerProfile(Base):
    __tablename__ = "recycler_profiles"

    profile_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True
    )
    company_name = Column(String(150))
    accepted_materials = Column(Text)  # JSON string of materials list
    capacity_kg_per_month = Column(Integer)
    location_lat = Column(Numeric(10, 7), nullable=True)
    location_lng = Column(Numeric(10, 7), nullable=True)
    district = Column(String(80))
    operating_hours = Column(String(100))

    user = relationship("User", back_populates="recycler_profile")


class WasteListing(Base):
    __tablename__ = "waste_listings"

    listing_id = Column(Integer, primary_key=True, index=True)
    posted_by = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    material_type = Column(Enum(MaterialType), nullable=False)
    quantity_kg = Column(Numeric(8, 2), nullable=False)
    condition = Column(Enum(WasteCondition), nullable=False)
    title = Column(String(200))  # Display title for marketplace
    description = Column(Text)
    district = Column(String(80))
    sector = Column(String(80))  # Specific area within district
    status = Column(Enum(ListingStatus), default=ListingStatus.pending_review)
    price = Column(Numeric(12, 2), default=0)  # Price in RWF
    views = Column(Integer, default=0)  # View count
    favorites = Column(Integer, default=0)  # Favorite count
    image = Column(String(500))  # Main image URL
    images = Column(Text)  # JSON array of additional images
    payment_method = Column(String(20), default='mtn')  # mtn, airteltig, cash
    payment_number = Column(String(20))  # Payment phone number
    verified_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    visit_required = Column(Boolean, default=False)
    visit_scheduled_at = Column(DateTime, nullable=True)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    poster = relationship("User", back_populates="listings",
                          foreign_keys=[posted_by])
    transactions = relationship("Transaction", back_populates="listing")


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(
        Integer, ForeignKey("waste_listings.listing_id"), nullable=False
    )
    seller_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    agreed_price = Column(Numeric(10, 2), nullable=True)
    status = Column(
        Enum(TransactionStatus), default=TransactionStatus.offer_received
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    listing = relationship("WasteListing", back_populates="transactions")


class ServiceRequest(Base):
    __tablename__ = "service_requests"

    request_id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    technician_id = Column(Integer, ForeignKey(
        "users.user_id"), nullable=False)
    device_type = Column(String(100))
    issue_description = Column(Text)
    status = Column(
        Enum(ServiceRequestStatus), default=ServiceRequestStatus.pending
    )
    scheduled_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint("citizen_id != technician_id",
                        name="check_self_request"),
    )


class Review(Base):
    __tablename__ = "reviews"

    review_id = Column(Integer, primary_key=True, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    reviewed_user_id = Column(Integer, ForeignKey(
        "users.user_id"), nullable=False)
    interaction_type = Column(Enum(InteractionType), nullable=False)
    interaction_id = Column(Integer, nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint(
            "reviewer_id", "interaction_type", "interaction_id",
            name="unique_review_per_interaction",
        ),
        CheckConstraint("rating >= 1 AND rating <= 5",
                        name="check_rating_range"),
    )

    reviewer = relationship("User", foreign_keys=[
                            reviewer_id], back_populates="reviews_written")
    reviewed_user = relationship(
        "User", foreign_keys=[reviewed_user_id], back_populates="reviews_received")


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint('user_id', 'listing_id', name='unique_user_listing_favorite'),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    listing_id = Column(Integer, ForeignKey("waste_listings.listing_id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    type = Column(String(50))
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class Facility(Base):
    """Recycling centers, repair shops, and collection points for the map."""
    __tablename__ = "facilities"

    facility_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    # recycler, repair, collection
    facility_type = Column(String(50), nullable=False)
    latitude = Column(Numeric(10, 7), nullable=False)
    longitude = Column(Numeric(10, 7), nullable=False)
    materials = Column(String(200))  # Accepted materials (for recyclers)
    sector = Column(String(80))  # Location sector
