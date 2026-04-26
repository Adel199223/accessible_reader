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
const outputDir = process.env.RECALL_STAGE834_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE834_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE834_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE834_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE834_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE834_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage834-home-open-board-continuation-fill-and-footer-pushdown-after-stage833-failure-home.png',
  'stage834-home-open-board-continuation-fill-and-footer-pushdown-after-stage833-failure-graph.png',
  'stage834-home-open-board-continuation-fill-and-footer-pushdown-after-stage833-failure-notebook.png',
  'stage834-home-open-board-continuation-fill-and-footer-pushdown-after-stage833-failure-reader.png',
  'stage834-home-open-board-continuation-fill-and-footer-pushdown-after-stage833-failure-study.png',
  'stage834-home-open-board-continuation-fill-and-footer-pushdown-after-stage833-failure-focused.png',
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
    stageLabel: 'Stage 834',
    stagePrefix: 'stage834',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage834-home-open-board-continuation-fill-and-footer-pushdown-after-stage833-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        focusedViewport,
        headless,
        implementationFocus: [
          'Stage 834 keeps Home as the active Recall homepage benchmark and targets the organizer-visible default open board instead of reopening hidden-state ownership or Reader chrome.',
          'Open Home must carry more real document tiles before the continuation footer so Show all captures drops below the first benchmark viewport without undoing the Stage 829 density lift or the Stage 830 and 832 shared top-band and toolbar convergence.',
          'Hidden Home, hidden Captures, hidden Matches, open Matches, Graph, embedded Notebook, original-only Reader, and Study remain regression surfaces while the selected open board becomes a more continuous working canvas.',
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
    captureFailure(homePage, outputDir, 'stage834-home-open-board-continuation-fill-and-footer-pushdown-after-stage833-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage834-home-open-board-continuation-fill-and-footer-pushdown-after-stage833-failure-graph.png'),
    captureFailure(notebookPage, outputDir, 'stage834-home-open-board-continuation-fill-and-footer-pushdown-after-stage833-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage834-home-open-board-continuation-fill-and-footer-pushdown-after-stage833-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage834-home-open-board-continuation-fill-and-footer-pushdown-after-stage833-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage834-home-open-board-continuation-fill-and-footer-pushdown-after-stage833-failure-focused.png'),
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
