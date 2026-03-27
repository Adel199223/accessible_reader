import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE614_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE614_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE614_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE614_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE614_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE614_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage612PreviewRatioBaseline = 0.6565834932821497
const stage612CopyRatioBaseline = 0.24084452975047985
const stage612TitleLineHeightPxBaseline = 15.312
const stage612SourceToChipGapPxBaseline = 1.44
const previewRatioCeiling = 0.645
const copyRatioFloor = 0.246
const titleLineHeightPxFloor = 15.4
const titleToSourceGapPxFloor = 1.8
const sourceToChipGapPxFloor = 1.5
const sourceFontSizePxFloor = 10.2
const chipFontSizePxFloor = 7.5
const sourceAlphaFloor = 0.63
const chipAlphaFloor = 0.47
const cardHeightPxCeiling = 206.5

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage614-post-stage613-home-lower-card-vertical-share-and-title-source-chip-rhythm-audit-failure.png',
  ),
  { force: true },
)
await rm(
  path.join(
    outputDir,
    'stage614-post-stage613-home-lower-card-vertical-share-and-title-source-chip-rhythm-audit-failure-reader.png',
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
  const homeEvidence = await captureHomeAudit(page, outputDir, 'stage614')

  await openGraph(page)
  const graphWideTop = await captureViewportScreenshot(page, outputDir, 'stage614-graph-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage614')

  await writeFile(
    path.join(
      outputDir,
      'stage614-post-stage613-home-lower-card-vertical-share-and-title-source-chip-rhythm-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 613 lower-card vertical-share and rhythm pass',
          'the Home surface should keep the Stage 563 structure while reclaiming a small amount of card height from the preview and returning that space to the lower title/source/chip seam',
          'Graph and original-only Reader remain regression surfaces only after the Home-only Stage 613 pass',
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
          'stage614-post-stage613-home-lower-card-vertical-share-and-title-source-chip-rhythm-audit-failure.png',
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
          'stage614-post-stage613-home-lower-card-vertical-share-and-title-source-chip-rhythm-audit-failure-reader.png',
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

  const canvas = page.locator('.recall-home-parity-canvas-stage563').first()
  await canvas.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)

  const representativeCard = canvas.locator('.recall-home-parity-card-stage613').first()
  await representativeCard.waitFor({ state: 'visible', timeout: 20000 })

  const preview = representativeCard.locator('.recall-home-parity-card-preview-stage613').first()
  const copy = representativeCard.locator('.recall-home-parity-card-copy-stage613').first()
  const title = representativeCard.locator('.recall-home-parity-card-title-stage613').first()
  const sourceRow = representativeCard.locator('.recall-home-parity-card-source-row-stage611').first()
  const source = representativeCard.locator('.recall-home-parity-card-source-stage611').first()
  const chip = representativeCard.locator('.recall-home-parity-card-chip-stage611').first()

  await Promise.all([
    preview.waitFor({ state: 'visible', timeout: 20000 }),
    copy.waitFor({ state: 'visible', timeout: 20000 }),
    title.waitFor({ state: 'visible', timeout: 20000 }),
    sourceRow.waitFor({ state: 'visible', timeout: 20000 }),
    source.waitFor({ state: 'visible', timeout: 20000 }),
    chip.waitFor({ state: 'visible', timeout: 20000 }),
  ])

  const [representativeCardBox, previewBox, copyBox, titleBox, sourceRowBox, chipBox] = await Promise.all([
    readMeasuredBox(representativeCard, 'representative Stage 614 card'),
    readMeasuredBox(preview, 'Stage 614 card preview'),
    readMeasuredBox(copy, 'Stage 614 card copy block'),
    readMeasuredBox(title, 'Stage 614 card title'),
    readMeasuredBox(sourceRow, 'Stage 614 card source row'),
    readMeasuredBox(chip, 'Stage 614 card chip'),
  ])

  const [titleStyles, sourceState, chipState] = await Promise.all([
    readTitleState(title),
    readTextNodeState(source),
    readChipState(chip),
  ])

  const previewRatio = previewBox.height / representativeCardBox.height
  const copyRatio = copyBox.height / representativeCardBox.height
  const titleToSourceGapPx = Math.max(0, sourceRowBox.y - (titleBox.y + titleBox.height))
  const sourceToChipGapPx = Math.max(0, chipBox.y - (sourceRowBox.y + sourceRowBox.height))

  if (!(previewRatio < stage612PreviewRatioBaseline && previewRatio <= previewRatioCeiling)) {
    throw new Error(`Expected preview ratio below the Stage 612 baseline and within the target band, found ${previewRatio}.`)
  }
  if (!(copyRatio > stage612CopyRatioBaseline && copyRatio >= copyRatioFloor)) {
    throw new Error(`Expected copy ratio above the Stage 612 baseline and within the target band, found ${copyRatio}.`)
  }
  if (!(titleStyles.lineHeightPx > stage612TitleLineHeightPxBaseline && titleStyles.lineHeightPx >= titleLineHeightPxFloor)) {
    throw new Error(`Expected title line-height above the Stage 612 baseline, found ${titleStyles.lineHeightPx}.`)
  }
  if (!(titleToSourceGapPx >= titleToSourceGapPxFloor)) {
    throw new Error(`Expected title-to-source gap to open slightly in Stage 614, found ${titleToSourceGapPx}.`)
  }
  if (!(sourceToChipGapPx > stage612SourceToChipGapPxBaseline && sourceToChipGapPx >= sourceToChipGapPxFloor)) {
    throw new Error(`Expected source-to-chip gap above the Stage 612 baseline, found ${sourceToChipGapPx}.`)
  }
  if (!(sourceState.fontSizePx >= sourceFontSizePxFloor && sourceState.alpha >= sourceAlphaFloor)) {
    throw new Error(`Expected source-row legibility to stay at or above the Stage 612 band, found ${sourceState.fontSizePx}px and alpha ${sourceState.alpha}.`)
  }
  if (!(chipState.fontSizePx >= chipFontSizePxFloor && chipState.alpha >= chipAlphaFloor)) {
    throw new Error(`Expected chip legibility to stay at or above the Stage 612 band, found ${chipState.fontSizePx}px and alpha ${chipState.alpha}.`)
  }
  if (!(representativeCardBox.height <= cardHeightPxCeiling)) {
    throw new Error(`Expected representative card height to stay compact after the Stage 613 pass, found ${representativeCardBox.height}.`)
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
      copyRatio,
      previewRatio,
      sourceAlpha: sourceState.alpha,
      sourceFontSizePx: sourceState.fontSizePx,
      sourceText: sourceState.text,
      sourceToChipGapPx,
      titleFontSizePx: titleStyles.fontSizePx,
      titleLineHeightPx: titleStyles.lineHeightPx,
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
  await page.locator('.recall-home-parity-canvas-stage563').first().waitFor({ state: 'visible', timeout: 20000 })
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
    throw new Error('Could not keep Reader in Original mode for the Stage 614 audit.')
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
    throw new Error('Expected visible text content for the measured Stage 614 node.')
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
    throw new Error('Expected visible collection-chip text content for the Stage 614 measurement.')
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
