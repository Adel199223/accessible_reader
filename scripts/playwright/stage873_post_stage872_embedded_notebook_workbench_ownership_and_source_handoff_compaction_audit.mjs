import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureHomeOrganizerErgonomicsEvidence,
  focusedViewport,
} from './home_organizer_ergonomics_shared.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureNotebookWorkbenchEvidence,
  desktopViewport,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE873_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE873_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE873_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE873_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE873_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE873_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage873-post-stage872-embedded-notebook-workbench-audit-failure-notebook.png',
  'stage873-post-stage872-embedded-notebook-workbench-audit-failure-home.png',
  'stage873-post-stage872-embedded-notebook-workbench-audit-failure-graph.png',
  'stage873-post-stage872-embedded-notebook-workbench-audit-failure-reader.png',
  'stage873-post-stage872-embedded-notebook-workbench-audit-failure-study.png',
  'stage873-post-stage872-embedded-notebook-workbench-audit-failure-focused.png',
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

let notebookPage
let homePage
let graphPage
let notebookRegressionPage
let readerPage
let studyPage
let focusedPage
try {
  notebookPage = await browser.newPage({ viewport: desktopViewport })
  homePage = await browser.newPage({ viewport: desktopViewport })
  graphPage = await browser.newPage({ viewport: desktopViewport })
  notebookRegressionPage = await browser.newPage({ viewport: desktopViewport })
  readerPage = await browser.newPage({ viewport: desktopViewport })
  studyPage = await browser.newPage({ viewport: desktopViewport })
  focusedPage = await browser.newPage({ viewport: focusedViewport })

  const notebookEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: notebookPage,
    stageLabel: 'Stage 873 audit',
    stagePrefix: 'stage873',
  })
  const regressionEvidence = await captureHomeOrganizerErgonomicsEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage,
    notebookPage: notebookRegressionPage,
    readerPage,
    stageLabel: 'Stage 873 audit',
    stagePrefix: 'stage873-regression',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage873-post-stage872-embedded-notebook-workbench-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 873 audit must prove embedded Notebook is command-row and single-workbench owned.',
          'The old Notebook hero, browse-glance panel, detached Source handoff card, and detached Promote note card should remain retired.',
          'Home Stage 871 preview balance, Graph, Reader, Study, and focused regressions should remain green.',
        ],
        baseUrl,
        captures: {
          ...notebookEvidence.captures,
          ...regressionEvidence.captures,
        },
        desktopViewport,
        focusedViewport,
        headless,
        metrics: {
          ...notebookEvidence.metrics,
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
    captureFailure(notebookPage, outputDir, 'stage873-post-stage872-embedded-notebook-workbench-audit-failure-notebook.png'),
    captureFailure(homePage, outputDir, 'stage873-post-stage872-embedded-notebook-workbench-audit-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage873-post-stage872-embedded-notebook-workbench-audit-failure-graph.png'),
    captureFailure(readerPage, outputDir, 'stage873-post-stage872-embedded-notebook-workbench-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage873-post-stage872-embedded-notebook-workbench-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage873-post-stage872-embedded-notebook-workbench-audit-failure-focused.png'),
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
