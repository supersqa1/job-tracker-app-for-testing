@echo off
setlocal

cd /d "%~dp0backend"

if exist ".venv\Scripts\python.exe" (
  ".venv\Scripts\python.exe" -m pytest --version >nul 2>nul
  if not errorlevel 1 (
    ".venv\Scripts\python.exe" -m pytest
    exit /b %errorlevel%
  )
)

python -m pytest
