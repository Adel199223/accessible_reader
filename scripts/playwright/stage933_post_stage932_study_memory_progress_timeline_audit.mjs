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
  captureStudyKnowledgeStageEvidence,
  captureStudyMemoryProgressEvidence,
  captureStudyQuestionReviewHistoryEvidence,
  captureStudyReviewProgressEvidence,
  desktopViewport,
} from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE933_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE933_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl =
  process.env.RECALL_STAGE933_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE933_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE933_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE933_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage933-study-memory-progress-audit-failure.png',
  'stage933-study-collection-subsets-audit-failure.png',
  'stage933-study-review-history-audit-failure.png',
  'stage933-study-habit-calendar-audit-failure.png',
  'stage933-study-knowledge-stage-audit-failure.png',
  'stage933-study-progress-audit-failure.png',
  'stage933-home-review-schedule-audit-failure.png',
  'stage933-study-schedule-audit-failure.png',
  'stage933-review-ready-audit-failure.png',
  'stage933-source-review-audit-failure.png',
  'stage933-home-memory-filter-audit-failure.png',
  'stage933-source-overview-audit-failure.png',
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

let memoryPage
let subsetPage
let reviewHistoryPage
let habitPage
let knowledgePage
let progressPage
let homeReviewPage
let schedulePage
let reviewReadyPage
let sourceReviewPage
let filtersPage
let sourceOverviewPage
try {
  memoryPage = await browser.newPage({ viewport: desktopViewport })
  subsetPage = await browser.newPage({ viewport: desktopViewport })
  reviewHistoryPage = await browser.newPage({ viewport: desktopViewport })
  habitPage = await browser.newPage({ viewport: desktopViewport })
  knowledgePage = await browser.newPage({ viewport: desktopViewport })
  progressPage = await browser.newPage({ viewport: desktopViewport })
  homeReviewPage = await browser.newPage({ viewport: desktopViewport })
  schedulePage = await browser.newPage({ viewport: desktopViewport })
  reviewReadyPage = await browser.newPage({ viewport: desktopViewport })
  sourceReviewPage = await browser.newPage({ viewport: desktopViewport })
  filtersPage = await browser.newPage({ viewport: desktopViewport })
  sourceOverviewPage = await browser.newPage({ viewport: desktopViewport })

  const memoryEvidence = await captureStudyMemoryProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: memoryPage,
    stageLabel: 'Stage 933 Study memory progress audit',
    stagePrefix: 'stage933-memory-progress',
  })
  const subsetEvidence = await captureStudyCollectionSubsetEvidence({
    baseUrl,
    directory: outputDir,
    page: subsetPage,
    stageLabel: 'Stage 933 Study collection subset audit',
    stagePrefix: 'stage933-subsets',
  })
  const reviewHistoryEvidence = await captureStudyQuestionReviewHistoryEvidence({
    baseUrl,
    directory: outputDir,
    page: reviewHistoryPage,
    stageLabel: 'Stage 933 Study review-history audit',
    stagePrefix: 'stage933-review-history',
  })
  const habitEvidence = await captureStudyHabitCalendarEvidence({
    baseUrl,
    directory: outputDir,
    page: habitPage,
    stageLabel: 'Stage 933 Study habit calendar audit',
    stagePrefix: 'stage933-habit',
  })
  const knowledgeEvidence = await captureStudyKnowledgeStageEvidence({
    baseUrl,
    directory: outputDir,
    page: knowledgePage,
    stageLabel: 'Stage 933 Study knowledge-stage audit',
    stagePrefix: 'stage933-knowledge',
  })
  const progressEvidence = await captureStudyReviewProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: progressPage,
    stageLabel: 'Stage 933 Study review progress audit',
    stagePrefix: 'stage933-progress',
  })
  const homeReviewEvidence = await captureHomeReviewScheduleLensEvidence({
    baseUrl,
    directory: outputDir,
    page: homeReviewPage,
    stageLabel: 'Stage 933 Home review schedule audit',
    stagePrefix: 'stage933-home-review',
  })
  const scheduleEvidence = await captureStudyScheduleDrilldownEvidence({
    baseUrl,
    directory: outputDir,
    page: schedulePage,
    stageLabel: 'Stage 933 Study schedule drilldown audit',
    stagePrefix: 'stage933-study-schedule',
  })
  const reviewReadyEvidence = await captureHomeReviewReadySourceEvidence({
    baseUrl,
    directory: outputDir,
    page: reviewReadyPage,
    stageLabel: 'Stage 933 Home review-ready audit',
    stagePrefix: 'stage933-review-ready',
  })
  const sourceReviewEvidence = await captureSourceReviewQueueEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceReviewPage,
    stageLabel: 'Stage 933 source review audit',
    stagePrefix: 'stage933-source-review',
  })
  const filterEvidence = await captureHomeMemoryFilterEvidence({
    baseUrl,
    directory: outputDir,
    page: filtersPage,
    stageLabel: 'Stage 933 Home memory filter audit',
    stagePrefix: 'stage933-filter',
  })
  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceOverviewPage,
    stageLabel: 'Stage 933 source overview memory-stack audit',
    stagePrefix: 'stage933-source-memory',
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
  const notesSidebarVisible = await memoryPage.evaluate(() =>
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
    ...knowledgeEvidence.metrics,
    ...habitEvidence.metrics,
    ...reviewHistoryEvidence.metrics,
    ...subsetEvidence.metrics,
    ...memoryEvidence.metrics,
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
    notesSidebarVisible,
  }

  for (const [metricName, expected] of Object.entries({
    homeMemoryFilterControlsVisible: true,
    homeReviewReadySignalOpensSourceScopedStudy: true,
    homeReviewReadySourceSignalsVisible: true,
    homeReviewScheduleLensVisible: true,
    notesSidebarVisible: false,
    sourceOverviewMemoryStackVisible: true,
    sourceOverviewReviewPanelVisible: true,
    stageHarnessCreatedNotesCleanedUp: true,
    studyCollectionSubsetPanelVisible: true,
    studyCollectionSubsetReviewFilteredHandoff: true,
    studyMemoryProgressHarnessDocumentDeleted: true,
    studyMemoryProgressHarnessProgressCleaned: true,
    studyMemoryProgressPanelVisible: true,
    studyMemoryProgressPeriodSwitches: true,
    studyMemoryProgressSourceScoped: true,
    studyMemoryProgressStageOpensQuestions: true,
    studyMemoryProgressTimelineVisible: true,
    studyQuestionReviewHistoryReviewFilteredHandoff: true,
    studyReviewProgressHeatmapVisible: true,
    studyReviewProgressPanelVisible: true,
    studyScheduleBucketDrilldownsVisible: true,
    studyScheduleDueBucketOpensQuestions: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 933 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 933 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage933-post-stage932-study-memory-progress-audit.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Study memory progress remains visible, range-aware, source-aware, and actionable.',
          'Stage 931 subset filters and Stage 929 filtered Review queue remain intact.',
          'Home review discovery, source overview, source review, Home memory filters, and cleanup dry-run remain stable.',
        ],
        baseUrl,
        captures: {
          ...memoryEvidence.captures,
          ...subsetEvidence.captures,
          ...reviewHistoryEvidence.captures,
          ...habitEvidence.captures,
          ...knowledgeEvidence.captures,
          ...progressEvidence.captures,
          ...homeReviewEvidence.captures,
          ...scheduleEvidence.captures,
          ...reviewReadyEvidence.captures,
          ...sourceReviewEvidence.captures,
          ...filterEvidence.captures,
          ...sourceOverviewEvidence.captures,
        },
        cleanupDryRunAfterStage933: cleanupDryRun,
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
    captureFailure(memoryPage, outputDir, 'stage933-study-memory-progress-audit-failure.png'),
    captureFailure(subsetPage, outputDir, 'stage933-study-collection-subsets-audit-failure.png'),
    captureFailure(reviewHistoryPage, outputDir, 'stage933-study-review-history-audit-failure.png'),
    captureFailure(habitPage, outputDir, 'stage933-study-habit-calendar-audit-failure.png'),
    captureFailure(knowledgePage, outputDir, 'stage933-study-knowledge-stage-audit-failure.png'),
    captureFailure(progressPage, outputDir, 'stage933-study-progress-audit-failure.png'),
    captureFailure(homeReviewPage, outputDir, 'stage933-home-review-schedule-audit-failure.png'),
    captureFailure(schedulePage, outputDir, 'stage933-study-schedule-audit-failure.png'),
    captureFailure(reviewReadyPage, outputDir, 'stage933-review-ready-audit-failure.png'),
    captureFailure(sourceReviewPage, outputDir, 'stage933-source-review-audit-failure.png'),
    captureFailure(filtersPage, outputDir, 'stage933-home-memory-filter-audit-failure.png'),
    captureFailure(sourceOverviewPage, outputDir, 'stage933-source-overview-audit-failure.png'),
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
