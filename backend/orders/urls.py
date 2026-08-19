from django.urls import path

from .views import order

urlpatterns = [
    path("orders", order, name="create-order"),
]
