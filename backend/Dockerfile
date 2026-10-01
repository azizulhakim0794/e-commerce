FROM python:3.14-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:0.11.6 /uv /uvx /bin/

WORKDIR /app

# UV optimizations & Python dev settings
ENV UV_PROJECT_ENVIRONMENT="/opt/venv"
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV WATCHFILES_FORCE_POLLING=true

# Copy dependency files first
COPY pyproject.toml uv.lock ./

# Install dependencies into /opt/venv
RUN uv sync --locked --no-install-project --no-dev

# Copy application code
COPY . .

# Ensure media and static directories exist
RUN mkdir -p media static

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]