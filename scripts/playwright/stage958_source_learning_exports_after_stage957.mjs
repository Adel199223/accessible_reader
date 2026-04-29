import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureSourceLearningExportsEvidence } from './source_learning_exports_shared.mjs'
import { desktopViewport } from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE958_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE958_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE958_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE958_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE958_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE958_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage958-source-learning-exports-failure.png'), { force: true })

const { browser, runtimeBrowser } = await launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
})

try {
  const page = await browser.newPage({ viewport: desktopViewport })
  const evidence = await captureSourceLearningExportsEvidence({
    baseUrl,
    directory: outputDir,
    page,
    stageLabel: 'Stage 958 source learning exports',
    stagePrefix: 'stage958-source-learning-exports',
  })
  const metrics = evidence.metrics
  for (const [metricName, expected] of Object.entries({
    homeWorkspaceExportCountsVisible: true,
    homeWorkspaceExportVisible: true,
    homeWorkspaceZipActionVisible: true,
    learningPackExportIncludesAttemptSummary: true,
    learningPackExportIncludesGraphMemory: true,
    learningPackExportIncludesNote: true,
    learningPackExportIncludesReviewProgress: true,
    learningPackExportIncludesSections: true,
    learningPackExportIncludesSessionSummary: true,
    learningPackExportIncludesStudyCard: true,
    learningPackExportIncludesSourceMarkdown: true,
    learningPackExportOmitsSoftDeletedCard: true,
    plainSourceExportBackwardCompatible: true,
    sourceLearningExportsHarnessDeleted: true,
    sourceLearningExportsHarnessProgressCleaned: true,
    sourceOverviewLearningPackExportLinkVisible: true,
    sourceOverviewPlainExportLinkVisible: true,
    workspaceManifestIncludesAttempts: true,
    workspaceManifestIncludesReviewSessions: true,
    workspaceZipIncludesLearningPack: true,
    workspaceZipIncludesManifest: true,
    workspaceZipLearningPackIncludesAttempt: true,
    workspaceZipLearningPackIncludesNote: true,
    workspaceZipLearningPackIncludesSession: true,
    workspaceZipLearningPackOmitsSoftDeletedCard: true,
    workspaceZipManifestIncludesAttempts: true,
    workspaceZipManifestIncludesReviewSessions: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 958 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (
    !metrics.sourceOverviewPlainExportHref.startsWith('/api/recall/documents/') ||
    !metrics.sourceOverviewPlainExportHref.endsWith('/export.md')
  ) {
    throw new Error(`Stage 958 expected source export href, got ${metrics.sourceOverviewPlainExportHref}.`)
  }
  if (
    !metrics.sourceOverviewLearningPackExportHref.startsWith('/api/recall/documents/') ||
    !metrics.sourceOverviewLearningPackExportHref.endsWith('/learning-export.md')
  ) {
    throw new Error(`Stage 958 expected learning pack href, got ${metrics.sourceOverviewLearningPackExportHref}.`)
  }
  if (metrics.cleanupUtilityDryRunMatchedAfterSourceLearningExports !== 0) {
    throw new Error(
      `Stage 958 expected cleanup dry-run matchedCount 0, got ${metrics.cleanupUtilityDryRunMatchedAfterSourceLearningExports}.`,
    )
  }

  const validation = {
    captures: evidence.captures,
    metrics,
    runtimeBrowser,
    stage: 'stage958-source-learning-exports',
  }
  await writeFile(
    path.join(outputDir, 'stage958-source-learning-exports-validation.json'),
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
