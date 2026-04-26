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
const outputDir = process.env.RECALL_STAGE825_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE825_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE825_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE825_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE825_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE825_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage825-post-stage824-home-hidden-control-ownership-unification-audit-failure-home.png',
  'stage825-post-stage824-home-hidden-control-ownership-unification-audit-failure-graph.png',
  'stage825-post-stage824-home-hidden-control-ownership-unification-audit-failure-notebook.png',
  'stage825-post-stage824-home-hidden-control-ownership-unification-audit-failure-reader.png',
  'stage825-post-stage824-home-hidden-control-ownership-unification-audit-failure-study.png',
  'stage825-post-stage824-home-hidden-control-ownership-unification-audit-failure-focused.png',
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
    stageLabel: 'Stage 825 audit',
    stagePrefix: 'stage825',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage825-post-stage824-home-hidden-control-ownership-unification-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 825 audit must prove that hidden Home no longer splits ownership between a compact organizer deck and the board toolbar in any loaded hidden path.',
          'Collapsed overview, hidden Captures, and hidden Matches should all expose the same board-first toolbar while keeping organizer-specific controls out of the hidden surface.',
          'Home remains the active parity surface while Graph, embedded Notebook, original-only Reader, and Study stay green as regression captures in the same live run.',
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
    captureFailure(homePage, outputDir, 'stage825-post-stage824-home-hidden-control-ownership-unification-audit-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage825-post-stage824-home-hidden-control-ownership-unification-audit-failure-graph.png'),
    captureFailure(notebookPage, outputDir, 'stage825-post-stage824-home-hidden-control-ownership-unification-audit-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage825-post-stage824-home-hidden-control-ownership-unification-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage825-post-stage824-home-hidden-control-ownership-unification-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage825-post-stage824-home-hidden-control-ownership-unification-audit-failure-focused.png'),
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
