from django.shortcuts import render
from django.db import transaction
from decimal import Decimal
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

# from cart.models import Cart, CartItem
# from products.models import Product

from cart.models import Cart
from .models import Order, OrderItem

# # Create your views here.
# @api_view(["POST"])
# @authentication_classes([SessionAuthentication])
# @permission_classes([IsAuthenticated])
# def save_orderd_product(request):

#     cart_id = request.data.get(cart_id)
#     product_id = request.data.get(product_id)
#     quantity = request.data.get(quantity)
#     full_name = request.data.get(full_name)
#     phone_number = request.data.get(phone_number)
#     delivery_address = request.data.get(delivery_address)
#     city = request.data.get(city)
#     post_code = request.data.get(post_code)

#     if not product_id:
#         return Response(
#             {"error": "product_id is required"}, status=status.HTTP_404_NOT_FOUND
#         )

#     product = Product.objects.get(id=product_id)
#     cart = Cart.objects.filter(user=request.user).first()
#     cart_item = CartItem.objects.filter(cart=cart, product_id=product_id).first()

#     if not product:
#         return Response(
#             {"error": "product not found"}, status=status.HTTP_404_NOT_FOUND
#         )

#     if cart_id and CartItem.objects.get(id=cart_id):
#         cart_item.delete()


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_order(request):

    full_name = request.data.get("full_name")
    phone_number = request.data.get("phone_number")
    delivery_address = request.data.get("delivery_address")
    city = request.data.get("city")
    post_code = request.data.get("post_code")

    # -------------------------
    # Validate shipping details
    # -------------------------

    if not full_name:
        return Response(
            {"detail": "Full name is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not phone_number:
        return Response(
            {"detail": "Phone number is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not delivery_address:
        return Response(
            {"detail": "Delivery address is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not city:
        return Response(
            {"detail": "City is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not post_code:
        return Response(
            {"detail": "Post code is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # -------------------------
    # Start transaction
    # -------------------------

    with transaction.atomic():

        try:
            cart = Cart.objects.get(user=request.user)

        except Cart.DoesNotExist:
            return Response(
                {"detail": "Cart not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Lock cart items/products during checkout
        cart_items = cart.items.select_related("product").select_for_update()

        cart_items = list(cart_items)

        if not cart_items:
            return Response(
                {"detail": "Your cart is empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------
        # Validate stock
        # -------------------------

        for cart_item in cart_items:

            if cart_item.quantity > cart_item.product.stock:
                return Response(
                    {"detail": (f"Not enough stock for " f"{cart_item.product.name}.")},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # -------------------------
        # Calculate order totals
        # -------------------------

        subtotal = Decimal("0.00")

        for cart_item in cart_items:

            item_subtotal = cart_item.product.price * cart_item.quantity

            subtotal += item_subtotal

        # Example delivery fee
        delivery_fee = Decimal("0.00")

        total = subtotal + delivery_fee

        # -------------------------
        # Create Order
        # -------------------------

        order = Order.objects.create(
            user=request.user,
            full_name=full_name,
            phone_number=phone_number,
            delivery_address=delivery_address,
            city=city,
            post_code=post_code,
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total=total,
            status=Order.Status.PENDING,
        )

        # -------------------------
        # Create OrderItems
        # -------------------------

        order_items = []

        for cart_item in cart_items:

            product = cart_item.product

            item_subtotal = product.price * cart_item.quantity

            order_items.append(
                OrderItem(
                    order=order,
                    product=product,
                    # Snapshot
                    product_name=product.name,
                    product_price=product.price,
                    product_image=product.image,
                    quantity=cart_item.quantity,
                    subtotal=item_subtotal,
                )
            )

            # Decrease stock
            product.stock -= cart_item.quantity
            product.save(update_fields=["stock"])

        OrderItem.objects.bulk_create(order_items)

        # -------------------------
        # Clear cart
        # -------------------------

        cart.items.all().delete()

    # -------------------------
    # Return response
    # -------------------------

    return Response(
        {
            "message": "Order created successfully.",
            "order": {
                "id": order.id,
                "status": order.status,
                "full_name": order.full_name,
                "phone_number": order.phone_number,
                "delivery_address": order.delivery_address,
                "city": order.city,
                "post_code": order.post_code,
                "subtotal": order.subtotal,
                "delivery_fee": order.delivery_fee,
                "total": order.total,
                "items": [
                    {
                        "id": item.id,
                        "product_id": item.product_id,
                        "product_name": item.product_name,
                        "product_price": item.product_price,
                        "product_image": item.product_image,
                        "quantity": item.quantity,
                        "subtotal": item.subtotal,
                    }
                    for item in order.items.all()
                ],
            },
        },
        status=status.HTTP_201_CREATED,
    )
