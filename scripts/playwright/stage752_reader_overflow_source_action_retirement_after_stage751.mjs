import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureReaderReadingFirstEvidence,
  desktopViewport,
  selectReaderView,
} from './reader_reading_first_hierarchy_shared.mjs'

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
const outputDir = process.env.RECALL_STAGE752_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE752_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE752_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE752_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE752_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE752_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage752-reader-overflow-source-action-retirement-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage752-reader-overflow-source-action-retirement-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage752',
  })

  const defaultThemePanel = await openThemePanel(readerPage)
  const defaultThemePanelMetrics = await readThemePanelMetrics(defaultThemePanel)
  const defaultThemePanelCapture = path.join(outputDir, 'stage752-reader-theme-panel.png')
  await defaultThemePanel.screenshot({ path: defaultThemePanelCapture })
  await defaultThemePanel.getByRole('button', { name: 'Close' }).click()
  await defaultThemePanel.waitFor({ state: 'hidden', timeout: 20000 })

  await selectReaderView(readerPage, 'Summary')
  await readerPage.waitForTimeout(300)
  const summaryThemePanel = await openThemePanel(readerPage)
  const summaryThemePanelMetrics = await readThemePanelMetrics(summaryThemePanel)
  const summaryThemePanelCapture = path.join(outputDir, 'stage752-reader-summary-theme-panel.png')
  await summaryThemePanel.screenshot({ path: summaryThemePanelCapture })
  await summaryThemePanel.getByRole('button', { name: 'Close' }).click()
  await summaryThemePanel.waitFor({ state: 'hidden', timeout: 20000 })

  await writeFile(
    path.join(outputDir, 'stage752-reader-overflow-source-action-retirement-after-stage751-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Reader should retire the duplicate overflow Source action while keeping Theme plus Notebook as the remaining compact quick actions.',
          'Voice and rate should stay in the overflow as read-aloud controls, and the Theme panel should still expose only Light and Dark.',
          'Source support should stay reachable after opening the Notebook pane and switching tabs inside the expanded Reader support dock.',
          'The compact reading band, source strip, and regression surfaces should stay stable in the same live browser pass.',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          ...evidence.captures,
          defaultThemePanelCapture,
          summaryThemePanelCapture,
        },
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
        path: path.join(outputDir, 'stage752-reader-overflow-source-action-retirement-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage752-reader-overflow-source-action-retirement-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
