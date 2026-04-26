import { existsSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export const desktopViewport = { width: 1600, height: 1080 }

const stage615CardWidthFloor = 344
const stage615CardWidthCeiling = 356
const stage617HeadingTopOffsetPxCeiling = 92.5
const stage617GridTopOffsetPxCeiling = 118.5
const cardHeightPxCeiling = 206.5
const previewImageHeightFloor = 180
const previewImageWidthFloor = 320
const renderedPreviewStddevFloor = 14
const renderedPreviewLightCoverageCeiling = 0.78
const renderedPreviewDarkCoverageFloor = 0.01
const contentRenderedNoteBrightPanelAreaCeiling = 0.43
const contentRenderedNoteBrightPanelWidthCeiling = 0.72
const contentRenderedNoteBrightPanelHeightCeiling = 0.6
const contentRenderedSummaryNoteBrightPanelAreaFloor = 0.42
const contentRenderedSummaryNoteBrightPanelAreaCeiling = 0.56
const contentRenderedSheetBrightPanelAreaFloor = 0.48
const contentRenderedArticleSheetBrightPanelAreaFloor = 0.5
const contentRenderedArticleSheetBrightPanelAreaCeiling = 0.59
const contentRenderedVariantSeparationFloor = 0.05
const contentRenderedSummaryNoteSeparationFloor = 0.05
const contentRenderedSheetOverSummarySeparationFloor = 0.08
const contentRenderedArticleOverSummarySeparationFloor = 0.03
const contentRenderedOutlineOverArticleSeparationFloor = 0.01
const contentRenderedDocumentOverChecklistLightCoverageFloor = 0.012
const contentRenderedChecklistRebalancedLightCoverageFloor = 0.205
const contentRenderedDocumentOverChecklistRebalancedLightCoverageFloor = 0.18
const contentRenderedChecklistSeparatedPanelAreaCeiling = 0.585
const contentRenderedDocumentOverChecklistSeparatedAreaFloor = 0.02
const contentRenderedDocumentOverChecklistSeparatedWidthFloor = 0.03
const contentRenderedChecklistBalancedWidthFloor = 0.745
const contentRenderedChecklistBalancedHeightCeiling = 0.758
const contentRenderedDocumentOverChecklistBalancedWidthFloor = 0.04
const contentRenderedDocumentOverChecklistBalancedWidthCeiling = 0.075
const contentRenderedChecklistOverArticleBalancedAreaFloor = 0.005

export async function launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
}) {
  const playwrightModuleUrl = pathToFileURL(resolvePlaywrightEntry(repoRoot, harnessDir)).href
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

export async function captureHomeContentRenderedPreviewPromotionEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  await openHome(page, baseUrl)

  const canvas = page.locator('.recall-home-parity-canvas-stage619').first()
  const dayGroup = canvas.locator('.recall-home-parity-day-group-stage617').first()
  const promotedCaptureCard = canvas.locator('.recall-home-parity-card-stage651').first()

  await Promise.all([
    canvas.waitFor({ state: 'visible', timeout: 20000 }),
    dayGroup.waitFor({ state: 'visible', timeout: 20000 }),
    promotedCaptureCard.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  await page.waitForTimeout(450)

  const contentRenderedPreviewCardCount = await canvas
    .locator('.recall-home-parity-card-preview-stage657[data-preview-media-source="content-rendered-preview"]')
    .count()
  const promotedCaptureState = await readPreviewCardState(page, promotedCaptureCard, `${stageLabel} promoted capture card`)
  const [promotedCaptureCardBox, canvasMetrics] = await Promise.all([
    readMeasuredBox(promotedCaptureCard, `representative ${stageLabel} promoted capture card`),
    page.evaluate(() => {
      const canvas = document.querySelector('.recall-home-parity-canvas-stage619')
      const dayHeader = canvas?.querySelector('.recall-home-parity-day-group-header-stage617')
      const grid = canvas?.querySelector('.recall-home-parity-grid-stage615')
      if (!(canvas instanceof HTMLElement) || !(dayHeader instanceof HTMLElement) || !(grid instanceof HTMLElement)) {
        throw new Error('Expected Home canvas, day header, and grid for the content-rendered preview promotion audit.')
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

  const toolbarActionCount =
    (await canvas.locator('.recall-home-parity-toolbar-row-primary-stage601').first().evaluate((node) => node.children.length)) +
    (await canvas.locator('.recall-home-parity-toolbar-row-secondary-stage601').first().evaluate((node) => node.children.length))
  const visibleDayGroupCountNodeCount = await canvas.locator('.recall-home-parity-day-group-header-stage563 span').count()

  if (contentRenderedPreviewCardCount < 1) {
    throw new Error(
      `Expected at least one content-rendered preview card in the default Captures canvas, found ${contentRenderedPreviewCardCount}.`,
    )
  }
  if (!(promotedCaptureCardBox.width >= stage615CardWidthFloor && promotedCaptureCardBox.width <= stage615CardWidthCeiling)) {
    throw new Error(`Expected representative card width to stay in the Stage 615 cadence band, found ${promotedCaptureCardBox.width}.`)
  }
  if (!(promotedCaptureCardBox.height <= cardHeightPxCeiling)) {
    throw new Error(`Expected representative card height to stay compact, found ${promotedCaptureCardBox.height}.`)
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
    promotedCaptureState.previewKind !== 'paste' ||
    promotedCaptureState.mediaKind !== 'image' ||
    promotedCaptureState.mediaSource !== 'content-rendered-preview' ||
    !promotedCaptureState.assetUrl ||
    promotedCaptureState.naturalWidth < previewImageWidthFloor ||
    promotedCaptureState.naturalHeight < previewImageHeightFloor
  ) {
    throw new Error(
      `Expected the representative paste/capture card to promote to image/content-rendered-preview, found ${JSON.stringify(promotedCaptureState)}.`,
    )
  }

  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)
  const homePromotedCaptureCard = await captureLocatorScreenshot(
    page,
    promotedCaptureCard,
    directory,
    `${stagePrefix}-home-promoted-capture-card.png`,
  )

  const rail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  const webSelection = await openCollectionCard(page, canvas, rail, 'Web', /^Open Stage 10 Debug Article$/i)
  const webState = await readPreviewCardState(page, webSelection.card, `${stageLabel} promoted Web card`)
  const homeWeakWebCard = await captureLocatorScreenshot(page, webSelection.card, directory, `${stagePrefix}-home-weak-web-card.png`)

  await rail.getByRole('button', { name: /^Documents/i }).first().click()
  await page.waitForTimeout(250)
  const txtDocumentCard = canvas
    .locator('.recall-home-parity-card-stage651')
    .filter({ has: page.locator('.recall-home-parity-card-preview-file-stage565') })
    .filter({ has: page.locator('.recall-home-parity-card-preview-badge-stage563', { hasText: 'TXT' }) })
    .first()
  await txtDocumentCard.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
  const txtDocumentState = await readPreviewCardState(page, txtDocumentCard, `${stageLabel} promoted TXT card`)
  const homeTxtDocumentCard = await captureLocatorScreenshot(
    page,
    txtDocumentCard,
    directory,
    `${stagePrefix}-home-txt-document-card.png`,
  )

  if (webState.mediaKind !== 'image' || !webState.assetUrl) {
    throw new Error(`Expected the weak Web card to promote to an image-backed preview, found ${JSON.stringify(webState)}.`)
  }
  if (!['content-rendered-preview', 'html-rendered-snapshot'].includes(webState.mediaSource)) {
    throw new Error(
      `Expected the weak Web card to resolve to content-rendered-preview or html-rendered-snapshot, found ${JSON.stringify(webState)}.`,
    )
  }
  if (
    webState.mediaSource === 'html-rendered-snapshot' &&
    (webState.signalStddev < renderedPreviewStddevFloor ||
      (webState.lightCoverage > renderedPreviewLightCoverageCeiling &&
        webState.darkCoverage < renderedPreviewDarkCoverageFloor))
  ) {
    throw new Error(
      `Expected a weak Web rendered snapshot to clear the Stage 661 quality gate when it remains on the rendered-snapshot path, found ${JSON.stringify(webState)}.`,
    )
  }
  if (
    txtDocumentState.mediaKind !== 'image' ||
    txtDocumentState.mediaSource !== 'content-rendered-preview' ||
    !txtDocumentState.assetUrl ||
    txtDocumentState.naturalWidth < previewImageWidthFloor ||
    txtDocumentState.naturalHeight < previewImageHeightFloor
  ) {
    throw new Error(
      `Expected the representative TXT document card to promote to image/content-rendered-preview, found ${JSON.stringify(txtDocumentState)}.`,
    )
  }

  return {
    captures: {
      homePromotedCaptureCard,
      homeTxtDocumentCard,
      homeWeakWebCard,
      homeWideTop,
    },
    metrics: {
      capturePreviewMediaKind: promotedCaptureState.mediaKind,
      capturePreviewSourceKind: promotedCaptureState.mediaSource,
      cardHeight: promotedCaptureCardBox.height,
      cardWidth: promotedCaptureCardBox.width,
      contentRenderedPreviewCardCount,
      gridTopOffsetPx: canvasMetrics.gridTopOffsetPx,
      headingTopOffsetPx: canvasMetrics.headingTopOffsetPx,
      promotedCaptureNaturalHeight: promotedCaptureState.naturalHeight,
      promotedCaptureNaturalWidth: promotedCaptureState.naturalWidth,
      promotedCaptureTitleText: promotedCaptureState.titleText,
      toolbarActionCount,
      txtDocumentNaturalHeight: txtDocumentState.naturalHeight,
      txtDocumentNaturalWidth: txtDocumentState.naturalWidth,
      txtDocumentPreviewSourceKind: txtDocumentState.mediaSource,
      txtDocumentTitleText: txtDocumentState.titleText,
      visibleDayGroupCountNodeCount,
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

export async function captureHomeSparseContentRenderedPreviewPromotionEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  await openHome(page, baseUrl)

  const canvas = page.locator('.recall-home-parity-canvas-stage619').first()
  const dayGroup = canvas.locator('.recall-home-parity-day-group-stage617').first()
  const sparseCaptureCard = canvas
    .locator('.recall-home-parity-card-stage651')
    .filter({ has: page.locator('.recall-home-parity-card-title-stage613', { hasText: 'Stage11 Smoke Runtime' }) })
    .first()
  const promotedCaptureCard = canvas
    .locator('.recall-home-parity-card-stage651')
    .filter({ has: page.locator('.recall-home-parity-card-title-stage613', { hasText: 'Stage13 Debug 1773482318378' }) })
    .first()

  await Promise.all([
    canvas.waitFor({ state: 'visible', timeout: 20000 }),
    dayGroup.waitFor({ state: 'visible', timeout: 20000 }),
    sparseCaptureCard.waitFor({ state: 'visible', timeout: 20000 }),
    promotedCaptureCard.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  await page.waitForTimeout(450)

  const contentRenderedPreviewCardCount = await canvas
    .locator('.recall-home-parity-card-preview-stage657[data-preview-media-source="content-rendered-preview"]')
    .count()
  const fallbackPreviewCardCount = await canvas
    .locator('.recall-home-parity-card-preview-stage657[data-preview-media-kind="fallback"]')
    .count()
  const sparseCaptureState = await readPreviewCardState(page, sparseCaptureCard, `${stageLabel} sparse capture card`)
  const promotedCaptureState = await readPreviewCardState(page, promotedCaptureCard, `${stageLabel} promoted capture card`)
  const [sparseCaptureCardBox, canvasMetrics] = await Promise.all([
    readMeasuredBox(sparseCaptureCard, `representative ${stageLabel} sparse capture card`),
    page.evaluate(() => {
      const canvas = document.querySelector('.recall-home-parity-canvas-stage619')
      const dayHeader = canvas?.querySelector('.recall-home-parity-day-group-header-stage617')
      const grid = canvas?.querySelector('.recall-home-parity-grid-stage615')
      if (!(canvas instanceof HTMLElement) || !(dayHeader instanceof HTMLElement) || !(grid instanceof HTMLElement)) {
        throw new Error('Expected Home canvas, day header, and grid for the sparse content-rendered preview promotion audit.')
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

  const toolbarActionCount =
    (await canvas.locator('.recall-home-parity-toolbar-row-primary-stage601').first().evaluate((node) => node.children.length)) +
    (await canvas.locator('.recall-home-parity-toolbar-row-secondary-stage601').first().evaluate((node) => node.children.length))
  const visibleDayGroupCountNodeCount = await canvas.locator('.recall-home-parity-day-group-header-stage563 span').count()

  if (contentRenderedPreviewCardCount < 1) {
    throw new Error(
      `Expected at least one content-rendered preview card in the default Captures canvas, found ${contentRenderedPreviewCardCount}.`,
    )
  }
  if (fallbackPreviewCardCount !== 0) {
    throw new Error(`Expected no fallback preview cards in the default Captures canvas, found ${fallbackPreviewCardCount}.`)
  }
  if (!(sparseCaptureCardBox.width >= stage615CardWidthFloor && sparseCaptureCardBox.width <= stage615CardWidthCeiling)) {
    throw new Error(`Expected representative card width to stay in the Stage 615 cadence band, found ${sparseCaptureCardBox.width}.`)
  }
  if (!(sparseCaptureCardBox.height <= cardHeightPxCeiling)) {
    throw new Error(`Expected representative card height to stay compact, found ${sparseCaptureCardBox.height}.`)
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
    sparseCaptureState.previewKind !== 'paste' ||
    sparseCaptureState.mediaKind !== 'image' ||
    sparseCaptureState.mediaSource !== 'content-rendered-preview' ||
    !sparseCaptureState.assetUrl ||
    sparseCaptureState.naturalWidth < previewImageWidthFloor ||
    sparseCaptureState.naturalHeight < previewImageHeightFloor
  ) {
    throw new Error(
      `Expected the representative sparse paste card to promote to image/content-rendered-preview, found ${JSON.stringify(sparseCaptureState)}.`,
    )
  }
  if (
    promotedCaptureState.previewKind !== 'paste' ||
    promotedCaptureState.mediaKind !== 'image' ||
    promotedCaptureState.mediaSource !== 'content-rendered-preview' ||
    !promotedCaptureState.assetUrl ||
    promotedCaptureState.naturalWidth < previewImageWidthFloor ||
    promotedCaptureState.naturalHeight < previewImageHeightFloor
  ) {
    throw new Error(
      `Expected the representative Stage 664 promoted paste card to stay on image/content-rendered-preview, found ${JSON.stringify(promotedCaptureState)}.`,
    )
  }

  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)
  await openHome(page, baseUrl)
  const sparseCaptureCardForScreenshot = canvas
    .locator('.recall-home-parity-card-stage651')
    .filter({ has: page.locator('.recall-home-parity-card-title-stage651', { hasText: 'Stage11 Smoke Runtime' }) })
    .first()
  const promotedCaptureCardForScreenshot = canvas
    .locator('.recall-home-parity-card-stage651')
    .filter({ has: page.locator('.recall-home-parity-card-title-stage651', { hasText: 'Stage13 Debug 1773482318378' }) })
    .first()
  await Promise.all([
    sparseCaptureCardForScreenshot.waitFor({ state: 'visible', timeout: 20000 }),
    promotedCaptureCardForScreenshot.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  const homeSparseCaptureCard = await captureLocatorScreenshot(
    page,
    sparseCaptureCardForScreenshot,
    directory,
    `${stagePrefix}-home-sparse-capture-card.png`,
  )
  const homePromotedCaptureCard = await captureLocatorScreenshot(
    page,
    promotedCaptureCardForScreenshot,
    directory,
    `${stagePrefix}-home-promoted-capture-card.png`,
  )

  const rail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  const webSelection = await openCollectionCard(page, canvas, rail, 'Web', /^Open Stage 10 Debug Article$/i)
  const webState = await readPreviewCardState(page, webSelection.card, `${stageLabel} promoted Web card`)
  const homeWeakWebCard = await captureLocatorScreenshot(page, webSelection.card, directory, `${stagePrefix}-home-weak-web-card.png`)

  await rail.getByRole('button', { name: /^Documents/i }).first().click()
  await page.waitForTimeout(250)
  const txtDocumentCard = canvas
    .locator('.recall-home-parity-card-stage651')
    .filter({ has: page.locator('.recall-home-parity-card-preview-file-stage565') })
    .filter({ has: page.locator('.recall-home-parity-card-preview-badge-stage563', { hasText: 'TXT' }) })
    .first()
  await txtDocumentCard.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
  const txtDocumentState = await readPreviewCardState(page, txtDocumentCard, `${stageLabel} promoted TXT card`)
  const homeTxtDocumentCard = await captureLocatorScreenshot(
    page,
    txtDocumentCard,
    directory,
    `${stagePrefix}-home-txt-document-card.png`,
  )

  if (
    webState.mediaKind !== 'image' ||
    !webState.assetUrl
  ) {
    throw new Error(`Expected the weak Web card to stay on image/content-rendered-preview, found ${JSON.stringify(webState)}.`)
  }
  if (!['content-rendered-preview', 'html-rendered-snapshot'].includes(webState.mediaSource)) {
    throw new Error(
      `Expected the weak Web card to stay on content-rendered-preview or html-rendered-snapshot, found ${JSON.stringify(webState)}.`,
    )
  }
  if (
    webState.mediaSource === 'html-rendered-snapshot' &&
    (webState.signalStddev < renderedPreviewStddevFloor ||
      (webState.lightCoverage > renderedPreviewLightCoverageCeiling &&
        webState.darkCoverage < renderedPreviewDarkCoverageFloor))
  ) {
    throw new Error(
      `Expected a weak Web rendered snapshot to clear the Stage 661 quality gate when it remains on the rendered-snapshot path, found ${JSON.stringify(webState)}.`,
    )
  }
  if (
    txtDocumentState.mediaKind !== 'image' ||
    txtDocumentState.mediaSource !== 'content-rendered-preview' ||
    !txtDocumentState.assetUrl ||
    txtDocumentState.naturalWidth < previewImageWidthFloor ||
    txtDocumentState.naturalHeight < previewImageHeightFloor
  ) {
    throw new Error(
      `Expected the representative TXT document card to stay on image/content-rendered-preview, found ${JSON.stringify(txtDocumentState)}.`,
    )
  }

  return {
    captures: {
      homePromotedCaptureCard,
      homeSparseCaptureCard,
      homeTxtDocumentCard,
      homeWeakWebCard,
      homeWideTop,
    },
    metrics: {
      cardHeight: sparseCaptureCardBox.height,
      cardWidth: sparseCaptureCardBox.width,
      contentRenderedPreviewCardCount,
      fallbackPreviewCardCount,
      gridTopOffsetPx: canvasMetrics.gridTopOffsetPx,
      headingTopOffsetPx: canvasMetrics.headingTopOffsetPx,
      sparseCapturePreviewKind: sparseCaptureState.mediaKind,
      sparseCapturePreviewSourceKind: sparseCaptureState.mediaSource,
      sparseCaptureRenderedNaturalHeight: sparseCaptureState.naturalHeight,
      sparseCaptureRenderedNaturalWidth: sparseCaptureState.naturalWidth,
      stage664PromotedCapturePreviewSourceKind: promotedCaptureState.mediaSource,
      toolbarActionCount,
      txtDocumentPreviewSourceKind: txtDocumentState.mediaSource,
      visibleDayGroupCountNodeCount,
      weakWebPreviewSourceKind: webState.mediaSource,
    },
  }
}

export async function captureHomeShortCardContentRenderedPreviewDifferentiationEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  await openHome(page, baseUrl)

  const canvas = page.locator('.recall-home-parity-canvas-stage619').first()
  const dayGroup = canvas.locator('.recall-home-parity-day-group-stage617').first()
  const sparseCaptureCard = canvas
    .locator('.recall-home-parity-card-stage651')
    .filter({ has: page.locator('.recall-home-parity-card-title-stage651', { hasText: 'Stage11 Smoke Runtime' }) })
    .first()
  const promotedCaptureCard = canvas
    .locator('.recall-home-parity-card-stage651')
    .filter({ has: page.locator('.recall-home-parity-card-title-stage651', { hasText: 'Stage13 Debug 1773482318378' }) })
    .first()

  await Promise.all([
    canvas.waitFor({ state: 'visible', timeout: 20000 }),
    dayGroup.waitFor({ state: 'visible', timeout: 20000 }),
    sparseCaptureCard.waitFor({ state: 'visible', timeout: 20000 }),
    promotedCaptureCard.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  await page.waitForTimeout(450)

  const contentRenderedPreviewCardCount = await canvas
    .locator('.recall-home-parity-card-preview-stage657[data-preview-media-source="content-rendered-preview"]')
    .count()
  const fallbackPreviewCardCount = await canvas
    .locator('.recall-home-parity-card-preview-stage657[data-preview-media-kind="fallback"]')
    .count()
  const sparseCaptureState = await readPreviewCardState(page, sparseCaptureCard, `${stageLabel} sparse capture card`)
  const promotedCaptureState = await readPreviewCardState(page, promotedCaptureCard, `${stageLabel} promoted capture card`)
  const [sparseCaptureCardBox, canvasMetrics] = await Promise.all([
    readMeasuredBox(sparseCaptureCard, `representative ${stageLabel} sparse capture card`),
    page.evaluate(() => {
      const canvas = document.querySelector('.recall-home-parity-canvas-stage619')
      const dayHeader = canvas?.querySelector('.recall-home-parity-day-group-header-stage617')
      const grid = canvas?.querySelector('.recall-home-parity-grid-stage615')
      if (!(canvas instanceof HTMLElement) || !(dayHeader instanceof HTMLElement) || !(grid instanceof HTMLElement)) {
        throw new Error('Expected Home canvas, day header, and grid for the short-card differentiation audit.')
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

  const toolbarActionCount =
    (await canvas.locator('.recall-home-parity-toolbar-row-primary-stage601').first().evaluate((node) => node.children.length)) +
    (await canvas.locator('.recall-home-parity-toolbar-row-secondary-stage601').first().evaluate((node) => node.children.length))
  const visibleDayGroupCountNodeCount = await canvas.locator('.recall-home-parity-day-group-header-stage563 span').count()

  if (contentRenderedPreviewCardCount < 1) {
    throw new Error(
      `Expected at least one content-rendered preview card in the default Captures canvas, found ${contentRenderedPreviewCardCount}.`,
    )
  }
  if (fallbackPreviewCardCount !== 0) {
    throw new Error(`Expected no fallback preview cards in the default Captures canvas, found ${fallbackPreviewCardCount}.`)
  }
  if (!(sparseCaptureCardBox.width >= stage615CardWidthFloor && sparseCaptureCardBox.width <= stage615CardWidthCeiling)) {
    throw new Error(`Expected representative card width to stay in the Stage 615 cadence band, found ${sparseCaptureCardBox.width}.`)
  }
  if (!(sparseCaptureCardBox.height <= cardHeightPxCeiling)) {
    throw new Error(`Expected representative card height to stay compact, found ${sparseCaptureCardBox.height}.`)
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
    sparseCaptureState.previewKind !== 'paste' ||
    sparseCaptureState.mediaKind !== 'image' ||
    sparseCaptureState.mediaSource !== 'content-rendered-preview' ||
    !sparseCaptureState.assetUrl ||
    sparseCaptureState.naturalWidth < previewImageWidthFloor ||
    sparseCaptureState.naturalHeight < previewImageHeightFloor
  ) {
    throw new Error(
      `Expected the representative sparse paste card to stay on image/content-rendered-preview, found ${JSON.stringify(sparseCaptureState)}.`,
    )
  }
  if (
    !(
      sparseCaptureState.brightPanelAreaRatio <= contentRenderedNoteBrightPanelAreaCeiling ||
      (sparseCaptureState.brightPanelWidthRatio <= contentRenderedNoteBrightPanelWidthCeiling &&
        sparseCaptureState.brightPanelHeightRatio <= contentRenderedNoteBrightPanelHeightCeiling)
    )
  ) {
    throw new Error(
      `Expected the sparse short-card preview to use the smaller note-like bright panel signature instead of the older mini-sheet footprint, found ${JSON.stringify(sparseCaptureState)}.`,
    )
  }
  if (
    promotedCaptureState.previewKind !== 'paste' ||
    promotedCaptureState.mediaKind !== 'image' ||
    promotedCaptureState.mediaSource !== 'content-rendered-preview' ||
    !promotedCaptureState.assetUrl ||
    promotedCaptureState.naturalWidth < previewImageWidthFloor ||
    promotedCaptureState.naturalHeight < previewImageHeightFloor
  ) {
    throw new Error(
      `Expected the representative promoted paste card to stay on image/content-rendered-preview, found ${JSON.stringify(promotedCaptureState)}.`,
    )
  }

  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)
  const homeSparseCaptureCard = await captureLocatorScreenshot(
    page,
    sparseCaptureCard,
    directory,
    `${stagePrefix}-home-sparse-capture-card.png`,
  )
  const homePromotedCaptureCard = await captureLocatorScreenshot(
    page,
    promotedCaptureCard,
    directory,
    `${stagePrefix}-home-promoted-capture-card.png`,
  )

  const rail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  const webSelection = await openCollectionCard(page, canvas, rail, 'Web', /^Open Stage 10 Debug Article$/i)
  const webState = await readPreviewCardState(page, webSelection.card, `${stageLabel} promoted Web card`)
  const homeWeakWebCard = await captureLocatorScreenshot(page, webSelection.card, directory, `${stagePrefix}-home-weak-web-card.png`)

  await rail.getByRole('button', { name: /^Documents/i }).first().click()
  await page.waitForTimeout(250)
  const txtDocumentCard = canvas
    .locator('.recall-home-parity-card-stage651')
    .filter({ has: page.locator('.recall-home-parity-card-preview-file-stage565') })
    .filter({ has: page.locator('.recall-home-parity-card-preview-badge-stage563', { hasText: 'TXT' }) })
    .first()
  await txtDocumentCard.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
  const txtDocumentState = await readPreviewCardState(page, txtDocumentCard, `${stageLabel} promoted TXT card`)
  const homeTxtDocumentCard = await captureLocatorScreenshot(
    page,
    txtDocumentCard,
    directory,
    `${stagePrefix}-home-txt-document-card.png`,
  )

  if (webState.mediaKind !== 'image' || !webState.assetUrl) {
    throw new Error(`Expected the weak Web card to stay on an image-backed preview, found ${JSON.stringify(webState)}.`)
  }
  if (!['content-rendered-preview', 'html-rendered-snapshot'].includes(webState.mediaSource)) {
    throw new Error(
      `Expected the weak Web card to stay on content-rendered-preview or html-rendered-snapshot, found ${JSON.stringify(webState)}.`,
    )
  }
  if (
    webState.mediaSource === 'html-rendered-snapshot' &&
    (webState.signalStddev < renderedPreviewStddevFloor ||
      (webState.lightCoverage > renderedPreviewLightCoverageCeiling &&
        webState.darkCoverage < renderedPreviewDarkCoverageFloor))
  ) {
    throw new Error(
      `Expected a weak Web rendered snapshot to clear the Stage 661 quality gate when it remains on the rendered-snapshot path, found ${JSON.stringify(webState)}.`,
    )
  }
  if (
    txtDocumentState.mediaKind !== 'image' ||
    txtDocumentState.mediaSource !== 'content-rendered-preview' ||
    !txtDocumentState.assetUrl ||
    txtDocumentState.naturalWidth < previewImageWidthFloor ||
    txtDocumentState.naturalHeight < previewImageHeightFloor
  ) {
    throw new Error(
      `Expected the representative TXT document card to stay on image/content-rendered-preview, found ${JSON.stringify(txtDocumentState)}.`,
    )
  }
  if (txtDocumentState.brightPanelAreaRatio < contentRenderedSheetBrightPanelAreaFloor) {
    throw new Error(
      `Expected the structured TXT preview to keep the denser sheet-like bright panel signature, found ${JSON.stringify(txtDocumentState)}.`,
    )
  }
  if (
    txtDocumentState.brightPanelAreaRatio - sparseCaptureState.brightPanelAreaRatio <
    contentRenderedVariantSeparationFloor
  ) {
    throw new Error(
      `Expected the sparse note preview to stay materially smaller than the structured TXT sheet preview, found sparse=${sparseCaptureState.brightPanelAreaRatio} txt=${txtDocumentState.brightPanelAreaRatio}.`,
    )
  }

  return {
    captures: {
      homePromotedCaptureCard,
      homeSparseCaptureCard,
      homeTxtDocumentCard,
      homeWeakWebCard,
      homeWideTop,
    },
    metrics: {
      cardHeight: sparseCaptureCardBox.height,
      cardWidth: sparseCaptureCardBox.width,
      contentRenderedPreviewCardCount,
      fallbackPreviewCardCount,
      gridTopOffsetPx: canvasMetrics.gridTopOffsetPx,
      headingTopOffsetPx: canvasMetrics.headingTopOffsetPx,
      promotedCaptureBrightPanelAreaRatio: promotedCaptureState.brightPanelAreaRatio,
      promotedCaptureBrightPanelHeightRatio: promotedCaptureState.brightPanelHeightRatio,
      promotedCaptureBrightPanelWidthRatio: promotedCaptureState.brightPanelWidthRatio,
      promotedCapturePreviewSourceKind: promotedCaptureState.mediaSource,
      sparseCaptureBrightPanelAreaRatio: sparseCaptureState.brightPanelAreaRatio,
      sparseCaptureBrightPanelHeightRatio: sparseCaptureState.brightPanelHeightRatio,
      sparseCaptureBrightPanelWidthRatio: sparseCaptureState.brightPanelWidthRatio,
      sparseCaptureCenterLightCoverage: sparseCaptureState.centerLightCoverage,
      sparseCapturePreviewKind: sparseCaptureState.mediaKind,
      sparseCapturePreviewSourceKind: sparseCaptureState.mediaSource,
      sparseCaptureRenderedNaturalHeight: sparseCaptureState.naturalHeight,
      sparseCaptureRenderedNaturalWidth: sparseCaptureState.naturalWidth,
      toolbarActionCount,
      txtDocumentBrightPanelAreaRatio: txtDocumentState.brightPanelAreaRatio,
      txtDocumentBrightPanelHeightRatio: txtDocumentState.brightPanelHeightRatio,
      txtDocumentBrightPanelWidthRatio: txtDocumentState.brightPanelWidthRatio,
      txtDocumentDarkCoverage: txtDocumentState.darkCoverage,
      txtDocumentLightCoverage: txtDocumentState.lightCoverage,
      txtDocumentPreviewSourceKind: txtDocumentState.mediaSource,
      visibleDayGroupCountNodeCount,
      weakWebBrightPanelAreaRatio: webState.brightPanelAreaRatio,
      weakWebBrightPanelHeightRatio: webState.brightPanelHeightRatio,
      weakWebBrightPanelWidthRatio: webState.brightPanelWidthRatio,
      weakWebPreviewSourceKind: webState.mediaSource,
    },
  }
}

export async function captureHomeShortCardNoteVariantDifferentiationEvidence(args) {
  const evidence = await captureHomeShortCardContentRenderedPreviewDifferentiationEvidence(args)
  const {
    promotedCaptureBrightPanelAreaRatio,
    promotedCaptureBrightPanelHeightRatio,
    promotedCaptureBrightPanelWidthRatio,
    promotedCapturePreviewSourceKind,
    sparseCaptureBrightPanelAreaRatio,
    sparseCaptureBrightPanelHeightRatio,
    sparseCaptureBrightPanelWidthRatio,
    txtDocumentBrightPanelAreaRatio,
  } = evidence.metrics

  if (promotedCapturePreviewSourceKind !== 'content-rendered-preview') {
    throw new Error(
      `Expected the promoted short paste card to stay on image/content-rendered-preview, found ${promotedCapturePreviewSourceKind}.`,
    )
  }
  if (
    promotedCaptureBrightPanelAreaRatio < contentRenderedSummaryNoteBrightPanelAreaFloor ||
    promotedCaptureBrightPanelAreaRatio > contentRenderedSummaryNoteBrightPanelAreaCeiling
  ) {
    throw new Error(
      `Expected the promoted short paste card to use the intermediate summary-note bright panel footprint, found area=${promotedCaptureBrightPanelAreaRatio}.`,
    )
  }
  if (
    promotedCaptureBrightPanelAreaRatio - sparseCaptureBrightPanelAreaRatio <
    contentRenderedSummaryNoteSeparationFloor
  ) {
    throw new Error(
      `Expected the promoted short paste card to read larger than the sparse focus-note preview, found promoted=${promotedCaptureBrightPanelAreaRatio} sparse=${sparseCaptureBrightPanelAreaRatio}.`,
    )
  }
  if (
    promotedCaptureBrightPanelWidthRatio <= sparseCaptureBrightPanelWidthRatio ||
    promotedCaptureBrightPanelHeightRatio <= sparseCaptureBrightPanelHeightRatio
  ) {
    throw new Error(
      `Expected the promoted short paste card to expand beyond the sparse focus-note footprint, found promoted=(${promotedCaptureBrightPanelWidthRatio}, ${promotedCaptureBrightPanelHeightRatio}) sparse=(${sparseCaptureBrightPanelWidthRatio}, ${sparseCaptureBrightPanelHeightRatio}).`,
    )
  }
  if (
    txtDocumentBrightPanelAreaRatio - promotedCaptureBrightPanelAreaRatio <
    contentRenderedSheetOverSummarySeparationFloor
  ) {
    throw new Error(
      `Expected the structured TXT sheet preview to remain materially denser than the promoted summary-note preview, found txt=${txtDocumentBrightPanelAreaRatio} promoted=${promotedCaptureBrightPanelAreaRatio}.`,
    )
  }

  return evidence
}

export async function captureHomeSummaryNoteCueDifferentiationEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const evidence = await captureHomeShortCardNoteVariantDifferentiationEvidence({
    baseUrl,
    directory,
    page,
    stageLabel,
    stagePrefix,
  })

  const canvas = page.locator('.recall-home-parity-canvas-stage619').first()
  const rail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  await rail.getByRole('button', { name: /^Captures/i }).first().click()
  await page.waitForTimeout(250)
  const secondSummaryNoteCard = canvas
    .locator('.recall-home-parity-card-stage651')
    .filter({ has: page.locator('.recall-home-parity-card-title-stage651', { hasText: 'Web fallback 1773394001' }) })
    .first()
  await secondSummaryNoteCard.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)

  const secondSummaryNoteState = await readPreviewCardState(
    page,
    secondSummaryNoteCard,
    `${stageLabel} second summary-note card`,
  )
  const homeSecondSummaryNoteCard = await captureLocatorScreenshot(
    page,
    secondSummaryNoteCard,
    directory,
    `${stagePrefix}-home-second-summary-note-card.png`,
  )

  if (
    secondSummaryNoteState.mediaKind !== 'image' ||
    secondSummaryNoteState.mediaSource !== 'content-rendered-preview' ||
    !secondSummaryNoteState.assetUrl ||
    secondSummaryNoteState.naturalWidth < previewImageWidthFloor ||
    secondSummaryNoteState.naturalHeight < previewImageHeightFloor
  ) {
    throw new Error(
      `Expected the second summary-note control to stay on image/content-rendered-preview, found ${JSON.stringify(secondSummaryNoteState)}.`,
    )
  }

  return {
    captures: {
      ...evidence.captures,
      homeSecondSummaryNoteCard,
    },
    metrics: {
      ...evidence.metrics,
      secondSummaryNotePreviewKind: secondSummaryNoteState.mediaKind,
      secondSummaryNotePreviewSourceKind: secondSummaryNoteState.mediaSource,
    },
  }
}

export async function captureHomeStructuredSheetPreviewDifferentiationEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const evidence = await captureHomeSummaryNoteCueDifferentiationEvidence({
    baseUrl,
    directory,
    page,
    stageLabel,
    stagePrefix,
  })

  const {
    promotedCaptureBrightPanelAreaRatio,
    txtDocumentBrightPanelAreaRatio,
    weakWebBrightPanelAreaRatio,
    weakWebPreviewSourceKind,
  } = evidence.metrics

  if (weakWebPreviewSourceKind !== 'content-rendered-preview') {
    throw new Error(
      `Expected the representative weak Web card to stay on image/content-rendered-preview for the structured sheet differentiation pass, found ${weakWebPreviewSourceKind}.`,
    )
  }
  if (
    weakWebBrightPanelAreaRatio < contentRenderedArticleSheetBrightPanelAreaFloor ||
    weakWebBrightPanelAreaRatio > contentRenderedArticleSheetBrightPanelAreaCeiling
  ) {
    throw new Error(
      `Expected the representative weak Web card to use the lighter article-sheet bright panel signature, found area=${weakWebBrightPanelAreaRatio}.`,
    )
  }
  if (
    weakWebBrightPanelAreaRatio - promotedCaptureBrightPanelAreaRatio <
    contentRenderedArticleOverSummarySeparationFloor
  ) {
    throw new Error(
      `Expected the article-sheet Web preview to stay materially denser than the promoted summary-note preview, found web=${weakWebBrightPanelAreaRatio} promoted=${promotedCaptureBrightPanelAreaRatio}.`,
    )
  }
  if (
    txtDocumentBrightPanelAreaRatio - weakWebBrightPanelAreaRatio <
    contentRenderedOutlineOverArticleSeparationFloor
  ) {
    throw new Error(
      `Expected the outline/document TXT preview to stay materially denser than the article-sheet Web preview, found txt=${txtDocumentBrightPanelAreaRatio} web=${weakWebBrightPanelAreaRatio}.`,
    )
  }

  const canvas = page.locator('.recall-home-parity-canvas-stage619').first()
  const structuredPasteCard = canvas
    .locator('.recall-home-parity-card-stage651')
    .filter({ has: page.locator('.recall-home-parity-card-title-stage651', { hasText: 'Stage13 Smoke' }) })
    .first()
  await structuredPasteCard.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)

  const structuredPasteState = await readPreviewCardState(
    page,
    structuredPasteCard,
    `${stageLabel} structured paste sheet card`,
  )
  const homeStructuredPasteCard = await captureLocatorScreenshot(
    page,
    structuredPasteCard,
    directory,
    `${stagePrefix}-home-structured-paste-card.png`,
  )

  if (
    structuredPasteState.previewKind !== 'paste' ||
    structuredPasteState.mediaKind !== 'image' ||
    structuredPasteState.mediaSource !== 'content-rendered-preview' ||
    !structuredPasteState.assetUrl ||
    structuredPasteState.naturalWidth < previewImageWidthFloor ||
    structuredPasteState.naturalHeight < previewImageHeightFloor
  ) {
    throw new Error(
      `Expected the representative structured paste sheet card to stay on image/content-rendered-preview, found ${JSON.stringify(structuredPasteState)}.`,
    )
  }
  if (structuredPasteState.brightPanelAreaRatio < contentRenderedSheetBrightPanelAreaFloor) {
    throw new Error(
      `Expected the structured paste sheet card to keep the denser outline-sheet bright panel signature, found ${JSON.stringify(structuredPasteState)}.`,
    )
  }
  if (
    structuredPasteState.brightPanelAreaRatio - weakWebBrightPanelAreaRatio <
    contentRenderedOutlineOverArticleSeparationFloor
  ) {
    throw new Error(
      `Expected the structured paste outline-sheet preview to stay materially denser than the article-sheet Web preview, found paste=${structuredPasteState.brightPanelAreaRatio} web=${weakWebBrightPanelAreaRatio}.`,
    )
  }

  return {
    captures: {
      ...evidence.captures,
      homeStructuredPasteCard,
    },
    metrics: {
      ...evidence.metrics,
      structuredPasteBrightPanelAreaRatio: structuredPasteState.brightPanelAreaRatio,
      structuredPasteBrightPanelHeightRatio: structuredPasteState.brightPanelHeightRatio,
      structuredPasteBrightPanelWidthRatio: structuredPasteState.brightPanelWidthRatio,
      structuredPasteDarkCoverage: structuredPasteState.darkCoverage,
      structuredPasteLightCoverage: structuredPasteState.lightCoverage,
      structuredPastePreviewKind: structuredPasteState.mediaKind,
      structuredPastePreviewSourceKind: structuredPasteState.mediaSource,
    },
  }
}

export async function captureHomeOutlineSheetPreviewDifferentiationEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const evidence = await captureHomeStructuredSheetPreviewDifferentiationEvidence({
    baseUrl,
    directory,
    page,
    stageLabel,
    stagePrefix,
  })

  const {
    structuredPasteLightCoverage,
    txtDocumentLightCoverage,
  } = evidence.metrics

  if (
    txtDocumentLightCoverage - structuredPasteLightCoverage <
    contentRenderedDocumentOverChecklistLightCoverageFloor
  ) {
    throw new Error(
      `Expected the TXT document outline-sheet preview to stay more continuously light than the checklist-led structured paste preview, found txt=${txtDocumentLightCoverage} paste=${structuredPasteLightCoverage}.`,
    )
  }
  return evidence
}

export async function captureHomeChecklistOutlinePreviewRebalanceEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const evidence = await captureHomeOutlineSheetPreviewDifferentiationEvidence({
    baseUrl,
    directory,
    page,
    stageLabel,
    stagePrefix,
  })

  const {
    structuredPasteLightCoverage,
    txtDocumentLightCoverage,
  } = evidence.metrics

  if (structuredPasteLightCoverage < contentRenderedChecklistRebalancedLightCoverageFloor) {
    throw new Error(
      `Expected the checklist-outline structured paste preview to keep the lighter Stage 678 rebalanced body footprint, found paste=${structuredPasteLightCoverage}.`,
    )
  }
  if (
    txtDocumentLightCoverage - structuredPasteLightCoverage <
    contentRenderedDocumentOverChecklistRebalancedLightCoverageFloor
  ) {
    throw new Error(
      `Expected the TXT document-outline preview to remain materially lighter than the rebalanced checklist-outline paste preview, found txt=${txtDocumentLightCoverage} paste=${structuredPasteLightCoverage}.`,
    )
  }

  return evidence
}

export async function captureHomeChecklistOutlinePanelSeparationEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const evidence = await captureHomeChecklistOutlinePreviewRebalanceEvidence({
    baseUrl,
    directory,
    page,
    stageLabel,
    stagePrefix,
  })

  const {
    structuredPasteBrightPanelAreaRatio,
    structuredPasteBrightPanelWidthRatio,
    txtDocumentBrightPanelAreaRatio,
    txtDocumentBrightPanelWidthRatio,
  } = evidence.metrics

  if (structuredPasteBrightPanelAreaRatio > contentRenderedChecklistSeparatedPanelAreaCeiling) {
    throw new Error(
      `Expected the checklist-outline structured paste preview to shrink below the old document-slab footprint, found paste area=${structuredPasteBrightPanelAreaRatio}.`,
    )
  }
  if (
    txtDocumentBrightPanelAreaRatio - structuredPasteBrightPanelAreaRatio <
    contentRenderedDocumentOverChecklistSeparatedAreaFloor
  ) {
    throw new Error(
      `Expected the TXT document-outline preview to keep a materially broader bright-panel footprint than the checklist-outline paste preview, found txt=${txtDocumentBrightPanelAreaRatio} paste=${structuredPasteBrightPanelAreaRatio}.`,
    )
  }
  if (
    txtDocumentBrightPanelWidthRatio - structuredPasteBrightPanelWidthRatio <
    contentRenderedDocumentOverChecklistSeparatedWidthFloor
  ) {
    throw new Error(
      `Expected the TXT document-outline preview to stay materially wider than the checklist-outline paste preview, found txt=${txtDocumentBrightPanelWidthRatio} paste=${structuredPasteBrightPanelWidthRatio}.`,
    )
  }

  return evidence
}

export async function captureHomeChecklistPanelBalanceEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const evidence = await captureHomeChecklistOutlinePanelSeparationEvidence({
    baseUrl,
    directory,
    page,
    stageLabel,
    stagePrefix,
  })

  const {
    structuredPasteBrightPanelAreaRatio,
    structuredPasteBrightPanelHeightRatio,
    structuredPasteBrightPanelWidthRatio,
    txtDocumentBrightPanelAreaRatio,
    txtDocumentBrightPanelWidthRatio,
    weakWebBrightPanelAreaRatio,
  } = evidence.metrics

  if (structuredPasteBrightPanelWidthRatio < contentRenderedChecklistBalancedWidthFloor) {
    throw new Error(
      `Expected the balanced checklist-outline preview to widen beyond the Stage 680 narrow board footprint, found paste width=${structuredPasteBrightPanelWidthRatio}.`,
    )
  }
  if (structuredPasteBrightPanelHeightRatio > contentRenderedChecklistBalancedHeightCeiling) {
    throw new Error(
      `Expected the balanced checklist-outline preview to drop below the taller Stage 680 board height, found paste height=${structuredPasteBrightPanelHeightRatio}.`,
    )
  }
  const widthGap = txtDocumentBrightPanelWidthRatio - structuredPasteBrightPanelWidthRatio
  if (
    widthGap < contentRenderedDocumentOverChecklistBalancedWidthFloor ||
    widthGap > contentRenderedDocumentOverChecklistBalancedWidthCeiling
  ) {
    throw new Error(
      `Expected the checklist/document width gap to tighten into the balanced band, found txt=${txtDocumentBrightPanelWidthRatio} paste=${structuredPasteBrightPanelWidthRatio}.`,
    )
  }
  if (
    structuredPasteBrightPanelAreaRatio - weakWebBrightPanelAreaRatio <
    contentRenderedChecklistOverArticleBalancedAreaFloor
  ) {
    throw new Error(
      `Expected the balanced checklist-outline preview to stay slightly denser than the article-sheet Web control, found paste=${structuredPasteBrightPanelAreaRatio} web=${weakWebBrightPanelAreaRatio}.`,
    )
  }
  if (txtDocumentBrightPanelAreaRatio <= structuredPasteBrightPanelAreaRatio) {
    throw new Error(
      `Expected the TXT document-outline preview to remain broader than the balanced checklist-outline preview, found txt=${txtDocumentBrightPanelAreaRatio} paste=${structuredPasteBrightPanelAreaRatio}.`,
    )
  }

  return evidence
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
  let brightPanelAreaRatio = 0
  let brightPanelWidthRatio = 0
  let brightPanelHeightRatio = 0
  let centerLightCoverage = 0

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
          ;({ brightPanelAreaRatio, brightPanelHeightRatio, brightPanelWidthRatio, centerLightCoverage, darkCoverage, lightCoverage, signalStddev } = await image.evaluate((node) => {
            const canvas = document.createElement('canvas')
            canvas.width = Math.max(node.naturalWidth, 1)
            canvas.height = Math.max(node.naturalHeight, 1)
            const context = canvas.getContext('2d')
            if (!context) {
              return {
                brightPanelAreaRatio: 0,
                brightPanelHeightRatio: 0,
                brightPanelWidthRatio: 0,
                centerLightCoverage: 0,
                darkCoverage: 0,
                lightCoverage: 0,
                signalStddev: 0,
              }
            }
            context.drawImage(node, 0, 0)
            const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
            let darkPixels = 0
            let lightPixels = 0
            let luminanceSum = 0
            let luminanceSquareSum = 0
            let brightMinX = canvas.width
            let brightMinY = canvas.height
            let brightMaxX = -1
            let brightMaxY = -1
            let centerLightPixels = 0
            let centerPixelCount = 0
            const pixelCount = Math.max(data.length / 4, 1)
            const centerLeft = Math.floor(canvas.width * 0.25)
            const centerRight = Math.ceil(canvas.width * 0.75)
            const centerTop = Math.floor(canvas.height * 0.2)
            const centerBottom = Math.ceil(canvas.height * 0.8)
            for (let y = 0; y < canvas.height; y += 1) {
              for (let x = 0; x < canvas.width; x += 1) {
                const index = (y * canvas.width + x) * 4
                const luminance = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114
                luminanceSum += luminance
                luminanceSquareSum += luminance * luminance
                if (luminance <= 80) {
                  darkPixels += 1
                }
                if (luminance >= 220) {
                  lightPixels += 1
                }
                if (x >= centerLeft && x < centerRight && y >= centerTop && y < centerBottom) {
                  centerPixelCount += 1
                  if (luminance >= 190) {
                    centerLightPixels += 1
                  }
                }
                if (luminance >= 190) {
                  brightMinX = Math.min(brightMinX, x)
                  brightMinY = Math.min(brightMinY, y)
                  brightMaxX = Math.max(brightMaxX, x)
                  brightMaxY = Math.max(brightMaxY, y)
                }
              }
            }
            const mean = luminanceSum / pixelCount
            const variance = Math.max(luminanceSquareSum / pixelCount - mean * mean, 0)
            let panelWidth = 0
            let panelHeight = 0
            if (brightMaxX >= brightMinX && brightMaxY >= brightMinY) {
              panelWidth = brightMaxX - brightMinX + 1
              panelHeight = brightMaxY - brightMinY + 1
            }
            return {
              brightPanelAreaRatio: panelWidth > 0 && panelHeight > 0 ? (panelWidth * panelHeight) / pixelCount : 0,
              brightPanelHeightRatio: panelHeight / Math.max(canvas.height, 1),
              brightPanelWidthRatio: panelWidth / Math.max(canvas.width, 1),
              centerLightCoverage: centerLightPixels / Math.max(centerPixelCount, 1),
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
    brightPanelAreaRatio,
    brightPanelHeightRatio,
    brightPanelWidthRatio,
    centerLightCoverage,
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
    if (process.platform === 'win32') {
      return trimmed
    }
    const driveLetter = trimmed[0].toLowerCase()
    const relativeSegments = trimmed.slice(3).replace(/\\/g, '/')
    return path.posix.normalize(`/mnt/${driveLetter}/${relativeSegments}`)
  }
  return path.resolve(repoRoot, trimmed)
}

function resolvePlaywrightEntry(repoRoot, configuredHarnessDir) {
  const codexRuntimeHarness =
    process.env.USERPROFILE &&
    path.join(process.env.USERPROFILE, '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node')
  const inferredWindowsUser =
    process.platform === 'win32' ? null : process.env.USERNAME || process.env.USER || null
  const inferredWslCodexRuntimeHarness =
    !process.env.USERPROFILE && inferredWindowsUser
      ? path.posix.join(
          '/mnt/c/Users',
          inferredWindowsUser,
          '.cache',
          'codex-runtimes',
          'codex-primary-runtime',
          'dependencies',
          'node',
        )
      : null
  const harnessCandidates = [configuredHarnessDir, codexRuntimeHarness, inferredWslCodexRuntimeHarness].filter(Boolean)
  const checkedEntryPaths = []

  for (const candidate of harnessCandidates) {
    const resolvedHarnessDir = resolveHarnessDir(repoRoot, candidate)
    for (const entryFile of ['index.mjs', 'index.js']) {
      const entryPath = path.join(resolvedHarnessDir, 'node_modules', 'playwright', entryFile)
      checkedEntryPaths.push(entryPath)
      if (existsSync(entryPath)) {
        return entryPath
      }
    }
  }

  throw new Error(
    `Playwright harness not found. Checked:\n${checkedEntryPaths.map((entryPath) => `  ${entryPath}`).join('\n')}`,
  )
}
