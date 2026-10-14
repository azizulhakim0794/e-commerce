#### for authenticated i need to install theses packages

1. uv add alembic
2. uv add pydantic-settings
3. uv add "pwdlib[argon2]"
4. uv add pyjwt
5. uv add email-validator

folder structure

backend/
│
├── core/
│ ├── security.py
│ └── redis.py # Redis connection/client
│
├── db/
│ └── database.py # Database engine and sessions
│
├── jobs/ # Background job processing
│ ├── **init**.py
│ ├── queue.py # RQ queue configuration
│ ├── image_tasks.py # Image processing jobs
│ └── email_tasks.py # Email sending jobs (future)
│
├── workers/ # Worker process entry points (optional)
│ └── rq_worker.py # Starts the RQ worker
│
├── logs/
│
├── media/
│
├── middleware/
│
├── migrations/
│
├── models/
│ └── user.py
│
├── routers/
│ └── auth.py
│
├── schemas/
│ └── auth.py
│
├── services/
│ └── auth.py
│
└── tests/
└── test_auth.py

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

## Image uploads

Product and rating photos are staged in the shared `image-temp` volume and
processed by the `ecommerce-image-worker` RQ worker. The worker uploads images
to Cloudinary and updates the associated record's photo URL after the upload
succeeds. Start it with the rest of the application using
`docker compose up --build`; for local development, run
`uv run --project backend --directory backend python -m workers.rq_worker`
alongside the API, with Redis available at the configured `REDIS_URL`.
Both Redis clients use RESP2 so they can also connect to older Redis servers
that do not support the RESP3 `HELLO` command.

## Order confirmation emails

The existing RQ worker also sends order confirmation emails after an order
transaction commits. Configure these variables in `backend/.env`; Compose passes
that file to both the API and worker. The worker sends order confirmations
through Mailtrap SMTP:

```dotenv
MAIL_SERVER=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_FROM=<verified sender email address>
MAIL_USE_TLS=true
FRONTEND_URL=http://localhost:3000
SUPPORT_EMAIL=<optional customer support address>
```

Use the SMTP username and password shown in your Mailtrap inbox's SMTP
settings, and verify the sender address for your Sending domain. The
order-confirmation template is rendered as both plain text and HTML and sent
over STARTTLS. SMTP failures are retried using the existing RQ retry intervals.
A mail failure does not undo a committed order; if Redis is unavailable when
enqueueing, the API logs that manual recovery is needed.

For local development, run the API and worker against the same `REDIS_URL`.
In VS Code, start the **Debug FastAPI + RQ worker** compound launch, or run
`uv run --project backend --directory backend python -m workers.rq_worker` in
a separate terminal. Starting only FastAPI queues confirmation emails but
does not send them; the RQ worker must remain running to process those jobs.

If the worker reports an SMTP authentication or sender error, verify the
Mailtrap SMTP username, password, and sender address, then recreate the worker
so it loads the updated environment:

```powershell
docker compose up -d --force-recreate ecommerce-image-worker
```

Jobs that exhausted their retries remain in RQ's failed registry. After fixing
the SMTP settings, requeue an individual failed confirmation with:

```powershell
docker compose exec ecommerce-image-worker rq requeue --queue images <job-id>
```
