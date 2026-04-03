import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const maxSummaryDerivedContextHeight = 280

function matchesItems(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected)
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE763_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE763_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE763_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE763_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE763_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE763_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage763-reader-derived-context-stack-collapse-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage763-reader-derived-context-stack-collapse-regression-failure.png'), {
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
    stagePrefix: 'stage763',
  })

  const {
    notebookOpenReaderDerivedContextActionLabels,
    notebookOpenWorkbenchVisible,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
    summaryReaderCreateSummaryVisible,
    summaryReaderDerivedContextActionLabels,
    summaryReaderDerivedContextHeight,
    summaryReaderGeneratedEmptyStateNestedInDerivedContext,
    summaryReaderGeneratedEmptyStateVisible,
  } = evidence.metrics

  if (!matchesItems(notebookOpenReaderDerivedContextActionLabels, ['Notebook'])) {
    throw new Error(
      `Expected the reflowed Reader derived-context actions to stay trimmed to Notebook only, found ${Array.isArray(notebookOpenReaderDerivedContextActionLabels) ? notebookOpenReaderDerivedContextActionLabels.join(', ') : notebookOpenReaderDerivedContextActionLabels}.`,
    )
  }
  if (!summaryReaderGeneratedEmptyStateVisible) {
    throw new Error('Expected the live Summary Reader state to keep the generated empty-state messaging visible during the Stage 763 audit.')
  }
  if (!summaryReaderGeneratedEmptyStateNestedInDerivedContext) {
    throw new Error('Expected the live Summary generated empty state to live inside the derived-context surface instead of stacking as a second slab.')
  }
  if (!matchesItems(summaryReaderDerivedContextActionLabels, ['Notebook', 'Reflowed view'])) {
    throw new Error(
      `Expected the Summary derived-context actions to stay trimmed to Notebook and Reflowed view, found ${Array.isArray(summaryReaderDerivedContextActionLabels) ? summaryReaderDerivedContextActionLabels.join(', ') : summaryReaderDerivedContextActionLabels}.`,
    )
  }
  if (
    typeof summaryReaderDerivedContextHeight !== 'number' ||
    summaryReaderDerivedContextHeight > maxSummaryDerivedContextHeight
  ) {
    throw new Error(
      `Expected the live Summary derived-context height to stay at or below ${maxSummaryDerivedContextHeight}px after the stack collapse, found ${summaryReaderDerivedContextHeight}.`,
    )
  }
  if (!summaryReaderCreateSummaryVisible) {
    throw new Error('Expected the Summary create affordance to remain available after collapsing the generated-state stack.')
  }
  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 763 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 763 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the current live dataset during the Stage 763 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage763-post-stage762-reader-derived-context-stack-collapse-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Reader should fuse generated Summary state into the compact derived-context surface instead of stacking a second slab beneath it.',
          'Reflowed and Summary derived-context actions should stay trimmed to the nearby handoffs that still matter in place.',
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
        path: path.join(outputDir, 'stage763-reader-derived-context-stack-collapse-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage763-reader-derived-context-stack-collapse-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
