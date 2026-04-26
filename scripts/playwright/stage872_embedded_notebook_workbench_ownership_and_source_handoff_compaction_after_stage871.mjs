import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureNotebookWorkbenchEvidence,
  desktopViewport,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE872_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE872_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE872_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE872_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE872_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE872_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage872-embedded-notebook-workbench-failure.png'), { force: true })

const { browser, runtimeBrowser } = await launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
})

let notebookPage
try {
  notebookPage = await browser.newPage({ viewport: desktopViewport })

  const evidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: notebookPage,
    stageLabel: 'Stage 872',
    stagePrefix: 'stage872',
  })

  await writeFile(
    path.join(outputDir, 'stage872-embedded-notebook-workbench-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 872 live run must prove embedded Notebook has retired the old top hero, browse-glance panel, and detached detail dock cards.',
          'Selected-note editing, source handoff, and promotion should be owned by one fused workbench surface.',
        ],
        baseUrl,
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
  await captureFailure(notebookPage, outputDir, 'stage872-embedded-notebook-workbench-failure.png')
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
