$RootDir = $PSScriptRoot
$BackendDir = Join-Path $RootDir "backend"

$BindHost = if ($env:HOST) { $env:HOST } else { "0.0.0.0" }
$Port = if ($env:PORT) { $env:PORT } else { "3050" }

Write-Host "Starting SuperSQA Job Tracker"
Write-Host "Backend folder: $BackendDir"

Set-Location $BackendDir

if (-not (Test-Path ".venv")) {
  Write-Host "Creating Python virtual environment..."
  python -m venv .venv
} else {
  Write-Host "Using existing Python virtual environment."
}

Write-Host "Installing backend dependencies..."
& ".venv\Scripts\python.exe" -m pip install -r requirements.txt

if (-not (Test-Path ".env") -and (Test-Path ".env.example")) {
  Write-Host "Creating .env from .env.example..."
  Copy-Item ".env.example" ".env"
}

Write-Host "Starting app on http://localhost:$Port"
Write-Host "Swagger docs: http://localhost:$Port/docs"
& ".venv\Scripts\python.exe" -m uvicorn app.main:app --host $BindHost --port $Port
