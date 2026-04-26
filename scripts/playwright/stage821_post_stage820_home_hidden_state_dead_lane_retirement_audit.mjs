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
const outputDir = process.env.RECALL_STAGE821_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE821_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE821_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE821_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE821_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE821_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage821-post-stage820-home-hidden-state-dead-lane-retirement-audit-failure-home.png',
  'stage821-post-stage820-home-hidden-state-dead-lane-retirement-audit-failure-graph.png',
  'stage821-post-stage820-home-hidden-state-dead-lane-retirement-audit-failure-notebook.png',
  'stage821-post-stage820-home-hidden-state-dead-lane-retirement-audit-failure-reader.png',
  'stage821-post-stage820-home-hidden-state-dead-lane-retirement-audit-failure-study.png',
  'stage821-post-stage820-home-hidden-state-dead-lane-retirement-audit-failure-focused.png',
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
    stageLabel: 'Stage 821 audit',
    stagePrefix: 'stage821',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage821-post-stage820-home-hidden-state-dead-lane-retirement-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 821 audit must prove that collapsed Home no longer reserves a dead companion lane and that Continue or Next-source support stays inline above the board.',
          'The earlier organizer-shell ownership wins from Stage 819 must remain intact: no header overlap, a top-anchored launcher, and a top-owned organizer list.',
          'Graph, embedded Notebook, original-only Reader, and Study remain regression captures while Home stays the active parity surface.',
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
    captureFailure(homePage, outputDir, 'stage821-post-stage820-home-hidden-state-dead-lane-retirement-audit-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage821-post-stage820-home-hidden-state-dead-lane-retirement-audit-failure-graph.png'),
    captureFailure(notebookPage, outputDir, 'stage821-post-stage820-home-hidden-state-dead-lane-retirement-audit-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage821-post-stage820-home-hidden-state-dead-lane-retirement-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage821-post-stage820-home-hidden-state-dead-lane-retirement-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage821-post-stage820-home-hidden-state-dead-lane-retirement-audit-failure-focused.png'),
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
