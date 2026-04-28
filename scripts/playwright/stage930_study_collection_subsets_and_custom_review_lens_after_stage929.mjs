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
  captureStudyQuestionReviewHistoryEvidence,
  captureStudyReviewProgressEvidence,
  desktopViewport,
} from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE930_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE930_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl =
  process.env.RECALL_STAGE930_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE930_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE930_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE930_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage930-study-collection-subsets-failure.png',
  'stage930-study-review-history-regression-failure.png',
  'stage930-study-habit-regression-failure.png',
  'stage930-study-knowledge-regression-failure.png',
  'stage930-study-progress-regression-failure.png',
  'stage930-home-review-regression-failure.png',
  'stage930-study-schedule-regression-failure.png',
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

let subsetPage
let reviewHistoryPage
let habitPage
let knowledgePage
let progressPage
let homeReviewPage
let schedulePage
try {
  subsetPage = await browser.newPage({ viewport: desktopViewport })
  reviewHistoryPage = await browser.newPage({ viewport: desktopViewport })
  habitPage = await browser.newPage({ viewport: desktopViewport })
  knowledgePage = await browser.newPage({ viewport: desktopViewport })
  progressPage = await browser.newPage({ viewport: desktopViewport })
  homeReviewPage = await browser.newPage({ viewport: desktopViewport })
  schedulePage = await browser.newPage({ viewport: desktopViewport })

  const subsetEvidence = await captureStudyCollectionSubsetEvidence({
    baseUrl,
    directory: outputDir,
    page: subsetPage,
    stageLabel: 'Stage 930 Study collection subsets and custom review lens',
    stagePrefix: 'stage930-subsets',
  })
  const reviewHistoryEvidence = await captureStudyQuestionReviewHistoryEvidence({
    baseUrl,
    directory: outputDir,
    page: reviewHistoryPage,
    stageLabel: 'Stage 930 Study review-history regression',
    stagePrefix: 'stage930-review-history',
  })
  const habitEvidence = await captureStudyHabitCalendarEvidence({
    baseUrl,
    directory: outputDir,
    page: habitPage,
    stageLabel: 'Stage 930 Study habit calendar regression',
    stagePrefix: 'stage930-habit',
  })
  const knowledgeEvidence = await captureStudyKnowledgeStageEvidence({
    baseUrl,
    directory: outputDir,
    page: knowledgePage,
    stageLabel: 'Stage 930 Study knowledge-stage regression',
    stagePrefix: 'stage930-knowledge',
  })
  const progressEvidence = await captureStudyReviewProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: progressPage,
    stageLabel: 'Stage 930 Study review progress regression',
    stagePrefix: 'stage930-progress',
  })
  const homeReviewEvidence = await captureHomeReviewScheduleLensEvidence({
    baseUrl,
    directory: outputDir,
    page: homeReviewPage,
    stageLabel: 'Stage 930 Home review schedule regression',
    stagePrefix: 'stage930-home-review',
  })
  const scheduleEvidence = await captureStudyScheduleDrilldownEvidence({
    baseUrl,
    directory: outputDir,
    page: schedulePage,
    stageLabel: 'Stage 930 Study schedule drilldown regression',
    stagePrefix: 'stage930-study-schedule',
  })

  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(
    homeReviewEvidence.metrics,
    scheduleEvidence.metrics,
  )
  const notesSidebarVisible = await subsetPage.evaluate(() =>
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
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
    notesSidebarVisible,
  }

  for (const [metricName, expected] of Object.entries({
    homeReviewScheduleFilteredSignalOpensSourceScopedQuestions: true,
    homeReviewScheduleLensVisible: true,
    notesSidebarVisible: false,
    stageHarnessCreatedNotesCleanedUp: true,
    studyCollectionSubsetActiveFilterStackVisible: true,
    studyCollectionSubsetClearFiltersWorks: true,
    studyCollectionSubsetHarnessDocumentDeleted: true,
    studyCollectionSubsetHarnessProgressCleaned: true,
    studyCollectionSubsetPanelVisible: true,
    studyCollectionSubsetReviewFilteredHandoff: true,
    studyCollectionSubsetRowsFiltered: true,
    studyCollectionSubsetRowsVisible: true,
    studyCollectionSubsetStaticRowOpensQuestions: true,
    studyKnowledgeStageChipOpensQuestions: true,
    studyKnowledgeStagePanelVisible: true,
    studyQuestionReviewHistoryReviewFilteredHandoff: true,
    studyReviewProgressHeatmapVisible: true,
    studyReviewProgressPanelVisible: true,
    studyReviewProgressPeriodControlsVisible: true,
    studyReviewProgressRatingMixVisible: true,
    studyScheduleBucketDrilldownsVisible: true,
    studyScheduleDueBucketOpensQuestions: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 930 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 930 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage930-study-collection-subsets-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Study dashboard exposes review subset rows from local source collections.',
          'Subset rows open Questions with active clearable subset filters.',
          'Review filtered returns to Review from the subset-filtered queue.',
          'Stage 929 review-history, habit calendar, memory stats, Home review schedule, and Study schedule drilldowns remain stable.',
        ],
        baseUrl,
        captures: {
          ...subsetEvidence.captures,
          ...reviewHistoryEvidence.captures,
          ...habitEvidence.captures,
          ...knowledgeEvidence.captures,
          ...progressEvidence.captures,
          ...homeReviewEvidence.captures,
          ...scheduleEvidence.captures,
        },
        cleanupDryRunAfterStage930: cleanupDryRun,
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
    captureFailure(subsetPage, outputDir, 'stage930-study-collection-subsets-failure.png'),
    captureFailure(reviewHistoryPage, outputDir, 'stage930-study-review-history-regression-failure.png'),
    captureFailure(habitPage, outputDir, 'stage930-study-habit-regression-failure.png'),
    captureFailure(knowledgePage, outputDir, 'stage930-study-knowledge-regression-failure.png'),
    captureFailure(progressPage, outputDir, 'stage930-study-progress-regression-failure.png'),
    captureFailure(homeReviewPage, outputDir, 'stage930-home-review-regression-failure.png'),
    captureFailure(schedulePage, outputDir, 'stage930-study-schedule-regression-failure.png'),
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
