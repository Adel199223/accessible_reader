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
const outputDir = process.env.RECALL_STAGE844_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE844_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE844_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE844_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE844_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE844_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage844-home-organizer-visible-fallback-chrome-retirement-after-stage843-failure-home.png',
  'stage844-home-organizer-visible-fallback-chrome-retirement-after-stage843-failure-graph.png',
  'stage844-home-organizer-visible-fallback-chrome-retirement-after-stage843-failure-notebook.png',
  'stage844-home-organizer-visible-fallback-chrome-retirement-after-stage843-failure-reader.png',
  'stage844-home-organizer-visible-fallback-chrome-retirement-after-stage843-failure-study.png',
  'stage844-home-organizer-visible-fallback-chrome-retirement-after-stage843-failure-focused.png',
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
    stageLabel: 'Stage 844 implementation',
    stagePrefix: 'stage844',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage844-home-organizer-visible-fallback-chrome-retirement-after-stage843-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 844 implementation must retire the organizer-visible legacy Home control seam and compact organizer control deck when Matches falls to zero results.',
          'Organizer-visible zero-result Matches must keep the compact rail query summary, the shared results-owned lead band, and one compact empty-state block without reviving the Add tile or the old header-card shell.',
          'The wider Stage 843 Home baseline must remain intact: organizer rail list rhythm, selected-board density and metadata, shared top band, single-row toolbar, hidden-state stability, and no clipping.',
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
    captureFailure(
      homePage,
      outputDir,
      'stage844-home-organizer-visible-fallback-chrome-retirement-after-stage843-failure-home.png',
    ),
    captureFailure(
      graphPage,
      outputDir,
      'stage844-home-organizer-visible-fallback-chrome-retirement-after-stage843-failure-graph.png',
    ),
    captureFailure(
      notebookPage,
      outputDir,
      'stage844-home-organizer-visible-fallback-chrome-retirement-after-stage843-failure-notebook.png',
    ),
    captureFailure(
      readerPage,
      outputDir,
      'stage844-home-organizer-visible-fallback-chrome-retirement-after-stage843-failure-reader.png',
    ),
    captureFailure(
      studyPage,
      outputDir,
      'stage844-home-organizer-visible-fallback-chrome-retirement-after-stage843-failure-study.png',
    ),
    captureFailure(
      focusedPage,
      outputDir,
      'stage844-home-organizer-visible-fallback-chrome-retirement-after-stage843-failure-focused.png',
    ),
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
