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
const outputDir = process.env.RECALL_STAGE829_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE829_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE829_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE829_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE829_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE829_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage829-post-stage828-home-open-board-above-the-fold-density-lift-audit-failure-home.png',
  'stage829-post-stage828-home-open-board-above-the-fold-density-lift-audit-failure-graph.png',
  'stage829-post-stage828-home-open-board-above-the-fold-density-lift-audit-failure-notebook.png',
  'stage829-post-stage828-home-open-board-above-the-fold-density-lift-audit-failure-reader.png',
  'stage829-post-stage828-home-open-board-above-the-fold-density-lift-audit-failure-study.png',
  'stage829-post-stage828-home-open-board-above-the-fold-density-lift-audit-failure-focused.png',
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
    stageLabel: 'Stage 829 audit',
    stagePrefix: 'stage829',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage829-post-stage828-home-open-board-above-the-fold-density-lift-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 829 audit must prove that the default open organizer-visible Home board now reads as a denser above-the-fold working canvas rather than a roomy staged dashboard.',
          'At benchmark desktop width, the first visible open day-group row should fit at least four tiles across including the Add content tile, and the Add tile should no longer read as a hero slab relative to the source-card family.',
          'Hidden Home, Graph, embedded Notebook, original-only Reader, and Study remain regression surfaces while the open Home board stays the active parity benchmark.',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        focusedViewport,
        headless,
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
    captureFailure(homePage, outputDir, 'stage829-post-stage828-home-open-board-above-the-fold-density-lift-audit-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage829-post-stage828-home-open-board-above-the-fold-density-lift-audit-failure-graph.png'),
    captureFailure(notebookPage, outputDir, 'stage829-post-stage828-home-open-board-above-the-fold-density-lift-audit-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage829-post-stage828-home-open-board-above-the-fold-density-lift-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage829-post-stage828-home-open-board-above-the-fold-density-lift-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage829-post-stage828-home-open-board-above-the-fold-density-lift-audit-failure-focused.png'),
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
