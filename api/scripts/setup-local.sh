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

# Note: Migrations run automatically on API startup
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the API (migrations run automatically):"
echo "  ./api"
echo ""
echo "Or with a custom port:"
echo "  ./api --port 3000"
echo ""
echo "💡 Note: Database and tables are created automatically on first run."
