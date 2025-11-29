# Local Development Setup

Three options for local development:

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

## Option 1: Taskfile (Recommended for native execution)

Closest to docker-compose experience. YAML-based, works great on Mac.

### Install Task

```bash
brew install go-task/tap/go-task
```

Or download from: https://taskfile.dev/installation/

### Usage

```bash
# One-time setup
task setup

# Start API
task api

# Start API with hot-reload (auto-rebuilds on code changes)
task api:dev

# View database info and logs location
task logs

# Reset database
task db-reset

# Start full stack (API + UI)
task full:dev
```

Available tasks:
```bash
task -l  # List all tasks
```

### Why Taskfile?
- ✅ YAML-based (familiar if you know docker-compose)
- ✅ Simple, readable syntax
- ✅ Parallel task support
- ✅ No heavyweight runtime needed
- ✅ Works great on Mac

---

## Option 2: Makefile (Simpler alternative)

Already installed on every Mac. No additional tools needed.

### Usage

```bash
# One-time setup
make setup

# Start API
make api

# Start API with hot-reload
make api-dev

# View database info
make logs

# Reset database
make db-reset

# Start full stack
make full-dev
```

View all commands:
```bash
make help
```

### Why Makefile?
- ✅ Already on your Mac (no installation)
- ✅ Simple and straightforward
- ✅ Universal (works everywhere)
- ✅ Good for simple workflows

---

## Quick Start

### First Time

```bash
# Option 0: Colima (containers)
colima start
docker-compose up

# Option 1: Taskfile (native execution)
task setup
task api

# Option 2: Make (native execution)
make setup
make api
```

### Every Other Time

```bash
# Option 0: Colima
colima start
docker-compose up

# Option 1: Taskfile
task api

# Option 2: Make
make api
```

Then visit: **http://localhost:8080/**

---

## Development Commands

### Common Tasks

| Goal | Colima | Taskfile | Make |
|------|--------|----------|------|
| Start services | `docker-compose up` | `task api` | `make api` |
| Hot-reload | N/A | `task api:dev` | `make api-dev` |
| Build binary | `docker build api` | `task api:build` | `make api-build` |
| Run tests | `docker-compose exec api go test ./...` | `task api:test` | `make api-test` |
| Reset DB | `docker-compose down -v` | `task db-reset` | `make db-reset` |
| DB shell | `docker-compose exec api sqlite3 ...` | `task db:shell` | `make db-shell` |
| View logs | `docker-compose logs api` | `task logs` | `make logs` |

### Hot-Reload with Air

Both task and make support hot-reload via `air`, which auto-rebuilds when you change code:

```bash
task api:dev    # Taskfile
make api-dev    # Make
```

Requires: `go install github.com/cosmtrek/air@latest`

---

## Database

- **Location**: `~/.cache/sochoa.dev/api.db`
- **Type**: SQLite 3
- **Reset**: Delete the file or run `task db-reset` / `make db-reset`

### Access Database

```bash
task db:shell    # Taskfile
make db-shell    # Make
```

Or directly:
```bash
sqlite3 ~/.cache/sochoa.dev/api.db
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

**Use Colima if:**
- You want actual containers (isolation, consistency)
- You're used to docker-compose workflow
- You like having a container runtime

**Use Taskfile if:**
- You want native execution on your Mac
- You prefer YAML config syntax
- You want fast iteration without container overhead

**Use Make if:**
- You want no additional dependencies
- You prefer traditional approach
- You want maximum compatibility

Pick what feels right for your workflow! All three approaches work equally well.

---

## Full Stack Development

Run both API and UI:

```bash
# Option 0: Colima (containers)
colima start
docker-compose up

# Option 1: Taskfile (native)
task full:dev

# Option 2: Make (native)
make full-dev
```

This starts:
- **API** on http://localhost:8080 (Swagger UI at /)
- **UI dev server** on http://localhost:5173 (or next available port)
- Both share the same database

Visit http://localhost:5173 to access the UI and make API requests.

---

## Troubleshooting

### "command not found: task"
Install taskfile: `brew install go-task/tap/go-task`

### API won't start
Check database file isn't corrupted:
```bash
task db-reset    # or: make db-reset
task api         # or: make api
```

### Hot-reload not working
Air not installed. Install it:
```bash
go install github.com/cosmtrek/air@latest
```

### Port 8080 already in use
Use custom port:
```bash
task api -- --port 3000
# or
cd api && go build -o api ./ && ./api --port 3000
# or with Colima
docker-compose up -p custom_name_3000
```

### Colima won't start
Make sure you have virtualization enabled on your Mac (M-series support):
```bash
colima start --vm-type vz  # Recommended for M1/M2/M3 Macs
# or for Intel:
colima start --vm-type qemu
```

### Colima is slow/resource issues
Increase resource limits:
```bash
colima stop
colima start --cpu 4 --memory 8 --disk 60  # Adjust as needed
```

### Need to reset Colima
```bash
colima stop
colima delete  # Deletes VM and all containers
colima start
docker-compose up --build  # Rebuild images
```
