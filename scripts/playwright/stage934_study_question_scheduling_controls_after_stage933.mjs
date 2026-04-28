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
  captureStudyKnowledgeStageEvidence,
  captureStudyMemoryProgressEvidence,
  captureStudyQuestionReviewHistoryEvidence,
  captureStudyQuestionSchedulingControlsEvidence,
  captureStudyReviewProgressEvidence,
  desktopViewport,
} from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE934_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE934_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl =
  process.env.RECALL_STAGE934_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE934_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE934_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE934_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage934-study-scheduling-failure.png',
  'stage934-study-memory-progress-regression-failure.png',
  'stage934-study-collection-subsets-regression-failure.png',
  'stage934-study-review-history-regression-failure.png',
  'stage934-study-habit-regression-failure.png',
  'stage934-study-knowledge-regression-failure.png',
  'stage934-study-progress-regression-failure.png',
  'stage934-home-review-regression-failure.png',
  'stage934-study-schedule-regression-failure.png',
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

let schedulingPage
let memoryPage
let subsetPage
let reviewHistoryPage
let habitPage
let knowledgePage
let progressPage
let homeReviewPage
let schedulePage
try {
  schedulingPage = await browser.newPage({ viewport: desktopViewport })
  memoryPage = await browser.newPage({ viewport: desktopViewport })
  subsetPage = await browser.newPage({ viewport: desktopViewport })
  reviewHistoryPage = await browser.newPage({ viewport: desktopViewport })
  habitPage = await browser.newPage({ viewport: desktopViewport })
  knowledgePage = await browser.newPage({ viewport: desktopViewport })
  progressPage = await browser.newPage({ viewport: desktopViewport })
  homeReviewPage = await browser.newPage({ viewport: desktopViewport })
  schedulePage = await browser.newPage({ viewport: desktopViewport })

  const schedulingEvidence = await captureStudyQuestionSchedulingControlsEvidence({
    baseUrl,
    directory: outputDir,
    page: schedulingPage,
    stageLabel: 'Stage 934 Study question scheduling controls',
    stagePrefix: 'stage934-scheduling',
  })
  const memoryEvidence = await captureStudyMemoryProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: memoryPage,
    stageLabel: 'Stage 934 Study memory progress regression',
    stagePrefix: 'stage934-memory-progress',
  })
  const subsetEvidence = await captureStudyCollectionSubsetEvidence({
    baseUrl,
    directory: outputDir,
    page: subsetPage,
    stageLabel: 'Stage 934 Study collection subset regression',
    stagePrefix: 'stage934-subsets',
  })
  const reviewHistoryEvidence = await captureStudyQuestionReviewHistoryEvidence({
    baseUrl,
    directory: outputDir,
    page: reviewHistoryPage,
    stageLabel: 'Stage 934 Study review-history regression',
    stagePrefix: 'stage934-review-history',
  })
  const habitEvidence = await captureStudyHabitCalendarEvidence({
    baseUrl,
    directory: outputDir,
    page: habitPage,
    stageLabel: 'Stage 934 Study habit calendar regression',
    stagePrefix: 'stage934-habit',
  })
  const knowledgeEvidence = await captureStudyKnowledgeStageEvidence({
    baseUrl,
    directory: outputDir,
    page: knowledgePage,
    stageLabel: 'Stage 934 Study knowledge-stage regression',
    stagePrefix: 'stage934-knowledge',
  })
  const progressEvidence = await captureStudyReviewProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: progressPage,
    stageLabel: 'Stage 934 Study review progress regression',
    stagePrefix: 'stage934-progress',
  })
  const homeReviewEvidence = await captureHomeReviewScheduleLensEvidence({
    baseUrl,
    directory: outputDir,
    page: homeReviewPage,
    stageLabel: 'Stage 934 Home review schedule regression',
    stagePrefix: 'stage934-home-review',
  })
  const scheduleEvidence = await captureStudyScheduleDrilldownEvidence({
    baseUrl,
    directory: outputDir,
    page: schedulePage,
    stageLabel: 'Stage 934 Study schedule drilldown regression',
    stagePrefix: 'stage934-study-schedule',
  })

  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
    homeReviewEvidence.metrics,
    scheduleEvidence.metrics,
  )
  const notesSidebarVisible = await schedulingPage.evaluate(() =>
    Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]')).some(
      (tab) => tab.textContent?.trim() === 'Notes' || tab.getAttribute('aria-label') === 'Notes',
    ),
  )
  const metrics = {
    ...scheduleEvidence.metrics,
    ...homeReviewEvidence.metrics,
    ...progressEvidence.metrics,
    ...knowledgeEvidence.metrics,
    ...habitEvidence.metrics,
    ...reviewHistoryEvidence.metrics,
    ...subsetEvidence.metrics,
    ...memoryEvidence.metrics,
    ...schedulingEvidence.metrics,
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
    notesSidebarVisible,
  }

  for (const [metricName, expected] of Object.entries({
    homeReviewScheduleLensVisible: true,
    notesSidebarVisible: false,
    stageHarnessCreatedNotesCleanedUp: true,
    studyCollectionSubsetPanelVisible: true,
    studyCollectionSubsetReviewFilteredHandoff: true,
    studyKnowledgeStagePanelVisible: true,
    studyMemoryProgressPanelVisible: true,
    studyQuestionReviewHistoryReviewFilteredHandoff: true,
    studyQuestionSchedulingActiveActionAdvances: true,
    studyQuestionSchedulingHarnessDocumentsDeleted: true,
    studyQuestionSchedulingHarnessProgressCleaned: true,
    studyQuestionSchedulingReviewFilteredSkipsUnscheduled: true,
    studyQuestionSchedulingRowActionWorks: true,
    studyReviewProgressHeatmapVisible: true,
    studyReviewProgressPanelVisible: true,
    studyScheduleBucketDrilldownsVisible: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 934 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 934 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage934-study-question-scheduling-controls-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Study Questions rows expose Schedule and Unschedule controls.',
          'Active Review can unschedule the selected card and advance to the next eligible card.',
          'Review filtered skips unscheduled matching cards while preserving the filter stack.',
          'Stage 933 memory progress and Stage 931/929 filtering regressions remain stable.',
        ],
        baseUrl,
        captures: {
          ...schedulingEvidence.captures,
          ...memoryEvidence.captures,
          ...subsetEvidence.captures,
          ...reviewHistoryEvidence.captures,
          ...habitEvidence.captures,
          ...knowledgeEvidence.captures,
          ...progressEvidence.captures,
          ...homeReviewEvidence.captures,
          ...scheduleEvidence.captures,
        },
        cleanupDryRunAfterStage934: cleanupDryRun,
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
    captureFailure(schedulingPage, outputDir, 'stage934-study-scheduling-failure.png'),
    captureFailure(memoryPage, outputDir, 'stage934-study-memory-progress-regression-failure.png'),
    captureFailure(subsetPage, outputDir, 'stage934-study-collection-subsets-regression-failure.png'),
    captureFailure(reviewHistoryPage, outputDir, 'stage934-study-review-history-regression-failure.png'),
    captureFailure(habitPage, outputDir, 'stage934-study-habit-regression-failure.png'),
    captureFailure(knowledgePage, outputDir, 'stage934-study-knowledge-regression-failure.png'),
    captureFailure(progressPage, outputDir, 'stage934-study-progress-regression-failure.png'),
    captureFailure(homeReviewPage, outputDir, 'stage934-home-review-regression-failure.png'),
    captureFailure(schedulePage, outputDir, 'stage934-study-schedule-regression-failure.png'),
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
  if (index >= 0) {
    return process.argv[index + 1] ?? null
  }
  return null
}
