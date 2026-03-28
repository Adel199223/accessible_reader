import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureHomeChecklistOutlinePreviewRebalanceEvidence,
  desktopViewport,
  launchBrowserContext,
} from './home_rendered_preview_quality_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE678_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE678_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE678_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE678_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE678_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE678_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage678-home-checklist-outline-preview-rebalance-reset-after-stage677-failure.png',
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
  const homeEvidence = await captureHomeChecklistOutlinePreviewRebalanceEvidence({
    baseUrl,
    directory: outputDir,
    page,
    stageLabel: 'Stage 678',
    stagePrefix: 'stage678',
  })

  await writeFile(
    path.join(
      outputDir,
      'stage678-home-checklist-outline-preview-rebalance-reset-after-stage677-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: homeEvidence.captures,
        desktopViewport,
        headless,
        implementationFocus: [
          'Home keeps the settled Stage 563-677 structure while the Stage 678 pass only rebalances the backend-generated checklist-outline image art.',
          'Structured Web previews keep the Stage 674 article-sheet lane and TXT/file previews keep the Stage 676 document-outline lane as controls.',
          'Checklist-heavy structured paste cards now use a slimmer left rail, an earlier first task row, and a wider body column while staying distinct from the TXT document-outline control.',
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
          'stage678-home-checklist-outline-preview-rebalance-reset-after-stage677-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
