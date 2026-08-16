from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken

from .authentication import CookieJWTAuthentication
from .models import User
from .tokens import (
    REFRESH_COOKIE,
    build_auth_payload,
    clear_auth_cookies,
    issue_tokens_for_user,
    serialize_user,
    set_auth_cookies,
)


def authenticate_user(identifier: str, password: str):
    user = User.objects.filter(email__iexact=identifier).first()

    if user is not None:
        return authenticate(username=user.username, password=password)

    return authenticate(username=identifier, password=password)


@api_view(["POST"])
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
    access_token, refresh_token = issue_tokens_for_user(user)

    response = Response(
        build_auth_payload(user, access_token, refresh_token, "Registration successful."),
        status=status.HTTP_201_CREATED,
    )

    return set_auth_cookies(response, access_token, refresh_token)


@api_view(["POST"])
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

    access_token, refresh_token = issue_tokens_for_user(user)

    response = Response(
        build_auth_payload(user, access_token, refresh_token, "Login successful."),
        status=status.HTTP_200_OK,
    )

    return set_auth_cookies(response, access_token, refresh_token)


@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_view(request):
    refresh_token = request.COOKIES.get(REFRESH_COOKIE) or request.data.get("refresh")

    if not refresh_token:
        return Response(
            {"error": "Refresh token is required."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    try:
        refresh = RefreshToken(refresh_token)
        access_token = str(refresh.access_token)
        next_refresh_token = refresh_token

        if api_settings.ROTATE_REFRESH_TOKENS:
            if api_settings.BLACKLIST_AFTER_ROTATION:
                refresh.blacklist()
            refresh.set_jti()
            refresh.set_exp()
            next_refresh_token = str(refresh)
    except TokenError:
        response = Response(
            {"error": "Invalid or expired refresh token."},
            status=status.HTTP_401_UNAUTHORIZED,
        )
        return clear_auth_cookies(response)

    response = Response(
        {
            "message": "Token refreshed.",
            "access": access_token,
            "refresh": next_refresh_token,
        },
        status=status.HTTP_200_OK,
    )
    return set_auth_cookies(response, access_token, next_refresh_token)


@api_view(["POST"])
@permission_classes([AllowAny])
def logout_view(request):
    refresh_token = request.COOKIES.get(REFRESH_COOKIE) or request.data.get("refresh")

    if refresh_token:
        try:
            RefreshToken(refresh_token).blacklist()
        except (TokenError, InvalidToken, AttributeError):
            pass

    response = Response({"message": "Logout successful."}, status=status.HTTP_200_OK)
    return clear_auth_cookies(response)


@api_view(["GET"])
@authentication_classes([CookieJWTAuthentication])
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
