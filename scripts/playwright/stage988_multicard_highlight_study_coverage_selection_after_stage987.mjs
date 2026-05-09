import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
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
const outputDir = process.env.RECALL_STAGE988_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE988_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE988_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const databasePath =
  process.env.RECALL_STAGE988_DATABASE_PATH ??
  readCliOption('database-path') ??
  path.join(repoRoot, 'backend', '.data', 'workspace.db')
const headless = process.env.RECALL_STAGE988_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE988_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE988_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const pythonExecutable =
  process.env.RECALL_STAGE988_PYTHON ??
  (process.platform === 'win32'
    ? 'python'
    : existsSync(path.join(repoRoot, 'backend', '.venv', 'bin', 'python'))
      ? path.join(repoRoot, 'backend', '.venv', 'bin', 'python')
      : 'python3')

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage988-multicard-highlight-coverage-failure.png'), { force: true })

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
  harness = await createMultiCardHighlightHarness({ baseUrl, databasePath, stageLabel: 'Stage 988' })
  const captures = {}
  const metrics = {
    cleanupUtilityDryRunMatchedAfterStage988: null,
    highlightCoveredInboxKeepsAllLinkedCardsReviewable: false,
    highlightCoveredRowPrefersReviewableCard: false,
    highlightCoveredReviewSessionUsesReviewableCard: false,
    highlightCoveredRowOpenStudyPrefersReviewableCard: false,
    readerGeneratedOutputsFrozen: false,
  }

  const coveredInbox = await fetchHighlightInbox({
    collectionId: harness.collectionId,
    state: 'covered',
  })
  const coveredRow = coveredInbox.rows?.find((row) => row.note_id === harness.readyNote.id)
  metrics.highlightCoveredRowPrefersReviewableCard =
    coveredRow?.study_card_id === harness.readyCard.id &&
    coveredRow?.study_card_id !== harness.duplicateUnscheduledCard.id
  metrics.highlightCoveredInboxKeepsAllLinkedCardsReviewable =
    coveredInbox.summary?.reviewable_covered_items === 1 &&
    coveredInbox.reviewable_study_card_ids?.length === 1 &&
    coveredInbox.reviewable_study_card_ids[0] === harness.readyCard.id &&
    !coveredInbox.reviewable_study_card_ids.includes(harness.duplicateUnscheduledCard.id)
  if (!metrics.highlightCoveredRowPrefersReviewableCard || !metrics.highlightCoveredInboxKeepsAllLinkedCardsReviewable) {
    throw new Error(`Stage 988 covered inbox did not prefer the reviewable linked card: ${JSON.stringify(coveredInbox)}`)
  }

  const readerView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(harness.reviewDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  metrics.readerGeneratedOutputsFrozen =
    readerView?.mode === 'reflowed' && JSON.stringify(readerView).includes('Stage 988 ready covered target')

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
  await collectionReview.getByText(harness.readyNote.body_text).waitFor({ state: 'visible', timeout: 20000 })
  captures.collectionReviewMultiCardCovered = await captureLocatorScreenshot(
    page,
    collectionReview,
    outputDir,
    'stage988-collection-highlight-multicard-covered.png',
  )

  const readyCoveredRow = collectionReview.getByRole('listitem').filter({ hasText: harness.readyNote.body_text })
  await readyCoveredRow.getByRole('button', { name: 'Open Study card' }).click()
  await page.waitForURL((url) => url.pathname === '/recall' && url.searchParams.get('section') === 'study', {
    timeout: 20000,
  })
  await page.getByRole('tab', { name: 'Study', exact: true, selected: true }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.getByText(harness.readyCard.prompt).first().waitFor({ state: 'visible', timeout: 20000 })
  if (await page.getByText(harness.duplicateUnscheduledCard.prompt).first().isVisible().catch(() => false)) {
    throw new Error('Covered highlight row opened the unscheduled duplicate card instead of the reviewable card.')
  }
  metrics.highlightCoveredRowOpenStudyPrefersReviewableCard = true

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
  await page.getByText(harness.readyCard.prompt).first().waitFor({ state: 'visible', timeout: 20000 })
  metrics.highlightCoveredReviewSessionUsesReviewableCard =
    sessionPayload.card_ids?.length === 1 &&
    sessionPayload.card_ids[0] === harness.readyCard.id &&
    !sessionPayload.card_ids.includes(harness.duplicateUnscheduledCard.id)
  captures.studyReviewableCardSession = await captureViewportScreenshot(
    page,
    outputDir,
    'stage988-study-reviewable-card-session.png',
  )

  await cleanupMultiCardHighlightHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage988 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage988: 0,
    highlightCoveredInboxKeepsAllLinkedCardsReviewable: true,
    highlightCoveredReviewSessionUsesReviewableCard: true,
    highlightCoveredRowOpenStudyPrefersReviewableCard: true,
    highlightCoveredRowPrefersReviewableCard: true,
    readerGeneratedOutputsFrozen: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(
        `Stage 988 expected ${metricName}: ${expected}, got ${metrics[metricName]}. Metrics: ${JSON.stringify(
          metrics,
        )}`,
      )
    }
  }

  const validation = {
    captures,
    databasePath,
    metrics,
    runtimeBrowser,
    stage: 'stage988-multicard-highlight-study-coverage-selection-after-stage987',
  }
  await writeFile(
    path.join(outputDir, 'stage988-multicard-highlight-study-coverage-selection-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(page, outputDir, 'stage988-multicard-highlight-coverage-failure.png').catch(() => null)
  throw error
} finally {
  await cleanupMultiCardHighlightHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 988 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

async function createMultiCardHighlightHarness({ baseUrl, databasePath, stageLabel }) {
  const timestamp = Date.now()
  const collectionId = `collection:stage988-multicard-highlight-${timestamp}`
  const collectionName = `${stageLabel} Multi-card Highlight`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }

  const reviewDocument = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} opener. ${stageLabel} ready covered target. ${stageLabel} supporting context.`,
    title: `${stageLabel} Multi-card Highlight Source ${timestamp}`,
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
    body_text: `${stageLabel} multi-card linked highlight note ${timestamp}`,
  })
  const readyCard = await postJson(`${baseUrl}/api/recall/notes/${encodeURIComponent(readyNote.id)}/promote/study-card`, {
    answer: `${stageLabel} reviewable linked answer`,
    prompt: `${stageLabel} reviewable linked prompt?`,
  })
  await patchJson(`${baseUrl}/api/recall/notes/${encodeURIComponent(readyNote.id)}/review-state`, {
    review_state: 'unreviewed',
  })
  const duplicateUnscheduledCard = await postJson(`${baseUrl}/api/recall/study/cards`, {
    answer: `${stageLabel} deferred duplicate answer`,
    card_type: 'short_answer',
    prompt: `${stageLabel} deferred duplicate prompt?`,
    source_document_id: reviewDocument.id,
  })
  await linkStudyCardToSameNoteInDatabase({
    databasePath,
    sourceCardId: readyCard.id,
    targetCardId: duplicateUnscheduledCard.id,
  })
  const updatedDuplicateCard = await postJson(
    `${baseUrl}/api/recall/study/cards/${encodeURIComponent(duplicateUnscheduledCard.id)}/schedule-state`,
    {
      action: 'unschedule',
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
    duplicateUnscheduledCard: updatedDuplicateCard,
    originalLibrarySettings,
    readyCard,
    readyNote,
    reviewDocument,
  }
}

async function cleanupMultiCardHighlightHarness({ baseUrl, harness }) {
  if (!harness) {
    return
  }
  await fetch(`${baseUrl}/api/recall/library/settings`, {
    body: JSON.stringify(harness.originalLibrarySettings),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  }).catch(() => null)
  await Promise.all(
    [harness.readyCard.id, harness.duplicateUnscheduledCard.id].map((cardId) =>
      fetch(`${baseUrl}/api/recall/study/cards/${encodeURIComponent(cardId)}`, { method: 'DELETE' }).catch(() => null),
    ),
  )
  await fetch(`${baseUrl}/api/recall/notes/${encodeURIComponent(harness.readyNote.id)}`, {
    method: 'DELETE',
  }).catch(() => null)
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

async function linkStudyCardToSameNoteInDatabase({ databasePath, sourceCardId, targetCardId }) {
  const pythonProgram = String.raw`
import sqlite3
import sys

database_path, source_card_id, target_card_id = sys.argv[1:4]
connection = sqlite3.connect(database_path)
try:
    source = connection.execute(
        "SELECT source_spans_json FROM review_cards WHERE id = ?",
        (source_card_id,),
    ).fetchone()
    if not source:
        raise SystemExit(f"source card not found: {source_card_id}")
    updated = connection.execute(
        "UPDATE review_cards SET source_spans_json = ? WHERE id = ?",
        (source[0], target_card_id),
    )
    if updated.rowcount != 1:
        raise SystemExit(f"target card not found: {target_card_id}")
    connection.commit()
finally:
    connection.close()
`
  execFileSync(pythonExecutable, ['-c', pythonProgram, databasePath, sourceCardId, targetCardId], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
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
