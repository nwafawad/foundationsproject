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
    """Defines the different roles a user can have on the platform, which determines their permissions and access to features."""
    citizen = "citizen"
    technician = "technician"
    recycler = "recycler"
    buyer = "buyer"
    admin = "admin"


class VerificationStatus(str, enum.Enum):
    """Represents the verification status of a user or listing, which can be pending, approved, or rejected based on admin review."""
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
    """Represents the status of a waste listing in the marketplace, which can be pending review, available for offers, matched with a buyer, in transaction, completed, or rejected by admin."""
    pending_review = "pending_review"
    available = "available"
    matched = "matched"
    transacting = "transacting"
    completed = "completed"
    rejected = "rejected"


class TransactionStatus(str, enum.Enum):
    """Represents the status of a transaction in the marketplace, which can be offer received, offer accepted, in transit, completed, or cancelled."""
    offer_received = "offer_received"
    offer_accepted = "offer_accepted"
    in_transit = "in_transit"
    completed = "completed"
    cancelled = "cancelled"


class ServiceRequestStatus(str, enum.Enum):
    """Represents the status of a service request in the platform, which can be pending, confirmed, in progress, completed, or cancelled."""
    pending = "pending"
    confirmed = "confirmed"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class InteractionType(str, enum.Enum):
    """Represents the type of interaction for reviews, which can be a repair service or a waste transaction."""
    repair = "repair"
    waste_transaction = "waste_transaction"


# ── Models ──

class User(Base):
    """All users of the platform, including citizens, technicians, recyclers, buyers, and admins."""
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
    """Additional details for users with the technician role, including their specialisation, experience, and verification status."""
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
    """Additional details for users with the recycler role, including their company information and operating details."""
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
    """Listings for waste materials that citizens want to sell or give away, including details about the material, condition, location, and transaction status."""
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
    """Represents a transaction between a buyer and seller for a waste listing, including the agreed price, status, and timestamps for the transaction process."""
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(
        Integer, ForeignKey("waste_listings.listing_id"), nullable=False
    )
    # seller_id and buyer_id reference users, but we don't set up foreign keys here to avoid circular dependencies and allow for flexibility in user roles   
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
    """Represents a service request from a citizen to a technician for device repair, including details about the device, issue, and status of the request."""
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
    """Represents a review left by a user for another user after an interaction, such as a repair service or waste transaction, including the rating, comment, and type of interaction."""
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
    """Represents a favorite listing added by a user."""
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint('user_id', 'listing_id', name='unique_user_listing_favorite'),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    listing_id = Column(Integer, ForeignKey("waste_listings.listing_id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    """Represents a notification sent to a user, such as for new offers, messages, or updates on their listings or service requests."""
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
