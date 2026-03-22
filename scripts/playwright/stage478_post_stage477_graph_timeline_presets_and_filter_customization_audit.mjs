import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE478_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE478_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE478_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE478_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE478_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE478_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage478-post-stage477-graph-timeline-presets-and-filter-customization-audit-failure.png'),
  { force: true },
)
await rm(
  path.join(outputDir, 'stage478-post-stage477-graph-timeline-presets-and-filter-customization-audit-failure-reader.png'),
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
  await openGraph(desktopPage)

  const graphWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage478-graph-wide-top.png',
  )

  await openGraphSettings(desktopPage)
  const graphSettingsDrawerWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByRole('complementary', { name: 'Graph settings sidebar' }).first(),
    outputDir,
    'stage478-graph-settings-drawer-wide-top.png',
    'locator',
  )

  const sourceFilterState = await applyFirstGraphSourceTypeFilter(desktopPage)
  const graphContentFilterWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage478-graph-content-filter-wide-top.png',
  )

  const timelineState = await applyTimelinePreset(desktopPage)
  const graphTimelineWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage478-graph-timeline-wide-top.png',
  )
  const graphTimelineDrawerWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByRole('complementary', { name: 'Graph settings sidebar' }).first(),
    outputDir,
    'stage478-graph-timeline-drawer-wide-top.png',
    'locator',
  )

  await openHome(desktopPage)
  const homeWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage478-home-wide-top.png',
  )

  desktopReaderPage = await browser.newPage({ viewport: desktopViewport })
  const { sourceTitle } = await openOriginalReaderFromHome(desktopReaderPage)
  const readerOriginalWideTop = await captureViewportScreenshot(
    desktopReaderPage,
    outputDir,
    'stage478-reader-original-wide-top.png',
  )

  await writeFile(
    path.join(
      outputDir,
      'stage478-post-stage477-graph-timeline-presets-and-filter-customization-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Graph is audited first after the Stage 477 presets, timeline, and content-filter reset',
          'Graph should now show named presets, an enabled timeline lens, and source-type filtering without reviving heavy banner chrome',
          'Home and original-only Reader remain regression checkpoints while generated-content Reader views stay locked out of scope',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphContentFilterWideTop,
          graphSettingsDrawerWideTop,
          graphTimelineDrawerWideTop,
          graphTimelineWideTop,
          graphWideTop,
          homeWideTop,
          readerOriginalWideTop,
        },
        desktopViewport,
        headless,
        runtimeBrowser,
        sourceFilterState,
        sourceTitle,
        timelineState,
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
        path: path.join(outputDir, 'stage478-post-stage477-graph-timeline-presets-and-filter-customization-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (desktopReaderPage && desktopReaderPage !== desktopPage) {
    await desktopReaderPage
      .screenshot({
        path: path.join(outputDir, 'stage478-post-stage477-graph-timeline-presets-and-filter-customization-audit-failure-reader.png'),
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
    throw new Error('Stage 478 could not derive a visible source-type filter label.')
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

async function openHome(page) {
  await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await page.locator('[aria-label="Home control seam"]').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function openReaderFromHome(page) {
  await openHome(page)
  const sourceButton = await getVisibleLocator(page, [
    '[aria-label="Saved library"] button[aria-label^="Open "]',
    '[aria-label="Pinned reopen strip"] button[aria-label^="Open "]',
    '.recall-home-board-open-row button[aria-label^="Open "]',
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
    throw new Error('Could not switch Reader into Original view for the Stage 478 audit.')
  }
  await page.waitForTimeout(250)
  return { sourceTitle }
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
  throw new Error('Stage 478 could not find a visible button in the requested Graph control group.')
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

async function getVisibleLocator(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first()
    if (await locator.isVisible().catch(() => false)) {
      return locator
    }
  }
  throw new Error(`Could not find a visible locator for selectors: ${selectors.join(', ')}`)
}

async function getSourceTitle(locator) {
  const ariaLabel = await locator.getAttribute('aria-label')
  if (ariaLabel?.startsWith('Open ')) {
    return ariaLabel.replace(/^Open\s+/, '')
  }
  const textContent = (await locator.textContent())?.trim()
  if (textContent) {
    return textContent.split('\n')[0].trim()
  }
  throw new Error('Could not derive a source title from the selected Home locator.')
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
