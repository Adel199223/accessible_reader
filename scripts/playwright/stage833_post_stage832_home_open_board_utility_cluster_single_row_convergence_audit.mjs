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
const outputDir = process.env.RECALL_STAGE833_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE833_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE833_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE833_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE833_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE833_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage833-post-stage832-home-open-board-utility-cluster-single-row-convergence-audit-failure-home.png',
  'stage833-post-stage832-home-open-board-utility-cluster-single-row-convergence-audit-failure-graph.png',
  'stage833-post-stage832-home-open-board-utility-cluster-single-row-convergence-audit-failure-notebook.png',
  'stage833-post-stage832-home-open-board-utility-cluster-single-row-convergence-audit-failure-reader.png',
  'stage833-post-stage832-home-open-board-utility-cluster-single-row-convergence-audit-failure-study.png',
  'stage833-post-stage832-home-open-board-utility-cluster-single-row-convergence-audit-failure-focused.png',
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
    stageLabel: 'Stage 833 audit',
    stagePrefix: 'stage833',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage833-post-stage832-home-open-board-utility-cluster-single-row-convergence-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 833 audit must prove that organizer-visible open Home no longer lets List and Sort hang in a dedicated second toolbar row at benchmark desktop width.',
          'The first visible open board day header and the right-side utility cluster must still share one lead band while Search, Add, New note, List, and Sort read as one attached row in both the selected board and open Matches board paths.',
          'Hidden Home, Graph, embedded Notebook, original-only Reader, and Study remain regression surfaces while Home stays the active parity benchmark.',
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
    captureFailure(homePage, outputDir, 'stage833-post-stage832-home-open-board-utility-cluster-single-row-convergence-audit-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage833-post-stage832-home-open-board-utility-cluster-single-row-convergence-audit-failure-graph.png'),
    captureFailure(notebookPage, outputDir, 'stage833-post-stage832-home-open-board-utility-cluster-single-row-convergence-audit-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage833-post-stage832-home-open-board-utility-cluster-single-row-convergence-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage833-post-stage832-home-open-board-utility-cluster-single-row-convergence-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage833-post-stage832-home-open-board-utility-cluster-single-row-convergence-audit-failure-focused.png'),
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
