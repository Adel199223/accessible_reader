import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  captureAddContentEntryEvidence,
  desktopViewport,
  launchBrowserContext,
} from './add_content_entry_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE709_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE709_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE709_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE709_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE709_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE709_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage709-add-content-entry-audit-failure-home.png'), { force: true })
await rm(path.join(outputDir, 'stage709-add-content-entry-audit-failure-reader.png'), { force: true })

const { browser, runtimeBrowser } = await launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
})

let homePage
let readerPage
let graphPage
let notebookPage
let studyPage
try {
  homePage = await browser.newPage({ viewport: desktopViewport })
  readerPage = await browser.newPage({ viewport: desktopViewport })
  graphPage = await browser.newPage({ viewport: desktopViewport })
  notebookPage = await browser.newPage({ viewport: desktopViewport })
  studyPage = await browser.newPage({ viewport: desktopViewport })

  const evidence = await captureAddContentEntryEvidence({
    baseUrl,
    directory: outputDir,
    graphPage,
    homePage,
    notebookPage,
    readerPage,
    stageLabel: 'Stage 709',
    stagePrefix: 'stage709',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage709-post-stage708-add-content-modal-recall-style-entry-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Add content should now read like one smoother global entry surface with clearer mode choice and stronger primary actions.',
          'Home and Reader should open the same Add content dialog without route churn or Notebook leakage.',
          'Graph, embedded Notebook, original Reader, and Study should remain stable while Add content resets.',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
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
  if (homePage) {
    await homePage
      .screenshot({
        path: path.join(outputDir, 'stage709-add-content-entry-audit-failure-home.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (readerPage) {
    await readerPage
      .screenshot({
        path: path.join(outputDir, 'stage709-add-content-entry-audit-failure-reader.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
