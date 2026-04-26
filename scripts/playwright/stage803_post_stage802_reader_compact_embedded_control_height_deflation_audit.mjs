import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE803_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE803_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE803_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE803_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE803_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE803_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage803-reader-compact-embedded-control-height-deflation-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage803-reader-compact-embedded-control-height-deflation-regression-failure.png'), {
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
    stagePrefix: 'stage803',
  })

  const {
    defaultReaderCompactHeaderSharedRow,
    defaultReaderControlRibbonEmbeddedInSourceWorkspace,
    defaultReaderEmbeddedCompactControlDensity,
    defaultReaderEmbeddedModeTabHeight,
    defaultReaderEmbeddedPrimaryTransportHeight,
    notebookOpenWorkbenchVisible,
    previewBackedReaderCompactHeaderSharedRow,
    previewBackedReaderControlRibbonEmbeddedInSourceWorkspace,
    previewBackedReaderEmbeddedCompactControlDensity,
    previewBackedReaderEmbeddedModeTabHeight,
    previewBackedReaderEmbeddedPrimaryTransportHeight,
    reflowedReaderCompactHeaderSharedRow,
    reflowedReaderControlRibbonEmbeddedInSourceWorkspace,
    reflowedReaderEmbeddedCompactControlDensity,
    reflowedReaderEmbeddedModeTabHeight,
    reflowedReaderEmbeddedPrimaryTransportHeight,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
  } = evidence.metrics

  const assertEmbeddedCompactControls = (label, embedded, sharedRow, compactDensity, tabHeight, transportHeight) => {
    if (!embedded) {
      throw new Error(`Expected ${label} compact Reader to keep its control ribbon embedded inside the source seam during the Stage 803 audit.`)
    }
    if (!sharedRow) {
      throw new Error(`Expected ${label} compact Reader to keep one shared compact header row during the Stage 803 audit.`)
    }
    if (!compactDensity) {
      throw new Error(`Expected ${label} compact Reader to use the slimmer embedded-control treatment during the Stage 803 audit.`)
    }
    if (typeof tabHeight !== 'number' || tabHeight > 37) {
      throw new Error(`Expected ${label} compact Reader tabs to stay slim during the Stage 803 audit, received ${tabHeight}.`)
    }
    if (typeof transportHeight !== 'number' || transportHeight > 43) {
      throw new Error(`Expected ${label} compact Reader primary transport to stay slimmer during the Stage 803 audit, received ${transportHeight}.`)
    }
  }

  assertEmbeddedCompactControls(
    'default',
    defaultReaderControlRibbonEmbeddedInSourceWorkspace,
    defaultReaderCompactHeaderSharedRow,
    defaultReaderEmbeddedCompactControlDensity,
    defaultReaderEmbeddedModeTabHeight,
    defaultReaderEmbeddedPrimaryTransportHeight,
  )
  assertEmbeddedCompactControls(
    'Reflowed',
    reflowedReaderControlRibbonEmbeddedInSourceWorkspace,
    reflowedReaderCompactHeaderSharedRow,
    reflowedReaderEmbeddedCompactControlDensity,
    reflowedReaderEmbeddedModeTabHeight,
    reflowedReaderEmbeddedPrimaryTransportHeight,
  )
  assertEmbeddedCompactControls(
    'preview-backed',
    previewBackedReaderControlRibbonEmbeddedInSourceWorkspace,
    previewBackedReaderCompactHeaderSharedRow,
    previewBackedReaderEmbeddedCompactControlDensity,
    previewBackedReaderEmbeddedModeTabHeight,
    previewBackedReaderEmbeddedPrimaryTransportHeight,
  )

  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 803 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 803 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the live dataset during the Stage 803 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage803-post-stage802-reader-compact-embedded-control-height-deflation-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Compact Reader should keep the fused header row while reducing the visual weight of the embedded tabs and Read aloud controls.',
          'The embedded compact control ribbon should preserve Source and Notebook reopen behavior without reviving the old staged control ribbon.',
          'Default, Reflowed, and preview-backed Reader documents should keep the slimmer embedded controls on the same live dataset.',
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
        path: path.join(outputDir, 'stage803-reader-compact-embedded-control-height-deflation-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage803-reader-compact-embedded-control-height-deflation-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
