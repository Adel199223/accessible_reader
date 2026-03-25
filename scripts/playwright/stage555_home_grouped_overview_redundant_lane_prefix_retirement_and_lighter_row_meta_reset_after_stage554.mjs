import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE555_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE555_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE555_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE555_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE555_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE555_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
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
const maximumOverviewFooterButtonHeight = 16
const maximumOverviewRowHeight = 50
const maximumOverviewRowTitleMinHeight = 1
const maximumOverviewRowOverlineCount = 0
const expectedCapturesWebMetaPartCount = 2
const expectedDocumentsMetaPartCount = 3

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage555-home-grouped-overview-redundant-lane-prefix-retirement-and-lighter-row-meta-reset-after-stage554-failure.png',
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
  const homeOverviewEvidence = await captureHomeOverviewEvidence(page, outputDir, 'stage555')

  await writeFile(
    path.join(
      outputDir,
      'stage555-home-grouped-overview-redundant-lane-prefix-retirement-and-lighter-row-meta-reset-after-stage554-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: homeOverviewEvidence.captures,
        desktopViewport,
        headless,
        maximumGridOffsetFromOverviewTop,
        maximumOverviewFooterButtonHeight,
        maximumOverviewHeaderHeight,
        maximumOverviewRowHeight,
        maximumOverviewRowOverlineCount,
        maximumOverviewRowTitleMinHeight,
        expectedCapturesWebMetaPartCount,
        expectedDocumentsMetaPartCount,
        maximumSecondaryColumnXSpread,
        maximumStatusBlockHeight,
        maximumStatusBlockWidth,
        maximumStatusInlineGap,
        maximumStatusLeftOffsetFromOverviewLeft,
        maximumTitleStatusTopDelta,
        minimumPrimaryWidthDelta,
        minimumSecondaryRowTopDelta,
        overviewCardBodyMetrics: homeOverviewEvidence.cardBodyMetrics,
        overviewCardMetrics: homeOverviewEvidence.cardMetrics,
        overviewHeaderMetrics: homeOverviewEvidence.headerMetrics,
        overviewLayoutMetrics: homeOverviewEvidence.layoutMetrics,
        overviewTitleStatusMetrics: homeOverviewEvidence.titleStatusMetrics,
        runtimeBrowser,
        validationFocus: [
          'wide desktop Home keeps the grouped overview open while grouped-overview rows retire redundant visible lane prefixes from Captures and Web metadata',
          'Documents rows should keep format-specific context, and the compact metadata seam should read lighter without reopening row-height or footer regressions',
          'the grouped-overview metadata reset should stay bounded to Home board rows without widening into selected-group work or generated-content Reader scope',
        ],
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
          'stage555-home-grouped-overview-redundant-lane-prefix-retirement-and-lighter-row-meta-reset-after-stage554-failure.png',
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
      `Overview header still rendered ${overviewHeaderParagraphCount} helper paragraph(s); the lean grouped-overview heading regressed.`,
    )
  }
  if (
    (await savedLibraryOverview.getByText('Pick a branch from the organizer to focus one group.', { exact: true }).count()) > 0
  ) {
    throw new Error('Grouped overview still rendered the retired helper sentence; the Stage 547 lean heading seam did not hold.')
  }
  if ((await savedLibraryOverview.getByText('Collections overview', { exact: true }).count()) > 0) {
    throw new Error('Grouped overview still rendered the retired eyebrow label; the Stage 541/547 heading seam did not hold.')
  }

  const overviewMetaText = ((await overviewMeta.textContent()) ?? '').replace(/\s+/g, ' ').trim()
  if (/groups/i.test(overviewMetaText) || /\bboard\b/i.test(overviewMetaText)) {
    throw new Error(
      `Overview status summary stayed too verbose (${overviewMetaText}); the title seam still exposed redundant groups or Board labels.`,
    )
  }

  const overviewCards = await getVisibleLocators(savedLibraryOverview, '.recall-home-library-card-stage555-reset')
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
    throw new Error('Could not measure the primary lane and secondary stack cards for the Stage 555 validation.')
  }

  for (const metric of cardMetrics) {
    if (
      metric.rowDetailCount == null ||
      metric.rowHeight == null ||
      metric.rowOverlineCount == null ||
      metric.rowTitleHeight == null ||
      metric.rowTitleMinHeight == null ||
      metric.rowMetaPartCount == null ||
      metric.rowMetaWidth == null
    ) {
      throw new Error(`Could not measure the grouped-overview row geometry for ${metric.title ?? 'one card'}.`)
    }
    if (metric.rowDetailCount > 0) {
      throw new Error(
        `Grouped-overview card ${metric.title} still rendered ${metric.rowDetailCount} preview-detail node(s); the Stage 551 baseline regressed.`,
      )
    }
    if (metric.rowOverlineCount > maximumOverviewRowOverlineCount) {
      throw new Error(
        `Grouped-overview card ${metric.title} still rendered ${metric.rowOverlineCount} visible row overline node(s); the Stage 553 reset did not hold.`,
      )
    }
    if (metric.rowHeight > maximumOverviewRowHeight) {
      throw new Error(
        `Grouped-overview card ${metric.title} row height (${metric.rowHeight}px) stayed too tall; the row-internal compression did not hold.`,
      )
    }
    if (metric.rowTitleMinHeight > maximumOverviewRowTitleMinHeight) {
      throw new Error(
        `Grouped-overview card ${metric.title} title min-height (${metric.rowTitleMinHeight}px) stayed too large; the fixed two-line title floor did not retire.`,
      )
    }
    if (metric.title === 'Captures' || metric.title === 'Web') {
      if (metric.rowMetaPartCount !== expectedCapturesWebMetaPartCount) {
        throw new Error(
          `Grouped-overview card ${metric.title} still exposed ${metric.rowMetaPartCount} visible meta parts (${metric.rowMetaText ?? 'missing'}); the redundant lane prefix did not retire.`,
        )
      }
      if (/^(Paste|Web)\s·/i.test(metric.rowMetaText ?? '')) {
        throw new Error(
          `Grouped-overview card ${metric.title} still repeated its lane prefix in the compact metadata (${metric.rowMetaText ?? 'missing'}).`,
        )
      }
    } else if (metric.title === 'Documents') {
      if (metric.rowMetaPartCount !== expectedDocumentsMetaPartCount) {
        throw new Error(
          `Grouped-overview card ${metric.title} lost its format-specific metadata structure (${metric.rowMetaText ?? 'missing'}).`,
        )
      }
      if (!/^(TXT|HTML|PDF|Markdown|DOCX)\s·/i.test(metric.rowMetaText ?? '')) {
        throw new Error(
          `Grouped-overview card ${metric.title} meta text (${metric.rowMetaText ?? 'missing'}) no longer preserved file-format context.`,
        )
      }
    } else {
      throw new Error(`Encountered an unexpected grouped-overview card title (${metric.title ?? 'missing'}).`)
    }
    if (metric.footerButtonHeight != null && metric.footerButtonHeight > maximumOverviewFooterButtonHeight) {
      throw new Error(
        `Grouped-overview card ${metric.title} footer button height (${metric.footerButtonHeight}px) stayed too tall; the Stage 551 attached-footer reset regressed.`,
      )
    }
    if (metric.title === 'Captures' && metric.footerButtonHeight == null) {
      throw new Error(
        'The Captures grouped-overview card no longer exposed a measurable Show all footer button for the Stage 555 validation.',
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
    throw new Error('Could not measure the grouped-overview shell geometry for the Stage 555 validation.')
  }

  const primaryWidthDelta = roundMetric(
    primaryMetric.width - Math.max(...secondaryMetrics.map((metric) => metric.width)),
  )
  const secondaryColumnXSpread = roundMetric(
    Math.max(...secondaryMetrics.map((metric) => metric.x)) - Math.min(...secondaryMetrics.map((metric) => metric.x)),
  )
  const secondaryRowTopDelta = roundMetric(Math.abs(secondaryMetrics[1].y - secondaryMetrics[0].y))
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
      `Overview header height (${overviewHeaderHeight}px) stayed too tall; the lean grouped-overview heading regressed while row internals were being tightened.`,
    )
  }
  if (gridOffsetFromOverviewTop > maximumGridOffsetFromOverviewTop) {
    throw new Error(
      `Overview grid offset (${gridOffsetFromOverviewTop}px) stayed too large; the grouped board did not stay pulled up after the Stage 549/551 resets.`,
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
      `Status block height (${statusBlockHeight}px) stayed too tall; the overview status note regressed while row internals were being tightened.`,
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
  const homeOverviewCardBodiesWideTop = await captureLocatorTopScreenshot(
    page,
    savedLibraryOverview,
    directory,
    `${stagePrefix}-home-overview-card-bodies-wide-top.png`,
    430,
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
      homeOverviewCardBodiesWideTop,
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
    cardBodyMetrics: {
      maximumFooterButtonHeight: Math.max(...cardMetrics.map((metric) => metric.footerButtonHeight ?? 0)),
      maximumRowHeight: Math.max(...cardMetrics.map((metric) => metric.rowHeight ?? 0)),
      maximumRowMetaWidth: Math.max(...cardMetrics.map((metric) => metric.rowMetaWidth ?? 0)),
      maximumRowOverlineCount: Math.max(...cardMetrics.map((metric) => metric.rowOverlineCount ?? 0)),
      maximumVisibleMetaPartCount: Math.max(...cardMetrics.map((metric) => metric.rowMetaPartCount ?? 0)),
      maximumRowTitleHeight: Math.max(...cardMetrics.map((metric) => metric.rowTitleHeight ?? 0)),
      maximumRowTitleMinHeight: Math.max(...cardMetrics.map((metric) => metric.rowTitleMinHeight ?? 0)),
      totalRowDetailCount: cardMetrics.reduce((sum, metric) => sum + (metric.rowDetailCount ?? 0), 0),
    },
  }
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

async function getCardMetric(card) {
  const [box, firstRowBox, firstTitleBox, rowTitleMinHeight, rowDetailCount, rowOverlineCount, footerButtonBox, rowCount, metaText, metaBox] = await Promise.all([
    card.boundingBox(),
    card.locator('.recall-home-library-stage-row-stage553-reset').first().boundingBox().catch(() => null),
    card.locator('.recall-home-library-stage-row-title-stage553-reset').first().boundingBox().catch(() => null),
    card
      .locator('.recall-home-library-stage-row-title-stage553-reset')
      .first()
      .evaluate((node) => Number.parseFloat(window.getComputedStyle(node).minHeight))
      .catch(() => null),
    card.locator('.recall-home-library-stage-row-detail-stage515-reset').count().catch(() => null),
    card.locator('.recall-home-library-stage-row-overline-stage515-reset').count().catch(() => null),
    card.locator('.recall-home-library-section-footer-button-stage551-reset').first().boundingBox().catch(() => null),
    card.locator('.recall-home-library-stage-row-stage553-reset').count().catch(() => null),
    card.locator('.recall-home-library-stage-row-meta-compact-stage555-reset').first().textContent().catch(() => ''),
    card.locator('.recall-home-library-stage-row-meta-compact-stage555-reset').first().boundingBox().catch(() => null),
  ])
  if (!box) {
    return null
  }
  const normalizedMetaText = ((metaText ?? '') || '').replace(/\s+/g, ' ').trim()
  return {
    className: ((await card.getAttribute('class').catch(() => '')) ?? '').trim(),
    footerButtonHeight: footerButtonBox ? roundMetric(footerButtonBox.height) : null,
    height: roundMetric(box.height),
    rowCount,
    rowDetailCount,
    rowHeight: firstRowBox ? roundMetric(firstRowBox.height) : null,
    rowMetaPartCount: normalizedMetaText ? normalizedMetaText.split(' · ').length : 0,
    rowMetaText: normalizedMetaText,
    rowMetaWidth: metaBox ? roundMetric(metaBox.width) : null,
    rowOverlineCount,
    rowTitleHeight: firstTitleBox ? roundMetric(firstTitleBox.height) : null,
    rowTitleMinHeight: rowTitleMinHeight == null || Number.isNaN(rowTitleMinHeight) ? null : roundMetric(rowTitleMinHeight),
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
