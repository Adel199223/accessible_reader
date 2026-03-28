import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureViewportScreenshot,
  desktopViewport,
  launchBrowserContext,
  openHome,
  openOriginalReaderFromHome,
} from './home_rendered_preview_quality_shared.mjs'
import { captureGraphRecallStyleEvidence } from './graph_recall_style_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE685_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE685_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE685_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE685_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE685_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE685_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage685-post-stage684-graph-recall-style-settings-canvas-and-tour-audit-failure.png'),
  { force: true },
)
await rm(
  path.join(outputDir, 'stage685-post-stage684-graph-recall-style-settings-canvas-and-tour-audit-failure-reader.png'),
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
  const graphEvidence = await captureGraphRecallStyleEvidence({
    baseUrl,
    directory: outputDir,
    page,
    stageLabel: 'Stage 685',
    stagePrefix: 'stage685',
  })

  await openHome(page, baseUrl)
  const homeWideTop = await captureViewportScreenshot(page, outputDir, 'stage685-home-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage685', baseUrl)

  await writeFile(
    path.join(
      outputDir,
      'stage685-post-stage684-graph-recall-style-settings-canvas-and-tour-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'Graph opens into a Recall-style browse state with docked settings on the left, a calmer dominant canvas, a compact title-search corner, and utility controls in the bottom corners.',
          'The Graph View tour is local-first, replayable, and visually aligned to the Recall-inspired welcome, customize, navigation, help, tag-filter, and discover-connections sequence.',
          'Selected-node and multi-select path workflows now stay contextual instead of occupying the default idle surface, while Home and original-only Reader remain stable regression baselines.',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          ...graphEvidence.captures,
          homeWideTop,
          readerOriginalWideTop: readerEvidence.capture,
        },
        desktopViewport,
        headless,
        metrics: {
          ...graphEvidence.metrics,
          readerSourceTitle: readerEvidence.sourceTitle,
        },
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
          'stage685-post-stage684-graph-recall-style-settings-canvas-and-tour-audit-failure.png',
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
          'stage685-post-stage684-graph-recall-style-settings-canvas-and-tour-audit-failure-reader.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
