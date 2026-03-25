import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE563_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE563_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE563_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE563_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE563_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE563_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage563-home-structural-recall-parity-reset-after-stage562-failure.png'),
  { force: true },
)

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)
const { browser, runtimeBrowser } = await launchBrowser(chromium)

let page
try {
  page = await browser.newPage({ viewport: desktopViewport })
  const evidence = await captureHomeStructuralParityEvidence(page, outputDir, 'stage563')

  await writeFile(
    path.join(
      outputDir,
      'stage563-home-structural-recall-parity-reset-after-stage562-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        defaultCanvasMetrics: evidence.defaultCanvasMetrics,
        desktopViewport,
        headless,
        runtimeBrowser,
        structuralParityChecks: [
          'default Home should render a Home collection rail and Home collection canvas instead of the grouped overview surface',
          'the top-right toolbar should stay limited to Search, Add, List, and Sort while the rail is visible',
          'the first visible canvas group should include an Add Content tile and day-grouped cards',
          'changing the selected collection should filter the canvas instead of reopening grouped source buckets',
          'advanced organizer controls should remain available through Organizer options and the rail should be recoverable after Hide rail',
        ],
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  if (page) {
    await page
      .screenshot({
        path: path.join(outputDir, 'stage563-home-structural-recall-parity-reset-after-stage562-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function captureHomeStructuralParityEvidence(page, directory, stagePrefix) {
  await openHome(page)

  const rail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  const canvas = page.getByRole('region', { name: 'Home collection canvas' }).first()
  await rail.waitFor({ state: 'visible', timeout: 20000 })
  await canvas.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)

  if ((await page.getByRole('region', { name: 'Saved library overview' }).count()) > 0) {
    throw new Error('Home still rendered the grouped-overview surface; the Stage 563 structural reset did not take control.')
  }
  if ((await page.getByRole('complementary', { name: 'Home browse strip' }).count()) > 0) {
    throw new Error('Home still rendered the legacy organizer wall; the Stage 563 rail reset did not take control.')
  }

  const activeRailButton = rail.locator('.recall-home-parity-rail-button-active-stage563').first()
  await activeRailButton.waitFor({ state: 'visible', timeout: 20000 })
  const canvasHeading = ((await canvas.getByRole('heading', { level: 2 }).first().textContent()) ?? '').trim()
  const activeRailLabel = ((await activeRailButton.locator('strong').first().textContent()) ?? '').trim()
  if (!activeRailLabel) {
    throw new Error('Home did not expose an active collection rail label for the default canvas.')
  }
  if (canvasHeading !== activeRailLabel) {
    throw new Error(
      `Expected the default Home canvas heading to match the active rail selection "${activeRailLabel}", received "${canvasHeading}" instead.`,
    )
  }

  const toolbarActions = canvas.locator('.recall-home-parity-toolbar-actions-stage563').first()
  await toolbarActions.waitFor({ state: 'visible', timeout: 20000 })
  const toolbarActionCount = await toolbarActions.evaluate((node) => node.children.length)
  if (toolbarActionCount !== 4) {
    throw new Error(`Expected 4 first-screen Home controls while the rail is visible, found ${toolbarActionCount}.`)
  }

  await canvas.getByRole('button', { name: /Search/i }).first().waitFor({ state: 'visible', timeout: 20000 })
  await canvas.getByRole('button', { name: 'Add', exact: true }).waitFor({ state: 'visible', timeout: 20000 })
  await canvas.getByRole('button', { name: 'List', exact: true }).waitFor({ state: 'visible', timeout: 20000 })
  await canvas.getByRole('button', { name: /Sort Home sources/i }).waitFor({ state: 'visible', timeout: 20000 })
  await canvas
    .getByRole('button', { name: new RegExp(`Add content to ${escapeRegExp(activeRailLabel)}`, 'i') })
    .waitFor({ state: 'visible', timeout: 20000 })

  const visibleCards = await getVisibleLocators(canvas, '.recall-home-parity-card-stage563')
  if (!visibleCards.length) {
    throw new Error('The default Home canvas did not render any visible source cards.')
  }

  const dayGroups = await getVisibleLocators(canvas, '.recall-home-parity-day-group-stage563')
  if (!dayGroups.length) {
    throw new Error('Home did not render any visible day-group sections.')
  }
  const firstDayLabel = ((await dayGroups[0].locator('h3').first().textContent()) ?? '').trim()
  if (!/2026/.test(firstDayLabel)) {
    throw new Error(`Expected the first Home day heading to include the benchmark year, received "${firstDayLabel}".`)
  }

  const railButtons = await getVisibleLocators(rail, '.recall-home-parity-rail-button-stage563')
  if (railButtons.length < 3) {
    throw new Error(`Expected at least three visible collection rail sections, found ${railButtons.length}.`)
  }

  await clickRailSection(rail, 'Web')
  await expectVisibleText(canvas.getByRole('heading', { name: 'Web', level: 2 }), 'Web canvas heading')
  await expectVisibleText(canvas.getByRole('button', { name: 'Open Stage 10 Debug Article' }), 'Web canvas card')
  if (await canvas.getByRole('button', { name: 'Open Stage 13 Debug Notes' }).isVisible().catch(() => false)) {
    throw new Error('Web selection still leaked Captures cards into the main canvas.')
  }

  const advancedDetails = rail.locator('.recall-home-parity-advanced-stage563').first()
  if ((await advancedDetails.getAttribute('open')) !== null) {
    throw new Error('Organizer options started open; advanced controls were not demoted into secondary UI.')
  }
  await rail.getByText('Organizer options', { exact: true }).click()
  await page.waitForTimeout(200)
  if ((await advancedDetails.getAttribute('open')) !== '') {
    throw new Error('Organizer options did not open when requested.')
  }

  const filterInput = rail.getByRole('searchbox', { name: 'Filter saved sources' }).first()
  await filterInput.fill('Stage 10')
  await page.waitForTimeout(250)
  await expectVisibleText(canvas.getByRole('heading', { name: 'Search results', level: 2 }), 'search results heading')
  await expectVisibleText(canvas.getByRole('button', { name: 'Open Stage 10 Debug Article' }), 'filtered Stage 10 card')

  await filterInput.fill('')
  await page.waitForTimeout(250)
  await rail.getByRole('button', { name: 'Hide rail', exact: true }).click()
  await page.waitForTimeout(250)
  if (await page.getByRole('complementary', { name: 'Home collection rail' }).isVisible().catch(() => false)) {
    throw new Error('Hide rail did not collapse the Home collection rail.')
  }
  const collectionsButton = canvas.getByRole('button', { name: 'Collections', exact: true }).first()
  await collectionsButton.waitFor({ state: 'visible', timeout: 20000 })
  await collectionsButton.click()
  await rail.waitFor({ state: 'visible', timeout: 20000 })

  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)
  const homeRail = await captureLocatorTopScreenshot(page, rail, directory, `${stagePrefix}-home-collection-rail.png`, 980)
  const homeCanvas = await captureLocatorTopScreenshot(page, canvas, directory, `${stagePrefix}-home-collection-canvas.png`, 980)
  const homeJoined = await captureLocatorUnion(
    page,
    [rail, canvas],
    directory,
    `${stagePrefix}-home-rail-and-canvas.png`,
    12,
  )

  const railBox = await rail.boundingBox()
  const canvasBox = await canvas.boundingBox()
  const firstDayBox = await dayGroups[0].boundingBox()
  const addTileBox = await canvas
    .getByRole('button', { name: /Add content to/i })
    .first()
    .boundingBox()
    .catch(() => null)

  return {
    captures: {
      homeCanvas,
      homeJoined,
      homeRail,
      homeWideTop,
    },
    defaultCanvasMetrics: {
      addTileHeight: addTileBox ? roundMetric(addTileBox.height) : null,
      activeRailLabel,
      canvasHeading,
      canvasWidth: canvasBox ? roundMetric(canvasBox.width) : null,
      firstDayGroupLabel: firstDayLabel,
      firstDayGroupTop: firstDayBox ? roundMetric(firstDayBox.y) : null,
      railWidth: railBox ? roundMetric(railBox.width) : null,
      toolbarActionCount,
      visibleRailSections: railButtons.length,
    },
  }
}

async function openHome(page) {
  const response = await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Home navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.locator('.recall-home-workspace').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('region', { name: 'Home collection canvas' }).first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function clickRailSection(rail, label) {
  const buttons = await getVisibleLocators(rail, '.recall-home-parity-rail-button-stage563')
  for (const button of buttons) {
    const text = ((await button.textContent()) ?? '').replace(/\s+/g, ' ').trim()
    if (text.includes(label)) {
      await button.click()
      await rail.page().waitForTimeout(250)
      return
    }
  }
  throw new Error(`Could not find the "${label}" collection rail button.`)
}

async function expectVisibleText(locator, label) {
  await locator.waitFor({ state: 'visible', timeout: 20000 })
  const text = ((await locator.textContent()) ?? '').trim()
  if (!text) {
    throw new Error(`Expected visible text for ${label}, but the locator was empty.`)
  }
  return text
}

async function getVisibleLocators(scope, selector) {
  const matches = scope.locator(selector)
  const visibleLocators = []
  const count = await matches.count()
  for (let index = 0; index < count; index += 1) {
    const locator = matches.nth(index)
    if (await locator.isVisible().catch(() => false)) {
      visibleLocators.push(locator)
    }
  }
  return visibleLocators
}

async function captureViewportScreenshot(page, directory, filename) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath })
  return screenshotPath
}

async function captureLocatorTopScreenshot(page, locator, directory, filename, maxHeight = 980) {
  await locator.scrollIntoViewIfNeeded()
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  const box = await locator.boundingBox()
  if (!box) {
    throw new Error(`Could not measure locator bounds for ${filename}.`)
  }
  await page.screenshot({
    path: screenshotPath,
    clip: {
      x: Math.max(0, Math.floor(box.x)),
      y: Math.max(0, Math.floor(box.y)),
      width: Math.max(1, Math.floor(box.width)),
      height: Math.max(1, Math.floor(Math.min(box.height, maxHeight))),
    },
  })
  return screenshotPath
}

async function captureLocatorUnion(page, locators, directory, filename, padding = 10) {
  const boxes = []
  for (const locator of locators) {
    const box = await locator.boundingBox()
    if (box) {
      boxes.push(box)
    }
  }
  if (!boxes.length) {
    throw new Error(`Could not compute a screenshot clip for ${filename}.`)
  }
  const screenshotPath = path.join(directory, filename)
  const left = Math.max(0, Math.min(...boxes.map((box) => box.x)) - padding)
  const top = Math.max(0, Math.min(...boxes.map((box) => box.y)) - padding)
  const right = Math.max(...boxes.map((box) => box.x + box.width)) + padding
  const bottom = Math.max(...boxes.map((box) => box.y + box.height)) + padding
  await page.screenshot({
    path: screenshotPath,
    clip: {
      x: left,
      y: top,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top),
    },
  })
  return screenshotPath
}

function roundMetric(value) {
  return Math.round(value * 100) / 100
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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
