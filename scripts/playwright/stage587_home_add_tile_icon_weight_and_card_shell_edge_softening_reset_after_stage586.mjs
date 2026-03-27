import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE587_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE587_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE587_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE587_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE587_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE587_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage586AddTileMarkFontSizeBaseline = 37.12
const stage586AddTileMarkSizeBaseline = 48
const stage586AddTileMarkColorAlphaBaseline = 0.96
const stage586CardBorderAlphaBaseline = 0.06
const stage586CardBackgroundAlphaBaseline = 0.98

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage587-home-add-tile-icon-weight-and-card-shell-edge-softening-reset-after-stage586-failure.png',
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
  const homeEvidence = await captureHomeImplementation(page, outputDir, 'stage587')

  await writeFile(
    path.join(
      outputDir,
      'stage587-home-add-tile-icon-weight-and-card-shell-edge-softening-reset-after-stage586-validation.json',
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
          'The next polish pass should calm the Add Content plus-mark weight and soften the outer board-card shell edge.',
          'The structure, toolbar ownership, and source-aware card treatment should stay intact while the add-tile icon and card shell chrome yield a little more.',
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
          'stage587-home-add-tile-icon-weight-and-card-shell-edge-softening-reset-after-stage586-failure.png',
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
  const addTileLabel = normalizeText((await addTile.getAttribute('aria-label')) ?? '')
  const addTileMark = addTile.locator('.recall-home-parity-add-tile-mark-stage563').first()
  await addTileMark.waitFor({ state: 'visible', timeout: 20000 })
  const addTileMarkText = normalizeText(await addTileMark.textContent())
  const addTileMarkStyles = await addTileMark.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      height: styles.height,
      width: styles.width,
    }
  })

  const representativeCard = canvas.locator('.recall-home-parity-card-stage563').first()
  await representativeCard.waitFor({ state: 'visible', timeout: 20000 })
  const cardShellStyles = await representativeCard.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      backgroundColor: styles.backgroundColor,
      borderRadius: styles.borderRadius,
      borderTopColor: styles.borderTopColor,
    }
  })

  const addTileMarkFontSize = parseFloat(addTileMarkStyles.fontSize)
  const addTileMarkWidth = parseFloat(addTileMarkStyles.width)
  const addTileMarkHeight = parseFloat(addTileMarkStyles.height)
  const addTileMarkColorAlpha = parseCssAlpha(addTileMarkStyles.color)
  const cardBorderAlpha = parseCssAlpha(cardShellStyles.borderTopColor)
  const cardBackgroundAlpha = parseCssAlpha(cardShellStyles.backgroundColor)

  if (!addTileLabel || addTileMarkText !== '+') {
    throw new Error(
      `Expected Add Content tile plus-mark copy to remain visible, received ${JSON.stringify({
        addTileLabel,
        addTileMarkText,
      })}.`,
    )
  }
  if (
    addTileMarkFontSize >= stage586AddTileMarkFontSizeBaseline ||
    addTileMarkWidth >= stage586AddTileMarkSizeBaseline ||
    addTileMarkHeight >= stage586AddTileMarkSizeBaseline ||
    addTileMarkColorAlpha >= stage586AddTileMarkColorAlphaBaseline
  ) {
    throw new Error(
      `Expected calmer Add Content icon weight below the Stage 586 baseline, received ${JSON.stringify(
        addTileMarkStyles,
      )}.`,
    )
  }
  if (
    cardBorderAlpha >= stage586CardBorderAlphaBaseline ||
    cardBackgroundAlpha >= stage586CardBackgroundAlphaBaseline
  ) {
    throw new Error(
      `Expected softer board-card shell edge below the Stage 586 baseline, received ${JSON.stringify(
        cardShellStyles,
      )}.`,
    )
  }

  const visibleDayGroupCountNodeCount = await canvas.locator('.recall-home-parity-day-group-header-stage563 span').count()
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
      addTileLabel,
      addTileMarkStyles,
      addTileMarkText,
      cardShellStyles,
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
