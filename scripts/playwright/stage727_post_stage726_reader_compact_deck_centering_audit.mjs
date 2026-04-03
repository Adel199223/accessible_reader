import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE727_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE727_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE727_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE727_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE727_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE727_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage727-reader-compact-deck-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage727-reader-compact-deck-audit-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage727',
  })

  const {
    defaultArticleFieldCenteredOffset,
    defaultArticleFieldPresent,
    defaultDockToArticleWidthRatio,
    defaultReaderArticleTop,
    defaultReaderContentHeadingCount,
    defaultReaderControlRibbonCenteredOffset,
    defaultReaderControlRibbonWidthRatio,
    defaultReaderDeckCenteredOffset,
    defaultReaderDeckCompact,
    defaultReaderDeckWidthRatio,
    defaultReaderSourceLibraryVisible,
    defaultReaderSourceStripFramedAtRest,
    defaultReaderSourceStripHeadingVisible,
    defaultReaderSourceStripHeight,
    defaultReaderStageChromeHeight,
    defaultReaderStageHeadingVisible,
    defaultReaderStageMetadataIncludesView,
    defaultReaderStageSettingsLabelVisible,
    defaultReaderStageStripLabelsVisible,
    defaultReaderStageUtilityRowPresent,
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
    sourceOpenDockToArticleWidthRatio,
    sourceOpenReaderSourceLibraryVisible,
    sourceOpenReaderSupportFootnoteVisible,
    sourceOpenReaderSupportGlanceVisible,
    sourceOpenReaderSupportLegacyHeadingVisible,
    sourceOpenReaderSupportMetaChipCount,
    summaryReaderCreateSummaryVisible,
    summaryReaderHasArticle,
    summaryReaderSummaryArticleContainsSnippet,
    summaryReaderSummaryContextContainsSnippet,
    summarySummaryDetailInlineVisible,
  } = evidence.metrics

  if (defaultReaderStageHeadingVisible) {
    throw new Error('Expected the Reader-stage title seam to remain retired after compact deck centering.')
  }
  if (!defaultReaderSourceStripHeadingVisible) {
    throw new Error('Expected the Reader-active source strip to remain the one visible document title seam.')
  }
  if (defaultReaderContentHeadingCount !== 1) {
    throw new Error(`Expected exactly one visible heading for the active Reader document, found ${defaultReaderContentHeadingCount}.`)
  }
  if (defaultReaderStageUtilityRowPresent) {
    throw new Error('Expected the separate Reader utility row to remain retired at rest.')
  }
  if (defaultReaderStageStripLabelsVisible) {
    throw new Error('Expected visible View / Read aloud strip labels to remain hidden at rest.')
  }
  if (defaultReaderStageSettingsLabelVisible) {
    throw new Error('Expected the Settings control to stay icon-first at rest.')
  }
  if (defaultReaderStageMetadataIncludesView) {
    throw new Error('Expected the current Reader view to stay out of the metadata chips.')
  }
  if (!(defaultReaderSourceStripHeight <= 60)) {
    throw new Error(`Expected the Reader source strip to stay compact, found ${defaultReaderSourceStripHeight}.`)
  }
  if (defaultReaderSourceStripFramedAtRest) {
    throw new Error('Expected the Reader-active source strip to remain flat and attached at rest.')
  }
  if (!(typeof defaultReaderStageChromeHeight === 'number' && defaultReaderStageChromeHeight <= 80)) {
    throw new Error(`Expected Reader chrome above the article to remain compressed, found ${defaultReaderStageChromeHeight}.`)
  }
  if (!(typeof defaultReaderArticleTop === 'number' && defaultReaderArticleTop <= 270)) {
    throw new Error(`Expected the article to stay high on the page after compact deck centering, found top ${defaultReaderArticleTop}.`)
  }
  if (defaultStageHasCardClass || defaultStageUsesPriorityShellClass || defaultStageFramedAtRest) {
    throw new Error('Expected the quiet Reader outer stage to remain unframed after compact deck centering.')
  }
  if (!defaultSupportCollapsed || defaultReaderSourceLibraryVisible) {
    throw new Error('Expected the compact support seam to remain collapsed at rest with Source content hidden.')
  }
  if (!(typeof defaultDockToArticleWidthRatio === 'number' && defaultDockToArticleWidthRatio <= 0.12)) {
    throw new Error(`Expected the compact support seam to remain slim, found ratio ${defaultDockToArticleWidthRatio}.`)
  }
  if (!defaultReaderDeckCompact) {
    throw new Error('Expected the default Reader state to stay in the compact deck layout.')
  }
  if (!(typeof defaultReaderDeckWidthRatio === 'number' && defaultReaderDeckWidthRatio <= 0.82)) {
    throw new Error(
      `Expected the compact Reader deck to stay materially narrower than the full stage, found ratio ${defaultReaderDeckWidthRatio}.`,
    )
  }
  if (!(typeof defaultReaderDeckCenteredOffset === 'number' && defaultReaderDeckCenteredOffset <= 24)) {
    throw new Error(
      `Expected the compact Reader deck to stay visually centered, found offset ${defaultReaderDeckCenteredOffset}.`,
    )
  }
  if (!(typeof defaultReaderControlRibbonWidthRatio === 'number' && defaultReaderControlRibbonWidthRatio <= 0.84)) {
    throw new Error(
      `Expected the Reader control ribbon to stay attached to the compact deck width, found ratio ${defaultReaderControlRibbonWidthRatio}.`,
    )
  }
  if (!(typeof defaultReaderControlRibbonCenteredOffset === 'number' && defaultReaderControlRibbonCenteredOffset <= 24)) {
    throw new Error(
      `Expected the Reader control ribbon to stay visually centered with the compact deck, found offset ${defaultReaderControlRibbonCenteredOffset}.`,
    )
  }
  if (!defaultArticleFieldPresent) {
    throw new Error('Expected the centered article field to remain present.')
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
  if (!(typeof sourceOpenDockToArticleWidthRatio === 'number' && sourceOpenDockToArticleWidthRatio <= 0.32)) {
    throw new Error(`Expected the expanded Source support rail to stay attached and light, found ratio ${sourceOpenDockToArticleWidthRatio}.`)
  }
  if (!(sourceOpenReaderSupportMetaChipCount <= 2)) {
    throw new Error(`Expected expanded Source support to keep at most two summary chips, found ${sourceOpenReaderSupportMetaChipCount}.`)
  }
  if (sourceOpenReaderSupportLegacyHeadingVisible) {
    throw new Error('Expected the expanded Source rail to keep the legacy Active source heading retired.')
  }
  if (sourceOpenReaderSupportGlanceVisible) {
    throw new Error('Expected the expanded Source rail to keep the legacy glance card retired.')
  }
  if (sourceOpenReaderSupportFootnoteVisible) {
    throw new Error('Expected the expanded Source rail to keep the legacy footer note retired.')
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
    path.join(outputDir, 'stage727-post-stage726-reader-compact-deck-centering-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Reader should keep the lighter Stage 725 Source support rail intact.',
          'The resting Reader deck should center into one compact reading band instead of stretching across the full stage.',
          'The control ribbon and compact support seam should stay attached to that centered deck.',
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
        path: path.join(outputDir, 'stage727-reader-compact-deck-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        path: path.join(outputDir, 'stage727-reader-compact-deck-audit-regression-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
