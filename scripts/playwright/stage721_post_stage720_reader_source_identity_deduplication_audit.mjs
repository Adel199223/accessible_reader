import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE721_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE721_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE721_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE721_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE721_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE721_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage721-reader-source-identity-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage721-reader-source-identity-audit-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage721',
  })

  const {
    defaultArticleFieldCenteredOffset,
    defaultArticleFieldPresent,
    defaultArticleFieldToShellWidthRatio,
    defaultDockToArticleWidthRatio,
    defaultReaderArticleTop,
    defaultReaderContentHeadingCount,
    defaultReaderSourceLibraryVisible,
    defaultReaderSourceStripFramedAtRest,
    defaultReaderSourceStripHeadingVisible,
    defaultReaderSourceStripHeight,
    defaultReaderStageChromeHeight,
    defaultReaderStageHeadingVisible,
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

  if (defaultReaderStageHeadingVisible) {
    throw new Error('Expected the duplicated Reader-stage title seam to disappear at rest.')
  }
  if (!defaultReaderSourceStripHeadingVisible) {
    throw new Error('Expected the Reader-active source strip to carry the visible document title heading.')
  }
  if (defaultReaderContentHeadingCount !== 1) {
    throw new Error(`Expected exactly one visible heading for the active Reader document, found ${defaultReaderContentHeadingCount}.`)
  }
  if (!(defaultReaderSourceStripHeight <= 62)) {
    throw new Error(`Expected the Reader source strip to stay compact after identity deduplication, found ${defaultReaderSourceStripHeight}.`)
  }
  if (defaultReaderSourceStripFramedAtRest) {
    throw new Error('Expected the Reader-active source strip to remain flat and attached at rest.')
  }
  if (!(typeof defaultReaderStageChromeHeight === 'number' && defaultReaderStageChromeHeight <= 88)) {
    throw new Error(`Expected Reader chrome above the article to shrink again after deduplication, found ${defaultReaderStageChromeHeight}.`)
  }
  if (!(typeof defaultReaderArticleTop === 'number' && defaultReaderArticleTop <= 276)) {
    throw new Error(`Expected the article to start earlier after title-seam removal, found top ${defaultReaderArticleTop}.`)
  }
  if (defaultStageHasCardClass || defaultStageUsesPriorityShellClass || defaultStageFramedAtRest) {
    throw new Error('Expected the quiet Reader outer stage to remain unframed after the identity deduplication pass.')
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
    path.join(outputDir, 'stage721-post-stage720-reader-source-identity-deduplication-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Reader should keep the source strip as the one visible identity band above the article.',
          'The duplicated Reader-stage title seam should disappear without reopening heavier Reader chrome.',
          'The article should start earlier while the compact Source / Notebook seam and generated outputs remain intact.',
          'Home, Graph, embedded Notebook, and Study remain stable in the same live browser pass.',
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
        path: path.join(outputDir, 'stage721-reader-source-identity-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        path: path.join(outputDir, 'stage721-reader-source-identity-audit-regression-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
