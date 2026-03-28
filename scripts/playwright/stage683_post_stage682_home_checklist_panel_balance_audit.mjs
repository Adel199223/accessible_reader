import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureHomeChecklistPanelBalanceEvidence,
  captureViewportScreenshot,
  desktopViewport,
  launchBrowserContext,
  openGraph,
  openOriginalReaderFromHome,
} from './home_rendered_preview_quality_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE683_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE683_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE683_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE683_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE683_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE683_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage683-post-stage682-home-checklist-panel-balance-audit-failure.png',
  ),
  { force: true },
)
await rm(
  path.join(
    outputDir,
    'stage683-post-stage682-home-checklist-panel-balance-audit-failure-reader.png',
  ),
  { force: true },
)

const { browser, runtimeBrowser } = await launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
})

let page
let readerPage
try {
  page = await browser.newPage({ viewport: desktopViewport })
  const homeEvidence = await captureHomeChecklistPanelBalanceEvidence({
    baseUrl,
    directory: outputDir,
    page,
    stageLabel: 'Stage 683',
    stagePrefix: 'stage683',
  })

  await openGraph(page, baseUrl)
  const graphWideTop = await captureViewportScreenshot(page, outputDir, 'stage683-graph-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage683', baseUrl)

  await writeFile(
    path.join(
      outputDir,
      'stage683-post-stage682-home-checklist-panel-balance-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 682 checklist panel balance pass',
          'the weak Stage 10 Web card should keep the Stage 674 article-sheet lane, the TXT card should keep the Stage 676 document-outline lane, and the structured paste card should present the wider, less-tall Stage 682 checklist panel balance',
          'the note tiers plus Graph and original-only Reader remain stable while the settled Home width, start-offset, toolbar, and day-group-count regression gates stay locked',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          ...homeEvidence.captures,
          graphWideTop,
          readerOriginalWideTop: readerEvidence.capture,
        },
        desktopViewport,
        headless,
        homeMetrics: homeEvidence.metrics,
        readerSourceTitle: readerEvidence.sourceTitle,
        runtimeBrowser,
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  if (page) {
    await page
      .screenshot({
        path: path.join(
          outputDir,
          'stage683-post-stage682-home-checklist-panel-balance-audit-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (readerPage && readerPage !== page) {
    await readerPage
      .screenshot({
        path: path.join(
          outputDir,
          'stage683-post-stage682-home-checklist-panel-balance-audit-failure-reader.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
