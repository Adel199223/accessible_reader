import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE797_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE797_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE797_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE797_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE797_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE797_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage797-reader-compact-control-cluster-convergence-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage797-reader-compact-control-cluster-convergence-regression-failure.png'), {
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
    stagePrefix: 'stage797',
  })

  const {
    defaultReaderControlClusterGap,
    defaultReaderControlClusterGapRatio,
    defaultReaderControlClusterSameRow,
    notebookOpenWorkbenchVisible,
    previewBackedReaderControlClusterGap,
    previewBackedReaderControlClusterGapRatio,
    previewBackedReaderControlClusterSameRow,
    reflowedReaderControlClusterGap,
    reflowedReaderControlClusterGapRatio,
    reflowedReaderControlClusterSameRow,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
  } = evidence.metrics

  const assertPackedCluster = (label, gap, ratio, sameRow) => {
    if (!sameRow) {
      throw new Error(`Expected ${label} compact Reader controls to remain on one row during the Stage 797 audit.`)
    }
    if (typeof gap !== 'number' || typeof ratio !== 'number') {
      throw new Error(`Expected ${label} compact Reader controls to report a measurable cluster gap during the Stage 797 audit.`)
    }
    if (gap > 96 || ratio > 0.14) {
      throw new Error(
        `Expected ${label} compact Reader controls to stay tightly packed during the Stage 797 audit, received gap ${gap} and ratio ${ratio}.`,
      )
    }
  }

  assertPackedCluster('default', defaultReaderControlClusterGap, defaultReaderControlClusterGapRatio, defaultReaderControlClusterSameRow)
  assertPackedCluster('Reflowed', reflowedReaderControlClusterGap, reflowedReaderControlClusterGapRatio, reflowedReaderControlClusterSameRow)
  assertPackedCluster(
    'preview-backed',
    previewBackedReaderControlClusterGap,
    previewBackedReaderControlClusterGapRatio,
    previewBackedReaderControlClusterSameRow,
  )

  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 797 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 797 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the live dataset during the Stage 797 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage797-post-stage796-reader-compact-control-cluster-convergence-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Compact Reader should stop splitting the mode strip and transport cluster to opposite sides of the narrowed header lane.',
          'Original or Reflowed mode tabs plus the primary Read aloud controls should read as one packed control band.',
          'Source reopening, Notebook reopening, and wider Recall regressions should remain stable.',
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
        path: path.join(outputDir, 'stage797-reader-compact-control-cluster-convergence-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage797-reader-compact-control-cluster-convergence-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
