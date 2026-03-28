import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureHomeStructuredSheetPreviewDifferentiationEvidence,
  captureViewportScreenshot,
  desktopViewport,
  launchBrowserContext,
  openGraph,
  openOriginalReaderFromHome,
} from './home_rendered_preview_quality_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE675_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE675_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE675_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE675_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE675_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE675_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage675-post-stage674-home-structured-sheet-preview-differentiation-audit-failure.png',
  ),
  { force: true },
)
await rm(
  path.join(
    outputDir,
    'stage675-post-stage674-home-structured-sheet-preview-differentiation-audit-failure-reader.png',
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
  const homeEvidence = await captureHomeStructuredSheetPreviewDifferentiationEvidence({
    baseUrl,
    directory: outputDir,
    page,
    stageLabel: 'Stage 675',
    stagePrefix: 'stage675',
  })

  await openGraph(page, baseUrl)
  const graphWideTop = await captureViewportScreenshot(page, outputDir, 'stage675-graph-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage675', baseUrl)

  await writeFile(
    path.join(
      outputDir,
      'stage675-post-stage674-home-structured-sheet-preview-differentiation-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 674 structured sheet differentiation pass',
          'the weak Stage 10 Web card should now carry a lighter article-sheet signature while the TXT and longer paste cards keep the denser outline/document sheet lane',
          'the existing note tiers plus Graph and original-only Reader remain stable while the settled Home width, start-offset, toolbar, and day-group-count regression gates stay locked',
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
          'stage675-post-stage674-home-structured-sheet-preview-differentiation-audit-failure.png',
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
          'stage675-post-stage674-home-structured-sheet-preview-differentiation-audit-failure-reader.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
