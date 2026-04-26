import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureHomeMemoryFilterEvidence,
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
  process.env.RECALL_STAGE914_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE914_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl =
  process.env.RECALL_STAGE914_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE914_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE914_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE914_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage914-source-review-failure.png',
  'stage914-source-memory-search-regression-failure.png',
  'stage914-home-memory-filter-regression-failure.png',
  'stage914-home-source-memory-signal-regression-failure.png',
  'stage914-source-overview-regression-failure.png',
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

let reviewPage
let searchPage
let filtersPage
let signalsPage
let sourceOverviewPage
try {
  reviewPage = await browser.newPage({ viewport: desktopViewport })
  searchPage = await browser.newPage({ viewport: desktopViewport })
  filtersPage = await browser.newPage({ viewport: desktopViewport })
  signalsPage = await browser.newPage({ viewport: desktopViewport })
  sourceOverviewPage = await browser.newPage({ viewport: desktopViewport })

  const reviewEvidence = await captureSourceReviewQueueEvidence({
    baseUrl,
    directory: outputDir,
    page: reviewPage,
    stageLabel: 'Stage 914 source review queue',
    stagePrefix: 'stage914',
  })
  const sourceMemorySearchEvidence = await captureSourceMemorySearchEvidence({
    baseUrl,
    directory: outputDir,
    page: searchPage,
    stageLabel: 'Stage 914 source-memory search regression',
    stagePrefix: 'stage914-search',
  })
  const filterEvidence = await captureHomeMemoryFilterEvidence({
    baseUrl,
    directory: outputDir,
    page: filtersPage,
    stageLabel: 'Stage 914 Home memory filter regression',
    stagePrefix: 'stage914-filter',
  })
  const sourceSignalsEvidence = await captureHomeSourceMemorySignalEvidence({
    baseUrl,
    directory: outputDir,
    page: signalsPage,
    stageLabel: 'Stage 914 Home source-memory signal regression',
    stagePrefix: 'stage914-signals',
  })
  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceOverviewPage,
    stageLabel: 'Stage 914 source overview memory regression',
    stagePrefix: 'stage914-source-memory',
  })
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const notesSidebarVisible = await reviewPage.evaluate(() =>
    Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.trim() === 'Notes' || tab.getAttribute('aria-label') === 'Notes',
    ),
  )
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
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
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
    notesSidebarVisible,
  }

  for (const [metricName, expected] of Object.entries({
    homeMemoryFilterControlsVisible: true,
    homeSourceMemorySignalsVisible: true,
    notesSidebarVisible: false,
    readerSourceMemoryCountsActionable: true,
    readerSourceStudyCountOpensSourceScopedStudy: true,
    sourceMemorySearchControlsVisible: true,
    sourceMemorySearchFindsGraphItems: true,
    sourceMemorySearchFindsPersonalNotes: true,
    sourceMemorySearchFindsSourceText: true,
    sourceMemorySearchFindsStudyItems: true,
    sourceOverviewMemoryStackVisible: true,
    sourceOverviewReviewDueHandoffOpensSourceScopedStudy: true,
    sourceOverviewReviewPanelVisible: true,
    sourceOverviewReviewQuestionsHandoffOpensSourceScopedQuestions: true,
    sourceOverviewReviewUsesSourceOwnedCounts: true,
    stageHarnessCreatedNotesCleanedUp: true,
    studySourceScopedQuestionSearchFindsEvidence: true,
    studySourceScopedQuestionSearchFindsPrompt: true,
    studySourceScopedQuestionSearchVisible: true,
    studySourceScopedQueueVisible: true,
    studySourceScopedReviewStaysInSourceAfterRating: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 914 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.stageHarnessCreatedNoteCleanupFailures.length > 0) {
    throw new Error(
      `Stage 914 expected harness cleanup without failures, got ${metrics.stageHarnessCreatedNoteCleanupFailures.length}.`,
    )
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 914 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage914-source-review-queue-and-study-question-find-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Source overview exposes source-owned Study review counts and a source-scoped review queue handoff.',
          'Source overview Questions opens source-scoped Study question search across prompt and evidence.',
          'Reader source Study count opens the same source-scoped Study queue while prior memory/search surfaces stay stable.',
        ],
        baseUrl,
        captures: {
          ...reviewEvidence.captures,
          ...sourceMemorySearchEvidence.captures,
          ...filterEvidence.captures,
          ...sourceSignalsEvidence.captures,
          ...sourceOverviewEvidence.captures,
        },
        cleanupDryRunAfterStage914: cleanupDryRun,
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
    captureFailure(reviewPage, outputDir, 'stage914-source-review-failure.png'),
    captureFailure(searchPage, outputDir, 'stage914-source-memory-search-regression-failure.png'),
    captureFailure(filtersPage, outputDir, 'stage914-home-memory-filter-regression-failure.png'),
    captureFailure(signalsPage, outputDir, 'stage914-home-source-memory-signal-regression-failure.png'),
    captureFailure(sourceOverviewPage, outputDir, 'stage914-source-overview-regression-failure.png'),
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
