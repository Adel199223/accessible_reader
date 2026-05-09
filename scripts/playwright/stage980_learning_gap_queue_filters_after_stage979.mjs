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
const outputDir = process.env.RECALL_STAGE980_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE980_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE980_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE980_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE980_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE980_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage980-learning-gap-queue-filters-failure.png'), { force: true })

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
  harness = await createLearningGapQueueHarness({ baseUrl, stageLabel: 'Stage 980' })
  const captures = {}
  const metrics = {
    cleanupUtilityDryRunMatchedAfterStage980: null,
    homeLearningFilterControlsVisible: false,
    homeLearningFilterCoveredRowsOnly: false,
    homeLearningFilterStateComposition: false,
    homeLearningFilterStudyHandoffWorks: false,
    readingQueueCoveredFilterBeforeLimit: false,
    readingQueueLearningSummarySnapshot: null,
    readingQueueLearningSummaryCounts: false,
    sourceReviewHandoffStillWorks: false,
  }

  const coveredQueue = await fetchJson(
    `${baseUrl}/api/recall/library/reading-queue?collection_id=${encodeURIComponent(
      harness.collectionId,
    )}&learning_filter=covered&limit=1`,
  )
  metrics.readingQueueCoveredFilterBeforeLimit =
    coveredQueue.learning_filter === 'covered' &&
    coveredQueue.rows?.length === 1 &&
    coveredQueue.rows[0]?.id === harness.coveredDocument.id
  metrics.readingQueueLearningSummarySnapshot = coveredQueue.learning_summary
  metrics.readingQueueLearningSummaryCounts =
    coveredQueue.learning_summary?.needs_review_sources === 2 &&
    coveredQueue.learning_summary?.uncovered_sources === 2 &&
    coveredQueue.learning_summary?.covered_sources === 1 &&
    coveredQueue.learning_summary?.study_prompt_sources === 2

  const completedNeedsReviewQueue = await fetchJson(
    `${baseUrl}/api/recall/library/reading-queue?collection_id=${encodeURIComponent(
      harness.collectionId,
    )}&state=completed&learning_filter=needs_review&limit=10`,
  )
  if (completedNeedsReviewQueue.rows?.length !== 0) {
    throw new Error('Stage 980 expected completed + needs_review queue to be empty.')
  }

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()

  const readingQueue = page.getByRole('region', { name: 'Reading queue' })
  await readingQueue.waitFor({ state: 'visible', timeout: 20000 })
  await readingQueue.getByRole('button', { name: 'Show sources needing highlight review' }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await readingQueue.getByRole('button', { name: 'Show sources with uncovered highlights' }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await readingQueue.getByRole('button', { name: 'Show sources covered by Study' }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await readingQueue.getByRole('button', { name: 'Show sources with Study prompts' }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await readingQueue.getByText(harness.coveredDocument.title).waitFor({ state: 'visible', timeout: 20000 })
  await readingQueue.getByText(harness.gapDocument.title).waitFor({ state: 'visible', timeout: 20000 })
  metrics.homeLearningFilterControlsVisible = true
  captures.homeLearningFiltersAll = await captureLocatorScreenshot(
    page,
    readingQueue,
    outputDir,
    'stage980-home-reading-queue-learning-filters-all.png',
  )

  await readingQueue.getByRole('button', { name: 'Show sources covered by Study' }).click()
  await readingQueue.getByText(harness.coveredDocument.title).waitFor({ state: 'visible', timeout: 20000 })
  await hiddenReadingQueueRow(readingQueue, harness.gapDocument.title)
  metrics.homeLearningFilterCoveredRowsOnly = true
  captures.homeLearningFilterCovered = await captureLocatorScreenshot(
    page,
    readingQueue,
    outputDir,
    'stage980-home-reading-queue-learning-filter-covered.png',
  )

  await readingQueue.getByRole('button', { name: 'Show in-progress reading queue' }).click()
  await readingQueue.getByText(harness.coveredDocument.title).waitFor({ state: 'visible', timeout: 20000 })
  await hiddenReadingQueueRow(readingQueue, harness.gapDocument.title)
  metrics.homeLearningFilterStateComposition = true

  await readingQueue.getByRole('button', { name: `Open Study prompts for ${harness.coveredDocument.title}` }).click()
  await page.waitForURL((url) => url.pathname === '/recall' && url.searchParams.get('section') === 'study', {
    timeout: 20000,
  })
  metrics.homeLearningFilterStudyHandoffWorks = true
  captures.homeLearningFilterStudyHandoff = await captureViewportScreenshot(
    page,
    outputDir,
    'stage980-home-reading-queue-study-handoff.png',
  )

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()
  await readingQueue.waitFor({ state: 'visible', timeout: 20000 })
  await readingQueue.getByText(harness.coveredDocument.title).waitFor({ state: 'visible', timeout: 20000 })
  await readingQueue.getByRole('button', { name: `Review highlights for ${harness.coveredDocument.title}` }).click()
  const sourceLearningGaps = page.getByRole('region', { name: 'Source learning gaps', exact: true })
  await sourceLearningGaps.waitFor({ state: 'visible', timeout: 20000 })
  await sourceLearningGaps.getByText('1 needs review').waitFor({ state: 'visible', timeout: 20000 })
  await sourceLearningGaps.getByText('1 covered by Study').waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceReviewHandoffStillWorks = true
  captures.sourceReviewHandoff = await captureLocatorScreenshot(
    page,
    sourceLearningGaps,
    outputDir,
    'stage980-source-learning-gaps-after-queue-filter.png',
  )

  await cleanupLearningGapQueueHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage980 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage980: 0,
    homeLearningFilterControlsVisible: true,
    homeLearningFilterCoveredRowsOnly: true,
    homeLearningFilterStateComposition: true,
    homeLearningFilterStudyHandoffWorks: true,
    readingQueueCoveredFilterBeforeLimit: true,
    readingQueueLearningSummaryCounts: true,
    sourceReviewHandoffStillWorks: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(
        `Stage 980 expected ${metricName}: ${expected}, got ${metrics[metricName]}. Metrics: ${JSON.stringify(
          metrics,
        )}`,
      )
    }
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage980-learning-gap-queue-filters-after-stage979',
  }
  await writeFile(
    path.join(outputDir, 'stage980-learning-gap-queue-filters-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(page, outputDir, 'stage980-learning-gap-queue-filters-failure.png').catch(() => null)
  throw error
} finally {
  await cleanupLearningGapQueueHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 980 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

async function createLearningGapQueueHarness({ baseUrl, stageLabel }) {
  const timestamp = Date.now()
  const collectionId = `collection:stage980-learning-gap-queue-${timestamp}`
  const collectionName = `${stageLabel} Learning Gap Queue`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }

  const gapDocument = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} gap opener. ${stageLabel} uncovered gap target. ${stageLabel} gap closer.`,
    title: `${stageLabel} Uncovered Queue Gap ${timestamp}`,
  })
  const gapView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(gapDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  await putJson(`${baseUrl}/api/documents/${encodeURIComponent(gapDocument.id)}/progress`, {
    mode: 'reflowed',
    sentence_index: 1,
  })
  const gapNote = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(gapDocument.id)}/notes`, {
    anchor: buildNoteAnchor(gapDocument.id, gapView, { sentenceStart: 1, sentenceEnd: 1 }),
    body_text: `${stageLabel} uncovered queue gap ${timestamp}`,
  })

  const coveredDocument = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} covered opener. ${stageLabel} needs review target. ${stageLabel} covered by Study target.`,
    title: `${stageLabel} Covered Queue Source ${timestamp}`,
  })
  const coveredView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(coveredDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  await putJson(`${baseUrl}/api/documents/${encodeURIComponent(coveredDocument.id)}/progress`, {
    mode: 'reflowed',
    sentence_index: 1,
  })
  const reviewNote = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(coveredDocument.id)}/notes`, {
    anchor: buildNoteAnchor(coveredDocument.id, coveredView, { sentenceStart: 1, sentenceEnd: 1 }),
    body_text: `${stageLabel} queue filter review target ${timestamp}`,
  })
  const coveredNote = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(coveredDocument.id)}/notes`, {
    anchor: buildNoteAnchor(coveredDocument.id, coveredView, { sentenceStart: 2, sentenceEnd: 2 }),
    body_text: `${stageLabel} queue filter Study covered target ${timestamp}`,
  })
  const coveredCard = await postJson(
    `${baseUrl}/api/recall/notes/${encodeURIComponent(coveredNote.id)}/promote/study-card`,
    {
      answer: `${stageLabel} covered queue answer`,
      prompt: `${stageLabel} covered queue prompt?`,
    },
  )

  const now = new Date().toISOString()
  await putJson(`${baseUrl}/api/recall/library/settings`, {
    custom_collections: [
      ...(originalLibrarySettings.custom_collections ?? []),
      {
        created_at: now,
        document_ids: [gapDocument.id, coveredDocument.id],
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
    coveredDocument,
    coveredNote,
    gapDocument,
    gapNote,
    originalLibrarySettings,
    reviewNote,
  }
}

async function cleanupLearningGapQueueHarness({ baseUrl, harness }) {
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
    [harness.gapNote.id, harness.reviewNote.id, harness.coveredNote.id].map((noteId) =>
      fetch(`${baseUrl}/api/recall/notes/${encodeURIComponent(noteId)}`, { method: 'DELETE' }).catch(() => null),
    ),
  )
  await Promise.all(
    [harness.gapDocument.id, harness.coveredDocument.id].map((documentId) =>
      fetch(`${baseUrl}/api/documents/${encodeURIComponent(documentId)}`, { method: 'DELETE' }).catch(() => null),
    ),
  )
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

async function hiddenReadingQueueRow(readingQueue, title) {
  await readingQueue
    .locator('.recall-reading-queue-learning-gap-row-stage978')
    .filter({ hasText: title })
    .waitFor({ state: 'hidden', timeout: 20000 })
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
