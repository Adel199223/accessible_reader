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
const outputDir = process.env.RECALL_STAGE976_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE976_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE976_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE976_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE976_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE976_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage976-highlight-review-state-failure.png'), { force: true })

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
  harness = await createHighlightReviewHarness({ baseUrl, stageLabel: 'Stage 976' })
  const captures = {}
  const metrics = {
    cleanupUtilityDryRunMatchedAfterStage976: null,
    highlightReviewCoveredStudyHandoffWorks: false,
    highlightReviewDismissRestoreWorks: false,
    highlightReviewHomeFiltersVisible: false,
    highlightReviewMarkReviewedWorks: false,
    highlightReviewNotebookPromotionSeamWorks: false,
    sourceHighlightReviewControlsWork: false,
  }

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()

  const homeInbox = page.getByRole('region', { name: 'Collection highlight review' })
  await homeInbox.waitFor({ state: 'visible', timeout: 20000 })
  await homeInbox.getByRole('button', { name: 'Show highlights needing review' }).waitFor({ state: 'visible', timeout: 20000 })
  await homeInbox.getByRole('button', { name: 'Show Study-covered highlights' }).waitFor({ state: 'visible', timeout: 20000 })
  await homeInbox.getByText(harness.reviewNoteBody).waitFor({ state: 'visible', timeout: 20000 })
  metrics.highlightReviewHomeFiltersVisible = true
  captures.homeHighlightReviewNeedsReview = await captureLocatorScreenshot(
    page,
    homeInbox,
    outputDir,
    'stage976-home-highlight-review-needs-review.png',
  )

  const homeReviewRow = homeInbox
    .locator('.recall-highlight-review-row-stage976')
    .filter({ hasText: harness.reviewNoteBody })
    .first()
  await homeReviewRow.getByRole('button', { name: 'Mark reviewed' }).click()
  await homeInbox.getByRole('button', { name: 'Show reviewed highlights' }).click()
  await homeInbox.getByText(harness.reviewNoteBody).waitFor({ state: 'visible', timeout: 20000 })
  await waitForHighlightInboxRow({
    baseUrl,
    collectionId: harness.collectionId,
    noteId: harness.reviewNote.id,
    reviewState: 'reviewed',
    state: 'reviewed',
  })
  metrics.highlightReviewMarkReviewedWorks = true

  await homeReviewRow.getByRole('button', { name: 'Dismiss', exact: true }).click()
  await homeInbox.getByRole('button', { name: 'Show dismissed highlights' }).click()
  await homeInbox.getByText(harness.reviewNoteBody).waitFor({ state: 'visible', timeout: 20000 })
  await waitForHighlightInboxRow({
    baseUrl,
    collectionId: harness.collectionId,
    noteId: harness.reviewNote.id,
    reviewState: 'dismissed',
    state: 'dismissed',
  })
  await homeReviewRow.getByRole('button', { name: 'Restore' }).click()
  await homeInbox.getByRole('button', { name: 'Show highlights needing review' }).click()
  await homeInbox.getByText(harness.reviewNoteBody).waitFor({ state: 'visible', timeout: 20000 })
  await waitForHighlightInboxRow({
    baseUrl,
    collectionId: harness.collectionId,
    noteId: harness.reviewNote.id,
    reviewState: 'unreviewed',
    state: 'needs_review',
  })
  metrics.highlightReviewDismissRestoreWorks = true

  await homeInbox.getByRole('button', { name: 'Show Study-covered highlights' }).click()
  await homeInbox.getByText(harness.coveredNoteBody).waitFor({ state: 'visible', timeout: 20000 })
  captures.homeHighlightReviewCovered = await captureLocatorScreenshot(
    page,
    homeInbox,
    outputDir,
    'stage976-home-highlight-review-covered.png',
  )
  const homeCoveredRow = homeInbox
    .locator('.recall-highlight-review-row-stage976')
    .filter({ hasText: harness.coveredNoteBody })
    .first()
  await homeCoveredRow.getByRole('button', { name: 'Open Study card' }).click()
  await page.waitForURL((url) => url.pathname === '/recall' && url.searchParams.get('section') === 'study', {
    timeout: 20000,
  })
  metrics.highlightReviewCoveredStudyHandoffWorks = true
  captures.coveredStudyHandoff = await captureViewportScreenshot(
    page,
    outputDir,
    'stage976-highlight-review-covered-study-handoff.png',
  )

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: `Open ${harness.document.title}`, exact: true }).click()
  const sourceInbox = page.getByRole('region', { name: 'Source highlight review' })
  await sourceInbox.waitFor({ state: 'visible', timeout: 20000 })
  await sourceInbox.getByText(harness.reviewNoteBody).waitFor({ state: 'visible', timeout: 20000 })
  const sourceReviewRow = sourceInbox
    .locator('.recall-highlight-review-row-stage976')
    .filter({ hasText: harness.reviewNoteBody })
    .first()
  await sourceReviewRow.getByRole('button', { name: 'Dismiss', exact: true }).click()
  await sourceInbox.getByRole('button', { name: 'Show dismissed highlights' }).click()
  await sourceInbox.getByText(harness.reviewNoteBody).waitFor({ state: 'visible', timeout: 20000 })
  await sourceReviewRow.getByRole('button', { name: 'Restore' }).click()
  await sourceInbox.getByRole('button', { name: 'Show highlights needing review' }).click()
  await sourceInbox.getByText(harness.reviewNoteBody).waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceHighlightReviewControlsWork = true
  captures.sourceHighlightReview = await captureLocatorScreenshot(
    page,
    sourceInbox,
    outputDir,
    'stage976-source-highlight-review-controls.png',
  )

  await sourceInbox.getByRole('button', { name: `Create Study card from ${harness.document.title}` }).click()
  const promoteRegion = page.locator('[data-notebook-action-seam="promote-note"], .recall-note-promotion-card').first()
  await promoteRegion.waitFor({ state: 'attached', timeout: 20000 })
  await promoteRegion.scrollIntoViewIfNeeded()
  await promoteRegion.getByRole('tab', { name: 'Create Study Card', selected: true }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  metrics.highlightReviewNotebookPromotionSeamWorks = true
  captures.notebookPromotionSeam = await captureLocatorScreenshot(
    page,
    promoteRegion,
    outputDir,
    'stage976-highlight-review-notebook-promotion-seam.png',
  )

  await cleanupHighlightReviewHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage976 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage976: 0,
    highlightReviewCoveredStudyHandoffWorks: true,
    highlightReviewDismissRestoreWorks: true,
    highlightReviewHomeFiltersVisible: true,
    highlightReviewMarkReviewedWorks: true,
    highlightReviewNotebookPromotionSeamWorks: true,
    sourceHighlightReviewControlsWork: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(`Stage 976 expected ${metricName}: ${expected}, got ${metrics[metricName]}.`)
    }
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage976-highlight-review-state-and-study-coverage-after-stage975',
  }
  await writeFile(
    path.join(outputDir, 'stage976-highlight-review-state-and-study-coverage-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(page, outputDir, 'stage976-highlight-review-state-failure.png').catch(() => null)
  throw error
} finally {
  await cleanupHighlightReviewHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 976 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

async function createHighlightReviewHarness({ baseUrl, stageLabel }) {
  const timestamp = Date.now()
  const collectionId = `collection:stage976-highlight-review-${timestamp}`
  const collectionName = `${stageLabel} Highlight Review`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }
  const document = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} review opener. ${stageLabel} review target sentence. ${stageLabel} covered target sentence.`,
    title: `${stageLabel} Highlight Review Source ${timestamp}`,
  })
  const view = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(document.id)}/view?mode=reflowed&detail_level=default`,
  )
  const reviewNoteBody = `${stageLabel} needs a local review loop ${timestamp}`
  const coveredNoteBody = `${stageLabel} already has Study coverage ${timestamp}`
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
      answer: `${stageLabel} covered answer`,
      prompt: `${stageLabel} covered prompt?`,
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
    coveredNoteBody,
    document,
    originalLibrarySettings,
    reviewNote,
    reviewNoteBody,
  }
}

async function cleanupHighlightReviewHarness({ baseUrl, harness }) {
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

async function waitForHighlightInboxRow({
  baseUrl,
  collectionId,
  noteId,
  reviewState,
  sourceDocumentId = null,
  state,
  timeoutMs = 10000,
}) {
  const startedAt = Date.now()
  let lastPayload = null
  while (Date.now() - startedAt < timeoutMs) {
    const params = new URLSearchParams({ limit: '10', state })
    if (collectionId) {
      params.set('collection_id', collectionId)
    }
    if (sourceDocumentId) {
      params.set('source_document_id', sourceDocumentId)
    }
    lastPayload = await fetchJson(`${baseUrl}/api/recall/library/highlight-review-inbox?${params.toString()}`)
    const match = lastPayload.rows?.find((row) => row.note_id === noteId && row.review_state === reviewState)
    if (match) {
      return match
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(
    `Timed out waiting for highlight review row ${noteId} in ${state}/${reviewState}: ${JSON.stringify(lastPayload)}`,
  )
}

function readCliOption(name) {
  const prefix = `--${name}=`
  const match = process.argv.slice(2).find((argument) => argument.startsWith(prefix))
  return match ? match.slice(prefix.length) : null
}
