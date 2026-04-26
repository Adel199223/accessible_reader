import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureNotebookEmptyStateEvidence,
  captureNotebookNewNoteDraftEvidence,
  captureNotebookWorkbenchEvidence,
  desktopViewport,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE890_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE890_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE890_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE890_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE890_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE890_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage890-notebook-new-note-entry-failure-draft.png',
  'stage890-notebook-new-note-entry-failure-workbench.png',
  'stage890-notebook-new-note-entry-failure-empty.png',
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

let draftPage
let workbenchPage
let emptyPage
try {
  draftPage = await browser.newPage({ viewport: desktopViewport })
  workbenchPage = await browser.newPage({ viewport: desktopViewport })
  emptyPage = await browser.newPage({ viewport: desktopViewport })

  const draftEvidence = await captureNotebookNewNoteDraftEvidence({
    baseUrl,
    directory: outputDir,
    page: draftPage,
    stageLabel: 'Stage 890 source-attached Notebook draft',
    stagePrefix: 'stage890',
  })
  const workbenchEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: workbenchPage,
    stageLabel: 'Stage 890 selected-note regression',
    stagePrefix: 'stage890-selected',
  })
  const emptyEvidence = await captureNotebookEmptyStateEvidence({
    baseUrl,
    directory: outputDir,
    page: emptyPage,
    stageLabel: 'Stage 890 empty-state regression',
    stagePrefix: 'stage890-empty',
  })

  const notebookStage889EmptyStatesStable =
    emptyEvidence.metrics.notebookEmptyWorkbenchOwned &&
    !emptyEvidence.metrics.notebookEmptyDetailIntroVisible &&
    emptyEvidence.metrics.notebookSearchEmptyWorkbenchOwned &&
    !emptyEvidence.metrics.notebookSearchEmptyDetailIntroVisible &&
    emptyEvidence.metrics.notebookCaptureInReaderNavigates

  if (!notebookStage889EmptyStatesStable) {
    throw new Error('Stage 890 expected the Stage 889 Notebook empty/search-empty states to remain stable.')
  }

  await writeFile(
    path.join(outputDir, 'stage890-notebook-new-note-entry-and-source-attached-draft-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Home New note should open embedded Notebook directly into a source-attached draft workbench.',
          'Saving the draft should create and select a source-level note without replacing Reader-led sentence capture.',
          'Stage 889 selected-note, no-active, search-empty, and browse-rail Notebook baselines should remain intact.',
        ],
        baseUrl,
        captures: {
          ...draftEvidence.captures,
          ...workbenchEvidence.captures,
          ...emptyEvidence.captures,
        },
        desktopViewport,
        headless,
        metrics: {
          ...draftEvidence.metrics,
          ...workbenchEvidence.metrics,
          ...emptyEvidence.metrics,
          notebookStage889EmptyStatesStable,
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
    captureFailure(draftPage, outputDir, 'stage890-notebook-new-note-entry-failure-draft.png'),
    captureFailure(workbenchPage, outputDir, 'stage890-notebook-new-note-entry-failure-workbench.png'),
    captureFailure(emptyPage, outputDir, 'stage890-notebook-new-note-entry-failure-empty.png'),
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
