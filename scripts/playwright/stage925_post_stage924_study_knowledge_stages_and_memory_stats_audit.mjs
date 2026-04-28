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
  captureStudyKnowledgeStageEvidence,
  captureStudyReviewProgressEvidence,
  desktopViewport,
} from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE925_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE925_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl =
  process.env.RECALL_STAGE925_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE925_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE925_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE925_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage925-study-knowledge-stage-audit-failure.png',
  'stage925-study-progress-audit-failure.png',
  'stage925-home-review-schedule-audit-failure.png',
  'stage925-study-schedule-audit-failure.png',
  'stage925-review-ready-audit-failure.png',
  'stage925-source-review-audit-failure.png',
  'stage925-source-memory-search-audit-failure.png',
  'stage925-home-memory-filter-audit-failure.png',
  'stage925-source-overview-audit-failure.png',
  'stage925-regression-home-failure.png',
  'stage925-regression-graph-failure.png',
  'stage925-regression-reader-failure.png',
  'stage925-regression-study-failure.png',
  'stage925-regression-focused-failure.png',
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

  const knowledgeStageEvidence = await captureStudyKnowledgeStageEvidence({
    baseUrl,
    directory: outputDir,
    page: knowledgeStagePage,
    stageLabel: 'Stage 925 Study knowledge-stage audit',
    stagePrefix: 'stage925',
  })
  const progressEvidence = await captureStudyReviewProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: progressPage,
    stageLabel: 'Stage 925 Study review progress audit',
    stagePrefix: 'stage925-progress',
  })
  const homeReviewScheduleEvidence = await captureHomeReviewScheduleLensEvidence({
    baseUrl,
    directory: outputDir,
    page: homeReviewSchedulePage,
    stageLabel: 'Stage 925 Home review schedule audit',
    stagePrefix: 'stage925-home-review',
  })
  const scheduleEvidence = await captureStudyScheduleDrilldownEvidence({
    baseUrl,
    directory: outputDir,
    page: schedulePage,
    stageLabel: 'Stage 925 Study schedule drilldown audit',
    stagePrefix: 'stage925-study-schedule',
  })
  const reviewReadyEvidence = await captureHomeReviewReadySourceEvidence({
    baseUrl,
    directory: outputDir,
    page: reviewReadyPage,
    stageLabel: 'Stage 925 Home review-ready audit',
    stagePrefix: 'stage925-review-ready',
  })
  const sourceReviewEvidence = await captureSourceReviewQueueEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceReviewPage,
    stageLabel: 'Stage 925 source review audit',
    stagePrefix: 'stage925-source-review',
  })
  const sourceMemorySearchEvidence = await captureSourceMemorySearchEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceMemorySearchPage,
    stageLabel: 'Stage 925 source-memory search audit',
    stagePrefix: 'stage925-search',
  })
  const filterEvidence = await captureHomeMemoryFilterEvidence({
    baseUrl,
    directory: outputDir,
    page: filtersPage,
    stageLabel: 'Stage 925 Home memory filter audit',
    stagePrefix: 'stage925-filter',
  })
  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceOverviewPage,
    stageLabel: 'Stage 925 source overview memory-stack audit',
    stagePrefix: 'stage925-source-memory',
  })
  const regressionEvidence = await captureHomeOrganizerErgonomicsEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage: regressionHomePage,
    notebookPage: notebookRegressionPage,
    readerPage,
    stageLabel: 'Stage 925 cross-surface memory stats audit',
    stagePrefix: 'stage925-regression',
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
    studyKnowledgeStageHarnessDocumentDeleted: true,
    studyKnowledgeStageHarnessProgressCleaned: true,
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
      throw new Error(`Stage 925 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 925 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }
  if (metrics.studyKnowledgeStageTotalCount < 1) {
    throw new Error('Stage 925 expected positive knowledge-stage Study counts.')
  }
  if (metrics.studyReviewProgressTodayCount < 1 || metrics.studyReviewProgressDailyStreak < 1) {
    throw new Error('Stage 925 expected positive today/streak progress counts.')
  }

  await writeFile(
    path.join(outputDir, 'stage925-post-stage924-study-knowledge-stages-and-memory-stats-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Study memory stats remain visible, source-scoped, and question-actionable.',
          'Study review progress remains derived from local review events.',
          'Home review filters/signals, Study schedule drilldowns, Source overview, Reader, Notebook, Graph, and cleanup surfaces remain stable.',
        ],
        baseUrl,
        captures: {
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
        cleanupDryRunAfterStage925: cleanupDryRun,
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
    captureFailure(knowledgeStagePage, outputDir, 'stage925-study-knowledge-stage-audit-failure.png'),
    captureFailure(progressPage, outputDir, 'stage925-study-progress-audit-failure.png'),
    captureFailure(homeReviewSchedulePage, outputDir, 'stage925-home-review-schedule-audit-failure.png'),
    captureFailure(schedulePage, outputDir, 'stage925-study-schedule-audit-failure.png'),
    captureFailure(reviewReadyPage, outputDir, 'stage925-review-ready-audit-failure.png'),
    captureFailure(sourceReviewPage, outputDir, 'stage925-source-review-audit-failure.png'),
    captureFailure(sourceMemorySearchPage, outputDir, 'stage925-source-memory-search-audit-failure.png'),
    captureFailure(filtersPage, outputDir, 'stage925-home-memory-filter-audit-failure.png'),
    captureFailure(sourceOverviewPage, outputDir, 'stage925-source-overview-audit-failure.png'),
    captureFailure(regressionHomePage, outputDir, 'stage925-regression-home-failure.png'),
    captureFailure(graphPage, outputDir, 'stage925-regression-graph-failure.png'),
    captureFailure(readerPage, outputDir, 'stage925-regression-reader-failure.png'),
    captureFailure(studyPage, outputDir, 'stage925-regression-study-failure.png'),
    captureFailure(focusedPage, outputDir, 'stage925-regression-focused-failure.png'),
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
