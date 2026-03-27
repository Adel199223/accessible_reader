import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE657_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE657_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE657_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE657_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE657_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE657_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
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
    'stage657-home-real-media-preview-acquisition-from-saved-source-attachments-reset-after-stage656-failure.png',
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
  const homeEvidence = await captureHomeImplementation(page, outputDir, 'stage657')

  await writeFile(
    path.join(
      outputDir,
      'stage657-home-real-media-preview-acquisition-from-saved-source-attachments-reset-after-stage656-validation.json',
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
          'The Stage 657 pass upgrades Home cards to real cached media previews when a saved source exposes a usable image candidate.',
          'Paste and image-less sources retain the Stage 655 content-derived poster fallback path without reopening shell, rail, or toolbar work.',
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
          'stage657-home-real-media-preview-acquisition-from-saved-source-attachments-reset-after-stage656-failure.png',
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
  const fallbackState = await readFallbackPreviewCardState(page, fallbackCard, 'Stage 657 fallback card')
  const [fallbackCardBox, canvasMetrics] = await Promise.all([
    readMeasuredBox(fallbackCard, 'representative Stage 657 fallback card'),
    page.evaluate(() => {
      const canvas = document.querySelector('.recall-home-parity-canvas-stage619')
      const dayHeader = canvas?.querySelector('.recall-home-parity-day-group-header-stage617')
      const grid = canvas?.querySelector('.recall-home-parity-grid-stage615')
      if (!(canvas instanceof HTMLElement) || !(dayHeader instanceof HTMLElement) || !(grid instanceof HTMLElement)) {
        throw new Error('Expected Stage 657 Home canvas, day header, and grid.')
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
  const imagePreviewSelection = await openCollectionWithImagePreview(page, canvas, rail)
  const imagePreviewCardCount = await canvas
    .locator('.recall-home-parity-card-preview-stage657[data-preview-media-kind="image"]')
    .count()
  const imageState = await readImagePreviewCardState(
    page,
    imagePreviewSelection.card,
    `Stage 657 ${imagePreviewSelection.sectionLabel} image card`,
  )

  const toolbarActionCount =
    (await canvas.locator('.recall-home-parity-toolbar-row-primary-stage601').first().evaluate((node) => node.children.length)) +
    (await canvas.locator('.recall-home-parity-toolbar-row-secondary-stage601').first().evaluate((node) => node.children.length))
  const visibleDayGroupCountNodeCount = await canvas.locator('.recall-home-parity-day-group-header-stage563 span').count()

  if (fallbackPreviewCardCount < 1) {
    throw new Error(`Expected at least one fallback preview card in the default Captures canvas, found ${fallbackPreviewCardCount}.`)
  }
  if (imagePreviewCardCount < 1) {
    throw new Error(`Expected at least one real image preview card after switching collections, found ${imagePreviewCardCount}.`)
  }
  if (!(fallbackCardBox.width >= stage615CardWidthFloor && fallbackCardBox.width <= stage615CardWidthCeiling)) {
    throw new Error(`Expected representative card width to stay in the Stage 615 cadence band, found ${fallbackCardBox.width}.`)
  }
  if (!(fallbackCardBox.height <= cardHeightPxCeiling)) {
    throw new Error(`Expected representative card height to stay compact after the Stage 657 pass, found ${fallbackCardBox.height}.`)
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
  if (imageState.mediaKind !== 'image' || !imageState.assetUrl || imageState.heroNodeCount !== 0) {
    throw new Error(`Expected the representative image card to render a real thumbnail without the synthetic hero seam, found ${JSON.stringify(imageState)}.`)
  }

  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)
  const homeFallbackCard = await captureLocatorScreenshot(page, fallbackCard, directory, `${stagePrefix}-home-fallback-card.png`)
  const homeImageCard = await captureLocatorScreenshot(page, imagePreviewSelection.card, directory, `${stagePrefix}-home-image-card.png`)

  return {
    captures: {
      homeFallbackCard,
      homeImageCard,
      homeWideTop,
    },
    metrics: {
      cardHeight: fallbackCardBox.height,
      cardWidth: fallbackCardBox.width,
      fallbackHeroSource: fallbackState.heroSource,
      fallbackHeroText: fallbackState.heroText,
      fallbackPreviewCardCount,
      gridTopOffsetPx: canvasMetrics.gridTopOffsetPx,
      headingTopOffsetPx: canvasMetrics.headingTopOffsetPx,
      imageAssetUrl: imageState.assetUrl,
      imageNaturalHeight: imageState.naturalHeight,
      imageNaturalWidth: imageState.naturalWidth,
      imagePreviewCardCount,
      imagePreviewCollection: imagePreviewSelection.sectionLabel,
      imagePreviewSourceKind: imageState.previewKind,
      toolbarActionCount,
      visibleDayGroupCountNodeCount,
    },
  }
}

async function openCollectionWithImagePreview(page, canvas, rail) {
  for (const sectionLabel of ['Web', 'Documents']) {
    const button = rail.getByRole('button', { name: new RegExp(`^${sectionLabel}`, 'i') }).first()
    await button.click()
    await page.waitForTimeout(250)

    const imageCard = canvas.locator(
      '.recall-home-parity-card-stage651:has(.recall-home-parity-card-preview-stage657[data-preview-media-kind="image"])',
    ).first()
    for (let attempt = 0; attempt < 40; attempt += 1) {
      if ((await imageCard.count()) > 0) {
        await imageCard.waitFor({ state: 'visible', timeout: 20000 })
        await page.waitForTimeout(250)
        return { card: imageCard, sectionLabel }
      }
      await page.waitForTimeout(150)
    }
  }

  throw new Error('Could not find a real image preview card in the Web or Documents Home collections.')
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
