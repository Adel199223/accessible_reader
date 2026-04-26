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
const outputDir = process.env.RECALL_STAGE818_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE818_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE818_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE818_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE818_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE818_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage818-home-organizer-shell-reopen-and-ownership-correction-after-stage817-failure-home.png',
  'stage818-home-organizer-shell-reopen-and-ownership-correction-after-stage817-failure-graph.png',
  'stage818-home-organizer-shell-reopen-and-ownership-correction-after-stage817-failure-notebook.png',
  'stage818-home-organizer-shell-reopen-and-ownership-correction-after-stage817-failure-reader.png',
  'stage818-home-organizer-shell-reopen-and-ownership-correction-after-stage817-failure-study.png',
  'stage818-home-organizer-shell-reopen-and-ownership-correction-after-stage817-failure-focused.png',
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
    stageLabel: 'Stage 818',
    stagePrefix: 'stage818',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage818-home-organizer-shell-reopen-and-ownership-correction-after-stage817-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        focusedViewport,
        headless,
        implementationFocus: [
          'Stage 818 intentionally reopens Home after the Reader ladder to correct organizer shell ownership instead of continuing lower-leverage Reader polish.',
          'The Home organizer header now owns its hide control inside the action seam, with shell-level insets that keep the title clear of clipped rounded corners.',
          'The collapsed organizer lane now stays top anchored and the organizer list begins directly under the header while resize, collapse, reopen, and width continuity remain intact.',
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
    captureFailure(homePage, outputDir, 'stage818-home-organizer-shell-reopen-and-ownership-correction-after-stage817-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage818-home-organizer-shell-reopen-and-ownership-correction-after-stage817-failure-graph.png'),
    captureFailure(notebookPage, outputDir, 'stage818-home-organizer-shell-reopen-and-ownership-correction-after-stage817-failure-notebook.png'),
    captureFailure(readerPage, outputDir, 'stage818-home-organizer-shell-reopen-and-ownership-correction-after-stage817-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage818-home-organizer-shell-reopen-and-ownership-correction-after-stage817-failure-study.png'),
    captureFailure(focusedPage, outputDir, 'stage818-home-organizer-shell-reopen-and-ownership-correction-after-stage817-failure-focused.png'),
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
