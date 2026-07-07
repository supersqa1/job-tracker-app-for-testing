#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
VENV_PYTHON="$BACKEND_DIR/.venv/bin/python"

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-3050}"

echo "Starting SuperSQA Job Tracker"
echo "Backend folder: $BACKEND_DIR"

cd "$BACKEND_DIR"

if [ ! -d ".venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv .venv
else
  echo "Using existing Python virtual environment."
fi

echo "Installing backend dependencies..."
"$VENV_PYTHON" -m pip install -r requirements.txt

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

echo "Starting app on http://localhost:$PORT"
echo "Swagger docs: http://localhost:$PORT/docs"
"$VENV_PYTHON" -m uvicorn app.main:app --host "$HOST" --port "$PORT"
