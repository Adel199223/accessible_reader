import {
  captureLocatorScreenshot,
  captureViewportScreenshot,
  desktopViewport,
  openGraph,
  openHome,
  openOriginalReaderFromHome,
} from './home_rendered_preview_quality_shared.mjs'
import { closeTourIfVisible } from './graph_recall_style_shared.mjs'

export const focusedViewport = { width: 820, height: 980 }

export async function captureStudyReviewDashboardEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  await openWideStudy(page, baseUrl)

  const dashboard = page.getByLabel('Study workspace header').first()
  const reviewSection = await getSectionByHeading(page, 'Review')
  const queueSection = page.getByLabel('Study queue support').first()
  const evidenceSection = page.getByLabel('Study evidence support').first()

  await Promise.all([
    dashboard.waitFor({ state: 'visible', timeout: 20000 }),
    reviewSection.waitFor({ state: 'visible', timeout: 20000 }),
    queueSection.waitFor({ state: 'visible', timeout: 20000 }),
    evidenceSection.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  await page.waitForTimeout(300)

  const openMetrics = await readWideStudyMetrics(page)
  if (!openMetrics.dashboardVisible) {
    throw new Error(`${stageLabel} expected the Study workspace header to be visible on open.`)
  }
  if (!openMetrics.currentReviewSummaryVisible) {
    throw new Error(`${stageLabel} expected the current review summary to stay visible above the review lane.`)
  }
  if (openMetrics.selectedStudyView !== 'Review') {
    throw new Error(`${stageLabel} expected Study to land on the Review view, found ${openMetrics.selectedStudyView}.`)
  }
  if (!openMetrics.dashboardMetricLabels.includes('Ready now') || !openMetrics.dashboardMetricLabels.includes('Scheduled')) {
    throw new Error(`${stageLabel} expected the Study dashboard metrics to expose the new queue labels.`)
  }
  if (openMetrics.reviewHeading !== 'Review') {
    throw new Error(`${stageLabel} expected the main review heading to be Review, found ${openMetrics.reviewHeading}.`)
  }
  if (!(openMetrics.reviewSectionWidth > openMetrics.supportColumnWidth)) {
    throw new Error(`${stageLabel} expected the review lane to remain wider than the questions lane.`)
  }
  if (openMetrics.studyTopStartDeadZoneVisible) {
    throw new Error(`${stageLabel} expected Study to retire the empty upper-left top-start dead zone.`)
  }
  if (!openMetrics.studyReviewLeadBandAboveFold) {
    throw new Error(`${stageLabel} expected the compact review lead band to be visible above the fold.`)
  }
  if (openMetrics.studyDashboardHeroShellVisible) {
    throw new Error(`${stageLabel} expected the old dashboard hero shell to be retired.`)
  }
  if (!openMetrics.studySupportDockTopAligned) {
    throw new Error(`${stageLabel} expected the Study support dock to align with the review lead band.`)
  }
  if (!openMetrics.studyReviewActiveCardPromptFirst) {
    throw new Error(`${stageLabel} expected Review to use one prompt-first active card.`)
  }
  if (!openMetrics.studyReviewActiveCardSingleSurface) {
    throw new Error(`${stageLabel} expected Review prompt, reveal, metadata, and heading to live inside one active card surface.`)
  }
  if (openMetrics.studyReviewPromptSurfaceCount !== 1) {
    throw new Error(`${stageLabel} expected exactly one visible Review prompt surface, found ${openMetrics.studyReviewPromptSurfaceCount}.`)
  }
  if (openMetrics.studyReviewNestedPromptPanelVisible) {
    throw new Error(`${stageLabel} expected the nested Review prompt panel shell to be retired.`)
  }
  if (openMetrics.studyReviewDetachedRevealBandVisible) {
    throw new Error(`${stageLabel} expected the pre-answer reveal action to be attached to the active card, not a detached band.`)
  }
  if (openMetrics.studyReviewDetachedManagerHeaderVisible) {
    throw new Error(`${stageLabel} expected the Review heading seam to be owned by the active card.`)
  }
  if (openMetrics.studyReviewLeadPromptDuplicateVisible) {
    throw new Error(`${stageLabel} expected the Study lead band to stop duplicating the active prompt.`)
  }
  if (openMetrics.studyReviewGlancePanelVisible) {
    throw new Error(`${stageLabel} expected the detached current-question glance panel to be retired.`)
  }
  if (openMetrics.studyReviewDuplicateRefreshControls) {
    throw new Error(`${stageLabel} expected one Review refresh control owned by the lead band.`)
  }
  if (openMetrics.studyReviewQueueDockUtilityStripVisible || openMetrics.studyReviewQueueDockEvidencePreviewVisible) {
    throw new Error(`${stageLabel} expected the queue support dock to stop owning duplicate evidence/refresh actions.`)
  }
  if (!openMetrics.studyLeadBandCommandRowCompact) {
    throw new Error(`${stageLabel} expected the Study lead band to use the compact Stage 858 command-row layout.`)
  }
  if (openMetrics.studyLeadMetricTilesVisible) {
    throw new Error(`${stageLabel} expected Study metrics to render as compact command-row pills, not dashboard tiles.`)
  }
  if (openMetrics.studyLeadCurrentSummaryCardVisible) {
    throw new Error(`${stageLabel} expected the current review summary to become an inline command-row seam.`)
  }
  if (openMetrics.studyLeadBandHeight > 150) {
    throw new Error(`${stageLabel} expected the Study command row to stay under 150px tall, found ${openMetrics.studyLeadBandHeight}.`)
  }
  if (openMetrics.studyReviewCardTopOffset > 185) {
    throw new Error(`${stageLabel} expected the active Review card to start higher after command-row compaction, found ${openMetrics.studyReviewCardTopOffset}.`)
  }
  if (!openMetrics.studySupportDockSingleRailCompact) {
    throw new Error(`${stageLabel} expected the Study support dock to render as one compact Stage 860 rail.`)
  }
  if (openMetrics.studySupportDockSeparateCardCount > 0) {
    throw new Error(`${stageLabel} expected the Study support rail to retire separate heavy support cards, found ${openMetrics.studySupportDockSeparateCardCount}.`)
  }
  if (openMetrics.studyReviewQueuePreviewAtRestCount > 1) {
    throw new Error(`${stageLabel} expected at most one upcoming Review queue preview at rest, found ${openMetrics.studyReviewQueuePreviewAtRestCount}.`)
  }
  if (openMetrics.studyGroundingHelperCopyVisible) {
    throw new Error(`${stageLabel} expected Grounding helper copy to be retired from the compact support rail.`)
  }
  if (!openMetrics.studyEvidenceReaderHandoffVisible) {
    throw new Error(`${stageLabel} expected the evidence rail to keep the Reader handoff visible.`)
  }
  if (!openMetrics.studyReviewTaskWorkbenchFused) {
    throw new Error(`${stageLabel} expected the Review command row and active card to share one task workbench.`)
  }
  if (!openMetrics.studyReviewCommandRowInsideWorkbench) {
    throw new Error(`${stageLabel} expected the compact Study command row to be owned by the Review task workbench.`)
  }
  if (openMetrics.studyReviewCommandToCardGap > 18) {
    throw new Error(`${stageLabel} expected the Review command row and active card gap to stay compact, found ${openMetrics.studyReviewCommandToCardGap}.`)
  }
  if (!openMetrics.studyReviewActiveCardPanelWeightReduced) {
    throw new Error(`${stageLabel} expected the active Review card to use the lighter Stage 882 panel treatment.`)
  }
  if (openMetrics.studyReviewSupportRailCompetingCardCount > 0) {
    throw new Error(`${stageLabel} expected the Study support rail to stop competing as separate cards, found ${openMetrics.studyReviewSupportRailCompetingCardCount}.`)
  }
  if (!openMetrics.studyReviewGroundingAttached) {
    throw new Error(`${stageLabel} expected Grounding to stay attached inside the lighter support rail.`)
  }

  const studyWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-study-wide-top.png`)
  const studyDashboardWideTop = await captureLocatorScreenshot(
    page,
    dashboard,
    directory,
    `${stagePrefix}-study-dashboard-wide-top.png`,
  )
  const studyReviewLaneWideTop = await captureLocatorScreenshot(
    page,
    reviewSection,
    directory,
    `${stagePrefix}-study-review-lane-wide-top.png`,
  )

  await page.getByRole('tab', { name: 'Questions', selected: false }).click()
  await page.getByRole('tab', { name: 'Questions', selected: true }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)

  const questionsManager = page.getByLabel('Study questions manager').first()
  const reviewHandoff = page.getByLabel('Study review handoff').first()
  await Promise.all([
    questionsManager.waitFor({ state: 'visible', timeout: 20000 }),
    reviewHandoff.waitFor({ state: 'visible', timeout: 20000 }),
  ])

  const questionMetrics = await readQuestionManagerMetrics(page)
  if (!questionMetrics.questionsSelected) {
    throw new Error(`${stageLabel} expected the Questions view to open when requested.`)
  }
  if (questionMetrics.questionManagerHeading !== 'Questions') {
    throw new Error(`${stageLabel} expected the fused Questions lead band heading, found ${questionMetrics.questionManagerHeading}.`)
  }
  if (questionMetrics.visibleQuestionCount < 1) {
    throw new Error(`${stageLabel} expected at least one visible question in the manager lane.`)
  }
  if (!questionMetrics.filterTabs.includes('Due')) {
    throw new Error(`${stageLabel} expected the questions manager to keep the filter tabs.`)
  }
  if (!questionMetrics.studyQuestionsViewPrimaryCanvasVisible) {
    throw new Error(`${stageLabel} expected Questions to render as the primary Study canvas.`)
  }
  if (questionMetrics.studyQuestionsViewReviewStageVisible) {
    throw new Error(`${stageLabel} expected Questions to retire the large Review stage from the main canvas.`)
  }
  if (questionMetrics.studyQuestionsSupportDockListVisible) {
    throw new Error(`${stageLabel} expected the Questions support dock to stop duplicating the full question list.`)
  }
  if (!questionMetrics.studyQuestionsReviewHandoffVisible) {
    throw new Error(`${stageLabel} expected Questions to keep a compact Review handoff in the support dock.`)
  }
  if (!questionMetrics.studyQuestionsActiveRowListState) {
    throw new Error(`${stageLabel} expected the active question row to use the flatter selected list state.`)
  }
  if (!questionMetrics.studyQuestionsViewTopStartCompact) {
    throw new Error(`${stageLabel} expected the Questions view to keep the compact top-start Study lead band.`)
  }
  if (!questionMetrics.studyQuestionsManagerTopStartCompact) {
    throw new Error(`${stageLabel} expected the Questions manager to start directly below the Study lead band.`)
  }
  if (!questionMetrics.studyQuestionsLeadActionsVisible) {
    throw new Error(`${stageLabel} expected the fused Questions lead band to own the view toggle and refresh action.`)
  }
  if (questionMetrics.studyQuestionsLeadBandDuplicated) {
    throw new Error(`${stageLabel} expected only one visible Questions h2 after lead-band fusion.`)
  }
  if (questionMetrics.studyQuestionsManagerHeaderDuplicated) {
    throw new Error(`${stageLabel} expected the duplicate Questions manager header/actions to be retired.`)
  }
  if (questionMetrics.studyQuestionsDuplicateRefreshControls) {
    throw new Error(`${stageLabel} expected a single Refresh control in Questions view.`)
  }
  if (questionMetrics.studyQuestionsSelectedSummaryCanvasVisible) {
    throw new Error(`${stageLabel} expected the canvas-level selected question summary block to be retired.`)
  }
  if (!questionMetrics.studyQuestionsFiltersStartUnderLeadBand) {
    throw new Error(`${stageLabel} expected Questions filters to begin directly under the fused lead band.`)
  }
  if (!questionMetrics.studyQuestionsLeadBandCommandRowCompact) {
    throw new Error(`${stageLabel} expected Questions to reuse the compact Study command row.`)
  }
  if (questionMetrics.studyQuestionsFiltersTopOffset > 185) {
    throw new Error(`${stageLabel} expected Questions filters to start higher under the compact command row, found ${questionMetrics.studyQuestionsFiltersTopOffset}.`)
  }
  if (!questionMetrics.studySupportDockSingleRailCompact) {
    throw new Error(`${stageLabel} expected Questions support to share the single compact Study rail.`)
  }
  if (questionMetrics.studySupportDockSeparateCardCount > 0) {
    throw new Error(`${stageLabel} expected Questions support to retire separate heavy support cards, found ${questionMetrics.studySupportDockSeparateCardCount}.`)
  }
  if (!questionMetrics.studyQuestionsReviewHandoffCompact) {
    throw new Error(`${stageLabel} expected Questions Review handoff to be a compact seam.`)
  }
  if (questionMetrics.studyGroundingHelperCopyVisible) {
    throw new Error(`${stageLabel} expected Questions Grounding helper copy to stay retired.`)
  }
  if (!questionMetrics.studyEvidenceReaderHandoffVisible) {
    throw new Error(`${stageLabel} expected Questions Grounding to keep the Reader handoff visible.`)
  }

  const studyQuestionsWideTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-questions-wide-top.png`,
  )
  const studyQuestionsManagerWideTop = await captureLocatorScreenshot(
    page,
    questionsManager,
    directory,
    `${stagePrefix}-study-questions-manager-wide-top.png`,
  )
  const studyReviewHandoffWideTop = await captureLocatorScreenshot(
    page,
    reviewHandoff,
    directory,
    `${stagePrefix}-study-review-handoff-wide-top.png`,
  )
  const studyQuestionsSupportWideTop = studyReviewHandoffWideTop

  await page.getByRole('tab', { name: 'Review', selected: false }).click()
  await page.getByRole('tab', { name: 'Review', selected: true }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)

  await revealStudyAnswer(page)

  const answerMetrics = await readWideStudyAnswerMetrics(page)
  if (!answerMetrics.goodRatingVisible) {
    throw new Error(`${stageLabel} expected the answer-shown state to expose the rating row.`)
  }
  if (!answerMetrics.studyReviewAnswerAttachedToCard) {
    throw new Error(`${stageLabel} expected the answer to stay attached to the active Review card.`)
  }
  if (!answerMetrics.studyReviewRatingAttachedToCard) {
    throw new Error(`${stageLabel} expected the rating controls to stay attached to the active Review card.`)
  }
  if (answerMetrics.evidenceHeading !== 'Evidence') {
    throw new Error(`${stageLabel} expected the evidence dock to expand into Evidence after reveal, found ${answerMetrics.evidenceHeading}.`)
  }
  if (!answerMetrics.studyEvidenceReaderHandoffVisible) {
    throw new Error(`${stageLabel} expected answer-shown Evidence to keep the Reader handoff visible.`)
  }
  if (answerMetrics.studyGroundingHelperCopyVisible) {
    throw new Error(`${stageLabel} expected answer-shown Evidence helper copy to stay retired.`)
  }

  const studyAnswerShownWideTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-answer-shown-wide-top.png`,
  )
  const studyAnswerShownReviewLaneWideTop = await captureLocatorScreenshot(
    page,
    reviewSection,
    directory,
    `${stagePrefix}-study-answer-shown-review-lane-wide-top.png`,
  )
  const studyEvidenceSupportWideTop = await captureLocatorScreenshot(
    page,
    evidenceSection,
    directory,
    `${stagePrefix}-study-evidence-support-wide-top.png`,
  )

  return {
    captures: {
      studyAnswerShownReviewLaneWideTop,
      studyAnswerShownWideTop,
      studyDashboardWideTop,
      studyEvidenceSupportWideTop,
      studyQuestionsManagerWideTop,
      studyQuestionsWideTop,
      studyReviewHandoffWideTop,
      studyQuestionsSupportWideTop,
      studyReviewLaneWideTop,
      studyWideTop,
    },
    metrics: {
      ...openMetrics,
      ...questionMetrics,
      ...answerMetrics,
    },
  }
}

export async function captureFocusedStudyEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const { sourceTitle } = await openFocusedStudy(page, baseUrl)

  const focusedMetrics = await page.evaluate(() => {
    const queueHeading = Array.from(document.querySelectorAll('h2, h3')).find(
      (heading) => heading.textContent?.replace(/\s+/g, ' ').trim() === 'Study queue',
    )
    const activeCardHeading = Array.from(document.querySelectorAll('h2, h3')).find(
      (heading) => heading.textContent?.replace(/\s+/g, ' ').trim() === 'Active card',
    )
    const readerHeading = Array.from(document.querySelectorAll('h2, h3')).find(
      (heading) => heading.textContent?.replace(/\s+/g, ' ').trim() === 'Reader',
    )
    const evidenceButton = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent?.replace(/\s+/g, ' ').trim() === 'Preview evidence',
    )
    return {
      activeCardVisible: Boolean(activeCardHeading),
      previewEvidenceVisible: Boolean(evidenceButton),
      readerVisible: Boolean(readerHeading),
      studyQueueVisible: Boolean(queueHeading),
    }
  })

  if (!focusedMetrics.studyQueueVisible || !focusedMetrics.activeCardVisible || !focusedMetrics.readerVisible) {
    throw new Error(`${stageLabel} expected the focused Study split to keep queue, active card, and Reader visible.`)
  }

  const focusedStudyNarrowTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-focused-study-narrow-top.png`,
  )

  await revealStudyAnswer(page)

  const focusedAnswerMetrics = await page.evaluate(() => {
    const ratingLabels = Array.from(document.querySelectorAll('button'))
      .map((button) => button.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)
    return {
      focusedGoodRatingVisible: ratingLabels.includes('Good'),
    }
  })
  if (!focusedAnswerMetrics.focusedGoodRatingVisible) {
    throw new Error(`${stageLabel} expected the focused Study split to keep the answer rating controls after reveal.`)
  }

  const focusedStudyAnswerShownNarrowTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-focused-study-answer-shown-narrow-top.png`,
  )

  return {
    captures: {
      focusedStudyAnswerShownNarrowTop,
      focusedStudyNarrowTop,
    },
    metrics: {
      focusedStudySourceTitle: sourceTitle,
      ...focusedMetrics,
      ...focusedAnswerMetrics,
    },
  }
}

export async function captureStudyRegressionEvidence({
  baseUrl,
  directory,
  graphPage,
  homePage,
  notebookPage,
  readerPage,
  stagePrefix,
}) {
  await openHome(homePage, baseUrl)
  const homeWideTop = await captureViewportScreenshot(homePage, directory, `${stagePrefix}-home-wide-top.png`)

  await openGraph(graphPage, baseUrl)
  await closeTourIfVisible(graphPage)
  await graphPage.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  const graphWideTop = await captureViewportScreenshot(graphPage, directory, `${stagePrefix}-graph-wide-top.png`)

  const notebookResponse = await notebookPage.goto(`${baseUrl}/recall?section=notes`, { waitUntil: 'networkidle' })
  if (!notebookResponse || !notebookResponse.ok()) {
    throw new Error(`Notebook regression navigation failed with status ${notebookResponse?.status() ?? 'unknown'}.`)
  }
  await notebookPage.getByRole('heading', { name: 'Notebook', exact: true }).waitFor({ state: 'visible', timeout: 20000 })
  const notebookWideTop = await captureViewportScreenshot(
    notebookPage,
    directory,
    `${stagePrefix}-notebook-wide-top.png`,
  )

  const readerEvidence = await openOriginalReaderFromHome(readerPage, directory, `${stagePrefix}-reader`, baseUrl)

  const metrics = await Promise.all([
    homePage.evaluate(() => ({
      homeVisible: document.querySelector('.recall-home-workspace') instanceof HTMLElement,
    })),
    graphPage.evaluate(() => ({
      graphCanvasVisible: document.querySelector('[aria-label="Knowledge graph canvas"]') instanceof HTMLElement,
    })),
    notebookPage.evaluate(() => ({
      notebookVisible: Boolean(Array.from(document.querySelectorAll('h1, h2, h3')).find((heading) => heading.textContent?.trim() === 'Notebook')),
      notesSidebarVisible: Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
        (tab) => tab.textContent?.replace(/\s+/g, ' ').trim() === 'Notes',
      ),
    })),
  ])

  return {
    captures: {
      graphWideTop,
      homeWideTop,
      notebookWideTop,
      readerOriginalWideTop: readerEvidence.capture,
    },
    metrics: {
      homeVisible: metrics[0].homeVisible,
      graphCanvasVisible: metrics[1].graphCanvasVisible,
      notebookVisible: metrics[2].notebookVisible,
      notesSidebarVisible: metrics[2].notesSidebarVisible,
      originalReaderSourceTitle: readerEvidence.sourceTitle,
    },
  }
}

async function openWideStudy(page, baseUrl) {
  const response = await page.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Study navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.getByRole('heading', { name: 'Review', exact: true, level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByLabel('Study workspace header').waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function openFocusedStudy(page, baseUrl) {
  const { sourceTitle } = await openSourceWorkspaceFromHome(page, baseUrl)
  await page.getByRole('tab', { name: 'Source workspace Study' }).click()
  await page.getByRole('heading', { name: 'Study queue', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
  return { sourceTitle }
}

async function openSourceWorkspaceFromHome(page, baseUrl) {
  await openHome(page, baseUrl)
  const sourceButton = await getVisibleLocator(page, [
    '.recall-home-parity-card-stage563',
    '.recall-home-parity-list-row-stage563',
    'button[aria-label^="Open "]',
    '.recall-home-lead-card button',
    '.recall-home-continue-row',
    '.recall-library-list-row',
    '.recall-library-home-primary-card',
  ])

  const sourceTitle = await getSourceTitle(sourceButton)
  await sourceButton.click()
  await page.getByRole('region', { name: `${sourceTitle} workspace` }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)

  return { sourceTitle }
}

async function revealStudyAnswer(page) {
  const answerButtons = [
    page.getByRole('button', { name: 'Show answer' }).first(),
    page.getByRole('button', { name: 'Reveal answer' }).first(),
  ]

  for (const answerButton of answerButtons) {
    if (await answerButton.isVisible().catch(() => false)) {
      await answerButton.click()
      break
    }
  }

  await page.getByRole('button', { name: 'Good' }).first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
}

async function readWideStudyMetrics(page) {
  return page.evaluate(() => {
    const compactText = (node) => node?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
    const dashboard = document.querySelector('[aria-label="Study workspace header"]')
    const currentSummary = document.querySelector('[aria-label="Current review summary"]')
    const queueSection = document.querySelector('[aria-label="Study queue support"]')
    const evidenceSection = document.querySelector('[aria-label="Study evidence support"]')
    const activeReviewCard = document.querySelector('[aria-label="Active review card"]')
    const singleReviewSurface = document.querySelector('[data-study-review-single-surface-stage862="true"]')
    const reviewTaskWorkbench = document.querySelector('[data-study-review-task-workbench-stage882="true"]')
    const promptSurface = document.querySelector('[data-study-review-prompt-surface-stage856="true"]')
    const oldGlancePanel = document.querySelector('.recall-study-review-glance')
    const oldPromptPanel = document.querySelector('.recall-study-review-prompt-panel')
    const oldPromptCard = document.querySelector('.recall-study-review-prompt-card')
    const oldRevealBand = document.querySelector('.recall-study-review-reveal-band')
    const oldReviewFlow = document.querySelector('[aria-label="Study review flow"]')
    const reviewManagerHeader = document.querySelector('.recall-study-review-card-head')
    const reviewHeaderDetached =
      reviewManagerHeader instanceof HTMLElement &&
      (!reviewManagerHeader.hasAttribute('data-study-review-card-top-seam-stage862') ||
        reviewManagerHeader.closest('[data-study-review-single-surface-stage862="true"]') !== singleReviewSurface)
    const revealActionAttached =
      document
        .querySelector('[data-study-review-reveal-attached-stage862="true"]')
        ?.closest('[data-study-review-single-surface-stage862="true"]') === singleReviewSurface
    const promptText = compactText(promptSurface?.querySelector('p'))
    const dashboardText = compactText(dashboard)
    const leadPromptDuplicateVisible = Boolean(promptText && dashboardText.includes(promptText))
    const refreshButtonCount = Array.from(document.querySelectorAll('.recall-study-workspace button')).filter((button) => {
      const label = button.getAttribute('aria-label') ?? button.textContent ?? ''
      return /refresh(?:ing)? cards|^refresh(?:ing)?$/i.test(label.replace(/\s+/g, ' ').trim())
    }).length
    const queueButtons = Array.from(queueSection?.querySelectorAll('button') ?? [])
    const queueDockEvidencePreviewVisible = queueButtons.some(
      (button) => compactText(button) === 'Preview evidence' || button.getAttribute('aria-label') === 'Preview evidence',
    )
    const queueDockRefreshVisible = queueButtons.some((button) => {
      const label = button.getAttribute('aria-label') ?? button.textContent ?? ''
      return /refresh(?:ing)? cards|^refresh(?:ing)?$/i.test(label.replace(/\s+/g, ' ').trim())
    })
    const promptSurfaceCount = [
      promptSurface instanceof HTMLElement,
      leadPromptDuplicateVisible,
      oldGlancePanel instanceof HTMLElement,
      oldPromptPanel instanceof HTMLElement,
      oldPromptCard instanceof HTMLElement,
    ].filter(Boolean).length
    const reviewHeading = Array.from(document.querySelectorAll('h2')).find(
      (heading) => heading.textContent?.replace(/\s+/g, ' ').trim() === 'Review',
    )
    const metricLabels = Array.from(document.querySelectorAll('.recall-study-dashboard-metric-label'))
      .map((node) => node.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)
    const leadMetricTilesVisible = Array.from(dashboard?.querySelectorAll('.recall-study-dashboard-metric') ?? []).some(
      (node) => !node.hasAttribute('data-study-lead-metric-pill-stage858'),
    )
    const leadCurrentSummaryCardVisible =
      currentSummary instanceof HTMLElement && !currentSummary.classList.contains('recall-study-command-status-stage858')
    const selectedStudyView =
      Array.from(document.querySelectorAll('[aria-label="Study views"] [role="tab"]'))
        .find((tab) => tab.getAttribute('aria-selected') === 'true')
        ?.textContent?.replace(/\s+/g, ' ').trim() ?? null
    const queueHeading =
      queueSection?.querySelector('h3')?.textContent?.replace(/\s+/g, ' ').trim() ?? null
    const evidenceHeading =
      evidenceSection?.querySelector('h3')?.textContent?.replace(/\s+/g, ' ').trim() ?? null
    const reviewSection = reviewHeading?.closest('section')
    const dashboardRect = dashboard instanceof HTMLElement ? dashboard.getBoundingClientRect() : null
    const reviewRect = reviewSection instanceof HTMLElement ? reviewSection.getBoundingClientRect() : null
    const queueRect = queueSection instanceof HTMLElement ? queueSection.getBoundingClientRect() : null
    const evidenceRect = evidenceSection instanceof HTMLElement ? evidenceSection.getBoundingClientRect() : null
    const workspace = document.querySelector('.recall-study-workspace')
    const supportDock = document.querySelector('.recall-study-support-dock')
    const workspaceRect = workspace instanceof HTMLElement ? workspace.getBoundingClientRect() : null
    const supportDockRect = supportDock instanceof HTMLElement ? supportDock.getBoundingClientRect() : null
    const workbenchRect = reviewTaskWorkbench instanceof HTMLElement ? reviewTaskWorkbench.getBoundingClientRect() : null
    const supportDockSingleRail =
      supportDock instanceof HTMLElement && supportDock.getAttribute('data-study-support-single-rail-stage860') === 'true'
    const supportDockSeparateCardCount = supportDockSingleRail
      ? 0
      : Array.from(supportDock?.children ?? []).filter((node) => node instanceof HTMLElement && node.classList.contains('card')).length
    const supportRailStage882 =
      supportDock instanceof HTMLElement && supportDock.getAttribute('data-study-review-support-rail-stage882') === 'true'
    const queueAttachedStage882 =
      queueSection instanceof HTMLElement && queueSection.getAttribute('data-study-review-queue-attached-stage882') === 'true'
    const groundingAttachedStage882 =
      evidenceSection instanceof HTMLElement && evidenceSection.getAttribute('data-study-review-grounding-attached-stage882') === 'true'
    const commandRowInsideWorkbench =
      dashboard instanceof HTMLElement &&
      dashboard.getAttribute('data-study-review-command-inside-workbench-stage882') === 'true' &&
      dashboard.closest('[data-study-review-task-workbench-stage882="true"]') === reviewTaskWorkbench
    const activeCardPanelReduced =
      activeReviewCard instanceof HTMLElement &&
      activeReviewCard.getAttribute('data-study-review-active-card-panel-reduced-stage882') === 'true' &&
      activeReviewCard.closest('[data-study-review-task-workbench-stage882="true"]') === reviewTaskWorkbench
    const commandToCardGap =
      dashboardRect && reviewRect ? Math.max(0, reviewRect.top - dashboardRect.bottom) : Number.POSITIVE_INFINITY
    const supportRailCompetingCardCount =
      supportRailStage882 && queueAttachedStage882 && groundingAttachedStage882
        ? 0
        : Array.from(supportDock?.children ?? []).filter((node) => node instanceof HTMLElement && node.classList.contains('card')).length
    const reviewQueuePreviewAtRestCount = queueSection?.querySelectorAll('.recall-study-queue-preview-row').length ?? 0
    const groundingHelperCopyVisible = Array.from(evidenceSection?.querySelectorAll('.recall-study-dock-heading p') ?? []).some(
      (node) => node instanceof HTMLElement && node.getClientRects().length > 0 && compactText(node).length > 0,
    )
    const evidenceReaderHandoffVisible =
      evidenceSection?.querySelector('.recall-study-evidence-reader-button') instanceof HTMLElement
    const dashboardTopOffset = dashboardRect && workspaceRect ? dashboardRect.top - workspaceRect.top : 0
    const reviewStageTopOffset = reviewRect && workspaceRect ? reviewRect.top - workspaceRect.top : 0
    const supportDockTopDelta =
      dashboardRect && supportDockRect ? Math.abs(supportDockRect.top - dashboardRect.top) : Number.POSITIVE_INFINITY
    const dashboardHeroShellVisible =
      dashboard instanceof HTMLElement &&
      (dashboard.classList.contains('priority-surface-stage-shell') || (dashboardRect?.height ?? 0) > 260)

    return {
      currentReviewSummaryVisible: currentSummary instanceof HTMLElement,
      dashboardHeight: dashboardRect?.height ?? 0,
      dashboardHeroShellVisible,
      dashboardMetricLabels: metricLabels,
      dashboardVisible: dashboard instanceof HTMLElement,
      evidenceHeading,
      noLegacyReviewCardHeading: !Array.from(document.querySelectorAll('h2')).some(
        (heading) => heading.textContent?.replace(/\s+/g, ' ').trim() === 'Review card',
      ),
      queueHeading,
      queueSectionWidth: queueRect?.width ?? 0,
      reviewHeading: reviewHeading?.textContent?.replace(/\s+/g, ' ').trim() ?? null,
      reviewSectionWidth: reviewRect?.width ?? 0,
      selectedStudyView,
      studyDashboardHeroShellVisible: dashboardHeroShellVisible,
      studyLeadBandCommandRowCompact:
        dashboard instanceof HTMLElement &&
        dashboard.hasAttribute('data-study-lead-command-row-stage858') &&
        (dashboardRect?.height ?? Number.POSITIVE_INFINITY) <= 150 &&
        !leadMetricTilesVisible &&
        !leadCurrentSummaryCardVisible,
      studyLeadBandHeight: dashboardRect?.height ?? 0,
      studyLeadCurrentSummaryCardVisible: leadCurrentSummaryCardVisible,
      studyLeadMetricTilesVisible: leadMetricTilesVisible,
      studyReviewActiveCardPromptFirst:
        activeReviewCard instanceof HTMLElement &&
        promptSurface instanceof HTMLElement &&
        activeReviewCard.contains(promptSurface) &&
        !(oldGlancePanel instanceof HTMLElement) &&
        !(oldPromptPanel instanceof HTMLElement) &&
        !(oldPromptCard instanceof HTMLElement) &&
        !(oldReviewFlow instanceof HTMLElement),
      studyReviewActiveCardSingleSurface:
        activeReviewCard instanceof HTMLElement &&
        singleReviewSurface instanceof HTMLElement &&
        activeReviewCard === singleReviewSurface &&
        activeReviewCard.contains(promptSurface) &&
        revealActionAttached &&
        !reviewHeaderDetached &&
        !(oldPromptPanel instanceof HTMLElement) &&
        !(oldPromptCard instanceof HTMLElement) &&
        !(oldRevealBand instanceof HTMLElement),
      studyReviewActiveCardPanelWeightReduced: activeCardPanelReduced,
      studyReviewCommandRowInsideWorkbench: commandRowInsideWorkbench,
      studyReviewCommandToCardGap: commandToCardGap,
      studyReviewDetachedManagerHeaderVisible: reviewHeaderDetached,
      studyReviewDetachedRevealBandVisible: oldRevealBand instanceof HTMLElement,
      studyReviewDuplicateRefreshControls: refreshButtonCount > 1,
      studyReviewGlancePanelVisible: oldGlancePanel instanceof HTMLElement,
      studyReviewLeadBandAboveFold:
        Boolean(dashboardRect) && (dashboardRect?.top ?? 0) < window.innerHeight * 0.35 && (dashboardRect?.bottom ?? 0) < window.innerHeight,
      studyReviewLeadPromptDuplicateVisible: leadPromptDuplicateVisible,
      studyReviewNestedPromptPanelVisible: oldPromptPanel instanceof HTMLElement || oldPromptCard instanceof HTMLElement,
      studyReviewPromptSurfaceCount: promptSurfaceCount,
      studyReviewQueueDockEvidencePreviewVisible: queueDockEvidencePreviewVisible,
      studyReviewQueueDockUtilityStripVisible: queueDockEvidencePreviewVisible || queueDockRefreshVisible,
      studyReviewQueuePreviewAtRestCount: reviewQueuePreviewAtRestCount,
      studyReviewGroundingAttached:
        supportRailStage882 &&
        groundingAttachedStage882 &&
        evidenceSection instanceof HTMLElement &&
        evidenceSection.closest('[data-study-review-support-rail-stage882="true"]') === supportDock,
      studyReviewSupportRailCompetingCardCount: supportRailCompetingCardCount,
      studyReviewTaskWorkbenchFused:
        reviewTaskWorkbench instanceof HTMLElement &&
        commandRowInsideWorkbench &&
        activeCardPanelReduced &&
        Boolean(workbenchRect) &&
        commandToCardGap <= 18,
      studySupportDockSeparateCardCount: supportDockSeparateCardCount,
      studySupportDockSingleRailCompact:
        supportDockSingleRail &&
        supportDockSeparateCardCount === 0 &&
        reviewQueuePreviewAtRestCount <= 1 &&
        !groundingHelperCopyVisible &&
        evidenceReaderHandoffVisible,
      studyReviewCardTopOffset: reviewStageTopOffset,
      studyReviewStageTopOffset: reviewStageTopOffset,
      studyGroundingHelperCopyVisible: groundingHelperCopyVisible,
      studyEvidenceReaderHandoffVisible: evidenceReaderHandoffVisible,
      studySupportDockTopAligned: supportDockTopDelta <= 36,
      studyTopStartDeadZoneVisible: dashboardTopOffset > 84 || reviewStageTopOffset > 390,
      supportColumnWidth: Math.max(queueRect?.width ?? 0, evidenceRect?.width ?? 0),
    }
  })
}

async function readQuestionManagerMetrics(page) {
  return page.evaluate(() => {
    const questionsManager = document.querySelector('[aria-label="Study questions manager"]')
    const reviewHandoff = document.querySelector('[aria-label="Study review handoff"]')
    const queueSection = document.querySelector('[aria-label="Study queue support"]')
    const evidenceSection = document.querySelector('[aria-label="Study evidence support"]')
    const dashboard = document.querySelector('[aria-label="Study workspace header"]')
    const questionsLeadActions = document.querySelector('[aria-label="Questions lead actions"]')
    const filters = questionsManager?.querySelector('[aria-label="Study filters"]')
    const managerToolbar = questionsManager?.querySelector('.recall-study-questions-toolbar')
    const selectedSummary = questionsManager?.querySelector('[aria-label="Selected question summary"]')
    const filterTabs = Array.from(questionsManager?.querySelectorAll('[aria-label="Study filters"] [role="tab"]') ?? [])
      .map((tab) => tab.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)
    const selectedStudyView =
      Array.from(document.querySelectorAll('[aria-label="Study views"] [role="tab"]'))
        .find((tab) => tab.getAttribute('aria-selected') === 'true')
        ?.textContent?.replace(/\s+/g, ' ').trim() ?? null
    const workspace = document.querySelector('.recall-study-workspace')
    const dashboardRect = dashboard instanceof HTMLElement ? dashboard.getBoundingClientRect() : null
    const managerRect = questionsManager instanceof HTMLElement ? questionsManager.getBoundingClientRect() : null
    const filtersRect = filters instanceof HTMLElement ? filters.getBoundingClientRect() : null
    const workspaceRect = workspace instanceof HTMLElement ? workspace.getBoundingClientRect() : null
    const dashboardTopOffset = dashboardRect && workspaceRect ? dashboardRect.top - workspaceRect.top : Number.POSITIVE_INFINITY
    const managerTopOffset = managerRect && workspaceRect ? managerRect.top - workspaceRect.top : Number.POSITIVE_INFINITY
    const filtersTopOffset = filtersRect && workspaceRect ? filtersRect.top - workspaceRect.top : Number.POSITIVE_INFINITY
    const filtersStartDelta = filtersRect && dashboardRect ? filtersRect.top - dashboardRect.bottom : Number.POSITIVE_INFINITY
    const leadMetricTilesVisible = Array.from(dashboard?.querySelectorAll('.recall-study-dashboard-metric') ?? []).some(
      (node) => !node.hasAttribute('data-study-lead-metric-pill-stage858'),
    )
    const leadCurrentSummaryCardVisible =
      questionsLeadActions instanceof HTMLElement && !questionsLeadActions.classList.contains('recall-study-command-status-stage858')
    const supportDock = document.querySelector('.recall-study-support-dock')
    const supportDockSingleRail =
      supportDock instanceof HTMLElement && supportDock.getAttribute('data-study-support-single-rail-stage860') === 'true'
    const supportDockSeparateCardCount = supportDockSingleRail
      ? 0
      : Array.from(supportDock?.children ?? []).filter((node) => node instanceof HTMLElement && node.classList.contains('card')).length
    const groundingHelperCopyVisible = Array.from(evidenceSection?.querySelectorAll('.recall-study-dock-heading p') ?? []).some(
      (node) => node instanceof HTMLElement && node.getClientRects().length > 0 && (node.textContent?.replace(/\s+/g, ' ').trim() ?? '').length > 0,
    )
    const evidenceReaderHandoffVisible =
      evidenceSection?.querySelector('.recall-study-evidence-reader-button') instanceof HTMLElement
    const reviewHandoffCompact =
      reviewHandoff instanceof HTMLElement && reviewHandoff.classList.contains('recall-study-review-handoff-compact-stage860')
    const questionHeadings = Array.from(document.querySelectorAll('h2')).filter(
      (heading) => heading.textContent?.replace(/\s+/g, ' ').trim() === 'Questions',
    )
    const refreshButtonCount = Array.from(document.querySelectorAll('.recall-study-workspace button')).filter((button) => {
      const label = button.getAttribute('aria-label') ?? button.textContent ?? ''
      return /refresh(?:ing)? cards|^refresh(?:ing)?/i.test(label.replace(/\s+/g, ' ').trim())
    }).length
    return {
      filterTabs,
      questionManagerHeading:
        dashboard?.querySelector('h2')?.textContent?.replace(/\s+/g, ' ').trim() ?? null,
      questionsSelected: selectedStudyView === 'Questions',
      studyQuestionsActiveRowListState:
        document.querySelector('[data-study-questions-active-row-stage852="true"].recall-study-questions-row-active') instanceof HTMLElement,
      studyQuestionsCanvasTopOffset: managerTopOffset,
      studyQuestionsDuplicateRefreshControls: refreshButtonCount > 1,
      studyQuestionsFiltersStartUnderLeadBand:
        Boolean(filtersRect) && Boolean(dashboardRect) && filtersStartDelta >= 0 && filtersStartDelta <= 72,
      studyQuestionsFiltersTopOffset: filtersTopOffset,
      studyQuestionsLeadBandCommandRowCompact:
        dashboard instanceof HTMLElement &&
        dashboard.hasAttribute('data-study-lead-command-row-stage858') &&
        (dashboardRect?.height ?? Number.POSITIVE_INFINITY) <= 150 &&
        !leadMetricTilesVisible &&
        !leadCurrentSummaryCardVisible,
      studyQuestionsLeadBandHeight: dashboardRect?.height ?? 0,
      studyQuestionsLeadBandDuplicated: questionHeadings.length > 1,
      studyQuestionsManagerHeaderDuplicated:
        managerToolbar instanceof HTMLElement || questionsManager?.querySelector('h2') instanceof HTMLElement,
      studyQuestionsManagerTopStartCompact:
        managerTopOffset <= 330 && Boolean(managerRect) && (managerRect?.top ?? 0) < window.innerHeight * 0.48,
      studyQuestionsReviewHandoffCompact: reviewHandoffCompact,
      studyQuestionsReviewHandoffVisible: reviewHandoff instanceof HTMLElement,
      studyQuestionsSelectedSummaryCanvasVisible: selectedSummary instanceof HTMLElement,
      studyQuestionsSupportDockListVisible:
        Boolean(reviewHandoff?.querySelector('.recall-study-queue-dock-list')) ||
        Boolean(queueSection?.querySelector('.recall-study-queue-dock-list')),
      studyQuestionsViewPrimaryCanvasVisible: questionsManager instanceof HTMLElement,
      studyQuestionsViewReviewStageVisible: document.querySelector('.recall-study-review-stage') instanceof HTMLElement,
      studyQuestionsViewTopStartCompact:
        dashboardTopOffset <= 84 && Boolean(dashboardRect) && (dashboardRect?.bottom ?? 0) < window.innerHeight * 0.46,
      studyQuestionsLeadActionsVisible: questionsLeadActions instanceof HTMLElement,
      studySupportDockSeparateCardCount: supportDockSeparateCardCount,
      studySupportDockSingleRailCompact:
        supportDockSingleRail &&
        supportDockSeparateCardCount === 0 &&
        reviewHandoffCompact &&
        !groundingHelperCopyVisible &&
        evidenceReaderHandoffVisible,
      studyGroundingHelperCopyVisible: groundingHelperCopyVisible,
      studyEvidenceReaderHandoffVisible: evidenceReaderHandoffVisible,
      visibleQuestionCount: questionsManager?.querySelectorAll('.recall-study-questions-row').length ?? 0,
    }
  })
}

async function readWideStudyAnswerMetrics(page) {
  return page.evaluate(() => {
    const singleReviewSurface = document.querySelector('[data-study-review-single-surface-stage862="true"]')
    const attachedAnswer = document.querySelector('[data-study-review-answer-attached-stage862="true"]')
    const attachedRating = document.querySelector('[data-study-review-rating-attached-stage862="true"]')
    const evidenceSection = document.querySelector('[aria-label="Study evidence support"]')
    const oldAnswerPanel = document.querySelector('.recall-study-review-answer-panel')
    const oldRatingBand = document.querySelector('.recall-study-review-rating-band')
    const oldRevealBand = document.querySelector('.recall-study-review-reveal-band')
    const ratingLabels = Array.from(document.querySelectorAll('.recall-study-review-rating-row button'))
      .map((button) => button.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)
    const groundingHelperCopyVisible = Array.from(evidenceSection?.querySelectorAll('.recall-study-dock-heading p') ?? []).some(
      (node) => node instanceof HTMLElement && node.getClientRects().length > 0 && (node.textContent?.replace(/\s+/g, ' ').trim() ?? '').length > 0,
    )
    return {
      evidenceHeading:
        evidenceSection?.querySelector('h3')?.textContent?.replace(/\s+/g, ' ').trim() ?? null,
      goodRatingVisible: ratingLabels.includes('Good'),
      ratingLabels,
      studyEvidenceReaderHandoffVisible:
        evidenceSection?.querySelector('.recall-study-evidence-reader-button') instanceof HTMLElement,
      studyGroundingHelperCopyVisible: groundingHelperCopyVisible,
      studyReviewAnswerAttachedToCard:
        attachedAnswer instanceof HTMLElement &&
        attachedAnswer.closest('[data-study-review-single-surface-stage862="true"]') === singleReviewSurface &&
        !(oldAnswerPanel instanceof HTMLElement),
      studyReviewDetachedRevealBandVisible: oldRevealBand instanceof HTMLElement,
      studyReviewRatingAttachedToCard:
        attachedRating instanceof HTMLElement &&
        attachedRating.closest('[data-study-review-single-surface-stage862="true"]') === singleReviewSurface &&
        !(oldRatingBand instanceof HTMLElement),
    }
  })
}

async function getSectionByHeading(page, headingName, level = 2) {
  const heading = page.getByRole('heading', { name: headingName, exact: true, level }).first()
  await heading.waitFor({ state: 'visible', timeout: 20000 })
  return heading.locator('xpath=ancestor::section[1]')
}

async function getVisibleLocator(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first()
    if ((await locator.count()) === 0) {
      continue
    }
    if (await locator.isVisible().catch(() => false)) {
      return locator
    }
    await locator.waitFor({ state: 'visible', timeout: 20000 }).catch(() => undefined)
    if (await locator.isVisible().catch(() => false)) {
      return locator
    }
  }
  throw new Error(`None of the expected selectors became visible: ${selectors.join(', ')}`)
}

async function getSourceTitle(locator) {
  const ariaLabel = (await locator.getAttribute('aria-label'))?.trim()
  if (ariaLabel) {
    const strippedOpen = ariaLabel.replace(/^Open\s+/i, '').trim()
    if (strippedOpen && strippedOpen !== ariaLabel) {
      return strippedOpen
    }
  }

  const strong = locator.locator('strong').first()
  if ((await strong.count()) > 0) {
    const strongText = (await strong.textContent())?.trim()
    if (strongText) {
      return strongText
    }
  }

  const text = (await locator.textContent())?.trim()
  return text || 'Source'
}

export { desktopViewport }
