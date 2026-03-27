import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE600_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE600_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE600_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE600_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE600_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE600_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage580ActiveRailBackgroundAlphaBaseline = 0.82
const stage580ActiveRailBorderAlphaBaseline = 0.082
const stage580ActiveRailBoxShadowAlphaBaseline = 0.024
const stage571ActiveRailPreviewHeightBaseline = 16.61

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage600-post-stage599-home-rail-tree-simplification-and-board-continuation-demotion-audit-failure.png',
  ),
  { force: true },
)
await rm(
  path.join(
    outputDir,
    'stage600-post-stage599-home-rail-tree-simplification-and-board-continuation-demotion-audit-failure-reader.png',
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
  const homeEvidence = await captureHomeAudit(page, outputDir, 'stage600')

  await openGraph(page)
  const graphWideTop = await captureViewportScreenshot(page, outputDir, 'stage600-graph-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage600')

  await writeFile(
    path.join(
      outputDir,
      'stage600-post-stage599-home-rail-tree-simplification-and-board-continuation-demotion-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 599 rail-tree and board-continuation demotion pass',
          'the Home surface should keep the Stage 563 structure while flattening the active rail selection and quieting the board footer continuation',
          'Graph and original-only Reader remain regression surfaces only after the Home-only Stage 599 pass',
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
          'stage600-post-stage599-home-rail-tree-simplification-and-board-continuation-demotion-audit-failure.png',
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
          'stage600-post-stage599-home-rail-tree-simplification-and-board-continuation-demotion-audit-failure-reader.png',
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
  await rail.waitFor({ state: 'visible', timeout: 20000 })

  const canvas = page.locator('.recall-home-parity-canvas-stage563').first()
  await canvas.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)

  const addTile = canvas.locator('.recall-home-parity-add-tile-stage563').first()
  await addTile.waitFor({ state: 'visible', timeout: 20000 })

  const activeRailItem = rail.locator('.recall-home-parity-rail-item-active-stage599').first()
  await activeRailItem.waitFor({ state: 'visible', timeout: 20000 })

  const activeRailButton = activeRailItem.locator('.recall-home-parity-rail-button-active-stage599').first()
  await activeRailButton.waitFor({ state: 'visible', timeout: 20000 })
  const activeRailButtonStyles = await activeRailButton.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      backgroundColor: styles.backgroundColor,
      borderTopColor: styles.borderTopColor,
      borderRadius: styles.borderRadius,
      boxShadow: styles.boxShadow,
      paddingBottom: styles.paddingBottom,
      paddingTop: styles.paddingTop,
    }
  })
  const activeRailButtonBox = await activeRailButton.boundingBox()
  if (!activeRailButtonBox) {
    throw new Error('Expected measurable active rail button bounds in the Stage 600 audit.')
  }

  const activePreview = activeRailItem.locator('.recall-home-parity-rail-preview-stage599').first()
  await activePreview.waitFor({ state: 'visible', timeout: 20000 })
  const activePreviewStyles = await activePreview.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      paddingLeft: styles.paddingLeft,
    }
  })
  const activePreviewBox = await activePreview.boundingBox()
  if (!activePreviewBox) {
    throw new Error('Expected measurable active rail preview bounds in the Stage 600 audit.')
  }
  const activePreviewMark = activePreview.locator('.recall-home-parity-rail-preview-mark-stage571').first()
  await activePreviewMark.waitFor({ state: 'visible', timeout: 20000 })
  const activePreviewMarkStyles = await activePreviewMark.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      backgroundColor: styles.backgroundColor,
      height: styles.height,
      width: styles.width,
    }
  })

  const footerButton = canvas.getByRole('button', { name: /Show all .+,\s+\d+\s+total\s+sources?/i }).first()
  await footerButton.waitFor({ state: 'visible', timeout: 20000 })
  const footerVisibleLabel = normalizeText(
    await footerButton.locator('.recall-home-parity-footer-label-stage599').first().textContent(),
  )
  const footerHiddenTotal = normalizeText(
    await footerButton.locator('.recall-home-parity-footer-count-stage599').first().textContent(),
  )
  const visibleFooterNumericCountNodeCount = await canvas
    .locator('.recall-home-parity-footer-label-stage599')
    .evaluateAll((nodes) =>
      nodes.filter((node) => /\d/.test(node.textContent ?? '')).length,
    )

  const activeRailBackgroundAlpha = parseCssAlpha(activeRailButtonStyles.backgroundColor)
  const activeRailBorderAlpha = parseCssAlpha(activeRailButtonStyles.borderTopColor)
  const activeRailBoxShadowAlpha = parseCssAlpha(activeRailButtonStyles.boxShadow)
  const activePreviewTextAlpha = parseCssAlpha(activePreviewStyles.color)
  const activePreviewMarkAlpha = parseCssAlpha(activePreviewMarkStyles.backgroundColor)
  const activePreviewHeight = activePreviewBox.height
  const activePreviewMarkHeight = Number.parseFloat(activePreviewMarkStyles.height)

  if (!(activeRailBackgroundAlpha < stage580ActiveRailBackgroundAlphaBaseline)) {
    throw new Error(
      `Expected calmer active rail background below the Stage 580 baseline, received ${JSON.stringify(activeRailButtonStyles)}.`,
    )
  }
  if (!(activeRailBorderAlpha < stage580ActiveRailBorderAlphaBaseline)) {
    throw new Error(
      `Expected calmer active rail border below the Stage 580 baseline, received ${JSON.stringify(activeRailButtonStyles)}.`,
    )
  }
  if (!(activeRailBoxShadowAlpha < stage580ActiveRailBoxShadowAlphaBaseline)) {
    throw new Error(
      `Expected calmer active rail inset glow below the Stage 580 baseline, received ${JSON.stringify(activeRailButtonStyles)}.`,
    )
  }
  if (!(activePreviewHeight < stage571ActiveRailPreviewHeightBaseline)) {
    throw new Error(
      `Expected thinner active child preview seam below the earlier baseline, received ${activePreviewHeight}.`,
    )
  }
  if (!footerVisibleLabel || /\d/.test(footerVisibleLabel)) {
    throw new Error(
      `Expected label-only footer continuation copy without visible numbers, received "${footerVisibleLabel}".`,
    )
  }
  if (!/\d+\s+total\s+sources?/i.test(footerHiddenTotal)) {
    throw new Error(
      `Expected accessible-only footer total to remain present, received "${footerHiddenTotal}".`,
    )
  }

  const toolbarActionCount =
    (await canvas.locator('.recall-home-parity-toolbar-row-primary-stage567').first().evaluate((node) => node.children.length)) +
    (await canvas.locator('.recall-home-parity-toolbar-row-secondary-stage567').first().evaluate((node) => node.children.length))
  const visibleDayGroupCountNodeCount = await canvas.locator('.recall-home-parity-day-group-header-stage563 span').count()

  if (toolbarActionCount !== 4) {
    throw new Error(`Expected 4 visible Home toolbar controls, found ${toolbarActionCount}.`)
  }
  if (visibleDayGroupCountNodeCount !== 0) {
    throw new Error(`Expected no visible day-group count nodes, found ${visibleDayGroupCountNodeCount}.`)
  }
  if (visibleFooterNumericCountNodeCount !== 0) {
    throw new Error(`Expected no visible numeric footer-count nodes, found ${visibleFooterNumericCountNodeCount}.`)
  }

  const addTileCapture = await captureLocatorScreenshot(page, addTile, directory, `${stagePrefix}-home-add-tile.png`)
  const railCapture = await captureLocatorScreenshot(page, rail, directory, `${stagePrefix}-home-rail.png`)
  const activeRailCapture = await captureLocatorScreenshot(
    page,
    activeRailItem,
    directory,
    `${stagePrefix}-home-active-rail-item.png`,
  )
  const footerCapture = await captureLocatorScreenshot(page, footerButton, directory, `${stagePrefix}-home-footer.png`)
  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)

  return {
    captures: {
      activeRailItem: activeRailCapture,
      addTile: addTileCapture,
      footer: footerCapture,
      homeWideTop,
      rail: railCapture,
    },
    metrics: {
      activePreviewHeight,
      activePreviewMarkAlpha,
      activePreviewMarkHeight,
      activePreviewMarkStyles,
      activePreviewStyles,
      activePreviewTextAlpha,
      activeRailBackgroundAlpha,
      activeRailBorderAlpha,
      activeRailBoxShadowAlpha,
      activeRailButtonHeight: activeRailButtonBox.height,
      activeRailButtonStyles,
      footerHiddenTotal,
      footerVisibleLabel,
      toolbarActionCount,
      visibleFooterNumericCountNodeCount,
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
    throw new Error('Could not keep Reader in Original mode for the Stage 600 audit.')
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

function normalizeText(value) {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

function parseCssAlpha(colorValue) {
  const match = colorValue.match(/rgba?\(([^)]+)\)/i)
  if (!match) {
    return 1
  }
  const parts = match[1].split(',').map((part) => part.trim())
  if (parts.length < 4) {
    return 1
  }
  return Number(parts[3])
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
