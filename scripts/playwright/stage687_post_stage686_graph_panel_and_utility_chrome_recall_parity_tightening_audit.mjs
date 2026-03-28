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
const outputDir = process.env.RECALL_STAGE687_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE687_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE687_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE687_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE687_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE687_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage687-post-stage686-graph-panel-and-utility-chrome-recall-parity-tightening-audit-failure.png'),
  { force: true },
)
await rm(
  path.join(outputDir, 'stage687-post-stage686-graph-panel-and-utility-chrome-recall-parity-tightening-audit-failure-reader.png'),
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
    stageLabel: 'Stage 687',
    stagePrefix: 'stage687',
  })

  await openHome(page, baseUrl)
  const homeWideTop = await captureViewportScreenshot(page, outputDir, 'stage687-home-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage687', baseUrl)

  await writeFile(
    path.join(
      outputDir,
      'stage687-post-stage686-graph-panel-and-utility-chrome-recall-parity-tightening-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'Graph keeps the Stage 684 canvas/tour baseline, but the left settings panel now reads flatter and the visible section order stays focused on Presets, Filters, and Groups.',
          'The top-right utility corner is slimmer, the persistent chip seam is gone, and search stepping appears only when multi-match Graph search is active.',
          'Bottom utility chips and contextual selected/path overlays stay calmer while Home and original-only Reader remain stable regression baselines.',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          ...graphEvidence.captures,
          homeWideTop,
          readerOriginalWideTop: readerEvidence.capture,
        },
        desktopViewport,
        headless,
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
          'stage687-post-stage686-graph-panel-and-utility-chrome-recall-parity-tightening-audit-failure.png',
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
          'stage687-post-stage686-graph-panel-and-utility-chrome-recall-parity-tightening-audit-failure-reader.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
