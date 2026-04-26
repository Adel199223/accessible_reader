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
  process.env.RECALL_STAGE909_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE909_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE909_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE909_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE909_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE909_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage909-home-source-memory-audit-failure-signals.png',
  'stage909-home-source-memory-audit-failure-source-overview.png',
  'stage909-home-source-memory-audit-failure-board.png',
  'stage909-home-source-memory-audit-failure-lane.png',
  'stage909-home-source-memory-audit-failure-promotion.png',
  'stage909-home-source-memory-audit-failure-source.png',
  'stage909-home-source-memory-audit-failure-sentence.png',
  'stage909-home-source-memory-audit-failure-empty.png',
  'stage909-home-source-memory-audit-failure-regression-home.png',
  'stage909-home-source-memory-audit-failure-graph.png',
  'stage909-home-source-memory-audit-failure-reader.png',
  'stage909-home-source-memory-audit-failure-study.png',
  'stage909-home-source-memory-audit-failure-focused.png',
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

  const sourceSignalsEvidence = await captureHomeSourceMemorySignalEvidence({
    baseUrl,
    directory: outputDir,
    page: signalsPage,
    stageLabel: 'Stage 909 Home source memory signal audit',
    stagePrefix: 'stage909',
  })
  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceOverviewPage,
    stageLabel: 'Stage 909 source memory stack audit',
    stagePrefix: 'stage909-source-memory',
  })
  const boardEvidence = await captureHomePersonalNotesCollectionBoardEvidence({
    baseUrl,
    directory: outputDir,
    page: boardPage,
    stageLabel: 'Stage 909 Home personal-notes board audit',
    stagePrefix: 'stage909-board',
  })
  const laneEvidence = await captureHomePersonalNoteLaneEvidence({
    baseUrl,
    directory: outputDir,
    page: lanePage,
    stageLabel: 'Stage 909 Home personal-note lane/search audit',
    stagePrefix: 'stage909-lane',
  })
  const promotionEvidence = await captureSourceNotePromotionEvidence({
    baseUrl,
    directory: outputDir,
    page: promotionPage,
    stageLabel: 'Stage 909 source-note promotion audit',
    stagePrefix: 'stage909-promotion',
  })
  const sourceEvidence = await captureNotebookNewNoteDraftEvidence({
    baseUrl,
    directory: outputDir,
    page: sourcePage,
    stageLabel: 'Stage 909 source-anchor Notebook regression',
    stagePrefix: 'stage909-source',
    verifySourceReaderHandoff: true,
  })
  const sentenceEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: sentencePage,
    selectSentenceAnchor: true,
    stageLabel: 'Stage 909 sentence-anchor Notebook regression',
    stagePrefix: 'stage909-sentence',
  })
  const emptyEvidence = await captureNotebookEmptyStateEvidence({
    baseUrl,
    directory: outputDir,
    page: emptyPage,
    stageLabel: 'Stage 909 Notebook empty-state regression',
    stagePrefix: 'stage909-empty',
  })
  const regressionEvidence = await captureHomeOrganizerErgonomicsEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage: regressionHomePage,
    notebookPage: notebookRegressionPage,
    readerPage,
    stageLabel: 'Stage 909 cross-surface source memory regression audit',
    stagePrefix: 'stage909-regression',
    studyPage,
  })
  const notesSidebarVisible = await regressionHomePage.evaluate(() =>
    Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.trim() === 'Notes' || tab.getAttribute('aria-label') === 'Notes',
    ),
  )
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
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
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
    homePersonalNotesBoardStillNoteOwned,
    notebookStage889EmptyStatesStable,
    notesSidebarVisible,
  }

  for (const [metricName, expected] of Object.entries({
    homeMatchesSourceMemorySignalVisible: true,
    homePersonalNotesBoardStillNoteOwned: true,
    homeSourceCardBoardPreserved: true,
    homeSourceListRowsShowMemorySignal: true,
    homeSourceMemorySignalOpensSourceOverviewStack: true,
    homeSourceMemorySignalsDoNotMixBoardItems: true,
    homeSourceMemorySignalsPreservePreviewDensity: true,
    homeSourceMemorySignalsUseSourceOwnedCounts: true,
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
      throw new Error(`Stage 909 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.stageHarnessCreatedNoteCleanupFailures.length > 0) {
    throw new Error(
      `Stage 909 expected harness cleanup without failures, got ${metrics.stageHarnessCreatedNoteCleanupFailures.length}.`,
    )
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 909 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage909-post-stage908-home-source-memory-signals-and-library-discovery-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Stage 908 Home source memory signals remain visible on source cards, list rows, and Matches.',
          'Source overview memory stack, Reader-led memory counts, Personal notes, Notebook, Graph, and Study stay stable.',
          'Harness-created notes self-clean and historical audit-artifact dry-run remains empty.',
        ],
        baseUrl,
        captures: {
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
        cleanupDryRunAfterStage909: cleanupDryRun,
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
    captureFailure(signalsPage, outputDir, 'stage909-home-source-memory-audit-failure-signals.png'),
    captureFailure(sourceOverviewPage, outputDir, 'stage909-home-source-memory-audit-failure-source-overview.png'),
    captureFailure(boardPage, outputDir, 'stage909-home-source-memory-audit-failure-board.png'),
    captureFailure(lanePage, outputDir, 'stage909-home-source-memory-audit-failure-lane.png'),
    captureFailure(promotionPage, outputDir, 'stage909-home-source-memory-audit-failure-promotion.png'),
    captureFailure(sourcePage, outputDir, 'stage909-home-source-memory-audit-failure-source.png'),
    captureFailure(sentencePage, outputDir, 'stage909-home-source-memory-audit-failure-sentence.png'),
    captureFailure(emptyPage, outputDir, 'stage909-home-source-memory-audit-failure-empty.png'),
    captureFailure(regressionHomePage, outputDir, 'stage909-home-source-memory-audit-failure-regression-home.png'),
    captureFailure(graphPage, outputDir, 'stage909-home-source-memory-audit-failure-graph.png'),
    captureFailure(readerPage, outputDir, 'stage909-home-source-memory-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage909-home-source-memory-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage909-home-source-memory-audit-failure-focused.png'),
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
