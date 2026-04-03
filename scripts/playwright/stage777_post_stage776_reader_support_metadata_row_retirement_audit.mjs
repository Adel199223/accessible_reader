import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE777_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE777_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE777_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE777_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE777_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE777_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage777-reader-support-metadata-row-retirement-audit-failure.png'), {
  force: true,
})
await rm(path.join(outputDir, 'stage777-reader-support-metadata-row-retirement-regression-failure.png'), {
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
    stagePrefix: 'stage777',
  })

  const {
    notebookOpenReaderSupportMetaChipCount,
    notebookOpenReaderSupportTabLabelsVisible,
    notebookOpenWorkbenchVisible,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
    sourceOpenReaderSupportHideButtonCount,
    sourceOpenReaderSupportMetaChipCount,
    sourceOpenReaderSupportTabLabelsVisible,
  } = evidence.metrics

  if (sourceOpenReaderSupportMetaChipCount !== 0) {
    throw new Error(
      `Expected Source support to retire the duplicate dock metadata row during the Stage 777 audit, found ${sourceOpenReaderSupportMetaChipCount} visible meta chips.`,
    )
  }
  if (notebookOpenReaderSupportMetaChipCount !== 0) {
    throw new Error(
      `Expected Notebook support to retire the duplicate dock metadata row during the Stage 777 audit, found ${notebookOpenReaderSupportMetaChipCount} visible meta chips.`,
    )
  }
  if (!sourceOpenReaderSupportTabLabelsVisible || !notebookOpenReaderSupportTabLabelsVisible) {
    throw new Error('Expected Reader support tabs to remain visible in both Source and Notebook states during the Stage 777 audit.')
  }
  if (sourceOpenReaderSupportHideButtonCount !== 1) {
    throw new Error(
      `Expected Reader support to keep exactly one visible Hide control during the Stage 777 audit, found ${sourceOpenReaderSupportHideButtonCount}.`,
    )
  }
  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 777 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 777 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the current live dataset during the Stage 777 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage777-post-stage776-reader-support-metadata-row-retirement-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Expanded Reader support should not repeat source metadata in a second dock summary row.',
          'Source and Notebook support should keep their local tabs plus exactly one outer Hide affordance.',
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
        path: path.join(outputDir, 'stage777-reader-support-metadata-row-retirement-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage777-reader-support-metadata-row-retirement-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
