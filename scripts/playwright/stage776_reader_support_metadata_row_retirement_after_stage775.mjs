import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE776_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE776_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE776_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE776_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE776_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE776_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage776-reader-support-metadata-row-retirement-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage776-reader-support-metadata-row-retirement-regression-failure.png'), {
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
    stagePrefix: 'stage776',
  })

  await writeFile(
    path.join(outputDir, 'stage776-reader-support-metadata-row-retirement-after-stage775-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Expanded Reader support should no longer repeat source metadata in a second dock summary row.',
          'Source and Notebook support states should keep their local tabs and the single outer Hide affordance.',
          'The compact source strip should remain the only visible source-type and note-count metadata seam.',
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
        path: path.join(outputDir, 'stage776-reader-support-metadata-row-retirement-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage776-reader-support-metadata-row-retirement-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
