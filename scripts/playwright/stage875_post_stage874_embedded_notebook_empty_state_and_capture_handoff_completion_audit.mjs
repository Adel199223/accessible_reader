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
  process.env.RECALL_STAGE875_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE875_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE875_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE875_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE875_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE875_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage875-post-stage874-embedded-notebook-empty-state-audit-failure-workbench.png',
  'stage875-post-stage874-embedded-notebook-empty-state-audit-failure-empty.png',
  'stage875-post-stage874-embedded-notebook-empty-state-audit-failure-home.png',
  'stage875-post-stage874-embedded-notebook-empty-state-audit-failure-graph.png',
  'stage875-post-stage874-embedded-notebook-empty-state-audit-failure-reader.png',
  'stage875-post-stage874-embedded-notebook-empty-state-audit-failure-study.png',
  'stage875-post-stage874-embedded-notebook-empty-state-audit-failure-focused.png',
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
    stageLabel: 'Stage 875 selected-note regression',
    stagePrefix: 'stage875-selected',
  })
  const emptyEvidence = await captureNotebookEmptyStateEvidence({
    baseUrl,
    directory: outputDir,
    page: emptyPage,
    stageLabel: 'Stage 875 audit',
    stagePrefix: 'stage875',
  })
  const regressionEvidence = await captureHomeOrganizerErgonomicsEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage,
    notebookPage: notebookRegressionPage,
    readerPage,
    stageLabel: 'Stage 875 audit',
    stagePrefix: 'stage875-regression',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage875-post-stage874-embedded-notebook-empty-state-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 875 audit must prove no-active and search-empty Notebook states are compact and workbench-owned.',
          'Capture in Reader should remain available from the selected source while old hero/guidance empty chrome stays gone.',
          'Home Stage 871 preview balance, Graph, Reader, Study, and focused regressions should remain green.',
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
    captureFailure(workbenchPage, outputDir, 'stage875-post-stage874-embedded-notebook-empty-state-audit-failure-workbench.png'),
    captureFailure(emptyPage, outputDir, 'stage875-post-stage874-embedded-notebook-empty-state-audit-failure-empty.png'),
    captureFailure(homePage, outputDir, 'stage875-post-stage874-embedded-notebook-empty-state-audit-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage875-post-stage874-embedded-notebook-empty-state-audit-failure-graph.png'),
    captureFailure(readerPage, outputDir, 'stage875-post-stage874-embedded-notebook-empty-state-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage875-post-stage874-embedded-notebook-empty-state-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage875-post-stage874-embedded-notebook-empty-state-audit-failure-focused.png'),
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
