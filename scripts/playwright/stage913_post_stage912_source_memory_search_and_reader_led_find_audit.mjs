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
  desktopViewport,
  summarizeStageHarnessCleanupMetrics,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE913_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE913_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE913_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE913_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE913_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE913_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage913-source-memory-search-audit-failure.png',
  'stage913-home-memory-filter-audit-failure.png',
  'stage913-source-signal-audit-failure.png',
  'stage913-source-overview-audit-failure.png',
  'stage913-personal-notes-board-audit-failure.png',
  'stage913-personal-notes-lane-audit-failure.png',
  'stage913-promotion-audit-failure.png',
  'stage913-source-note-audit-failure.png',
  'stage913-sentence-note-audit-failure.png',
  'stage913-empty-audit-failure.png',
  'stage913-regression-home-failure.png',
  'stage913-regression-graph-failure.png',
  'stage913-regression-reader-failure.png',
  'stage913-regression-study-failure.png',
  'stage913-regression-focused-failure.png',
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

  const sourceMemorySearchEvidence = await captureSourceMemorySearchEvidence({
    baseUrl,
    directory: outputDir,
    page: searchPage,
    stageLabel: 'Stage 913 source memory search audit',
    stagePrefix: 'stage913',
  })
  const filterEvidence = await captureHomeMemoryFilterEvidence({
    baseUrl,
    directory: outputDir,
    page: filtersPage,
    stageLabel: 'Stage 913 Home memory filter audit',
    stagePrefix: 'stage913-filter',
  })
  const sourceSignalsEvidence = await captureHomeSourceMemorySignalEvidence({
    baseUrl,
    directory: outputDir,
    page: signalsPage,
    stageLabel: 'Stage 913 Home source memory signal audit',
    stagePrefix: 'stage913-signals',
  })
  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceOverviewPage,
    stageLabel: 'Stage 913 source memory stack audit',
    stagePrefix: 'stage913-source-memory',
  })
  const boardEvidence = await captureHomePersonalNotesCollectionBoardEvidence({
    baseUrl,
    directory: outputDir,
    page: boardPage,
    stageLabel: 'Stage 913 Home personal-notes board audit',
    stagePrefix: 'stage913-board',
  })
  const laneEvidence = await captureHomePersonalNoteLaneEvidence({
    baseUrl,
    directory: outputDir,
    page: lanePage,
    stageLabel: 'Stage 913 Home personal-note lane/search audit',
    stagePrefix: 'stage913-lane',
  })
  const promotionEvidence = await captureSourceNotePromotionEvidence({
    baseUrl,
    directory: outputDir,
    page: promotionPage,
    stageLabel: 'Stage 913 source-note promotion audit',
    stagePrefix: 'stage913-promotion',
  })
  const sourceEvidence = await captureNotebookNewNoteDraftEvidence({
    baseUrl,
    directory: outputDir,
    page: sourcePage,
    stageLabel: 'Stage 913 source-anchor Notebook regression',
    stagePrefix: 'stage913-source',
    verifySourceReaderHandoff: true,
  })
  const sentenceEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: sentencePage,
    selectSentenceAnchor: true,
    stageLabel: 'Stage 913 sentence-anchor Notebook regression',
    stagePrefix: 'stage913-sentence',
  })
  const emptyEvidence = await captureNotebookEmptyStateEvidence({
    baseUrl,
    directory: outputDir,
    page: emptyPage,
    stageLabel: 'Stage 913 Notebook empty-state regression',
    stagePrefix: 'stage913-empty',
  })
  const regressionEvidence = await captureHomeOrganizerErgonomicsEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage: regressionHomePage,
    notebookPage: notebookRegressionPage,
    readerPage,
    stageLabel: 'Stage 913 cross-surface source-memory-search audit',
    stagePrefix: 'stage913-regression',
    studyPage,
  })
  const notesSidebarVisible = await regressionHomePage.evaluate(() =>
    Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.trim() === 'Notes' || tab.getAttribute('aria-label') === 'Notes',
    ),
  )
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
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
    sourceMemorySearchControlsVisible: true,
    sourceMemorySearchEmptyStateClearable: true,
    sourceMemorySearchFindsGraphItems: true,
    sourceMemorySearchFindsPersonalNotes: true,
    sourceMemorySearchFindsSourceText: true,
    sourceMemorySearchFindsStudyItems: true,
    sourceMemorySearchGraphItemOpensFocusedGraph: true,
    sourceMemorySearchPersonalNoteOpensNotebook: true,
    sourceMemorySearchReaderHandoffPreservesAnchorSemantics: true,
    sourceMemorySearchStudyItemOpensFocusedStudy: true,
    sourceOverviewMemoryStackIncludesGraphItems: true,
    sourceOverviewMemoryStackIncludesStudyItems: true,
    sourceOverviewMemoryStackVisible: true,
    stageHarnessCreatedNotesCleanedUp: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 913 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.stageHarnessCreatedNoteCleanupFailures.length > 0) {
    throw new Error(
      `Stage 913 expected harness cleanup without failures, got ${metrics.stageHarnessCreatedNoteCleanupFailures.length}.`,
    )
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 913 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage913-post-stage912-source-memory-search-and-reader-led-find-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Stage 912 source-memory search remains source-scoped and handoff-correct.',
          'Home memory filters, source signals, Personal notes, Source overview, Reader, Graph, Study, and Notebook remain stable.',
          'Harness-created notes self-clean and cleanup dry-run remains empty.',
        ],
        baseUrl,
        captures: {
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
        cleanupDryRunAfterStage913: cleanupDryRun,
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
    captureFailure(searchPage, outputDir, 'stage913-source-memory-search-audit-failure.png'),
    captureFailure(filtersPage, outputDir, 'stage913-home-memory-filter-audit-failure.png'),
    captureFailure(signalsPage, outputDir, 'stage913-source-signal-audit-failure.png'),
    captureFailure(sourceOverviewPage, outputDir, 'stage913-source-overview-audit-failure.png'),
    captureFailure(boardPage, outputDir, 'stage913-personal-notes-board-audit-failure.png'),
    captureFailure(lanePage, outputDir, 'stage913-personal-notes-lane-audit-failure.png'),
    captureFailure(promotionPage, outputDir, 'stage913-promotion-audit-failure.png'),
    captureFailure(sourcePage, outputDir, 'stage913-source-note-audit-failure.png'),
    captureFailure(sentencePage, outputDir, 'stage913-sentence-note-audit-failure.png'),
    captureFailure(emptyPage, outputDir, 'stage913-empty-audit-failure.png'),
    captureFailure(regressionHomePage, outputDir, 'stage913-regression-home-failure.png'),
    captureFailure(graphPage, outputDir, 'stage913-regression-graph-failure.png'),
    captureFailure(readerPage, outputDir, 'stage913-regression-reader-failure.png'),
    captureFailure(studyPage, outputDir, 'stage913-regression-study-failure.png'),
    captureFailure(focusedPage, outputDir, 'stage913-regression-focused-failure.png'),
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
