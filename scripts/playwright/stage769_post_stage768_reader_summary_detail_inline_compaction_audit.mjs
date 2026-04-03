import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const maxSummaryDerivedContextHeight = 138

function matchesItems(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected)
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE769_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE769_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE769_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE769_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE769_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE769_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage769-reader-summary-detail-inline-compaction-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage769-reader-summary-detail-inline-compaction-regression-failure.png'), {
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
    stagePrefix: 'stage769',
  })

  const {
    notebookOpenReaderDerivedContextActionLabels,
    notebookOpenReaderDerivedContextSummaryVisible,
    notebookOpenWorkbenchVisible,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
    summaryReaderCreateSummaryVisible,
    summaryReaderDerivedContextActionLabels,
    summaryReaderDerivedContextDetailInHeaderRow,
    summaryReaderDerivedContextDetailInline,
    summaryReaderDerivedContextDetailLabelVisible,
    summaryReaderDerivedContextHeight,
    summaryReaderDerivedContextSummaryVisible,
    summaryReaderGeneratedEmptyStateNestedInDerivedContext,
    summaryReaderGeneratedEmptyStateVisible,
  } = evidence.metrics

  if (!matchesItems(notebookOpenReaderDerivedContextActionLabels, ['Notebook'])) {
    throw new Error(
      `Expected the reflowed Reader derived-context actions to stay trimmed to Notebook only, found ${Array.isArray(notebookOpenReaderDerivedContextActionLabels) ? notebookOpenReaderDerivedContextActionLabels.join(', ') : notebookOpenReaderDerivedContextActionLabels}.`,
    )
  }
  if (!notebookOpenReaderDerivedContextSummaryVisible) {
    throw new Error('Expected the reflowed Reader derived-context summary line to remain visible during the Stage 769 audit.')
  }
  if (!summaryReaderGeneratedEmptyStateVisible) {
    throw new Error('Expected the live Summary Reader state to keep the generated empty-state messaging visible during the Stage 769 audit.')
  }
  if (!summaryReaderGeneratedEmptyStateNestedInDerivedContext) {
    throw new Error('Expected the live Summary generated empty state to stay nested inside the derived-context surface during the Stage 769 audit.')
  }
  if (!matchesItems(summaryReaderDerivedContextActionLabels, ['Notebook', 'Reflowed view'])) {
    throw new Error(
      `Expected the Summary derived-context actions to stay trimmed to Notebook and Reflowed view, found ${Array.isArray(summaryReaderDerivedContextActionLabels) ? summaryReaderDerivedContextActionLabels.join(', ') : summaryReaderDerivedContextActionLabels}.`,
    )
  }
  if (summaryReaderDerivedContextDetailLabelVisible) {
    throw new Error('Expected the Summary derived-context to retire the visible Detail label during the Stage 769 audit.')
  }
  if (!summaryReaderDerivedContextDetailInline) {
    throw new Error('Expected the Summary detail control to use the inline compact layout during the Stage 769 audit.')
  }
  if (!summaryReaderDerivedContextDetailInHeaderRow) {
    throw new Error('Expected the Summary detail control to live inside the same header rail as the Summary lead-in during the Stage 769 audit.')
  }
  if (summaryReaderDerivedContextSummaryVisible) {
    throw new Error('Expected the Summary derived-context paragraph to stay hidden when the inline generated empty state is visible during the Stage 769 audit.')
  }
  if (
    typeof summaryReaderDerivedContextHeight !== 'number' ||
    summaryReaderDerivedContextHeight > maxSummaryDerivedContextHeight
  ) {
    throw new Error(
      `Expected the live Summary derived-context height to stay at or below ${maxSummaryDerivedContextHeight}px after the inline detail compaction, found ${summaryReaderDerivedContextHeight}.`,
    )
  }
  if (!summaryReaderCreateSummaryVisible) {
    throw new Error('Expected the Summary create affordance to remain available after compacting the detail lead-in.')
  }
  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 769 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 769 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the current live dataset during the Stage 769 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage769-post-stage768-reader-summary-detail-inline-compaction-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Summary should keep its detail selector while retiring the extra visible Detail label.',
          'The Summary detail selector should live in the same compact lead-in rail instead of a second stacked sub-panel.',
          'Source reopening, nearby Notebook reopening, compact overflow behavior, and wider Recall regression surfaces should stay stable in the same live browser pass.',
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
        path: path.join(outputDir, 'stage769-reader-summary-detail-inline-compaction-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage769-reader-summary-detail-inline-compaction-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
