import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE877_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE877_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE877_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE877_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE877_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE877_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

function assertReaderShortDocumentCompletionAudit(metrics) {
  if (metrics.readerShortDocumentEmptySlabVisible) {
    throw new Error('Stage 877 found the retired short-document empty slab visible again.')
  }
  if (!metrics.readerShortDocumentCompletionStripVisible) {
    throw new Error('Stage 877 expected the short-document completion strip to be visible at rest.')
  }
  if (metrics.readerShortDocumentFirstViewportDeadZoneVisible) {
    throw new Error('Stage 877 expected the completion strip to retire the at-rest short-document dead zone.')
  }
  if (!metrics.readerShortDocumentSourceHandoffVisible || !metrics.readerShortDocumentNotebookHandoffVisible) {
    throw new Error('Stage 877 expected both Source and Notebook completion-strip handoffs to remain visible.')
  }
  if (!metrics.readerSupportOpenShortDocumentContentFitStable) {
    throw new Error('Stage 877 expected support-open short documents to preserve content-fit continuity without the at-rest strip.')
  }
  if (metrics.readerLongDocumentCompletionStripVisible || !metrics.readerLongDocumentArticleFieldStable) {
    throw new Error('Stage 877 expected long Reader documents to stay on the long-document layout with no completion strip.')
  }
  if (!metrics.readerGeneratedOutputsFrozen) {
    throw new Error('Stage 877 expected generated Reader outputs to remain frozen.')
  }
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage877-reader-short-document-completion-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage877-reader-short-document-completion-regression-failure.png'), {
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
    stagePrefix: 'stage877',
  })

  assertReaderShortDocumentCompletionAudit(evidence.metrics)

  await writeFile(
    path.join(outputDir, 'stage877-post-stage876-reader-short-document-completion-strip-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Short Original/Reflowed Reader captures should prove the compact completion strip replaces the blank first viewport.',
          'Source and Notebook handoffs should remain visible in the strip while support-open states stay compact.',
          'Long Reader, generated Reader, Home, Graph, embedded Notebook, and Study regressions should remain green.',
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
        path: path.join(outputDir, 'stage877-reader-short-document-completion-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage877-reader-short-document-completion-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
