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
  captureStudyChoiceQuestionTypesEvidence,
  captureStudyCollectionSubsetEvidence,
  captureStudyFillBlankAnswerAttemptsEvidence,
  captureStudyHabitCalendarEvidence,
  captureStudyMatchingOrderingQuestionTypesEvidence,
  captureStudyMemoryProgressEvidence,
  captureStudyQuestionCreationEvidence,
  captureStudyQuestionManagementEvidence,
  captureStudyQuestionReviewHistoryEvidence,
  captureStudyQuestionSchedulingControlsEvidence,
  captureStudyReviewProgressEvidence,
  desktopViewport,
} from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE945_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE945_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE945_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE945_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE945_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE945_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage945-study-matching-ordering-audit-failure.png',
  'stage945-study-fill-blank-audit-failure.png',
  'stage945-study-choice-audit-failure.png',
  'stage945-study-create-audit-failure.png',
  'stage945-study-management-audit-failure.png',
  'stage945-study-scheduling-audit-failure.png',
  'stage945-study-memory-progress-audit-failure.png',
  'stage945-study-collection-subsets-audit-failure.png',
  'stage945-study-review-history-audit-failure.png',
  'stage945-study-habit-calendar-audit-failure.png',
  'stage945-study-progress-audit-failure.png',
  'stage945-home-review-schedule-audit-failure.png',
  'stage945-study-schedule-audit-failure.png',
  'stage945-review-ready-audit-failure.png',
  'stage945-source-review-audit-failure.png',
  'stage945-home-memory-filter-audit-failure.png',
  'stage945-source-overview-audit-failure.png',
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
  for (let index = 0; index < 17; index += 1) {
    pages.push(await browser.newPage({ viewport: desktopViewport }))
  }

  const matchingOrderingEvidence = await captureStudyMatchingOrderingQuestionTypesEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[0],
    stageLabel: 'Stage 945 Study matching and ordering audit',
    stagePrefix: 'stage945-matching-ordering',
  })
  const fillBlankEvidence = await captureStudyFillBlankAnswerAttemptsEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[1],
    stageLabel: 'Stage 945 Study fill-in-the-blank audit',
    stagePrefix: 'stage945-fill-blank',
  })
  const choiceEvidence = await captureStudyChoiceQuestionTypesEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[2],
    stageLabel: 'Stage 945 Study choice question types audit',
    stagePrefix: 'stage945-choice',
  })
  const creationEvidence = await captureStudyQuestionCreationEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[3],
    stageLabel: 'Stage 945 Study manual creation audit',
    stagePrefix: 'stage945-create',
  })
  const managementEvidence = await captureStudyQuestionManagementEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[4],
    stageLabel: 'Stage 945 Study management audit',
    stagePrefix: 'stage945-management',
  })
  const schedulingEvidence = await captureStudyQuestionSchedulingControlsEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[5],
    stageLabel: 'Stage 945 Study scheduling audit',
    stagePrefix: 'stage945-scheduling',
  })
  const memoryEvidence = await captureStudyMemoryProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[6],
    stageLabel: 'Stage 945 Study memory progress audit',
    stagePrefix: 'stage945-memory-progress',
  })
  const subsetEvidence = await captureStudyCollectionSubsetEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[7],
    stageLabel: 'Stage 945 Study collection subset audit',
    stagePrefix: 'stage945-subsets',
  })
  const reviewHistoryEvidence = await captureStudyQuestionReviewHistoryEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[8],
    stageLabel: 'Stage 945 Study review-history audit',
    stagePrefix: 'stage945-review-history',
  })
  const habitEvidence = await captureStudyHabitCalendarEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[9],
    stageLabel: 'Stage 945 Study habit calendar audit',
    stagePrefix: 'stage945-habit',
  })
  const progressEvidence = await captureStudyReviewProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[10],
    stageLabel: 'Stage 945 Study progress audit',
    stagePrefix: 'stage945-progress',
  })
  const homeReviewEvidence = await captureHomeReviewScheduleLensEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[11],
    stageLabel: 'Stage 945 Home review schedule audit',
    stagePrefix: 'stage945-home-review',
  })
  const scheduleEvidence = await captureStudyScheduleDrilldownEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[12],
    stageLabel: 'Stage 945 Study schedule audit',
    stagePrefix: 'stage945-study-schedule',
  })
  const reviewReadyEvidence = await captureHomeReviewReadySourceEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[13],
    stageLabel: 'Stage 945 Home review-ready audit',
    stagePrefix: 'stage945-review-ready',
  })
  const sourceReviewEvidence = await captureSourceReviewQueueEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[14],
    stageLabel: 'Stage 945 source review audit',
    stagePrefix: 'stage945-source-review',
  })
  const filterEvidence = await captureHomeMemoryFilterEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[15],
    stageLabel: 'Stage 945 Home memory filter audit',
    stagePrefix: 'stage945-filter',
  })
  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[16],
    stageLabel: 'Stage 945 source overview memory-stack audit',
    stagePrefix: 'stage945-source-memory',
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
    ...creationEvidence.metrics,
    ...choiceEvidence.metrics,
    ...fillBlankEvidence.metrics,
    ...matchingOrderingEvidence.metrics,
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
    studyChoiceQuestionHarnessDocumentsDeleted: true,
    studyFillBlankHarnessDocumentsDeleted: true,
    studyMatchingOrderingEditPreservesPayload: true,
    studyMatchingOrderingHarnessDocumentsDeleted: true,
    studyMatchingOrderingHarnessProgressCleaned: true,
    studyMatchingOrderingSearchFindsPayloadText: true,
    studyMatchingOrderingSurvivesGenerate: true,
    studyMatchingQuestionCreates: true,
    studyMatchingQuestionReviewSelectionState: true,
    studyMemoryProgressPanelVisible: true,
    studyOrderingQuestionCreates: true,
    studyOrderingQuestionReviewReorderState: true,
    studyQuestionCreateGlobalCreatesVisibleQuestion: true,
    studyQuestionDeleteRowActionWorks: true,
    studyQuestionEditRowActionWorks: true,
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
      throw new Error(`Stage 945 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 945 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage945-post-stage944-study-matching-ordering-question-types-audit.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Stage 944 matching and ordering cards remain source-owned, searchable, editable, and reviewable.',
          'Stage 943 fill-in-the-blank, Stage 941 choice cards, Stage 937 edit/delete, and Stage 935 scheduling remain stable.',
          'Home review discovery, Source overview, and cleanup hygiene remain unchanged.',
        ],
        baseUrl,
        captures: {
          ...matchingOrderingEvidence.captures,
          ...fillBlankEvidence.captures,
          ...choiceEvidence.captures,
          ...creationEvidence.captures,
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
        cleanupDryRunAfterStage945: cleanupDryRun,
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
    path: path.join(outputDir, 'stage945-study-matching-ordering-audit-failure.png'),
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
