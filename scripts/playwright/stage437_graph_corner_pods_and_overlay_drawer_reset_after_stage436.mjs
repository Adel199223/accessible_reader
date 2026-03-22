import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE437_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE437_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE437_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE437_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE437_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE437_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage437-graph-corner-pods-and-overlay-drawer-reset-after-stage436-failure.png'), {
  force: true,
})

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const { browser, runtimeBrowser } = await launchBrowser(chromium)

let desktopPage
try {
  desktopPage = await browser.newPage({ viewport: desktopViewport })
  await desktopPage.goto(`${baseUrl}/recall?section=graph`, { waitUntil: 'networkidle' })
  await desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(350)

  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage437-graph-wide-top.png')
  const graphCornerPodsWideTop = await captureViewportClip(
    desktopPage,
    outputDir,
    'stage437-graph-corner-pods-wide-top.png',
    { x: 92, y: 76, width: 1380, height: 180 },
  )
  const graphPathRailWideTop = await captureViewportClip(
    desktopPage,
    outputDir,
    'stage437-graph-path-rail-wide-top.png',
    { x: 320, y: 752, width: 980, height: 220 },
  )

  await showGraphTools(desktopPage)
  await desktopPage.waitForTimeout(250)

  const graphToolsOverlayWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByRole('complementary', { name: 'Graph tools sidebar' }).first(),
    outputDir,
    'stage437-graph-tools-overlay-wide-top.png',
    980,
  )

  await hideGraphTools(desktopPage)
  await selectFirstGraphNode(desktopPage)
  await desktopPage.getByRole('button', { name: 'Open details' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const graphDetailDock = desktopPage.getByLabel('Node detail dock').first()
  const graphDetailDockPeekWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDetailDock,
    outputDir,
    'stage437-graph-detail-dock-peek-wide-top.png',
    980,
    'locator',
  )

  await desktopPage.getByRole('button', { name: 'Open details' }).click()
  await desktopPage.getByRole('button', { name: 'Close details' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const graphDetailDockExpandedWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDetailDock,
    outputDir,
    'stage437-graph-detail-dock-expanded-wide-top.png',
    980,
    'locator',
  )

  await writeFile(
    path.join(outputDir, 'stage437-graph-corner-pods-and-overlay-drawer-reset-after-stage436-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphCornerPodsWideTop,
          graphDetailDockExpandedWideTop,
          graphDetailDockPeekWideTop,
          graphPathRailWideTop,
          graphToolsOverlayWideTop,
          graphWideTop,
        },
        desktopViewport,
        headless,
        runtimeBrowser,
        validationFocus: [
          'wide desktop Graph judged first after the Stage 436 checkpoint',
          'evidence of compact corner pods, an overlay tools drawer, and a smaller floating path rail over a stable canvas',
          'attached inspect drawer proof in peek and expanded states without shrinking the main graph field',
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
        path: path.join(outputDir, 'stage437-graph-corner-pods-and-overlay-drawer-reset-after-stage436-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function showGraphTools(page) {
  const toolsSidebar = page.getByRole('complementary', { name: 'Graph tools sidebar' }).first()
  if (await toolsSidebar.isVisible().catch(() => false)) {
    return
  }

  const showToolsButton = page.getByRole('button', { name: 'Show tools' }).first()
  await showToolsButton.waitFor({ state: 'visible', timeout: 20000 })
  await showToolsButton.click()
  await toolsSidebar.waitFor({ state: 'visible', timeout: 20000 })
}

async function hideGraphTools(page) {
  const toolsSidebar = page.getByRole('complementary', { name: 'Graph tools sidebar' }).first()
  if (!(await toolsSidebar.isVisible().catch(() => false))) {
    return
  }

  const hideToolsButton = page.getByRole('button', { name: 'Hide tools' }).first()
  await hideToolsButton.waitFor({ state: 'visible', timeout: 20000 })
  await hideToolsButton.click()
  await toolsSidebar.waitFor({ state: 'hidden', timeout: 20000 })
}

async function captureViewportScreenshot(page, directory, filename) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath })
  return screenshotPath
}

async function captureViewportClip(page, directory, filename, clip) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath, clip })
  return screenshotPath
}

async function captureLocatorTopScreenshot(page, locator, directory, filename, maxHeight = 720, scrollMode = 'pageTop') {
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

async function selectFirstGraphNode(page) {
  const nodeButtons = page.locator('button[aria-label^="Select node "]')
  const count = await nodeButtons.count()
  const viewport = page.viewportSize() ?? desktopViewport
  const preferredLeftEdge = 260
  const preferredRightEdge = viewport.width - 320
  const preferredTopEdge = 180
  const preferredBottomEdge = viewport.height - 220
  let bestIndex = -1
  let bestScore = Number.POSITIVE_INFINITY

  for (let index = 0; index < count; index += 1) {
    const nodeButton = nodeButtons.nth(index)
    if (!(await nodeButton.isVisible().catch(() => false))) {
      continue
    }

    const box = await nodeButton.boundingBox()
    if (!box) {
      continue
    }

    const centerX = box.x + box.width / 2
    const centerY = box.y + box.height / 2
    const outsidePreferredBounds =
      centerX < preferredLeftEdge ||
      centerX > preferredRightEdge ||
      centerY < preferredTopEdge ||
      centerY > preferredBottomEdge

    const score =
      Math.abs(centerX - viewport.width / 2) +
      Math.abs(centerY - viewport.height / 2) +
      (outsidePreferredBounds ? 1000 : 0)

    if (score < bestScore) {
      bestIndex = index
      bestScore = score
    }
  }

  if (bestIndex < 0) {
    throw new Error('Could not find a visible graph node to select during the Stage 437 run.')
  }

  const nodeButton = nodeButtons.nth(bestIndex)
  await nodeButton.waitFor({ state: 'visible', timeout: 20000 })

  try {
    await nodeButton.click()
  } catch {
    await nodeButton.evaluate((element) => {
      element.click()
    })
  }
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

async function launchBrowser(chromium) {
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
    const browser = await chromium.launch({ headless })
    return { browser, runtimeBrowser: 'chromium' }
  }
}
