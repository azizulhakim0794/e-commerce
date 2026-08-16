from django.test import TestCase
from django.urls import reverse

from .models import User
from .tokens import ACCESS_COOKIE, REFRESH_COOKIE


class AuthEndpointTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="shopper",
            email="shopper@example.com",
            password="securepass123",
        )

    def test_register_issues_auth_cookies(self):
        response = self.client.post(
            reverse("register"),
            data={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "securepass123",
                "confirmation": "securepass123",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertIn(ACCESS_COOKIE, response.cookies)
        self.assertIn(REFRESH_COOKIE, response.cookies)
        self.assertEqual(response.json()["user"]["username"], "newuser")
        self.assertIn("access", response.json())
        self.assertIn("refresh", response.json())

    def test_login_with_email_issues_auth_cookies(self):
        response = self.client.post(
            reverse("login"),
            data={
                "username": "shopper@example.com",
                "password": "securepass123",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn(ACCESS_COOKIE, response.cookies)
        self.assertEqual(response.json()["user"]["email"], "shopper@example.com")

    def test_me_returns_authenticated_user_with_bearer_token(self):
        login_response = self.client.post(
            reverse("login"),
            data={
                "username": "shopper",
                "password": "securepass123",
            },
            content_type="application/json",
        )

        response = self.client.get(
            reverse("me"),
            HTTP_AUTHORIZATION=f"Bearer {login_response.json()['access']}",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["authenticated"])
        self.assertEqual(response.json()["user"]["username"], "shopper")

    def test_me_returns_authenticated_user_with_access_cookie(self):
        login_response = self.client.post(
            reverse("login"),
            data={
                "username": "shopper",
                "password": "securepass123",
            },
            content_type="application/json",
        )

        response = self.client.get(
            reverse("me"),
            HTTP_COOKIE=f"{ACCESS_COOKIE}={login_response.cookies[ACCESS_COOKIE].value}",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["authenticated"])
        self.assertEqual(response.json()["user"]["username"], "shopper")

    def test_me_handles_anonymous_user_safely(self):
        response = self.client.get(reverse("me"))

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["authenticated"])
        self.assertIsNone(response.json()["user"])

    def test_logout_clears_auth_cookies(self):
        login_response = self.client.post(
            reverse("login"),
            data={
                "username": "shopper",
                "password": "securepass123",
            },
            content_type="application/json",
        )

        response = self.client.post(
            reverse("logout"),
            HTTP_COOKIE=(
                f"{ACCESS_COOKIE}={login_response.cookies[ACCESS_COOKIE].value}; "
                f"{REFRESH_COOKIE}={login_response.cookies[REFRESH_COOKIE].value}"
            ),
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.cookies[ACCESS_COOKIE]["max-age"], 0)
        self.assertEqual(response.cookies[REFRESH_COOKIE]["max-age"], 0)
