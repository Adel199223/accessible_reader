import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureHomeMemoryFilterEvidence,
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
  process.env.RECALL_STAGE910_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE910_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE910_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE910_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE910_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE910_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage910-home-memory-filter-failure-filters.png',
  'stage910-home-memory-filter-failure-signals.png',
  'stage910-home-memory-filter-failure-source-overview.png',
  'stage910-home-memory-filter-failure-board.png',
  'stage910-home-memory-filter-failure-sentence.png',
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
let sentencePage
try {
  filtersPage = await browser.newPage({ viewport: desktopViewport })
  signalsPage = await browser.newPage({ viewport: desktopViewport })
  sourceOverviewPage = await browser.newPage({ viewport: desktopViewport })
  boardPage = await browser.newPage({ viewport: desktopViewport })
  sentencePage = await browser.newPage({ viewport: desktopViewport })

  const filterEvidence = await captureHomeMemoryFilterEvidence({
    baseUrl,
    directory: outputDir,
    page: filtersPage,
    stageLabel: 'Stage 910 Home memory filters',
    stagePrefix: 'stage910',
  })
  const sourceSignalsEvidence = await captureHomeSourceMemorySignalEvidence({
    baseUrl,
    directory: outputDir,
    page: signalsPage,
    stageLabel: 'Stage 910 Home source memory signal regression',
    stagePrefix: 'stage910-signals',
  })
  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceOverviewPage,
    stageLabel: 'Stage 910 source memory stack regression',
    stagePrefix: 'stage910-source-memory',
  })
  const boardEvidence = await captureHomePersonalNotesCollectionBoardEvidence({
    baseUrl,
    directory: outputDir,
    page: boardPage,
    stageLabel: 'Stage 910 Home personal-notes board regression',
    stagePrefix: 'stage910-board',
  })
  const sentenceEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: sentencePage,
    selectSentenceAnchor: true,
    stageLabel: 'Stage 910 sentence-anchor Notebook regression',
    stagePrefix: 'stage910-sentence',
  })
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const notesSidebarVisible = await filtersPage.evaluate(() =>
    Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.trim() === 'Notes' || tab.getAttribute('aria-label') === 'Notes',
    ),
  )
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
    filterEvidence.metrics,
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
    ...filterEvidence.metrics,
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
    homePersonalNotesBoardStillNoteOwned,
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
    notesSidebarVisible: false,
    readerSourceMemoryCountsActionable: true,
    sourceOverviewMemoryStackVisible: true,
    stageHarnessCreatedNotesCleanedUp: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 910 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.stageHarnessCreatedNoteCleanupFailures.length > 0) {
    throw new Error(
      `Stage 910 expected harness cleanup without failures, got ${metrics.stageHarnessCreatedNoteCleanupFailures.length}.`,
    )
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 910 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage910-home-memory-filters-and-recall-ready-source-discovery-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Home memory filters expose All, Any, Notes, Graph, and Study controls in the source toolbar.',
          'Memory filters narrow source-card/list and Matches results using source-owned counts.',
          'Personal notes stay note-owned and memory signals still open the Source overview memory stack.',
        ],
        baseUrl,
        captures: {
          ...filterEvidence.captures,
          ...sourceSignalsEvidence.captures,
          ...sourceOverviewEvidence.captures,
          ...boardEvidence.captures,
          ...sentenceEvidence.captures,
        },
        cleanupDryRunAfterStage910: cleanupDryRun,
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
    captureFailure(filtersPage, outputDir, 'stage910-home-memory-filter-failure-filters.png'),
    captureFailure(signalsPage, outputDir, 'stage910-home-memory-filter-failure-signals.png'),
    captureFailure(sourceOverviewPage, outputDir, 'stage910-home-memory-filter-failure-source-overview.png'),
    captureFailure(boardPage, outputDir, 'stage910-home-memory-filter-failure-board.png'),
    captureFailure(sentencePage, outputDir, 'stage910-home-memory-filter-failure-sentence.png'),
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
