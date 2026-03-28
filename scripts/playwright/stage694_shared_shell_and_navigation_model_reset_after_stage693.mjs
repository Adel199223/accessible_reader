import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureShellNavigationResetEvidence,
  desktopViewport,
  focusedViewport,
} from './shell_navigation_reset_shared.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE694_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE694_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE694_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE694_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE694_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE694_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage694-shared-shell-and-navigation-model-reset-after-stage693-failure-home.png',
  'stage694-shared-shell-and-navigation-model-reset-after-stage693-failure-graph.png',
  'stage694-shared-shell-and-navigation-model-reset-after-stage693-failure-notebook.png',
  'stage694-shared-shell-and-navigation-model-reset-after-stage693-failure-reader.png',
  'stage694-shared-shell-and-navigation-model-reset-after-stage693-failure-study.png',
  'stage694-shared-shell-and-navigation-model-reset-after-stage693-failure-focused.png',
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

let homePage
let graphPage
let notebookPage
let readerPage
let studyPage
let focusedPage
try {
  homePage = await browser.newPage({ viewport: desktopViewport })
  graphPage = await browser.newPage({ viewport: desktopViewport })
  notebookPage = await browser.newPage({ viewport: desktopViewport })
  readerPage = await browser.newPage({ viewport: desktopViewport })
  studyPage = await browser.newPage({ viewport: desktopViewport })
  focusedPage = await browser.newPage({ viewport: focusedViewport })

  const evidence = await captureShellNavigationResetEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage,
    notebookPage,
    readerPage,
    stageLabel: 'Stage 694',
    stagePrefix: 'stage694',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage694-shared-shell-and-navigation-model-reset-after-stage693-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        focusedViewport,
        headless,
        implementationFocus: [
          'Stage 694 resets the global shell into a compact icon-first rail with no visible Notes destination.',
          'Home and Graph now use explicit section-owned collapse and resume controls instead of hidden overflow-only panel recovery.',
          'The shell reset keeps embedded Notebook, Study, original-only Reader, and focused reader-led split continuity stable while the shared navigation model changes underneath.',
        ],
        metrics: evidence.metrics,
        runtimeBrowser,
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  await Promise.all([
    captureFailure(homePage, outputDir, 'stage694-shared-shell-and-navigation-model-reset-after-stage693-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage694-shared-shell-and-navigation-model-reset-after-stage693-failure-graph.png'),
    captureFailure(notebookPage, outputDir, 'stage694-shared-shell-and-navigation-model-reset-after-stage693-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage694-shared-shell-and-navigation-model-reset-after-stage693-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage694-shared-shell-and-navigation-model-reset-after-stage693-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage694-shared-shell-and-navigation-model-reset-after-stage693-failure-focused.png'),
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
