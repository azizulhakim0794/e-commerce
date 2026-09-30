# Why API Requests Hit `http://localhost:3000/products` Instead of `http://localhost:8000/api/v1/products`

This document explains why your frontend application is calling `http://localhost:3000/products` instead of your FastAPI backend at `http://localhost:8000/api/v1/products` when running with standalone Docker CLI commands (without Docker Compose), and how to resolve it.

---

## 1. Quick Summary of Why This Happens

When you run the frontend container individually with Docker CLI (without Docker Compose):

1. **`.env` is ignored by Docker**: `frontend/.dockerignore` excludes `.env`. Therefore, the environment variable `NEXT_PUBLIC_API_BASE_URL` is **not included in the Docker image**.
2. **`NEXT_PUBLIC_API_BASE_URL` becomes `undefined`**: Unless you explicitly pass `-e NEXT_PUBLIC_API_BASE_URL=...` in your `docker run` command, the variable evaluates to `undefined` inside the container.
3. **Axios falls back to the current browser origin**: When `baseURL` is `undefined`, Axios resolves relative paths (`/products`) against the browser's current address (`window.location.origin`), which is `http://localhost:3000`.
4. **Service paths omit `/api/v1`**: In [product.service.ts](file:///c:/my_project/fastApi/e-commerce/frontend/helper/services/product.service.ts), calls are written as `api.get("/products")`, relying entirely on `baseURL` to provide the prefix. Without `baseURL`, the request goes to `http://localhost:3000/products`.
5. **Next.js Page Collision**: `http://localhost:3000/products` is the Next.js page route ([app/products/page.tsx](file:///c:/my_project/fastApi/e-commerce/frontend/app/products/page.tsx)). When the browser sends an API request to `http://localhost:3000/products`, Next.js responds with the HTML page instead of API JSON data from FastAPI!

---

## 2. Deep-Dive Code Breakdown

### A. Missing Environment Variable in Docker
Look at [frontend/.dockerignore](file:///c:/my_project/fastApi/e-commerce/frontend/.dockerignore):
```dockerignore
node_modules
.next
.env      <--- .env is excluded from the docker build context
.get
.gitignore
```
Because `.env` is ignored, running `docker build -t ecommerce-frontend ./frontend` copies your source code, but **omits** `.env`.

When you run:
```bash
docker run -d -p 3000:3000 ecommerce-frontend
```
Inside the container:
- `process.env.NEXT_PUBLIC_API_BASE_URL` is `undefined`.

### B. Axios Initialization with Undefined Base URL
Look at [frontend/config/env.ts](file:///c:/my_project/fastApi/e-commerce/frontend/config/env.ts):
```typescript
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // undefined!

export const ENV = {
    API_BASE_URL: apiBaseUrl,
};
```
Now look at [frontend/helper/api/index.ts](file:///c:/my_project/fastApi/e-commerce/frontend/helper/api/index.ts):
```typescript
const api = axios.create({
  baseURL: ENV.API_BASE_URL, // evaluates to undefined
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
```

### C. Relative Path Resolution in the Service
Look at [frontend/helper/services/product.service.ts](file:///c:/my_project/fastApi/e-commerce/frontend/helper/services/product.service.ts):
```typescript
get_products: async (): Promise<Product[]> => {
  const { data } = await api.get<Product[]>("/products"); // relative path!
  return data;
}
```
In Axios and the browser:
- If `baseURL` is set to `http://localhost:8000/api/v1`, Axios joins them: `http://localhost:8000/api/v1/products`.
- If `baseURL` is `undefined`, Axios treats `"/products"` as a relative URL to the browser's current URL:
  $$\text{Origin } (\texttt{http://localhost:3000}) + \text{Path } (\texttt{/products}) = \mathbf{\texttt{http://localhost:3000/products}}$$

### D. The Architecture Conflict: Direct Backend vs Next.js Rewrites
There are two distinct architectural patterns present in this codebase:

#### Architecture Pattern 1: Direct Backend Call (What you want)
```
[ Browser Client ] -------- HTTP Request --------> [ FastAPI Backend ]
(http://localhost:3000)                               (http://localhost:8000/api/v1/products)
```
- Browser directly requests `http://localhost:8000/api/v1/products`.
- FastAPI handles CORS headers (which is already configured in [backend/main.py](file:///c:/my_project/fastApi/e-commerce/backend/main.py) for origins `http://localhost:3000` and `http://127.0.0.1:3000`).
- Requires: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1`.

#### Architecture Pattern 2: Next.js Reverse Proxy / Rewrites (Existing setup in `docker-compose.yml`)
Look at [frontend/next.config.ts](file:///c:/my_project/fastApi/e-commerce/frontend/next.config.ts):
```typescript
const BACKEND_URL =
  process.env.INTERNAL_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      ...
    ];
  },
};
```
In `docker-compose.yml`:
- `NEXT_PUBLIC_API_BASE_URL` was set to `http://localhost:3000/api/v1`.
- Browser calls `http://localhost:3000/api/v1/products`.
- Next.js server intercepts `/api/...` and proxies the request to `INTERNAL_BACKEND_URL=http://ecommerce-backend:8000/api/v1/products`.
- Notice that even with this proxy pattern, the URL is supposed to have `/api/v1`. Because the variable was missing, the `/api/v1` prefix was dropped completely, turning the URL into `http://localhost:3000/products`.

---

## 3. Container Networking Without Docker Compose

When running containers with standalone `docker run` commands instead of Docker Compose, remember:

1. **`localhost` inside a container is NOT your host machine**:
   Inside the frontend container, `localhost:8000` refers to the *frontend container itself*, not your backend container.
2. **Browser vs Server Context**:
   - The browser runs on your **host machine**. The browser CAN reach `http://localhost:8000` because you mapped port `8000:8000`.
   - Any server-side code (or Next.js rewrites) running *inside* the container CANNOT reach `http://localhost:8000`. It must use container DNS names (e.g. `http://ecommerce-backend:8000`) on a shared Docker bridge network.

---

## 4. How to Fix It (Step-by-Step for Standalone Docker)

### Option A: Direct Backend Calls (Recommended if you want `http://localhost:8000/api/v1/products`)

To have the browser make calls directly to `http://localhost:8000/api/v1/products`, pass `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1` when starting the frontend container.

#### 1. Create the Shared Network
```bash
docker network create ecommerce-network
```

#### 2. Create the Volumes
```bash
docker volume create ecommerce-postgres-data
docker volume create ecommerce-media-data
```

#### 3. Run PostgreSQL
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

#### 4. Build and Run FastAPI Backend
```bash
# Build
docker build -t ecommerce-backend ./backend

# Run
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

#### 5. Build and Run Next.js Frontend
Pass `-e NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1`:

```bash
# Build
docker build -t ecommerce-frontend ./frontend

# Run with direct backend API URL
docker run -d \
  --name ecommerce-frontend-container \
  --network ecommerce-network \
  --restart unless-stopped \
  -e NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1 \
  -e HOSTNAME=0.0.0.0 \
  -e PORT=3000 \
  -p 3000:3000 \
  ecommerce-frontend
```

---

### Option B: Keep Next.js Reverse Proxy (Calls `http://localhost:3000/api/v1` and proxies to backend)

If you prefer Next.js handling the API routing so the browser only talks to port 3000:

```bash
docker run -d \
  --name ecommerce-frontend-container \
  --network ecommerce-network \
  --restart unless-stopped \
  -e NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1 \
  -e INTERNAL_BACKEND_URL=http://ecommerce-backend:8000 \
  -e HOSTNAME=0.0.0.0 \
  -e PORT=3000 \
  -p 3000:3000 \
  ecommerce-frontend
```

In this setup:
- Browser requests: `http://localhost:3000/api/v1/products`
- Next.js rewrites: forwards to `http://ecommerce-backend:8000/api/v1/products` inside Docker network.

---

## 5. Verification Checklist

After running your containers with Option A:

1. **Verify Backend Health**:
   Open in your browser or run:
   ```bash
   curl http://localhost:8000/health
   curl http://localhost:8000/api/v1/products
   ```
   Both should return JSON responses.

2. **Verify Frontend in Browser**:
   - Open `http://localhost:3000/products`.
   - Open Browser DevTools (`F12`) -> **Network** tab.
   - Look for the request to `products`.
   - You should now see:
     ```
     Request URL: http://localhost:8000/api/v1/products
     Status: 200 OK
     ```
   - No requests to `http://localhost:3000/products` for API data will be made.
