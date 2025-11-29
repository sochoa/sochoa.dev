.PHONY: help setup api api-dev api-build api-test api-clean db-reset db-shell db-info logs ui ui-build full-dev colima-start colima-stop

.DEFAULT_GOAL := help

CACHE_DIR := $(HOME)/.cache/sochoa.dev
API_DIR := ./api
UI_DIR := ./ui

help:
	@echo ""
	@echo "🚀 sochoa.dev - Local Development"
	@echo ""
	@echo "Three ways to develop:"
	@echo "  1. make setup && make api     (native execution)"
	@echo "  2. make full-dev              (native API + UI together)"
	@echo "  3. colima start && docker-compose up (containerized)"
	@echo ""
	@echo "SETUP:"
	@echo "  setup                Setup local development environment"
	@echo ""
	@echo "API DEVELOPMENT:"
	@echo "  api                  Start API server (DEV_MODE=true)"
	@echo "  api-dev              Start API with hot-reload (requires air)"
	@echo "  api-build            Build API binary"
	@echo "  api-test             Run API tests"
	@echo "  api-clean            Clean API build and database"
	@echo ""
	@echo "DATABASE:"
	@echo "  db-reset             Delete and recreate database"
	@echo "  db-shell             Open SQLite shell"
	@echo "  db-info              Show database location and status"
	@echo ""
	@echo "UI DEVELOPMENT:"
	@echo "  ui                   Start UI dev server (http://localhost:5173)"
	@echo "  ui-build             Build UI for production"
	@echo ""
	@echo "FULL STACK:"
	@echo "  full-dev             Start API (8080) and UI (5173) together"
	@echo ""
	@echo "CONTAINER RUNTIME:"
	@echo "  colima-start         Start Colima container runtime"
	@echo "  colima-stop          Stop Colima"
	@echo ""
	@echo "API ENDPOINTS (when running):"
	@echo "  Swagger UI: http://localhost:8080/"
	@echo "  Health:     http://localhost:8080/api/health"
	@echo "  API:        http://localhost:8080/api/*"
	@echo ""

setup:
	@echo "🔧 Setting up local development environment..."
	@mkdir -p $(CACHE_DIR)
	@cd $(API_DIR) && go mod download
	@echo "✅ Setup complete!"
	@echo "Run 'make api' to start the API"

api:
	@cd $(API_DIR) && go build -o api ./ && DEV_MODE=true DEV_USER_ROLE=admin LOG_LEVEL=debug ./api

api-dev:
	@which air > /dev/null || (echo "Installing air..." && go install github.com/cosmtrek/air@latest)
	@cd $(API_DIR) && DEV_MODE=true DEV_USER_ROLE=admin LOG_LEVEL=debug air

api-build:
	@cd $(API_DIR) && go build -o api ./

api-test:
	@cd $(API_DIR) && go test ./...

api-clean:
	@rm -f $(API_DIR)/api
	@rm -f $(CACHE_DIR)/api.db
	@echo "✅ Cleaned API build and database"

db-reset:
	@rm -f $(CACHE_DIR)/api.db
	@echo "✅ Database reset. Run 'make api' to recreate it."

db-shell:
	@sqlite3 $(CACHE_DIR)/api.db

db-info:
	@echo "📁 Database: $(CACHE_DIR)/api.db"
	@echo "📝 Logs: Sent to stdout (structured JSON)"
	@echo "🔗 Swagger UI: http://localhost:8080/"
	@if [ -f $(CACHE_DIR)/api.db ]; then \
		echo "✅ Database exists"; \
		sqlite3 $(CACHE_DIR)/api.db "SELECT count(*) as tables FROM sqlite_master WHERE type='table';" | xargs -I {} echo "  Tables: {}"; \
	else \
		echo "⚠️  Database doesn't exist yet (run 'make api' to create it)"; \
	fi

logs: db-info

ui:
	@cd ui && npm install && npm run dev

ui-build:
	@cd ui && npm install && npm run build

full-dev:
	@echo "🚀 Starting API (8080) and UI (5173)..."
	@cd $(API_DIR) && go build -o api ./ && DEV_MODE=true DEV_USER_ROLE=admin LOG_LEVEL=debug ./api & \
	cd $(UI_DIR) && npm run dev

colima-start:
	@echo "🐳 Starting Colima container runtime..."
	@which colima > /dev/null || (echo "❌ Colima not installed. Install: brew install colima" && exit 1)
	@colima start
	@echo "✅ Colima started. Run 'docker-compose up' to start services."

colima-stop:
	@echo "🛑 Stopping Colima..."
	@colima stop
	@echo "✅ Colima stopped"
