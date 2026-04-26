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
const outputDir = process.env.RECALL_STAGE819_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE819_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE819_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE819_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE819_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE819_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage819-post-stage818-home-organizer-shell-reopen-and-ownership-correction-audit-failure-home.png',
  'stage819-post-stage818-home-organizer-shell-reopen-and-ownership-correction-audit-failure-graph.png',
  'stage819-post-stage818-home-organizer-shell-reopen-and-ownership-correction-audit-failure-notebook.png',
  'stage819-post-stage818-home-organizer-shell-reopen-and-ownership-correction-audit-failure-reader.png',
  'stage819-post-stage818-home-organizer-shell-reopen-and-ownership-correction-audit-failure-study.png',
  'stage819-post-stage818-home-organizer-shell-reopen-and-ownership-correction-audit-failure-focused.png',
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
    stageLabel: 'Stage 819 audit',
    stagePrefix: 'stage819',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage819-post-stage818-home-organizer-shell-reopen-and-ownership-correction-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 819 audit must prove that Home organizer shell ownership is corrected without undoing the calmer seam and clipping work from Stage 696/697.',
          'The organizer header must keep clear title ownership, the collapsed launcher must stay top anchored, and the organizer list must begin directly under the header.',
          'Graph, embedded Notebook, Reader, and Study remain regression captures while Home reopens as the higher-leverage parity surface.',
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
    captureFailure(homePage, outputDir, 'stage819-post-stage818-home-organizer-shell-reopen-and-ownership-correction-audit-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage819-post-stage818-home-organizer-shell-reopen-and-ownership-correction-audit-failure-graph.png'),
    captureFailure(notebookPage, outputDir, 'stage819-post-stage818-home-organizer-shell-reopen-and-ownership-correction-audit-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage819-post-stage818-home-organizer-shell-reopen-and-ownership-correction-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage819-post-stage818-home-organizer-shell-reopen-and-ownership-correction-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage819-post-stage818-home-organizer-shell-reopen-and-ownership-correction-audit-failure-focused.png'),
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
