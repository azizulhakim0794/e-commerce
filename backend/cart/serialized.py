def serialize_cart_item(cart_item) -> dict:
    return {
        "id": cart_item.id,
        "product": {
            "id": cart_item.product.id,
            "name": cart_item.product.name,
            "price": cart_item.product.price,
            "image": cart_item.product.image,
        },
        "quantity": cart_item.quantity,
        "added_at": cart_item.added_at,
        "updated_at": cart_item.updated_at,
    }


def serialize_cart(cart) -> dict:
    return {
        "id": cart.id,
        "user": cart.user.id,
        "items": [serialize_cart_item(item) for item in cart.items.all()],
        "created_at": cart.created_at,
        "updated_at": cart.updated_at,
    }
