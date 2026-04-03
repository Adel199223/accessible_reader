import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE789_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE789_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE789_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE789_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE789_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE789_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage789-reader-source-preview-retirement-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage789-reader-source-preview-retirement-regression-failure.png'), {
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
    stagePrefix: 'stage789',
  })

  const {
    notebookOpenWorkbenchVisible,
    previewBackedReaderHasArticle,
    previewBackedReaderSourcePreviewText,
    previewBackedReaderSourcePreviewVisible,
    previewBackedSourcePreviewReference,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
  } = evidence.metrics

  if (!previewBackedSourcePreviewReference) {
    throw new Error('Expected the Stage 789 audit to target a live preview-backed Reader document.')
  }
  if (previewBackedReaderSourcePreviewVisible) {
    throw new Error('Expected preview-backed Reader documents to retire the secondary locator or filename line during the Stage 789 audit.')
  }
  if (previewBackedReaderSourcePreviewText) {
    throw new Error(`Expected preview-backed Reader documents to remove the secondary locator text, found "${previewBackedReaderSourcePreviewText}".`)
  }
  if (!previewBackedReaderHasArticle) {
    throw new Error('Expected the preview-backed Reader document to keep the article visible during the Stage 789 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 789 audit.')
  }
  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 789 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the current live dataset during the Stage 789 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage789-post-stage788-reader-source-preview-retirement-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Reader-active source strips should retire the secondary locator or filename line.',
          'The audit should prove that behavior on a real live preview-backed document, not just on the paste-only default document.',
          'Source reopening, Notebook reopening, and wider Recall regressions should stay stable.',
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
        path: path.join(outputDir, 'stage789-reader-source-preview-retirement-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage789-reader-source-preview-retirement-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
