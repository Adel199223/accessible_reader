import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureFocusedStudyEvidence,
  captureStudyReviewDashboardEvidence,
  desktopViewport,
  focusedViewport,
} from './study_review_dashboard_reset_shared.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE860_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE860_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE860_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE860_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE860_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE860_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage860-study-support-dock-single-rail-deflation-failure.png'), {
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
try {
  studyPage = await browser.newPage({ viewport: desktopViewport })
  const studyEvidence = await captureStudyReviewDashboardEvidence({
    baseUrl,
    directory: outputDir,
    page: studyPage,
    stageLabel: 'Stage 860',
    stagePrefix: 'stage860',
  })

  focusedPage = await browser.newPage({ viewport: focusedViewport })
  const focusedEvidence = await captureFocusedStudyEvidence({
    baseUrl,
    directory: outputDir,
    page: focusedPage,
    stageLabel: 'Stage 860',
    stagePrefix: 'stage860',
  })

  await writeFile(
    path.join(outputDir, 'stage860-study-support-dock-single-rail-deflation-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          ...studyEvidence.captures,
          ...focusedEvidence.captures,
        },
        desktopViewport,
        focusedViewport,
        headless,
        metrics: {
          ...studyEvidence.metrics,
          ...focusedEvidence.metrics,
        },
        runtimeBrowser,
        validationFocus: [
          'wide Study Review support reads as one compact evidence-first rail',
          'Review queue seam shows at most one upcoming question preview at rest',
          'Questions keeps one compact Review handoff while Grounding owns evidence and Reader handoff',
        ],
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
        path: path.join(outputDir, 'stage860-study-support-dock-single-rail-deflation-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (focusedPage && focusedPage !== studyPage) {
    await focusedPage
      .screenshot({
        path: path.join(outputDir, 'stage860-study-support-dock-single-rail-deflation-failure-focused.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
