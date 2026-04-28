import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import {
  captureHomeOrganizerErgonomicsEvidence,
  focusedViewport,
} from './home_organizer_ergonomics_shared.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureHomeMemoryFilterEvidence,
  captureHomePersonalNotesCollectionBoardEvidence,
  captureHomeReviewReadySourceEvidence,
  captureHomeReviewScheduleLensEvidence,
  captureHomeSourceMemorySignalEvidence,
  captureNotebookNewNoteDraftEvidence,
  captureSourceMemorySearchEvidence,
  captureSourceNotePromotionEvidence,
  captureSourceOverviewMemoryEvidence,
  captureSourceReviewQueueEvidence,
  captureStudyScheduleDrilldownEvidence,
  desktopViewport,
  summarizeStageHarnessCleanupMetrics,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE921_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE921_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl =
  process.env.RECALL_STAGE921_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE921_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE921_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE921_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage921-home-review-schedule-audit-failure.png',
  'stage921-study-schedule-audit-failure.png',
  'stage921-review-ready-audit-failure.png',
  'stage921-source-review-audit-failure.png',
  'stage921-source-memory-search-audit-failure.png',
  'stage921-home-memory-filter-audit-failure.png',
  'stage921-home-source-signal-audit-failure.png',
  'stage921-source-overview-audit-failure.png',
  'stage921-personal-notes-board-audit-failure.png',
  'stage921-promotion-audit-failure.png',
  'stage921-source-note-audit-failure.png',
  'stage921-regression-home-failure.png',
  'stage921-regression-graph-failure.png',
  'stage921-regression-reader-failure.png',
  'stage921-regression-study-failure.png',
  'stage921-regression-focused-failure.png',
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
let sourceMemorySearchPage
let filtersPage
let signalsPage
let sourceOverviewPage
let boardPage
let promotionPage
let sourceNotePage
let regressionHomePage
let graphPage
let notebookRegressionPage
let readerPage
let studyPage
let focusedPage
try {
  homeReviewSchedulePage = await browser.newPage({ viewport: desktopViewport })
  schedulePage = await browser.newPage({ viewport: desktopViewport })
  reviewReadyPage = await browser.newPage({ viewport: desktopViewport })
  sourceReviewPage = await browser.newPage({ viewport: desktopViewport })
  sourceMemorySearchPage = await browser.newPage({ viewport: desktopViewport })
  filtersPage = await browser.newPage({ viewport: desktopViewport })
  signalsPage = await browser.newPage({ viewport: desktopViewport })
  sourceOverviewPage = await browser.newPage({ viewport: desktopViewport })
  boardPage = await browser.newPage({ viewport: desktopViewport })
  promotionPage = await browser.newPage({ viewport: desktopViewport })
  sourceNotePage = await browser.newPage({ viewport: desktopViewport })
  regressionHomePage = await browser.newPage({ viewport: desktopViewport })
  graphPage = await browser.newPage({ viewport: desktopViewport })
  notebookRegressionPage = await browser.newPage({ viewport: desktopViewport })
  readerPage = await browser.newPage({ viewport: desktopViewport })
  studyPage = await browser.newPage({ viewport: desktopViewport })
  focusedPage = await browser.newPage({ viewport: focusedViewport })

  const homeReviewScheduleEvidence = await captureHomeReviewScheduleLensEvidence({
    baseUrl,
    directory: outputDir,
    page: homeReviewSchedulePage,
    stageLabel: 'Stage 921 Home review schedule lens audit',
    stagePrefix: 'stage921',
  })
  const scheduleEvidence = await captureStudyScheduleDrilldownEvidence({
    baseUrl,
    directory: outputDir,
    page: schedulePage,
    stageLabel: 'Stage 921 Study schedule drilldown audit',
    stagePrefix: 'stage921-study-schedule',
  })
  const reviewReadyEvidence = await captureHomeReviewReadySourceEvidence({
    baseUrl,
    directory: outputDir,
    page: reviewReadyPage,
    stageLabel: 'Stage 921 Home review-ready audit',
    stagePrefix: 'stage921-review-ready',
  })
  const sourceReviewEvidence = await captureSourceReviewQueueEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceReviewPage,
    stageLabel: 'Stage 921 source review audit',
    stagePrefix: 'stage921-source-review',
  })
  const sourceMemorySearchEvidence = await captureSourceMemorySearchEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceMemorySearchPage,
    stageLabel: 'Stage 921 source-memory search audit',
    stagePrefix: 'stage921-search',
  })
  const filterEvidence = await captureHomeMemoryFilterEvidence({
    baseUrl,
    directory: outputDir,
    page: filtersPage,
    stageLabel: 'Stage 921 Home memory filter audit',
    stagePrefix: 'stage921-filter',
  })
  const sourceSignalsEvidence = await captureHomeSourceMemorySignalEvidence({
    baseUrl,
    directory: outputDir,
    page: signalsPage,
    stageLabel: 'Stage 921 Home source-memory signal audit',
    stagePrefix: 'stage921-signals',
  })
  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceOverviewPage,
    stageLabel: 'Stage 921 source overview memory-stack audit',
    stagePrefix: 'stage921-source-memory',
  })
  const boardEvidence = await captureHomePersonalNotesCollectionBoardEvidence({
    baseUrl,
    directory: outputDir,
    page: boardPage,
    stageLabel: 'Stage 921 Personal notes board audit',
    stagePrefix: 'stage921-board',
  })
  const promotionEvidence = await captureSourceNotePromotionEvidence({
    baseUrl,
    directory: outputDir,
    page: promotionPage,
    stageLabel: 'Stage 921 source-note promotion audit',
    stagePrefix: 'stage921-promotion',
  })
  const sourceNoteEvidence = await captureNotebookNewNoteDraftEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceNotePage,
    stageLabel: 'Stage 921 source-anchor Notebook audit',
    stagePrefix: 'stage921-source-note',
    verifySourceReaderHandoff: true,
  })
  const regressionEvidence = await captureHomeOrganizerErgonomicsEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage: regressionHomePage,
    notebookPage: notebookRegressionPage,
    readerPage,
    stageLabel: 'Stage 921 cross-surface Home review schedule audit',
    stagePrefix: 'stage921-regression',
    studyPage,
  })

  const notesSidebarVisible = await regressionHomePage.evaluate(() =>
    Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.trim() === 'Notes' || tab.getAttribute('aria-label') === 'Notes',
    ),
  )
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
    homeReviewScheduleEvidence.metrics,
    scheduleEvidence.metrics,
    reviewReadyEvidence.metrics,
    sourceReviewEvidence.metrics,
    sourceMemorySearchEvidence.metrics,
    filterEvidence.metrics,
    sourceSignalsEvidence.metrics,
    sourceOverviewEvidence.metrics,
    boardEvidence.metrics,
    promotionEvidence.metrics,
    sourceNoteEvidence.metrics,
  )
  const homePersonalNotesBoardStillNoteOwned =
    boardEvidence.metrics.homePersonalNotesBoardVisible &&
    boardEvidence.metrics.homePersonalNotesBoardStartsWithNoteItems &&
    boardEvidence.metrics.homePersonalNotesBoardUsesBodyPreview &&
    boardEvidence.metrics.homePersonalNotesBoardSyntheticAnchorHidden
  const metrics = {
    ...regressionEvidence.metrics,
    ...sourceNoteEvidence.metrics,
    ...promotionEvidence.metrics,
    ...boardEvidence.metrics,
    ...sourceOverviewEvidence.metrics,
    ...sourceSignalsEvidence.metrics,
    ...filterEvidence.metrics,
    ...sourceMemorySearchEvidence.metrics,
    ...sourceReviewEvidence.metrics,
    ...reviewReadyEvidence.metrics,
    ...scheduleEvidence.metrics,
    ...homeReviewScheduleEvidence.metrics,
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
    homePersonalNotesBoardStillNoteOwned,
    notesSidebarVisible,
  }

  for (const [metricName, expected] of Object.entries({
    homeMemoryFilterControlsVisible: true,
    homePersonalNotesBoardStillNoteOwned: true,
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
    homeSourceMemorySignalsVisible: true,
    notebookSourceAnchorContextPanelVisible: true,
    notesSidebarVisible: false,
    readerSourceMemoryCountsActionable: true,
    readerSourceMemorySearchOpensSourceOverview: true,
    readerSourceStudyCountOpensSourceScopedStudy: true,
    sourceMemorySearchControlsVisible: true,
    sourceOverviewMemoryStackVisible: true,
    sourceOverviewReviewPanelVisible: true,
    stageHarnessCreatedNotesCleanedUp: true,
    studyReviewDashboardSourceBreakdownVisible: true,
    studyReviewDashboardSourceRowOpensSourceScopedQuestions: true,
    studyReviewDashboardSourceRowOpensSourceScopedStudy: true,
    studyReviewDashboardUsesScheduleBuckets: true,
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
    studySourceScopedQuestionSearchVisible: true,
    studySourceScopedQueueVisible: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 921 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.stageHarnessCreatedNoteCleanupFailures.length > 0) {
    throw new Error(
      `Stage 921 expected harness cleanup without failures, got ${metrics.stageHarnessCreatedNoteCleanupFailures.length}.`,
    )
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 921 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage921-post-stage920-home-review-schedule-lens-and-triage-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Stage 920 Home review schedule filtering remains source-owned, searchable, memory-filter composable, clearable, and Personal-notes safe.',
          'Active Home review signals route to matching source-scoped Questions while inactive review-ready signals continue routing to source-scoped Review.',
          'Stage 918/919 Study schedule drilldowns, Home review-ready signals, Source overview review, Reader handoffs, source-memory search, Home memory filters, source-memory signals, Personal notes, Notebook, Graph, Reader, Study, cleanup hygiene, and hidden Notes sidebar remain stable.',
        ],
        baseUrl,
        captures: {
          ...homeReviewScheduleEvidence.captures,
          ...scheduleEvidence.captures,
          ...reviewReadyEvidence.captures,
          ...sourceReviewEvidence.captures,
          ...sourceMemorySearchEvidence.captures,
          ...filterEvidence.captures,
          ...sourceSignalsEvidence.captures,
          ...sourceOverviewEvidence.captures,
          ...boardEvidence.captures,
          ...promotionEvidence.captures,
          ...sourceNoteEvidence.captures,
          ...regressionEvidence.captures,
        },
        cleanupDryRunAfterStage921: cleanupDryRun,
        desktopViewport,
        focusedViewport,
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
    captureFailure(homeReviewSchedulePage, outputDir, 'stage921-home-review-schedule-audit-failure.png'),
    captureFailure(schedulePage, outputDir, 'stage921-study-schedule-audit-failure.png'),
    captureFailure(reviewReadyPage, outputDir, 'stage921-review-ready-audit-failure.png'),
    captureFailure(sourceReviewPage, outputDir, 'stage921-source-review-audit-failure.png'),
    captureFailure(sourceMemorySearchPage, outputDir, 'stage921-source-memory-search-audit-failure.png'),
    captureFailure(filtersPage, outputDir, 'stage921-home-memory-filter-audit-failure.png'),
    captureFailure(signalsPage, outputDir, 'stage921-home-source-signal-audit-failure.png'),
    captureFailure(sourceOverviewPage, outputDir, 'stage921-source-overview-audit-failure.png'),
    captureFailure(boardPage, outputDir, 'stage921-personal-notes-board-audit-failure.png'),
    captureFailure(promotionPage, outputDir, 'stage921-promotion-audit-failure.png'),
    captureFailure(sourceNotePage, outputDir, 'stage921-source-note-audit-failure.png'),
    captureFailure(regressionHomePage, outputDir, 'stage921-regression-home-failure.png'),
    captureFailure(graphPage, outputDir, 'stage921-regression-graph-failure.png'),
    captureFailure(readerPage, outputDir, 'stage921-regression-reader-failure.png'),
    captureFailure(studyPage, outputDir, 'stage921-regression-study-failure.png'),
    captureFailure(focusedPage, outputDir, 'stage921-regression-focused-failure.png'),
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
