$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$backendDir = Join-Path $repoRoot 'backend'
$frontendDir = Join-Path $repoRoot 'frontend'
$frontendDistIndex = Join-Path $frontendDir 'dist\index.html'
$edgeOpenerScript = Join-Path $repoRoot 'scripts\playwright\open_recall_in_edge.mjs'
$backendVenvPythonWindows = Join-Path $backendDir '.venv\bin\python'
$healthUrl = 'http://127.0.0.1:8000/api/health'
$recallUrl = 'http://127.0.0.1:8000/recall'
$targetUrl = if ($env:RECALL_OPEN_APP_URL) { $env:RECALL_OPEN_APP_URL } else { $recallUrl }
$playwrightHarness = if ($env:RECALL_OPEN_APP_PLAYWRIGHT_HARNESS) {
  $env:RECALL_OPEN_APP_PLAYWRIGHT_HARNESS
} else {
  'C:\Users\FA507\AppData\Local\Temp\accessible-reader-playwright'
}
$backendStdoutLog = Join-Path $env:TEMP 'accessible-reader-open-app-backend.stdout.log'
$backendStderrLog = Join-Path $env:TEMP 'accessible-reader-open-app-backend.stderr.log'
$startupTimeoutSeconds = 45

function Convert-ToWslPath {
  param(
    [Parameter(Mandatory = $true)]
    [string]$WindowsPath
  )

  $fullPath = [System.IO.Path]::GetFullPath($WindowsPath)
  if ($fullPath -match '^[\\]{2}wsl\.localhost[\\/][^\\/]+(?<rest>[\\/].*)$') {
    return ($Matches.rest -replace '\\', '/')
  }

  try {
    $converted = (& wsl.exe wslpath -a $fullPath 2>$null)
    if ($LASTEXITCODE -eq 0 -and $converted) {
      return $converted.Trim()
    }
  } catch {
  }

  throw "Could not convert Windows path '$fullPath' into a WSL path."
}

function Test-Url200 {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Url
  )

  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

function Get-RecallReadiness {
  return [PSCustomObject]@{
    Health = Test-Url200 -Url $healthUrl
    Recall = Test-Url200 -Url $recallUrl
  }
}

function Build-FrontendShell {
  if (Test-Path $frontendDistIndex) {
    return
  }

  Write-Host "Built frontend shell missing; running 'npm run build' in WSL..."
  & wsl.exe --cd $wslFrontendDir --exec npm run build
  if ($LASTEXITCODE -ne 0) {
    throw "Frontend build failed while creating '$frontendDistIndex'. Run 'cd frontend && npm run build' and try again."
  }

  if (-not (Test-Path $frontendDistIndex)) {
    throw "Frontend build finished without producing '$frontendDistIndex'."
  }
}

function Test-RecallBackendProcess {
  $checkCommand = "pgrep -f '$wslBackendVenvPython -m uvicorn app.main:app --host 127.0.0.1 --port 8000' >/dev/null 2>&1"
  & wsl.exe bash -lc $checkCommand | Out-Null
  return $LASTEXITCODE -eq 0
}

function Stop-RecallBackend {
  Write-Host "Stopping the repo-local backend so '/recall' can restart cleanly..."
  $killCommand = "pkill -f '$wslBackendVenvPython -m uvicorn app.main:app --host 127.0.0.1 --port 8000' >/dev/null 2>&1 || true"
  & wsl.exe bash -lc $killCommand | Out-Null

  $deadline = (Get-Date).AddSeconds(10)
  while ((Get-Date) -lt $deadline) {
    if (-not (Test-Url200 -Url $healthUrl)) {
      return
    }
    Start-Sleep -Seconds 1
  }

  throw "Could not stop the repo-local backend before restart. Inspect '$healthUrl' and the running uvicorn process, then try again."
}

function Start-RecallBackend {
  if (-not (Test-Path $backendVenvPythonWindows)) {
    throw "Backend virtualenv Python is missing at '$backendVenvPythonWindows'. Create it in '$backendDir' before running the launcher."
  }

  Remove-Item $backendStdoutLog, $backendStderrLog -Force -ErrorAction SilentlyContinue
  Write-Host "Starting the repo-local backend on $recallUrl..."
  Start-Process `
    -FilePath wsl.exe `
    -ArgumentList @(
      '--cd', $wslBackendDir,
      '--exec', $wslBackendVenvPython,
      '-m', 'uvicorn',
      'app.main:app',
      '--host', '127.0.0.1',
      '--port', '8000'
    ) `
    -WindowStyle Hidden `
    -RedirectStandardOutput $backendStdoutLog `
    -RedirectStandardError $backendStderrLog | Out-Null
}

function Wait-ForRecallReady {
  param(
    [int]$TimeoutSeconds = $startupTimeoutSeconds,
    [switch]$ReturnBoolean
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    $readiness = Get-RecallReadiness
    if ($readiness.Health -and $readiness.Recall) {
      if ($ReturnBoolean) {
        return $true
      }
      return
    }
    Start-Sleep -Seconds 1
  }

  $finalReadiness = Get-RecallReadiness
  if ($finalReadiness.Health -and $finalReadiness.Recall) {
    if ($ReturnBoolean) {
      return $true
    }
    return
  }

  if ($ReturnBoolean) {
    return $false
  }

  $stdoutTail = if (Test-Path $backendStdoutLog) {
    (Get-Content $backendStdoutLog -Tail 20) -join [Environment]::NewLine
  } else {
    '(stdout log not created)'
  }
  $stderrTail = if (Test-Path $backendStderrLog) {
    (Get-Content $backendStderrLog -Tail 20) -join [Environment]::NewLine
  } else {
    '(stderr log not created)'
  }

  throw @"
Timed out waiting for the local app to become healthy.
Expected:
  $healthUrl
  $recallUrl

Backend stdout log:
  $backendStdoutLog
$stdoutTail

Backend stderr log:
  $backendStderrLog
$stderrTail
"@
}

if (-not (Test-Path $edgeOpenerScript)) {
  throw "Edge opener script not found at '$edgeOpenerScript'."
}

if (-not (Test-Path $playwrightHarness)) {
  throw "Playwright harness directory not found at '$playwrightHarness'. Set RECALL_OPEN_APP_PLAYWRIGHT_HARNESS to the correct Windows path and try again."
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Windows node is not available on PATH. Install Node.js on Windows or expose 'node' before running this launcher."
}

$wslRepoRoot = Convert-ToWslPath -WindowsPath $repoRoot
$wslBackendDir = "$wslRepoRoot/backend"
$wslFrontendDir = "$wslRepoRoot/frontend"
$wslBackendVenvPython = "$wslBackendDir/.venv/bin/python"

$readiness = Get-RecallReadiness
$backendProcessRunning = Test-RecallBackendProcess
$needsRestart = $false
$needsStart = $false

if ($readiness.Health -and $readiness.Recall) {
  Write-Host "Reusing the already-healthy Recall backend at $recallUrl."
} else {
  if (-not (Test-Path $frontendDistIndex)) {
    Build-FrontendShell
    $needsRestart = $true
  }

  if ($readiness.Health -and -not $readiness.Recall) {
    $needsRestart = $true
  }

  if (-not $readiness.Health -and $backendProcessRunning) {
    Write-Host "A repo-local backend process already exists; waiting briefly for it to become healthy..."
    if (Wait-ForRecallReady -TimeoutSeconds 10 -ReturnBoolean) {
      Write-Host "The existing backend recovered and is now healthy."
      $readiness = Get-RecallReadiness
    } else {
      $needsRestart = $true
    }
  }

  if ($needsRestart -and $backendProcessRunning) {
    Stop-RecallBackend
    $readiness = Get-RecallReadiness
    $backendProcessRunning = $false
  }

  if (-not $readiness.Health) {
    $needsStart = $true
  }

  if ($needsRestart -and -not $backendProcessRunning) {
    $needsStart = $true
  }

  if ($needsStart) {
    Start-RecallBackend
  }

  Wait-ForRecallReady
}

Write-Host "Opening $targetUrl in Microsoft Edge..."
$env:RECALL_OPEN_APP_URL = $targetUrl
$env:RECALL_OPEN_APP_PLAYWRIGHT_HARNESS = $playwrightHarness

& node $edgeOpenerScript
if ($LASTEXITCODE -ne 0) {
  throw "The repo-owned Edge opener failed. Re-run with RECALL_OPEN_APP_HEADLESS=1 and RECALL_OPEN_APP_EXIT_AFTER_LOAD=1 for a smoke check."
}
