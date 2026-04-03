import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureReaderReadingFirstEvidence,
  desktopViewport,
  selectReaderView,
} from './reader_reading_first_hierarchy_shared.mjs'

const modeLabelByValue = {
  original: 'Original',
  reflowed: 'Reflowed',
  simplified: 'Simplified',
  summary: 'Summary',
}

const orderedModes = ['original', 'reflowed', 'simplified', 'summary']
const requiredOverflowActions = ['Theme', 'Source', 'Notebook']

function includesActions(actions, expected) {
  return expected.every((label) => Array.isArray(actions) && actions.includes(label))
}

async function openThemePanel(page) {
  await page.getByRole('button', { name: 'More reading controls' }).click()
  const overflow = page.getByRole('group', { name: 'More reading controls' })
  await overflow.waitFor({ state: 'visible', timeout: 20000 })
  await overflow.getByRole('button', { name: 'Theme', exact: true }).click()
  const panel = page.getByRole('dialog', { name: 'Theme' })
  await panel.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(200)
  return panel
}

async function readThemePanelMetrics(panel) {
  const themeGroup = panel.getByRole('group', { name: 'Reading theme' })
  const choiceLabels = await themeGroup.getByRole('button').evaluateAll((buttons) =>
    buttons
      .map((button) => {
        const label = button.querySelector('strong')?.textContent ?? button.textContent ?? ''
        return label.replace(/\s+/g, ' ').trim()
      })
      .filter(Boolean),
  )

  return {
    choiceLabels,
    darkVisible: await themeGroup.getByRole('button', { name: 'Dark theme' }).isVisible().catch(() => false),
    documentViewVisible: await panel.getByRole('group', { name: 'Document view' }).isVisible().catch(() => false),
    lightVisible: await themeGroup.getByRole('button', { name: 'Light theme' }).isVisible().catch(() => false),
    summaryDetailVisible: await panel.getByRole('group', { name: 'Summary detail' }).isVisible().catch(() => false),
  }
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE751_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE751_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE751_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE751_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE751_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE751_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage751-reader-theme-first-settings-simplification-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage751-reader-theme-first-settings-simplification-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage751',
  })

  const defaultThemePanel = await openThemePanel(readerPage)
  const defaultThemePanelMetrics = await readThemePanelMetrics(defaultThemePanel)
  await defaultThemePanel.getByRole('button', { name: 'Close' }).click()
  await defaultThemePanel.waitFor({ state: 'hidden', timeout: 20000 })

  await selectReaderView(readerPage, 'Summary')
  await readerPage.waitForTimeout(300)
  const summaryThemePanel = await openThemePanel(readerPage)
  const summaryThemePanelMetrics = await readThemePanelMetrics(summaryThemePanel)
  await summaryThemePanel.getByRole('button', { name: 'Close' }).click()
  await summaryThemePanel.waitFor({ state: 'hidden', timeout: 20000 })

  const {
    defaultAvailableModes,
    defaultReaderOverflowActionLabels,
    defaultReaderOverflowRateVisible,
    defaultReaderOverflowSentenceLabelVisible,
    defaultReaderOverflowShortcutHintVisible,
    defaultReaderOverflowVoiceVisible,
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
    throw new Error('Expected the Stage 751 audit to resolve the default Reader document available modes.')
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
    throw new Error('Expected the default Reader overflow to keep the passive sentence-progress chip hidden.')
  }
  if (defaultReaderOverflowShortcutHintVisible) {
    throw new Error('Expected the default Reader overflow to keep the passive shortcut sentence hidden.')
  }
  if (!defaultThemePanelMetrics.lightVisible || !defaultThemePanelMetrics.darkVisible) {
    throw new Error('Expected the default Reader Theme panel to expose both Light and Dark choices.')
  }
  if (JSON.stringify(defaultThemePanelMetrics.choiceLabels) !== JSON.stringify(['Light', 'Dark'])) {
    throw new Error(
      `Expected the default Reader Theme panel to keep only Light and Dark choices, found ${Array.isArray(defaultThemePanelMetrics.choiceLabels) ? defaultThemePanelMetrics.choiceLabels.join(', ') : defaultThemePanelMetrics.choiceLabels}.`,
    )
  }
  if (defaultThemePanelMetrics.documentViewVisible) {
    throw new Error('Expected the default Reader Theme panel to avoid duplicating document view controls.')
  }
  if (defaultThemePanelMetrics.summaryDetailVisible) {
    throw new Error('Expected the default Reader Theme panel to avoid duplicating Summary detail controls.')
  }
  if (!sourceOpenReaderSourceLibraryVisible || !sourceOpenReaderSourceTabsVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 751 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 751 audit.')
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
    throw new Error('Expected the Summary Reader overflow to keep the passive sentence-progress chip hidden.')
  }
  if (summaryReaderOverflowShortcutHintVisible) {
    throw new Error('Expected the Summary Reader overflow to keep the passive shortcut sentence hidden.')
  }
  if (!summaryThemePanelMetrics.lightVisible || !summaryThemePanelMetrics.darkVisible) {
    throw new Error('Expected the Summary Reader Theme panel to expose both Light and Dark choices.')
  }
  if (JSON.stringify(summaryThemePanelMetrics.choiceLabels) !== JSON.stringify(['Light', 'Dark'])) {
    throw new Error(
      `Expected the Summary Reader Theme panel to keep only Light and Dark choices, found ${Array.isArray(summaryThemePanelMetrics.choiceLabels) ? summaryThemePanelMetrics.choiceLabels.join(', ') : summaryThemePanelMetrics.choiceLabels}.`,
    )
  }
  if (summaryThemePanelMetrics.documentViewVisible) {
    throw new Error('Expected the Summary Reader Theme panel to avoid duplicating document view controls.')
  }
  if (summaryThemePanelMetrics.summaryDetailVisible) {
    throw new Error('Expected the Summary Reader Theme panel to avoid duplicating Summary detail controls.')
  }
  if (!summaryReaderGeneratedEmptyStateVisible && !summaryReaderCreateSummaryVisible) {
    throw new Error('Expected Summary state to keep either the generated article or the inline Summary action visible.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected the live Stage 751 dataset to keep Simplified unavailable, but it was present during audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage751-post-stage750-reader-theme-first-settings-simplification-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Reader should retire the bulky Settings drawer and replace it with a minimal Theme action in the overflow.',
          'The default and Summary Reader overflows should keep Theme, Source, Notebook, voice, and rate while avoiding passive copy.',
          'The Theme panel should stay limited to Light and Dark choices and should not duplicate document view or Summary detail controls.',
          'Source-open, Notebook-open, Summary-capable, and regression-surface flows should remain stable in the same live browser pass.',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        headless,
        metrics: {
          ...evidence.metrics,
          defaultReaderThemePanelChoiceLabels: defaultThemePanelMetrics.choiceLabels,
          defaultReaderThemePanelDarkVisible: defaultThemePanelMetrics.darkVisible,
          defaultReaderThemePanelDocumentViewVisible: defaultThemePanelMetrics.documentViewVisible,
          defaultReaderThemePanelLightVisible: defaultThemePanelMetrics.lightVisible,
          defaultReaderThemePanelSummaryDetailVisible: defaultThemePanelMetrics.summaryDetailVisible,
          summaryReaderThemePanelChoiceLabels: summaryThemePanelMetrics.choiceLabels,
          summaryReaderThemePanelDarkVisible: summaryThemePanelMetrics.darkVisible,
          summaryReaderThemePanelDocumentViewVisible: summaryThemePanelMetrics.documentViewVisible,
          summaryReaderThemePanelLightVisible: summaryThemePanelMetrics.lightVisible,
          summaryReaderThemePanelSummaryDetailVisible: summaryThemePanelMetrics.summaryDetailVisible,
        },
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
        path: path.join(outputDir, 'stage751-reader-theme-first-settings-simplification-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage751-reader-theme-first-settings-simplification-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
