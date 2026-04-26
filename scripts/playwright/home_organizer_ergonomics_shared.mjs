import path from 'node:path'

import {
  captureViewportScreenshot,
  desktopViewport,
  openGraph,
  openHome,
  openOriginalReaderFromHome,
} from './home_rendered_preview_quality_shared.mjs'
import { focusedViewport } from './shell_navigation_reset_shared.mjs'

const clippedHomeSelectors = [
  '.recall-home-browse-group-note-stage696-reset',
  '.recall-home-browse-group-source-stage696-reset',
  '.recall-home-parity-card-title-stage696',
  '.recall-home-parity-card-source-stage696',
  '.recall-home-parity-card-preview-detail-stage696',
  '.recall-home-library-stage-source-summary-stage696-reset',
]

export { desktopViewport, focusedViewport }

export async function captureHomeOrganizerErgonomicsEvidence({
  baseUrl,
  directory,
  focusedPage,
  graphPage,
  homePage,
  notebookPage,
  readerPage,
  stageLabel,
  stagePrefix,
  studyPage,
}) {
  const baselineEvidence = await captureHomeOrganizerRegressionEvidence({
    baseUrl,
    directory,
    graphPage,
    notebookPage,
    readerPage,
    stagePrefix,
    studyPage,
  })
  const homeEvidence = await captureHomeErgonomicsEvidence(homePage, directory, stageLabel, stagePrefix, baseUrl)

  return {
    captures: {
      ...baselineEvidence.captures,
      ...homeEvidence.captures,
    },
    metrics: {
      ...baselineEvidence.metrics,
      ...homeEvidence.metrics,
    },
  }
}

async function captureHomeOrganizerRegressionEvidence({
  baseUrl,
  directory,
  graphPage,
  notebookPage,
  readerPage,
  stagePrefix,
  studyPage,
}) {
  await openGraph(graphPage, baseUrl)
  const graphWideTop = await captureViewportScreenshot(graphPage, directory, `${stagePrefix}-graph-wide-top.png`)

  await notebookPage.goto(`${baseUrl}/recall?section=notes`, { waitUntil: 'networkidle' })
  await notebookPage.getByRole('heading', { name: 'Notebook', exact: true }).waitFor({ state: 'visible', timeout: 20000 })
  const notebookWideTop = await captureViewportScreenshot(notebookPage, directory, `${stagePrefix}-notebook-wide-top.png`)

  const readerEvidence = await openOriginalReaderFromHome(readerPage, directory, stagePrefix, baseUrl)
  const simplifiedTab = readerPage.getByRole('tab', { name: 'Simplified', exact: true }).first()
  const simplifiedViewAvailable = await simplifiedTab.isVisible().catch(() => false)

  await studyPage.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  await studyPage.getByRole('tab', { name: 'Study', selected: true }).waitFor({ state: 'visible', timeout: 20000 })
  const studyWideTop = await captureViewportScreenshot(studyPage, directory, `${stagePrefix}-study-wide-top.png`)

  return {
    captures: {
      graphWideTop,
      notebookWideTop,
      readerOriginalWideTop: readerEvidence.capture,
      studyWideTop,
    },
    metrics: {
      graphVisible: true,
      notebookOpenWorkbenchVisible: true,
      originalReaderSourceTitle: readerEvidence.sourceTitle,
      simplifiedViewAvailable,
      studyVisible: true,
    },
  }
}

async function captureHomeErgonomicsEvidence(page, directory, stageLabel, stagePrefix, baseUrl) {
  await openHome(page, baseUrl)

  const organizerRail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  const organizerHeader = page.locator('.recall-home-parity-rail-header-stage563').first()
  const organizerList = page.locator('.recall-home-parity-rail-list-stage563').first()
  const organizerActiveItem = page.locator('[data-home-organizer-active-item-stage838="true"]').first()
  const resizeHandle = page.getByRole('separator', { name: 'Resize Home organizer' }).first()
  const resizeGrip = page.locator('.recall-home-browse-strip-resize-grip-stage696-reset').first()
  const closeButton = page.getByRole('button', { name: 'Hide organizer' }).first()

  await Promise.all([
    organizerRail.waitFor({ state: 'visible', timeout: 20000 }),
    organizerHeader.waitFor({ state: 'visible', timeout: 20000 }),
    organizerList.waitFor({ state: 'visible', timeout: 20000 }),
    resizeHandle.waitFor({ state: 'visible', timeout: 20000 }),
    resizeGrip.waitFor({ state: 'visible', timeout: 20000 }),
    closeButton.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  await page.mouse.move(8, 8)
  await page.waitForTimeout(220)

  const restMetrics = await readResizeGripMetrics(page)
  const homeOrganizerSeamIdleWideTop = await capturePaddedLocatorScreenshot(
    page,
    resizeHandle,
    directory,
    `${stagePrefix}-home-organizer-seam-idle-wide-top.png`,
    { paddingX: 96, paddingY: 176, minHeight: 320, minWidth: 180 },
  )

  await resizeHandle.hover()
  await page.waitForTimeout(180)
  const hoverMetrics = await readResizeGripMetrics(page)
  const organizerGeometryMetrics = await readHomeOrganizerGeometryMetrics(page)
  const expectedHiddenBoardToolbarButtons = ['Search saved sources', 'Add', 'New note', 'List', 'Sort']
  const assertHiddenControlOwnership = (metrics, stateLabel) => {
    if (metrics.controlDeckVisible) {
      throw new Error(`${stageLabel} expected ${stateLabel} to retire the hidden compact organizer deck.`)
    }
    if (metrics.controlSeamVisible) {
      throw new Error(`${stageLabel} expected ${stateLabel} to retire the hidden Home control seam.`)
    }
    if (metrics.organizerControlsInlineVisible) {
      throw new Error(`${stageLabel} expected ${stateLabel} to keep organizer-specific controls behind the organizer reopen path.`)
    }
    if (!metrics.boardToolbarVisible) {
      throw new Error(`${stageLabel} expected ${stateLabel} to keep the shared board toolbar visible.`)
    }
    for (const label of expectedHiddenBoardToolbarButtons) {
      if (!metrics.boardToolbarButtons.includes(label)) {
        throw new Error(`${stageLabel} expected ${stateLabel} to keep ${label} in the shared board toolbar.`)
      }
    }
  }
  const assertHiddenReopenStrip = (metrics, stateLabel) => {
    if (!metrics.reopenClusterPresent) {
      return
    }
    if (!metrics.reopenStripCompact) {
      throw new Error(`${stageLabel} expected ${stateLabel} to collapse the hidden reopen surface into a compact strip.`)
    }
    if (metrics.reopenLeadCardVisible) {
      throw new Error(`${stageLabel} expected ${stateLabel} to retire the old lead card from the hidden at-rest reopen surface.`)
    }
    if (metrics.reopenNearbyGridVisible) {
      throw new Error(`${stageLabel} expected ${stateLabel} to hide the nearby grid until the compact strip disclosure is opened.`)
    }
    if (!metrics.reopenDisclosureInline) {
      throw new Error(`${stageLabel} expected ${stateLabel} to keep the nearby-source disclosure inline inside the compact strip.`)
    }
  }
  const homeOrganizerSeamHoverWideTop = await capturePaddedLocatorScreenshot(
    page,
    resizeHandle,
    directory,
    `${stagePrefix}-home-organizer-seam-hover-wide-top.png`,
    { paddingX: 96, paddingY: 176, minHeight: 320, minWidth: 180 },
  )
  const homeOrganizerHeaderWideTop = await capturePaddedLocatorScreenshot(
    page,
    organizerHeader,
    directory,
    `${stagePrefix}-home-organizer-header-wide-top.png`,
    { paddingX: 64, paddingY: 96, minHeight: 160, minWidth: 240 },
  )
  const homeOrganizerActiveRowWideTop = await capturePaddedLocatorScreenshot(
    page,
    organizerActiveItem,
    directory,
    `${stagePrefix}-home-organizer-active-row-wide-top.png`,
    { paddingX: 44, paddingY: 52, minHeight: 150, minWidth: 240 },
  )
  const openOverviewDensityMetrics = await readHomeOpenOverviewDensityMetrics(page)
  await page.waitForTimeout(450)
  const openOverviewPreviewMetrics = await readHomeOpenOverviewPreviewMetrics(page)
  const homeOpenOverviewFirstGroupWideTop = await capturePaddedLocatorScreenshot(
    page,
    page
      .locator('.recall-home-parity-day-group-open-top-band-stage830, [data-home-open-density-stage828="true"]')
      .first(),
    directory,
    `${stagePrefix}-home-open-overview-first-group-wide-top.png`,
    { paddingX: 48, paddingY: 72, minHeight: 260, minWidth: 760 },
  )
  const webPreviewEvidence = await captureHomeSelectedSectionPreviewEvidence({
    directory,
    organizerRail,
    page,
    sectionLabel: 'Web',
    sectionSlug: 'web',
    stagePrefix,
  })
  const documentsPreviewEvidence = await captureHomeSelectedSectionPreviewEvidence({
    directory,
    organizerRail,
    page,
    sectionLabel: 'Documents',
    sectionSlug: 'documents',
    stagePrefix,
  })
  await organizerRail.getByRole('button', { name: /^Captures/ }).first().click()
  await page.getByRole('region', { name: 'Captures collection canvas' }).first().waitFor({ state: 'visible', timeout: 20000 })
  const homeWideTopAfterErgonomics = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-organizer-ergonomics-wide-top.png`,
  )

  if (!(restMetrics.opacity <= 0.24)) {
    throw new Error(`${stageLabel} expected the Home organizer resize grip to stay quiet at rest.`)
  }
  if (!(hoverMetrics.opacity >= 0.48 && hoverMetrics.opacity > restMetrics.opacity + 0.2)) {
    throw new Error(`${stageLabel} expected the Home organizer resize grip to reveal clearly on hover.`)
  }
  if (organizerGeometryMetrics.headerOverlapDetected) {
    throw new Error(`${stageLabel} expected the Home organizer header title and actions to keep separate ownership space.`)
  }
  if (!organizerGeometryMetrics.listTopAnchored) {
    throw new Error(`${stageLabel} expected the Home organizer list stack to begin directly under the header.`)
  }
  if (organizerGeometryMetrics.headerToFirstRowGap > 16) {
    throw new Error(
      `${stageLabel} expected the Home organizer first row to start earlier under the header, but the gap stayed at ${organizerGeometryMetrics.headerToFirstRowGap.toFixed(2)}px.`,
    )
  }
  if (organizerGeometryMetrics.activePreviewDetached) {
    throw new Error(`${stageLabel} expected the active Home organizer preview handoff to read as an attached seam instead of a detached mini-row.`)
  }
  if (organizerGeometryMetrics.activeRowPanelChromeVisible) {
    throw new Error(`${stageLabel} expected the active Home organizer row to retire the remaining panel-heavy chrome.`)
  }
  if (!organizerGeometryMetrics.activePreviewHandoffVisible) {
    throw new Error(`${stageLabel} expected the active Home organizer row to keep its preview handoff visible.`)
  }
  if (!(openOverviewDensityMetrics.gridColumnCount >= 4)) {
    throw new Error(
      `${stageLabel} expected the open Home overview to expose at least four board columns at benchmark width, received ${openOverviewDensityMetrics.gridColumnCount}.`,
    )
  }
  if (!(openOverviewDensityMetrics.firstRowTileCount >= 4)) {
    throw new Error(
      `${stageLabel} expected the open Home overview first row to fit at least four tiles including Add content, received ${openOverviewDensityMetrics.firstRowTileCount}.`,
    )
  }
  if (openOverviewDensityMetrics.addTileHeroScaleVisible) {
    throw new Error(
      `${stageLabel} expected the open Home Add content tile to stop reading like a hero slab, but its height ${openOverviewDensityMetrics.addTileHeight.toFixed(2)}px still dominated card height ${openOverviewDensityMetrics.cardHeight.toFixed(2)}px.`,
    )
  }
  if (openOverviewDensityMetrics.toolbarConsumesOwnRow) {
    throw new Error(`${stageLabel} expected the open Home toolbar to stop consuming its own row above the board.`)
  }
  if (!openOverviewDensityMetrics.leadBandSharedRow) {
    throw new Error(`${stageLabel} expected the first visible open Home day header and toolbar to share one lead band.`)
  }
  if (!openOverviewDensityMetrics.toolbarSingleRow) {
    throw new Error(`${stageLabel} expected the open Home toolbar utility cluster to converge into one row.`)
  }
  if (openOverviewDensityMetrics.toolbarSecondaryRowVisible) {
    throw new Error(`${stageLabel} expected the open Home toolbar to retire its dedicated second utility row.`)
  }
  if (!openOverviewDensityMetrics.topStartCompact) {
    throw new Error(
      `${stageLabel} expected the open Home first day header to start earlier in the canvas, but its top offset stayed at ${openOverviewDensityMetrics.firstDayHeaderTopOffset.toFixed(2)}px.`,
    )
  }
  if (!openOverviewDensityMetrics.footerVisible) {
    throw new Error(`${stageLabel} expected the open Home continuation footer to remain available once the board truncates.`)
  }
  if (openOverviewDensityMetrics.footerVisibleAboveFold) {
    throw new Error(
      `${stageLabel} expected the open Home continuation footer to drop below the first benchmark viewport, but it was still visible above the fold.`,
    )
  }
  if (!openOverviewDensityMetrics.continuationCarryExtended) {
    throw new Error(
      `${stageLabel} expected the open Home board to carry materially more real cards before the footer, but only ${openOverviewDensityMetrics.visibleDocumentTileCount} document tiles were visible across ${openOverviewDensityMetrics.visibleDayGroupCount} day groups.`,
    )
  }
  if (openOverviewDensityMetrics.collectionChipVisible) {
    throw new Error(`${stageLabel} expected the organizer-visible selected board to retire the repeated lower collection chip.`)
  }
  if (!openOverviewDensityMetrics.sourceRowVisible) {
    throw new Error(`${stageLabel} expected the organizer-visible selected board to keep the source row visible under the title.`)
  }
  if (!openOverviewDensityMetrics.lowerMetaSingleRow) {
    throw new Error(`${stageLabel} expected the organizer-visible selected board to collapse to one lower metadata seam.`)
  }
  if (openOverviewPreviewMetrics.localCaptureMeaningfulPreviewCount < 1) {
    throw new Error(`${stageLabel} expected at least one local capture card to expose the Stage 884 local identity preview treatment.`)
  }
  if (openOverviewPreviewMetrics.localCaptureGenericFallbackCount > 0) {
    throw new Error(
      `${stageLabel} expected generic local-capture screenshot posters to stay retired above the fold, but found ${openOverviewPreviewMetrics.localCaptureGenericFallbackCount}.`,
    )
  }
  if (openOverviewPreviewMetrics.firstViewportUniquePreviewVariants < 4) {
    throw new Error(
      `${stageLabel} expected the Home first viewport to expose at least four distinguishable preview signatures, received ${openOverviewPreviewMetrics.firstViewportUniquePreviewVariants}.`,
    )
  }
  if (openOverviewPreviewMetrics.localPreviewVariantCount < 2) {
    throw new Error(
      `${stageLabel} expected local captures to expose at least two deterministic preview identity variants, received ${openOverviewPreviewMetrics.localPreviewVariantCount}.`,
    )
  }
  for (const [stateLabel, metrics] of [
    ['selected Web', webPreviewEvidence.metrics],
    ['selected Documents', documentsPreviewEvidence.metrics],
  ]) {
    if (metrics.localIdentityPreviewCount > 0) {
      throw new Error(`${stageLabel} expected ${stateLabel} to preserve rendered preview ownership instead of using weak-local identity cards.`)
    }
    if (metrics.renderedPreviewCount > 0 && metrics.meaningfulRenderedPreviewCount < metrics.renderedPreviewCount) {
      throw new Error(`${stageLabel} expected ${stateLabel} rendered previews to be marked as meaningful Stage 870 assets.`)
    }
  }

  const clippingMetrics = await readHomeClippingMetrics(page)
  await closeButton.click()
  const launcherShell = page.locator('.recall-home-organizer-launcher-shell-stage696').first()
  const showButton = page.getByRole('button', { name: 'Show home organizer' }).first()

  await Promise.all([
    launcherShell.waitFor({ state: 'visible', timeout: 20000 }),
    showButton.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  const collapsedMetrics = await readHomeCollapsedOrganizerMetrics(page)
  const hiddenLayoutMetrics = await readHomeHiddenLayoutMetrics(page)
  const hiddenControlOwnershipMetrics = await readHomeHiddenControlOwnershipMetrics(page)
  const homeOrganizerCollapsedWideTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-organizer-collapsed-wide-top.png`,
  )
  if (!collapsedMetrics.launcherTopAnchored) {
    throw new Error(`${stageLabel} expected the collapsed Home organizer launcher to stay top anchored.`)
  }
  if (hiddenLayoutMetrics.companionTrackVisible) {
    throw new Error(
      `${stageLabel} expected the collapsed Home organizer state to retire the dead companion lane, but it still reserved ${hiddenLayoutMetrics.companionTrackWidth.toFixed(2)}px.`,
    )
  }
  if (!hiddenLayoutMetrics.boardStartsAfterLauncher) {
    throw new Error(`${stageLabel} expected the hidden Home board to begin immediately beside the launcher lane.`)
  }
  if (hiddenLayoutMetrics.reopenClusterPresent && !hiddenLayoutMetrics.reopenClusterInline) {
    throw new Error(`${stageLabel} expected the hidden Home reopen shelf to stay inline above the board instead of reading like a side rail.`)
  }
  if (!collapsedMetrics.launcherShellCompact) {
    throw new Error(`${stageLabel} expected the hidden Home launcher hover target to collapse to the launcher button instead of stretching through the lane.`)
  }
  assertHiddenControlOwnership(hiddenControlOwnershipMetrics, 'collapsed Home')
  assertHiddenReopenStrip(hiddenLayoutMetrics, 'collapsed Home')

  await showButton.click()
  await Promise.all([
    organizerRail.waitFor({ state: 'visible', timeout: 20000 }),
    closeButton.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  await organizerRail.getByRole('button', { name: /^Captures/ }).first().click()
  await page.getByRole('region', { name: 'Captures collection canvas' }).first().waitFor({ state: 'visible', timeout: 20000 })
  await closeButton.click()
  await Promise.all([
    launcherShell.waitFor({ state: 'visible', timeout: 20000 }),
    showButton.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  const hiddenSelectedLayoutMetrics = await readHomeHiddenLayoutMetrics(page)
  const hiddenSelectedControlOwnershipMetrics = await readHomeHiddenControlOwnershipMetrics(page)
  const homeOrganizerCollapsedCapturesWideTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-organizer-collapsed-captures-wide-top.png`,
  )
  if (hiddenSelectedLayoutMetrics.companionTrackVisible) {
    throw new Error(
      `${stageLabel} expected hidden Captures to retire the legacy organizer lane, but it still reserved ${hiddenSelectedLayoutMetrics.companionTrackWidth.toFixed(2)}px.`,
    )
  }
  if (!hiddenSelectedLayoutMetrics.boardStartsAfterLauncher) {
    throw new Error(`${stageLabel} expected hidden Captures to begin immediately beside the launcher lane.`)
  }
  assertHiddenControlOwnership(hiddenSelectedControlOwnershipMetrics, 'hidden Captures')
  assertHiddenReopenStrip(hiddenSelectedLayoutMetrics, 'hidden Captures')

  await showButton.click()
  await Promise.all([
    organizerRail.waitFor({ state: 'visible', timeout: 20000 }),
    closeButton.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  const matchQuerySuggestion = await readHomeOrganizerMatchesQuerySuggestion(page)
  const matchQueryCandidates = Array.from(
    new Set(
      [
        ...(matchQuerySuggestion.candidateQueries ?? []),
        matchQuerySuggestion.multiDayQuery,
        matchQuerySuggestion.fallbackQuery,
        'keep',
      ].filter((candidate) => typeof candidate === 'string' && candidate.trim().length > 0),
    ),
  )
  const organizerOptionsTrigger = organizerRail.getByRole('button', { name: 'Organizer options' }).first()
  const organizerOptionsPanel = organizerRail.getByRole('group', { name: 'Organizer options' }).first()
  await organizerOptionsTrigger.click()
  const organizerSearchBox = organizerRail.getByRole('searchbox', { name: 'Filter saved sources' }).first()
  let selectedMatchQuery = matchQueryCandidates[0] ?? 'keep'
  let openMatchesToolbarMetrics = null
  for (const candidateQuery of matchQueryCandidates) {
    await organizerSearchBox.fill(candidateQuery)
    await page.getByRole('region', { name: /results canvas$/i }).first().waitFor({ state: 'visible', timeout: 20000 })
    await organizerOptionsTrigger.click()
    await organizerOptionsPanel.waitFor({ state: 'hidden', timeout: 20000 })
    const candidateMetrics = await readHomeOpenMatchesToolbarMetrics(page)
    selectedMatchQuery = candidateQuery
    openMatchesToolbarMetrics = candidateMetrics
    if (candidateMetrics.dayDividerInline) {
      break
    }
    await organizerOptionsTrigger.click()
    await organizerOptionsPanel.waitFor({ state: 'visible', timeout: 20000 })
  }
  const zeroResultQuery = `${selectedMatchQuery} impossible stage842`
  const homeOrganizerOpenMatchesWideTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-organizer-open-matches-wide-top.png`,
  )
  await organizerOptionsTrigger.click()
  await organizerSearchBox.fill(zeroResultQuery)
  await page.getByText('No saved sources match that filter yet.').waitFor({ state: 'visible', timeout: 20000 })
  await organizerOptionsTrigger.click()
  await organizerOptionsPanel.waitFor({ state: 'hidden', timeout: 20000 })
  const openMatchesZeroResultMetrics = await readHomeOpenMatchesToolbarMetrics(page)
  const homeOrganizerOpenMatchesZeroResultsWideTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-organizer-open-matches-zero-results-wide-top.png`,
  )
  if (!openMatchesToolbarMetrics.toolbarSingleRow) {
    throw new Error(`${stageLabel} expected organizer-visible Matches to use the same single-row board toolbar.`)
  }
  if (openMatchesToolbarMetrics.toolbarSecondaryRowVisible) {
    throw new Error(`${stageLabel} expected organizer-visible Matches to retire the second toolbar row.`)
  }
  if (openMatchesToolbarMetrics.controlDeckVisible) {
    throw new Error(`${stageLabel} expected organizer-visible Matches to retire the at-rest rail control deck.`)
  }
  if (!openMatchesToolbarMetrics.leadBandResultsOwned) {
    throw new Error(`${stageLabel} expected organizer-visible Matches to use a results-owned lead band in the canvas.`)
  }
  if (openMatchesToolbarMetrics.firstHeaderUsesDateLabel) {
    throw new Error(`${stageLabel} expected organizer-visible Matches to stop using a date label as the first visible canvas heading.`)
  }
  if (!openMatchesToolbarMetrics.querySummaryVisible) {
    throw new Error(`${stageLabel} expected organizer-visible Matches to surface a compact query summary in the rail.`)
  }
  if (!openMatchesToolbarMetrics.clearActionVisible) {
    throw new Error(`${stageLabel} expected organizer-visible Matches to keep a visible inline Clear action in the rail summary.`)
  }
  if (openMatchesToolbarMetrics.addTileVisible) {
    throw new Error(`${stageLabel} expected organizer-visible Matches board mode to retire the in-canvas Add content tile.`)
  }
  if (!openMatchesToolbarMetrics.resultsStartWithDocument) {
    throw new Error(`${stageLabel} expected organizer-visible Matches to start the first visible board row with a real result card.`)
  }
  if (!openMatchesToolbarMetrics.collectionChipVisible) {
    throw new Error(`${stageLabel} expected organizer-visible Matches to keep its chip-based card metadata treatment.`)
  }
  if (!openMatchesToolbarMetrics.dayDividerInline) {
    throw new Error(`${stageLabel} expected organizer-visible Matches to preserve chronology through quieter inline day dividers.`)
  }
  if (!openMatchesZeroResultMetrics.querySummaryVisible) {
    throw new Error(`${stageLabel} expected zero-result organizer-visible Matches to keep the compact rail query summary visible.`)
  }
  if (!openMatchesZeroResultMetrics.clearActionVisible) {
    throw new Error(`${stageLabel} expected zero-result organizer-visible Matches to keep a visible Clear action.`)
  }
  if (openMatchesZeroResultMetrics.controlSeamVisible) {
    throw new Error(`${stageLabel} expected zero-result organizer-visible Matches to retire the legacy Home control seam.`)
  }
  if (openMatchesZeroResultMetrics.compactControlDeckVisible) {
    throw new Error(
      `${stageLabel} expected zero-result organizer-visible Matches to retire the legacy compact organizer control deck.`,
    )
  }
  if (!openMatchesZeroResultMetrics.emptyStateVisible) {
    throw new Error(`${stageLabel} expected zero-result organizer-visible Matches to fall back to a compact empty state.`)
  }
  if (!openMatchesZeroResultMetrics.emptyBlockCompact) {
    throw new Error(`${stageLabel} expected zero-result organizer-visible Matches to keep a compact empty-state block.`)
  }
  if (openMatchesZeroResultMetrics.addTileVisible) {
    throw new Error(`${stageLabel} expected zero-result organizer-visible Matches to avoid reviving the Add content tile.`)
  }
  if (openMatchesZeroResultMetrics.zeroResultHeaderCardVisible) {
    throw new Error(`${stageLabel} expected zero-result organizer-visible Matches to retire the extra header-card treatment.`)
  }
  if (!openMatchesZeroResultMetrics.zeroResultUsesSharedLeadBand) {
    throw new Error(`${stageLabel} expected zero-result organizer-visible Matches to reuse the shared results-owned lead band.`)
  }
  await organizerOptionsTrigger.click()
  await organizerSearchBox.fill(selectedMatchQuery)
  await page.getByRole('region', { name: /results canvas$/i }).first().waitFor({ state: 'visible', timeout: 20000 })
  await organizerOptionsTrigger.click()
  await organizerOptionsPanel.waitFor({ state: 'hidden', timeout: 20000 })
  await closeButton.click()
  await Promise.all([
    launcherShell.waitFor({ state: 'visible', timeout: 20000 }),
    showButton.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  const hiddenMatchesLayoutMetrics = await readHomeHiddenLayoutMetrics(page)
  const hiddenMatchesControlOwnershipMetrics = await readHomeHiddenControlOwnershipMetrics(page)
  const homeOrganizerCollapsedMatchesWideTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-organizer-collapsed-matches-wide-top.png`,
  )
  if (hiddenMatchesLayoutMetrics.companionTrackVisible) {
    throw new Error(
      `${stageLabel} expected hidden Matches to stay free of a companion lane, but it still reserved ${hiddenMatchesLayoutMetrics.companionTrackWidth.toFixed(2)}px.`,
    )
  }
  if (!hiddenMatchesLayoutMetrics.boardStartsAfterLauncher) {
    throw new Error(`${stageLabel} expected hidden Matches to begin immediately beside the launcher lane.`)
  }
  assertHiddenControlOwnership(hiddenMatchesControlOwnershipMetrics, 'hidden Matches')
  assertHiddenReopenStrip(hiddenMatchesLayoutMetrics, 'hidden Matches')

  const captures = {
    homeOrganizerActiveRowWideTop,
    homeOrganizerCollapsedCapturesWideTop,
    homeOrganizerCollapsedMatchesWideTop,
    homeOrganizerOpenMatchesWideTop,
    homeOrganizerOpenMatchesZeroResultsWideTop,
    homeOrganizerCollapsedWideTop,
    homeOpenOverviewFirstGroupWideTop,
    ...(webPreviewEvidence.capture ? { homeWebPreviewBalanceWideTop: webPreviewEvidence.capture } : {}),
    ...(documentsPreviewEvidence.capture
      ? { homeDocumentsPreviewBalanceWideTop: documentsPreviewEvidence.capture }
      : {}),
    homeOrganizerHeaderWideTop,
    homeOrganizerSeamHoverWideTop,
    homeOrganizerSeamIdleWideTop,
    homeWideTopAfterErgonomics,
  }
  if (clippingMetrics.examples.length > 0) {
    captures.homeClippedTextWideTop = await captureRectScreenshot(
      page,
      directory,
      `${stagePrefix}-home-clipped-text-wide-top.png`,
      clippingMetrics.examples[0].rect,
      { paddingX: 28, paddingY: 28, minWidth: 260, minHeight: 120 },
    )
  }
  if (clippingMetrics.examples.length > 0) {
    throw new Error(
      `${stageLabel} expected Home clipping count to fall to zero, but found ${clippingMetrics.examples.length} remaining cases.`,
    )
  }

  return {
    captures,
    metrics: {
      homeOrganizerSeamQuietAtRest: restMetrics.opacity <= 0.24,
      homeResizeGripHoverOpacity: hoverMetrics.opacity,
      homeResizeGripHoverWidth: hoverMetrics.width,
      homeResizeGripOpacityAtRest: restMetrics.opacity,
      homeResizeGripRevealDelta: hoverMetrics.opacity - restMetrics.opacity,
      homeResizeGripWidthAtRest: restMetrics.width,
      homeOrganizerHeaderActionGap: organizerGeometryMetrics.headerActionGap,
      homeOrganizerActivePreviewDetached: organizerGeometryMetrics.activePreviewDetached,
      homeOrganizerActivePreviewHandoffVisible: organizerGeometryMetrics.activePreviewHandoffVisible,
      homeOrganizerActiveRowHeight: organizerGeometryMetrics.activeRowHeight,
      homeOrganizerActiveRowPanelChromeVisible: organizerGeometryMetrics.activeRowPanelChromeVisible,
      homeOrganizerHeaderOverlapDetected: organizerGeometryMetrics.headerOverlapDetected,
      homeOrganizerHeaderSafeInsetLeft: organizerGeometryMetrics.headerSafeInsetLeft,
      homeOrganizerHeaderSafeInsetTop: organizerGeometryMetrics.headerSafeInsetTop,
      homeOrganizerHeaderToFirstRowGap: organizerGeometryMetrics.headerToFirstRowGap,
      homeHiddenBoardLeadOffset: hiddenLayoutMetrics.contentLeadOffset,
      homeHiddenBoardStartsAfterLauncher: hiddenLayoutMetrics.boardStartsAfterLauncher,
      homeHiddenBoardToolbarButtonLabels: hiddenControlOwnershipMetrics.boardToolbarButtonLabels,
      homeHiddenBoardToolbarVisible: hiddenControlOwnershipMetrics.boardToolbarVisible,
      homeHiddenCompanionTrackVisible: hiddenLayoutMetrics.companionTrackVisible,
      homeHiddenCompanionTrackWidth: hiddenLayoutMetrics.companionTrackWidth,
      homeHiddenControlDeckVisible: hiddenControlOwnershipMetrics.controlDeckVisible,
      homeHiddenControlSeamVisible: hiddenControlOwnershipMetrics.controlSeamVisible,
      homeHiddenLayoutGap: hiddenLayoutMetrics.layoutGap,
      homeHiddenOrganizerControlsInlineVisible: hiddenControlOwnershipMetrics.organizerControlsInlineVisible,
      homeHiddenMatchesBoardStartsAfterLauncher: hiddenMatchesLayoutMetrics.boardStartsAfterLauncher,
      homeHiddenMatchesBoardToolbarButtonLabels: hiddenMatchesControlOwnershipMetrics.boardToolbarButtonLabels,
      homeHiddenMatchesBoardToolbarVisible: hiddenMatchesControlOwnershipMetrics.boardToolbarVisible,
      homeHiddenMatchesCompanionTrackVisible: hiddenMatchesLayoutMetrics.companionTrackVisible,
      homeHiddenMatchesCompanionTrackWidth: hiddenMatchesLayoutMetrics.companionTrackWidth,
      homeHiddenMatchesControlDeckVisible: hiddenMatchesControlOwnershipMetrics.controlDeckVisible,
      homeHiddenMatchesControlSeamVisible: hiddenMatchesControlOwnershipMetrics.controlSeamVisible,
      homeHiddenMatchesOrganizerControlsInlineVisible: hiddenMatchesControlOwnershipMetrics.organizerControlsInlineVisible,
      homeHiddenReopenClusterInline: hiddenLayoutMetrics.reopenClusterInline,
      homeHiddenReopenClusterPresent: hiddenLayoutMetrics.reopenClusterPresent,
      homeHiddenReopenDisclosureInline: hiddenLayoutMetrics.reopenDisclosureInline,
      homeHiddenReopenLeadCardVisible: hiddenLayoutMetrics.reopenLeadCardVisible,
      homeHiddenReopenNearbyGridVisible: hiddenLayoutMetrics.reopenNearbyGridVisible,
      homeHiddenReopenStripCompact: hiddenLayoutMetrics.reopenStripCompact,
      homeHiddenSelectedBoardLeadOffset: hiddenSelectedLayoutMetrics.contentLeadOffset,
      homeHiddenSelectedBoardStartsAfterLauncher: hiddenSelectedLayoutMetrics.boardStartsAfterLauncher,
      homeHiddenSelectedBoardToolbarButtonLabels: hiddenSelectedControlOwnershipMetrics.boardToolbarButtonLabels,
      homeHiddenSelectedBoardToolbarVisible: hiddenSelectedControlOwnershipMetrics.boardToolbarVisible,
      homeHiddenSelectedCompanionTrackVisible: hiddenSelectedLayoutMetrics.companionTrackVisible,
      homeHiddenSelectedCompanionTrackWidth: hiddenSelectedLayoutMetrics.companionTrackWidth,
      homeHiddenSelectedControlDeckVisible: hiddenSelectedControlOwnershipMetrics.controlDeckVisible,
      homeHiddenSelectedControlSeamVisible: hiddenSelectedControlOwnershipMetrics.controlSeamVisible,
      homeHiddenSelectedLayoutGap: hiddenSelectedLayoutMetrics.layoutGap,
      homeHiddenSelectedOrganizerControlsInlineVisible: hiddenSelectedControlOwnershipMetrics.organizerControlsInlineVisible,
      homeHiddenSelectedReopenClusterInline: hiddenSelectedLayoutMetrics.reopenClusterInline,
      homeHiddenSelectedReopenClusterPresent: hiddenSelectedLayoutMetrics.reopenClusterPresent,
      homeHiddenSelectedReopenLeadCardVisible: hiddenSelectedLayoutMetrics.reopenLeadCardVisible,
      homeHiddenSelectedReopenNearbyGridVisible: hiddenSelectedLayoutMetrics.reopenNearbyGridVisible,
      homeHiddenSelectedReopenStripCompact: hiddenSelectedLayoutMetrics.reopenStripCompact,
      homeHiddenMatchesReopenLeadCardVisible: hiddenMatchesLayoutMetrics.reopenLeadCardVisible,
      homeHiddenMatchesReopenNearbyGridVisible: hiddenMatchesLayoutMetrics.reopenNearbyGridVisible,
      homeHiddenMatchesReopenStripCompact: hiddenMatchesLayoutMetrics.reopenStripCompact,
      homeOpenOverviewAddTileHeight: openOverviewDensityMetrics.addTileHeight,
      homeOpenOverviewAddTileHeroScaleVisible: openOverviewDensityMetrics.addTileHeroScaleVisible,
      homeOpenOverviewCardHeight: openOverviewDensityMetrics.cardHeight,
      homeOpenOverviewCollectionChipVisible: openOverviewDensityMetrics.collectionChipVisible,
      homeOpenOverviewContinuationCarryExtended: openOverviewDensityMetrics.continuationCarryExtended,
      homeOpenOverviewFirstRowTileCount: openOverviewDensityMetrics.firstRowTileCount,
      homeOpenOverviewFirstDayHeaderTopOffset: openOverviewDensityMetrics.firstDayHeaderTopOffset,
      homeOpenOverviewFooterVisible: openOverviewDensityMetrics.footerVisible,
      homeOpenOverviewFooterVisibleAboveFold: openOverviewDensityMetrics.footerVisibleAboveFold,
      homeOpenOverviewGridColumnCount: openOverviewDensityMetrics.gridColumnCount,
      homeOpenOverviewLeadBandSharedRow: openOverviewDensityMetrics.leadBandSharedRow,
      homeOpenOverviewLeadBandHeight: openOverviewDensityMetrics.leadBandHeight,
      homeOpenOverviewLowerMetaSingleRow: openOverviewDensityMetrics.lowerMetaSingleRow,
      homeOpenOverviewSourceRowVisible: openOverviewDensityMetrics.sourceRowVisible,
      homeOpenOverviewFirstViewportUniquePreviewVariants: openOverviewPreviewMetrics.firstViewportUniquePreviewVariants,
      homeOpenOverviewGenericLocalCapturePosterCount: openOverviewPreviewMetrics.genericLocalCapturePosterCount,
      homeOpenOverviewRenderedOrMeaningfulPreviewCount:
        openOverviewPreviewMetrics.renderedPreviewCount + openOverviewPreviewMetrics.localCaptureMeaningfulPreviewCount,
      homeOpenOverviewPreviewDisplayModes: openOverviewPreviewMetrics.previewDisplayModes,
      homeOpenOverviewPreviewRecordCount: openOverviewPreviewMetrics.previewRecordCount,
      homeOpenOverviewRenderedPreviewCount: openOverviewPreviewMetrics.renderedPreviewCount,
      homeOpenOverviewTextFirstPreviewCount: openOverviewPreviewMetrics.textFirstPreviewCount,
      homeOpenOverviewWeakPreviewFallbackCount: openOverviewPreviewMetrics.weakPreviewFallbackCount,
      homeLocalCaptureGenericFallbackCount: openOverviewPreviewMetrics.localCaptureGenericFallbackCount,
      homeLocalCaptureMeaningfulPreviewCount: openOverviewPreviewMetrics.localCaptureMeaningfulPreviewCount,
      homeLocalIdentityPreviewCount: openOverviewPreviewMetrics.localIdentityPreviewCount,
      homeLocalPreviewVariantCount: openOverviewPreviewMetrics.localPreviewVariantCount,
      homeDocumentsMeaningfulRenderedPreviewCount: documentsPreviewEvidence.metrics.meaningfulRenderedPreviewCount,
      homeDocumentsPreviewDisplayModes: documentsPreviewEvidence.metrics.previewDisplayModes,
      homeDocumentsPreviewRecordCount: documentsPreviewEvidence.metrics.previewRecordCount,
      homeDocumentsRenderedPreviewCount: documentsPreviewEvidence.metrics.renderedPreviewCount,
      homeDocumentsTextFirstPreviewCount: documentsPreviewEvidence.metrics.textFirstPreviewCount,
      homeMeaningfulRenderedPreviewPreserved:
        webPreviewEvidence.metrics.meaningfulRenderedPreviewCount +
          documentsPreviewEvidence.metrics.meaningfulRenderedPreviewCount >
        0,
      homeMixedPreviewVariantCount: new Set([
        ...openOverviewPreviewMetrics.previewSignatures,
        ...webPreviewEvidence.metrics.previewSignatures,
        ...documentsPreviewEvidence.metrics.previewSignatures,
      ]).size,
      homePreviewFidelityPreservesDensity:
        openOverviewDensityMetrics.gridColumnCount >= 4 &&
        openOverviewDensityMetrics.firstRowTileCount >= 4 &&
        clippingMetrics.examples.length === 0,
      homeWeakLocalTextFirstCount: openOverviewPreviewMetrics.textFirstPreviewCount,
      homeWebMeaningfulRenderedPreviewCount: webPreviewEvidence.metrics.meaningfulRenderedPreviewCount,
      homeWebPreviewDisplayModes: webPreviewEvidence.metrics.previewDisplayModes,
      homeWebPreviewRecordCount: webPreviewEvidence.metrics.previewRecordCount,
      homeWebRenderedPreviewCount: webPreviewEvidence.metrics.renderedPreviewCount,
      homeWebTextFirstPreviewCount: webPreviewEvidence.metrics.textFirstPreviewCount,
      homeOpenMatchesAddTileVisible: openMatchesToolbarMetrics.addTileVisible,
      homeOpenMatchesClearActionVisible: openMatchesToolbarMetrics.clearActionVisible,
      homeOpenMatchesControlDeckVisible: openMatchesToolbarMetrics.controlDeckVisible,
      homeOpenMatchesCollectionChipVisible: openMatchesToolbarMetrics.collectionChipVisible,
      homeOpenMatchesDayDividerInline: openMatchesToolbarMetrics.dayDividerInline,
      homeOpenMatchesEmptyStateVisible: openMatchesZeroResultMetrics.emptyStateVisible,
      homeOpenMatchesFirstHeaderUsesDateLabel: openMatchesToolbarMetrics.firstHeaderUsesDateLabel,
      homeOpenMatchesLeadBandResultsOwned: openMatchesToolbarMetrics.leadBandResultsOwned,
      homeOpenMatchesQuerySummaryVisible: openMatchesToolbarMetrics.querySummaryVisible,
      homeOpenMatchesResultsStartWithDocument: openMatchesToolbarMetrics.resultsStartWithDocument,
      homeOpenOverviewToolbarSecondaryRowVisible: openOverviewDensityMetrics.toolbarSecondaryRowVisible,
      homeOpenOverviewToolbarSingleRow: openOverviewDensityMetrics.toolbarSingleRow,
      homeOpenOverviewToolbarConsumesOwnRow: openOverviewDensityMetrics.toolbarConsumesOwnRow,
      homeOpenOverviewTopStartCompact: openOverviewDensityMetrics.topStartCompact,
      homeOpenOverviewVisibleDayGroupCount: openOverviewDensityMetrics.visibleDayGroupCount,
      homeOpenOverviewVisibleDocumentTileCount: openOverviewDensityMetrics.visibleDocumentTileCount,
      homeOpenMatchesZeroResultAddTileVisible: openMatchesZeroResultMetrics.addTileVisible,
      homeOpenMatchesZeroResultCompactControlDeckVisible: openMatchesZeroResultMetrics.compactControlDeckVisible,
      homeOpenMatchesZeroResultControlSeamVisible: openMatchesZeroResultMetrics.controlSeamVisible,
      homeOpenMatchesZeroResultEmptyBlockCompact: openMatchesZeroResultMetrics.emptyBlockCompact,
      homeOpenMatchesZeroResultHeaderCardVisible: openMatchesZeroResultMetrics.zeroResultHeaderCardVisible,
      homeOpenMatchesZeroResultUsesSharedLeadBand: openMatchesZeroResultMetrics.zeroResultUsesSharedLeadBand,
      homeOpenMatchesToolbarSecondaryRowVisible: openMatchesToolbarMetrics.toolbarSecondaryRowVisible,
      homeOpenMatchesToolbarSingleRow: openMatchesToolbarMetrics.toolbarSingleRow,
      homeOrganizerLauncherTopAnchored: collapsedMetrics.launcherTopAnchored,
      homeOrganizerLauncherShellCompact: collapsedMetrics.launcherShellCompact,
      homeOrganizerLauncherShellHeight: collapsedMetrics.launcherShellHeight,
      homeOrganizerLauncherButtonHeight: collapsedMetrics.launcherButtonHeight,
      homeOrganizerLauncherTopOffset: collapsedMetrics.launcherTopOffset,
      homeOrganizerListTopAnchored: organizerGeometryMetrics.listTopAnchored,
      homeOrganizerListTopGap: organizerGeometryMetrics.listTopGap,
      homeVisibleClippingCount: clippingMetrics.examples.length,
      homeClippedTextExamples: clippingMetrics.examples.map((example) => example.text),
      homeClippedTextSelectors: clippingMetrics.examples.map((example) => example.selector),
    },
  }
}

async function readResizeGripMetrics(page) {
  return page.evaluate(() => {
    const grip = document.querySelector('.recall-home-browse-strip-resize-grip-stage696-reset')
    if (!(grip instanceof HTMLElement)) {
      return { opacity: 0, width: 0 }
    }
    const style = window.getComputedStyle(grip)
    const rect = grip.getBoundingClientRect()
    return {
      opacity: Number.parseFloat(style.opacity || '0') || 0,
      width: rect.width,
    }
  })
}

async function readHomeClippingMetrics(page) {
  return page.evaluate((selectors) => {
    const examples = []

    for (const selector of selectors) {
      const elements = Array.from(document.querySelectorAll(selector))
      for (const element of elements) {
        if (!(element instanceof HTMLElement) || !isElementVisible(element)) {
          continue
        }
        const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? ''
        if (!text) {
          continue
        }
        const clipped =
          element.scrollWidth > element.clientWidth + 1 ||
          element.scrollHeight > element.clientHeight + 1
        if (!clipped) {
          continue
        }
        const rect = element.getBoundingClientRect()
        examples.push({
          rect: {
            height: rect.height,
            width: rect.width,
            x: rect.x,
            y: rect.y,
          },
          selector,
          text,
        })
      }
    }

    return { examples: examples.slice(0, 5) }

    function isElementVisible(node) {
      const style = window.getComputedStyle(node)
      const rect = node.getBoundingClientRect()
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width > 0 &&
        rect.height > 0
      )
    }
  }, clippedHomeSelectors)
}

async function readHomeOrganizerGeometryMetrics(page) {
  return page.evaluate(() => {
    const rail = document.querySelector('[aria-label="Home collection rail"]')
    const header = document.querySelector('.recall-home-parity-rail-header-stage563')
    const title = document.querySelector('.recall-home-parity-rail-heading-stage563 strong')
    const actions = document.querySelector('.recall-home-parity-rail-actions-stage694')
    const list = document.querySelector('.recall-home-parity-rail-list-stage563')
    const firstItem = list?.querySelector('[role="listitem"]')
    const activeItem = document.querySelector('[data-home-organizer-active-item-stage838="true"]')
    const activeButton = activeItem?.querySelector('[aria-pressed="true"]')
    const activePreview = activeItem?.querySelector('[data-home-organizer-active-preview-stage838="true"]')

    if (
      !(rail instanceof HTMLElement) ||
      !(header instanceof HTMLElement) ||
      !(title instanceof HTMLElement) ||
      !(actions instanceof HTMLElement) ||
      !(list instanceof HTMLElement)
    ) {
      return {
        activePreviewDetached: true,
        activePreviewHandoffVisible: false,
        activeRowHeight: 0,
        activeRowPanelChromeVisible: true,
        headerActionGap: 0,
        headerOverlapDetected: true,
        headerToFirstRowGap: 999,
        headerSafeInsetLeft: 0,
        headerSafeInsetTop: 0,
        listTopAnchored: false,
        listTopGap: 999,
      }
    }

    const railRect = rail.getBoundingClientRect()
    const headerRect = header.getBoundingClientRect()
    const titleRect = title.getBoundingClientRect()
    const actionsRect = actions.getBoundingClientRect()
    const listRect = list.getBoundingClientRect()
    const firstItemRect = firstItem instanceof HTMLElement ? firstItem.getBoundingClientRect() : null
    const activeItemRect = activeItem instanceof HTMLElement ? activeItem.getBoundingClientRect() : null
    const activeButtonRect = activeButton instanceof HTMLElement ? activeButton.getBoundingClientRect() : null
    const activePreviewRect = activePreview instanceof HTMLElement ? activePreview.getBoundingClientRect() : null
    const headerSafeInsetLeft = titleRect.left - railRect.left
    const headerSafeInsetTop = titleRect.top - railRect.top
    const headerActionGap = actionsRect.left - titleRect.right
    const listTopGap = listRect.top - headerRect.bottom
    const headerToFirstRowGap = firstItemRect ? firstItemRect.top - headerRect.bottom : listTopGap
    const headerOverlapDetected =
      headerSafeInsetLeft < 8 || headerSafeInsetTop < 8 || titleRect.right > actionsRect.left - 2
    const activePreviewHandoffVisible = activePreview instanceof HTMLElement && isVisible(activePreview)
    const activePreviewDetached =
      !activePreviewHandoffVisible ||
      !(activeButtonRect && activePreviewRect) ||
      activePreviewRect.top - activeButtonRect.bottom > 4 ||
      activePreviewRect.left - activeButtonRect.left > 8 ||
      activePreviewRect.width < activeButtonRect.width * 0.72
    const activeButtonStyle = activeButton instanceof HTMLElement ? window.getComputedStyle(activeButton) : null
    const activeBackgroundAlpha = activeButtonStyle ? readAlpha(activeButtonStyle.backgroundColor) : 1
    const activeBorderAlpha = activeButtonStyle ? readAlpha(activeButtonStyle.borderTopColor) : 1
    const activeRowPanelChromeVisible =
      !activeButtonStyle ||
      activeButtonStyle.boxShadow !== 'none' ||
      activeBackgroundAlpha > 0.5 ||
      activeBorderAlpha > 0.06

    return {
      activePreviewDetached,
      activePreviewHandoffVisible,
      activeRowHeight: activeItemRect?.height ?? 0,
      activeRowPanelChromeVisible,
      headerActionGap,
      headerOverlapDetected,
      headerToFirstRowGap,
      headerSafeInsetLeft,
      headerSafeInsetTop,
      listTopAnchored: listTopGap <= 18,
      listTopGap,
    }

    function isVisible(node) {
      const style = window.getComputedStyle(node)
      const rect = node.getBoundingClientRect()
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width > 0 &&
        rect.height > 0
      )
    }

    function readAlpha(color) {
      const rgbaMatch = color.match(/rgba?\(([^)]+)\)/i)
      if (!rgbaMatch) {
        return color === 'transparent' ? 0 : 1
      }
      const parts = rgbaMatch[1].split(',').map((part) => part.trim())
      if (parts.length < 4) {
        return 1
      }
      const alpha = Number.parseFloat(parts[3] || '1')
      return Number.isFinite(alpha) ? alpha : 1
    }
  })
}

async function readHomeOpenOverviewDensityMetrics(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('.recall-home-parity-canvas-stage563')
    const grid = document.querySelector('[data-home-open-density-stage828="true"]')
    const leadBand = document.querySelector('[data-home-open-top-band-stage830="true"]')
    const leadHeader = leadBand?.querySelector('.recall-home-parity-day-group-header-stage563')
    const leadToolbar = leadBand?.querySelector('.recall-home-parity-toolbar-stage563')
    const leadToolbarActions = leadBand?.querySelector('[data-home-open-toolbar-single-row-stage832="true"]')
    const leadToolbarPrimaryRow = leadBand?.querySelector('.recall-home-parity-toolbar-row-primary-stage567')
    const leadToolbarSecondaryRow = leadBand?.querySelector('.recall-home-parity-toolbar-row-secondary-stage567')
    const addTile = grid?.querySelector('.recall-home-parity-add-tile-open-density-stage828')
    const firstCard = grid?.querySelector('.recall-home-parity-card-open-density-stage828')
    const footer = canvas?.querySelector('.recall-home-parity-footer-stage563')
    const selectedCard =
      grid?.querySelector('[data-home-open-selected-card-stage836="true"]') ??
      grid?.querySelector('.recall-home-parity-card-open-density-stage828')
    const selectedLowerMeta =
      selectedCard?.querySelector('[data-home-open-lower-meta-single-row-stage836="true"]') ?? null
    const selectedSourceRow =
      selectedCard?.querySelector('[data-home-open-source-row-stage836="true"]') ??
      selectedCard?.querySelector('.recall-home-parity-card-source-row-stage565') ??
      null
    const selectedCollectionChip = selectedCard?.querySelector('.recall-home-parity-card-chip-stage563') ?? null

    if (!(grid instanceof HTMLElement) || !(addTile instanceof HTMLElement) || !(firstCard instanceof HTMLElement)) {
      return {
        addTileHeight: 0,
        addTileHeroScaleVisible: true,
        cardHeight: 0,
        collectionChipVisible: true,
        continuationCarryExtended: false,
        firstRowTileCount: 0,
        firstDayHeaderTopOffset: 999,
        footerVisible: false,
        footerVisibleAboveFold: true,
        gridColumnCount: 0,
        leadBandHeight: 0,
        leadBandSharedRow: false,
        lowerMetaSingleRow: false,
        sourceRowVisible: false,
        toolbarSecondaryRowVisible: true,
        toolbarSingleRow: false,
        toolbarConsumesOwnRow: true,
        topStartCompact: false,
        visibleDayGroupCount: 0,
        visibleDocumentTileCount: 0,
      }
    }

    const directChildren = Array.from(grid.children).filter(
      (node) => node instanceof HTMLElement && isVisible(node),
    )
    const visibleDocumentTiles = Array.from(document.querySelectorAll('.recall-home-parity-card-stage563')).filter(
      (node) => node instanceof HTMLElement && isVisible(node),
    )
    const visibleDayGroups = Array.from(document.querySelectorAll('.recall-home-parity-day-group-stage563')).filter(
      (node) => node instanceof HTMLElement && isVisible(node),
    )
    const firstRowTop = directChildren.length > 0 ? Math.min(...directChildren.map((node) => node.getBoundingClientRect().top)) : 0
    const firstRowTileCount = directChildren.filter((node) => Math.abs(node.getBoundingClientRect().top - firstRowTop) <= 4).length
    const gridTemplateColumns = window.getComputedStyle(grid).gridTemplateColumns
    const gridColumnCount = Array.from(gridTemplateColumns.matchAll(/([0-9]+(?:\.[0-9]+)?)px/g)).length
    const addTileHeight = addTile.getBoundingClientRect().height
    const cardHeight = firstCard.getBoundingClientRect().height
    const firstDayHeaderTopOffset =
      canvas instanceof HTMLElement && leadHeader instanceof HTMLElement
        ? leadHeader.getBoundingClientRect().top - canvas.getBoundingClientRect().top
        : 999
    const leadBandHeight = leadBand instanceof HTMLElement ? leadBand.getBoundingClientRect().height : 0
    const leadBandSharedRow =
      leadBand instanceof HTMLElement &&
      leadHeader instanceof HTMLElement &&
      leadToolbar instanceof HTMLElement &&
      Math.abs(leadHeader.getBoundingClientRect().top - leadToolbar.getBoundingClientRect().top) <= 8
    const toolbarSingleRow =
      leadToolbarActions instanceof HTMLElement &&
      leadToolbarPrimaryRow instanceof HTMLElement &&
      leadToolbarSecondaryRow instanceof HTMLElement &&
      Math.abs(
        leadToolbarPrimaryRow.getBoundingClientRect().top - leadToolbarSecondaryRow.getBoundingClientRect().top,
      ) <= 8
    const toolbarSecondaryRowVisible =
      !(leadToolbarActions instanceof HTMLElement) ||
      !(leadToolbarPrimaryRow instanceof HTMLElement) ||
      !(leadToolbarSecondaryRow instanceof HTMLElement)
        ? true
        : Math.abs(
            leadToolbarPrimaryRow.getBoundingClientRect().top - leadToolbarSecondaryRow.getBoundingClientRect().top,
           ) > 8
    const toolbarConsumesOwnRow = !(leadBand instanceof HTMLElement && leadBandSharedRow)
    const footerVisible = footer instanceof HTMLElement && isVisible(footer)
    const footerVisibleAboveFold = footerVisible ? footer.getBoundingClientRect().top < window.innerHeight : false
    const visibleDocumentTileCount = visibleDocumentTiles.length
    const visibleDayGroupCount = visibleDayGroups.length
    const continuationCarryExtended = !footerVisibleAboveFold && visibleDocumentTileCount >= 18
    const collectionChipVisible = selectedCollectionChip instanceof HTMLElement && isVisible(selectedCollectionChip)
    const sourceRowVisible = selectedSourceRow instanceof HTMLElement && isVisible(selectedSourceRow)
    const lowerMetaSingleRow =
      selectedLowerMeta instanceof HTMLElement &&
      selectedLowerMeta.getAttribute('data-home-open-lower-meta-single-row-stage836') === 'true' &&
      !collectionChipVisible &&
      sourceRowVisible

    return {
      addTileHeight,
      addTileHeroScaleVisible: addTileHeight > cardHeight * 1.08,
      cardHeight,
      collectionChipVisible,
      continuationCarryExtended,
      firstRowTileCount,
      firstDayHeaderTopOffset,
      footerVisible,
      footerVisibleAboveFold,
      gridColumnCount,
      leadBandHeight,
      leadBandSharedRow,
      lowerMetaSingleRow,
      sourceRowVisible,
      toolbarSecondaryRowVisible,
      toolbarSingleRow,
      toolbarConsumesOwnRow,
      topStartCompact: firstDayHeaderTopOffset <= 56,
      visibleDayGroupCount,
      visibleDocumentTileCount,
    }

    function isVisible(node) {
      const style = window.getComputedStyle(node)
      const rect = node.getBoundingClientRect()
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width > 0 &&
        rect.height > 0
      )
    }
  })
}

async function readHomeOpenOverviewPreviewMetrics(page) {
  return page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.recall-home-parity-card-stage563')).filter(
      (node) => node instanceof HTMLElement && isVisible(node) && node.getBoundingClientRect().top < window.innerHeight,
    )
    const records = cards
      .map((card) => {
        const preview = card.querySelector('.recall-home-parity-card-preview-stage563')
        if (!(preview instanceof HTMLElement)) {
          return null
        }
        const excerptText =
          preview
            .querySelector('.recall-home-parity-card-preview-excerpt-stage868')
            ?.textContent?.replace(/\s+/g, ' ')
            .trim() ?? ''
        const imageVisible = Boolean(
          Array.from(preview.querySelectorAll('.recall-home-parity-card-preview-image-stage657')).some(
            (node) => node instanceof HTMLElement && isVisible(node),
          ),
        )
        return {
          displayMode: preview.dataset.previewDisplayMode || 'unknown',
          excerptText,
          imageVisible,
          mediaKind: preview.dataset.previewMediaKind || 'unknown',
          mediaSource: preview.dataset.previewMediaSource || 'unknown',
          meaningfulRendered: preview.dataset.previewMeaningfulRenderedStage870 === 'true',
          localIdentity: preview.dataset.previewLocalIdentityStage884 === 'true',
          localIdentityToken: preview.dataset.previewLocalIdentityTokenStage884 || '',
          localIdentityVariant: preview.dataset.previewLocalIdentityVariantStage884 || '',
          previewKind: preview.dataset.previewKind || 'unknown',
          sourceType: preview.dataset.sourceType || 'unknown',
          weakLocal: preview.dataset.previewWeakLocalStage868 === 'true',
        }
      })
      .filter(Boolean)
    const signatures = new Set(
      records.map((record) => {
        if (record.displayMode === 'local-identity-poster') {
          return `${record.displayMode}:${record.previewKind}:${record.localIdentityVariant}:${record.localIdentityToken}:${record.excerptText.slice(0, 42)}`
        }
        if (record.displayMode === 'text-first-hybrid') {
          return `${record.displayMode}:${record.previewKind}:${record.excerptText.slice(0, 48)}`
        }
        return `${record.displayMode}:${record.previewKind}:${record.mediaSource}`
      }),
    )
    const genericLocalCapturePosterCount = records.filter(
      (record) =>
        record.previewKind === 'paste' &&
        record.mediaSource === 'content-rendered-preview' &&
        record.displayMode !== 'text-first-hybrid' &&
        record.displayMode !== 'local-identity-poster',
    ).length
    const localIdentityPreviewCount = records.filter((record) => record.displayMode === 'local-identity-poster').length
    const localCaptureMeaningfulPreviewCount = records.filter(
      (record) =>
        record.previewKind === 'paste' &&
        record.mediaSource === 'content-rendered-preview' &&
        record.localIdentity &&
        Boolean(record.excerptText),
    ).length
    const localCaptureGenericFallbackCount = records.filter(
      (record) =>
        record.previewKind === 'paste' &&
        record.mediaSource === 'content-rendered-preview' &&
        !record.localIdentity &&
        record.displayMode !== 'text-first-hybrid',
    ).length
    const localPreviewVariantCount = new Set(
      records
        .filter((record) => record.localIdentity)
        .map((record) => `${record.localIdentityVariant}:${record.localIdentityToken}`),
    ).size
    const textFirstPreviewCount = records.filter((record) => record.displayMode === 'text-first-hybrid').length
    const renderedPreviewCount = records.filter((record) => record.displayMode === 'rendered-image' && record.imageVisible).length
    const meaningfulRenderedPreviewCount = records.filter(
      (record) => record.displayMode === 'rendered-image' && record.imageVisible && record.meaningfulRendered,
    ).length
    const weakPreviewFallbackCount = records.filter(
      (record) => record.previewKind === 'paste' && record.mediaSource === 'content-rendered-preview' && !record.weakLocal,
    ).length

    return {
      firstViewportUniquePreviewVariants: signatures.size,
      genericLocalCapturePosterCount,
      localCaptureGenericFallbackCount,
      localCaptureMeaningfulPreviewCount,
      localIdentityPreviewCount,
      localPreviewVariantCount,
      meaningfulRenderedPreviewCount,
      previewDisplayModes: Array.from(new Set(records.map((record) => record.displayMode))).sort(),
      previewRecordCount: records.length,
      previewSignatures: Array.from(signatures).sort(),
      renderedPreviewCount,
      textFirstPreviewCount,
      weakPreviewFallbackCount,
    }

    function isVisible(node) {
      const style = window.getComputedStyle(node)
      const rect = node.getBoundingClientRect()
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width > 0 &&
        rect.height > 0
      )
    }
  })
}

async function captureHomeSelectedSectionPreviewEvidence({
  directory,
  organizerRail,
  page,
  sectionLabel,
  sectionSlug,
  stagePrefix,
}) {
  const sectionButton = organizerRail.getByRole('button', { name: new RegExp(`^${sectionLabel}`) }).first()
  if ((await sectionButton.count()) === 0 || !(await sectionButton.isVisible().catch(() => false))) {
    return {
      capture: null,
      metrics: createEmptyHomePreviewMetrics(),
    }
  }

  await sectionButton.click()
  await page
    .getByRole('region', { name: `${sectionLabel} collection canvas` })
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(450)

  const metrics = await readHomeOpenOverviewPreviewMetrics(page)
  const firstGroup = page
    .locator('.recall-home-parity-day-group-open-top-band-stage830, [data-home-open-density-stage828="true"]')
    .first()
  const capture =
    (await firstGroup.count()) > 0 && (await firstGroup.isVisible().catch(() => false))
      ? await capturePaddedLocatorScreenshot(
          page,
          firstGroup,
          directory,
          `${stagePrefix}-home-${sectionSlug}-preview-balance-wide-top.png`,
          { paddingX: 48, paddingY: 72, minHeight: 240, minWidth: 640 },
        )
      : null

  return {
    capture,
    metrics,
  }
}

function createEmptyHomePreviewMetrics() {
  return {
    firstViewportUniquePreviewVariants: 0,
    genericLocalCapturePosterCount: 0,
    meaningfulRenderedPreviewCount: 0,
    previewDisplayModes: [],
    previewRecordCount: 0,
    previewSignatures: [],
    renderedPreviewCount: 0,
    textFirstPreviewCount: 0,
    weakPreviewFallbackCount: 0,
  }
}

async function readHomeOpenMatchesToolbarMetrics(page) {
  return page.evaluate(() => {
    const organizerRail = document.querySelector('[aria-label="Home collection rail"]')
    const resultsCanvas = document.querySelector('[aria-label$="results canvas"]')
    const controlSeam = document.querySelector('[aria-label="Home control seam"]')
    const compactControlDeck = document.querySelector('.recall-home-compact-control-deck')
    const matchesHeader =
      document.querySelector('[data-home-open-top-band-stage830="true"]') ??
      document.querySelector('.recall-home-library-card-header-open-toolbar-stage832')
    const matchesLeadBand = resultsCanvas?.querySelector('[data-home-open-matches-lead-band-stage842="true"]') ?? null
    const toolbarActions = matchesHeader?.querySelector('[data-home-open-toolbar-single-row-stage832="true"]')
    const primaryRow = matchesHeader?.querySelector('.recall-home-parity-toolbar-row-primary-stage567')
    const secondaryRow = matchesHeader?.querySelector('.recall-home-parity-toolbar-row-secondary-stage567')
    const resultsGrid =
      resultsCanvas?.querySelector('[data-home-open-density-stage828="true"]') ??
      resultsCanvas?.querySelector('.recall-home-parity-grid-stage563[role="list"]') ??
      null
    const firstVisibleGridChild = resultsGrid
      ? Array.from(resultsGrid.children).find((node) => node instanceof HTMLElement && isVisible(node)) ?? null
      : null
    const firstResultsCard =
      resultsCanvas?.querySelector('.recall-home-parity-card-stage563') ??
      document.querySelector('.recall-home-parity-card-stage563')
    const collectionChip = firstResultsCard?.querySelector('.recall-home-parity-card-chip-stage563') ?? null
    const addTile = resultsCanvas?.querySelector('.recall-home-parity-add-tile-stage563') ?? null
    const querySummary = organizerRail?.querySelector('[data-home-open-matches-query-summary-stage840="true"]') ?? null
    const clearAction = organizerRail?.querySelector('[data-home-open-matches-clear-stage840="true"]') ?? null
    const visibleRailSearchbox = organizerRail?.querySelector('input[aria-label="Filter saved sources"]') ?? null
    const visibleControlDeck = organizerRail?.querySelector('[aria-label="Organizer controls"]') ?? null
    const emptyState = resultsCanvas?.querySelector('[data-home-open-matches-empty-stage840="true"]') ?? null
    const dayDivider = resultsCanvas?.querySelector('[data-home-open-matches-day-divider-stage842="true"]') ?? null
    const zeroResultHeaderCard = resultsCanvas?.querySelector('.recall-home-library-card-header-matches-empty-stage840') ?? null
    const firstVisibleHeading =
      resultsCanvas
        ? Array.from(resultsCanvas.querySelectorAll('h3')).find(
            (node) => node instanceof HTMLElement && isVisible(node),
          ) ?? null
        : null
    const firstHeadingText =
      firstVisibleHeading instanceof HTMLElement ? firstVisibleHeading.textContent?.replace(/\s+/g, ' ').trim() ?? '' : ''

    if (!(matchesHeader instanceof HTMLElement)) {
      return {
        addTileVisible: false,
        clearActionVisible: false,
        collectionChipVisible: false,
        compactControlDeckVisible: false,
        controlDeckVisible: false,
        controlSeamVisible: false,
        dayDividerInline: false,
        emptyBlockCompact: false,
        emptyStateVisible: false,
        firstHeaderUsesDateLabel: false,
        leadBandResultsOwned: false,
        querySummaryVisible: false,
        resultsStartWithDocument: false,
        zeroResultHeaderCardVisible: false,
        zeroResultUsesSharedLeadBand: false,
        toolbarSecondaryRowVisible: true,
        toolbarSingleRow: false,
      }
    }

    const leadBandResultsOwned =
      matchesLeadBand instanceof HTMLElement &&
      isVisible(matchesLeadBand) &&
      firstHeadingText === 'Matches'
    const emptyStateVisible = emptyState instanceof HTMLElement && isVisible(emptyState)
    const zeroResultHeaderCardVisible =
      zeroResultHeaderCard instanceof HTMLElement && isVisible(zeroResultHeaderCard)

    return {
      addTileVisible: addTile instanceof HTMLElement && isVisible(addTile),
      clearActionVisible: clearAction instanceof HTMLElement && isVisible(clearAction),
      collectionChipVisible: collectionChip instanceof HTMLElement && isVisible(collectionChip),
      compactControlDeckVisible: compactControlDeck instanceof HTMLElement && isVisible(compactControlDeck),
      controlDeckVisible:
        (visibleRailSearchbox instanceof HTMLElement && isVisible(visibleRailSearchbox)) ||
        (visibleControlDeck instanceof HTMLElement && isVisible(visibleControlDeck)),
      controlSeamVisible: controlSeam instanceof HTMLElement && isVisible(controlSeam),
      dayDividerInline: dayDivider instanceof HTMLElement && isVisible(dayDivider),
      emptyBlockCompact:
        emptyStateVisible && emptyState instanceof HTMLElement
          ? emptyState.getBoundingClientRect().height <= 220
          : false,
      emptyStateVisible,
      firstHeaderUsesDateLabel: firstHeadingText !== '' && firstHeadingText !== 'Matches',
      leadBandResultsOwned,
      querySummaryVisible: querySummary instanceof HTMLElement && isVisible(querySummary),
      resultsStartWithDocument:
        firstVisibleGridChild instanceof HTMLElement &&
        firstVisibleGridChild.classList.contains('recall-home-parity-card-stage563') &&
        !(addTile instanceof HTMLElement && isVisible(addTile)),
      zeroResultHeaderCardVisible,
      zeroResultUsesSharedLeadBand: emptyStateVisible && leadBandResultsOwned && !zeroResultHeaderCardVisible,
      toolbarSecondaryRowVisible:
        !(toolbarActions instanceof HTMLElement) ||
        !(primaryRow instanceof HTMLElement) ||
        !(secondaryRow instanceof HTMLElement)
          ? true
          : Math.abs(primaryRow.getBoundingClientRect().top - secondaryRow.getBoundingClientRect().top) > 8,
      toolbarSingleRow:
        toolbarActions instanceof HTMLElement &&
        primaryRow instanceof HTMLElement &&
        secondaryRow instanceof HTMLElement &&
        Math.abs(primaryRow.getBoundingClientRect().top - secondaryRow.getBoundingClientRect().top) <= 8,
    }

    function isVisible(node) {
      const style = window.getComputedStyle(node)
      const rect = node.getBoundingClientRect()
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width > 0 &&
        rect.height > 0
      )
    }
  })
}

async function readHomeOrganizerMatchesQuerySuggestion(page) {
  return page.evaluate(() => {
    const stopWords = new Set([
      'after',
      'before',
      'from',
      'here',
      'local',
      'only',
      'paste',
      'source',
      'with',
    ])
    const tokenStats = new Map()
    const cards = Array.from(document.querySelectorAll('.recall-home-parity-card-stage563'))

    for (const card of cards) {
      if (!(card instanceof HTMLElement) || !isVisible(card)) {
        continue
      }
      const title =
        card.querySelector('[class*="recall-home-parity-card-title"]')?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
      if (!title) {
        continue
      }
      const dayGroup = card.closest('.recall-home-parity-day-group-stage563')
      const dayLabel =
        dayGroup?.querySelector('.recall-home-parity-day-group-header-stage563 h3')?.textContent?.replace(/\s+/g, ' ').trim() ??
        'Unknown date'
      const tokens = Array.from(new Set(title.toLowerCase().match(/[a-z0-9]+/g) ?? [])).filter(
        (token) => token.length >= 4 && !/^\d+$/.test(token) && !stopWords.has(token),
      )
      for (const token of tokens) {
        const existing = tokenStats.get(token)
        if (existing) {
          existing.count += 1
          existing.dayLabels.add(dayLabel)
        } else {
          tokenStats.set(token, {
            count: 1,
            dayLabels: new Set([dayLabel]),
          })
        }
      }
    }

    const rankedTokens = Array.from(tokenStats.entries())
      .map(([token, stats]) => ({
        count: stats.count,
        dayCount: stats.dayLabels.size,
        token,
      }))
      .sort((left, right) => {
        if (right.dayCount !== left.dayCount) {
          return right.dayCount - left.dayCount
        }
        if (right.count !== left.count) {
          return right.count - left.count
        }
        return right.token.length - left.token.length
      })

    const multiDayQuery = rankedTokens.find((candidate) => candidate.dayCount >= 2 && candidate.count >= 2)?.token ?? null
    const fallbackQuery = rankedTokens[0]?.token ?? null
    const candidateQueries = rankedTokens.slice(0, 8).map((candidate) => candidate.token)

    return {
      candidateQueries,
      fallbackQuery,
      multiDayQuery,
    }

    function isVisible(node) {
      const style = window.getComputedStyle(node)
      const rect = node.getBoundingClientRect()
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width > 0 &&
        rect.height > 0
      )
    }
  })
}

async function readHomeCollapsedOrganizerMetrics(page) {
  return page.evaluate(() => {
    const launcherShell = document.querySelector('.recall-home-organizer-launcher-shell-stage696')
    const launcherButton = document.querySelector('.recall-home-organizer-launcher-stage696')

    if (!(launcherShell instanceof HTMLElement) || !(launcherButton instanceof HTMLElement)) {
      return {
        launcherButtonHeight: 0,
        launcherShellCompact: false,
        launcherShellHeight: 0,
        launcherTopAnchored: false,
        launcherTopOffset: 999,
      }
    }

    const shellRect = launcherShell.getBoundingClientRect()
    const buttonRect = launcherButton.getBoundingClientRect()
    const launcherTopOffset = buttonRect.top - shellRect.top

    return {
      launcherButtonHeight: buttonRect.height,
      launcherShellCompact: shellRect.height <= buttonRect.height + 28,
      launcherShellHeight: shellRect.height,
      launcherTopAnchored: launcherTopOffset <= 20,
      launcherTopOffset,
    }
  })
}

async function readHomeHiddenLayoutMetrics(page) {
  return page.evaluate(() => {
    const launcherShell = document.querySelector('.recall-home-organizer-launcher-shell-stage696')
    const browserStage = document.querySelector('.recall-home-browser-stage-organizer-hidden-reset')
    const flowGrid = document.querySelector(
      '.recall-home-primary-flow-grid-organizer-hidden-stage820, .recall-home-primary-flow-grid-organizer-hidden-reset',
    )
    const reopenSurface = document.querySelector('[aria-label="Pinned reopen strip"], [aria-label="Pinned reopen shelf"]')

    if (!(launcherShell instanceof HTMLElement) || !(browserStage instanceof HTMLElement)) {
      return {
        boardStartsAfterLauncher: false,
        companionTrackVisible: true,
        companionTrackWidth: 999,
        contentLeadOffset: 999,
        layoutGap: 999,
        reopenClusterInline: false,
        reopenClusterPresent: false,
        reopenDisclosureInline: false,
        reopenLeadCardVisible: true,
        reopenNearbyGridVisible: true,
        reopenStripCompact: false,
      }
    }

    const contentLead = browserStage.querySelector(
      [
        '[aria-label="Pinned reopen strip"]',
        '[aria-label="Pinned reopen shelf"]',
        '.recall-home-parity-canvas-stage563',
        '.recall-home-parity-day-groups-stage563',
        '.recall-home-parity-add-tile-stage563',
        '.recall-home-parity-card-stage563',
        '.recall-home-parity-list-row-stage563',
        '.recall-home-library-stage-row',
        '.recall-home-library-stream',
        '.recall-home-library-card',
      ].join(', '),
    )

    const launcherRect = launcherShell.getBoundingClientRect()
    const stageRect = browserStage.getBoundingClientRect()
    const contentLeadRect = contentLead instanceof HTMLElement ? contentLead.getBoundingClientRect() : stageRect
    const layoutGap = stageRect.left - launcherRect.right
    const contentLeadOffset = contentLeadRect.left - stageRect.left

    let companionTrackWidth = Math.max(0, contentLeadOffset)
    if (flowGrid instanceof HTMLElement) {
      const gridTemplateColumns = window.getComputedStyle(flowGrid).gridTemplateColumns
      const trackWidths = Array.from(gridTemplateColumns.matchAll(/([0-9]+(?:\.[0-9]+)?)px/g)).map((match) =>
        Number.parseFloat(match[1]),
      )
      if (trackWidths.length > 1) {
        companionTrackWidth = Math.max(companionTrackWidth, trackWidths[1] ?? 0)
      }
    }

    const reopenClusterPresent = reopenSurface instanceof HTMLElement
    const reopenClusterInline = !reopenClusterPresent
      ? true
      : [
          '.recall-home-primary-board-direct-main-inline-reopen-reset',
          '.recall-home-library-stream',
          '.recall-home-parity-canvas-stage563',
        ].some((selector) => reopenSurface.closest(selector) instanceof HTMLElement)
    const reopenLeadCard =
      reopenSurface instanceof HTMLElement ? reopenSurface.querySelector('.recall-home-lead-card') : null
    const reopenNearbyList =
      reopenSurface instanceof HTMLElement ? reopenSurface.querySelector('.recall-home-continue-list') : null
    const reopenDisclosureButton =
      reopenSurface instanceof HTMLElement
        ? reopenSurface.querySelector('.recall-home-hidden-reopen-strip-disclosure-stage826')
        : null
    const reopenRect = reopenSurface instanceof HTMLElement ? reopenSurface.getBoundingClientRect() : null
    const reopenLeadCardVisible = reopenLeadCard instanceof HTMLElement && isVisible(reopenLeadCard)
    const reopenNearbyGridVisible = reopenNearbyList instanceof HTMLElement && isVisible(reopenNearbyList)
    const reopenStripCompact =
      reopenSurface instanceof HTMLElement &&
      reopenSurface.getAttribute('aria-label') === 'Pinned reopen strip' &&
      Boolean(reopenRect && reopenRect.height <= 120)
    const reopenDisclosureInline =
      !reopenClusterPresent
        ? true
        : reopenDisclosureButton instanceof HTMLElement
        ? reopenDisclosureButton.closest('[aria-label="Pinned reopen strip"]') === reopenSurface
        : reopenSurface.getAttribute('aria-label') === 'Pinned reopen strip'

    return {
      boardStartsAfterLauncher: layoutGap <= 28 && contentLeadOffset <= 80,
      companionTrackVisible: companionTrackWidth > 96,
      companionTrackWidth,
      contentLeadOffset,
      layoutGap,
      reopenClusterInline,
      reopenClusterPresent,
      reopenDisclosureInline,
      reopenLeadCardVisible,
      reopenNearbyGridVisible,
      reopenStripCompact,
    }

    function isVisible(node) {
      const style = window.getComputedStyle(node)
      const rect = node.getBoundingClientRect()
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width > 0 &&
        rect.height > 0
      )
    }
  })
}

async function readHomeHiddenControlOwnershipMetrics(page) {
  return page.evaluate(() => {
    const controlDeck = document.querySelector('[aria-label="Compact organizer controls"]')
    const controlSeam = document.querySelector('[aria-label="Home control seam"]')
    const boardToolbar = document.querySelector('.recall-home-parity-toolbar-stage563')
    const organizerSpecificLabels = new Set(['Collections', 'Recent', 'Updated', 'Created', 'A-Z', 'Manual', 'Newest', 'Oldest', 'Collapse'])

    const visibleButtons = Array.from(document.querySelectorAll('button')).filter(
      (button) => button instanceof HTMLElement && isVisible(button),
    )
    const boardToolbarButtons =
      boardToolbar instanceof HTMLElement && isVisible(boardToolbar)
        ? Array.from(boardToolbar.querySelectorAll('button'))
            .filter((button) => button instanceof HTMLElement && isVisible(button))
            .map((button) => normalizeButtonLabel(button))
            .filter(Boolean)
        : []

    const organizerControlsInlineVisible = visibleButtons
      .map((button) => normalizeButtonLabel(button))
      .some((label) => organizerSpecificLabels.has(label))

    return {
      boardToolbarButtonLabels: boardToolbarButtons.join(' / '),
      boardToolbarButtons,
      boardToolbarVisible: boardToolbarButtons.length > 0,
      controlDeckVisible: controlDeck instanceof HTMLElement && isVisible(controlDeck),
      controlSeamVisible: controlSeam instanceof HTMLElement && isVisible(controlSeam),
      organizerControlsInlineVisible,
    }

    function isVisible(node) {
      const style = window.getComputedStyle(node)
      const rect = node.getBoundingClientRect()
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width > 0 &&
        rect.height > 0
      )
    }

    function normalizeButtonLabel(button) {
      const ariaLabel = button.getAttribute('aria-label')?.replace(/\s+/g, ' ').trim()
      if (ariaLabel === 'Search saved sources' || ariaLabel === 'New note') {
        return ariaLabel
      }

      const text = button.textContent?.replace(/\s+/g, ' ').trim() ?? ''
      if (!text) {
        return ''
      }
      if (text.startsWith('Sort')) {
        return 'Sort'
      }
      if (text === 'Add' || text === 'List') {
        return text
      }
      if (organizerSpecificLabels.has(text)) {
        return text
      }
      return text
    }
  })
}

async function capturePaddedLocatorScreenshot(page, locator, directory, filename, options = {}) {
  await locator.scrollIntoViewIfNeeded()
  await page.waitForTimeout(150)
  const box = await locator.boundingBox()
  if (!box) {
    throw new Error(`Could not resolve a bounding box for ${filename}.`)
  }
  return captureRectScreenshot(page, directory, filename, box, options)
}

async function captureRectScreenshot(page, directory, filename, rect, options = {}) {
  const viewport = page.viewportSize() ?? desktopViewport
  const paddingX = options.paddingX ?? 24
  const paddingY = options.paddingY ?? 24
  const minWidth = options.minWidth ?? 1
  const minHeight = options.minHeight ?? 1

  const x = Math.max(0, Math.floor(rect.x - paddingX))
  const y = Math.max(0, Math.floor(rect.y - paddingY))
  const width = Math.max(
    1,
    Math.min(
      Math.ceil(Math.max(rect.width + paddingX * 2, minWidth)),
      viewport.width - x,
    ),
  )
  const height = Math.max(
    1,
    Math.min(
      Math.ceil(Math.max(rect.height + paddingY * 2, minHeight)),
      viewport.height - y,
    ),
  )

  const screenshotPath = path.join(directory, filename)
  await page.screenshot({
    clip: {
      height,
      width,
      x,
      y,
    },
    path: screenshotPath,
  })
  return screenshotPath
}
