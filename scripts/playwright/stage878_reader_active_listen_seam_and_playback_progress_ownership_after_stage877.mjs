import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE878_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE878_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE878_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE878_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE878_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE878_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

function assertReaderActiveListenSeam(metrics, stageLabel) {
  if (!metrics.readerActiveListenSeamVisible) {
    throw new Error(`${stageLabel} expected active and paused playback to show the compact Listen seam.`)
  }
  if (metrics.readerActiveTransportToolbarBloomVisible) {
    throw new Error(`${stageLabel} found the old active transport toolbar bloom visible.`)
  }
  if (metrics.readerActiveListenStatusLabel !== 'Listening' || metrics.readerPausedListenStatusLabel !== 'Paused') {
    throw new Error(
      `${stageLabel} expected Listening/Paused status labels, received ${metrics.readerActiveListenStatusLabel}/${metrics.readerPausedListenStatusLabel}.`,
    )
  }
  if (!metrics.readerActiveSentenceProgressInline || !metrics.readerActiveCurrentSentenceExcerptVisible) {
    throw new Error(`${stageLabel} expected inline sentence progress and current-sentence excerpt in the Listen seam.`)
  }
  if (metrics.readerActivePrimaryPlaybackLabel !== 'Pause' || metrics.readerPausedPrimaryPlaybackLabel !== 'Resume') {
    throw new Error(
      `${stageLabel} expected Pause/Resume primary playback labels, received ${metrics.readerActivePrimaryPlaybackLabel}/${metrics.readerPausedPrimaryPlaybackLabel}.`,
    )
  }
  if (!metrics.readerShortDocumentCompletionStripHiddenWhileListening || !metrics.readerIdleCompletionStripReturnsAfterStop) {
    throw new Error(`${stageLabel} expected the short-document completion strip to hide during playback and return at idle.`)
  }
  if (!metrics.readerSupportOpenActiveListenSeamVisible) {
    throw new Error(`${stageLabel} expected support-open short Reader to keep the active Listen seam available.`)
  }
  if (!metrics.readerSupportOpenShortDocumentContentFitStable || metrics.readerShortDocumentSupportOpenEmptySlabVisible) {
    throw new Error(`${stageLabel} expected support-open short documents to preserve content-fit continuity.`)
  }
  if (!metrics.readerLongDocumentArticleFieldStable || metrics.readerLongDocumentCompletionStripVisible) {
    throw new Error(`${stageLabel} expected long Reader documents to stay on the long-document layout.`)
  }
  if (!metrics.readerGeneratedOutputsFrozen) {
    throw new Error(`${stageLabel} expected generated Reader outputs to remain frozen.`)
  }
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage878-reader-active-listen-seam-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage878-reader-active-listen-regression-failure.png'), { force: true })

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
    stagePrefix: 'stage878',
  })

  assertReaderActiveListenSeam(evidence.metrics, 'Stage 878')

  await writeFile(
    path.join(outputDir, 'stage878-reader-active-listen-seam-after-stage877-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Active Reader playback should show one compact Listen seam with status, progress, excerpt, and controls.',
          'Short-document completion should hide while listening and return after stop.',
          'Support-open short docs, long docs, generated modes, and non-Reader regressions should remain stable.',
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
        path: path.join(outputDir, 'stage878-reader-active-listen-seam-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage878-reader-active-listen-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
