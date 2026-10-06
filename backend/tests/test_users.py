import pytest

from core.security import hash_password
from models.user import User


@pytest.mark.asyncio
async def test_get_users(client, db_session):
    admin = User(
        username="adminuser",
        email="admin@example.com",
        password_hash=hash_password("Password123"),
        profile_pic="/static/default-profile.svg",
        is_admin=True,
    )
    other_user = User(
        username="regularuser",
        email="regular@example.com",
        password_hash=hash_password("Password123"),
        profile_pic="/static/default-profile.svg",
    )

    db_session.add_all([admin, other_user])
    await db_session.commit()

    login_response = await client.post(
        "/api/v1/users/token",
        json={
            "email": "admin@example.com",
            "password": "Password123",
        },
    )

    assert login_response.status_code == 200

    response = await client.get("/api/v1/users")

    assert response.status_code == 200

    data = response.json()
    assert len(data) == 1
    assert data[0]["email"] == "regular@example.com"
    assert data[0]["is_admin"] is False
