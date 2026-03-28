import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureCloseoutBaselineEvidence,
  desktopViewport,
  focusedViewport,
  launchBrowserContext,
} from './closeout_baseline_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE707_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE707_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE707_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE707_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE707_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE707_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage707-closeout-audit-failure.png'), { force: true })

const { browser, runtimeBrowser } = await launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
})

let studyPage
let focusedStudyPage
let homePage
let graphPage
let notebookPage
let originalReaderPage
let generatedReaderPage
try {
  studyPage = await browser.newPage({ viewport: desktopViewport })
  focusedStudyPage = await browser.newPage({ viewport: focusedViewport })
  homePage = await browser.newPage({ viewport: desktopViewport })
  graphPage = await browser.newPage({ viewport: desktopViewport })
  notebookPage = await browser.newPage({ viewport: desktopViewport })
  originalReaderPage = await browser.newPage({ viewport: desktopViewport })
  generatedReaderPage = await browser.newPage({ viewport: desktopViewport })

  const evidence = await captureCloseoutBaselineEvidence({
    baseUrl,
    directory: outputDir,
    focusedStudyPage,
    generatedReaderPage,
    graphPage,
    homePage,
    notebookPage,
    originalReaderPage,
    stageLabel: 'Stage 707',
    stagePrefix: 'stage707',
    studyPage,
  })

  if (!evidence.metrics.homeVisible || !evidence.metrics.graphCanvasVisible || !evidence.metrics.notebookVisible) {
    throw new Error('Stage 707 expected Home, Graph, and embedded Notebook to remain visible after closeout cleanup.')
  }
  if (evidence.metrics.notesSidebarVisible) {
    throw new Error('Stage 707 expected no visible Notes sidebar entry after closeout cleanup.')
  }
  if (!evidence.metrics.originalReaderVisible) {
    throw new Error('Stage 707 expected the original Reader workspace to remain visible.')
  }
  if (evidence.metrics.originalDerivedContextVisible !== false) {
    throw new Error('Stage 707 expected Original Reader mode to remain free of derived context chrome.')
  }
  if (!evidence.metrics.summaryDerivedContextVisible || !evidence.metrics.summaryInlineDetailVisible) {
    throw new Error('Stage 707 expected Summary mode to keep the inline derived context and detail control.')
  }
  if (evidence.metrics.summarySettingsDetailVisible) {
    throw new Error('Stage 707 expected Summary detail to stay out of the settings drawer.')
  }
  if (!evidence.metrics.dashboardVisible || evidence.metrics.selectedStudyView !== 'Review') {
    throw new Error(`Stage 707 expected Study to open on the review dashboard, found ${evidence.metrics.selectedStudyView}.`)
  }
  if (evidence.metrics.questionManagerHeading !== 'Questions' || !evidence.metrics.goodRatingVisible) {
    throw new Error('Stage 707 expected the Study question manager and answer rating flow to remain stable.')
  }
  if (!evidence.metrics.studyQueueVisible || !evidence.metrics.focusedGoodRatingVisible) {
    throw new Error('Stage 707 expected the focused Study split to remain stable after reveal.')
  }

  await writeFile(
    path.join(outputDir, 'stage707-post-stage706-closeout-baseline-audit.json'),
    JSON.stringify(
      {
        auditFocus: [
          'final cross-surface closeout baseline across Home, Graph, Notebook, Reader original/generated, and Study',
          'proof that stale Study shell cleanup did not regress the settled parity surfaces',
          'evidence that the queued roadmap can return to explicit user-directed reopens only after this audit',
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
  if (studyPage) {
    await studyPage
      .screenshot({
        path: path.join(outputDir, 'stage707-closeout-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
