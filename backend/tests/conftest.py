"""Shared test fixtures for RECYX backend tests."""

import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime


@pytest.fixture
def mock_db():
    """Mock database session."""
    db = MagicMock()
    db.query.return_value = db
    db.filter.return_value = db
    db.first.return_value = None
    db.all.return_value = []
    db.add = MagicMock()
    db.commit = MagicMock()
    db.flush = MagicMock()
    db.refresh = MagicMock()
    return db


@pytest.fixture
def sample_user():
    """Sample user object for testing."""
    user = MagicMock()
    user.user_id = 1
    user.full_name = "Marie Uwase"
    user.email = "marie@email.com"
    user.password_hash = "$2b$12$dummy_hash_for_testing"
    user.role = MagicMock(value="citizen")
    user.phone = "+250 788 111 111"
    user.district = "Gasabo"
    user.is_verified = True
    user.verification_status = MagicMock(value="approved")
    user.created_at = datetime(2026, 3, 1)
    return user


@pytest.fixture
def sample_admin():
    """Sample admin user."""
    admin = MagicMock()
    admin.user_id = 99
    admin.full_name = "RECYX Admin"
    admin.email = "admin@recyx.rw"
    admin.role = MagicMock(value="admin")
    admin.is_verified = True
    admin.verification_status = MagicMock(value="approved")
    return admin


@pytest.fixture
def sample_technician_profile():
    """Sample technician profile."""
    profile = MagicMock()
    profile.profile_id = 1
    profile.user_id = 101
    profile.specialisation = "Smartphones & Tablets"
    profile.years_experience = 6
    profile.verification_status = MagicMock(value="approved")
    profile.average_rating = 4.8
    profile.total_jobs = 127
    return profile


@pytest.fixture
def sample_listing():
    """Sample waste listing."""
    listing = MagicMock()
    listing.listing_id = 1
    listing.posted_by = 1
    listing.material_type = MagicMock(value="electronics")
    listing.quantity_kg = 25.0
    listing.condition = MagicMock(value="repairable")
    listing.description = "Old desktop computers"
    listing.district = "Gasabo"
    listing.status = MagicMock(value="pending_review")
    listing.created_at = datetime(2026, 3, 1)
    return listing


@pytest.fixture
def sample_transaction():
    """Sample transaction."""
    tx = MagicMock()
    tx.transaction_id = 1
    tx.listing_id = 1
    tx.seller_id = 1
    tx.buyer_id = 2
    tx.agreed_price = 15000
    tx.status = MagicMock(value="offer_received")
    tx.created_at = datetime(2026, 3, 1)
    tx.completed_at = None
    return tx
