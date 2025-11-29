# Local Development Setup

This guide explains how to run the API locally without AWS/Cognito setup.

## Prerequisites

- Go 1.25+
- golang-migrate (`brew install golang-migrate`)
- SQLite (included with most systems)

## Quick Start

### 1. Setup Database

```bash
# Run the setup script
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh
```

This will:
- Create `~/.cache/sochoa.dev/` directory
- Initialize SQLite database at `~/.cache/sochoa.dev/api.db`
- Run all migrations

### 2. Build API

```bash
go build -o api ./
```

### 3. Start API

```bash
# Start on default port 8080 (development mode)
DEV_MODE=true ./api

# Or with custom port
DEV_MODE=true ./api --port 3000
```

## What DEV_MODE Does

Setting `DEV_MODE=true`:
- ✅ Skips Cognito configuration requirement
- ✅ Uses SQLite database (no PostgreSQL needed)
- ✅ Enables localhost development
- ❌ Auth is not enforced (for testing endpoints)

## Database

- **Location**: `~/.cache/sochoa.dev/api.db`
- **Type**: SQLite 3
- **Migrations**: Run automatically via `setup-local.sh`

### Manual Migration

If you need to run migrations manually:

```bash
# Migrate up
migrate -path db/migrations -database "sqlite3://$HOME/.cache/sochoa.dev/api.db" up

# Migrate down
migrate -path db/migrations -database "sqlite3://$HOME/.cache/sochoa.dev/api.db" down

# Reset to version (e.g., 1)
migrate -path db/migrations -database "sqlite3://$HOME/.cache/sochoa.dev/api.db" force 1
```

## API Documentation

Once running, access Swagger UI at:
- **Swagger UI**: http://localhost:8080/swagger/index.html
- **OpenAPI JSON**: http://localhost:8080/swagger/swagger.json
- **OpenAPI YAML**: http://localhost:8080/swagger/swagger.yaml

(Replace 8080 with your custom port if using `--port`)

## Testing Endpoints

All endpoints work in dev mode:
- Public endpoints (posts, guestbook list, contact form) work without auth
- Admin endpoints can be tested by setting `DEV_USER_ROLE=admin`

```bash
DEV_MODE=true DEV_USER_ROLE=admin ./api
```

## Troubleshooting

### Database Already Locked
If you see "database is locked", another instance is running. Make sure to:
```bash
killall api
```

### Migrations Failed
Ensure migrations path is correct:
```bash
ls -la db/migrations/
```

### Can't Find golang-migrate
Install it:
```bash
brew install golang-migrate
```

## Environment Variables

Key variables for local development:

```bash
# Enable development mode (skip Cognito)
DEV_MODE=true

# Set dev user role (default: user, options: user|admin)
DEV_USER_ROLE=admin

# Custom port (default: 8080)
# ./api --port 3000

# Database DSN (auto-defaults to SQLite if not set)
# Usually not needed - omit to use default

# Log level (default: info, options: debug|info|warn|error)
LOG_LEVEL=debug
```

## Complete Example

```bash
# Setup
./scripts/setup-local.sh

# Build
go build -o api ./

# Start in dev mode with admin access and debug logging
DEV_MODE=true DEV_USER_ROLE=admin LOG_LEVEL=debug ./api --port 3000

# In another terminal, test health endpoint
curl http://localhost:3000/api/health

# View API documentation
open http://localhost:3000/swagger/index.html
```
