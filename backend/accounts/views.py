import json
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from .models import User
from rest_framework_simplejwt.tokens import RefreshToken


# Create your views here.
@require_POST
@csrf_exempt
def register(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid Json"}, status=400)

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    confirmation = data.get("confirmation")

    if not username or not password or not confirmation or not email:
        print(username, password, confirmation)
        return JsonResponse(
            {"error": "Username and passworrd and confirmation password is required"},
            status=400,
        )

    if password != confirmation:
        return JsonResponse({"error": "Passwords do not match"})

    if (
        User.objects.filter(username=username).exists()
        or User.objects.filter(email=email).exists()
    ):
        return JsonResponse({"error": "User already exist"}, status=400)

    user = User.objects.create_user(username=username, password=password, email=email)

    login(request, user)

    # JWT tokens
    refresh = RefreshToken.for_user(user)

    return JsonResponse(
        {
            "message": "Registrations successfully done ",
            "user": {
                "id": str(user.id),
                "username": user.username,
                "email": user.email,
            },
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        },
        status=201,
    )


@require_POST
@csrf_exempt
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


@csrf_exempt
def logout_view(request):
    logout(request)
    return JsonResponse({"message": "Logout successful"})
