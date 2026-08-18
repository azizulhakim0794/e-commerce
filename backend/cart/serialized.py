from decimal import Decimal


def serialize_cart_item(item):
    subtotal = item.product.price * item.quantity

    return {
        "id": item.id,
        "product": {
            "id": item.product.id,
            "name": item.product.name,
            "price": item.product.price,
            "image": item.product.image,
        },
        "quantity": item.quantity,
        "subtotal": subtotal,
    }


def serialize_cart(cart):
    items = cart.items.select_related("product").all()

    return {
        "items": [serialize_cart_item(item) for item in items],
        "item_count": items.count(),
        "total_quantity": sum(item.quantity for item in items),
        "subtotal": sum(item.product.price * item.quantity for item in items),
    }
