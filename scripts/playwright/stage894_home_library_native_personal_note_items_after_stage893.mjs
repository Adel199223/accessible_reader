import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launchBrowserContext } from './home_rendered_preview_quality_shared.mjs'
import {
  captureHomePersonalNoteLaneEvidence,
  captureNotebookWorkbenchEvidence,
  desktopViewport,
} from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE894_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE894_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE894_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE894_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE894_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE894_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage894-home-library-native-personal-note-items-failure-home.png',
  'stage894-home-library-native-personal-note-items-failure-sentence.png',
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

let homePage
let sentencePage
try {
  homePage = await browser.newPage({ viewport: desktopViewport })
  sentencePage = await browser.newPage({ viewport: desktopViewport })

  const homeEvidence = await captureHomePersonalNoteLaneEvidence({
    baseUrl,
    directory: outputDir,
    page: homePage,
    stageLabel: 'Stage 894 Home library-native personal note items',
    stagePrefix: 'stage894',
  })
  const sentenceEvidence = await captureNotebookWorkbenchEvidence({
    baseUrl,
    directory: outputDir,
    page: sentencePage,
    selectSentenceAnchor: true,
    stageLabel: 'Stage 894 sentence-anchor Notebook regression',
    stagePrefix: 'stage894-sentence',
  })

  await writeFile(
    path.join(outputDir, 'stage894-home-library-native-personal-note-items-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Source-attached Notebook notes should appear as compact Personal notes in Home.',
          'Home note rows and Home Matches should use note body/source context instead of synthetic source anchors.',
          'Home note rows should reopen embedded Notebook, while workspace search source-note Reader handoff stays unanchored.',
          'Sentence-anchored Notebook notes should keep the Highlighted passage workbench.',
        ],
        baseUrl,
        captures: {
          ...homeEvidence.captures,
          ...sentenceEvidence.captures,
        },
        desktopViewport,
        headless,
        metrics: {
          ...sentenceEvidence.metrics,
          ...homeEvidence.metrics,
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
    captureFailure(homePage, outputDir, 'stage894-home-library-native-personal-note-items-failure-home.png'),
    captureFailure(sentencePage, outputDir, 'stage894-home-library-native-personal-note-items-failure-sentence.png'),
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
