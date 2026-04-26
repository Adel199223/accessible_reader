import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE813_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE813_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE813_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE813_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE813_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE813_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage813-reader-compact-source-type-selective-retirement-audit-failure.png'), {
  force: true,
})
await rm(path.join(outputDir, 'stage813-reader-compact-source-type-selective-retirement-regression-failure.png'), {
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
    stagePrefix: 'stage813',
  })

  const {
    defaultReaderSourceInlineTextLabels,
    defaultReaderSourceStripMetaLabels,
    defaultReaderSourceStripNoteChipTriggerVisible,
    defaultReaderSourceTypeVisible,
    notebookOpenWorkbenchVisible,
    previewBackedReaderSourceInlineTextLabels,
    previewBackedReaderSourceStripMetaLabels,
    previewBackedReaderSourceTypeVisible,
    reflowedReaderSourceInlineTextLabels,
    reflowedReaderSourceTypeVisible,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
  } = evidence.metrics

  if (defaultReaderSourceTypeVisible) {
    throw new Error(
      `Expected default compact Reader to retire the paste source-type label during the Stage 813 audit, received inline labels: ${defaultReaderSourceInlineTextLabels.join(', ') || 'none'}.`,
    )
  }
  if (defaultReaderSourceStripMetaLabels.some((label) => label.toUpperCase() === 'PASTE')) {
    throw new Error('Expected default compact Reader source metadata to omit the PASTE label during the Stage 813 audit.')
  }
  if (!defaultReaderSourceStripNoteChipTriggerVisible) {
    throw new Error('Expected default compact Reader to keep the nearby note-count handoff visible during the Stage 813 audit.')
  }
  if (reflowedReaderSourceTypeVisible) {
    throw new Error(
      `Expected Reflowed compact Reader to retire the paste source-type label during the Stage 813 audit, received inline labels: ${reflowedReaderSourceInlineTextLabels.join(', ') || 'none'}.`,
    )
  }
  if (!previewBackedReaderSourceTypeVisible) {
    throw new Error('Expected preview-backed compact Reader to retain an informative source-type label during the Stage 813 audit.')
  }
  if (!previewBackedReaderSourceInlineTextLabels.includes('HTML')) {
    throw new Error(
      `Expected preview-backed compact Reader to keep HTML as an inline source-type label during the Stage 813 audit, received: ${previewBackedReaderSourceInlineTextLabels.join(', ') || 'none'}.`,
    )
  }
  if (!previewBackedReaderSourceStripMetaLabels.includes('HTML')) {
    throw new Error(
      `Expected preview-backed compact Reader seam metadata to include HTML during the Stage 813 audit, received: ${previewBackedReaderSourceStripMetaLabels.join(', ') || 'none'}.`,
    )
  }
  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 813 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 813 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the live dataset during the Stage 813 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage813-post-stage812-reader-compact-source-type-selective-retirement-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Compact Reader should drop the low-signal paste source-type label while keeping the nearby note-count handoff visible.',
          'Preview-backed compact Reader should retain informative source-type context such as HTML in the same seam.',
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
        path: path.join(outputDir, 'stage813-reader-compact-source-type-selective-retirement-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage813-reader-compact-source-type-selective-retirement-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
