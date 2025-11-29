# Local Development Setup

Two options for local development without Docker:

## Option 1: Taskfile (Recommended)

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
# Option 1: Taskfile
task setup
task api

# Option 2: Make
make setup
make api
```

### Every Other Time

```bash
# Option 1: Taskfile
task api

# Option 2: Make
make api
```

Then visit: **http://localhost:8080/**

---

## Development Commands

### Common Tasks

| Goal | Taskfile | Make |
|------|----------|------|
| Start API | `task api` | `make api` |
| Hot-reload | `task api:dev` | `make api-dev` |
| Build binary | `task api:build` | `make api-build` |
| Run tests | `task api:test` | `make api-test` |
| Reset DB | `task db-reset` | `make db-reset` |
| DB shell | `task db:shell` | `make db-shell` |
| View logs | `task logs` | `make logs` |

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

## Choosing Between Task and Make

**Use Taskfile if:**
- You want YAML-like config (familiar from docker-compose)
- You like modern tooling
- You want parallel task execution

**Use Make if:**
- You want no additional dependencies
- You prefer traditional approach
- You want maximum compatibility

Both are equally valid. Pick what feels right for your workflow!

---

## Full Stack Development

Run both API and UI:

```bash
task full:dev    # Taskfile
make full-dev    # Make
```

This starts:
- API on http://localhost:8080
- UI dev server on http://localhost:5173 (or next available port)

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
```
