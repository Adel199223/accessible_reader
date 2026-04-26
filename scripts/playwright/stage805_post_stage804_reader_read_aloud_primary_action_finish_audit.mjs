import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE805_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE805_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE805_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE805_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE805_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE805_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage805-reader-read-aloud-primary-action-finish-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage805-reader-read-aloud-primary-action-finish-regression-failure.png'), {
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
    stagePrefix: 'stage805',
  })

  const {
    defaultReaderEmbeddedPrimaryTransportHeight,
    defaultReaderPrimaryTransportLabelClipped,
    defaultReaderPrimaryTransportUsesSpeechIcon,
    defaultReaderPrimaryTransportWidth,
    notebookOpenWorkbenchVisible,
    previewBackedReaderEmbeddedPrimaryTransportHeight,
    previewBackedReaderPrimaryTransportLabelClipped,
    previewBackedReaderPrimaryTransportUsesSpeechIcon,
    previewBackedReaderPrimaryTransportWidth,
    reflowedReaderEmbeddedPrimaryTransportHeight,
    reflowedReaderPrimaryTransportLabelClipped,
    reflowedReaderPrimaryTransportUsesSpeechIcon,
    reflowedReaderPrimaryTransportWidth,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
  } = evidence.metrics

  const assertFinishedPrimaryAction = (label, clipped, usesSpeechIcon, width, height) => {
    if (clipped) {
      throw new Error(`Expected ${label} compact Reader to keep the Read aloud label fully visible during the Stage 805 audit.`)
    }
    if (!usesSpeechIcon) {
      throw new Error(`Expected ${label} compact Reader to use the speech-specific idle Read aloud icon during the Stage 805 audit.`)
    }
    if (typeof width !== 'number' || width < 84) {
      throw new Error(`Expected ${label} compact Reader to keep a real Read aloud pill during the Stage 805 audit, received width ${width}.`)
    }
    if (typeof height !== 'number' || width <= height + 24) {
      throw new Error(
        `Expected ${label} compact Reader to keep the Read aloud pill clearly wider than its height during the Stage 805 audit, received ${width}x${height}.`,
      )
    }
  }

  assertFinishedPrimaryAction(
    'default',
    defaultReaderPrimaryTransportLabelClipped,
    defaultReaderPrimaryTransportUsesSpeechIcon,
    defaultReaderPrimaryTransportWidth,
    defaultReaderEmbeddedPrimaryTransportHeight,
  )
  assertFinishedPrimaryAction(
    'Reflowed',
    reflowedReaderPrimaryTransportLabelClipped,
    reflowedReaderPrimaryTransportUsesSpeechIcon,
    reflowedReaderPrimaryTransportWidth,
    reflowedReaderEmbeddedPrimaryTransportHeight,
  )
  assertFinishedPrimaryAction(
    'preview-backed',
    previewBackedReaderPrimaryTransportLabelClipped,
    previewBackedReaderPrimaryTransportUsesSpeechIcon,
    previewBackedReaderPrimaryTransportWidth,
    previewBackedReaderEmbeddedPrimaryTransportHeight,
  )

  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 805 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 805 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the live dataset during the Stage 805 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage805-post-stage804-reader-read-aloud-primary-action-finish-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Compact Reader should keep a full visible Read aloud primary pill inside the fused compact header.',
          'The idle start-state transport should use a speech-specific icon without changing active pause, resume, or stop behavior.',
          'Default, Reflowed, and preview-backed Reader documents should keep the finished primary action on the same live dataset.',
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
        path: path.join(outputDir, 'stage805-reader-read-aloud-primary-action-finish-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage805-reader-read-aloud-primary-action-finish-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
