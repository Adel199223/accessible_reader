import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE595_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE595_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE595_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE595_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE595_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE595_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage594PreviewBadgeBackgroundAlphaBaseline = 0.54
const stage594PreviewBadgeBorderAlphaBaseline = 0.05
const stage594UtilityBorderAlphaBaseline = 0.07

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage595-home-preview-badge-row-and-utility-pill-border-softening-reset-after-stage594-failure.png',
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
  const homeEvidence = await captureHomeImplementation(page, outputDir, 'stage595')

  await writeFile(
    path.join(
      outputDir,
      'stage595-home-preview-badge-row-and-utility-pill-border-softening-reset-after-stage594-validation.json',
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
          'The next polish pass should calm the preview badge row and soften visible utility-pill border emphasis.',
          'The structure, toolbar ownership, and source-aware card treatment should stay intact while the preview badge and utility pills yield a little more.',
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
          'stage595-home-preview-badge-row-and-utility-pill-border-softening-reset-after-stage594-failure.png',
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

  const addTile = canvas.locator('.recall-home-parity-add-tile-stage563').first()
  await addTile.waitFor({ state: 'visible', timeout: 20000 })

  const representativeCard = canvas.locator('.recall-home-parity-card-stage563').first()
  await representativeCard.waitFor({ state: 'visible', timeout: 20000 })

  const previewBadge = representativeCard.locator('.recall-home-parity-card-preview-badge-stage563').first()
  await previewBadge.waitFor({ state: 'visible', timeout: 20000 })
  const previewBadgeText = normalizeText(await previewBadge.textContent())
  const previewBadgeStyles = await previewBadge.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      backgroundColor: styles.backgroundColor,
      borderTopColor: styles.borderTopColor,
      color: styles.color,
      fontSize: styles.fontSize,
    }
  })

  const searchButton = canvas.locator('.recall-home-parity-toolbar-button-search-stage567').first()
  await searchButton.waitFor({ state: 'visible', timeout: 20000 })
  const searchButtonStyles = await searchButton.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      borderTopColor: styles.borderTopColor,
      backgroundColor: styles.backgroundColor,
    }
  })

  const listButton = canvas.locator('.recall-home-parity-toolbar-button-secondary-stage567').first()
  await listButton.waitFor({ state: 'visible', timeout: 20000 })
  const listButtonStyles = await listButton.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      borderTopColor: styles.borderTopColor,
      backgroundColor: styles.backgroundColor,
    }
  })

  const sortTrigger = canvas.locator('.recall-home-parity-sort-trigger-stage563').first()
  await sortTrigger.waitFor({ state: 'visible', timeout: 20000 })
  const sortTriggerStyles = await sortTrigger.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      borderTopColor: styles.borderTopColor,
      backgroundColor: styles.backgroundColor,
    }
  })

  const previewBadgeBackgroundAlpha = parseCssAlpha(previewBadgeStyles.backgroundColor)
  const previewBadgeBorderAlpha = parseCssAlpha(previewBadgeStyles.borderTopColor)
  const searchBorderAlpha = parseCssAlpha(searchButtonStyles.borderTopColor)
  const listBorderAlpha = parseCssAlpha(listButtonStyles.borderTopColor)
  const sortBorderAlpha = parseCssAlpha(sortTriggerStyles.borderTopColor)

  if (!previewBadgeText) {
    throw new Error('Expected representative preview badge text to remain visible after the Stage 595 polish pass.')
  }
  if (previewBadgeBackgroundAlpha >= stage594PreviewBadgeBackgroundAlphaBaseline) {
    throw new Error(
      `Expected quieter preview badge styling below the Stage 594 background baseline, received ${JSON.stringify(
        previewBadgeStyles,
      )}.`,
    )
  }
  if (previewBadgeBorderAlpha >= stage594PreviewBadgeBorderAlphaBaseline) {
    throw new Error(
      `Expected quieter preview badge border below the Stage 594 baseline, received ${JSON.stringify(
        previewBadgeStyles,
      )}.`,
    )
  }
  if (searchBorderAlpha >= stage594UtilityBorderAlphaBaseline) {
    throw new Error(
      `Expected lighter Search pill border below the Stage 594 baseline, received ${JSON.stringify(searchButtonStyles)}.`,
    )
  }
  if (listBorderAlpha >= stage594UtilityBorderAlphaBaseline) {
    throw new Error(
      `Expected lighter List pill border below the Stage 594 baseline, received ${JSON.stringify(listButtonStyles)}.`,
    )
  }
  if (sortBorderAlpha >= stage594UtilityBorderAlphaBaseline) {
    throw new Error(
      `Expected lighter Sort pill border below the Stage 594 baseline, received ${JSON.stringify(sortTriggerStyles)}.`,
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

  const addTileCapture = await captureLocatorScreenshot(page, addTile, directory, `${stagePrefix}-home-add-tile.png`)
  const homeCard = await captureLocatorScreenshot(page, representativeCard, directory, `${stagePrefix}-home-card.png`)
  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)

  return {
    captures: {
      addTile: addTileCapture,
      homeCard,
      homeWideTop,
    },
    metrics: {
      listBorderAlpha,
      listButtonStyles,
      previewBadgeBackgroundAlpha,
      previewBadgeBorderAlpha,
      previewBadgeStyles,
      previewBadgeText,
      searchBorderAlpha,
      searchButtonStyles,
      sortBorderAlpha,
      sortTriggerStyles,
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
