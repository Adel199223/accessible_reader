import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const modeLabelByValue = {
  original: 'Original',
  reflowed: 'Reflowed',
  simplified: 'Simplified',
  summary: 'Summary',
}

const orderedModes = ['original', 'reflowed', 'simplified', 'summary']

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE739_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE739_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE739_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE739_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE739_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE739_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage739-reader-generated-mode-affordance-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage739-reader-generated-mode-affordance-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage739',
  })

  const {
    defaultAvailableModes,
    defaultDockPresent,
    defaultReaderArticleTop,
    defaultReaderControlRibbonWidthRatio,
    defaultReaderDeckWidthRatio,
    defaultReaderSourceNavTriggerVisible,
    defaultReaderSourceTabsVisible,
    defaultReaderStageChromeHeight,
    defaultReaderSupportInlineVisible,
    defaultReaderVisibleViewLabels,
    defaultWorkspaceInlineErrorVisible,
    sourceOpenDockPresent,
    sourceOpenReaderSourceLibraryVisible,
    sourceOpenReaderSourceNavTriggerVisible,
    sourceOpenReaderSourceTabsVisible,
    notebookOpenWorkbenchVisible,
    notebookOpenReaderSourceTabsVisible,
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

  const expectedDefaultViewLabels = orderedModes
    .filter((mode) => Array.isArray(defaultAvailableModes) && defaultAvailableModes.includes(mode))
    .map((mode) => modeLabelByValue[mode])

  if (!Array.isArray(defaultAvailableModes) || defaultAvailableModes.length === 0) {
    throw new Error('Expected the Stage 739 audit to resolve the default Reader document available modes.')
  }
  if (JSON.stringify(defaultReaderVisibleViewLabels) !== JSON.stringify(expectedDefaultViewLabels)) {
    throw new Error(
      `Expected the default Reader view strip to match available modes ${expectedDefaultViewLabels.join(', ')}, found ${Array.isArray(defaultReaderVisibleViewLabels) ? defaultReaderVisibleViewLabels.join(', ') : defaultReaderVisibleViewLabels}.`,
    )
  }
  if (defaultDockPresent) {
    throw new Error('Expected the default Reader state to keep the separate dock hidden in the Stage 739 audit.')
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
  if (defaultReaderSourceTabsVisible) {
    throw new Error('Expected the default Reader state to keep the cross-surface tab row retired at rest.')
  }
  if (!defaultReaderSourceNavTriggerVisible) {
    throw new Error('Expected the default Reader state to keep the compact source-destination menu trigger visible.')
  }
  if (!(typeof defaultReaderArticleTop === 'number' && defaultReaderArticleTop <= 235)) {
    throw new Error(`Expected the article to keep its early start, found top ${defaultReaderArticleTop}.`)
  }
  if (!(typeof defaultReaderStageChromeHeight === 'number' && defaultReaderStageChromeHeight <= 50)) {
    throw new Error(`Expected the Reader chrome above the article to remain compact, found ${defaultReaderStageChromeHeight}.`)
  }
  if (defaultWorkspaceInlineErrorVisible) {
    throw new Error('Expected the default Reader state to keep the global inline alert slab hidden.')
  }
  if (!sourceOpenDockPresent || !sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to expand normally during the Stage 739 audit.')
  }
  if (!sourceOpenReaderSourceTabsVisible) {
    throw new Error('Expected expanded Source support to restore the fuller source-workspace tabs.')
  }
  if (sourceOpenReaderSourceNavTriggerVisible) {
    throw new Error('Expected the compact source-destination trigger to retire once Source support is expanded.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook workbench expansion to remain intact during the Stage 739 audit.')
  }
  if (!notebookOpenReaderSourceTabsVisible) {
    throw new Error('Expected expanded Notebook support to keep the fuller source-workspace tabs visible.')
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
    throw new Error('Expected Summary detail controls to remain inline during the Stage 739 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage739-post-stage738-reader-generated-mode-affordance-cleanup-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          "Default Reader should only show the current document's real available modes in the main mode strip.",
          'Unavailable AI modes should stop consuming visible top-ribbon pills while generated empty states remain reachable when a generated mode is actually supported.',
          'Source-open, Notebook-open, and cross-surface regression behavior should remain stable in the same live browser pass.',
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
        path: path.join(outputDir, 'stage739-reader-generated-mode-affordance-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        path: path.join(outputDir, 'stage739-reader-generated-mode-affordance-regression-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
