import path from 'node:path'
import { pathToFileURL } from 'node:url'

export const desktopViewport = { width: 1600, height: 1080 }

const stage615CardWidthFloor = 344
const stage615CardWidthCeiling = 356
const stage617HeadingTopOffsetPxCeiling = 92.5
const stage617GridTopOffsetPxCeiling = 118.5
const cardHeightPxCeiling = 206.5
const renderedPreviewStddevFloor = 14
const renderedPreviewLightCoverageCeiling = 0.78
const renderedPreviewDarkCoverageFloor = 0.01

export async function launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
}) {
  const resolvedHarnessDir = resolveHarnessDir(repoRoot, harnessDir)
  const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
  const { chromium } = await import(playwrightModuleUrl)
  return launchBrowser(chromium, { allowChromiumFallback, headless, preferredChannel })
}

export async function captureHomeRenderedPreviewQualityEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  await openHome(page, baseUrl)

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
  const fallbackState = await readPreviewCardState(page, fallbackCard, `${stageLabel} fallback card`)
  const [fallbackCardBox, canvasMetrics] = await Promise.all([
    readMeasuredBox(fallbackCard, `representative ${stageLabel} fallback card`),
    page.evaluate(() => {
      const canvas = document.querySelector('.recall-home-parity-canvas-stage619')
      const dayHeader = canvas?.querySelector('.recall-home-parity-day-group-header-stage617')
      const grid = canvas?.querySelector('.recall-home-parity-grid-stage615')
      if (!(canvas instanceof HTMLElement) || !(dayHeader instanceof HTMLElement) || !(grid instanceof HTMLElement)) {
        throw new Error('Expected Home canvas, day header, and grid for the rendered preview quality audit.')
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
  const webState = await readPreviewCardState(page, webSelection.card, `${stageLabel} rendered Web snapshot card`)
  const homeWeakWebCard = await captureLocatorScreenshot(page, webSelection.card, directory, `${stagePrefix}-home-weak-web-card.png`)

  const documentSelection = await openCollectionCard(page, canvas, rail, 'Documents', /^Open 1\. Short answer$/i)
  const documentState = await readPreviewCardState(page, documentSelection.card, `${stageLabel} rendered Documents snapshot card`)
  const homeDocumentRenderedCard = await captureLocatorScreenshot(
    page,
    documentSelection.card,
    directory,
    `${stagePrefix}-home-document-rendered-card.png`,
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
    throw new Error(`Expected representative card height to stay compact, found ${fallbackCardBox.height}.`)
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
    throw new Error(`Expected the fallback paste/text card to preserve the Stage 655 poster path, found ${JSON.stringify(fallbackState)}.`)
  }
  if (webState.mediaKind === 'image') {
    if (webState.mediaSource !== 'html-rendered-snapshot' || !webState.assetUrl) {
      throw new Error(`Expected the weak Web card to use a rendered snapshot image when it stays on the real-preview path, found ${JSON.stringify(webState)}.`)
    }
    if (
      webState.signalStddev < renderedPreviewStddevFloor ||
      (webState.lightCoverage > renderedPreviewLightCoverageCeiling &&
        webState.darkCoverage < renderedPreviewDarkCoverageFloor)
    ) {
      throw new Error(`Expected the weak Web rendered preview to clear the Stage 661/662 quality gate, found ${JSON.stringify(webState)}.`)
    }
  } else if (
    webState.mediaKind !== 'fallback' ||
    webState.mediaSource !== 'fallback' ||
    webState.heroText.length < 12
  ) {
    throw new Error(`Expected the weak Web card to either promote to a content-rich rendered image or fall back cleanly, found ${JSON.stringify(webState)}.`)
  }
  if (
    documentState.mediaKind !== 'image' ||
    documentState.mediaSource !== 'html-rendered-snapshot' ||
    !documentState.assetUrl ||
    documentState.signalStddev < renderedPreviewStddevFloor
  ) {
    throw new Error(`Expected the Documents HTML card to keep a content-rich rendered snapshot preview, found ${JSON.stringify(documentState)}.`)
  }

  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)
  const homeFallbackCard = await captureLocatorScreenshot(page, fallbackCard, directory, `${stagePrefix}-home-fallback-card.png`)

  return {
    captures: {
      homeDocumentRenderedCard,
      homeFallbackCard,
      homeWeakWebCard,
      homeWideTop,
    },
    metrics: {
      cardHeight: fallbackCardBox.height,
      cardWidth: fallbackCardBox.width,
      documentRenderedPreviewSourceKind: documentState.mediaSource,
      documentRenderedNaturalHeight: documentState.naturalHeight,
      documentRenderedNaturalWidth: documentState.naturalWidth,
      documentSignalDarkCoverage: documentState.darkCoverage,
      documentSignalLightCoverage: documentState.lightCoverage,
      documentSignalStddev: documentState.signalStddev,
      fallbackHeroSource: fallbackState.heroSource,
      fallbackHeroText: fallbackState.heroText,
      fallbackPreviewCardCount,
      gridTopOffsetPx: canvasMetrics.gridTopOffsetPx,
      headingTopOffsetPx: canvasMetrics.headingTopOffsetPx,
      toolbarActionCount,
      visibleDayGroupCountNodeCount,
      weakWebHeroSource: webState.heroSource,
      weakWebHeroText: webState.heroText,
      weakWebPreviewDarkCoverage: webState.darkCoverage,
      weakWebPreviewLightCoverage: webState.lightCoverage,
      weakWebPreviewMediaKind: webState.mediaKind,
      weakWebPreviewSourceKind: webState.mediaSource,
      weakWebPreviewStddev: webState.signalStddev,
      weakWebRenderedNaturalHeight: webState.naturalHeight,
      weakWebRenderedNaturalWidth: webState.naturalWidth,
    },
  }
}

export async function openGraph(page, baseUrl) {
  const response = await page.goto(`${baseUrl}/recall?section=graph`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Graph navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

export async function openHome(page, baseUrl) {
  const response = await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Home navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.locator('.recall-home-workspace').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('.recall-home-parity-canvas-stage619').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(450)
}

export async function openOriginalReaderFromHome(page, directory, stagePrefix, baseUrl) {
  await openHome(page, baseUrl)
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
    throw new Error('Could not keep Reader in Original mode for the rendered preview quality audit.')
  }

  const capture = await captureViewportScreenshot(page, directory, `${stagePrefix}-reader-original-wide-top.png`)
  return { capture, sourceTitle }
}

export async function captureViewportScreenshot(page, directory, filename) {
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath })
  return screenshotPath
}

export async function captureLocatorScreenshot(page, locator, directory, filename) {
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

async function openCollectionCard(page, canvas, rail, sectionLabel, cardNamePattern) {
  const button = rail.getByRole('button', { name: new RegExp(`^${sectionLabel}`, 'i') }).first()
  await button.click()
  await page.waitForTimeout(250)

  const card = canvas.getByRole('button', { name: cardNamePattern }).first()
  await card.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
  return { card, sectionLabel }
}

async function readPreviewCardState(page, card, label) {
  const preview = card.locator('.recall-home-parity-card-preview-stage657').first()
  const detail = card.locator('.recall-home-parity-card-preview-detail-stage565').first()
  const title = card.locator('.recall-home-parity-card-title-stage651').first()
  const source = card.locator('.recall-home-parity-card-source-stage651').first()

  await Promise.all([
    preview.waitFor({ state: 'visible', timeout: 20000 }),
    detail.waitFor({ state: 'visible', timeout: 20000 }),
    title.waitFor({ state: 'visible', timeout: 20000 }),
    source.waitFor({ state: 'visible', timeout: 20000 }),
  ])

  let mediaKind = ''
  let mediaSource = ''
  let heroSource = ''
  let heroText = ''
  let assetUrl = ''
  let naturalWidth = 0
  let naturalHeight = 0
  let lightCoverage = 0
  let darkCoverage = 0
  let signalStddev = 0

  for (let attempt = 0; attempt < 36; attempt += 1) {
    mediaKind = (await preview.getAttribute('data-preview-media-kind')) ?? ''
    mediaSource = (await preview.getAttribute('data-preview-media-source')) ?? ''
    heroSource = (await preview.getAttribute('data-preview-hero-source')) ?? ''

    if (mediaKind === 'image') {
      const image = card.locator('.recall-home-parity-card-preview-image-stage657').first()
      if ((await image.count()) > 0) {
        await image.waitFor({ state: 'visible', timeout: 20000 })
        ;({ naturalHeight, naturalWidth } = await image.evaluate((node) => ({
          naturalHeight: node.naturalHeight,
          naturalWidth: node.naturalWidth,
        })))
        if (naturalWidth > 0 && naturalHeight > 0) {
          assetUrl = (await image.getAttribute('src')) ?? ''
          ;({ darkCoverage, lightCoverage, signalStddev } = await image.evaluate((node) => {
            const canvas = document.createElement('canvas')
            canvas.width = Math.max(node.naturalWidth, 1)
            canvas.height = Math.max(node.naturalHeight, 1)
            const context = canvas.getContext('2d')
            if (!context) {
              return { darkCoverage: 0, lightCoverage: 0, signalStddev: 0 }
            }
            context.drawImage(node, 0, 0)
            const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
            let darkPixels = 0
            let lightPixels = 0
            let luminanceSum = 0
            let luminanceSquareSum = 0
            const pixelCount = Math.max(data.length / 4, 1)
            for (let index = 0; index < data.length; index += 4) {
              const luminance = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114
              luminanceSum += luminance
              luminanceSquareSum += luminance * luminance
              if (luminance <= 80) {
                darkPixels += 1
              }
              if (luminance >= 220) {
                lightPixels += 1
              }
            }
            const mean = luminanceSum / pixelCount
            const variance = Math.max(luminanceSquareSum / pixelCount - mean * mean, 0)
            return {
              darkCoverage: darkPixels / pixelCount,
              lightCoverage: lightPixels / pixelCount,
              signalStddev: Math.sqrt(variance),
            }
          }))
          break
        }
      }
    } else {
      const hero = card.locator('.recall-home-parity-card-preview-hero-stage655').first()
      if ((await hero.count()) > 0) {
        heroText = normalizeText(await hero.textContent())
      }
    }

    if (attempt < 35) {
      await page.waitForTimeout(140)
    }
  }

  return {
    assetUrl,
    darkCoverage,
    detailText: normalizeText(await detail.textContent()),
    heroSource,
    heroText,
    label,
    lightCoverage,
    mediaKind,
    mediaSource,
    naturalHeight,
    naturalWidth,
    previewKind: (await preview.getAttribute('data-preview-kind')) ?? '',
    signalStddev,
    sourceText: normalizeText(await source.textContent()),
    titleText: normalizeText(await title.textContent()),
  }
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

async function launchBrowser(chromium, { allowChromiumFallback, headless, preferredChannel }) {
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

function resolveHarnessDir(repoRoot, configuredHarnessDir) {
  const trimmed = configuredHarnessDir.trim()
  if (/^[A-Za-z]:\\/.test(trimmed)) {
    return trimmed
  }
  return path.resolve(repoRoot, trimmed)
}
