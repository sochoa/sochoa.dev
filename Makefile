.PHONY: help setup api api-dev api-build api-test api-clean db-reset db-shell logs ui ui-build full-dev

CACHE_DIR := $(HOME)/.cache/sochoa.dev
API_DIR := ./api

help:
	@echo "sochoa.dev - Local Development"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Setup:"
	@echo "  setup              Setup local development environment"
	@echo ""
	@echo "API Development:"
	@echo "  api                Start API server"
	@echo "  api-dev            Start API with hot-reload (requires air)"
	@echo "  api-build          Build API binary"
	@echo "  api-test           Run API tests"
	@echo "  api-clean          Clean API build artifacts"
	@echo ""
	@echo "Database:"
	@echo "  db-reset           Reset database (delete and recreate)"
	@echo "  db-shell           Open SQLite shell"
	@echo ""
	@echo "Full Stack:"
	@echo "  ui                 Start UI dev server"
	@echo "  ui-build           Build UI for production"
	@echo "  full-dev           Start API and UI together"
	@echo ""
	@echo "Info:"
	@echo "  logs               Show database and logging info"

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

logs:
	@echo "📁 Database: $(CACHE_DIR)/api.db"
	@echo "📝 Logs: Sent to stdout (structured JSON)"
	@echo "🔗 Swagger UI: http://localhost:8080/"

ui:
	@cd ui && npm install && npm run dev

ui-build:
	@cd ui && npm install && npm run build

full-dev:
	@echo "Starting API and UI..."
	@cd $(API_DIR) && go build -o api ./ && DEV_MODE=true DEV_USER_ROLE=admin LOG_LEVEL=debug ./api & \
	cd ui && npm run dev
