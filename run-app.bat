@echo off
setlocal EnableDelayedExpansion

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "VENV_DIR=%BACKEND_DIR%\.venv"
set "STATIC_INDEX=%BACKEND_DIR%\static\index.html"

if "%HOST%"=="" set "HOST=0.0.0.0"
if "%PORT%"=="" set "PORT=3050"

echo Starting SuperSQA Job Tracker
echo Backend folder: %BACKEND_DIR%

if not exist "%STATIC_INDEX%" (
  echo ============================================================
  echo Packaged frontend was not found.
  echo Expected file: %STATIC_INDEX%
  echo Run build-course-app.bat first, then run run-app.bat again.
  echo ============================================================
  exit /b 1
)

cd /d "%BACKEND_DIR%"

py -3.13 --version >nul 2>nul
if not errorlevel 1 (
  set "SYSTEM_PYTHON=py -3.13"
  set "PYTHON_PATH=Windows Python launcher ^(Python 3.13^)"
) else (
  py -3.12 --version >nul 2>nul
  if not errorlevel 1 (
    set "SYSTEM_PYTHON=py -3.12"
    set "PYTHON_PATH=Windows Python launcher ^(Python 3.12^)"
  ) else (
    py -3.11 --version >nul 2>nul
    if not errorlevel 1 (
      set "SYSTEM_PYTHON=py -3.11"
      set "PYTHON_PATH=Windows Python launcher ^(Python 3.11^)"
    ) else (
      python --version >nul 2>nul
      if not errorlevel 1 (
        for /f "tokens=2 delims= " %%V in ('python --version 2^>^&1') do set "PYTHON_NUMBER=%%V"
        for /f "tokens=1,2 delims=." %%A in ("!PYTHON_NUMBER!") do (
          set "PYTHON_MAJOR=%%A"
          set "PYTHON_MINOR=%%B"
        )
        if "!PYTHON_MAJOR!"=="3" if !PYTHON_MINOR! GEQ 11 if !PYTHON_MINOR! LEQ 13 (
          set "SYSTEM_PYTHON=python"
          for /f "delims=" %%P in ('where python 2^>nul') do set "PYTHON_PATH=%%P"
        )
      )
      if "!SYSTEM_PYTHON!"=="" (
        python3 --version >nul 2>nul
        if not errorlevel 1 (
          for /f "tokens=2 delims= " %%V in ('python3 --version 2^>^&1') do set "PYTHON_NUMBER=%%V"
          for /f "tokens=1,2 delims=." %%A in ("!PYTHON_NUMBER!") do (
            set "PYTHON_MAJOR=%%A"
            set "PYTHON_MINOR=%%B"
          )
          if "!PYTHON_MAJOR!"=="3" if !PYTHON_MINOR! GEQ 11 if !PYTHON_MINOR! LEQ 13 (
            set "SYSTEM_PYTHON=python3"
            for /f "delims=" %%P in ('where python3 2^>nul') do set "PYTHON_PATH=%%P"
          )
        )
      )
    )
  )
)

if "%SYSTEM_PYTHON%"=="" (
  echo ============================================================
  echo Supported Python was not found.
  echo Please install Python 3.11, 3.12, or 3.13, then run this script again.
  echo Python 3.14 or newer may not have compatible package wheels yet.
  echo ============================================================
  exit /b 1
)

for /f "delims=" %%V in ('%SYSTEM_PYTHON% --version 2^>^&1') do set "PYTHON_VERSION=%%V"

echo ============================================================
echo Python setup
echo Python command: %SYSTEM_PYTHON%
echo Python path: %PYTHON_PATH%
echo Python version: %PYTHON_VERSION%
echo Virtual environment: %VENV_DIR%
echo ============================================================

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
