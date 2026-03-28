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
const outputDir = process.env.RECALL_STAGE708_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE708_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE708_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE708_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE708_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE708_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage708-add-content-entry-failure-home.png'), { force: true })
await rm(path.join(outputDir, 'stage708-add-content-entry-failure-reader.png'), { force: true })

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
    stageLabel: 'Stage 708',
    stagePrefix: 'stage708',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage708-add-content-modal-recall-style-entry-reset-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        headless,
        implementationFocus: [
          'Add content should feel like a deliberate Recall-style entry surface instead of a generic stacked form.',
          'Home and Reader should both open the same global Add content dialog without route churn.',
          'Notebook stays separate from Add content while Graph, Study, and original Reader remain stable.',
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
  if (homePage) {
    await homePage
      .screenshot({
        path: path.join(outputDir, 'stage708-add-content-entry-failure-home.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (readerPage) {
    await readerPage
      .screenshot({
        path: path.join(outputDir, 'stage708-add-content-entry-failure-reader.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
