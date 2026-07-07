@echo off
setlocal

cd /d "%~dp0"

if "%HOST%"=="" set "HOST=0.0.0.0"
if "%PORT%"=="" set "PORT=3050"

echo Starting backend API
echo Backend folder: %~dp0backend

cd /d "%~dp0backend"

if not exist ".env" (
  if exist ".env.example" (
    echo Creating backend .env from .env.example...
    copy ".env.example" ".env" >nul
  )
)

if not exist ".venv" (
  echo Creating Python virtual environment...
  python -m venv .venv
)

if exist ".venv\Scripts\python.exe" (
  set "PYTHON=.venv\Scripts\python.exe"
) else (
  set "PYTHON=python"
)

echo Installing backend dependencies...
"%PYTHON%" -m pip install -r requirements.txt

echo Backend API: http://localhost:%PORT%
echo Swagger docs: http://localhost:%PORT%/docs
"%PYTHON%" -m uvicorn app.main:app --reload --host "%HOST%" --port "%PORT%"
