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
const outputDir = process.env.RECALL_STAGE885_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE885_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE885_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE885_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE885_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE885_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage885-post-stage884-home-local-preview-fidelity-and-card-identity-audit-failure-home.png',
  'stage885-post-stage884-home-local-preview-fidelity-and-card-identity-audit-failure-graph.png',
  'stage885-post-stage884-home-local-preview-fidelity-and-card-identity-audit-failure-notebook.png',
  'stage885-post-stage884-home-local-preview-fidelity-and-card-identity-audit-failure-reader.png',
  'stage885-post-stage884-home-local-preview-fidelity-and-card-identity-audit-failure-study.png',
  'stage885-post-stage884-home-local-preview-fidelity-and-card-identity-audit-failure-focused.png',
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
    stageLabel: 'Stage 885 audit',
    stagePrefix: 'stage885',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage885-post-stage884-home-local-preview-fidelity-and-card-identity-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 885 audit must prove default Captures exposes meaningful local identity previews instead of generic local posters.',
          'Web and Documents boards should continue preserving meaningful rendered preview assets when available.',
          'The wider Add Content, Graph, Notebook, Reader, Study, hidden Home, and Matches regression baselines must remain green.',
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
    captureFailure(homePage, outputDir, 'stage885-post-stage884-home-local-preview-fidelity-and-card-identity-audit-failure-home.png'),
    captureFailure(graphPage, outputDir, 'stage885-post-stage884-home-local-preview-fidelity-and-card-identity-audit-failure-graph.png'),
    captureFailure(
      notebookPage,
      outputDir,
      'stage885-post-stage884-home-local-preview-fidelity-and-card-identity-audit-failure-notebook.png',
    ),
    captureFailure(
      readerPage,
      outputDir,
      'stage885-post-stage884-home-local-preview-fidelity-and-card-identity-audit-failure-reader.png',
    ),
    captureFailure(studyPage, outputDir, 'stage885-post-stage884-home-local-preview-fidelity-and-card-identity-audit-failure-study.png'),
    captureFailure(
      focusedPage,
      outputDir,
      'stage885-post-stage884-home-local-preview-fidelity-and-card-identity-audit-failure-focused.png',
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
