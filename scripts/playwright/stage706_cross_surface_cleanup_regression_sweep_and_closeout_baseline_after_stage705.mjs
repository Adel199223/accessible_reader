import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureCloseoutBaselineEvidence,
  desktopViewport,
  focusedViewport,
  launchBrowserContext,
} from './closeout_baseline_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE706_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE706_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE706_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE706_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE706_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE706_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage706-closeout-baseline-failure.png'), { force: true })

const { browser, runtimeBrowser } = await launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
})

let studyPage
let focusedStudyPage
let homePage
let graphPage
let notebookPage
let originalReaderPage
let generatedReaderPage
try {
  studyPage = await browser.newPage({ viewport: desktopViewport })
  focusedStudyPage = await browser.newPage({ viewport: focusedViewport })
  homePage = await browser.newPage({ viewport: desktopViewport })
  graphPage = await browser.newPage({ viewport: desktopViewport })
  notebookPage = await browser.newPage({ viewport: desktopViewport })
  originalReaderPage = await browser.newPage({ viewport: desktopViewport })
  generatedReaderPage = await browser.newPage({ viewport: desktopViewport })

  const evidence = await captureCloseoutBaselineEvidence({
    baseUrl,
    directory: outputDir,
    focusedStudyPage,
    generatedReaderPage,
    graphPage,
    homePage,
    notebookPage,
    originalReaderPage,
    stageLabel: 'Stage 706',
    stagePrefix: 'stage706',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage706-cross-surface-cleanup-regression-sweep-and-closeout-baseline-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        focusedViewport,
        headless,
        metrics: evidence.metrics,
        runtimeBrowser,
        validationFocus: [
          'final cross-surface closeout baseline covering Home, Graph, Notebook, Reader original, Reader generated modes, and Study',
          'closeout refresh after stale Study shell cleanup without reopening another surface redesign',
          'one refreshed end-state evidence set for future regression-only continuity',
        ],
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  if (studyPage) {
    await studyPage
      .screenshot({
        path: path.join(outputDir, 'stage706-closeout-baseline-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
