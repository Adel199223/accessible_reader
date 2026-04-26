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
const outputDir = process.env.RECALL_STAGE822_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE822_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE822_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE822_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE822_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE822_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage822-home-hidden-selected-lane-retirement-after-stage821-failure-home.png',
  'stage822-home-hidden-selected-lane-retirement-after-stage821-failure-graph.png',
  'stage822-home-hidden-selected-lane-retirement-after-stage821-failure-notebook.png',
  'stage822-home-hidden-selected-lane-retirement-after-stage821-failure-reader.png',
  'stage822-home-hidden-selected-lane-retirement-after-stage821-failure-study.png',
  'stage822-home-hidden-selected-lane-retirement-after-stage821-failure-focused.png',
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
    stageLabel: 'Stage 822',
    stagePrefix: 'stage822',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage822-home-hidden-selected-lane-retirement-after-stage821-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        focusedViewport,
        headless,
        implementationFocus: [
          'Stage 822 closes the hidden Home path the user still surfaced after Stage 821: the hidden Captures view must not reserve a legacy organizer lane in the middle of the page.',
          'The hidden launcher shell now has to stay compact to the launcher button itself instead of acting like a tall hover target through the lane.',
          'The audit now covers both the default collapsed Home state and the selected hidden Captures state so the missed path cannot quietly regress again.',
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
    captureFailure(homePage, outputDir, 'stage822-home-hidden-selected-lane-retirement-after-stage821-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage822-home-hidden-selected-lane-retirement-after-stage821-failure-graph.png'),
    captureFailure(notebookPage, outputDir, 'stage822-home-hidden-selected-lane-retirement-after-stage821-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage822-home-hidden-selected-lane-retirement-after-stage821-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage822-home-hidden-selected-lane-retirement-after-stage821-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage822-home-hidden-selected-lane-retirement-after-stage821-failure-focused.png'),
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
