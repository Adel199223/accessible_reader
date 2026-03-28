import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderRegressionEvidence, captureReaderWorkspaceResetEvidence, desktopViewport } from './reader_workspace_reset_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE701_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE701_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE701_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE701_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE701_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE701_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage701-post-stage700-reader-workspace-ia-and-shell-reset-audit-failure.png'),
  { force: true },
)
await rm(
  path.join(outputDir, 'stage701-post-stage700-reader-workspace-ia-and-shell-reset-audit-failure-regression.png'),
  { force: true },
)

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
  const readerEvidence = await captureReaderWorkspaceResetEvidence({
    baseUrl,
    directory: outputDir,
    page: readerPage,
    stagePrefix: 'stage701',
  })

  const {
    dockToArticleWidthRatio,
    notebookTabSelected,
    originalReaderSourceTitle,
    promoteGraphVisible,
    readerContentHeadingCount,
    readerEyebrowVisible,
    readerFirstSentence,
    readerSourceBadgeText,
    readerSourceStripHeight,
    readerStageChromeHeight,
    readerStageSupportRowVisible,
    readerSupportDockVisible,
    readerSupportLibraryVisible,
    readerSupportTabsVisible,
    readerTopbarQuiet,
    readerTopbarReader,
    selectedNoteTextLength,
    selectedNoteWorkbenchVisible,
    studyPromotionVisible,
  } = readerEvidence.metrics

  if (!readerTopbarQuiet || !readerTopbarReader) {
    throw new Error(`Expected Reader topbar to stay quiet and reader-specific, found ${JSON.stringify(readerEvidence.metrics)}.`)
  }
  if (readerEyebrowVisible) {
    throw new Error('Expected the old "Reader workspace" eyebrow to stay retired in the Reader route.')
  }
  if (readerSourceBadgeText !== 'Source') {
    throw new Error(`Expected the focused source strip to use the compact "Source" badge, found ${readerSourceBadgeText ?? 'none'}.`)
  }
  if (!(readerSourceStripHeight <= 136)) {
    throw new Error(`Expected the Reader source strip to stay compact, found ${readerSourceStripHeight}.`)
  }
  if (!(readerStageChromeHeight <= 242)) {
    throw new Error(`Expected Reader chrome above the article to stay compressed, found ${readerStageChromeHeight}.`)
  }
  if (!readerStageSupportRowVisible) {
    throw new Error('Expected the Reader header support row to remain visible after the shell reset.')
  }
  if (!readerSupportDockVisible || !readerSupportTabsVisible || !readerSupportLibraryVisible) {
    throw new Error(`Expected the Reader dock and contextual source workbench to stay visible, found ${JSON.stringify(readerEvidence.metrics)}.`)
  }
  if (!(dockToArticleWidthRatio >= 0.42 && dockToArticleWidthRatio <= 0.78)) {
    throw new Error(`Expected the Reader dock to stay secondary to the article lane, found ratio ${dockToArticleWidthRatio}.`)
  }
  if (!(readerContentHeadingCount === 1)) {
    throw new Error(`Expected the source title to stay visible once inside Reader, found ${readerContentHeadingCount} matching headings.`)
  }
  if (!readerFirstSentence || readerFirstSentence.length < 12) {
    throw new Error(`Expected the Reader article to keep real sentence content visible, found ${readerFirstSentence ?? 'none'}.`)
  }
  if (!notebookTabSelected || !selectedNoteWorkbenchVisible || selectedNoteTextLength < 8) {
    throw new Error(`Expected reflowed Notebook capture to reopen the selected-note workbench, found ${JSON.stringify(readerEvidence.metrics)}.`)
  }
  if (!promoteGraphVisible || !studyPromotionVisible) {
    throw new Error('Expected selected-note promotion actions to remain available in the Reader workbench.')
  }

  regressionPage = await browser.newPage({ viewport: desktopViewport })
  const regressionEvidence = await captureReaderRegressionEvidence({
    baseUrl,
    directory: outputDir,
    page: regressionPage,
    stagePrefix: 'stage701',
  })

  await writeFile(
    path.join(outputDir, 'stage701-post-stage700-reader-workspace-ia-and-shell-reset-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Reader shell should stay quieter than the document title and retire the old eyebrow copy.',
          'The focused source strip should be visibly slimmer while Reader keeps its source workspace tabs intact.',
          'The dock should stay a contextual workbench with in-place Notebook capture and promotion flows, not a cramped parity sidecar.',
          'Home and Graph remain stable regression surfaces while Reader UI shifts across modes.',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          ...readerEvidence.captures,
          ...regressionEvidence.captures,
        },
        desktopViewport,
        headless,
        metrics: readerEvidence.metrics,
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
        path: path.join(outputDir, 'stage701-post-stage700-reader-workspace-ia-and-shell-reset-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        path: path.join(outputDir, 'stage701-post-stage700-reader-workspace-ia-and-shell-reset-audit-failure-regression.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
