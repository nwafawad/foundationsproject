"""Unit tests for Pydantic schema validation."""

import pytest
from pydantic import ValidationError
from app.schemas.schemas import (
    UserRegister, UserLogin, ReviewCreate, ListingCreate,
    TransactionStatusUpdate, ServiceRequestCreate,
)


class TestUserRegisterSchema:
    """Test registration input validation."""

    def test_valid_registration(self):
        """Valid data should pass validation."""
        data = UserRegister(
            full_name="Jean Claude",
            email="jean@email.com",
            password="securePass123",
            phone="+250 788 000 000",
            district="Gasabo",
            role="citizen",
        )
        assert data.full_name == "Jean Claude"
        assert data.email == "jean@email.com"

    def test_short_name_rejected(self):
        """Name shorter than 2 characters should fail."""
        with pytest.raises(ValidationError):
            UserRegister(full_name="A", email="a@b.com", password="password123")

    def test_invalid_email_rejected(self):
        """Invalid email format should fail."""
        with pytest.raises(ValidationError):
            UserRegister(full_name="Test User", email="not-an-email", password="password123")

    def test_short_password_rejected(self):
        """Password shorter than 8 characters should fail."""
        with pytest.raises(ValidationError):
            UserRegister(full_name="Test User", email="test@email.com", password="short")

    def test_optional_fields(self):
        """Phone and district should be optional."""
        data = UserRegister(
            full_name="Test User",
            email="test@email.com",
            password="password123",
        )
        assert data.phone is None
        assert data.district is None

    def test_default_role_citizen(self):
        """Default role should be citizen."""
        data = UserRegister(
            full_name="Test User",
            email="test@email.com",
            password="password123",
        )
        assert data.role == "citizen"


class TestUserLoginSchema:
    """Test login input validation."""

    def test_valid_login(self):
        data = UserLogin(email="admin@recyx.rw", password="admin123")
        assert data.email == "admin@recyx.rw"

    def test_invalid_email_rejected(self):
        with pytest.raises(ValidationError):
            UserLogin(email="bad-email", password="password")


class TestReviewCreateSchema:
    """Test review submission validation."""

    def test_valid_review(self):
        data = ReviewCreate(
            reviewed_user_id=2,
            interaction_type="repair",
            interaction_id=1,
            rating=5,
            comment="Excellent service!",
        )
        assert data.rating == 5

    def test_rating_below_minimum(self):
        """Rating below 1 should fail."""
        with pytest.raises(ValidationError):
            ReviewCreate(
                reviewed_user_id=2, interaction_type="repair",
                interaction_id=1, rating=0,
            )

    def test_rating_above_maximum(self):
        """Rating above 5 should fail."""
        with pytest.raises(ValidationError):
            ReviewCreate(
                reviewed_user_id=2, interaction_type="repair",
                interaction_id=1, rating=6,
            )

    def test_rating_boundary_1(self):
        """Rating of 1 should pass."""
        data = ReviewCreate(
            reviewed_user_id=2, interaction_type="waste_transaction",
            interaction_id=1, rating=1,
        )
        assert data.rating == 1

    def test_rating_boundary_5(self):
        """Rating of 5 should pass."""
        data = ReviewCreate(
            reviewed_user_id=2, interaction_type="repair",
            interaction_id=1, rating=5,
        )
        assert data.rating == 5

    def test_comment_optional(self):
        """Comment should be optional."""
        data = ReviewCreate(
            reviewed_user_id=2, interaction_type="repair",
            interaction_id=1, rating=4,
        )
        assert data.comment is None


class TestListingCreateSchema:
    """Test listing creation validation."""

    def test_valid_listing(self):
        data = ListingCreate(
            material_type="electronics",
            quantity_kg=25.5,
            condition="repairable",
            description="Old computers",
            district="Gasabo",
        )
        assert data.quantity_kg == 25.5

    def test_zero_quantity_rejected(self):
        """Quantity must be greater than 0."""
        with pytest.raises(ValidationError):
            ListingCreate(
                material_type="plastic", quantity_kg=0,
                condition="scrap", district="Kicukiro",
            )

    def test_negative_quantity_rejected(self):
        """Negative quantity should fail."""
        with pytest.raises(ValidationError):
            ListingCreate(
                material_type="metal", quantity_kg=-10,
                condition="scrap", district="Gasabo",
            )
