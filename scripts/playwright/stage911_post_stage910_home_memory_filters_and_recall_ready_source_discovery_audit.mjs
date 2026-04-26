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
  captureSourceNotePromotionEvidence,
  captureSourceOverviewMemoryEvidence,
  desktopViewport,
  summarizeStageHarnessCleanupMetrics,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE911_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE911_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE911_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE911_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE911_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE911_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage911-home-memory-filter-audit-failure-filters.png',
  'stage911-home-memory-filter-audit-failure-signals.png',
  'stage911-home-memory-filter-audit-failure-source-overview.png',
  'stage911-home-memory-filter-audit-failure-board.png',
  'stage911-home-memory-filter-audit-failure-lane.png',
  'stage911-home-memory-filter-audit-failure-promotion.png',
  'stage911-home-memory-filter-audit-failure-source.png',
  'stage911-home-memory-filter-audit-failure-sentence.png',
  'stage911-home-memory-filter-audit-failure-empty.png',
  'stage911-home-memory-filter-audit-failure-regression-home.png',
  'stage911-home-memory-filter-audit-failure-graph.png',
  'stage911-home-memory-filter-audit-failure-reader.png',
  'stage911-home-memory-filter-audit-failure-study.png',
  'stage911-home-memory-filter-audit-failure-focused.png',
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

  const filterEvidence = await captureHomeMemoryFilterEvidence({
    baseUrl,
    directory: outputDir,
    page: filtersPage,
    stageLabel: 'Stage 911 Home memory filter audit',
    stagePrefix: 'stage911',
  })
  const sourceSignalsEvidence = await captureHomeSourceMemorySignalEvidence({
    baseUrl,
    directory: outputDir,
    page: signalsPage,
    stageLabel: 'Stage 911 Home source memory signal audit',
    stagePrefix: 'stage911-signals',
  })
  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceOverviewPage,
    stageLabel: 'Stage 911 source memory stack audit',
    stagePrefix: 'stage911-source-memory',
  })
  const boardEvidence = await captureHomePersonalNotesCollectionBoardEvidence({
    baseUrl,
    directory: outputDir,
    page: boardPage,
    stageLabel: 'Stage 911 Home personal-notes board audit',
    stagePrefix: 'stage911-board',
  })
  const laneEvidence = await captureHomePersonalNoteLaneEvidence({
    baseUrl,
    directory: outputDir,
    page: lanePage,
    stageLabel: 'Stage 911 Home personal-note lane/search audit',
    stagePrefix: 'stage911-lane',
  })
  const promotionEvidence = await captureSourceNotePromotionEvidence({
    baseUrl,
    directory: outputDir,
    page: promotionPage,
    stageLabel: 'Stage 911 source-note promotion audit',
    stagePrefix: 'stage911-promotion',
  })
  const sourceEvidence = await captureNotebookNewNoteDraftEvidence({
    baseUrl,
    directory: outputDir,
    page: sourcePage,
    stageLabel: 'Stage 911 source-anchor Notebook regression',
    stagePrefix: 'stage911-source',
    verifySourceReaderHandoff: true,
  })
  const sentenceEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: sentencePage,
    selectSentenceAnchor: true,
    stageLabel: 'Stage 911 sentence-anchor Notebook regression',
    stagePrefix: 'stage911-sentence',
  })
  const emptyEvidence = await captureNotebookEmptyStateEvidence({
    baseUrl,
    directory: outputDir,
    page: emptyPage,
    stageLabel: 'Stage 911 Notebook empty-state regression',
    stagePrefix: 'stage911-empty',
  })
  const regressionEvidence = await captureHomeOrganizerErgonomicsEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage: regressionHomePage,
    notebookPage: notebookRegressionPage,
    readerPage,
    stageLabel: 'Stage 911 cross-surface memory-filter regression audit',
    stagePrefix: 'stage911-regression',
    studyPage,
  })
  const notesSidebarVisible = await regressionHomePage.evaluate(() =>
    Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.trim() === 'Notes' || tab.getAttribute('aria-label') === 'Notes',
    ),
  )
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
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
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
    homePersonalNotesBoardStillNoteOwned,
    notebookStage889EmptyStatesStable,
    notesSidebarVisible,
  }

  for (const [metricName, expected] of Object.entries({
    homeMemoryFilterAnyNarrowsSourceBoard: true,
    homeMemoryFilterControlsVisible: true,
    homeMemoryFilterEmptyStateClearable: true,
    homeMemoryFilterGraphOnlyUsesSourceOwnedCounts: true,
    homeMemoryFilterMatchesSourceResults: true,
    homeMemoryFilterNotesOnlyUsesSourceOwnedCounts: true,
    homeMemoryFilterPreservesPersonalNotesBoard: true,
    homeMemoryFilterSignalsOpenSourceOverviewStack: true,
    homeMemoryFilterStudyOnlyUsesSourceOwnedCounts: true,
    homePersonalNotesBoardStillNoteOwned: true,
    homeSourceMemorySignalOpensSourceOverviewStack: true,
    homeSourceMemorySignalsDoNotMixBoardItems: true,
    homeSourceMemorySignalsVisible: true,
    notebookStage889EmptyStatesStable: true,
    notesSidebarVisible: false,
    readerSourceMemoryCountsActionable: true,
    sourceOverviewMemoryStackIncludesGraphItems: true,
    sourceOverviewMemoryStackIncludesStudyItems: true,
    sourceOverviewMemoryStackVisible: true,
    stageHarnessCreatedNotesCleanedUp: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 911 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.stageHarnessCreatedNoteCleanupFailures.length > 0) {
    throw new Error(
      `Stage 911 expected harness cleanup without failures, got ${metrics.stageHarnessCreatedNoteCleanupFailures.length}.`,
    )
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 911 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage911-post-stage910-home-memory-filters-and-recall-ready-source-discovery-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Stage 910 Home memory filters remain available, clearable, and source-owned.',
          'Stage 908/909 source memory signals, Personal notes, Source overview, Reader, Graph, Study, and Notebook remain stable.',
          'Harness-created notes self-clean and cleanup dry-run remains empty.',
        ],
        baseUrl,
        captures: {
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
        cleanupDryRunAfterStage911: cleanupDryRun,
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
    captureFailure(filtersPage, outputDir, 'stage911-home-memory-filter-audit-failure-filters.png'),
    captureFailure(signalsPage, outputDir, 'stage911-home-memory-filter-audit-failure-signals.png'),
    captureFailure(sourceOverviewPage, outputDir, 'stage911-home-memory-filter-audit-failure-source-overview.png'),
    captureFailure(boardPage, outputDir, 'stage911-home-memory-filter-audit-failure-board.png'),
    captureFailure(lanePage, outputDir, 'stage911-home-memory-filter-audit-failure-lane.png'),
    captureFailure(promotionPage, outputDir, 'stage911-home-memory-filter-audit-failure-promotion.png'),
    captureFailure(sourcePage, outputDir, 'stage911-home-memory-filter-audit-failure-source.png'),
    captureFailure(sentencePage, outputDir, 'stage911-home-memory-filter-audit-failure-sentence.png'),
    captureFailure(emptyPage, outputDir, 'stage911-home-memory-filter-audit-failure-empty.png'),
    captureFailure(regressionHomePage, outputDir, 'stage911-home-memory-filter-audit-failure-regression-home.png'),
    captureFailure(graphPage, outputDir, 'stage911-home-memory-filter-audit-failure-graph.png'),
    captureFailure(readerPage, outputDir, 'stage911-home-memory-filter-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage911-home-memory-filter-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage911-home-memory-filter-audit-failure-focused.png'),
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
