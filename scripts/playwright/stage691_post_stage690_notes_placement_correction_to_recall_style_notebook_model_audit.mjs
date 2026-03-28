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
const outputDir = process.env.RECALL_STAGE691_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE691_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE691_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE691_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE691_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE691_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage691-post-stage690-notes-placement-correction-to-recall-style-notebook-model-audit-failure.png'),
  { force: true },
)
await rm(
  path.join(outputDir, 'stage691-post-stage690-notes-placement-correction-to-recall-style-notebook-model-audit-failure-reader.png'),
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
    stagePrefix: 'stage691',
  })

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage691', baseUrl)

  await writeFile(
    path.join(
      outputDir,
      'stage691-post-stage690-notes-placement-correction-to-recall-style-notebook-model-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'No visible Notes rail entry remains; Notebook is now reached from Home/Library, search, and source/Reader handoffs.',
          'The New note pen affordance sits beside Add in Home while the Notebook workspace keeps browse, detail, source handoff, and promotion together.',
          'The hidden /recall?section=notes alias rehydrates into Notebook and Graph plus original-only Reader remain stable regression captures.',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          ...notebookEvidence.captures,
          readerOriginalWideTop: readerEvidence.capture,
        },
        desktopViewport,
        headless,
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
          'stage691-post-stage690-notes-placement-correction-to-recall-style-notebook-model-audit-failure.png',
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
          'stage691-post-stage690-notes-placement-correction-to-recall-style-notebook-model-audit-failure-reader.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
