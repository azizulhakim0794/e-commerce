from django.urls import path
from . import views

urlpatterns = [
    path("cart", views.save_product_into_cart, name="save_product_into_cart"),
    path("cart", views.get_cart_products_by_user, name="get_carts_prodcts_by_user_id"),
]
