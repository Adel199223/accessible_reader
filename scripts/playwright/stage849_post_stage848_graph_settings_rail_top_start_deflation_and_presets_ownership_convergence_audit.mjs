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
const outputDir = process.env.RECALL_STAGE849_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE849_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE849_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE849_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE849_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE849_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage849-post-stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-audit-failure-graph.png',
  'stage849-post-stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-audit-failure-home.png',
  'stage849-post-stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-audit-failure-notebook.png',
  'stage849-post-stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-audit-failure-reader.png',
  'stage849-post-stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-audit-failure-study.png',
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
    stageLabel: 'Stage 849 audit',
    stagePrefix: 'stage849',
  })

  await openHome(homePage, baseUrl)
  const homeWideTop = await captureViewportScreenshot(homePage, outputDir, 'stage849-home-wide-top.png')

  await notebookPage.goto(`${baseUrl}/recall?section=notes`, { waitUntil: 'networkidle' })
  await notebookPage.getByRole('heading', { name: 'Notebook', exact: true }).waitFor({ state: 'visible', timeout: 20000 })
  const notebookWideTop = await captureViewportScreenshot(notebookPage, outputDir, 'stage849-notebook-wide-top.png')

  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage849', baseUrl)

  await studyPage.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  await studyPage.getByRole('tab', { name: 'Study', selected: true }).waitFor({ state: 'visible', timeout: 20000 })
  const studyWideTop = await captureViewportScreenshot(studyPage, outputDir, 'stage849-study-wide-top.png')

  await writeFile(
    path.join(
      outputDir,
      'stage849-post-stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'Graph should keep the Stage 847 canvas-first default-open baseline while the docked settings rail starts earlier and no longer reads like an intro card.',
          'The settings header helper copy should remain gone, and the Presets block should keep its summary inline with a smaller attached save affordance instead of a full-width hero control.',
          'Home, embedded Notebook, original-only Reader, and Study should remain stable regression surfaces beneath the refreshed Graph baseline.',
        ],
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
      'stage849-post-stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-audit-failure-graph.png',
    ),
    captureFailure(
      homePage,
      outputDir,
      'stage849-post-stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-audit-failure-home.png',
    ),
    captureFailure(
      notebookPage,
      outputDir,
      'stage849-post-stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-audit-failure-notebook.png',
    ),
    captureFailure(
      readerPage,
      outputDir,
      'stage849-post-stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-audit-failure-reader.png',
    ),
    captureFailure(
      studyPage,
      outputDir,
      'stage849-post-stage848-graph-settings-rail-top-start-deflation-and-presets-ownership-convergence-audit-failure-study.png',
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
