import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureHomeStructuredSheetPreviewDifferentiationEvidence,
  desktopViewport,
  launchBrowserContext,
} from './home_rendered_preview_quality_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE674_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE674_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE674_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE674_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE674_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE674_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage674-home-structured-sheet-preview-differentiation-reset-after-stage673-failure.png',
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
  const homeEvidence = await captureHomeStructuredSheetPreviewDifferentiationEvidence({
    baseUrl,
    directory: outputDir,
    page,
    stageLabel: 'Stage 674',
    stagePrefix: 'stage674',
  })

  await writeFile(
    path.join(
      outputDir,
      'stage674-home-structured-sheet-preview-differentiation-reset-after-stage673-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: homeEvidence.captures,
        desktopViewport,
        headless,
        implementationFocus: [
          'Home keeps the settled Stage 563-673 structure while the Stage 674 pass only refines backend-generated structured sheet image art.',
          'Structured web/article content should now read through a lighter article-style sheet treatment while TXT and longer paste cards remain denser outline/document sheet controls.',
          'The existing focus-note and summary-note anchors remain unchanged regression surfaces while the structured sheet split stays inside the same content-rendered preview lane.',
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
          'stage674-home-structured-sheet-preview-differentiation-reset-after-stage673-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
