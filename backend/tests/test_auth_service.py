"""Unit tests for authentication service."""

import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta


class TestPasswordHashing:
    """Test bcrypt password hashing and verification."""

    def test_hash_password_returns_hash(self):
        """Password hashing should return a bcrypt hash string."""
        from app.middleware.auth import hash_password
        result = hash_password("securePassword123")
        assert result is not None
        assert result != "securePassword123"
        assert result.startswith("$2b$")

    def test_hash_password_different_each_time(self):
        """Same password should produce different hashes (salt)."""
        from app.middleware.auth import hash_password
        hash1 = hash_password("samePassword")
        hash2 = hash_password("samePassword")
        assert hash1 != hash2

    def test_verify_password_correct(self):
        """Correct password should verify successfully."""
        from app.middleware.auth import hash_password, verify_password
        hashed = hash_password("myPassword123")
        assert verify_password("myPassword123", hashed) is True

    def test_verify_password_incorrect(self):
        """Wrong password should fail verification."""
        from app.middleware.auth import hash_password, verify_password
        hashed = hash_password("myPassword123")
        assert verify_password("wrongPassword", hashed) is False

    def test_verify_password_empty_string(self):
        """Empty string should not match any hash."""
        from app.middleware.auth import hash_password, verify_password
        hashed = hash_password("realPassword")
        assert verify_password("", hashed) is False


class TestJWTTokens:
    """Test JWT token creation and decoding."""

    def test_create_access_token(self):
        """Access token should be created with user data."""
        from app.middleware.auth import create_access_token
        token = create_access_token({"sub": "1", "role": "citizen"})
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 50

    def test_create_refresh_token(self):
        """Refresh token should be created."""
        from app.middleware.auth import create_refresh_token
        token = create_refresh_token({"sub": "1", "role": "admin"})
        assert token is not None
        assert isinstance(token, str)

    def test_decode_valid_token(self):
        """Valid token should decode correctly."""
        from app.middleware.auth import create_access_token, decode_token
        token = create_access_token({"sub": "42", "role": "technician"})
        payload = decode_token(token)
        assert payload["sub"] == "42"
        assert payload["role"] == "technician"
        assert payload["type"] == "access"

    def test_decode_token_contains_expiry(self):
        """Decoded token should contain expiration timestamp."""
        from app.middleware.auth import create_access_token, decode_token
        token = create_access_token({"sub": "1", "role": "citizen"})
        payload = decode_token(token)
        assert "exp" in payload

    def test_decode_invalid_token_raises(self):
        """Invalid token should raise HTTPException."""
        from app.middleware.auth import decode_token
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            decode_token("invalid.token.string")
        assert exc_info.value.status_code == 401

    def test_access_token_type(self):
        """Access token should have type='access'."""
        from app.middleware.auth import create_access_token, decode_token
        token = create_access_token({"sub": "1", "role": "citizen"})
        payload = decode_token(token)
        assert payload["type"] == "access"

    def test_refresh_token_type(self):
        """Refresh token should have type='refresh'."""
        from app.middleware.auth import create_refresh_token, decode_token
        token = create_refresh_token({"sub": "1", "role": "citizen"})
        payload = decode_token(token)
        assert payload["type"] == "refresh"
