import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE865_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE865_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE865_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE865_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE865_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE865_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

function assertReaderShortDocumentAudit(metrics) {
  const shortHeights = [metrics.defaultArticleFieldHeight, metrics.reflowedArticleFieldHeight]
  if (!metrics.defaultArticleFieldContentFitStage864 || !metrics.reflowedArticleFieldContentFitStage864) {
    throw new Error('Stage 865 expected both original and reflowed short documents to keep the content-fit article field.')
  }
  if (metrics.defaultArticleFieldEmptySlabVisible || metrics.reflowedArticleFieldEmptySlabVisible) {
    throw new Error('Stage 865 found the retired short-document empty slab visible again.')
  }
  if (shortHeights.some((height) => typeof height !== 'number' || height >= 260)) {
    throw new Error(`Stage 865 expected compact short-document field heights, received ${shortHeights.join(' / ')}.`)
  }
  if (metrics.previewBackedArticleFieldContentFitStage864 || metrics.previewBackedArticleFieldShortDocument) {
    throw new Error('Stage 865 expected the long preview-backed Reader capture to keep the long-document layout.')
  }
  if (!metrics.defaultReaderPrimaryTransportUsesSpeechIcon || !metrics.reflowedReaderPrimaryTransportUsesSpeechIcon) {
    throw new Error('Stage 865 expected the compact read-aloud primary action to remain speech-specific.')
  }
  if (!metrics.sourceOpenReaderSourceLibraryVisible || !metrics.notebookOpenWorkbenchVisible) {
    throw new Error('Stage 865 expected Source and Notebook support regressions to stay green.')
  }
  if (metrics.summaryReaderGeneratedContextContainsSnippet) {
    throw new Error('Stage 865 expected generated Summary content to remain article-owned.')
  }
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage865-reader-short-document-empty-slab-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage865-reader-short-document-empty-slab-regression-failure.png'), {
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
    stagePrefix: 'stage865',
  })

  assertReaderShortDocumentAudit(evidence.metrics)

  await writeFile(
    path.join(outputDir, 'stage865-post-stage864-reader-short-document-empty-slab-retirement-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Original and reflowed short Reader captures prove the large empty slab is gone.',
          'Long Reader capture proves the long-document article field remains stable.',
          'Source, Notebook, generated Reader modes, Home, Graph, Notebook, and Study regressions remain green.',
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
        path: path.join(outputDir, 'stage865-reader-short-document-empty-slab-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage865-reader-short-document-empty-slab-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
