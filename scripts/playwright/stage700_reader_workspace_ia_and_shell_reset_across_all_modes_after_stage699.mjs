import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderRegressionEvidence, captureReaderWorkspaceResetEvidence, desktopViewport } from './reader_workspace_reset_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE700_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE700_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE700_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE700_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE700_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE700_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage700-reader-workspace-ia-and-shell-reset-across-all-modes-after-stage699-failure.png'),
  { force: true },
)
await rm(
  path.join(outputDir, 'stage700-reader-workspace-ia-and-shell-reset-across-all-modes-after-stage699-failure-regression.png'),
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
  const readerEvidence = await captureReaderWorkspaceResetEvidence({
    baseUrl,
    directory: outputDir,
    page: readerPage,
    stagePrefix: 'stage700',
  })

  regressionPage = await browser.newPage({ viewport: desktopViewport })
  const regressionEvidence = await captureReaderRegressionEvidence({
    baseUrl,
    directory: outputDir,
    page: regressionPage,
    stagePrefix: 'stage700',
  })

  await writeFile(
    path.join(outputDir, 'stage700-reader-workspace-ia-and-shell-reset-across-all-modes-after-stage699-validation.json'),
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
          'Reader should read quieter in the shell while global Search and New remain intact.',
          'The focused source strip should clear faster into the reading deck without losing tab continuity.',
          'Original and Reflowed routes should keep the article primary while the dock becomes a broader contextual workbench.',
          'Notebook capture, selected-note editing, and promotion actions should still work in place without changing generated document outputs.',
          'Home and Graph remain regression surfaces only during this Reader pass.',
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
        path: path.join(outputDir, 'stage700-reader-workspace-ia-and-shell-reset-across-all-modes-after-stage699-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        path: path.join(outputDir, 'stage700-reader-workspace-ia-and-shell-reset-across-all-modes-after-stage699-failure-regression.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
