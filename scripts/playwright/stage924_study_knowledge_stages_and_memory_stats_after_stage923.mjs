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
  captureStudyKnowledgeStageEvidence,
  captureStudyReviewProgressEvidence,
  desktopViewport,
} from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE924_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE924_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl =
  process.env.RECALL_STAGE924_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE924_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE924_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE924_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage924-study-knowledge-stage-failure.png',
  'stage924-study-progress-regression-failure.png',
  'stage924-home-review-schedule-regression-failure.png',
  'stage924-study-schedule-regression-failure.png',
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

let knowledgeStagePage
let progressPage
let homeReviewSchedulePage
let schedulePage
try {
  knowledgeStagePage = await browser.newPage({ viewport: desktopViewport })
  progressPage = await browser.newPage({ viewport: desktopViewport })
  homeReviewSchedulePage = await browser.newPage({ viewport: desktopViewport })
  schedulePage = await browser.newPage({ viewport: desktopViewport })

  const knowledgeStageEvidence = await captureStudyKnowledgeStageEvidence({
    baseUrl,
    directory: outputDir,
    page: knowledgeStagePage,
    stageLabel: 'Stage 924 Study knowledge stages and memory stats',
    stagePrefix: 'stage924',
  })
  const progressEvidence = await captureStudyReviewProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: progressPage,
    stageLabel: 'Stage 924 Study progress regression',
    stagePrefix: 'stage924-progress',
  })
  const homeReviewScheduleEvidence = await captureHomeReviewScheduleLensEvidence({
    baseUrl,
    directory: outputDir,
    page: homeReviewSchedulePage,
    stageLabel: 'Stage 924 Home review schedule regression',
    stagePrefix: 'stage924-home-review',
  })
  const scheduleEvidence = await captureStudyScheduleDrilldownEvidence({
    baseUrl,
    directory: outputDir,
    page: schedulePage,
    stageLabel: 'Stage 924 Study schedule drilldown regression',
    stagePrefix: 'stage924-study-schedule',
  })

  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const notesSidebarVisible = await knowledgeStagePage.evaluate(() =>
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
    studyKnowledgeStageHarnessDocumentDeleted: true,
    studyKnowledgeStageHarnessProgressCleaned: true,
    studyKnowledgeStagePanelVisible: true,
    studyKnowledgeStageQuestionRowsFiltered: true,
    studyKnowledgeStageSourceRowOpensQuestions: true,
    studyKnowledgeStageSourceRowsVisible: true,
    studyKnowledgeStageSourceScoped: true,
    studyReviewProgressHarnessDocumentDeleted: true,
    studyReviewProgressHarnessProgressCleaned: true,
    studyReviewProgressPanelVisible: true,
    studyReviewProgressSourceScoped: true,
    studyScheduleBucketDrilldownsVisible: true,
    studyScheduleDueBucketOpensQuestions: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 924 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.studyKnowledgeStageTotalCount < 1) {
    throw new Error('Stage 924 expected at least one staged Study question.')
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 924 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage924-study-knowledge-stages-and-memory-stats-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Study memory stats are visible on the dashboard from local card state.',
          'Stage chips open Questions filtered to the derived knowledge stage.',
          'Memory source rows open source-scoped Questions and scoped memory stats.',
          'Stage 922 progress, Stage 920 Home review filters, and Stage 918 schedule drilldowns remain stable.',
        ],
        baseUrl,
        captures: {
          ...knowledgeStageEvidence.captures,
          ...progressEvidence.captures,
          ...homeReviewScheduleEvidence.captures,
          ...scheduleEvidence.captures,
        },
        cleanupDryRunAfterStage924: cleanupDryRun,
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
    captureFailure(knowledgeStagePage, outputDir, 'stage924-study-knowledge-stage-failure.png'),
    captureFailure(progressPage, outputDir, 'stage924-study-progress-regression-failure.png'),
    captureFailure(homeReviewSchedulePage, outputDir, 'stage924-home-review-schedule-regression-failure.png'),
    captureFailure(schedulePage, outputDir, 'stage924-study-schedule-regression-failure.png'),
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
