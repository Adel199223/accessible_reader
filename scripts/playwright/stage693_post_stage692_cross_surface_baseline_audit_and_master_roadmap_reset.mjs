import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureMasterRoadmapResetEvidence,
  focusedViewport,
} from './master_roadmap_reset_shared.mjs'
import {
  desktopViewport,
  launchBrowserContext,
} from './home_rendered_preview_quality_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE693_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE693_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE693_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE693_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE693_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE693_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage693-post-stage692-cross-surface-baseline-audit-and-master-roadmap-reset-failure-home.png',
  'stage693-post-stage692-cross-surface-baseline-audit-and-master-roadmap-reset-failure-notebook.png',
  'stage693-post-stage692-cross-surface-baseline-audit-and-master-roadmap-reset-failure-reader.png',
  'stage693-post-stage692-cross-surface-baseline-audit-and-master-roadmap-reset-failure-study.png',
  'stage693-post-stage692-cross-surface-baseline-audit-and-master-roadmap-reset-failure-focused.png',
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
let notebookPage
let readerPage
let studyPage
let focusedPage
try {
  homePage = await browser.newPage({ viewport: desktopViewport })
  notebookPage = await browser.newPage({ viewport: desktopViewport })
  readerPage = await browser.newPage({ viewport: desktopViewport })
  studyPage = await browser.newPage({ viewport: desktopViewport })
  focusedPage = await browser.newPage({ viewport: focusedViewport })

  const evidence = await captureMasterRoadmapResetEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    homePage,
    notebookPage,
    readerPage,
    stagePrefix: 'stage693',
    studyPage,
  })

  await writeFile(
    path.join(
      outputDir,
      'stage693-post-stage692-cross-surface-baseline-audit-and-master-roadmap-reset-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 692/693 reset must prove the repo has one queued roadmap rather than another hold state.',
          'The wide baseline set must capture Home, Graph, embedded Notebook, original-only Reader, Study, plus shell/Home issue crops and a focused reader-led split view.',
          'The audit must confirm that the shell rail and Home organizer issues are real current-state blockers before Stage 694/695 starts the shared shell reset.',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        focusedViewport,
        headless,
        knownBlockers: [
          'Shell rail is still fixed and labeled rather than Recall-like icon-first.',
          'Home still shows a visible organizer seam and text-fit or clipping issues.',
          'Embedded Notebook placement is correct, but it still rides legacy internal notes continuity.',
          'Reader still needs a dedicated UI/UX phase while generated outputs remain frozen.',
          'Study remains the oldest major top-level baseline.',
        ],
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
    captureFailure(homePage, outputDir, 'stage693-post-stage692-cross-surface-baseline-audit-and-master-roadmap-reset-failure-home.png'),
    captureFailure(notebookPage, outputDir, 'stage693-post-stage692-cross-surface-baseline-audit-and-master-roadmap-reset-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage693-post-stage692-cross-surface-baseline-audit-and-master-roadmap-reset-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage693-post-stage692-cross-surface-baseline-audit-and-master-roadmap-reset-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage693-post-stage692-cross-surface-baseline-audit-and-master-roadmap-reset-failure-focused.png'),
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
