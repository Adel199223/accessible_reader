import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderSourceQuizLaunchEvidence } from './reader_source_quiz_launch_shared.mjs'
import { captureSourceLearningExportsEvidence } from './source_learning_exports_shared.mjs'
import { desktopViewport } from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE961_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE961_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE961_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE961_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE961_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE961_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage961-workspace-backup-preview-audit-failure.png',
  'stage961-reader-source-quiz-launch-audit-failure.png',
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

  const backupEvidence = await captureSourceLearningExportsEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[0],
    stageLabel: 'Stage 961 workspace backup preview audit',
    stagePrefix: 'stage961-workspace-backup-preview-audit',
  })
  const readerEvidence = await captureReaderSourceQuizLaunchEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[1],
    stageLabel: 'Stage 961 Reader source quiz launch regression audit',
    stagePrefix: 'stage961-reader-source-quiz-launch-audit',
  })
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const metrics = {
    ...readerEvidence.metrics,
    ...backupEvidence.metrics,
    cleanupUtilityDryRunMatchedAfterStage961: cleanupDryRun.matchedCount,
  }
  const captures = {
    ...readerEvidence.captures,
    ...backupEvidence.captures,
  }

  for (const [metricName, expected] of Object.entries({
    homeWorkspaceBackupPreviewVisible: true,
    homeWorkspaceExportVisible: true,
    readerStartSourceQuizStartsSession: true,
    sourceLearningExportsHarnessDeleted: true,
    sourceOverviewLearningPackExportLinkVisible: true,
    sourceOverviewPlainExportLinkVisible: true,
    workspaceBackupPreviewAcceptsManifest: true,
    workspaceBackupPreviewAcceptsZip: true,
    workspaceBackupPreviewAppliedFalse: true,
    workspaceBackupPreviewDryRun: true,
    workspaceBackupPreviewIncludesAttachmentCoverage: true,
    workspaceBackupPreviewIncludesAttemptAndSessionEntities: true,
    workspaceBackupPreviewIncludesLearningPacks: true,
    workspaceBackupPreviewInvalidZipRejected: true,
    workspaceManifestIncludesAttempts: true,
    workspaceManifestIncludesReviewSessions: true,
    workspaceZipIncludesLearningPack: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 961 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (
    metrics.cleanupUtilityDryRunMatchedAfterSourceLearningExports !== 0 ||
    metrics.cleanupUtilityDryRunMatchedAfterReaderSourceQuizLaunch !== 0 ||
    metrics.cleanupUtilityDryRunMatchedAfterStage961 !== 0
  ) {
    throw new Error(
      `Stage 961 expected cleanup dry-runs to stay at 0, got backup=${metrics.cleanupUtilityDryRunMatchedAfterSourceLearningExports}, reader=${metrics.cleanupUtilityDryRunMatchedAfterReaderSourceQuizLaunch}, final=${metrics.cleanupUtilityDryRunMatchedAfterStage961}.`,
    )
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage961-post-stage960-workspace-backup-preview-audit',
  }
  await writeFile(
    path.join(outputDir, 'stage961-post-stage960-workspace-backup-preview-audit-validation.json'),
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
