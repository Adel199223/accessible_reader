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
const outputDir = process.env.RECALL_STAGE741_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE741_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE741_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE741_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE741_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE741_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage741-reader-idle-transport-compaction-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage741-reader-idle-transport-compaction-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage741',
  })

  const {
    defaultAvailableModes,
    defaultDockPresent,
    defaultReaderArticleTop,
    defaultReaderControlRibbonWidthRatio,
    defaultReaderDeckWidthRatio,
    defaultReaderPrimaryTransportLabeledVisible,
    defaultReaderSourceNavTriggerVisible,
    defaultReaderSourceTabsVisible,
    defaultReaderStageChromeHeight,
    defaultReaderSupportInlineVisible,
    defaultReaderTransportProgressVisible,
    defaultReaderVisibleTransportButtonLabels,
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
    simplifiedReaderTransportProgressVisible,
    simplifiedReaderVisibleTransportButtonLabels,
    simplifiedViewAvailable,
    simplifiedWorkspaceInlineErrorVisible,
    summaryDockPresent,
    summaryReaderCreateSummaryVisible,
    summaryReaderGeneratedEmptyStateErrorTone,
    summaryReaderGeneratedEmptyStateVisible,
    summaryReaderHasArticle,
    summaryReaderPrimaryTransportLabeledVisible,
    summaryReaderSupportInlineVisible,
    summaryReaderTransportProgressVisible,
    summaryReaderVisibleTransportButtonLabels,
    summaryReaderVisibleViewLabels,
    summarySummaryDetailInlineVisible,
    summaryWorkspaceInlineErrorVisible,
  } = evidence.metrics

  const expectedDefaultViewLabels = orderedModes
    .filter((mode) => Array.isArray(defaultAvailableModes) && defaultAvailableModes.includes(mode))
    .map((mode) => modeLabelByValue[mode])

  if (!Array.isArray(defaultAvailableModes) || defaultAvailableModes.length === 0) {
    throw new Error('Expected the Stage 741 audit to resolve the default Reader document available modes.')
  }
  if (JSON.stringify(defaultReaderVisibleViewLabels) !== JSON.stringify(expectedDefaultViewLabels)) {
    throw new Error(
      `Expected the default Reader view strip to match available modes ${expectedDefaultViewLabels.join(', ')}, found ${Array.isArray(defaultReaderVisibleViewLabels) ? defaultReaderVisibleViewLabels.join(', ') : defaultReaderVisibleViewLabels}.`,
    )
  }
  if (defaultDockPresent) {
    throw new Error('Expected the default Reader state to keep the separate dock hidden in the Stage 741 audit.')
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
  if (JSON.stringify(defaultReaderVisibleTransportButtonLabels) !== JSON.stringify(['Start read aloud'])) {
    throw new Error(
      `Expected the idle Reader ribbon to keep only Start read aloud visible, found ${Array.isArray(defaultReaderVisibleTransportButtonLabels) ? defaultReaderVisibleTransportButtonLabels.join(', ') : defaultReaderVisibleTransportButtonLabels}.`,
    )
  }
  if (!defaultReaderPrimaryTransportLabeledVisible) {
    throw new Error('Expected the idle Reader ribbon to show a visible primary read-aloud label.')
  }
  if (defaultReaderTransportProgressVisible) {
    throw new Error('Expected idle sentence progress to stay out of the main Reader ribbon.')
  }
  if (defaultWorkspaceInlineErrorVisible) {
    throw new Error('Expected the default Reader state to keep the global inline alert slab hidden.')
  }
  if (!sourceOpenDockPresent || !sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to expand normally during the Stage 741 audit.')
  }
  if (!sourceOpenReaderSourceTabsVisible) {
    throw new Error('Expected expanded Source support to restore the fuller source-workspace tabs.')
  }
  if (sourceOpenReaderSourceNavTriggerVisible) {
    throw new Error('Expected the compact source-destination trigger to retire once Source support is expanded.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook workbench expansion to remain intact during the Stage 741 audit.')
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
    if (JSON.stringify(simplifiedReaderVisibleTransportButtonLabels) !== JSON.stringify(['Start read aloud'])) {
      throw new Error('Expected Simplified idle state to keep only the primary read-aloud transport visible.')
    }
    if (simplifiedReaderTransportProgressVisible) {
      throw new Error('Expected Simplified idle state to keep sentence progress out of the main ribbon.')
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
  if (JSON.stringify(summaryReaderVisibleViewLabels) !== JSON.stringify(['Original', 'Reflowed', 'Summary'])) {
    throw new Error(
      `Expected Summary-capable Reader state to keep Original, Reflowed, and Summary visible, found ${Array.isArray(summaryReaderVisibleViewLabels) ? summaryReaderVisibleViewLabels.join(', ') : summaryReaderVisibleViewLabels}.`,
    )
  }
  if (JSON.stringify(summaryReaderVisibleTransportButtonLabels) !== JSON.stringify(['Start read aloud'])) {
    throw new Error('Expected Summary idle state to keep only the primary read-aloud transport visible.')
  }
  if (!summaryReaderPrimaryTransportLabeledVisible) {
    throw new Error('Expected Summary idle state to keep the visible primary read-aloud label.')
  }
  if (summaryReaderTransportProgressVisible) {
    throw new Error('Expected Summary idle state to keep sentence progress out of the main ribbon.')
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
    throw new Error('Expected Summary detail controls to remain inline during the Stage 741 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage741-post-stage740-reader-idle-transport-compaction-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Default Reader should keep only one primary read-aloud control visible before playback starts.',
          'Idle sentence progress and the rest of the transport cluster should stay out of the main ribbon while generated-mode empty states remain reachable.',
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
        path: path.join(outputDir, 'stage741-reader-idle-transport-compaction-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        path: path.join(outputDir, 'stage741-reader-idle-transport-compaction-regression-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
