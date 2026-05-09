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
const outputDir = process.env.RECALL_STAGE984_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE984_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE984_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE984_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE984_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE984_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage984-highlight-covered-review-session-failure.png'), { force: true })

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
  harness = await createHighlightCoveredReviewHarness({ baseUrl, stageLabel: 'Stage 984' })
  const captures = {}
  const metrics = {
    cleanupUtilityDryRunMatchedAfterStage984: null,
    highlightCoveredReviewSessionActionVisible: false,
    highlightCoveredReviewSessionSnapshotPreservesQueueFilters: false,
    highlightCoveredReviewSessionStartsQueueScoped: false,
    highlightCoveredRowOpenStudyStillWorks: false,
    highlightCoveredScheduledCardsExcluded: false,
    highlightUncoveredCreateStudyStillUsesNotebookPromotion: false,
    readerGeneratedOutputsFrozen: false,
    sourceHighlightCoveredReviewSessionStartsSourceScoped: false,
  }

  const coveredInbox = await fetchJson(
    `${baseUrl}/api/recall/library/highlight-review-inbox?collection_id=${encodeURIComponent(
      harness.collectionId,
    )}&state=covered&reading_state=in_progress&learning_filter=covered&limit=10`,
  )
  metrics.highlightCoveredScheduledCardsExcluded =
    coveredInbox.summary?.covered_items >= 2 &&
    coveredInbox.summary?.reviewable_covered_items === 1 &&
    coveredInbox.reviewable_study_card_ids?.length === 1 &&
    coveredInbox.reviewable_study_card_ids[0] === harness.readyCard.id &&
    !coveredInbox.reviewable_study_card_ids.includes(harness.deferredCard.id)

  const readerView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(harness.reviewDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  metrics.readerGeneratedOutputsFrozen =
    readerView?.mode === 'reflowed' && JSON.stringify(readerView).includes('Stage 984 ready covered target')

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
  metrics.highlightCoveredReviewSessionActionVisible = true
  captures.collectionReviewAction = await captureLocatorScreenshot(
    page,
    collectionReview,
    outputDir,
    'stage984-collection-highlight-covered-review-action.png',
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
  const homeSessionRequestPromise = page.waitForRequest(
    (request) => request.method() === 'POST' && request.url().includes('/api/recall/study/sessions'),
    { timeout: 20000 },
  )
  await collectionReview.getByRole('button', { name: 'Review covered highlights' }).click()
  const homeSessionPayload = homeSessionRequestPromise.then((request) => request.postDataJSON())
  const homePayload = await homeSessionPayload
  await page.waitForURL((url) => url.pathname === '/recall' && url.searchParams.get('section') === 'study', {
    timeout: 20000,
  })
  await page.locator('[data-study-review-session-progress-stage952]').waitFor({ state: 'visible', timeout: 20000 })
  metrics.highlightCoveredReviewSessionStartsQueueScoped =
    homePayload.card_ids?.length === 1 &&
    homePayload.card_ids[0] === harness.readyCard.id &&
    homePayload.source_document_id === null
  metrics.highlightCoveredReviewSessionSnapshotPreservesQueueFilters =
    homePayload.filter_snapshot?.launch_intent === 'highlight-covered-review' &&
    homePayload.filter_snapshot?.collection_id === harness.collectionId &&
    homePayload.filter_snapshot?.highlight_review_state === 'needs_review' &&
    homePayload.filter_snapshot?.learning_filter === 'all' &&
    homePayload.filter_snapshot?.reading_state === 'all' &&
    homePayload.filter_snapshot?.scope === 'all'
  captures.homeCoveredReviewSession = await captureViewportScreenshot(
    page,
    outputDir,
    'stage984-home-covered-highlight-review-session.png',
  )

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()
  const readingQueue = page.getByRole('region', { name: 'Reading queue' })
  await readingQueue.waitFor({ state: 'visible', timeout: 20000 })
  await readingQueue.getByRole('button', { name: `Review highlights for ${harness.reviewDocument.title}` }).click()
  const sourceReview = page.getByRole('region', { name: 'Source highlight review', exact: true })
  await sourceReview.waitFor({ state: 'visible', timeout: 20000 })
  await sourceReview.getByRole('button', { name: 'Review covered highlights' }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const sourceSessionRequestPromise = page.waitForRequest(
    (request) => request.method() === 'POST' && request.url().includes('/api/recall/study/sessions'),
    { timeout: 20000 },
  )
  await sourceReview.getByRole('button', { name: 'Review covered highlights' }).click()
  const sourcePayload = await sourceSessionRequestPromise.then((request) => request.postDataJSON())
  await page.waitForURL((url) => url.pathname === '/recall' && url.searchParams.get('section') === 'study', {
    timeout: 20000,
  })
  await page.locator('[data-study-review-session-progress-stage952]').waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceHighlightCoveredReviewSessionStartsSourceScoped =
    sourcePayload.card_ids?.length === 1 &&
    sourcePayload.card_ids[0] === harness.readyCard.id &&
    sourcePayload.source_document_id === harness.reviewDocument.id &&
    sourcePayload.filter_snapshot?.source_document_id === harness.reviewDocument.id &&
    sourcePayload.filter_snapshot?.launch_intent === 'highlight-covered-review'
  captures.sourceCoveredReviewSession = await captureViewportScreenshot(
    page,
    outputDir,
    'stage984-source-covered-highlight-review-session.png',
  )

  await cleanupHighlightCoveredReviewHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage984 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage984: 0,
    highlightCoveredReviewSessionActionVisible: true,
    highlightCoveredReviewSessionSnapshotPreservesQueueFilters: true,
    highlightCoveredReviewSessionStartsQueueScoped: true,
    highlightCoveredRowOpenStudyStillWorks: true,
    highlightCoveredScheduledCardsExcluded: true,
    highlightUncoveredCreateStudyStillUsesNotebookPromotion: true,
    readerGeneratedOutputsFrozen: true,
    sourceHighlightCoveredReviewSessionStartsSourceScoped: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(
        `Stage 984 expected ${metricName}: ${expected}, got ${metrics[metricName]}. Metrics: ${JSON.stringify(
          metrics,
        )}`,
      )
    }
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage984-highlight-covered-review-session-handoff-after-stage983',
  }
  await writeFile(
    path.join(outputDir, 'stage984-highlight-covered-review-session-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(page, outputDir, 'stage984-highlight-covered-review-session-failure.png').catch(() => null)
  throw error
} finally {
  await cleanupHighlightCoveredReviewHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 984 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

async function createHighlightCoveredReviewHarness({ baseUrl, stageLabel }) {
  const timestamp = Date.now()
  const collectionId = `collection:stage984-covered-review-${timestamp}`
  const collectionName = `${stageLabel} Covered Review`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }

  const reviewDocument = await importHarnessDocument({
    baseUrl,
    bodyText: `${stageLabel} opener. ${stageLabel} needs review target. ${stageLabel} ready covered target. ${stageLabel} deferred covered target.`,
    title: `${stageLabel} Covered Review Source ${timestamp}`,
  })
  await putJson(`${baseUrl}/api/documents/${encodeURIComponent(reviewDocument.id)}/progress`, {
    mode: 'reflowed',
    sentence_index: 2,
  })
  const reviewView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(reviewDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  const needsReviewNote = await postJson(
    `${baseUrl}/api/recall/documents/${encodeURIComponent(reviewDocument.id)}/notes`,
    {
      anchor: buildNoteAnchor(reviewDocument.id, reviewView, { sentenceStart: 1, sentenceEnd: 1 }),
      body_text: `${stageLabel} needs review note ${timestamp}`,
    },
  )
  const readyNote = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(reviewDocument.id)}/notes`, {
    anchor: buildNoteAnchor(reviewDocument.id, reviewView, { sentenceStart: 2, sentenceEnd: 2 }),
    body_text: `${stageLabel} ready covered note ${timestamp}`,
  })
  const readyCard = await postJson(`${baseUrl}/api/recall/notes/${encodeURIComponent(readyNote.id)}/promote/study-card`, {
    answer: `${stageLabel} ready covered answer`,
    prompt: `${stageLabel} ready covered prompt?`,
  })
  const deferredNote = await postJson(
    `${baseUrl}/api/recall/documents/${encodeURIComponent(reviewDocument.id)}/notes`,
    {
      anchor: buildNoteAnchor(reviewDocument.id, reviewView, { sentenceStart: 3, sentenceEnd: 3 }),
      body_text: `${stageLabel} deferred covered note ${timestamp}`,
    },
  )
  const deferredCard = await postJson(
    `${baseUrl}/api/recall/notes/${encodeURIComponent(deferredNote.id)}/promote/study-card`,
    {
      answer: `${stageLabel} deferred covered answer`,
      prompt: `${stageLabel} deferred covered prompt?`,
    },
  )
  await postJson(`${baseUrl}/api/recall/study/cards/${encodeURIComponent(deferredCard.id)}/schedule-state`, {
    action: 'unschedule',
  })

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
    deferredCard,
    deferredNote,
    needsReviewNote,
    originalLibrarySettings,
    readyCard,
    readyNote,
    reviewDocument,
  }
}

async function cleanupHighlightCoveredReviewHarness({ baseUrl, harness }) {
  if (!harness) {
    return
  }
  await fetch(`${baseUrl}/api/recall/library/settings`, {
    body: JSON.stringify(harness.originalLibrarySettings),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  }).catch(() => null)
  await Promise.all(
    [harness.readyCard.id, harness.deferredCard.id].map((cardId) =>
      fetch(`${baseUrl}/api/recall/study/cards/${encodeURIComponent(cardId)}`, { method: 'DELETE' }).catch(() => null),
    ),
  )
  await Promise.all(
    [harness.needsReviewNote.id, harness.readyNote.id, harness.deferredNote.id].map((noteId) =>
      fetch(`${baseUrl}/api/recall/notes/${encodeURIComponent(noteId)}`, { method: 'DELETE' }).catch(() => null),
    ),
  )
  await fetch(`${baseUrl}/api/documents/${encodeURIComponent(harness.reviewDocument.id)}`, {
    method: 'DELETE',
  }).catch(() => null)
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

function readCliOption(name) {
  const prefix = `--${name}=`
  const option = process.argv.find((argument) => argument.startsWith(prefix))
  return option ? option.slice(prefix.length) : null
}
