import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE785_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE785_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE785_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE785_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE785_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE785_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage785-reader-note-switcher-density-deflation-audit-failure.png'), {
  force: true,
})
await rm(path.join(outputDir, 'stage785-reader-note-switcher-density-deflation-regression-failure.png'), {
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
    stagePrefix: 'stage785',
  })

  const {
    notebookOpenReaderSavedNoteActiveTileVisible,
    notebookOpenReaderSavedNoteButtonCount,
    notebookOpenReaderSavedNoteExcerptVisible,
    notebookOpenReaderSavedNoteSecondaryVisible,
    notebookOpenReaderSavedNoteTextLayerCount,
    notebookOpenWorkbenchVisible,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
  } = evidence.metrics

  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 785 audit.')
  }
  if (notebookOpenReaderSavedNoteActiveTileVisible) {
    throw new Error('Expected the active saved-note tile to stay retired from the Reader Notebook switcher during the Stage 785 audit.')
  }
  if ((notebookOpenReaderSavedNoteButtonCount ?? 0) < 1) {
    throw new Error('Expected the Reader Notebook switcher to expose at least one nearby saved note during the Stage 785 audit.')
  }
  if (notebookOpenReaderSavedNoteExcerptVisible) {
    throw new Error('Expected nearby saved-note buttons to drop the extra excerpt line during the Stage 785 audit.')
  }
  if (!notebookOpenReaderSavedNoteSecondaryVisible) {
    throw new Error('Expected nearby saved-note buttons to keep one supporting line during the Stage 785 audit.')
  }
  if ((notebookOpenReaderSavedNoteTextLayerCount ?? 0) > 2) {
    throw new Error('Expected nearby saved-note buttons to collapse to two visible text layers during the Stage 785 audit.')
  }
  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 785 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the current live dataset during the Stage 785 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage785-post-stage784-reader-note-switcher-density-deflation-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Reader Notebook switcher should now keep nearby notes in a compact two-layer treatment instead of stacked preview cards.',
          'The active note should remain retired from the switcher while the fuller anchor preview stays in the selected-note workbench.',
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
        path: path.join(outputDir, 'stage785-reader-note-switcher-density-deflation-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage785-reader-note-switcher-density-deflation-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
