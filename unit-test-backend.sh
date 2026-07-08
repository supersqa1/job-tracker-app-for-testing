#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
VENV_DIR="$BACKEND_DIR/.venv"

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

PYTHON=.venv/bin/python

echo "Installing backend dependencies..."
"$PYTHON" -m pip install -r requirements.txt

exec "$PYTHON" -m pytest
