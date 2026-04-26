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
const outputDir = process.env.RECALL_STAGE832_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE832_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE832_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE832_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE832_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE832_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage832-home-open-board-utility-cluster-single-row-convergence-after-stage831-failure-home.png',
  'stage832-home-open-board-utility-cluster-single-row-convergence-after-stage831-failure-graph.png',
  'stage832-home-open-board-utility-cluster-single-row-convergence-after-stage831-failure-notebook.png',
  'stage832-home-open-board-utility-cluster-single-row-convergence-after-stage831-failure-reader.png',
  'stage832-home-open-board-utility-cluster-single-row-convergence-after-stage831-failure-study.png',
  'stage832-home-open-board-utility-cluster-single-row-convergence-after-stage831-failure-focused.png',
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
    stageLabel: 'Stage 832',
    stagePrefix: 'stage832',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage832-home-open-board-utility-cluster-single-row-convergence-after-stage831-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        focusedViewport,
        headless,
        implementationFocus: [
          'Stage 832 keeps Home as the active Recall homepage benchmark and targets the remaining two-tier utility stack in organizer-visible open board mode instead of reopening hidden-state work or Reader chrome.',
          'Open Home must keep Search, Add, New note, List, and Sort in one shared toolbar row at benchmark desktop width while preserving the Stage 830 shared top band and the Stage 829 density lift.',
          'Organizer-visible open Matches must adopt the same single-row board toolbar model while hidden Home, Graph, embedded Notebook, original-only Reader, and Study remain regression surfaces.',
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
    captureFailure(homePage, outputDir, 'stage832-home-open-board-utility-cluster-single-row-convergence-after-stage831-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage832-home-open-board-utility-cluster-single-row-convergence-after-stage831-failure-graph.png'),
    captureFailure(notebookPage, outputDir, 'stage832-home-open-board-utility-cluster-single-row-convergence-after-stage831-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage832-home-open-board-utility-cluster-single-row-convergence-after-stage831-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage832-home-open-board-utility-cluster-single-row-convergence-after-stage831-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage832-home-open-board-utility-cluster-single-row-convergence-after-stage831-failure-focused.png'),
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
