import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE867_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE867_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE867_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE867_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE867_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE867_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

function assertReaderSupportOpenAudit(metrics) {
  const supportOpenHeights = [metrics.sourceOpenArticleFieldHeight, metrics.notebookOpenArticleFieldHeight]

  if (metrics.readerShortDocumentSupportOpenEmptySlabVisible) {
    throw new Error('Stage 867 found the short-document empty slab visible again in a support-open Reader state.')
  }
  if (!metrics.readerShortDocumentSourceOpenArticleFieldContentFit || !metrics.readerShortDocumentNotebookOpenArticleFieldContentFit) {
    throw new Error('Stage 867 expected both Source-open and Notebook-open short Reader states to stay content-fit.')
  }
  if (supportOpenHeights.some((height) => typeof height !== 'number' || height >= 260)) {
    throw new Error(`Stage 867 expected compact support-open article heights, received ${supportOpenHeights.join(' / ')}.`)
  }
  if (!metrics.readerShortDocumentSupportOpenCompactHeaderSharedRow) {
    throw new Error('Stage 867 expected the compact shared source/header row to survive with support open.')
  }
  if (!metrics.readerShortDocumentSupportOpenDeckCompact) {
    throw new Error('Stage 867 expected the reading deck to remain compact when support was open.')
  }
  if (!metrics.sourceOpenReaderSourceLibraryVisible || !metrics.notebookOpenWorkbenchVisible) {
    throw new Error('Stage 867 expected Source library and Notebook workbench reopen flows to remain visible.')
  }
  if (!metrics.readerShortDocumentArticleFieldContentFit || metrics.readerShortDocumentEmptySlabVisible) {
    throw new Error('Stage 867 expected the Stage 865 at-rest short-document compact baseline to remain intact.')
  }
  if (!metrics.readerLongDocumentArticleFieldStable) {
    throw new Error('Stage 867 expected the long Reader article layout to remain stable.')
  }
  if (!metrics.readerGeneratedOutputsFrozen) {
    throw new Error('Stage 867 expected generated Reader outputs to remain frozen.')
  }
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage867-reader-short-document-support-open-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage867-reader-short-document-support-open-regression-failure.png'), {
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
    stagePrefix: 'stage867',
  })

  assertReaderSupportOpenAudit(evidence.metrics)

  await writeFile(
    path.join(
      outputDir,
      'stage867-post-stage866-reader-short-document-support-open-continuity-and-compact-workbench-preservation-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'Source-open and Notebook-open short Reader captures should prove the article stays compact and content-fit.',
          'The compact shared header/deck model should survive support-open short-document work without regressing Stage 865.',
          'Long Reader, generated Reader, Home, Graph, Notebook, and Study regressions should remain green.',
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
        path: path.join(outputDir, 'stage867-reader-short-document-support-open-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage867-reader-short-document-support-open-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
