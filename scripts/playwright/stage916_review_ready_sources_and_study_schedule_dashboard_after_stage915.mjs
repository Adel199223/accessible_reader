import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureHomeMemoryFilterEvidence,
  captureHomeReviewReadySourceEvidence,
  captureHomeSourceMemorySignalEvidence,
  captureSourceMemorySearchEvidence,
  captureSourceOverviewMemoryEvidence,
  captureSourceReviewQueueEvidence,
  desktopViewport,
  summarizeStageHarnessCleanupMetrics,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE916_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE916_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl =
  process.env.RECALL_STAGE916_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE916_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE916_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE916_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage916-review-ready-failure.png',
  'stage916-source-review-regression-failure.png',
  'stage916-source-memory-search-regression-failure.png',
  'stage916-home-memory-filter-regression-failure.png',
  'stage916-home-source-memory-signal-regression-failure.png',
  'stage916-source-overview-regression-failure.png',
]) {
  await rm(path.join(outputDir, failureFile), { force: true })
}

const { browser, runtimeBrowser } = await launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
})

let reviewReadyPage
let reviewPage
let searchPage
let filtersPage
let signalsPage
let sourceOverviewPage
try {
  reviewReadyPage = await browser.newPage({ viewport: desktopViewport })
  reviewPage = await browser.newPage({ viewport: desktopViewport })
  searchPage = await browser.newPage({ viewport: desktopViewport })
  filtersPage = await browser.newPage({ viewport: desktopViewport })
  signalsPage = await browser.newPage({ viewport: desktopViewport })
  sourceOverviewPage = await browser.newPage({ viewport: desktopViewport })

  const reviewReadyEvidence = await captureHomeReviewReadySourceEvidence({
    baseUrl,
    directory: outputDir,
    page: reviewReadyPage,
    stageLabel: 'Stage 916 review-ready sources and Study dashboard',
    stagePrefix: 'stage916',
  })
  const reviewEvidence = await captureSourceReviewQueueEvidence({
    baseUrl,
    directory: outputDir,
    page: reviewPage,
    stageLabel: 'Stage 916 source review queue regression',
    stagePrefix: 'stage916-review',
  })
  const sourceMemorySearchEvidence = await captureSourceMemorySearchEvidence({
    baseUrl,
    directory: outputDir,
    page: searchPage,
    stageLabel: 'Stage 916 source-memory search regression',
    stagePrefix: 'stage916-search',
  })
  const filterEvidence = await captureHomeMemoryFilterEvidence({
    baseUrl,
    directory: outputDir,
    page: filtersPage,
    stageLabel: 'Stage 916 Home memory filter regression',
    stagePrefix: 'stage916-filter',
  })
  const sourceSignalsEvidence = await captureHomeSourceMemorySignalEvidence({
    baseUrl,
    directory: outputDir,
    page: signalsPage,
    stageLabel: 'Stage 916 Home source-memory signal regression',
    stagePrefix: 'stage916-signals',
  })
  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceOverviewPage,
    stageLabel: 'Stage 916 source overview memory regression',
    stagePrefix: 'stage916-source-memory',
  })
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const notesSidebarVisible = await reviewReadyPage.evaluate(() =>
    Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.trim() === 'Notes' || tab.getAttribute('aria-label') === 'Notes',
    ),
  )
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
    reviewReadyEvidence.metrics,
    reviewEvidence.metrics,
    sourceMemorySearchEvidence.metrics,
    filterEvidence.metrics,
    sourceSignalsEvidence.metrics,
    sourceOverviewEvidence.metrics,
  )
  const metrics = {
    ...sourceOverviewEvidence.metrics,
    ...sourceSignalsEvidence.metrics,
    ...filterEvidence.metrics,
    ...sourceMemorySearchEvidence.metrics,
    ...reviewEvidence.metrics,
    ...reviewReadyEvidence.metrics,
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
    notesSidebarVisible,
  }

  for (const [metricName, expected] of Object.entries({
    homeMemoryFilterControlsVisible: true,
    homeReviewReadyMatchesSignalVisible: true,
    homeReviewReadySignalOpensSourceScopedStudy: true,
    homeReviewReadySignalsDoNotMixBoardItems: true,
    homeReviewReadySourceSignalsUseDueCounts: true,
    homeReviewReadySourceSignalsVisible: true,
    homeSourceMemorySignalsVisible: true,
    notesSidebarVisible: false,
    readerSourceMemoryCountsActionable: true,
    readerSourceStudyCountOpensSourceScopedStudy: true,
    sourceMemorySearchControlsVisible: true,
    sourceOverviewMemoryStackVisible: true,
    sourceOverviewReviewPanelVisible: true,
    sourceOverviewReviewUsesSourceOwnedCounts: true,
    stageHarnessCreatedNotesCleanedUp: true,
    studyReviewDashboardSourceBreakdownVisible: true,
    studyReviewDashboardSourceRowOpensSourceScopedQuestions: true,
    studyReviewDashboardSourceRowOpensSourceScopedStudy: true,
    studyReviewDashboardUsesScheduleBuckets: true,
    studyReviewDashboardVisible: true,
    studySourceScopedQuestionSearchVisible: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 916 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.stageHarnessCreatedNoteCleanupFailures.length > 0) {
    throw new Error(
      `Stage 916 expected harness cleanup without failures, got ${metrics.stageHarnessCreatedNoteCleanupFailures.length}.`,
    )
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 916 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage916-review-ready-sources-and-study-schedule-dashboard-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Home source cards, list rows, and Matches expose review-ready Study signals without mixing source boards.',
          'Review-ready signals and Study dashboard source rows open source-scoped Review and Questions.',
          'Source overview review, source-memory search, Home memory filters, source-memory signals, cleanup hygiene, and hidden Notes sidebar remain stable.',
        ],
        baseUrl,
        captures: {
          ...reviewReadyEvidence.captures,
          ...reviewEvidence.captures,
          ...sourceMemorySearchEvidence.captures,
          ...filterEvidence.captures,
          ...sourceSignalsEvidence.captures,
          ...sourceOverviewEvidence.captures,
        },
        cleanupDryRunAfterStage916: cleanupDryRun,
        desktopViewport,
        headless,
        metrics,
        runtimeBrowser,
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  await Promise.all([
    captureFailure(reviewReadyPage, outputDir, 'stage916-review-ready-failure.png'),
    captureFailure(reviewPage, outputDir, 'stage916-source-review-regression-failure.png'),
    captureFailure(searchPage, outputDir, 'stage916-source-memory-search-regression-failure.png'),
    captureFailure(filtersPage, outputDir, 'stage916-home-memory-filter-regression-failure.png'),
    captureFailure(signalsPage, outputDir, 'stage916-home-source-memory-signal-regression-failure.png'),
    captureFailure(sourceOverviewPage, outputDir, 'stage916-source-overview-regression-failure.png'),
  ])
  throw error
} finally {
  await browser.close()
}

async function captureFailure(page, directory, filename) {
  if (!page) {
    return
  }
  await page
    .screenshot({
      fullPage: true,
      path: path.join(directory, filename),
    })
    .catch(() => undefined)
}

function readCliOption(name) {
  const prefix = `--${name}=`
  const inline = process.argv.find((argument) => argument.startsWith(prefix))
  if (inline) {
    return inline.slice(prefix.length)
  }
  const index = process.argv.indexOf(`--${name}`)
  return index >= 0 ? process.argv[index + 1] : null
}
