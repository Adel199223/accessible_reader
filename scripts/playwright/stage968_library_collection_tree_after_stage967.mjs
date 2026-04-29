import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { captureAddContentImportCollectionsEvidence } from './add_content_bulk_import_shared.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { desktopViewport } from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE968_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE968_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE968_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE968_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE968_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE968_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage968-library-collection-tree-failure.png'), { force: true })

const { browser, runtimeBrowser } = await launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
})

try {
  const page = await browser.newPage({ viewport: desktopViewport })
  const evidence = await captureAddContentImportCollectionsEvidence({
    baseUrl,
    directory: outputDir,
    page,
    stageLabel: 'Stage 968',
    stagePrefix: 'stage968-library-collection-tree',
  })
  const metrics = evidence.metrics
  for (const [metricName, expected] of Object.entries({
    addContentBookmarkHierarchyImportCreatesTree: true,
    addContentBookmarkHierarchySuggestionsVisible: true,
    addContentBulkCollectionToggleVisible: true,
    addContentBulkSelectedImportWorks: true,
    graphAncestorCollectionTagFilterMatches: true,
    homeCollectionTreeRowsVisible: true,
    homeManualCollectionsPersistAfterReload: true,
    homeParentCollectionAggregatesDescendants: true,
    importedHarnessDocumentDeleted: true,
    studyParentCollectionSubsetFiltersDescendants: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 968 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.cleanupUtilityDryRunMatchedAfterAddContentCollections !== 0) {
    throw new Error(
      `Stage 968 expected cleanup dry-run matchedCount 0, got ${metrics.cleanupUtilityDryRunMatchedAfterAddContentCollections}.`,
    )
  }

  const validation = {
    captures: evidence.captures,
    metrics,
    runtimeBrowser,
    stage: 'stage968-library-collection-tree',
  }
  await writeFile(
    path.join(outputDir, 'stage968-library-collection-tree-validation.json'),
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
