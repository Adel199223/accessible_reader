param(
  [string]$RepoRootWindowsPath,
  [string]$DistroName = 'Ubuntu',
  [string]$ExpectedLinuxRepoPath,
  [switch]$Quiet
)

$ErrorActionPreference = 'Stop'

if (-not $RepoRootWindowsPath) {
  $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
  $RepoRootWindowsPath = Split-Path -Parent $scriptDir
}

function Write-Status {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Message
  )

  if (-not $Quiet) {
    Write-Host $Message
  }
}

function Convert-ToBashSingleQuotedString {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Value
  )

  $bashSingleQuoteEscape = "'" + [char]34 + "'" + [char]34 + "'"
  return "'" + ($Value -replace "'", $bashSingleQuoteEscape) + "'"
}

function Get-WslServiceInfo {
  $service = Get-CimInstance Win32_Service -Filter "Name='WslService'" -ErrorAction SilentlyContinue
  if (-not $service) {
    throw "WSL Service (WslService) is not installed on this machine. Install or repair Windows Subsystem for Linux before launching the app."
  }

  return $service
}

function Get-WslRepoHintFromWindowsPath {
  param(
    [Parameter(Mandatory = $true)]
    [string]$WindowsPath
  )

  $pattern = '^(?:\\\\\?\\UNC\\|\\\\)wsl\.localhost[\\/](?<distro>[^\\/]+)(?<rest>[\\/].*)$'
  if ($WindowsPath -notmatch $pattern) {
    return $null
  }

  return [PSCustomObject]@{
    DistroName = $Matches.distro
    LinuxPath = ($Matches.rest -replace '\\', '/')
  }
}

function Resolve-WslRepoPath {
  param(
    [Parameter(Mandatory = $true)]
    [string]$WindowsPath,
    [string]$FallbackLinuxPath
  )

  if ($FallbackLinuxPath) {
    return $FallbackLinuxPath
  }

  $hint = Get-WslRepoHintFromWindowsPath -WindowsPath $WindowsPath
  if ($hint) {
    return $hint.LinuxPath
  }

  try {
    $converted = (& wsl.exe wslpath -a $WindowsPath 2>$null)
    if ($LASTEXITCODE -eq 0 -and $converted) {
      return $converted.Trim()
    }
  } catch {
  }

  return $null
}

if (-not (Get-Command wsl.exe -ErrorAction SilentlyContinue)) {
  throw "wsl.exe is not available on PATH. Install or repair Windows Subsystem for Linux before launching the app."
}

$repoHint = Get-WslRepoHintFromWindowsPath -WindowsPath $RepoRootWindowsPath
if ($repoHint) {
  $DistroName = $repoHint.DistroName
  if (-not $ExpectedLinuxRepoPath) {
    $ExpectedLinuxRepoPath = $repoHint.LinuxPath
  }
}

$wslService = Get-WslServiceInfo
if ($wslService.StartMode -eq 'Disabled') {
  throw @"
WSL is unavailable because WslService is disabled.

Run these commands in an elevated PowerShell:
  Set-Service -Name WslService -StartupType Manual
  Start-Service -Name WslService
  wsl --status

After WSL is healthy again, rerun this launcher.
"@
}

if ($wslService.State -ne 'Running') {
  Write-Status "WslService is $($wslService.State); attempting to start it..."
  try {
    Start-Service -Name 'WslService' -ErrorAction Stop
  } catch {
    throw @"
WSL is installed but WslService could not be started automatically.
Current service state: $($wslService.State)
Current startup type: $($wslService.StartMode)
Error: $($_.Exception.Message)

If this machine still refuses to start WslService, run these commands in an elevated PowerShell:
  Set-Service -Name WslService -StartupType Manual
  Start-Service -Name WslService
  wsl --status
"@
  }
}

$wslStatusOutput = & wsl.exe --status 2>&1
if ($LASTEXITCODE -ne 0) {
  $statusText = ($wslStatusOutput | Out-String).Trim()
  throw @"
WSL did not report a healthy status.

wsl --status output:
$statusText

If WSL is disabled on this machine, run these commands in an elevated PowerShell:
  Set-Service -Name WslService -StartupType Manual
  Start-Service -Name WslService
  wsl --status
"@
}

$resolvedLinuxRepoPath = Resolve-WslRepoPath -WindowsPath $RepoRootWindowsPath -FallbackLinuxPath $ExpectedLinuxRepoPath
if (-not $resolvedLinuxRepoPath) {
  throw @"
WSL is running, but the launcher could not resolve the repo path for '$RepoRootWindowsPath'.

Set RECALL_OPEN_APP_WSL_REPO_PATH or rerun the launcher from the canonical WSL-backed repo path once WSL is healthy.
"@
}

$escapedLinuxRepoPath = Convert-ToBashSingleQuotedString -Value $resolvedLinuxRepoPath
& wsl.exe -d $DistroName bash -lc "test -d $escapedLinuxRepoPath"
if ($LASTEXITCODE -ne 0) {
  throw @"
WSL is running, but the repo path '$resolvedLinuxRepoPath' is unavailable inside distro '$DistroName'.

Expected to find the canonical repo there before starting the app.
"@
}

Write-Status "WSL is ready: distro '$DistroName' can reach '$resolvedLinuxRepoPath'."
