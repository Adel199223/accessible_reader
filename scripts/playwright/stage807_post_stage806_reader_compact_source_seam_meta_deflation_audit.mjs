import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE807_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE807_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE807_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE807_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE807_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE807_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage807-reader-compact-source-seam-meta-deflation-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage807-reader-compact-source-seam-meta-deflation-regression-failure.png'), {
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
    stagePrefix: 'stage807',
  })

  const {
    defaultReaderSourceMetaChipCount,
    defaultReaderSourceMetaInlineLabelVisible,
    defaultReaderSourceMetaInlineQuiet,
    defaultReaderSourceStripNoteTriggerUsesInlineText,
    notebookOpenWorkbenchVisible,
    previewBackedReaderSourceMetaChipCount,
    previewBackedReaderSourceMetaInlineLabelVisible,
    previewBackedReaderSourceMetaInlineQuiet,
    previewBackedReaderSourceStripNoteTriggerUsesInlineText,
    reflowedReaderSourceMetaChipCount,
    reflowedReaderSourceMetaInlineLabelVisible,
    reflowedReaderSourceMetaInlineQuiet,
    reflowedReaderSourceStripNoteTriggerUsesInlineText,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
  } = evidence.metrics

  const assertQuietInlineMeta = (label, inlineQuiet, inlineLabelVisible, chipCount, noteTriggerInline) => {
    if (!inlineQuiet) {
      throw new Error(`Expected ${label} compact Reader to render source metadata in the quieter inline seam during the Stage 807 audit.`)
    }
    if (!inlineLabelVisible) {
      throw new Error(`Expected ${label} compact Reader to keep a visible inline source-type label during the Stage 807 audit.`)
    }
    if (chipCount !== 0) {
      throw new Error(`Expected ${label} compact Reader to retire source metadata badge chrome during the Stage 807 audit, received ${chipCount} chips.`)
    }
    if (!noteTriggerInline) {
      throw new Error(`Expected ${label} compact Reader to keep the nearby note-count trigger as inline seam text during the Stage 807 audit.`)
    }
  }

  assertQuietInlineMeta(
    'default',
    defaultReaderSourceMetaInlineQuiet,
    defaultReaderSourceMetaInlineLabelVisible,
    defaultReaderSourceMetaChipCount,
    defaultReaderSourceStripNoteTriggerUsesInlineText,
  )
  assertQuietInlineMeta(
    'Reflowed',
    reflowedReaderSourceMetaInlineQuiet,
    reflowedReaderSourceMetaInlineLabelVisible,
    reflowedReaderSourceMetaChipCount,
    reflowedReaderSourceStripNoteTriggerUsesInlineText,
  )
  assertQuietInlineMeta(
    'preview-backed',
    previewBackedReaderSourceMetaInlineQuiet,
    previewBackedReaderSourceMetaInlineLabelVisible,
    previewBackedReaderSourceMetaChipCount,
    previewBackedReaderSourceStripNoteTriggerUsesInlineText,
  )

  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 807 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 807 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the live dataset during the Stage 807 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage807-post-stage806-reader-compact-source-seam-meta-deflation-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Compact Reader should render source type and note-count metadata as inline seam context instead of badge chrome.',
          'The nearby note-count trigger should stay interactive while reading as quieter inline context.',
          'Default, Reflowed, and preview-backed Reader documents should keep the quieter source seam on the same live dataset.',
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
        path: path.join(outputDir, 'stage807-reader-compact-source-seam-meta-deflation-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage807-reader-compact-source-seam-meta-deflation-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
