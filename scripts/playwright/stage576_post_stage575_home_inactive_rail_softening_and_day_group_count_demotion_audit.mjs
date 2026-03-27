import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE576_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE576_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE576_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE576_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE576_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE576_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage574AddTileHeightBaseline = 215.19
const stage574SortPopoverWidthBaseline = 182

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage576-post-stage575-home-inactive-rail-softening-and-day-group-count-demotion-audit-failure.png'),
  { force: true },
)
await rm(
  path.join(
    outputDir,
    'stage576-post-stage575-home-inactive-rail-softening-and-day-group-count-demotion-audit-failure-reader.png',
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
  const homeEvidence = await captureHomeAudit(page, outputDir, 'stage576')

  await openGraph(page)
  const graphWideTop = await captureViewportScreenshot(page, outputDir, 'stage576-graph-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage576')

  await writeFile(
    path.join(
      outputDir,
      'stage576-post-stage575-home-inactive-rail-softening-and-day-group-count-demotion-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 575 inactive-rail softening and day-group count demotion pass',
          'the Home surface should keep the Stage 563 structure while making inactive rail rows less carded and retiring visible day-group counts from the header',
          'Graph and original-only Reader remain regression surfaces only after the Home-only Stage 575 pass',
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
          'stage576-post-stage575-home-inactive-rail-softening-and-day-group-count-demotion-audit-failure.png',
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
          'stage576-post-stage575-home-inactive-rail-softening-and-day-group-count-demotion-audit-failure-reader.png',
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
  const canvasAriaLabel = (await canvas.getAttribute('aria-label')) ?? ''
  const inactiveRailButtons = await getVisibleLocators(rail, '.recall-home-parity-rail-button-inactive-stage575')
  const inactiveRailButtonCount = inactiveRailButtons.length
  const firstInactiveRailButton = inactiveRailButtons[0]
  const firstInactiveRailButtonStyles = firstInactiveRailButton
    ? await firstInactiveRailButton.evaluate((node) => {
        const styles = window.getComputedStyle(node)
        return {
          backgroundColor: styles.backgroundColor,
          borderTopColor: styles.borderTopColor,
        }
      })
    : null
  const organizerTriggerText = normalizeText(
    await rail.getByRole('button', { name: 'Organizer options' }).first().textContent(),
  )

  if (canvasAriaLabel !== `${activeRailLabel} collection canvas`) {
    throw new Error(`Expected Home canvas aria-label "${activeRailLabel} collection canvas", received "${canvasAriaLabel}".`)
  }
  if (activeRailSupportText !== 'Local captures') {
    throw new Error(`Expected active selected-row support text "Local captures", received "${activeRailSupportText}".`)
  }
  if (inactiveRailButtonCount < 2) {
    throw new Error(`Expected at least two inactive rail rows, found ${inactiveRailButtonCount}.`)
  }
  if (
    !firstInactiveRailButtonStyles ||
    firstInactiveRailButtonStyles.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
    firstInactiveRailButtonStyles.borderTopColor !== 'rgba(0, 0, 0, 0)'
  ) {
    throw new Error(
      `Expected inactive rail rows to render transparent at rest, received ${JSON.stringify(firstInactiveRailButtonStyles)}.`,
    )
  }
  if (organizerTriggerText !== '...') {
    throw new Error(`Expected compact organizer trigger text "...", received "${organizerTriggerText}".`)
  }

  const addTile = canvas.getByRole('button', { name: new RegExp(`Add content to ${escapeRegExp(activeRailLabel)}`, 'i') }).first()
  await addTile.waitFor({ state: 'visible', timeout: 20000 })
  const addTileHeight = roundMetric((await addTile.boundingBox())?.height ?? 0)
  if (!addTileHeight || addTileHeight > stage574AddTileHeightBaseline) {
    throw new Error(
      `Expected add-tile height to stay at or below the Stage 574 baseline ${stage574AddTileHeightBaseline}px, received ${addTileHeight || 'null'}.`,
    )
  }

  const visibleDayGroupCountNodeCount = await canvas.locator('.recall-home-parity-day-group-header-stage563 span').count()
  const firstDayGroup = canvas.locator('.recall-home-parity-day-group-stage563').first()
  const firstDayGroupAriaLabel = (await firstDayGroup.getAttribute('aria-label')) ?? ''
  if (visibleDayGroupCountNodeCount !== 0) {
    throw new Error(`Expected no visible day-group count nodes, found ${visibleDayGroupCountNodeCount}.`)
  }
  if (!/sources/i.test(firstDayGroupAriaLabel)) {
    throw new Error(`Expected first day-group aria-label to keep the source count context, received "${firstDayGroupAriaLabel}".`)
  }

  const sortTrigger = canvas.getByRole('button', { name: /Sort Home sources/i }).first()
  await sortTrigger.click()
  const sortPanel = toolbar.locator('.recall-home-parity-sort-panel-stage563').first()
  await sortPanel.waitFor({ state: 'visible', timeout: 20000 })
  const sortPopoverWidth = roundMetric((await sortPanel.boundingBox())?.width ?? 0)
  if (!sortPopoverWidth || sortPopoverWidth > stage574SortPopoverWidthBaseline) {
    throw new Error(
      `Expected sort popover width to stay at or below the Stage 574 baseline ${stage574SortPopoverWidthBaseline}px, received ${sortPopoverWidth || 'null'}.`,
    )
  }
  const homeSortPopover = await captureLocatorTopScreenshot(page, sortPanel, directory, `${stagePrefix}-home-sort-popover.png`, 320)
  await page.keyboard.press('Escape').catch(() => undefined)
  await page.waitForTimeout(150)
  await ensureSortMenuClosed(toolbar, canvas)

  const homeToolbarClosed = await captureLocatorTopScreenshot(page, toolbar, directory, `${stagePrefix}-home-toolbar-closed.png`, 210)
  const homeRail = await captureLocatorTopScreenshot(page, rail, directory, `${stagePrefix}-home-collection-rail.png`, 980)
  const homeAddTile = await captureLocatorScreenshot(page, addTile, directory, `${stagePrefix}-home-add-tile.png`)
  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)

  return {
    captures: {
      homeAddTile,
      homeRail,
      homeSortPopover,
      homeToolbarClosed,
      homeWideTop,
    },
    metrics: {
      activeRailLabel,
      activeRailSupportText,
      addTileHeight,
      canvasAriaLabel,
      firstDayGroupAriaLabel,
      firstInactiveRailButtonStyles,
      inactiveRailButtonCount,
      organizerTriggerText,
      sortPopoverWidth,
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
  await page.locator('.recall-home-parity-canvas-stage563').first().waitFor({ state: 'visible', timeout: 20000 })
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
    throw new Error('Could not keep Reader in Original mode for the Stage 576 audit.')
  }

  const capture = await captureViewportScreenshot(page, directory, `${stagePrefix}-reader-original-wide-top.png`)
  return { capture, sourceTitle }
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
    throw new Error('Could not close the Home sort popover before the Stage 576 capture.')
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
