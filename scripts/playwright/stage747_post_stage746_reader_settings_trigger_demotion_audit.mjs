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
const requiredOverflowActions = ['Settings', 'Source', 'Notebook']

function includesActions(actions, expected) {
  return expected.every((label) => Array.isArray(actions) && actions.includes(label))
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE747_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE747_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE747_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE747_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE747_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE747_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage747-reader-settings-trigger-demotion-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage747-reader-settings-trigger-demotion-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage747',
  })

  const {
    defaultAvailableModes,
    defaultReaderOverflowActionLabels,
    defaultReaderSourceNavTriggerInlineInHeading,
    defaultReaderSourceNavTriggerText,
    defaultReaderSourceNavTriggerVisible,
    defaultReaderSourceStripShellWidthRatio,
    defaultReaderVisibleTransportButtonLabels,
    defaultReaderVisibleUtilityLabels,
    defaultReaderVisibleViewLabels,
    notebookOpenWorkbenchVisible,
    sourceOpenReaderSourceLibraryVisible,
    sourceOpenReaderSourceTabsVisible,
    simplifiedViewAvailable,
    summaryReaderCreateSummaryVisible,
    summaryReaderGeneratedEmptyStateVisible,
    summaryReaderVisibleTransportButtonLabels,
    summaryReaderVisibleUtilityLabels,
    summaryReaderVisibleViewLabels,
  } = evidence.metrics

  const expectedDefaultViewLabels = orderedModes
    .filter((mode) => Array.isArray(defaultAvailableModes) && defaultAvailableModes.includes(mode))
    .map((mode) => modeLabelByValue[mode])

  if (!Array.isArray(defaultAvailableModes) || defaultAvailableModes.length === 0) {
    throw new Error('Expected the Stage 747 audit to resolve the default Reader document available modes.')
  }
  if (JSON.stringify(defaultReaderVisibleViewLabels) !== JSON.stringify(expectedDefaultViewLabels)) {
    throw new Error(
      `Expected the default Reader view strip to match available modes ${expectedDefaultViewLabels.join(', ')}, found ${Array.isArray(defaultReaderVisibleViewLabels) ? defaultReaderVisibleViewLabels.join(', ') : defaultReaderVisibleViewLabels}.`,
    )
  }
  if (JSON.stringify(defaultReaderVisibleTransportButtonLabels) !== JSON.stringify(['Start read aloud'])) {
    throw new Error('Expected the idle Reader ribbon to keep only Start read aloud visible.')
  }
  if (JSON.stringify(defaultReaderVisibleUtilityLabels) !== JSON.stringify(['More reading controls'])) {
    throw new Error(
      `Expected the default Reader ribbon to keep only the overflow visible beside the primary transport, found ${Array.isArray(defaultReaderVisibleUtilityLabels) ? defaultReaderVisibleUtilityLabels.join(', ') : defaultReaderVisibleUtilityLabels}.`,
    )
  }
  if (!includesActions(defaultReaderOverflowActionLabels, requiredOverflowActions)) {
    throw new Error(
      `Expected the default Reader overflow to keep ${requiredOverflowActions.join(', ')} reachable, found ${Array.isArray(defaultReaderOverflowActionLabels) ? defaultReaderOverflowActionLabels.join(', ') : defaultReaderOverflowActionLabels}.`,
    )
  }
  if (!defaultReaderSourceNavTriggerVisible) {
    throw new Error('Expected the compact source-strip trigger to remain visible after the Stage 746 cleanup.')
  }
  if (defaultReaderSourceNavTriggerText !== 'Source') {
    throw new Error(`Expected the compact source-strip trigger to keep reading Source, found ${defaultReaderSourceNavTriggerText}.`)
  }
  if (!defaultReaderSourceNavTriggerInlineInHeading) {
    throw new Error('Expected the compact source-strip trigger to stay attached to the source identity seam.')
  }
  if (!(typeof defaultReaderSourceStripShellWidthRatio === 'number' && defaultReaderSourceStripShellWidthRatio <= 0.8)) {
    throw new Error(
      `Expected the compact Reader source strip to stay attached to the reading-band width, found ratio ${defaultReaderSourceStripShellWidthRatio}.`,
    )
  }
  if (!sourceOpenReaderSourceLibraryVisible || !sourceOpenReaderSourceTabsVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 747 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 747 audit.')
  }
  if (JSON.stringify(summaryReaderVisibleViewLabels) !== JSON.stringify(['Original', 'Reflowed', 'Summary'])) {
    throw new Error('Expected Summary-capable Reader state to keep Original, Reflowed, and Summary visible.')
  }
  if (JSON.stringify(summaryReaderVisibleTransportButtonLabels) !== JSON.stringify(['Start read aloud'])) {
    throw new Error('Expected Summary idle state to keep only the primary read-aloud transport visible.')
  }
  if (JSON.stringify(summaryReaderVisibleUtilityLabels) !== JSON.stringify(['More reading controls'])) {
    throw new Error(
      `Expected Summary idle state to keep only the overflow visible beside the primary transport, found ${Array.isArray(summaryReaderVisibleUtilityLabels) ? summaryReaderVisibleUtilityLabels.join(', ') : summaryReaderVisibleUtilityLabels}.`,
    )
  }
  if (!summaryReaderGeneratedEmptyStateVisible && !summaryReaderCreateSummaryVisible) {
    throw new Error('Expected Summary state to keep either the generated article or the inline Summary action visible.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected the live Stage 747 dataset to keep Simplified unavailable, but it was present during audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage747-post-stage746-reader-settings-trigger-demotion-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Default Reader should show only the primary read-aloud action plus one overflow trigger at rest.',
          'Overflow should keep Settings alongside Source and Notebook so the active ribbon stays quieter without cutting off support access.',
          'Source-open, Notebook-open, Summary-capable, and regression-surface flows should remain stable in the same live browser pass.',
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
        path: path.join(outputDir, 'stage747-reader-settings-trigger-demotion-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        path: path.join(outputDir, 'stage747-reader-settings-trigger-demotion-regression-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
