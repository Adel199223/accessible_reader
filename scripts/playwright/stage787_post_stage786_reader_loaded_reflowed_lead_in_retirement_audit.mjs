import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderReadingFirstEvidence, desktopViewport } from './reader_reading_first_hierarchy_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE787_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE787_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE787_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE787_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE787_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE787_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage787-reader-loaded-reflowed-lead-in-retirement-audit-failure.png'), {
  force: true,
})
await rm(path.join(outputDir, 'stage787-reader-loaded-reflowed-lead-in-retirement-regression-failure.png'), {
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
    stagePrefix: 'stage787',
  })

  const {
    notebookOpenWorkbenchVisible,
    reflowedReaderDerivedContextVisible,
    reflowedReaderHasArticle,
    simplifiedViewAvailable,
    sourceOpenReaderSourceLibraryVisible,
    summaryReaderDerivedContextVisible,
  } = evidence.metrics

  if (reflowedReaderDerivedContextVisible) {
    throw new Error('Expected loaded Reflowed to retire the derived-context explainer band during the Stage 787 audit.')
  }
  if (!reflowedReaderHasArticle) {
    throw new Error('Expected loaded Reflowed to keep the article visible during the Stage 787 audit.')
  }
  if (!summaryReaderDerivedContextVisible) {
    throw new Error('Expected Summary to keep its derived-context surface during the Stage 787 audit.')
  }
  if (!notebookOpenWorkbenchVisible) {
    throw new Error('Expected Notebook support to keep reopening normally during the Stage 787 audit.')
  }
  if (!sourceOpenReaderSourceLibraryVisible) {
    throw new Error('Expected Source support to keep reopening normally during the Stage 787 audit.')
  }
  if (simplifiedViewAvailable) {
    throw new Error('Expected Simplified to remain unavailable on the current live dataset during the Stage 787 audit.')
  }

  await writeFile(
    path.join(outputDir, 'stage787-post-stage786-reader-loaded-reflowed-lead-in-retirement-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Loaded Reflowed should no longer render a derived-context explainer band before the article.',
          'Loaded Reflowed should keep the article, source strip, mode tabs, read-aloud controls, and nearby Notebook reopening intact.',
          'Summary should remain on the existing derived-context path while Source, Notebook, and wider Recall regressions stay stable.',
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
        path: path.join(outputDir, 'stage787-reader-loaded-reflowed-lead-in-retirement-audit-failure.png'),
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        fullPage: true,
        path: path.join(outputDir, 'stage787-reader-loaded-reflowed-lead-in-retirement-regression-failure.png'),
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
