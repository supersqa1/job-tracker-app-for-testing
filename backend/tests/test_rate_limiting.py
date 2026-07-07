from fastapi import Response
from fastapi.testclient import TestClient

from app.main import app
from app.services.rate_limit import check_rate_limit, clear_rate_limits
from tests.helpers import assert_error


def test_rate_limit_demo_returns_headers_before_limit_is_exceeded():
    clear_rate_limits()
    with TestClient(app) as client:
        response = client.get("/api/v1/public/rate-limit-demo")

    assert response.status_code == 200
    assert response.json() == {
        "message": "Rate limit demo request accepted",
        "purpose": "Call this endpoint repeatedly to practice testing 429 Too Many Requests.",
        "limit": "2 requests per minute from the same client",
    }
    assert response.headers["X-RateLimit-Limit"] == "2"
    assert response.headers["X-RateLimit-Remaining"] == "1"
    assert int(response.headers["X-RateLimit-Reset"]) > 0


def test_rate_limit_demo_returns_429_after_limit_is_exceeded():
    clear_rate_limits()
    with TestClient(app) as client:
        first_response = client.get("/api/v1/public/rate-limit-demo")
        second_response = client.get("/api/v1/public/rate-limit-demo")
        third_response = client.get("/api/v1/public/rate-limit-demo")

    assert first_response.status_code == 200
    assert second_response.status_code == 200
    assert second_response.headers["X-RateLimit-Remaining"] == "0"
    assert third_response.status_code == 429
    assert_error(third_response, code="RATE_LIMITED", message="Rate limit exceeded")
    assert third_response.headers["X-RateLimit-Limit"] == "2"
    assert third_response.headers["X-RateLimit-Remaining"] == "0"
    assert int(third_response.headers["Retry-After"]) > 0


def test_disabled_rate_limit_does_not_add_headers(mock_request):
    response = Response()

    check_rate_limit(
        request=mock_request,
        response=response,
        bucket_name="disabled-test",
        limit=1,
        enabled=False,
    )

    assert "X-RateLimit-Limit" not in response.headers
