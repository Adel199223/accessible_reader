import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE734_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE734_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE734_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE734_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE734_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE734_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage734-reader-compact-chrome-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage734-reader-compact-chrome-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage734',
  })

  const {
    defaultDockPresent,
    defaultReaderArticleTop,
    defaultReaderControlRibbonCenteredOffset,
    defaultReaderControlRibbonWidthRatio,
    defaultReaderDeckWidthRatio,
    defaultReaderStageLeft,
    defaultReaderSourceStripCenteredOffset,
    defaultReaderSourceStripShellCenteredOffset,
    defaultReaderSourceStripShellWidthRatio,
    defaultReaderSourceStripHeight,
    defaultReaderSourceStripLeft,
    defaultReaderSourceStripWidthRatio,
    defaultReaderStageChromeHeight,
    defaultReaderSupportInlineVisible,
    defaultWorkspaceInlineErrorVisible,
    sourceOpenDockPresent,
    sourceOpenReaderSourceLibraryVisible,
    notebookOpenWorkbenchVisible,
    simplifiedDockPresent,
    simplifiedReaderCreateSimplifiedVisible,
    simplifiedReaderGeneratedEmptyStateErrorTone,
    simplifiedReaderGeneratedEmptyStateVisible,
    simplifiedReaderHasArticle,
    simplifiedReaderSupportInlineVisible,
    simplifiedViewAvailable,
    simplifiedWorkspaceInlineErrorVisible,
    summaryDockPresent,
    summaryReaderCreateSummaryVisible,
    summaryReaderGeneratedEmptyStateErrorTone,
    summaryReaderGeneratedEmptyStateVisible,
    summaryReaderHasArticle,
    summaryReaderSupportInlineVisible,
    summarySummaryDetailInlineVisible,
    summaryWorkspaceInlineErrorVisible,
  } = evidence.metrics

  console.log(
    JSON.stringify(
      {
        defaultReaderControlRibbonWidthRatio,
        defaultReaderControlRibbonCenteredOffset,
        defaultReaderDeckWidthRatio,
        defaultReaderStageLeft,
        defaultReaderSourceStripCenteredOffset,
        defaultReaderSourceStripShellCenteredOffset,
        defaultReaderSourceStripShellWidthRatio,
        defaultReaderSourceStripHeight,
        defaultReaderSourceStripLeft,
        defaultReaderSourceStripWidthRatio,
      },
      null,
      2,
    ),
  )

  if (defaultDockPresent) {
    throw new Error('Expected the default Reader state to keep the separate dock hidden during Stage 734.')
  }
  if (!defaultReaderSupportInlineVisible) {
    throw new Error('Expected the default Reader state to keep the inline support seam visible during Stage 734.')
  }
  if (!(typeof defaultReaderDeckWidthRatio === 'number' && defaultReaderDeckWidthRatio <= 0.8)) {
    throw new Error(`Expected the compact Reader deck to stay narrow, found ratio ${defaultReaderDeckWidthRatio}.`)
  }
  if (!(typeof defaultReaderControlRibbonWidthRatio === 'number' && defaultReaderControlRibbonWidthRatio <= 0.8)) {
    throw new Error(
      `Expected the Reader control ribbon to stay attached to the compact deck width, found ratio ${defaultReaderControlRibbonWidthRatio}.`,
    )
  }
  if (!(typeof defaultReaderSourceStripWidthRatio === 'number' && defaultReaderSourceStripWidthRatio <= 0.82)) {
    throw new Error(
      `Expected the reader-active source strip to stay compact after Stage 734, found ratio ${defaultReaderSourceStripWidthRatio}.`,
    )
  }
  if (
    !(
      typeof defaultReaderSourceStripWidthRatio === 'number' &&
      typeof defaultReaderControlRibbonWidthRatio === 'number' &&
      Math.abs(defaultReaderSourceStripWidthRatio - defaultReaderControlRibbonWidthRatio) <= 0.04
    )
  ) {
    throw new Error(
      `Expected the source strip and control ribbon to share the same compact band, found ratios ${defaultReaderSourceStripWidthRatio} and ${defaultReaderControlRibbonWidthRatio}.`,
    )
  }
  if (!(typeof defaultReaderSourceStripCenteredOffset === 'number' && defaultReaderSourceStripCenteredOffset <= 3)) {
    throw new Error(
      `Expected the reader-active source strip to center with the compact band, found offset ${defaultReaderSourceStripCenteredOffset}.`,
    )
  }
  if (!(typeof defaultReaderArticleTop === 'number' && defaultReaderArticleTop <= 235)) {
    throw new Error(`Expected the article to keep its early start, found top ${defaultReaderArticleTop}.`)
  }
  if (!(typeof defaultReaderStageChromeHeight === 'number' && defaultReaderStageChromeHeight <= 50)) {
    throw new Error(`Expected the Reader chrome above the article to remain compact, found ${defaultReaderStageChromeHeight}.`)
  }
  if (!(typeof defaultReaderSourceStripHeight === 'number' && defaultReaderSourceStripHeight <= 72)) {
    throw new Error(`Expected the Reader source strip to stay compact after the alignment pass, found ${defaultReaderSourceStripHeight}.`)
  }
  if (defaultWorkspaceInlineErrorVisible) {
    throw new Error('Expected the default Reader state to keep the global inline alert slab hidden.')
  }
  if (!sourceOpenDockPresent || !sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to expand normally during Stage 734.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook workbench expansion to remain intact during Stage 734.')
  }
  if (simplifiedViewAvailable) {
    if (simplifiedWorkspaceInlineErrorVisible) {
      throw new Error('Expected Simplified to keep generated-mode feedback inside the Reader deck.')
    }
    if (simplifiedDockPresent) {
      throw new Error('Expected Simplified at rest to keep the support seam inline, not reopen the dock by default.')
    }
    if (!simplifiedReaderSupportInlineVisible) {
      throw new Error('Expected Simplified to keep the inline support seam visible at rest.')
    }
    if (!simplifiedReaderHasArticle && !simplifiedReaderGeneratedEmptyStateVisible) {
      throw new Error('Expected Simplified to show either a generated article or an inline empty state.')
    }
    if (simplifiedReaderGeneratedEmptyStateVisible) {
      if (!simplifiedReaderCreateSimplifiedVisible) {
        throw new Error('Expected Simplified empty state to keep Create Simplified available.')
      }
      if (simplifiedReaderGeneratedEmptyStateErrorTone) {
        throw new Error('Expected Simplified empty state to read as a calm placeholder, not an error-toned alert.')
      }
    }
  }
  if (summaryWorkspaceInlineErrorVisible) {
    throw new Error('Expected Summary to keep generated-mode feedback inside the Reader deck.')
  }
  if (summaryDockPresent) {
    throw new Error('Expected Summary at rest to keep the support seam inline, not reopen the dock by default.')
  }
  if (!summaryReaderSupportInlineVisible) {
    throw new Error('Expected Summary to keep the inline support seam visible at rest.')
  }
  if (!summaryReaderHasArticle && !summaryReaderGeneratedEmptyStateVisible) {
    throw new Error('Expected Summary to show either a generated article or an inline empty state.')
  }
  if (summaryReaderGeneratedEmptyStateVisible) {
    if (!summaryReaderCreateSummaryVisible) {
      throw new Error('Expected Summary empty state to keep Create Summary available.')
    }
    if (summaryReaderGeneratedEmptyStateErrorTone) {
      throw new Error('Expected Summary empty state to read as a calm placeholder, not an error-toned alert.')
    }
  }
  if (!summarySummaryDetailInlineVisible) {
    throw new Error('Expected Summary detail controls to remain inline during Stage 734.')
  }

  await writeFile(
    path.join(outputDir, 'stage734-reader-compact-chrome-alignment-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The reader-active source strip should align to the same compact band as the control ribbon and resting deck.',
          'Compact Reader chrome should stay legible without reopening the old wide strip above the deck.',
          'Source-open, Notebook-open, Simplified, and Summary states should remain deck-contained and route-safe.',
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
        path: path.join(outputDir, 'stage734-reader-compact-chrome-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        path: path.join(outputDir, 'stage734-reader-compact-chrome-regression-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
