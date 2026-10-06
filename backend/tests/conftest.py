from collections.abc import AsyncIterator
from uuid import uuid4

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from core.security import hash_password
from db.database import Base, get_db
from main import app
from models.product import Product
from models.user import User


@pytest_asyncio.fixture(scope="session")
async def test_db_engine():
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(test_db_engine) -> AsyncIterator[AsyncSession]:
    session_factory = async_sessionmaker(
        bind=test_db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with session_factory() as session:
        for table in reversed(Base.metadata.sorted_tables):
            await session.execute(table.delete())
        await session.commit()
        yield session


@pytest_asyncio.fixture
async def client(db_session):
    async def override_get_db() -> AsyncIterator[AsyncSession]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)

    try:
        async with AsyncClient(
            transport=transport,
            base_url="http://test",
        ) as async_client:
            yield async_client
    finally:
        app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_products(client, db_session):
    products = [
        {
            "name": "AeroFlex Headphones",
            "description": "Immersive wireless audio with adaptive noise cancellation.",
            "price": 129,
            "original_price": 169,
            "image": "https://example.com/headphones.jpg",
            "category": "Electronics",
            "rating": 4.8,
            "reviews": 238,
            "stock": 18,
            "badge": "Best seller",
            "specs": [
                "40-hour battery",
                "Adaptive ANC",
                "Multipoint Bluetooth",
            ],
        },
        {
            "name": "UltraBass Speaker",
            "description": "Portable Bluetooth speaker with powerful bass.",
            "price": 89,
            "original_price": 119,
            "image": "https://example.com/speaker.jpg",
            "category": "Electronics",
            "rating": 4.6,
            "reviews": 152,
            "stock": 25,
            "badge": "Popular",
            "specs": [
                "20-hour battery",
                "Water resistant",
                "Bluetooth 5.3",
            ],
        },
    ]

    created_products = []

    for product_data in products:
        response = await client.post(
            "/api/v1/products",
            json=product_data,
        )

        assert response.status_code == 200

        result = await db_session.execute(
            select(Product).where(Product.name == product_data["name"])
        )

        product = result.scalar_one_or_none()

        assert product is not None
        assert product.name == product_data["name"]
        assert product.stock == product_data["stock"]

        created_products.append(product)

    return created_products


@pytest_asyncio.fixture
async def seed_user(db_session):
    async def _seed_user(
        *,
        username: str = "testuser",
        email: str | None = None,
        password: str = "Password123",
    ) -> User:
        resolved_email = email or f"{uuid4().hex}@example.com"
        user = User(
            username=username,
            email=resolved_email,
            password_hash=hash_password(password),
            profile_pic="/static/default-profile.svg",
            is_admin=True,
        )
        db_session.add(user)
        await db_session.commit()
        return user

    return _seed_user


@pytest_asyncio.fixture
async def authenticated_client(client, seed_user):
    email = "admin@example.com"
    await seed_user(email=email, password="Password123")

    response = await client.post(
        "/api/v1/users/token",
        json={
            "email": email,
            "password": "Password123",
        },
    )

    assert response.status_code == 200
    assert response.json()["message"] == "access_token saved successfully"

    return client


@pytest_asyncio.fixture
async def test_address(authenticated_client):
    create_response = await authenticated_client.post(
        "/api/v1/address",
        json={
            "full_name": "Test User",
            "phone_number": "01712345678",
            "address_type": "home",
            "address_line_1": "123 Test Street",
            "address_line_2": "Apartment 4B",
            "city": "Dhaka",
            "state_or_division": "Dhaka",
            "postal_code": "1207",
            "country": "Bangladesh",
        },
    )

    assert create_response.status_code == 200

    data = create_response.json()

    assert data["full_name"] == "Test User"
    assert data["phone_number"] == "01712345678"
    assert data["city"] == "Dhaka"
    assert data["country"] == "Bangladesh"
