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
const outputDir = process.env.RECALL_STAGE884_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE884_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE884_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE884_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE884_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE884_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage884-home-local-preview-fidelity-and-card-identity-after-stage883-failure-home.png',
  'stage884-home-local-preview-fidelity-and-card-identity-after-stage883-failure-graph.png',
  'stage884-home-local-preview-fidelity-and-card-identity-after-stage883-failure-notebook.png',
  'stage884-home-local-preview-fidelity-and-card-identity-after-stage883-failure-reader.png',
  'stage884-home-local-preview-fidelity-and-card-identity-after-stage883-failure-study.png',
  'stage884-home-local-preview-fidelity-and-card-identity-after-stage883-failure-focused.png',
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
    stageLabel: 'Stage 884 implementation',
    stagePrefix: 'stage884',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage884-home-local-preview-fidelity-and-card-identity-after-stage883-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 884 implementation must make weak local captures feel content-owned through deterministic local identity posters.',
          'Selected Web and Documents boards must preserve meaningful rendered image previews whenever existing assets are available.',
          'The Stage 871 Home density, organizer, Matches, hidden-state, and no-clipping baselines must remain intact.',
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
    captureFailure(homePage, outputDir, 'stage884-home-local-preview-fidelity-and-card-identity-after-stage883-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage884-home-local-preview-fidelity-and-card-identity-after-stage883-failure-graph.png'),
    captureFailure(
      notebookPage,
      outputDir,
      'stage884-home-local-preview-fidelity-and-card-identity-after-stage883-failure-notebook.png',
    ),
    captureFailure(readerPage, outputDir, 'stage884-home-local-preview-fidelity-and-card-identity-after-stage883-failure-reader.png'),
    captureFailure(studyPage, outputDir, 'stage884-home-local-preview-fidelity-and-card-identity-after-stage883-failure-study.png'),
    captureFailure(
      focusedPage,
      outputDir,
      'stage884-home-local-preview-fidelity-and-card-identity-after-stage883-failure-focused.png',
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
