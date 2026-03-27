import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE619_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE619_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE619_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE619_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE619_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE619_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage618CanvasBackgroundAlphaBaseline = 0.88
const stage618CanvasBorderAlphaBaseline = 0.03
const stage618SearchBackgroundAlphaBaseline = 0.027
const stage618SearchBorderAlphaBaseline = 0.047
const stage618SecondaryBackgroundAlphaBaseline = 0.02
const stage618SecondaryBorderAlphaBaseline = 0.043
const stage618HeadingTopOffsetPxCeiling = 92.5
const stage618GridTopOffsetPxCeiling = 118.5
const stage618CardWidthFloor = 344
const stage618CardWidthCeiling = 356
const stage618CardHeightPxCeiling = 206.5
const canvasBackgroundAlphaCeiling = 0.83
const canvasBorderAlphaCeiling = 0.024
const searchBackgroundAlphaCeiling = 0.022
const searchBorderAlphaCeiling = 0.039
const secondaryBackgroundAlphaCeiling = 0.015
const secondaryBorderAlphaCeiling = 0.032

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage619-home-canvas-frame-contrast-and-utility-pill-emphasis-softening-reset-after-stage618-failure.png',
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
  const homeEvidence = await captureHomeImplementation(page, outputDir, 'stage619')

  await writeFile(
    path.join(
      outputDir,
      'stage619-home-canvas-frame-contrast-and-utility-pill-emphasis-softening-reset-after-stage618-validation.json',
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
          'The next polish pass should reduce the remaining March 25, 2026 Recall homepage mismatch by softening canvas-frame contrast and calming Search/List/Sort pill emphasis.',
          'Board start, card-width cadence, rail structure, and lower-card rhythm should stay intact while the outer shell reads less boxed.',
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
          'stage619-home-canvas-frame-contrast-and-utility-pill-emphasis-softening-reset-after-stage618-failure.png',
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

  const canvas = page.locator('.recall-home-parity-canvas-stage619').first()
  const toolbarActions = canvas.locator('.recall-home-parity-toolbar-actions-stage617').first()
  const dayGroup = canvas.locator('.recall-home-parity-day-group-stage617').first()
  const addTile = dayGroup.locator('.recall-home-parity-add-tile-stage615').first()
  const representativeCard = dayGroup.locator('.recall-home-parity-card-stage615').first()

  await Promise.all([
    canvas.waitFor({ state: 'visible', timeout: 20000 }),
    toolbarActions.waitFor({ state: 'visible', timeout: 20000 }),
    dayGroup.waitFor({ state: 'visible', timeout: 20000 }),
    addTile.waitFor({ state: 'visible', timeout: 20000 }),
    representativeCard.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  await page.waitForTimeout(350)

  const [representativeCardBox, addTileBox] = await Promise.all([
    readMeasuredBox(representativeCard, 'representative Stage 619 card'),
    readMeasuredBox(addTile, 'Stage 619 add tile'),
  ])

  const utilityMetrics = await page.evaluate(() => {
    const canvas = document.querySelector('.recall-home-parity-canvas-stage619')
    const search = canvas?.querySelector('.recall-home-parity-toolbar-button-search-stage619')
    const list = canvas?.querySelector('.recall-home-parity-toolbar-button-secondary-stage619')
    const sort = canvas?.querySelector('.recall-home-parity-sort-trigger-stage619')
    const dayHeader = canvas?.querySelector('.recall-home-parity-day-group-header-stage617')
    const grid = canvas?.querySelector('.recall-home-parity-grid-stage615')
    if (
      !(canvas instanceof HTMLElement) ||
      !(search instanceof HTMLElement) ||
      !(list instanceof HTMLElement) ||
      !(sort instanceof HTMLElement) ||
      !(dayHeader instanceof HTMLElement) ||
      !(grid instanceof HTMLElement)
    ) {
      throw new Error('Expected Stage 619 Home canvas and utility elements.')
    }
    const canvasStyle = window.getComputedStyle(canvas)
    const searchStyle = window.getComputedStyle(search)
    const listStyle = window.getComputedStyle(list)
    const sortStyle = window.getComputedStyle(sort)
    const canvasBox = canvas.getBoundingClientRect()
    const dayHeaderBox = dayHeader.getBoundingClientRect()
    const gridBox = grid.getBoundingClientRect()
    return {
      canvasBackgroundColor: canvasStyle.backgroundColor,
      canvasBorderColor: canvasStyle.borderColor,
      gridTopOffsetPx: gridBox.top - canvasBox.top,
      headingTopOffsetPx: dayHeaderBox.top - canvasBox.top,
      listBackgroundColor: listStyle.backgroundColor,
      listBorderColor: listStyle.borderColor,
      searchBackgroundColor: searchStyle.backgroundColor,
      searchBorderColor: searchStyle.borderColor,
      sortBackgroundColor: sortStyle.backgroundColor,
      sortBorderColor: sortStyle.borderColor,
    }
  })

  const canvasBackgroundAlpha = readRgbaAlpha(utilityMetrics.canvasBackgroundColor)
  const canvasBorderAlpha = readRgbaAlpha(utilityMetrics.canvasBorderColor)
  const searchBackgroundAlpha = readRgbaAlpha(utilityMetrics.searchBackgroundColor)
  const searchBorderAlpha = readRgbaAlpha(utilityMetrics.searchBorderColor)
  const listBackgroundAlpha = readRgbaAlpha(utilityMetrics.listBackgroundColor)
  const listBorderAlpha = readRgbaAlpha(utilityMetrics.listBorderColor)
  const sortBackgroundAlpha = readRgbaAlpha(utilityMetrics.sortBackgroundColor)
  const sortBorderAlpha = readRgbaAlpha(utilityMetrics.sortBorderColor)

  if (!(canvasBackgroundAlpha < stage618CanvasBackgroundAlphaBaseline && canvasBackgroundAlpha <= canvasBackgroundAlphaCeiling)) {
    throw new Error(`Expected canvas background alpha below the Stage 618 baseline, found ${canvasBackgroundAlpha}.`)
  }
  if (!(canvasBorderAlpha < stage618CanvasBorderAlphaBaseline && canvasBorderAlpha <= canvasBorderAlphaCeiling)) {
    throw new Error(`Expected canvas border alpha below the Stage 618 baseline, found ${canvasBorderAlpha}.`)
  }
  if (!(searchBackgroundAlpha < stage618SearchBackgroundAlphaBaseline && searchBackgroundAlpha <= searchBackgroundAlphaCeiling)) {
    throw new Error(`Expected search background alpha below the Stage 618 baseline, found ${searchBackgroundAlpha}.`)
  }
  if (!(searchBorderAlpha < stage618SearchBorderAlphaBaseline && searchBorderAlpha <= searchBorderAlphaCeiling)) {
    throw new Error(`Expected search border alpha below the Stage 618 baseline, found ${searchBorderAlpha}.`)
  }
  if (!(listBackgroundAlpha < stage618SecondaryBackgroundAlphaBaseline && listBackgroundAlpha <= secondaryBackgroundAlphaCeiling)) {
    throw new Error(`Expected list background alpha below the Stage 618 baseline, found ${listBackgroundAlpha}.`)
  }
  if (!(listBorderAlpha < stage618SecondaryBorderAlphaBaseline && listBorderAlpha <= secondaryBorderAlphaCeiling)) {
    throw new Error(`Expected list border alpha below the Stage 618 baseline, found ${listBorderAlpha}.`)
  }
  if (!(sortBackgroundAlpha < stage618SecondaryBackgroundAlphaBaseline && sortBackgroundAlpha <= secondaryBackgroundAlphaCeiling)) {
    throw new Error(`Expected sort background alpha below the Stage 618 baseline, found ${sortBackgroundAlpha}.`)
  }
  if (!(sortBorderAlpha < stage618SecondaryBorderAlphaBaseline && sortBorderAlpha <= secondaryBorderAlphaCeiling)) {
    throw new Error(`Expected sort border alpha below the Stage 618 baseline, found ${sortBorderAlpha}.`)
  }
  if (!(utilityMetrics.headingTopOffsetPx <= stage618HeadingTopOffsetPxCeiling)) {
    throw new Error(`Expected heading top offset to preserve the Stage 617 compaction band, found ${utilityMetrics.headingTopOffsetPx}.`)
  }
  if (!(utilityMetrics.gridTopOffsetPx <= stage618GridTopOffsetPxCeiling)) {
    throw new Error(`Expected first-row grid top offset to preserve the Stage 617 compaction band, found ${utilityMetrics.gridTopOffsetPx}.`)
  }
  if (!(representativeCardBox.width >= stage618CardWidthFloor && representativeCardBox.width <= stage618CardWidthCeiling)) {
    throw new Error(`Expected representative card width to stay in the Stage 615 cadence band, found ${representativeCardBox.width}.`)
  }
  if (Math.abs(addTileBox.width - representativeCardBox.width) > 1) {
    throw new Error(`Expected add tile and representative card widths to stay aligned, found ${addTileBox.width} and ${representativeCardBox.width}.`)
  }
  if (!(representativeCardBox.height <= stage618CardHeightPxCeiling)) {
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
  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)

  return {
    captures: {
      homeToolbar: homeToolbarCapture,
      homeWideTop,
    },
    metrics: {
      addTileWidth: addTileBox.width,
      canvasBackgroundAlpha,
      canvasBorderAlpha,
      cardHeight: representativeCardBox.height,
      cardWidth: representativeCardBox.width,
      gridTopOffsetPx: utilityMetrics.gridTopOffsetPx,
      headingTopOffsetPx: utilityMetrics.headingTopOffsetPx,
      listBackgroundAlpha,
      listBorderAlpha,
      searchBackgroundAlpha,
      searchBorderAlpha,
      sortBackgroundAlpha,
      sortBorderAlpha,
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
  await page.locator('.recall-home-parity-canvas-stage619').first().waitFor({ state: 'visible', timeout: 20000 })
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

function readRgbaAlpha(value) {
  const match = /rgba?\(([^)]+)\)/.exec(value)
  if (!match) {
    return 1
  }
  const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()))
  if (parts.length < 4 || Number.isNaN(parts[3])) {
    return 1
  }
  return parts[3]
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
