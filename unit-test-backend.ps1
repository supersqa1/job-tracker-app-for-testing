$Root = $PSScriptRoot
$BackendDir = Join-Path $Root "backend"
$VenvDir = Join-Path $BackendDir ".venv"

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

$Python = ".venv\Scripts\python.exe"

Write-Host "Installing backend dependencies..."
& $Python -m pip install -r requirements.txt

& $Python -m pytest
