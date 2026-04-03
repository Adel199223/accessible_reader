import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE731_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE731_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE731_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE731_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE731_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE731_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage731-reader-generated-empty-state-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage731-reader-generated-empty-state-audit-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage731',
  })

  const {
    defaultDockPresent,
    defaultReaderArticleTop,
    defaultReaderControlRibbonWidthRatio,
    defaultReaderDeckWidthRatio,
    defaultReaderSourceStripHeight,
    defaultReaderStageChromeHeight,
    defaultReaderSupportInlineVisible,
    defaultWorkspaceInlineErrorVisible,
    sourceOpenDockPresent,
    sourceOpenReaderSourceLibraryVisible,
    summaryDockPresent,
    summaryReaderCreateSummaryVisible,
    summaryReaderGeneratedEmptyStateErrorTone,
    summaryReaderGeneratedEmptyStateRetryVisible,
    summaryReaderGeneratedEmptyStateVisible,
    summaryReaderHasArticle,
    summaryReaderSupportInlineVisible,
    summarySummaryDetailInlineVisible,
    summaryWorkspaceInlineErrorVisible,
    notebookOpenWorkbenchVisible,
  } = evidence.metrics

  if (defaultDockPresent) {
    throw new Error('Expected the default Reader state to keep the separate dock hidden after Stage 729.')
  }
  if (!defaultReaderSupportInlineVisible) {
    throw new Error('Expected the default Reader state to keep the inline support seam visible at rest.')
  }
  if (!(typeof defaultReaderDeckWidthRatio === 'number' && defaultReaderDeckWidthRatio <= 0.8)) {
    throw new Error(`Expected the compact Reader deck to stay narrow, found ratio ${defaultReaderDeckWidthRatio}.`)
  }
  if (!(typeof defaultReaderControlRibbonWidthRatio === 'number' && defaultReaderControlRibbonWidthRatio <= 0.8)) {
    throw new Error(`Expected the Reader control ribbon to stay attached to the compact deck width, found ratio ${defaultReaderControlRibbonWidthRatio}.`)
  }
  if (!(typeof defaultReaderArticleTop === 'number' && defaultReaderArticleTop <= 235)) {
    throw new Error(`Expected the article to keep its early start after empty-state normalization, found top ${defaultReaderArticleTop}.`)
  }
  if (!(typeof defaultReaderStageChromeHeight === 'number' && defaultReaderStageChromeHeight <= 50)) {
    throw new Error(`Expected the Reader chrome above the article to remain compact, found ${defaultReaderStageChromeHeight}.`)
  }
  if (!(typeof defaultReaderSourceStripHeight === 'number' && defaultReaderSourceStripHeight <= 60)) {
    throw new Error(`Expected the Reader source strip to remain compact, found ${defaultReaderSourceStripHeight}.`)
  }
  if (defaultWorkspaceInlineErrorVisible) {
    throw new Error('Expected the default Reader state to keep the global inline alert slab hidden.')
  }
  if (!sourceOpenDockPresent || !sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep expanding normally after the empty-state cleanup.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook workbench expansion to remain intact after the empty-state cleanup.')
  }
  if (summaryWorkspaceInlineErrorVisible) {
    throw new Error('Expected Summary empty state to stay inside the Reader deck instead of showing a global alert slab.')
  }
  if (!summaryReaderGeneratedEmptyStateVisible) {
    throw new Error('Expected Summary empty state to remain visible inline inside the Reader deck.')
  }
  if (summaryReaderGeneratedEmptyStateErrorTone) {
    throw new Error('Expected the live Summary unavailable state to read as a calm placeholder, not an error-toned alert.')
  }
  if (summaryReaderGeneratedEmptyStateRetryVisible) {
    throw new Error('Expected the live Summary unavailable state to prefer Create Summary instead of a retry-only treatment.')
  }
  if (!summaryReaderCreateSummaryVisible) {
    throw new Error('Expected Create Summary to remain available in the live Summary empty state.')
  }
  if (summaryReaderHasArticle) {
    throw new Error('Expected the live Summary audit target to remain in the summary-empty path for this checkpoint.')
  }
  if (summaryDockPresent) {
    throw new Error('Expected Summary empty state to keep the support seam inline at rest.')
  }
  if (!summaryReaderSupportInlineVisible) {
    throw new Error('Expected Summary empty state to keep the inline support seam visible at rest.')
  }
  if (!summarySummaryDetailInlineVisible) {
    throw new Error('Expected Summary detail controls to remain inline during the Summary empty state.')
  }

  await writeFile(
    path.join(outputDir, 'stage731-post-stage730-reader-generated-mode-empty-state-normalization-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Reader should keep the Stage 729 compact deck and fused inline support seam intact.',
          'Generated-mode unavailable states should no longer surface as a full-width global alert above the deck.',
          'Summary empty state should stay inline, calm, and actionable without changing generated content behavior.',
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
        path: path.join(outputDir, 'stage731-reader-generated-empty-state-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        path: path.join(outputDir, 'stage731-reader-generated-empty-state-audit-regression-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
