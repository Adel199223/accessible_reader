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
const outputDir = process.env.RECALL_STAGE749_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE749_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE749_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE749_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE749_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE749_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage749-reader-overflow-payload-deflation-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage749-reader-overflow-payload-deflation-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage749',
  })

  const {
    defaultAvailableModes,
    defaultReaderOverflowActionLabels,
    defaultReaderOverflowRateVisible,
    defaultReaderOverflowSentenceLabelVisible,
    defaultReaderOverflowShortcutHintVisible,
    defaultReaderOverflowVoiceVisible,
    defaultReaderSourceNavTriggerInlineInHeading,
    defaultReaderSourceNavTriggerText,
    defaultReaderSourceNavTriggerVisible,
    defaultReaderSourcePreviewText,
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
    summaryReaderOverflowActionLabels,
    summaryReaderOverflowRateVisible,
    summaryReaderOverflowSentenceLabelVisible,
    summaryReaderOverflowShortcutHintVisible,
    summaryReaderOverflowVoiceVisible,
    summaryReaderVisibleTransportButtonLabels,
    summaryReaderVisibleUtilityLabels,
    summaryReaderVisibleViewLabels,
  } = evidence.metrics

  const expectedDefaultViewLabels = orderedModes
    .filter((mode) => Array.isArray(defaultAvailableModes) && defaultAvailableModes.includes(mode))
    .map((mode) => modeLabelByValue[mode])

  if (!Array.isArray(defaultAvailableModes) || defaultAvailableModes.length === 0) {
    throw new Error('Expected the Stage 749 audit to resolve the default Reader document available modes.')
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
  if (!defaultReaderOverflowVoiceVisible || !defaultReaderOverflowRateVisible) {
    throw new Error('Expected the default Reader overflow to keep voice and rate controls visible.')
  }
  if (defaultReaderOverflowSentenceLabelVisible) {
    throw new Error('Expected the default Reader overflow to drop the passive sentence-progress chip.')
  }
  if (defaultReaderOverflowShortcutHintVisible) {
    throw new Error('Expected the default Reader overflow to drop the passive shortcut sentence.')
  }
  if (!defaultReaderSourceNavTriggerVisible) {
    throw new Error('Expected the compact source-strip trigger to remain visible after the Stage 748 cleanup.')
  }
  if (defaultReaderSourceNavTriggerText !== 'Source') {
    throw new Error(`Expected the compact source-strip trigger to keep reading Source, found ${defaultReaderSourceNavTriggerText}.`)
  }
  if (!defaultReaderSourceNavTriggerInlineInHeading) {
    throw new Error('Expected the compact source-strip trigger to stay attached to the source identity seam.')
  }
  if (defaultReaderSourcePreviewText === 'Local source') {
    throw new Error('Expected the compact Reader source strip to retire the generic Local source fallback copy.')
  }
  if (!(typeof defaultReaderSourceStripShellWidthRatio === 'number' && defaultReaderSourceStripShellWidthRatio <= 0.8)) {
    throw new Error(
      `Expected the compact Reader source strip to stay attached to the reading-band width, found ratio ${defaultReaderSourceStripShellWidthRatio}.`,
    )
  }
  if (!sourceOpenReaderSourceLibraryVisible || !sourceOpenReaderSourceTabsVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 749 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 749 audit.')
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
  if (!includesActions(summaryReaderOverflowActionLabels, requiredOverflowActions)) {
    throw new Error(
      `Expected the Summary Reader overflow to keep ${requiredOverflowActions.join(', ')} reachable, found ${Array.isArray(summaryReaderOverflowActionLabels) ? summaryReaderOverflowActionLabels.join(', ') : summaryReaderOverflowActionLabels}.`,
    )
  }
  if (!summaryReaderOverflowVoiceVisible || !summaryReaderOverflowRateVisible) {
    throw new Error('Expected the Summary Reader overflow to keep voice and rate controls visible.')
  }
  if (summaryReaderOverflowSentenceLabelVisible) {
    throw new Error('Expected the Summary Reader overflow to drop the passive sentence-progress chip.')
  }
  if (summaryReaderOverflowShortcutHintVisible) {
    throw new Error('Expected the Summary Reader overflow to drop the passive shortcut sentence.')
  }
  if (!summaryReaderGeneratedEmptyStateVisible && !summaryReaderCreateSummaryVisible) {
    throw new Error('Expected Summary state to keep either the generated article or the inline Summary action visible.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected the live Stage 749 dataset to keep Simplified unavailable, but it was present during audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage749-post-stage748-reader-overflow-payload-deflation-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Default Reader should keep the overflow down to actionable controls only.',
          'The compact Reader source strip should retire the generic Local source fallback when it adds no new information.',
          'The overflow should preserve Settings, Source, Notebook, voice, and rate while retiring passive sentence and shortcut copy in default and Summary states.',
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
        path: path.join(outputDir, 'stage749-reader-overflow-payload-deflation-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        path: path.join(outputDir, 'stage749-reader-overflow-payload-deflation-regression-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
