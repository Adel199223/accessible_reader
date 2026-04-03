import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

function matchesItems(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected)
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE771_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE771_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE771_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE771_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE771_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE771_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage771-reader-derived-quick-action-retirement-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage771-reader-derived-quick-action-retirement-regression-failure.png'), {
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
    stagePrefix: 'stage771',
  })

  const {
    notebookOpenReaderDerivedContextActionLabels,
    notebookOpenReaderDerivedContextActionsVisible,
    notebookOpenReaderDerivedContextSummaryVisible,
    notebookOpenWorkbenchVisible,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
    summaryReaderCreateSummaryVisible,
    summaryReaderDerivedContextActionLabels,
    summaryReaderDerivedContextActionsVisible,
    summaryReaderDerivedContextDetailInline,
    summaryReaderDerivedContextDetailInHeaderRow,
    summaryReaderDerivedContextDetailLabelVisible,
    summaryReaderGeneratedEmptyStateNestedInDerivedContext,
    summaryReaderGeneratedEmptyStateVisible,
  } = evidence.metrics

  if (!matchesItems(notebookOpenReaderDerivedContextActionLabels, [])) {
    throw new Error(
      `Expected the reflowed Reader derived-context quick actions to retire completely, found ${Array.isArray(notebookOpenReaderDerivedContextActionLabels) ? notebookOpenReaderDerivedContextActionLabels.join(', ') : notebookOpenReaderDerivedContextActionLabels}.`,
    )
  }
  if (notebookOpenReaderDerivedContextActionsVisible) {
    throw new Error('Expected the reflowed Reader derived-context action column to collapse when no unique action remains during the Stage 771 audit.')
  }
  if (!notebookOpenReaderDerivedContextSummaryVisible) {
    throw new Error('Expected the reflowed Reader derived-context summary line to remain visible during the Stage 771 audit.')
  }
  if (!summaryReaderGeneratedEmptyStateVisible) {
    throw new Error('Expected the live Summary Reader state to keep the generated empty-state messaging visible during the Stage 771 audit.')
  }
  if (!summaryReaderGeneratedEmptyStateNestedInDerivedContext) {
    throw new Error('Expected the live Summary generated empty state to stay nested inside the derived-context surface during the Stage 771 audit.')
  }
  if (!matchesItems(summaryReaderDerivedContextActionLabels, [])) {
    throw new Error(
      `Expected the Summary derived-context quick actions to retire completely, found ${Array.isArray(summaryReaderDerivedContextActionLabels) ? summaryReaderDerivedContextActionLabels.join(', ') : summaryReaderDerivedContextActionLabels}.`,
    )
  }
  if (!summaryReaderDerivedContextActionsVisible) {
    throw new Error('Expected the Summary derived-context to keep the action column only for the Create Summary action during the Stage 771 audit.')
  }
  if (!summaryReaderCreateSummaryVisible) {
    throw new Error('Expected the Summary create affordance to remain available after retiring duplicate quick actions.')
  }
  if (!summaryReaderDerivedContextDetailInline || !summaryReaderDerivedContextDetailInHeaderRow || summaryReaderDerivedContextDetailLabelVisible) {
    throw new Error('Expected the compact inline Summary detail lead-in from Stage 769 to remain intact during the Stage 771 audit.')
  }
  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 771 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 771 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the current live dataset during the Stage 771 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage771-post-stage770-reader-derived-quick-action-retirement-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Derived Reader modes should stop repeating Notebook and Reflowed view as local quick actions when those routes already live in clearer nearby controls.',
          'The derived-context action column should collapse entirely when no create or retry action remains.',
          'Create and retry affordances, source-strip note-chip reopening, mode-tab switching, and wider Recall regression surfaces should stay stable in the same live browser pass.',
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
        path: path.join(outputDir, 'stage771-reader-derived-quick-action-retirement-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage771-reader-derived-quick-action-retirement-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
