import pytest


@pytest.mark.asyncio
async def test_unauthenticated_user_cannot_get_users(client):
    response = await client.get("/api/v1/users")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_invalid_token_rejected(client):
    response = await client.get(
        "/api/v1/users",
        headers={"Authorization": "Bearer invalid-token"},
    )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_wrong_password_rejected(client, db_session):
    # Create test user here

    response = await client.post(
        "/api/v1/users/token",
        json={
            "email": "test@example.com",
            "password": "WrongPassword",
        },
    )

    assert response.status_code == 401
