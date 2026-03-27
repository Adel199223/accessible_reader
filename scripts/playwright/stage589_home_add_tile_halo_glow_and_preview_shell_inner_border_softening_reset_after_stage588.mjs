import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE589_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE589_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE589_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE589_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE589_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE589_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage588AddTileHaloAlphaBaseline = 0.16
const stage588PreviewBorderAlphaBaseline = 0.05

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage589-home-add-tile-halo-glow-and-preview-shell-inner-border-softening-reset-after-stage588-failure.png',
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
  const homeEvidence = await captureHomeImplementation(page, outputDir, 'stage589')

  await writeFile(
    path.join(
      outputDir,
      'stage589-home-add-tile-halo-glow-and-preview-shell-inner-border-softening-reset-after-stage588-validation.json',
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
          'The next polish pass should calm the Add Content halo glow and soften the preview shell inner border.',
          'The structure, toolbar ownership, and source-aware card treatment should stay intact while the add-tile halo and preview shell chrome yield a little more.',
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
          'stage589-home-add-tile-halo-glow-and-preview-shell-inner-border-softening-reset-after-stage588-failure.png',
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
      backgroundImage: styles.backgroundImage,
      color: styles.color,
      fontSize: styles.fontSize,
    }
  })

  const representativeCard = canvas.locator('.recall-home-parity-card-stage563').first()
  await representativeCard.waitFor({ state: 'visible', timeout: 20000 })
  const previewShell = representativeCard.locator('.recall-home-parity-card-preview-stage563').first()
  await previewShell.waitFor({ state: 'visible', timeout: 20000 })
  const previewShellStyles = await previewShell.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      backgroundColor: styles.backgroundColor,
      borderTopColor: styles.borderTopColor,
      borderRadius: styles.borderRadius,
    }
  })

  const addTileHaloAlpha = parseMaxCssAlpha(addTileMarkStyles.backgroundImage)
  const previewBorderAlpha = parseCssAlpha(previewShellStyles.borderTopColor)

  if (!addTileLabel || addTileMarkText !== '+') {
    throw new Error(
      `Expected Add Content tile plus-mark copy to remain visible, received ${JSON.stringify({
        addTileLabel,
        addTileMarkText,
      })}.`,
    )
  }
  if (addTileHaloAlpha >= stage588AddTileHaloAlphaBaseline) {
    throw new Error(
      `Expected calmer Add Content halo glow below the Stage 588 baseline, received ${JSON.stringify(
        addTileMarkStyles,
      )}.`,
    )
  }
  if (previewBorderAlpha >= stage588PreviewBorderAlphaBaseline) {
    throw new Error(
      `Expected softer preview-shell inner border below the Stage 588 baseline, received ${JSON.stringify(
        previewShellStyles,
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
      addTileHaloAlpha,
      addTileLabel,
      addTileMarkStyles,
      addTileMarkText,
      previewShellStyles,
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

function parseMaxCssAlpha(value) {
  const matches = Array.from(value.matchAll(/rgba?\(([^)]+)\)/gi))
  if (!matches.length) {
    return 1
  }
  return matches.reduce((maxAlpha, match) => {
    const parts = match[1].split(',').map((part) => part.trim())
    const alpha = parts.length >= 4 ? Number(parts[3]) : 1
    return Number.isFinite(alpha) ? Math.max(maxAlpha, alpha) : maxAlpha
  }, 0)
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
