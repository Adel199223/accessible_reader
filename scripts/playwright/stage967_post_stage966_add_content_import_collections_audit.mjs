import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureAddContentBulkImportEvidence,
  captureAddContentImportCollectionsEvidence,
} from './add_content_bulk_import_shared.mjs'
import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderSourceQuizLaunchEvidence } from './reader_source_quiz_launch_shared.mjs'
import { captureSourceLearningExportsEvidence } from './source_learning_exports_shared.mjs'
import { desktopViewport } from './study_review_progress_shared.mjs'
import { startTemporaryRestoreServer } from './workspace_backup_restore_server_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE967_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE967_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE967_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE967_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE967_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE967_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage967-add-content-import-collections-audit-failure.png',
  'stage967-add-content-bulk-import-compat-audit-failure.png',
  'stage967-reader-source-quiz-audit-failure.png',
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
  stagePrefix: 'stage967-add-content-import-collections-audit',
})

const pages = []
try {
  pages.push(await browser.newPage({ viewport: desktopViewport }))
  pages.push(await browser.newPage({ viewport: desktopViewport }))
  pages.push(await browser.newPage({ viewport: desktopViewport }))
  pages.push(await browser.newPage({ viewport: desktopViewport }))

  const collectionEvidence = await captureAddContentImportCollectionsEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[0],
    stageLabel: 'Stage 967',
    stagePrefix: 'stage967-add-content-import-collections-audit',
  })
  const bulkEvidence = await captureAddContentBulkImportEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[1],
    stageLabel: 'Stage 967 compatibility',
    stagePrefix: 'stage967-add-content-bulk-import-compat-audit',
  })
  const readerEvidence = await captureReaderSourceQuizLaunchEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[2],
    stageLabel: 'Stage 967 Reader source quiz launch regression audit',
    stagePrefix: 'stage967-reader-source-quiz-audit',
  })
  const exportEvidence = await captureSourceLearningExportsEvidence({
    baseUrl,
    directory: outputDir,
    includeRestoreEvidence: true,
    page: pages[3],
    restoreBaseUrl: restoreServer.baseUrl,
    stageLabel: 'Stage 967 source export and backup restore regression audit',
    stagePrefix: 'stage967-source-export-restore-audit',
  })
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const metrics = {
    ...collectionEvidence.metrics,
    ...bulkEvidence.metrics,
    ...readerEvidence.metrics,
    ...exportEvidence.metrics,
    cleanupUtilityDryRunMatchedAfterStage967: cleanupDryRun.matchedCount,
  }
  const captures = {
    ...collectionEvidence.captures,
    ...bulkEvidence.captures,
    ...readerEvidence.captures,
    ...exportEvidence.captures,
  }

  for (const [metricName, expected] of Object.entries({
    addContentBulkCollectionImportCreatesCollection: true,
    addContentBulkCollectionSuggestionsVisible: true,
    addContentBulkCollectionToggleVisible: true,
    addContentBulkImportModeVisible: true,
    addContentBulkImportResultVisible: true,
    addContentBulkPreviewDryRun: true,
    addContentBulkPreviewRowsVisible: true,
    addContentBulkSelectedImportWorks: true,
    addContentPocketZipPreviewCollectionsVisible: true,
    addContentSingleImportsStable: true,
    graphImportedCollectionTagFilterMatches: true,
    homeImportedCollectionVisible: true,
    homeManualCollectionsPersistAfterReload: true,
    homeWorkspaceBackupPreviewVisible: true,
    importedHarnessDocumentDeleted: true,
    readerStartSourceQuizStartsSession: true,
    sourceOverviewLearningPackExportLinkVisible: true,
    studyImportedCollectionSubsetVisible: true,
    workspaceBackupPreviewAcceptsZip: true,
    workspaceBackupRestoreActionVisible: true,
    workspaceZipIncludesDataPayload: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 967 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (
    metrics.cleanupUtilityDryRunMatchedAfterAddContentBulkImport !== 0 ||
    metrics.cleanupUtilityDryRunMatchedAfterAddContentCollections !== 0 ||
    metrics.cleanupUtilityDryRunMatchedAfterReaderSourceQuizLaunch !== 0 ||
    metrics.cleanupUtilityDryRunMatchedAfterSourceLearningExports !== 0 ||
    metrics.cleanupUtilityDryRunMatchedAfterStage967 !== 0
  ) {
    throw new Error(
      `Stage 967 expected cleanup dry-runs to stay at 0, got bulk=${metrics.cleanupUtilityDryRunMatchedAfterAddContentBulkImport}, collections=${metrics.cleanupUtilityDryRunMatchedAfterAddContentCollections}, reader=${metrics.cleanupUtilityDryRunMatchedAfterReaderSourceQuizLaunch}, export=${metrics.cleanupUtilityDryRunMatchedAfterSourceLearningExports}, final=${metrics.cleanupUtilityDryRunMatchedAfterStage967}.`,
    )
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage967-post-stage966-add-content-import-collections-audit',
  }
  await writeFile(
    path.join(outputDir, 'stage967-post-stage966-add-content-import-collections-audit-validation.json'),
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
