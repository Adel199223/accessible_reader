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
  process.env.RECALL_STAGE907_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE907_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE907_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE907_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE907_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE907_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage907-source-memory-audit-failure-source-overview.png',
  'stage907-source-memory-audit-failure-board.png',
  'stage907-source-memory-audit-failure-lane.png',
  'stage907-source-memory-audit-failure-promotion.png',
  'stage907-source-memory-audit-failure-source.png',
  'stage907-source-memory-audit-failure-sentence.png',
  'stage907-source-memory-audit-failure-empty.png',
  'stage907-source-memory-audit-failure-regression-home.png',
  'stage907-source-memory-audit-failure-graph.png',
  'stage907-source-memory-audit-failure-reader.png',
  'stage907-source-memory-audit-failure-study.png',
  'stage907-source-memory-audit-failure-focused.png',
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

  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceOverviewPage,
    stageLabel: 'Stage 907 source memory stack audit',
    stagePrefix: 'stage907-source-memory',
  })
  const boardEvidence = await captureHomePersonalNotesCollectionBoardEvidence({
    baseUrl,
    directory: outputDir,
    page: boardPage,
    stageLabel: 'Stage 907 Home personal-notes board audit',
    stagePrefix: 'stage907-board',
  })
  const laneEvidence = await captureHomePersonalNoteLaneEvidence({
    baseUrl,
    directory: outputDir,
    page: lanePage,
    stageLabel: 'Stage 907 Home personal-note lane/search audit',
    stagePrefix: 'stage907-lane',
  })
  const promotionEvidence = await captureSourceNotePromotionEvidence({
    baseUrl,
    directory: outputDir,
    page: promotionPage,
    stageLabel: 'Stage 907 source-note promotion audit',
    stagePrefix: 'stage907-promotion',
  })
  const sourceEvidence = await captureNotebookNewNoteDraftEvidence({
    baseUrl,
    directory: outputDir,
    page: sourcePage,
    stageLabel: 'Stage 907 source-anchor Notebook regression',
    stagePrefix: 'stage907-source',
    verifySourceReaderHandoff: true,
  })
  const sentenceEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: sentencePage,
    selectSentenceAnchor: true,
    stageLabel: 'Stage 907 sentence-anchor Notebook regression',
    stagePrefix: 'stage907-sentence',
  })
  const emptyEvidence = await captureNotebookEmptyStateEvidence({
    baseUrl,
    directory: outputDir,
    page: emptyPage,
    stageLabel: 'Stage 907 Notebook empty-state regression',
    stagePrefix: 'stage907-empty',
  })
  const regressionEvidence = await captureHomeOrganizerErgonomicsEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage: regressionHomePage,
    notebookPage: notebookRegressionPage,
    readerPage,
    stageLabel: 'Stage 907 cross-surface source memory regression audit',
    stagePrefix: 'stage907-regression',
    studyPage,
  })
  const notesSidebarVisible = await regressionHomePage.evaluate(() =>
    Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.trim() === 'Notes' || tab.getAttribute('aria-label') === 'Notes',
    ),
  )
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
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
  const metrics = {
    ...sentenceEvidence.metrics,
    ...emptyEvidence.metrics,
    ...regressionEvidence.metrics,
    ...sourceEvidence.metrics,
    ...laneEvidence.metrics,
    ...promotionEvidence.metrics,
    ...boardEvidence.metrics,
    ...sourceOverviewEvidence.metrics,
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
    notebookStage889EmptyStatesStable,
    notesSidebarVisible,
  }

  for (const [metricName, expected] of Object.entries({
    notebookStage889EmptyStatesStable: true,
    notesSidebarVisible: false,
    readerSourceGraphCountOpensFocusedGraph: true,
    readerSourceMemoryCountsActionable: true,
    readerSourceStudyCountOpensFocusedStudy: true,
    sourceOverviewGraphMemoryItemOpensFocusedGraph: true,
    sourceOverviewMemoryStackIncludesGraphItems: true,
    sourceOverviewMemoryStackIncludesPersonalNotes: true,
    sourceOverviewMemoryStackIncludesStudyItems: true,
    sourceOverviewMemoryStackVisible: true,
    sourceOverviewSourceNoteReaderHandoffUnanchored: true,
    sourceOverviewStudyMemoryItemOpensFocusedStudy: true,
    stageHarnessCreatedNotesCleanedUp: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 907 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.stageHarnessCreatedNoteCleanupFailures.length > 0) {
    throw new Error(
      `Stage 907 expected harness cleanup without failures, got ${metrics.stageHarnessCreatedNoteCleanupFailures.length}.`,
    )
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 907 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage907-post-stage906-source-memory-stack-and-reader-led-memory-handoffs-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Stage 906 source memory stack behavior remains stable across source overview and Reader-led handoffs.',
          'Home personal notes, Notebook source/sentence semantics, Graph/Study promotion, and broad surfaces stay green.',
          'Harness-created notes self-clean and historical audit-artifact dry-run remains empty.',
        ],
        baseUrl,
        captures: {
          ...sourceOverviewEvidence.captures,
          ...boardEvidence.captures,
          ...laneEvidence.captures,
          ...promotionEvidence.captures,
          ...sourceEvidence.captures,
          ...sentenceEvidence.captures,
          ...emptyEvidence.captures,
          ...regressionEvidence.captures,
        },
        cleanupDryRunAfterStage907: cleanupDryRun,
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
    captureFailure(sourceOverviewPage, outputDir, 'stage907-source-memory-audit-failure-source-overview.png'),
    captureFailure(boardPage, outputDir, 'stage907-source-memory-audit-failure-board.png'),
    captureFailure(lanePage, outputDir, 'stage907-source-memory-audit-failure-lane.png'),
    captureFailure(promotionPage, outputDir, 'stage907-source-memory-audit-failure-promotion.png'),
    captureFailure(sourcePage, outputDir, 'stage907-source-memory-audit-failure-source.png'),
    captureFailure(sentencePage, outputDir, 'stage907-source-memory-audit-failure-sentence.png'),
    captureFailure(emptyPage, outputDir, 'stage907-source-memory-audit-failure-empty.png'),
    captureFailure(regressionHomePage, outputDir, 'stage907-source-memory-audit-failure-regression-home.png'),
    captureFailure(graphPage, outputDir, 'stage907-source-memory-audit-failure-graph.png'),
    captureFailure(readerPage, outputDir, 'stage907-source-memory-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage907-source-memory-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage907-source-memory-audit-failure-focused.png'),
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
