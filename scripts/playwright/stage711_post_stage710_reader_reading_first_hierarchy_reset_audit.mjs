import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE711_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE711_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE711_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE711_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE711_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE711_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage711-reader-reading-first-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage711-reader-reading-first-audit-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage711',
  })

  const {
    defaultReaderArticleTop,
    defaultReaderContentHeadingCount,
    defaultReaderRetiredCopyVisible,
    defaultReaderSourceLibraryVisible,
    defaultReaderSourceStripHeight,
    defaultReaderStageChromeHeight,
    defaultSupportCollapsed,
    defaultDockToArticleWidthRatio,
    sourceOpenDockExpanded,
    sourceOpenReaderSourceLibraryVisible,
    notebookOpenDockExpanded,
    notebookOpenWorkbenchVisible,
    summaryReaderCreateSummaryVisible,
    summaryReaderHasArticle,
    summaryReaderSummaryArticleContainsSnippet,
    summaryReaderSummaryContextContainsSnippet,
    summarySummaryDetailInlineVisible,
  } = evidence.metrics

  if (defaultReaderRetiredCopyVisible) {
    throw new Error('Expected Reading deck / Reader dock era copy to stay retired at rest.')
  }
  if (!(defaultReaderSourceStripHeight <= 118)) {
    throw new Error(`Expected the Reader source strip to stay slimmer than the previous milestone, found ${defaultReaderSourceStripHeight}.`)
  }
  if (!(defaultReaderStageChromeHeight <= 190)) {
    throw new Error(`Expected Reader chrome above the article to stay compressed, found ${defaultReaderStageChromeHeight}.`)
  }
  if (!(defaultReaderArticleTop <= 400)) {
    throw new Error(`Expected the article to begin earlier on the page, found top offset ${defaultReaderArticleTop}.`)
  }
  if (!defaultSupportCollapsed || defaultReaderSourceLibraryVisible) {
    throw new Error('Expected the support rail to stay compact at rest with Source content hidden.')
  }
  if (!(defaultDockToArticleWidthRatio <= 0.34)) {
    throw new Error(`Expected the at-rest support rail to stay visually secondary, found ratio ${defaultDockToArticleWidthRatio}.`)
  }
  if (!(defaultReaderContentHeadingCount === 1)) {
    throw new Error(`Expected only one visible heading for the source title in Reader, found ${defaultReaderContentHeadingCount}.`)
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
    path.join(outputDir, 'stage711-post-stage710-reader-reading-first-hierarchy-reset-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Reader should reach the article faster and retire the old over-explained resting copy.',
          'Source and Notebook support should stay compact at rest, then expand only when invoked.',
          'Summary controls should stay inline in the derived band while article text remains unchanged.',
          'Home, Graph, embedded Notebook, and Study remain stable regression surfaces.',
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
        path: path.join(outputDir, 'stage711-reader-reading-first-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        path: path.join(outputDir, 'stage711-reader-reading-first-audit-regression-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
