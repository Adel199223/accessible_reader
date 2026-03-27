import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE659_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE659_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE659_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE659_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE659_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE659_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
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
    'stage659-home-rendered-html-snapshot-preview-promotion-reset-after-stage658-failure.png',
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
  const homeEvidence = await captureHomeImplementation(page, outputDir, 'stage659')

  await writeFile(
    path.join(
      outputDir,
      'stage659-home-rendered-html-snapshot-preview-promotion-reset-after-stage658-validation.json',
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
          'The Stage 659 pass promotes the remaining HTML-backed fallback cards into real cached image previews by rendering stored HTML snapshots locally.',
          'Paste/text cards keep the Stage 655 content-derived poster fallback path, while shell, rail, toolbar, and board cadence stay unchanged.',
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
          'stage659-home-rendered-html-snapshot-preview-promotion-reset-after-stage658-failure.png',
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

  const canvas = page.locator('.recall-home-parity-canvas-stage619').first()
  const dayGroup = canvas.locator('.recall-home-parity-day-group-stage617').first()
  const fallbackCard = dayGroup.locator('.recall-home-parity-card-stage651').first()

  await Promise.all([
    canvas.waitFor({ state: 'visible', timeout: 20000 }),
    dayGroup.waitFor({ state: 'visible', timeout: 20000 }),
    fallbackCard.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  await page.waitForTimeout(450)

  const fallbackPreviewCardCount = await canvas
    .locator('.recall-home-parity-card-preview-stage657[data-preview-media-kind="fallback"]')
    .count()
  const fallbackState = await readFallbackPreviewCardState(page, fallbackCard, 'Stage 659 fallback card')
  const [fallbackCardBox, canvasMetrics] = await Promise.all([
    readMeasuredBox(fallbackCard, 'representative Stage 659 fallback card'),
    page.evaluate(() => {
      const canvas = document.querySelector('.recall-home-parity-canvas-stage619')
      const dayHeader = canvas?.querySelector('.recall-home-parity-day-group-header-stage617')
      const grid = canvas?.querySelector('.recall-home-parity-grid-stage615')
      if (!(canvas instanceof HTMLElement) || !(dayHeader instanceof HTMLElement) || !(grid instanceof HTMLElement)) {
        throw new Error('Expected Stage 659 Home canvas, day header, and grid.')
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
  const webSelection = await openCollectionCard(page, canvas, rail, 'Web', /^Open Stage 10 Debug Article$/i)
  const webState = await readImagePreviewCardState(
    page,
    webSelection.card,
    'Stage 659 rendered Web snapshot card',
  )
  const homeWebRenderedCard = await captureLocatorScreenshot(page, webSelection.card, directory, `${stagePrefix}-home-web-rendered-card.png`)
  const documentSelection = await openCollectionCard(page, canvas, rail, 'Documents', /^Open 1\. Short answer$/i)
  const documentState = await readImagePreviewCardState(
    page,
    documentSelection.card,
    'Stage 659 rendered Documents snapshot card',
  )

  const toolbarActionCount =
    (await canvas.locator('.recall-home-parity-toolbar-row-primary-stage601').first().evaluate((node) => node.children.length)) +
    (await canvas.locator('.recall-home-parity-toolbar-row-secondary-stage601').first().evaluate((node) => node.children.length))
  const visibleDayGroupCountNodeCount = await canvas.locator('.recall-home-parity-day-group-header-stage563 span').count()

  if (fallbackPreviewCardCount < 1) {
    throw new Error(`Expected at least one fallback preview card in the default Captures canvas, found ${fallbackPreviewCardCount}.`)
  }
  if (!(fallbackCardBox.width >= stage615CardWidthFloor && fallbackCardBox.width <= stage615CardWidthCeiling)) {
    throw new Error(`Expected representative card width to stay in the Stage 615 cadence band, found ${fallbackCardBox.width}.`)
  }
  if (!(fallbackCardBox.height <= cardHeightPxCeiling)) {
    throw new Error(`Expected representative card height to stay compact after the Stage 659 pass, found ${fallbackCardBox.height}.`)
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
  if (
    fallbackState.mediaKind !== 'fallback' ||
    !['content', 'fallback'].includes(fallbackState.heroSource) ||
    fallbackState.heroText.length < 12
  ) {
    throw new Error(`Expected the fallback paste card to preserve the Stage 655 poster path, found ${JSON.stringify(fallbackState)}.`)
  }
  if (
    webState.mediaKind !== 'image' ||
    webState.mediaSource !== 'html-rendered-snapshot' ||
    !webState.assetUrl ||
    webState.heroNodeCount !== 0
  ) {
    throw new Error(
      `Expected the Stage 10 Web card to promote to a rendered HTML snapshot preview, found ${JSON.stringify(webState)}.`,
    )
  }
  if (
    documentState.mediaKind !== 'image' ||
    documentState.mediaSource !== 'html-rendered-snapshot' ||
    !documentState.assetUrl ||
    documentState.heroNodeCount !== 0
  ) {
    throw new Error(
      `Expected the Documents HTML card to promote to a rendered HTML snapshot preview, found ${JSON.stringify(documentState)}.`,
    )
  }

  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)
  const homeFallbackCard = await captureLocatorScreenshot(page, fallbackCard, directory, `${stagePrefix}-home-fallback-card.png`)
  const homeDocumentRenderedCard = await captureLocatorScreenshot(
    page,
    documentSelection.card,
    directory,
    `${stagePrefix}-home-document-rendered-card.png`,
  )

  return {
    captures: {
      homeDocumentRenderedCard,
      homeFallbackCard,
      homeWebRenderedCard,
      homeWideTop,
    },
    metrics: {
      cardHeight: fallbackCardBox.height,
      cardWidth: fallbackCardBox.width,
      documentRenderedPreviewSourceKind: documentState.mediaSource,
      documentRenderedNaturalHeight: documentState.naturalHeight,
      documentRenderedNaturalWidth: documentState.naturalWidth,
      fallbackHeroSource: fallbackState.heroSource,
      fallbackHeroText: fallbackState.heroText,
      fallbackPreviewCardCount,
      gridTopOffsetPx: canvasMetrics.gridTopOffsetPx,
      headingTopOffsetPx: canvasMetrics.headingTopOffsetPx,
      toolbarActionCount,
      visibleDayGroupCountNodeCount,
      webRenderedPreviewSourceKind: webState.mediaSource,
      webRenderedNaturalHeight: webState.naturalHeight,
      webRenderedNaturalWidth: webState.naturalWidth,
    },
  }
}

async function openCollectionCard(page, canvas, rail, sectionLabel, cardNamePattern) {
  const button = rail.getByRole('button', { name: new RegExp(`^${sectionLabel}`, 'i') }).first()
  await button.click()
  await page.waitForTimeout(250)

  const card = canvas.getByRole('button', { name: cardNamePattern }).first()
  await card.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
  return { card, sectionLabel }
}

async function readFallbackPreviewCardState(page, card, label) {
  const preview = card.locator('.recall-home-parity-card-preview-stage657').first()
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
    mediaKind: (await preview.getAttribute('data-preview-media-kind')) ?? '',
    previewKind: (await preview.getAttribute('data-preview-kind')) ?? '',
    sourceText: normalizeText(await source.textContent()),
    titleText: normalizeText(await title.textContent()),
  }
}

async function readImagePreviewCardState(page, card, label) {
  const preview = card.locator('.recall-home-parity-card-preview-stage657').first()
  const image = card.locator('.recall-home-parity-card-preview-image-stage657').first()
  const detail = card.locator('.recall-home-parity-card-preview-detail-stage565').first()
  const title = card.locator('.recall-home-parity-card-title-stage651').first()
  const source = card.locator('.recall-home-parity-card-source-stage651').first()

  await Promise.all([
    preview.waitFor({ state: 'visible', timeout: 20000 }),
    image.waitFor({ state: 'visible', timeout: 20000 }),
    detail.waitFor({ state: 'visible', timeout: 20000 }),
    title.waitFor({ state: 'visible', timeout: 20000 }),
    source.waitFor({ state: 'visible', timeout: 20000 }),
  ])

  let naturalWidth = 0
  let naturalHeight = 0
  for (let attempt = 0; attempt < 40; attempt += 1) {
    ;({ naturalHeight, naturalWidth } = await image.evaluate((node) => ({
      naturalHeight: node.naturalHeight,
      naturalWidth: node.naturalWidth,
    })))
    if (naturalWidth > 0 && naturalHeight > 0) {
      break
    }
    await page.waitForTimeout(100)
  }

  return {
    assetUrl: (await image.getAttribute('src')) ?? '',
    detailText: normalizeText(await detail.textContent()),
    heroNodeCount: await preview.locator('.recall-home-parity-card-preview-hero-stage655').count(),
    label,
    mediaKind: (await preview.getAttribute('data-preview-media-kind')) ?? '',
    mediaSource: (await preview.getAttribute('data-preview-media-source')) ?? '',
    naturalHeight,
    naturalWidth,
    previewKind: (await preview.getAttribute('data-preview-kind')) ?? '',
    sourceText: normalizeText(await source.textContent()),
    titleText: normalizeText(await title.textContent()),
  }
}

async function openHome(page) {
  const response = await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Home navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.locator('.recall-home-workspace').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('.recall-home-parity-canvas-stage619').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(450)
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
