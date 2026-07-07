$Root = $PSScriptRoot
Set-Location "$Root\backend"

if (Test-Path ".venv\Scripts\python.exe") {
  & ".venv\Scripts\python.exe" -m pytest --version *> $null
  if ($LASTEXITCODE -eq 0) {
    & ".venv\Scripts\python.exe" -m pytest
    exit $LASTEXITCODE
  }
}

& python -m pytest
