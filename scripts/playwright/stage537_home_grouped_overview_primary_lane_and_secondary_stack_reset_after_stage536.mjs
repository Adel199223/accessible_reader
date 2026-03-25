import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE537_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE537_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE537_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE537_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE537_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE537_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const minimumPrimaryWidthDelta = 80
const maximumSecondaryColumnXSpread = 12
const minimumSecondaryRowTopDelta = 60

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage537-home-grouped-overview-primary-lane-and-secondary-stack-reset-after-stage536-failure.png',
  ),
  { force: true },
)

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)
const { browser, runtimeBrowser } = await launchBrowser(chromium)

let page
try {
  page = await browser.newPage({ viewport: desktopViewport })
  const homeOverviewEvidence = await captureHomeOverviewEvidence(page, outputDir, 'stage537')

  await writeFile(
    path.join(
      outputDir,
      'stage537-home-grouped-overview-primary-lane-and-secondary-stack-reset-after-stage536-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: homeOverviewEvidence.captures,
        desktopViewport,
        headless,
        minimumPrimaryWidthDelta,
        minimumSecondaryRowTopDelta,
        maximumSecondaryColumnXSpread,
        overviewCardMetrics: homeOverviewEvidence.cardMetrics,
        overviewLayoutMetrics: homeOverviewEvidence.layoutMetrics,
        runtimeBrowser,
        validationFocus: [
          'wide desktop Home keeps the grouped overview open while the dominant source group reads like the main working lane',
          'the shorter grouped-overview groups should now compact into a tighter secondary stack instead of equal-width columns',
          'the rebalance should reduce remaining dead page area without widening into selected-group or generated-content Reader work',
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
        path: path.join(
          outputDir,
          'stage537-home-grouped-overview-primary-lane-and-secondary-stack-reset-after-stage536-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function captureHomeOverviewEvidence(page, directory, stagePrefix) {
  await openHome(page)
  await ensureToggleButtonPressed(page, 'Collections')
  await ensureToggleButtonPressed(page, 'Board')
  await clearHomeSearch(page)
  await ensureGroupedOverviewSelected(page)

  const savedLibraryOverview = page.getByRole('region', { name: 'Saved library overview' }).first()
  await savedLibraryOverview.waitFor({ state: 'visible', timeout: 20000 })

  const overviewGrid = savedLibraryOverview.locator('.recall-home-library-stream-grid-stage537-reset').first()
  await overviewGrid.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(300)

  const overviewCards = await getVisibleLocators(savedLibraryOverview, '.recall-home-library-card-stage535-reset')
  const primaryCards = await getVisibleLocators(savedLibraryOverview, '.recall-home-library-card-stage537-primary-reset')
  const secondaryCards = await getVisibleLocators(savedLibraryOverview, '.recall-home-library-card-stage537-secondary-reset')
  if (overviewCards.length !== 3 || primaryCards.length !== 1 || secondaryCards.length !== 2) {
    throw new Error(
      `Expected 3 overview cards with a 1/2 primary-secondary split but found cards=${overviewCards.length}, primary=${primaryCards.length}, secondary=${secondaryCards.length}.`,
    )
  }

  const cardMetrics = []
  for (const card of overviewCards) {
    const metric = await getCardMetric(card)
    if (metric) {
      cardMetrics.push(metric)
    }
  }

  const primaryMetric = await getCardMetric(primaryCards[0])
  const secondaryMetrics = []
  for (const card of secondaryCards) {
    const metric = await getCardMetric(card)
    if (metric) {
      secondaryMetrics.push(metric)
    }
  }

  if (!primaryMetric || secondaryMetrics.length !== 2) {
    throw new Error('Could not measure the primary lane and secondary stack cards for the Stage 537 validation.')
  }

  const primaryWidthDelta = roundMetric(
    primaryMetric.width - Math.max(...secondaryMetrics.map((metric) => metric.width)),
  )
  const secondaryColumnXSpread = roundMetric(
    Math.max(...secondaryMetrics.map((metric) => metric.x)) - Math.min(...secondaryMetrics.map((metric) => metric.x)),
  )
  const secondaryRowTopDelta = roundMetric(
    Math.abs(secondaryMetrics[1].y - secondaryMetrics[0].y),
  )

  if (primaryWidthDelta < minimumPrimaryWidthDelta) {
    throw new Error(
      `Primary lane width delta (${primaryWidthDelta}px) stayed too small; the grouped overview still reads like equal-width columns.`,
    )
  }
  if (secondaryColumnXSpread > maximumSecondaryColumnXSpread) {
    throw new Error(
      `Secondary stack column drift (${secondaryColumnXSpread}px) stayed too large; the compact right-hand stack did not hold.`,
    )
  }
  if (secondaryRowTopDelta < minimumSecondaryRowTopDelta) {
    throw new Error(
      `Secondary stack row offset (${secondaryRowTopDelta}px) stayed too small; the shorter groups did not separate into a vertical stack.`,
    )
  }

  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)
  const homeOverviewBoardWideTop = await captureLocatorTopScreenshot(
    page,
    savedLibraryOverview,
    directory,
    `${stagePrefix}-home-overview-board-wide-top.png`,
    960,
  )
  const homeOverviewLaneCompositionWideTop = await captureLocatorUnion(
    page,
    overviewCards,
    directory,
    `${stagePrefix}-home-overview-lane-composition-wide-top.png`,
  )
  const homeOverviewSecondaryStackWideTop = await captureLocatorUnion(
    page,
    secondaryCards,
    directory,
    `${stagePrefix}-home-overview-secondary-stack-wide-top.png`,
  )

  return {
    captures: {
      homeOverviewBoardWideTop,
      homeOverviewLaneCompositionWideTop,
      homeOverviewSecondaryStackWideTop,
      homeWideTop,
    },
    cardMetrics,
    layoutMetrics: {
      primaryCard: primaryMetric,
      primaryWidthDelta,
      secondaryCards: secondaryMetrics,
      secondaryColumnXSpread,
      secondaryRowTopDelta,
    },
  }
}

async function openHome(page) {
  const response = await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Home navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.locator('.recall-home-workspace').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('searchbox', { name: 'Search saved sources' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function ensureToggleButtonPressed(page, name) {
  const button = page.getByRole('button', { name, exact: true }).first()
  await button.waitFor({ state: 'visible', timeout: 20000 })
  if ((await button.getAttribute('aria-pressed')) !== 'true') {
    await button.click()
    await page.waitForTimeout(200)
  }
}

async function clearHomeSearch(page) {
  const searchbox = page.getByRole('searchbox', { name: 'Search saved sources' })
  await searchbox.waitFor({ state: 'visible', timeout: 20000 })
  if ((await searchbox.inputValue()) !== '') {
    await searchbox.fill('')
    await page.waitForTimeout(200)
  }
}

async function ensureGroupedOverviewSelected(page) {
  const browseStrip = page.getByRole('complementary', { name: 'Home browse strip' }).first()
  await browseStrip.waitFor({ state: 'visible', timeout: 20000 })
  const overviewButton = browseStrip.getByRole('button', { name: /All collections/i }).first()
  await overviewButton.waitFor({ state: 'visible', timeout: 20000 })
  if ((await overviewButton.getAttribute('aria-pressed')) !== 'true') {
    await overviewButton.click()
    await page.waitForTimeout(250)
  }
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

async function getCardMetric(card) {
  const box = await card.boundingBox()
  if (!box) {
    return null
  }
  return {
    className: ((await card.getAttribute('class').catch(() => '')) ?? '').trim(),
    height: roundMetric(box.height),
    title: await getCardTitle(card),
    width: roundMetric(box.width),
    x: roundMetric(box.x),
    y: roundMetric(box.y),
  }
}

async function getCardTitle(card) {
  const heading = ((await card.locator('h3').first().textContent().catch(() => '')) ?? '').trim()
  if (heading) {
    return heading
  }
  const fallback = ((await card.textContent().catch(() => '')) ?? '').trim()
  return fallback ? fallback.split('\n')[0].trim() : 'Grouped overview card'
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
