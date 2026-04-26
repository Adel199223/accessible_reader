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
const outputDir = process.env.RECALL_STAGE868_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE868_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE868_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE868_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE868_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE868_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage868-home-open-board-card-scanability-and-preview-differentiation-after-stage867-failure-home.png',
  'stage868-home-open-board-card-scanability-and-preview-differentiation-after-stage867-failure-graph.png',
  'stage868-home-open-board-card-scanability-and-preview-differentiation-after-stage867-failure-notebook.png',
  'stage868-home-open-board-card-scanability-and-preview-differentiation-after-stage867-failure-reader.png',
  'stage868-home-open-board-card-scanability-and-preview-differentiation-after-stage867-failure-study.png',
  'stage868-home-open-board-card-scanability-and-preview-differentiation-after-stage867-failure-focused.png',
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
    stageLabel: 'Stage 868 implementation',
    stagePrefix: 'stage868',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage868-home-open-board-card-scanability-and-preview-differentiation-after-stage867-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 868 implementation must make organizer-visible Home board cards easier to distinguish above the fold.',
          'Local capture cards with repeated content-rendered preview chrome should expose text-first hybrid preview ownership while preserving meaningful rendered image previews.',
          'The Stage 845 Home density, top-band, organizer, Matches, hidden-state, and no-clipping baselines must remain intact, with Reader short-document support-open continuity kept as a regression surface.',
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
      'stage868-home-open-board-card-scanability-and-preview-differentiation-after-stage867-failure-home.png',
    ),
    captureFailure(
      graphPage,
      outputDir,
      'stage868-home-open-board-card-scanability-and-preview-differentiation-after-stage867-failure-graph.png',
    ),
    captureFailure(
      notebookPage,
      outputDir,
      'stage868-home-open-board-card-scanability-and-preview-differentiation-after-stage867-failure-notebook.png',
    ),
    captureFailure(
      readerPage,
      outputDir,
      'stage868-home-open-board-card-scanability-and-preview-differentiation-after-stage867-failure-reader.png',
    ),
    captureFailure(
      studyPage,
      outputDir,
      'stage868-home-open-board-card-scanability-and-preview-differentiation-after-stage867-failure-study.png',
    ),
    captureFailure(
      focusedPage,
      outputDir,
      'stage868-home-open-board-card-scanability-and-preview-differentiation-after-stage867-failure-focused.png',
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
