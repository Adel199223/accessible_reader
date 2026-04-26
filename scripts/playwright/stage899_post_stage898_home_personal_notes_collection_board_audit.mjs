import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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
  desktopViewport,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE899_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE899_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE899_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE899_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE899_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE899_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage899-post-stage898-personal-notes-board-audit-failure-board.png',
  'stage899-post-stage898-personal-notes-board-audit-failure-lane.png',
  'stage899-post-stage898-personal-notes-board-audit-failure-promotion.png',
  'stage899-post-stage898-personal-notes-board-audit-failure-source.png',
  'stage899-post-stage898-personal-notes-board-audit-failure-sentence.png',
  'stage899-post-stage898-personal-notes-board-audit-failure-empty.png',
  'stage899-post-stage898-personal-notes-board-audit-failure-regression-home.png',
  'stage899-post-stage898-personal-notes-board-audit-failure-graph.png',
  'stage899-post-stage898-personal-notes-board-audit-failure-reader.png',
  'stage899-post-stage898-personal-notes-board-audit-failure-study.png',
  'stage899-post-stage898-personal-notes-board-audit-failure-focused.png',
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

  const boardEvidence = await captureHomePersonalNotesCollectionBoardEvidence({
    baseUrl,
    directory: outputDir,
    page: boardPage,
    stageLabel: 'Stage 899 Home personal-notes collection board audit',
    stagePrefix: 'stage899-board',
  })
  const laneEvidence = await captureHomePersonalNoteLaneEvidence({
    baseUrl,
    directory: outputDir,
    page: lanePage,
    stageLabel: 'Stage 899 Home personal-note lane/search audit',
    stagePrefix: 'stage899-lane',
  })
  const promotionEvidence = await captureSourceNotePromotionEvidence({
    baseUrl,
    directory: outputDir,
    page: promotionPage,
    stageLabel: 'Stage 899 source-note promotion audit',
    stagePrefix: 'stage899-promotion',
  })
  const sourceEvidence = await captureNotebookNewNoteDraftEvidence({
    baseUrl,
    directory: outputDir,
    page: sourcePage,
    stageLabel: 'Stage 899 source-anchor Notebook regression',
    stagePrefix: 'stage899-source',
    verifySourceReaderHandoff: true,
  })
  const sentenceEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: sentencePage,
    selectSentenceAnchor: true,
    stageLabel: 'Stage 899 sentence-anchor Notebook regression',
    stagePrefix: 'stage899-sentence',
  })
  const emptyEvidence = await captureNotebookEmptyStateEvidence({
    baseUrl,
    directory: outputDir,
    page: emptyPage,
    stageLabel: 'Stage 899 Notebook empty-state regression',
    stagePrefix: 'stage899-empty',
  })
  const regressionEvidence = await captureHomeOrganizerErgonomicsEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage: regressionHomePage,
    notebookPage: notebookRegressionPage,
    readerPage,
    stageLabel: 'Stage 899 cross-surface regression audit',
    stagePrefix: 'stage899-regression',
    studyPage,
  })
  const notesSidebarVisible = await regressionHomePage.evaluate(() =>
    Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.trim() === 'Notes' || tab.getAttribute('aria-label') === 'Notes',
    ),
  )

  const notebookStage889EmptyStatesStable =
    emptyEvidence.metrics.notebookEmptyWorkbenchOwned &&
    !emptyEvidence.metrics.notebookEmptyDetailIntroVisible &&
    emptyEvidence.metrics.notebookSearchEmptyWorkbenchOwned &&
    !emptyEvidence.metrics.notebookSearchEmptyDetailIntroVisible &&
    emptyEvidence.metrics.notebookCaptureInReaderNavigates

  if (!notebookStage889EmptyStatesStable) {
    throw new Error('Stage 899 expected the Stage 889 Notebook empty/search-empty states to remain stable.')
  }
  if (notesSidebarVisible) {
    throw new Error('Stage 899 expected the retired Notes sidebar tab to stay hidden.')
  }

  await writeFile(
    path.join(outputDir, 'stage899-post-stage898-home-personal-notes-collection-board-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Personal notes should be a selectable Home/Library collection without mixing notes into source boards.',
          'Board, lane, search, Notebook, Reader, Graph promotion, and Study promotion note semantics should stay source-owned.',
          'Broad Home/Add Content/Reader/Graph/Study/focused Notebook regressions should remain green.',
        ],
        baseUrl,
        captures: {
          ...boardEvidence.captures,
          ...laneEvidence.captures,
          ...promotionEvidence.captures,
          ...sourceEvidence.captures,
          ...sentenceEvidence.captures,
          ...emptyEvidence.captures,
          ...regressionEvidence.captures,
        },
        desktopViewport,
        focusedViewport,
        headless,
        metrics: {
          ...sentenceEvidence.metrics,
          ...emptyEvidence.metrics,
          ...regressionEvidence.metrics,
          ...sourceEvidence.metrics,
          ...laneEvidence.metrics,
          ...promotionEvidence.metrics,
          ...boardEvidence.metrics,
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
    captureFailure(boardPage, outputDir, 'stage899-post-stage898-personal-notes-board-audit-failure-board.png'),
    captureFailure(lanePage, outputDir, 'stage899-post-stage898-personal-notes-board-audit-failure-lane.png'),
    captureFailure(promotionPage, outputDir, 'stage899-post-stage898-personal-notes-board-audit-failure-promotion.png'),
    captureFailure(sourcePage, outputDir, 'stage899-post-stage898-personal-notes-board-audit-failure-source.png'),
    captureFailure(sentencePage, outputDir, 'stage899-post-stage898-personal-notes-board-audit-failure-sentence.png'),
    captureFailure(emptyPage, outputDir, 'stage899-post-stage898-personal-notes-board-audit-failure-empty.png'),
    captureFailure(regressionHomePage, outputDir, 'stage899-post-stage898-personal-notes-board-audit-failure-regression-home.png'),
    captureFailure(graphPage, outputDir, 'stage899-post-stage898-personal-notes-board-audit-failure-graph.png'),
    captureFailure(readerPage, outputDir, 'stage899-post-stage898-personal-notes-board-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage899-post-stage898-personal-notes-board-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage899-post-stage898-personal-notes-board-audit-failure-focused.png'),
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
