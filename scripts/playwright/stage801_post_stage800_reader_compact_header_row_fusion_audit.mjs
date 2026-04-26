import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE801_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE801_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE801_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE801_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE801_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE801_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage801-reader-compact-header-row-fusion-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage801-reader-compact-header-row-fusion-regression-failure.png'), {
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
    stagePrefix: 'stage801',
  })

  const {
    defaultReaderCompactHeaderSharedRow,
    defaultReaderControlRibbonEmbeddedInSourceWorkspace,
    defaultReaderSourceStripDividerVisible,
    notebookOpenWorkbenchVisible,
    previewBackedReaderCompactHeaderSharedRow,
    previewBackedReaderControlRibbonEmbeddedInSourceWorkspace,
    previewBackedReaderSourceStripDividerVisible,
    reflowedReaderCompactHeaderSharedRow,
    reflowedReaderControlRibbonEmbeddedInSourceWorkspace,
    reflowedReaderSourceStripDividerVisible,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
  } = evidence.metrics

  const assertUnifiedHeader = (label, embedded, sharedRow, dividerVisible) => {
    if (!embedded) {
      throw new Error(`Expected ${label} compact Reader to embed its control ribbon inside the source seam during the Stage 801 audit.`)
    }
    if (!sharedRow) {
      throw new Error(`Expected ${label} compact Reader source seam and controls to share one header row during the Stage 801 audit.`)
    }
    if (dividerVisible) {
      throw new Error(`Expected ${label} compact Reader to keep the old source-strip divider retired during the Stage 801 audit.`)
    }
  }

  assertUnifiedHeader(
    'default',
    defaultReaderControlRibbonEmbeddedInSourceWorkspace,
    defaultReaderCompactHeaderSharedRow,
    defaultReaderSourceStripDividerVisible,
  )
  assertUnifiedHeader(
    'Reflowed',
    reflowedReaderControlRibbonEmbeddedInSourceWorkspace,
    reflowedReaderCompactHeaderSharedRow,
    reflowedReaderSourceStripDividerVisible,
  )
  assertUnifiedHeader(
    'preview-backed',
    previewBackedReaderControlRibbonEmbeddedInSourceWorkspace,
    previewBackedReaderCompactHeaderSharedRow,
    previewBackedReaderSourceStripDividerVisible,
  )

  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 801 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 801 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the live dataset during the Stage 801 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage801-post-stage800-reader-compact-header-row-fusion-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Compact Reader should stop spending one row on source identity and another row on active controls.',
          'The compact source seam should embed the mode strip and read-aloud cluster while keeping the same Source trigger, title, type chip, and note chip.',
          'Original, Reflowed, and preview-backed Reader documents should keep Source and Notebook reopening stable after the compact header-row fusion.',
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
        path: path.join(outputDir, 'stage801-reader-compact-header-row-fusion-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage801-reader-compact-header-row-fusion-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
