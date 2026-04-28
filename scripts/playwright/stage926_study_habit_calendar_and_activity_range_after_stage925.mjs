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
  captureStudyHabitCalendarEvidence,
  captureStudyKnowledgeStageEvidence,
  captureStudyReviewProgressEvidence,
  desktopViewport,
} from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE926_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE926_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl =
  process.env.RECALL_STAGE926_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE926_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE926_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE926_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage926-study-habit-calendar-failure.png',
  'stage926-study-knowledge-stage-regression-failure.png',
  'stage926-study-progress-regression-failure.png',
  'stage926-home-review-schedule-regression-failure.png',
  'stage926-study-schedule-regression-failure.png',
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

let habitPage
let knowledgeStagePage
let progressPage
let homeReviewSchedulePage
let schedulePage
try {
  habitPage = await browser.newPage({ viewport: desktopViewport })
  knowledgeStagePage = await browser.newPage({ viewport: desktopViewport })
  progressPage = await browser.newPage({ viewport: desktopViewport })
  homeReviewSchedulePage = await browser.newPage({ viewport: desktopViewport })
  schedulePage = await browser.newPage({ viewport: desktopViewport })

  const habitEvidence = await captureStudyHabitCalendarEvidence({
    baseUrl,
    directory: outputDir,
    page: habitPage,
    stageLabel: 'Stage 926 Study habit calendar and activity range',
    stagePrefix: 'stage926-habit',
  })
  const knowledgeStageEvidence = await captureStudyKnowledgeStageEvidence({
    baseUrl,
    directory: outputDir,
    page: knowledgeStagePage,
    stageLabel: 'Stage 926 Study knowledge-stage regression',
    stagePrefix: 'stage926-knowledge',
  })
  const progressEvidence = await captureStudyReviewProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: progressPage,
    stageLabel: 'Stage 926 Study progress regression',
    stagePrefix: 'stage926-progress',
  })
  const homeReviewScheduleEvidence = await captureHomeReviewScheduleLensEvidence({
    baseUrl,
    directory: outputDir,
    page: homeReviewSchedulePage,
    stageLabel: 'Stage 926 Home review schedule regression',
    stagePrefix: 'stage926-home-review',
  })
  const scheduleEvidence = await captureStudyScheduleDrilldownEvidence({
    baseUrl,
    directory: outputDir,
    page: schedulePage,
    stageLabel: 'Stage 926 Study schedule drilldown regression',
    stagePrefix: 'stage926-study-schedule',
  })

  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const notesSidebarVisible = await habitPage.evaluate(() =>
    Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.trim() === 'Notes' || tab.getAttribute('aria-label') === 'Notes',
    ),
  )
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
    homeReviewScheduleEvidence.metrics,
    scheduleEvidence.metrics,
  )
  const metrics = {
    ...scheduleEvidence.metrics,
    ...homeReviewScheduleEvidence.metrics,
    ...progressEvidence.metrics,
    ...knowledgeStageEvidence.metrics,
    ...habitEvidence.metrics,
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
    notesSidebarVisible,
  }

  for (const [metricName, expected] of Object.entries({
    homeReviewScheduleFilteredSignalOpensSourceScopedQuestions: true,
    homeReviewScheduleLensVisible: true,
    notesSidebarVisible: false,
    stageHarnessCreatedNotesCleanedUp: true,
    studyKnowledgeStageChipOpensQuestions: true,
    studyKnowledgeStageCountsVisible: true,
    studyKnowledgeStagePanelVisible: true,
    studyKnowledgeStageQuestionRowsFiltered: true,
    studyKnowledgeStageSourceRowOpensQuestions: true,
    studyKnowledgeStageSourceRowsVisible: true,
    studyKnowledgeStageSourceScoped: true,
    studyReviewProgressActivityVisible: true,
    studyReviewProgressHarnessDocumentDeleted: true,
    studyReviewProgressHarnessProgressCleaned: true,
    studyReviewProgressHeatmapVisible: true,
    studyReviewProgressPanelVisible: true,
    studyReviewProgressPeriodControlsVisible: true,
    studyReviewProgressPeriodSwitchPreservesSourceScope: true,
    studyReviewProgressPeriodSwitchesTo30: true,
    studyReviewProgressRatingMixVisible: true,
    studyReviewProgressRecentReviewSelectsCard: true,
    studyReviewProgressSourceScoped: true,
    studyScheduleBucketDrilldownsVisible: true,
    studyScheduleDueBucketOpensQuestions: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 926 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.studyReviewProgressPeriodDays !== 14 || metrics.studyReviewProgressHeatmapDays !== 14) {
    throw new Error('Stage 926 expected the default habit calendar range to be 14 days.')
  }
  if (metrics.studyReviewProgressPeriodDaysAfterSwitch !== 30 || metrics.studyReviewProgressHeatmapDaysAfterSwitch !== 30) {
    throw new Error('Stage 926 expected the switched habit calendar range to be 30 days.')
  }
  if (metrics.studyKnowledgeStageTotalCount < 1) {
    throw new Error('Stage 926 expected at least one staged Study question.')
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 926 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage926-study-habit-calendar-and-activity-range-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Study progress exposes 14, 30, 90, and 365-day activity controls.',
          'The habit calendar heatmap reflects the selected review activity range.',
          'The selected activity range survives source-scoped Study Questions handoff.',
          'Stage 924 memory stats, Stage 922 progress, Stage 920 Home review filters, and Stage 918 schedule drilldowns remain stable.',
        ],
        baseUrl,
        captures: {
          ...habitEvidence.captures,
          ...knowledgeStageEvidence.captures,
          ...progressEvidence.captures,
          ...homeReviewScheduleEvidence.captures,
          ...scheduleEvidence.captures,
        },
        cleanupDryRunAfterStage926: cleanupDryRun,
        desktopViewport,
        headless,
        metrics,
        runtimeBrowser,
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  await Promise.all([
    captureFailure(habitPage, outputDir, 'stage926-study-habit-calendar-failure.png'),
    captureFailure(knowledgeStagePage, outputDir, 'stage926-study-knowledge-stage-regression-failure.png'),
    captureFailure(progressPage, outputDir, 'stage926-study-progress-regression-failure.png'),
    captureFailure(homeReviewSchedulePage, outputDir, 'stage926-home-review-schedule-regression-failure.png'),
    captureFailure(schedulePage, outputDir, 'stage926-study-schedule-regression-failure.png'),
  ])
  throw error
} finally {
  await browser.close()
}

async function captureFailure(page, directory, filename) {
  if (!page) {
    return
  }
  await page
    .screenshot({
      fullPage: true,
      path: path.join(directory, filename),
    })
    .catch(() => undefined)
}

function readCliOption(name) {
  const prefix = `--${name}=`
  const inline = process.argv.find((argument) => argument.startsWith(prefix))
  if (inline) {
    return inline.slice(prefix.length)
  }
  const index = process.argv.indexOf(`--${name}`)
  return index >= 0 ? process.argv[index + 1] : null
}
