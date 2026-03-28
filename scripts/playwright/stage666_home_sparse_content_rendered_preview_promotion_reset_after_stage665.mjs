import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureHomeSparseContentRenderedPreviewPromotionEvidence,
  desktopViewport,
  launchBrowserContext,
} from './home_rendered_preview_quality_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE666_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE666_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE666_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE666_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE666_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE666_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage666-home-sparse-content-rendered-preview-promotion-reset-after-stage665-failure.png',
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
try {
  page = await browser.newPage({ viewport: desktopViewport })
  const homeEvidence = await captureHomeSparseContentRenderedPreviewPromotionEvidence({
    baseUrl,
    directory: outputDir,
    page,
    stageLabel: 'Stage 666',
    stagePrefix: 'stage666',
  })

  await writeFile(
    path.join(
      outputDir,
      'stage666-home-sparse-content-rendered-preview-promotion-reset-after-stage665-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: homeEvidence.captures,
        desktopViewport,
        headless,
        implementationFocus: [
          'Home keeps the Stage 563 selected-collection rail plus the settled Stage 615-665 day-grouped canvas structure.',
          'The Stage 666 pass promotes the remaining sparse stored-view paste fallback card through the cached content-rendered image path.',
          'The final fallback path remains reserved for truly tiny notes and sources without enough stored text to form a meaningful preview line.',
        ],
        metrics: homeEvidence.metrics,
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
          'stage666-home-sparse-content-rendered-preview-promotion-reset-after-stage665-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
