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
  captureStudyReviewProgressEvidence,
  desktopViewport,
} from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE923_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE923_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl =
  process.env.RECALL_STAGE923_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE923_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE923_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE923_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage923-study-progress-audit-failure.png',
  'stage923-home-review-schedule-audit-failure.png',
  'stage923-study-schedule-audit-failure.png',
  'stage923-review-ready-audit-failure.png',
  'stage923-source-review-audit-failure.png',
  'stage923-source-memory-search-audit-failure.png',
  'stage923-home-memory-filter-audit-failure.png',
  'stage923-source-overview-audit-failure.png',
  'stage923-regression-home-failure.png',
  'stage923-regression-graph-failure.png',
  'stage923-regression-reader-failure.png',
  'stage923-regression-study-failure.png',
  'stage923-regression-focused-failure.png',
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

  const progressEvidence = await captureStudyReviewProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: progressPage,
    stageLabel: 'Stage 923 Study review progress dashboard audit',
    stagePrefix: 'stage923',
  })
  const homeReviewScheduleEvidence = await captureHomeReviewScheduleLensEvidence({
    baseUrl,
    directory: outputDir,
    page: homeReviewSchedulePage,
    stageLabel: 'Stage 923 Home review schedule lens audit',
    stagePrefix: 'stage923-home-review',
  })
  const scheduleEvidence = await captureStudyScheduleDrilldownEvidence({
    baseUrl,
    directory: outputDir,
    page: schedulePage,
    stageLabel: 'Stage 923 Study schedule drilldown audit',
    stagePrefix: 'stage923-study-schedule',
  })
  const reviewReadyEvidence = await captureHomeReviewReadySourceEvidence({
    baseUrl,
    directory: outputDir,
    page: reviewReadyPage,
    stageLabel: 'Stage 923 Home review-ready audit',
    stagePrefix: 'stage923-review-ready',
  })
  const sourceReviewEvidence = await captureSourceReviewQueueEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceReviewPage,
    stageLabel: 'Stage 923 source review audit',
    stagePrefix: 'stage923-source-review',
  })
  const sourceMemorySearchEvidence = await captureSourceMemorySearchEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceMemorySearchPage,
    stageLabel: 'Stage 923 source-memory search audit',
    stagePrefix: 'stage923-search',
  })
  const filterEvidence = await captureHomeMemoryFilterEvidence({
    baseUrl,
    directory: outputDir,
    page: filtersPage,
    stageLabel: 'Stage 923 Home memory filter audit',
    stagePrefix: 'stage923-filter',
  })
  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceOverviewPage,
    stageLabel: 'Stage 923 source overview memory-stack audit',
    stagePrefix: 'stage923-source-memory',
  })
  const regressionEvidence = await captureHomeOrganizerErgonomicsEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage: regressionHomePage,
    notebookPage: notebookRegressionPage,
    readerPage,
    stageLabel: 'Stage 923 cross-surface Study progress audit',
    stagePrefix: 'stage923-regression',
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
    studyReviewDashboardSourceBreakdownVisible: true,
    studyReviewDashboardSourceRowOpensSourceScopedQuestions: true,
    studyReviewDashboardSourceRowOpensSourceScopedStudy: true,
    studyReviewDashboardUsesScheduleBuckets: true,
    studyReviewDashboardVisible: true,
    studyReviewProgressActivityVisible: true,
    studyReviewProgressHarnessDocumentDeleted: true,
    studyReviewProgressHarnessProgressCleaned: true,
    studyReviewProgressPanelVisible: true,
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
      throw new Error(`Stage 923 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 923 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }
  if (metrics.studyReviewProgressTodayCount < 1 || metrics.studyReviewProgressDailyStreak < 1) {
    throw new Error('Stage 923 expected positive today/streak progress counts.')
  }

  await writeFile(
    path.join(outputDir, 'stage923-post-stage922-study-review-progress-dashboard-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Study review progress remains visible and source-scoped from local review events.',
          'Recent review and source progress handoffs remain actionable.',
          'Stage 920 Home review schedule, Stage 918 Study schedule, Source overview, Reader, Notebook, Graph, and cleanup surfaces remain stable.',
        ],
        baseUrl,
        captures: {
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
        cleanupDryRunAfterStage923: cleanupDryRun,
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
    captureFailure(progressPage, outputDir, 'stage923-study-progress-audit-failure.png'),
    captureFailure(homeReviewSchedulePage, outputDir, 'stage923-home-review-schedule-audit-failure.png'),
    captureFailure(schedulePage, outputDir, 'stage923-study-schedule-audit-failure.png'),
    captureFailure(reviewReadyPage, outputDir, 'stage923-review-ready-audit-failure.png'),
    captureFailure(sourceReviewPage, outputDir, 'stage923-source-review-audit-failure.png'),
    captureFailure(sourceMemorySearchPage, outputDir, 'stage923-source-memory-search-audit-failure.png'),
    captureFailure(filtersPage, outputDir, 'stage923-home-memory-filter-audit-failure.png'),
    captureFailure(sourceOverviewPage, outputDir, 'stage923-source-overview-audit-failure.png'),
    captureFailure(regressionHomePage, outputDir, 'stage923-regression-home-failure.png'),
    captureFailure(graphPage, outputDir, 'stage923-regression-graph-failure.png'),
    captureFailure(readerPage, outputDir, 'stage923-regression-reader-failure.png'),
    captureFailure(studyPage, outputDir, 'stage923-regression-study-failure.png'),
    captureFailure(focusedPage, outputDir, 'stage923-regression-focused-failure.png'),
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
