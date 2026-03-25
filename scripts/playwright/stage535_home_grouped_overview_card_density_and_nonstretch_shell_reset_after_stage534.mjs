import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE535_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE535_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE535_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE535_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE535_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE535_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const minimumOverviewHeightSpread = 60

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage535-home-grouped-overview-card-density-and-nonstretch-shell-reset-after-stage534-failure.png',
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
  const homeOverviewEvidence = await captureHomeOverviewEvidence(page, outputDir, 'stage535')

  await writeFile(
    path.join(
      outputDir,
      'stage535-home-grouped-overview-card-density-and-nonstretch-shell-reset-after-stage534-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: homeOverviewEvidence.captures,
        desktopViewport,
        footerCount: homeOverviewEvidence.footerCount,
        headless,
        homeOverviewCardCount: homeOverviewEvidence.cardCount,
        minimumOverviewHeightSpread,
        overviewCardMetrics: homeOverviewEvidence.cardMetrics,
        overviewClassNames: homeOverviewEvidence.classNames,
        overviewHeightSpread: homeOverviewEvidence.heightSpread,
        overviewShortestHeight: homeOverviewEvidence.shortestHeight,
        overviewTallestHeight: homeOverviewEvidence.tallestHeight,
        runtimeBrowser,
        validationFocus: [
          'wide desktop Home keeps the grouped overview open while card shells read denser and less panel-like',
          'shorter grouped-overview columns should now stop stretching to the tallest card so the board keeps visible height contrast',
          'the grouped-overview footer treatment should feel lighter and more attached to the card body than the Stage 534 baseline',
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
          'stage535-home-grouped-overview-card-density-and-nonstretch-shell-reset-after-stage534-failure.png',
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

  const overviewGrid = savedLibraryOverview.locator('.recall-home-library-stream-grid-stage535-reset').first()
  await overviewGrid.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(300)

  const overviewCards = await getVisibleLocators(savedLibraryOverview, '.recall-home-library-card-stage535-reset')
  if (overviewCards.length < 2) {
    throw new Error(`Expected at least 2 visible grouped-overview cards but found ${overviewCards.length}.`)
  }

  const overviewFooters = await getVisibleLocators(savedLibraryOverview, '.recall-home-library-section-footer-stage535-reset')
  if (!overviewFooters.length) {
    throw new Error('Could not find a visible grouped-overview footer for the Stage 535 capture.')
  }

  const overviewFooterButton = await getVisibleLocator(savedLibraryOverview, [
    '.recall-home-library-section-footer-button-stage535-reset',
  ])

  const cardMetrics = []
  for (const card of overviewCards) {
    const box = await card.boundingBox()
    if (!box) {
      continue
    }
    const title = await getCardTitle(card)
    cardMetrics.push({
      className: ((await card.getAttribute('class').catch(() => '')) ?? '').trim(),
      height: roundMetric(box.height),
      title,
      width: roundMetric(box.width),
    })
  }

  if (cardMetrics.length < 2) {
    throw new Error(`Expected at least 2 measurable grouped-overview cards but found ${cardMetrics.length}.`)
  }

  const heights = cardMetrics.map((metric) => metric.height)
  const tallestHeight = roundMetric(Math.max(...heights))
  const shortestHeight = roundMetric(Math.min(...heights))
  const heightSpread = roundMetric(tallestHeight - shortestHeight)
  if (heightSpread < minimumOverviewHeightSpread) {
    throw new Error(
      `Grouped-overview card height spread (${heightSpread}px) stayed too small; the board still looks stretched instead of content-sized.`,
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
  const homeOverviewColumnsWideTop = await captureLocatorUnion(
    page,
    overviewCards,
    directory,
    `${stagePrefix}-home-overview-columns-wide-top.png`,
  )
  const homeOverviewFooterWideTop = await captureLocatorUnion(
    page,
    overviewFooters,
    directory,
    `${stagePrefix}-home-overview-footer-wide-top.png`,
  )

  return {
    captures: {
      homeOverviewBoardWideTop,
      homeOverviewColumnsWideTop,
      homeOverviewFooterWideTop,
      homeWideTop,
    },
    cardCount: cardMetrics.length,
    cardMetrics,
    classNames: {
      footerButtonClassName: ((await overviewFooterButton.getAttribute('class').catch(() => '')) ?? '').trim(),
      overviewGridClassName: ((await overviewGrid.getAttribute('class').catch(() => '')) ?? '').trim(),
    },
    footerCount: overviewFooters.length,
    heightSpread,
    shortestHeight,
    tallestHeight,
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

async function getVisibleLocator(scope, selectors) {
  for (const selector of selectors) {
    const matches = await getVisibleLocators(scope, selector)
    if (matches.length) {
      return matches[0]
    }
  }
  throw new Error(`Could not find a visible locator for selectors: ${selectors.join(', ')}`)
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
