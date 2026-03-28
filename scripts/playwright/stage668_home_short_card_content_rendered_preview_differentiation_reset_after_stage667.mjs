import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureHomeShortCardContentRenderedPreviewDifferentiationEvidence,
  desktopViewport,
  launchBrowserContext,
} from './home_rendered_preview_quality_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE668_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE668_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE668_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE668_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE668_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE668_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage668-home-short-card-content-rendered-preview-differentiation-reset-after-stage667-failure.png',
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
  const homeEvidence = await captureHomeShortCardContentRenderedPreviewDifferentiationEvidence({
    baseUrl,
    directory: outputDir,
    page,
    stageLabel: 'Stage 668',
    stagePrefix: 'stage668',
  })

  await writeFile(
    path.join(
      outputDir,
      'stage668-home-short-card-content-rendered-preview-differentiation-reset-after-stage667-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: homeEvidence.captures,
        desktopViewport,
        headless,
        implementationFocus: [
          'Home keeps the Stage 563 selected-collection rail plus the settled Stage 615-667 day-grouped canvas structure.',
          'The Stage 668 pass only changes the backend content-rendered image renderer, splitting short sparse previews onto a note-like variant while richer web and document previews keep the denser sheet treatment.',
          'The sparse Stage11 capture should now read like a deliberate note preview instead of a shrunken mini-document sheet, without reopening shell, rail, toolbar, or lower-card hierarchy trims.',
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
          'stage668-home-short-card-content-rendered-preview-differentiation-reset-after-stage667-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
