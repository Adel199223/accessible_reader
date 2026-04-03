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
const requiredOverflowActions = []
const requiredThemeChoices = ['Light', 'Dark']

function matchesItems(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected)
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE757_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE757_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE757_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE757_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE757_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE757_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage757-reader-inline-theme-choices-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage757-reader-inline-theme-choices-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage757',
  })

  const {
    defaultAvailableModes,
    defaultReaderOverflowActionLabels,
    defaultReaderOverflowRateVisible,
    defaultReaderOverflowSentenceLabelVisible,
    defaultReaderOverflowShortcutHintVisible,
    defaultReaderOverflowThemeChoiceLabels,
    defaultReaderOverflowThemeDarkVisible,
    defaultReaderOverflowThemeDialogVisible,
    defaultReaderOverflowThemeGroupVisible,
    defaultReaderOverflowThemeLightVisible,
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
    summaryReaderOverflowRateVisible,
    summaryReaderOverflowSentenceLabelVisible,
    summaryReaderOverflowShortcutHintVisible,
    summaryReaderOverflowThemeChoiceLabels,
    summaryReaderOverflowThemeDarkVisible,
    summaryReaderOverflowThemeDialogVisible,
    summaryReaderOverflowThemeGroupVisible,
    summaryReaderOverflowThemeLightVisible,
    summaryReaderOverflowVoiceVisible,
    summaryReaderVisibleTransportButtonLabels,
    summaryReaderVisibleUtilityLabels,
    summaryReaderVisibleViewLabels,
  } = evidence.metrics

  const expectedDefaultViewLabels = orderedModes
    .filter((mode) => Array.isArray(defaultAvailableModes) && defaultAvailableModes.includes(mode))
    .map((mode) => modeLabelByValue[mode])

  if (!Array.isArray(defaultAvailableModes) || defaultAvailableModes.length === 0) {
    throw new Error('Expected the Stage 757 audit to resolve the default Reader document available modes.')
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
  if (!defaultReaderOverflowThemeGroupVisible) {
    throw new Error('Expected the default Reader overflow to expose an inline Reading theme group.')
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
  if (!defaultReaderOverflowVoiceVisible || !defaultReaderOverflowRateVisible) {
    throw new Error('Expected the default Reader overflow to keep voice and rate controls visible.')
  }
  if (defaultReaderOverflowSentenceLabelVisible) {
    throw new Error('Expected the default Reader overflow to keep the passive sentence-progress chip hidden.')
  }
  if (defaultReaderOverflowShortcutHintVisible) {
    throw new Error('Expected the default Reader overflow to keep the passive shortcut sentence hidden.')
  }
  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 757 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 757 audit.')
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
  if (!summaryReaderOverflowThemeGroupVisible) {
    throw new Error('Expected the Summary Reader overflow to expose an inline Reading theme group.')
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
  if (!summaryReaderOverflowVoiceVisible || !summaryReaderOverflowRateVisible) {
    throw new Error('Expected the Summary Reader overflow to keep voice and rate controls visible.')
  }
  if (summaryReaderOverflowSentenceLabelVisible) {
    throw new Error('Expected the Summary Reader overflow to keep the passive sentence-progress chip hidden.')
  }
  if (summaryReaderOverflowShortcutHintVisible) {
    throw new Error('Expected the Summary Reader overflow to keep the passive shortcut sentence hidden.')
  }
  if (!summaryReaderGeneratedEmptyStateVisible || !summaryReaderCreateSummaryVisible) {
    throw new Error('Expected Summary to keep the generated empty-state contract in the live Stage 757 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the current live dataset during the Stage 757 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage757-post-stage756-reader-inline-theme-choices-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Reader should retire the last active-reading overflow quick action and keep theme selection inline inside More reading controls.',
          'The active overflow should expose only Light and Dark theme choices plus voice and rate, without reopening the older Theme dialog.',
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
        path: path.join(outputDir, 'stage757-reader-inline-theme-choices-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage757-reader-inline-theme-choices-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
