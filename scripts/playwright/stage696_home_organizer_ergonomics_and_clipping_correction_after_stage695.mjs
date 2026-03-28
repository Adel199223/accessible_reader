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
const outputDir = process.env.RECALL_STAGE696_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE696_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE696_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE696_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE696_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE696_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage696-home-organizer-ergonomics-and-clipping-correction-after-stage695-failure-home.png',
  'stage696-home-organizer-ergonomics-and-clipping-correction-after-stage695-failure-graph.png',
  'stage696-home-organizer-ergonomics-and-clipping-correction-after-stage695-failure-notebook.png',
  'stage696-home-organizer-ergonomics-and-clipping-correction-after-stage695-failure-reader.png',
  'stage696-home-organizer-ergonomics-and-clipping-correction-after-stage695-failure-study.png',
  'stage696-home-organizer-ergonomics-and-clipping-correction-after-stage695-failure-focused.png',
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
    stageLabel: 'Stage 696',
    stagePrefix: 'stage696',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage696-home-organizer-ergonomics-and-clipping-correction-after-stage695-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        focusedViewport,
        headless,
        implementationFocus: [
          'Stage 696 keeps the Stage 694 shell reset intact while making the Home organizer seam quiet at rest and deliberate only on hover or focus.',
          'The Home organizer remains collapsible and resizable, but its launcher and close affordances now read as calmer section-owned controls instead of exposed layout scaffolding.',
          'The Home clipping fixes target the live Stage 695 title and organizer text-fit cases without reopening the settled content-rendered preview pipeline.',
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
    captureFailure(homePage, outputDir, 'stage696-home-organizer-ergonomics-and-clipping-correction-after-stage695-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage696-home-organizer-ergonomics-and-clipping-correction-after-stage695-failure-graph.png'),
    captureFailure(notebookPage, outputDir, 'stage696-home-organizer-ergonomics-and-clipping-correction-after-stage695-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage696-home-organizer-ergonomics-and-clipping-correction-after-stage695-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage696-home-organizer-ergonomics-and-clipping-correction-after-stage695-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage696-home-organizer-ergonomics-and-clipping-correction-after-stage695-failure-focused.png'),
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
