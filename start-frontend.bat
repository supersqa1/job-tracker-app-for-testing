@echo off
setlocal

cd /d "%~dp0"

if "%FRONTEND_HOST%"=="" set "FRONTEND_HOST=0.0.0.0"
if "%FRONTEND_PORT%"=="" set "FRONTEND_PORT=8050"

echo Starting frontend app
echo Frontend folder: %~dp0frontend

cd /d "%~dp0frontend"

if not exist ".env.local" (
  if exist ".env.local.example" (
    echo Creating frontend .env.local from .env.local.example...
    copy ".env.local.example" ".env.local" >nul
  )
)

if not exist "node_modules" (
  echo Installing frontend dependencies...
  npm install
)

echo Frontend app: http://localhost:%FRONTEND_PORT%
node_modules\.bin\next.cmd dev -H "%FRONTEND_HOST%" -p "%FRONTEND_PORT%"
