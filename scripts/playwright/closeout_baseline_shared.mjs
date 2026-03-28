import {
  captureViewportScreenshot,
  desktopViewport,
  launchBrowserContext,
  openGraph,
  openHome,
  openOriginalReaderFromHome,
} from './home_rendered_preview_quality_shared.mjs'
import { closeTourIfVisible } from './graph_recall_style_shared.mjs'
import { captureReaderGeneratedModeRefinementEvidence } from './reader_generated_mode_refinement_shared.mjs'
import {
  captureFocusedStudyEvidence,
  captureStudyReviewDashboardEvidence,
  focusedViewport,
} from './study_review_dashboard_reset_shared.mjs'

export { desktopViewport, focusedViewport, launchBrowserContext }

export async function captureCloseoutBaselineEvidence({
  baseUrl,
  directory,
  focusedStudyPage,
  generatedReaderPage,
  graphPage,
  homePage,
  notebookPage,
  originalReaderPage,
  stageLabel,
  stagePrefix,
  studyPage,
}) {
  const studyEvidence = await captureStudyReviewDashboardEvidence({
    baseUrl,
    directory,
    page: studyPage,
    stageLabel,
    stagePrefix,
  })

  const focusedStudyEvidence = await captureFocusedStudyEvidence({
    baseUrl,
    directory,
    page: focusedStudyPage,
    stageLabel,
    stagePrefix,
  })

  await openHome(homePage, baseUrl)
  const homeWideTop = await captureViewportScreenshot(homePage, directory, `${stagePrefix}-home-wide-top.png`)
  const homeMetrics = await homePage.evaluate(() => ({
    homeVisible: document.querySelector('.recall-home-workspace') instanceof HTMLElement,
    notesSidebarVisible: Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.replace(/\s+/g, ' ').trim() === 'Notes',
    ),
  }))

  await openGraph(graphPage, baseUrl)
  await closeTourIfVisible(graphPage)
  const graphWideTop = await captureViewportScreenshot(graphPage, directory, `${stagePrefix}-graph-wide-top.png`)
  const graphMetrics = await graphPage.evaluate(() => ({
    graphCanvasVisible: document.querySelector('[aria-label="Knowledge graph canvas"]') instanceof HTMLElement,
  }))

  const notebookResponse = await notebookPage.goto(`${baseUrl}/recall?section=notes`, { waitUntil: 'networkidle' })
  if (!notebookResponse || !notebookResponse.ok()) {
    throw new Error(`${stageLabel} notebook regression navigation failed with status ${notebookResponse?.status() ?? 'unknown'}.`)
  }
  await notebookPage.getByRole('heading', { name: 'Notebook', exact: true }).waitFor({ state: 'visible', timeout: 20000 })
  await notebookPage.waitForTimeout(250)
  const notebookWideTop = await captureViewportScreenshot(
    notebookPage,
    directory,
    `${stagePrefix}-notebook-wide-top.png`,
  )
  const notebookMetrics = await notebookPage.evaluate(() => ({
    notebookVisible: Boolean(Array.from(document.querySelectorAll('h1, h2, h3')).find((heading) => heading.textContent?.trim() === 'Notebook')),
    notesSidebarVisible: Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.replace(/\s+/g, ' ').trim() === 'Notes',
    ),
  }))

  const originalReaderEvidence = await openOriginalReaderFromHome(
    originalReaderPage,
    directory,
    `${stagePrefix}-reader`,
    baseUrl,
  )
  const originalReaderMetrics = await originalReaderPage.evaluate(() => ({
    originalReaderVisible: document.querySelector('.reader-workspace') instanceof HTMLElement,
  }))

  const generatedReaderEvidence = await captureReaderGeneratedModeRefinementEvidence({
    baseUrl,
    directory,
    page: generatedReaderPage,
    stagePrefix: `${stagePrefix}-generated`,
  })

  return {
    captures: {
      ...studyEvidence.captures,
      ...focusedStudyEvidence.captures,
      ...generatedReaderEvidence.captures,
      graphWideTop,
      homeWideTop,
      notebookWideTop,
      readerOriginalWideTop: originalReaderEvidence.capture,
    },
    metrics: {
      ...studyEvidence.metrics,
      ...focusedStudyEvidence.metrics,
      ...generatedReaderEvidence.metrics,
      ...homeMetrics,
      ...graphMetrics,
      ...notebookMetrics,
      ...originalReaderMetrics,
      originalReaderSourceTitle: originalReaderEvidence.sourceTitle,
    },
  }
}
