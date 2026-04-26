import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE866_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE866_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE866_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE866_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE866_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE866_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

function assertReaderSupportOpenContinuity(metrics, stageLabel) {
  const atRestHeights = [metrics.defaultArticleFieldHeight, metrics.reflowedArticleFieldHeight]
  const supportOpenHeights = [metrics.sourceOpenArticleFieldHeight, metrics.notebookOpenArticleFieldHeight]

  if (!metrics.defaultArticleFieldContentFitStage864 || !metrics.reflowedArticleFieldContentFitStage864) {
    throw new Error(`${stageLabel} expected the Stage 865 at-rest short-document content-fit baseline to remain intact.`)
  }
  if (metrics.defaultArticleFieldEmptySlabVisible || metrics.reflowedArticleFieldEmptySlabVisible) {
    throw new Error(`${stageLabel} found the retired at-rest short-document slab visible again.`)
  }
  if (atRestHeights.some((height) => typeof height !== 'number' || height >= 260)) {
    throw new Error(`${stageLabel} expected compact at-rest short-document heights, received ${atRestHeights.join(' / ')}.`)
  }
  if (!metrics.readerShortDocumentSourceOpenArticleFieldContentFit || !metrics.readerShortDocumentNotebookOpenArticleFieldContentFit) {
    throw new Error(`${stageLabel} expected Source-open and Notebook-open short documents to keep the content-fit article field.`)
  }
  if (metrics.readerShortDocumentSupportOpenEmptySlabVisible) {
    throw new Error(`${stageLabel} found the old short-document empty slab visible again when support was open.`)
  }
  if (supportOpenHeights.some((height) => typeof height !== 'number' || height >= 260)) {
    throw new Error(`${stageLabel} expected compact support-open short-document heights, received ${supportOpenHeights.join(' / ')}.`)
  }
  if (!metrics.readerShortDocumentSupportOpenCompactHeaderSharedRow || !metrics.readerShortDocumentSupportOpenDeckCompact) {
    throw new Error(`${stageLabel} expected the compact shared header and compact reading deck to survive when support was open.`)
  }
  if (!metrics.sourceOpenReaderSourceLibraryVisible || !metrics.notebookOpenWorkbenchVisible) {
    throw new Error(`${stageLabel} expected Source and Notebook support flows to remain available.`)
  }
  if (metrics.previewBackedArticleFieldShortDocument || metrics.previewBackedArticleFieldContentFitStage864) {
    throw new Error(`${stageLabel} expected long preview-backed Reader documents to keep the long-document layout.`)
  }
  if (!metrics.readerLongDocumentArticleFieldStable) {
    throw new Error(`${stageLabel} expected the long Reader layout to remain stable.`)
  }
  if (!metrics.readerGeneratedOutputsFrozen || metrics.summaryReaderGeneratedContextContainsSnippet) {
    throw new Error(`${stageLabel} expected generated Reader outputs to remain frozen and article-owned.`)
  }
  if (!metrics.readerShortDocumentReadAloudAvailable) {
    throw new Error(`${stageLabel} expected read-aloud to remain available for compact short documents.`)
  }
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage866-reader-short-document-support-open-continuity-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage866-reader-short-document-support-open-regression-failure.png'), {
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
    stagePrefix: 'stage866',
  })

  assertReaderSupportOpenContinuity(evidence.metrics, 'Stage 866')

  await writeFile(
    path.join(
      outputDir,
      'stage866-reader-short-document-support-open-continuity-and-compact-workbench-preservation-after-stage865-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'Short Reader documents should stay content-fit and compact when Source or Notebook support is open.',
          'The shared source/header row and reading deck should stay compact during support-open short-document work.',
          'Long Reader documents, generated outputs, and Home/Graph/Notebook/Study regressions should remain stable.',
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
        path: path.join(outputDir, 'stage866-reader-short-document-support-open-continuity-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage866-reader-short-document-support-open-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
