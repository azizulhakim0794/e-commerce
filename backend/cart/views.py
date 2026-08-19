from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from products.models import Product
from cart.models import Cart, CartItem
from cart.serialized import serialize_cart

# @api_view(["POST"])
# @authentication_classes([SessionAuthentication])
# @permission_classes([IsAuthenticated])
# def save_product_into_cart(request):
#     product_id = request.data.get("product_id")
#     quantity = request.data.get("quantity", 1)

#     # Validate product_id
#     if not product_id:
#         return Response(
#             {"error": "Product ID is required"},
#             status=status.HTTP_400_BAD_REQUEST,
#         )

#     # Validate quantity
#     if quantity < 1:
#         return Response(
#             {"error": "Quantity must be at least 1"},
#             status=status.HTTP_400_BAD_REQUEST,
#         )

#     # Find product
#     try:
#         product = Product.objects.get(id=product_id)
#     except Product.DoesNotExist:
#         return Response(
#             {"error": "Product not found"},
#             status=status.HTTP_404_NOT_FOUND,
#         )

#     # Check stock
#     if quantity > product.stock:
#         return Response(
#             {"error": "Requested quantity is greater than available stock"},
#             status=status.HTTP_400_BAD_REQUEST,
#         )

#     # Get or create cart for logged-in user
#     cart, created = Cart.objects.get_or_create(user=request.user)

#     # Get or create cart item
#     cart_item, created = CartItem.objects.get_or_create(
#         cart=cart,
#         product=product,
#         defaults={"quantity": quantity},
#     )

#     # If product already exists in cart, increase quantity
#     if not created:
#         new_quantity = cart_item.quantity + quantity

#         if new_quantity > product.stock:
#             return Response(
#                 {"error": "Requested quantity is greater than available stock"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         cart_item.quantity = new_quantity
#         cart_item.save()

#     return Response(
#         {
#             "message": "Product successfully added to cart",
#             "cart": serialize_cart(cart),
#         },
#         status=status.HTTP_201_CREATED,
#     )


# @api_view(["GET"])
# @authentication_classes([SessionAuthentication])
# @permission_classes([IsAuthenticated])
# def get_cart_products_by_user(request):
#     # Get the logged-in user's cart
#     cart = Cart.objects.filter(user=request.user).first()

#     # User doesn't have a cart yet
#     if not cart:
#         return Response(
#             {
#                 "cart": None,
#                 "message": "Cart is empty",
#             },
#             status=status.HTTP_200_OK,
#         )

#     return Response(
#         {
#             "cart": serialize_cart(cart),
#         },
#         status=status.HTTP_200_OK,
#     )


@api_view(["GET", "POST", "DELETE"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def cart(request, product_id=None):

    # =========================
    # GET /api/cart
    # =========================

    if request.method == "GET":

        cart = Cart.objects.filter(user=request.user).first()

        if not cart:
            return Response(
                {
                    "cart": None,
                    "message": "Cart is empty",
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "cart": serialize_cart(cart),
            },
            status=status.HTTP_200_OK,
        )

    # =========================
    # POST /api/cart
    # =========================

    if request.method == "POST":
        product_id = request.data.get("product_id")
        quantity = request.data.get("quantity", 1)

        # Validate product_id
        if not product_id:
            return Response(
                {"error": "Product ID is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate quantity
        if quantity < 1:
            return Response(
                {"error": "Quantity must be at least 1"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Find product
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check stock
        if quantity > product.stock:
            return Response(
                {"error": "Requested quantity is greater than available stock"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get or create cart for logged-in user
        cart, created = Cart.objects.get_or_create(user=request.user)

        # Get or create cart item
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": quantity},
        )

        # If product already exists in cart, increase quantity
        if not created:
            new_quantity = cart_item.quantity + quantity

            if new_quantity > product.stock:
                return Response(
                    {"error": "Requested quantity is greater than available stock"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            cart_item.quantity = new_quantity
            cart_item.save()

        return Response(
            {
                "message": "Product successfully added to cart",
                "cart": serialize_cart(cart),
            },
            status=status.HTTP_201_CREATED,
        )

    # =========================
    # DELETE /api/cart/<int:product_id>
    # =========================

    if request.method == "DELETE":

        # product_id = product_id

        if not product_id:
            return Response(
                {"error": "product id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        cart = Cart.objects.filter(user=request.user).first()

        if not cart:
            return Response(
                {"error": "Cart not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        cart_item = CartItem.objects.filter(cart=cart, product_id=product_id).first()

        if not cart_item:
            return Response(
                {"error": "Product is not in your cart"},
                status=status.HTTP_404_NOT_FOUND,
            )

        cart_item.delete()

        return Response(
            {
                "message": "Product removed from cart",
                "cart": serialize_cart(cart),
            },
            status=status.HTTP_200_OK,
        )
