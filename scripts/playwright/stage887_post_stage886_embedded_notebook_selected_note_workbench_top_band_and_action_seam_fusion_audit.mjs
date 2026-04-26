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
  captureNotebookWorkbenchEvidence,
  desktopViewport,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE887_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE887_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE887_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE887_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE887_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE887_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage887-post-stage886-embedded-notebook-selected-note-audit-failure-workbench.png',
  'stage887-post-stage886-embedded-notebook-selected-note-audit-failure-empty.png',
  'stage887-post-stage886-embedded-notebook-selected-note-audit-failure-home.png',
  'stage887-post-stage886-embedded-notebook-selected-note-audit-failure-graph.png',
  'stage887-post-stage886-embedded-notebook-selected-note-audit-failure-reader.png',
  'stage887-post-stage886-embedded-notebook-selected-note-audit-failure-study.png',
  'stage887-post-stage886-embedded-notebook-selected-note-audit-failure-focused.png',
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

let workbenchPage
let emptyPage
let homePage
let graphPage
let notebookRegressionPage
let readerPage
let studyPage
let focusedPage
try {
  workbenchPage = await browser.newPage({ viewport: desktopViewport })
  emptyPage = await browser.newPage({ viewport: desktopViewport })
  homePage = await browser.newPage({ viewport: desktopViewport })
  graphPage = await browser.newPage({ viewport: desktopViewport })
  notebookRegressionPage = await browser.newPage({ viewport: desktopViewport })
  readerPage = await browser.newPage({ viewport: desktopViewport })
  studyPage = await browser.newPage({ viewport: desktopViewport })
  focusedPage = await browser.newPage({ viewport: focusedViewport })

  const workbenchEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: workbenchPage,
    stageLabel: 'Stage 887 selected-note audit',
    stagePrefix: 'stage887-selected',
  })
  const emptyEvidence = await captureNotebookEmptyStateEvidence({
    baseUrl,
    directory: outputDir,
    page: emptyPage,
    stageLabel: 'Stage 887 empty-state regression',
    stagePrefix: 'stage887',
  })
  const regressionEvidence = await captureHomeOrganizerErgonomicsEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage,
    notebookPage: notebookRegressionPage,
    readerPage,
    stageLabel: 'Stage 887 regression audit',
    stagePrefix: 'stage887-regression',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage887-post-stage886-embedded-notebook-selected-note-workbench-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 887 audit must prove selected-note Notebook has fused top-band ownership and compact source/promote action seams.',
          'No-active-note and search-empty Notebook states should preserve the Stage 875 workbench-owned Capture in Reader behavior.',
          'Home Stage 885, Graph, Reader, Study, and focused Reader-led Notebook regressions should remain green.',
        ],
        baseUrl,
        captures: {
          ...workbenchEvidence.captures,
          ...emptyEvidence.captures,
          ...regressionEvidence.captures,
        },
        desktopViewport,
        focusedViewport,
        headless,
        metrics: {
          ...workbenchEvidence.metrics,
          ...emptyEvidence.metrics,
          ...regressionEvidence.metrics,
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
    captureFailure(workbenchPage, outputDir, 'stage887-post-stage886-embedded-notebook-selected-note-audit-failure-workbench.png'),
    captureFailure(emptyPage, outputDir, 'stage887-post-stage886-embedded-notebook-selected-note-audit-failure-empty.png'),
    captureFailure(homePage, outputDir, 'stage887-post-stage886-embedded-notebook-selected-note-audit-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage887-post-stage886-embedded-notebook-selected-note-audit-failure-graph.png'),
    captureFailure(readerPage, outputDir, 'stage887-post-stage886-embedded-notebook-selected-note-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage887-post-stage886-embedded-notebook-selected-note-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage887-post-stage886-embedded-notebook-selected-note-audit-failure-focused.png'),
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
