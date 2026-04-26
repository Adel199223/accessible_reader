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
const outputDir = process.env.RECALL_STAGE880_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE880_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE880_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE880_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE880_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE880_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage880-add-content-capture-gateway-failure-home.png'), { force: true })
await rm(path.join(outputDir, 'stage880-add-content-capture-gateway-failure-reader.png'), { force: true })

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
    stageLabel: 'Stage 880',
    stagePrefix: 'stage880',
    studyPage,
  })

  await writeFile(
    path.join(outputDir, 'stage880-add-content-capture-gateway-single-surface-compaction-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: evidence.captures,
        desktopViewport,
        headless,
        implementationFocus: [
          'Add content should open as one compact capture gateway rather than a stacked dashboard.',
          'Support guidance should be inline and mode-owned instead of a separate side rail.',
          'Paste, Web, and File capture behavior stays unchanged while Home, Reader, Graph, Notebook, and Study remain stable.',
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
        path: path.join(outputDir, 'stage880-add-content-capture-gateway-failure-home.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (readerPage) {
    await readerPage
      .screenshot({
        path: path.join(outputDir, 'stage880-add-content-capture-gateway-failure-reader.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}
