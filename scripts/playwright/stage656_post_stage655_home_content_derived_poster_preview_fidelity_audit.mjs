import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE656_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE656_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE656_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE656_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE656_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE656_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage615CardWidthFloor = 344
const stage615CardWidthCeiling = 356
const stage617HeadingTopOffsetPxCeiling = 92.5
const stage617GridTopOffsetPxCeiling = 118.5
const cardHeightPxCeiling = 206.5

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage656-post-stage655-home-content-derived-poster-preview-fidelity-audit-failure.png',
  ),
  { force: true },
)
await rm(
  path.join(
    outputDir,
    'stage656-post-stage655-home-content-derived-poster-preview-fidelity-audit-failure-reader.png',
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
  const homeEvidence = await captureHomeAudit(page, outputDir, 'stage656')

  await openGraph(page)
  const graphWideTop = await captureViewportScreenshot(page, outputDir, 'stage656-graph-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage656')

  await writeFile(
    path.join(
      outputDir,
      'stage656-post-stage655-home-content-derived-poster-preview-fidelity-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 655 content-derived poster-preview fidelity pass',
          'paste, web, and file cards should now expose content-derived poster hero text from stored document views while the Stage 563 structure and the settled lower card seam stay intact',
          'Graph and original-only Reader remain regression surfaces only after the Home-only Stage 655 pass',
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
          'stage656-post-stage655-home-content-derived-poster-preview-fidelity-audit-failure.png',
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
          'stage656-post-stage655-home-content-derived-poster-preview-fidelity-audit-failure-reader.png',
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
  const pasteCard = dayGroup.locator('.recall-home-parity-card-stage651').first()

  await Promise.all([
    canvas.waitFor({ state: 'visible', timeout: 20000 }),
    dayGroup.waitFor({ state: 'visible', timeout: 20000 }),
    pasteCard.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  await page.waitForTimeout(350)

  const pasteState = await readPreviewCardState(page, pasteCard, 'Stage 656 paste card')
  const [pasteCardBox, canvasMetrics] = await Promise.all([
    readMeasuredBox(pasteCard, 'representative Stage 656 paste card'),
    page.evaluate(() => {
      const canvas = document.querySelector('.recall-home-parity-canvas-stage619')
      const dayHeader = canvas?.querySelector('.recall-home-parity-day-group-header-stage617')
      const grid = canvas?.querySelector('.recall-home-parity-grid-stage615')
      if (!(canvas instanceof HTMLElement) || !(dayHeader instanceof HTMLElement) || !(grid instanceof HTMLElement)) {
        throw new Error('Expected Stage 656 Home canvas, day header, and grid.')
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

  const rail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  const webButton = rail.getByRole('button', { name: /^Web/i }).first()
  await webButton.click()
  await page.waitForTimeout(250)
  const webCard = canvas.locator('.recall-home-parity-card-stage651').first()
  await webCard.waitFor({ state: 'visible', timeout: 20000 })
  const webState = await readPreviewCardState(page, webCard, 'Stage 656 web card')

  const documentsButton = rail.getByRole('button', { name: /^Documents/i }).first()
  await documentsButton.click()
  await page.waitForTimeout(250)
  const fileCard = canvas.locator('.recall-home-parity-card-stage651').first()
  await fileCard.waitFor({ state: 'visible', timeout: 20000 })
  const fileState = await readPreviewCardState(page, fileCard, 'Stage 656 file card')

  const toolbarActionCount =
    (await canvas.locator('.recall-home-parity-toolbar-row-primary-stage601').first().evaluate((node) => node.children.length)) +
    (await canvas.locator('.recall-home-parity-toolbar-row-secondary-stage601').first().evaluate((node) => node.children.length))
  const visibleDayGroupCountNodeCount = await canvas.locator('.recall-home-parity-day-group-header-stage563 span').count()

  if (!(pasteCardBox.width >= stage615CardWidthFloor && pasteCardBox.width <= stage615CardWidthCeiling)) {
    throw new Error(`Expected representative card width to stay in the Stage 615 cadence band, found ${pasteCardBox.width}.`)
  }
  if (!(pasteCardBox.height <= cardHeightPxCeiling)) {
    throw new Error(`Expected representative card height to stay compact after the Stage 655 pass, found ${pasteCardBox.height}.`)
  }
  if (!(canvasMetrics.headingTopOffsetPx <= stage617HeadingTopOffsetPxCeiling)) {
    throw new Error(`Expected heading top offset to preserve the Stage 617 compaction band, found ${canvasMetrics.headingTopOffsetPx}.`)
  }
  if (!(canvasMetrics.gridTopOffsetPx <= stage617GridTopOffsetPxCeiling)) {
    throw new Error(`Expected first-row grid top offset to preserve the Stage 617 compaction band, found ${canvasMetrics.gridTopOffsetPx}.`)
  }
  if (toolbarActionCount !== 4) {
    throw new Error(`Expected 4 visible Home toolbar controls, found ${toolbarActionCount}.`)
  }
  if (visibleDayGroupCountNodeCount !== 0) {
    throw new Error(`Expected no visible day-group count nodes, found ${visibleDayGroupCountNodeCount}.`)
  }

  for (const state of [pasteState, webState, fileState]) {
    if (state.heroSource !== 'content') {
      throw new Error(`Expected ${state.label} to use content-derived hero text, found ${state.heroSource}.`)
    }
    if (state.heroText.length < 12) {
      throw new Error(`Expected ${state.label} hero text to be substantial, found "${state.heroText}".`)
    }
    if (state.heroText === state.titleText || state.heroText === state.sourceText || state.heroText === state.detailText) {
      throw new Error(`Expected ${state.label} hero text to differ from the title/source/detail seams.`)
    }
  }

  const distinctHeroTextCount = new Set([pasteState.heroText, webState.heroText, fileState.heroText]).size
  if (distinctHeroTextCount < 3) {
    throw new Error(`Expected three distinct content-derived hero texts across paste/web/file cards, found ${distinctHeroTextCount}.`)
  }
  if (!/[.]/.test(fileState.detailText)) {
    throw new Error(`Expected file preview detail to expose the file identity, found "${fileState.detailText}".`)
  }

  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)
  const homePasteCard = await captureLocatorScreenshot(page, pasteCard, directory, `${stagePrefix}-home-paste-card.png`)
  const homeWebCard = await captureLocatorScreenshot(page, webCard, directory, `${stagePrefix}-home-web-card.png`)
  const homeFileCard = await captureLocatorScreenshot(page, fileCard, directory, `${stagePrefix}-home-file-card.png`)

  return {
    captures: {
      homeFileCard,
      homePasteCard,
      homeWebCard,
      homeWideTop,
    },
    metrics: {
      cardHeight: pasteCardBox.height,
      cardWidth: pasteCardBox.width,
      fileDetailText: fileState.detailText,
      fileHeroSource: fileState.heroSource,
      fileHeroText: fileState.heroText,
      gridTopOffsetPx: canvasMetrics.gridTopOffsetPx,
      headingTopOffsetPx: canvasMetrics.headingTopOffsetPx,
      pasteHeroSource: pasteState.heroSource,
      pasteHeroText: pasteState.heroText,
      toolbarActionCount,
      visibleDayGroupCountNodeCount,
      webHeroSource: webState.heroSource,
      webHeroText: webState.heroText,
    },
  }
}

async function readPreviewCardState(page, card, label) {
  const preview = card.locator('.recall-home-parity-card-preview-stage655').first()
  const hero = card.locator('.recall-home-parity-card-preview-hero-stage655').first()
  const detail = card.locator('.recall-home-parity-card-preview-detail-stage565').first()
  const title = card.locator('.recall-home-parity-card-title-stage651').first()
  const source = card.locator('.recall-home-parity-card-source-stage651').first()

  await Promise.all([
    preview.waitFor({ state: 'visible', timeout: 20000 }),
    hero.waitFor({ state: 'visible', timeout: 20000 }),
    detail.waitFor({ state: 'visible', timeout: 20000 }),
    title.waitFor({ state: 'visible', timeout: 20000 }),
    source.waitFor({ state: 'visible', timeout: 20000 }),
  ])

  let heroSource = ''
  let heroText = ''
  for (let attempt = 0; attempt < 40; attempt += 1) {
    heroSource = (await preview.getAttribute('data-preview-hero-source')) ?? ''
    heroText = normalizeText(await hero.textContent())
    if (heroSource === 'content' && heroText) {
      break
    }
    await page.waitForTimeout(100)
  }

  return {
    detailText: normalizeText(await detail.textContent()),
    heroSource,
    heroText,
    label,
    sourceText: normalizeText(await source.textContent()),
    titleText: normalizeText(await title.textContent()),
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
    throw new Error('Could not keep Reader in Original mode for the Stage 656 audit.')
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

function normalizeText(value) {
  return value?.replace(/\s+/g, ' ').trim() ?? ''
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
