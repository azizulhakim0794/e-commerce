import pytest

from core.security import hash_password
from models.user import User


@pytest.mark.asyncio
async def test_login(client, db_session):
    users = [
        User(
            username="testuser1",
            email="test1@example.com",
            password_hash=hash_password("Password123"),
            profile_pic="/static/default-profile.svg",
        ),
        User(
            username="testuser2",
            email="test2@example.com",
            password_hash=hash_password("Password123"),
            profile_pic="/static/default-profile.svg",
        ),
        User(
            username="testuser3",
            email="test3@example.com",
            password_hash=hash_password("Password123"),
            profile_pic="/static/default-profile.svg",
        ),
        User(
            username="testuser",
            email="test@example.com",
            password_hash=hash_password("Password123"),
            profile_pic="/static/default-profile.svg",
        ),
    ]

    db_session.add_all(users)

    await db_session.commit()

    response = await client.post(
        "/api/v1/users/token",
        json={
            "email": "test@example.com",
            "password": "Password123",
        },
    )

    assert response.status_code == 200
    assert response.json()["message"] == "access_token saved successfully"


@pytest.mark.asyncio
async def test_logout(client):
    response = await client.post("/api/v1/users/logout")

    assert response.status_code == 200
