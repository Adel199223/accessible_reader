import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureHomeOrganizerErgonomicsEvidence,
  focusedViewport,
} from './home_organizer_ergonomics_shared.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureNotebookEmptyStateEvidence,
  captureNotebookNewNoteDraftEvidence,
  captureNotebookWorkbenchEvidence,
  desktopViewport,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE891_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE891_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE891_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE891_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE891_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE891_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage891-post-stage890-notebook-new-note-audit-failure-draft.png',
  'stage891-post-stage890-notebook-new-note-audit-failure-workbench.png',
  'stage891-post-stage890-notebook-new-note-audit-failure-empty.png',
  'stage891-post-stage890-notebook-new-note-audit-failure-home.png',
  'stage891-post-stage890-notebook-new-note-audit-failure-graph.png',
  'stage891-post-stage890-notebook-new-note-audit-failure-reader.png',
  'stage891-post-stage890-notebook-new-note-audit-failure-study.png',
  'stage891-post-stage890-notebook-new-note-audit-failure-focused.png',
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

let draftPage
let workbenchPage
let emptyPage
let homePage
let graphPage
let notebookRegressionPage
let readerPage
let studyPage
let focusedPage
try {
  draftPage = await browser.newPage({ viewport: desktopViewport })
  workbenchPage = await browser.newPage({ viewport: desktopViewport })
  emptyPage = await browser.newPage({ viewport: desktopViewport })
  homePage = await browser.newPage({ viewport: desktopViewport })
  graphPage = await browser.newPage({ viewport: desktopViewport })
  notebookRegressionPage = await browser.newPage({ viewport: desktopViewport })
  readerPage = await browser.newPage({ viewport: desktopViewport })
  studyPage = await browser.newPage({ viewport: desktopViewport })
  focusedPage = await browser.newPage({ viewport: focusedViewport })

  const draftEvidence = await captureNotebookNewNoteDraftEvidence({
    baseUrl,
    directory: outputDir,
    page: draftPage,
    stageLabel: 'Stage 891 source-attached Notebook draft audit',
    stagePrefix: 'stage891',
  })
  const workbenchEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: workbenchPage,
    stageLabel: 'Stage 891 selected-note regression',
    stagePrefix: 'stage891-selected',
  })
  const emptyEvidence = await captureNotebookEmptyStateEvidence({
    baseUrl,
    directory: outputDir,
    page: emptyPage,
    stageLabel: 'Stage 891 empty-state regression',
    stagePrefix: 'stage891-empty',
  })
  const regressionEvidence = await captureHomeOrganizerErgonomicsEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage,
    notebookPage: notebookRegressionPage,
    readerPage,
    stageLabel: 'Stage 891 regression audit',
    stagePrefix: 'stage891-regression',
    studyPage,
  })

  const notebookStage889EmptyStatesStable =
    emptyEvidence.metrics.notebookEmptyWorkbenchOwned &&
    !emptyEvidence.metrics.notebookEmptyDetailIntroVisible &&
    emptyEvidence.metrics.notebookSearchEmptyWorkbenchOwned &&
    !emptyEvidence.metrics.notebookSearchEmptyDetailIntroVisible &&
    emptyEvidence.metrics.notebookCaptureInReaderNavigates

  if (!notebookStage889EmptyStatesStable) {
    throw new Error('Stage 891 expected the Stage 889 Notebook empty/search-empty states to remain stable.')
  }

  await writeFile(
    path.join(outputDir, 'stage891-post-stage890-notebook-new-note-entry-and-source-attached-draft-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 891 audit must prove Home New note opens a real embedded Notebook draft.',
          'The saved draft must become a selected source-attached note while Capture in Reader stays available.',
          'Home, Add Content, Graph, Reader active Listen, Study, and focused Reader-led Notebook regressions should remain green.',
        ],
        baseUrl,
        captures: {
          ...draftEvidence.captures,
          ...workbenchEvidence.captures,
          ...emptyEvidence.captures,
          ...regressionEvidence.captures,
        },
        desktopViewport,
        focusedViewport,
        headless,
        metrics: {
          ...draftEvidence.metrics,
          ...workbenchEvidence.metrics,
          ...emptyEvidence.metrics,
          ...regressionEvidence.metrics,
          notebookStage889EmptyStatesStable,
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
    captureFailure(draftPage, outputDir, 'stage891-post-stage890-notebook-new-note-audit-failure-draft.png'),
    captureFailure(workbenchPage, outputDir, 'stage891-post-stage890-notebook-new-note-audit-failure-workbench.png'),
    captureFailure(emptyPage, outputDir, 'stage891-post-stage890-notebook-new-note-audit-failure-empty.png'),
    captureFailure(homePage, outputDir, 'stage891-post-stage890-notebook-new-note-audit-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage891-post-stage890-notebook-new-note-audit-failure-graph.png'),
    captureFailure(readerPage, outputDir, 'stage891-post-stage890-notebook-new-note-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage891-post-stage890-notebook-new-note-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage891-post-stage890-notebook-new-note-audit-failure-focused.png'),
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
