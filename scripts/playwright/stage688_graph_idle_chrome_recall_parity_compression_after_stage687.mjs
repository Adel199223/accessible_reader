import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureViewportScreenshot,
  desktopViewport,
  launchBrowserContext,
  openHome,
  openOriginalReaderFromHome,
} from './home_rendered_preview_quality_shared.mjs'
import { captureGraphRecallStyleEvidence } from './graph_recall_style_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE688_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE688_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE688_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE688_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE688_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE688_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage688-graph-idle-chrome-recall-parity-compression-after-stage687-failure.png'),
  { force: true },
)
await rm(
  path.join(outputDir, 'stage688-graph-idle-chrome-recall-parity-compression-after-stage687-failure-reader.png'),
  { force: true },
)

const { browser, runtimeBrowser } = await launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
})

let page
let readerPage
try {
  page = await browser.newPage({ viewport: desktopViewport })
  const graphEvidence = await captureGraphRecallStyleEvidence({
    baseUrl,
    directory: outputDir,
    page,
    stageLabel: 'Stage 688',
    stagePrefix: 'stage688',
  })

  await openHome(page, baseUrl)
  const homeWideTop = await captureViewportScreenshot(page, outputDir, 'stage688-home-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage688', baseUrl)

  await writeFile(
    path.join(
      outputDir,
      'stage688-graph-idle-chrome-recall-parity-compression-after-stage687-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          ...graphEvidence.captures,
          homeWideTop,
          readerOriginalWideTop: readerEvidence.capture,
        },
        desktopViewport,
        headless,
        implementationFocus: [
          'Graph keeps the Stage 684 canvas and tour baseline, but the idle settings rail now compresses its helper copy, hides the preset draft field at rest, and collapses saved-view management by default.',
          'The top-right corner now keeps Search by title dominant while fit and lock switch to icon-first controls with accessible labels and without idle text readouts.',
          'The bottom-left count chip now clears the docked settings rail so the canvas utility corners read closer to Recall without reopening selection or path workflow scope.',
        ],
        metrics: {
          ...graphEvidence.metrics,
          readerSourceTitle: readerEvidence.sourceTitle,
        },
        runtimeBrowser,
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  if (page) {
    await page
      .screenshot({
        path: path.join(
          outputDir,
          'stage688-graph-idle-chrome-recall-parity-compression-after-stage687-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (readerPage && readerPage !== page) {
    await readerPage
      .screenshot({
        path: path.join(
          outputDir,
          'stage688-graph-idle-chrome-recall-parity-compression-after-stage687-failure-reader.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
