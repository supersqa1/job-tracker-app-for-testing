#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/backend"

if [ -x .venv/bin/python ] && .venv/bin/python -m pytest --version >/dev/null 2>&1; then
  PYTHON=.venv/bin/python
else
  PYTHON=python3
fi

exec "$PYTHON" -m pytest
