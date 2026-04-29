import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { captureAddContentBulkImportEvidence } from './add_content_bulk_import_shared.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { desktopViewport } from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE964_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE964_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE964_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE964_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE964_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE964_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage964-add-content-bulk-import-failure.png'), { force: true })

const { browser, runtimeBrowser } = await launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
})

try {
  const page = await browser.newPage({ viewport: desktopViewport })
  const evidence = await captureAddContentBulkImportEvidence({
    baseUrl,
    directory: outputDir,
    page,
    stageLabel: 'Stage 964',
    stagePrefix: 'stage964-add-content-bulk-import',
  })
  const metrics = evidence.metrics
  for (const [metricName, expected] of Object.entries({
    addContentBulkImportModeVisible: true,
    addContentBulkImportResultVisible: true,
    addContentBulkPreviewDryRun: true,
    addContentBulkPreviewRowsVisible: true,
    addContentBulkSelectedImportWorks: true,
    addContentSingleImportsStable: true,
    importedHarnessDocumentDeleted: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 964 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.cleanupUtilityDryRunMatchedAfterAddContentBulkImport !== 0) {
    throw new Error(
      `Stage 964 expected cleanup dry-run matchedCount 0, got ${metrics.cleanupUtilityDryRunMatchedAfterAddContentBulkImport}.`,
    )
  }

  const validation = {
    captures: evidence.captures,
    metrics,
    runtimeBrowser,
    stage: 'stage964-add-content-bulk-import',
  }
  await writeFile(
    path.join(outputDir, 'stage964-add-content-bulk-import-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} finally {
  await browser.close()
}

function readCliOption(name) {
  const prefix = `--${name}=`
  const match = process.argv.slice(2).find((argument) => argument.startsWith(prefix))
  return match ? match.slice(prefix.length) : null
}
