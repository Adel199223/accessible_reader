import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureHomeMemoryFilterEvidence,
  captureHomeSourceMemorySignalEvidence,
  captureNotebookWorkbenchEvidence,
  captureSourceMemorySearchEvidence,
  captureSourceOverviewMemoryEvidence,
  desktopViewport,
  summarizeStageHarnessCleanupMetrics,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE912_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE912_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE912_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE912_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE912_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE912_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage912-source-memory-search-failure.png',
  'stage912-home-memory-filter-regression-failure.png',
  'stage912-home-source-memory-signal-regression-failure.png',
  'stage912-source-overview-regression-failure.png',
  'stage912-sentence-note-regression-failure.png',
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

let searchPage
let filtersPage
let signalsPage
let sourceOverviewPage
let sentencePage
try {
  searchPage = await browser.newPage({ viewport: desktopViewport })
  filtersPage = await browser.newPage({ viewport: desktopViewport })
  signalsPage = await browser.newPage({ viewport: desktopViewport })
  sourceOverviewPage = await browser.newPage({ viewport: desktopViewport })
  sentencePage = await browser.newPage({ viewport: desktopViewport })

  const sourceMemorySearchEvidence = await captureSourceMemorySearchEvidence({
    baseUrl,
    directory: outputDir,
    page: searchPage,
    stageLabel: 'Stage 912 source memory search',
    stagePrefix: 'stage912',
  })
  const filterEvidence = await captureHomeMemoryFilterEvidence({
    baseUrl,
    directory: outputDir,
    page: filtersPage,
    stageLabel: 'Stage 912 Home memory filter regression',
    stagePrefix: 'stage912-filter',
  })
  const sourceSignalsEvidence = await captureHomeSourceMemorySignalEvidence({
    baseUrl,
    directory: outputDir,
    page: signalsPage,
    stageLabel: 'Stage 912 Home source memory signal regression',
    stagePrefix: 'stage912-signals',
  })
  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceOverviewPage,
    stageLabel: 'Stage 912 source memory stack regression',
    stagePrefix: 'stage912-source-memory',
  })
  const sentenceEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: sentencePage,
    selectSentenceAnchor: true,
    stageLabel: 'Stage 912 sentence-anchor Notebook regression',
    stagePrefix: 'stage912-sentence',
  })
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const notesSidebarVisible = await searchPage.evaluate(() =>
    Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.trim() === 'Notes' || tab.getAttribute('aria-label') === 'Notes',
    ),
  )
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
    sourceMemorySearchEvidence.metrics,
    filterEvidence.metrics,
    sourceSignalsEvidence.metrics,
    sourceOverviewEvidence.metrics,
  )
  const metrics = {
    ...sentenceEvidence.metrics,
    ...sourceOverviewEvidence.metrics,
    ...sourceSignalsEvidence.metrics,
    ...filterEvidence.metrics,
    ...sourceMemorySearchEvidence.metrics,
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
    notesSidebarVisible,
  }

  for (const [metricName, expected] of Object.entries({
    homeMemoryFilterControlsVisible: true,
    homeSourceMemorySignalsVisible: true,
    notesSidebarVisible: false,
    readerSourceMemoryCountsActionable: true,
    readerSourceMemorySearchOpensSourceOverview: true,
    sourceMemorySearchControlsVisible: true,
    sourceMemorySearchEmptyStateClearable: true,
    sourceMemorySearchFindsGraphItems: true,
    sourceMemorySearchFindsPersonalNotes: true,
    sourceMemorySearchFindsSourceText: true,
    sourceMemorySearchFindsStudyItems: true,
    sourceMemorySearchGraphItemOpensFocusedGraph: true,
    sourceMemorySearchPersonalNoteOpensNotebook: true,
    sourceMemorySearchReaderHandoffPreservesAnchorSemantics: true,
    sourceMemorySearchStudyItemOpensFocusedStudy: true,
    sourceOverviewMemoryStackVisible: true,
    stageHarnessCreatedNotesCleanedUp: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 912 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.stageHarnessCreatedNoteCleanupFailures.length > 0) {
    throw new Error(
      `Stage 912 expected harness cleanup without failures, got ${metrics.stageHarnessCreatedNoteCleanupFailures.length}.`,
    )
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 912 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage912-source-memory-search-and-reader-led-find-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Source overview searches the active source memory stack across notes, graph, study, and source text.',
          'Search-result handoffs preserve Notebook, focused Graph, focused Study, and Reader sentence-anchor semantics.',
          'Reader Find memory opens the same Source overview search without changing Home memory filters.',
        ],
        baseUrl,
        captures: {
          ...sourceMemorySearchEvidence.captures,
          ...filterEvidence.captures,
          ...sourceSignalsEvidence.captures,
          ...sourceOverviewEvidence.captures,
          ...sentenceEvidence.captures,
        },
        cleanupDryRunAfterStage912: cleanupDryRun,
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
    captureFailure(searchPage, outputDir, 'stage912-source-memory-search-failure.png'),
    captureFailure(filtersPage, outputDir, 'stage912-home-memory-filter-regression-failure.png'),
    captureFailure(signalsPage, outputDir, 'stage912-home-source-memory-signal-regression-failure.png'),
    captureFailure(sourceOverviewPage, outputDir, 'stage912-source-overview-regression-failure.png'),
    captureFailure(sentencePage, outputDir, 'stage912-sentence-note-regression-failure.png'),
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
