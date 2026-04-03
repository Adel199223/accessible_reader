import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE783_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE783_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE783_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE783_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE783_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE783_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage783-reader-active-note-tile-compaction-audit-failure.png'), {
  force: true,
})
await rm(path.join(outputDir, 'stage783-reader-active-note-tile-compaction-regression-failure.png'), {
  force: true,
})

const { browser, runtimeBrowser } = await launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
})

let readerPage
let regressionPage
try {
  readerPage = await browser.newPage({ viewport: desktopViewport })
  regressionPage = await browser.newPage({ viewport: desktopViewport })

  const evidence = await captureReaderReadingFirstEvidence({
    baseUrl,
    directory: outputDir,
    page: readerPage,
    regressionPage,
    stagePrefix: 'stage783',
  })

  const {
    notebookOpenReaderNoteWorkbenchPreviewMetaText,
    notebookOpenReaderSavedNoteActiveTileVisible,
    notebookOpenWorkbenchVisible,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
  } = evidence.metrics

  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 783 audit.')
  }
  if (notebookOpenReaderSavedNoteActiveTileVisible) {
    throw new Error('Expected the active saved-note tile to retire from the Reader Notebook switcher during the Stage 783 audit.')
  }
  if (!notebookOpenReaderNoteWorkbenchPreviewMetaText || !/anchored sentence/i.test(notebookOpenReaderNoteWorkbenchPreviewMetaText)) {
    throw new Error('Expected the selected-note workbench to keep the anchor preview context after the Stage 783 switcher compaction.')
  }
  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 783 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the current live dataset during the Stage 783 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage783-post-stage782-reader-active-note-tile-compaction-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The active saved-note tile should no longer remain in the Reader Notebook switcher once that note is already open in the workbench.',
          'The selected-note anchor preview and editor should remain intact after the switcher compaction.',
          'Notebook reopening, Source reopening, and wider Recall regressions should stay stable in the same live browser pass.',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
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
  if (readerPage) {
    await readerPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage783-reader-active-note-tile-compaction-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage783-reader-active-note-tile-compaction-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
