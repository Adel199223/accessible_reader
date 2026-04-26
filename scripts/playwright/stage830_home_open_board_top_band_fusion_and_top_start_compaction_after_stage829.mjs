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
const outputDir = process.env.RECALL_STAGE830_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE830_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE830_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE830_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE830_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE830_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage830-home-open-board-top-band-fusion-and-top-start-compaction-after-stage829-failure-home.png',
  'stage830-home-open-board-top-band-fusion-and-top-start-compaction-after-stage829-failure-graph.png',
  'stage830-home-open-board-top-band-fusion-and-top-start-compaction-after-stage829-failure-notebook.png',
  'stage830-home-open-board-top-band-fusion-and-top-start-compaction-after-stage829-failure-reader.png',
  'stage830-home-open-board-top-band-fusion-and-top-start-compaction-after-stage829-failure-study.png',
  'stage830-home-open-board-top-band-fusion-and-top-start-compaction-after-stage829-failure-focused.png',
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
    stageLabel: 'Stage 830',
    stagePrefix: 'stage830',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage830-home-open-board-top-band-fusion-and-top-start-compaction-after-stage829-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        focusedViewport,
        headless,
        implementationFocus: [
          'Stage 830 keeps Home as the active Recall homepage benchmark and targets the remaining open-board top-start gap rather than reopening hidden-state work or another Reader micro-pass.',
          'The first visible open Home day-group header and the board toolbar must share one lead band so the toolbar no longer consumes its own row above the board content.',
          'The open board should start materially earlier above the fold while preserving the Stage 829 four-across density model, the board toolbar actions, chronology, and organizer ownership.',
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
    captureFailure(homePage, outputDir, 'stage830-home-open-board-top-band-fusion-and-top-start-compaction-after-stage829-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage830-home-open-board-top-band-fusion-and-top-start-compaction-after-stage829-failure-graph.png'),
    captureFailure(notebookPage, outputDir, 'stage830-home-open-board-top-band-fusion-and-top-start-compaction-after-stage829-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage830-home-open-board-top-band-fusion-and-top-start-compaction-after-stage829-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage830-home-open-board-top-band-fusion-and-top-start-compaction-after-stage829-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage830-home-open-board-top-band-fusion-and-top-start-compaction-after-stage829-failure-focused.png'),
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
