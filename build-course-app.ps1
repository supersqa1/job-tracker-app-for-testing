$RootDir = $PSScriptRoot
$FrontendDir = Join-Path $RootDir "frontend"
$BackendStaticDir = Join-Path $RootDir "backend/static"

Write-Host "============================================================"
Write-Host "Building packaged course app"
Write-Host "Frontend folder: $FrontendDir"
Write-Host "Backend static folder: $BackendStaticDir"
Write-Host "============================================================"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js was not found."
  Write-Host "Install Node.js, then run this script again."
  exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "npm was not found."
  Write-Host "Install Node.js with npm, then run this script again."
  exit 1
}

Set-Location $FrontendDir

if (-not (Test-Path "node_modules")) {
  Write-Host "Installing frontend dependencies..."
  npm install
} else {
  Write-Host "Using existing frontend dependencies."
}

Write-Host "Building static frontend..."
$env:NEXT_PUBLIC_API_URL = "__SAME_ORIGIN__"
npm run build:course

$IndexFile = Join-Path $FrontendDir "out/index.html"
if (-not (Test-Path $IndexFile)) {
  Write-Host "Static frontend build failed. Missing frontend/out/index.html."
  exit 1
}

Write-Host "Refreshing backend static files..."
New-Item -ItemType Directory -Force -Path $BackendStaticDir | Out-Null
Get-ChildItem -Force $BackendStaticDir | Remove-Item -Recurse -Force
Copy-Item -Path (Join-Path $FrontendDir "out/*") -Destination $BackendStaticDir -Recurse -Force

Write-Host "============================================================"
Write-Host "Packaged course app is ready."
Write-Host "Easy mode will serve the UI from backend/static."
Write-Host "Run: .\run-app.ps1"
Write-Host "Open: http://localhost:3050"
Write-Host "============================================================"
