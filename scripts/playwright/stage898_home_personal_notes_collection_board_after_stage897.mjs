import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureHomePersonalNoteLaneEvidence,
  captureHomePersonalNotesCollectionBoardEvidence,
  captureNotebookWorkbenchEvidence,
  captureSourceNotePromotionEvidence,
  desktopViewport,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE898_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE898_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE898_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE898_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE898_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE898_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage898-home-personal-notes-board-failure-board.png',
  'stage898-home-personal-notes-board-failure-lane.png',
  'stage898-home-personal-notes-board-failure-promotion.png',
  'stage898-home-personal-notes-board-failure-sentence.png',
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
let sentencePage
try {
  boardPage = await browser.newPage({ viewport: desktopViewport })
  lanePage = await browser.newPage({ viewport: desktopViewport })
  promotionPage = await browser.newPage({ viewport: desktopViewport })
  sentencePage = await browser.newPage({ viewport: desktopViewport })

  const boardEvidence = await captureHomePersonalNotesCollectionBoardEvidence({
    baseUrl,
    directory: outputDir,
    page: boardPage,
    stageLabel: 'Stage 898 Home personal-notes collection board',
    stagePrefix: 'stage898',
  })
  const laneEvidence = await captureHomePersonalNoteLaneEvidence({
    baseUrl,
    directory: outputDir,
    page: lanePage,
    stageLabel: 'Stage 898 Home personal-note lane/search regression',
    stagePrefix: 'stage898-lane',
  })
  const promotionEvidence = await captureSourceNotePromotionEvidence({
    baseUrl,
    directory: outputDir,
    page: promotionPage,
    stageLabel: 'Stage 898 source-note promotion regression',
    stagePrefix: 'stage898-promotion',
  })
  const sentenceEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: sentencePage,
    selectSentenceAnchor: true,
    stageLabel: 'Stage 898 sentence-anchor Notebook regression',
    stagePrefix: 'stage898-sentence',
  })

  await writeFile(
    path.join(outputDir, 'stage898-home-personal-notes-collection-board-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Home should expose source-attached personal notes as a selectable Library collection.',
          'The Personal notes board should be note-owned, use body previews, and reopen embedded Notebook.',
          'Reader handoff from source notes should stay unanchored while sentence and promotion regressions stay stable.',
        ],
        baseUrl,
        captures: {
          ...boardEvidence.captures,
          ...laneEvidence.captures,
          ...promotionEvidence.captures,
          ...sentenceEvidence.captures,
        },
        desktopViewport,
        headless,
        metrics: {
          ...sentenceEvidence.metrics,
          ...laneEvidence.metrics,
          ...promotionEvidence.metrics,
          ...boardEvidence.metrics,
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
    captureFailure(boardPage, outputDir, 'stage898-home-personal-notes-board-failure-board.png'),
    captureFailure(lanePage, outputDir, 'stage898-home-personal-notes-board-failure-lane.png'),
    captureFailure(promotionPage, outputDir, 'stage898-home-personal-notes-board-failure-promotion.png'),
    captureFailure(sentencePage, outputDir, 'stage898-home-personal-notes-board-failure-sentence.png'),
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
