import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE793_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE793_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE793_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE793_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE793_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE793_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage793-reader-document-open-topbar-utility-deflation-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage793-reader-document-open-topbar-utility-deflation-regression-failure.png'), {
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
    stagePrefix: 'stage793',
  })

  const {
    defaultReaderTopbarActionLabels,
    defaultReaderTopbarActionsCompact,
    defaultReaderTopbarCompact,
    defaultReaderTopbarHeight,
    defaultReaderTopbarShortcutHintVisible,
    notebookOpenWorkbenchVisible,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
  } = evidence.metrics

  if (!defaultReaderTopbarCompact) {
    throw new Error('Expected the active Reader topbar to keep the compact document-open shell treatment during the Stage 793 audit.')
  }
  if (!defaultReaderTopbarActionsCompact) {
    throw new Error('Expected the active Reader topbar actions to use the Reader-only compact utility wrapper during the Stage 793 audit.')
  }
  if (defaultReaderTopbarShortcutHintVisible) {
    throw new Error('Expected the visible Ctrl+K hint to be retired from the compact Reader topbar during the Stage 793 audit.')
  }
  if (typeof defaultReaderTopbarHeight !== 'number' || defaultReaderTopbarHeight >= 46) {
    throw new Error(`Expected the compact Reader topbar to stay below the Stage 791 shell height during the Stage 793 audit, received ${defaultReaderTopbarHeight}.`)
  }
  if (!Array.isArray(defaultReaderTopbarActionLabels) || !defaultReaderTopbarActionLabels.some((label) => /Search/i.test(label))) {
    throw new Error('Expected Search to remain available in the compact Reader topbar during the Stage 793 audit.')
  }
  if (!defaultReaderTopbarActionLabels.some((label) => /Add/i.test(label))) {
    throw new Error('Expected Add to remain available in the compact Reader topbar during the Stage 793 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 793 audit.')
  }
  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 793 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the current live dataset during the Stage 793 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage793-post-stage792-reader-document-open-topbar-utility-deflation-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Active Reader documents should keep Search and Add in a smaller utility seam.',
          'The compact Reader topbar should no longer show the visible Ctrl+K hint.',
          'Source reopening, Notebook reopening, and wider Recall regressions should stay stable.',
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
        path: path.join(outputDir, 'stage793-reader-document-open-topbar-utility-deflation-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage793-reader-document-open-topbar-utility-deflation-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
