import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { captureCollectionLearningWorkspaceEvidence } from './collection_learning_workspace_shared.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { desktopViewport } from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE970_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE970_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE970_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE970_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE970_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE970_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage970-collection-learning-workspaces-failure.png'), { force: true })

const { browser, runtimeBrowser } = await launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
})

try {
  const page = await browser.newPage({ viewport: desktopViewport })
  const evidence = await captureCollectionLearningWorkspaceEvidence({
    baseUrl,
    directory: outputDir,
    page,
    stageLabel: 'Stage 970',
    stagePrefix: 'stage970-collection-learning-workspaces',
  })
  const metrics = evidence.metrics
  for (const [metricName, expected] of Object.entries({
    collectionExportZipAvailable: true,
    collectionHarnessCardsDeleted: true,
    collectionHarnessDocumentsDeleted: true,
    collectionHarnessLibrarySettingsRestored: true,
    collectionOverviewParentAggregatesDescendants: true,
    graphCollectionStableIdFilterApplied: true,
    homeCollectionReviewStartsSession: true,
    homeCollectionWorkspaceActionsVisible: true,
    homeCollectionWorkspaceCountsVisible: true,
    readerCollectionContextVisible: true,
    sourceOrganizeInPlaceCreatesChildCollection: true,
    sourceOverviewCollectionPathVisible: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 970 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.cleanupUtilityDryRunMatchedAfterCollectionLearningWorkspace !== 0) {
    throw new Error(
      `Stage 970 expected cleanup dry-run matchedCount 0, got ${metrics.cleanupUtilityDryRunMatchedAfterCollectionLearningWorkspace}.`,
    )
  }

  const validation = {
    captures: evidence.captures,
    metrics,
    runtimeBrowser,
    stage: 'stage970-collection-learning-workspaces',
  }
  await writeFile(
    path.join(outputDir, 'stage970-collection-learning-workspaces-validation.json'),
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
