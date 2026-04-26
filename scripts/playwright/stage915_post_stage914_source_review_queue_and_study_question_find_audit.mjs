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
  process.env.RECALL_STAGE915_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE915_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl =
  process.env.RECALL_STAGE915_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE915_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE915_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE915_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage915-source-review-audit-failure.png',
  'stage915-source-memory-search-audit-failure.png',
  'stage915-home-memory-filter-audit-failure.png',
  'stage915-source-signal-audit-failure.png',
  'stage915-source-overview-audit-failure.png',
  'stage915-personal-notes-board-audit-failure.png',
  'stage915-personal-notes-lane-audit-failure.png',
  'stage915-promotion-audit-failure.png',
  'stage915-source-note-audit-failure.png',
  'stage915-sentence-note-audit-failure.png',
  'stage915-empty-audit-failure.png',
  'stage915-regression-home-failure.png',
  'stage915-regression-graph-failure.png',
  'stage915-regression-reader-failure.png',
  'stage915-regression-study-failure.png',
  'stage915-regression-focused-failure.png',
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

  const reviewEvidence = await captureSourceReviewQueueEvidence({
    baseUrl,
    directory: outputDir,
    page: reviewPage,
    stageLabel: 'Stage 915 source review queue audit',
    stagePrefix: 'stage915',
  })
  const sourceMemorySearchEvidence = await captureSourceMemorySearchEvidence({
    baseUrl,
    directory: outputDir,
    page: searchPage,
    stageLabel: 'Stage 915 source memory search audit',
    stagePrefix: 'stage915-search',
  })
  const filterEvidence = await captureHomeMemoryFilterEvidence({
    baseUrl,
    directory: outputDir,
    page: filtersPage,
    stageLabel: 'Stage 915 Home memory filter audit',
    stagePrefix: 'stage915-filter',
  })
  const sourceSignalsEvidence = await captureHomeSourceMemorySignalEvidence({
    baseUrl,
    directory: outputDir,
    page: signalsPage,
    stageLabel: 'Stage 915 Home source-memory signal audit',
    stagePrefix: 'stage915-signals',
  })
  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceOverviewPage,
    stageLabel: 'Stage 915 source overview memory stack audit',
    stagePrefix: 'stage915-source-memory',
  })
  const boardEvidence = await captureHomePersonalNotesCollectionBoardEvidence({
    baseUrl,
    directory: outputDir,
    page: boardPage,
    stageLabel: 'Stage 915 Home personal-notes board audit',
    stagePrefix: 'stage915-board',
  })
  const laneEvidence = await captureHomePersonalNoteLaneEvidence({
    baseUrl,
    directory: outputDir,
    page: lanePage,
    stageLabel: 'Stage 915 Home personal-note lane/search audit',
    stagePrefix: 'stage915-lane',
  })
  const promotionEvidence = await captureSourceNotePromotionEvidence({
    baseUrl,
    directory: outputDir,
    page: promotionPage,
    stageLabel: 'Stage 915 source-note promotion audit',
    stagePrefix: 'stage915-promotion',
  })
  const sourceEvidence = await captureNotebookNewNoteDraftEvidence({
    baseUrl,
    directory: outputDir,
    page: sourcePage,
    stageLabel: 'Stage 915 source-anchor Notebook regression',
    stagePrefix: 'stage915-source',
    verifySourceReaderHandoff: true,
  })
  const sentenceEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: sentencePage,
    selectSentenceAnchor: true,
    stageLabel: 'Stage 915 sentence-anchor Notebook regression',
    stagePrefix: 'stage915-sentence',
  })
  const emptyEvidence = await captureNotebookEmptyStateEvidence({
    baseUrl,
    directory: outputDir,
    page: emptyPage,
    stageLabel: 'Stage 915 Notebook empty-state regression',
    stagePrefix: 'stage915-empty',
  })
  const regressionEvidence = await captureHomeOrganizerErgonomicsEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage: regressionHomePage,
    notebookPage: notebookRegressionPage,
    readerPage,
    stageLabel: 'Stage 915 cross-surface source-review audit',
    stagePrefix: 'stage915-regression',
    studyPage,
  })
  const notesSidebarVisible = await regressionHomePage.evaluate(() =>
    Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.trim() === 'Notes' || tab.getAttribute('aria-label') === 'Notes',
    ),
  )
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
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
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
    homePersonalNotesBoardStillNoteOwned,
    notebookStage889EmptyStatesStable,
    notesSidebarVisible,
  }

  for (const [metricName, expected] of Object.entries({
    homeMemoryFilterControlsVisible: true,
    homeMemoryFilterSignalsOpenSourceOverviewStack: true,
    homePersonalNotesBoardStillNoteOwned: true,
    homeSourceMemorySignalOpensSourceOverviewStack: true,
    homeSourceMemorySignalsVisible: true,
    notebookStage889EmptyStatesStable: true,
    notesSidebarVisible: false,
    readerSourceMemoryCountsActionable: true,
    readerSourceMemorySearchOpensSourceOverview: true,
    readerSourceStudyCountOpensSourceScopedStudy: true,
    sourceMemorySearchControlsVisible: true,
    sourceMemorySearchFindsGraphItems: true,
    sourceMemorySearchFindsPersonalNotes: true,
    sourceMemorySearchFindsSourceText: true,
    sourceMemorySearchFindsStudyItems: true,
    sourceOverviewMemoryStackIncludesGraphItems: true,
    sourceOverviewMemoryStackIncludesStudyItems: true,
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
      throw new Error(`Stage 915 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.stageHarnessCreatedNoteCleanupFailures.length > 0) {
    throw new Error(
      `Stage 915 expected harness cleanup without failures, got ${metrics.stageHarnessCreatedNoteCleanupFailures.length}.`,
    )
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 915 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage915-post-stage914-source-review-queue-and-study-question-find-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Stage 914 Source review, source-scoped Study queue, and Study question search remain stable.',
          'Stage 912/913 source-memory search, Home memory filters, source signals, Personal notes, Source overview, Reader, Graph, Study, and Notebook remain stable.',
          'Harness-created notes self-clean and cleanup dry-run remains empty.',
        ],
        baseUrl,
        captures: {
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
        cleanupDryRunAfterStage915: cleanupDryRun,
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
    captureFailure(reviewPage, outputDir, 'stage915-source-review-audit-failure.png'),
    captureFailure(searchPage, outputDir, 'stage915-source-memory-search-audit-failure.png'),
    captureFailure(filtersPage, outputDir, 'stage915-home-memory-filter-audit-failure.png'),
    captureFailure(signalsPage, outputDir, 'stage915-source-signal-audit-failure.png'),
    captureFailure(sourceOverviewPage, outputDir, 'stage915-source-overview-audit-failure.png'),
    captureFailure(boardPage, outputDir, 'stage915-personal-notes-board-audit-failure.png'),
    captureFailure(lanePage, outputDir, 'stage915-personal-notes-lane-audit-failure.png'),
    captureFailure(promotionPage, outputDir, 'stage915-promotion-audit-failure.png'),
    captureFailure(sourcePage, outputDir, 'stage915-source-note-audit-failure.png'),
    captureFailure(sentencePage, outputDir, 'stage915-sentence-note-audit-failure.png'),
    captureFailure(emptyPage, outputDir, 'stage915-empty-audit-failure.png'),
    captureFailure(regressionHomePage, outputDir, 'stage915-regression-home-failure.png'),
    captureFailure(graphPage, outputDir, 'stage915-regression-graph-failure.png'),
    captureFailure(readerPage, outputDir, 'stage915-regression-reader-failure.png'),
    captureFailure(studyPage, outputDir, 'stage915-regression-study-failure.png'),
    captureFailure(focusedPage, outputDir, 'stage915-regression-focused-failure.png'),
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
