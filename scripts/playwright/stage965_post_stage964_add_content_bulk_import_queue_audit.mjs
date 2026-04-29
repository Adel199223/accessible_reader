import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { captureAddContentBulkImportEvidence } from './add_content_bulk_import_shared.mjs'
import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderSourceQuizLaunchEvidence } from './reader_source_quiz_launch_shared.mjs'
import { captureSourceLearningExportsEvidence } from './source_learning_exports_shared.mjs'
import { desktopViewport } from './study_review_progress_shared.mjs'
import { startTemporaryRestoreServer } from './workspace_backup_restore_server_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE965_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE965_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE965_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE965_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE965_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE965_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage965-add-content-bulk-import-audit-failure.png',
  'stage965-reader-source-quiz-audit-failure.png',
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
  stagePrefix: 'stage965-add-content-bulk-import-audit',
})

const pages = []
try {
  pages.push(await browser.newPage({ viewport: desktopViewport }))
  pages.push(await browser.newPage({ viewport: desktopViewport }))
  pages.push(await browser.newPage({ viewport: desktopViewport }))

  const bulkEvidence = await captureAddContentBulkImportEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[0],
    stageLabel: 'Stage 965',
    stagePrefix: 'stage965-add-content-bulk-import-audit',
  })
  const readerEvidence = await captureReaderSourceQuizLaunchEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[1],
    stageLabel: 'Stage 965 Reader source quiz launch regression audit',
    stagePrefix: 'stage965-reader-source-quiz-audit',
  })
  const exportEvidence = await captureSourceLearningExportsEvidence({
    baseUrl,
    directory: outputDir,
    includeRestoreEvidence: true,
    page: pages[2],
    restoreBaseUrl: restoreServer.baseUrl,
    stageLabel: 'Stage 965 source export and backup restore regression audit',
    stagePrefix: 'stage965-source-export-restore-audit',
  })
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const metrics = {
    ...bulkEvidence.metrics,
    ...readerEvidence.metrics,
    ...exportEvidence.metrics,
    cleanupUtilityDryRunMatchedAfterStage965: cleanupDryRun.matchedCount,
  }
  const captures = {
    ...bulkEvidence.captures,
    ...readerEvidence.captures,
    ...exportEvidence.captures,
  }

  for (const [metricName, expected] of Object.entries({
    addContentBulkImportModeVisible: true,
    addContentBulkImportResultVisible: true,
    addContentBulkPreviewDryRun: true,
    addContentBulkPreviewRowsVisible: true,
    addContentBulkSelectedImportWorks: true,
    addContentSingleImportsStable: true,
    homeWorkspaceBackupPreviewVisible: true,
    readerStartSourceQuizStartsSession: true,
    sourceOverviewLearningPackExportLinkVisible: true,
    workspaceBackupPreviewAcceptsZip: true,
    workspaceBackupRestoreActionVisible: true,
    workspaceZipIncludesDataPayload: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 965 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (
    metrics.cleanupUtilityDryRunMatchedAfterAddContentBulkImport !== 0 ||
    metrics.cleanupUtilityDryRunMatchedAfterReaderSourceQuizLaunch !== 0 ||
    metrics.cleanupUtilityDryRunMatchedAfterSourceLearningExports !== 0 ||
    metrics.cleanupUtilityDryRunMatchedAfterStage965 !== 0
  ) {
    throw new Error(
      `Stage 965 expected cleanup dry-runs to stay at 0, got add=${metrics.cleanupUtilityDryRunMatchedAfterAddContentBulkImport}, reader=${metrics.cleanupUtilityDryRunMatchedAfterReaderSourceQuizLaunch}, export=${metrics.cleanupUtilityDryRunMatchedAfterSourceLearningExports}, final=${metrics.cleanupUtilityDryRunMatchedAfterStage965}.`,
    )
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage965-post-stage964-add-content-bulk-import-audit',
  }
  await writeFile(
    path.join(outputDir, 'stage965-post-stage964-add-content-bulk-import-audit-validation.json'),
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
