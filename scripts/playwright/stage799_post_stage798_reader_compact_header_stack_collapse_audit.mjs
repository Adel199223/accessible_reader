import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE799_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE799_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE799_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE799_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE799_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE799_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage799-reader-compact-header-stack-collapse-audit-failure.png'), { force: true })
await rm(path.join(outputDir, 'stage799-reader-compact-header-stack-collapse-regression-failure.png'), {
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
    stagePrefix: 'stage799',
  })

  const {
    defaultReaderSourceStripDividerVisible,
    defaultReaderSourceToControlGap,
    notebookOpenWorkbenchVisible,
    previewBackedReaderSourceStripDividerVisible,
    previewBackedReaderSourceToControlGap,
    reflowedReaderSourceStripDividerVisible,
    reflowedReaderSourceToControlGap,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
  } = evidence.metrics

  const assertCollapsedStack = (label, dividerVisible, gap) => {
    if (dividerVisible) {
      throw new Error(`Expected ${label} compact Reader source seam to retire its divider during the Stage 799 audit.`)
    }
    if (typeof gap !== 'number') {
      throw new Error(`Expected ${label} compact Reader to report a measurable source-to-control gap during the Stage 799 audit.`)
    }
    if (gap > 18) {
      throw new Error(
        `Expected ${label} compact Reader to keep a short source-to-control lead-in during the Stage 799 audit, received gap ${gap}.`,
      )
    }
  }

  assertCollapsedStack('default', defaultReaderSourceStripDividerVisible, defaultReaderSourceToControlGap)
  assertCollapsedStack('Reflowed', reflowedReaderSourceStripDividerVisible, reflowedReaderSourceToControlGap)
  assertCollapsedStack('preview-backed', previewBackedReaderSourceStripDividerVisible, previewBackedReaderSourceToControlGap)

  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 799 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 799 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the live dataset during the Stage 799 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage799-post-stage798-reader-compact-header-stack-collapse-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Compact Reader should stop treating the source seam and control cluster like two separated header bands.',
          'The compact source strip should lose its divider treatment while keeping the same source trigger, title, type chip, and note chip.',
          'Original, Reflowed, and preview-backed Reader documents should keep the same shorter lead-in while Source and Notebook reopening remain stable.',
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
        path: path.join(outputDir, 'stage799-reader-compact-header-stack-collapse-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage799-reader-compact-header-stack-collapse-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
