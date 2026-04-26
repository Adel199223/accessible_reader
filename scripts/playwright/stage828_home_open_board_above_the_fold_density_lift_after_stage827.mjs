import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureHomeOrganizerErgonomicsEvidence,
  desktopViewport,
  focusedViewport,
} from './home_organizer_ergonomics_shared.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE828_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE828_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE828_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE828_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE828_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE828_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage828-home-open-board-above-the-fold-density-lift-after-stage827-failure-home.png',
  'stage828-home-open-board-above-the-fold-density-lift-after-stage827-failure-graph.png',
  'stage828-home-open-board-above-the-fold-density-lift-after-stage827-failure-notebook.png',
  'stage828-home-open-board-above-the-fold-density-lift-after-stage827-failure-reader.png',
  'stage828-home-open-board-above-the-fold-density-lift-after-stage827-failure-study.png',
  'stage828-home-open-board-above-the-fold-density-lift-after-stage827-failure-focused.png',
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
let graphPage
let notebookPage
let readerPage
let studyPage
let focusedPage
try {
  homePage = await browser.newPage({ viewport: desktopViewport })
  graphPage = await browser.newPage({ viewport: desktopViewport })
  notebookPage = await browser.newPage({ viewport: desktopViewport })
  readerPage = await browser.newPage({ viewport: desktopViewport })
  studyPage = await browser.newPage({ viewport: desktopViewport })
  focusedPage = await browser.newPage({ viewport: focusedViewport })

  const evidence = await captureHomeOrganizerErgonomicsEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage,
    notebookPage,
    readerPage,
    stageLabel: 'Stage 828',
    stagePrefix: 'stage828',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage828-home-open-board-above-the-fold-density-lift-after-stage827-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        focusedViewport,
        headless,
        implementationFocus: [
          'Stage 828 keeps Home as the active Recall homepage benchmark and densifies the default open organizer-visible board rather than reopening another hidden-state correction or Reader micro-pass.',
          'The first visible open day group must fit at least four tiles across at benchmark width, counting the Add content tile, while the board keeps its current chronology model and organizer ownership.',
          'The Add content tile and the source poster cards should both shorten together so the above-the-fold canvas feels denser, less staged, and more Recall-like without changing card behavior or the toolbar cluster.',
        ],
        metrics: evidence.metrics,
        runtimeBrowser,
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  await Promise.all([
    captureFailure(homePage, outputDir, 'stage828-home-open-board-above-the-fold-density-lift-after-stage827-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage828-home-open-board-above-the-fold-density-lift-after-stage827-failure-graph.png'),
    captureFailure(notebookPage, outputDir, 'stage828-home-open-board-above-the-fold-density-lift-after-stage827-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage828-home-open-board-above-the-fold-density-lift-after-stage827-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage828-home-open-board-above-the-fold-density-lift-after-stage827-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage828-home-open-board-above-the-fold-density-lift-after-stage827-failure-focused.png'),
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
