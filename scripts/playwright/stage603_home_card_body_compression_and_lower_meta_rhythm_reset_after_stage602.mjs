import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE603_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE603_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE603_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE603_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE603_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE603_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage602AddTileHeightBaseline = 215.2
const stage602CardHeightBaseline = 215.2
const stage602CardPaddingBaseline = 8.32
const stage602TitleFontSizePxBaseline = 14.24
const stage602SourceFontSizePxBaseline = 10.24
const stage602ChipFontSizePxBaseline = 7.52

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage603-home-card-body-compression-and-lower-meta-rhythm-reset-after-stage602-failure.png',
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
  const homeEvidence = await captureHomeImplementation(page, outputDir, 'stage603')

  await writeFile(
    path.join(
      outputDir,
      'stage603-home-card-body-compression-and-lower-meta-rhythm-reset-after-stage602-validation.json',
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
          'The next polish pass should make the lower portion of the cards read closer to Recall by compressing the body beneath the poster and calming lower meta.',
          'The structure, toolbar, rail ownership, and source-aware poster treatment should stay intact while the first card row lands denser and cleaner.',
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
          'stage603-home-card-body-compression-and-lower-meta-rhythm-reset-after-stage602-failure.png',
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

  const addTile = canvas.locator('.recall-home-parity-add-tile-stage603').first()
  await addTile.waitFor({ state: 'visible', timeout: 20000 })
  const addTileBox = await addTile.boundingBox()
  if (!addTileBox) {
    throw new Error('Expected measurable Add Content tile bounds after the Stage 603 card-body compression pass.')
  }

  const representativeCard = canvas.locator('.recall-home-parity-card-stage603').first()
  await representativeCard.waitFor({ state: 'visible', timeout: 20000 })
  const representativeCardBox = await representativeCard.boundingBox()
  if (!representativeCardBox) {
    throw new Error('Expected measurable representative card bounds after the Stage 603 card-body compression pass.')
  }
  const representativeCardStyles = await representativeCard.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      paddingTop: styles.paddingTop,
      paddingBottom: styles.paddingBottom,
      rowGap: styles.rowGap,
    }
  })

  const title = representativeCard.locator('.recall-home-parity-card-title-stage603').first()
  await title.waitFor({ state: 'visible', timeout: 20000 })
  const titleStyles = await title.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      fontSize: styles.fontSize,
      lineHeight: styles.lineHeight,
      fontWeight: styles.fontWeight,
    }
  })

  const source = representativeCard.locator('.recall-home-parity-card-source-stage603').first()
  await source.waitFor({ state: 'visible', timeout: 20000 })
  const sourceText = normalizeText(await source.textContent())
  const sourceStyles = await source.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      color: styles.color,
      fontSize: styles.fontSize,
    }
  })

  const chip = representativeCard.locator('.recall-home-parity-card-chip-stage603').first()
  await chip.waitFor({ state: 'visible', timeout: 20000 })
  const chipText = normalizeText(await chip.textContent())
  const chipStyles = await chip.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      paddingLeft: styles.paddingLeft,
      paddingRight: styles.paddingRight,
    }
  })

  const cardPaddingTopPx = Number.parseFloat(representativeCardStyles.paddingTop)
  const titleFontSizePx = Number.parseFloat(titleStyles.fontSize)
  const sourceFontSizePx = Number.parseFloat(sourceStyles.fontSize)
  const chipFontSizePx = Number.parseFloat(chipStyles.fontSize)

  if (!(addTileBox.height < stage602AddTileHeightBaseline)) {
    throw new Error(`Expected a shorter Add Content tile than the Stage 602 baseline, found ${addTileBox.height}.`)
  }
  if (!(representativeCardBox.height < stage602CardHeightBaseline)) {
    throw new Error(`Expected a shorter representative card than the Stage 602 baseline, found ${representativeCardBox.height}.`)
  }
  if (!(cardPaddingTopPx < stage602CardPaddingBaseline)) {
    throw new Error(
      `Expected tighter card shell padding below the Stage 602 baseline, received ${JSON.stringify(representativeCardStyles)}.`,
    )
  }
  if (!(titleFontSizePx < stage602TitleFontSizePxBaseline)) {
    throw new Error(`Expected a calmer card title size below the Stage 602 baseline, found ${titleFontSizePx}.`)
  }
  if (!(sourceFontSizePx < stage602SourceFontSizePxBaseline)) {
    throw new Error(`Expected a calmer card source row size below the Stage 602 baseline, found ${sourceFontSizePx}.`)
  }
  if (!(chipFontSizePx < stage602ChipFontSizePxBaseline)) {
    throw new Error(`Expected a quieter card chip size below the Stage 602 baseline, found ${chipFontSizePx}.`)
  }
  if (!sourceText) {
    throw new Error('Expected the representative card source row to stay visible in the Stage 603 pass.')
  }
  if (!chipText) {
    throw new Error('Expected the representative card collection chip to stay visible in the Stage 603 pass.')
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

  const addTileCapture = await captureLocatorScreenshot(page, addTile, directory, `${stagePrefix}-home-add-tile.png`)
  const homeCardCapture = await captureLocatorScreenshot(
    page,
    representativeCard,
    directory,
    `${stagePrefix}-home-card.png`,
  )
  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)

  return {
    captures: {
      addTile: addTileCapture,
      homeCard: homeCardCapture,
      homeWideTop,
    },
    metrics: {
      addTileHeight: addTileBox.height,
      cardHeight: representativeCardBox.height,
      cardPaddingTopPx,
      cardStyles: representativeCardStyles,
      chipFontSizePx,
      chipStyles,
      chipText,
      sourceFontSizePx,
      sourceStyles,
      sourceText,
      titleFontSizePx,
      titleStyles,
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
