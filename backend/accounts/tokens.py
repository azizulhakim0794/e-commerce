from django.conf import settings
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

ACCESS_COOKIE = "access_token"
REFRESH_COOKIE = "refresh_token"


def get_cookie_options(max_age: int) -> dict:
    return {
        "max_age": max_age,
        "httponly": True,
        "secure": not settings.DEBUG,
        "samesite": "Lax",
        "path": "/",
    }


def issue_tokens_for_user(user) -> tuple[str, str]:
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token), str(refresh)


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> Response:
    jwt_settings = settings.SIMPLE_JWT

    response.set_cookie(
        ACCESS_COOKIE,
        access_token,
        **get_cookie_options(int(jwt_settings["ACCESS_TOKEN_LIFETIME"].total_seconds())),
    )
    response.set_cookie(
        REFRESH_COOKIE,
        refresh_token,
        **get_cookie_options(int(jwt_settings["REFRESH_TOKEN_LIFETIME"].total_seconds())),
    )

    return response


def clear_auth_cookies(response: Response) -> Response:
    response.delete_cookie(ACCESS_COOKIE, path="/")
    response.delete_cookie(REFRESH_COOKIE, path="/")
    return response


def serialize_user(user) -> dict:
    return {
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
    }


def build_auth_payload(user, access_token: str, refresh_token: str, message: str) -> dict:
    return {
        "message": message,
        "user": serialize_user(user),
        "access": access_token,
        "refresh": refresh_token,
    }
