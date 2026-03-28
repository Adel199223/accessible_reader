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
const outputDir = process.env.RECALL_STAGE695_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE695_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE695_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE695_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE695_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE695_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage695-post-stage694-shared-shell-and-navigation-model-reset-audit-failure-home.png',
  'stage695-post-stage694-shared-shell-and-navigation-model-reset-audit-failure-graph.png',
  'stage695-post-stage694-shared-shell-and-navigation-model-reset-audit-failure-notebook.png',
  'stage695-post-stage694-shared-shell-and-navigation-model-reset-audit-failure-reader.png',
  'stage695-post-stage694-shared-shell-and-navigation-model-reset-audit-failure-study.png',
  'stage695-post-stage694-shared-shell-and-navigation-model-reset-audit-failure-focused.png',
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
    stageLabel: 'Stage 695 audit',
    stagePrefix: 'stage695',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage695-post-stage694-shared-shell-and-navigation-model-reset-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 695 audit must prove the shared shell now reads icon-first and section-owned panels collapse and resume deliberately.',
          'Home and Graph should both expose explicit launcher recovery instead of relying on old overflow-only or canvas-only panel recovery.',
          'The shell reset must leave embedded Notebook, original-only Reader, Study, and the focused reader-led split stable.',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        focusedViewport,
        headless,
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
    captureFailure(homePage, outputDir, 'stage695-post-stage694-shared-shell-and-navigation-model-reset-audit-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage695-post-stage694-shared-shell-and-navigation-model-reset-audit-failure-graph.png'),
    captureFailure(notebookPage, outputDir, 'stage695-post-stage694-shared-shell-and-navigation-model-reset-audit-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage695-post-stage694-shared-shell-and-navigation-model-reset-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage695-post-stage694-shared-shell-and-navigation-model-reset-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage695-post-stage694-shared-shell-and-navigation-model-reset-audit-failure-focused.png'),
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
