import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureHomeOrganizerErgonomicsEvidence,
  desktopViewport,
  focusedViewport,
} from './home_organizer_ergonomics_shared.mjs'
import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE697_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE697_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE697_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE697_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE697_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE697_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage697-post-stage696-home-organizer-ergonomics-and-clipping-correction-audit-failure-home.png',
  'stage697-post-stage696-home-organizer-ergonomics-and-clipping-correction-audit-failure-graph.png',
  'stage697-post-stage696-home-organizer-ergonomics-and-clipping-correction-audit-failure-notebook.png',
  'stage697-post-stage696-home-organizer-ergonomics-and-clipping-correction-audit-failure-reader.png',
  'stage697-post-stage696-home-organizer-ergonomics-and-clipping-correction-audit-failure-study.png',
  'stage697-post-stage696-home-organizer-ergonomics-and-clipping-correction-audit-failure-focused.png',
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

  const evidence = await captureHomeOrganizerErgonomicsEvidence({
    baseUrl,
    directory: outputDir,
    focusedPage,
    graphPage,
    homePage,
    notebookPage,
    readerPage,
    stageLabel: 'Stage 697 audit',
    stagePrefix: 'stage697',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage697-post-stage696-home-organizer-ergonomics-and-clipping-correction-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 697 audit must prove that Home organizer ergonomics improved without undoing the Stage 694 shell reset.',
          'The organizer resize seam should stay visually quiet at rest, reveal on interaction, and keep collapse plus width continuity intact.',
          'The five Stage 695 Home clipping cases should be cleared while Graph, embedded Notebook, Study, and original-only Reader remain stable.',
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
    captureFailure(homePage, outputDir, 'stage697-post-stage696-home-organizer-ergonomics-and-clipping-correction-audit-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage697-post-stage696-home-organizer-ergonomics-and-clipping-correction-audit-failure-graph.png'),
    captureFailure(notebookPage, outputDir, 'stage697-post-stage696-home-organizer-ergonomics-and-clipping-correction-audit-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage697-post-stage696-home-organizer-ergonomics-and-clipping-correction-audit-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage697-post-stage696-home-organizer-ergonomics-and-clipping-correction-audit-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage697-post-stage696-home-organizer-ergonomics-and-clipping-correction-audit-failure-focused.png'),
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
