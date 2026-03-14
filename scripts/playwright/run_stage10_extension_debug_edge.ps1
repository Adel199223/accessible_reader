$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent (Split-Path -Parent $scriptDir)
$backendBaseUrl = if ($env:RECALL_STAGE10_BACKEND_URL) { $env:RECALL_STAGE10_BACKEND_URL } else { 'http://127.0.0.1:8000' }
$extensionDir = if ($env:RECALL_STAGE10_EXTENSION_DIR) { $env:RECALL_STAGE10_EXTENSION_DIR } else { Join-Path $repoRoot 'extension\dist-debug' }
$outputDir = if ($env:RECALL_STAGE10_OUTPUT_DIR) { $env:RECALL_STAGE10_OUTPUT_DIR } else { Join-Path $repoRoot 'output\playwright' }
$harnessDir = if ($env:RECALL_STAGE10_PLAYWRIGHT_HARNESS) { $env:RECALL_STAGE10_PLAYWRIGHT_HARNESS } else { 'C:\Users\FA507\AppData\Local\Temp\accessible-reader-playwright' }
$stagedExtensionDir = Join-Path $env:TEMP 'accessible-reader-stage10-extension-debug'
$port = 46537

if (-not (Test-Path $extensionDir)) {
  throw "Debug extension build not found at $extensionDir. Run 'cd extension && npm run build:debug' first."
}

if (Test-Path $stagedExtensionDir) {
  Remove-Item -Recurse -Force $stagedExtensionDir
}
Copy-Item -Recurse -Force $extensionDir $stagedExtensionDir

try {
  Invoke-RestMethod -Method Get -Uri "$backendBaseUrl/api/health" | Out-Null
} catch {
  throw "The backend is not reachable at $backendBaseUrl. Start the local service before running this harness."
}

$articleHtml = @'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Stage 10 Debug Article</title>
    <meta name="description" content="Stage 10 debug article for Recall extension validation." />
  </head>
  <body>
    <main>
      <article>
        <h1>Stage 10 Debug Article</h1>
        <p>Debug harness sentence alpha. Debug harness sentence beta. Recall note capture stays local.</p>
        <p>Grounded browser notes should reopen Reader on the anchored sentence range.</p>
      </article>
    </main>
  </body>
</html>
'@
$articleHtmlBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($articleHtml))
$tmpDir = "/tmp/accessible_reader_stage10_debug_$port"
$startCommand = @'
set -euo pipefail; rm -rf '__TMP__' && mkdir -p '__TMP__/site' && printf '%s' '__HTML__' | base64 -d > '__TMP__/site/index.html' && cd '__TMP__/site' && nohup sh -c 'python3 -m http.server __PORT__ --bind 127.0.0.1' > '__TMP__/server.log' 2>&1 </dev/null & sleep 1
'@
$startCommand = $startCommand.Replace('__HTML__', $articleHtmlBase64).Replace('__PORT__', [string]$port).Replace('__TMP__', $tmpDir)
wsl.exe bash -lc $startCommand | Out-Null

$articleUrl = "http://127.0.0.1:$port/index.html"
Start-Sleep -Seconds 1

try {
  Invoke-WebRequest -UseBasicParsing -Uri $articleUrl -TimeoutSec 5 | Out-Null
} catch {
  throw "The temporary Stage 10 article is not reachable at $articleUrl."
}

try {
  Invoke-RestMethod `
    -Method Post `
    -Uri "$backendBaseUrl/api/documents/import-url" `
    -ContentType 'application/json' `
    -Body (@{ url = $articleUrl } | ConvertTo-Json) | Out-Null

  $env:RECALL_STAGE10_ARTICLE_URL = $articleUrl
  $env:RECALL_STAGE10_BACKEND_URL = $backendBaseUrl
  $env:RECALL_STAGE10_EXTENSION_DIR = $stagedExtensionDir
  $env:RECALL_STAGE10_OUTPUT_DIR = $outputDir
  $env:RECALL_STAGE10_PLAYWRIGHT_HARNESS = $harnessDir

  node (Join-Path $repoRoot 'scripts\playwright\stage10_extension_debug_edge.mjs')
} finally {
  if ($tmpDir) {
    $cleanupScript = @'
pkill -f 'http.server __PORT__ --bind 127.0.0.1' >/dev/null 2>&1 || true; rm -rf '__TMP__'
'@
    $cleanupScript = $cleanupScript.Replace('__TMP__', $tmpDir).Replace('__PORT__', [string]$port)
    wsl.exe bash -lc $cleanupScript | Out-Null
  }
}
