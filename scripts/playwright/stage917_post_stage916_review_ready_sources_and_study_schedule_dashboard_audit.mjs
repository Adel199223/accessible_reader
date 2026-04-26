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
  captureHomePersonalNoteLaneEvidence,
  captureHomePersonalNotesCollectionBoardEvidence,
  captureHomeReviewReadySourceEvidence,
  captureHomeSourceMemorySignalEvidence,
  captureNotebookEmptyStateEvidence,
  captureNotebookNewNoteDraftEvidence,
  captureNotebookWorkbenchEvidence,
  captureSourceMemorySearchEvidence,
  captureSourceNotePromotionEvidence,
  captureSourceOverviewMemoryEvidence,
  captureSourceReviewQueueEvidence,
  desktopViewport,
  summarizeStageHarnessCleanupMetrics,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE917_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE917_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl =
  process.env.RECALL_STAGE917_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE917_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE917_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE917_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage917-review-ready-audit-failure.png',
  'stage917-source-review-audit-failure.png',
  'stage917-source-memory-search-audit-failure.png',
  'stage917-home-memory-filter-audit-failure.png',
  'stage917-source-signal-audit-failure.png',
  'stage917-source-overview-audit-failure.png',
  'stage917-personal-notes-board-audit-failure.png',
  'stage917-personal-notes-lane-audit-failure.png',
  'stage917-promotion-audit-failure.png',
  'stage917-source-note-audit-failure.png',
  'stage917-sentence-note-audit-failure.png',
  'stage917-empty-audit-failure.png',
  'stage917-regression-home-failure.png',
  'stage917-regression-graph-failure.png',
  'stage917-regression-reader-failure.png',
  'stage917-regression-study-failure.png',
  'stage917-regression-focused-failure.png',
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
let boardPage
let lanePage
let promotionPage
let sourcePage
let sentencePage
let emptyPage
let regressionHomePage
let graphPage
let notebookRegressionPage
let readerPage
let studyPage
let focusedPage
try {
  reviewReadyPage = await browser.newPage({ viewport: desktopViewport })
  reviewPage = await browser.newPage({ viewport: desktopViewport })
  searchPage = await browser.newPage({ viewport: desktopViewport })
  filtersPage = await browser.newPage({ viewport: desktopViewport })
  signalsPage = await browser.newPage({ viewport: desktopViewport })
  sourceOverviewPage = await browser.newPage({ viewport: desktopViewport })
  boardPage = await browser.newPage({ viewport: desktopViewport })
  lanePage = await browser.newPage({ viewport: desktopViewport })
  promotionPage = await browser.newPage({ viewport: desktopViewport })
  sourcePage = await browser.newPage({ viewport: desktopViewport })
  sentencePage = await browser.newPage({ viewport: desktopViewport })
  emptyPage = await browser.newPage({ viewport: desktopViewport })
  regressionHomePage = await browser.newPage({ viewport: desktopViewport })
  graphPage = await browser.newPage({ viewport: desktopViewport })
  notebookRegressionPage = await browser.newPage({ viewport: desktopViewport })
  readerPage = await browser.newPage({ viewport: desktopViewport })
  studyPage = await browser.newPage({ viewport: desktopViewport })
  focusedPage = await browser.newPage({ viewport: focusedViewport })

  const reviewReadyEvidence = await captureHomeReviewReadySourceEvidence({
    baseUrl,
    directory: outputDir,
    page: reviewReadyPage,
    stageLabel: 'Stage 917 review-ready sources audit',
    stagePrefix: 'stage917',
  })
  const reviewEvidence = await captureSourceReviewQueueEvidence({
    baseUrl,
    directory: outputDir,
    page: reviewPage,
    stageLabel: 'Stage 917 source review queue audit',
    stagePrefix: 'stage917-review',
  })
  const sourceMemorySearchEvidence = await captureSourceMemorySearchEvidence({
    baseUrl,
    directory: outputDir,
    page: searchPage,
    stageLabel: 'Stage 917 source memory search audit',
    stagePrefix: 'stage917-search',
  })
  const filterEvidence = await captureHomeMemoryFilterEvidence({
    baseUrl,
    directory: outputDir,
    page: filtersPage,
    stageLabel: 'Stage 917 Home memory filter audit',
    stagePrefix: 'stage917-filter',
  })
  const sourceSignalsEvidence = await captureHomeSourceMemorySignalEvidence({
    baseUrl,
    directory: outputDir,
    page: signalsPage,
    stageLabel: 'Stage 917 Home source-memory signal audit',
    stagePrefix: 'stage917-signals',
  })
  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceOverviewPage,
    stageLabel: 'Stage 917 source overview memory stack audit',
    stagePrefix: 'stage917-source-memory',
  })
  const boardEvidence = await captureHomePersonalNotesCollectionBoardEvidence({
    baseUrl,
    directory: outputDir,
    page: boardPage,
    stageLabel: 'Stage 917 Home personal-notes board audit',
    stagePrefix: 'stage917-board',
  })
  const laneEvidence = await captureHomePersonalNoteLaneEvidence({
    baseUrl,
    directory: outputDir,
    page: lanePage,
    stageLabel: 'Stage 917 Home personal-note lane/search audit',
    stagePrefix: 'stage917-lane',
  })
  const promotionEvidence = await captureSourceNotePromotionEvidence({
    baseUrl,
    directory: outputDir,
    page: promotionPage,
    stageLabel: 'Stage 917 source-note promotion audit',
    stagePrefix: 'stage917-promotion',
  })
  const sourceEvidence = await captureNotebookNewNoteDraftEvidence({
    baseUrl,
    directory: outputDir,
    page: sourcePage,
    stageLabel: 'Stage 917 source-anchor Notebook regression',
    stagePrefix: 'stage917-source',
    verifySourceReaderHandoff: true,
  })
  const sentenceEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: sentencePage,
    selectSentenceAnchor: true,
    stageLabel: 'Stage 917 sentence-anchor Notebook regression',
    stagePrefix: 'stage917-sentence',
  })
  const emptyEvidence = await captureNotebookEmptyStateEvidence({
    baseUrl,
    directory: outputDir,
    page: emptyPage,
    stageLabel: 'Stage 917 Notebook empty-state regression',
    stagePrefix: 'stage917-empty',
  })
  const regressionEvidence = await captureHomeOrganizerErgonomicsEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage: regressionHomePage,
    notebookPage: notebookRegressionPage,
    readerPage,
    stageLabel: 'Stage 917 cross-surface review-ready audit',
    stagePrefix: 'stage917-regression',
    studyPage,
  })
  const notesSidebarVisible = await regressionHomePage.evaluate(() =>
    Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.trim() === 'Notes' || tab.getAttribute('aria-label') === 'Notes',
    ),
  )
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
    reviewReadyEvidence.metrics,
    reviewEvidence.metrics,
    sourceMemorySearchEvidence.metrics,
    filterEvidence.metrics,
    sourceSignalsEvidence.metrics,
    sourceOverviewEvidence.metrics,
    boardEvidence.metrics,
    laneEvidence.metrics,
    promotionEvidence.metrics,
    sourceEvidence.metrics,
  )
  const notebookStage889EmptyStatesStable =
    emptyEvidence.metrics.notebookEmptyWorkbenchOwned &&
    !emptyEvidence.metrics.notebookEmptyDetailIntroVisible &&
    emptyEvidence.metrics.notebookSearchEmptyWorkbenchOwned &&
    !emptyEvidence.metrics.notebookSearchEmptyDetailIntroVisible &&
    emptyEvidence.metrics.notebookCaptureInReaderNavigates
  const homePersonalNotesBoardStillNoteOwned =
    boardEvidence.metrics.homePersonalNotesBoardVisible &&
    boardEvidence.metrics.homePersonalNotesBoardStartsWithNoteItems &&
    boardEvidence.metrics.homePersonalNotesBoardUsesBodyPreview &&
    boardEvidence.metrics.homePersonalNotesBoardSyntheticAnchorHidden
  const metrics = {
    ...sentenceEvidence.metrics,
    ...emptyEvidence.metrics,
    ...regressionEvidence.metrics,
    ...sourceEvidence.metrics,
    ...laneEvidence.metrics,
    ...promotionEvidence.metrics,
    ...boardEvidence.metrics,
    ...sourceOverviewEvidence.metrics,
    ...sourceSignalsEvidence.metrics,
    ...filterEvidence.metrics,
    ...sourceMemorySearchEvidence.metrics,
    ...reviewEvidence.metrics,
    ...reviewReadyEvidence.metrics,
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
    homePersonalNotesBoardStillNoteOwned,
    notebookStage889EmptyStatesStable,
    notesSidebarVisible,
  }

  for (const [metricName, expected] of Object.entries({
    homeMemoryFilterControlsVisible: true,
    homePersonalNotesBoardStillNoteOwned: true,
    homeReviewReadyMatchesSignalVisible: true,
    homeReviewReadySignalOpensSourceScopedStudy: true,
    homeReviewReadySignalsDoNotMixBoardItems: true,
    homeReviewReadySourceSignalsUseDueCounts: true,
    homeReviewReadySourceSignalsVisible: true,
    homeSourceMemorySignalOpensSourceOverviewStack: true,
    homeSourceMemorySignalsVisible: true,
    notebookStage889EmptyStatesStable: true,
    notesSidebarVisible: false,
    readerSourceMemoryCountsActionable: true,
    readerSourceMemorySearchOpensSourceOverview: true,
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
    studySourceScopedQuestionSearchFindsEvidence: true,
    studySourceScopedQuestionSearchFindsPrompt: true,
    studySourceScopedQuestionSearchVisible: true,
    studySourceScopedQueueVisible: true,
    studySourceScopedReviewStaysInSourceAfterRating: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 917 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.stageHarnessCreatedNoteCleanupFailures.length > 0) {
    throw new Error(
      `Stage 917 expected harness cleanup without failures, got ${metrics.stageHarnessCreatedNoteCleanupFailures.length}.`,
    )
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 917 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage917-post-stage916-review-ready-sources-and-study-schedule-dashboard-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Stage 916 Home review-ready source signals and Study schedule dashboard remain stable.',
          'Stage 914 source-scoped Review/Questions, Stage 912 source-memory search, Home memory filters, source-memory signals, Personal notes, Source overview, Reader, Graph, Study, and Notebook remain stable.',
          'Harness-created notes self-clean and cleanup dry-run remains empty.',
        ],
        baseUrl,
        captures: {
          ...reviewReadyEvidence.captures,
          ...reviewEvidence.captures,
          ...sourceMemorySearchEvidence.captures,
          ...filterEvidence.captures,
          ...sourceSignalsEvidence.captures,
          ...sourceOverviewEvidence.captures,
          ...boardEvidence.captures,
          ...laneEvidence.captures,
          ...promotionEvidence.captures,
          ...sourceEvidence.captures,
          ...sentenceEvidence.captures,
          ...emptyEvidence.captures,
          ...regressionEvidence.captures,
        },
        cleanupDryRunAfterStage917: cleanupDryRun,
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
    captureFailure(reviewReadyPage, outputDir, 'stage917-review-ready-audit-failure.png'),
    captureFailure(reviewPage, outputDir, 'stage917-source-review-audit-failure.png'),
    captureFailure(searchPage, outputDir, 'stage917-source-memory-search-audit-failure.png'),
    captureFailure(filtersPage, outputDir, 'stage917-home-memory-filter-audit-failure.png'),
    captureFailure(signalsPage, outputDir, 'stage917-source-signal-audit-failure.png'),
    captureFailure(sourceOverviewPage, outputDir, 'stage917-source-overview-audit-failure.png'),
    captureFailure(boardPage, outputDir, 'stage917-personal-notes-board-audit-failure.png'),
    captureFailure(lanePage, outputDir, 'stage917-personal-notes-lane-audit-failure.png'),
    captureFailure(promotionPage, outputDir, 'stage917-promotion-audit-failure.png'),
    captureFailure(sourcePage, outputDir, 'stage917-source-note-audit-failure.png'),
    captureFailure(sentencePage, outputDir, 'stage917-sentence-note-audit-failure.png'),
    captureFailure(emptyPage, outputDir, 'stage917-empty-audit-failure.png'),
    captureFailure(regressionHomePage, outputDir, 'stage917-regression-home-failure.png'),
    captureFailure(graphPage, outputDir, 'stage917-regression-graph-failure.png'),
    captureFailure(readerPage, outputDir, 'stage917-regression-reader-failure.png'),
    captureFailure(studyPage, outputDir, 'stage917-regression-study-failure.png'),
    captureFailure(focusedPage, outputDir, 'stage917-regression-focused-failure.png'),
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
