#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_STATIC_DIR="$ROOT_DIR/backend/static"

echo "============================================================"
echo "Building packaged course app"
echo "Frontend folder: $FRONTEND_DIR"
echo "Backend static folder: $BACKEND_STATIC_DIR"
echo "============================================================"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js was not found."
  echo "Install Node.js, then run this script again."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm was not found."
  echo "Install Node.js with npm, then run this script again."
  exit 1
fi

cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
else
  echo "Using existing frontend dependencies."
fi

echo "Building static frontend..."
NEXT_PUBLIC_API_URL="__SAME_ORIGIN__" npm run build:course

if [ ! -f "$FRONTEND_DIR/out/index.html" ]; then
  echo "Static frontend build failed. Missing frontend/out/index.html."
  exit 1
fi

echo "Refreshing backend static files..."
mkdir -p "$BACKEND_STATIC_DIR"
find "$BACKEND_STATIC_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
cp -R "$FRONTEND_DIR/out/." "$BACKEND_STATIC_DIR/"

echo "============================================================"
echo "Packaged course app is ready."
echo "Easy mode will serve the UI from backend/static."
echo "Run: ./run-app.sh"
echo "Open: http://localhost:3050"
echo "============================================================"
