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
const outputDir = process.env.RECALL_STAGE839_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE839_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE839_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE839_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE839_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE839_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage839-post-stage838-home-open-organizer-rail-list-rhythm-convergence-audit-failure-home.png',
  'stage839-post-stage838-home-open-organizer-rail-list-rhythm-convergence-audit-failure-graph.png',
  'stage839-post-stage838-home-open-organizer-rail-list-rhythm-convergence-audit-failure-notebook.png',
  'stage839-post-stage838-home-open-organizer-rail-list-rhythm-convergence-audit-failure-reader.png',
  'stage839-post-stage838-home-open-organizer-rail-list-rhythm-convergence-audit-failure-study.png',
  'stage839-post-stage838-home-open-organizer-rail-list-rhythm-convergence-audit-failure-focused.png',
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
    stageLabel: 'Stage 839 audit',
    stagePrefix: 'stage839',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage839-post-stage838-home-open-organizer-rail-list-rhythm-convergence-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 839 audit must prove that the organizer-visible Home rail now treats the active selected row as one flatter list-owned item instead of a panel-like button plus detached preview row.',
          'The active preview handoff must stay visible and attached to that same selected row, while the organizer header still stays unclipped and the list begins directly beneath it.',
          'The Stage 829-837 open-board density, top band, single-row toolbar, footer pushdown, and selected-card metadata deduplication must remain intact, while hidden Home, open Matches, Graph, embedded Notebook, original-only Reader, and Study stay stable.',
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
      'stage839-post-stage838-home-open-organizer-rail-list-rhythm-convergence-audit-failure-home.png',
    ),
    captureFailure(
      graphPage,
      outputDir,
      'stage839-post-stage838-home-open-organizer-rail-list-rhythm-convergence-audit-failure-graph.png',
    ),
    captureFailure(
      notebookPage,
      outputDir,
      'stage839-post-stage838-home-open-organizer-rail-list-rhythm-convergence-audit-failure-notebook.png',
    ),
    captureFailure(
      readerPage,
      outputDir,
      'stage839-post-stage838-home-open-organizer-rail-list-rhythm-convergence-audit-failure-reader.png',
    ),
    captureFailure(
      studyPage,
      outputDir,
      'stage839-post-stage838-home-open-organizer-rail-list-rhythm-convergence-audit-failure-study.png',
    ),
    captureFailure(
      focusedPage,
      outputDir,
      'stage839-post-stage838-home-open-organizer-rail-list-rhythm-convergence-audit-failure-focused.png',
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
