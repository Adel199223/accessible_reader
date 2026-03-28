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

  const questionMetrics = await readQuestionManagerMetrics(page)
  if (!questionMetrics.questionsSelected) {
    throw new Error(`${stageLabel} expected the Questions view to open when requested.`)
  }
  if (questionMetrics.questionManagerHeading !== 'Questions') {
    throw new Error(`${stageLabel} expected the queue manager heading to stay Questions, found ${questionMetrics.questionManagerHeading}.`)
  }
  if (questionMetrics.visibleQuestionCount < 1) {
    throw new Error(`${stageLabel} expected at least one visible question in the manager lane.`)
  }
  if (!questionMetrics.filterTabs.includes('Due')) {
    throw new Error(`${stageLabel} expected the questions manager to keep the filter tabs.`)
  }

  const studyQuestionsSupportWideTop = await captureLocatorScreenshot(
    page,
    queueSection,
    directory,
    `${stagePrefix}-study-questions-support-wide-top.png`,
  )

  await page.getByRole('tab', { name: 'Review', selected: false }).click()
  await page.getByRole('tab', { name: 'Review', selected: true }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)

  await revealStudyAnswer(page)

  const answerMetrics = await readWideStudyAnswerMetrics(page)
  if (!answerMetrics.goodRatingVisible) {
    throw new Error(`${stageLabel} expected the answer-shown state to expose the rating row.`)
  }
  if (answerMetrics.evidenceHeading !== 'Evidence') {
    throw new Error(`${stageLabel} expected the evidence dock to expand into Evidence after reveal, found ${answerMetrics.evidenceHeading}.`)
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
    const dashboard = document.querySelector('[aria-label="Study workspace header"]')
    const currentSummary = document.querySelector('[aria-label="Current review summary"]')
    const queueSection = document.querySelector('[aria-label="Study queue support"]')
    const evidenceSection = document.querySelector('[aria-label="Study evidence support"]')
    const reviewHeading = Array.from(document.querySelectorAll('h2')).find(
      (heading) => heading.textContent?.replace(/\s+/g, ' ').trim() === 'Review',
    )
    const metricLabels = Array.from(document.querySelectorAll('.recall-study-dashboard-metric-label'))
      .map((node) => node.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)
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

    return {
      currentReviewSummaryVisible: currentSummary instanceof HTMLElement,
      dashboardHeight: dashboardRect?.height ?? 0,
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
      supportColumnWidth: Math.max(queueRect?.width ?? 0, evidenceRect?.width ?? 0),
    }
  })
}

async function readQuestionManagerMetrics(page) {
  return page.evaluate(() => {
    const queueSection = document.querySelector('[aria-label="Study queue support"]')
    const filterTabs = Array.from(queueSection?.querySelectorAll('[aria-label="Study filters"] [role="tab"]') ?? [])
      .map((tab) => tab.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)
    const selectedStudyView =
      Array.from(document.querySelectorAll('[aria-label="Study views"] [role="tab"]'))
        .find((tab) => tab.getAttribute('aria-selected') === 'true')
        ?.textContent?.replace(/\s+/g, ' ').trim() ?? null
    return {
      filterTabs,
      questionManagerHeading:
        queueSection?.querySelector('h3')?.textContent?.replace(/\s+/g, ' ').trim() ?? null,
      questionsSelected: selectedStudyView === 'Questions',
      visibleQuestionCount: queueSection?.querySelectorAll('.recall-study-queue-item').length ?? 0,
    }
  })
}

async function readWideStudyAnswerMetrics(page) {
  return page.evaluate(() => {
    const evidenceSection = document.querySelector('[aria-label="Study evidence support"]')
    const ratingLabels = Array.from(document.querySelectorAll('.recall-study-review-rating-row button'))
      .map((button) => button.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)
    return {
      evidenceHeading:
        evidenceSection?.querySelector('h3')?.textContent?.replace(/\s+/g, ' ').trim() ?? null,
      goodRatingVisible: ratingLabels.includes('Good'),
      ratingLabels,
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
