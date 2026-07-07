$Root = $PSScriptRoot
$BackendDir = Join-Path $Root "backend"

$BindHost = if ($env:HOST) { $env:HOST } else { "0.0.0.0" }
$Port = if ($env:PORT) { $env:PORT } else { "3050" }

Write-Host "Starting backend API"
Write-Host "Backend folder: $BackendDir"

Set-Location $BackendDir

if (-not (Test-Path ".env") -and (Test-Path ".env.example")) {
  Write-Host "Creating backend .env from .env.example..."
  Copy-Item ".env.example" ".env"
}

if (-not (Test-Path ".venv")) {
  Write-Host "Creating Python virtual environment..."
  python -m venv .venv
}

$Python = if (Test-Path ".venv\Scripts\python.exe") { ".venv\Scripts\python.exe" } else { "python" }

Write-Host "Installing backend dependencies..."
& $Python -m pip install -r requirements.txt

Write-Host "Backend API: http://localhost:$Port"
Write-Host "Swagger docs: http://localhost:$Port/docs"
& $Python -m uvicorn app.main:app --reload --host $BindHost --port $Port
