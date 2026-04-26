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
const outputDir = process.env.RECALL_STAGE848_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE848_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE848_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE848_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE848_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE848_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-after-stage847-failure-graph.png',
  'stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-after-stage847-failure-home.png',
  'stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-after-stage847-failure-notebook.png',
  'stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-after-stage847-failure-reader.png',
  'stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-after-stage847-failure-study.png',
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
    stageLabel: 'Stage 848 implementation',
    stagePrefix: 'stage848',
  })

  await openHome(homePage, baseUrl)
  const homeWideTop = await captureViewportScreenshot(homePage, outputDir, 'stage848-home-wide-top.png')

  await notebookPage.goto(`${baseUrl}/recall?section=notes`, { waitUntil: 'networkidle' })
  await notebookPage.getByRole('heading', { name: 'Notebook', exact: true }).waitFor({ state: 'visible', timeout: 20000 })
  const notebookWideTop = await captureViewportScreenshot(notebookPage, outputDir, 'stage848-notebook-wide-top.png')

  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage848', baseUrl)

  await studyPage.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  await studyPage.getByRole('tab', { name: 'Study', selected: true }).waitFor({ state: 'visible', timeout: 20000 })
  const studyWideTop = await captureViewportScreenshot(studyPage, outputDir, 'stage848-study-wide-top.png')

  await writeFile(
    path.join(
      outputDir,
      'stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-after-stage847-validation.json',
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
          'Graph keeps the canvas-first default-open baseline from Stage 847 while the docked settings rail starts earlier and reads like a flatter working control surface.',
          'The Graph settings header no longer carries the verbose helper copy, and the Presets block now keeps the active view summary inline with a smaller attached Save as preset action.',
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
      'stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-after-stage847-failure-graph.png',
    ),
    captureFailure(
      homePage,
      outputDir,
      'stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-after-stage847-failure-home.png',
    ),
    captureFailure(
      notebookPage,
      outputDir,
      'stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-after-stage847-failure-notebook.png',
    ),
    captureFailure(
      readerPage,
      outputDir,
      'stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-after-stage847-failure-reader.png',
    ),
    captureFailure(
      studyPage,
      outputDir,
      'stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-after-stage847-failure-study.png',
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
