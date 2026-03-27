import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE581_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE581_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE581_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE581_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE581_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE581_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage580ChildPreviewFontSizeBaseline = 10.24
const stage580ChildPreviewAlphaBaseline = 0.56
const stage580ChildPreviewMarkAlphaBaseline = 0.42
const stage580ChildPreviewMarkSizeBaseline = 4.8
const stage580PreviewDetailFontSizeBaseline = 9.44
const stage580PreviewDetailAlphaBaseline = 0.74
const stage580PreviewNoteFontSizeBaseline = 8.8
const stage580PreviewNoteAlphaBaseline = 0.62

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage581-home-active-child-preview-and-poster-detail-softening-reset-after-stage580-failure.png',
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
  const homeEvidence = await captureHomeImplementation(page, outputDir, 'stage581')

  await writeFile(
    path.join(
      outputDir,
      'stage581-home-active-child-preview-and-poster-detail-softening-reset-after-stage580-validation.json',
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
          'The next polish pass should calm the active child-preview chrome and soften poster detail lines.',
          'The structure, toolbar ownership, and accessibility state should stay intact while the attached preview seam and poster copy get quieter.',
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
          'stage581-home-active-child-preview-and-poster-detail-softening-reset-after-stage580-failure.png',
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

  const rail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  const canvas = page.locator('.recall-home-parity-canvas-stage563').first()
  await rail.waitFor({ state: 'visible', timeout: 20000 })
  await canvas.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)

  const activeRailButton = rail.locator('.recall-home-parity-rail-button-active-stage563').first()
  await activeRailButton.waitFor({ state: 'visible', timeout: 20000 })
  const activeRailLabel = normalizeText(await activeRailButton.locator('strong').first().textContent())
  const activeRailSupportText = normalizeText(
    await activeRailButton.locator('.recall-home-parity-rail-button-copy-stage563 span').first().textContent(),
  )
  const canvasAriaLabel = (await canvas.getAttribute('aria-label')) ?? ''

  const childPreview = rail.locator('.recall-home-parity-rail-preview-stage563').first()
  await childPreview.waitFor({ state: 'visible', timeout: 20000 })
  const childPreviewLabel = normalizeText(await childPreview.textContent())
  const childPreviewStyles = await childPreview.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      color: styles.color,
      fontSize: styles.fontSize,
    }
  })
  const childPreviewMark = childPreview.locator('.recall-home-parity-rail-preview-mark-stage571').first()
  const childPreviewMarkStyles = await childPreviewMark.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      backgroundColor: styles.backgroundColor,
      height: styles.height,
      width: styles.width,
    }
  })

  const representativeCard = canvas.locator('.recall-home-parity-card-stage563').first()
  await representativeCard.waitFor({ state: 'visible', timeout: 20000 })
  const previewDetail = representativeCard.locator('.recall-home-parity-card-preview-detail-stage565').first()
  const previewNote = representativeCard.locator('.recall-home-parity-card-preview-note-stage569').first()
  await previewDetail.waitFor({ state: 'visible', timeout: 20000 })
  await previewNote.waitFor({ state: 'visible', timeout: 20000 })
  const previewDetailText = normalizeText(await previewDetail.textContent())
  const previewNoteText = normalizeText(await previewNote.textContent())
  const previewDetailStyles = await previewDetail.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      color: styles.color,
      fontSize: styles.fontSize,
    }
  })
  const previewNoteStyles = await previewNote.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      color: styles.color,
      fontSize: styles.fontSize,
    }
  })

  const visibleDayGroupCountNodeCount = await canvas.locator('.recall-home-parity-day-group-header-stage563 span').count()

  if (canvasAriaLabel !== `${activeRailLabel} collection canvas`) {
    throw new Error(`Expected Home canvas aria-label "${activeRailLabel} collection canvas", received "${canvasAriaLabel}".`)
  }
  if (activeRailSupportText !== 'Local captures') {
    throw new Error(`Expected active selected-row support text "Local captures", received "${activeRailSupportText}".`)
  }
  if (visibleDayGroupCountNodeCount !== 0) {
    throw new Error(`Expected no visible day-group count nodes, found ${visibleDayGroupCountNodeCount}.`)
  }

  const childPreviewFontSize = parseFloat(childPreviewStyles.fontSize)
  const childPreviewAlpha = parseCssAlpha(childPreviewStyles.color)
  const childPreviewMarkAlpha = parseCssAlpha(childPreviewMarkStyles.backgroundColor)
  const childPreviewMarkHeight = parseFloat(childPreviewMarkStyles.height)
  const childPreviewMarkWidth = parseFloat(childPreviewMarkStyles.width)
  if (
    !childPreviewLabel ||
    childPreviewFontSize >= stage580ChildPreviewFontSizeBaseline ||
    childPreviewAlpha >= stage580ChildPreviewAlphaBaseline ||
    childPreviewMarkAlpha >= stage580ChildPreviewMarkAlphaBaseline ||
    childPreviewMarkHeight >= stage580ChildPreviewMarkSizeBaseline ||
    childPreviewMarkWidth >= stage580ChildPreviewMarkSizeBaseline
  ) {
    throw new Error(
      `Expected calmer active child-preview chrome below the Stage 580 baseline, received ${JSON.stringify({
        childPreviewLabel,
        childPreviewStyles,
        childPreviewMarkStyles,
      })}.`,
    )
  }

  const previewDetailFontSize = parseFloat(previewDetailStyles.fontSize)
  const previewDetailAlpha = parseCssAlpha(previewDetailStyles.color)
  const previewNoteFontSize = parseFloat(previewNoteStyles.fontSize)
  const previewNoteAlpha = parseCssAlpha(previewNoteStyles.color)
  if (
    !previewDetailText ||
    !previewNoteText ||
    previewDetailFontSize >= stage580PreviewDetailFontSizeBaseline ||
    previewDetailAlpha >= stage580PreviewDetailAlphaBaseline ||
    previewNoteFontSize >= stage580PreviewNoteFontSizeBaseline ||
    previewNoteAlpha >= stage580PreviewNoteAlphaBaseline
  ) {
    throw new Error(
      `Expected calmer poster detail lines below the Stage 580 baseline, received ${JSON.stringify({
        previewDetailText,
        previewDetailStyles,
        previewNoteText,
        previewNoteStyles,
      })}.`,
    )
  }

  const homeRail = await captureLocatorTopScreenshot(page, rail, directory, `${stagePrefix}-home-collection-rail.png`, 980)
  const homeCard = await captureLocatorScreenshot(page, representativeCard, directory, `${stagePrefix}-home-card.png`)
  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)

  return {
    captures: {
      homeCard,
      homeRail,
      homeWideTop,
    },
    metrics: {
      activeRailLabel,
      activeRailSupportText,
      canvasAriaLabel,
      childPreviewMarkStyles,
      childPreviewStyles,
      previewDetailStyles,
      previewDetailText,
      previewNoteStyles,
      previewNoteText,
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
