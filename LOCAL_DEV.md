# Local Development Setup

Two primary approaches for local development:
- **Colima + docker-compose** - Containerized (recommended for consistency)
- **Makefile** - Native execution on Mac (recommended for speed)

## Option 0: Colima (Container-based)

Lightweight container runtime for Mac. Works exactly like Docker but without the overhead.

### Install Colima

```bash
brew install colima
```

### Usage

```bash
# Start Colima (one-time per session)
colima start

# Then use docker-compose as usual
docker-compose up

# Stop when done
colima stop
```

The existing `docker-compose.yml` works unchanged. All `docker` and `docker-compose` commands work normally.

### Why Colima?
- ✅ Drop-in Docker replacement (same CLI)
- ✅ Lightweight and fast
- ✅ Free and open-source
- ✅ Works with your existing docker-compose.yml
- ✅ Better resource usage than Docker Desktop on Mac

### Access API

Once running:
- **Swagger UI**: http://localhost:8080/
- **Health Check**: http://localhost:8080/api/health
- **API**: http://localhost:8080/api/*

---

## Option 1: Makefile (Native Execution)

Already installed on every Mac. No additional tools needed.

### Usage

```bash
# Show all available commands
make

# One-time setup
make setup

# Start API
make api

# Start API with hot-reload
make api-dev

# View database location and status
make db-info

# Reset database
make db-reset

# Open SQLite shell
make db-shell

# Start full stack (API + UI)
make full-dev

# Start UI dev server (separate terminal)
make ui

# Build UI for production
make ui-build
```

### Why Makefile?
- ✅ Already on your Mac (no installation)
- ✅ Simple and straightforward
- ✅ All tasks in one place
- ✅ Fast, lightweight, native execution

---

## Quick Start

### Option A: Makefile (Fastest - Native Execution)

**First time:**
```bash
make setup    # Create cache directory, download dependencies
make api      # Start API server
```

**Every other time:**
```bash
make api
```

Then visit: **http://localhost:8080/**

### Option B: Colima (Containers)

**First time:**
```bash
colima start           # Start container runtime (one-time per session)
docker-compose up      # Start API and database
```

**Every other time:**
```bash
colima start           # Resume container runtime
docker-compose up      # Resume services
```

Then visit: **http://localhost:8080/**

### Option C: Full Stack Development

**Native (Makefile):**
```bash
make full-dev          # Runs API (8080) and UI (5173) together
# Visit http://localhost:5173
```

**Containerized (Colima):**
```bash
colima start
docker-compose up      # API on 8080
# In another terminal:
cd ui && npm run dev   # UI on 5173
```

---

## Development Commands

### Common Tasks

| Goal | Makefile (Native) | Colima (Container) |
|------|-------------------|-------------------|
| Start services | `make api` | `docker-compose up` |
| Hot-reload | `make api-dev` | N/A (rebuild container) |
| Build binary | `make api-build` | `docker build api` |
| Run tests | `make api-test` | `docker-compose exec api go test ./...` |
| Reset DB | `make db-reset` | `docker-compose down -v` |
| DB shell | `make db-shell` | `docker-compose exec api sqlite3 ...` |
| DB info | `make db-info` | `docker-compose logs api` |
| Full stack | `make full-dev` | `docker-compose up` + `cd ui && npm run dev` |

### Hot-Reload with Air

Makefile supports hot-reload via `air`, which auto-rebuilds when you change code:

```bash
make api-dev    # Auto-installs air if needed, then runs with hot-reload
```

Requires: `go install github.com/cosmtrek/air@latest` (installed automatically by `make api-dev`)

---

## Database

- **Location**: `~/.cache/sochoa.dev/api.db` (Makefile/native)
- **Type**: SQLite 3
- **Auto-created**: Migrations run automatically on first API start
- **Reset**: Run `make db-reset` or delete the file directly

### Access Database

```bash
make db-shell    # Open SQLite shell
make db-info     # Show database status and table count
```

Or directly:
```bash
sqlite3 ~/.cache/sochoa.dev/api.db
```

### With Colima

Database is inside the container volume. Access it via:
```bash
docker-compose exec api sqlite3 /home/api/.cache/sochoa.dev/api.db
```

---

## API Endpoints

Once running at `http://localhost:8080`:

- **Swagger UI**: http://localhost:8080/
- **Health Check**: http://localhost:8080/api/health
- **API**: http://localhost:8080/api/*

---

## Environment Variables

Automatically set by task/make:
- `DEV_MODE=true` - Skip Cognito
- `DEV_USER_ROLE=admin` - Full API access
- `LOG_LEVEL=debug` - Verbose logging

Override in your shell:
```bash
LOG_LEVEL=info task api
```

---

## Choosing Your Approach

**Use Makefile (Native) if you want:**
- ✅ Fastest iteration (no container startup overhead)
- ✅ Zero additional installation (already on Mac)
- ✅ Direct IDE integration and debugging
- ✅ File changes instantly reflected
- Recommended for daily development

**Use Colima (Containers) if you want:**
- ✅ Production-like environment (containers match deployment)
- ✅ Full isolation from system dependencies
- ✅ docker-compose workflow you're familiar with
- ✅ Consistent behavior across machines
- Recommended for testing before deployment

Both are equally valid. Pick what works for your workflow!

---

## Full Stack Development

### Native (Makefile)

```bash
make full-dev
```

This starts:
- **API** on http://localhost:8080 (Swagger UI at /)
- **UI dev server** on http://localhost:5173 (or next available port)
- Both running natively, sharing the local database

Visit http://localhost:5173 to access the UI and make API requests.

### Containerized (Colima)

Terminal 1:
```bash
colima start
docker-compose up
```

Terminal 2:
```bash
cd ui && npm run dev
```

This starts:
- **API** on http://localhost:8080 (in container)
- **UI dev server** on http://localhost:5173 (native)

---

## Troubleshooting

### API won't start
Check database file isn't corrupted:
```bash
make db-reset
make api
```

### Hot-reload not working
Air not installed. Install it:
```bash
go install github.com/cosmtrek/air@latest
```

### Port 8080 already in use (Makefile)
Start API on custom port:
```bash
cd api && go build -o api ./ && DEV_MODE=true DEV_USER_ROLE=admin LOG_LEVEL=debug ./api --port 3000
```

### Port 8080 already in use (Colima)
Update `docker-compose.yml` ports section:
```yaml
ports:
  - "3000:8080"  # Map 3000 to container's 8080
```

### Colima won't start
Check virtualization support on your Mac:
```bash
colima start --vm-type vz  # Recommended for M1/M2/M3 Macs (vfkit)
# or for Intel:
colima start --vm-type qemu
```

### Colima is slow/using too many resources
Increase or decrease resource limits:
```bash
colima stop
colima start --cpu 4 --memory 8 --disk 60  # Adjust based on your Mac
```

### Reset Colima completely
```bash
colima stop
colima delete  # Deletes VM and all containers
colima start
docker-compose up --build  # Rebuild images
```

### Colima networking issues
If services can't communicate:
```bash
colima ssh           # SSH into the VM
docker ps            # Check running containers
docker logs <name>   # Check container logs
exit                 # Exit SSH
```
