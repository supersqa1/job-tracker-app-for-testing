#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-3050}"

echo "Starting backend API"
echo "Backend folder: $BACKEND_DIR"

cd "$BACKEND_DIR"

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  echo "Creating backend .env from .env.example..."
  cp .env.example .env
fi

if [ ! -d ".venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv .venv
fi

if [ -x .venv/bin/python ]; then
  PYTHON=.venv/bin/python
else
  PYTHON=python3
fi

echo "Installing backend dependencies..."
"$PYTHON" -m pip install -r requirements.txt

echo "Backend API: http://localhost:$PORT"
echo "Swagger docs: http://localhost:$PORT/docs"
exec "$PYTHON" -m uvicorn app.main:app --reload --host "$HOST" --port "$PORT"
