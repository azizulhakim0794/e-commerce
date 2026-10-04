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

## Database migrations

Run Alembic from the repository root with the backend project environment:

```powershell
uv run --project backend alembic -c backend/alembic.ini revision --autogenerate -m "initial schema"
uv run --project backend alembic -c backend/alembic.ini upgrade head
```

For the initial revision, temporarily point `DATABASE_URL` at a separate,
empty database using the same database dialect as the application. Generate
the revision there, review and commit the generated file in `migrations/versions/`,
then run `upgrade head` against that empty database to verify the baseline.

To adopt an existing database whose tables were created by the application,
restore `DATABASE_URL` to that database and run:

```powershell
uv run --project backend alembic -c backend/alembic.ini stamp head
```

`stamp head` records the revision without executing its DDL, so only use it
after verifying the existing schema matches the baseline. For subsequent
schema changes, generate a new revision, review it, and apply it to each
database with `upgrade head`.

Alembic reads `DATABASE_URL` from the backend `.env` file (or the process
environment). The configuration resolves the backend import path and `.env`
location relative to these files, so the commands work from the repository
root.

<!-- need to create a request logger for check who is calling the API -->

docker setup

1. create a dockerfile
2. docker build -t ecommerce-backend . (for create the docker images)
   (dockeraze the database first.)
3. docker network create ecommerce-network (create the netwok)
4. docker run -d --name ecommerce-postgres --network ecommerce-network -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=console.log -e POSTGRES_DB=ecommerce -v ecommerce-postgres-data:/var/lib/postgresql/data postgres:17
5. 1. docker run -d --name ecommerce-backend-container(give a container name) --network ecommerce-network(network name) --env-file .env -p 8000:8000 ecommerce-backend(image name)

6. 1. MSYS_NO_PATHCONV=1 docker run -d --name ecommerce-backend-container(give a container name) --network ecommerce-network(network name) --env-file .env -p 8000:8000 ecommerce-backend(image name)

docker run -d --name ecommerce-backend-container --network ecommerce-network --network-alias ecommerce-backend --restart unless-stopped --env-file .env -e DATABASE_URL=postgresql+asyncpg://postgres:console.log@ecommerce-postgres:5432/ecommerce -e FRONTEND_URL=http://localhost:3000 -p 8000:8000 -v ecommerce-media-data:/app/media ecommerce-backend

# To run the dataBase in terminal

docker exec -it ecommerce-postgres psql -U postgres -d ecommerce

# when i add a migrate the options for local meshin

uv run alembic revision --autogenerate -m "add gender to user"

# In docker

1. docker compose exec ecommerce-backend uv run alembic revision --autogenerate -m "add gender to user"

2. docker compose exec ecommerce-backend uv run alembic upgrade head
