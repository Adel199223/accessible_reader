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
const outputDir = process.env.RECALL_STAGE692_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE692_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE692_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE692_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE692_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE692_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage692-cross-surface-baseline-audit-and-master-roadmap-reset-after-stage691-failure-home.png',
  'stage692-cross-surface-baseline-audit-and-master-roadmap-reset-after-stage691-failure-notebook.png',
  'stage692-cross-surface-baseline-audit-and-master-roadmap-reset-after-stage691-failure-reader.png',
  'stage692-cross-surface-baseline-audit-and-master-roadmap-reset-after-stage691-failure-study.png',
  'stage692-cross-surface-baseline-audit-and-master-roadmap-reset-after-stage691-failure-focused.png',
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
    stagePrefix: 'stage692',
    studyPage,
  })

  await writeFile(
    path.join(
      outputDir,
      'stage692-cross-surface-baseline-audit-and-master-roadmap-reset-after-stage691-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        focusedViewport,
        headless,
        implementationFocus: [
          'Stage 692 resets the repo onto one queued roadmap instead of stopping after each surface pass.',
          'The new baseline evidence captures the current shell rail, Home organizer seam, Home clipping cases, embedded Notebook placement, original-only Reader, Study, and focused reader-led split state in one pass.',
          'The resulting queue now points directly at shared shell/navigation reset first, then Home ergonomics, Notebook follow-through, Reader UI/UX-only work with frozen outputs, Study parity, and final cleanup.',
        ],
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
    captureFailure(homePage, outputDir, 'stage692-cross-surface-baseline-audit-and-master-roadmap-reset-after-stage691-failure-home.png'),
    captureFailure(notebookPage, outputDir, 'stage692-cross-surface-baseline-audit-and-master-roadmap-reset-after-stage691-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage692-cross-surface-baseline-audit-and-master-roadmap-reset-after-stage691-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage692-cross-surface-baseline-audit-and-master-roadmap-reset-after-stage691-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage692-cross-surface-baseline-audit-and-master-roadmap-reset-after-stage691-failure-focused.png'),
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
