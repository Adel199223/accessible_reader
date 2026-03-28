import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureReaderGeneratedModeRefinementEvidence,
  captureReaderRegressionEvidence,
  desktopViewport,
} from './reader_generated_mode_refinement_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE703_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE703_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE703_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE703_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE703_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE703_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage703-post-stage702-generated-mode-reader-ux-only-refinement-and-invariant-lock-audit-failure.png'),
  { force: true },
)
await rm(
  path.join(outputDir, 'stage703-post-stage702-generated-mode-reader-ux-only-refinement-and-invariant-lock-audit-failure-regression.png'),
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
  const readerEvidence = await captureReaderGeneratedModeRefinementEvidence({
    baseUrl,
    directory: outputDir,
    page: readerPage,
    stagePrefix: 'stage703',
  })

  const {
    originalDerivedContextVisible,
    reflowedDerivedContextVisible,
    reflowedGraphBranchVisible,
    reflowedNotebookBranchVisible,
    reflowedStudyBranchVisible,
    simplifiedAvailableInLiveData,
    simplifiedCreateVisible,
    simplifiedDerivedContextVisible,
    summaryArticleContainsSummarySnippet,
    summaryContextContainsSummarySnippet,
    summaryCreateVisible,
    summaryCurrentDetailLabel,
    summaryDerivedContextVisible,
    summaryGraphBranchVisible,
    summaryInlineDetailVisible,
    summaryNotebookBranchVisible,
    summaryPlaceholderVisible,
    summaryReadyInLiveData,
    summaryReflowedBranchVisible,
    summarySettingsDetailVisible,
    summaryStudyBranchVisible,
  } = readerEvidence.metrics

  if (originalDerivedContextVisible) {
    throw new Error('Expected Original Reader mode to stay free of the generated-mode context band.')
  }
  if (!reflowedDerivedContextVisible || !reflowedNotebookBranchVisible || !reflowedGraphBranchVisible || !reflowedStudyBranchVisible) {
    throw new Error(`Expected Reflowed to show the derived-mode context and branching actions, found ${JSON.stringify(readerEvidence.metrics)}.`)
  }
  if (simplifiedAvailableInLiveData && (!simplifiedDerivedContextVisible || !simplifiedCreateVisible)) {
    throw new Error(`Expected Simplified to keep the derived-mode band and missing-view create action, found ${JSON.stringify(readerEvidence.metrics)}.`)
  }
  if (!summaryDerivedContextVisible || !summaryInlineDetailVisible || summarySettingsDetailVisible) {
    throw new Error(`Expected Summary detail controls to live inline in the derived-mode band only, found ${JSON.stringify(readerEvidence.metrics)}.`)
  }
  if (summaryCurrentDetailLabel !== 'Balanced') {
    throw new Error(`Expected the live summary detail control to default to Balanced, found ${summaryCurrentDetailLabel ?? 'none'}.`)
  }
  if (!summaryNotebookBranchVisible || !summaryGraphBranchVisible || !summaryStudyBranchVisible || !summaryReflowedBranchVisible) {
    throw new Error(`Expected Summary to keep Notebook/Graph/Study/Reflowed branches visible, found ${JSON.stringify(readerEvidence.metrics)}.`)
  }
  if (summaryReadyInLiveData) {
    if (summaryCreateVisible) {
      throw new Error('Expected the live summary-ready document not to show a create-summary action.')
    }
    if (!summaryArticleContainsSummarySnippet || summaryContextContainsSummarySnippet) {
      throw new Error(`Expected summary article text to stay inside ReaderSurface rather than the derived context band, found ${JSON.stringify(readerEvidence.metrics)}.`)
    }
  } else if (!summaryCreateVisible || !summaryPlaceholderVisible) {
    throw new Error(
      `Expected the live summary-missing state to keep the derived context band plus the create-summary placeholder path, found ${JSON.stringify(readerEvidence.metrics)}.`,
    )
  }

  regressionPage = await browser.newPage({ viewport: desktopViewport })
  const regressionEvidence = await captureReaderRegressionEvidence({
    baseUrl,
    directory: outputDir,
    page: regressionPage,
    stagePrefix: 'stage703',
  })

  await writeFile(
    path.join(outputDir, 'stage703-post-stage702-generated-mode-reader-ux-only-refinement-and-invariant-lock-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Generated Reader modes should show derived context without changing ReaderSurface article content.',
          'Summary detail should stay inline in Summary mode and out of the Settings drawer, even when the live summary is still missing.',
          'Reflowed, Simplified, and Summary should keep Notebook, Graph, Study, and Reflowed branching readable from the generated context band.',
          'Home and Graph remain stable regression surfaces during this Reader-generated-mode follow-through.',
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
        path: path.join(outputDir, 'stage703-post-stage702-generated-mode-reader-ux-only-refinement-and-invariant-lock-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (regressionPage && regressionPage !== readerPage) {
    await regressionPage
      .screenshot({
        path: path.join(outputDir, 'stage703-post-stage702-generated-mode-reader-ux-only-refinement-and-invariant-lock-audit-failure-regression.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
