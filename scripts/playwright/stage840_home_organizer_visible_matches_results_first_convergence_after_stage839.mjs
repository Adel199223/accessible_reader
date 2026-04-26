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
const outputDir = process.env.RECALL_STAGE840_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE840_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE840_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE840_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE840_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE840_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage840-home-organizer-visible-matches-results-first-convergence-after-stage839-failure-home.png',
  'stage840-home-organizer-visible-matches-results-first-convergence-after-stage839-failure-graph.png',
  'stage840-home-organizer-visible-matches-results-first-convergence-after-stage839-failure-notebook.png',
  'stage840-home-organizer-visible-matches-results-first-convergence-after-stage839-failure-reader.png',
  'stage840-home-organizer-visible-matches-results-first-convergence-after-stage839-failure-study.png',
  'stage840-home-organizer-visible-matches-results-first-convergence-after-stage839-failure-focused.png',
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
    stageLabel: 'Stage 840',
    stagePrefix: 'stage840',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage840-home-organizer-visible-matches-results-first-convergence-after-stage839-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        focusedViewport,
        headless,
        implementationFocus: [
          'Stage 840 keeps Home as the active Recall homepage benchmark, but shifts the bounded parity correction from the default selected board to organizer-visible Matches.',
          'Organizer-visible Matches must flatten the rail into a compact query-owned summary instead of leaving a standing filtered control deck visible at rest.',
          'Organizer-visible Matches board mode must start with real result cards instead of the in-canvas Add tile, while zero-result filtered states stay compact and clear-search oriented without disturbing the wider Stage 839 Home baseline.',
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
      'stage840-home-organizer-visible-matches-results-first-convergence-after-stage839-failure-home.png',
    ),
    captureFailure(
      graphPage,
      outputDir,
      'stage840-home-organizer-visible-matches-results-first-convergence-after-stage839-failure-graph.png',
    ),
    captureFailure(
      notebookPage,
      outputDir,
      'stage840-home-organizer-visible-matches-results-first-convergence-after-stage839-failure-notebook.png',
    ),
    captureFailure(
      readerPage,
      outputDir,
      'stage840-home-organizer-visible-matches-results-first-convergence-after-stage839-failure-reader.png',
    ),
    captureFailure(
      studyPage,
      outputDir,
      'stage840-home-organizer-visible-matches-results-first-convergence-after-stage839-failure-study.png',
    ),
    captureFailure(
      focusedPage,
      outputDir,
      'stage840-home-organizer-visible-matches-results-first-convergence-after-stage839-failure-focused.png',
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
