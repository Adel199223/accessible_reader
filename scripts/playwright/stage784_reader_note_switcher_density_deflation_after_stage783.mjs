import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE784_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE784_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE784_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE784_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE784_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE784_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage784-reader-note-switcher-density-deflation-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage784-reader-note-switcher-density-deflation-regression-failure.png'), {
  force: true,
})

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
  regressionPage = await browser.newPage({ viewport: desktopViewport })

  const evidence = await captureReaderReadingFirstEvidence({
    baseUrl,
    directory: outputDir,
    page: readerPage,
    regressionPage,
    stagePrefix: 'stage784',
  })

  await writeFile(
    path.join(outputDir, 'stage784-reader-note-switcher-density-deflation-after-stage783-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Reader Notebook saved-note switcher should read like a compact navigator instead of a stacked note preview surface.',
          'Saved-note buttons should collapse to the anchor plus at most one supporting line while the fuller anchor preview remains in the selected-note workbench.',
          'Notebook reopening, Source reopening, and wider Recall regressions should stay stable during the same live browser pass.',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        headless,
        metrics: evidence.metrics,
        runtimeBrowser,
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
        fullPage: true,
        path: path.join(outputDir, 'stage784-reader-note-switcher-density-deflation-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage784-reader-note-switcher-density-deflation-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
