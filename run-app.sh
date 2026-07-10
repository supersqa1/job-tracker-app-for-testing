#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
VENV_PYTHON="$BACKEND_DIR/.venv/bin/python"
VENV_DIR="$BACKEND_DIR/.venv"
STATIC_INDEX="$BACKEND_DIR/static/index.html"

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-3050}"

echo "Starting SuperSQA Job Tracker"
echo "Backend folder: $BACKEND_DIR"

if [ ! -f "$STATIC_INDEX" ]; then
  echo "============================================================"
  echo "Packaged frontend was not found."
  echo "Expected file: $STATIC_INDEX"
  echo "Run ./build-course-app.sh first, then run ./run-app.sh again."
  echo "============================================================"
  exit 1
fi

cd "$BACKEND_DIR"

if command -v python3 >/dev/null 2>&1; then
  SYSTEM_PYTHON="$(command -v python3)"
elif command -v python >/dev/null 2>&1; then
  SYSTEM_PYTHON="$(command -v python)"
else
  echo "============================================================"
  echo "Python was not found."
  echo "Please install Python 3.11 or newer, then run this script again."
  echo "============================================================"
  exit 1
fi

PYTHON_VERSION="$("$SYSTEM_PYTHON" --version 2>&1)"

echo "============================================================"
echo "Python setup"
echo "Python command: $SYSTEM_PYTHON"
echo "Python version: $PYTHON_VERSION"
echo "Virtual environment: $VENV_DIR"
echo "============================================================"

if [ ! -d "$VENV_DIR" ]; then
  echo "The virtual environment does not exist yet."
  echo "This script will create it at:"
  echo "$VENV_DIR"
  printf "Type yes to continue, or no to abort: "
  read answer
  if [ "$answer" != "yes" ]; then
    echo "Aborted. No changes were made."
    exit 1
  fi
  echo "Creating Python virtual environment..."
  "$SYSTEM_PYTHON" -m venv .venv
else
  echo "Virtual environment already exists. Continuing with:"
  echo "$VENV_DIR"
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
