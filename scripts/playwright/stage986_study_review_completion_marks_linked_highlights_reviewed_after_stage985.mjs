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
const outputDir = process.env.RECALL_STAGE986_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE986_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE986_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE986_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE986_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE986_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage986-study-reviewed-highlight-state-failure.png'), { force: true })

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
  harness = await createStudyReviewedHighlightHarness({ baseUrl, stageLabel: 'Stage 986' })
  const captures = {}
  const metrics = {
    cleanupUtilityDryRunMatchedAfterStage986: null,
    highlightCoveredReviewSessionStarts: false,
    highlightCoveredRowOpenStudyStillWorks: false,
    highlightStudyPracticeMarksLinkedNoteReviewed: false,
    highlightStudyPracticeRemovesReadyReviewableCard: false,
    highlightUncoveredCreateStudyStillUsesNotebookPromotion: false,
    readerGeneratedOutputsFrozen: false,
  }

  const coveredBefore = await fetchHighlightInbox({
    collectionId: harness.collectionId,
    state: 'covered',
  })
  if (
    coveredBefore.reviewable_study_card_ids?.length !== 1 ||
    coveredBefore.reviewable_study_card_ids[0] !== harness.readyCard.id
  ) {
    throw new Error(`Expected one reviewable covered card before practice: ${JSON.stringify(coveredBefore)}`)
  }

  const readerView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(harness.reviewDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  metrics.readerGeneratedOutputsFrozen =
    readerView?.mode === 'reflowed' && JSON.stringify(readerView).includes('Stage 986 ready practice target')

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()

  const collectionReview = page.getByRole('region', { name: 'Collection highlight review', exact: true })
  await collectionReview.waitFor({ state: 'visible', timeout: 20000 })
  await collectionReview.getByRole('button', { name: 'Review covered highlights' }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  captures.collectionReviewBeforePractice = await captureLocatorScreenshot(
    page,
    collectionReview,
    outputDir,
    'stage986-collection-highlight-review-before-practice.png',
  )

  await collectionReview.getByRole('button', { name: 'Show Study-covered highlights' }).click()
  await collectionReview.getByText(harness.readyNote.body_text).waitFor({ state: 'visible', timeout: 20000 })
  const readyCoveredRow = collectionReview.getByRole('listitem').filter({ hasText: harness.readyNote.body_text })
  await readyCoveredRow.getByRole('button', { name: 'Open Study card' }).click()
  await page.waitForURL((url) => url.pathname === '/recall' && url.searchParams.get('section') === 'study', {
    timeout: 20000,
  })
  await page.getByRole('tab', { name: 'Study', exact: true, selected: true }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  metrics.highlightCoveredRowOpenStudyStillWorks = true

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()
  await collectionReview.waitFor({ state: 'visible', timeout: 20000 })
  await collectionReview.getByRole('button', { name: `Create Study card from ${harness.reviewDocument.title}` }).click()
  await page.getByRole('heading', { name: 'Promote note' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('tab', { name: 'Create Study Card', selected: true }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  metrics.highlightUncoveredCreateStudyStillUsesNotebookPromotion = true

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()
  await collectionReview.waitFor({ state: 'visible', timeout: 20000 })

  const sessionRequestPromise = page.waitForRequest(
    (request) => request.method() === 'POST' && request.url().includes('/api/recall/study/sessions'),
    { timeout: 20000 },
  )
  await collectionReview.getByRole('button', { name: 'Review covered highlights' }).click()
  const sessionPayload = await sessionRequestPromise.then((request) => request.postDataJSON())
  await page.waitForURL((url) => url.pathname === '/recall' && url.searchParams.get('section') === 'study', {
    timeout: 20000,
  })
  await page.locator('[data-study-review-session-progress-stage952]').waitFor({ state: 'visible', timeout: 20000 })
  metrics.highlightCoveredReviewSessionStarts =
    sessionPayload.card_ids?.length === 1 && sessionPayload.card_ids[0] === harness.readyCard.id

  await page.getByRole('button', { name: /Show answer|Reveal answer/ }).click()
  await page.getByText(harness.readyCard.answer).waitFor({ state: 'visible', timeout: 20000 })
  const reviewResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes('/api/recall/study/cards/') &&
      response.url().includes('/review') &&
      decodeURIComponent(response.url()).includes(harness.readyCard.id) &&
      response.status() === 200,
    { timeout: 20000 },
  )
  await page.getByRole('button', { name: 'Good' }).last().click()
  await reviewResponsePromise

  const reviewedInbox = await waitForHighlightReviewState({
    noteId: harness.readyNote.id,
    reviewState: 'reviewed',
    sourceDocumentId: harness.reviewDocument.id,
    state: 'reviewed',
  })
  metrics.highlightStudyPracticeMarksLinkedNoteReviewed =
    reviewedInbox.rows?.some((row) => row.note_id === harness.readyNote.id && row.review_state === 'reviewed') ?? false
  const coveredAfter = await fetchHighlightInbox({
    collectionId: harness.collectionId,
    state: 'covered',
  })
  metrics.highlightStudyPracticeRemovesReadyReviewableCard =
    coveredAfter.summary?.reviewable_covered_items === 0 &&
    !(coveredAfter.reviewable_study_card_ids ?? []).includes(harness.readyCard.id)
  captures.studyReviewedHighlightState = await captureViewportScreenshot(
    page,
    outputDir,
    'stage986-study-reviewed-highlight-state.png',
  )

  await cleanupStudyReviewedHighlightHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage986 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage986: 0,
    highlightCoveredReviewSessionStarts: true,
    highlightCoveredRowOpenStudyStillWorks: true,
    highlightStudyPracticeMarksLinkedNoteReviewed: true,
    highlightStudyPracticeRemovesReadyReviewableCard: true,
    highlightUncoveredCreateStudyStillUsesNotebookPromotion: true,
    readerGeneratedOutputsFrozen: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(
        `Stage 986 expected ${metricName}: ${expected}, got ${metrics[metricName]}. Metrics: ${JSON.stringify(
          metrics,
        )}`,
      )
    }
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage986-study-review-completion-marks-linked-highlights-reviewed-after-stage985',
  }
  await writeFile(
    path.join(outputDir, 'stage986-study-reviewed-highlight-state-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(page, outputDir, 'stage986-study-reviewed-highlight-state-failure.png').catch(() => null)
  throw error
} finally {
  await cleanupStudyReviewedHighlightHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 986 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

async function createStudyReviewedHighlightHarness({ baseUrl, stageLabel }) {
  const timestamp = Date.now()
  const collectionId = `collection:stage986-study-reviewed-${timestamp}`
  const collectionName = `${stageLabel} Study Reviewed`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }

  const reviewDocument = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} opener. ${stageLabel} ready practice target. ${stageLabel} uncovered promotion target.`,
    title: `${stageLabel} Study Reviewed Source ${timestamp}`,
  })
  await putJson(`${baseUrl}/api/documents/${encodeURIComponent(reviewDocument.id)}/progress`, {
    mode: 'reflowed',
    sentence_index: 1,
  })
  const reviewView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(reviewDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  const readyNote = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(reviewDocument.id)}/notes`, {
    anchor: buildNoteAnchor(reviewDocument.id, reviewView, { sentenceStart: 1, sentenceEnd: 1 }),
    body_text: `${stageLabel} ready practice note ${timestamp}`,
  })
  const readyCard = await postJson(`${baseUrl}/api/recall/notes/${encodeURIComponent(readyNote.id)}/promote/study-card`, {
    answer: `${stageLabel} ready practice answer`,
    prompt: `${stageLabel} ready practice prompt?`,
  })
  await patchJson(`${baseUrl}/api/recall/notes/${encodeURIComponent(readyNote.id)}/review-state`, {
    review_state: 'unreviewed',
  })
  const uncoveredNote = await postJson(
    `${baseUrl}/api/recall/documents/${encodeURIComponent(reviewDocument.id)}/notes`,
    {
      anchor: buildNoteAnchor(reviewDocument.id, reviewView, { sentenceStart: 2, sentenceEnd: 2 }),
      body_text: `${stageLabel} uncovered promotion note ${timestamp}`,
    },
  )

  const now = new Date().toISOString()
  await putJson(`${baseUrl}/api/recall/library/settings`, {
    custom_collections: [
      ...(originalLibrarySettings.custom_collections ?? []),
      {
        created_at: now,
        document_ids: [reviewDocument.id],
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
    originalLibrarySettings,
    readyCard,
    readyNote,
    reviewDocument,
    uncoveredNote,
  }
}

async function cleanupStudyReviewedHighlightHarness({ baseUrl, harness }) {
  if (!harness) {
    return
  }
  await fetch(`${baseUrl}/api/recall/library/settings`, {
    body: JSON.stringify(harness.originalLibrarySettings),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  }).catch(() => null)
  await fetch(`${baseUrl}/api/recall/study/cards/${encodeURIComponent(harness.readyCard.id)}`, {
    method: 'DELETE',
  }).catch(() => null)
  await Promise.all(
    [harness.readyNote.id, harness.uncoveredNote.id].map((noteId) =>
      fetch(`${baseUrl}/api/recall/notes/${encodeURIComponent(noteId)}`, { method: 'DELETE' }).catch(() => null),
    ),
  )
  await fetch(`${baseUrl}/api/documents/${encodeURIComponent(harness.reviewDocument.id)}`, {
    method: 'DELETE',
  }).catch(() => null)
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

async function waitForHighlightReviewState({ noteId, reviewState, sourceDocumentId, state }) {
  let lastPayload = null
  for (let attempt = 0; attempt < 40; attempt += 1) {
    lastPayload = await fetchHighlightInbox({ sourceDocumentId, state })
    const match = lastPayload.rows?.find((row) => row.note_id === noteId && row.review_state === reviewState)
    if (match) {
      return lastPayload
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(
    `Timed out waiting for highlight review row ${noteId} in ${state}/${reviewState}: ${JSON.stringify(lastPayload)}`,
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
