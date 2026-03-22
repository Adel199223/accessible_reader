import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE457_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE457_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE457_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE457_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE457_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE457_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage457-graph-node-language-and-hover-hierarchy-reset-after-stage456-failure.png'), {
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

  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage457-graph-wide-top.png')
  const graphCanvasWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.locator('.recall-graph-canvas').first(),
    outputDir,
    'stage457-graph-canvas-wide-top.png',
    'locator',
  )

  const { label: hoverNodeLabel } = await getPreferredGraphNode(desktopPage)
  await hoverGraphNode(desktopPage, hoverNodeLabel)

  const graphHoverPreviewWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.locator('.recall-graph-hover-preview').first(),
    outputDir,
    'stage457-graph-hover-preview-wide-top.png',
    'locator',
  )

  const { label: selectedNodeLabel } = await selectPreferredGraphNode(desktopPage)
  await desktopPage.getByRole('button', { name: 'Open details' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const graphSelectedCanvasWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.locator('.recall-graph-canvas').first(),
    outputDir,
    'stage457-graph-selected-canvas-wide-top.png',
    'locator',
  )
  const graphWorkingTrailWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.locator('.recall-graph-focus-rail').first(),
    outputDir,
    'stage457-graph-working-trail-wide-top.png',
    'locator',
  )

  const graphDetailDock = desktopPage.getByLabel('Node detail dock').first()
  const graphDetailDockPeekWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDetailDock,
    outputDir,
    'stage457-graph-detail-dock-peek-wide-top.png',
    'locator',
  )

  await desktopPage.getByRole('button', { name: 'Open details' }).click()
  await desktopPage.getByRole('button', { name: 'Close details' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const graphDetailDockExpandedWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDetailDock,
    outputDir,
    'stage457-graph-detail-dock-expanded-wide-top.png',
    'locator',
  )

  await writeFile(
    path.join(outputDir, 'stage457-graph-node-language-and-hover-hierarchy-reset-after-stage456-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphCanvasWideTop,
          graphDetailDockExpandedWideTop,
          graphDetailDockPeekWideTop,
          graphHoverPreviewWideTop,
          graphSelectedCanvasWideTop,
          graphWideTop,
          graphWorkingTrailWideTop,
        },
        desktopViewport,
        headless,
        hoverNodeLabel,
        runtimeBrowser,
        selectedNodeLabel,
        validationFocus: [
          'wide desktop Graph judged first after the Stage 456 checkpoint',
          'evidence of a lighter at-rest node language comes from the full canvas crop plus the hovered node preview rather than another control-corner crop',
          'selected-node workflow still lives in the bottom working trail and right inspect drawer, so the canvas can stay calmer at rest',
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
        path: path.join(outputDir, 'stage457-graph-node-language-and-hover-hierarchy-reset-after-stage456-failure.png'),
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
    throw new Error('Could not find a visible graph node during the Stage 457 run.')
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
