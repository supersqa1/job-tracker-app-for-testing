$Root = $PSScriptRoot
$FrontendDir = Join-Path $Root "frontend"

$BindHost = if ($env:FRONTEND_HOST) { $env:FRONTEND_HOST } else { "0.0.0.0" }
$Port = if ($env:FRONTEND_PORT) { $env:FRONTEND_PORT } else { "8050" }

Write-Host "Starting frontend app"
Write-Host "Frontend folder: $FrontendDir"

Set-Location $FrontendDir

if (-not (Test-Path ".env.local") -and (Test-Path ".env.local.example")) {
  Write-Host "Creating frontend .env.local from .env.local.example..."
  Copy-Item ".env.local.example" ".env.local"
}

if (-not (Test-Path "node_modules")) {
  Write-Host "Installing frontend dependencies..."
  npm install
}

Write-Host "Frontend app: http://localhost:$Port"
& "node_modules\.bin\next.cmd" dev -H $BindHost -p $Port
