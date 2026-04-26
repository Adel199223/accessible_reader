import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureNotebookEmptyStateEvidence,
  captureNotebookWorkbenchEvidence,
  desktopViewport,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE888_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE888_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE888_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE888_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE888_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE888_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage888-embedded-notebook-empty-state-lead-and-browse-rail-failure-workbench.png',
  'stage888-embedded-notebook-empty-state-lead-and-browse-rail-failure-empty.png',
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

let workbenchPage
let emptyPage
try {
  workbenchPage = await browser.newPage({ viewport: desktopViewport })
  emptyPage = await browser.newPage({ viewport: desktopViewport })

  const workbenchEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: workbenchPage,
    stageLabel: 'Stage 888 selected-note regression',
    stagePrefix: 'stage888-selected',
  })
  const emptyEvidence = await captureNotebookEmptyStateEvidence({
    baseUrl,
    directory: outputDir,
    page: emptyPage,
    stageLabel: 'Stage 888 empty-state lead ownership',
    stagePrefix: 'stage888',
  })

  await writeFile(
    path.join(outputDir, 'stage888-embedded-notebook-empty-state-lead-and-browse-rail-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'No-active and search-empty Notebook states should render directly under the command row without the old Note detail intro.',
          'The Browse notebook rail should read as a compact list-first rail with inline timestamp metadata and flat active-row state.',
          'Selected-note Stage 887 fused workbench behavior should remain intact.',
        ],
        baseUrl,
        captures: {
          ...workbenchEvidence.captures,
          ...emptyEvidence.captures,
        },
        desktopViewport,
        headless,
        metrics: {
          ...workbenchEvidence.metrics,
          ...emptyEvidence.metrics,
        },
        runtimeBrowser,
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  await Promise.all([
    captureFailure(workbenchPage, outputDir, 'stage888-embedded-notebook-empty-state-lead-and-browse-rail-failure-workbench.png'),
    captureFailure(emptyPage, outputDir, 'stage888-embedded-notebook-empty-state-lead-and-browse-rail-failure-empty.png'),
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

