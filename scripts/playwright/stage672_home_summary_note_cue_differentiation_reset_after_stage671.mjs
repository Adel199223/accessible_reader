import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureHomeSummaryNoteCueDifferentiationEvidence,
  desktopViewport,
  launchBrowserContext,
} from './home_rendered_preview_quality_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE672_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE672_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE672_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE672_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE672_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE672_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage672-home-summary-note-cue-differentiation-reset-after-stage671-failure.png',
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
  const homeEvidence = await captureHomeSummaryNoteCueDifferentiationEvidence({
    baseUrl,
    directory: outputDir,
    page,
    stageLabel: 'Stage 672',
    stagePrefix: 'stage672',
  })

  await writeFile(
    path.join(
      outputDir,
      'stage672-home-summary-note-cue-differentiation-reset-after-stage671-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: homeEvidence.captures,
        desktopViewport,
        headless,
        implementationFocus: [
          'Home keeps the settled Stage 563-671 structure while the Stage 672 pass only refines backend-generated summary-note image art.',
          'Short summary-note cards should keep the same tier footprint, but now expose content-led cue accents so promoted short-note cards scan less like cloned mini sheets.',
          'Sparse focus-note and structured sheet controls remain unchanged regression anchors while the cue-led differentiation stays inside the summary-note lane only.',
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
          'stage672-home-summary-note-cue-differentiation-reset-after-stage671-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
