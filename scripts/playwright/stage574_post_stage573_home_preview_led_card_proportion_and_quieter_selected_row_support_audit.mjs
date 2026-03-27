import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE574_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE574_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE574_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE574_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE574_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE574_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage572AddTileHeightBaseline = 225.59
const stage572SortPopoverWidthBaseline = 182

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage574-post-stage573-home-preview-led-card-proportion-and-quieter-selected-row-support-audit-failure.png'),
  { force: true },
)
await rm(
  path.join(
    outputDir,
    'stage574-post-stage573-home-preview-led-card-proportion-and-quieter-selected-row-support-audit-failure-reader.png',
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
  const homeEvidence = await captureHomeAudit(page, outputDir, 'stage574')

  await openGraph(page)
  const graphWideTop = await captureViewportScreenshot(page, outputDir, 'stage574-graph-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage574')

  await writeFile(
    path.join(
      outputDir,
      'stage574-post-stage573-home-preview-led-card-proportion-and-quieter-selected-row-support-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 573 preview-led card proportion and quieter selected-row support pass',
          'the Home surface should keep the Stage 563 structure while calming the selected-row support seam and letting the poster own more of the board-card height',
          'Graph and original-only Reader remain regression surfaces only after the Home-only Stage 573 pass',
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
          'stage574-post-stage573-home-preview-led-card-proportion-and-quieter-selected-row-support-audit-failure.png',
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
          'stage574-post-stage573-home-preview-led-card-proportion-and-quieter-selected-row-support-audit-failure-reader.png',
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
  const activeRailSupportText = normalizeText(
    await activeRailButton.locator('.recall-home-parity-rail-button-copy-stage563 span').first().textContent(),
  )
  const activeRailSupportLength = activeRailSupportText.length
  const canvasAriaLabel = (await canvas.getAttribute('aria-label')) ?? ''
  const organizerTriggerText = normalizeText(
    await rail.getByRole('button', { name: 'Organizer options' }).first().textContent(),
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
  if (activeRailSupportText !== 'Local captures') {
    throw new Error(`Expected quieter active-row support text "Local captures", received "${activeRailSupportText}".`)
  }
  if (!activeRailSupportLength || activeRailSupportLength > 18) {
    throw new Error(`Expected active-row support text length to stay compact, received ${activeRailSupportLength}.`)
  }
  if (organizerTriggerText !== '...') {
    throw new Error(`Expected compact organizer trigger text "...", received "${organizerTriggerText}".`)
  }
  if (toolbarActionCount !== 4 || primaryRowCount !== 2 || secondaryRowCount !== 2) {
    throw new Error(`Expected a 2+2 Home toolbar cluster, found ${primaryRowCount}+${secondaryRowCount}.`)
  }

  const addTile = canvas.getByRole('button', { name: new RegExp(`Add content to ${escapeRegExp(activeRailLabel)}`, 'i') }).first()
  await addTile.waitFor({ state: 'visible', timeout: 20000 })
  const addTileHeight = roundMetric((await addTile.boundingBox())?.height ?? 0)
  if (!addTileHeight || addTileHeight >= stage572AddTileHeightBaseline) {
    throw new Error(
      `Expected add-tile height below the Stage 572 baseline ${stage572AddTileHeightBaseline}px, received ${addTileHeight || 'null'}.`,
    )
  }

  const boardCardDateNodeCount = await canvas.locator('.recall-home-parity-card-meta-stage563').count()
  if (boardCardDateNodeCount !== 0) {
    throw new Error(`Expected no visible board-card date nodes after the Stage 573 pass, found ${boardCardDateNodeCount}.`)
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
  const pasteCardBox = await pasteCard.boundingBox()
  const pastePreviewBox = await pastePreview.boundingBox()
  const pastePreviewRatio =
    pasteCardBox && pastePreviewBox ? roundMetric(pastePreviewBox.height / pasteCardBox.height) : null
  if (pastePreviewKind !== 'paste' || pasteSourceText !== 'Local capture') {
    throw new Error(`Expected paste card source row to remain "Local capture", received "${pasteSourceText}".`)
  }
  if (pastePreviewRatio == null || pastePreviewRatio <= 0.56) {
    throw new Error(`Expected preview-led card ratio above 0.56, received ${pastePreviewRatio ?? 'null'}.`)
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
    throw new Error(`Expected preview-led web card source row text, received "${webSourceText}".`)
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
    throw new Error(`Expected preview-led file card source row text, received "${fileSourceText}".`)
  }
  const homeFileCard = await captureLocatorScreenshot(page, fileCard, directory, `${stagePrefix}-home-file-card.png`)

  const sortTrigger = canvas.getByRole('button', { name: /Sort Home sources/i }).first()
  await sortTrigger.click()
  const sortPanel = toolbar.locator('.recall-home-parity-sort-panel-stage563').first()
  await sortPanel.waitFor({ state: 'visible', timeout: 20000 })
  const sortPopoverWidth = roundMetric((await sortPanel.boundingBox())?.width ?? 0)
  if (!sortPopoverWidth || sortPopoverWidth > stage572SortPopoverWidthBaseline) {
    throw new Error(
      `Expected sort popover width to stay at or below the Stage 572 baseline ${stage572SortPopoverWidthBaseline}px, received ${sortPopoverWidth || 'null'}.`,
    )
  }
  const homeSortPopover = await captureLocatorTopScreenshot(page, sortPanel, directory, `${stagePrefix}-home-sort-popover.png`, 320)
  await page.keyboard.press('Escape').catch(() => undefined)
  await page.waitForTimeout(150)
  await ensureSortMenuClosed(toolbar, canvas)

  await clickRailSection(rail, 'Captures')
  await expectCanvasLabel(canvas, 'Captures collection canvas')
  await page.waitForTimeout(200)

  const dayLabels = []
  const dayGroups = await getVisibleLocators(canvas, '.recall-home-parity-day-group-stage563')
  for (const group of dayGroups.slice(0, 3)) {
    dayLabels.push(normalizeText(await group.locator('h3').first().textContent()))
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
      activeRailSupportLength,
      activeRailSupportText,
      addTileHeight,
      boardCardDateNodeCount,
      canvasAriaLabel,
      dayLabels,
      filePreviewKind,
      fileSourceText,
      organizerTriggerText,
      pastePreviewKind,
      pastePreviewRatio,
      pasteSourceText,
      primaryRowCount,
      secondaryRowCount,
      sortPopoverWidth,
      toolbarActionCount,
      webPreviewKind,
      webSourceText,
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
  await page.locator('.recall-home-parity-canvas-stage563').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function openOriginalReaderFromHome(page, directory, stagePrefix) {
  await openHome(page)
  const rail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  await clickRailSection(rail, 'Captures')
  const canvas = page.locator('.recall-home-parity-canvas-stage563').first()
  await expectCanvasLabel(canvas, 'Captures collection canvas')

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
    throw new Error('Could not keep Reader in Original mode for the Stage 574 audit.')
  }

  const capture = await captureViewportScreenshot(page, directory, `${stagePrefix}-reader-original-wide-top.png`)
  return { capture, sourceTitle }
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
    throw new Error('Could not close the Home sort popover before the Stage 574 capture.')
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
