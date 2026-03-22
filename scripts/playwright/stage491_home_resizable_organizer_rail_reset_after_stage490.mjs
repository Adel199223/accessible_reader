import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE491_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE491_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE491_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE491_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE491_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE491_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage491-home-resizable-organizer-rail-reset-after-stage490-failure.png',
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

  const homeWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage491-home-wide-top.png')
  const browseStrip = desktopPage.getByRole('complementary', { name: 'Home browse strip' })
  const organizerWidthBefore = await getHomeOrganizerWidth(browseStrip)
  const homeOrganizerDefaultWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    browseStrip,
    outputDir,
    'stage491-home-organizer-default-wide-top.png',
    980,
    'locator',
  )

  await setHomeOrganizerWidthToMax(desktopPage)
  const organizerWidthAfter = await getHomeOrganizerWidth(browseStrip)
  const homeOrganizerWideRailWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    browseStrip,
    outputDir,
    'stage491-home-organizer-wide-rail-wide-top.png',
    980,
    'locator',
  )

  await ensureToggleButtonPressed(desktopPage, 'Recent')
  const { group, groupLabel } = await selectHomeBrowseBranchForCapture(desktopPage)
  const homeOrganizerWideBranchWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    group,
    outputDir,
    'stage491-home-organizer-wide-branch-wide-top.png',
    860,
    'locator',
  )

  await desktopPage.getByRole('button', { name: 'Hide organizer' }).click()
  await desktopPage.getByRole('group', { name: 'Compact organizer controls' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)
  const homeCompactControlsWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, [
      '.recall-home-compact-control-deck-organizer-control-reset',
      '[aria-label="Compact organizer controls"]',
    ]),
    outputDir,
    'stage491-home-compact-controls-wide-top.png',
    320,
    'locator',
  )

  await writeFile(
    path.join(
      outputDir,
      'stage491-home-resizable-organizer-rail-reset-after-stage490-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          homeCompactControlsWideTop,
          homeOrganizerDefaultWideTop,
          homeOrganizerWideBranchWideTop,
          homeOrganizerWideRailWideTop,
          homeWideTop,
        },
        desktopViewport,
        groupLabel,
        headless,
        organizerWidth: {
          default: organizerWidthBefore,
          widened: organizerWidthAfter,
        },
        runtimeBrowser,
        validationFocus: [
          'wide desktop Home should now expose a real organizer resize workflow instead of a fixed narrow rail',
          'the widened organizer should make branch-owned browsing feel more like a Recall working rail for longer names',
          'the organizer-hidden compact controls should remain the fallback instead of being displaced by the new resize behavior',
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
          'stage491-home-resizable-organizer-rail-reset-after-stage490-failure.png',
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
  await page.getByRole('region', { name: 'Primary saved source flow' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('searchbox', { name: 'Search saved sources' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function ensureToggleButtonPressed(page, name) {
  const button = page.getByRole('button', { name })
  await button.waitFor({ state: 'visible', timeout: 20000 })
  if ((await button.getAttribute('aria-pressed')) !== 'true') {
    await button.click()
    await page.waitForTimeout(250)
  }
}

async function setHomeOrganizerWidthToMax(page) {
  const resizeHandle = page.getByRole('separator', { name: 'Resize Home organizer' })
  await resizeHandle.waitFor({ state: 'visible', timeout: 20000 })
  await resizeHandle.focus()
  await resizeHandle.press('End')
  await waitForCondition(async () => (await getHomeOrganizerWidth(page.getByRole('complementary', { name: 'Home browse strip' }))) >= 388, 'The Home organizer did not widen to its maximum width during the Stage 491 run.')
  await page.waitForTimeout(250)
}

async function getHomeOrganizerWidth(locator) {
  return Math.round(
    await locator.evaluate((node) => {
      const width = Number.parseFloat(window.getComputedStyle(node).width)
      return Number.isFinite(width) ? width : 0
    }),
  )
}

async function selectHomeBrowseBranchForCapture(page) {
  const groups = page.locator('.recall-home-browse-group')
  const groupCount = await groups.count()
  if (!groupCount) {
    throw new Error('Could not find any Home organizer groups to capture during the Stage 491 run.')
  }

  let fallbackGroup = null
  let fallbackLabel = null

  for (let index = 0; index < groupCount; index += 1) {
    const group = groups.nth(index)
    const button = group.locator('.recall-home-browse-group-button').first()
    if (!(await button.isVisible().catch(() => false))) {
      continue
    }

    const groupLabel = await getHomeBrowseGroupLabel(button)
    await button.click()
    await page.waitForTimeout(250)

    if ((await countHomeOrganizerBranchSources(group)) > 0) {
      return { group, groupLabel }
    }

    if (!fallbackGroup) {
      fallbackGroup = group
      fallbackLabel = groupLabel
    }
  }

  if (fallbackGroup && fallbackLabel) {
    return { group: fallbackGroup, groupLabel: fallbackLabel }
  }

  throw new Error('Could not find an active Home organizer branch to capture during the Stage 491 run.')
}

async function countHomeOrganizerBranchSources(group) {
  return await group.locator('button[aria-label^="Open "]').count()
}

async function getHomeBrowseGroupLabel(button) {
  const text = (await button.textContent())?.trim()
  if (!text) {
    return 'Unknown group'
  }
  return text.split('\n')[0].trim()
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

async function waitForCondition(callback, message, timeoutMs = 20000, intervalMs = 150) {
  const startTime = Date.now()
  while (Date.now() - startTime < timeoutMs) {
    if (await callback()) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
  throw new Error(message)
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
