@echo off
setlocal EnableDelayedExpansion

cd /d "%~dp0"
set "BACKEND_DIR=%~dp0backend"
set "VENV_DIR=%BACKEND_DIR%\.venv"

if "%HOST%"=="" set "HOST=0.0.0.0"
if "%PORT%"=="" set "PORT=3050"

echo Starting backend API
echo Backend folder: %BACKEND_DIR%

cd /d "%BACKEND_DIR%"

where python3 >nul 2>nul
if not errorlevel 1 (
  set "SYSTEM_PYTHON=python3"
) else (
  where python >nul 2>nul
  if not errorlevel 1 (
    set "SYSTEM_PYTHON=python"
  ) else (
    echo ============================================================
    echo Python was not found.
    echo Please install Python 3.11 or newer, then run this script again.
    echo ============================================================
    exit /b 1
  )
)

for /f "delims=" %%V in ('%SYSTEM_PYTHON% --version 2^>^&1') do set "PYTHON_VERSION=%%V"
for /f "delims=" %%P in ('where %SYSTEM_PYTHON% 2^>nul') do (
  set "PYTHON_PATH=%%P"
  goto found_python_path_start_backend
)
:found_python_path_start_backend

echo ============================================================
echo Python setup
echo Python command: %SYSTEM_PYTHON%
echo Python path: %PYTHON_PATH%
echo Python version: %PYTHON_VERSION%
echo Virtual environment: %VENV_DIR%
echo ============================================================

if not exist ".env" (
  if exist ".env.example" (
    echo Creating backend .env from .env.example...
    copy ".env.example" ".env" >nul
  )
)

if not exist ".venv" (
  echo The virtual environment does not exist yet.
  echo This script will create it at:
  echo %VENV_DIR%
  set /p ANSWER=Type yes to continue, or no to abort:
  if /i not "!ANSWER!"=="yes" (
    echo Aborted. No changes were made.
    exit /b 1
  )
  echo Creating Python virtual environment...
  %SYSTEM_PYTHON% -m venv .venv
 ) else (
  echo Virtual environment already exists. Continuing with:
  echo %VENV_DIR%
)

if exist ".venv\Scripts\python.exe" (
  set "PYTHON=.venv\Scripts\python.exe"
) else (
  set "PYTHON=%SYSTEM_PYTHON%"
)

echo Installing backend dependencies...
"%PYTHON%" -m pip install -r requirements.txt

echo Backend API: http://localhost:%PORT%
echo Swagger docs: http://localhost:%PORT%/docs
"%PYTHON%" -m uvicorn app.main:app --reload --host "%HOST%" --port "%PORT%"
