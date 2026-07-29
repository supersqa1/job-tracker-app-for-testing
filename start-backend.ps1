$Root = $PSScriptRoot
$BackendDir = Join-Path $Root "backend"
$VenvDir = Join-Path $BackendDir ".venv"

$BindHost = if ($env:HOST) { $env:HOST } else { "0.0.0.0" }
$Port = if ($env:PORT) { $env:PORT } else { "3050" }

Write-Host "Starting backend API"
Write-Host "Backend folder: $BackendDir"

Set-Location $BackendDir

$PythonCommand = $null
$PythonArgs = @()
$Candidates = @(
  @{ Command = "py"; Args = @("-3.13") },
  @{ Command = "py"; Args = @("-3.12") },
  @{ Command = "py"; Args = @("-3.11") },
  @{ Command = "python"; Args = @() },
  @{ Command = "python3"; Args = @() }
)

foreach ($Candidate in $Candidates) {
  $Command = Get-Command $Candidate.Command -ErrorAction SilentlyContinue
  if (-not $Command) {
    continue
  }

  $VersionOutput = & $Command.Source @($Candidate.Args) --version 2>&1
  if ($LASTEXITCODE -ne 0 -or -not ($VersionOutput -match "Python (\d+)\.(\d+)")) {
    continue
  }

  $Major = [int]$Matches[1]
  $Minor = [int]$Matches[2]
  if ($Major -eq 3 -and $Minor -ge 11 -and $Minor -le 13) {
    $PythonCommand = $Command
    $PythonArgs = @($Candidate.Args)
    break
  }
}

if (-not $PythonCommand) {
  Write-Host "============================================================"
  Write-Host "Supported Python was not found."
  Write-Host "Please install Python 3.11, 3.12, or 3.13, then run this script again."
  Write-Host "Python 3.14 or newer may not have compatible package wheels yet."
  Write-Host "============================================================"
  exit 1
}

$SystemPython = $PythonCommand.Source
$PythonDisplay = if ($PythonArgs.Count -gt 0) { "$SystemPython $($PythonArgs -join ' ')" } else { $SystemPython }
$PythonVersion = & $SystemPython @PythonArgs --version

Write-Host "============================================================"
Write-Host "Python setup"
Write-Host "Python command: $PythonDisplay"
Write-Host "Python version: $PythonVersion"
Write-Host "Virtual environment: $VenvDir"
Write-Host "============================================================"

if (-not (Test-Path ".env") -and (Test-Path ".env.example")) {
  Write-Host "Creating backend .env from .env.example..."
  Copy-Item ".env.example" ".env"
}

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
  & $SystemPython @PythonArgs -m venv .venv
} else {
  Write-Host "Virtual environment already exists. Continuing with:"
  Write-Host $VenvDir
}

$Python = if (Test-Path ".venv\Scripts\python.exe") { ".venv\Scripts\python.exe" } else { $SystemPython }

Write-Host "Installing backend dependencies..."
& $Python -m pip install -r requirements.txt

Write-Host "Backend API: http://localhost:$Port"
Write-Host "Swagger docs: http://localhost:$Port/docs"
& $Python -m uvicorn app.main:app --reload --host $BindHost --port $Port
