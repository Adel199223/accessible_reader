import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE729_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE729_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE729_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE729_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE729_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE729_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage729-reader-attached-support-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage729-reader-attached-support-audit-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage729',
  })

  const {
    defaultArticleFieldCenteredOffset,
    defaultArticleFieldPresent,
    defaultDockPresent,
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
    defaultReaderStageMetadataRowVisible,
    defaultReaderStageSettingsLabelVisible,
    defaultReaderStageStripLabelsVisible,
    defaultReaderStageUtilityRowPresent,
    defaultReaderSupportCopyVisibleAtRest,
    defaultReaderSupportInlineVisible,
    defaultReaderSupportMetaChipCount,
    defaultReaderSupportTabLabelsVisible,
    defaultStageFramedAtRest,
    defaultStageHasCardClass,
    defaultStageUsesPriorityShellClass,
    defaultSupportCollapsed,
    defaultSupportToggleVisible,
    notebookOpenDockExpanded,
    notebookOpenDockPresent,
    notebookOpenWorkbenchVisible,
    sourceOpenDockExpanded,
    sourceOpenDockPresent,
    sourceOpenDockToArticleWidthRatio,
    sourceOpenReaderSourceLibraryVisible,
    sourceOpenReaderSupportFootnoteVisible,
    sourceOpenReaderSupportGlanceVisible,
    sourceOpenReaderSupportLegacyHeadingVisible,
    sourceOpenReaderSupportMetaChipCount,
    summaryDockPresent,
    summaryReaderCreateSummaryVisible,
    summaryReaderHasArticle,
    summaryReaderSupportInlineVisible,
    summaryReaderSummaryArticleContainsSnippet,
    summaryReaderSummaryContextContainsSnippet,
    summarySummaryDetailInlineVisible,
  } = evidence.metrics

  if (defaultReaderStageHeadingVisible) {
    throw new Error('Expected the Reader-stage title seam to stay retired after the attached support-band fusion.')
  }
  if (!defaultReaderSourceStripHeadingVisible) {
    throw new Error('Expected the Reader-active source strip to remain the single visible document title seam.')
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
    throw new Error('Expected the Settings control to remain icon-first at rest.')
  }
  if (defaultReaderStageMetadataRowVisible || defaultReaderStageMetadataIncludesView) {
    throw new Error('Expected the Reader metadata row to stay retired in the attached support-band state.')
  }
  if (!(typeof defaultReaderSourceStripHeight === 'number' && defaultReaderSourceStripHeight <= 60)) {
    throw new Error(`Expected the Reader source strip to stay compact, found ${defaultReaderSourceStripHeight}.`)
  }
  if (defaultReaderSourceStripFramedAtRest) {
    throw new Error('Expected the Reader source strip to stay flat and attached at rest.')
  }
  if (!(typeof defaultReaderStageChromeHeight === 'number' && defaultReaderStageChromeHeight <= 50)) {
    throw new Error(`Expected the attached Reader chrome to stay extremely compact, found ${defaultReaderStageChromeHeight}.`)
  }
  if (!(typeof defaultReaderArticleTop === 'number' && defaultReaderArticleTop <= 235)) {
    throw new Error(`Expected the article to start early after support-band fusion, found top ${defaultReaderArticleTop}.`)
  }
  if (defaultStageHasCardClass || defaultStageUsesPriorityShellClass || defaultStageFramedAtRest) {
    throw new Error('Expected the quiet Reader outer stage to remain unframed after support-band fusion.')
  }
  if (defaultDockPresent) {
    throw new Error('Expected no separate Reader dock to exist at rest after fusing support into the control band.')
  }
  if (!defaultSupportCollapsed || defaultReaderSourceLibraryVisible) {
    throw new Error('Expected the default Reader state to keep support collapsed with Source content hidden.')
  }
  if (!defaultReaderSupportInlineVisible) {
    throw new Error('Expected the attached inline Source / Notebook support cluster to be visible at rest.')
  }
  if (defaultSupportToggleVisible) {
    throw new Error('Expected no separate dock toggle to remain visible in the fused resting state.')
  }
  if (!defaultReaderDeckCompact) {
    throw new Error('Expected the default Reader state to remain in the compact deck layout.')
  }
  if (!(typeof defaultReaderDeckWidthRatio === 'number' && defaultReaderDeckWidthRatio <= 0.8)) {
    throw new Error(`Expected the compact Reader deck to stay narrow, found ratio ${defaultReaderDeckWidthRatio}.`)
  }
  if (!(typeof defaultReaderDeckCenteredOffset === 'number' && defaultReaderDeckCenteredOffset <= 24)) {
    throw new Error(`Expected the compact Reader deck to stay visually centered, found offset ${defaultReaderDeckCenteredOffset}.`)
  }
  if (!(typeof defaultReaderControlRibbonWidthRatio === 'number' && defaultReaderControlRibbonWidthRatio <= 0.8)) {
    throw new Error(
      `Expected the control ribbon to stay attached to the compact deck width, found ratio ${defaultReaderControlRibbonWidthRatio}.`,
    )
  }
  if (!(typeof defaultReaderControlRibbonCenteredOffset === 'number' && defaultReaderControlRibbonCenteredOffset <= 24)) {
    throw new Error(
      `Expected the control ribbon to stay centered with the compact deck, found offset ${defaultReaderControlRibbonCenteredOffset}.`,
    )
  }
  if (!defaultArticleFieldPresent) {
    throw new Error('Expected the centered article field to remain present.')
  }
  if (!(typeof defaultArticleFieldCenteredOffset === 'number' && defaultArticleFieldCenteredOffset <= 18)) {
    throw new Error(`Expected the article field to remain visually centered, found offset ${defaultArticleFieldCenteredOffset}.`)
  }
  if (defaultReaderSupportCopyVisibleAtRest) {
    throw new Error('Expected no explanatory support copy to remain visible in the attached support cluster.')
  }
  if (!(defaultReaderSupportMetaChipCount <= 2)) {
    throw new Error(`Expected the attached support cluster to keep at most two meta chips, found ${defaultReaderSupportMetaChipCount}.`)
  }
  if (defaultReaderSupportTabLabelsVisible) {
    throw new Error('Expected the attached support cluster to keep Source / Notebook labels hidden at rest.')
  }
  if (!sourceOpenDockPresent || !sourceOpenDockExpanded || !sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to expand on demand and reveal the source library.')
  }
  if (!(typeof sourceOpenDockToArticleWidthRatio === 'number' && sourceOpenDockToArticleWidthRatio <= 0.3)) {
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
  if (!notebookOpenDockPresent || !notebookOpenDockExpanded || !notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to expand into the note workbench after note capture.')
  }
  if (summaryDockPresent) {
    throw new Error('Expected Summary mode to keep the dock fused into the inline support cluster at rest.')
  }
  if (!summaryReaderSupportInlineVisible) {
    throw new Error('Expected Summary mode to keep the inline support cluster visible at rest.')
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
    path.join(outputDir, 'stage729-post-stage728-reader-attached-support-band-fusion-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Reader should fuse the collapsed Source / Notebook support into the main attached control band at rest.',
          'The default Reader state should no longer expose a separate right-side mini-dock while preserving on-demand Source and Notebook expansion.',
          'The compact deck should stay centered, early-reading, and visually quiet after the support-band fusion.',
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
        path: path.join(outputDir, 'stage729-reader-attached-support-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        path: path.join(outputDir, 'stage729-reader-attached-support-audit-regression-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
