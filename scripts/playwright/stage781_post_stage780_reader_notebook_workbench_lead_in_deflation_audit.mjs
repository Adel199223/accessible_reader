import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE781_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE781_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE781_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE781_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE781_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE781_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage781-reader-notebook-workbench-lead-in-deflation-audit-failure.png'), {
  force: true,
})
await rm(path.join(outputDir, 'stage781-reader-notebook-workbench-lead-in-deflation-regression-failure.png'), {
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
    stagePrefix: 'stage781',
  })

  const {
    notebookOpenReaderNoteWorkbenchHeadingVisible,
    notebookOpenReaderNoteWorkbenchIntroVisible,
    notebookOpenReaderNoteWorkbenchMetaLabels,
    notebookOpenReaderNoteWorkbenchPreviewHeadingVisible,
    notebookOpenReaderNoteWorkbenchPreviewMetaText,
    notebookOpenWorkbenchVisible,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
  } = evidence.metrics

  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 781 audit.')
  }
  if (notebookOpenReaderNoteWorkbenchHeadingVisible) {
    throw new Error('Expected the Reader note workbench to retire the Selected note heading during the Stage 781 audit.')
  }
  if (notebookOpenReaderNoteWorkbenchIntroVisible) {
    throw new Error('Expected the Reader note workbench to retire its helper paragraph during the Stage 781 audit.')
  }
  if (notebookOpenReaderNoteWorkbenchMetaLabels.length > 0) {
    throw new Error(
      `Expected the Reader note workbench to retire its standalone metadata row during the Stage 781 audit, found ${notebookOpenReaderNoteWorkbenchMetaLabels.join(' / ')}.`,
    )
  }
  if (notebookOpenReaderNoteWorkbenchPreviewHeadingVisible) {
    throw new Error('Expected the Reader note workbench to retire the Highlighted passage label during the Stage 781 audit.')
  }
  if (!notebookOpenReaderNoteWorkbenchPreviewMetaText || !/anchored sentence/i.test(notebookOpenReaderNoteWorkbenchPreviewMetaText)) {
    throw new Error('Expected the Reader note workbench to keep sentence-span context attached to the anchor preview during the Stage 781 audit.')
  }
  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 781 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the current live dataset during the Stage 781 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage781-post-stage780-reader-notebook-workbench-lead-in-deflation-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Reader Notebook workbench should no longer spend a separate Selected note heading stack above the editor.',
          'The anchor preview should carry the remaining sentence-span context without a standalone metadata row or preview label.',
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
        path: path.join(outputDir, 'stage781-reader-notebook-workbench-lead-in-deflation-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage781-reader-notebook-workbench-lead-in-deflation-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
