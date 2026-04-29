import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureSourceLearningExportsEvidence } from './source_learning_exports_shared.mjs'
import { desktopViewport } from './study_review_progress_shared.mjs'
import { startTemporaryRestoreServer } from './workspace_backup_restore_server_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE962_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE962_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE962_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE962_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE962_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE962_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage962-workspace-backup-restore-failure.png'), { force: true })

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
  stagePrefix: 'stage962-workspace-backup-restore',
})

try {
  const page = await browser.newPage({ viewport: desktopViewport })
  const evidence = await captureSourceLearningExportsEvidence({
    baseUrl,
    directory: outputDir,
    includeRestoreEvidence: true,
    page,
    restoreBaseUrl: restoreServer.baseUrl,
    stageLabel: 'Stage 962 workspace backup restore',
    stagePrefix: 'stage962-workspace-backup-restore',
  })
  const metrics = evidence.metrics
  for (const [metricName, expected] of Object.entries({
    homeWorkspaceBackupPreviewVisible: true,
    homeWorkspaceExportVisible: true,
    sourceLearningExportsHarnessDeleted: true,
    workspaceBackupPreviewAcceptsManifest: true,
    workspaceBackupPreviewAcceptsZip: true,
    workspaceBackupPreviewAppliedFalse: true,
    workspaceBackupPreviewDryRun: true,
    workspaceBackupPreviewIncludesAttachmentCoverage: true,
    workspaceBackupPreviewIncludesAttemptAndSessionEntities: true,
    workspaceBackupPreviewIncludesLearningPacks: true,
    workspaceBackupPreviewInvalidZipRejected: true,
    workspaceBackupPreviewManifestApplyBlocked: true,
    workspaceBackupPreviewZipCanApplyAfterDelete: true,
    workspaceBackupRestoreActionVisible: true,
    workspaceBackupRestoreDeletedDocumentMissing: true,
    workspaceBackupRestoreImportsMissingItems: true,
    workspaceBackupRestoreReadinessVisible: true,
    workspaceBackupRestoreRestoresDocument: true,
    workspaceBackupRestoreRestoresLearningPackState: true,
    workspaceBackupRestoreRestoresProgress: true,
    workspaceBackupRestoreRestoresSearch: true,
    workspaceBackupRestoreResultVisible: true,
    workspaceBackupRestoreUsesSeparateWorkspace: true,
    workspaceZipIncludesDataPayload: true,
    workspaceZipIncludesLearningPack: true,
    workspaceZipIncludesManifest: true,
    workspaceZipDataPayloadIncludesAttempts: true,
    workspaceZipDataPayloadIncludesReviewSessions: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 962 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.cleanupUtilityDryRunMatchedAfterSourceLearningExports !== 0) {
    throw new Error(
      `Stage 962 expected cleanup dry-run matchedCount 0, got ${metrics.cleanupUtilityDryRunMatchedAfterSourceLearningExports}.`,
    )
  }

  const validation = {
    captures: evidence.captures,
    metrics,
    runtimeBrowser,
    stage: 'stage962-workspace-backup-restore',
  }
  await writeFile(
    path.join(outputDir, 'stage962-workspace-backup-restore-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} finally {
  await browser.close()
  await restoreServer.stop()
}

function readCliOption(name) {
  const prefix = `--${name}=`
  const match = process.argv.slice(2).find((argument) => argument.startsWith(prefix))
  return match ? match.slice(prefix.length) : null
}
