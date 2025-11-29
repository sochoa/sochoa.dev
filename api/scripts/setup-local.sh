#!/bin/bash
# Local development setup script for sochoa.dev API with SQLite

set -e

echo "🔧 Setting up local development environment..."

# Get the database path
CACHE_DIR="$HOME/.cache/sochoa.dev"
DB_PATH="$CACHE_DIR/api.db"

echo "📁 Database location: $DB_PATH"

# Create cache directory if it doesn't exist
mkdir -p "$CACHE_DIR"

# Check if migrate is installed
if ! command -v migrate &> /dev/null; then
    echo "❌ golang-migrate is not installed"
    echo "Install it with: brew install golang-migrate"
    exit 1
fi

# Run migrations
echo "📝 Running database migrations..."
MIGRATION_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/db/migrations"
migrate -path "$MIGRATION_PATH" -database "sqlite3://$DB_PATH" up

echo "✅ Database setup complete!"
echo ""
echo "🚀 To start the API:"
echo "  DEV_MODE=true ./api"
echo ""
echo "Or with a custom port:"
echo "  DEV_MODE=true ./api --port 3000"
