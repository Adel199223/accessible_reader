import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE646_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE646_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE646_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE646_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE646_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE646_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage643PreviewRatioBaseline = 0.5737428023032629
const stage643CopyRatioBaseline = 0.3056429942418426
const stage643TitleLineHeightPxBaseline = 19.6992
const stage643TitleToSourceGapPxBaseline = 5.53125
const stage643SourceToChipGapPxBaseline = 4.859375
const stage615CardWidthFloor = 344
const stage615CardWidthCeiling = 356
const stage617HeadingTopOffsetPxCeiling = 92.5
const stage617GridTopOffsetPxCeiling = 118.5
const previewRatioCeiling = 0.573
const copyRatioFloor = 0.306
const titleLineHeightPxFloor = 19.82
const titleToSourceGapPxFloor = 5.64
const sourceToChipGapPxFloor = 4.97
const sourceFontSizePxFloor = 10.56
const chipFontSizePxFloor = 7.87
const sourceAlphaFloor = 0.77
const chipAlphaFloor = 0.6
const cardHeightPxCeiling = 206.5

await mkdir(outputDir, { recursive: true })
await rm(
    path.join(
      outputDir,
      'stage646-post-stage645-home-lower-card-copy-seam-and-title-source-chip-descent-settle-finish-audit-failure.png',
    ),
  { force: true },
)
await rm(
    path.join(
      outputDir,
      'stage646-post-stage645-home-lower-card-copy-seam-and-title-source-chip-descent-settle-finish-audit-failure-reader.png',
    ),
  { force: true },
)

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)
const { browser, runtimeBrowser } = await launchBrowser(chromium)

let page
let readerPage
try {
  page = await browser.newPage({ viewport: desktopViewport })
  const homeEvidence = await captureHomeAudit(page, outputDir, 'stage646')

  await openGraph(page)
  const graphWideTop = await captureViewportScreenshot(page, outputDir, 'stage646-graph-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage646')

  await writeFile(
    path.join(
      outputDir,
      'stage646-post-stage645-home-lower-card-copy-seam-and-title-source-chip-descent-settle-finish-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 645 lower-card copy-seam and title/source/chip settle finish pass',
          'the Home surface should keep the Stage 563 structure while the lower hierarchy reads slightly cleaner than the Stage 643 baseline across title, source row, and collection chip',
          'Graph and original-only Reader remain regression surfaces only after the Home-only Stage 645 pass',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          ...homeEvidence.captures,
          graphWideTop,
          readerOriginalWideTop: readerEvidence.capture,
        },
        desktopViewport,
        headless,
        homeMetrics: homeEvidence.metrics,
        readerSourceTitle: readerEvidence.sourceTitle,
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
          'stage646-post-stage645-home-lower-card-copy-seam-and-title-source-chip-descent-settle-finish-audit-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (readerPage && readerPage !== page) {
    await readerPage
      .screenshot({
        path: path.join(
          outputDir,
          'stage646-post-stage645-home-lower-card-copy-seam-and-title-source-chip-descent-settle-finish-audit-failure-reader.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function captureHomeAudit(page, directory, stagePrefix) {
  await openHome(page)

  const canvas = page.locator('.recall-home-parity-canvas-stage619').first()
  const dayGroup = canvas.locator('.recall-home-parity-day-group-stage617').first()
  const representativeCard = dayGroup.locator('.recall-home-parity-card-stage645').first()
  const preview = representativeCard.locator('.recall-home-parity-card-preview-stage645').first()
  const copy = representativeCard.locator('.recall-home-parity-card-copy-stage645').first()
  const title = representativeCard.locator('.recall-home-parity-card-title-stage645').first()
  const sourceRow = representativeCard.locator('.recall-home-parity-card-source-row-stage645').first()
  const source = representativeCard.locator('.recall-home-parity-card-source-stage645').first()
  const chip = representativeCard.locator('.recall-home-parity-card-chip-stage645').first()

  await Promise.all([
    canvas.waitFor({ state: 'visible', timeout: 20000 }),
    dayGroup.waitFor({ state: 'visible', timeout: 20000 }),
    representativeCard.waitFor({ state: 'visible', timeout: 20000 }),
    preview.waitFor({ state: 'visible', timeout: 20000 }),
    copy.waitFor({ state: 'visible', timeout: 20000 }),
    title.waitFor({ state: 'visible', timeout: 20000 }),
    sourceRow.waitFor({ state: 'visible', timeout: 20000 }),
    source.waitFor({ state: 'visible', timeout: 20000 }),
    chip.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  await page.waitForTimeout(350)

  const [representativeCardBox, previewBox, copyBox, titleBox, sourceRowBox, chipBox] = await Promise.all([
    readMeasuredBox(representativeCard, 'representative Stage 646 card'),
    readMeasuredBox(preview, 'Stage 646 card preview'),
    readMeasuredBox(copy, 'Stage 646 card copy block'),
    readMeasuredBox(title, 'Stage 646 card title'),
    readMeasuredBox(sourceRow, 'Stage 646 card source row'),
    readMeasuredBox(chip, 'Stage 646 card chip'),
  ])

  const [titleState, sourceState, chipState, canvasMetrics] = await Promise.all([
    readTitleState(title),
    readTextNodeState(source),
    readChipState(chip),
    page.evaluate(() => {
      const canvas = document.querySelector('.recall-home-parity-canvas-stage619')
      const dayHeader = canvas?.querySelector('.recall-home-parity-day-group-header-stage617')
      const grid = canvas?.querySelector('.recall-home-parity-grid-stage615')
      if (!(canvas instanceof HTMLElement) || !(dayHeader instanceof HTMLElement) || !(grid instanceof HTMLElement)) {
        throw new Error('Expected Stage 646 Home canvas, day header, and grid.')
      }
      const canvasBox = canvas.getBoundingClientRect()
      const dayHeaderBox = dayHeader.getBoundingClientRect()
      const gridBox = grid.getBoundingClientRect()
      return {
        gridTopOffsetPx: gridBox.top - canvasBox.top,
        headingTopOffsetPx: dayHeaderBox.top - canvasBox.top,
      }
    }),
  ])

  const previewRatio = previewBox.height / representativeCardBox.height
  const copyRatio = copyBox.height / representativeCardBox.height
  const titleToSourceGapPx = Math.max(0, sourceRowBox.y - (titleBox.y + titleBox.height))
  const sourceToChipGapPx = Math.max(0, chipBox.y - (sourceRowBox.y + sourceRowBox.height))

  if (!(previewRatio < stage643PreviewRatioBaseline && previewRatio <= previewRatioCeiling)) {
    throw new Error(`Expected preview ratio below the Stage 643 baseline and within the target band, found ${previewRatio}.`)
  }
  if (!(copyRatio > stage643CopyRatioBaseline && copyRatio >= copyRatioFloor)) {
    throw new Error(`Expected copy ratio above the Stage 643 baseline and within the target band, found ${copyRatio}.`)
  }
  if (!(titleState.lineHeightPx > stage643TitleLineHeightPxBaseline && titleState.lineHeightPx >= titleLineHeightPxFloor)) {
    throw new Error(`Expected title line-height above the Stage 643 baseline, found ${titleState.lineHeightPx}.`)
  }
  if (!(titleToSourceGapPx > stage643TitleToSourceGapPxBaseline && titleToSourceGapPx >= titleToSourceGapPxFloor)) {
    throw new Error(`Expected title-to-source gap above the Stage 643 baseline, found ${titleToSourceGapPx}.`)
  }
  if (!(sourceToChipGapPx > stage643SourceToChipGapPxBaseline && sourceToChipGapPx >= sourceToChipGapPxFloor)) {
    throw new Error(`Expected source-to-chip gap above the Stage 643 baseline, found ${sourceToChipGapPx}.`)
  }
  if (!(sourceState.fontSizePx >= sourceFontSizePxFloor && sourceState.alpha >= sourceAlphaFloor)) {
    throw new Error(`Expected source-row legibility to stay at or above the Stage 643 band, found ${sourceState.fontSizePx}px and alpha ${sourceState.alpha}.`)
  }
  if (!(chipState.fontSizePx >= chipFontSizePxFloor && chipState.alpha >= chipAlphaFloor)) {
    throw new Error(`Expected chip legibility to stay at or above the Stage 643 band, found ${chipState.fontSizePx}px and alpha ${chipState.alpha}.`)
  }
  if (!(representativeCardBox.width >= stage615CardWidthFloor && representativeCardBox.width <= stage615CardWidthCeiling)) {
    throw new Error(`Expected representative card width to stay in the Stage 615 cadence band, found ${representativeCardBox.width}.`)
  }
  if (!(representativeCardBox.height <= cardHeightPxCeiling)) {
    throw new Error(`Expected representative card height to stay in the compact Stage 615 band, found ${representativeCardBox.height}.`)
  }
  if (!(canvasMetrics.headingTopOffsetPx <= stage617HeadingTopOffsetPxCeiling)) {
    throw new Error(`Expected heading top offset to preserve the Stage 617 compaction band, found ${canvasMetrics.headingTopOffsetPx}.`)
  }
  if (!(canvasMetrics.gridTopOffsetPx <= stage617GridTopOffsetPxCeiling)) {
    throw new Error(`Expected first-row grid top offset to preserve the Stage 617 compaction band, found ${canvasMetrics.gridTopOffsetPx}.`)
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

  const homePasteCardCapture = await captureLocatorScreenshot(page, representativeCard, directory, `${stagePrefix}-home-paste-card.png`)
  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)

  const rail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  const webButton = rail.getByRole('button', { name: /^Web/i }).first()
  await webButton.click()
  await page.waitForTimeout(250)
  const webCard = canvas.locator('.recall-home-parity-card-stage645').first()
  await webCard.waitFor({ state: 'visible', timeout: 20000 })
  const homeWebCardCapture = await captureLocatorScreenshot(page, webCard, directory, `${stagePrefix}-home-web-card.png`)

  return {
    captures: {
      homePasteCard: homePasteCardCapture,
      homeWebCard: homeWebCardCapture,
      homeWideTop,
    },
    metrics: {
      cardHeight: representativeCardBox.height,
      cardWidth: representativeCardBox.width,
      chipAlpha: chipState.alpha,
      chipBackgroundAlpha: chipState.backgroundAlpha,
      chipBorderAlpha: chipState.borderAlpha,
      chipFontSizePx: chipState.fontSizePx,
      chipText: chipState.text,
      copyRatio,
      gridTopOffsetPx: canvasMetrics.gridTopOffsetPx,
      headingTopOffsetPx: canvasMetrics.headingTopOffsetPx,
      previewRatio,
      sourceAlpha: sourceState.alpha,
      sourceFontSizePx: sourceState.fontSizePx,
      sourceText: sourceState.text,
      sourceToChipGapPx,
      titleFontSizePx: titleState.fontSizePx,
      titleLineHeightPx: titleState.lineHeightPx,
      titleToSourceGapPx,
      toolbarActionCount,
      visibleDayGroupCountNodeCount,
    },
  }
}

async function openGraph(page) {
  const response = await page.goto(`${baseUrl}/recall?section=graph`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Graph navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function openHome(page) {
  const response = await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Home navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.locator('.recall-home-workspace').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('.recall-home-parity-canvas-stage619').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function openOriginalReaderFromHome(page, directory, stagePrefix) {
  await openHome(page)
  const rail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  const capturesButton = rail.locator('.recall-home-parity-rail-button-stage563').first()
  await capturesButton.click()
  await page.waitForTimeout(200)
  const sourceButton = page.locator('.recall-home-parity-card-stage563, .recall-home-parity-list-row-stage563').first()
  await sourceButton.waitFor({ state: 'visible', timeout: 20000 })
  const sourceTitle =
    normalizeText(await sourceButton.locator('strong').first().textContent().catch(() => '')) ||
    normalizeText(((await sourceButton.getAttribute('aria-label')) ?? '').replace(/^Open\s+/i, '')) ||
    'Home source'
  await sourceButton.click()
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('button', { name: 'Open in Reader' }).click()
  await page.waitForURL(/\/reader/, { timeout: 20000 })
  await page.locator('article').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(300)

  const originalTab = page.getByRole('tab', { name: 'Original', exact: true }).first()
  await originalTab.waitFor({ state: 'visible', timeout: 20000 })
  if ((await originalTab.getAttribute('aria-selected')) !== 'true') {
    await originalTab.click()
    await page.waitForTimeout(250)
  }
  if ((await originalTab.getAttribute('aria-selected')) !== 'true') {
    throw new Error('Could not keep Reader in Original mode for the Stage 646 audit.')
  }

  const capture = await captureViewportScreenshot(page, directory, `${stagePrefix}-reader-original-wide-top.png`)
  return { capture, sourceTitle }
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

async function readMeasuredBox(locator, label) {
  const box = await locator.boundingBox()
  if (!box) {
    throw new Error(`Expected measurable bounds for ${label}.`)
  }
  return box
}

async function readTitleState(locator) {
  const styles = await locator.evaluate((node) => {
    const computed = window.getComputedStyle(node)
    return {
      fontSize: computed.fontSize,
      lineHeight: computed.lineHeight,
    }
  })
  return {
    fontSizePx: Number.parseFloat(styles.fontSize),
    lineHeightPx: Number.parseFloat(styles.lineHeight),
  }
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
    throw new Error('Expected visible text content for the measured Stage 636 node.')
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
    throw new Error('Expected visible chip text for the measured Stage 636 chip.')
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
  return value?.replace(/\s+/g, ' ').trim() ?? ''
}

function parseColorAlpha(value) {
  const match = value.match(/rgba?\(([^)]+)\)/i)
  if (!match) {
    throw new Error(`Could not parse color value: ${value}`)
  }
  const channels = match[1].split(',').map((channel) => channel.trim())
  if (channels.length === 4) {
    return Number.parseFloat(channels[3])
  }
  return 1
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

function resolveHarnessDir(configuredHarnessDir) {
  const trimmed = configuredHarnessDir.trim()
  if (/^[A-Za-z]:\\/.test(trimmed)) {
    return trimmed
  }
  return path.resolve(repoRoot, trimmed)
}
