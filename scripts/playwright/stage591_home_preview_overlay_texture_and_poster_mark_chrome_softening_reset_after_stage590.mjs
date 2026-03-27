import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE591_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE591_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE591_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE591_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE591_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE591_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage590PreviewOverlayOpacityBaseline = 0.24
const stage590PreviewOverlayTextureAlphaBaseline = 0.08
const stage590PosterMarkBackgroundAlphaBaseline = 0.28
const stage590PosterMarkBorderAlphaBaseline = 0.18

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage591-home-preview-overlay-texture-and-poster-mark-chrome-softening-reset-after-stage590-failure.png',
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
  const homeEvidence = await captureHomeImplementation(page, outputDir, 'stage591')

  await writeFile(
    path.join(
      outputDir,
      'stage591-home-preview-overlay-texture-and-poster-mark-chrome-softening-reset-after-stage590-validation.json',
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
          'The next polish pass should calm the preview overlay texture and soften the poster mark chrome.',
          'The structure, toolbar ownership, and source-aware card treatment should stay intact while the preview texture and poster mark chrome yield a little more.',
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
          'stage591-home-preview-overlay-texture-and-poster-mark-chrome-softening-reset-after-stage590-failure.png',
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

  const previewShell = representativeCard.locator('.recall-home-parity-card-preview-stage563').first()
  await previewShell.waitFor({ state: 'visible', timeout: 20000 })

  const previewOverlayStyles = await previewShell.evaluate((node) => {
    const styles = window.getComputedStyle(node, '::after')
    return {
      backgroundImage: styles.backgroundImage,
      opacity: styles.opacity,
    }
  })

  const previewMark = representativeCard.locator('.recall-home-parity-card-preview-mark-stage565').first()
  await previewMark.waitFor({ state: 'visible', timeout: 20000 })
  const previewMarkText = normalizeText(await previewMark.textContent())
  const previewMarkStyles = await previewMark.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      backgroundImage: styles.backgroundImage,
      borderTopColor: styles.borderTopColor,
      color: styles.color,
      fontSize: styles.fontSize,
    }
  })

  const previewOverlayOpacity = Number(previewOverlayStyles.opacity)
  const previewOverlayTextureAlpha = parseMaxCssAlpha(previewOverlayStyles.backgroundImage)
  const previewMarkBackgroundAlpha = parseMaxCssAlpha(previewMarkStyles.backgroundImage)
  const previewMarkBorderAlpha = parseCssAlpha(previewMarkStyles.borderTopColor)

  if (!previewMarkText) {
    throw new Error('Expected representative poster mark text to remain visible after the Stage 591 polish pass.')
  }
  if (previewOverlayOpacity >= stage590PreviewOverlayOpacityBaseline) {
    throw new Error(
      `Expected calmer preview overlay opacity below the Stage 590 baseline, received ${JSON.stringify(
        previewOverlayStyles,
      )}.`,
    )
  }
  if (previewOverlayTextureAlpha >= stage590PreviewOverlayTextureAlphaBaseline) {
    throw new Error(
      `Expected calmer preview overlay texture below the Stage 590 baseline, received ${JSON.stringify(
        previewOverlayStyles,
      )}.`,
    )
  }
  if (previewMarkBackgroundAlpha >= stage590PosterMarkBackgroundAlphaBaseline) {
    throw new Error(
      `Expected softer poster mark chrome below the Stage 590 background baseline, received ${JSON.stringify(
        previewMarkStyles,
      )}.`,
    )
  }
  if (previewMarkBorderAlpha >= stage590PosterMarkBorderAlphaBaseline) {
    throw new Error(
      `Expected softer poster mark border below the Stage 590 baseline, received ${JSON.stringify(
        previewMarkStyles,
      )}.`,
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
      previewMarkBackgroundAlpha,
      previewMarkBorderAlpha,
      previewMarkStyles,
      previewMarkText,
      previewOverlayOpacity,
      previewOverlayStyles,
      previewOverlayTextureAlpha,
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
