import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE615_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE615_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE615_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE615_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE615_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE615_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage614CardWidthBaseline = 320
const stage614ColumnGapPxBaseline = 8.96
const stage614FirstRowRightSlackPxBaseline = 204.90625
const cardWidthFloor = 344
const cardWidthCeiling = 356
const columnGapPxCeiling = 8.1
const firstRowRightSlackPxCeiling = 150
const cardHeightPxCeiling = 206.5

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage615-home-board-column-cadence-and-add-tile-card-width-balance-reset-after-stage614-failure.png',
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
  const homeEvidence = await captureHomeImplementation(page, outputDir, 'stage615')

  await writeFile(
    path.join(
      outputDir,
      'stage615-home-board-column-cadence-and-add-tile-card-width-balance-reset-after-stage614-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: homeEvidence.captures,
        desktopViewport,
        headless,
        implementationFocus: [
          'Home keeps the Stage 563 selected-collection rail plus day-grouped canvas structure.',
          'The next polish pass should reduce the remaining March 25, 2026 Recall homepage mismatch by widening the three-up board columns and bringing the add-tile/card width cadence closer together at wide desktop scale.',
          'Toolbar, rail, grouping, and lower-card rhythm should stay intact while the board uses more of the first-row width.',
        ],
        metrics: homeEvidence.metrics,
        runtimeBrowser,
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
          'stage615-home-board-column-cadence-and-add-tile-card-width-balance-reset-after-stage614-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function captureHomeImplementation(page, directory, stagePrefix) {
  await openHome(page)

  const canvas = page.locator('.recall-home-parity-canvas-stage563').first()
  await canvas.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)

  const grid = canvas.locator('.recall-home-parity-grid-stage615').first()
  const addTile = grid.locator('.recall-home-parity-add-tile-stage615').first()
  const representativeCard = grid.locator('.recall-home-parity-card-stage615').first()

  await Promise.all([
    grid.waitFor({ state: 'visible', timeout: 20000 }),
    addTile.waitFor({ state: 'visible', timeout: 20000 }),
    representativeCard.waitFor({ state: 'visible', timeout: 20000 }),
  ])

  const [representativeCardBox, addTileBox] = await Promise.all([
    readMeasuredBox(representativeCard, 'representative Stage 615 card'),
    readMeasuredBox(addTile, 'Stage 615 add tile'),
  ])

  const gridMetrics = await page.evaluate(() => {
    const canvas = document.querySelector('.recall-home-parity-canvas-stage563')
    const grid = canvas?.querySelector('.recall-home-parity-grid-stage615')
    if (!(grid instanceof HTMLElement)) {
      throw new Error('Expected Stage 615 Home grid element.')
    }
    const style = window.getComputedStyle(grid)
    const gridBox = grid.getBoundingClientRect()
    const children = Array.from(grid.children).filter((node) => window.getComputedStyle(node).display !== 'none')
    const firstRowTop = Math.min(...children.map((node) => node.getBoundingClientRect().top))
    const firstRow = children.filter((node) => Math.abs(node.getBoundingClientRect().top - firstRowTop) < 2)
    const firstRowRight = Math.max(...firstRow.map((node) => node.getBoundingClientRect().right))
    return {
      columnGapPx: Number.parseFloat(style.columnGap),
      firstRowCount: firstRow.length,
      firstRowRightSlackPx: gridBox.right - firstRowRight,
      gridTemplateColumns: style.gridTemplateColumns,
      gridWidth: gridBox.width,
    }
  })

  if (!(representativeCardBox.width > stage614CardWidthBaseline && representativeCardBox.width >= cardWidthFloor)) {
    throw new Error(`Expected representative card width above the Stage 614 baseline, found ${representativeCardBox.width}.`)
  }
  if (!(representativeCardBox.width <= cardWidthCeiling)) {
    throw new Error(`Expected representative card width to stay within the Stage 615 target band, found ${representativeCardBox.width}.`)
  }
  if (Math.abs(addTileBox.width - representativeCardBox.width) > 1) {
    throw new Error(`Expected add tile and representative card widths to stay aligned, found ${addTileBox.width} and ${representativeCardBox.width}.`)
  }
  if (!(gridMetrics.columnGapPx < stage614ColumnGapPxBaseline && gridMetrics.columnGapPx <= columnGapPxCeiling)) {
    throw new Error(`Expected Stage 615 column gap below the Stage 614 baseline, found ${gridMetrics.columnGapPx}.`)
  }
  if (!(gridMetrics.firstRowRightSlackPx < stage614FirstRowRightSlackPxBaseline && gridMetrics.firstRowRightSlackPx <= firstRowRightSlackPxCeiling)) {
    throw new Error(`Expected Stage 615 first-row right slack below the Stage 614 baseline, found ${gridMetrics.firstRowRightSlackPx}.`)
  }
  if (gridMetrics.firstRowCount !== 3) {
    throw new Error(`Expected 3 visible first-row Home tiles at wide desktop, found ${gridMetrics.firstRowCount}.`)
  }
  if (!(representativeCardBox.height <= cardHeightPxCeiling)) {
    throw new Error(`Expected representative card height to stay compact after the Stage 615 pass, found ${representativeCardBox.height}.`)
  }

  const toolbarActionCount =
    (await canvas.locator('.recall-home-parity-toolbar-row-primary-stage601').first().evaluate((node) => node.children.length)) +
    (await canvas.locator('.recall-home-parity-toolbar-row-secondary-stage601').first().evaluate((node) => node.children.length))
  const visibleDayGroupCountNodeCount = await canvas.locator('.recall-home-parity-day-group-header-stage563 span').count()

  if (toolbarActionCount !== 4) {
    throw new Error(`Expected 4 visible Home toolbar controls, found ${toolbarActionCount}.`)
  }
  if (visibleDayGroupCountNodeCount !== 0) {
    throw new Error(`Expected no visible day-group count nodes, found ${visibleDayGroupCountNodeCount}.`)
  }

  const homeAddTileCapture = await captureLocatorScreenshot(page, addTile, directory, `${stagePrefix}-home-add-tile.png`)
  const homeCardCapture = await captureLocatorScreenshot(page, representativeCard, directory, `${stagePrefix}-home-card.png`)
  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)

  return {
    captures: {
      homeAddTile: homeAddTileCapture,
      homeCard: homeCardCapture,
      homeWideTop,
    },
    metrics: {
      addTileWidth: addTileBox.width,
      cardHeight: representativeCardBox.height,
      cardWidth: representativeCardBox.width,
      columnGapPx: gridMetrics.columnGapPx,
      firstRowCount: gridMetrics.firstRowCount,
      firstRowRightSlackPx: gridMetrics.firstRowRightSlackPx,
      gridTemplateColumns: gridMetrics.gridTemplateColumns,
      gridWidth: gridMetrics.gridWidth,
      toolbarActionCount,
      visibleDayGroupCountNodeCount,
    },
  }
}

async function openHome(page) {
  const response = await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Home navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.locator('.recall-home-workspace').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('.recall-home-parity-canvas-stage563').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function captureViewportScreenshot(page, directory, filename) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath })
  return screenshotPath
}

async function captureLocatorScreenshot(page, locator, directory, filename) {
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
      height: Math.max(1, Math.floor(box.height)),
    },
  })
  return screenshotPath
}

async function readMeasuredBox(locator, label) {
  const box = await locator.boundingBox()
  if (!box) {
    throw new Error(`Expected measurable bounds for ${label}.`)
  }
  return box
}

function resolveHarnessDir(directory) {
  if (!path.isAbsolute(directory)) {
    return path.resolve(repoRoot, directory)
  }
  return directory
}

async function launchBrowser(chromium) {
  if (preferredChannel) {
    try {
      const browser = await chromium.launch({ channel: preferredChannel, headless })
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
