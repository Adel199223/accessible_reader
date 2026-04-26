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
const outputDir = process.env.RECALL_STAGE823_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE823_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE823_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE823_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE823_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE823_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage823-post-stage822-home-hidden-selected-lane-retirement-audit-failure-home.png',
  'stage823-post-stage822-home-hidden-selected-lane-retirement-audit-failure-graph.png',
  'stage823-post-stage822-home-hidden-selected-lane-retirement-audit-failure-notebook.png',
  'stage823-post-stage822-home-hidden-selected-lane-retirement-audit-failure-reader.png',
  'stage823-post-stage822-home-hidden-selected-lane-retirement-audit-failure-study.png',
  'stage823-post-stage822-home-hidden-selected-lane-retirement-audit-failure-focused.png',
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
    stageLabel: 'Stage 823 audit',
    stagePrefix: 'stage823',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage823-post-stage822-home-hidden-selected-lane-retirement-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 823 audit must prove that collapsed Home keeps both the default hidden state and the hidden Captures state free of a legacy organizer lane.',
          'The hidden launcher shell must stay compact to the launcher button instead of exposing a tall hover-sensitive slab.',
          'Stage 819 organizer ownership, Reader reopen, Notebook reopen, Graph, and Study remain regression surfaces while Home stays the active parity surface.',
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
    captureFailure(homePage, outputDir, 'stage823-post-stage822-home-hidden-selected-lane-retirement-audit-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage823-post-stage822-home-hidden-selected-lane-retirement-audit-failure-graph.png'),
    captureFailure(notebookPage, outputDir, 'stage823-post-stage822-home-hidden-selected-lane-retirement-audit-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage823-post-stage822-home-hidden-selected-lane-retirement-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage823-post-stage822-home-hidden-selected-lane-retirement-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage823-post-stage822-home-hidden-selected-lane-retirement-audit-failure-focused.png'),
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
