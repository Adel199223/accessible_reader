import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureViewportScreenshot,
  desktopViewport,
  launchBrowserContext,
  openHome,
  openOriginalReaderFromHome,
} from './home_rendered_preview_quality_shared.mjs'
import { captureGraphRecallStyleEvidence } from './graph_recall_style_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE846_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE846_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE846_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE846_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE846_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE846_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage846-graph-default-open-tour-retirement-and-help-corner-opt-in-after-stage845-failure-graph.png',
  'stage846-graph-default-open-tour-retirement-and-help-corner-opt-in-after-stage845-failure-home.png',
  'stage846-graph-default-open-tour-retirement-and-help-corner-opt-in-after-stage845-failure-notebook.png',
  'stage846-graph-default-open-tour-retirement-and-help-corner-opt-in-after-stage845-failure-reader.png',
  'stage846-graph-default-open-tour-retirement-and-help-corner-opt-in-after-stage845-failure-study.png',
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

let graphPage
let homePage
let notebookPage
let readerPage
let studyPage
try {
  graphPage = await browser.newPage({ viewport: desktopViewport })
  homePage = await browser.newPage({ viewport: desktopViewport })
  notebookPage = await browser.newPage({ viewport: desktopViewport })
  readerPage = await browser.newPage({ viewport: desktopViewport })
  studyPage = await browser.newPage({ viewport: desktopViewport })

  const graphEvidence = await captureGraphRecallStyleEvidence({
    baseUrl,
    directory: outputDir,
    page: graphPage,
    stageLabel: 'Stage 846 implementation',
    stagePrefix: 'stage846',
  })

  await openHome(homePage, baseUrl)
  const homeWideTop = await captureViewportScreenshot(homePage, outputDir, 'stage846-home-wide-top.png')

  await notebookPage.goto(`${baseUrl}/recall?section=notes`, { waitUntil: 'networkidle' })
  await notebookPage.getByRole('heading', { name: 'Notebook', exact: true }).waitFor({ state: 'visible', timeout: 20000 })
  const notebookWideTop = await captureViewportScreenshot(notebookPage, outputDir, 'stage846-notebook-wide-top.png')

  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage846', baseUrl)

  await studyPage.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  await studyPage.getByRole('tab', { name: 'Study', selected: true }).waitFor({ state: 'visible', timeout: 20000 })
  const studyWideTop = await captureViewportScreenshot(studyPage, outputDir, 'stage846-study-wide-top.png')

  await writeFile(
    path.join(
      outputDir,
      'stage846-graph-default-open-tour-retirement-and-help-corner-opt-in-after-stage845-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          ...graphEvidence.captures,
          homeWideTop,
          notebookWideTop,
          readerOriginalWideTop: readerEvidence.capture,
          studyWideTop,
        },
        desktopViewport,
        headless,
        implementationFocus: [
          'Graph now opens directly into its working state instead of hiding behind the welcome tour modal.',
          'The bottom-right help corner stays visible on first open with a Take Graph tour entry plus Graph help, and the same tour remains replayable after dismissal.',
          'Home, embedded Notebook, original-only Reader, and Study remain regression-only surfaces beneath the refreshed Graph baseline.',
        ],
        metrics: {
          ...graphEvidence.metrics,
          notebookOpenWorkbenchVisible: true,
          readerSourceTitle: readerEvidence.sourceTitle,
          studyVisible: true,
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
    captureFailure(
      graphPage,
      outputDir,
      'stage846-graph-default-open-tour-retirement-and-help-corner-opt-in-after-stage845-failure-graph.png',
    ),
    captureFailure(
      homePage,
      outputDir,
      'stage846-graph-default-open-tour-retirement-and-help-corner-opt-in-after-stage845-failure-home.png',
    ),
    captureFailure(
      notebookPage,
      outputDir,
      'stage846-graph-default-open-tour-retirement-and-help-corner-opt-in-after-stage845-failure-notebook.png',
    ),
    captureFailure(
      readerPage,
      outputDir,
      'stage846-graph-default-open-tour-retirement-and-help-corner-opt-in-after-stage845-failure-reader.png',
    ),
    captureFailure(
      studyPage,
      outputDir,
      'stage846-graph-default-open-tour-retirement-and-help-corner-opt-in-after-stage845-failure-study.png',
    ),
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
