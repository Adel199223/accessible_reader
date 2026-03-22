import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE433_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE433_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE433_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE433_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE433_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE433_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage433-graph-canvas-first-drawer-reset-after-stage432-failure.png'), {
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

  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage433-graph-wide-top.png')
  const graphControlSeamWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByLabel('Graph control seam').first(),
    outputDir,
    'stage433-graph-control-seam-wide-top.png',
    220,
  )
  const graphFocusRailWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByLabel('Graph focus rail').first(),
    outputDir,
    'stage433-graph-focus-rail-wide-top.png',
    220,
    'locator',
  )

  await showGraphTools(desktopPage)
  await desktopPage.waitForTimeout(250)

  const graphToolsSidebarWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByRole('complementary', { name: 'Graph tools sidebar' }).first(),
    outputDir,
    'stage433-graph-tools-sidebar-wide-top.png',
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
    'stage433-graph-detail-dock-peek-wide-top.png',
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
    'stage433-graph-detail-dock-expanded-wide-top.png',
    980,
    'locator',
  )

  await writeFile(
    path.join(outputDir, 'stage433-graph-canvas-first-drawer-reset-after-stage432-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphControlSeamWideTop,
          graphDetailDockExpandedWideTop,
          graphDetailDockPeekWideTop,
          graphFocusRailWideTop,
          graphToolsSidebarWideTop,
          graphWideTop,
        },
        desktopViewport,
        headless,
        runtimeBrowser,
        validationFocus: [
          'wide desktop Graph judged first after the Stage 432 checkpoint',
          'evidence of the hidden-by-default tools drawer, slimmer top seam, and stronger bottom path rail',
          'attached inspect drawer proof in peek and expanded states without reviving an empty right lane',
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
        path: path.join(outputDir, 'stage433-graph-canvas-first-drawer-reset-after-stage432-failure.png'),
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

async function selectFirstGraphNode(page) {
  const nodeButton = page.locator('button[aria-label^="Select node "]').first()
  await nodeButton.waitFor({ state: 'visible', timeout: 20000 })
  await nodeButton.click()
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
