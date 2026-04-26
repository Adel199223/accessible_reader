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
  process.env.RECALL_STAGE886_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE886_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE886_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE886_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE886_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE886_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage886-embedded-notebook-selected-note-workbench-failure.png'), { force: true })

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
    stageLabel: 'Stage 886',
    stagePrefix: 'stage886',
  })

  await writeFile(
    path.join(outputDir, 'stage886-embedded-notebook-selected-note-workbench-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 886 live run must prove selected-note Notebook uses one fused top band instead of a command row plus Note detail intro.',
          'Passage, editor, Source handoff, and Promote note should read as one compact note-owned workbench surface.',
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
  await captureFailure(notebookPage, outputDir, 'stage886-embedded-notebook-selected-note-workbench-failure.png')
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
