import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureHomeReviewReadySourceEvidence,
  summarizeStageHarnessCleanupMetrics,
} from './notebook_workbench_shared.mjs'
import { captureReaderSourceQuizLaunchEvidence } from './reader_source_quiz_launch_shared.mjs'
import {
  captureStudyHabitCalendarEvidence,
  captureStudyReviewProgressEvidence,
  desktopViewport,
} from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE957_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE957_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE957_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE957_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE957_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE957_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage957-reader-source-quiz-launch-audit-failure.png',
  'stage957-study-progress-audit-failure.png',
  'stage957-study-habit-audit-failure.png',
  'stage957-home-review-ready-audit-failure.png',
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
  for (let index = 0; index < 4; index += 1) {
    pages.push(await browser.newPage({ viewport: desktopViewport }))
  }

  const readerLaunchEvidence = await captureReaderSourceQuizLaunchEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[0],
    stageLabel: 'Stage 957 Reader-led source quiz launch audit',
    stagePrefix: 'stage957-reader-source-quiz-launch',
  })
  const progressEvidence = await captureStudyReviewProgressEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[1],
    stageLabel: 'Stage 957 Study progress regression audit',
    stagePrefix: 'stage957-study-progress',
  })
  const habitEvidence = await captureStudyHabitCalendarEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[2],
    stageLabel: 'Stage 957 Study habit regression audit',
    stagePrefix: 'stage957-study-habit',
  })
  const reviewReadyEvidence = await captureHomeReviewReadySourceEvidence({
    baseUrl,
    directory: outputDir,
    page: pages[3],
    stageLabel: 'Stage 957 Home review-ready regression audit',
    stagePrefix: 'stage957-home-review-ready',
  })
  const harnessCleanupMetrics = summarizeStageHarnessCleanupMetrics(reviewReadyEvidence.metrics)
  const metrics = {
    ...reviewReadyEvidence.metrics,
    ...habitEvidence.metrics,
    ...progressEvidence.metrics,
    ...readerLaunchEvidence.metrics,
    ...harnessCleanupMetrics,
  }
  for (const [metricName, expected] of Object.entries({
    homeReviewReadySourceSignalsVisible: true,
    readerGenerateQuestionsDoesNotBlindGenerate: true,
    readerGenerateQuestionsOpensControls: true,
    readerSourceQuizLaunchHarnessDocumentsDeleted: true,
    readerStartSourceQuizStartsSession: true,
    sourceOverviewSourceQuizLaunchStartsSession: true,
    stageHarnessCreatedNotesCleanedUp: true,
    studyReviewProgressPeriodSwitchesTo30: true,
    studyReviewProgressPanelVisible: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 957 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.cleanupUtilityDryRunMatchedAfterReaderSourceQuizLaunch !== 0) {
    throw new Error(
      `Stage 957 expected cleanup dry-run matchedCount 0, got ${metrics.cleanupUtilityDryRunMatchedAfterReaderSourceQuizLaunch}.`,
    )
  }

  const validation = {
    captures: {
      ...reviewReadyEvidence.captures,
      ...habitEvidence.captures,
      ...progressEvidence.captures,
      ...readerLaunchEvidence.captures,
    },
    metrics,
    runtimeBrowser,
    stage: 'stage957-post-stage956-reader-led-source-quiz-launch-audit',
  }
  await writeFile(
    path.join(outputDir, 'stage957-post-stage956-reader-source-quiz-launch-audit-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} finally {
  await browser.close()
}

function readCliOption(name) {
  const prefix = `--${name}=`
  const match = process.argv.slice(2).find((argument) => argument.startsWith(prefix))
  return match ? match.slice(prefix.length) : null
}
