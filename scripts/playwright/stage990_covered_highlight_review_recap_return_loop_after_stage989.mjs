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
const outputDir = process.env.RECALL_STAGE990_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE990_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE990_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE990_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE990_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE990_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage990-highlight-review-recap-return-failure.png'), { force: true })

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
  harness = await createHighlightReviewRecapHarness({ baseUrl, stageLabel: 'Stage 990' })
  const captures = {}
  const metrics = {
    cleanupUtilityDryRunMatchedAfterStage990: null,
    highlightReviewRecapActionsVisible: false,
    highlightReviewRecapReturnsToCollectionReviewedInbox: false,
    highlightReviewRecapReturnsToSourceReviewedInbox: false,
    highlightReviewSessionCompletionRefreshesCoveredQueue: false,
    highlightReviewSessionOriginSnapshotPreserved: false,
    highlightReviewSessionRecapSummarizesReviewedHighlights: false,
    highlightReviewSessionRecapVisible: false,
    readerGeneratedOutputsFrozen: false,
    sourceHighlightReviewRecapSummarizesReviewedHighlights: false,
  }

  const readerView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(harness.homeDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  metrics.readerGeneratedOutputsFrozen =
    readerView?.mode === 'reflowed' && JSON.stringify(readerView).includes('Stage 990 home practice target')

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()

  const collectionReview = page.getByRole('region', { name: 'Collection highlight review', exact: true })
  await collectionReview.waitFor({ state: 'visible', timeout: 20000 })
  await collectionReview.getByRole('button', { name: 'Show Study-covered highlights' }).click()
  await collectionReview.getByText(harness.homeNote.body_text).waitFor({ state: 'visible', timeout: 20000 })
  captures.collectionCoveredHighlightBeforeReview = await captureLocatorScreenshot(
    page,
    collectionReview,
    outputDir,
    'stage990-collection-covered-highlight-before-review.png',
  )

  const homeSessionRequestPromise = page.waitForRequest(
    (request) => request.method() === 'POST' && request.url().includes('/api/recall/study/sessions'),
    { timeout: 20000 },
  )
  await collectionReview.getByRole('button', { name: 'Review covered highlights' }).click()
  const homeSessionPayload = await homeSessionRequestPromise.then((request) => request.postDataJSON())
  metrics.highlightReviewSessionOriginSnapshotPreserved =
    homeSessionPayload.card_ids?.length === 1 &&
    homeSessionPayload.card_ids[0] === harness.homeCard.id &&
    homeSessionPayload.filter_snapshot?.launch_intent === 'highlight-covered-review' &&
    homeSessionPayload.filter_snapshot?.collection_id === harness.collectionId

  await page.waitForURL((url) => url.pathname === '/recall' && url.searchParams.get('section') === 'study', {
    timeout: 20000,
  })
  await page.locator('[data-study-review-session-progress-stage952]').waitFor({ state: 'visible', timeout: 20000 })
  await page.getByText(harness.homeCard.prompt).first().waitFor({ state: 'visible', timeout: 20000 })
  await completeVisibleStudyCard(page, harness.homeCard)

  const homeRecap = page.locator('[data-study-highlight-review-recap-stage990="true"]').first()
  await homeRecap.waitFor({ state: 'visible', timeout: 20000 })
  await homeRecap.getByText('Covered highlights practiced').waitFor({ state: 'visible', timeout: 20000 })
  await homeRecap.getByText('1 highlight reviewed').waitFor({ state: 'visible', timeout: 20000 })
  metrics.highlightReviewSessionRecapVisible = true
  metrics.highlightReviewSessionRecapSummarizesReviewedHighlights = true
  metrics.highlightReviewRecapActionsVisible =
    (await homeRecap.getByRole('button', { name: 'Back to collection highlights' }).isVisible()) &&
    (await homeRecap.getByRole('button', { name: 'Study questions' }).isVisible())
  captures.collectionStudyRecap = await captureLocatorScreenshot(
    page,
    homeRecap,
    outputDir,
    'stage990-collection-study-highlight-review-recap.png',
  )

  await homeRecap.getByRole('button', { name: 'Back to collection highlights' }).click()
  await collectionReview.waitFor({ state: 'visible', timeout: 20000 })
  await collectionReview.getByText(harness.homeNote.body_text).waitFor({ state: 'visible', timeout: 20000 })
  const reviewedCollectionButton = collectionReview.getByRole('button', { name: 'Show reviewed highlights' })
  metrics.highlightReviewRecapReturnsToCollectionReviewedInbox =
    (await reviewedCollectionButton.evaluate((element) => element.classList.contains('primary-button'))) &&
    (await collectionReview.getByText(harness.homeNote.body_text).isVisible())
  captures.collectionReviewedHighlightAfterReturn = await captureLocatorScreenshot(
    page,
    collectionReview,
    outputDir,
    'stage990-collection-reviewed-highlight-after-return.png',
  )

  const homeCoveredAfter = await fetchHighlightInbox({
    collectionId: harness.collectionId,
    state: 'covered',
  })
  metrics.highlightReviewSessionCompletionRefreshesCoveredQueue =
    homeCoveredAfter.summary?.reviewable_covered_items === 0 &&
    !(homeCoveredAfter.reviewable_study_card_ids ?? []).includes(harness.homeCard.id)

  harness.sourceHarness = await addSourceHighlightReviewRecapDocument({
    baseUrl,
    collectionId: harness.collectionId,
    collectionName: harness.collectionName,
    originalLibrarySettings: harness.originalLibrarySettings,
    stageLabel: 'Stage 990',
  })

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()
  const readingQueue = page.getByRole('region', { name: 'Reading queue' })
  await readingQueue.waitFor({ state: 'visible', timeout: 20000 })
  await readingQueue.getByRole('button', { name: `Review highlights for ${harness.sourceHarness.document.title}` }).click()

  const sourceReview = page.getByRole('region', { name: 'Source highlight review', exact: true })
  await sourceReview.waitFor({ state: 'visible', timeout: 20000 })
  await sourceReview.getByRole('button', { name: 'Review covered highlights' }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  captures.sourceCoveredHighlightBeforeReview = await captureLocatorScreenshot(
    page,
    sourceReview,
    outputDir,
    'stage990-source-covered-highlight-before-review.png',
  )

  await sourceReview.getByRole('button', { name: 'Review covered highlights' }).click()
  await page.waitForURL((url) => url.pathname === '/recall' && url.searchParams.get('section') === 'study', {
    timeout: 20000,
  })
  await page.locator('[data-study-review-session-progress-stage952]').waitFor({ state: 'visible', timeout: 20000 })
  await page.getByText(harness.sourceHarness.card.prompt).first().waitFor({ state: 'visible', timeout: 20000 })
  await completeVisibleStudyCard(page, harness.sourceHarness.card)

  const sourceRecap = page.locator('[data-study-highlight-review-recap-stage990="true"]').first()
  await sourceRecap.waitFor({ state: 'visible', timeout: 20000 })
  await sourceRecap.getByText('Covered highlights practiced').waitFor({ state: 'visible', timeout: 20000 })
  await sourceRecap.getByText('1 highlight reviewed').waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceHighlightReviewRecapSummarizesReviewedHighlights = true
  captures.sourceStudyRecap = await captureLocatorScreenshot(
    page,
    sourceRecap,
    outputDir,
    'stage990-source-study-highlight-review-recap.png',
  )

  await sourceRecap.getByRole('button', { name: 'Back to source highlights' }).click()
  await sourceReview.waitFor({ state: 'visible', timeout: 20000 })
  await sourceReview.getByText(harness.sourceHarness.note.body_text).waitFor({ state: 'visible', timeout: 20000 })
  const reviewedSourceButton = sourceReview.getByRole('button', { name: 'Show reviewed highlights' })
  metrics.highlightReviewRecapReturnsToSourceReviewedInbox =
    (await reviewedSourceButton.evaluate((element) => element.classList.contains('primary-button'))) &&
    (await sourceReview.getByText(harness.sourceHarness.note.body_text).isVisible())
  captures.sourceReviewedHighlightAfterReturn = await captureLocatorScreenshot(
    page,
    sourceReview,
    outputDir,
    'stage990-source-reviewed-highlight-after-return.png',
  )

  await cleanupHighlightReviewRecapHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage990 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage990: 0,
    highlightReviewRecapActionsVisible: true,
    highlightReviewRecapReturnsToCollectionReviewedInbox: true,
    highlightReviewRecapReturnsToSourceReviewedInbox: true,
    highlightReviewSessionCompletionRefreshesCoveredQueue: true,
    highlightReviewSessionOriginSnapshotPreserved: true,
    highlightReviewSessionRecapSummarizesReviewedHighlights: true,
    highlightReviewSessionRecapVisible: true,
    readerGeneratedOutputsFrozen: true,
    sourceHighlightReviewRecapSummarizesReviewedHighlights: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(
        `Stage 990 expected ${metricName}: ${expected}, got ${metrics[metricName]}. Metrics: ${JSON.stringify(
          metrics,
        )}`,
      )
    }
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage990-covered-highlight-review-recap-return-loop-after-stage989',
  }
  await writeFile(
    path.join(outputDir, 'stage990-covered-highlight-review-recap-return-loop-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(page, outputDir, 'stage990-highlight-review-recap-return-failure.png').catch(() => null)
  throw error
} finally {
  await cleanupHighlightReviewRecapHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 990 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

async function createHighlightReviewRecapHarness({ baseUrl, stageLabel }) {
  const timestamp = Date.now()
  const collectionId = `collection:stage990-highlight-recap-${timestamp}`
  const collectionName = `${stageLabel} Highlight Recap`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }

  const homeDocument = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} opener. ${stageLabel} home practice target. ${stageLabel} home supporting context.`,
    title: `${stageLabel} Highlight Recap Home Source ${timestamp}`,
  })
  await putJson(`${baseUrl}/api/documents/${encodeURIComponent(homeDocument.id)}/progress`, {
    mode: 'reflowed',
    sentence_index: 1,
  })
  const homeView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(homeDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  const homeNote = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(homeDocument.id)}/notes`, {
    anchor: buildNoteAnchor(homeDocument.id, homeView, { sentenceStart: 1, sentenceEnd: 1 }),
    body_text: `${stageLabel} collection covered recap note ${timestamp}`,
  })
  const homeCard = await postJson(`${baseUrl}/api/recall/notes/${encodeURIComponent(homeNote.id)}/promote/study-card`, {
    answer: `${stageLabel} collection covered recap answer`,
    prompt: `${stageLabel} collection covered recap prompt?`,
  })
  await patchJson(`${baseUrl}/api/recall/notes/${encodeURIComponent(homeNote.id)}/review-state`, {
    review_state: 'unreviewed',
  })

  const now = new Date().toISOString()
  await putJson(`${baseUrl}/api/recall/library/settings`, {
    custom_collections: [
      ...(originalLibrarySettings.custom_collections ?? []),
      {
        created_at: now,
        document_ids: [homeDocument.id],
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
    homeCard,
    homeDocument,
    homeNote,
    originalLibrarySettings,
    sourceHarness: null,
  }
}

async function addSourceHighlightReviewRecapDocument({
  baseUrl,
  collectionId,
  collectionName,
  originalLibrarySettings,
  stageLabel,
}) {
  const timestamp = Date.now()
  const document = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} source opener. ${stageLabel} source practice target. ${stageLabel} source supporting context.`,
    title: `${stageLabel} Highlight Recap Source ${timestamp}`,
  })
  await putJson(`${baseUrl}/api/documents/${encodeURIComponent(document.id)}/progress`, {
    mode: 'reflowed',
    sentence_index: 1,
  })
  const view = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(document.id)}/view?mode=reflowed&detail_level=default`,
  )
  const note = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(document.id)}/notes`, {
    anchor: buildNoteAnchor(document.id, view, { sentenceStart: 1, sentenceEnd: 1 }),
    body_text: `${stageLabel} source covered recap note ${timestamp}`,
  })
  const card = await postJson(`${baseUrl}/api/recall/notes/${encodeURIComponent(note.id)}/promote/study-card`, {
    answer: `${stageLabel} source covered recap answer`,
    prompt: `${stageLabel} source covered recap prompt?`,
  })
  await patchJson(`${baseUrl}/api/recall/notes/${encodeURIComponent(note.id)}/review-state`, {
    review_state: 'unreviewed',
  })

  const now = new Date().toISOString()
  const retainedCollections = (originalLibrarySettings.custom_collections ?? []).filter(
    (collection) => collection.id !== collectionId,
  )
  await putJson(`${baseUrl}/api/recall/library/settings`, {
    custom_collections: [
      ...retainedCollections,
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
    card,
    document,
    note,
  }
}

async function cleanupHighlightReviewRecapHarness({ baseUrl, harness }) {
  if (!harness) {
    return
  }
  await fetch(`${baseUrl}/api/recall/library/settings`, {
    body: JSON.stringify(harness.originalLibrarySettings),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  }).catch(() => null)
  const cards = [harness.homeCard, harness.sourceHarness?.card].filter(Boolean)
  await Promise.all(
    cards.map((card) =>
      fetch(`${baseUrl}/api/recall/study/cards/${encodeURIComponent(card.id)}`, { method: 'DELETE' }).catch(() => null),
    ),
  )
  const notes = [harness.homeNote, harness.sourceHarness?.note].filter(Boolean)
  await Promise.all(
    notes.map((note) =>
      fetch(`${baseUrl}/api/recall/notes/${encodeURIComponent(note.id)}`, { method: 'DELETE' }).catch(() => null),
    ),
  )
  const documents = [harness.homeDocument, harness.sourceHarness?.document].filter(Boolean)
  await Promise.all(
    documents.map((document) =>
      fetch(`${baseUrl}/api/documents/${encodeURIComponent(document.id)}`, { method: 'DELETE' }).catch(() => null),
    ),
  )
}

async function completeVisibleStudyCard(page, card) {
  await page.getByText(card.prompt).first().waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('button', { name: /Show answer|Reveal answer/ }).click()
  await page.getByText(card.answer).waitFor({ state: 'visible', timeout: 20000 })
  const reviewResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes('/api/recall/study/cards/') &&
      response.url().includes('/review') &&
      decodeURIComponent(response.url()).includes(card.id) &&
      response.status() === 200,
    { timeout: 20000 },
  )
  await page.getByRole('button', { name: 'Good' }).last().click()
  await reviewResponsePromise
}

async function fetchHighlightInbox({ collectionId, sourceDocumentId, state }) {
  const params = new URLSearchParams({ limit: '10', state })
  if (collectionId) {
    params.set('collection_id', collectionId)
  }
  if (sourceDocumentId) {
    params.set('source_document_id', sourceDocumentId)
  }
  return fetchJson(`${baseUrl}/api/recall/library/highlight-review-inbox?${params.toString()}`)
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
    anchor_text: selectedText,
    block_id: selectedBlock.id,
    excerpt_text: excerptText || selectedText,
    global_sentence_end: sentenceEnd,
    global_sentence_start: sentenceStart,
    sentence_end: localSentenceEnd,
    sentence_start: localSentenceStart,
    source_document_id: documentId,
    variant_id: viewPayload.variant_metadata.variant_id,
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

async function postJson(url, payload) {
  return fetchJson(url, {
    body: JSON.stringify(payload),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  })
}

async function putJson(url, payload) {
  return fetchJson(url, {
    body: JSON.stringify(payload),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  })
}

async function patchJson(url, payload) {
  return fetchJson(url, {
    body: JSON.stringify(payload),
    headers: { 'content-type': 'application/json' },
    method: 'PATCH',
  })
}

function readCliOption(name) {
  const prefix = `--${name}=`
  const inline = process.argv.find((argument) => argument.startsWith(prefix))
  if (inline) {
    return inline.slice(prefix.length)
  }
  const index = process.argv.indexOf(`--${name}`)
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1]
  }
  return null
}
