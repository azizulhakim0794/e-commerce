import json
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_protect
from .models import User
from rest_framework_simplejwt.tokens import RefreshToken


# Create your views here.
@require_POST
@csrf_protect
def register(request):
    try:
        data = json.load(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid Json"}, status=400)

    username = data.get("username")
    password = data.get("password")
    confirmation = data.get("confirmation")

    if not username or not password or not confirmation:
        return JsonResponse(
            {"error": "Username and passworrd and confirmation password is required"},
            status=400,
        )

    if password != confirmation:
        return JsonResponse({"error": "Passwords do not match"})

    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "User already exist"}, status=400)

    user = User.objects.create_user(username=username, password=password)

    login(request, user)

    # JWT tokens
    refresh = RefreshToken.for_user(user)

    return JsonResponse(
        {
            "message": "Registrations successfully done ",
            "user": user,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        },
        status=201,
    )


@require_POST
@csrf_protect
def login_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=405)

    data = json.loads(request.body)

    username = data.get("username")
    password = data.get("password")

    user = authenticate(request, username=username, password=password)

    if user is None:
        return JsonResponse({"error": "Invalid username or password"}, status=401)

    # Django session
    login(request, user)

    # JWT tokens
    refresh = RefreshToken.for_user(user)

    return JsonResponse(
        {
            "message": "Login successful",
            "user": {
                "id": user.id,
                "username": user.username,
            },
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
    )


def logout_view(request):
    logout(request)

    return JsonResponse({"message": "Logout successful"})
