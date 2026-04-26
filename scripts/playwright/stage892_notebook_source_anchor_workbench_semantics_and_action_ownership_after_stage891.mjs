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
  process.env.RECALL_STAGE892_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE892_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE892_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE892_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE892_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE892_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage892-notebook-source-anchor-semantics-failure-source.png',
  'stage892-notebook-source-anchor-semantics-failure-sentence.png',
  'stage892-notebook-source-anchor-semantics-failure-empty.png',
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

let sourcePage
let sentencePage
let emptyPage
try {
  sourcePage = await browser.newPage({ viewport: desktopViewport })
  sentencePage = await browser.newPage({ viewport: desktopViewport })
  emptyPage = await browser.newPage({ viewport: desktopViewport })

  const sourceEvidence = await captureNotebookNewNoteDraftEvidence({
    baseUrl,
    directory: outputDir,
    page: sourcePage,
    stageLabel: 'Stage 892 source-anchor Notebook semantics',
    stagePrefix: 'stage892-source',
    verifySourceReaderHandoff: true,
  })
  const sentenceEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: sentencePage,
    selectSentenceAnchor: true,
    stageLabel: 'Stage 892 sentence-anchor Notebook regression',
    stagePrefix: 'stage892-sentence',
  })
  const emptyEvidence = await captureNotebookEmptyStateEvidence({
    baseUrl,
    directory: outputDir,
    page: emptyPage,
    stageLabel: 'Stage 892 empty-state regression',
    stagePrefix: 'stage892-empty',
  })

  const notebookStage889EmptyStatesStable =
    emptyEvidence.metrics.notebookEmptyWorkbenchOwned &&
    !emptyEvidence.metrics.notebookEmptyDetailIntroVisible &&
    emptyEvidence.metrics.notebookSearchEmptyWorkbenchOwned &&
    !emptyEvidence.metrics.notebookSearchEmptyDetailIntroVisible &&
    emptyEvidence.metrics.notebookCaptureInReaderNavigates

  if (!notebookStage889EmptyStatesStable) {
    throw new Error('Stage 892 expected the Stage 889 Notebook empty/search-empty states to remain stable.')
  }

  await writeFile(
    path.join(outputDir, 'stage892-notebook-source-anchor-workbench-semantics-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Source-attached notes should render source context, not Highlighted passage chrome.',
          'Source-note Open in Reader should omit sentence anchors.',
          'Sentence-anchored notes should keep the existing highlighted-passage workbench.',
          'Stage 890/891 New note and Stage 889 empty/search Notebook baselines should remain intact.',
        ],
        baseUrl,
        captures: {
          ...sourceEvidence.captures,
          ...sentenceEvidence.captures,
          ...emptyEvidence.captures,
        },
        desktopViewport,
        headless,
        metrics: {
          ...sentenceEvidence.metrics,
          ...sourceEvidence.metrics,
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
    captureFailure(sourcePage, outputDir, 'stage892-notebook-source-anchor-semantics-failure-source.png'),
    captureFailure(sentencePage, outputDir, 'stage892-notebook-source-anchor-semantics-failure-sentence.png'),
    captureFailure(emptyPage, outputDir, 'stage892-notebook-source-anchor-semantics-failure-empty.png'),
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
