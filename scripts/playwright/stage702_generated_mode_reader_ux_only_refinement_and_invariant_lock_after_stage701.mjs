import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureReaderGeneratedModeRefinementEvidence,
  captureReaderRegressionEvidence,
  desktopViewport,
} from './reader_generated_mode_refinement_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE702_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE702_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE702_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE702_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE702_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE702_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage702-generated-mode-reader-ux-only-refinement-and-invariant-lock-after-stage701-failure.png'),
  { force: true },
)
await rm(
  path.join(outputDir, 'stage702-generated-mode-reader-ux-only-refinement-and-invariant-lock-after-stage701-failure-regression.png'),
  { force: true },
)

const { browser, runtimeBrowser } = await launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
})

let readerPage
let regressionPage
try {
  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await captureReaderGeneratedModeRefinementEvidence({
    baseUrl,
    directory: outputDir,
    page: readerPage,
    stagePrefix: 'stage702',
  })

  regressionPage = await browser.newPage({ viewport: desktopViewport })
  const regressionEvidence = await captureReaderRegressionEvidence({
    baseUrl,
    directory: outputDir,
    page: regressionPage,
    stagePrefix: 'stage702',
  })

  await writeFile(
    path.join(outputDir, 'stage702-generated-mode-reader-ux-only-refinement-and-invariant-lock-after-stage701-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          ...readerEvidence.captures,
          ...regressionEvidence.captures,
        },
        desktopViewport,
        headless,
        metrics: readerEvidence.metrics,
        runtimeBrowser,
        validationFocus: [
          'Generated Reader modes should read as derived from the current source without changing article text.',
          'Summary detail should move into the generated summary flow instead of staying inside Settings.',
          'Notebook, Graph, Study, and Reflowed branching should stay visible from generated modes.',
          'Home and Graph remain regression-only during this Reader-generated-mode pass.',
        ],
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  if (readerPage) {
    await readerPage
      .screenshot({
        path: path.join(outputDir, 'stage702-generated-mode-reader-ux-only-refinement-and-invariant-lock-after-stage701-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        path: path.join(outputDir, 'stage702-generated-mode-reader-ux-only-refinement-and-invariant-lock-after-stage701-failure-regression.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
