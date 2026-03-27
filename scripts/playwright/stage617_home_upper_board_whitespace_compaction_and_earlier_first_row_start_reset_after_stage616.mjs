import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE617_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE617_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE617_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE617_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE617_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE617_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage616CanvasTopPaddingPxBaseline = 9.92
const stage616CanvasGapPxBaseline = 9.92
const stage616HeadingTopOffsetPxBaseline = 99.9375
const stage616GridTopOffsetPxBaseline = 126.546875
const stage616ToolbarBottomToHeadingTopPxBaseline = 9.90625
const stage616HeadingBottomToGridTopPxBaseline = 8
const canvasTopPaddingPxCeiling = 6.5
const canvasGapPxCeiling = 6.5
const headingTopOffsetPxCeiling = 92.5
const gridTopOffsetPxCeiling = 118.5
const toolbarBottomToHeadingTopPxCeiling = 6.6
const headingBottomToGridTopPxCeiling = 6.6
const cardWidthFloor = 344
const cardWidthCeiling = 356
const cardHeightPxCeiling = 206.5

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage617-home-upper-board-whitespace-compaction-and-earlier-first-row-start-reset-after-stage616-failure.png',
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
  const homeEvidence = await captureHomeImplementation(page, outputDir, 'stage617')

  await writeFile(
    path.join(
      outputDir,
      'stage617-home-upper-board-whitespace-compaction-and-earlier-first-row-start-reset-after-stage616-validation.json',
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
          'The next polish pass should reduce the remaining March 25, 2026 Recall homepage mismatch by trimming upper-board whitespace so the first day label and first card row start earlier.',
          'Card widths, lower-card rhythm, toolbar ownership, and rail structure should stay intact while the board begins higher inside the canvas.',
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
          'stage617-home-upper-board-whitespace-compaction-and-earlier-first-row-start-reset-after-stage616-failure.png',
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

  const canvas = page.locator('.recall-home-parity-canvas-stage617').first()
  const toolbar = canvas.locator('.recall-home-parity-toolbar-stage617').first()
  const toolbarActions = canvas.locator('.recall-home-parity-toolbar-actions-stage617').first()
  const dayGroups = canvas.locator('.recall-home-parity-day-groups-stage617').first()
  const dayGroup = dayGroups.locator('.recall-home-parity-day-group-stage617').first()
  const dayHeader = dayGroup.locator('.recall-home-parity-day-group-header-stage617').first()
  const grid = dayGroup.locator('.recall-home-parity-grid-stage615').first()
  const addTile = grid.locator('.recall-home-parity-add-tile-stage615').first()
  const representativeCard = grid.locator('.recall-home-parity-card-stage615').first()

  await Promise.all([
    canvas.waitFor({ state: 'visible', timeout: 20000 }),
    toolbar.waitFor({ state: 'visible', timeout: 20000 }),
    toolbarActions.waitFor({ state: 'visible', timeout: 20000 }),
    dayGroups.waitFor({ state: 'visible', timeout: 20000 }),
    dayGroup.waitFor({ state: 'visible', timeout: 20000 }),
    dayHeader.waitFor({ state: 'visible', timeout: 20000 }),
    grid.waitFor({ state: 'visible', timeout: 20000 }),
    addTile.waitFor({ state: 'visible', timeout: 20000 }),
    representativeCard.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  await page.waitForTimeout(350)

  const [representativeCardBox, addTileBox] = await Promise.all([
    readMeasuredBox(representativeCard, 'representative Stage 617 card'),
    readMeasuredBox(addTile, 'Stage 617 add tile'),
  ])

  const spacingMetrics = await page.evaluate(() => {
    const canvas = document.querySelector('.recall-home-parity-canvas-stage617')
    const toolbar = canvas?.querySelector('.recall-home-parity-toolbar-stage617')
    const toolbarActions = canvas?.querySelector('.recall-home-parity-toolbar-actions-stage617')
    const dayGroup = canvas?.querySelector('.recall-home-parity-day-group-stage617')
    const heading = dayGroup?.querySelector('.recall-home-parity-day-group-header-stage617')
    const grid = dayGroup?.querySelector('.recall-home-parity-grid-stage615')
    if (
      !(canvas instanceof HTMLElement) ||
      !(toolbar instanceof HTMLElement) ||
      !(toolbarActions instanceof HTMLElement) ||
      !(dayGroup instanceof HTMLElement) ||
      !(heading instanceof HTMLElement) ||
      !(grid instanceof HTMLElement)
    ) {
      throw new Error('Expected Stage 617 Home layout elements.')
    }
    const canvasBox = canvas.getBoundingClientRect()
    const toolbarBox = toolbar.getBoundingClientRect()
    const headingBox = heading.getBoundingClientRect()
    const gridBox = grid.getBoundingClientRect()
    const children = Array.from(grid.children).filter((node) => window.getComputedStyle(node).display !== 'none')
    const firstRowTop = Math.min(...children.map((node) => node.getBoundingClientRect().top))
    const firstRow = children.filter((node) => Math.abs(node.getBoundingClientRect().top - firstRowTop) < 2)
    return {
      canvasGapPx: Number.parseFloat(window.getComputedStyle(canvas).gap),
      canvasTopPaddingPx: Number.parseFloat(window.getComputedStyle(canvas).paddingTop),
      dayGroupGapPx: Number.parseFloat(window.getComputedStyle(dayGroup).gap),
      firstRowCount: firstRow.length,
      gridTopOffsetPx: gridBox.top - canvasBox.top,
      headingBottomToGridTopPx: gridBox.top - headingBox.bottom,
      headingTopOffsetPx: headingBox.top - canvasBox.top,
      toolbarBottomToHeadingTopPx: headingBox.top - toolbarBox.bottom,
      toolbarControlRowGapPx: Number.parseFloat(window.getComputedStyle(toolbarActions).gap),
    }
  })

  if (!(spacingMetrics.canvasTopPaddingPx < stage616CanvasTopPaddingPxBaseline && spacingMetrics.canvasTopPaddingPx <= canvasTopPaddingPxCeiling)) {
    throw new Error(`Expected canvas top padding below the Stage 616 baseline, found ${spacingMetrics.canvasTopPaddingPx}.`)
  }
  if (!(spacingMetrics.canvasGapPx < stage616CanvasGapPxBaseline && spacingMetrics.canvasGapPx <= canvasGapPxCeiling)) {
    throw new Error(`Expected canvas gap below the Stage 616 baseline, found ${spacingMetrics.canvasGapPx}.`)
  }
  if (!(spacingMetrics.headingTopOffsetPx < stage616HeadingTopOffsetPxBaseline && spacingMetrics.headingTopOffsetPx <= headingTopOffsetPxCeiling)) {
    throw new Error(`Expected heading top offset below the Stage 616 baseline, found ${spacingMetrics.headingTopOffsetPx}.`)
  }
  if (!(spacingMetrics.gridTopOffsetPx < stage616GridTopOffsetPxBaseline && spacingMetrics.gridTopOffsetPx <= gridTopOffsetPxCeiling)) {
    throw new Error(`Expected first grid top offset below the Stage 616 baseline, found ${spacingMetrics.gridTopOffsetPx}.`)
  }
  if (!(spacingMetrics.toolbarBottomToHeadingTopPx < stage616ToolbarBottomToHeadingTopPxBaseline && spacingMetrics.toolbarBottomToHeadingTopPx <= toolbarBottomToHeadingTopPxCeiling)) {
    throw new Error(`Expected toolbar-to-heading gap below the Stage 616 baseline, found ${spacingMetrics.toolbarBottomToHeadingTopPx}.`)
  }
  if (!(spacingMetrics.headingBottomToGridTopPx < stage616HeadingBottomToGridTopPxBaseline && spacingMetrics.headingBottomToGridTopPx <= headingBottomToGridTopPxCeiling)) {
    throw new Error(`Expected heading-to-grid gap below the Stage 616 baseline, found ${spacingMetrics.headingBottomToGridTopPx}.`)
  }
  if (spacingMetrics.firstRowCount !== 3) {
    throw new Error(`Expected 3 visible first-row Home tiles at wide desktop, found ${spacingMetrics.firstRowCount}.`)
  }
  if (!(representativeCardBox.width >= cardWidthFloor && representativeCardBox.width <= cardWidthCeiling)) {
    throw new Error(`Expected representative card width to stay in the Stage 615 cadence band, found ${representativeCardBox.width}.`)
  }
  if (Math.abs(addTileBox.width - representativeCardBox.width) > 1) {
    throw new Error(`Expected add tile and representative card widths to stay aligned, found ${addTileBox.width} and ${representativeCardBox.width}.`)
  }
  if (!(representativeCardBox.height <= cardHeightPxCeiling)) {
    throw new Error(`Expected representative card height to stay in the compact Stage 615 band, found ${representativeCardBox.height}.`)
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

  const homeToolbarCapture = await captureLocatorScreenshot(page, toolbarActions, directory, `${stagePrefix}-home-toolbar.png`)
  const homeFirstDayGroupCapture = await captureLocatorScreenshot(page, dayGroup, directory, `${stagePrefix}-home-first-day-group.png`)
  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)

  return {
    captures: {
      homeFirstDayGroup: homeFirstDayGroupCapture,
      homeToolbar: homeToolbarCapture,
      homeWideTop,
    },
    metrics: {
      addTileWidth: addTileBox.width,
      canvasGapPx: spacingMetrics.canvasGapPx,
      canvasTopPaddingPx: spacingMetrics.canvasTopPaddingPx,
      cardHeight: representativeCardBox.height,
      cardWidth: representativeCardBox.width,
      dayGroupGapPx: spacingMetrics.dayGroupGapPx,
      firstRowCount: spacingMetrics.firstRowCount,
      gridTopOffsetPx: spacingMetrics.gridTopOffsetPx,
      headingBottomToGridTopPx: spacingMetrics.headingBottomToGridTopPx,
      headingTopOffsetPx: spacingMetrics.headingTopOffsetPx,
      toolbarActionCount,
      toolbarBottomToHeadingTopPx: spacingMetrics.toolbarBottomToHeadingTopPx,
      toolbarControlRowGapPx: spacingMetrics.toolbarControlRowGapPx,
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
  await page.locator('.recall-home-parity-canvas-stage617').first().waitFor({ state: 'visible', timeout: 20000 })
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
