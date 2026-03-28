import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureHomeContentRenderedPreviewPromotionEvidence,
  desktopViewport,
  launchBrowserContext,
} from './home_rendered_preview_quality_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE664_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE664_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE664_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE664_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE664_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE664_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage664-home-content-rendered-preview-promotion-reset-after-stage663-failure.png',
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
  const homeEvidence = await captureHomeContentRenderedPreviewPromotionEvidence({
    baseUrl,
    directory: outputDir,
    page,
    stageLabel: 'Stage 664',
    stagePrefix: 'stage664',
  })

  await writeFile(
    path.join(
      outputDir,
      'stage664-home-content-rendered-preview-promotion-reset-after-stage663-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: homeEvidence.captures,
        desktopViewport,
        headless,
        implementationFocus: [
          'Home keeps the Stage 563 selected-collection rail plus the settled Stage 615-663 day-grouped canvas structure.',
          'The Stage 664 pass promotes remaining paste-heavy, weak Web, and TXT fallback cards to cached image previews when stored content supports them.',
          'The Stage 655 poster path remains the final safety net when stored content is too sparse for content-rendered preview generation.',
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
          'stage664-home-content-rendered-preview-promotion-reset-after-stage663-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
