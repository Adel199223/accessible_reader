import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE565_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE565_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE565_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE565_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE565_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE565_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage565-home-card-media-and-top-chrome-parity-polish-reset-after-stage564-failure.png'),
  { force: true },
)

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)
const { browser, runtimeBrowser } = await launchBrowser(chromium)

let page
try {
  page = await browser.newPage({ viewport: desktopViewport })
  const evidence = await captureHomeCardMediaParityEvidence(page, outputDir, 'stage565')

  await writeFile(
    path.join(
      outputDir,
      'stage565-home-card-media-and-top-chrome-parity-polish-reset-after-stage564-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        headless,
        runtimeBrowser,
        topChromeMetrics: evidence.topChromeMetrics,
        cardMediaMetrics: evidence.cardMediaMetrics,
        polishChecks: [
          'Home should keep the Stage 563 structural layout while retiring the visible in-canvas heading block.',
          'The first-screen toolbar should still be limited to Search, Add, List, and Sort.',
          'Web cards should render a hostname-aware poster treatment rather than the generic placeholder box.',
          'File cards should render a file-format poster treatment derived from source_type and file_name.',
        ],
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
        path: path.join(outputDir, 'stage565-home-card-media-and-top-chrome-parity-polish-reset-after-stage564-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function captureHomeCardMediaParityEvidence(page, directory, stagePrefix) {
  await openHome(page)

  const rail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  const canvas = page.locator('.recall-home-parity-canvas-stage563').first()
  const toolbar = canvas.locator('.recall-home-parity-toolbar-stage563').first()
  await rail.waitFor({ state: 'visible', timeout: 20000 })
  await canvas.waitFor({ state: 'visible', timeout: 20000 })
  await toolbar.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)

  const activeRailButton = rail.locator('.recall-home-parity-rail-button-active-stage563').first()
  await activeRailButton.waitFor({ state: 'visible', timeout: 20000 })
  const activeRailLabel = ((await activeRailButton.locator('strong').first().textContent()) ?? '').trim()
  const canvasAriaLabel = (await canvas.getAttribute('aria-label')) ?? ''
  const visibleToolbarHeadingCount = await getVisibleCount(canvas.locator('.recall-home-parity-toolbar-heading-stage563'))
  const toolbarActions = canvas.locator('.recall-home-parity-toolbar-actions-stage563').first()
  const toolbarActionCount = await toolbarActions.evaluate((node) => node.children.length)
  const addTile = canvas.getByRole('button', { name: new RegExp(`Add content to ${escapeRegExp(activeRailLabel)}`, 'i') }).first()
  const addTileBox = await addTile.boundingBox()

  if (canvasAriaLabel !== `${activeRailLabel} collection canvas`) {
    throw new Error(
      `Expected the Home canvas accessible label to track the active collection. Received "${canvasAriaLabel}" for "${activeRailLabel}".`,
    )
  }
  if (visibleToolbarHeadingCount !== 0) {
    throw new Error(`Expected no visible toolbar heading block, found ${visibleToolbarHeadingCount} visible heading nodes.`)
  }
  if (toolbarActionCount !== 4) {
    throw new Error(`Expected 4 visible Home toolbar controls, found ${toolbarActionCount}.`)
  }
  if (!addTileBox || addTileBox.height < 180) {
    throw new Error(`Home Add Content tile measured ${addTileBox ? addTileBox.height : 'null'}px tall; the Stage 565 lead tile regressed.`)
  }

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
    throw new Error(`Web card preview did not expose the expected Stage 565 poster treatment: "${webPreviewText}".`)
  }

  await clickRailSection(rail, 'Documents')
  await expectCanvasLabel(canvas, 'Documents collection canvas')
  const fileCard = canvas.locator('.recall-home-parity-card-stage563').first()
  await fileCard.waitFor({ state: 'visible', timeout: 20000 })
  const filePreview = fileCard.locator('.recall-home-parity-card-preview-file-stage565').first()
  const filePreviewKind = await filePreview.getAttribute('data-preview-kind')
  const filePreviewDetail = normalizeText(
    await filePreview.locator('.recall-home-parity-card-preview-detail-stage565').first().textContent(),
  )
  const filePreviewText = normalizeText(await filePreview.textContent())
  if (
    filePreviewKind !== 'file' ||
    !filePreviewDetail ||
    !/file/i.test(filePreviewText) ||
    !/Local document/i.test(filePreviewText)
  ) {
    throw new Error(`File card preview did not expose the expected Stage 565 poster treatment: "${filePreviewText}".`)
  }

  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)
  const homeToolbar = await captureLocatorTopScreenshot(page, toolbar, directory, `${stagePrefix}-home-toolbar.png`, 240)
  const homeRail = await captureLocatorTopScreenshot(page, rail, directory, `${stagePrefix}-home-collection-rail.png`, 980)
  const homeWebCard = await captureLocatorScreenshot(page, webCard, directory, `${stagePrefix}-home-web-card.png`)
  const homeFileCard = await captureLocatorScreenshot(page, fileCard, directory, `${stagePrefix}-home-file-card.png`)

  return {
    captures: {
      homeFileCard,
      homeRail,
      homeToolbar,
      homeWebCard,
      homeWideTop,
    },
    cardMediaMetrics: {
      filePreviewDetail,
      filePreviewKind,
      filePreviewText,
      webPreviewDetail,
      webPreviewKind,
      webPreviewText,
    },
    topChromeMetrics: {
      activeRailLabel,
      addTileHeight: addTileBox ? roundMetric(addTileBox.height) : null,
      canvasAriaLabel,
      toolbarActionCount,
      visibleToolbarHeadingCount,
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
