import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const maxSummaryDerivedContextHeight = 240

function matchesItems(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected)
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE765_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE765_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE765_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE765_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE765_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE765_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage765-reader-derived-lead-in-deduplication-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage765-reader-derived-lead-in-deduplication-regression-failure.png'), {
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
    stagePrefix: 'stage765',
  })

  const {
    notebookOpenReaderDerivedContextActionLabels,
    notebookOpenReaderDerivedContextDescriptorVisible,
    notebookOpenReaderDerivedContextSummaryVisible,
    notebookOpenWorkbenchVisible,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
    summaryReaderCreateSummaryVisible,
    summaryReaderDerivedContextActionLabels,
    summaryReaderDerivedContextDescriptorVisible,
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
  if (notebookOpenReaderDerivedContextDescriptorVisible) {
    throw new Error('Expected the reflowed Reader derived-context descriptor badge to stay retired during the Stage 765 audit.')
  }
  if (!notebookOpenReaderDerivedContextSummaryVisible) {
    throw new Error('Expected the reflowed Reader derived-context summary line to remain visible during the Stage 765 audit.')
  }
  if (!summaryReaderGeneratedEmptyStateVisible) {
    throw new Error('Expected the live Summary Reader state to keep the generated empty-state messaging visible during the Stage 765 audit.')
  }
  if (!summaryReaderGeneratedEmptyStateNestedInDerivedContext) {
    throw new Error('Expected the live Summary generated empty state to stay nested inside the derived-context surface during the Stage 765 audit.')
  }
  if (!matchesItems(summaryReaderDerivedContextActionLabels, ['Notebook', 'Reflowed view'])) {
    throw new Error(
      `Expected the Summary derived-context actions to stay trimmed to Notebook and Reflowed view, found ${Array.isArray(summaryReaderDerivedContextActionLabels) ? summaryReaderDerivedContextActionLabels.join(', ') : summaryReaderDerivedContextActionLabels}.`,
    )
  }
  if (summaryReaderDerivedContextDescriptorVisible) {
    throw new Error('Expected the Summary derived-context descriptor badge to stay retired during the Stage 765 audit.')
  }
  if (summaryReaderDerivedContextSummaryVisible) {
    throw new Error('Expected the Summary derived-context paragraph to stay hidden when the inline generated empty state is visible during the Stage 765 audit.')
  }
  if (
    typeof summaryReaderDerivedContextHeight !== 'number' ||
    summaryReaderDerivedContextHeight > maxSummaryDerivedContextHeight
  ) {
    throw new Error(
      `Expected the live Summary derived-context height to stay at or below ${maxSummaryDerivedContextHeight}px after the lead-in deduplication, found ${summaryReaderDerivedContextHeight}.`,
    )
  }
  if (!summaryReaderCreateSummaryVisible) {
    throw new Error('Expected the Summary create affordance to remain available after deduplicating the derived lead-in.')
  }
  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 765 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 765 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the current live dataset during the Stage 765 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage765-post-stage764-reader-derived-lead-in-deduplication-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Reader derived modes should retire the redundant descriptor badge and keep the useful mode title plus provenance chips instead.',
          'Generated Summary state should hide the extra derived-context paragraph once the inline empty-state message is present.',
          'Source reopening, nearby Notebook reopening, the short-document article-field treatment, and wider Recall regression surfaces should stay stable in the same live browser pass.',
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
        path: path.join(outputDir, 'stage765-reader-derived-lead-in-deduplication-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage765-reader-derived-lead-in-deduplication-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
