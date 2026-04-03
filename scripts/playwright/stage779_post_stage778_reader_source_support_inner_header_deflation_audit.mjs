import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE779_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE779_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE779_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE779_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE779_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE779_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage779-reader-source-support-inner-header-deflation-audit-failure.png'), {
  force: true,
})
await rm(path.join(outputDir, 'stage779-reader-source-support-inner-header-deflation-regression-failure.png'), {
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
    stagePrefix: 'stage779',
  })

  const {
    notebookOpenWorkbenchVisible,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryHeadingVisible,
    sourceOpenReaderSourceLibrarySearchLabelVisible,
    sourceOpenReaderSourceLibraryStatusVisible,
    sourceOpenReaderSourceLibraryVisible,
    sourceOpenReaderSupportHideButtonCount,
    sourceOpenReaderSupportTabLabelsVisible,
  } = evidence.metrics

  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 779 audit.')
  }
  if (sourceOpenReaderSourceLibraryHeadingVisible) {
    throw new Error('Expected Source support to retire the inner Source library heading during the Stage 779 audit.')
  }
  if (sourceOpenReaderSourceLibraryStatusVisible) {
    throw new Error('Expected Source support to retire the inner saved-count status line during the Stage 779 audit.')
  }
  if (sourceOpenReaderSourceLibrarySearchLabelVisible) {
    throw new Error('Expected Source support to retire the redundant visible search label during the Stage 779 audit.')
  }
  if (!sourceOpenReaderSupportTabLabelsVisible) {
    throw new Error('Expected Source support tabs to remain visible during the Stage 779 audit.')
  }
  if (sourceOpenReaderSupportHideButtonCount !== 1) {
    throw new Error(
      `Expected Reader support to keep exactly one visible Hide control during the Stage 779 audit, found ${sourceOpenReaderSupportHideButtonCount}.`,
    )
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 779 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the current live dataset during the Stage 779 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage779-post-stage778-reader-source-support-inner-header-deflation-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Expanded Reader Source support should no longer repeat an inner Source library title stack above search.',
          'The search field should stay accessible without a redundant visible Search label.',
          'Source reopening, Notebook reopening, and wider Recall regressions should stay stable in the same live browser pass.',
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
        path: path.join(outputDir, 'stage779-reader-source-support-inner-header-deflation-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage779-reader-source-support-inner-header-deflation-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
