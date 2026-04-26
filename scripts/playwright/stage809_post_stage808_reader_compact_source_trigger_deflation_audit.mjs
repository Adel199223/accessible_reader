import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE809_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE809_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE809_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE809_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE809_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE809_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage809-reader-compact-source-trigger-deflation-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage809-reader-compact-source-trigger-deflation-regression-failure.png'), {
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
    stagePrefix: 'stage809',
  })

  const {
    defaultReaderSourceNavTriggerQuietInline,
    defaultReaderSourceNavTriggerUsesBadgeChrome,
    notebookOpenWorkbenchVisible,
    previewBackedReaderSourceNavTriggerQuietInline,
    previewBackedReaderSourceNavTriggerUsesBadgeChrome,
    reflowedReaderSourceNavTriggerQuietInline,
    reflowedReaderSourceNavTriggerUsesBadgeChrome,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
  } = evidence.metrics

  const assertQuietSourceTrigger = (label, quietInline, usesBadgeChrome) => {
    if (!quietInline) {
      throw new Error(`Expected ${label} compact Reader to render the Source trigger as quieter inline seam text during the Stage 809 audit.`)
    }
    if (usesBadgeChrome) {
      throw new Error(`Expected ${label} compact Reader to retire Source badge chrome during the Stage 809 audit.`)
    }
  }

  assertQuietSourceTrigger('default', defaultReaderSourceNavTriggerQuietInline, defaultReaderSourceNavTriggerUsesBadgeChrome)
  assertQuietSourceTrigger('Reflowed', reflowedReaderSourceNavTriggerQuietInline, reflowedReaderSourceNavTriggerUsesBadgeChrome)
  assertQuietSourceTrigger(
    'preview-backed',
    previewBackedReaderSourceNavTriggerQuietInline,
    previewBackedReaderSourceNavTriggerUsesBadgeChrome,
  )

  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 809 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 809 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the live dataset during the Stage 809 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage809-post-stage808-reader-compact-source-trigger-deflation-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Compact Reader should keep the Source trigger as quieter inline seam text instead of badge chrome.',
          'The Source trigger should stay compact and inline in default, Reflowed, and preview-backed Reader states.',
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
        path: path.join(outputDir, 'stage809-reader-compact-source-trigger-deflation-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage809-reader-compact-source-trigger-deflation-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
