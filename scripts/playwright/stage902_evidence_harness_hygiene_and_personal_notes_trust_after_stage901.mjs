import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureHomePersonalNoteLaneEvidence,
  captureHomePersonalNotesCollectionBoardEvidence,
  captureNotebookNewNoteDraftEvidence,
  captureSourceOverviewMemoryEvidence,
  desktopViewport,
  summarizeStageHarnessCleanupMetrics,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE902_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE902_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE902_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE902_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE902_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE902_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage902-harness-hygiene-failure-source.png',
  'stage902-harness-hygiene-failure-lane.png',
  'stage902-harness-hygiene-failure-board.png',
  'stage902-harness-hygiene-failure-source-overview.png',
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

let sourcePage
let lanePage
let boardPage
let sourceOverviewPage
try {
  sourcePage = await browser.newPage({ viewport: desktopViewport })
  lanePage = await browser.newPage({ viewport: desktopViewport })
  boardPage = await browser.newPage({ viewport: desktopViewport })
  sourceOverviewPage = await browser.newPage({ viewport: desktopViewport })

  const sourceEvidence = await captureNotebookNewNoteDraftEvidence({
    baseUrl,
    directory: outputDir,
    page: sourcePage,
    stageLabel: 'Stage 902 source note cleanup ownership',
    stagePrefix: 'stage902-source',
    verifySourceReaderHandoff: true,
  })
  const laneEvidence = await captureHomePersonalNoteLaneEvidence({
    baseUrl,
    directory: outputDir,
    page: lanePage,
    stageLabel: 'Stage 902 Home Personal notes cleanup ownership',
    stagePrefix: 'stage902-lane',
  })
  const boardEvidence = await captureHomePersonalNotesCollectionBoardEvidence({
    baseUrl,
    directory: outputDir,
    page: boardPage,
    stageLabel: 'Stage 902 Home Personal notes board cleanup ownership',
    stagePrefix: 'stage902-board',
  })
  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceOverviewPage,
    stageLabel: 'Stage 902 Source memory cleanup ownership',
    stagePrefix: 'stage902-source-memory',
  })

  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const cleanupUtilityMetrics = readCleanupUtilityMetrics(cleanupDryRun)
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
    sourceEvidence.metrics,
    laneEvidence.metrics,
    boardEvidence.metrics,
    sourceOverviewEvidence.metrics,
  )

  await writeFile(
    path.join(outputDir, 'stage902-evidence-harness-hygiene-and-personal-notes-trust-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Stage-created source notes should be tracked and deleted after screenshots/assertions complete.',
          'Newly-created audit notes should disappear from personal-note and source-memory search surfaces after each run.',
          'Existing audit artifacts should be discoverable through a dry-run cleanup utility without deleting user data.',
        ],
        baseUrl,
        captures: {
          ...sourceEvidence.captures,
          ...laneEvidence.captures,
          ...boardEvidence.captures,
          ...sourceOverviewEvidence.captures,
        },
        cleanupDryRun,
        desktopViewport,
        headless,
        metrics: {
          ...sourceEvidence.metrics,
          ...laneEvidence.metrics,
          ...boardEvidence.metrics,
          ...sourceOverviewEvidence.metrics,
          ...harnessCleanupMetrics,
          ...cleanupUtilityMetrics,
        },
        runtimeBrowser,
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  await Promise.all([
    captureFailure(sourcePage, outputDir, 'stage902-harness-hygiene-failure-source.png'),
    captureFailure(lanePage, outputDir, 'stage902-harness-hygiene-failure-lane.png'),
    captureFailure(boardPage, outputDir, 'stage902-harness-hygiene-failure-board.png'),
    captureFailure(sourceOverviewPage, outputDir, 'stage902-harness-hygiene-failure-source-overview.png'),
  ])
  await writeFile(
    path.join(outputDir, 'stage902-evidence-harness-hygiene-failure.json'),
    JSON.stringify(
      {
        error: error instanceof Error ? error.message : String(error),
        stageHarnessCleanupMetrics: error?.stageHarnessCleanupMetrics ?? null,
      },
      null,
      2,
    ),
    'utf8',
  ).catch(() => undefined)
  throw error
} finally {
  await browser.close()
}

function readCleanupUtilityMetrics(cleanupDryRun) {
  return {
    cleanupUtilityApplyDeletesOnlyStageArtifacts:
      cleanupDryRun.searchFailures.length === 0 &&
      cleanupDryRun.matches.every(
        (match) =>
          match.anchorKind === 'source' &&
          /^Stage stage\d{3}(?:-[a-z0-9-]+)? (?:source-attached note|library-native personal note|personal notes board body|source overview memory body|source note insight)\b/i.test(
            match.bodyText,
          ),
      ),
    cleanupUtilityDryRunListsStageArtifacts: cleanupDryRun.matchedCount > 0,
    cleanupUtilityDryRunMatchedCount: cleanupDryRun.matchedCount,
    cleanupUtilitySearchFailures: cleanupDryRun.searchFailures,
  }
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
