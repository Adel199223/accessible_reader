import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureHomeShortCardContentRenderedPreviewDifferentiationEvidence,
  captureViewportScreenshot,
  desktopViewport,
  launchBrowserContext,
  openGraph,
  openOriginalReaderFromHome,
} from './home_rendered_preview_quality_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE669_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE669_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE669_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE669_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE669_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE669_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage669-post-stage668-home-short-card-content-rendered-preview-differentiation-audit-failure.png',
  ),
  { force: true },
)
await rm(
  path.join(
    outputDir,
    'stage669-post-stage668-home-short-card-content-rendered-preview-differentiation-audit-failure-reader.png',
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
  const homeEvidence = await captureHomeShortCardContentRenderedPreviewDifferentiationEvidence({
    baseUrl,
    directory: outputDir,
    page,
    stageLabel: 'Stage 669',
    stagePrefix: 'stage669',
  })

  await openGraph(page, baseUrl)
  const graphWideTop = await captureViewportScreenshot(page, outputDir, 'stage669-graph-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage669', baseUrl)

  await writeFile(
    path.join(
      outputDir,
      'stage669-post-stage668-home-short-card-content-rendered-preview-differentiation-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 668 short-card content-rendered preview differentiation pass',
          'the sparse Stage11 capture should now keep image/content-rendered-preview while reading like a deliberate note preview instead of reusing the old shrunken sheet footprint',
          'structured TXT and richer Web lanes remain regression controls for the denser sheet treatment, while Graph and original-only Reader stay stable',
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
          'stage669-post-stage668-home-short-card-content-rendered-preview-differentiation-audit-failure.png',
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
          'stage669-post-stage668-home-short-card-content-rendered-preview-differentiation-audit-failure-reader.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
