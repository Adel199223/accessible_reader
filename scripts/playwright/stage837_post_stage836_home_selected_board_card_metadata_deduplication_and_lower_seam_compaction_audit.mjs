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
const outputDir = process.env.RECALL_STAGE837_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE837_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE837_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE837_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE837_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE837_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage837-post-stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-audit-failure-home.png',
  'stage837-post-stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-audit-failure-graph.png',
  'stage837-post-stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-audit-failure-notebook.png',
  'stage837-post-stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-audit-failure-reader.png',
  'stage837-post-stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-audit-failure-study.png',
  'stage837-post-stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-audit-failure-focused.png',
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
    stageLabel: 'Stage 837 audit',
    stagePrefix: 'stage837',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage837-post-stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 837 audit must prove that organizer-visible selected-board cards no longer repeat the collection chip in the lower seam while still keeping the quieter source row visible under the title.',
          'Organizer-visible open Matches must retain its chip-based card metadata treatment, and the Stage 829-835 open-board density, shared top band, single-row toolbar, and footer-below-fold behavior must remain intact in the same run.',
          'Hidden Home, hidden Captures, hidden Matches, Graph, embedded Notebook, original-only Reader, and Study remain regression surfaces while the selected open board continues to be the active Home parity benchmark.',
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
      'stage837-post-stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-audit-failure-home.png',
    ),
    captureFailure(
      graphPage,
      outputDir,
      'stage837-post-stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-audit-failure-graph.png',
    ),
    captureFailure(
      notebookPage,
      outputDir,
      'stage837-post-stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-audit-failure-notebook.png',
    ),
    captureFailure(
      readerPage,
      outputDir,
      'stage837-post-stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-audit-failure-reader.png',
    ),
    captureFailure(
      studyPage,
      outputDir,
      'stage837-post-stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-audit-failure-study.png',
    ),
    captureFailure(
      focusedPage,
      outputDir,
      'stage837-post-stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-audit-failure-focused.png',
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
