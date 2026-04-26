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
const outputDir = process.env.RECALL_STAGE826_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE826_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE826_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE826_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE826_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE826_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage826-home-hidden-reopen-shelf-strip-compaction-after-stage825-failure-home.png',
  'stage826-home-hidden-reopen-shelf-strip-compaction-after-stage825-failure-graph.png',
  'stage826-home-hidden-reopen-shelf-strip-compaction-after-stage825-failure-notebook.png',
  'stage826-home-hidden-reopen-shelf-strip-compaction-after-stage825-failure-reader.png',
  'stage826-home-hidden-reopen-shelf-strip-compaction-after-stage825-failure-study.png',
  'stage826-home-hidden-reopen-shelf-strip-compaction-after-stage825-failure-focused.png',
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
    stageLabel: 'Stage 826',
    stagePrefix: 'stage826',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage826-home-hidden-reopen-shelf-strip-compaction-after-stage825-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        focusedViewport,
        headless,
        implementationFocus: [
          'Stage 826 keeps Home as the active Recall-parity surface and replaces the tall hidden reopen shelf with one thin board-owned strip directly under the shared toolbar.',
          'Collapsed overview, hidden Captures, and hidden Matches must all keep the same compact hidden reopen strip while the launcher stays top anchored and the board-first hidden layout remains intact.',
          'The hidden at-rest surface should no longer show the old lead card or an always-visible nearby grid; nearby sources should remain accessible only through the inline disclosure inside the compact strip.',
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
    captureFailure(homePage, outputDir, 'stage826-home-hidden-reopen-shelf-strip-compaction-after-stage825-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage826-home-hidden-reopen-shelf-strip-compaction-after-stage825-failure-graph.png'),
    captureFailure(notebookPage, outputDir, 'stage826-home-hidden-reopen-shelf-strip-compaction-after-stage825-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage826-home-hidden-reopen-shelf-strip-compaction-after-stage825-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage826-home-hidden-reopen-shelf-strip-compaction-after-stage825-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage826-home-hidden-reopen-shelf-strip-compaction-after-stage825-failure-focused.png'),
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
