from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import User


def serialize_user(user) -> dict:
    return {
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
    }


def authenticate_user(identifier: str, password: str):
    user = User.objects.filter(email__iexact=identifier).first()

    if user is not None:
        return authenticate(username=user.username, password=password)

    return authenticate(username=identifier, password=password)


@api_view(["POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get("username", "").strip()
    email = request.data.get("email", "").strip()
    password = request.data.get("password")
    confirmation = request.data.get("confirmation")

    if not all([username, email, password, confirmation]):
        return Response(
            {"error": "Username, email, password, and confirmation are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if password != confirmation:
        return Response(
            {"error": "Passwords do not match."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username__iexact=username).exists():
        return Response(
            {"error": "A user with this username already exists."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(email__iexact=email).exists():
        return Response(
            {"error": "A user with this email already exists."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(username=username, email=email, password=password)
    login(request, user)

    return Response(
        {
            "message": "Registration successful.",
            "user": serialize_user(user),
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
def login_view(request):
    identifier = request.data.get("username", "").strip()
    password = request.data.get("password")

    if not identifier or not password:
        return Response(
            {"error": "Email/username and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate_user(identifier, password)

    if user is None:
        return Response(
            {"error": "Invalid credentials."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    login(request, user)

    return Response(
        {
            "message": "Login successful.",
            "user": serialize_user(user),
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
def logout_view(request):
    logout(request)

    return Response({"message": "Logout successful."}, status=status.HTTP_200_OK)


@api_view(["GET"])
@ensure_csrf_cookie
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
def me(request):
    user = request.user

    if not user.is_authenticated:
        return Response(
            {
                "authenticated": False,
                "user": None,
            },
            status=status.HTTP_200_OK,
        )

    return Response(
        {
            "authenticated": True,
            "user": serialize_user(user),
        },
        status=status.HTTP_200_OK,
    )
