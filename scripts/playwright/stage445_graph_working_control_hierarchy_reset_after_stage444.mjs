import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE445_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE445_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE445_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE445_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE445_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE445_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage445-graph-working-control-hierarchy-reset-after-stage444-failure.png'), {
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

  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage445-graph-wide-top.png')
  const graphLauncherPodWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.locator('.recall-graph-browser-control-overlay-primary').first(),
    outputDir,
    'stage445-graph-launcher-pod-wide-top.png',
  )
  const graphSearchStatusPodWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.locator('.recall-graph-browser-control-actions-overlay').first(),
    outputDir,
    'stage445-graph-search-status-pod-wide-top.png',
  )
  const graphWorkingTrailWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.locator('.recall-graph-focus-rail').first(),
    outputDir,
    'stage445-graph-working-trail-wide-top.png',
    'locator',
  )

  await showGraphTools(desktopPage)
  await desktopPage.waitForTimeout(250)

  const graphToolsOverlayWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByRole('complementary', { name: 'Graph tools sidebar' }).first(),
    outputDir,
    'stage445-graph-tools-overlay-wide-top.png',
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
    'stage445-graph-detail-dock-peek-wide-top.png',
    'locator',
  )
  const graphWorkingTrailActiveWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.locator('.recall-graph-focus-rail').first(),
    outputDir,
    'stage445-graph-working-trail-active-wide-top.png',
    'locator',
  )

  await desktopPage.getByRole('button', { name: 'Open details' }).click()
  await desktopPage.getByRole('button', { name: 'Close details' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const graphDetailDockExpandedWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDetailDock,
    outputDir,
    'stage445-graph-detail-dock-expanded-wide-top.png',
    'locator',
  )

  await writeFile(
    path.join(outputDir, 'stage445-graph-working-control-hierarchy-reset-after-stage444-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphDetailDockExpandedWideTop,
          graphDetailDockPeekWideTop,
          graphLauncherPodWideTop,
          graphSearchStatusPodWideTop,
          graphToolsOverlayWideTop,
          graphWideTop,
          graphWorkingTrailActiveWideTop,
          graphWorkingTrailWideTop,
        },
        desktopViewport,
        headless,
        runtimeBrowser,
        validationFocus: [
          'wide desktop Graph judged first after the Stage 444 checkpoint',
          'evidence of a lighter launcher pod, a slimmer search-status pod, and a more active working trail over the stable canvas',
          'tools overlay plus inspect peek and expanded states still prove the canvas-first hierarchy without reopening generated-content Reader work',
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
        path: path.join(outputDir, 'stage445-graph-working-control-hierarchy-reset-after-stage444-failure.png'),
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
    throw new Error('Could not find a visible graph node to select during the Stage 445 run.')
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
