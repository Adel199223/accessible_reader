import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE795_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE795_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE795_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE795_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE795_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE795_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage795-reader-compact-header-lane-alignment-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage795-reader-compact-header-lane-alignment-regression-failure.png'), {
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
    stagePrefix: 'stage795',
  })

  const {
    defaultReaderCompactHeaderWidthRatio,
    defaultReaderDeckWidthRatio,
    defaultReaderSourceMetaInlineInHeading,
    defaultReaderTransportClusterNearModes,
    notebookOpenWorkbenchVisible,
    previewBackedReaderCompactHeaderWidthRatio,
    previewBackedReaderDeckWidthRatio,
    previewBackedReaderSourceMetaInlineInHeading,
    reflowedReaderCompactHeaderWidthRatio,
    reflowedReaderDeckWidthRatio,
    reflowedReaderSourceMetaInlineInHeading,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
  } = evidence.metrics

  if (!defaultReaderSourceMetaInlineInHeading) {
    throw new Error('Expected the default compact Reader source strip to keep source metadata inline in the heading seam during the Stage 795 audit.')
  }
  if (!reflowedReaderSourceMetaInlineInHeading) {
    throw new Error('Expected loaded Reflowed Reader to keep source metadata inline in the heading seam during the Stage 795 audit.')
  }
  if (!previewBackedReaderSourceMetaInlineInHeading) {
    throw new Error('Expected preview-backed Reader documents to keep source metadata inline in the heading seam during the Stage 795 audit.')
  }
  if (
    typeof defaultReaderCompactHeaderWidthRatio !== 'number' ||
    typeof defaultReaderDeckWidthRatio !== 'number' ||
    defaultReaderCompactHeaderWidthRatio >= defaultReaderDeckWidthRatio
  ) {
    throw new Error(
      `Expected the default compact Reader header lane to stay narrower than the deck during the Stage 795 audit, received header ${defaultReaderCompactHeaderWidthRatio} vs deck ${defaultReaderDeckWidthRatio}.`,
    )
  }
  if (
    typeof reflowedReaderCompactHeaderWidthRatio !== 'number' ||
    typeof reflowedReaderDeckWidthRatio !== 'number' ||
    reflowedReaderCompactHeaderWidthRatio >= reflowedReaderDeckWidthRatio
  ) {
    throw new Error(
      `Expected loaded Reflowed Reader to keep the compact header lane narrower than the deck during the Stage 795 audit, received header ${reflowedReaderCompactHeaderWidthRatio} vs deck ${reflowedReaderDeckWidthRatio}.`,
    )
  }
  if (
    typeof previewBackedReaderCompactHeaderWidthRatio !== 'number' ||
    typeof previewBackedReaderDeckWidthRatio !== 'number' ||
    previewBackedReaderCompactHeaderWidthRatio >= previewBackedReaderDeckWidthRatio
  ) {
    throw new Error(
      `Expected preview-backed Reader documents to keep the compact header lane narrower than the deck during the Stage 795 audit, received header ${previewBackedReaderCompactHeaderWidthRatio} vs deck ${previewBackedReaderDeckWidthRatio}.`,
    )
  }
  if (!defaultReaderTransportClusterNearModes) {
    throw new Error('Expected the compact Reader transport cluster to sit near the mode strip inside the narrowed header lane during the Stage 795 audit.')
  }
  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 795 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 795 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the live dataset during the Stage 795 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage795-post-stage794-reader-compact-header-lane-alignment-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Compact Reader source identity should read as one heading seam with inline source type and note chips.',
          'The compact mode-plus-transport ribbon should narrow to the article-adjacent header lane instead of the wider deck width.',
          'Reflowed and preview-backed Reader documents should keep the same tighter compact header treatment.',
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
        path: path.join(outputDir, 'stage795-reader-compact-header-lane-alignment-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage795-reader-compact-header-lane-alignment-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
