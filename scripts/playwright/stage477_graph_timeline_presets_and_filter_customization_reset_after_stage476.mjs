import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE477_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE477_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE477_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE477_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE477_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE477_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage477-graph-timeline-presets-and-filter-customization-reset-after-stage476-failure.png'),
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
    'stage477-graph-wide-top.png',
  )

  await openGraphSettings(desktopPage)
  const graphSettingsWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage477-graph-settings-wide-top.png',
  )
  const graphSettingsDrawerWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByRole('complementary', { name: 'Graph settings sidebar' }).first(),
    outputDir,
    'stage477-graph-settings-drawer-wide-top.png',
    'locator',
  )

  const sourceFilterState = await applyFirstGraphSourceTypeFilter(desktopPage)
  const graphContentFilterWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage477-graph-content-filter-wide-top.png',
  )
  const graphContentFilterDrawerWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByRole('complementary', { name: 'Graph settings sidebar' }).first(),
    outputDir,
    'stage477-graph-content-filter-drawer-wide-top.png',
    'locator',
  )

  const timelineState = await applyTimelinePreset(desktopPage)
  const graphTimelineWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage477-graph-timeline-wide-top.png',
  )
  const graphTimelineDrawerWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByRole('complementary', { name: 'Graph settings sidebar' }).first(),
    outputDir,
    'stage477-graph-timeline-drawer-wide-top.png',
    'locator',
  )

  await writeFile(
    path.join(
      outputDir,
      'stage477-graph-timeline-presets-and-filter-customization-reset-after-stage476-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphContentFilterDrawerWideTop,
          graphContentFilterWideTop,
          graphSettingsDrawerWideTop,
          graphSettingsWideTop,
          graphTimelineDrawerWideTop,
          graphTimelineWideTop,
          graphWideTop,
        },
        desktopViewport,
        headless,
        runtimeBrowser,
        sourceFilterState,
        timelineState,
        validationFocus: [
          'wide desktop Graph is judged first after the Stage 476 checkpoint',
          'the settings drawer should now expose named presets, timeline controls, and content filters instead of only depth/layout toggles',
          'content filters and timeline state should read clearly in the drawer and on the canvas without reviving banner-heavy Graph chrome',
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
        path: path.join(outputDir, 'stage477-graph-timeline-presets-and-filter-customization-reset-after-stage476-failure.png'),
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

async function openGraphSettings(page) {
  const showButton = page.getByRole('button', { name: 'Show settings' }).first()
  if (await showButton.isVisible().catch(() => false)) {
    await showButton.click()
  }
  await page.getByRole('complementary', { name: 'Graph settings sidebar' }).first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
}

async function applyFirstGraphSourceTypeFilter(page) {
  const filterGroup = page.getByRole('group', { name: 'Graph source type filters' }).first()
  const filterButton = await getFirstVisibleButton(filterGroup)
  const label = ((await filterButton.textContent()) ?? '').trim()
  if (!label) {
    throw new Error('Stage 477 could not derive a visible source-type filter label.')
  }
  await filterButton.click()
  await page.waitForTimeout(300)

  return {
    drawerStatus: await readDrawerStatus(page),
    label,
    pressed: await filterButton.getAttribute('aria-pressed'),
  }
}

async function applyTimelinePreset(page) {
  const presetButton = page.getByRole('button', { name: 'Timeline', exact: true }).first()
  await presetButton.click()
  await page.waitForTimeout(300)

  const timelineToggle = page.getByRole('button', { name: 'Timeline filter' }).first()
  const playButton = page.getByRole('button', { name: /^(Play|Pause) timeline$/ }).first()
  const timelineStatus = page.locator('.recall-graph-sidebar-range-status').first()

  return {
    drawerStatus: await readDrawerStatus(page),
    playLabel: ((await playButton.textContent()) ?? '').trim(),
    presetPressed: await presetButton.getAttribute('aria-pressed'),
    timelineLabel: (await timelineStatus.textContent())?.trim() ?? null,
    timelinePressed: await timelineToggle.getAttribute('aria-pressed'),
  }
}

async function readDrawerStatus(page) {
  const statusList = page.getByRole('list', { name: 'Graph drawer status' }).first()
  return ((await statusList.textContent()) ?? '').replace(/\s+/g, ' ').trim()
}

async function getFirstVisibleButton(locator) {
  const buttons = locator.getByRole('button')
  const count = await buttons.count()
  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index)
    if (await button.isVisible().catch(() => false)) {
      return button
    }
  }
  throw new Error('Stage 477 could not find a visible button in the requested Graph control group.')
}

async function captureViewportScreenshot(page, directory, filename) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath })
  return screenshotPath
}

async function captureLocatorTopScreenshot(page, locator, directory, filename, scrollMode = 'pageTop') {
  if (scrollMode === 'locator') {
    await locator.scrollIntoViewIfNeeded()
  } else {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  }
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await locator.screenshot({ path: screenshotPath })
  return screenshotPath
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
