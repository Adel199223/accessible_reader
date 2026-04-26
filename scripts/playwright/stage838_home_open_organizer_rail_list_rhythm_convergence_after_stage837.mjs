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
const outputDir = process.env.RECALL_STAGE838_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE838_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE838_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE838_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE838_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE838_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage838-home-open-organizer-rail-list-rhythm-convergence-after-stage837-failure-home.png',
  'stage838-home-open-organizer-rail-list-rhythm-convergence-after-stage837-failure-graph.png',
  'stage838-home-open-organizer-rail-list-rhythm-convergence-after-stage837-failure-notebook.png',
  'stage838-home-open-organizer-rail-list-rhythm-convergence-after-stage837-failure-reader.png',
  'stage838-home-open-organizer-rail-list-rhythm-convergence-after-stage837-failure-study.png',
  'stage838-home-open-organizer-rail-list-rhythm-convergence-after-stage837-failure-focused.png',
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
    stageLabel: 'Stage 838',
    stagePrefix: 'stage838',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage838-home-open-organizer-rail-list-rhythm-convergence-after-stage837-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        focusedViewport,
        headless,
        implementationFocus: [
          'Stage 838 keeps Home as the active Recall homepage benchmark and stays on the organizer-visible default board rather than reopening hidden-state ownership or Reader chrome.',
          'The organizer rail must flatten the active selected row, attach the preview handoff as part of that same selected item, and tighten the header-to-list start so the rail reads like one continuous list.',
          'Open selected-board density, shared top band, single-row toolbar, footer pushdown, and selected-card metadata deduplication stay intact, while open Matches, hidden Home, Graph, embedded Notebook, original-only Reader, and Study remain regression surfaces.',
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
    captureFailure(
      homePage,
      outputDir,
      'stage838-home-open-organizer-rail-list-rhythm-convergence-after-stage837-failure-home.png',
    ),
    captureFailure(
      graphPage,
      outputDir,
      'stage838-home-open-organizer-rail-list-rhythm-convergence-after-stage837-failure-graph.png',
    ),
    captureFailure(
      notebookPage,
      outputDir,
      'stage838-home-open-organizer-rail-list-rhythm-convergence-after-stage837-failure-notebook.png',
    ),
    captureFailure(
      readerPage,
      outputDir,
      'stage838-home-open-organizer-rail-list-rhythm-convergence-after-stage837-failure-reader.png',
    ),
    captureFailure(
      studyPage,
      outputDir,
      'stage838-home-open-organizer-rail-list-rhythm-convergence-after-stage837-failure-study.png',
    ),
    captureFailure(
      focusedPage,
      outputDir,
      'stage838-home-open-organizer-rail-list-rhythm-convergence-after-stage837-failure-focused.png',
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
