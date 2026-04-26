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
const outputDir = process.env.RECALL_STAGE870_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE870_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE870_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE870_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE870_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE870_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage870-home-mixed-preview-balance-and-rendered-asset-preservation-after-stage869-failure-home.png',
  'stage870-home-mixed-preview-balance-and-rendered-asset-preservation-after-stage869-failure-graph.png',
  'stage870-home-mixed-preview-balance-and-rendered-asset-preservation-after-stage869-failure-notebook.png',
  'stage870-home-mixed-preview-balance-and-rendered-asset-preservation-after-stage869-failure-reader.png',
  'stage870-home-mixed-preview-balance-and-rendered-asset-preservation-after-stage869-failure-study.png',
  'stage870-home-mixed-preview-balance-and-rendered-asset-preservation-after-stage869-failure-focused.png',
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
    stageLabel: 'Stage 870 implementation',
    stagePrefix: 'stage870',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage870-home-mixed-preview-balance-and-rendered-asset-preservation-after-stage869-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 870 implementation must keep weak local captures text-first without flattening Web or Documents boards into text-only cards.',
          'Selected Web and Documents boards should preserve meaningful rendered image previews whenever existing assets are available.',
          'The Stage 869 Home scanability, density, organizer, Matches, hidden-state, and no-clipping baselines must remain intact.',
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
      'stage870-home-mixed-preview-balance-and-rendered-asset-preservation-after-stage869-failure-home.png',
    ),
    captureFailure(
      graphPage,
      outputDir,
      'stage870-home-mixed-preview-balance-and-rendered-asset-preservation-after-stage869-failure-graph.png',
    ),
    captureFailure(
      notebookPage,
      outputDir,
      'stage870-home-mixed-preview-balance-and-rendered-asset-preservation-after-stage869-failure-notebook.png',
    ),
    captureFailure(
      readerPage,
      outputDir,
      'stage870-home-mixed-preview-balance-and-rendered-asset-preservation-after-stage869-failure-reader.png',
    ),
    captureFailure(
      studyPage,
      outputDir,
      'stage870-home-mixed-preview-balance-and-rendered-asset-preservation-after-stage869-failure-study.png',
    ),
    captureFailure(
      focusedPage,
      outputDir,
      'stage870-home-mixed-preview-balance-and-rendered-asset-preservation-after-stage869-failure-focused.png',
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
