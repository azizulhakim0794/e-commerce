from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import Product


def serialize_product(product) -> dict:
    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "stock": product.stock,
        "image": product.image,
    }


# Create your views here.
@api_view(["GET"])
def get_product(request):
    products = Product.objects.all()

    product_list = [serialize_product(product) for product in products]

    return Response({"products": product_list}, status=status.HTTP_200_OK)
