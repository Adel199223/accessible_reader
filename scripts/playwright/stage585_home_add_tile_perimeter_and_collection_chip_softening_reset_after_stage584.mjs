import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE585_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE585_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE585_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE585_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE585_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE585_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage584AddTileBorderAlphaBaseline = 0.24
const stage584AddTileBackgroundAlphaBaseline = 0.94
const stage584ChipFontSizeBaseline = 8
const stage584ChipBackgroundAlphaBaseline = 0.012
const stage584ChipBorderAlphaBaseline = 0.03
const stage584ChipColorAlphaBaseline = 0.5

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage585-home-add-tile-perimeter-and-collection-chip-softening-reset-after-stage584-failure.png',
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
  const homeEvidence = await captureHomeImplementation(page, outputDir, 'stage585')

  await writeFile(
    path.join(
      outputDir,
      'stage585-home-add-tile-perimeter-and-collection-chip-softening-reset-after-stage584-validation.json',
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
          'The next polish pass should make the Add Content tile perimeter quieter and demote the lower collection chip beneath board cards.',
          'The structure, toolbar ownership, and source-aware card treatment should stay intact while the add-tile seam and collection chip calm down.',
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
          'stage585-home-add-tile-perimeter-and-collection-chip-softening-reset-after-stage584-failure.png',
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
  const addTileStyles = await addTile.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      backgroundColor: styles.backgroundColor,
      borderTopColor: styles.borderTopColor,
      borderTopStyle: styles.borderTopStyle,
      borderRadius: styles.borderRadius,
    }
  })

  const representativeCard = canvas.locator('.recall-home-parity-card-stage563').first()
  await representativeCard.waitFor({ state: 'visible', timeout: 20000 })
  const chip = representativeCard.locator('.recall-home-parity-card-chip-stage563').first()
  await chip.waitFor({ state: 'visible', timeout: 20000 })
  const chipText = normalizeText(await chip.textContent())
  const chipStyles = await chip.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      backgroundColor: styles.backgroundColor,
      borderTopColor: styles.borderTopColor,
      color: styles.color,
      fontSize: styles.fontSize,
    }
  })

  const addTileBorderAlpha = parseCssAlpha(addTileStyles.borderTopColor)
  const addTileBackgroundAlpha = parseCssAlpha(addTileStyles.backgroundColor)
  const chipFontSize = parseFloat(chipStyles.fontSize)
  const chipBackgroundAlpha = parseCssAlpha(chipStyles.backgroundColor)
  const chipBorderAlpha = parseCssAlpha(chipStyles.borderTopColor)
  const chipColorAlpha = parseCssAlpha(chipStyles.color)

  if (!addTileLabel || addTileStyles.borderTopStyle !== 'dashed') {
    throw new Error(`Expected Add Content tile with dashed perimeter, received ${JSON.stringify({ addTileLabel, addTileStyles })}.`)
  }
  if (
    addTileBorderAlpha >= stage584AddTileBorderAlphaBaseline ||
    addTileBackgroundAlpha >= stage584AddTileBackgroundAlphaBaseline
  ) {
    throw new Error(
      `Expected quieter Add Content tile perimeter below the Stage 584 baseline, received ${JSON.stringify(addTileStyles)}.`,
    )
  }
  if (
    !chipText ||
    chipFontSize >= stage584ChipFontSizeBaseline ||
    chipBackgroundAlpha >= stage584ChipBackgroundAlphaBaseline ||
    chipBorderAlpha >= stage584ChipBorderAlphaBaseline ||
    chipColorAlpha >= stage584ChipColorAlphaBaseline
  ) {
    throw new Error(
      `Expected quieter collection-chip chrome below the Stage 584 baseline, received ${JSON.stringify({ chipText, chipStyles })}.`,
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
      addTileStyles,
      chipStyles,
      chipText,
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
