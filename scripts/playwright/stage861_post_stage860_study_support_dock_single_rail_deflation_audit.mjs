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
const outputDir = process.env.RECALL_STAGE861_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE861_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE861_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE861_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE861_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE861_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage861-post-stage860-study-support-dock-single-rail-deflation-audit-failure.png'), {
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
    stageLabel: 'Stage 861',
    stagePrefix: 'stage861',
  })

  focusedPage = await browser.newPage({ viewport: focusedViewport })
  const focusedEvidence = await captureFocusedStudyEvidence({
    baseUrl,
    directory: outputDir,
    page: focusedPage,
    stageLabel: 'Stage 861',
    stagePrefix: 'stage861',
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
    stagePrefix: 'stage861',
  })

  if (regressionEvidence.metrics.notesSidebarVisible) {
    throw new Error('Stage 861 expected Notebook placement to stay embedded with no visible Notes sidebar entry.')
  }
  if (!regressionEvidence.metrics.homeVisible || !regressionEvidence.metrics.graphCanvasVisible || !regressionEvidence.metrics.notebookVisible) {
    throw new Error('Stage 861 expected Home, Graph, and Notebook regression surfaces to remain visible.')
  }

  await writeFile(
    path.join(outputDir, 'stage861-post-stage860-study-support-dock-single-rail-deflation-audit.json'),
    JSON.stringify(
      {
        auditFocus: [
          'wide Study Review proves the support column is one compact evidence-first rail',
          'wide Study Questions proves Review handoff is a compact seam instead of a duplicate manager card',
          'answer-shown Review, focused Reader-led Study, Home, Graph, embedded Notebook, and original-only Reader remain regression-green',
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
        path: path.join(outputDir, 'stage861-post-stage860-study-support-dock-single-rail-deflation-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (focusedPage && focusedPage !== studyPage) {
    await focusedPage
      .screenshot({
        path: path.join(outputDir, 'stage861-post-stage860-study-support-dock-single-rail-deflation-audit-failure-focused.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
