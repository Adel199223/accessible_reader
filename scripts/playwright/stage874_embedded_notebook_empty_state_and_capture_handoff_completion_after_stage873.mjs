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
  process.env.RECALL_STAGE874_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE874_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE874_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE874_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE874_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE874_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage874-embedded-notebook-empty-state-and-capture-handoff-failure-workbench.png',
  'stage874-embedded-notebook-empty-state-and-capture-handoff-failure-empty.png',
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
    stageLabel: 'Stage 874 selected-note regression',
    stagePrefix: 'stage874-selected',
  })
  const emptyEvidence = await captureNotebookEmptyStateEvidence({
    baseUrl,
    directory: outputDir,
    page: emptyPage,
    stageLabel: 'Stage 874',
    stagePrefix: 'stage874',
  })

  await writeFile(
    path.join(outputDir, 'stage874-embedded-notebook-empty-state-and-capture-handoff-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'The Stage 874 live run must prove embedded Notebook no-active/search-empty states are compact workbench-owned.',
          'The old Notebook hero and guidance-card empty dashboard should stay retired.',
          'Capture in Reader should open the selected source in Reader without creating Notebook data directly.',
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
    captureFailure(workbenchPage, outputDir, 'stage874-embedded-notebook-empty-state-and-capture-handoff-failure-workbench.png'),
    captureFailure(emptyPage, outputDir, 'stage874-embedded-notebook-empty-state-and-capture-handoff-failure-empty.png'),
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
