import pytest


@pytest.mark.asyncio
async def test_unauthenticated_user_cannot_get_users(client):
    response = await client.get("/api/v1/users")

    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"


@pytest.mark.asyncio
async def test_invalid_token_rejected(client):
    response = await client.get(
        "/api/v1/users",
        headers={"Authorization": "Bearer not-a-valid-token"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid or expired token"


@pytest.mark.asyncio
async def test_wrong_password_rejected(client, seed_user):
    await seed_user(email="wrong-password-user@example.com", password="Password123")

    response = await client.post(
        "/api/v1/users/token",
        json={
            "email": "wrong-password-user@example.com",
            "password": "WrongPassword",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"
