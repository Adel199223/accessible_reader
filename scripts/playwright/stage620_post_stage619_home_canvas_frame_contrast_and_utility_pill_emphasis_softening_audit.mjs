import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE620_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE620_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE620_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE620_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE620_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE620_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
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
    'stage620-post-stage619-home-canvas-frame-contrast-and-utility-pill-emphasis-softening-audit-failure.png',
  ),
  { force: true },
)
await rm(
  path.join(
    outputDir,
    'stage620-post-stage619-home-canvas-frame-contrast-and-utility-pill-emphasis-softening-audit-failure-reader.png',
  ),
  { force: true },
)

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)
const { browser, runtimeBrowser } = await launchBrowser(chromium)

let page
let readerPage
try {
  page = await browser.newPage({ viewport: desktopViewport })
  const homeEvidence = await captureHomeAudit(page, outputDir, 'stage620')

  await openGraph(page)
  const graphWideTop = await captureViewportScreenshot(page, outputDir, 'stage620-graph-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage620')

  await writeFile(
    path.join(
      outputDir,
      'stage620-post-stage619-home-canvas-frame-contrast-and-utility-pill-emphasis-softening-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 619 canvas-frame and utility-pill softening pass',
          'the Home surface should keep the Stage 563 structure while reading less boxed and while Search/List/Sort pull less strongly than they did in Stage 618',
          'Graph and original-only Reader remain regression surfaces only after the Home-only Stage 619 pass',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          ...homeEvidence.captures,
          graphWideTop,
          readerOriginalWideTop: readerEvidence.capture,
        },
        desktopViewport,
        headless,
        homeMetrics: homeEvidence.metrics,
        readerSourceTitle: readerEvidence.sourceTitle,
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
          'stage620-post-stage619-home-canvas-frame-contrast-and-utility-pill-emphasis-softening-audit-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (readerPage && readerPage !== page) {
    await readerPage
      .screenshot({
        path: path.join(
          outputDir,
          'stage620-post-stage619-home-canvas-frame-contrast-and-utility-pill-emphasis-softening-audit-failure-reader.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function captureHomeAudit(page, directory, stagePrefix) {
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
    readMeasuredBox(representativeCard, 'representative Stage 620 card'),
    readMeasuredBox(addTile, 'Stage 620 add tile'),
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
      throw new Error('Expected Stage 620 Home canvas and utility elements.')
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

async function openGraph(page) {
  const response = await page.goto(`${baseUrl}/recall?section=graph`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Graph navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
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

async function openOriginalReaderFromHome(page, directory, stagePrefix) {
  await openHome(page)
  const rail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  const capturesButton = rail.locator('.recall-home-parity-rail-button-stage563').first()
  await capturesButton.click()
  await page.waitForTimeout(200)
  const sourceButton = page.locator('.recall-home-parity-card-stage563, .recall-home-parity-list-row-stage563').first()
  await sourceButton.waitFor({ state: 'visible', timeout: 20000 })
  const sourceTitle =
    normalizeText(await sourceButton.locator('strong').first().textContent().catch(() => '')) ||
    normalizeText(((await sourceButton.getAttribute('aria-label')) ?? '').replace(/^Open\s+/i, '')) ||
    'Home source'
  await sourceButton.click()
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('button', { name: 'Open in Reader' }).click()
  await page.waitForURL(/\/reader/, { timeout: 20000 })
  await page.locator('article').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(300)

  const originalTab = page.getByRole('tab', { name: 'Original', exact: true }).first()
  await originalTab.waitFor({ state: 'visible', timeout: 20000 })
  if ((await originalTab.getAttribute('aria-selected')) !== 'true') {
    await originalTab.click()
    await page.waitForTimeout(250)
  }
  if ((await originalTab.getAttribute('aria-selected')) !== 'true') {
    throw new Error('Could not keep Reader in Original mode for the Stage 620 audit.')
  }

  const capture = await captureViewportScreenshot(page, directory, `${stagePrefix}-reader-original-wide-top.png`)
  return { capture, sourceTitle }
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

function normalizeText(value) {
  return (value ?? '').replace(/\s+/g, ' ').trim()
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
