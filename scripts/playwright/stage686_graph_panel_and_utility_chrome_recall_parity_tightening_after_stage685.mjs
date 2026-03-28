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
const outputDir = process.env.RECALL_STAGE686_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE686_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE686_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE686_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE686_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE686_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage686-graph-panel-and-utility-chrome-recall-parity-tightening-after-stage685-failure.png'),
  { force: true },
)
await rm(
  path.join(outputDir, 'stage686-graph-panel-and-utility-chrome-recall-parity-tightening-after-stage685-failure-reader.png'),
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
    stageLabel: 'Stage 686',
    stagePrefix: 'stage686',
  })

  await openHome(page, baseUrl)
  const homeWideTop = await captureViewportScreenshot(page, outputDir, 'stage686-home-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage686', baseUrl)

  await writeFile(
    path.join(
      outputDir,
      'stage686-graph-panel-and-utility-chrome-recall-parity-tightening-after-stage685-validation.json',
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
          'Graph keeps the Stage 684 canvas and tour baseline, but the settings rail is flatter and the default chrome is less card-heavy.',
          'The top-right corner now leads with Search by title plus compact Fit to view and Lock graph controls, while search stepping only appears for multi-match states.',
          'The count chip, replay-tour/help controls, focus tray, and detail dock all stay calmer so the browse state reads closer to Recall without reopening Graph layout scope.',
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
          'stage686-graph-panel-and-utility-chrome-recall-parity-tightening-after-stage685-failure.png',
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
          'stage686-graph-panel-and-utility-chrome-recall-parity-tightening-after-stage685-failure-reader.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
