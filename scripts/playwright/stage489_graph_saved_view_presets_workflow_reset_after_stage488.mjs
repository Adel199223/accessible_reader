import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE489_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE489_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE489_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE489_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE489_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE489_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage489-graph-saved-view-presets-workflow-reset-after-stage488-failure.png'),
  { force: true },
)

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)
const { browser, runtimeBrowser } = await launchBrowser(chromium)

let desktopPage
try {
  desktopPage = await browser.newPage({ viewport: desktopViewport })
  await openGraph(desktopPage)

  const graphWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage489-graph-wide-top.png',
  )

  await desktopPage.getByRole('button', { name: 'Show settings' }).click()
  const graphRail = desktopPage.getByRole('complementary', { name: 'Graph settings sidebar' }).first()
  await graphRail.waitFor({ state: 'visible', timeout: 20000 })

  const graphSettingsDefaultWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage489-graph-settings-default-wide-top.png',
  )

  const noSavedViewsVisible = await graphRail.getByText(/No saved views yet\./i).isVisible().catch(() => false)
  const presetNameInput = graphRail.getByLabel('Graph preset name')

  await graphRail.getByRole('button', { name: '3+ hops' }).click()
  await graphRail.getByRole('button', { name: 'Spread' }).click()
  await graphRail.getByRole('button', { name: 'Hover focus' }).click()
  await presetNameInput.fill('Preset workflow')
  await graphRail.getByRole('button', { name: 'Save new preset' }).click()
  await waitForSavedPresetState(desktopPage, 'Preset workflow', true)

  const graphSavedPresetWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage489-graph-saved-preset-wide-top.png',
  )

  await graphRail.getByRole('button', { name: 'Explore' }).click()
  await waitForStarterPresetState(desktopPage, 'Explore')

  await graphRail.getByRole('button', { name: /Preset workflow/i }).click()
  await waitForSavedPresetState(desktopPage, 'Preset workflow', true)
  await waitForToggleState(desktopPage, '3+ hops', true)
  await waitForToggleState(desktopPage, 'Spread', true)

  await graphRail.getByRole('button', { name: 'Captures' }).click()
  await waitForPresetStatusNote(desktopPage, /Preset workflow has local changes waiting to be saved\./i)

  const graphDirtyPresetWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage489-graph-dirty-preset-wide-top.png',
  )

  await graphRail.getByRole('button', { name: 'Update preset' }).click()
  await waitForPresetStatusNote(desktopPage, /Preset workflow is active and ready to reuse\./i)

  await presetNameInput.fill('Preset route')
  await graphRail.getByRole('button', { name: 'Rename preset' }).click()
  await waitForSavedPresetState(desktopPage, 'Preset route', true)

  const graphRenamedPresetWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage489-graph-renamed-preset-wide-top.png',
  )

  await writeFile(
    path.join(outputDir, 'stage489-graph-saved-view-presets-workflow-reset-after-stage488-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphDirtyPresetWideTop,
          graphRenamedPresetWideTop,
          graphSavedPresetWideTop,
          graphSettingsDefaultWideTop,
          graphWideTop,
        },
        desktopViewport,
        graphPresetWorkflow: {
          initialNoSavedViewsVisible: noSavedViewsVisible,
          renamedPreset: 'Preset route',
          savedPreset: 'Preset workflow',
        },
        headless,
        runtimeBrowser,
        validationFocus: [
          'wide desktop Graph should expose a real saved-view workflow instead of only starter preset chips',
          'the settings drawer should let the user save, reapply, update, and rename a local graph view without breaking the canvas-first workbench',
          'saved views should continue to own filter, layout, hover-focus, and visibility state while selected-node work stays outside the preset controls',
        ],
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  if (desktopPage) {
    await desktopPage
      .screenshot({
        path: path.join(outputDir, 'stage489-graph-saved-view-presets-workflow-reset-after-stage488-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function openGraph(page) {
  await page.goto(`${baseUrl}/recall?section=graph`, { waitUntil: 'networkidle' })
  await page.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function captureViewportScreenshot(page, directory, filename) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath })
  return screenshotPath
}

async function waitForSavedPresetState(page, presetName, expectedPressed) {
  await page.waitForFunction(
    ({ expectedPressed: expectedState, presetName: expectedName }) => {
      const buttons = Array.from(document.querySelectorAll('[aria-label="Saved graph presets"] button'))
      const match = buttons.find((button) => button.textContent?.includes(expectedName))
      return Boolean(match && match.getAttribute('aria-pressed') === String(expectedState))
    },
    { expectedPressed, presetName },
  )
}

async function waitForStarterPresetState(page, presetName) {
  await page.waitForFunction(
    ({ presetName: expectedName }) => {
      const buttons = Array.from(document.querySelectorAll('[aria-label="Graph starter presets"] button'))
      const match = buttons.find((button) => button.textContent?.trim() === expectedName)
      return Boolean(match && match.getAttribute('aria-pressed') === 'true')
    },
    { presetName },
  )
}

async function waitForToggleState(page, buttonName, expectedPressed) {
  await page.waitForFunction(
    ({ buttonName: expectedName, expectedPressed: expectedState }) => {
      const buttons = Array.from(document.querySelectorAll('[aria-label="Graph settings sidebar"] button'))
      const match = buttons.find((button) => button.textContent?.trim() === expectedName)
      return Boolean(match && match.getAttribute('aria-pressed') === String(expectedState))
    },
    { buttonName, expectedPressed },
  )
}

async function waitForPresetStatusNote(page, pattern) {
  const graphRail = page.getByRole('complementary', { name: 'Graph settings sidebar' }).first()
  await graphRail.getByText(pattern).waitFor({ state: 'visible', timeout: 20000 })
}

function resolveHarnessDir(candidatePath) {
  return candidatePath.startsWith('\\\\wsl.localhost\\')
    ? candidatePath.replace(/^\\\\wsl\.localhost\\[^\\]+/, '')
    : candidatePath
}

async function launchBrowser(chromium) {
  try {
    const browser = await chromium.launch({ channel: preferredChannel, headless })
    return { browser, runtimeBrowser: preferredChannel }
  } catch (error) {
    if (!allowChromiumFallback) {
      throw error
    }
    const browser = await chromium.launch({ headless })
    return { browser, runtimeBrowser: 'chromium' }
  }
}
