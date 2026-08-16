from django.test import TestCase
from django.urls import reverse

from .models import User


class AuthEndpointTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="shopper",
            email="shopper@example.com",
            password="securepass123",
        )

    def _csrf_headers(self):
        response = self.client.get(reverse("me"))
        return {"HTTP_X_CSRFTOKEN": response.cookies["csrftoken"].value}

    def test_register_creates_session(self):
        response = self.client.post(
            reverse("register"),
            data={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "securepass123",
                "confirmation": "securepass123",
            },
            content_type="application/json",
            **self._csrf_headers(),
        )

        self.assertEqual(response.status_code, 201)
        self.assertIn("sessionid", response.cookies)
        self.assertEqual(response.json()["user"]["username"], "newuser")

        me_response = self.client.get(reverse("me"))
        self.assertTrue(me_response.json()["authenticated"])

    def test_login_with_email_creates_session(self):
        response = self.client.post(
            reverse("login"),
            data={
                "username": "shopper@example.com",
                "password": "securepass123",
            },
            content_type="application/json",
            **self._csrf_headers(),
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("sessionid", response.cookies)
        self.assertEqual(response.json()["user"]["email"], "shopper@example.com")

    def test_me_returns_authenticated_user_with_session(self):
        self.client.post(
            reverse("login"),
            data={
                "username": "shopper",
                "password": "securepass123",
            },
            content_type="application/json",
            **self._csrf_headers(),
        )

        response = self.client.get(reverse("me"))

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["authenticated"])
        self.assertEqual(response.json()["user"]["username"], "shopper")

    def test_me_handles_anonymous_user_safely(self):
        response = self.client.get(reverse("me"))

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["authenticated"])
        self.assertIsNone(response.json()["user"])

    def test_logout_clears_session(self):
        self.client.post(
            reverse("login"),
            data={
                "username": "shopper",
                "password": "securepass123",
            },
            content_type="application/json",
            **self._csrf_headers(),
        )

        response = self.client.post(reverse("logout"), **self._csrf_headers())

        self.assertEqual(response.status_code, 200)

        me_response = self.client.get(reverse("me"))
        self.assertFalse(me_response.json()["authenticated"])
