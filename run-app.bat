@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"

if "%HOST%"=="" set "HOST=0.0.0.0"
if "%PORT%"=="" set "PORT=3050"

echo Starting SuperSQA Job Tracker
echo Backend folder: %BACKEND_DIR%

cd /d "%BACKEND_DIR%"

if not exist ".venv" (
  echo Creating Python virtual environment...
  python -m venv .venv
) else (
  echo Using existing Python virtual environment.
)

echo Installing backend dependencies...
".venv\Scripts\python.exe" -m pip install -r requirements.txt

if not exist ".env" (
  if exist ".env.example" (
    echo Creating .env from .env.example...
    copy ".env.example" ".env" >nul
  )
)

echo Starting app on http://localhost:%PORT%
echo Swagger docs: http://localhost:%PORT%/docs
".venv\Scripts\python.exe" -m uvicorn app.main:app --host "%HOST%" --port "%PORT%"
