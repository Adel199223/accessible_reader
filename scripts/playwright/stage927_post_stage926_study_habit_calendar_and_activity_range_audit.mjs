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
  captureHomeReviewReadySourceEvidence,
  captureHomeReviewScheduleLensEvidence,
  captureSourceMemorySearchEvidence,
  captureSourceOverviewMemoryEvidence,
  captureSourceReviewQueueEvidence,
  captureStudyScheduleDrilldownEvidence,
  summarizeStageHarnessCleanupMetrics,
} from './notebook_workbench_shared.mjs'
import {
  captureStudyHabitCalendarEvidence,
  captureStudyKnowledgeStageEvidence,
  captureStudyReviewProgressEvidence,
  desktopViewport,
} from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE927_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE927_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl =
  process.env.RECALL_STAGE927_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE927_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE927_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE927_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage927-study-habit-calendar-audit-failure.png',
  'stage927-study-knowledge-stage-audit-failure.png',
  'stage927-study-progress-audit-failure.png',
  'stage927-home-review-schedule-audit-failure.png',
  'stage927-study-schedule-audit-failure.png',
  'stage927-review-ready-audit-failure.png',
  'stage927-source-review-audit-failure.png',
  'stage927-source-memory-search-audit-failure.png',
  'stage927-home-memory-filter-audit-failure.png',
  'stage927-source-overview-audit-failure.png',
  'stage927-regression-home-failure.png',
  'stage927-regression-graph-failure.png',
  'stage927-regression-reader-failure.png',
  'stage927-regression-study-failure.png',
  'stage927-regression-focused-failure.png',
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

let habitPage
let knowledgeStagePage
let progressPage
let homeReviewSchedulePage
let schedulePage
let reviewReadyPage
let sourceReviewPage
let sourceMemorySearchPage
let filtersPage
let sourceOverviewPage
let regressionHomePage
let graphPage
let notebookRegressionPage
let readerPage
let studyPage
let focusedPage
try {
  habitPage = await browser.newPage({ viewport: desktopViewport })
  knowledgeStagePage = await browser.newPage({ viewport: desktopViewport })
  progressPage = await browser.newPage({ viewport: desktopViewport })
  homeReviewSchedulePage = await browser.newPage({ viewport: desktopViewport })
  schedulePage = await browser.newPage({ viewport: desktopViewport })
  reviewReadyPage = await browser.newPage({ viewport: desktopViewport })
  sourceReviewPage = await browser.newPage({ viewport: desktopViewport })
  sourceMemorySearchPage = await browser.newPage({ viewport: desktopViewport })
  filtersPage = await browser.newPage({ viewport: desktopViewport })
  sourceOverviewPage = await browser.newPage({ viewport: desktopViewport })
  regressionHomePage = await browser.newPage({ viewport: desktopViewport })
  graphPage = await browser.newPage({ viewport: desktopViewport })
  notebookRegressionPage = await browser.newPage({ viewport: desktopViewport })
  readerPage = await browser.newPage({ viewport: desktopViewport })
  studyPage = await browser.newPage({ viewport: desktopViewport })
  focusedPage = await browser.newPage({ viewport: focusedViewport })

  const habitEvidence = await captureStudyHabitCalendarEvidence({
    baseUrl,
    directory: outputDir,
    page: habitPage,
    stageLabel: 'Stage 927 Study habit calendar audit',
    stagePrefix: 'stage927-habit',
  })
  const knowledgeStageEvidence = await captureStudyKnowledgeStageEvidence({
    baseUrl,
    directory: outputDir,
    page: knowledgeStagePage,
    stageLabel: 'Stage 927 Study knowledge-stage audit',
    stagePrefix: 'stage927-knowledge',
  })
  const progressEvidence = await captureStudyReviewProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: progressPage,
    stageLabel: 'Stage 927 Study review progress audit',
    stagePrefix: 'stage927-progress',
  })
  const homeReviewScheduleEvidence = await captureHomeReviewScheduleLensEvidence({
    baseUrl,
    directory: outputDir,
    page: homeReviewSchedulePage,
    stageLabel: 'Stage 927 Home review schedule audit',
    stagePrefix: 'stage927-home-review',
  })
  const scheduleEvidence = await captureStudyScheduleDrilldownEvidence({
    baseUrl,
    directory: outputDir,
    page: schedulePage,
    stageLabel: 'Stage 927 Study schedule drilldown audit',
    stagePrefix: 'stage927-study-schedule',
  })
  const reviewReadyEvidence = await captureHomeReviewReadySourceEvidence({
    baseUrl,
    directory: outputDir,
    page: reviewReadyPage,
    stageLabel: 'Stage 927 Home review-ready audit',
    stagePrefix: 'stage927-review-ready',
  })
  const sourceReviewEvidence = await captureSourceReviewQueueEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceReviewPage,
    stageLabel: 'Stage 927 source review audit',
    stagePrefix: 'stage927-source-review',
  })
  const sourceMemorySearchEvidence = await captureSourceMemorySearchEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceMemorySearchPage,
    stageLabel: 'Stage 927 source-memory search audit',
    stagePrefix: 'stage927-search',
  })
  const filterEvidence = await captureHomeMemoryFilterEvidence({
    baseUrl,
    directory: outputDir,
    page: filtersPage,
    stageLabel: 'Stage 927 Home memory filter audit',
    stagePrefix: 'stage927-filter',
  })
  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceOverviewPage,
    stageLabel: 'Stage 927 source overview memory-stack audit',
    stagePrefix: 'stage927-source-memory',
  })
  const regressionEvidence = await captureHomeOrganizerErgonomicsEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage: regressionHomePage,
    notebookPage: notebookRegressionPage,
    readerPage,
    stageLabel: 'Stage 927 cross-surface habit calendar audit',
    stagePrefix: 'stage927-regression',
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
    sourceOverviewEvidence.metrics,
  )
  const metrics = {
    ...regressionEvidence.metrics,
    ...sourceOverviewEvidence.metrics,
    ...filterEvidence.metrics,
    ...sourceMemorySearchEvidence.metrics,
    ...sourceReviewEvidence.metrics,
    ...reviewReadyEvidence.metrics,
    ...scheduleEvidence.metrics,
    ...homeReviewScheduleEvidence.metrics,
    ...progressEvidence.metrics,
    ...knowledgeStageEvidence.metrics,
    ...habitEvidence.metrics,
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
    notesSidebarVisible,
  }

  for (const [metricName, expected] of Object.entries({
    homeMemoryFilterControlsVisible: true,
    homeReviewScheduleFilteredSignalOpensSourceScopedQuestions: true,
    homeReviewScheduleLensVisible: true,
    homeReviewSchedulePersonalNotesStayNoteOwned: true,
    homeReviewReadySignalOpensSourceScopedStudy: true,
    homeReviewReadySourceSignalsVisible: true,
    notesSidebarVisible: false,
    readerSourceMemorySearchOpensSourceOverview: true,
    sourceMemorySearchControlsVisible: true,
    sourceOverviewMemoryStackVisible: true,
    sourceOverviewReviewPanelVisible: true,
    stageHarnessCreatedNotesCleanedUp: true,
    studyKnowledgeStageChipOpensQuestions: true,
    studyKnowledgeStageCountsVisible: true,
    studyKnowledgeStagePanelVisible: true,
    studyKnowledgeStageQuestionRowsFiltered: true,
    studyKnowledgeStageSourceRowOpensQuestions: true,
    studyKnowledgeStageSourceRowsVisible: true,
    studyKnowledgeStageSourceScoped: true,
    studyReviewDashboardSourceBreakdownVisible: true,
    studyReviewDashboardSourceRowOpensSourceScopedQuestions: true,
    studyReviewDashboardSourceRowOpensSourceScopedStudy: true,
    studyReviewDashboardUsesScheduleBuckets: true,
    studyReviewDashboardVisible: true,
    studyReviewProgressActivityVisible: true,
    studyReviewProgressHarnessDocumentDeleted: true,
    studyReviewProgressHarnessProgressCleaned: true,
    studyReviewProgressHeatmapVisible: true,
    studyReviewProgressPanelVisible: true,
    studyReviewProgressPeriodControlsVisible: true,
    studyReviewProgressPeriodSwitchPreservesSourceScope: true,
    studyReviewProgressPeriodSwitchesTo30: true,
    studyReviewProgressRatingMixVisible: true,
    studyReviewProgressRecentReviewSelectsCard: true,
    studyReviewProgressRecentReviewsVisible: true,
    studyReviewProgressSourceRowOpensQuestions: true,
    studyReviewProgressSourceRowsVisible: true,
    studyReviewProgressSourceScoped: true,
    studyScheduleBucketDrilldownsVisible: true,
    studyScheduleDrilldownSourceScopeStable: true,
    studyScheduleDueBucketOpensQuestions: true,
    studySourceScopedQuestionSearchVisible: true,
    studySourceScopedQueueVisible: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 927 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.studyReviewProgressPeriodDays !== 14 || metrics.studyReviewProgressHeatmapDays !== 14) {
    throw new Error('Stage 927 expected the default habit calendar range to be 14 days.')
  }
  if (metrics.studyReviewProgressPeriodDaysAfterSwitch !== 30 || metrics.studyReviewProgressHeatmapDaysAfterSwitch !== 30) {
    throw new Error('Stage 927 expected the switched habit calendar range to be 30 days.')
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 927 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }
  if (metrics.studyKnowledgeStageTotalCount < 1) {
    throw new Error('Stage 927 expected positive knowledge-stage Study counts.')
  }
  if (metrics.studyReviewProgressTodayCount < 1 || metrics.studyReviewProgressDailyStreak < 1) {
    throw new Error('Stage 927 expected positive today/streak progress counts.')
  }

  await writeFile(
    path.join(outputDir, 'stage927-post-stage926-study-habit-calendar-and-activity-range-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Study habit calendar remains visible, range-aware, and source-scoped.',
          'Study memory stats and review progress remain derived from local card state and review events.',
          'Home review filters/signals, Study schedule drilldowns, Source overview, Reader, Notebook, Graph, and cleanup surfaces remain stable.',
        ],
        baseUrl,
        captures: {
          ...habitEvidence.captures,
          ...knowledgeStageEvidence.captures,
          ...progressEvidence.captures,
          ...homeReviewScheduleEvidence.captures,
          ...scheduleEvidence.captures,
          ...reviewReadyEvidence.captures,
          ...sourceReviewEvidence.captures,
          ...sourceMemorySearchEvidence.captures,
          ...filterEvidence.captures,
          ...sourceOverviewEvidence.captures,
          ...regressionEvidence.captures,
        },
        cleanupDryRunAfterStage927: cleanupDryRun,
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
    captureFailure(habitPage, outputDir, 'stage927-study-habit-calendar-audit-failure.png'),
    captureFailure(knowledgeStagePage, outputDir, 'stage927-study-knowledge-stage-audit-failure.png'),
    captureFailure(progressPage, outputDir, 'stage927-study-progress-audit-failure.png'),
    captureFailure(homeReviewSchedulePage, outputDir, 'stage927-home-review-schedule-audit-failure.png'),
    captureFailure(schedulePage, outputDir, 'stage927-study-schedule-audit-failure.png'),
    captureFailure(reviewReadyPage, outputDir, 'stage927-review-ready-audit-failure.png'),
    captureFailure(sourceReviewPage, outputDir, 'stage927-source-review-audit-failure.png'),
    captureFailure(sourceMemorySearchPage, outputDir, 'stage927-source-memory-search-audit-failure.png'),
    captureFailure(filtersPage, outputDir, 'stage927-home-memory-filter-audit-failure.png'),
    captureFailure(sourceOverviewPage, outputDir, 'stage927-source-overview-audit-failure.png'),
    captureFailure(regressionHomePage, outputDir, 'stage927-regression-home-failure.png'),
    captureFailure(graphPage, outputDir, 'stage927-regression-graph-failure.png'),
    captureFailure(readerPage, outputDir, 'stage927-regression-reader-failure.png'),
    captureFailure(studyPage, outputDir, 'stage927-regression-study-failure.png'),
    captureFailure(focusedPage, outputDir, 'stage927-regression-focused-failure.png'),
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
