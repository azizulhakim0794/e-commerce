def serialize_order_item(item):
    return {
        "id": item.id,
        "product_id": item.product_id,
        "product_name": item.product_name,
        "product_price": item.product_price,
        "product_image": item.product_image,
        "quantity": item.quantity,
        "subtotal": item.subtotal,
    }


def serialize_order(order):
    return {
        "id": order.id,
        "full_name": order.full_name,
        "phone_number": order.phone_number,
        "delivery_address": order.delivery_address,
        "city": order.city,
        "post_code": order.post_code,
        "status": order.status,
        "subtotal": order.subtotal,
        "delivery_fee": order.delivery_fee,
        "total": order.total,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
        "items": [serialize_order_item(item) for item in order.items.all()],
    }
