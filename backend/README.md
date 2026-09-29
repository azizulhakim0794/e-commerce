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

<!-- need to create a request logger for check who is calling the API -->

docker setup

1. create a dockerfile
2. docker build -t ecommerce-backend . (for create the docker images)
   (dockeraze the database first.)
3. docker network create ecommerce-network (create the netwok)
4. docker run -d --name ecommerce-postgres --network ecommerce-network -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=console.log -e POSTGRES_DB=ecommerce -v ecommerce-postgres-data:/var/lib/postgresql/data postgres
5. 1. docker run -d --name ecommerce-backend-container(give a container name) --network ecommerce-network(network name) --env-file .env -p 8000:8000 ecommerce-backend(image name)

6. 1. MSYS_NO_PATHCONV=1 docker run -d --name ecommerce-backend-container(give a container name) --network ecommerce-network(network name) --env-file .env -p 8000:8000 ecommerce-backend(image name)
