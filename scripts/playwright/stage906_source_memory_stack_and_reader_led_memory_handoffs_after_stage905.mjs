import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureHomePersonalNotesCollectionBoardEvidence,
  captureNotebookWorkbenchEvidence,
  captureSourceNotePromotionEvidence,
  captureSourceOverviewMemoryEvidence,
  desktopViewport,
  summarizeStageHarnessCleanupMetrics,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE906_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE906_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE906_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE906_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE906_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE906_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage906-source-memory-stack-failure-source-overview.png',
  'stage906-source-memory-stack-failure-board.png',
  'stage906-source-memory-stack-failure-promotion.png',
  'stage906-source-memory-stack-failure-sentence.png',
]) {
  await rm(path.join(outputDir, failureFile), { force: true })
}

const { browser, runtimeBrowser } = await launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
})

let sourceOverviewPage
let boardPage
let promotionPage
let sentencePage
try {
  sourceOverviewPage = await browser.newPage({ viewport: desktopViewport })
  boardPage = await browser.newPage({ viewport: desktopViewport })
  promotionPage = await browser.newPage({ viewport: desktopViewport })
  sentencePage = await browser.newPage({ viewport: desktopViewport })

  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceOverviewPage,
    stageLabel: 'Stage 906 source memory stack and Reader-led handoffs',
    stagePrefix: 'stage906',
  })
  const boardEvidence = await captureHomePersonalNotesCollectionBoardEvidence({
    baseUrl,
    directory: outputDir,
    page: boardPage,
    stageLabel: 'Stage 906 Home personal-notes board regression',
    stagePrefix: 'stage906-board',
  })
  const promotionEvidence = await captureSourceNotePromotionEvidence({
    baseUrl,
    directory: outputDir,
    page: promotionPage,
    stageLabel: 'Stage 906 source-note promotion regression',
    stagePrefix: 'stage906-promotion',
  })
  const sentenceEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: sentencePage,
    selectSentenceAnchor: true,
    stageLabel: 'Stage 906 sentence-anchor Notebook regression',
    stagePrefix: 'stage906-sentence',
  })
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
    sourceOverviewEvidence.metrics,
    boardEvidence.metrics,
    promotionEvidence.metrics,
  )
  const metrics = {
    ...sentenceEvidence.metrics,
    ...promotionEvidence.metrics,
    ...boardEvidence.metrics,
    ...sourceOverviewEvidence.metrics,
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
  }

  for (const [metricName, expected] of Object.entries({
    readerSourceGraphCountOpensFocusedGraph: true,
    readerSourceMemoryCountsActionable: true,
    readerSourceStudyCountOpensFocusedStudy: true,
    sourceOverviewGraphMemoryItemOpensFocusedGraph: true,
    sourceOverviewMemoryStackIncludesGraphItems: true,
    sourceOverviewMemoryStackIncludesPersonalNotes: true,
    sourceOverviewMemoryStackIncludesStudyItems: true,
    sourceOverviewMemoryStackVisible: true,
    sourceOverviewSourceNoteReaderHandoffUnanchored: true,
    sourceOverviewStudyMemoryItemOpensFocusedStudy: true,
    stageHarnessCreatedNotesCleanedUp: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 906 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.stageHarnessCreatedNoteCleanupFailures.length > 0) {
    throw new Error(
      `Stage 906 expected harness cleanup without failures, got ${metrics.stageHarnessCreatedNoteCleanupFailures.length}.`,
    )
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 906 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage906-source-memory-stack-and-reader-led-memory-handoffs-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Source overview renders a source-owned memory stack with personal notes, graph nodes, and study cards.',
          'Source memory rows hand off directly to Notebook, focused Graph, focused Study, and unanchored Reader for source notes.',
          'Reader source-strip memory counts open focused Notebook, Graph, and Study while harness-created notes self-clean.',
        ],
        baseUrl,
        captures: {
          ...sourceOverviewEvidence.captures,
          ...boardEvidence.captures,
          ...promotionEvidence.captures,
          ...sentenceEvidence.captures,
        },
        cleanupDryRunAfterStage906: cleanupDryRun,
        desktopViewport,
        headless,
        metrics,
        runtimeBrowser,
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  await Promise.all([
    captureFailure(sourceOverviewPage, outputDir, 'stage906-source-memory-stack-failure-source-overview.png'),
    captureFailure(boardPage, outputDir, 'stage906-source-memory-stack-failure-board.png'),
    captureFailure(promotionPage, outputDir, 'stage906-source-memory-stack-failure-promotion.png'),
    captureFailure(sentencePage, outputDir, 'stage906-source-memory-stack-failure-sentence.png'),
  ])
  throw error
} finally {
  await browser.close()
}

async function captureFailure(page, directory, filename) {
  if (!page) {
    return
  }
  await page
    .screenshot({
      fullPage: true,
      path: path.join(directory, filename),
    })
    .catch(() => undefined)
}
