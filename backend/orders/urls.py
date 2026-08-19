from django.urls import path

from .views import order, create_one_order

urlpatterns = [
    path("orders", order, name="create-order"),
    path("ordersone", create_one_order, name="create-one-order"),
]
