import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureAddContentBulkImportEvidence,
  captureAddContentImportCollectionsEvidence,
} from './add_content_bulk_import_shared.mjs'
import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { captureCollectionLearningWorkspaceEvidence } from './collection_learning_workspace_shared.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureLibraryReadingQueueHighlightActionsEvidence } from './library_reading_queue_highlight_actions_shared.mjs'
import { captureReaderHighlightsResumeCollectionInboxEvidence } from './reader_highlights_resume_collection_inbox_shared.mjs'
import { captureReaderSourceQuizLaunchEvidence } from './reader_source_quiz_launch_shared.mjs'
import { captureSourceLearningExportsEvidence } from './source_learning_exports_shared.mjs'
import { desktopViewport } from './study_review_progress_shared.mjs'
import { startTemporaryRestoreServer } from './workspace_backup_restore_server_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE975_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE975_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE975_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE975_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE975_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE975_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage975-reading-queue-highlight-actions-audit-failure.png',
  'stage975-reader-highlights-resume-regression-failure.png',
  'stage975-collection-learning-workspaces-regression-failure.png',
  'stage975-add-content-collection-tree-regression-failure.png',
  'stage975-add-content-bulk-import-regression-failure.png',
  'stage975-reader-source-quiz-regression-failure.png',
  'stage975-source-learning-exports-backup-regression-failure.png',
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
const restoreServer = await startTemporaryRestoreServer({
  outputDir,
  repoRoot,
  stagePrefix: 'stage975-source-learning-exports-backup-regression',
})

const pages = []
try {
  for (let index = 0; index < 7; index += 1) {
    pages.push(await browser.newPage({ viewport: desktopViewport }))
  }

  const readingQueueEvidence = await captureLibraryReadingQueueHighlightActionsEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[0],
    stageLabel: 'Stage 975',
    stagePrefix: 'stage975-reading-queue-highlight-actions-audit',
  })
  const readerHighlightsEvidence = await captureReaderHighlightsResumeCollectionInboxEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[1],
    stageLabel: 'Stage 975 reader highlights regression',
    stagePrefix: 'stage975-reader-highlights-resume-regression',
  })
  const collectionWorkspaceEvidence = await captureCollectionLearningWorkspaceEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[2],
    stageLabel: 'Stage 975 collection workspace regression',
    stagePrefix: 'stage975-collection-learning-workspaces-regression',
  })
  const importCollectionEvidence = await captureAddContentImportCollectionsEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[3],
    stageLabel: 'Stage 975 collection tree regression',
    stagePrefix: 'stage975-add-content-collection-tree-regression',
  })
  const bulkEvidence = await captureAddContentBulkImportEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[4],
    stageLabel: 'Stage 975 bulk regression',
    stagePrefix: 'stage975-add-content-bulk-import-regression',
  })
  const readerEvidence = await captureReaderSourceQuizLaunchEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[5],
    stageLabel: 'Stage 975 Reader source quiz regression',
    stagePrefix: 'stage975-reader-source-quiz-regression',
  })
  const exportBackupEvidence = await captureSourceLearningExportsEvidence({
    baseUrl,
    directory: outputDir,
    includeRestoreEvidence: true,
    page: pages[6],
    restoreBaseUrl: restoreServer.baseUrl,
    stageLabel: 'Stage 975 source learning export and backup regression',
    stagePrefix: 'stage975-source-learning-exports-backup-regression',
  })
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const metrics = {
    ...bulkEvidence.metrics,
    ...collectionWorkspaceEvidence.metrics,
    ...exportBackupEvidence.metrics,
    ...importCollectionEvidence.metrics,
    ...readerEvidence.metrics,
    ...readerHighlightsEvidence.metrics,
    ...readingQueueEvidence.metrics,
    cleanupUtilityDryRunMatchedAfterStage975: cleanupDryRun.matchedCount,
  }
  const captures = {
    ...bulkEvidence.captures,
    ...collectionWorkspaceEvidence.captures,
    ...exportBackupEvidence.captures,
    ...importCollectionEvidence.captures,
    ...readerEvidence.captures,
    ...readerHighlightsEvidence.captures,
    ...readingQueueEvidence.captures,
  }

  for (const [metricName, expected] of Object.entries({
    addContentBookmarkHierarchyImportCreatesTree: true,
    addContentBulkImportModeVisible: true,
    collectionHighlightInboxVisible: true,
    collectionOverviewParentAggregatesDescendants: true,
    collectionOverviewReadingSummaryVisible: true,
    customParentCollectionQueueAggregatesDescendants: true,
    graphCollectionStableIdFilterApplied: true,
    highlightCreateStudyOpensPromotion: true,
    highlightOpenNotebookWorks: true,
    highlightOpenReaderWorks: true,
    homeCollectionContinueReadingOpensResume: true,
    homeCollectionWorkspaceActionsVisible: true,
    homeReadingQueueContinueOpensReader: true,
    homeReadingQueueMarkCompleteUpdatesProgress: true,
    homeReadingQueueStateFiltersWork: true,
    homeReadingQueueSummaryVisible: true,
    homeReadingQueueVisible: true,
    homeWorkspaceBackupPreviewVisible: true,
    readerGeneratedOutputsFrozen: true,
    readerJumpToLastReadVisible: true,
    readerNextInQueueAdvancesWithinScope: true,
    readerNextInQueueVisible: true,
    readerStartSourceQuizStartsSession: true,
    readingQueueAllScopeAvailable: true,
    readingQueueBuiltInScopeAvailable: true,
    sourceLearningExportsHarnessDeleted: true,
    sourceOverviewHighlightActionsVisible: true,
    sourceOverviewMarkCompleteUpdatesProgress: true,
    sourceOverviewMarkCompleteVisible: true,
    sourceOverviewReadingContextVisible: true,
    workspaceBackupRestoreRestoresDocument: true,
    workspaceZipIncludesDataPayload: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 975 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (
    metrics.cleanupUtilityDryRunMatchedAfterAddContentBulkImport !== 0 ||
    metrics.cleanupUtilityDryRunMatchedAfterAddContentCollections !== 0 ||
    metrics.cleanupUtilityDryRunMatchedAfterCollectionLearningWorkspace !== 0 ||
    metrics.cleanupUtilityDryRunMatchedAfterLibraryReadingQueue !== 0 ||
    metrics.cleanupUtilityDryRunMatchedAfterReaderHighlights !== 0 ||
    metrics.cleanupUtilityDryRunMatchedAfterReaderSourceQuizLaunch !== 0 ||
    metrics.cleanupUtilityDryRunMatchedAfterSourceLearningExports !== 0 ||
    metrics.cleanupUtilityDryRunMatchedAfterStage975 !== 0
  ) {
    throw new Error(
      `Stage 975 expected cleanup dry-runs to stay at 0, got bulk=${metrics.cleanupUtilityDryRunMatchedAfterAddContentBulkImport}, collections=${metrics.cleanupUtilityDryRunMatchedAfterAddContentCollections}, workspace=${metrics.cleanupUtilityDryRunMatchedAfterCollectionLearningWorkspace}, queue=${metrics.cleanupUtilityDryRunMatchedAfterLibraryReadingQueue}, highlights=${metrics.cleanupUtilityDryRunMatchedAfterReaderHighlights}, reader=${metrics.cleanupUtilityDryRunMatchedAfterReaderSourceQuizLaunch}, export=${metrics.cleanupUtilityDryRunMatchedAfterSourceLearningExports}, final=${metrics.cleanupUtilityDryRunMatchedAfterStage975}.`,
    )
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage975-post-stage974-library-reading-queue-highlight-actions-audit',
  }
  await writeFile(
    path.join(outputDir, 'stage975-post-stage974-library-reading-queue-highlight-actions-audit-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} finally {
  await Promise.all(pages.map((page) => page.close().catch(() => undefined)))
  await browser.close()
  await restoreServer.stop()
}

function readCliOption(name) {
  const prefix = `--${name}=`
  const match = process.argv.slice(2).find((argument) => argument.startsWith(prefix))
  return match ? match.slice(prefix.length) : null
}
