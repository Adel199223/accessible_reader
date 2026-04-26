import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE879_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE879_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE879_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE879_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE879_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE879_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

function assertReaderActiveListenAudit(metrics) {
  if (!metrics.readerActiveListenSeamVisible) {
    throw new Error('Stage 879 expected active/paused Reader playback to show the compact Listen seam.')
  }
  if (metrics.readerActiveTransportToolbarBloomVisible) {
    throw new Error('Stage 879 found the retired active transport toolbar bloom visible again.')
  }
  if (metrics.readerActiveListenStatusLabel !== 'Listening' || metrics.readerPausedListenStatusLabel !== 'Paused') {
    throw new Error('Stage 879 expected the active Listen seam to preserve Listening and Paused status ownership.')
  }
  if (!metrics.readerActiveSentenceProgressInline || !metrics.readerActiveCurrentSentenceExcerptVisible) {
    throw new Error('Stage 879 expected inline sentence progress and current sentence excerpt in the active Listen seam.')
  }
  if (metrics.readerActivePrimaryPlaybackLabel !== 'Pause' || metrics.readerPausedPrimaryPlaybackLabel !== 'Resume') {
    throw new Error('Stage 879 expected visible Pause and Resume labels inside the active Listen seam.')
  }
  if (!metrics.readerShortDocumentCompletionStripHiddenWhileListening || !metrics.readerIdleCompletionStripReturnsAfterStop) {
    throw new Error('Stage 879 expected the short-document completion strip to hide during playback and return at idle.')
  }
  if (!metrics.readerSupportOpenActiveListenSeamVisible) {
    throw new Error('Stage 879 expected support-open short Reader to keep the active Listen seam available.')
  }
  if (!metrics.readerSupportOpenShortDocumentContentFitStable) {
    throw new Error('Stage 879 expected support-open short documents to preserve Stage 867 content-fit continuity.')
  }
  if (metrics.readerLongDocumentCompletionStripVisible || !metrics.readerLongDocumentArticleFieldStable) {
    throw new Error('Stage 879 expected long Reader documents to stay stable with no short-document strip.')
  }
  if (!metrics.readerGeneratedOutputsFrozen) {
    throw new Error('Stage 879 expected generated Reader outputs to remain frozen.')
  }
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage879-reader-active-listen-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage879-reader-active-listen-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage879',
  })

  assertReaderActiveListenAudit(evidence.metrics)

  await writeFile(
    path.join(outputDir, 'stage879-post-stage878-reader-active-listen-seam-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Active and paused Reader playback should be owned by one compact Listen seam.',
          'The old progress-chip plus transport-toolbar bloom should stay retired.',
          'Short-document completion, support-open continuity, long docs, generated outputs, and cross-surface regressions should remain green.',
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
        path: path.join(outputDir, 'stage879-reader-active-listen-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage879-reader-active-listen-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
