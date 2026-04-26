import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureHomePersonalNotesCollectionBoardEvidence,
  captureHomeSourceMemorySignalEvidence,
  captureNotebookWorkbenchEvidence,
  captureSourceOverviewMemoryEvidence,
  desktopViewport,
  summarizeStageHarnessCleanupMetrics,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE908_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE908_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE908_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE908_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE908_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE908_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage908-home-source-memory-failure-signals.png',
  'stage908-home-source-memory-failure-source-overview.png',
  'stage908-home-source-memory-failure-board.png',
  'stage908-home-source-memory-failure-sentence.png',
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
let sentencePage
try {
  signalsPage = await browser.newPage({ viewport: desktopViewport })
  sourceOverviewPage = await browser.newPage({ viewport: desktopViewport })
  boardPage = await browser.newPage({ viewport: desktopViewport })
  sentencePage = await browser.newPage({ viewport: desktopViewport })

  const sourceSignalsEvidence = await captureHomeSourceMemorySignalEvidence({
    baseUrl,
    directory: outputDir,
    page: signalsPage,
    stageLabel: 'Stage 908 Home source memory signals',
    stagePrefix: 'stage908',
  })
  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceOverviewPage,
    stageLabel: 'Stage 908 source memory stack regression',
    stagePrefix: 'stage908-source-memory',
  })
  const boardEvidence = await captureHomePersonalNotesCollectionBoardEvidence({
    baseUrl,
    directory: outputDir,
    page: boardPage,
    stageLabel: 'Stage 908 Home personal-notes board regression',
    stagePrefix: 'stage908-board',
  })
  const sentenceEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: sentencePage,
    selectSentenceAnchor: true,
    stageLabel: 'Stage 908 sentence-anchor Notebook regression',
    stagePrefix: 'stage908-sentence',
  })
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
    sourceSignalsEvidence.metrics,
    sourceOverviewEvidence.metrics,
    boardEvidence.metrics,
  )
  const homePersonalNotesBoardStillNoteOwned =
    boardEvidence.metrics.homePersonalNotesBoardVisible &&
    boardEvidence.metrics.homePersonalNotesBoardStartsWithNoteItems &&
    boardEvidence.metrics.homePersonalNotesBoardUsesBodyPreview &&
    boardEvidence.metrics.homePersonalNotesBoardSyntheticAnchorHidden
  const metrics = {
    ...sentenceEvidence.metrics,
    ...boardEvidence.metrics,
    ...sourceOverviewEvidence.metrics,
    ...sourceSignalsEvidence.metrics,
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
    homePersonalNotesBoardStillNoteOwned,
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
    readerSourceMemoryCountsActionable: true,
    sourceOverviewMemoryStackIncludesGraphItems: true,
    sourceOverviewMemoryStackIncludesStudyItems: true,
    sourceOverviewMemoryStackVisible: true,
    stageHarnessCreatedNotesCleanedUp: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 908 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.stageHarnessCreatedNoteCleanupFailures.length > 0) {
    throw new Error(
      `Stage 908 expected harness cleanup without failures, got ${metrics.stageHarnessCreatedNoteCleanupFailures.length}.`,
    )
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 908 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage908-home-source-memory-signals-and-library-discovery-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Home source cards and list rows expose compact source-owned memory signals.',
          'Memory signals hand off to the existing Source overview memory stack.',
          'Home source boards stay source-card boards while Personal notes remains note-owned.',
        ],
        baseUrl,
        captures: {
          ...sourceSignalsEvidence.captures,
          ...sourceOverviewEvidence.captures,
          ...boardEvidence.captures,
          ...sentenceEvidence.captures,
        },
        cleanupDryRunAfterStage908: cleanupDryRun,
        desktopViewport,
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
    captureFailure(signalsPage, outputDir, 'stage908-home-source-memory-failure-signals.png'),
    captureFailure(sourceOverviewPage, outputDir, 'stage908-home-source-memory-failure-source-overview.png'),
    captureFailure(boardPage, outputDir, 'stage908-home-source-memory-failure-board.png'),
    captureFailure(sentencePage, outputDir, 'stage908-home-source-memory-failure-sentence.png'),
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
