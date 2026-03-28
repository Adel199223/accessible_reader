import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureHomeSparseContentRenderedPreviewPromotionEvidence,
  captureViewportScreenshot,
  desktopViewport,
  launchBrowserContext,
  openGraph,
  openOriginalReaderFromHome,
} from './home_rendered_preview_quality_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE667_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE667_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE667_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE667_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE667_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE667_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage667-post-stage666-home-sparse-content-rendered-preview-promotion-audit-failure.png',
  ),
  { force: true },
)
await rm(
  path.join(
    outputDir,
    'stage667-post-stage666-home-sparse-content-rendered-preview-promotion-audit-failure-reader.png',
  ),
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
  const homeEvidence = await captureHomeSparseContentRenderedPreviewPromotionEvidence({
    baseUrl,
    directory: outputDir,
    page,
    stageLabel: 'Stage 667',
    stagePrefix: 'stage667',
  })

  await openGraph(page, baseUrl)
  const graphWideTop = await captureViewportScreenshot(page, outputDir, 'stage667-graph-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage667', baseUrl)

  await writeFile(
    path.join(
      outputDir,
      'stage667-post-stage666-home-sparse-content-rendered-preview-promotion-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 666 sparse-content preview promotion pass',
          'the representative sparse stored-view paste card should now promote to a cached image preview without disturbing the Stage 664 promoted paste, weak Web, and TXT lanes',
          'Graph and original-only Reader remain regression surfaces only after the Home-only Stage 666 implementation',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          ...homeEvidence.captures,
          graphWideTop,
          readerOriginalWideTop: readerEvidence.capture,
        },
        desktopViewport,
        headless,
        homeMetrics: homeEvidence.metrics,
        readerSourceTitle: readerEvidence.sourceTitle,
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
          'stage667-post-stage666-home-sparse-content-rendered-preview-promotion-audit-failure.png',
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
          'stage667-post-stage666-home-sparse-content-rendered-preview-promotion-audit-failure-reader.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
