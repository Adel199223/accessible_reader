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
const outputDir = process.env.RECALL_STAGE843_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE843_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE843_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE843_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE843_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE843_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage843-post-stage842-home-organizer-visible-matches-search-owned-lead-band-convergence-audit-failure-home.png',
  'stage843-post-stage842-home-organizer-visible-matches-search-owned-lead-band-convergence-audit-failure-graph.png',
  'stage843-post-stage842-home-organizer-visible-matches-search-owned-lead-band-convergence-audit-failure-notebook.png',
  'stage843-post-stage842-home-organizer-visible-matches-search-owned-lead-band-convergence-audit-failure-reader.png',
  'stage843-post-stage842-home-organizer-visible-matches-search-owned-lead-band-convergence-audit-failure-study.png',
  'stage843-post-stage842-home-organizer-visible-matches-search-owned-lead-band-convergence-audit-failure-focused.png',
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
    stageLabel: 'Stage 843 audit',
    stagePrefix: 'stage843',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage843-post-stage842-home-organizer-visible-matches-search-owned-lead-band-convergence-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 843 audit must prove that organizer-visible Matches now owns the top-left of the canvas through a results-owned lead band instead of a date-led first header.',
          'Organizer-visible Matches must keep chronology through quieter inline day dividers, and zero-result filtered states must reuse the same shared lead band without the extra header-card shell.',
          'The wider Stage 841 Home baseline must remain intact: organizer rail list rhythm, selected-board density and metadata, shared top band, single-row toolbar, footer below fold, hidden-state stability, and no clipping.',
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
    captureFailure(
      homePage,
      outputDir,
      'stage843-post-stage842-home-organizer-visible-matches-search-owned-lead-band-convergence-audit-failure-home.png',
    ),
    captureFailure(
      graphPage,
      outputDir,
      'stage843-post-stage842-home-organizer-visible-matches-search-owned-lead-band-convergence-audit-failure-graph.png',
    ),
    captureFailure(
      notebookPage,
      outputDir,
      'stage843-post-stage842-home-organizer-visible-matches-search-owned-lead-band-convergence-audit-failure-notebook.png',
    ),
    captureFailure(
      readerPage,
      outputDir,
      'stage843-post-stage842-home-organizer-visible-matches-search-owned-lead-band-convergence-audit-failure-reader.png',
    ),
    captureFailure(
      studyPage,
      outputDir,
      'stage843-post-stage842-home-organizer-visible-matches-search-owned-lead-band-convergence-audit-failure-study.png',
    ),
    captureFailure(
      focusedPage,
      outputDir,
      'stage843-post-stage842-home-organizer-visible-matches-search-owned-lead-band-convergence-audit-failure-focused.png',
    ),
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
