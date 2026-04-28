import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureHomeReviewScheduleLensEvidence,
  captureStudyScheduleDrilldownEvidence,
  summarizeStageHarnessCleanupMetrics,
} from './notebook_workbench_shared.mjs'
import {
  captureStudyCollectionSubsetEvidence,
  captureStudyHabitCalendarEvidence,
  captureStudyMemoryProgressEvidence,
  captureStudyQuestionManagementEvidence,
  captureStudyQuestionReviewHistoryEvidence,
  captureStudyQuestionSchedulingControlsEvidence,
  captureStudyReviewProgressEvidence,
  desktopViewport,
} from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE936_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE936_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE936_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE936_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE936_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE936_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage936-study-management-failure.png',
  'stage936-study-scheduling-regression-failure.png',
  'stage936-study-memory-progress-regression-failure.png',
  'stage936-study-collection-subsets-regression-failure.png',
  'stage936-study-review-history-regression-failure.png',
  'stage936-study-habit-regression-failure.png',
  'stage936-study-progress-regression-failure.png',
  'stage936-home-review-regression-failure.png',
  'stage936-study-schedule-regression-failure.png',
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
  for (let index = 0; index < 9; index += 1) {
    pages.push(await browser.newPage({ viewport: desktopViewport }))
  }

  const managementEvidence = await captureStudyQuestionManagementEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[0],
    stageLabel: 'Stage 936 Study question edit/delete management',
    stagePrefix: 'stage936-management',
  })
  const schedulingEvidence = await captureStudyQuestionSchedulingControlsEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[1],
    stageLabel: 'Stage 936 Study question scheduling regression',
    stagePrefix: 'stage936-scheduling',
  })
  const memoryEvidence = await captureStudyMemoryProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[2],
    stageLabel: 'Stage 936 Study memory progress regression',
    stagePrefix: 'stage936-memory-progress',
  })
  const subsetEvidence = await captureStudyCollectionSubsetEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[3],
    stageLabel: 'Stage 936 Study collection subset regression',
    stagePrefix: 'stage936-subsets',
  })
  const reviewHistoryEvidence = await captureStudyQuestionReviewHistoryEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[4],
    stageLabel: 'Stage 936 Study review-history regression',
    stagePrefix: 'stage936-review-history',
  })
  const habitEvidence = await captureStudyHabitCalendarEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[5],
    stageLabel: 'Stage 936 Study habit calendar regression',
    stagePrefix: 'stage936-habit',
  })
  const progressEvidence = await captureStudyReviewProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[6],
    stageLabel: 'Stage 936 Study review progress regression',
    stagePrefix: 'stage936-progress',
  })
  const homeReviewEvidence = await captureHomeReviewScheduleLensEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[7],
    stageLabel: 'Stage 936 Home review schedule regression',
    stagePrefix: 'stage936-home-review',
  })
  const scheduleEvidence = await captureStudyScheduleDrilldownEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[8],
    stageLabel: 'Stage 936 Study schedule drilldown regression',
    stagePrefix: 'stage936-study-schedule',
  })

  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(homeReviewEvidence.metrics, scheduleEvidence.metrics)
  const notesSidebarVisible = await pages[0].evaluate(() =>
    Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.trim() === 'Notes' || tab.getAttribute('aria-label') === 'Notes',
    ),
  )
  const metrics = {
    ...scheduleEvidence.metrics,
    ...homeReviewEvidence.metrics,
    ...progressEvidence.metrics,
    ...habitEvidence.metrics,
    ...reviewHistoryEvidence.metrics,
    ...subsetEvidence.metrics,
    ...memoryEvidence.metrics,
    ...schedulingEvidence.metrics,
    ...managementEvidence.metrics,
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
    notesSidebarVisible,
  }

  for (const [metricName, expected] of Object.entries({
    homeReviewScheduleLensVisible: true,
    notesSidebarVisible: false,
    stageHarnessCreatedNotesCleanedUp: true,
    studyCollectionSubsetPanelVisible: true,
    studyMemoryProgressPanelVisible: true,
    studyQuestionBulkDeleteVisibleSelectionWorks: true,
    studyQuestionDeleteAdvancesReviewQueue: true,
    studyQuestionDeleteRowActionWorks: true,
    studyQuestionEditActiveActionWorks: true,
    studyQuestionEditRowActionWorks: true,
    studyQuestionManagementHarnessDocumentsDeleted: true,
    studyQuestionManagementHarnessProgressCleaned: true,
    studyQuestionManagementPreservesScheduleControls: true,
    studyQuestionReviewHistoryReviewFilteredHandoff: true,
    studyQuestionSchedulingRowActionWorks: true,
    studyReviewProgressHeatmapVisible: true,
    studyReviewProgressPanelVisible: true,
    studyScheduleBucketDrilldownsVisible: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 936 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 936 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage936-study-question-edit-delete-management-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Study Questions rows expose Edit/Delete plus selected visible bulk delete.',
          'Active Review delete advances inside the filtered eligible queue.',
          'Stage 935 scheduling controls remain visible beside management controls.',
        ],
        baseUrl,
        captures: {
          ...managementEvidence.captures,
          ...schedulingEvidence.captures,
          ...memoryEvidence.captures,
          ...subsetEvidence.captures,
          ...reviewHistoryEvidence.captures,
          ...habitEvidence.captures,
          ...progressEvidence.captures,
          ...homeReviewEvidence.captures,
          ...scheduleEvidence.captures,
        },
        cleanupDryRunAfterStage936: cleanupDryRun,
        desktopViewport,
        headless,
        metrics,
        runtimeBrowser,
      },
      null,
      2,
    ),
  )
} catch (error) {
  await pages[0]?.screenshot?.({
    fullPage: true,
    path: path.join(outputDir, 'stage936-study-management-failure.png'),
  }).catch(() => {})
  throw error
} finally {
  await browser.close()
}

function readCliOption(name) {
  const prefix = `--${name}=`
  const option = process.argv.find((argument) => argument.startsWith(prefix))
  return option ? option.slice(prefix.length) : null
}
