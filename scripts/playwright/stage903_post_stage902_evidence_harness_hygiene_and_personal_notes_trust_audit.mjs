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
  captureSourceOverviewMemoryEvidence,
  desktopViewport,
  summarizeStageHarnessCleanupMetrics,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE903_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE903_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE903_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE903_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE903_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE903_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage903-harness-hygiene-audit-failure-source-overview.png',
  'stage903-harness-hygiene-audit-failure-board.png',
  'stage903-harness-hygiene-audit-failure-lane.png',
  'stage903-harness-hygiene-audit-failure-source.png',
  'stage903-harness-hygiene-audit-failure-sentence.png',
  'stage903-harness-hygiene-audit-failure-empty.png',
  'stage903-harness-hygiene-audit-failure-regression-home.png',
  'stage903-harness-hygiene-audit-failure-graph.png',
  'stage903-harness-hygiene-audit-failure-reader.png',
  'stage903-harness-hygiene-audit-failure-study.png',
  'stage903-harness-hygiene-audit-failure-focused.png',
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
    stageLabel: 'Stage 903 source memory cleanup audit',
    stagePrefix: 'stage903-source-memory',
  })
  const boardEvidence = await captureHomePersonalNotesCollectionBoardEvidence({
    baseUrl,
    directory: outputDir,
    page: boardPage,
    stageLabel: 'Stage 903 Home personal-notes board cleanup audit',
    stagePrefix: 'stage903-board',
  })
  const laneEvidence = await captureHomePersonalNoteLaneEvidence({
    baseUrl,
    directory: outputDir,
    page: lanePage,
    stageLabel: 'Stage 903 Home personal-note lane/search cleanup audit',
    stagePrefix: 'stage903-lane',
  })
  const sourceEvidence = await captureNotebookNewNoteDraftEvidence({
    baseUrl,
    directory: outputDir,
    page: sourcePage,
    stageLabel: 'Stage 903 source-anchor Notebook cleanup audit',
    stagePrefix: 'stage903-source',
    verifySourceReaderHandoff: true,
  })
  const sentenceEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: sentencePage,
    selectSentenceAnchor: true,
    stageLabel: 'Stage 903 sentence-anchor Notebook regression',
    stagePrefix: 'stage903-sentence',
  })
  const emptyEvidence = await captureNotebookEmptyStateEvidence({
    baseUrl,
    directory: outputDir,
    page: emptyPage,
    stageLabel: 'Stage 903 Notebook empty-state regression',
    stagePrefix: 'stage903-empty',
  })
  const regressionEvidence = await captureHomeOrganizerErgonomicsEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage: regressionHomePage,
    notebookPage: notebookRegressionPage,
    readerPage,
    stageLabel: 'Stage 903 cross-surface regression audit',
    stagePrefix: 'stage903-regression',
    studyPage,
  })
  const notesSidebarVisible = await regressionHomePage.evaluate(() =>
    Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.trim() === 'Notes' || tab.getAttribute('aria-label') === 'Notes',
    ),
  )
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const cleanupUtilityMetrics = readCleanupUtilityMetrics(cleanupDryRun)
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
    sourceOverviewEvidence.metrics,
    boardEvidence.metrics,
    laneEvidence.metrics,
    sourceEvidence.metrics,
  )

  const notebookStage889EmptyStatesStable =
    emptyEvidence.metrics.notebookEmptyWorkbenchOwned &&
    !emptyEvidence.metrics.notebookEmptyDetailIntroVisible &&
    emptyEvidence.metrics.notebookSearchEmptyWorkbenchOwned &&
    !emptyEvidence.metrics.notebookSearchEmptyDetailIntroVisible &&
    emptyEvidence.metrics.notebookCaptureInReaderNavigates

  if (!notebookStage889EmptyStatesStable) {
    throw new Error('Stage 903 expected the Stage 889 Notebook empty/search-empty states to remain stable.')
  }
  if (notesSidebarVisible) {
    throw new Error('Stage 903 expected the retired Notes sidebar tab to stay hidden.')
  }

  await writeFile(
    path.join(outputDir, 'stage903-post-stage902-evidence-harness-hygiene-and-personal-notes-trust-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 902 cleanup-owned note helpers should remain self-cleaning across broad Notebook/Home/source-memory paths.',
          'Home, Graph, Reader, Study, focused Notebook, and source overview should stay at their Stage 901 regression baseline.',
          'The dry-run cleanup utility should keep existing audit artifacts inspectable without mutating the workspace.',
        ],
        baseUrl,
        captures: {
          ...sourceOverviewEvidence.captures,
          ...boardEvidence.captures,
          ...laneEvidence.captures,
          ...sourceEvidence.captures,
          ...sentenceEvidence.captures,
          ...emptyEvidence.captures,
          ...regressionEvidence.captures,
        },
        cleanupDryRun,
        desktopViewport,
        focusedViewport,
        headless,
        metrics: {
          ...sentenceEvidence.metrics,
          ...emptyEvidence.metrics,
          ...regressionEvidence.metrics,
          ...sourceEvidence.metrics,
          ...laneEvidence.metrics,
          ...boardEvidence.metrics,
          ...sourceOverviewEvidence.metrics,
          ...harnessCleanupMetrics,
          ...cleanupUtilityMetrics,
          notebookStage889EmptyStatesStable,
          notesSidebarVisible,
        },
        runtimeBrowser,
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  await Promise.all([
    captureFailure(sourceOverviewPage, outputDir, 'stage903-harness-hygiene-audit-failure-source-overview.png'),
    captureFailure(boardPage, outputDir, 'stage903-harness-hygiene-audit-failure-board.png'),
    captureFailure(lanePage, outputDir, 'stage903-harness-hygiene-audit-failure-lane.png'),
    captureFailure(sourcePage, outputDir, 'stage903-harness-hygiene-audit-failure-source.png'),
    captureFailure(sentencePage, outputDir, 'stage903-harness-hygiene-audit-failure-sentence.png'),
    captureFailure(emptyPage, outputDir, 'stage903-harness-hygiene-audit-failure-empty.png'),
    captureFailure(regressionHomePage, outputDir, 'stage903-harness-hygiene-audit-failure-regression-home.png'),
    captureFailure(graphPage, outputDir, 'stage903-harness-hygiene-audit-failure-graph.png'),
    captureFailure(readerPage, outputDir, 'stage903-harness-hygiene-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage903-harness-hygiene-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage903-harness-hygiene-audit-failure-focused.png'),
  ])
  await writeFile(
    path.join(outputDir, 'stage903-evidence-harness-hygiene-audit-failure.json'),
    JSON.stringify(
      {
        error: error instanceof Error ? error.message : String(error),
        stageHarnessCleanupMetrics: error?.stageHarnessCleanupMetrics ?? null,
      },
      null,
      2,
    ),
    'utf8',
  ).catch(() => undefined)
  throw error
} finally {
  await browser.close()
}

function readCleanupUtilityMetrics(cleanupDryRun) {
  return {
    cleanupUtilityApplyDeletesOnlyStageArtifacts:
      cleanupDryRun.searchFailures.length === 0 &&
      cleanupDryRun.matches.every(
        (match) =>
          match.anchorKind === 'source' &&
          /^Stage stage\d{3}(?:-[a-z0-9-]+)? (?:source-attached note|library-native personal note|personal notes board body|source overview memory body|source note insight)\b/i.test(
            match.bodyText,
          ),
      ),
    cleanupUtilityDryRunListsStageArtifacts: cleanupDryRun.matchedCount > 0,
    cleanupUtilityDryRunMatchedCount: cleanupDryRun.matchedCount,
    cleanupUtilitySearchFailures: cleanupDryRun.searchFailures,
  }
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
