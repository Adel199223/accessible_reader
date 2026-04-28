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
  captureStudyReviewProgressEvidence,
  desktopViewport,
} from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE922_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE922_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl =
  process.env.RECALL_STAGE922_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE922_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE922_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE922_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage922-study-review-progress-failure.png',
  'stage922-home-review-schedule-regression-failure.png',
  'stage922-study-schedule-regression-failure.png',
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

let progressPage
let homeReviewSchedulePage
let schedulePage
try {
  progressPage = await browser.newPage({ viewport: desktopViewport })
  homeReviewSchedulePage = await browser.newPage({ viewport: desktopViewport })
  schedulePage = await browser.newPage({ viewport: desktopViewport })

  const progressEvidence = await captureStudyReviewProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: progressPage,
    stageLabel: 'Stage 922 Study review progress dashboard',
    stagePrefix: 'stage922',
  })
  const homeReviewScheduleEvidence = await captureHomeReviewScheduleLensEvidence({
    baseUrl,
    directory: outputDir,
    page: homeReviewSchedulePage,
    stageLabel: 'Stage 922 Home review schedule regression',
    stagePrefix: 'stage922-home-review',
  })
  const scheduleEvidence = await captureStudyScheduleDrilldownEvidence({
    baseUrl,
    directory: outputDir,
    page: schedulePage,
    stageLabel: 'Stage 922 Study schedule drilldown regression',
    stagePrefix: 'stage922-study-schedule',
  })

  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  const notesSidebarVisible = await progressPage.evaluate(() =>
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
    ...harnessCleanupMetrics,
    cleanupUtilityDryRunMatchedAfterApply: cleanupDryRun.matchedCount,
    notesSidebarVisible,
  }

  for (const [metricName, expected] of Object.entries({
    homeReviewScheduleFilteredSignalOpensSourceScopedQuestions: true,
    homeReviewScheduleLensVisible: true,
    notesSidebarVisible: false,
    stageHarnessCreatedNotesCleanedUp: true,
    studyReviewProgressActivityVisible: true,
    studyReviewProgressHarnessDocumentDeleted: true,
    studyReviewProgressHarnessProgressCleaned: true,
    studyReviewProgressPanelVisible: true,
    studyReviewProgressRatingMixVisible: true,
    studyReviewProgressRecentReviewSelectsCard: true,
    studyReviewProgressRecentReviewsVisible: true,
    studyReviewProgressSourceRowOpensQuestions: true,
    studyReviewProgressSourceRowsVisible: true,
    studyReviewProgressSourceScoped: true,
    studyScheduleBucketDrilldownsVisible: true,
    studyScheduleDueBucketOpensQuestions: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 922 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.studyReviewProgressTodayCount < 1 || metrics.studyReviewProgressDailyStreak < 1) {
    throw new Error('Stage 922 expected positive today/streak progress counts.')
  }
  if (cleanupDryRun.matchedCount !== 0) {
    throw new Error(`Stage 922 expected cleanup dry-run matchedCount 0, got ${cleanupDryRun.matchedCount}.`)
  }

  await writeFile(
    path.join(outputDir, 'stage922-study-review-progress-dashboard-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Study review progress is derived from local review events and visible on the Study dashboard.',
          'Recent review rows select matching Study cards and source progress rows open source-scoped Questions.',
          'The temporary progress harness source is deleted after validation, removing its review events.',
          'Stage 920 Home review schedule and Stage 918 Study schedule drilldown regressions remain stable.',
        ],
        baseUrl,
        captures: {
          ...progressEvidence.captures,
          ...homeReviewScheduleEvidence.captures,
          ...scheduleEvidence.captures,
        },
        cleanupDryRunAfterStage922: cleanupDryRun,
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
    captureFailure(progressPage, outputDir, 'stage922-study-review-progress-failure.png'),
    captureFailure(homeReviewSchedulePage, outputDir, 'stage922-home-review-schedule-regression-failure.png'),
    captureFailure(schedulePage, outputDir, 'stage922-study-schedule-regression-failure.png'),
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
