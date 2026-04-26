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
const outputDir = process.env.RECALL_STAGE824_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE824_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE824_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE824_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE824_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE824_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage824-home-hidden-control-ownership-unification-after-stage823-failure-home.png',
  'stage824-home-hidden-control-ownership-unification-after-stage823-failure-graph.png',
  'stage824-home-hidden-control-ownership-unification-after-stage823-failure-notebook.png',
  'stage824-home-hidden-control-ownership-unification-after-stage823-failure-reader.png',
  'stage824-home-hidden-control-ownership-unification-after-stage823-failure-study.png',
  'stage824-home-hidden-control-ownership-unification-after-stage823-failure-focused.png',
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
    stageLabel: 'Stage 824',
    stagePrefix: 'stage824',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage824-home-hidden-control-ownership-unification-after-stage823-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        focusedViewport,
        headless,
        implementationFocus: [
          'Stage 824 keeps Home as the active Recall-parity surface and retires the hidden organizer-control slab so collapsed Home is board-first instead of split between organizer chrome and board chrome.',
          'Collapsed overview, hidden Captures, and hidden Matches must all use the same board-owned toolbar with Search, Add, New note, List, and Sort while the organizer stays hidden.',
          'Organizer-specific controls now belong to the reopened organizer only; hidden Home should not reserve a second control seam or compact organizer deck in any loaded hidden path.',
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
    captureFailure(homePage, outputDir, 'stage824-home-hidden-control-ownership-unification-after-stage823-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage824-home-hidden-control-ownership-unification-after-stage823-failure-graph.png'),
    captureFailure(notebookPage, outputDir, 'stage824-home-hidden-control-ownership-unification-after-stage823-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage824-home-hidden-control-ownership-unification-after-stage823-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage824-home-hidden-control-ownership-unification-after-stage823-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage824-home-hidden-control-ownership-unification-after-stage823-failure-focused.png'),
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
