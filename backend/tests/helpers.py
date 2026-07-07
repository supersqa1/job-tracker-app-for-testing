from fastapi.testclient import TestClient


def login_token(client: TestClient, email: str, password: str) -> str:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def assert_error(response, *, code: str, message: str) -> None:
    body = response.json()
    assert body["error"]["code"] == code
    assert body["error"]["message"] == message
    assert isinstance(body["error"]["details"], list)
