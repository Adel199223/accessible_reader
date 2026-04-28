import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureHomeMemoryFilterEvidence,
  captureHomeReviewReadySourceEvidence,
  captureHomeReviewScheduleLensEvidence,
  captureSourceReviewQueueEvidence,
  captureStudyScheduleDrilldownEvidence,
  desktopViewport,
  summarizeStageHarnessCleanupMetrics,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE920_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE920_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl =
  process.env.RECALL_STAGE920_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE920_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE920_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE920_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage920-home-review-schedule-lens-failure.png',
  'stage920-study-schedule-regression-failure.png',
  'stage920-review-ready-regression-failure.png',
  'stage920-source-review-regression-failure.png',
  'stage920-home-memory-filter-regression-failure.png',
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

let homeReviewSchedulePage
let schedulePage
let reviewReadyPage
let sourceReviewPage
let memoryFilterPage
try {
  homeReviewSchedulePage = await browser.newPage({ viewport: desktopViewport })
  schedulePage = await browser.newPage({ viewport: desktopViewport })
  reviewReadyPage = await browser.newPage({ viewport: desktopViewport })
  sourceReviewPage = await browser.newPage({ viewport: desktopViewport })
  memoryFilterPage = await browser.newPage({ viewport: desktopViewport })

  const homeReviewScheduleEvidence = await captureHomeReviewScheduleLensEvidence({
    baseUrl,
    directory: outputDir,
    page: homeReviewSchedulePage,
    stageLabel: 'Stage 920 Home review schedule lens',
    stagePrefix: 'stage920',
  })
  const scheduleEvidence = await captureStudyScheduleDrilldownEvidence({
    baseUrl,
    directory: outputDir,
    page: schedulePage,
    stageLabel: 'Stage 920 Study schedule drilldown regression',
    stagePrefix: 'stage920-study-schedule',
  })
  const reviewReadyEvidence = await captureHomeReviewReadySourceEvidence({
    baseUrl,
    directory: outputDir,
    page: reviewReadyPage,
    stageLabel: 'Stage 920 Home review-ready regression',
    stagePrefix: 'stage920-review-ready',
  })
  const sourceReviewEvidence = await captureSourceReviewQueueEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceReviewPage,
    stageLabel: 'Stage 920 Source review regression',
    stagePrefix: 'stage920-source-review',
  })
  const memoryFilterEvidence = await captureHomeMemoryFilterEvidence({
    baseUrl,
    directory: outputDir,
    page: memoryFilterPage,
    stageLabel: 'Stage 920 Home memory filter regression',
    stagePrefix: 'stage920-memory-filter',
  })

  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const notesSidebarVisible = await homeReviewSchedulePage.evaluate(() =>
    Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.trim() === 'Notes' || tab.getAttribute('aria-label') === 'Notes',
    ),
  )
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
    homeReviewScheduleEvidence.metrics,
    scheduleEvidence.metrics,
    reviewReadyEvidence.metrics,
    sourceReviewEvidence.metrics,
    memoryFilterEvidence.metrics,
  )
  const metrics = {
    ...memoryFilterEvidence.metrics,
    ...sourceReviewEvidence.metrics,
    ...reviewReadyEvidence.metrics,
    ...scheduleEvidence.metrics,
    ...homeReviewScheduleEvidence.metrics,
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
    notesSidebarVisible,
  }

  for (const [metricName, expected] of Object.entries({
    homeMemoryFilterControlsVisible: true,
    homeReviewReadySignalOpensSourceScopedStudy: true,
    homeReviewReadySourceSignalsVisible: true,
    homeReviewScheduleClearable: true,
    homeReviewScheduleComposesWithMemoryFilter: true,
    homeReviewScheduleFilteredSignalOpensSourceScopedQuestions: true,
    homeReviewScheduleFilterControlsVisible: true,
    homeReviewScheduleFilterNarrowsSourceBoard: true,
    homeReviewScheduleInactiveSignalOpensSourceScopedReview: true,
    homeReviewScheduleLensVisible: true,
    homeReviewScheduleMatchesComposeWithSearch: true,
    homeReviewSchedulePersonalNotesStayNoteOwned: true,
    notesSidebarVisible: false,
    sourceOverviewReviewPanelVisible: true,
    stageHarnessCreatedNotesCleanedUp: true,
    studyScheduleBucketDrilldownsVisible: true,
    studyScheduleDrilldownSourceScopeStable: true,
    studyScheduleDueBucketOpensQuestions: true,
    studyScheduleFilterChipClearable: true,
    studyScheduleQuestionSearchComposesWithBucket: true,
    studyScheduleThisWeekBucketFiltersQuestions: true,
    studyScheduleUpcomingBucketFiltersQuestions: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 920 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.stageHarnessCreatedNoteCleanupFailures.length > 0) {
    throw new Error(
      `Stage 920 expected harness cleanup without failures, got ${metrics.stageHarnessCreatedNoteCleanupFailures.length}.`,
    )
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 920 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage920-home-review-schedule-lens-and-triage-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Home exposes a review schedule lens that filters source-owned cards and Matches from existing Study cards.',
          'Active Home review signals open source-scoped Questions with the matching schedule drilldown while inactive signals keep the Review handoff.',
          'Home review filters compose with Stage 910 memory filters and keep Personal notes note-owned.',
          'Stage 918/919 Study schedule, review-ready, Source review, memory-filter, cleanup, and hidden Notes-sidebar regressions remain stable.',
        ],
        baseUrl,
        captures: {
          ...homeReviewScheduleEvidence.captures,
          ...scheduleEvidence.captures,
          ...reviewReadyEvidence.captures,
          ...sourceReviewEvidence.captures,
          ...memoryFilterEvidence.captures,
        },
        cleanupDryRunAfterStage920: cleanupDryRun,
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
    captureFailure(homeReviewSchedulePage, outputDir, 'stage920-home-review-schedule-lens-failure.png'),
    captureFailure(schedulePage, outputDir, 'stage920-study-schedule-regression-failure.png'),
    captureFailure(reviewReadyPage, outputDir, 'stage920-review-ready-regression-failure.png'),
    captureFailure(sourceReviewPage, outputDir, 'stage920-source-review-regression-failure.png'),
    captureFailure(memoryFilterPage, outputDir, 'stage920-home-memory-filter-regression-failure.png'),
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
