import pytest

from core.security import hash_password
from models.user import User


@pytest.mark.asyncio
async def test_get_users(client, db_session):

    db_session.add(
        User(
            username="testuser",
            email="admin@example.com",
            password_hash=hash_password("Password123"),
            profile_pic="/static/default-profile.svg",
        )
    )
    await db_session.commit()

    response = await client.post(
        "/api/v1/users/token",
        json={
            "email": "admin@example.com",
            "password": "Password123",
        },
    )

    assert response.status_code == 200

    response = await client.get("/api/v1/users")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 4

    for user in data:
        assert user["is_admin"] is False
