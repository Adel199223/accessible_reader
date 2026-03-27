import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE605_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE605_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE605_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE605_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE605_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE605_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage604DayGroupsGapBaseline = 12.16
const stage604DayGroupGapBaseline = 8.96
const stage604GridGapBaseline = 9.92
const stage604DetailFontSizePxBaseline = 8.64
const stage604DetailAlphaBaseline = 0.54
const stage604NoteFontSizePxBaseline = 8
const stage604NoteAlphaBaseline = 0.46

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage605-home-preview-label-softening-and-grid-whitespace-calibration-reset-after-stage604-failure.png',
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
  const homeEvidence = await captureHomeImplementation(page, outputDir, 'stage605')

  await writeFile(
    path.join(
      outputDir,
      'stage605-home-preview-label-softening-and-grid-whitespace-calibration-reset-after-stage604-validation.json',
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
          'The next polish pass should reduce the remaining Recall mismatch by softening poster detail labels and tightening day-group plus grid whitespace without reopening structure work.',
          'The rail, toolbar, card ownership, and source-aware poster variants should stay intact while the poster labels yield more cleanly and the board spacing reads slightly tighter.',
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
          'stage605-home-preview-label-softening-and-grid-whitespace-calibration-reset-after-stage604-failure.png',
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

  const dayGroups = canvas.locator('.recall-home-parity-day-groups-stage605').first()
  await dayGroups.waitFor({ state: 'visible', timeout: 20000 })
  const dayGroupsStyles = await dayGroups.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      gap: styles.rowGap || styles.gap,
    }
  })

  const firstDayGroup = canvas.locator('.recall-home-parity-day-group-stage605').first()
  await firstDayGroup.waitFor({ state: 'visible', timeout: 20000 })
  const dayGroupStyles = await firstDayGroup.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      gap: styles.rowGap || styles.gap,
    }
  })

  const firstGrid = canvas.locator('.recall-home-parity-grid-stage605').first()
  await firstGrid.waitFor({ state: 'visible', timeout: 20000 })
  const gridStyles = await firstGrid.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      columnGap: styles.columnGap,
      rowGap: styles.rowGap,
    }
  })

  const representativeCard = canvas.locator('.recall-home-parity-card-stage603').first()
  await representativeCard.waitFor({ state: 'visible', timeout: 20000 })
  const representativeCardBox = await representativeCard.boundingBox()
  if (!representativeCardBox) {
    throw new Error('Expected measurable representative card bounds after the Stage 605 preview-label softening pass.')
  }

  const detail = representativeCard.locator('.recall-home-parity-card-preview-detail-stage605').first()
  await detail.waitFor({ state: 'visible', timeout: 20000 })
  const detailText = normalizeText(await detail.textContent())
  const detailStyles = await detail.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      color: styles.color,
      fontSize: styles.fontSize,
    }
  })

  const note = representativeCard.locator('.recall-home-parity-card-preview-note-stage605').first()
  await note.waitFor({ state: 'visible', timeout: 20000 })
  const noteText = normalizeText(await note.textContent())
  const noteStyles = await note.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      letterSpacing: styles.letterSpacing,
    }
  })

  const dayGroupsGapPx = Number.parseFloat(dayGroupsStyles.gap)
  const dayGroupGapPx = Number.parseFloat(dayGroupStyles.gap)
  const gridGapPx = Number.parseFloat(gridStyles.columnGap)
  const detailFontSizePx = Number.parseFloat(detailStyles.fontSize)
  const detailAlpha = parseColorAlpha(detailStyles.color)
  const noteFontSizePx = Number.parseFloat(noteStyles.fontSize)
  const noteAlpha = parseColorAlpha(noteStyles.color)

  if (!(dayGroupsGapPx < stage604DayGroupsGapBaseline)) {
    throw new Error(`Expected tighter day-group spacing than the Stage 604 baseline, found ${dayGroupsGapPx}.`)
  }
  if (!(dayGroupGapPx < stage604DayGroupGapBaseline)) {
    throw new Error(`Expected a tighter per-group stack gap than the Stage 604 baseline, found ${dayGroupGapPx}.`)
  }
  if (!(gridGapPx < stage604GridGapBaseline)) {
    throw new Error(`Expected tighter card-grid spacing than the Stage 604 baseline, found ${gridGapPx}.`)
  }
  if (!(detailFontSizePx < stage604DetailFontSizePxBaseline)) {
    throw new Error(`Expected a softer preview detail size than the Stage 604 baseline, found ${detailFontSizePx}.`)
  }
  if (!(detailAlpha < stage604DetailAlphaBaseline)) {
    throw new Error(`Expected a softer preview detail alpha than the Stage 604 baseline, found ${detailAlpha}.`)
  }
  if (!(noteFontSizePx < stage604NoteFontSizePxBaseline)) {
    throw new Error(`Expected a softer preview note size than the Stage 604 baseline, found ${noteFontSizePx}.`)
  }
  if (!(noteAlpha < stage604NoteAlphaBaseline)) {
    throw new Error(`Expected a softer preview note alpha than the Stage 604 baseline, found ${noteAlpha}.`)
  }
  if (!detailText) {
    throw new Error('Expected representative poster detail text to stay visible in the Stage 605 pass.')
  }
  if (!noteText) {
    throw new Error('Expected representative poster note text to stay visible in the Stage 605 pass.')
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

  const homeCardCapture = await captureLocatorScreenshot(
    page,
    representativeCard,
    directory,
    `${stagePrefix}-home-card.png`,
  )
  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)

  return {
    captures: {
      homeCard: homeCardCapture,
      homeWideTop,
    },
    metrics: {
      dayGroupsGapPx,
      dayGroupGapPx,
      dayGroupsStyles,
      dayGroupStyles,
      gridGapPx,
      gridStyles,
      detailAlpha,
      detailFontSizePx,
      detailStyles,
      detailText,
      noteAlpha,
      noteFontSizePx,
      noteStyles,
      noteText,
      representativeCardHeight: representativeCardBox.height,
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
  await locator.screenshot({ path: screenshotPath })
  return screenshotPath
}

function resolveHarnessDir(candidate) {
  const normalizedCandidate = path.normalize(candidate)
  const windowsHarnessPath = path.join(normalizedCandidate, 'node_modules', 'playwright', 'index.mjs')
  return windowsHarnessPath.startsWith('\\\\wsl.localhost\\')
    ? path.join(wslUncToPosix(normalizedCandidate))
    : normalizedCandidate
}

function wslUncToPosix(candidate) {
  const parts = candidate.replace(/^\\\\wsl\.localhost\\[^\\]+\\/, '').split('\\')
  return path.posix.join('/', ...parts)
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

function normalizeText(value) {
  return value?.replace(/\s+/g, ' ').trim() ?? ''
}

function parseColorAlpha(value) {
  const match = value.match(/rgba?\(([^)]+)\)/i)
  if (!match) {
    return Number.NaN
  }
  const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()))
  return parts.length >= 4 ? parts[3] : 1
}
