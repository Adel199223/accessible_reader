import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const maxOverflowPanelWidth = 292
const maxOverflowPanelHeight = 210
const requiredOverflowActions = []
const requiredThemeChoices = ['Light', 'Dark']

function matchesItems(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected)
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE759_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE759_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE759_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE759_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE759_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE759_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage759-reader-overflow-footprint-compaction-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage759-reader-overflow-footprint-compaction-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage759',
  })

  const {
    defaultAvailableModes,
    defaultReaderOverflowActionLabels,
    defaultReaderOverflowPanelHeight,
    defaultReaderOverflowPanelWidth,
    defaultReaderOverflowRateVisible,
    defaultReaderOverflowSentenceLabelVisible,
    defaultReaderOverflowShortcutHintVisible,
    defaultReaderOverflowThemeChoiceLabels,
    defaultReaderOverflowThemeDarkVisible,
    defaultReaderOverflowThemeDialogVisible,
    defaultReaderOverflowThemeGroupVisible,
    defaultReaderOverflowThemeInline,
    defaultReaderOverflowThemeLightVisible,
    defaultReaderOverflowVoiceInline,
    defaultReaderOverflowVoiceVisible,
    defaultReaderVisibleTransportButtonLabels,
    defaultReaderVisibleUtilityLabels,
    defaultReaderVisibleViewLabels,
    notebookOpenWorkbenchVisible,
    sourceOpenReaderSourceLibraryVisible,
    simplifiedViewAvailable,
    summaryReaderCreateSummaryVisible,
    summaryReaderGeneratedEmptyStateVisible,
    summaryReaderOverflowActionLabels,
    summaryReaderOverflowPanelHeight,
    summaryReaderOverflowPanelWidth,
    summaryReaderOverflowRateVisible,
    summaryReaderOverflowSentenceLabelVisible,
    summaryReaderOverflowShortcutHintVisible,
    summaryReaderOverflowThemeChoiceLabels,
    summaryReaderOverflowThemeDarkVisible,
    summaryReaderOverflowThemeDialogVisible,
    summaryReaderOverflowThemeGroupVisible,
    summaryReaderOverflowThemeInline,
    summaryReaderOverflowThemeLightVisible,
    summaryReaderOverflowVoiceInline,
    summaryReaderOverflowVoiceVisible,
    summaryReaderVisibleTransportButtonLabels,
    summaryReaderVisibleUtilityLabels,
    summaryReaderVisibleViewLabels,
  } = evidence.metrics

  const expectedDefaultViewLabels = ['Original', 'Reflowed']
  if (Array.isArray(defaultAvailableModes) && defaultAvailableModes.includes('summary')) {
    expectedDefaultViewLabels.push('Summary')
  }
  if (Array.isArray(defaultAvailableModes) && defaultAvailableModes.includes('simplified')) {
    expectedDefaultViewLabels.splice(2, 0, 'Simplified')
  }

  if (!matchesItems(defaultReaderVisibleViewLabels, expectedDefaultViewLabels)) {
    throw new Error(
      `Expected the default Reader view strip to match available modes ${expectedDefaultViewLabels.join(', ')}, found ${Array.isArray(defaultReaderVisibleViewLabels) ? defaultReaderVisibleViewLabels.join(', ') : defaultReaderVisibleViewLabels}.`,
    )
  }
  if (!matchesItems(defaultReaderVisibleTransportButtonLabels, ['Start read aloud'])) {
    throw new Error('Expected the default Reader ribbon to keep only Start read aloud visible.')
  }
  if (!matchesItems(defaultReaderVisibleUtilityLabels, ['More reading controls'])) {
    throw new Error(
      `Expected the default Reader ribbon to keep only the overflow visible beside the primary transport, found ${Array.isArray(defaultReaderVisibleUtilityLabels) ? defaultReaderVisibleUtilityLabels.join(', ') : defaultReaderVisibleUtilityLabels}.`,
    )
  }
  if (!matchesItems(defaultReaderOverflowActionLabels, requiredOverflowActions)) {
    throw new Error(
      `Expected the default Reader overflow to keep no quick-action buttons, found ${Array.isArray(defaultReaderOverflowActionLabels) ? defaultReaderOverflowActionLabels.join(', ') : defaultReaderOverflowActionLabels}.`,
    )
  }
  if (!defaultReaderOverflowThemeGroupVisible || !defaultReaderOverflowThemeInline) {
    throw new Error('Expected the default Reader overflow to keep the Reading theme control visible in the compact inline layout.')
  }
  if (!matchesItems(defaultReaderOverflowThemeChoiceLabels, requiredThemeChoices)) {
    throw new Error(
      `Expected the default Reader overflow theme group to expose only ${requiredThemeChoices.join(', ')}, found ${Array.isArray(defaultReaderOverflowThemeChoiceLabels) ? defaultReaderOverflowThemeChoiceLabels.join(', ') : defaultReaderOverflowThemeChoiceLabels}.`,
    )
  }
  if (!defaultReaderOverflowThemeLightVisible || !defaultReaderOverflowThemeDarkVisible) {
    throw new Error('Expected the default Reader overflow to keep both Light and Dark theme choices visible.')
  }
  if (defaultReaderOverflowThemeDialogVisible) {
    throw new Error('Expected the default Reader overflow to avoid reopening the old Theme dialog.')
  }
  if (!defaultReaderOverflowVoiceVisible || !defaultReaderOverflowVoiceInline) {
    throw new Error('Expected the default Reader overflow to keep Voice visible in the compact inline layout.')
  }
  if (!defaultReaderOverflowRateVisible) {
    throw new Error('Expected the default Reader overflow to keep the rate control visible.')
  }
  if (defaultReaderOverflowPanelWidth > maxOverflowPanelWidth) {
    throw new Error(
      `Expected the default Reader overflow width to stay at or below ${maxOverflowPanelWidth}px, found ${defaultReaderOverflowPanelWidth}.`,
    )
  }
  if (defaultReaderOverflowPanelHeight > maxOverflowPanelHeight) {
    throw new Error(
      `Expected the default Reader overflow height to stay at or below ${maxOverflowPanelHeight}px, found ${defaultReaderOverflowPanelHeight}.`,
    )
  }
  if (defaultReaderOverflowSentenceLabelVisible) {
    throw new Error('Expected the default Reader overflow to keep the passive sentence-progress chip hidden.')
  }
  if (defaultReaderOverflowShortcutHintVisible) {
    throw new Error('Expected the default Reader overflow to keep the passive shortcut sentence hidden.')
  }
  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 759 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 759 audit.')
  }
  if (!matchesItems(summaryReaderVisibleViewLabels, ['Original', 'Reflowed', 'Summary'])) {
    throw new Error('Expected Summary-capable Reader state to keep Original, Reflowed, and Summary visible.')
  }
  if (!matchesItems(summaryReaderVisibleTransportButtonLabels, ['Start read aloud'])) {
    throw new Error('Expected Summary idle state to keep only the primary read-aloud transport visible.')
  }
  if (!matchesItems(summaryReaderVisibleUtilityLabels, ['More reading controls'])) {
    throw new Error(
      `Expected Summary idle state to keep only the overflow visible beside the primary transport, found ${Array.isArray(summaryReaderVisibleUtilityLabels) ? summaryReaderVisibleUtilityLabels.join(', ') : summaryReaderVisibleUtilityLabels}.`,
    )
  }
  if (!matchesItems(summaryReaderOverflowActionLabels, requiredOverflowActions)) {
    throw new Error(
      `Expected the Summary Reader overflow to keep no quick-action buttons, found ${Array.isArray(summaryReaderOverflowActionLabels) ? summaryReaderOverflowActionLabels.join(', ') : summaryReaderOverflowActionLabels}.`,
    )
  }
  if (!summaryReaderOverflowThemeGroupVisible || !summaryReaderOverflowThemeInline) {
    throw new Error('Expected the Summary Reader overflow to keep the Reading theme control visible in the compact inline layout.')
  }
  if (!matchesItems(summaryReaderOverflowThemeChoiceLabels, requiredThemeChoices)) {
    throw new Error(
      `Expected the Summary Reader overflow theme group to expose only ${requiredThemeChoices.join(', ')}, found ${Array.isArray(summaryReaderOverflowThemeChoiceLabels) ? summaryReaderOverflowThemeChoiceLabels.join(', ') : summaryReaderOverflowThemeChoiceLabels}.`,
    )
  }
  if (!summaryReaderOverflowThemeLightVisible || !summaryReaderOverflowThemeDarkVisible) {
    throw new Error('Expected the Summary Reader overflow to keep both Light and Dark theme choices visible.')
  }
  if (summaryReaderOverflowThemeDialogVisible) {
    throw new Error('Expected the Summary Reader overflow to avoid reopening the old Theme dialog.')
  }
  if (!summaryReaderOverflowVoiceVisible || !summaryReaderOverflowVoiceInline) {
    throw new Error('Expected the Summary Reader overflow to keep Voice visible in the compact inline layout.')
  }
  if (!summaryReaderOverflowRateVisible) {
    throw new Error('Expected the Summary Reader overflow to keep the rate control visible.')
  }
  if (summaryReaderOverflowPanelWidth > maxOverflowPanelWidth) {
    throw new Error(
      `Expected the Summary Reader overflow width to stay at or below ${maxOverflowPanelWidth}px, found ${summaryReaderOverflowPanelWidth}.`,
    )
  }
  if (summaryReaderOverflowPanelHeight > maxOverflowPanelHeight) {
    throw new Error(
      `Expected the Summary Reader overflow height to stay at or below ${maxOverflowPanelHeight}px, found ${summaryReaderOverflowPanelHeight}.`,
    )
  }
  if (summaryReaderOverflowSentenceLabelVisible) {
    throw new Error('Expected the Summary Reader overflow to keep the passive sentence-progress chip hidden.')
  }
  if (summaryReaderOverflowShortcutHintVisible) {
    throw new Error('Expected the Summary Reader overflow to keep the passive shortcut sentence hidden.')
  }
  if (!summaryReaderGeneratedEmptyStateVisible || !summaryReaderCreateSummaryVisible) {
    throw new Error('Expected Summary to keep the generated empty-state contract in the live Stage 759 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the current live dataset during the Stage 759 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage759-post-stage758-reader-overflow-footprint-compaction-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Reader should keep the active overflow down to a tighter utility footprint instead of reopening a large floating card.',
          'The compact overflow should keep Theme and Voice inline, keep Rate visible, and preserve Light / Dark without reviving the separate Theme dialog.',
          'Source support, nearby Notebook reopening, generated Summary affordances, and the wider Recall regression surfaces should stay stable in the same live browser pass.',
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
        fullPage: true,
        path: path.join(outputDir, 'stage759-reader-overflow-footprint-compaction-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage759-reader-overflow-footprint-compaction-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
