import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import {
  captureHomeOrganizerErgonomicsEvidence,
  focusedViewport,
} from './home_organizer_ergonomics_shared.mjs'
import {
  captureLocatorScreenshot,
  captureViewportScreenshot,
  launchBrowserContext,
} from './home_rendered_preview_quality_shared.mjs'
import {
  captureHomePersonalNoteLaneEvidence,
  captureHomePersonalNotesCollectionBoardEvidence,
  captureNotebookEmptyStateEvidence,
  captureNotebookNewNoteDraftEvidence,
  captureNotebookWorkbenchEvidence,
  captureSourceOverviewMemoryEvidence,
  desktopViewport,
  summarizeStageHarnessCleanupMetrics,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE905_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE905_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE905_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE905_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE905_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE905_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage905-real-notes-baseline-audit-failure-source-overview.png',
  'stage905-real-notes-baseline-audit-failure-board.png',
  'stage905-real-notes-baseline-audit-failure-lane.png',
  'stage905-real-notes-baseline-audit-failure-source.png',
  'stage905-real-notes-baseline-audit-failure-sentence.png',
  'stage905-real-notes-baseline-audit-failure-empty.png',
  'stage905-real-notes-baseline-audit-failure-absence-home.png',
  'stage905-real-notes-baseline-audit-failure-absence-source.png',
  'stage905-real-notes-baseline-audit-failure-regression-home.png',
  'stage905-real-notes-baseline-audit-failure-graph.png',
  'stage905-real-notes-baseline-audit-failure-reader.png',
  'stage905-real-notes-baseline-audit-failure-study.png',
  'stage905-real-notes-baseline-audit-failure-focused.png',
]) {
  await rm(path.join(outputDir, failureFile), { force: true })
}

const { browser, runtimeBrowser } = await launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
})

let sourceOverviewPage
let boardPage
let lanePage
let sourcePage
let sentencePage
let emptyPage
let absenceHomePage
let absenceSourcePage
let regressionHomePage
let graphPage
let notebookRegressionPage
let readerPage
let studyPage
let focusedPage
try {
  sourceOverviewPage = await browser.newPage({ viewport: desktopViewport })
  boardPage = await browser.newPage({ viewport: desktopViewport })
  lanePage = await browser.newPage({ viewport: desktopViewport })
  sourcePage = await browser.newPage({ viewport: desktopViewport })
  sentencePage = await browser.newPage({ viewport: desktopViewport })
  emptyPage = await browser.newPage({ viewport: desktopViewport })
  absenceHomePage = await browser.newPage({ viewport: desktopViewport })
  absenceSourcePage = await browser.newPage({ viewport: desktopViewport })
  regressionHomePage = await browser.newPage({ viewport: desktopViewport })
  graphPage = await browser.newPage({ viewport: desktopViewport })
  notebookRegressionPage = await browser.newPage({ viewport: desktopViewport })
  readerPage = await browser.newPage({ viewport: desktopViewport })
  studyPage = await browser.newPage({ viewport: desktopViewport })
  focusedPage = await browser.newPage({ viewport: focusedViewport })

  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceOverviewPage,
    stageLabel: 'Stage 905 source memory real-note baseline audit',
    stagePrefix: 'stage905-source-memory',
  })
  const boardEvidence = await captureHomePersonalNotesCollectionBoardEvidence({
    baseUrl,
    directory: outputDir,
    page: boardPage,
    stageLabel: 'Stage 905 Home personal-notes board real-note baseline audit',
    stagePrefix: 'stage905-board',
  })
  const laneEvidence = await captureHomePersonalNoteLaneEvidence({
    baseUrl,
    directory: outputDir,
    page: lanePage,
    stageLabel: 'Stage 905 Home personal-note lane/search real-note baseline audit',
    stagePrefix: 'stage905-lane',
  })
  const sourceEvidence = await captureNotebookNewNoteDraftEvidence({
    baseUrl,
    directory: outputDir,
    page: sourcePage,
    stageLabel: 'Stage 905 source-anchor Notebook real-note baseline audit',
    stagePrefix: 'stage905-source',
    verifySourceReaderHandoff: true,
  })
  const sentenceEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: sentencePage,
    selectSentenceAnchor: true,
    stageLabel: 'Stage 905 sentence-anchor Notebook regression',
    stagePrefix: 'stage905-sentence',
  })
  const emptyEvidence = await captureNotebookEmptyStateEvidence({
    baseUrl,
    directory: outputDir,
    page: emptyPage,
    stageLabel: 'Stage 905 Notebook empty-state regression',
    stagePrefix: 'stage905-empty',
  })
  const absenceHomeEvidence = await captureHomeArtifactAbsenceEvidence(absenceHomePage)
  const absenceSourceEvidence = await captureSourceMemoryArtifactAbsenceEvidence(absenceSourcePage)
  const regressionEvidence = await captureHomeOrganizerErgonomicsEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage: regressionHomePage,
    notebookPage: notebookRegressionPage,
    readerPage,
    stageLabel: 'Stage 905 cross-surface real-note baseline regression audit',
    stagePrefix: 'stage905-regression',
    studyPage,
  })
  const notesSidebarVisible = await regressionHomePage.evaluate(() =>
    Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.trim() === 'Notes' || tab.getAttribute('aria-label') === 'Notes',
    ),
  )
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
    sourceOverviewEvidence.metrics,
    boardEvidence.metrics,
    laneEvidence.metrics,
    sourceEvidence.metrics,
  )

  const notebookStage889EmptyStatesStable =
    emptyEvidence.metrics.notebookEmptyWorkbenchOwned &&
    !emptyEvidence.metrics.notebookEmptyDetailIntroVisible &&
    emptyEvidence.metrics.notebookSearchEmptyWorkbenchOwned &&
    !emptyEvidence.metrics.notebookSearchEmptyDetailIntroVisible &&
    emptyEvidence.metrics.notebookCaptureInReaderNavigates
  const homePersonalNotesAuditArtifactsAbsent = absenceHomeEvidence.homePersonalNotesAuditArtifactsAbsent
  const sourceMemoryAuditArtifactsAbsent = absenceSourceEvidence.sourceMemoryAuditArtifactsAbsent
  const workspaceSearchAuditArtifactsAbsent = cleanupDryRun.matchedCount === 0

  if (!notebookStage889EmptyStatesStable) {
    throw new Error('Stage 905 expected the Stage 889 Notebook empty/search-empty states to remain stable.')
  }
  if (notesSidebarVisible) {
    throw new Error('Stage 905 expected the retired Notes sidebar tab to stay hidden.')
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 905 expected no historical audit note artifacts, found ${cleanupDryRun.matchedCount}.`)
  }
  if (!homePersonalNotesAuditArtifactsAbsent || !sourceMemoryAuditArtifactsAbsent || !workspaceSearchAuditArtifactsAbsent) {
    throw new Error('Stage 905 expected historical audit artifacts to stay absent from real-note surfaces.')
  }

  await writeFile(
    path.join(outputDir, 'stage905-post-stage904-historical-audit-note-cleanup-and-real-personal-notes-baseline-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Historical source-note audit artifacts should stay removed after Stage 904 cleanup.',
          'Stage-created evidence notes should remain self-cleaning during the broad audit.',
          'Home, Source memory, Notebook, Reader, Graph, Study, and focused workflows should retain the Stage 903 baseline.',
        ],
        baseUrl,
        captures: {
          ...sourceOverviewEvidence.captures,
          ...boardEvidence.captures,
          ...laneEvidence.captures,
          ...sourceEvidence.captures,
          ...sentenceEvidence.captures,
          ...emptyEvidence.captures,
          ...absenceHomeEvidence.captures,
          ...absenceSourceEvidence.captures,
          ...regressionEvidence.captures,
        },
        cleanupDryRunAfterApply: cleanupDryRun,
        desktopViewport,
        focusedViewport,
        headless,
        metrics: {
          ...sentenceEvidence.metrics,
          ...emptyEvidence.metrics,
          ...regressionEvidence.metrics,
          ...sourceEvidence.metrics,
          ...laneEvidence.metrics,
          ...boardEvidence.metrics,
          ...sourceOverviewEvidence.metrics,
          ...harnessCleanupMetrics,
          cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
          homePersonalNotesAuditArtifactsAbsent,
          notebookStage889EmptyStatesStable,
          notesSidebarVisible,
          sourceMemoryAuditArtifactsAbsent,
          workspaceSearchAuditArtifactsAbsent,
        },
        runtimeBrowser,
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  await Promise.all([
    captureFailure(sourceOverviewPage, outputDir, 'stage905-real-notes-baseline-audit-failure-source-overview.png'),
    captureFailure(boardPage, outputDir, 'stage905-real-notes-baseline-audit-failure-board.png'),
    captureFailure(lanePage, outputDir, 'stage905-real-notes-baseline-audit-failure-lane.png'),
    captureFailure(sourcePage, outputDir, 'stage905-real-notes-baseline-audit-failure-source.png'),
    captureFailure(sentencePage, outputDir, 'stage905-real-notes-baseline-audit-failure-sentence.png'),
    captureFailure(emptyPage, outputDir, 'stage905-real-notes-baseline-audit-failure-empty.png'),
    captureFailure(absenceHomePage, outputDir, 'stage905-real-notes-baseline-audit-failure-absence-home.png'),
    captureFailure(absenceSourcePage, outputDir, 'stage905-real-notes-baseline-audit-failure-absence-source.png'),
    captureFailure(regressionHomePage, outputDir, 'stage905-real-notes-baseline-audit-failure-regression-home.png'),
    captureFailure(graphPage, outputDir, 'stage905-real-notes-baseline-audit-failure-graph.png'),
    captureFailure(readerPage, outputDir, 'stage905-real-notes-baseline-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage905-real-notes-baseline-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage905-real-notes-baseline-audit-failure-focused.png'),
  ])
  await writeFile(
    path.join(outputDir, 'stage905-real-personal-notes-baseline-audit-failure.json'),
    JSON.stringify(
      {
        error: error instanceof Error ? error.message : String(error),
        stageHarnessCleanupMetrics: error?.stageHarnessCleanupMetrics ?? null,
      },
      null,
      2,
    ),
    'utf8',
  ).catch(() => undefined)
  throw error
} finally {
  await browser.close()
}

async function captureHomeArtifactAbsenceEvidence(page) {
  const response = await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Home navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  await page.getByRole('tab', { name: 'Home', selected: true }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(400)
  const homeWideTop = await captureViewportScreenshot(page, outputDir, 'stage905-home-after-historical-cleanup.png')
  const organizerSection = page.locator('[data-home-personal-notes-organizer-section-stage898="true"]').first()
  if (await organizerSection.isVisible().catch(() => false)) {
    await organizerSection.getByRole('button').first().click()
    await page.waitForTimeout(500)
  }
  const board = page.locator('[data-home-personal-notes-board-stage898="true"]').first()
  let personalNotesBoardCapture = null
  if (await board.isVisible().catch(() => false)) {
    personalNotesBoardCapture = await captureLocatorScreenshot(
      page,
      board,
      outputDir,
      'stage905-home-personal-notes-board-after-cleanup.png',
    )
  }
  const homePersonalNotesAuditArtifactsAbsent = await page.evaluate(() => {
    const pattern = /Stage stage\d{3}/i
    const personalNoteSurfaces = [
      document.querySelector('[data-home-personal-note-lane="true"]'),
      document.querySelector('[data-home-personal-notes-board-stage898="true"]'),
    ]
    return personalNoteSurfaces.every((surface) => !pattern.test(surface?.textContent ?? ''))
  })

  return {
    captures: {
      homeWideTop,
      personalNotesBoardCapture,
    },
    homePersonalNotesAuditArtifactsAbsent,
  }
}

async function captureSourceMemoryArtifactAbsenceEvidence(page) {
  const response = await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Home navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  const sourceButton = page.locator('.recall-home-parity-card-stage563, .recall-home-parity-list-row-stage563').first()
  await sourceButton.waitFor({ state: 'visible', timeout: 20000 })
  await sourceButton.click()
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(400)
  const sourceOverviewCapture = await captureViewportScreenshot(
    page,
    outputDir,
    'stage905-source-overview-after-historical-cleanup.png',
  )
  const sourceMemoryPanel = page.locator('[data-source-overview-personal-notes-panel-stage900="true"]').first()
  let sourceMemoryPanelCapture = null
  if (await sourceMemoryPanel.isVisible().catch(() => false)) {
    sourceMemoryPanelCapture = await captureLocatorScreenshot(
      page,
      sourceMemoryPanel,
      outputDir,
      'stage905-source-memory-panel-after-cleanup.png',
    )
  }
  const sourceMemoryAuditArtifactsAbsent = await page.evaluate(() => {
    const pattern = /Stage stage\d{3}/i
    const sourceMemoryPanel = document.querySelector('[data-source-overview-personal-notes-panel-stage900="true"]')
    return !pattern.test(sourceMemoryPanel?.textContent ?? '')
  })

  return {
    captures: {
      sourceMemoryPanelCapture,
      sourceOverviewCapture,
    },
    sourceMemoryAuditArtifactsAbsent,
  }
}

async function captureFailure(page, directory, filename) {
  if (!page) {
    return
  }
  await page
    .screenshot({
      fullPage: true,
      path: path.join(directory, filename),
    })
    .catch(() => undefined)
}
