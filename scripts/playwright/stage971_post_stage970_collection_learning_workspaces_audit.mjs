import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { captureCollectionLearningWorkspaceEvidence } from './collection_learning_workspace_shared.mjs'
import {
  captureAddContentBulkImportEvidence,
  captureAddContentImportCollectionsEvidence,
} from './add_content_bulk_import_shared.mjs'
import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderSourceQuizLaunchEvidence } from './reader_source_quiz_launch_shared.mjs'
import { desktopViewport } from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE971_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE971_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE971_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE971_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE971_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE971_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage971-collection-learning-workspaces-audit-failure.png',
  'stage971-add-content-collection-tree-regression-failure.png',
  'stage971-add-content-bulk-import-regression-failure.png',
  'stage971-reader-source-quiz-regression-failure.png',
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

const pages = []
try {
  pages.push(await browser.newPage({ viewport: desktopViewport }))
  pages.push(await browser.newPage({ viewport: desktopViewport }))
  pages.push(await browser.newPage({ viewport: desktopViewport }))
  pages.push(await browser.newPage({ viewport: desktopViewport }))

  const collectionWorkspaceEvidence = await captureCollectionLearningWorkspaceEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[0],
    stageLabel: 'Stage 971',
    stagePrefix: 'stage971-collection-learning-workspaces-audit',
  })
  const importCollectionEvidence = await captureAddContentImportCollectionsEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[1],
    stageLabel: 'Stage 971 collection regression',
    stagePrefix: 'stage971-add-content-collection-tree-regression',
  })
  const bulkEvidence = await captureAddContentBulkImportEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[2],
    stageLabel: 'Stage 971 bulk regression',
    stagePrefix: 'stage971-add-content-bulk-import-regression',
  })
  const readerEvidence = await captureReaderSourceQuizLaunchEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[3],
    stageLabel: 'Stage 971 Reader source quiz regression',
    stagePrefix: 'stage971-reader-source-quiz-regression',
  })
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const metrics = {
    ...bulkEvidence.metrics,
    ...collectionWorkspaceEvidence.metrics,
    ...importCollectionEvidence.metrics,
    ...readerEvidence.metrics,
    cleanupUtilityDryRunMatchedAfterStage971: cleanupDryRun.matchedCount,
  }
  const captures = {
    ...bulkEvidence.captures,
    ...collectionWorkspaceEvidence.captures,
    ...importCollectionEvidence.captures,
    ...readerEvidence.captures,
  }

  for (const [metricName, expected] of Object.entries({
    addContentBookmarkHierarchyImportCreatesTree: true,
    addContentBookmarkHierarchySuggestionsVisible: true,
    addContentBulkImportModeVisible: true,
    addContentBulkImportResultVisible: true,
    addContentBulkPreviewDryRun: true,
    addContentBulkPreviewRowsVisible: true,
    addContentBulkSelectedImportWorks: true,
    collectionExportZipAvailable: true,
    collectionOverviewParentAggregatesDescendants: true,
    graphAncestorCollectionTagFilterMatches: true,
    graphCollectionStableIdFilterApplied: true,
    homeCollectionReviewStartsSession: true,
    homeCollectionTreeRowsVisible: true,
    homeCollectionWorkspaceActionsVisible: true,
    homeParentCollectionAggregatesDescendants: true,
    importedHarnessDocumentDeleted: true,
    readerStartSourceQuizStartsSession: true,
    sourceOrganizeInPlaceCreatesChildCollection: true,
    studyParentCollectionSubsetFiltersDescendants: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 971 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (
    metrics.cleanupUtilityDryRunMatchedAfterAddContentBulkImport !== 0 ||
    metrics.cleanupUtilityDryRunMatchedAfterAddContentCollections !== 0 ||
    metrics.cleanupUtilityDryRunMatchedAfterCollectionLearningWorkspace !== 0 ||
    metrics.cleanupUtilityDryRunMatchedAfterReaderSourceQuizLaunch !== 0 ||
    metrics.cleanupUtilityDryRunMatchedAfterStage971 !== 0
  ) {
    throw new Error(
      `Stage 971 expected cleanup dry-runs to stay at 0, got bulk=${metrics.cleanupUtilityDryRunMatchedAfterAddContentBulkImport}, collections=${metrics.cleanupUtilityDryRunMatchedAfterAddContentCollections}, workspace=${metrics.cleanupUtilityDryRunMatchedAfterCollectionLearningWorkspace}, reader=${metrics.cleanupUtilityDryRunMatchedAfterReaderSourceQuizLaunch}, final=${metrics.cleanupUtilityDryRunMatchedAfterStage971}.`,
    )
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage971-post-stage970-collection-learning-workspaces-audit',
  }
  await writeFile(
    path.join(outputDir, 'stage971-post-stage970-collection-learning-workspaces-audit-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} finally {
  await Promise.all(pages.map((page) => page.close().catch(() => undefined)))
  await browser.close()
}

function readCliOption(name) {
  const prefix = `--${name}=`
  const match = process.argv.slice(2).find((argument) => argument.startsWith(prefix))
  return match ? match.slice(prefix.length) : null
}
