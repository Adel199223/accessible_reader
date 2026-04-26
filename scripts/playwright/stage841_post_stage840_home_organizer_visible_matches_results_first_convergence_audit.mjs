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
const outputDir = process.env.RECALL_STAGE841_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE841_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE841_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE841_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE841_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE841_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage841-post-stage840-home-organizer-visible-matches-results-first-convergence-audit-failure-home.png',
  'stage841-post-stage840-home-organizer-visible-matches-results-first-convergence-audit-failure-graph.png',
  'stage841-post-stage840-home-organizer-visible-matches-results-first-convergence-audit-failure-notebook.png',
  'stage841-post-stage840-home-organizer-visible-matches-results-first-convergence-audit-failure-reader.png',
  'stage841-post-stage840-home-organizer-visible-matches-results-first-convergence-audit-failure-study.png',
  'stage841-post-stage840-home-organizer-visible-matches-results-first-convergence-audit-failure-focused.png',
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
    stageLabel: 'Stage 841 audit',
    stagePrefix: 'stage841',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage841-post-stage840-home-organizer-visible-matches-results-first-convergence-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 841 audit must prove that organizer-visible Matches now reads as compact query-owned context in the rail instead of a standing filtered control deck.',
          'Organizer-visible Matches board mode must start with real result cards instead of the in-canvas Add tile, and zero-result filtered states must stay compact and clear-search oriented.',
          'The wider Stage 839 Home baseline must remain intact: organizer rail list rhythm, selected-board density and metadata, shared top band, single-row toolbar, footer below fold, hidden-state stability, and no clipping.',
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
    captureFailure(
      homePage,
      outputDir,
      'stage841-post-stage840-home-organizer-visible-matches-results-first-convergence-audit-failure-home.png',
    ),
    captureFailure(
      graphPage,
      outputDir,
      'stage841-post-stage840-home-organizer-visible-matches-results-first-convergence-audit-failure-graph.png',
    ),
    captureFailure(
      notebookPage,
      outputDir,
      'stage841-post-stage840-home-organizer-visible-matches-results-first-convergence-audit-failure-notebook.png',
    ),
    captureFailure(
      readerPage,
      outputDir,
      'stage841-post-stage840-home-organizer-visible-matches-results-first-convergence-audit-failure-reader.png',
    ),
    captureFailure(
      studyPage,
      outputDir,
      'stage841-post-stage840-home-organizer-visible-matches-results-first-convergence-audit-failure-study.png',
    ),
    captureFailure(
      focusedPage,
      outputDir,
      'stage841-post-stage840-home-organizer-visible-matches-results-first-convergence-audit-failure-focused.png',
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
