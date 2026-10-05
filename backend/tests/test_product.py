# import pytest
# from models.product import Product
# from sqlalchemy import select


# @pytest.fixture
# @pytest.mark.asyncio
# async def test_create_product(client, db_session):

#     products = [
#         {
#             "name": "AeroFlex Headphones",
#             "description": "Immersive wireless audio with adaptive noise cancellation.",
#             "price": 129,
#             "original_price": 169,
#             "image": "https://example.com/headphones.jpg",
#             "category": "Electronics",
#             "rating": 4.8,
#             "reviews": 238,
#             "stock": 18,
#             "badge": "Best seller",
#             "specs": [
#                 "40-hour battery",
#                 "Adaptive ANC",
#                 "Multipoint Bluetooth",
#             ],
#         },
#         {
#             "name": "UltraBass Speaker",
#             "description": "Portable Bluetooth speaker with powerful bass.",
#             "price": 89,
#             "original_price": 119,
#             "image": "https://example.com/speaker.jpg",
#             "category": "Electronics",
#             "rating": 4.6,
#             "reviews": 152,
#             "stock": 25,
#             "badge": "Popular",
#             "specs": [
#                 "20-hour battery",
#                 "Water resistant",
#                 "Bluetooth 5.3",
#             ],
#         },
#         {
#             "name": "Mechanical Keyboard",
#             "description": "RGB mechanical keyboard for gaming and productivity.",
#             "price": 99,
#             "original_price": 129,
#             "image": "https://example.com/keyboard.jpg",
#             "category": "Electronics",
#             "rating": 4.7,
#             "reviews": 184,
#             "stock": 12,
#             "badge": "New",
#             "specs": [
#                 "Mechanical switches",
#                 "RGB lighting",
#                 "USB-C",
#             ],
#         },
#     ]

#     for product_data in products:
#         response = await client.post(
#             "/api/v1/products",
#             json=product_data,
#         )

#         assert response.status_code == 200

#     for product_data in products:
#         result = await db_session.execute(
#             select(Product).where(Product.name == product_data["name"])
#         )

#         product = result.scalar_one_or_none()

#         assert product is not None
#         assert product.name == product_data["name"]
#         assert product.stock == product_data["stock"]
#         print(product.id)
