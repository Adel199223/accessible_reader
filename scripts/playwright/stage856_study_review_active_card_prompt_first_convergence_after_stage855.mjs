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
const outputDir = process.env.RECALL_STAGE856_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE856_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE856_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE856_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE856_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE856_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage856-study-review-active-card-prompt-first-convergence-failure.png'), {
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
    stageLabel: 'Stage 856',
    stagePrefix: 'stage856',
  })

  focusedPage = await browser.newPage({ viewport: focusedViewport })
  const focusedEvidence = await captureFocusedStudyEvidence({
    baseUrl,
    directory: outputDir,
    page: focusedPage,
    stageLabel: 'Stage 856',
    stagePrefix: 'stage856',
  })

  await writeFile(
    path.join(outputDir, 'stage856-study-review-active-card-prompt-first-convergence-validation.json'),
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
          'wide Study Review uses one prompt-first active card with no detached glance or prompt panel',
          'the Review lead band owns metrics, view toggle, and the single Refresh action without repeating the prompt',
          'the queue support dock no longer owns duplicate evidence or refresh actions while focused Reader-led Study remains intact',
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
        path: path.join(outputDir, 'stage856-study-review-active-card-prompt-first-convergence-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (focusedPage && focusedPage !== studyPage) {
    await focusedPage
      .screenshot({
        path: path.join(outputDir, 'stage856-study-review-active-card-prompt-first-convergence-failure-focused.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
