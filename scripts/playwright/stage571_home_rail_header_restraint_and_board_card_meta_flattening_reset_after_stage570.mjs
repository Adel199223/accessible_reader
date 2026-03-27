import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE571_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE571_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE571_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE571_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE571_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE571_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage570DayGroupTopOffsetBaseline = 96.53
const stage570SortPopoverWidthBaseline = 182

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage571-home-rail-header-restraint-and-board-card-meta-flattening-reset-after-stage570-failure.png',
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
  const homeEvidence = await captureHomeImplementation(page, outputDir, 'stage571')

  await writeFile(
    path.join(
      outputDir,
      'stage571-home-rail-header-restraint-and-board-card-meta-flattening-reset-after-stage570-validation.json',
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
          'The next polish pass should calm the rail header and active child row while flattening the board-card lower seam.',
          'Cards should stop repeating a visible per-card date because the board is already grouped by day.',
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
          'stage571-home-rail-header-restraint-and-board-card-meta-flattening-reset-after-stage570-failure.png',
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

  const rail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  const canvas = page.locator('.recall-home-parity-canvas-stage563').first()
  const toolbar = canvas.locator('.recall-home-parity-toolbar-stage563').first()
  await rail.waitFor({ state: 'visible', timeout: 20000 })
  await canvas.waitFor({ state: 'visible', timeout: 20000 })
  await toolbar.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
  await ensureSortMenuClosed(toolbar, canvas)

  const activeRailButton = rail.locator('.recall-home-parity-rail-button-active-stage563').first()
  await activeRailButton.waitFor({ state: 'visible', timeout: 20000 })
  const activeRailLabel = normalizeText(await activeRailButton.locator('strong').first().textContent())
  const canvasAriaLabel = (await canvas.getAttribute('aria-label')) ?? ''
  const railHeadingMetaText = normalizeText(
    await rail.locator('.recall-home-parity-rail-heading-meta-stage571').first().textContent(),
  )
  const railSummaryText = normalizeText(await rail.locator('.recall-home-parity-rail-note-stage563').first().textContent())
  const railPreview = rail.locator('.recall-home-parity-rail-preview-stage571').first()
  await railPreview.waitFor({ state: 'visible', timeout: 20000 })
  const railPreviewHeight = roundMetric((await railPreview.boundingBox())?.height ?? 0)
  const railPreviewMarkerCount = await railPreview.locator('.recall-home-parity-rail-preview-mark-stage571').count()
  const railPreviewLabel = normalizeText(
    await railPreview.locator('.recall-home-parity-rail-preview-label-stage571').first().textContent(),
  )
  const primaryRowCount = await toolbar
    .locator('.recall-home-parity-toolbar-row-primary-stage567')
    .first()
    .evaluate((node) => node.children.length)
  const secondaryRowCount = await toolbar
    .locator('.recall-home-parity-toolbar-row-secondary-stage567')
    .first()
    .evaluate((node) => node.children.length)
  const toolbarActionCount = primaryRowCount + secondaryRowCount

  if (canvasAriaLabel !== `${activeRailLabel} collection canvas`) {
    throw new Error(`Expected Home canvas aria-label "${activeRailLabel} collection canvas", received "${canvasAriaLabel}".`)
  }
  if (!railHeadingMetaText) {
    throw new Error('Expected a compact rail heading meta label, but it was empty.')
  }
  if (!railSummaryText || /\.$/.test(railSummaryText)) {
    throw new Error(`Expected a restrained rail summary without trailing punctuation, received "${railSummaryText}".`)
  }
  if (railPreviewMarkerCount !== 1 || !railPreviewLabel) {
    throw new Error('Expected the active rail continuation row to include one visible preview marker and label.')
  }
  if (!railPreviewHeight || railPreviewHeight >= 24) {
    throw new Error(`Expected the active rail continuation row height below 24px, received ${railPreviewHeight || 'null'}.`)
  }
  if (toolbarActionCount !== 4 || primaryRowCount !== 2 || secondaryRowCount !== 2) {
    throw new Error(`Expected a 2+2 Home toolbar cluster, found ${primaryRowCount}+${secondaryRowCount}.`)
  }

  const addTile = canvas.getByRole('button', { name: new RegExp(`Add content to ${escapeRegExp(activeRailLabel)}`, 'i') }).first()
  await addTile.waitFor({ state: 'visible', timeout: 20000 })
  const addTileHeight = roundMetric((await addTile.boundingBox())?.height ?? 0)

  const boardCardDateNodeCount = await canvas.locator('.recall-home-parity-card-meta-stage563').count()
  if (boardCardDateNodeCount !== 0) {
    throw new Error(`Expected no visible board-card date nodes after the Stage 571 flattening pass, found ${boardCardDateNodeCount}.`)
  }

  const [pasteCard] = await getVisibleLocators(canvas, '.recall-home-parity-card-stage563')
  if (!pasteCard) {
    throw new Error('Could not find a visible Home card in the Captures canvas.')
  }
  const pastePreview = pasteCard.locator('.recall-home-parity-card-preview-paste-stage565').first()
  const pastePreviewKind = await pastePreview.getAttribute('data-preview-kind')
  const pasteSourceText = normalizeText(
    await pasteCard.locator('.recall-home-parity-card-source-stage563').first().textContent(),
  )
  const pasteChip = pasteCard.locator('.recall-home-parity-card-chip-stage571').first()
  const pasteChipHeight = roundMetric((await pasteChip.boundingBox())?.height ?? 0)
  if (pastePreviewKind !== 'paste' || pasteSourceText !== 'Local capture') {
    throw new Error(`Expected flattened paste card source row to read "Local capture", received "${pasteSourceText}".`)
  }
  if (!pasteChipHeight || pasteChipHeight >= 19) {
    throw new Error(`Expected quieter board chip height below 19px, received ${pasteChipHeight || 'null'}.`)
  }
  const homePasteCard = await captureLocatorScreenshot(page, pasteCard, directory, `${stagePrefix}-home-paste-card.png`)

  await clickRailSection(rail, 'Web')
  await expectCanvasLabel(canvas, 'Web collection canvas')
  const [webCard] = await getVisibleLocators(canvas, '.recall-home-parity-card-stage563')
  if (!webCard) {
    throw new Error('Could not find a visible Home card in the Web canvas.')
  }
  const webPreview = webCard.locator('.recall-home-parity-card-preview-web-stage565').first()
  const webPreviewKind = await webPreview.getAttribute('data-preview-kind')
  const webSourceText = normalizeText(
    await webCard.locator('.recall-home-parity-card-source-stage563').first().textContent(),
  )
  if (webPreviewKind !== 'web' || !webSourceText) {
    throw new Error(`Expected flattened web card source row text, received "${webSourceText}".`)
  }
  const homeWebCard = await captureLocatorScreenshot(page, webCard, directory, `${stagePrefix}-home-web-card.png`)

  await clickRailSection(rail, 'Documents')
  await expectCanvasLabel(canvas, 'Documents collection canvas')
  const fileCard = canvas.locator('.recall-home-parity-card-stage563').first()
  await fileCard.waitFor({ state: 'visible', timeout: 20000 })
  const filePreview = fileCard.locator('.recall-home-parity-card-preview-file-stage565').first()
  const filePreviewKind = await filePreview.getAttribute('data-preview-kind')
  const fileSourceText = normalizeText(
    await fileCard.locator('.recall-home-parity-card-source-stage563').first().textContent(),
  )
  if (filePreviewKind !== 'file' || !fileSourceText) {
    throw new Error(`Expected flattened file card source row text, received "${fileSourceText}".`)
  }
  const homeFileCard = await captureLocatorScreenshot(page, fileCard, directory, `${stagePrefix}-home-file-card.png`)

  const sortTrigger = canvas.getByRole('button', { name: /Sort Home sources/i }).first()
  await sortTrigger.click()
  const sortPanel = toolbar.locator('.recall-home-parity-sort-panel-stage563').first()
  await sortPanel.waitFor({ state: 'visible', timeout: 20000 })
  const sortPopoverWidth = roundMetric((await sortPanel.boundingBox())?.width ?? 0)
  if (!sortPopoverWidth || sortPopoverWidth > stage570SortPopoverWidthBaseline) {
    throw new Error(
      `Expected sort popover width to stay at or below the Stage 570 baseline ${stage570SortPopoverWidthBaseline}px, received ${sortPopoverWidth || 'null'}.`,
    )
  }
  const homeSortPopover = await captureLocatorTopScreenshot(page, sortPanel, directory, `${stagePrefix}-home-sort-popover.png`, 320)
  await page.keyboard.press('Escape').catch(() => undefined)
  await page.waitForTimeout(150)
  await ensureSortMenuClosed(toolbar, canvas)

  await clickRailSection(rail, 'Captures')
  await expectCanvasLabel(canvas, 'Captures collection canvas')
  await page.waitForTimeout(200)

  const firstDayHeading = canvas.locator('.recall-home-parity-day-group-header-stage563 h3').first()
  const dayLabels = []
  const dayGroups = await getVisibleLocators(canvas, '.recall-home-parity-day-group-stage563')
  for (const group of dayGroups.slice(0, 3)) {
    dayLabels.push(normalizeText(await group.locator('h3').first().textContent()))
  }
  const canvasBox = await canvas.boundingBox()
  const dayHeadingBox = await firstDayHeading.boundingBox()
  const dayGroupTopOffset = canvasBox && dayHeadingBox ? roundMetric(dayHeadingBox.y - canvasBox.y) : null
  if (dayGroupTopOffset == null || dayGroupTopOffset >= stage570DayGroupTopOffsetBaseline) {
    throw new Error(
      `Expected first day-group top offset below the Stage 570 baseline ${stage570DayGroupTopOffsetBaseline}px, received ${dayGroupTopOffset ?? 'null'}.`,
    )
  }

  const homeToolbarClosed = await captureLocatorTopScreenshot(page, toolbar, directory, `${stagePrefix}-home-toolbar-closed.png`, 210)
  const homeRail = await captureLocatorTopScreenshot(page, rail, directory, `${stagePrefix}-home-collection-rail.png`, 980)
  const homeAddTile = await captureLocatorScreenshot(page, addTile, directory, `${stagePrefix}-home-add-tile.png`)
  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)

  return {
    captures: {
      homeAddTile,
      homeFileCard,
      homePasteCard,
      homeRail,
      homeSortPopover,
      homeToolbarClosed,
      homeWebCard,
      homeWideTop,
    },
    metrics: {
      activeRailLabel,
      addTileHeight,
      boardCardDateNodeCount,
      canvasAriaLabel,
      dayGroupTopOffset,
      dayLabels,
      filePreviewKind,
      fileSourceText,
      pasteChipHeight,
      pastePreviewKind,
      pasteSourceText,
      primaryRowCount,
      railHeadingMetaText,
      railPreviewHeight,
      railPreviewLabel,
      railPreviewMarkerCount,
      railSummaryText,
      secondaryRowCount,
      sortPopoverWidth,
      toolbarActionCount,
      webPreviewKind,
      webSourceText,
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

async function expectCanvasLabel(canvas, expectedLabel) {
  await canvas.waitFor({ state: 'visible', timeout: 20000 })
  const actualLabel = (await canvas.getAttribute('aria-label')) ?? ''
  if (actualLabel !== expectedLabel) {
    throw new Error(`Expected canvas aria-label "${expectedLabel}", received "${actualLabel}".`)
  }
  return actualLabel
}

async function clickRailSection(rail, label) {
  const buttons = await getVisibleLocators(rail, '.recall-home-parity-rail-button-stage563')
  for (const button of buttons) {
    const text = normalizeText(await button.textContent())
    if (text.includes(label)) {
      await button.click()
      await rail.page().waitForTimeout(250)
      return
    }
  }
  throw new Error(`Could not find the "${label}" collection rail button.`)
}

async function getVisibleLocators(scope, selector) {
  const matches = scope.locator(selector)
  const visibleLocators = []
  const count = await matches.count()
  for (let index = 0; index < count; index += 1) {
    const locator = matches.nth(index)
    if (await locator.isVisible().catch(() => false)) {
      visibleLocators.push(locator)
    }
  }
  return visibleLocators
}

async function captureViewportScreenshot(page, directory, filename) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath })
  return screenshotPath
}

async function captureLocatorTopScreenshot(page, locator, directory, filename, maxHeight = 980) {
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
      height: Math.max(1, Math.floor(Math.min(box.height, maxHeight))),
    },
  })
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

async function ensureSortMenuClosed(toolbar, canvas) {
  const page = toolbar.page()
  const sortPanel = toolbar.locator('.recall-home-parity-sort-panel-stage563').first()
  if (await sortPanel.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape').catch(() => undefined)
    await page.waitForTimeout(120)
  }
  if (await sortPanel.isVisible().catch(() => false)) {
    const sortTrigger = canvas.getByRole('button', { name: /Sort Home sources/i }).first()
    await sortTrigger.click()
    await page.waitForTimeout(150)
  }
  if (await sortPanel.isVisible().catch(() => false)) {
    await page.mouse.click(24, 24)
    await page.waitForTimeout(150)
  }
  if (await sortPanel.isVisible().catch(() => false)) {
    throw new Error('Could not close the Home sort popover before the Stage 571 capture.')
  }
}

function normalizeText(value) {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function roundMetric(value) {
  return Number(value.toFixed(2))
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
