"""Unit tests for database models and enums."""

import pytest
from app.models.models import (
    UserRole, VerificationStatus, MaterialType, WasteCondition,
    ListingStatus, TransactionStatus, ServiceRequestStatus, InteractionType,
)


class TestUserRoleEnum:
    """Test user role definitions."""

    def test_citizen_role_exists(self):
        assert UserRole.citizen.value == "citizen"

    def test_technician_role_exists(self):
        assert UserRole.technician.value == "technician"

    def test_recycler_role_exists(self):
        assert UserRole.recycler.value == "recycler"

    def test_buyer_role_exists(self):
        assert UserRole.buyer.value == "buyer"

    def test_admin_role_exists(self):
        assert UserRole.admin.value == "admin"

    def test_total_roles_count(self):
        """There should be exactly 5 user roles."""
        assert len(UserRole) == 5


class TestVerificationStatus:
    """Test verification status workflow states."""

    def test_pending_status(self):
        assert VerificationStatus.pending.value == "pending"

    def test_approved_status(self):
        assert VerificationStatus.approved.value == "approved"

    def test_rejected_status(self):
        assert VerificationStatus.rejected.value == "rejected"

    def test_total_statuses(self):
        assert len(VerificationStatus) == 3


class TestMaterialTypeEnum:
    """Test waste material type classifications."""

    def test_electronics(self):
        assert MaterialType.electronics.value == "electronics"

    def test_plastic(self):
        assert MaterialType.plastic.value == "plastic"

    def test_metal(self):
        assert MaterialType.metal.value == "metal"

    def test_paper(self):
        assert MaterialType.paper.value == "paper"

    def test_glass(self):
        assert MaterialType.glass.value == "glass"

    def test_mixed(self):
        assert MaterialType.mixed.value == "mixed"

    def test_other(self):
        assert MaterialType.other.value == "other"

    def test_total_material_types(self):
        """Should support 7 material categories."""
        assert len(MaterialType) == 7


class TestListingStatusEnum:
    """Test listing status lifecycle including admin review."""

    def test_pending_review_exists(self):
        """Listings should start in pending_review for admin approval."""
        assert ListingStatus.pending_review.value == "pending_review"

    def test_available_after_approval(self):
        assert ListingStatus.available.value == "available"

    def test_rejected_status(self):
        """Admin can reject a listing."""
        assert ListingStatus.rejected.value == "rejected"

    def test_matched_status(self):
        assert ListingStatus.matched.value == "matched"

    def test_completed_status(self):
        assert ListingStatus.completed.value == "completed"

    def test_total_listing_statuses(self):
        """Should have 6 listing statuses including pending_review and rejected."""
        assert len(ListingStatus) == 6


class TestWasteConditionEnum:
    """Test waste condition classifications."""

    def test_functional(self):
        assert WasteCondition.functional.value == "functional"

    def test_repairable(self):
        assert WasteCondition.repairable.value == "repairable"

    def test_scrap(self):
        assert WasteCondition.scrap.value == "scrap"

    def test_total_conditions(self):
        assert len(WasteCondition) == 3


class TestServiceRequestStatus:
    """Test repair service request lifecycle."""

    def test_pending(self):
        assert ServiceRequestStatus.pending.value == "pending"

    def test_confirmed(self):
        assert ServiceRequestStatus.confirmed.value == "confirmed"

    def test_in_progress(self):
        assert ServiceRequestStatus.in_progress.value == "in_progress"

    def test_completed(self):
        assert ServiceRequestStatus.completed.value == "completed"

    def test_cancelled(self):
        assert ServiceRequestStatus.cancelled.value == "cancelled"

    def test_total_statuses(self):
        assert len(ServiceRequestStatus) == 5


class TestInteractionType:
    """Test review interaction types."""

    def test_repair_type(self):
        assert InteractionType.repair.value == "repair"

    def test_waste_transaction_type(self):
        assert InteractionType.waste_transaction.value == "waste_transaction"

    def test_total_types(self):
        assert len(InteractionType) == 2
