import pytest

from core.security import hash_password
from models.user import User


@pytest.mark.asyncio
async def test_login(client, db_session):
    db_session.add(
        User(
            username="testuser",
            email="test@example.com",
            password_hash=hash_password("Password123"),
            profile_pic="/static/default-profile.svg",
        )
    )
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
