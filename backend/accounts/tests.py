from django.test import TestCase
from django.urls import reverse


class AuthMeEndpointTests(TestCase):
    def test_me_handles_anonymous_user_safely(self):
        response = self.client.get(reverse("me"))

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["authenticated"])
        self.assertIsNone(response.json()["user"])
