import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const maxShortArticleFieldHeight = 430

function matchesItems(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected)
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE761_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE761_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE761_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE761_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE761_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE761_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage761-reader-short-document-article-field-compaction-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage761-reader-short-document-article-field-compaction-regression-failure.png'), {
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
    stagePrefix: 'stage761',
  })

  const {
    defaultArticleFieldHeight,
    defaultArticleFieldPresent,
    defaultArticleFieldShortDocument,
    defaultReaderVisibleTransportButtonLabels,
    defaultReaderVisibleUtilityLabels,
    notebookOpenArticleFieldHeight,
    notebookOpenArticleFieldPresent,
    notebookOpenArticleFieldShortDocument,
    notebookOpenWorkbenchVisible,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
    summaryArticleFieldHeight,
    summaryArticleFieldPresent,
    summaryArticleFieldShortDocument,
    summaryReaderCreateSummaryVisible,
    summaryReaderGeneratedEmptyStateVisible,
  } = evidence.metrics

  if (!defaultArticleFieldPresent) {
    throw new Error('Expected the default Reader stage to keep an article field visible during the Stage 761 audit.')
  }
  if (!defaultArticleFieldShortDocument) {
    throw new Error('Expected the default Reader article field to mark the live short document with the compact short-document treatment.')
  }
  if (typeof defaultArticleFieldHeight !== 'number' || defaultArticleFieldHeight > maxShortArticleFieldHeight) {
    throw new Error(
      `Expected the default Reader short-document article field height to stay at or below ${maxShortArticleFieldHeight}px, found ${defaultArticleFieldHeight}.`,
    )
  }
  if (!notebookOpenArticleFieldPresent) {
    throw new Error('Expected the reflowed Reader stage to keep an article field visible after opening nearby Notebook support.')
  }
  if (!notebookOpenArticleFieldShortDocument) {
    throw new Error('Expected the reflowed Reader article field to keep the compact short-document treatment during the Stage 761 audit.')
  }
  if (
    typeof notebookOpenArticleFieldHeight !== 'number' ||
    notebookOpenArticleFieldHeight > maxShortArticleFieldHeight
  ) {
    throw new Error(
      `Expected the reflowed Reader short-document article field height to stay at or below ${maxShortArticleFieldHeight}px, found ${notebookOpenArticleFieldHeight}.`,
    )
  }
  if (!matchesItems(defaultReaderVisibleTransportButtonLabels, ['Start read aloud'])) {
    throw new Error('Expected the default Reader ribbon to keep only Start read aloud visible during the Stage 761 audit.')
  }
  if (!matchesItems(defaultReaderVisibleUtilityLabels, ['More reading controls'])) {
    throw new Error(
      `Expected the default Reader ribbon to keep only More reading controls beside the primary transport, found ${Array.isArray(defaultReaderVisibleUtilityLabels) ? defaultReaderVisibleUtilityLabels.join(', ') : defaultReaderVisibleUtilityLabels}.`,
    )
  }
  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 761 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 761 audit.')
  }
  if (summaryArticleFieldPresent) {
    if (!summaryArticleFieldShortDocument) {
      throw new Error('Expected Summary article content to use the compact short-document treatment when a live Summary article is available.')
    }
    if (typeof summaryArticleFieldHeight !== 'number' || summaryArticleFieldHeight > maxShortArticleFieldHeight) {
      throw new Error(
        `Expected the live Summary short-document article field height to stay at or below ${maxShortArticleFieldHeight}px, found ${summaryArticleFieldHeight}.`,
      )
    }
  } else if (!summaryReaderGeneratedEmptyStateVisible || !summaryReaderCreateSummaryVisible) {
    throw new Error('Expected Summary to keep the generated empty-state contract when a live Summary article is unavailable.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the current live dataset during the Stage 761 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage761-post-stage760-reader-short-document-article-field-compaction-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Reader should compact the visible article field for short live documents instead of leaving the old tall empty slab.',
          'Original and reflowed short-document states should both stay below the new article-field height ceiling while preserving the idle transport and nearby support reopen flows.',
          'Summary generated-mode affordances plus the wider Recall regression surfaces should stay stable in the same live browser pass.',
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
        path: path.join(outputDir, 'stage761-reader-short-document-article-field-compaction-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage761-reader-short-document-article-field-compaction-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
