import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureHomeReviewReadySourceEvidence,
  captureSourceReviewQueueEvidence,
  captureStudyScheduleDrilldownEvidence,
  desktopViewport,
  summarizeStageHarnessCleanupMetrics,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE918_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE918_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl =
  process.env.RECALL_STAGE918_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE918_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE918_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE918_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage918-study-schedule-failure.png',
  'stage918-review-ready-regression-failure.png',
  'stage918-source-review-regression-failure.png',
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

let schedulePage
let reviewReadyPage
let sourceReviewPage
try {
  schedulePage = await browser.newPage({ viewport: desktopViewport })
  reviewReadyPage = await browser.newPage({ viewport: desktopViewport })
  sourceReviewPage = await browser.newPage({ viewport: desktopViewport })

  const scheduleEvidence = await captureStudyScheduleDrilldownEvidence({
    baseUrl,
    directory: outputDir,
    page: schedulePage,
    stageLabel: 'Stage 918 Study schedule drilldowns and question triage',
    stagePrefix: 'stage918',
  })
  const reviewReadyEvidence = await captureHomeReviewReadySourceEvidence({
    baseUrl,
    directory: outputDir,
    page: reviewReadyPage,
    stageLabel: 'Stage 918 Home review-ready regression',
    stagePrefix: 'stage918-review-ready',
  })
  const sourceReviewEvidence = await captureSourceReviewQueueEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceReviewPage,
    stageLabel: 'Stage 918 Source review regression',
    stagePrefix: 'stage918-source-review',
  })

  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const notesSidebarVisible = await schedulePage.evaluate(() =>
    Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.trim() === 'Notes' || tab.getAttribute('aria-label') === 'Notes',
    ),
  )
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
    scheduleEvidence.metrics,
    reviewReadyEvidence.metrics,
    sourceReviewEvidence.metrics,
  )
  const metrics = {
    ...sourceReviewEvidence.metrics,
    ...reviewReadyEvidence.metrics,
    ...scheduleEvidence.metrics,
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
    notesSidebarVisible,
  }

  for (const [metricName, expected] of Object.entries({
    homeReviewReadySignalOpensSourceScopedStudy: true,
    homeReviewReadySourceSignalsVisible: true,
    notesSidebarVisible: false,
    readerSourceStudyCountOpensSourceScopedStudy: true,
    sourceOverviewReviewPanelVisible: true,
    stageHarnessCreatedNotesCleanedUp: true,
    studyReviewDashboardSourceBreakdownVisible: true,
    studyReviewDashboardVisible: true,
    studyScheduleBucketDrilldownsVisible: true,
    studyScheduleDrilldownSourceScopeStable: true,
    studyScheduleDueBucketOpensQuestions: true,
    studyScheduleEmptyStateClearable: true,
    studyScheduleFilterChipClearable: true,
    studyScheduleQuestionSearchComposesWithBucket: true,
    studyScheduleReviewedBucketFiltersQuestions: true,
    studyScheduleStatusTabsClearDrilldown: true,
    studyScheduleThisWeekBucketFiltersQuestions: true,
    studyScheduleUpcomingBucketFiltersQuestions: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 918 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.stageHarnessCreatedNoteCleanupFailures.length > 0) {
    throw new Error(
      `Stage 918 expected harness cleanup without failures, got ${metrics.stageHarnessCreatedNoteCleanupFailures.length}.`,
    )
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 918 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage918-study-schedule-drilldowns-and-question-triage-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Study dashboard schedule buckets open filtered Questions with clearable drilldown chips.',
          'Schedule drilldowns compose with question search, source scope, empty states, and status tabs.',
          'Home review-ready signals, Source overview review, Reader source-scoped Study handoff, cleanup hygiene, and hidden Notes sidebar remain stable.',
        ],
        baseUrl,
        captures: {
          ...scheduleEvidence.captures,
          ...reviewReadyEvidence.captures,
          ...sourceReviewEvidence.captures,
        },
        cleanupDryRunAfterStage918: cleanupDryRun,
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
    captureFailure(schedulePage, outputDir, 'stage918-study-schedule-failure.png'),
    captureFailure(reviewReadyPage, outputDir, 'stage918-review-ready-regression-failure.png'),
    captureFailure(sourceReviewPage, outputDir, 'stage918-source-review-regression-failure.png'),
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
