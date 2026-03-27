import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE567_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE567_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE567_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE567_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE567_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE567_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage565AddTileHeightBaseline = 288
const stage566SortPopoverWidthBaseline = 220

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage567-home-rail-density-and-card-rhythm-parity-reset-after-stage566-failure.png'),
  { force: true },
)

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)
const { browser, runtimeBrowser } = await launchBrowser(chromium)

let page
try {
  page = await browser.newPage({ viewport: desktopViewport })
  const evidence = await captureHomeRailAndCardRhythmEvidence(page, outputDir, 'stage567')

  await writeFile(
    path.join(outputDir, 'stage567-home-rail-density-and-card-rhythm-parity-reset-after-stage566-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        headless,
        homeMetrics: evidence.metrics,
        parityChecks: [
          'Home should keep the selected-collection rail and day-grouped canvas while retiring the visible at-rest organizer block.',
          'The first-screen toolbar should still expose only Search, Add, List, and Sort while splitting into a lighter two-row cluster.',
          `The Add Content tile should stay below the ${stage565AddTileHeightBaseline}px Stage 565 baseline.`,
          `The Sort popover should stay below the ${stage566SortPopoverWidthBaseline}px Stage 566 baseline width.`,
          'Paste and web cards should keep source-aware fallback media while reading denser than the Stage 565 poster treatment.',
        ],
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
        path: path.join(outputDir, 'stage567-home-rail-density-and-card-rhythm-parity-reset-after-stage566-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function captureHomeRailAndCardRhythmEvidence(page, directory, stagePrefix) {
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
  const visibleAtRestOrganizerPanels = await getVisibleCount(rail.locator('.recall-home-parity-rail-overflow-panel-stage567'))
  const primaryRowCount = await toolbar
    .locator('.recall-home-parity-toolbar-row-primary-stage567')
    .first()
    .evaluate((node) => node.children.length)
  const secondaryRowCount = await toolbar
    .locator('.recall-home-parity-toolbar-row-secondary-stage567')
    .first()
    .evaluate((node) => node.children.length)
  const toolbarActionCount = primaryRowCount + secondaryRowCount
  const searchButton = canvas.getByRole('button', { name: 'Search saved sources' }).first()
  const searchTriggerText = normalizeText(await searchButton.textContent())
  const addTile = canvas.getByRole('button', { name: new RegExp(`Add content to ${escapeRegExp(activeRailLabel)}`, 'i') }).first()
  const addTileCopyNodeCount = await addTile.locator('.recall-home-parity-add-tile-copy-stage563 span').count()
  const addTileBox = await addTile.boundingBox()
  const firstDayHeading = canvas.locator('.recall-home-parity-day-group-header-stage563 h3').first()
  const canvasBox = await canvas.boundingBox()
  const dayHeadingBox = await firstDayHeading.boundingBox()
  const dayGroupTopOffset = canvasBox && dayHeadingBox ? roundMetric(dayHeadingBox.y - canvasBox.y) : null

  if (canvasAriaLabel !== `${activeRailLabel} collection canvas`) {
    throw new Error(`Expected Home canvas aria-label "${activeRailLabel} collection canvas", received "${canvasAriaLabel}".`)
  }
  if (visibleAtRestOrganizerPanels !== 0) {
    throw new Error(`Expected 0 visible organizer overflow panels at rest, found ${visibleAtRestOrganizerPanels}.`)
  }
  if (toolbarActionCount !== 4 || primaryRowCount !== 2 || secondaryRowCount !== 2) {
    throw new Error(`Expected a 2+2 Home toolbar cluster, found ${primaryRowCount}+${secondaryRowCount}.`)
  }
  if (!/Search\.\.\.\s*Ctrl\+K/i.test(searchTriggerText)) {
    throw new Error(`Search trigger no longer reads like an input placeholder: "${searchTriggerText}".`)
  }
  if (addTileCopyNodeCount !== 0) {
    throw new Error(`Add Content tile still renders helper copy nodes (${addTileCopyNodeCount}).`)
  }
  if (!addTileBox || addTileBox.height >= stage565AddTileHeightBaseline) {
    throw new Error(
      `Expected Add Content tile below ${stage565AddTileHeightBaseline}px, received ${addTileBox ? roundMetric(addTileBox.height) : 'null'}.`,
    )
  }

  const pasteCard = canvas.locator('.recall-home-parity-card-stage563').first()
  await pasteCard.waitFor({ state: 'visible', timeout: 20000 })
  const pastePreview = pasteCard.locator('.recall-home-parity-card-preview-paste-stage565').first()
  const pastePreviewKind = await pastePreview.getAttribute('data-preview-kind')
  const pastePreviewText = normalizeText(await pastePreview.textContent())
  if (pastePreviewKind !== 'paste' || !/Local capture/i.test(pastePreviewText)) {
    throw new Error(`Expected a dense paste poster in Captures, received "${pastePreviewText}".`)
  }

  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)
  const homeToolbarClosed = await captureLocatorTopScreenshot(page, toolbar, directory, `${stagePrefix}-home-toolbar-closed.png`, 220)
  const homeRail = await captureLocatorTopScreenshot(page, rail, directory, `${stagePrefix}-home-collection-rail.png`, 980)
  const homeAddTile = await captureLocatorScreenshot(page, addTile, directory, `${stagePrefix}-home-add-tile.png`)
  const homePasteCard = await captureLocatorScreenshot(page, pasteCard, directory, `${stagePrefix}-home-paste-card.png`)

  const sortTrigger = canvas.getByRole('button', { name: /Sort Home sources/i }).first()
  await sortTrigger.click()
  const sortPanel = toolbar.locator('.recall-home-parity-sort-panel-stage563').first()
  await sortPanel.waitFor({ state: 'visible', timeout: 20000 })
  const sortPanelBox = await sortPanel.boundingBox()
  const sortPopoverWidth = sortPanelBox ? roundMetric(sortPanelBox.width) : null
  if (!sortPopoverWidth || sortPopoverWidth >= stage566SortPopoverWidthBaseline) {
    throw new Error(
      `Expected Sort popover narrower than ${stage566SortPopoverWidthBaseline}px, received ${sortPopoverWidth ?? 'null'}.`,
    )
  }
  const homeSortPopover = await captureLocatorTopScreenshot(page, sortPanel, directory, `${stagePrefix}-home-sort-popover.png`, 360)
  await sortTrigger.click()
  await page.waitForTimeout(150)

  await clickRailSection(rail, 'Web')
  await expectCanvasLabel(canvas, 'Web collection canvas')
  const webCard = canvas.locator('.recall-home-parity-card-stage563').first()
  await webCard.waitFor({ state: 'visible', timeout: 20000 })
  const webPreview = webCard.locator('.recall-home-parity-card-preview-web-stage565').first()
  const webPreviewKind = await webPreview.getAttribute('data-preview-kind')
  const webPreviewDetail = normalizeText(
    await webPreview.locator('.recall-home-parity-card-preview-detail-stage565').first().textContent(),
  )
  const webPreviewText = normalizeText(await webPreview.textContent())
  if (webPreviewKind !== 'web' || !webPreviewDetail || !/Local snapshot/i.test(webPreviewText)) {
    throw new Error(`Expected a dense web poster in Web, received "${webPreviewText}".`)
  }
  const homeWebCard = await captureLocatorScreenshot(page, webCard, directory, `${stagePrefix}-home-web-card.png`)

  return {
    captures: {
      homeAddTile,
      homePasteCard,
      homeRail,
      homeSortPopover,
      homeToolbarClosed,
      homeWebCard,
      homeWideTop,
    },
    metrics: {
      activeRailLabel,
      addTileHeight: addTileBox ? roundMetric(addTileBox.height) : null,
      canvasAriaLabel,
      dayGroupTopOffset,
      pastePreviewKind,
      pastePreviewText,
      primaryRowCount,
      searchTriggerText,
      secondaryRowCount,
      sortPopoverWidth,
      toolbarActionCount,
      visibleAtRestOrganizerPanels,
      webPreviewDetail,
      webPreviewKind,
      webPreviewText,
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

async function getVisibleCount(locator) {
  const count = await locator.count()
  let visibleCount = 0
  for (let index = 0; index < count; index += 1) {
    if (await locator.nth(index).isVisible().catch(() => false)) {
      visibleCount += 1
    }
  }
  return visibleCount
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
  const sortPanel = toolbar.locator('.recall-home-parity-sort-panel-stage563').first()
  if (await sortPanel.isVisible().catch(() => false)) {
    const sortTrigger = canvas.getByRole('button', { name: /Sort Home sources/i }).first()
    await sortTrigger.click()
    await toolbar.page().waitForTimeout(150)
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
