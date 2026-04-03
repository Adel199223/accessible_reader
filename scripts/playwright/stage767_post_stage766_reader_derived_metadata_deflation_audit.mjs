import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const maxSummaryDerivedContextHeight = 210

function matchesItems(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected)
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE767_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE767_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE767_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE767_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE767_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE767_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage767-reader-derived-metadata-deflation-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage767-reader-derived-metadata-deflation-regression-failure.png'), {
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
    stagePrefix: 'stage767',
  })

  const {
    notebookOpenReaderDerivedContextActionLabels,
    notebookOpenReaderDerivedContextMetaLabels,
    notebookOpenReaderDerivedContextSummaryVisible,
    notebookOpenWorkbenchVisible,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
    summaryReaderCreateSummaryVisible,
    summaryReaderDerivedContextActionLabels,
    summaryReaderDerivedContextHeight,
    summaryReaderDerivedContextMetaLabels,
    summaryReaderDerivedContextSummaryVisible,
    summaryReaderGeneratedEmptyStateNestedInDerivedContext,
    summaryReaderGeneratedEmptyStateVisible,
  } = evidence.metrics

  if (!matchesItems(notebookOpenReaderDerivedContextActionLabels, ['Notebook'])) {
    throw new Error(
      `Expected the reflowed Reader derived-context actions to stay trimmed to Notebook only, found ${Array.isArray(notebookOpenReaderDerivedContextActionLabels) ? notebookOpenReaderDerivedContextActionLabels.join(', ') : notebookOpenReaderDerivedContextActionLabels}.`,
    )
  }
  if (!matchesItems(notebookOpenReaderDerivedContextMetaLabels, [])) {
    throw new Error(
      `Expected the reflowed Reader derived-context metadata row to collapse once duplicate provenance chips were removed, found ${Array.isArray(notebookOpenReaderDerivedContextMetaLabels) ? notebookOpenReaderDerivedContextMetaLabels.join(', ') : notebookOpenReaderDerivedContextMetaLabels}.`,
    )
  }
  if (!notebookOpenReaderDerivedContextSummaryVisible) {
    throw new Error('Expected the reflowed Reader derived-context summary line to remain visible during the Stage 767 audit.')
  }
  if (!summaryReaderGeneratedEmptyStateVisible) {
    throw new Error('Expected the live Summary Reader state to keep the generated empty-state messaging visible during the Stage 767 audit.')
  }
  if (!summaryReaderGeneratedEmptyStateNestedInDerivedContext) {
    throw new Error('Expected the live Summary generated empty state to stay nested inside the derived-context surface during the Stage 767 audit.')
  }
  if (!matchesItems(summaryReaderDerivedContextActionLabels, ['Notebook', 'Reflowed view'])) {
    throw new Error(
      `Expected the Summary derived-context actions to stay trimmed to Notebook and Reflowed view, found ${Array.isArray(summaryReaderDerivedContextActionLabels) ? summaryReaderDerivedContextActionLabels.join(', ') : summaryReaderDerivedContextActionLabels}.`,
    )
  }
  if (!matchesItems(summaryReaderDerivedContextMetaLabels, [])) {
    throw new Error(
      `Expected the missing Summary derived-context metadata row to collapse after duplicate chips were removed, found ${Array.isArray(summaryReaderDerivedContextMetaLabels) ? summaryReaderDerivedContextMetaLabels.join(', ') : summaryReaderDerivedContextMetaLabels}.`,
    )
  }
  if (summaryReaderDerivedContextSummaryVisible) {
    throw new Error('Expected the Summary derived-context paragraph to stay hidden when the inline generated empty state is visible during the Stage 767 audit.')
  }
  if (
    typeof summaryReaderDerivedContextHeight !== 'number' ||
    summaryReaderDerivedContextHeight > maxSummaryDerivedContextHeight
  ) {
    throw new Error(
      `Expected the live Summary derived-context height to stay at or below ${maxSummaryDerivedContextHeight}px after the metadata deflation, found ${summaryReaderDerivedContextHeight}.`,
    )
  }
  if (!summaryReaderCreateSummaryVisible) {
    throw new Error('Expected the Summary create affordance to remain available after deflating the derived metadata.')
  }
  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 767 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 767 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the current live dataset during the Stage 767 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage767-post-stage766-reader-derived-metadata-deflation-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Derived Reader modes should stop repeating source provenance in a second chip row when the title row already carries it.',
          'Summary empty states should stop repeating selected detail and generation readiness as metadata chips when those cues already appear elsewhere in the same block.',
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
        path: path.join(outputDir, 'stage767-reader-derived-metadata-deflation-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage767-reader-derived-metadata-deflation-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
