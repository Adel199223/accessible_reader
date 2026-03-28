import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureHomeOutlineSheetPreviewDifferentiationEvidence,
  desktopViewport,
  launchBrowserContext,
} from './home_rendered_preview_quality_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE676_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE676_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE676_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE676_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE676_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE676_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage676-home-outline-sheet-preview-differentiation-reset-after-stage675-failure.png',
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
  const homeEvidence = await captureHomeOutlineSheetPreviewDifferentiationEvidence({
    baseUrl,
    directory: outputDir,
    page,
    stageLabel: 'Stage 676',
    stagePrefix: 'stage676',
  })

  await writeFile(
    path.join(
      outputDir,
      'stage676-home-outline-sheet-preview-differentiation-reset-after-stage675-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: homeEvidence.captures,
        desktopViewport,
        headless,
        implementationFocus: [
          'Home keeps the settled Stage 563-675 structure while the Stage 676 pass only refines backend-generated outline-sheet image art.',
          'Structured Web previews stay on the Stage 674 article-sheet lane while TXT/file content keeps a more continuous document-outline treatment.',
          'Checklist-heavy structured paste cards now use a darker segmented outline treatment instead of sharing the same internal composition as TXT.',
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
          'stage676-home-outline-sheet-preview-differentiation-reset-after-stage675-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
