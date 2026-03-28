import asyncio
from urllib.parse import parse_qs, urlparse

from app.api.v1.auth import (
    _consume_oauth_state,
    _build_pkce_pair,
    _get_oauth_redirect_uri,
    _oauth_states,
    _render_mobile_oauth_bridge_page,
    _store_oauth_state,
    google_auth_start,
)
from app.config import settings


def test_get_oauth_redirect_uri_uses_backend_public_url_for_mobile(monkeypatch) -> None:
    monkeypatch.setattr(settings, "FRONTEND_URL", "https://app.cineentry.com/")
    monkeypatch.setattr(settings, "BACKEND_PUBLIC_URL", "https://api.cineentry.com/")

    assert (
        _get_oauth_redirect_uri("google", "mobile")
        == "https://api.cineentry.com/api/v1/auth/google/mobile/callback"
    )
    assert (
        _get_oauth_redirect_uri("google", "web")
        == "https://app.cineentry.com/auth/google/callback"
    )


def test_consume_oauth_state_returns_redirect_client_and_pops_state() -> None:
    _oauth_states.clear()
    _store_oauth_state("state-123", "google", "mobile", code_verifier="verifier-123")

    assert _consume_oauth_state("state-123", "google") == ("mobile", "verifier-123")
    assert "state-123" not in _oauth_states


def test_render_mobile_oauth_bridge_page_contains_app_callback_url() -> None:
    response = _render_mobile_oauth_bridge_page(
        "kakao",
        code="sample-code",
        state="sample-state",
    )

    body = response.body.decode("utf-8")

    assert "cineentry://auth/kakao/callback?code=sample-code&state=sample-state" in body
    assert "앱으로 돌아가기" in body
    assert "앱으로 돌아갑니다" in body
    assert "Kakao" in body
    assert "앱 복귀" in body


def test_build_pkce_pair_returns_s256_compatible_values() -> None:
    verifier, challenge = _build_pkce_pair()

    assert verifier
    assert challenge
    assert "=" not in challenge


def test_google_auth_start_includes_pkce_parameters() -> None:
    _oauth_states.clear()
    original_client_id = settings.GOOGLE_CLIENT_ID

    try:
        settings.GOOGLE_CLIENT_ID = "google-client-id"
        response = asyncio.run(google_auth_start("web"))
    finally:
        settings.GOOGLE_CLIENT_ID = original_client_id

    parsed = urlparse(response.data.url)
    query = parse_qs(parsed.query)
    state = response.data.state

    assert query["code_challenge_method"] == ["S256"]
    assert len(query["code_challenge"][0]) >= 43
    assert state in _oauth_states
    assert _oauth_states[state]["code_verifier"]
