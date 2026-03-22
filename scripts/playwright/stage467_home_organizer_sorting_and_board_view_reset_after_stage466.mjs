import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE467_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE467_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE467_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE467_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE467_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE467_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage467-home-organizer-sorting-and-board-view-reset-after-stage466-failure.png',
  ),
  {
    force: true,
  },
)

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const { browser, runtimeBrowser } = await launchBrowser(chromium)

let desktopPage
try {
  desktopPage = await browser.newPage({ viewport: desktopViewport })
  await openHome(desktopPage)

  const homeWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage467-home-wide-top.png')
  const homeOrganizerDeckWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['.recall-home-browse-strip-top-organizer-deck-reset', '[aria-label="Home browse glance"]']),
    outputDir,
    'stage467-home-organizer-deck-wide-top.png',
    460,
    'locator',
  )
  const homeOrganizerListStartWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Saved source groups"]']),
    outputDir,
    'stage467-home-organizer-list-start-wide-top.png',
    760,
    'locator',
  )
  const homeInlineReopenStripWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['.recall-home-reopen-shelf-results-sheet-reset', '[aria-label="Pinned reopen shelf"]']),
    outputDir,
    'stage467-home-inline-reopen-strip-wide-top.png',
    420,
    'locator',
  )
  const homeActiveBoardStateWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Saved library"]']),
    outputDir,
    'stage467-home-active-board-state-wide-top.png',
    880,
    'locator',
  )

  await ensureToggleButtonPressed(desktopPage, 'List')
  const homeListViewStateWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Saved library"]']),
    outputDir,
    'stage467-home-list-view-state-wide-top.png',
    880,
    'locator',
  )

  const filterQuery = await deriveHomeFilterQuery(desktopPage)
  await setHomeSearch(desktopPage, filterQuery)
  await desktopPage.getByRole('region', { name: 'Matching saved sources' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)
  await ensureToggleButtonPressed(desktopPage, 'Created')
  await ensureToggleButtonPressed(desktopPage, 'Oldest')
  await ensureToggleButtonPressed(desktopPage, 'List')
  const homeFilteredResultsListWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Matching saved sources"]']),
    outputDir,
    'stage467-home-filtered-results-list-wide-top.png',
    880,
    'locator',
  )

  await writeFile(
    path.join(
      outputDir,
      'stage467-home-organizer-sorting-and-board-view-reset-after-stage466-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          homeActiveBoardStateWideTop,
          homeFilteredResultsListWideTop,
          homeInlineReopenStripWideTop,
          homeOrganizerDeckWideTop,
          homeOrganizerListStartWideTop,
          homeListViewStateWideTop,
          homeWideTop,
        },
        desktopViewport,
        filterQuery,
        headless,
        runtimeBrowser,
        validationFocus: [
          'wide desktop Home is judged first after the Stage 466 checkpoint',
          'evidence centers an organizer-owned control deck with richer Updated, Created, A-Z, direction, and Board/List controls instead of a narrow Recent-only model',
          'the active board and filtered results should both show a real list-view state while pinned reopen continuity stays attached inside the same working shell',
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
        path: path.join(
          outputDir,
          'stage467-home-organizer-sorting-and-board-view-reset-after-stage466-failure.png',
        ),
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
  await page.locator('[aria-label="Home control seam"]').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function deriveHomeFilterQuery(page) {
  const sourceButton = await getVisibleLocator(page, [
    '[aria-label="Saved library"] button[aria-label^="Open "]',
    '[aria-label="Pinned reopen shelf"] button[aria-label^="Open "]',
    '.recall-home-library-stage-row',
    '.recall-home-continue-row',
    '.recall-library-list-row',
  ])
  const sourceTitle = await getSourceTitle(sourceButton)
  return createSearchQueryFromTitle(sourceTitle)
}

async function setHomeSearch(page, value) {
  const searchbox = page.getByRole('searchbox', { name: 'Search saved sources' })
  await searchbox.fill(value)
}

async function ensureToggleButtonPressed(page, name) {
  const button = page.getByRole('button', { name })
  await button.waitFor({ state: 'visible', timeout: 20000 })
  if ((await button.getAttribute('aria-pressed')) !== 'true') {
    await button.click()
    await page.waitForTimeout(200)
  }
}

function createSearchQueryFromTitle(title) {
  const normalizedWords = title
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)
  if (normalizedWords.length >= 2) {
    return normalizedWords.slice(0, 2).join(' ')
  }
  return title
}

async function getSourceTitle(buttonLocator) {
  const ariaLabel = await buttonLocator.getAttribute('aria-label')
  if (ariaLabel?.startsWith('Open ')) {
    return ariaLabel.replace(/^Open /, '')
  }
  const text = (await buttonLocator.textContent())?.trim()
  if (text) {
    return text.split('\n')[0].trim()
  }
  throw new Error('Could not derive a source title from the Home opener button.')
}

async function captureViewportScreenshot(page, directory, filename) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath })
  return screenshotPath
}

async function captureLocatorTopScreenshot(page, locator, directory, filename, maxHeight = 720, scrollMode = 'pageTop') {
  if (scrollMode === 'locator') {
    await locator.scrollIntoViewIfNeeded()
  } else {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  }
  await page.waitForTimeout(150)

  let box = await locator.boundingBox()
  if (!box) {
    throw new Error(`Could not resolve a bounding box for ${filename}.`)
  }

  let viewportSize = page.viewportSize() ?? desktopViewport
  let clipX = Math.max(0, Math.floor(box.x))
  let clipY = Math.max(0, Math.floor(box.y))
  let clipWidth = Math.min(Math.ceil(box.width), viewportSize.width - clipX)
  let clipHeight = Math.min(Math.ceil(box.height), maxHeight, viewportSize.height - clipY)

  if (clipWidth <= 0 || clipHeight <= 0) {
    await locator.scrollIntoViewIfNeeded()
    await page.waitForTimeout(150)
    box = await locator.boundingBox()
    if (!box) {
      throw new Error(`Could not resolve a bounding box for ${filename} after scrolling.`)
    }
    viewportSize = page.viewportSize() ?? desktopViewport
    clipX = Math.max(0, Math.floor(box.x))
    clipY = Math.max(0, Math.floor(box.y))
    clipWidth = Math.min(Math.ceil(box.width), viewportSize.width - clipX)
    clipHeight = Math.min(Math.ceil(box.height), maxHeight, viewportSize.height - clipY)
  }

  if (clipWidth <= 0 || clipHeight <= 0) {
    throw new Error(`Calculated an empty clip for ${filename}.`)
  }

  const screenshotPath = path.join(directory, filename)
  await page.screenshot({
    path: screenshotPath,
    clip: {
      height: clipHeight,
      width: clipWidth,
      x: clipX,
      y: clipY,
    },
  })
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

async function launchBrowser(chromium) {
  if (preferredChannel) {
    try {
      const browser = await chromium.launch({
        channel: preferredChannel,
        headless,
      })
      return { browser, runtimeBrowser: preferredChannel }
    } catch (error) {
      if (!allowChromiumFallback) {
        throw error
      }
    }
  }

  const browser = await chromium.launch({ headless })
  return { browser, runtimeBrowser: 'chromium' }
}

function resolveHarnessDir(value) {
  if (process.platform === 'win32') {
    return value
  }
  const windowsDriveMatch = value.match(/^([A-Za-z]):\\(.*)$/)
  if (!windowsDriveMatch) {
    return value
  }
  const [, drive, rest] = windowsDriveMatch
  return `/mnt/${drive.toLowerCase()}/${rest.replace(/\\/g, '/')}`
}
