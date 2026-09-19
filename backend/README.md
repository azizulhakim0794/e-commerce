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

transitions SQLite3 to PostgreSQL

1. first delete the SQLite3 database from project
2. CREATE c data base via CLI or GUI in CLI like CREATE DATABASE ecommerce
3. install the uv add asyncpg
4. and create the database connection URL like
   (postgresql+asyncpg://postgres:your_password@localhost:5432/ecommerce)
