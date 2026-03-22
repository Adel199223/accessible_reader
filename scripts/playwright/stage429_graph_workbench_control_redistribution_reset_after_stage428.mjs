import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE429_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE429_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE429_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE429_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE429_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE429_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage429-graph-workbench-control-redistribution-reset-after-stage428-failure.png'), {
  force: true,
})

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const { browser, runtimeBrowser } = await launchBrowser(chromium)

let desktopPage
try {
  desktopPage = await browser.newPage({ viewport: desktopViewport })
  await desktopPage.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await desktopPage.getByRole('heading', { name: 'Recall', level: 1 }).waitFor({ state: 'visible', timeout: 20000 })

  await desktopPage.getByRole('tab', { name: 'Graph', exact: true }).click()
  await desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await ensureGraphBrowseStripVisible(desktopPage)
  await desktopPage.waitForTimeout(350)

  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage429-graph-wide-top.png')
  const graphControlClusterWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByLabel('Graph control seam').first(),
    outputDir,
    'stage429-graph-control-cluster-wide-top.png',
    220,
  )
  const graphUtilityDrawerWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByRole('complementary', { name: 'Graph selector strip' }).first(),
    outputDir,
    'stage429-graph-utility-drawer-wide-top.png',
    980,
  )
  const graphCanvasShellWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.locator('.recall-graph-canvas-shell-v20-reset').first(),
    outputDir,
    'stage429-graph-canvas-shell-wide-top.png',
    920,
  )
  const graphFocusRailWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByLabel('Graph focus rail').first(),
    outputDir,
    'stage429-graph-focus-rail-wide-top.png',
    220,
    'locator',
  )

  await hideGraphBrowseStrip(desktopPage)
  await selectFirstGraphNode(desktopPage)
  await desktopPage.getByRole('button', { name: 'Expand tray' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const graphDock = desktopPage.getByLabel('Node detail dock').first()
  const graphDetailDockPeekWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDock,
    outputDir,
    'stage429-graph-detail-dock-peek-wide-top.png',
    980,
    'locator',
  )

  await desktopPage.getByRole('button', { name: 'Expand tray' }).click()
  await desktopPage.getByRole('button', { name: 'Collapse tray' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const graphDetailDockExpandedWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDock,
    outputDir,
    'stage429-graph-detail-dock-expanded-wide-top.png',
    980,
    'locator',
  )

  await writeFile(
    path.join(outputDir, 'stage429-graph-workbench-control-redistribution-reset-after-stage428-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphCanvasShellWideTop,
          graphControlClusterWideTop,
          graphDetailDockExpandedWideTop,
          graphDetailDockPeekWideTop,
          graphFocusRailWideTop,
          graphUtilityDrawerWideTop,
          graphWideTop,
        },
        desktopViewport,
        headless,
        runtimeBrowser,
        validationFocus: [
          'wide desktop Graph judged first after the Stage 428 checkpoint',
          'evidence of the redistributed top workbench controls, slimmer utility drawer, attached focus rail, and stronger canvas-first balance',
          'attached inspect drawer proof in both peek and expanded states without changing graph semantics',
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
        path: path.join(outputDir, 'stage429-graph-workbench-control-redistribution-reset-after-stage428-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function ensureGraphBrowseStripVisible(page) {
  const selectorStrip = page.getByRole('complementary', { name: 'Graph selector strip' }).first()
  if (await selectorStrip.isVisible().catch(() => false)) {
    return
  }

  const showBrowseButton = page.getByRole('button', { name: 'Show browse' }).first()
  await showBrowseButton.waitFor({ state: 'visible', timeout: 20000 })
  await showBrowseButton.click()
  await selectorStrip.waitFor({ state: 'visible', timeout: 20000 })
}

async function hideGraphBrowseStrip(page) {
  const selectorStrip = page.getByRole('complementary', { name: 'Graph selector strip' }).first()
  if (!(await selectorStrip.isVisible().catch(() => false))) {
    return
  }

  const hideBrowseButton = page.getByRole('button', { name: 'Hide browse' }).first()
  await hideBrowseButton.waitFor({ state: 'visible', timeout: 20000 })
  await hideBrowseButton.click()
  await selectorStrip.waitFor({ state: 'hidden', timeout: 20000 })
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
