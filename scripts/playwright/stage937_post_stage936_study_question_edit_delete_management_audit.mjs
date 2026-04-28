import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureHomeMemoryFilterEvidence,
  captureHomeReviewReadySourceEvidence,
  captureHomeReviewScheduleLensEvidence,
  captureSourceOverviewMemoryEvidence,
  captureSourceReviewQueueEvidence,
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
const outputDir = process.env.RECALL_STAGE937_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE937_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE937_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE937_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE937_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE937_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage937-study-management-audit-failure.png',
  'stage937-study-scheduling-audit-failure.png',
  'stage937-study-memory-progress-audit-failure.png',
  'stage937-study-collection-subsets-audit-failure.png',
  'stage937-study-review-history-audit-failure.png',
  'stage937-study-habit-calendar-audit-failure.png',
  'stage937-study-progress-audit-failure.png',
  'stage937-home-review-schedule-audit-failure.png',
  'stage937-study-schedule-audit-failure.png',
  'stage937-review-ready-audit-failure.png',
  'stage937-source-review-audit-failure.png',
  'stage937-home-memory-filter-audit-failure.png',
  'stage937-source-overview-audit-failure.png',
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
  for (let index = 0; index < 13; index += 1) {
    pages.push(await browser.newPage({ viewport: desktopViewport }))
  }

  const managementEvidence = await captureStudyQuestionManagementEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[0],
    stageLabel: 'Stage 937 Study question management audit',
    stagePrefix: 'stage937-management',
  })
  const schedulingEvidence = await captureStudyQuestionSchedulingControlsEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[1],
    stageLabel: 'Stage 937 Study scheduling audit',
    stagePrefix: 'stage937-scheduling',
  })
  const memoryEvidence = await captureStudyMemoryProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[2],
    stageLabel: 'Stage 937 Study memory progress audit',
    stagePrefix: 'stage937-memory-progress',
  })
  const subsetEvidence = await captureStudyCollectionSubsetEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[3],
    stageLabel: 'Stage 937 Study collection subset audit',
    stagePrefix: 'stage937-subsets',
  })
  const reviewHistoryEvidence = await captureStudyQuestionReviewHistoryEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[4],
    stageLabel: 'Stage 937 Study review-history audit',
    stagePrefix: 'stage937-review-history',
  })
  const habitEvidence = await captureStudyHabitCalendarEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[5],
    stageLabel: 'Stage 937 Study habit calendar audit',
    stagePrefix: 'stage937-habit',
  })
  const progressEvidence = await captureStudyReviewProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[6],
    stageLabel: 'Stage 937 Study review progress audit',
    stagePrefix: 'stage937-progress',
  })
  const homeReviewEvidence = await captureHomeReviewScheduleLensEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[7],
    stageLabel: 'Stage 937 Home review schedule audit',
    stagePrefix: 'stage937-home-review',
  })
  const scheduleEvidence = await captureStudyScheduleDrilldownEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[8],
    stageLabel: 'Stage 937 Study schedule drilldown audit',
    stagePrefix: 'stage937-study-schedule',
  })
  const reviewReadyEvidence = await captureHomeReviewReadySourceEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[9],
    stageLabel: 'Stage 937 Home review-ready audit',
    stagePrefix: 'stage937-review-ready',
  })
  const sourceReviewEvidence = await captureSourceReviewQueueEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[10],
    stageLabel: 'Stage 937 source review audit',
    stagePrefix: 'stage937-source-review',
  })
  const filterEvidence = await captureHomeMemoryFilterEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[11],
    stageLabel: 'Stage 937 Home memory filter audit',
    stagePrefix: 'stage937-filter',
  })
  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[12],
    stageLabel: 'Stage 937 source overview memory-stack audit',
    stagePrefix: 'stage937-source-memory',
  })

  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
    homeReviewEvidence.metrics,
    scheduleEvidence.metrics,
    reviewReadyEvidence.metrics,
    sourceReviewEvidence.metrics,
    filterEvidence.metrics,
    sourceOverviewEvidence.metrics,
  )
  const notesSidebarVisible = await pages[0].evaluate(() =>
    Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.trim() === 'Notes' || tab.getAttribute('aria-label') === 'Notes',
    ),
  )
  const metrics = {
    ...sourceOverviewEvidence.metrics,
    ...filterEvidence.metrics,
    ...sourceReviewEvidence.metrics,
    ...reviewReadyEvidence.metrics,
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
    homeMemoryFilterControlsVisible: true,
    homeReviewReadySourceSignalsVisible: true,
    homeReviewScheduleLensVisible: true,
    notesSidebarVisible: false,
    sourceOverviewMemoryStackVisible: true,
    sourceOverviewReviewPanelVisible: true,
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
    studyQuestionSchedulingActiveActionAdvances: true,
    studyQuestionSchedulingReviewFilteredSkipsUnscheduled: true,
    studyQuestionSchedulingRowActionWorks: true,
    studyReviewProgressHeatmapVisible: true,
    studyReviewProgressPanelVisible: true,
    studyScheduleBucketDrilldownsVisible: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 937 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 937 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage937-study-question-edit-delete-management-audit.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Study question edit/delete and selected visible bulk delete pass.',
          'Stage 935 scheduling controls and Study dashboard/filter regressions remain stable.',
          'Home, Source overview, Reader, Notebook, Graph, Add Content, and cleanup hygiene remain regression surfaces.',
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
          ...reviewReadyEvidence.captures,
          ...sourceReviewEvidence.captures,
          ...filterEvidence.captures,
          ...sourceOverviewEvidence.captures,
        },
        cleanupDryRunAfterStage937: cleanupDryRun,
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
    path: path.join(outputDir, 'stage937-study-management-audit-failure.png'),
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
