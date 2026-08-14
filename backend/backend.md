I'am telling the Django to use your custom User
In settings.py:
AUTH_USER_MODEL = "accounts.User"

this is how the tokens work in this project 

React
  │
  ├── Register ──→ Django API
  │
  ├── Login ─────→ Django API
  │                  │
  │                  └── JWT access + refresh tokens
  │
  └── API requests
         │
         └── Authorization: Bearer <access_token>