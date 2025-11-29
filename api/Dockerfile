# Build stage
FROM golang:1.25-alpine AS builder

WORKDIR /build

# Install build dependencies (including gcc for CGO/SQLite)
# Cached layer: only invalidates if apk packages change
RUN apk add --no-cache git ca-certificates tzdata gcc musl-dev sqlite-dev

# Copy go mod files (separate layer for better caching)
# Cached layer: only invalidates if go.mod/go.sum change
COPY go.mod go.sum ./

# Download dependencies (cached layer)
# This layer stays cached if source code changes but go.mod doesn't
RUN go mod download

# Copy source code (invalidates cache if any source changes)
COPY . .

# Build the binary with optimizations
# Flags:
#   -trimpath: remove absolute paths (reproducible builds, better caching)
#   -ldflags="-s -w": strip symbols & debug info (10-20% smaller binary)
RUN CGO_ENABLED=1 GOOS=linux \
    go build \
      -trimpath \
      -ldflags="-s -w" \
      -o api \
      .

# Runtime stage
FROM alpine:latest

WORKDIR /app

# Install runtime dependencies (sqlite3, ca-certificates, tzdata)
RUN apk add --no-cache ca-certificates tzdata sqlite-libs

# Create non-root user
RUN addgroup -g 1000 api && adduser -D -u 1000 -G api api

# Copy binary from builder
COPY --from=builder /build/api .

# Change ownership
RUN chown -R api:api /app

# Create cache directory
RUN mkdir -p /home/api/.cache/sochoa.dev && chown -R api:api /home/api

# Switch to non-root user
USER api

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Default environment (can be overridden)
ENV DEV_MODE=true
ENV DEV_USER_ROLE=admin
ENV LOG_LEVEL=debug

# Run the API
CMD ["./api"]
