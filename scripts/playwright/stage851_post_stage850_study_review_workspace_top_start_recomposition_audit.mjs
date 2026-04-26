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
const outputDir = process.env.RECALL_STAGE851_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE851_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE851_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE851_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE851_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE851_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage851-post-stage850-study-review-workspace-top-start-audit-failure.png'), {
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
    stageLabel: 'Stage 851',
    stagePrefix: 'stage851',
  })

  focusedPage = await browser.newPage({ viewport: focusedViewport })
  const focusedEvidence = await captureFocusedStudyEvidence({
    baseUrl,
    directory: outputDir,
    page: focusedPage,
    stageLabel: 'Stage 851',
    stagePrefix: 'stage851',
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
    stagePrefix: 'stage851',
  })

  if (regressionEvidence.metrics.notesSidebarVisible) {
    throw new Error('Stage 851 expected Notebook placement to stay embedded with no visible Notes sidebar entry.')
  }
  if (!regressionEvidence.metrics.homeVisible || !regressionEvidence.metrics.graphCanvasVisible || !regressionEvidence.metrics.notebookVisible) {
    throw new Error('Stage 851 expected Home, Graph, and Notebook regression surfaces to remain visible.')
  }

  await writeFile(
    path.join(outputDir, 'stage851-post-stage850-study-review-workspace-top-start-recomposition-audit.json'),
    JSON.stringify(
      {
        auditFocus: [
          'wide Study judged first as a top-start review workspace with the dead upper-left canvas retired',
          'Questions view and answer-shown Study evidence paths remain compact and functional',
          'Home, Graph, embedded Notebook, original-only Reader, and focused Reader-led Study regression captures after the Study pass',
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
        path: path.join(outputDir, 'stage851-post-stage850-study-review-workspace-top-start-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (focusedPage && focusedPage !== studyPage) {
    await focusedPage
      .screenshot({
        path: path.join(
          outputDir,
          'stage851-post-stage850-study-review-workspace-top-start-audit-failure-focused.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
