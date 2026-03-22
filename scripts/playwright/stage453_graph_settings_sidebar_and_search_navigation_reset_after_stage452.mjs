import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE453_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE453_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE453_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE453_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE453_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE453_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage453-graph-settings-sidebar-and-search-navigation-reset-after-stage452-failure.png'), {
  force: true,
})

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const { browser, runtimeBrowser } = await launchBrowser(chromium)

let desktopPage
try {
  desktopPage = await browser.newPage({ viewport: desktopViewport })
  await openGraph(desktopPage)

  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage453-graph-wide-top.png')
  const graphLauncherPodWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.locator('.recall-graph-browser-control-overlay-primary').first(),
    outputDir,
    'stage453-graph-launcher-pod-wide-top.png',
  )

  const { label: searchNodeLabel } = await getPreferredGraphNode(desktopPage)
  await searchGraphForNode(desktopPage, searchNodeLabel)

  const graphSearchNavigationCornerWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.locator('.recall-graph-browser-control-actions-overlay').first(),
    outputDir,
    'stage453-graph-search-navigation-corner-wide-top.png',
  )

  await showGraphSettings(desktopPage)
  await desktopPage.waitForTimeout(250)

  const graphSettingsSidebarWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByRole('complementary', { name: 'Graph settings sidebar' }).first(),
    outputDir,
    'stage453-graph-settings-sidebar-wide-top.png',
  )

  await hideGraphSettings(desktopPage)
  await hoverGraphNode(desktopPage, searchNodeLabel)

  const graphHoverPreviewWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.locator('.recall-graph-hover-preview').first(),
    outputDir,
    'stage453-graph-hover-preview-wide-top.png',
    'locator',
  )

  await resetGraphView(desktopPage)

  const { label: selectedNodeLabel } = await selectPreferredGraphNode(desktopPage)
  await desktopPage.getByRole('button', { name: 'Open details' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const graphWorkingTrailWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.locator('.recall-graph-focus-rail').first(),
    outputDir,
    'stage453-graph-working-trail-wide-top.png',
    'locator',
  )
  const graphDetailDock = desktopPage.getByLabel('Node detail dock').first()
  const graphDetailDockPeekWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDetailDock,
    outputDir,
    'stage453-graph-detail-dock-peek-wide-top.png',
    'locator',
  )

  await desktopPage.getByRole('button', { name: 'Open details' }).click()
  await desktopPage.getByRole('button', { name: 'Close details' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const graphDetailDockExpandedWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDetailDock,
    outputDir,
    'stage453-graph-detail-dock-expanded-wide-top.png',
    'locator',
  )

  await writeFile(
    path.join(outputDir, 'stage453-graph-settings-sidebar-and-search-navigation-reset-after-stage452-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphDetailDockExpandedWideTop,
          graphDetailDockPeekWideTop,
          graphHoverPreviewWideTop,
          graphLauncherPodWideTop,
          graphSearchNavigationCornerWideTop,
          graphSettingsSidebarWideTop,
          graphWideTop,
          graphWorkingTrailWideTop,
        },
        desktopViewport,
        headless,
        runtimeBrowser,
        searchNodeLabel,
        selectedNodeLabel,
        validationFocus: [
          'wide desktop Graph judged first after the Stage 452 checkpoint',
          'evidence of a minimal settings launcher, a distinct search-navigation corner, and a settings-owned filter model over the canvas-first graph',
          'hover preview, working trail, and peek plus expanded inspect drawer states confirm that exploration is lighter at rest while selected-node workflow still lives in the bottom rail and right drawer',
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
        path: path.join(outputDir, 'stage453-graph-settings-sidebar-and-search-navigation-reset-after-stage452-failure.png'),
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

async function showGraphSettings(page) {
  const settingsSidebar = page.getByRole('complementary', { name: 'Graph settings sidebar' }).first()
  if (await settingsSidebar.isVisible().catch(() => false)) {
    return
  }

  const showSettingsButton = page.getByRole('button', { name: 'Show settings' }).first()
  await showSettingsButton.waitFor({ state: 'visible', timeout: 20000 })
  await showSettingsButton.click()
  await settingsSidebar.waitFor({ state: 'visible', timeout: 20000 })
}

async function hideGraphSettings(page) {
  const settingsSidebar = page.getByRole('complementary', { name: 'Graph settings sidebar' }).first()
  if (!(await settingsSidebar.isVisible().catch(() => false))) {
    return
  }

  const hideSettingsButton = page.getByRole('button', { name: 'Hide settings' }).first()
  await hideSettingsButton.waitFor({ state: 'visible', timeout: 20000 })
  await hideSettingsButton.click()
  await settingsSidebar.waitFor({ state: 'hidden', timeout: 20000 })
}

async function searchGraphForNode(page, label) {
  const searchBox = page.getByRole('searchbox', { name: 'Search graph' }).first()
  await searchBox.waitFor({ state: 'visible', timeout: 20000 })
  await searchBox.fill(label)
  await page.waitForTimeout(300)
}

async function resetGraphView(page) {
  const resetButton = page.getByRole('button', { name: 'Show all' }).first()
  if (!(await resetButton.isVisible().catch(() => false))) {
    return
  }

  await resetButton.click()
  await page.waitForTimeout(300)
}

async function hoverGraphNode(page, label) {
  const nodeButton = page.getByRole('button', { name: `Select node ${label}` }).first()
  await nodeButton.waitFor({ state: 'visible', timeout: 20000 })

  try {
    await nodeButton.hover()
  } catch {
    await nodeButton.evaluate((element) => {
      element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    })
  }

  await page.locator('.recall-graph-hover-preview').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(200)
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
    throw new Error('Could not find a visible graph node during the Stage 453 run.')
  }

  const nodeButton = nodeButtons.nth(bestIndex)
  const ariaLabel = (await nodeButton.getAttribute('aria-label')) ?? ''
  const label = ariaLabel.replace(/^Select node\s+/, '').trim() || 'Graph node'
  return { label, nodeButton }
}

async function selectPreferredGraphNode(page) {
  const { label, nodeButton } = await getPreferredGraphNode(page)
  await nodeButton.waitFor({ state: 'visible', timeout: 20000 })

  try {
    await nodeButton.click()
  } catch {
    await nodeButton.evaluate((element) => {
      element.click()
    })
  }

  return { label }
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
