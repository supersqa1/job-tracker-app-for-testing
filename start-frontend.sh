#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"

FRONTEND_HOST="${FRONTEND_HOST:-0.0.0.0}"
FRONTEND_PORT="${FRONTEND_PORT:-8050}"

echo "Starting frontend app"
echo "Frontend folder: $FRONTEND_DIR"

cd "$FRONTEND_DIR"

if [ ! -f ".env.local" ] && [ -f ".env.local.example" ]; then
  echo "Creating frontend .env.local from .env.local.example..."
  cp .env.local.example .env.local
fi

if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi

echo "Frontend app: http://localhost:$FRONTEND_PORT"
exec ./node_modules/.bin/next dev -H "$FRONTEND_HOST" -p "$FRONTEND_PORT"
