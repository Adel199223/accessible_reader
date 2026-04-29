import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderSourceQuizLaunchEvidence } from './reader_source_quiz_launch_shared.mjs'
import { desktopViewport } from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE956_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE956_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE956_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE956_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE956_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE956_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of ['stage956-reader-source-quiz-launch-failure.png']) {
  await rm(path.join(outputDir, failureFile), { force: true })
}

const { browser, runtimeBrowser } = await launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
})

try {
  const page = await browser.newPage({ viewport: desktopViewport })
  const evidence = await captureReaderSourceQuizLaunchEvidence({
    baseUrl,
    directory: outputDir,
    page,
    stageLabel: 'Stage 956 Reader-led source quiz launch',
    stagePrefix: 'stage956-reader-source-quiz-launch',
  })
  const metrics = evidence.metrics
  for (const [metricName, expected] of Object.entries({
    readerGenerateQuestionsDoesNotBlindGenerate: true,
    readerGenerateQuestionsOpensControls: true,
    readerGenerateQuestionsPreservesSourceScope: true,
    readerShortCompletionStudyCtaVisible: true,
    readerSourceQuizLaunchHarnessDocumentsDeleted: true,
    readerSourceQuizLaunchHarnessProgressCleaned: true,
    readerSourceScopePreservedForSession: true,
    readerStartSourceQuizCtaVisible: true,
    readerStartSourceQuizStartsSession: true,
    readerStudyQuestionsDoesNotStartSession: true,
    readerStudyQuestionsOpensManager: true,
    readerStudyQuestionsPreservesSourceScope: true,
    sourceOverviewSourceQuizLaunchStartsSession: true,
    sourceOverviewSourceQuizLaunchVisible: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 956 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }
  if (metrics.cleanupUtilityDryRunMatchedAfterReaderSourceQuizLaunch !== 0) {
    throw new Error(
      `Stage 956 expected cleanup dry-run matchedCount 0, got ${metrics.cleanupUtilityDryRunMatchedAfterReaderSourceQuizLaunch}.`,
    )
  }

  const validation = {
    captures: evidence.captures,
    metrics,
    runtimeBrowser,
    stage: 'stage956-reader-led-source-quiz-launch',
  }
  await writeFile(
    path.join(outputDir, 'stage956-reader-source-quiz-launch-validation.json'),
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
