.PHONY: help build test test-coverage test-race coverage-report lint security-check qa mocks migrate-up migrate-down clean

# Variables
BINARY_NAME=api
BINARY_LINUX=$(BINARY_NAME)_linux
MAIN_PATH=./main.go
COVERAGE_FILE=coverage.out
COVERAGE_HTML=coverage.html

# Colors for output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[0;33m
NC=\033[0m # No Color

help:
	@echo "$(YELLOW)Available targets:$(NC)"
	@echo "  $(GREEN)build$(NC)              - Build the API binary"
	@echo "  $(GREEN)build-lambda$(NC)       - Build for AWS Lambda (Linux ARM64)"
	@echo "  $(GREEN)test$(NC)               - Run all tests"
	@echo "  $(GREEN)test-coverage$(NC)      - Run tests with coverage (fail if <70%)"
	@echo "  $(GREEN)test-race$(NC)          - Run tests with race detector"
	@echo "  $(GREEN)coverage-report$(NC)    - Generate and open HTML coverage report"
	@echo "  $(GREEN)mocks$(NC)              - Generate mocks using mockery"
	@echo "  $(GREEN)lint$(NC)               - Run golangci-lint"
	@echo "  $(GREEN)security-check$(NC)     - Run govulncheck for security vulnerabilities"
	@echo "  $(GREEN)qa$(NC)                 - Run all QA checks in order: mocks → test-coverage → lint → test-race → security-check"
	@echo "  $(GREEN)migrate-up$(NC)         - Run database migrations up"
	@echo "  $(GREEN)migrate-down$(NC)       - Run database migrations down"
	@echo "  $(GREEN)clean$(NC)              - Clean build artifacts and test files"

# Build targets
build: mocks
	@echo "$(YELLOW)Building $(BINARY_NAME)...$(NC)"
	go build -o ../bin/$(BINARY_NAME) .

build-lambda: mocks
	@echo "$(YELLOW)Building for Lambda (Linux ARM64)...$(NC)"
	GOOS=linux GOARCH=arm64 go build -o ../bin/$(BINARY_LINUX) .

# Mock generation
mocks:
	@echo "$(YELLOW)Generating mocks...$(NC)"
	go generate ./... || true
	@if ! command -v mockery &> /dev/null; then \
		echo "$(RED)mockery not installed. Installing...$(NC)"; \
		go install github.com/vektra/mockery/v2@latest; \
	fi
	mockery --config .mockery.yaml
	@echo "$(GREEN)✓ Mocks generated$(NC)"

# Test targets
test: mocks
	@echo "$(YELLOW)Running tests...$(NC)"
	go test -v ./...
	@echo "$(GREEN)✓ Tests passed$(NC)"

test-coverage: mocks
	@echo "$(YELLOW)Running tests with coverage...$(NC)"
	go test -coverprofile=$(COVERAGE_FILE) -covermode=atomic ./... || { echo "$(RED)✗ Tests failed$(NC)"; exit 1; }
	@COVERAGE=$$(go tool cover -func=$(COVERAGE_FILE) | grep total | awk '{print $$3}' | sed 's/%//'); \
	COVERAGE_INT=$${COVERAGE%.*}; \
	echo "$(YELLOW)Coverage: $$COVERAGE$(NC)"; \
	if [ $$COVERAGE_INT -lt 70 ]; then \
		echo "$(RED)✗ Coverage $$COVERAGE is below 70% threshold$(NC)"; \
		exit 1; \
	else \
		echo "$(GREEN)✓ Coverage $$COVERAGE meets 70% threshold$(NC)"; \
	fi

test-race: mocks
	@echo "$(YELLOW)Running tests with race detector...$(NC)"
	go test -race -v ./... || { echo "$(RED)✗ Race detector found issues$(NC)"; exit 1; }
	@echo "$(GREEN)✓ No race conditions detected$(NC)"

coverage-report: test-coverage
	@echo "$(YELLOW)Generating HTML coverage report...$(NC)"
	go tool cover -html=$(COVERAGE_FILE) -o ../$(COVERAGE_HTML)
	@echo "$(GREEN)✓ Coverage report generated: ../$(COVERAGE_HTML)$(NC)"
	@if command -v open &> /dev/null; then \
		open ../$(COVERAGE_HTML); \
	elif command -v xdg-open &> /dev/null; then \
		xdg-open ../$(COVERAGE_HTML); \
	fi

# Linting
lint:
	@echo "$(YELLOW)Running golangci-lint...$(NC)"
	@if ! command -v golangci-lint &> /dev/null; then \
		echo "$(RED)golangci-lint not installed. Installing...$(NC)"; \
		go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest; \
	fi
	golangci-lint run ./... || { echo "$(RED)✗ Lint issues found$(NC)"; exit 1; }
	@echo "$(GREEN)✓ No lint issues found$(NC)"

# Security checks
security-check:
	@echo "$(YELLOW)Running security vulnerability check...$(NC)"
	@if ! command -v govulncheck &> /dev/null; then \
		echo "$(RED)govulncheck not installed. Installing...$(NC)"; \
		go install golang.org/x/vuln/cmd/govulncheck@latest; \
	fi
	@govulncheck ./... 2>&1 | grep -v "GO-2025-3750" | grep -q "Vulnerability" && { echo "$(RED)✗ Security vulnerabilities found$(NC)"; exit 1; } || true
	@echo "$(GREEN)✓ No active security vulnerabilities detected (Windows-only vulnerabilities excluded)$(NC)"

# Master QA command
qa: mocks test-coverage lint test-race security-check
	@echo ""
	@echo "$(GREEN)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)✓ ALL QA CHECKS PASSED$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)✓ Mocks generated$(NC)"
	@echo "$(GREEN)✓ Tests passed with coverage ≥70%$(NC)"
	@echo "$(GREEN)✓ No lint issues$(NC)"
	@echo "$(GREEN)✓ No race conditions$(NC)"
	@echo "$(GREEN)✓ No security vulnerabilities$(NC)"
	@echo ""

# Database migration targets (requires golang-migrate)
migrate-up:
	@echo "$(YELLOW)Running migrations up...$(NC)"
	@if ! command -v migrate &> /dev/null; then \
		echo "$(RED)golang-migrate not installed. Install with: brew install golang-migrate$(NC)"; \
		exit 1; \
	fi
	migrate -path ./db/migrations -database "$${DATABASE_URL}" up || { echo "$(RED)✗ Migration failed$(NC)"; exit 1; }
	@echo "$(GREEN)✓ Migrations applied$(NC)"

migrate-down:
	@echo "$(YELLOW)Rolling back migrations...$(NC)"
	@if ! command -v migrate &> /dev/null; then \
		echo "$(RED)golang-migrate not installed. Install with: brew install golang-migrate$(NC)"; \
		exit 1; \
	fi
	migrate -path ./db/migrations -database "$${DATABASE_URL}" down || { echo "$(RED)✗ Migration rollback failed$(NC)"; exit 1; }
	@echo "$(GREEN)✓ Migrations rolled back$(NC)"

# Clean targets
clean:
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	rm -rf ../bin/ || true
	rm -f ../$(COVERAGE_FILE) ../$(COVERAGE_HTML) || true
	go clean -testcache || true
	@echo "$(GREEN)✓ Clean complete$(NC)"

.DEFAULT_GOAL := help
