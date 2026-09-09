#### for authenticated i need to install theses packages

1. uv add alembic
2. uv add pydantic-settings
3. uv add "pwdlib[argon2]"
4. uv add pyjwt
5. uv add email-validator

folder structure

app/
├── models/
│ └── user.py
│
├── schemas/
│ └── auth.py
│
├── routers/
│ └── auth.py
│
├── services/
│ └── auth.py
│
├── core/
│ └── security.py
│
└── db/
└── database.py
