from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from uuid import uuid4

import jwt
import pytest
from fastapi import HTTPException, status

from app.api.v1.auth import _get_client_ip
from app.api.v1.media import _validate_image_signature, _validate_image_size
from app.config import get_jwt_secret_key, settings
from app.services.auth_service import (
    create_access_token,
    create_refresh_token,
    verify_access_token,
    verify_refresh_token,
)


def test_access_token_includes_and_requires_token_version() -> None:
    user_id = uuid4()
    token = create_access_token(user_id, token_version=3)

    token_data = verify_access_token(token)

    assert token_data == {"user_id": str(user_id), "token_version": 3}

    legacy_payload = {
        "sub": str(user_id),
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
        "iat": datetime.now(timezone.utc),
    }
    legacy_token = jwt.encode(
        legacy_payload,
        get_jwt_secret_key(),
        algorithm=settings.JWT_ALGORITHM,
    )

    assert verify_access_token(legacy_token) is None


def test_refresh_token_requires_integer_token_version() -> None:
    user_id = uuid4()
    valid_token = create_refresh_token(user_id, token_version=2)

    assert verify_refresh_token(valid_token) == {
        "user_id": str(user_id),
        "token_version": 2,
    }

    invalid_payload = {
        "sub": str(user_id),
        "type": "refresh",
        "token_version": "2",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
        "iat": datetime.now(timezone.utc),
    }
    invalid_token = jwt.encode(
        invalid_payload,
        get_jwt_secret_key(),
        algorithm=settings.JWT_ALGORITHM,
    )

    assert verify_refresh_token(invalid_token) is None


def test_get_client_ip_only_trusts_forwarded_headers_from_trusted_proxy(monkeypatch) -> None:
    monkeypatch.setattr(settings, "TRUSTED_PROXY_CIDRS", "10.0.0.0/8")

    spoofed_request = SimpleNamespace(
        headers={"x-forwarded-for": "198.51.100.7"},
        client=SimpleNamespace(host="203.0.113.10"),
    )
    trusted_proxy_request = SimpleNamespace(
        headers={"x-forwarded-for": "198.51.100.7, 10.0.0.5"},
        client=SimpleNamespace(host="10.0.0.5"),
    )

    assert _get_client_ip(spoofed_request) == "203.0.113.10"
    assert _get_client_ip(trusted_proxy_request) == "198.51.100.7"


def test_image_size_limit_rejects_large_payload(monkeypatch) -> None:
    monkeypatch.setattr(settings, "MAX_IMAGE_UPLOAD_BYTES", 3)

    with pytest.raises(HTTPException) as exc_info:
        _validate_image_size(4)

    assert exc_info.value.status_code == status.HTTP_413_REQUEST_ENTITY_TOO_LARGE


def test_image_signature_must_match_declared_type() -> None:
    _validate_image_signature(b"\x89PNG\r\n\x1a\nsample", "image/png")

    with pytest.raises(HTTPException) as exc_info:
        _validate_image_signature(b"\x89PNG\r\n\x1a\nsample", "image/jpeg")

    assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
