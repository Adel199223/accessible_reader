import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE715_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE715_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE715_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE715_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE715_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE715_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage715-reader-article-field-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage715-reader-article-field-audit-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage715',
  })

  const {
    defaultArticleFieldCenteredOffset,
    defaultArticleFieldPresent,
    defaultArticleFieldToShellWidthRatio,
    defaultArticleShellFramedAtRest,
    defaultDockToArticleWidthRatio,
    defaultReaderRetiredCopyVisible,
    defaultReaderSourceLibraryVisible,
    defaultReaderSourceStripHeight,
    defaultReaderStageChromeHeight,
    defaultReaderSupportCopyVisibleAtRest,
    defaultReaderSupportMetaChipCount,
    defaultReaderSupportTabLabelsVisible,
    defaultSupportCollapsed,
    notebookOpenDockExpanded,
    notebookOpenWorkbenchVisible,
    sourceOpenDockExpanded,
    sourceOpenReaderSourceLibraryVisible,
    summaryReaderCreateSummaryVisible,
    summaryReaderHasArticle,
    summaryReaderSummaryArticleContainsSnippet,
    summaryReaderSummaryContextContainsSnippet,
    summarySummaryDetailInlineVisible,
  } = evidence.metrics

  if (defaultReaderRetiredCopyVisible) {
    throw new Error('Expected Reading deck / Reader dock era copy to stay retired at rest.')
  }
  if (!(defaultReaderSourceStripHeight <= 75)) {
    throw new Error(`Expected the Reader source strip to remain slim, found ${defaultReaderSourceStripHeight}.`)
  }
  if (!(defaultReaderStageChromeHeight <= 112)) {
    throw new Error(`Expected Reader chrome above the article to stay compressed, found ${defaultReaderStageChromeHeight}.`)
  }
  if (!defaultSupportCollapsed || defaultReaderSourceLibraryVisible) {
    throw new Error('Expected the support rail to stay compact at rest with Source content hidden.')
  }
  if (!(typeof defaultDockToArticleWidthRatio === 'number' && defaultDockToArticleWidthRatio <= 0.12)) {
    throw new Error(`Expected the compact support seam to remain slim, found ratio ${defaultDockToArticleWidthRatio}.`)
  }
  if (!defaultArticleFieldPresent) {
    throw new Error('Expected a dedicated article field wrapper inside the Reader lane.')
  }
  if (defaultArticleShellFramedAtRest) {
    throw new Error('Expected the outer article shell to stay visually quiet while the inner article field carries the visible framing.')
  }
  if (!(typeof defaultArticleFieldToShellWidthRatio === 'number' && defaultArticleFieldToShellWidthRatio <= 0.88)) {
    throw new Error(`Expected the article field to stay meaningfully narrower than the full shell, found ratio ${defaultArticleFieldToShellWidthRatio}.`)
  }
  if (!(typeof defaultArticleFieldCenteredOffset === 'number' && defaultArticleFieldCenteredOffset <= 18)) {
    throw new Error(`Expected the article field to stay visually centered inside the Reader lane, found offset ${defaultArticleFieldCenteredOffset}.`)
  }
  if (defaultReaderSupportCopyVisibleAtRest) {
    throw new Error('Expected no explanatory support copy to remain visible in the collapsed support seam.')
  }
  if (!(defaultReaderSupportMetaChipCount <= 2)) {
    throw new Error(`Expected the collapsed support seam to keep at most two compact meta chips, found ${defaultReaderSupportMetaChipCount}.`)
  }
  if (defaultReaderSupportTabLabelsVisible) {
    throw new Error('Expected the collapsed support seam to keep tab labels visually hidden at rest.')
  }
  if (!sourceOpenDockExpanded || !sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to expand on demand and reveal the source library.')
  }
  if (!notebookOpenDockExpanded || !notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to expand into the selected note workbench after note capture.')
  }
  if (!summarySummaryDetailInlineVisible) {
    throw new Error('Expected Summary detail controls to stay inline in the Summary context band.')
  }
  if (summaryReaderHasArticle) {
    if (!summaryReaderSummaryArticleContainsSnippet || summaryReaderSummaryContextContainsSnippet) {
      throw new Error('Expected Summary article text to remain in the article lane and stay out of the compact context band.')
    }
  } else if (!summaryReaderCreateSummaryVisible) {
    throw new Error('Expected the summary-empty state to surface the inline Create Summary action when no summary article is available.')
  }

  await writeFile(
    path.join(outputDir, 'stage715-post-stage714-reader-article-field-rebalancing-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Reader should present a dedicated reading field instead of one broad framed slab at rest.',
          'The compact Source / Notebook seam should remain calm and attached.',
          'Expanded Source and Notebook work should remain intact.',
          'Generated outputs remain unchanged while Home, Graph, embedded Notebook, and Study stay stable.',
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
        path: path.join(outputDir, 'stage715-reader-article-field-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        path: path.join(outputDir, 'stage715-reader-article-field-audit-regression-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
