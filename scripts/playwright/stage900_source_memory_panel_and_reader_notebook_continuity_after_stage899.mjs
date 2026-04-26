import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureHomePersonalNotesCollectionBoardEvidence,
  captureNotebookWorkbenchEvidence,
  captureSourceNotePromotionEvidence,
  captureSourceOverviewMemoryEvidence,
  desktopViewport,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE900_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE900_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE900_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE900_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE900_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE900_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage900-source-memory-failure-source-overview.png',
  'stage900-source-memory-failure-board.png',
  'stage900-source-memory-failure-promotion.png',
  'stage900-source-memory-failure-sentence.png',
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
let promotionPage
let sentencePage
try {
  sourceOverviewPage = await browser.newPage({ viewport: desktopViewport })
  boardPage = await browser.newPage({ viewport: desktopViewport })
  promotionPage = await browser.newPage({ viewport: desktopViewport })
  sentencePage = await browser.newPage({ viewport: desktopViewport })

  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceOverviewPage,
    stageLabel: 'Stage 900 source memory panel and Reader/Notebook continuity',
    stagePrefix: 'stage900',
  })
  const boardEvidence = await captureHomePersonalNotesCollectionBoardEvidence({
    baseUrl,
    directory: outputDir,
    page: boardPage,
    stageLabel: 'Stage 900 Home personal-notes board regression',
    stagePrefix: 'stage900-board',
  })
  const promotionEvidence = await captureSourceNotePromotionEvidence({
    baseUrl,
    directory: outputDir,
    page: promotionPage,
    stageLabel: 'Stage 900 source-note promotion regression',
    stagePrefix: 'stage900-promotion',
  })
  const sentenceEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: sentencePage,
    selectSentenceAnchor: true,
    stageLabel: 'Stage 900 sentence-anchor Notebook regression',
    stagePrefix: 'stage900-sentence',
  })

  await writeFile(
    path.join(outputDir, 'stage900-source-memory-panel-and-reader-notebook-continuity-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Source overview should expose source-attached personal notes as source memory.',
          'Source overview New note should reuse the source-attached Notebook draft flow.',
          'Reader-led source Notebook continuity should open embedded Notebook while existing Home and promotion regressions stay stable.',
        ],
        baseUrl,
        captures: {
          ...sourceOverviewEvidence.captures,
          ...boardEvidence.captures,
          ...promotionEvidence.captures,
          ...sentenceEvidence.captures,
        },
        desktopViewport,
        headless,
        metrics: {
          ...sentenceEvidence.metrics,
          ...promotionEvidence.metrics,
          ...boardEvidence.metrics,
          ...sourceOverviewEvidence.metrics,
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
    captureFailure(sourceOverviewPage, outputDir, 'stage900-source-memory-failure-source-overview.png'),
    captureFailure(boardPage, outputDir, 'stage900-source-memory-failure-board.png'),
    captureFailure(promotionPage, outputDir, 'stage900-source-memory-failure-promotion.png'),
    captureFailure(sentencePage, outputDir, 'stage900-source-memory-failure-sentence.png'),
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
