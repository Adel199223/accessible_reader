import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

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
await rm(path.join(outputDir, 'stage741-reader-control-ribbon-secondary-action-demotion-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage741-reader-control-ribbon-secondary-action-demotion-regression-failure.png'), { force: true })

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
    defaultReaderControlRibbonWidthRatio,
    defaultReaderDeckWidthRatio,
    defaultReaderOverflowActionLabels,
    defaultReaderPrimaryTransportLabeledVisible,
    defaultReaderSourceNavTriggerVisible,
    defaultReaderSourceTabsVisible,
    defaultReaderSupportInlineVisible,
    defaultReaderTransportProgressVisible,
    defaultReaderVisibleTransportButtonLabels,
    defaultReaderVisibleUtilityLabels,
    defaultReaderVisibleViewLabels,
    notebookOpenReaderSourceTabsVisible,
    notebookOpenWorkbenchVisible,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
    sourceOpenReaderSourceTabsVisible,
    summaryReaderCreateSummaryVisible,
    summaryReaderGeneratedEmptyStateVisible,
    summaryReaderVisibleViewLabels,
  } = evidence.metrics

  if (!Array.isArray(defaultAvailableModes) || defaultAvailableModes.length === 0) {
    throw new Error('Expected the Stage 741 audit to resolve the default Reader document available modes.')
  }
  if (JSON.stringify(defaultReaderVisibleViewLabels) !== JSON.stringify(['Original', 'Reflowed'])) {
    throw new Error(
      `Expected the default Reader mode strip to stay limited to Original and Reflowed, found ${Array.isArray(defaultReaderVisibleViewLabels) ? defaultReaderVisibleViewLabels.join(', ') : defaultReaderVisibleViewLabels}.`,
    )
  }
  if (JSON.stringify(summaryReaderVisibleViewLabels) !== JSON.stringify(['Original', 'Reflowed', 'Summary'])) {
    throw new Error(
      `Expected Summary-capable Reader state to keep Summary visible when supported, found ${Array.isArray(summaryReaderVisibleViewLabels) ? summaryReaderVisibleViewLabels.join(', ') : summaryReaderVisibleViewLabels}.`,
    )
  }
  if (!(typeof defaultReaderDeckWidthRatio === 'number' && defaultReaderDeckWidthRatio <= 0.8)) {
    throw new Error(`Expected the compact Reader deck to stay narrow, found ratio ${defaultReaderDeckWidthRatio}.`)
  }
  if (!(typeof defaultReaderControlRibbonWidthRatio === 'number' && defaultReaderControlRibbonWidthRatio <= 0.8)) {
    throw new Error(`Expected the Reader control ribbon to stay attached to the compact deck width, found ratio ${defaultReaderControlRibbonWidthRatio}.`)
  }
  if (!defaultReaderPrimaryTransportLabeledVisible) {
    throw new Error('Expected the idle Reader state to keep the primary transport labeled.')
  }
  if (defaultReaderTransportProgressVisible) {
    throw new Error('Expected the idle Reader state to keep the progress chip out of the main ribbon.')
  }
  if (JSON.stringify(defaultReaderVisibleTransportButtonLabels) !== JSON.stringify(['Start read aloud'])) {
    throw new Error(
      `Expected the idle Reader transport to keep only Start read aloud visible, found ${Array.isArray(defaultReaderVisibleTransportButtonLabels) ? defaultReaderVisibleTransportButtonLabels.join(', ') : defaultReaderVisibleTransportButtonLabels}.`,
    )
  }
  if (!Array.isArray(defaultReaderVisibleUtilityLabels) || !defaultReaderVisibleUtilityLabels.includes('Settings') || !defaultReaderVisibleUtilityLabels.includes('More reading controls')) {
    throw new Error('Expected the default Reader ribbon to keep Settings plus More reading controls visible.')
  }
  if (defaultReaderVisibleUtilityLabels.some((label) => ['Source', 'Notebook', 'Add note', 'Cancel note'].includes(label))) {
    throw new Error(
      `Expected secondary Reader actions to stay out of the main ribbon, found ${defaultReaderVisibleUtilityLabels.join(', ')}.`,
    )
  }
  if (defaultReaderSupportInlineVisible) {
    throw new Error('Expected the default Reader state to retire the inline support cluster from the main ribbon.')
  }
  if (!Array.isArray(defaultReaderOverflowActionLabels) || !defaultReaderOverflowActionLabels.includes('Source') || !defaultReaderOverflowActionLabels.includes('Notebook')) {
    throw new Error(
      `Expected the Reader overflow to expose Source and Notebook actions, found ${Array.isArray(defaultReaderOverflowActionLabels) ? defaultReaderOverflowActionLabels.join(', ') : defaultReaderOverflowActionLabels}.`,
    )
  }
  if (defaultReaderOverflowActionLabels.some((label) => label === 'Cancel note')) {
    throw new Error('Expected the idle Reader overflow to avoid note-capture cancel state at rest.')
  }
  if (defaultReaderSourceTabsVisible) {
    throw new Error('Expected the default Reader state to keep the fuller source-workspace tabs retired at rest.')
  }
  if (!defaultReaderSourceNavTriggerVisible) {
    throw new Error('Expected the compact source-destination menu trigger to remain visible.')
  }
  if (!sourceOpenReaderSourceLibraryVisible || !sourceOpenReaderSourceTabsVisible) {
    throw new Error('Expected Source support to remain reachable through overflow after the ribbon cleanup.')
  }
  if (!notebookOpenWorkbenchVisible || !notebookOpenReaderSourceTabsVisible) {
    throw new Error('Expected Notebook workbench access to remain reachable through overflow after the ribbon cleanup.')
  }
  if (!simplifiedViewAvailable && defaultReaderVisibleViewLabels.includes('Simplified')) {
    throw new Error('Expected Simplified to stay absent from the visible default mode strip when unavailable.')
  }
  if (summaryReaderGeneratedEmptyStateVisible && !summaryReaderCreateSummaryVisible) {
    throw new Error('Expected Summary empty state to keep Create Summary reachable.')
  }

  await writeFile(
    path.join(outputDir, 'stage741-post-stage740-reader-control-ribbon-secondary-action-demotion-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Default Reader keeps only the primary idle transport and compact utility affordances visible at rest.',
          'Source and Notebook quick access move into overflow without breaking their expanded workspaces or note capture.',
          'Summary availability, cross-surface regressions, and the compact Reader deck stay stable in the same live browser pass.',
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
        path: path.join(outputDir, 'stage741-reader-control-ribbon-secondary-action-demotion-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (regressionPage) {
    await regressionPage
      .screenshot({
        path: path.join(outputDir, 'stage741-reader-control-ribbon-secondary-action-demotion-regression-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await readerPage?.close().catch(() => undefined)
  await regressionPage?.close().catch(() => undefined)
  await browser.close()
}
