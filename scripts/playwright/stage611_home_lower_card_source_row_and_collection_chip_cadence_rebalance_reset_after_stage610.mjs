import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE611_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE611_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE611_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE611_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE611_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE611_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage608SourceFontSizePxBaseline = 10
const stage608ChipFontSizePxBaseline = 7.28
const stage608SourceAlphaBaseline = 0.6
const stage608ChipAlphaBaseline = 0.42
const sourceFontSizePxCeiling = 10.4
const chipFontSizePxCeiling = 7.68
const cardHeightPxCeiling = 206.5

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage611-home-lower-card-source-row-and-collection-chip-cadence-rebalance-reset-after-stage610-failure.png'),
  { force: true },
)

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)
const { browser, runtimeBrowser } = await launchBrowser(chromium)

let page
try {
  page = await browser.newPage({ viewport: desktopViewport })
  const homeEvidence = await captureHomeImplementation(page, outputDir, 'stage611')

  await writeFile(
    path.join(outputDir, 'stage611-home-lower-card-source-row-and-collection-chip-cadence-rebalance-reset-after-stage610-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: homeEvidence.captures,
        desktopViewport,
        headless,
        implementationFocus: [
          'Home keeps the Stage 563 selected-collection rail plus day-grouped canvas structure.',
          'The next polish pass should reduce the remaining Recall mismatch by making the lower source row and collection chip slightly more legible without giving back the denser Stage 603/607 card rhythm.',
          'The toolbar, rail, grouping, and source-aware poster treatments should stay intact while the lower card seam reads more like Recall card metadata.',
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
        path: path.join(outputDir, 'stage611-home-lower-card-source-row-and-collection-chip-cadence-rebalance-reset-after-stage610-failure.png'),
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

  const representativeCard = canvas.locator('.recall-home-parity-card-stage603').first()
  await representativeCard.waitFor({ state: 'visible', timeout: 20000 })
  const representativeCardBox = await representativeCard.boundingBox()
  if (!representativeCardBox) {
    throw new Error('Expected measurable representative card bounds in the Stage 611 validation.')
  }

  const source = representativeCard.locator('.recall-home-parity-card-source-stage611').first()
  const chip = representativeCard.locator('.recall-home-parity-card-chip-stage611').first()
  await Promise.all([
    source.waitFor({ state: 'visible', timeout: 20000 }),
    chip.waitFor({ state: 'visible', timeout: 20000 }),
  ])

  const [sourceState, chipState] = await Promise.all([
    readTextNodeState(source),
    readChipState(chip),
  ])

  if (!(sourceState.fontSizePx > stage608SourceFontSizePxBaseline && sourceState.fontSizePx <= sourceFontSizePxCeiling)) {
    throw new Error(`Expected source-row text to land above the Stage 608 baseline without exceeding the cadence ceiling, found ${sourceState.fontSizePx}.`)
  }
  if (!(sourceState.alpha > stage608SourceAlphaBaseline)) {
    throw new Error(`Expected source-row text to read more clearly than the Stage 608 baseline, found ${sourceState.alpha}.`)
  }
  if (!(chipState.fontSizePx > stage608ChipFontSizePxBaseline && chipState.fontSizePx <= chipFontSizePxCeiling)) {
    throw new Error(`Expected collection chip text to land above the Stage 608 baseline without exceeding the cadence ceiling, found ${chipState.fontSizePx}.`)
  }
  if (!(chipState.alpha > stage608ChipAlphaBaseline)) {
    throw new Error(`Expected collection chip text to read more clearly than the Stage 608 baseline, found ${chipState.alpha}.`)
  }
  if (!(representativeCardBox.height <= cardHeightPxCeiling)) {
    throw new Error(`Expected representative card height to stay compact after the Stage 611 pass, found ${representativeCardBox.height}.`)
  }
  if (!sourceState.text || !chipState.text) {
    throw new Error('Expected representative card source-row and collection-chip text to stay visible in the Stage 611 validation.')
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

  const homeCardCapture = await captureLocatorScreenshot(page, representativeCard, directory, `${stagePrefix}-home-card.png`)
  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)

  return {
    captures: {
      homeCard: homeCardCapture,
      homeWideTop,
    },
    metrics: {
      cardHeight: representativeCardBox.height,
      chipAlpha: chipState.alpha,
      chipBackgroundAlpha: chipState.backgroundAlpha,
      chipBorderAlpha: chipState.borderAlpha,
      chipFontSizePx: chipState.fontSizePx,
      chipText: chipState.text,
      sourceAlpha: sourceState.alpha,
      sourceFontSizePx: sourceState.fontSizePx,
      sourceText: sourceState.text,
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

async function readTextNodeState(locator) {
  const text = normalizeText(await locator.textContent())
  const styles = await locator.evaluate((node) => {
    const computed = window.getComputedStyle(node)
    return {
      color: computed.color,
      fontSize: computed.fontSize,
    }
  })
  if (!text) {
    throw new Error('Expected visible text content for the measured Stage 611 node.')
  }
  return {
    alpha: parseColorAlpha(styles.color),
    fontSizePx: Number.parseFloat(styles.fontSize),
    text,
  }
}

async function readChipState(locator) {
  const text = normalizeText(await locator.textContent())
  const styles = await locator.evaluate((node) => {
    const computed = window.getComputedStyle(node)
    return {
      backgroundColor: computed.backgroundColor,
      borderColor: computed.borderColor,
      color: computed.color,
      fontSize: computed.fontSize,
    }
  })
  if (!text) {
    throw new Error('Expected visible collection-chip text content for the Stage 611 measurement.')
  }
  return {
    alpha: parseColorAlpha(styles.color),
    backgroundAlpha: parseColorAlpha(styles.backgroundColor),
    borderAlpha: parseColorAlpha(styles.borderColor),
    fontSizePx: Number.parseFloat(styles.fontSize),
    text,
  }
}

function normalizeText(value) {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

function parseColorAlpha(value) {
  const match = value.match(/rgba?\(([^)]+)\)/i)
  if (!match) {
    return Number.NaN
  }
  const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()))
  return parts.length >= 4 ? parts[3] : 1
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
