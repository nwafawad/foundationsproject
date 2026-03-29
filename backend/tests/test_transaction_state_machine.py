"""Unit tests for transaction state machine validation."""

import pytest
from app.services.transaction_service import VALID_TRANSITIONS
from app.models.models import TransactionStatus


class TestTransactionStateMachine:
    """Test that the state machine enforces valid transitions only."""

    def test_offer_received_can_be_accepted(self):
        """offer_received -> offer_accepted is valid."""
        allowed = VALID_TRANSITIONS[TransactionStatus.offer_received]
        assert TransactionStatus.offer_accepted in allowed

    def test_offer_received_can_be_cancelled(self):
        """offer_received -> cancelled is valid."""
        allowed = VALID_TRANSITIONS[TransactionStatus.offer_received]
        assert TransactionStatus.cancelled in allowed

    def test_offer_accepted_can_go_in_transit(self):
        """offer_accepted -> in_transit is valid."""
        allowed = VALID_TRANSITIONS[TransactionStatus.offer_accepted]
        assert TransactionStatus.in_transit in allowed

    def test_in_transit_can_complete(self):
        """in_transit -> completed is valid."""
        allowed = VALID_TRANSITIONS[TransactionStatus.in_transit]
        assert TransactionStatus.completed in allowed

    def test_in_transit_can_cancel(self):
        """in_transit -> cancelled is valid."""
        allowed = VALID_TRANSITIONS[TransactionStatus.in_transit]
        assert TransactionStatus.cancelled in allowed

    def test_completed_has_no_transitions(self):
        """completed is a terminal state — no further transitions."""
        allowed = VALID_TRANSITIONS[TransactionStatus.completed]
        assert allowed == []

    def test_cancelled_has_no_transitions(self):
        """cancelled is a terminal state — no further transitions."""
        allowed = VALID_TRANSITIONS[TransactionStatus.cancelled]
        assert allowed == []

    def test_cannot_skip_from_offer_received_to_completed(self):
        """offer_received -> completed is NOT valid (must go through in_transit)."""
        allowed = VALID_TRANSITIONS[TransactionStatus.offer_received]
        assert TransactionStatus.completed not in allowed

    def test_cannot_go_backwards_from_completed(self):
        """completed -> offer_received is NOT valid."""
        allowed = VALID_TRANSITIONS[TransactionStatus.completed]
        assert TransactionStatus.offer_received not in allowed

    def test_cannot_reopen_cancelled(self):
        """cancelled -> any state is NOT valid."""
        allowed = VALID_TRANSITIONS[TransactionStatus.cancelled]
        assert len(allowed) == 0

    def test_all_statuses_have_transition_rules(self):
        """Every TransactionStatus must have an entry in VALID_TRANSITIONS."""
        for status in TransactionStatus:
            assert status in VALID_TRANSITIONS, f"Missing transitions for {status}"


class TestTransactionStatusEnum:
    """Test that all expected statuses exist."""

    def test_all_statuses_exist(self):
        """All 5 transaction statuses should be defined."""
        expected = ["offer_received", "offer_accepted", "in_transit", "completed", "cancelled"]
        for status_name in expected:
            assert hasattr(TransactionStatus, status_name)

    def test_status_values(self):
        """Status enum values should match their names."""
        assert TransactionStatus.offer_received.value == "offer_received"
        assert TransactionStatus.completed.value == "completed"
        assert TransactionStatus.cancelled.value == "cancelled"
