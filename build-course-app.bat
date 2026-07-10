@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "FRONTEND_DIR=%ROOT_DIR%frontend"
set "BACKEND_STATIC_DIR=%ROOT_DIR%backend\static"

echo ============================================================
echo Building packaged course app
echo Frontend folder: %FRONTEND_DIR%
echo Backend static folder: %BACKEND_STATIC_DIR%
echo ============================================================

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found.
  echo Install Node.js, then run this script again.
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found.
  echo Install Node.js with npm, then run this script again.
  exit /b 1
)

cd /d "%FRONTEND_DIR%"

if not exist "node_modules" (
  echo Installing frontend dependencies...
  npm install
) else (
  echo Using existing frontend dependencies.
)

echo Building static frontend...
set "NEXT_PUBLIC_API_URL=__SAME_ORIGIN__"
npm run build:course

if not exist "%FRONTEND_DIR%\out\index.html" (
  echo Static frontend build failed. Missing frontend\out\index.html.
  exit /b 1
)

echo Refreshing backend static files...
if not exist "%BACKEND_STATIC_DIR%" mkdir "%BACKEND_STATIC_DIR%"
del /q "%BACKEND_STATIC_DIR%\*" >nul 2>nul
for /d %%D in ("%BACKEND_STATIC_DIR%\*") do rmdir /s /q "%%D"
xcopy "%FRONTEND_DIR%\out\*" "%BACKEND_STATIC_DIR%\" /e /i /y >nul

echo ============================================================
echo Packaged course app is ready.
echo Easy mode will serve the UI from backend\static.
echo Run: run-app.bat
echo Open: http://localhost:3050
echo ============================================================
