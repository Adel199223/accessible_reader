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

function hasRedundantReaderStripLabel(labels) {
  return labels.some((label) =>
    /\bviews?$/i.test(label) || /^(Original|Reflowed|Simplified|Summary) view$/i.test(label) || /saved notes?$/i.test(label),
  )
}

function hasNoteCountLabel(labels) {
  return labels.some((label) => /^\d+ notes?$/i.test(label))
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE743_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE743_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE743_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE743_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE743_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE743_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage743-reader-source-strip-metadata-deflation-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage743-reader-source-strip-metadata-deflation-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage743',
  })

  const {
    defaultAvailableModes,
    defaultDockPresent,
    defaultReaderControlRibbonWidthRatio,
    defaultReaderPrimaryTransportLabeledVisible,
    defaultReaderSourceNavTriggerVisible,
    defaultReaderSourceStripMetaLabels,
    defaultReaderSourceTabsVisible,
    defaultReaderTransportProgressVisible,
    defaultReaderVisibleTransportButtonLabels,
    defaultReaderVisibleViewLabels,
    notebookOpenWorkbenchVisible,
    sourceOpenDockPresent,
    sourceOpenReaderSourceLibraryVisible,
    sourceOpenReaderSourceTabsVisible,
    simplifiedReaderSourceStripMetaLabels,
    simplifiedViewAvailable,
    summaryReaderCreateSummaryVisible,
    summaryReaderGeneratedEmptyStateVisible,
    summaryReaderSourceStripMetaLabels,
    summaryReaderVisibleTransportButtonLabels,
    summaryReaderVisibleViewLabels,
  } = evidence.metrics

  const expectedDefaultViewLabels = orderedModes
    .filter((mode) => Array.isArray(defaultAvailableModes) && defaultAvailableModes.includes(mode))
    .map((mode) => modeLabelByValue[mode])

  if (!Array.isArray(defaultAvailableModes) || defaultAvailableModes.length === 0) {
    throw new Error('Expected the Stage 743 audit to resolve the default Reader document available modes.')
  }
  if (JSON.stringify(defaultReaderVisibleViewLabels) !== JSON.stringify(expectedDefaultViewLabels)) {
    throw new Error(
      `Expected the default Reader view strip to match available modes ${expectedDefaultViewLabels.join(', ')}, found ${Array.isArray(defaultReaderVisibleViewLabels) ? defaultReaderVisibleViewLabels.join(', ') : defaultReaderVisibleViewLabels}.`,
    )
  }
  if (defaultDockPresent) {
    throw new Error('Expected the default Reader state to keep the separate dock hidden in the Stage 743 audit.')
  }
  if (defaultReaderSourceTabsVisible) {
    throw new Error('Expected the default Reader state to keep the cross-surface tab row retired at rest.')
  }
  if (!defaultReaderSourceNavTriggerVisible) {
    throw new Error('Expected the default Reader state to keep the compact source-destination menu trigger visible.')
  }
  if (JSON.stringify(defaultReaderVisibleTransportButtonLabels) !== JSON.stringify(['Start read aloud'])) {
    throw new Error('Expected the idle Reader ribbon to keep only Start read aloud visible.')
  }
  if (!defaultReaderPrimaryTransportLabeledVisible) {
    throw new Error('Expected the idle Reader ribbon to keep the visible primary read-aloud label.')
  }
  if (defaultReaderTransportProgressVisible) {
    throw new Error('Expected idle sentence progress to stay out of the main Reader ribbon.')
  }
  if (!(typeof defaultReaderControlRibbonWidthRatio === 'number' && defaultReaderControlRibbonWidthRatio <= 0.8)) {
    throw new Error(`Expected the Reader control ribbon to stay attached to the compact deck width, found ratio ${defaultReaderControlRibbonWidthRatio}.`)
  }
  if (!Array.isArray(defaultReaderSourceStripMetaLabels) || defaultReaderSourceStripMetaLabels.length === 0) {
    throw new Error('Expected the default Reader source strip to expose a visible metadata summary.')
  }
  if (defaultReaderSourceStripMetaLabels.length > 2) {
    throw new Error(`Expected the default Reader source strip metadata to stay lean, found ${defaultReaderSourceStripMetaLabels.join(', ')}.`)
  }
  if (hasRedundantReaderStripLabel(defaultReaderSourceStripMetaLabels)) {
    throw new Error(`Expected the default Reader source strip to retire redundant view metadata, found ${defaultReaderSourceStripMetaLabels.join(', ')}.`)
  }
  if (!hasNoteCountLabel(defaultReaderSourceStripMetaLabels)) {
    throw new Error(`Expected the default Reader source strip to keep a concise note count, found ${defaultReaderSourceStripMetaLabels.join(', ')}.`)
  }
  if (!sourceOpenDockPresent || !sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to expand normally during the Stage 743 audit.')
  }
  if (!sourceOpenReaderSourceTabsVisible) {
    throw new Error('Expected expanded Source support to restore the fuller source-workspace tabs.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook workbench expansion to remain intact during the Stage 743 audit.')
  }
  if (JSON.stringify(summaryReaderVisibleViewLabels) !== JSON.stringify(['Original', 'Reflowed', 'Summary'])) {
    throw new Error('Expected Summary-capable Reader state to keep Original, Reflowed, and Summary visible.')
  }
  if (JSON.stringify(summaryReaderVisibleTransportButtonLabels) !== JSON.stringify(['Start read aloud'])) {
    throw new Error('Expected Summary idle state to keep only the primary read-aloud transport visible.')
  }
  if (!Array.isArray(summaryReaderSourceStripMetaLabels) || summaryReaderSourceStripMetaLabels.length === 0) {
    throw new Error('Expected Summary-capable Reader state to keep a visible source-strip metadata summary.')
  }
  if (summaryReaderSourceStripMetaLabels.length > 2) {
    throw new Error(`Expected Summary source-strip metadata to stay lean, found ${summaryReaderSourceStripMetaLabels.join(', ')}.`)
  }
  if (hasRedundantReaderStripLabel(summaryReaderSourceStripMetaLabels)) {
    throw new Error(`Expected Summary source-strip metadata to retire redundant view labels, found ${summaryReaderSourceStripMetaLabels.join(', ')}.`)
  }
  if (!hasNoteCountLabel(summaryReaderSourceStripMetaLabels)) {
    throw new Error(`Expected Summary source-strip metadata to keep a concise note count, found ${summaryReaderSourceStripMetaLabels.join(', ')}.`)
  }
  if (!summaryReaderGeneratedEmptyStateVisible && !summaryReaderCreateSummaryVisible) {
    throw new Error('Expected Summary state to keep either the generated article or the inline Summary action visible.')
  }
  if (simplifiedViewAvailable) {
    if (!Array.isArray(simplifiedReaderSourceStripMetaLabels) || simplifiedReaderSourceStripMetaLabels.length === 0) {
      throw new Error('Expected Simplified-capable Reader state to keep a visible source-strip metadata summary.')
    }
    if (simplifiedReaderSourceStripMetaLabels.length > 2) {
      throw new Error(`Expected Simplified source-strip metadata to stay lean, found ${simplifiedReaderSourceStripMetaLabels.join(', ')}.`)
    }
    if (hasRedundantReaderStripLabel(simplifiedReaderSourceStripMetaLabels)) {
      throw new Error(`Expected Simplified source-strip metadata to retire redundant view labels, found ${simplifiedReaderSourceStripMetaLabels.join(', ')}.`)
    }
  }

  await writeFile(
    path.join(outputDir, 'stage743-post-stage742-reader-source-strip-metadata-deflation-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Default Reader source-strip metadata should retire redundant view-count and current-view chips.',
          'Reader source-strip metadata should stay lean in generated-capable states without regressing the compact reading band.',
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
        path: path.join(outputDir, 'stage743-reader-source-strip-metadata-deflation-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        path: path.join(outputDir, 'stage743-reader-source-strip-metadata-deflation-regression-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
