$Root = $PSScriptRoot
$BackendDir = Join-Path $Root "backend"
$VenvDir = Join-Path $BackendDir ".venv"

Set-Location $BackendDir

$PythonCommand = $null
$PythonArgs = @()
$Candidates = @(
  @{ Command = "py"; Args = @("-3") },
  @{ Command = "python"; Args = @() },
  @{ Command = "python3"; Args = @() },
  @{ Command = "py"; Args = @("-3.13") },
  @{ Command = "py"; Args = @("-3.12") },
  @{ Command = "py"; Args = @("-3.11") }
)

foreach ($Candidate in $Candidates) {
  $Command = Get-Command $Candidate.Command -ErrorAction SilentlyContinue
  if (-not $Command) {
    continue
  }

  $VersionOutput = & $Command.Source @($Candidate.Args) --version 2>&1
  if ($LASTEXITCODE -ne 0 -or -not ($VersionOutput -match "Python (\d+)\.(\d+)\.(\d+)([A-Za-z].*)?")) {
    continue
  }

  $Major = [int]$Matches[1]
  $Minor = [int]$Matches[2]
  $Prerelease = $Matches[4]
  if ($Major -eq 3 -and $Minor -ge 11 -and -not $Prerelease) {
    $PythonCommand = $Command
    $PythonArgs = @($Candidate.Args)
    break
  }
}

if (-not $PythonCommand) {
  Write-Host "============================================================"
  Write-Host "Supported Python was not found."
  Write-Host "Please install a stable Python 3.11 or newer, then run this script again."
  Write-Host "Python alpha, beta, and release-candidate builds are not supported for this course app."
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

$Python = ".venv\Scripts\python.exe"

Write-Host "Installing backend dependencies..."
& $Python -m pip install -r requirements.txt

& $Python -m pytest
