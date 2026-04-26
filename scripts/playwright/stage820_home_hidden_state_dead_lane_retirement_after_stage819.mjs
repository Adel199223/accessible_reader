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
const outputDir = process.env.RECALL_STAGE820_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE820_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE820_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE820_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE820_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE820_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage820-home-hidden-state-dead-lane-retirement-after-stage819-failure-home.png',
  'stage820-home-hidden-state-dead-lane-retirement-after-stage819-failure-graph.png',
  'stage820-home-hidden-state-dead-lane-retirement-after-stage819-failure-notebook.png',
  'stage820-home-hidden-state-dead-lane-retirement-after-stage819-failure-reader.png',
  'stage820-home-hidden-state-dead-lane-retirement-after-stage819-failure-study.png',
  'stage820-home-hidden-state-dead-lane-retirement-after-stage819-failure-focused.png',
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
    stageLabel: 'Stage 820',
    stagePrefix: 'stage820',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage820-home-hidden-state-dead-lane-retirement-after-stage819-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        focusedViewport,
        headless,
        implementationFocus: [
          'Stage 820 keeps Home as the active high-leverage surface and removes the hidden-state dead companion lane instead of reopening another Reader micro-pass.',
          'Collapsed Home now keeps nearby Continue or Next-source support inline above the board instead of reserving a second hidden side track.',
          'The Stage 819 organizer-shell ownership fixes stay intact while the new audit proves the launcher lane stays narrow and the board begins immediately beside it.',
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
    captureFailure(homePage, outputDir, 'stage820-home-hidden-state-dead-lane-retirement-after-stage819-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage820-home-hidden-state-dead-lane-retirement-after-stage819-failure-graph.png'),
    captureFailure(notebookPage, outputDir, 'stage820-home-hidden-state-dead-lane-retirement-after-stage819-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage820-home-hidden-state-dead-lane-retirement-after-stage819-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage820-home-hidden-state-dead-lane-retirement-after-stage819-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage820-home-hidden-state-dead-lane-retirement-after-stage819-failure-focused.png'),
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
