import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureHomeRenderedPreviewQualityEvidence,
  desktopViewport,
  launchBrowserContext,
} from './home_rendered_preview_quality_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE661_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE661_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE661_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE661_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE661_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE661_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage661-home-content-targeted-rendered-preview-framing-and-quality-gate-reset-after-stage660-failure.png',
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
  const homeEvidence = await captureHomeRenderedPreviewQualityEvidence({
    baseUrl,
    directory: outputDir,
    page,
    stageLabel: 'Stage 661',
    stagePrefix: 'stage661',
  })

  await writeFile(
    path.join(
      outputDir,
      'stage661-home-content-targeted-rendered-preview-framing-and-quality-gate-reset-after-stage660-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: homeEvidence.captures,
        desktopViewport,
        headless,
        implementationFocus: [
          'Home keeps the Stage 563 selected-collection rail plus day-grouped canvas structure.',
          'The Stage 661 pass improves html-rendered-snapshot framing so saved HTML cards choose content-rich regions instead of the first large root box.',
          'Low-signal rendered snapshots now fall back to the Stage 655 synthetic poster path instead of being cached as weak real previews.',
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
          'stage661-home-content-targeted-rendered-preview-framing-and-quality-gate-reset-after-stage660-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
