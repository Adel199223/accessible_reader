import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  desktopViewport,
  launchBrowserContext,
  openOriginalReaderFromHome,
} from './home_rendered_preview_quality_shared.mjs'
import { captureNotebookPlacementEvidence } from './notebook_placement_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE690_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE690_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE690_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE690_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE690_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE690_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage690-notes-placement-correction-to-recall-style-notebook-model-after-stage689-failure.png'),
  { force: true },
)
await rm(
  path.join(outputDir, 'stage690-notes-placement-correction-to-recall-style-notebook-model-after-stage689-failure-reader.png'),
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
  const notebookEvidence = await captureNotebookPlacementEvidence({
    baseUrl,
    directory: outputDir,
    page,
    stagePrefix: 'stage690',
  })

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage690', baseUrl)

  await writeFile(
    path.join(
      outputDir,
      'stage690-notes-placement-correction-to-recall-style-notebook-model-after-stage689-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          ...notebookEvidence.captures,
          readerOriginalWideTop: readerEvidence.capture,
        },
        desktopViewport,
        headless,
        implementationFocus: [
          'Notebook placement is now embedded inside Home/Library instead of surfacing Notes as a primary sidebar section.',
          'The Home toolbar now exposes a pen-style New note affordance beside Add while search, Reader, and source handoffs all land inside the Notebook workspace.',
          'The hidden /recall?section=notes compatibility alias now resolves back into the embedded Notebook model while Graph and original-only Reader remain stable regression surfaces.',
        ],
        metrics: {
          ...notebookEvidence.metrics,
          originalReaderSourceTitle: readerEvidence.sourceTitle,
        },
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
          'stage690-notes-placement-correction-to-recall-style-notebook-model-after-stage689-failure.png',
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
          'stage690-notes-placement-correction-to-recall-style-notebook-model-after-stage689-failure-reader.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
