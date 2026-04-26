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
const outputDir = process.env.RECALL_STAGE836_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE836_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE836_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE836_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE836_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE836_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-after-stage835-failure-home.png',
  'stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-after-stage835-failure-graph.png',
  'stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-after-stage835-failure-notebook.png',
  'stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-after-stage835-failure-reader.png',
  'stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-after-stage835-failure-study.png',
  'stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-after-stage835-failure-focused.png',
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
    stageLabel: 'Stage 836',
    stagePrefix: 'stage836',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-after-stage835-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        focusedViewport,
        headless,
        implementationFocus: [
          'Stage 836 keeps Home as the active Recall homepage benchmark and stays on the organizer-visible selected board instead of reopening hidden-state ownership or Reader chrome.',
          'Organizer-visible selected-board cards must retire the redundant lower collection chip, keep the source row alive under the title, and tighten the lower seam without undoing the Stage 829-835 density, top-band, and continuation gains.',
          'Open Matches keeps its chip-based card metadata treatment, while hidden Home, hidden Captures, hidden Matches, Graph, embedded Notebook, original-only Reader, and Study stay regression surfaces.',
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
    captureFailure(
      homePage,
      outputDir,
      'stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-after-stage835-failure-home.png',
    ),
    captureFailure(
      graphPage,
      outputDir,
      'stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-after-stage835-failure-graph.png',
    ),
    captureFailure(
      notebookPage,
      outputDir,
      'stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-after-stage835-failure-notebook.png',
    ),
    captureFailure(
      readerPage,
      outputDir,
      'stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-after-stage835-failure-reader.png',
    ),
    captureFailure(
      studyPage,
      outputDir,
      'stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-after-stage835-failure-study.png',
    ),
    captureFailure(
      focusedPage,
      outputDir,
      'stage836-home-selected-board-card-metadata-deduplication-and-lower-seam-compaction-after-stage835-failure-focused.png',
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
