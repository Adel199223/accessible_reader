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
const outputDir = process.env.RECALL_STAGE835_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE835_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE835_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE835_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE835_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE835_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage835-post-stage834-home-open-board-continuation-fill-and-footer-pushdown-audit-failure-home.png',
  'stage835-post-stage834-home-open-board-continuation-fill-and-footer-pushdown-audit-failure-graph.png',
  'stage835-post-stage834-home-open-board-continuation-fill-and-footer-pushdown-audit-failure-notebook.png',
  'stage835-post-stage834-home-open-board-continuation-fill-and-footer-pushdown-audit-failure-reader.png',
  'stage835-post-stage834-home-open-board-continuation-fill-and-footer-pushdown-audit-failure-study.png',
  'stage835-post-stage834-home-open-board-continuation-fill-and-footer-pushdown-audit-failure-focused.png',
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
    stageLabel: 'Stage 835 audit',
    stagePrefix: 'stage835',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage835-post-stage834-home-open-board-continuation-fill-and-footer-pushdown-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 835 audit must prove that organizer-visible open Home now carries more real document tiles before the continuation footer and no longer surfaces Show all captures above the first benchmark viewport.',
          'The selected open board must keep its Stage 829 four-across density plus the Stage 830 and 832 shared top-band and single-row utility-cluster behavior while rendering a longer real continuation before the footer.',
          'Hidden Home, open Matches, Graph, embedded Notebook, original-only Reader, and Study remain regression surfaces while the open selected board stays the active Home parity benchmark.',
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
    captureFailure(homePage, outputDir, 'stage835-post-stage834-home-open-board-continuation-fill-and-footer-pushdown-audit-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage835-post-stage834-home-open-board-continuation-fill-and-footer-pushdown-audit-failure-graph.png'),
    captureFailure(notebookPage, outputDir, 'stage835-post-stage834-home-open-board-continuation-fill-and-footer-pushdown-audit-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage835-post-stage834-home-open-board-continuation-fill-and-footer-pushdown-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage835-post-stage834-home-open-board-continuation-fill-and-footer-pushdown-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage835-post-stage834-home-open-board-continuation-fill-and-footer-pushdown-audit-failure-focused.png'),
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
