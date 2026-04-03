import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE775_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE775_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE775_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE775_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE775_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE775_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage775-reader-source-support-toggle-deduplication-audit-failure.png'), {
  force: true,
})
await rm(path.join(outputDir, 'stage775-reader-source-support-toggle-deduplication-regression-failure.png'), {
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
    stagePrefix: 'stage775',
  })

  const {
    defaultReaderSourceNavTriggerVisible,
    defaultReaderSourceTabsVisible,
    notebookOpenWorkbenchVisible,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryToggleVisible,
    sourceOpenReaderSourceLibraryVisible,
    sourceOpenReaderSupportHideButtonCount,
  } = evidence.metrics

  if (!defaultReaderSourceNavTriggerVisible || defaultReaderSourceTabsVisible) {
    throw new Error('Expected the default Reader source strip to remain compact during the Stage 775 audit.')
  }
  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 775 audit.')
  }
  if (sourceOpenReaderSourceLibraryToggleVisible) {
    throw new Error('Expected the embedded Source library toggle to retire inside Reader support during the Stage 775 audit.')
  }
  if (sourceOpenReaderSupportHideButtonCount !== 1) {
    throw new Error(`Expected Reader Source support to expose exactly one visible Hide control during the Stage 775 audit, found ${sourceOpenReaderSupportHideButtonCount}.`)
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 775 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the current live dataset during the Stage 775 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage775-post-stage774-reader-source-support-toggle-deduplication-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Expanded Reader Source support should keep only one visible Hide control for the support rail.',
          'The embedded Source library should stay open without rendering its own duplicate disclosure toggle.',
          'Source search, source reopening, Notebook reopening, and wider Recall regressions should stay stable in the same live browser pass.',
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
        path: path.join(outputDir, 'stage775-reader-source-support-toggle-deduplication-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage775-reader-source-support-toggle-deduplication-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
