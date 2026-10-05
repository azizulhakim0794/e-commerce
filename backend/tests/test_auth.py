import pytest


@pytest.mark.asyncio
async def test_login_success_for_existing_user(client, seed_user):
    await seed_user(email="login-success@example.com", password="Password123")

    response = await client.post(
        "/api/v1/users/token",
        json={
            "email": "login-success@example.com",
            "password": "Password123",
        },
    )

    assert response.status_code == 200
    assert response.json()["message"] == "access_token saved successfully"


@pytest.mark.asyncio
async def test_login_fails_for_unknown_user(client):
    response = await client.post(
        "/api/v1/users/token",
        json={
            "email": "missinguser@example.com",
            "password": "Password123",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


@pytest.mark.asyncio
async def test_logout_clears_auth_cookie(client, seed_user):
    await seed_user(email="logout-user@example.com", password="Password123")

    login_response = await client.post(
        "/api/v1/users/token",
        json={
            "email": "logout-user@example.com",
            "password": "Password123",
        },
    )
    assert login_response.status_code == 200

    response = await client.post("/api/v1/users/logout")

    assert response.status_code == 200
    assert response.json()["message"] == "Logged out successfully"
