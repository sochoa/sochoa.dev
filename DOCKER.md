# Docker Setup for sochoa.dev

This guide explains how to run the sochoa.dev API using Docker.

## Prerequisites

- Docker
- Docker Compose (optional, for easier local development)

## Quick Start with Docker Compose

The easiest way to run the API in Docker:

```bash
docker-compose up
```

This will:
- Build the Docker image
- Start the API on port 8080
- Create a persistent volume for the SQLite database
- Set up development defaults (DEV_MODE=true, admin access, debug logging)

Access the API:
- **Swagger UI**: http://localhost:8080/
- **Health Check**: http://localhost:8080/api/health

Stop the service:
```bash
docker-compose down
```

## Manual Docker Build and Run

### Build the Image

```bash
docker build -t sochoa-api:latest api/
```

### Run the Container

**Development mode (default):**
```bash
docker run -p 8080:8080 \
  -e DEV_MODE=true \
  -e DEV_USER_ROLE=admin \
  -e LOG_LEVEL=debug \
  sochoa-api:latest
```

**Production mode (requires environment variables):**
```bash
docker run -p 8080:8080 \
  -e DEV_MODE=false \
  -e DB_DSN="postgres://user:pass@db:5432/sochoa" \
  -e COGNITO_USER_POOL_ID="your-pool-id" \
  -e COGNITO_CLIENT_ID="your-client-id" \
  -e AWS_REGION="us-east-1" \
  sochoa-api:latest
```

**With persistent SQLite database:**
```bash
docker run -p 8080:8080 \
  -v sochoa_cache:/home/api/.cache/sochoa.dev \
  -e DEV_MODE=true \
  sochoa-api:latest
```

### Available Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DEV_MODE` | `true` | Enable development mode (skip Cognito) |
| `DEV_USER_ROLE` | `admin` | Dev user role (user or admin) |
| `LOG_LEVEL` | `debug` | Log level (debug, info, warn, error) |
| `DB_DSN` | SQLite in /home/api/.cache | Database connection string |
| `AWS_REGION` | `us-east-1` | AWS region |
| `COGNITO_USER_POOL_ID` | (empty) | Cognito user pool ID |
| `COGNITO_CLIENT_ID` | (empty) | Cognito client ID |

## Docker Image Details

- **Base Image**: Alpine Linux (lightweight, ~5MB base)
- **Port**: 8080
- **Non-root User**: `api` (UID 1000)
- **Health Check**: Enabled, checks `/api/health` every 30s
- **Multi-stage Build**: Optimizes final image size
- **Database**: SQLite by default (in-container at `/home/api/.cache/sochoa.dev/api.db`)

## Volumes

- `/home/api/.cache/sochoa.dev` - SQLite database storage
  - Mounted in docker-compose as `api_cache` volume
  - Persists database between container restarts

## Networking

- Exposes port 8080
- Health check runs internally
- Database stored locally (SQLite in container)

## Production Deployment

For production, use:
1. PostgreSQL instead of SQLite
2. `DEV_MODE=false`
3. Proper Cognito configuration
4. Environment-specific overrides

Example production docker-compose:
```yaml
services:
  api:
    build: ./api
    ports:
      - "8080:8080"
    environment:
      - DEV_MODE=false
      - DB_DSN=postgres://user:pass@postgres:5432/sochoa
      - COGNITO_USER_POOL_ID=${COGNITO_USER_POOL_ID}
      - COGNITO_CLIENT_ID=${COGNITO_CLIENT_ID}
      - AWS_REGION=us-east-1
    depends_on:
      postgres:
        condition: service_healthy

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=sochoa
      - POSTGRES_USER=api
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U api"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

## Troubleshooting

### Container won't start
Check logs:
```bash
docker-compose logs -f api
```

### Database permission errors
Ensure the volume has correct permissions. The image runs as non-root user `api` (UID 1000).

### Health check failing
Give the service time to start (5s initial period). Check health manually:
```bash
docker-compose exec api wget -O- http://localhost:8080/api/health
```

## Cleaning Up

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (deletes database)
docker-compose down -v

# Remove image
docker rmi sochoa-api:latest
```
