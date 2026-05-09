import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import {
  captureLocatorScreenshot,
  captureViewportScreenshot,
  launchBrowserContext,
} from './home_rendered_preview_quality_shared.mjs'
import { desktopViewport } from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE978_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE978_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE978_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE978_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE978_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE978_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage978-source-learning-gaps-failure.png'), { force: true })

const { browser, runtimeBrowser } = await launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
})

const page = await browser.newPage({ viewport: desktopViewport })
let harness = null
try {
  harness = await createSourceLearningGapsHarness({ baseUrl, stageLabel: 'Stage 978' })
  const captures = {}
  const metrics = {
    cleanupUtilityDryRunMatchedAfterStage978: null,
    homeReadingQueueLearningGapsVisible: false,
    homeReadingQueueReviewHighlightsHandoff: false,
    homeReadingQueueStudyPromptHandoff: false,
    sourceLearningGapsStudyCoverageDerived: false,
    sourceOverviewLearningGapSummaryVisible: false,
    sourceOverviewSummaryUpdatesAfterDismissRestore: false,
  }

  const queue = await fetchJson(
    `${baseUrl}/api/recall/library/reading-queue?collection_id=${encodeURIComponent(harness.collectionId)}&limit=10`,
  )
  const queueRow = queue.rows?.find((row) => row.id === harness.document.id)
  if (!queueRow) {
    throw new Error(`Stage 978 queue row missing for ${harness.document.id}`)
  }
  const counts = queueRow.highlight_review_counts
  metrics.sourceLearningGapsStudyCoverageDerived =
    counts?.total === 2 &&
    counts?.needs_review === 1 &&
    counts?.covered === 1 &&
    counts?.reviewed === 1 &&
    counts?.dismissed === 0

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()

  const readingQueue = page.getByRole('region', { name: 'Reading queue' })
  await readingQueue.waitFor({ state: 'visible', timeout: 20000 })
  await readingQueue.getByText(harness.document.title).waitFor({ state: 'visible', timeout: 20000 })
  await readingQueue.getByText('1 needs review').first().waitFor({ state: 'visible', timeout: 20000 })
  await readingQueue.getByText('1 covered by Study').first().waitFor({ state: 'visible', timeout: 20000 })
  await readingQueue
    .getByRole('button', { name: `Review highlights for ${harness.document.title}` })
    .waitFor({ state: 'visible', timeout: 20000 })
  await readingQueue
    .getByRole('button', { name: `Open Study prompts for ${harness.document.title}` })
    .waitFor({ state: 'visible', timeout: 20000 })
  metrics.homeReadingQueueLearningGapsVisible = true
  captures.homeReadingQueueLearningGaps = await captureLocatorScreenshot(
    page,
    readingQueue,
    outputDir,
    'stage978-home-reading-queue-learning-gaps.png',
  )

  await readingQueue.getByRole('button', { name: `Open Study prompts for ${harness.document.title}` }).click()
  await page.waitForURL((url) => url.pathname === '/recall' && url.searchParams.get('section') === 'study', {
    timeout: 20000,
  })
  metrics.homeReadingQueueStudyPromptHandoff = true
  captures.sourceStudyPromptHandoff = await captureViewportScreenshot(
    page,
    outputDir,
    'stage978-source-study-prompt-handoff.png',
  )

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()
  await readingQueue.waitFor({ state: 'visible', timeout: 20000 })
  await readingQueue.getByText(harness.document.title).waitFor({ state: 'visible', timeout: 20000 })
  await readingQueue.getByRole('button', { name: `Review highlights for ${harness.document.title}` }).click()
  const sourceLearningGaps = page.getByRole('region', { name: 'Source learning gaps', exact: true })
  await sourceLearningGaps.waitFor({ state: 'visible', timeout: 20000 })
  await sourceLearningGaps.getByText('1 needs review').waitFor({ state: 'visible', timeout: 20000 })
  await sourceLearningGaps.getByText('1 covered by Study').waitFor({ state: 'visible', timeout: 20000 })
  const sourceInbox = page.getByRole('region', { name: 'Source highlight review' })
  await sourceInbox.waitFor({ state: 'visible', timeout: 20000 })
  await sourceInbox.getByText(harness.reviewNoteBody).waitFor({ state: 'visible', timeout: 20000 })
  metrics.homeReadingQueueReviewHighlightsHandoff = true
  metrics.sourceOverviewLearningGapSummaryVisible = true
  captures.sourceOverviewLearningGaps = await captureLocatorScreenshot(
    page,
    sourceLearningGaps,
    outputDir,
    'stage978-source-overview-learning-gaps.png',
  )

  const sourceReviewRow = sourceInbox
    .locator('.recall-highlight-review-row-stage976')
    .filter({ hasText: harness.reviewNoteBody })
    .first()
  await sourceReviewRow.getByRole('button', { name: 'Dismiss', exact: true }).click()
  await sourceLearningGaps.getByText('1 dismissed').waitFor({ state: 'visible', timeout: 20000 })
  await sourceInbox.getByRole('button', { name: 'Show dismissed highlights' }).click()
  await sourceReviewRow.getByRole('button', { name: 'Restore' }).click()
  await sourceInbox.getByRole('button', { name: 'Show highlights needing review' }).click()
  await sourceInbox.getByText(harness.reviewNoteBody).waitFor({ state: 'visible', timeout: 20000 })
  await sourceLearningGaps.getByText('1 needs review').waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceOverviewSummaryUpdatesAfterDismissRestore = true

  await cleanupSourceLearningGapsHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage978 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage978: 0,
    homeReadingQueueLearningGapsVisible: true,
    homeReadingQueueReviewHighlightsHandoff: true,
    homeReadingQueueStudyPromptHandoff: true,
    sourceLearningGapsStudyCoverageDerived: true,
    sourceOverviewLearningGapSummaryVisible: true,
    sourceOverviewSummaryUpdatesAfterDismissRestore: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 978 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage978-source-learning-gaps-and-next-actions-after-stage977',
  }
  await writeFile(
    path.join(outputDir, 'stage978-source-learning-gaps-and-next-actions-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(page, outputDir, 'stage978-source-learning-gaps-failure.png').catch(() => null)
  throw error
} finally {
  await cleanupSourceLearningGapsHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 978 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

async function createSourceLearningGapsHarness({ baseUrl, stageLabel }) {
  const timestamp = Date.now()
  const collectionId = `collection:stage978-source-gaps-${timestamp}`
  const collectionName = `${stageLabel} Source Learning Gaps`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }
  const document = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} opener. ${stageLabel} review target sentence. ${stageLabel} covered target sentence.`,
    title: `${stageLabel} Source Learning Gaps ${timestamp}`,
  })
  const view = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(document.id)}/view?mode=reflowed&detail_level=default`,
  )
  await putJson(`${baseUrl}/api/documents/${encodeURIComponent(document.id)}/progress`, {
    mode: 'reflowed',
    sentence_index: 1,
  })
  const reviewNoteBody = `${stageLabel} reading queue gap needs review ${timestamp}`
  const coveredNoteBody = `${stageLabel} reading queue gap has Study coverage ${timestamp}`
  const reviewNote = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(document.id)}/notes`, {
    anchor: buildNoteAnchor(document.id, view, { sentenceStart: 1, sentenceEnd: 1 }),
    body_text: reviewNoteBody,
  })
  const coveredNote = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(document.id)}/notes`, {
    anchor: buildNoteAnchor(document.id, view, { sentenceStart: 2, sentenceEnd: 2 }),
    body_text: coveredNoteBody,
  })
  const coveredCard = await postJson(
    `${baseUrl}/api/recall/notes/${encodeURIComponent(coveredNote.id)}/promote/study-card`,
    {
      answer: `${stageLabel} covered source answer`,
      prompt: `${stageLabel} covered source prompt?`,
    },
  )
  const now = new Date().toISOString()
  await putJson(`${baseUrl}/api/recall/library/settings`, {
    custom_collections: [
      ...(originalLibrarySettings.custom_collections ?? []),
      {
        created_at: now,
        document_ids: [document.id],
        id: collectionId,
        name: collectionName,
        origin: 'manual',
        parent_id: null,
        sort_index: 0,
        updated_at: now,
      },
    ],
  })
  return {
    collectionId,
    collectionName,
    coveredCard,
    coveredNote,
    document,
    originalLibrarySettings,
    reviewNote,
    reviewNoteBody,
  }
}

async function cleanupSourceLearningGapsHarness({ baseUrl, harness }) {
  if (!harness) {
    return
  }
  await fetch(`${baseUrl}/api/recall/library/settings`, {
    body: JSON.stringify(harness.originalLibrarySettings),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  }).catch(() => null)
  await fetch(`${baseUrl}/api/recall/study/cards/${encodeURIComponent(harness.coveredCard.id)}`, {
    method: 'DELETE',
  }).catch(() => null)
  await Promise.all(
    [harness.reviewNote.id, harness.coveredNote.id].map((noteId) =>
      fetch(`${baseUrl}/api/recall/notes/${encodeURIComponent(noteId)}`, { method: 'DELETE' }).catch(() => null),
    ),
  )
  await fetch(`${baseUrl}/api/documents/${encodeURIComponent(harness.document.id)}`, { method: 'DELETE' }).catch(() => null)
}

async function revealHomeCollectionsRail(page) {
  const showOrganizerButton = page.getByRole('button', { name: /Show organizer/ }).first()
  if (await showOrganizerButton.isVisible().catch(() => false)) {
    await showOrganizerButton.click()
  }
  const organizerOptionsButton = page.getByRole('button', { name: 'Organizer options' }).first()
  await organizerOptionsButton.waitFor({ state: 'visible', timeout: 15000 })
  await organizerOptionsButton.click()
  const lensGroup = page.getByRole('group', { name: 'Organizer lens' })
  await lensGroup.getByRole('button', { name: 'Collections' }).click()
  await page.keyboard.press('Escape').catch(() => undefined)
}

function buildNoteAnchor(documentId, viewPayload, { sentenceStart, sentenceEnd }) {
  let globalOffset = 0
  let selectedBlock = null
  let localSentenceStart = 0
  let localSentenceEnd = 0
  let selectedSentenceTexts = []
  for (const block of viewPayload.blocks) {
    const sentenceTexts = block.metadata?.sentence_texts ?? [block.text]
    const blockGlobalEnd = globalOffset + sentenceTexts.length - 1
    if (sentenceStart <= blockGlobalEnd && sentenceEnd >= globalOffset) {
      selectedBlock = block
      selectedSentenceTexts = sentenceTexts
      localSentenceStart = Math.max(sentenceStart - globalOffset, 0)
      localSentenceEnd = Math.min(sentenceEnd - globalOffset, sentenceTexts.length - 1)
      break
    }
    globalOffset += sentenceTexts.length
  }
  if (!selectedBlock) {
    throw new Error(`Unable to build note anchor for sentence range ${sentenceStart}-${sentenceEnd}.`)
  }
  const selectedText = selectedSentenceTexts.slice(localSentenceStart, localSentenceEnd + 1).join(' ').trim()
  const excerptStart = Math.max(localSentenceStart - 1, 0)
  const excerptEnd = Math.min(localSentenceEnd + 1, selectedSentenceTexts.length - 1)
  const excerptText = selectedSentenceTexts.slice(excerptStart, excerptEnd + 1).join(' ').trim()
  return {
    source_document_id: documentId,
    variant_id: viewPayload.variant_metadata.variant_id,
    block_id: selectedBlock.id,
    sentence_start: localSentenceStart,
    sentence_end: localSentenceEnd,
    global_sentence_start: sentenceStart,
    global_sentence_end: sentenceEnd,
    anchor_text: selectedText,
    excerpt_text: excerptText || selectedText,
  }
}

async function fetchJson(url, init) {
  const response = await fetch(url, init)
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Request failed ${response.status} ${response.statusText} for ${url}: ${text}`)
  }
  return response.json()
}

async function postJson(url, body) {
  return fetchJson(url, {
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  })
}

async function putJson(url, body) {
  return fetchJson(url, {
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  })
}

function readCliOption(name) {
  const prefix = `--${name}=`
  const match = process.argv.slice(2).find((argument) => argument.startsWith(prefix))
  return match ? match.slice(prefix.length) : null
}
