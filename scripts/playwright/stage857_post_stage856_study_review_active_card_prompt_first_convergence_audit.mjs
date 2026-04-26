import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureFocusedStudyEvidence,
  captureStudyRegressionEvidence,
  captureStudyReviewDashboardEvidence,
  desktopViewport,
  focusedViewport,
} from './study_review_dashboard_reset_shared.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE857_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE857_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE857_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE857_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE857_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE857_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage857-post-stage856-study-review-active-card-prompt-first-convergence-audit-failure.png'), {
  force: true,
})

const { browser, runtimeBrowser } = await launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
})

let studyPage
let focusedPage
let homePage
let graphPage
let notebookPage
let readerPage
try {
  studyPage = await browser.newPage({ viewport: desktopViewport })
  const studyEvidence = await captureStudyReviewDashboardEvidence({
    baseUrl,
    directory: outputDir,
    page: studyPage,
    stageLabel: 'Stage 857',
    stagePrefix: 'stage857',
  })

  focusedPage = await browser.newPage({ viewport: focusedViewport })
  const focusedEvidence = await captureFocusedStudyEvidence({
    baseUrl,
    directory: outputDir,
    page: focusedPage,
    stageLabel: 'Stage 857',
    stagePrefix: 'stage857',
  })

  homePage = await browser.newPage({ viewport: desktopViewport })
  graphPage = await browser.newPage({ viewport: desktopViewport })
  notebookPage = await browser.newPage({ viewport: desktopViewport })
  readerPage = await browser.newPage({ viewport: desktopViewport })
  const regressionEvidence = await captureStudyRegressionEvidence({
    baseUrl,
    directory: outputDir,
    graphPage,
    homePage,
    notebookPage,
    readerPage,
    stagePrefix: 'stage857',
  })

  if (regressionEvidence.metrics.notesSidebarVisible) {
    throw new Error('Stage 857 expected Notebook placement to stay embedded with no visible Notes sidebar entry.')
  }
  if (!regressionEvidence.metrics.homeVisible || !regressionEvidence.metrics.graphCanvasVisible || !regressionEvidence.metrics.notebookVisible) {
    throw new Error('Stage 857 expected Home, Graph, and Notebook regression surfaces to remain visible.')
  }

  await writeFile(
    path.join(outputDir, 'stage857-post-stage856-study-review-active-card-prompt-first-convergence-audit.json'),
    JSON.stringify(
      {
        auditFocus: [
          'wide Study Review proves prompt-first active-card ownership with one prompt surface',
          'answer-shown Review keeps answer and rating attached to the same card while Grounding owns evidence',
          'Questions fused lead band, Home, Graph, embedded Notebook, original-only Reader, and focused Reader-led Study remain regression-green',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          ...studyEvidence.captures,
          ...focusedEvidence.captures,
          ...regressionEvidence.captures,
        },
        desktopViewport,
        focusedViewport,
        headless,
        metrics: {
          ...studyEvidence.metrics,
          ...focusedEvidence.metrics,
          ...regressionEvidence.metrics,
        },
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
        path: path.join(outputDir, 'stage857-post-stage856-study-review-active-card-prompt-first-convergence-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (focusedPage && focusedPage !== studyPage) {
    await focusedPage
      .screenshot({
        path: path.join(outputDir, 'stage857-post-stage856-study-review-active-card-prompt-first-convergence-audit-failure-focused.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
