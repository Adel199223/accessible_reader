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
  captureStudyQuestionSchedulingControlsEvidence,
  captureStudyReviewProgressEvidence,
  desktopViewport,
} from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE935_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE935_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl =
  process.env.RECALL_STAGE935_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE935_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE935_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE935_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage935-study-scheduling-audit-failure.png',
  'stage935-study-memory-progress-audit-failure.png',
  'stage935-study-collection-subsets-audit-failure.png',
  'stage935-study-review-history-audit-failure.png',
  'stage935-study-habit-calendar-audit-failure.png',
  'stage935-study-knowledge-audit-failure.png',
  'stage935-study-progress-audit-failure.png',
  'stage935-home-review-schedule-audit-failure.png',
  'stage935-study-schedule-audit-failure.png',
  'stage935-review-ready-audit-failure.png',
  'stage935-source-review-audit-failure.png',
  'stage935-home-memory-filter-audit-failure.png',
  'stage935-source-overview-audit-failure.png',
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
let reviewReadyPage
let sourceReviewPage
let filtersPage
let sourceOverviewPage
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
  reviewReadyPage = await browser.newPage({ viewport: desktopViewport })
  sourceReviewPage = await browser.newPage({ viewport: desktopViewport })
  filtersPage = await browser.newPage({ viewport: desktopViewport })
  sourceOverviewPage = await browser.newPage({ viewport: desktopViewport })

  const schedulingEvidence = await captureStudyQuestionSchedulingControlsEvidence({
    baseUrl,
    directory: outputDir,
    page: schedulingPage,
    stageLabel: 'Stage 935 Study question scheduling audit',
    stagePrefix: 'stage935-scheduling',
  })
  const memoryEvidence = await captureStudyMemoryProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: memoryPage,
    stageLabel: 'Stage 935 Study memory progress audit',
    stagePrefix: 'stage935-memory-progress',
  })
  const subsetEvidence = await captureStudyCollectionSubsetEvidence({
    baseUrl,
    directory: outputDir,
    page: subsetPage,
    stageLabel: 'Stage 935 Study collection subset audit',
    stagePrefix: 'stage935-subsets',
  })
  const reviewHistoryEvidence = await captureStudyQuestionReviewHistoryEvidence({
    baseUrl,
    directory: outputDir,
    page: reviewHistoryPage,
    stageLabel: 'Stage 935 Study review-history audit',
    stagePrefix: 'stage935-review-history',
  })
  const habitEvidence = await captureStudyHabitCalendarEvidence({
    baseUrl,
    directory: outputDir,
    page: habitPage,
    stageLabel: 'Stage 935 Study habit calendar audit',
    stagePrefix: 'stage935-habit',
  })
  const knowledgeEvidence = await captureStudyKnowledgeStageEvidence({
    baseUrl,
    directory: outputDir,
    page: knowledgePage,
    stageLabel: 'Stage 935 Study knowledge-stage audit',
    stagePrefix: 'stage935-knowledge',
  })
  const progressEvidence = await captureStudyReviewProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: progressPage,
    stageLabel: 'Stage 935 Study review progress audit',
    stagePrefix: 'stage935-progress',
  })
  const homeReviewEvidence = await captureHomeReviewScheduleLensEvidence({
    baseUrl,
    directory: outputDir,
    page: homeReviewPage,
    stageLabel: 'Stage 935 Home review schedule audit',
    stagePrefix: 'stage935-home-review',
  })
  const scheduleEvidence = await captureStudyScheduleDrilldownEvidence({
    baseUrl,
    directory: outputDir,
    page: schedulePage,
    stageLabel: 'Stage 935 Study schedule drilldown audit',
    stagePrefix: 'stage935-study-schedule',
  })
  const reviewReadyEvidence = await captureHomeReviewReadySourceEvidence({
    baseUrl,
    directory: outputDir,
    page: reviewReadyPage,
    stageLabel: 'Stage 935 Home review-ready audit',
    stagePrefix: 'stage935-review-ready',
  })
  const sourceReviewEvidence = await captureSourceReviewQueueEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceReviewPage,
    stageLabel: 'Stage 935 source review audit',
    stagePrefix: 'stage935-source-review',
  })
  const filterEvidence = await captureHomeMemoryFilterEvidence({
    baseUrl,
    directory: outputDir,
    page: filtersPage,
    stageLabel: 'Stage 935 Home memory filter audit',
    stagePrefix: 'stage935-filter',
  })
  const sourceOverviewEvidence = await captureSourceOverviewMemoryEvidence({
    baseUrl,
    directory: outputDir,
    page: sourceOverviewPage,
    stageLabel: 'Stage 935 source overview memory-stack audit',
    stagePrefix: 'stage935-source-memory',
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
  const notesSidebarVisible = await schedulingPage.evaluate(() =>
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
    ...schedulingEvidence.metrics,
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
      throw new Error(`Stage 935 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 935 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage935-study-question-scheduling-controls-audit.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Study scheduling controls remain local-first and card-level.',
          'Unscheduled cards are browse/manage objects until scheduled back into review.',
          'Stage 933 memory progress, Stage 931 subsets, and Stage 929 filtered queues remain stable.',
          'Home review discovery, source review, source memory, and cleanup hygiene remain regression-safe.',
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
          ...reviewReadyEvidence.captures,
          ...sourceReviewEvidence.captures,
          ...filterEvidence.captures,
          ...sourceOverviewEvidence.captures,
        },
        cleanupDryRunAfterStage935: cleanupDryRun,
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
    captureFailure(schedulingPage, outputDir, 'stage935-study-scheduling-audit-failure.png'),
    captureFailure(memoryPage, outputDir, 'stage935-study-memory-progress-audit-failure.png'),
    captureFailure(subsetPage, outputDir, 'stage935-study-collection-subsets-audit-failure.png'),
    captureFailure(reviewHistoryPage, outputDir, 'stage935-study-review-history-audit-failure.png'),
    captureFailure(habitPage, outputDir, 'stage935-study-habit-calendar-audit-failure.png'),
    captureFailure(knowledgePage, outputDir, 'stage935-study-knowledge-audit-failure.png'),
    captureFailure(progressPage, outputDir, 'stage935-study-progress-audit-failure.png'),
    captureFailure(homeReviewPage, outputDir, 'stage935-home-review-schedule-audit-failure.png'),
    captureFailure(schedulePage, outputDir, 'stage935-study-schedule-audit-failure.png'),
    captureFailure(reviewReadyPage, outputDir, 'stage935-review-ready-audit-failure.png'),
    captureFailure(sourceReviewPage, outputDir, 'stage935-source-review-audit-failure.png'),
    captureFailure(filtersPage, outputDir, 'stage935-home-memory-filter-audit-failure.png'),
    captureFailure(sourceOverviewPage, outputDir, 'stage935-source-overview-audit-failure.png'),
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
