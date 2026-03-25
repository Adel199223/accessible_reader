import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE550_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE550_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE550_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE550_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE550_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE550_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const minimumPrimaryWidthDelta = 80
const maximumSecondaryColumnXSpread = 12
const minimumSecondaryRowTopDelta = 60
const maximumOverviewHeaderHeight = 50
const maximumGridOffsetFromOverviewTop = 56
const maximumTitleRowTopOffsetFromOverviewTop = 18
const maximumTitleStatusTopDelta = 4
const maximumStatusInlineGap = 26
const maximumStatusLeftOffsetFromOverviewLeft = 320
const maximumStatusBlockHeight = 14
const maximumStatusBlockWidth = 170
const maximumOverviewCardHeaderHeight = 22
const maximumOverviewCardFirstRowOffset = 32
const maximumOverviewCardFirstRowGap = 5

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage550-post-stage549-home-grouped-overview-card-intro-copy-retirement-and-earlier-row-start-audit-failure.png',
  ),
  { force: true },
)
await rm(
  path.join(
    outputDir,
    'stage550-post-stage549-home-grouped-overview-card-intro-copy-retirement-and-earlier-row-start-audit-failure-reader.png',
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
  const homeOverviewEvidence = await captureHomeOverviewEvidence(page, outputDir, 'stage550')

  await openGraph(page)
  const graphWideTop = await captureViewportScreenshot(page, outputDir, 'stage550-graph-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const { sourceTitle } = await openOriginalReaderFromHome(readerPage)
  const readerOriginalWideTop = await captureViewportScreenshot(readerPage, outputDir, 'stage550-reader-original-wide-top.png')

  await writeFile(
    path.join(
      outputDir,
      'stage550-post-stage549-home-grouped-overview-card-intro-copy-retirement-and-earlier-row-start-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 549 grouped-overview card intro-copy retirement and earlier row-start reset',
          'the grouped overview should now keep leaner card tops without the old visible intro-copy band while the Stage 547 title cluster, Stage 545 title-status join, and the Stage 537 primary-lane plus secondary-stack composition stay intact',
          'Graph and original-only Reader remain regression surfaces while generated-content Reader work stays locked out of scope',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          ...homeOverviewEvidence.captures,
          graphWideTop,
          readerOriginalWideTop,
        },
        maximumOverviewCardFirstRowGap,
        maximumOverviewCardFirstRowOffset,
        maximumOverviewCardHeaderHeight,
        desktopViewport,
        headless,
        maximumGridOffsetFromOverviewTop,
        maximumOverviewHeaderHeight,
        maximumStatusInlineGap,
        maximumStatusLeftOffsetFromOverviewLeft,
        maximumStatusBlockHeight,
        maximumStatusBlockWidth,
        maximumTitleStatusTopDelta,
        minimumPrimaryWidthDelta,
        minimumSecondaryRowTopDelta,
        maximumSecondaryColumnXSpread,
        overviewCardMetrics: homeOverviewEvidence.cardMetrics,
        overviewHeaderMetrics: homeOverviewEvidence.headerMetrics,
        overviewLayoutMetrics: homeOverviewEvidence.layoutMetrics,
        overviewTitleStatusMetrics: homeOverviewEvidence.titleStatusMetrics,
        overviewTitleClusterMetrics: homeOverviewEvidence.titleClusterMetrics,
        overviewCardTopMetrics: homeOverviewEvidence.cardTopMetrics,
        runtimeBrowser,
        sourceTitle,
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
          'stage550-post-stage549-home-grouped-overview-card-intro-copy-retirement-and-earlier-row-start-audit-failure.png',
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
          'stage550-post-stage549-home-grouped-overview-card-intro-copy-retirement-and-earlier-row-start-audit-failure-reader.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function captureHomeOverviewEvidence(page, directory, stagePrefix) {
  await openHome(page)
  await ensureToggleButtonPressed(page, 'Collections')
  await ensureToggleButtonPressed(page, 'Board')
  await clearHomeSearch(page)
  await ensureGroupedOverviewSelected(page)

  const savedLibraryOverview = page.getByRole('region', { name: 'Saved library overview' }).first()
  await savedLibraryOverview.waitFor({ state: 'visible', timeout: 20000 })

  const overviewHeader = savedLibraryOverview.locator('.recall-home-library-stream-header-stage547-reset').first()
  const overviewGrid = savedLibraryOverview.locator('.recall-home-library-stream-grid-stage541-reset').first()
  const overviewTitleRow = savedLibraryOverview.locator('.recall-home-library-stream-title-row-stage547-reset').first()
  const overviewTitleHeading = overviewTitleRow.locator('h3').first()
  const overviewMeta = savedLibraryOverview.locator('.recall-home-library-stream-meta-stage547-reset').first()
  await overviewHeader.waitFor({ state: 'visible', timeout: 20000 })
  await overviewGrid.waitFor({ state: 'visible', timeout: 20000 })
  await overviewTitleRow.waitFor({ state: 'visible', timeout: 20000 })
  await overviewTitleHeading.waitFor({ state: 'visible', timeout: 20000 })
  await overviewMeta.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(300)

  const overviewHeaderParagraphCount = await overviewHeader.locator('p').count()
  if (overviewHeaderParagraphCount > 0) {
    throw new Error(
      `Overview header still rendered ${overviewHeaderParagraphCount} helper paragraph(s); the default-state helper band did not retire.`,
    )
  }
  if (
    (await savedLibraryOverview.getByText('Pick a branch from the organizer to focus one group.', { exact: true }).count()) > 0
  ) {
    throw new Error('Grouped overview still rendered the old helper sentence; the lean grouped-overview heading audit failed.')
  }

  if ((await savedLibraryOverview.getByText('Collections overview', { exact: true }).count()) > 0) {
    throw new Error('Grouped overview still rendered the retired eyebrow label; the top-cap strip did not clear.')
  }
  const overviewMetaText = ((await overviewMeta.textContent()) ?? '').replace(/\s+/g, ' ').trim()
  if (/groups/i.test(overviewMetaText) || /\bboard\b/i.test(overviewMetaText)) {
    throw new Error(
      `Overview status summary stayed too verbose (${overviewMetaText}); the lean grouped-overview heading still exposed redundant groups or Board labels.`,
    )
  }

  const overviewCards = await getVisibleLocators(savedLibraryOverview, '.recall-home-library-card-stage549-reset')
  const primaryCards = await getVisibleLocators(savedLibraryOverview, '.recall-home-library-card-stage537-primary-reset')
  const secondaryCards = await getVisibleLocators(savedLibraryOverview, '.recall-home-library-card-stage537-secondary-reset')
  if (overviewCards.length !== 3 || primaryCards.length !== 1 || secondaryCards.length !== 2) {
    throw new Error(
      `Expected 3 overview cards with a 1/2 primary-secondary split but found cards=${overviewCards.length}, primary=${primaryCards.length}, secondary=${secondaryCards.length}.`,
    )
  }
  for (const retiredCardIntro of [
    'Quick local pastes and clipped notes-in-progress.',
    'Saved article snapshots and web reading.',
    'Imported files and longer local reading.',
  ]) {
    if ((await savedLibraryOverview.getByText(retiredCardIntro, { exact: true }).count()) > 0) {
      throw new Error(`Grouped overview still rendered retired card intro copy (${retiredCardIntro}).`)
    }
  }

  const cardMetrics = []
  for (const card of overviewCards) {
    const metric = await getCardMetric(card)
    if (metric) {
      cardMetrics.push(metric)
    }
  }

  const primaryMetric = await getCardMetric(primaryCards[0])
  const secondaryMetrics = []
  for (const card of secondaryCards) {
    const metric = await getCardMetric(card)
    if (metric) {
      secondaryMetrics.push(metric)
    }
  }

  if (!primaryMetric || secondaryMetrics.length !== 2) {
    throw new Error('Could not measure the primary lane and secondary stack cards for the Stage 550 audit.')
  }
  for (const metric of cardMetrics) {
    if (metric.headerParagraphCount == null || metric.headerHeight == null || metric.firstRowOffset == null) {
      throw new Error(`Could not measure the grouped-overview card-top geometry for ${metric.title ?? 'one card'}.`)
    }
    if (metric.headerParagraphCount > 0) {
      throw new Error(
        `Grouped-overview card ${metric.title} still rendered ${metric.headerParagraphCount} intro paragraph(s); the card intro-copy audit failed.`,
      )
    }
    if (metric.headerHeight > maximumOverviewCardHeaderHeight) {
      throw new Error(
        `Grouped-overview card ${metric.title} header height (${metric.headerHeight}px) stayed too tall; the intro-copy band did not retire enough.`,
      )
    }
    if (metric.firstRowOffset > maximumOverviewCardFirstRowOffset) {
      throw new Error(
        `Grouped-overview card ${metric.title} first-row offset (${metric.firstRowOffset}px) stayed too deep; the card still starts too late.`,
      )
    }
    if (metric.firstRowGapFromHeaderBottom != null && metric.firstRowGapFromHeaderBottom > maximumOverviewCardFirstRowGap) {
      throw new Error(
        `Grouped-overview card ${metric.title} header-to-row gap (${metric.firstRowGapFromHeaderBottom}px) stayed too large; the earlier row start did not hold.`,
      )
    }
  }

  const [overviewBox, headerBox, gridBox, titleRowBox, titleHeadingBox, metaBox] = await Promise.all([
    savedLibraryOverview.boundingBox(),
    overviewHeader.boundingBox(),
    overviewGrid.boundingBox(),
    overviewTitleRow.boundingBox(),
    overviewTitleHeading.boundingBox(),
    overviewMeta.boundingBox(),
  ])

  if (!overviewBox || !headerBox || !gridBox || !titleRowBox || !titleHeadingBox || !metaBox) {
    throw new Error('Could not measure the grouped-overview shell geometry for the Stage 550 audit.')
  }

  const primaryWidthDelta = roundMetric(
    primaryMetric.width - Math.max(...secondaryMetrics.map((metric) => metric.width)),
  )
  const secondaryColumnXSpread = roundMetric(
    Math.max(...secondaryMetrics.map((metric) => metric.x)) - Math.min(...secondaryMetrics.map((metric) => metric.x)),
  )
  const secondaryRowTopDelta = roundMetric(
    Math.abs(secondaryMetrics[1].y - secondaryMetrics[0].y),
  )
  const overviewHeaderHeight = roundMetric(headerBox.height)
  const gridOffsetFromOverviewTop = roundMetric(gridBox.y - overviewBox.y)
  const seamBetweenHeaderAndGrid = roundMetric(gridBox.y - (headerBox.y + headerBox.height))
  const titleRowTopOffsetFromOverviewTop = roundMetric(titleRowBox.y - overviewBox.y)
  const titleStatusTopDelta = roundMetric(Math.abs(metaBox.y - titleHeadingBox.y))
  const statusInlineGap = roundMetric(metaBox.x - (titleHeadingBox.x + titleHeadingBox.width))
  const statusLeftOffsetFromOverviewLeft = roundMetric(metaBox.x - overviewBox.x)
  const statusBlockHeight = roundMetric(metaBox.height)
  const statusBlockWidth = roundMetric(metaBox.width)

  if (primaryWidthDelta < minimumPrimaryWidthDelta) {
    throw new Error(
      `Primary lane width delta (${primaryWidthDelta}px) stayed too small; the grouped overview still reads like equal-width columns.`,
    )
  }
  if (secondaryColumnXSpread > maximumSecondaryColumnXSpread) {
    throw new Error(
      `Secondary stack column drift (${secondaryColumnXSpread}px) stayed too large; the compact right-hand stack did not hold.`,
    )
  }
  if (secondaryRowTopDelta < minimumSecondaryRowTopDelta) {
    throw new Error(
      `Secondary stack row offset (${secondaryRowTopDelta}px) stayed too small; the shorter groups did not separate into a vertical stack.`,
    )
  }
  if (overviewHeaderHeight > maximumOverviewHeaderHeight) {
    throw new Error(
      `Overview header height (${overviewHeaderHeight}px) stayed too tall; the lean grouped-overview heading regressed while card intro copy was being retired.`,
    )
  }
  if (gridOffsetFromOverviewTop > maximumGridOffsetFromOverviewTop) {
    throw new Error(
      `Overview grid offset (${gridOffsetFromOverviewTop}px) stayed too large; the grouped board did not stay pulled up after the card-top reset.`,
    )
  }
  if (titleRowTopOffsetFromOverviewTop > maximumTitleRowTopOffsetFromOverviewTop) {
    throw new Error(
      `Title row top offset (${titleRowTopOffsetFromOverviewTop}px) stayed too deep; the overview still reads like it has an empty cap above All collections.`,
    )
  }
  if (titleStatusTopDelta > maximumTitleStatusTopDelta) {
    throw new Error(
      `Title and status top delta (${titleStatusTopDelta}px) stayed too large; the condensed note did not align with the title row.`,
    )
  }
  if (statusInlineGap > maximumStatusInlineGap) {
    throw new Error(
      `Status inline gap (${statusInlineGap}px) stayed too large; the condensed note drifted away from the All collections title.`,
    )
  }
  if (statusLeftOffsetFromOverviewLeft > maximumStatusLeftOffsetFromOverviewLeft) {
    throw new Error(
      `Status left offset (${statusLeftOffsetFromOverviewLeft}px) stayed too large; the title note still reads like a middle-of-shell seam artifact.`,
    )
  }
  if (statusBlockHeight > maximumStatusBlockHeight) {
    throw new Error(
      `Status block height (${statusBlockHeight}px) stayed too tall; the overview status note regressed while card intro copy was being retired.`,
    )
  }
  if (statusBlockWidth > maximumStatusBlockWidth) {
    throw new Error(
      `Status block width (${statusBlockWidth}px) stayed too wide; the overview status still reads like a detached seam label.`,
    )
  }

  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)
  const homeOverviewBoardWideTop = await captureLocatorTopScreenshot(
    page,
    savedLibraryOverview,
    directory,
    `${stagePrefix}-home-overview-board-wide-top.png`,
    960,
  )
  const homeOverviewCardTopsWideTop = await captureLocatorTopScreenshot(
    page,
    savedLibraryOverview,
    directory,
    `${stagePrefix}-home-overview-card-tops-wide-top.png`,
    360,
  )
  const homeOverviewLaneCompositionWideTop = await captureLocatorUnion(
    page,
    overviewCards,
    directory,
    `${stagePrefix}-home-overview-lane-composition-wide-top.png`,
  )
  const homeOverviewSecondaryStackWideTop = await captureLocatorUnion(
    page,
    secondaryCards,
    directory,
    `${stagePrefix}-home-overview-secondary-stack-wide-top.png`,
  )

  return {
    captures: {
      homeOverviewBoardWideTop,
      homeOverviewCardTopsWideTop,
      homeOverviewLaneCompositionWideTop,
      homeOverviewSecondaryStackWideTop,
      homeWideTop,
    },
    cardMetrics,
    headerMetrics: {
      gridOffsetFromOverviewTop,
      overviewHeaderHeight,
      seamBetweenHeaderAndGrid,
    },
    layoutMetrics: {
      primaryCard: primaryMetric,
      primaryWidthDelta,
      secondaryCards: secondaryMetrics,
      secondaryColumnXSpread,
      secondaryRowTopDelta,
    },
    titleStatusMetrics: {
      statusBlockHeight,
      statusBlockWidth,
      statusInlineGap,
      statusLeftOffsetFromOverviewLeft,
      titleRowTopOffsetFromOverviewTop,
      titleStatusTopDelta,
    },
    titleClusterMetrics: {
      headerParagraphCount: overviewHeaderParagraphCount,
      gridOffsetFromOverviewTop,
      overviewHeaderHeight,
    },
    cardTopMetrics: {
      maximumHeaderHeight: Math.max(...cardMetrics.map((metric) => metric.headerHeight ?? 0)),
      maximumFirstRowOffset: Math.max(...cardMetrics.map((metric) => metric.firstRowOffset ?? 0)),
      totalHeaderParagraphCount: cardMetrics.reduce((sum, metric) => sum + (metric.headerParagraphCount ?? 0), 0),
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
  await page.getByRole('searchbox', { name: 'Search saved sources' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function openOriginalReaderFromHome(page) {
  await openHome(page)
  const sourceButton = await getVisibleLocator(page, [
    '[aria-label="Pinned reopen shelf"] button[aria-label^="Open "]',
    '[aria-label="Saved library overview"] button[aria-label^="Open "]',
    '[aria-label="Saved library"] button[aria-label^="Open "]',
    '.recall-home-library-stage-row',
    'button[aria-label^="Open "]',
  ])
  const sourceTitle = await getSourceTitle(sourceButton)
  await sourceButton.click()
  await page.getByRole('region', { name: `${sourceTitle} workspace` }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(300)

  const sourceWorkspace = page.getByRole('region', { name: `${sourceTitle} workspace` })
  await sourceWorkspace.getByRole('tab', { name: 'Source workspace Reader' }).click()
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
    throw new Error('Could not switch Reader into Original view for the Stage 550 audit.')
  }
  return { sourceTitle }
}

async function ensureToggleButtonPressed(page, name) {
  const button = page.getByRole('button', { name, exact: true }).first()
  await button.waitFor({ state: 'visible', timeout: 20000 })
  if ((await button.getAttribute('aria-pressed')) !== 'true') {
    await button.click()
    await page.waitForTimeout(200)
  }
}

async function clearHomeSearch(page) {
  const searchbox = page.getByRole('searchbox', { name: 'Search saved sources' })
  await searchbox.waitFor({ state: 'visible', timeout: 20000 })
  if ((await searchbox.inputValue()) !== '') {
    await searchbox.fill('')
    await page.waitForTimeout(200)
  }
}

async function ensureGroupedOverviewSelected(page) {
  const browseStrip = page.getByRole('complementary', { name: 'Home browse strip' }).first()
  await browseStrip.waitFor({ state: 'visible', timeout: 20000 })
  const overviewButton = browseStrip.getByRole('button', { name: /All collections/i }).first()
  await overviewButton.waitFor({ state: 'visible', timeout: 20000 })
  if ((await overviewButton.getAttribute('aria-pressed')) !== 'true') {
    await overviewButton.click()
    await page.waitForTimeout(250)
  }
}

async function getVisibleLocators(scope, selector) {
  const matches = scope.locator(selector)
  const visibleLocators = []
  const count = await matches.count()
  for (let index = 0; index < count; index += 1) {
    const locator = matches.nth(index)
    if (await locator.isVisible().catch(() => false)) {
      visibleLocators.push(locator)
    }
  }
  return visibleLocators
}

async function getVisibleLocator(scope, selectors) {
  for (const selector of selectors) {
    const matches = await getVisibleLocators(scope, selector)
    if (matches.length) {
      return matches[0]
    }
  }
  throw new Error(`Could not find a visible locator for selectors: ${selectors.join(', ')}`)
}

async function getCardMetric(card) {
  const [box, headerBox, firstRowBox, headerParagraphCount] = await Promise.all([
    card.boundingBox(),
    card.locator('.recall-home-library-card-header-stage549-reset').first().boundingBox().catch(() => null),
    card.locator('.recall-home-library-stage-row').first().boundingBox().catch(() => null),
    card.locator('.recall-home-library-card-header-stage549-reset p').count().catch(() => null),
  ])
  if (!box) {
    return null
  }
  return {
    className: ((await card.getAttribute('class').catch(() => '')) ?? '').trim(),
    firstRowGapFromHeaderBottom:
      headerBox && firstRowBox ? roundMetric(firstRowBox.y - (headerBox.y + headerBox.height)) : null,
    firstRowOffset: firstRowBox ? roundMetric(firstRowBox.y - box.y) : null,
    headerHeight: headerBox ? roundMetric(headerBox.height) : null,
    headerParagraphCount,
    height: roundMetric(box.height),
    title: await getCardTitle(card),
    width: roundMetric(box.width),
    x: roundMetric(box.x),
    y: roundMetric(box.y),
  }
}

async function getCardTitle(card) {
  const heading = ((await card.locator('h3').first().textContent().catch(() => '')) ?? '').trim()
  if (heading) {
    return heading
  }
  const fallback = ((await card.textContent().catch(() => '')) ?? '').trim()
  return fallback ? fallback.split('\n')[0].trim() : 'Grouped overview card'
}

async function getSourceTitle(sourceButton) {
  const ariaLabel = await sourceButton.getAttribute('aria-label')
  if (ariaLabel) {
    const match = ariaLabel.match(/^Open (.+?)(?: from organizer)?$/i)
    if (match?.[1]) {
      return match[1]
    }
  }
  const text = ((await sourceButton.innerText().catch(() => '')) ?? '').trim()
  if (text) {
    return text.split('\n')[0].trim()
  }
  return 'Saved source'
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

async function captureLocatorUnion(page, locators, directory, filename, padding = 10) {
  const boxes = []
  for (const locator of locators) {
    const box = await locator.boundingBox()
    if (box) {
      boxes.push(box)
    }
  }
  if (!boxes.length) {
    throw new Error(`Could not compute a screenshot clip for ${filename}.`)
  }
  const screenshotPath = path.join(directory, filename)
  const left = Math.max(0, Math.min(...boxes.map((box) => box.x)) - padding)
  const top = Math.max(0, Math.min(...boxes.map((box) => box.y)) - padding)
  const right = Math.max(...boxes.map((box) => box.x + box.width)) + padding
  const bottom = Math.max(...boxes.map((box) => box.y + box.height)) + padding
  await page.screenshot({
    path: screenshotPath,
    clip: {
      x: left,
      y: top,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top),
    },
  })
  return screenshotPath
}

function roundMetric(value) {
  return Math.round(value * 100) / 100
}

function resolveHarnessDir(candidatePath) {
  return candidatePath.startsWith('\\\\wsl.localhost\\')
    ? candidatePath.replace(/^\\\\wsl\.localhost\\[^\\]+/, '')
    : candidatePath
}

async function launchBrowser(chromium) {
  try {
    const browser = await chromium.launch({ channel: preferredChannel, headless })
    return { browser, runtimeBrowser: preferredChannel }
  } catch (error) {
    if (!allowChromiumFallback) {
      throw error
    }
    const browser = await chromium.launch({ headless })
    return { browser, runtimeBrowser: 'chromium' }
  }
}
