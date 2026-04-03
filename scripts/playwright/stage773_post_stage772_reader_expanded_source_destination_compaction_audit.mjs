import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE773_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE773_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE773_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE773_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE773_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE773_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage773-reader-expanded-source-destination-compaction-audit-failure.png'), {
  force: true,
})
await rm(path.join(outputDir, 'stage773-reader-expanded-source-destination-compaction-regression-failure.png'), {
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
    stagePrefix: 'stage773',
  })

  const {
    defaultReaderSourceNavTriggerVisible,
    defaultReaderSourceTabsVisible,
    notebookOpenReaderSourceNavTriggerInlineInHeading,
    notebookOpenReaderSourceNavTriggerVisible,
    notebookOpenReaderSourcePreviewVisible,
    notebookOpenReaderSourceTabsVisible,
    notebookOpenWorkbenchVisible,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
    sourceOpenReaderSourceNavTriggerInlineInHeading,
    sourceOpenReaderSourceNavTriggerVisible,
    sourceOpenReaderSourcePreviewVisible,
    sourceOpenReaderSourceTabsVisible,
    summaryReaderSourceNavTriggerVisible,
    summaryReaderSourceTabsVisible,
  } = evidence.metrics

  if (!defaultReaderSourceNavTriggerVisible || defaultReaderSourceTabsVisible) {
    throw new Error('Expected the default Reader source strip to remain compact during the Stage 773 audit.')
  }
  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 773 audit.')
  }
  if (!sourceOpenReaderSourceNavTriggerVisible || sourceOpenReaderSourceTabsVisible) {
    throw new Error('Expected expanded Source support to keep the compact Source destination trigger and retire the full workspace tab row during the Stage 773 audit.')
  }
  if (!sourceOpenReaderSourceNavTriggerInlineInHeading) {
    throw new Error('Expected expanded Source support to keep the Source destination trigger inline with the source title during the Stage 773 audit.')
  }
  if (sourceOpenReaderSourcePreviewVisible) {
    throw new Error('Expected expanded Source support to retire the generic local-source fallback copy during the Stage 773 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 773 audit.')
  }
  if (!notebookOpenReaderSourceNavTriggerVisible || notebookOpenReaderSourceTabsVisible) {
    throw new Error('Expected expanded Notebook support to keep the compact Source destination trigger and retire the full workspace tab row during the Stage 773 audit.')
  }
  if (!notebookOpenReaderSourceNavTriggerInlineInHeading) {
    throw new Error('Expected the compact Source destination trigger to stay inline during Notebook support in the Stage 773 audit.')
  }
  if (notebookOpenReaderSourcePreviewVisible) {
    throw new Error('Expected Notebook support to retire the generic local-source fallback copy during the Stage 773 audit.')
  }
  if (!summaryReaderSourceNavTriggerVisible || summaryReaderSourceTabsVisible) {
    throw new Error('Expected Summary Reader to keep the compact Source destination trigger intact during the Stage 773 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the current live dataset during the Stage 773 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage773-post-stage772-reader-expanded-source-destination-compaction-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Expanded Reader states should keep the compact Source destination trigger instead of restoring the full workspace tab row.',
          'Source and Notebook support should continue to reopen normally without reintroducing the stacked source-workspace option row.',
          'The default compact Reader strip, note-chip handoff, and wider Recall regression surfaces should stay stable in the same live browser pass.',
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
        path: path.join(outputDir, 'stage773-reader-expanded-source-destination-compaction-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage773-reader-expanded-source-destination-compaction-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
