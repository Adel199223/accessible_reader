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
const outputDir = process.env.RECALL_STAGE982_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE982_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE982_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE982_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE982_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE982_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage982-queue-scoped-highlight-review-failure.png'), { force: true })

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
  harness = await createQueueScopedReviewHarness({ baseUrl, stageLabel: 'Stage 982' })
  const captures = {}
  const metrics = {
    cleanupUtilityDryRunMatchedAfterStage982: null,
    collectionQueueScopedReviewRowsOnly: false,
    highlightReviewActionsStillWork: false,
    highlightReviewQueueFilterBeforeLimit: false,
    homeQueueScopedReviewUsesLearningFilter: false,
    homeQueueScopedReviewUsesReadingState: false,
    homeScopeHighlightReviewVisible: false,
    sourceHighlightReviewStillScoped: false,
  }

  const inProgressNeedsReviewInbox = await fetchJson(
    `${baseUrl}/api/recall/library/highlight-review-inbox?collection_id=${encodeURIComponent(
      harness.collectionId,
    )}&reading_state=in_progress&learning_filter=needs_review&limit=1`,
  )
  metrics.highlightReviewQueueFilterBeforeLimit =
    inProgressNeedsReviewInbox.reading_state === 'in_progress' &&
    inProgressNeedsReviewInbox.learning_filter === 'needs_review' &&
    inProgressNeedsReviewInbox.rows?.length === 1 &&
    inProgressNeedsReviewInbox.rows[0]?.note_id === harness.needsReviewNote.id

  const uncoveredInbox = await fetchJson(
    `${baseUrl}/api/recall/library/highlight-review-inbox?collection_id=${encodeURIComponent(
      harness.collectionId,
    )}&state=uncovered&reading_state=in_progress&learning_filter=uncovered&limit=10`,
  )
  metrics.collectionQueueScopedReviewRowsOnly =
    uncoveredInbox.state === 'uncovered' &&
    uncoveredInbox.reading_state === 'in_progress' &&
    uncoveredInbox.learning_filter === 'uncovered' &&
    uncoveredInbox.summary?.uncovered_items >= 2 &&
    uncoveredInbox.rows?.some((row) => row.note_id === harness.reviewedUncoveredNote.id && row.review_state === 'reviewed') &&
    uncoveredInbox.rows?.every((row) => row.source_document_id !== harness.unreadDocument.id)

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  const homeReview = page.getByRole('region', { name: 'Home highlight review', exact: true })
  await homeReview.waitFor({ state: 'visible', timeout: 20000 })
  await homeReview.getByRole('button', { name: 'Show uncovered highlights' }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  metrics.homeScopeHighlightReviewVisible = true
  captures.homeScopeHighlightReview = await captureLocatorScreenshot(
    page,
    homeReview,
    outputDir,
    'stage982-home-scope-highlight-review.png',
  )

  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()

  const readingQueue = page.getByRole('region', { name: 'Reading queue' })
  await readingQueue.waitFor({ state: 'visible', timeout: 20000 })
  const collectionReview = page.getByRole('region', { name: 'Collection highlight review', exact: true })
  await collectionReview.waitFor({ state: 'visible', timeout: 20000 })
  await readingQueue.getByRole('button', { name: 'Show in-progress reading queue' }).click()
  await readingQueue.getByRole('button', { name: 'Show sources with uncovered highlights' }).click()
  await collectionReview.getByText(harness.reviewedUncoveredNote.body_text).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await collectionReview.getByText(harness.unreadNote.body_text).waitFor({ state: 'hidden', timeout: 20000 })
  metrics.homeQueueScopedReviewUsesReadingState = true
  metrics.homeQueueScopedReviewUsesLearningFilter = true
  captures.collectionQueueScopedUncoveredReview = await captureLocatorScreenshot(
    page,
    collectionReview,
    outputDir,
    'stage982-collection-queue-scoped-uncovered-review.png',
  )

  await collectionReview.getByRole('button', { name: 'Show Study-covered highlights' }).click()
  await collectionReview.getByText(harness.coveredNote.body_text).waitFor({ state: 'visible', timeout: 20000 })
  await collectionReview.getByRole('button', { name: 'Open Study card' }).click()
  await page.waitForURL((url) => url.pathname === '/recall' && url.searchParams.get('section') === 'study', {
    timeout: 20000,
  })
  metrics.highlightReviewActionsStillWork = true
  captures.coveredStudyHandoff = await captureViewportScreenshot(
    page,
    outputDir,
    'stage982-covered-highlight-study-handoff.png',
  )

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()
  await readingQueue.waitFor({ state: 'visible', timeout: 20000 })
  await readingQueue.getByRole('button', { name: `Review highlights for ${harness.needsReviewDocument.title}` }).click()
  const sourceReview = page.getByRole('region', { name: 'Source highlight review', exact: true })
  await sourceReview.waitFor({ state: 'visible', timeout: 20000 })
  await sourceReview.getByText(harness.needsReviewNote.body_text).waitFor({ state: 'visible', timeout: 20000 })
  await sourceReview.getByText(harness.unreadNote.body_text).waitFor({ state: 'hidden', timeout: 20000 })
  metrics.sourceHighlightReviewStillScoped = true
  captures.sourceHighlightReview = await captureLocatorScreenshot(
    page,
    sourceReview,
    outputDir,
    'stage982-source-highlight-review-still-scoped.png',
  )

  await cleanupQueueScopedReviewHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage982 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage982: 0,
    collectionQueueScopedReviewRowsOnly: true,
    highlightReviewActionsStillWork: true,
    highlightReviewQueueFilterBeforeLimit: true,
    homeQueueScopedReviewUsesLearningFilter: true,
    homeQueueScopedReviewUsesReadingState: true,
    homeScopeHighlightReviewVisible: true,
    sourceHighlightReviewStillScoped: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(
        `Stage 982 expected ${metricName}: ${expected}, got ${metrics[metricName]}. Metrics: ${JSON.stringify(
          metrics,
        )}`,
      )
    }
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage982-queue-scoped-highlight-review-after-stage981',
  }
  await writeFile(
    path.join(outputDir, 'stage982-queue-scoped-highlight-review-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(page, outputDir, 'stage982-queue-scoped-highlight-review-failure.png').catch(() => null)
  throw error
} finally {
  await cleanupQueueScopedReviewHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 982 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

async function createQueueScopedReviewHarness({ baseUrl, stageLabel }) {
  const timestamp = Date.now()
  const collectionId = `collection:stage982-queue-scoped-review-${timestamp}`
  const collectionName = `${stageLabel} Queue Scoped Review`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }

  const needsReviewDocument = await importHarnessDocument({
    baseUrl,
    bodyText: `${stageLabel} needs review opener. ${stageLabel} needs review target. ${stageLabel} covered target.`,
    title: `${stageLabel} Needs Review Source ${timestamp}`,
  })
  await putJson(`${baseUrl}/api/documents/${encodeURIComponent(needsReviewDocument.id)}/progress`, {
    mode: 'reflowed',
    sentence_index: 1,
  })
  const needsReviewView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(needsReviewDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  const needsReviewNote = await postJson(
    `${baseUrl}/api/recall/documents/${encodeURIComponent(needsReviewDocument.id)}/notes`,
    {
      anchor: buildNoteAnchor(needsReviewDocument.id, needsReviewView, { sentenceStart: 1, sentenceEnd: 1 }),
      body_text: `${stageLabel} needs review note ${timestamp}`,
    },
  )
  const coveredNote = await postJson(
    `${baseUrl}/api/recall/documents/${encodeURIComponent(needsReviewDocument.id)}/notes`,
    {
      anchor: buildNoteAnchor(needsReviewDocument.id, needsReviewView, { sentenceStart: 2, sentenceEnd: 2 }),
      body_text: `${stageLabel} Study covered note ${timestamp}`,
    },
  )
  const coveredCard = await postJson(
    `${baseUrl}/api/recall/notes/${encodeURIComponent(coveredNote.id)}/promote/study-card`,
    {
      answer: `${stageLabel} covered answer`,
      prompt: `${stageLabel} covered prompt?`,
    },
  )

  const reviewedUncoveredDocument = await importHarnessDocument({
    baseUrl,
    bodyText: `${stageLabel} reviewed opener. ${stageLabel} reviewed uncovered target. ${stageLabel} reviewed closer.`,
    title: `${stageLabel} Reviewed Uncovered Source ${timestamp}`,
  })
  await putJson(`${baseUrl}/api/documents/${encodeURIComponent(reviewedUncoveredDocument.id)}/progress`, {
    mode: 'reflowed',
    sentence_index: 1,
  })
  const reviewedUncoveredView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(reviewedUncoveredDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  const reviewedUncoveredNote = await postJson(
    `${baseUrl}/api/recall/documents/${encodeURIComponent(reviewedUncoveredDocument.id)}/notes`,
    {
      anchor: buildNoteAnchor(reviewedUncoveredDocument.id, reviewedUncoveredView, {
        sentenceStart: 1,
        sentenceEnd: 1,
      }),
      body_text: `${stageLabel} reviewed but uncovered note ${timestamp}`,
    },
  )
  await patchJson(`${baseUrl}/api/recall/notes/${encodeURIComponent(reviewedUncoveredNote.id)}/review-state`, {
    review_state: 'reviewed',
  })

  const unreadDocument = await importHarnessDocument({
    baseUrl,
    bodyText: `${stageLabel} unread opener. ${stageLabel} unread review target. ${stageLabel} unread closer.`,
    title: `${stageLabel} Unread Review Source ${timestamp}`,
  })
  const unreadView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(unreadDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  const unreadNote = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(unreadDocument.id)}/notes`, {
    anchor: buildNoteAnchor(unreadDocument.id, unreadView, { sentenceStart: 1, sentenceEnd: 1 }),
    body_text: `${stageLabel} unread note ${timestamp}`,
  })

  const now = new Date().toISOString()
  await putJson(`${baseUrl}/api/recall/library/settings`, {
    custom_collections: [
      ...(originalLibrarySettings.custom_collections ?? []),
      {
        created_at: now,
        document_ids: [needsReviewDocument.id, reviewedUncoveredDocument.id, unreadDocument.id],
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
    needsReviewDocument,
    needsReviewNote,
    originalLibrarySettings,
    reviewedUncoveredDocument,
    reviewedUncoveredNote,
    unreadDocument,
    unreadNote,
  }
}

async function cleanupQueueScopedReviewHarness({ baseUrl, harness }) {
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
    [harness.needsReviewNote.id, harness.coveredNote.id, harness.reviewedUncoveredNote.id, harness.unreadNote.id].map(
      (noteId) => fetch(`${baseUrl}/api/recall/notes/${encodeURIComponent(noteId)}`, { method: 'DELETE' }).catch(() => null),
    ),
  )
  await Promise.all(
    [harness.needsReviewDocument.id, harness.reviewedUncoveredDocument.id, harness.unreadDocument.id].map((documentId) =>
      fetch(`${baseUrl}/api/documents/${encodeURIComponent(documentId)}`, { method: 'DELETE' }).catch(() => null),
    ),
  )
}

async function importHarnessDocument({ baseUrl, bodyText, title }) {
  return postJson(`${baseUrl}/api/documents/import-text`, {
    text: bodyText,
    title,
  })
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
  const option = process.argv.find((argument) => argument.startsWith(prefix))
  return option ? option.slice(prefix.length) : null
}
