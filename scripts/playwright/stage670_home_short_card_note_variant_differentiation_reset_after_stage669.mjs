import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureHomeShortCardNoteVariantDifferentiationEvidence,
  desktopViewport,
  launchBrowserContext,
} from './home_rendered_preview_quality_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE670_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE670_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE670_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE670_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE670_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE670_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage670-home-short-card-note-variant-differentiation-reset-after-stage669-failure.png',
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
  const homeEvidence = await captureHomeShortCardNoteVariantDifferentiationEvidence({
    baseUrl,
    directory: outputDir,
    page,
    stageLabel: 'Stage 670',
    stagePrefix: 'stage670',
  })

  await writeFile(
    path.join(
      outputDir,
      'stage670-home-short-card-note-variant-differentiation-reset-after-stage669-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: homeEvidence.captures,
        desktopViewport,
        headless,
        implementationFocus: [
          'Home keeps the settled Stage 563-669 structure while the Stage 670 pass only refines backend-generated content-rendered image composition.',
          'Sparse short captures should stay on the compact focus-note footprint, promoted short captures should move to the intermediate summary-note footprint, and structured TXT controls should remain on the denser sheet footprint.',
          'The widened summary-note treatment should make the promoted Stage13 card feel intentionally different from the sparse Stage11 note without reopening shell, rail, toolbar, or lower-card hierarchy work.',
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
          'stage670-home-short-card-note-variant-differentiation-reset-after-stage669-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
