import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureHomePersonalNoteLaneEvidence,
  captureNotebookWorkbenchEvidence,
  captureSourceNotePromotionEvidence,
  desktopViewport,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE896_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE896_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE896_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE896_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE896_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE896_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage896-source-note-promotion-failure-promotion.png',
  'stage896-source-note-promotion-failure-home.png',
  'stage896-source-note-promotion-failure-sentence.png',
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

let promotionPage
let homePage
let sentencePage
try {
  promotionPage = await browser.newPage({ viewport: desktopViewport })
  homePage = await browser.newPage({ viewport: desktopViewport })
  sentencePage = await browser.newPage({ viewport: desktopViewport })

  const promotionEvidence = await captureSourceNotePromotionEvidence({
    baseUrl,
    directory: outputDir,
    page: promotionPage,
    stageLabel: 'Stage 896 source-note promotion semantics',
    stagePrefix: 'stage896',
  })
  const homeEvidence = await captureHomePersonalNoteLaneEvidence({
    baseUrl,
    directory: outputDir,
    page: homePage,
    stageLabel: 'Stage 896 Home personal-note regression',
    stagePrefix: 'stage896-home',
  })
  const sentenceEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: sentencePage,
    selectSentenceAnchor: true,
    stageLabel: 'Stage 896 sentence-anchor Notebook regression',
    stagePrefix: 'stage896-sentence',
  })

  await writeFile(
    path.join(outputDir, 'stage896-source-note-promotion-semantics-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Source-note Graph promotion defaults should use note body and source context.',
          'Source-note Study promotion should use the source-note prompt, body answer, and unanchored Reader handoff.',
          'Home personal-note and sentence-anchor Notebook regressions should remain stable.',
        ],
        baseUrl,
        captures: {
          ...promotionEvidence.captures,
          ...homeEvidence.captures,
          ...sentenceEvidence.captures,
        },
        desktopViewport,
        headless,
        metrics: {
          ...sentenceEvidence.metrics,
          ...homeEvidence.metrics,
          ...promotionEvidence.metrics,
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
    captureFailure(promotionPage, outputDir, 'stage896-source-note-promotion-failure-promotion.png'),
    captureFailure(homePage, outputDir, 'stage896-source-note-promotion-failure-home.png'),
    captureFailure(sentencePage, outputDir, 'stage896-source-note-promotion-failure-sentence.png'),
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
