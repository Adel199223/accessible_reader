import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureHomeOrganizerErgonomicsEvidence,
  focusedViewport,
} from './home_organizer_ergonomics_shared.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureHomePersonalNoteLaneEvidence,
  captureNotebookEmptyStateEvidence,
  captureNotebookNewNoteDraftEvidence,
  captureNotebookWorkbenchEvidence,
  desktopViewport,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE895_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE895_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE895_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE895_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE895_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE895_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage895-post-stage894-home-personal-note-audit-failure-home.png',
  'stage895-post-stage894-home-personal-note-audit-failure-source.png',
  'stage895-post-stage894-home-personal-note-audit-failure-sentence.png',
  'stage895-post-stage894-home-personal-note-audit-failure-empty.png',
  'stage895-post-stage894-home-personal-note-audit-failure-regression-home.png',
  'stage895-post-stage894-home-personal-note-audit-failure-graph.png',
  'stage895-post-stage894-home-personal-note-audit-failure-reader.png',
  'stage895-post-stage894-home-personal-note-audit-failure-study.png',
  'stage895-post-stage894-home-personal-note-audit-failure-focused.png',
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

let homePage
let sourcePage
let sentencePage
let emptyPage
let regressionHomePage
let graphPage
let notebookRegressionPage
let readerPage
let studyPage
let focusedPage
try {
  homePage = await browser.newPage({ viewport: desktopViewport })
  sourcePage = await browser.newPage({ viewport: desktopViewport })
  sentencePage = await browser.newPage({ viewport: desktopViewport })
  emptyPage = await browser.newPage({ viewport: desktopViewport })
  regressionHomePage = await browser.newPage({ viewport: desktopViewport })
  graphPage = await browser.newPage({ viewport: desktopViewport })
  notebookRegressionPage = await browser.newPage({ viewport: desktopViewport })
  readerPage = await browser.newPage({ viewport: desktopViewport })
  studyPage = await browser.newPage({ viewport: desktopViewport })
  focusedPage = await browser.newPage({ viewport: focusedViewport })

  const homeEvidence = await captureHomePersonalNoteLaneEvidence({
    baseUrl,
    directory: outputDir,
    page: homePage,
    stageLabel: 'Stage 895 Home personal-note audit',
    stagePrefix: 'stage895-home',
  })
  const sourceEvidence = await captureNotebookNewNoteDraftEvidence({
    baseUrl,
    directory: outputDir,
    page: sourcePage,
    stageLabel: 'Stage 895 source-anchor Notebook regression',
    stagePrefix: 'stage895-source',
    verifySourceReaderHandoff: true,
  })
  const sentenceEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: sentencePage,
    selectSentenceAnchor: true,
    stageLabel: 'Stage 895 sentence-anchor Notebook regression',
    stagePrefix: 'stage895-sentence',
  })
  const emptyEvidence = await captureNotebookEmptyStateEvidence({
    baseUrl,
    directory: outputDir,
    page: emptyPage,
    stageLabel: 'Stage 895 Notebook empty-state regression',
    stagePrefix: 'stage895-empty',
  })
  const regressionEvidence = await captureHomeOrganizerErgonomicsEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage: regressionHomePage,
    notebookPage: notebookRegressionPage,
    readerPage,
    stageLabel: 'Stage 895 cross-surface regression audit',
    stagePrefix: 'stage895-regression',
    studyPage,
  })
  const notesSidebarVisible = await regressionHomePage.evaluate(() =>
    Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.trim() === 'Notes' || tab.getAttribute('aria-label') === 'Notes',
    ),
  )

  const notebookStage889EmptyStatesStable =
    emptyEvidence.metrics.notebookEmptyWorkbenchOwned &&
    !emptyEvidence.metrics.notebookEmptyDetailIntroVisible &&
    emptyEvidence.metrics.notebookSearchEmptyWorkbenchOwned &&
    !emptyEvidence.metrics.notebookSearchEmptyDetailIntroVisible &&
    emptyEvidence.metrics.notebookCaptureInReaderNavigates

  if (!notebookStage889EmptyStatesStable) {
    throw new Error('Stage 895 expected the Stage 889 Notebook empty/search-empty states to remain stable.')
  }
  if (notesSidebarVisible) {
    throw new Error('Stage 895 expected the retired Notes sidebar tab to stay hidden.')
  }

  await writeFile(
    path.join(outputDir, 'stage895-post-stage894-home-library-native-personal-note-items-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Home should expose source-attached personal notes as compact Library-native items.',
          'Source-note search and Reader handoffs should remain source-owned and unanchored.',
          'Stage 892/893 Notebook semantics, Stage 890/891 draft flow, and broad Home/Reader/Graph/Study regressions should remain green.',
        ],
        baseUrl,
        captures: {
          ...homeEvidence.captures,
          ...sourceEvidence.captures,
          ...sentenceEvidence.captures,
          ...emptyEvidence.captures,
          ...regressionEvidence.captures,
        },
        desktopViewport,
        focusedViewport,
        headless,
        metrics: {
          ...sentenceEvidence.metrics,
          ...emptyEvidence.metrics,
          ...regressionEvidence.metrics,
          ...sourceEvidence.metrics,
          ...homeEvidence.metrics,
          notebookStage889EmptyStatesStable,
          notesSidebarVisible,
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
    captureFailure(homePage, outputDir, 'stage895-post-stage894-home-personal-note-audit-failure-home.png'),
    captureFailure(sourcePage, outputDir, 'stage895-post-stage894-home-personal-note-audit-failure-source.png'),
    captureFailure(sentencePage, outputDir, 'stage895-post-stage894-home-personal-note-audit-failure-sentence.png'),
    captureFailure(emptyPage, outputDir, 'stage895-post-stage894-home-personal-note-audit-failure-empty.png'),
    captureFailure(regressionHomePage, outputDir, 'stage895-post-stage894-home-personal-note-audit-failure-regression-home.png'),
    captureFailure(graphPage, outputDir, 'stage895-post-stage894-home-personal-note-audit-failure-graph.png'),
    captureFailure(readerPage, outputDir, 'stage895-post-stage894-home-personal-note-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage895-post-stage894-home-personal-note-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage895-post-stage894-home-personal-note-audit-failure-focused.png'),
  ])
  throw error
} finally {
  await browser.close()
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
