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
  process.env.RECALL_STAGE893_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE893_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE893_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE893_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE893_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE893_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage893-post-stage892-notebook-source-anchor-audit-failure-source.png',
  'stage893-post-stage892-notebook-source-anchor-audit-failure-sentence.png',
  'stage893-post-stage892-notebook-source-anchor-audit-failure-empty.png',
  'stage893-post-stage892-notebook-source-anchor-audit-failure-home.png',
  'stage893-post-stage892-notebook-source-anchor-audit-failure-graph.png',
  'stage893-post-stage892-notebook-source-anchor-audit-failure-reader.png',
  'stage893-post-stage892-notebook-source-anchor-audit-failure-study.png',
  'stage893-post-stage892-notebook-source-anchor-audit-failure-focused.png',
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

let sourcePage
let sentencePage
let emptyPage
let homePage
let graphPage
let notebookRegressionPage
let readerPage
let studyPage
let focusedPage
try {
  sourcePage = await browser.newPage({ viewport: desktopViewport })
  sentencePage = await browser.newPage({ viewport: desktopViewport })
  emptyPage = await browser.newPage({ viewport: desktopViewport })
  homePage = await browser.newPage({ viewport: desktopViewport })
  graphPage = await browser.newPage({ viewport: desktopViewport })
  notebookRegressionPage = await browser.newPage({ viewport: desktopViewport })
  readerPage = await browser.newPage({ viewport: desktopViewport })
  studyPage = await browser.newPage({ viewport: desktopViewport })
  focusedPage = await browser.newPage({ viewport: focusedViewport })

  const sourceEvidence = await captureNotebookNewNoteDraftEvidence({
    baseUrl,
    directory: outputDir,
    page: sourcePage,
    stageLabel: 'Stage 893 source-anchor Notebook semantics audit',
    stagePrefix: 'stage893-source',
    verifySourceReaderHandoff: true,
  })
  const sentenceEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: sentencePage,
    selectSentenceAnchor: true,
    stageLabel: 'Stage 893 sentence-anchor Notebook regression',
    stagePrefix: 'stage893-sentence',
  })
  const emptyEvidence = await captureNotebookEmptyStateEvidence({
    baseUrl,
    directory: outputDir,
    page: emptyPage,
    stageLabel: 'Stage 893 empty-state regression',
    stagePrefix: 'stage893-empty',
  })
  const regressionEvidence = await captureHomeOrganizerErgonomicsEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage,
    notebookPage: notebookRegressionPage,
    readerPage,
    stageLabel: 'Stage 893 cross-surface regression audit',
    stagePrefix: 'stage893-regression',
    studyPage,
  })

  const notebookStage889EmptyStatesStable =
    emptyEvidence.metrics.notebookEmptyWorkbenchOwned &&
    !emptyEvidence.metrics.notebookEmptyDetailIntroVisible &&
    emptyEvidence.metrics.notebookSearchEmptyWorkbenchOwned &&
    !emptyEvidence.metrics.notebookSearchEmptyDetailIntroVisible &&
    emptyEvidence.metrics.notebookCaptureInReaderNavigates

  if (!notebookStage889EmptyStatesStable) {
    throw new Error('Stage 893 expected the Stage 889 Notebook empty/search-empty states to remain stable.')
  }

  await writeFile(
    path.join(outputDir, 'stage893-post-stage892-notebook-source-anchor-workbench-semantics-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 893 audit must prove source notes use source context instead of Highlighted passage chrome.',
          'Source-note Reader handoff must be unanchored while sentence-note Reader handoff remains anchored.',
          'Stage 890/891 New note, Stage 889 Notebook empty/search, and cross-surface regressions should remain green.',
        ],
        baseUrl,
        captures: {
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
          ...sourceEvidence.metrics,
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
    captureFailure(sourcePage, outputDir, 'stage893-post-stage892-notebook-source-anchor-audit-failure-source.png'),
    captureFailure(sentencePage, outputDir, 'stage893-post-stage892-notebook-source-anchor-audit-failure-sentence.png'),
    captureFailure(emptyPage, outputDir, 'stage893-post-stage892-notebook-source-anchor-audit-failure-empty.png'),
    captureFailure(homePage, outputDir, 'stage893-post-stage892-notebook-source-anchor-audit-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage893-post-stage892-notebook-source-anchor-audit-failure-graph.png'),
    captureFailure(readerPage, outputDir, 'stage893-post-stage892-notebook-source-anchor-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage893-post-stage892-notebook-source-anchor-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage893-post-stage892-notebook-source-anchor-audit-failure-focused.png'),
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
