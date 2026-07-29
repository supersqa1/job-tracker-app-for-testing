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

py -3 --version >nul 2>nul
if not errorlevel 1 (
  for /f "tokens=2 delims= " %%V in ('py -3 --version 2^>^&1') do set "PYTHON_NUMBER=%%V"
  echo !PYTHON_NUMBER! | findstr /R "[A-Za-z]" >nul
  if errorlevel 1 (
    for /f "tokens=1,2 delims=." %%A in ("!PYTHON_NUMBER!") do (
      set "PYTHON_MAJOR=%%A"
      set "PYTHON_MINOR=%%B"
    )
    if "!PYTHON_MAJOR!"=="3" if !PYTHON_MINOR! GEQ 11 (
      set "SYSTEM_PYTHON=py -3"
      set "PYTHON_PATH=Windows Python launcher"
    )
  )
)

if "!SYSTEM_PYTHON!"=="" (
  python --version >nul 2>nul
  if not errorlevel 1 (
    for /f "tokens=2 delims= " %%V in ('python --version 2^>^&1') do set "PYTHON_NUMBER=%%V"
    echo !PYTHON_NUMBER! | findstr /R "[A-Za-z]" >nul
    if errorlevel 1 (
      for /f "tokens=1,2 delims=." %%A in ("!PYTHON_NUMBER!") do (
        set "PYTHON_MAJOR=%%A"
        set "PYTHON_MINOR=%%B"
      )
      if "!PYTHON_MAJOR!"=="3" if !PYTHON_MINOR! GEQ 11 (
        set "SYSTEM_PYTHON=python"
        set "PYTHON_PATH=python on PATH"
      )
    )
  )
)

if "!SYSTEM_PYTHON!"=="" (
  python3 --version >nul 2>nul
  if not errorlevel 1 (
    for /f "tokens=2 delims= " %%V in ('python3 --version 2^>^&1') do set "PYTHON_NUMBER=%%V"
    echo !PYTHON_NUMBER! | findstr /R "[A-Za-z]" >nul
    if errorlevel 1 (
      for /f "tokens=1,2 delims=." %%A in ("!PYTHON_NUMBER!") do (
        set "PYTHON_MAJOR=%%A"
        set "PYTHON_MINOR=%%B"
      )
      if "!PYTHON_MAJOR!"=="3" if !PYTHON_MINOR! GEQ 11 (
        set "SYSTEM_PYTHON=python3"
        set "PYTHON_PATH=python3 on PATH"
      )
    )
  )
)

if "!SYSTEM_PYTHON!"=="" (
  py -3.13 --version >nul 2>nul
  if not errorlevel 1 (
    set "SYSTEM_PYTHON=py -3.13"
    set "PYTHON_PATH=Windows Python launcher ^(Python 3.13^)"
  )
)

if "!SYSTEM_PYTHON!"=="" (
  py -3.12 --version >nul 2>nul
  if not errorlevel 1 (
    set "SYSTEM_PYTHON=py -3.12"
    set "PYTHON_PATH=Windows Python launcher ^(Python 3.12^)"
  )
)

if "!SYSTEM_PYTHON!"=="" (
  py -3.11 --version >nul 2>nul
  if not errorlevel 1 (
    set "SYSTEM_PYTHON=py -3.11"
    set "PYTHON_PATH=Windows Python launcher ^(Python 3.11^)"
  )
)

if "!SYSTEM_PYTHON!"=="" (
  echo ============================================================
  echo Supported Python was not found.
  echo Please install a stable Python 3.11 or newer, then run this script again.
  echo Python alpha, beta, and release-candidate builds are not supported for this course app.
  echo ============================================================
  exit /b 1
)

for /f "delims=" %%V in ('%SYSTEM_PYTHON% --version 2^>^&1') do set "PYTHON_VERSION=%%V"

echo ============================================================
echo Python setup
echo Python command: %SYSTEM_PYTHON%
echo Python source: %PYTHON_PATH%
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
echo Runtime Python: %BACKEND_DIR%\.venv\Scripts\python.exe
"%PYTHON%" -m pip install -r requirements.txt

echo Backend API: http://localhost:%PORT%
echo Swagger docs: http://localhost:%PORT%/docs
"%PYTHON%" -m uvicorn app.main:app --reload --host "%HOST%" --port "%PORT%"
