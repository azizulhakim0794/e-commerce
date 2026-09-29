# Docker Guide for E-Commerce Application

This guide contains all Docker commands to run and manage the **PostgreSQL database**, **FastAPI backend**, and **Next.js frontend**.

---

## 1. Quick Start with Docker Compose (Recommended)

Docker Compose automatically manages the network, dependencies, persistent volumes, and health checks across all services.

### Start all services in the background
```bash
docker compose up -d
```

### Rebuild images and start all services
```bash
docker compose up -d --build
```

### Check service status
```bash
docker compose ps
```

### Stream live logs for all services
```bash
docker compose logs -f
```

### Stream logs for a specific service
```bash
# Backend logs
docker compose logs -f ecommerce-backend

# Frontend logs
docker compose logs -f ecommerce-frontend

# PostgreSQL logs
docker compose logs -f ecommerce-postgres
```

### Stop all services
```bash
docker compose down
```

### Stop all services and remove volumes (clean reset)
```bash
docker compose down -v
```

---

## 2. Running Services Individually with Docker CLI

If you prefer running containers individually without Docker Compose, execute the following commands in sequence:

### Step 1: Create the Shared Network and Volumes
```bash
# Create shared bridge network
docker network create ecommerce-network

# Create persistent storage volumes
docker volume create ecommerce-postgres-data
docker volume create ecommerce-media-data
```

---

### Step 2: Run PostgreSQL
```bash
docker run -d \
  --name ecommerce-postgres \
  --network ecommerce-network \
  --restart unless-stopped \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=console.log \
  -e POSTGRES_DB=ecommerce \
  -p 5432:5432 \
  -v ecommerce-postgres-data:/var/lib/postgresql/data \
  postgres:16-alpine
```

- **Verify Database Readiness**:
  ```bash
  docker exec -it ecommerce-postgres pg_isready -U postgres -d ecommerce
  ```

---

### Step 3: Build & Run FastAPI Backend

1. **Build backend image**:
   ```bash
   docker build -t ecommerce-backend ./backend
   ```

2. **Run backend container**:
   ```bash
   docker run -d \
     --name ecommerce-backend-container \
     --network ecommerce-network \
     --network-alias ecommerce-backend \
     --restart unless-stopped \
     --env-file ./backend/.env \
     -e DATABASE_URL=postgresql+asyncpg://postgres:console.log@ecommerce-postgres:5432/ecommerce \
     -e FRONTEND_URL=http://localhost:3000 \
     -p 8000:8000 \
     -v ecommerce-media-data:/app/media \
     ecommerce-backend
   ```

---

### Step 4: Build & Run Next.js Frontend

1. **Build frontend image**:
   ```bash
   docker build -t ecommerce-frontend ./frontend
   ```

2. **Run frontend container**:
   ```bash
   docker run -d \
     --name ecommerce-frontend-container \
     --network ecommerce-network \
     --restart unless-stopped \
     --env-file ./frontend/.env \
     -e NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1 \
     -e INTERNAL_BACKEND_URL=http://ecommerce-backend:8000 \
     -e HOSTNAME=0.0.0.0 \
     -e PORT=3000 \
     -p 3000:3000 \
     ecommerce-frontend
   ```

---

## 3. Service Endpoints & Port Map

| Component | Container Name | Host Port | Internal Network URL | Health / Test URL |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | `ecommerce-frontend-container` | `3000` | `http://ecommerce-frontend:3000` | http://localhost:3000 |
| **Backend** | `ecommerce-backend-container` | `8000` | `http://ecommerce-backend:8000` | http://localhost:8000/health |
| **API Docs** | `ecommerce-backend-container` | `8000` | `http://ecommerce-backend:8000/docs` | http://localhost:8000/docs |
| **Database** | `ecommerce-postgres` | `5432` | `ecommerce-postgres:5432` | `pg_isready -U postgres -d ecommerce` |

---

## 4. Useful Management Commands

### Interactive Shell Access
```bash
# Open interactive shell in Backend
docker exec -it ecommerce-backend-container /bin/sh

# Open interactive shell in Frontend
docker exec -it ecommerce-frontend-container /bin/sh

# Open PostgreSQL psql CLI
docker exec -it ecommerce-postgres psql -U postgres -d ecommerce
```

### Restart Individual Services via Compose
```bash
# Restart Backend only
docker compose restart ecommerce-backend

# Restart Frontend only
docker compose restart ecommerce-frontend

# Restart PostgreSQL only
docker compose restart ecommerce-postgres
```

### Clean Up Unused Docker Resources
```bash
docker system prune -f
```
