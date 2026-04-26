import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE811_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE811_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE811_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE811_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE811_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE811_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage811-reader-duplicate-title-deflation-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage811-reader-duplicate-title-deflation-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage811',
  })

  const {
    defaultReaderLeadingArticleHeadingMatchesSourceTitle,
    defaultReaderSourceTitleVisible,
    notebookOpenWorkbenchVisible,
    previewBackedReaderContentHeadingCount,
    previewBackedReaderLeadingArticleHeadingMatchesSourceTitle,
    previewBackedReaderSourceTitleVisible,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
  } = evidence.metrics

  if (!previewBackedReaderLeadingArticleHeadingMatchesSourceTitle) {
    throw new Error('Expected the preview-backed Reader document to begin with the same article heading as its saved title during the Stage 811 audit.')
  }
  if (previewBackedReaderSourceTitleVisible) {
    throw new Error('Expected compact preview-backed Reader to retire the duplicate source-strip title during the Stage 811 audit.')
  }
  if (previewBackedReaderContentHeadingCount !== 1) {
    throw new Error(`Expected compact preview-backed Reader to keep only one visible matching heading after duplicate-title retirement during the Stage 811 audit, received ${previewBackedReaderContentHeadingCount}.`)
  }
  if (defaultReaderLeadingArticleHeadingMatchesSourceTitle && !defaultReaderSourceTitleVisible) {
    throw new Error('Default Reader should only hide the source-strip title when the article truly starts with the same heading during the Stage 811 audit.')
  }
  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 811 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 811 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the live dataset during the Stage 811 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage811-post-stage810-reader-duplicate-title-deflation-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Compact Reader should retire the source-strip title only when the article already starts with the same heading.',
          'Preview-backed Reader should drop the duplicate source-strip title while keeping the article heading visible.',
          'Source and Notebook reopen behavior should stay intact on the same live dataset.',
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
        path: path.join(outputDir, 'stage811-reader-duplicate-title-deflation-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage811-reader-duplicate-title-deflation-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
