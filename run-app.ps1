$RootDir = $PSScriptRoot
$BackendDir = Join-Path $RootDir "backend"
$VenvDir = Join-Path $BackendDir ".venv"
$StaticIndex = Join-Path $BackendDir "static/index.html"

$BindHost = if ($env:HOST) { $env:HOST } else { "0.0.0.0" }
$Port = if ($env:PORT) { $env:PORT } else { "3050" }

Write-Host "Starting SuperSQA Job Tracker"
Write-Host "Backend folder: $BackendDir"

if (-not (Test-Path $StaticIndex)) {
  Write-Host "============================================================"
  Write-Host "Packaged frontend was not found."
  Write-Host "Expected file: $StaticIndex"
  Write-Host "Run .\build-course-app.ps1 first, then run .\run-app.ps1 again."
  Write-Host "============================================================"
  exit 1
}

Set-Location $BackendDir

$PythonCommand = Get-Command python3 -ErrorAction SilentlyContinue
if (-not $PythonCommand) {
  $PythonCommand = Get-Command python -ErrorAction SilentlyContinue
}

if (-not $PythonCommand) {
  Write-Host "============================================================"
  Write-Host "Python was not found."
  Write-Host "Please install Python 3.11 or newer, then run this script again."
  Write-Host "============================================================"
  exit 1
}

$SystemPython = $PythonCommand.Source
$PythonVersion = & $SystemPython --version

Write-Host "============================================================"
Write-Host "Python setup"
Write-Host "Python command: $SystemPython"
Write-Host "Python version: $PythonVersion"
Write-Host "Virtual environment: $VenvDir"
Write-Host "============================================================"

if (-not (Test-Path ".venv")) {
  Write-Host "The virtual environment does not exist yet."
  Write-Host "This script will create it at:"
  Write-Host $VenvDir
  $Answer = Read-Host "Type yes to continue, or no to abort"
  if ($Answer -ne "yes") {
    Write-Host "Aborted. No changes were made."
    exit 1
  }
  Write-Host "Creating Python virtual environment..."
  & $SystemPython -m venv .venv
} else {
  Write-Host "Virtual environment already exists. Continuing with:"
  Write-Host $VenvDir
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
