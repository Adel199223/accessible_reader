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
const outputDir = process.env.RECALL_STAGE684_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE684_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE684_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE684_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE684_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE684_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage684-graph-recall-style-settings-canvas-and-tour-reset-after-stage683-failure.png'),
  { force: true },
)
await rm(
  path.join(outputDir, 'stage684-graph-recall-style-settings-canvas-and-tour-reset-after-stage683-failure-reader.png'),
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
    stageLabel: 'Stage 684',
    stagePrefix: 'stage684',
  })

  await openHome(page, baseUrl)
  const homeWideTop = await captureViewportScreenshot(page, outputDir, 'stage684-home-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage684', baseUrl)

  await writeFile(
    path.join(
      outputDir,
      'stage684-graph-recall-style-settings-canvas-and-tour-reset-after-stage683-validation.json',
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
          'Graph now opens as a docked-settings, canvas-first browse surface instead of a floating dashboard seam.',
          'The default idle state keeps Search by title plus Fit to view and Lock graph in the top-right corner, a compact count pill in the bottom-left corner, and help or replay-tour controls in the bottom-right corner.',
          'The new Graph View tour, contextual focus tray, calmer detail dock, grouped filtering, and path exploration now define the Graph milestone while Home and original-only Reader stay regression-only.',
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
          'stage684-graph-recall-style-settings-canvas-and-tour-reset-after-stage683-failure.png',
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
          'stage684-graph-recall-style-settings-canvas-and-tour-reset-after-stage683-failure-reader.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
