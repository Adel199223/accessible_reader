import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE864_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE864_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE864_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE864_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE864_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE864_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

function assertReaderShortDocumentEvidence(metrics, stageLabel) {
  if (!metrics.defaultArticleFieldShortDocument || !metrics.reflowedArticleFieldShortDocument) {
    throw new Error(`${stageLabel} expected original and reflowed default Reader documents to use the short-document path.`)
  }
  if (!metrics.defaultArticleFieldContentFitStage864 || !metrics.reflowedArticleFieldContentFitStage864) {
    throw new Error(`${stageLabel} expected original and reflowed short Reader documents to use the Stage 864 content-fit article field.`)
  }
  if (metrics.defaultArticleFieldEmptySlabVisible || metrics.reflowedArticleFieldEmptySlabVisible) {
    throw new Error(`${stageLabel} expected the short-document empty article slab to be retired.`)
  }
  if ((metrics.defaultArticleFieldHeight ?? 999) >= 260 || (metrics.reflowedArticleFieldHeight ?? 999) >= 260) {
    throw new Error(
      `${stageLabel} expected short-document article fields to stay below the old slab height; received original=${metrics.defaultArticleFieldHeight}, reflowed=${metrics.reflowedArticleFieldHeight}.`,
    )
  }
  if (!metrics.defaultReaderShortDocumentReadAloudAvailable || !metrics.reflowedReaderShortDocumentReadAloudAvailable) {
    throw new Error(`${stageLabel} expected read-aloud to remain available for compact short documents.`)
  }
  if (metrics.previewBackedArticleFieldShortDocument || metrics.previewBackedArticleFieldContentFitStage864) {
    throw new Error(`${stageLabel} expected the long preview-backed Reader document to keep the long-document article layout.`)
  }
  if (!metrics.sourceOpenReaderSourceLibraryVisible) {
    throw new Error(`${stageLabel} expected Source support to keep reopening normally.`)
  }
  if (!metrics.notebookOpenWorkbenchVisible) {
    throw new Error(`${stageLabel} expected Notebook support to keep reopening normally.`)
  }
  if (metrics.summaryReaderGeneratedContextContainsSnippet) {
    throw new Error(`${stageLabel} expected generated Summary content to stay in the article, not duplicated into the context seam.`)
  }
  if (metrics.simplifiedViewAvailable) {
    throw new Error(`${stageLabel} expected Simplified to remain unavailable on the current live dataset.`)
  }
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage864-reader-short-document-empty-slab-retirement-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage864-reader-short-document-empty-slab-regression-failure.png'), {
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
    stagePrefix: 'stage864',
  })

  assertReaderShortDocumentEvidence(evidence.metrics, 'Stage 864')

  await writeFile(
    path.join(outputDir, 'stage864-reader-short-document-empty-slab-retirement-after-stage863-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Original and reflowed short Reader documents should use a content-fit article field.',
          'The old tall short-document empty slab should be retired without changing the compact Reader header.',
          'Long Reader documents, Source/Notebook support, and generated-output invariants should remain stable.',
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
        path: path.join(outputDir, 'stage864-reader-short-document-empty-slab-retirement-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage864-reader-short-document-empty-slab-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
