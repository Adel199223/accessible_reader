import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE490_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE490_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE490_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE490_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE490_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE490_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage490-post-stage489-graph-saved-view-presets-workflow-audit-failure.png'),
  { force: true },
)
await rm(
  path.join(outputDir, 'stage490-post-stage489-graph-saved-view-presets-workflow-audit-failure-reader.png'),
  { force: true },
)

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)
const { browser, runtimeBrowser } = await launchBrowser(chromium)

let desktopPage
let desktopReaderPage
try {
  desktopPage = await browser.newPage({ viewport: desktopViewport })
  await openHome(desktopPage)

  const homeWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage490-home-wide-top.png')

  await desktopPage.getByRole('tab', { name: 'Graph', exact: true }).click()
  await desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(350)

  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage490-graph-wide-top.png')

  await desktopPage.getByRole('button', { name: 'Show settings' }).click()
  const graphRail = desktopPage.getByRole('complementary', { name: 'Graph settings sidebar' }).first()
  await graphRail.waitFor({ state: 'visible', timeout: 20000 })

  const graphSettingsWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage490-graph-settings-wide-top.png',
  )

  const presetNameInput = graphRail.getByLabel('Graph preset name')
  await graphRail.getByRole('button', { name: 'Connections' }).click()
  await graphRail.getByRole('button', { name: 'Spread' }).click()
  await presetNameInput.fill('Audit view')
  await graphRail.getByRole('button', { name: 'Save new preset' }).click()
  await waitForSavedPresetState(desktopPage, 'Audit view', true)

  const graphSavedPresetWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage490-graph-saved-preset-wide-top.png',
  )

  await graphRail.getByRole('button', { name: 'Explore' }).click()
  await waitForStarterPresetState(desktopPage, 'Explore')
  await graphRail.getByRole('button', { name: /Audit view/i }).click()
  await waitForSavedPresetState(desktopPage, 'Audit view', true)

  desktopReaderPage = await browser.newPage({ viewport: desktopViewport })
  const { sourceTitle } = await openOriginalReaderFromHome(desktopReaderPage)
  const readerOriginalWideTop = await captureViewportScreenshot(
    desktopReaderPage,
    outputDir,
    'stage490-reader-original-wide-top.png',
  )

  await writeFile(
    path.join(outputDir, 'stage490-post-stage489-graph-saved-view-presets-workflow-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Graph is audited first after the Stage 489 saved-view preset workflow reset',
          'Graph should now support starter presets plus saved local views without pulling selected-node work back into the settings drawer',
          'Home and original-only Reader remain regression surfaces, and generated-content Reader views stay explicitly out of scope',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphSavedPresetWideTop,
          graphSettingsWideTop,
          graphWideTop,
          homeWideTop,
          readerOriginalWideTop,
        },
        desktopViewport,
        graphPresetWorkflow: {
          savedPreset: 'Audit view',
        },
        headless,
        runtimeBrowser,
        sourceTitle,
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
        path: path.join(outputDir, 'stage490-post-stage489-graph-saved-view-presets-workflow-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (desktopReaderPage && desktopReaderPage !== desktopPage) {
    await desktopReaderPage
      .screenshot({
        path: path.join(outputDir, 'stage490-post-stage489-graph-saved-view-presets-workflow-audit-failure-reader.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function openHome(page) {
  await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const homeControlSeam = page.locator('[aria-label="Home control seam"]').first()
  if (!(await homeControlSeam.isVisible().catch(() => false))) {
    const homeTab = page.getByRole('tab', { name: 'Home', exact: true }).first()
    if (await homeTab.isVisible().catch(() => false)) {
      await homeTab.click()
    }
  }
  await page.locator('.recall-home-workspace').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function openReaderFromHome(page) {
  await openHome(page)
  const sourceButton = await getVisibleLocator(page, [
    '[aria-label="Pinned reopen shelf"] button[aria-label^="Open "]',
    '[aria-label="Saved library"] button[aria-label^="Open "]',
    '.recall-library-list-row',
    '.recall-home-continue-row',
    '.recall-home-library-stage-row',
    'button[aria-label^="Open "]',
  ])
  const sourceTitle = await getSourceTitle(sourceButton)
  await sourceButton.click()
  await page.getByRole('region', { name: `${sourceTitle} workspace` }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
  const sourceWorkspace = page.getByRole('region', { name: `${sourceTitle} workspace` })
  await sourceWorkspace.getByRole('tab', { name: 'Source workspace Reader' }).click()
  await page.waitForURL(/\/reader/, { timeout: 20000 })
  await page.locator('article').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
  return { sourceTitle }
}

async function openOriginalReaderFromHome(page) {
  const { sourceTitle } = await openReaderFromHome(page)
  const originalTab = page.getByRole('tab', { name: 'Original', exact: true }).first()
  await originalTab.waitFor({ state: 'visible', timeout: 20000 })
  if ((await originalTab.getAttribute('aria-selected')) !== 'true') {
    await originalTab.click()
    await page.waitForTimeout(250)
  }
  if ((await originalTab.getAttribute('aria-selected')) !== 'true') {
    throw new Error('Could not switch Reader into Original view for the Stage 490 audit.')
  }
  await page.waitForTimeout(250)
  return { sourceTitle }
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

async function getVisibleLocator(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first()
    if (await locator.isVisible().catch(() => false)) {
      return locator
    }
  }
  throw new Error(`Could not find a visible locator for any of: ${selectors.join(', ')}`)
}

async function getSourceTitle(sourceButton) {
  const ariaLabel = await sourceButton.getAttribute('aria-label')
  if (ariaLabel?.startsWith('Open ')) {
    return ariaLabel.replace(/^Open\s+/, '').trim()
  }
  const text = (await sourceButton.innerText()).trim()
  if (text) {
    return text.split('\n')[0].trim()
  }
  return 'Saved source'
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
