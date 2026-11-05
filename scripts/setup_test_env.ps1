<#
.SYNOPSIS
    Create or refresh the test virtual environment and run the test suite.

.DESCRIPTION
    Home Assistant 2026.10 requires Python 3.14, and its test harness imports the
    POSIX-only modules ``fcntl`` and ``resource``. On Windows this script:

      1. creates a 3.14 virtual environment at .venv (unless one already exists),
      2. installs the pinned test requirements,
      3. installs tests/win_shims so those two modules can be imported,
      4. runs pytest.

    On Linux/macOS step 3 is skipped and the real modules are used.

.EXAMPLE
    ./scripts/setup_test_env.ps1
    ./scripts/setup_test_env.ps1 -TestArgs tests/test_energy.py -v
#>
[CmdletBinding()]
param(
    [string[]] $TestArgs = @(),
    [switch] $Recreate
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$venvPath = Join-Path $root ".venv"
$venvPython = Join-Path $venvPath "Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    $venvPython = Join-Path $venvPath "bin\python"
}

$requiredMajor = 3
$requiredMinor = 14
$isWindows = $env:OS -eq "Windows_NT"

function Get-VenvVersion {
    param([string] $Python)
    $raw = & $Python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
    return $raw.Trim()
}

function Find-BasePython {
    $candidates = @(
        (Join-Path $env:LOCALAPPDATA "uv\python\cpython-3.14.5-windows-x86_64-none\python.exe"),
        (Join-Path $env:USERPROFILE ".local\bin\python3.14.exe")
    )
    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) { return $candidate }
    }
    $uv = Get-Command uv -ErrorAction SilentlyContinue
    if ($uv) {
        $found = & uv python find 3.14 2>$null
        if ($LASTEXITCODE -eq 0 -and $found) { return $found.Trim() }
    }
    $py = Get-Command py -ErrorAction SilentlyContinue
    if ($py) {
        $found = & py -3.14 -c "import sys; print(sys.executable)" 2>$null
        if ($LASTEXITCODE -eq 0 -and $found) { return $found.Trim() }
    }
    return $null
}

$needsVenv = $Recreate -or -not (Test-Path $venvPython)
if (-not $needsVenv) {
    $current = Get-VenvVersion -Python $venvPython
    if ($current -ne "$requiredMajor.$requiredMinor") {
        Write-Host "Existing .venv runs Python $current; recreating for $requiredMajor.$requiredMinor" -ForegroundColor Yellow
        $needsVenv = $true
    }
}

if ($needsVenv) {
    $base = Find-BasePython
    if (-not $base) {
        throw @"
Python $requiredMajor.$requiredMinor was not found.

Install it once, then re-run this script:

    winget install --id Python.Python.$requiredMajor.$requiredMinor --scope user
    # or
    uv python install $requiredMajor.$requiredMinor

Home Assistant 2026.10 refuses to run on older Python versions.
"@
    }
    if (Test-Path $venvPath) { Remove-Item -Recurse -Force $venvPath }
    Write-Host "Creating .venv with $base" -ForegroundColor Cyan
    & $base -m venv $venvPath
    if ($LASTEXITCODE -ne 0) { throw "venv creation failed" }
}

Write-Host "Installing test requirements" -ForegroundColor Cyan
& $venvPython -m pip install --upgrade pip --quiet
& $venvPython -m pip install -r (Join-Path $root "requirements_test.txt") --quiet
if ($LASTEXITCODE -ne 0) { throw "dependency installation failed" }

if ($isWindows) {
    Write-Host "Installing Windows POSIX shims (fcntl, resource)" -ForegroundColor Cyan
    & $venvPython -m pip install (Join-Path $root "tests\win_shims") --quiet --force-reinstall
    if ($LASTEXITCODE -ne 0) { throw "shim installation failed" }
}

Write-Host "Running tests" -ForegroundColor Cyan
& $venvPython -m pytest @TestArgs
exit $LASTEXITCODE
