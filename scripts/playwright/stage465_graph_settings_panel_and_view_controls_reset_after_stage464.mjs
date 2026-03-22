import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE465_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE465_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE465_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE465_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE465_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE465_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage465-graph-settings-panel-and-view-controls-reset-after-stage464-failure.png',
  ),
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

  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage465-graph-wide-top.png')

  await ensureSettingsOpen(desktopPage)
  const graphSettingsDrawerWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByRole('complementary', { name: 'Graph settings sidebar' }).first(),
    outputDir,
    'stage465-graph-settings-drawer-wide-top.png',
    'locator',
  )
  const graphDepthControlsWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.locator('.recall-graph-sidebar-section-depth-reset').first(),
    outputDir,
    'stage465-graph-depth-controls-wide-top.png',
    'locator',
  )

  await ensureToggleButtonPressed(desktopPage, '3+ hops')
  await ensureToggleButtonPressed(desktopPage, 'Spread')
  const graphLayoutControlsWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.locator('.recall-graph-sidebar-section-layout-reset').first(),
    outputDir,
    'stage465-graph-layout-controls-wide-top.png',
    'locator',
  )

  await ensureToggleButtonPressed(desktopPage, 'Hover focus')
  const hoverNode = await getPreferredGraphNode(desktopPage)
  await hoverNode.nodeButton.hover()
  await desktopPage.waitForTimeout(250)
  const graphHoverFocusCanvasWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).first(),
    outputDir,
    'stage465-graph-hover-focus-canvas-wide-top.png',
    'locator',
  )

  await hoverNode.nodeButton.click()
  await desktopPage.getByRole('button', { name: 'Open details' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const graphSettingsDrawerSelectedWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByRole('complementary', { name: 'Graph settings sidebar' }).first(),
    outputDir,
    'stage465-graph-settings-drawer-selected-wide-top.png',
    'locator',
  )
  const graphBottomRailSelectedWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.locator('.recall-graph-focus-rail').first(),
    outputDir,
    'stage465-graph-bottom-rail-selected-wide-top.png',
    'locator',
  )

  const graphDetailDock = desktopPage.getByLabel('Node detail dock').first()
  const graphDetailDockPeekWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDetailDock,
    outputDir,
    'stage465-graph-detail-dock-peek-wide-top.png',
    'locator',
  )

  await desktopPage.getByRole('button', { name: 'Open details' }).click()
  await desktopPage.getByRole('button', { name: 'Close details' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const graphDetailDockExpandedWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDetailDock,
    outputDir,
    'stage465-graph-detail-dock-expanded-wide-top.png',
    'locator',
  )

  await writeFile(
    path.join(
      outputDir,
      'stage465-graph-settings-panel-and-view-controls-reset-after-stage464-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphBottomRailSelectedWideTop,
          graphDepthControlsWideTop,
          graphDetailDockExpandedWideTop,
          graphDetailDockPeekWideTop,
          graphHoverFocusCanvasWideTop,
          graphLayoutControlsWideTop,
          graphSettingsDrawerSelectedWideTop,
          graphSettingsDrawerWideTop,
          graphWideTop,
        },
        desktopViewport,
        headless,
        hoverNodeLabel: hoverNode.label,
        runtimeBrowser,
        validationFocus: [
          'wide desktop Graph is judged first after the Stage 464 checkpoint',
          'the left drawer should now read as a real settings sidebar with filter, depth, layout, appearance, and visible-node jump controls instead of selected-node inspect content',
          'live view controls should materially change the canvas while selected-node work stays centered in the bottom rail plus the right detail drawer',
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
          'stage465-graph-settings-panel-and-view-controls-reset-after-stage464-failure.png',
        ),
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

async function ensureSettingsOpen(page) {
  const showButton = page.getByRole('button', { name: 'Show settings' })
  if (await showButton.isVisible().catch(() => false)) {
    await showButton.click()
  }
  await page.getByRole('complementary', { name: 'Graph settings sidebar' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
}

async function ensureToggleButtonPressed(page, name) {
  const button = page.getByRole('button', { name })
  await button.waitFor({ state: 'visible', timeout: 20000 })
  if ((await button.getAttribute('aria-pressed')) !== 'true') {
    await button.click()
    await page.waitForTimeout(200)
  }
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

async function getPreferredGraphNode(page) {
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
    throw new Error('Could not find a visible graph node during the Stage 465 run.')
  }

  const nodeButton = nodeButtons.nth(bestIndex)
  const ariaLabel = (await nodeButton.getAttribute('aria-label')) ?? ''
  const label = ariaLabel.replace(/^Select node\s+/, '').trim() || 'Graph node'
  return { label, nodeButton }
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
