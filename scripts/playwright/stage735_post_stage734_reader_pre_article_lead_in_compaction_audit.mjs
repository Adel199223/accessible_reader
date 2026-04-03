import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE735_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE735_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE735_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE735_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE735_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE735_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage735-reader-lead-in-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage735-reader-lead-in-audit-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage735',
  })

  const {
    defaultDockPresent,
    defaultReaderArticleTop,
    defaultReaderControlRibbonWidthRatio,
    defaultReaderDeckWidthRatio,
    defaultReaderSourceStripCompact,
    defaultReaderSourceStripHeight,
    defaultReaderSourceStripShellWidthRatio,
    defaultReaderStageChromeHeight,
    defaultReaderSupportInlineVisible,
    defaultWorkspaceInlineErrorVisible,
    sourceOpenDockPresent,
    sourceOpenReaderSourceLibraryVisible,
    sourceOpenReaderSourceStripCompact,
    sourceOpenReaderSourceStripShellWidthRatio,
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

  if (defaultDockPresent) {
    throw new Error('Expected the default Reader state to keep the separate dock hidden in the lead-in audit.')
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
  if (!defaultReaderSourceStripCompact) {
    throw new Error('Expected the default Reader source strip shell to use the compact at-rest presentation.')
  }
  if (!(typeof defaultReaderSourceStripShellWidthRatio === 'number' && defaultReaderSourceStripShellWidthRatio <= 0.8)) {
    throw new Error(`Expected the default Reader source strip shell to stay compact-width, found ratio ${defaultReaderSourceStripShellWidthRatio}.`)
  }
  if (!(typeof defaultReaderArticleTop === 'number' && defaultReaderArticleTop <= 235)) {
    throw new Error(`Expected the article to keep its early start, found top ${defaultReaderArticleTop}.`)
  }
  if (!(typeof defaultReaderStageChromeHeight === 'number' && defaultReaderStageChromeHeight <= 50)) {
    throw new Error(`Expected the Reader chrome above the article to remain compact, found ${defaultReaderStageChromeHeight}.`)
  }
  if (!(typeof defaultReaderSourceStripHeight === 'number' && defaultReaderSourceStripHeight <= 66)) {
    throw new Error(`Expected the Reader source strip to remain compact, found ${defaultReaderSourceStripHeight}.`)
  }
  if (defaultWorkspaceInlineErrorVisible) {
    throw new Error('Expected the default Reader state to keep the global inline alert slab hidden.')
  }
  if (!sourceOpenDockPresent || !sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to expand normally during the lead-in audit.')
  }
  if (sourceOpenReaderSourceStripCompact) {
    throw new Error('Expected the source strip shell to leave compact at-rest mode once Source support is expanded.')
  }
  if (!(typeof sourceOpenReaderSourceStripShellWidthRatio === 'number' && sourceOpenReaderSourceStripShellWidthRatio >= 0.95)) {
    throw new Error(`Expected expanded Source support to restore the full-width source strip shell, found ratio ${sourceOpenReaderSourceStripShellWidthRatio}.`)
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook workbench expansion to remain intact during the lead-in audit.')
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
    throw new Error('Expected Summary detail controls to remain inline during the Reader lead-in audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage735-post-stage734-reader-pre-article-lead-in-compaction-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Default Reader should keep the compact deck and inline support seam while the source strip shell now matches that compact lead-in width.',
          'Expanded Source and Notebook states should still widen into the attached support rail without route regressions.',
          'Generated empty states should stay calm and inline while Home, Graph, embedded Notebook, and Study remain stable.',
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
        path: path.join(outputDir, 'stage735-reader-lead-in-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        path: path.join(outputDir, 'stage735-reader-lead-in-audit-regression-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
