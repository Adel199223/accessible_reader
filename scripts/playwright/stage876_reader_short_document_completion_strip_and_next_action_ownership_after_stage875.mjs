import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE876_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE876_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE876_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE876_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE876_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE876_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

function assertReaderShortDocumentCompletion(metrics, stageLabel) {
  if (!metrics.readerShortDocumentArticleFieldContentFit || metrics.readerShortDocumentEmptySlabVisible) {
    throw new Error(`${stageLabel} expected the Stage 865 short-document content-fit baseline to remain intact.`)
  }
  if (!metrics.readerShortDocumentCompletionStripVisible) {
    throw new Error(`${stageLabel} expected short Original/Reflowed documents to expose the compact completion strip.`)
  }
  if (metrics.readerShortDocumentFirstViewportDeadZoneVisible) {
    throw new Error(`${stageLabel} found the at-rest short-document first-viewport dead zone visible again.`)
  }
  if (
    typeof metrics.readerShortDocumentCompletionStripHeight !== 'number' ||
    metrics.readerShortDocumentCompletionStripHeight <= 0 ||
    metrics.readerShortDocumentCompletionStripHeight >= 96
  ) {
    throw new Error(
      `${stageLabel} expected a thin completion strip, received height ${metrics.readerShortDocumentCompletionStripHeight}.`,
    )
  }
  if (!metrics.readerShortDocumentSourceHandoffVisible || !metrics.readerShortDocumentNotebookHandoffVisible) {
    throw new Error(`${stageLabel} expected Source and Notebook handoffs in the short-document completion strip.`)
  }
  if (!metrics.readerSupportOpenShortDocumentContentFitStable || metrics.readerShortDocumentSupportOpenEmptySlabVisible) {
    throw new Error(`${stageLabel} expected support-open short documents to stay compact and omit the at-rest strip.`)
  }
  if (!metrics.readerLongDocumentArticleFieldStable || metrics.readerLongDocumentCompletionStripVisible) {
    throw new Error(`${stageLabel} expected long Reader documents to avoid the short-document completion strip.`)
  }
  if (!metrics.readerGeneratedOutputsFrozen) {
    throw new Error(`${stageLabel} expected generated Reader outputs to remain frozen.`)
  }
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage876-reader-short-document-completion-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage876-reader-short-document-completion-regression-failure.png'), {
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
    stagePrefix: 'stage876',
  })

  assertReaderShortDocumentCompletion(evidence.metrics, 'Stage 876')

  await writeFile(
    path.join(outputDir, 'stage876-reader-short-document-completion-strip-after-stage875-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Short at-rest Original/Reflowed Reader documents should keep content-fit article fields and gain a thin completion strip.',
          'The completion strip should expose existing Source and Notebook handoffs without reviving support-open slabs.',
          'Long Reader documents, generated outputs, and Home/Graph/Notebook/Study regressions should remain stable.',
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
        path: path.join(outputDir, 'stage876-reader-short-document-completion-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage876-reader-short-document-completion-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
