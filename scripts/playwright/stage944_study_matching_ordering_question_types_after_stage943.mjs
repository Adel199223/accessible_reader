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
const outputDir = process.env.RECALL_STAGE944_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE944_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE944_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE944_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE944_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE944_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage944-study-matching-ordering-failure.png',
  'stage944-study-fill-blank-regression-failure.png',
  'stage944-study-choice-regression-failure.png',
  'stage944-study-create-regression-failure.png',
  'stage944-study-management-regression-failure.png',
  'stage944-study-scheduling-regression-failure.png',
  'stage944-study-memory-progress-regression-failure.png',
  'stage944-study-collection-subsets-regression-failure.png',
  'stage944-study-review-history-regression-failure.png',
  'stage944-study-habit-regression-failure.png',
  'stage944-study-progress-regression-failure.png',
  'stage944-home-review-regression-failure.png',
  'stage944-study-schedule-regression-failure.png',
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

  const matchingOrderingEvidence = await captureStudyMatchingOrderingQuestionTypesEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[0],
    stageLabel: 'Stage 944 Study matching and ordering question types',
    stagePrefix: 'stage944-matching-ordering',
  })
  const fillBlankEvidence = await captureStudyFillBlankAnswerAttemptsEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[1],
    stageLabel: 'Stage 944 Study fill-in-the-blank regression',
    stagePrefix: 'stage944-fill-blank',
  })
  const choiceEvidence = await captureStudyChoiceQuestionTypesEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[2],
    stageLabel: 'Stage 944 Study choice question type regression',
    stagePrefix: 'stage944-choice',
  })
  const creationEvidence = await captureStudyQuestionCreationEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[3],
    stageLabel: 'Stage 944 Study manual creation regression',
    stagePrefix: 'stage944-create',
  })
  const managementEvidence = await captureStudyQuestionManagementEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[4],
    stageLabel: 'Stage 944 Study management regression',
    stagePrefix: 'stage944-management',
  })
  const schedulingEvidence = await captureStudyQuestionSchedulingControlsEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[5],
    stageLabel: 'Stage 944 Study scheduling regression',
    stagePrefix: 'stage944-scheduling',
  })
  const memoryEvidence = await captureStudyMemoryProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[6],
    stageLabel: 'Stage 944 Study memory progress regression',
    stagePrefix: 'stage944-memory-progress',
  })
  const subsetEvidence = await captureStudyCollectionSubsetEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[7],
    stageLabel: 'Stage 944 Study collection subset regression',
    stagePrefix: 'stage944-subsets',
  })
  const reviewHistoryEvidence = await captureStudyQuestionReviewHistoryEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[8],
    stageLabel: 'Stage 944 Study review-history regression',
    stagePrefix: 'stage944-review-history',
  })
  const habitEvidence = await captureStudyHabitCalendarEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[9],
    stageLabel: 'Stage 944 Study habit regression',
    stagePrefix: 'stage944-habit',
  })
  const progressEvidence = await captureStudyReviewProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[10],
    stageLabel: 'Stage 944 Study progress regression',
    stagePrefix: 'stage944-progress',
  })
  const homeReviewEvidence = await captureHomeReviewScheduleLensEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[11],
    stageLabel: 'Stage 944 Home review schedule regression',
    stagePrefix: 'stage944-home-review',
  })
  const scheduleEvidence = await captureStudyScheduleDrilldownEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[12],
    stageLabel: 'Stage 944 Study schedule regression',
    stagePrefix: 'stage944-study-schedule',
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
    ...creationEvidence.metrics,
    ...choiceEvidence.metrics,
    ...fillBlankEvidence.metrics,
    ...matchingOrderingEvidence.metrics,
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
    notesSidebarVisible,
  }

  for (const [metricName, expected] of Object.entries({
    homeReviewScheduleLensVisible: true,
    notesSidebarVisible: false,
    stageHarnessCreatedNotesCleanedUp: true,
    studyChoiceQuestionMultipleChoiceCreates: true,
    studyFillBlankCreatesVisibleQuestion: true,
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
    studyQuestionManagementPreservesScheduleControls: true,
    studyQuestionReviewHistoryReviewFilteredHandoff: true,
    studyQuestionSchedulingRowActionWorks: true,
    studyReviewProgressHeatmapVisible: true,
    studyReviewProgressPanelVisible: true,
    studyScheduleBucketDrilldownsVisible: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 944 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 944 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage944-study-matching-ordering-question-types-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Study Questions can create, search, edit, and preserve manual matching and ordering cards.',
          'Matching and ordering Review attempts stay local before the existing rating flow.',
          'The Stage 943 typed-question and Study dashboard regression surfaces remain stable.',
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
        },
        cleanupDryRunAfterStage944: cleanupDryRun,
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
    path: path.join(outputDir, 'stage944-study-matching-ordering-failure.png'),
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
