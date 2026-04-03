import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE748_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE748_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE748_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE748_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE748_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE748_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage748-reader-overflow-payload-deflation-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage748-reader-overflow-payload-deflation-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage748',
  })

  await writeFile(
    path.join(outputDir, 'stage748-reader-overflow-payload-deflation-after-stage747-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Default Reader should keep only actionable controls inside the overflow after Stage 747.',
          'The compact Reader source strip should stop spending a second line on the generic Local source fallback when it adds no new information.',
          'The overflow should preserve Settings, Source, Notebook, voice, and rate while dropping passive sentence and shortcut copy.',
          'The compact reading band, lean source strip, idle transport compaction, and regression surfaces should stay stable in the same live browser pass.',
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
        path: path.join(outputDir, 'stage748-reader-overflow-payload-deflation-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        path: path.join(outputDir, 'stage748-reader-overflow-payload-deflation-regression-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
