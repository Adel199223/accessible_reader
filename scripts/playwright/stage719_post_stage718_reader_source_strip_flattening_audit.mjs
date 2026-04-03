import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE719_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE719_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE719_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE719_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE719_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE719_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage719-reader-source-strip-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage719-reader-source-strip-audit-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage719',
  })

  const {
    defaultArticleFieldCenteredOffset,
    defaultArticleFieldPresent,
    defaultArticleFieldToShellWidthRatio,
    defaultDockToArticleWidthRatio,
    defaultReaderArticleTop,
    defaultReaderSourceLibraryVisible,
    defaultReaderSourceStripFramedAtRest,
    defaultReaderSourceStripHeight,
    defaultReaderStageChromeHeight,
    defaultReaderSupportCopyVisibleAtRest,
    defaultReaderSupportMetaChipCount,
    defaultReaderSupportTabLabelsVisible,
    defaultStageFramedAtRest,
    defaultStageHasCardClass,
    defaultStageUsesPriorityShellClass,
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

  if (!(defaultReaderSourceStripHeight <= 66)) {
    throw new Error(`Expected the Reader source strip to compress further, found ${defaultReaderSourceStripHeight}.`)
  }
  if (defaultReaderSourceStripFramedAtRest) {
    throw new Error('Expected the Reader-active source strip to stop reading like a framed card at rest.')
  }
  if (!(typeof defaultReaderArticleTop === 'number' && defaultReaderArticleTop <= 290)) {
    throw new Error(`Expected the article to begin earlier after the strip flattening pass, found top ${defaultReaderArticleTop}.`)
  }
  if (!(defaultReaderStageChromeHeight <= 94)) {
    throw new Error(`Expected Reader chrome above the article to stay compressed, found ${defaultReaderStageChromeHeight}.`)
  }
  if (defaultStageHasCardClass || defaultStageUsesPriorityShellClass || defaultStageFramedAtRest) {
    throw new Error('Expected the Reader outer stage to remain quiet and unframed after the source-strip pass.')
  }
  if (!defaultSupportCollapsed || defaultReaderSourceLibraryVisible) {
    throw new Error('Expected the compact support seam to remain collapsed at rest with Source content hidden.')
  }
  if (!(typeof defaultDockToArticleWidthRatio === 'number' && defaultDockToArticleWidthRatio <= 0.12)) {
    throw new Error(`Expected the compact support seam to remain slim, found ratio ${defaultDockToArticleWidthRatio}.`)
  }
  if (!defaultArticleFieldPresent) {
    throw new Error('Expected the centered article field to remain present.')
  }
  if (!(typeof defaultArticleFieldToShellWidthRatio === 'number' && defaultArticleFieldToShellWidthRatio <= 0.88)) {
    throw new Error(`Expected the article field to remain meaningfully narrower than the lane, found ratio ${defaultArticleFieldToShellWidthRatio}.`)
  }
  if (!(typeof defaultArticleFieldCenteredOffset === 'number' && defaultArticleFieldCenteredOffset <= 18)) {
    throw new Error(`Expected the article field to remain visually centered, found offset ${defaultArticleFieldCenteredOffset}.`)
  }
  if (defaultReaderSupportCopyVisibleAtRest) {
    throw new Error('Expected no explanatory support copy to remain visible in the compact support seam.')
  }
  if (!(defaultReaderSupportMetaChipCount <= 2)) {
    throw new Error(`Expected the compact support seam to keep at most two meta chips, found ${defaultReaderSupportMetaChipCount}.`)
  }
  if (defaultReaderSupportTabLabelsVisible) {
    throw new Error('Expected the compact support seam to keep tab labels hidden at rest.')
  }
  if (!sourceOpenDockExpanded || !sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to expand on demand and reveal the source library.')
  }
  if (!notebookOpenDockExpanded || !notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to expand into the note workbench after note capture.')
  }
  if (!summarySummaryDetailInlineVisible) {
    throw new Error('Expected Summary detail controls to remain inline in the Summary context band.')
  }
  if (summaryReaderHasArticle) {
    if (!summaryReaderSummaryArticleContainsSnippet || summaryReaderSummaryContextContainsSnippet) {
      throw new Error('Expected Summary article text to remain in the article lane and stay out of the compact context band.')
    }
  } else if (!summaryReaderCreateSummaryVisible) {
    throw new Error('Expected the summary-empty state to retain the inline Create Summary action.')
  }

  await writeFile(
    path.join(outputDir, 'stage719-post-stage718-reader-source-strip-flattening-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Reader should keep the quiet outer shell while flattening the attached source strip.',
          'The source strip should read as a lighter attached seam instead of a boxed panel.',
          'The centered article field and compact support seam should remain intact.',
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
        path: path.join(outputDir, 'stage719-reader-source-strip-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        path: path.join(outputDir, 'stage719-reader-source-strip-audit-regression-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
