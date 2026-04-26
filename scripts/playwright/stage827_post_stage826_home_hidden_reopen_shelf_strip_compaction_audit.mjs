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
const outputDir = process.env.RECALL_STAGE827_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE827_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE827_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE827_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE827_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE827_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage827-post-stage826-home-hidden-reopen-shelf-strip-compaction-audit-failure-home.png',
  'stage827-post-stage826-home-hidden-reopen-shelf-strip-compaction-audit-failure-graph.png',
  'stage827-post-stage826-home-hidden-reopen-shelf-strip-compaction-audit-failure-notebook.png',
  'stage827-post-stage826-home-hidden-reopen-shelf-strip-compaction-audit-failure-reader.png',
  'stage827-post-stage826-home-hidden-reopen-shelf-strip-compaction-audit-failure-study.png',
  'stage827-post-stage826-home-hidden-reopen-shelf-strip-compaction-audit-failure-focused.png',
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
    stageLabel: 'Stage 827 audit',
    stagePrefix: 'stage827',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage827-post-stage826-home-hidden-reopen-shelf-strip-compaction-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 827 audit must prove that hidden Home now keeps a compact board-owned reopen strip instead of the taller lead-card shelf in overview, hidden Captures, and hidden Matches.',
          'The hidden reopen surface should stay compact at rest, avoid the old always-visible nearby grid, and keep nearby sources behind the inline disclosure inside the same strip.',
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
    captureFailure(homePage, outputDir, 'stage827-post-stage826-home-hidden-reopen-shelf-strip-compaction-audit-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage827-post-stage826-home-hidden-reopen-shelf-strip-compaction-audit-failure-graph.png'),
    captureFailure(notebookPage, outputDir, 'stage827-post-stage826-home-hidden-reopen-shelf-strip-compaction-audit-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage827-post-stage826-home-hidden-reopen-shelf-strip-compaction-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage827-post-stage826-home-hidden-reopen-shelf-strip-compaction-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage827-post-stage826-home-hidden-reopen-shelf-strip-compaction-audit-failure-focused.png'),
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
