import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { captureLocatorScreenshot, captureViewportScreenshot } from './home_rendered_preview_quality_shared.mjs'

export async function captureReaderHighlightsResumeCollectionInboxEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  await mkdir(directory, { recursive: true })
  const harness = await createReaderHighlightsHarness({ baseUrl, stageLabel, stagePrefix })
  let result
  let validationError
  try {
    result = await captureReaderHighlightsResumeCollectionInboxEvidenceForHarness({
      baseUrl,
      directory,
      harness,
      page,
      stagePrefix,
    })
  } catch (error) {
    validationError = error
    await captureViewportScreenshot(page, directory, `${stagePrefix}-failure.png`).catch(() => null)
  }

  const cleanupMetrics = await cleanupReaderHighlightsHarness({ baseUrl, harness })
  if (validationError) {
    validationError.readerHighlightsHarnessCleanup = cleanupMetrics
    throw validationError
  }
  return {
    ...result,
    metrics: {
      ...result.metrics,
      ...cleanupMetrics,
    },
  }
}

async function captureReaderHighlightsResumeCollectionInboxEvidenceForHarness({
  baseUrl,
  directory,
  harness,
  page,
  stagePrefix,
}) {
  const captures = {}
  const metrics = {
    collectionHighlightInboxVisible: false,
    collectionOverviewHighlightItemsVisible: false,
    collectionOverviewReadingSummaryVisible: false,
    collectionOverviewResumeSourcesVisible: false,
    homeCollectionContinueReadingOpensResume: false,
    homeCollectionReadingProgressVisible: false,
    readerJumpToLastReadVisible: false,
    sourceOverviewReadingContextVisible: false,
  }

  const overviewResponse = await fetch(
    `${baseUrl}/api/recall/library/collections/${encodeURIComponent(harness.rootCollectionId)}/overview`,
  )
  const overview = overviewResponse.ok ? await overviewResponse.json() : null
  metrics.collectionOverviewReadingSummaryVisible =
    overview?.reading_summary?.total_sources === 1 &&
    overview?.reading_summary?.in_progress_sources === 1 &&
    overview?.reading_summary?.unread_sources === 0
  metrics.collectionOverviewResumeSourcesVisible =
    Array.isArray(overview?.resume_sources) &&
    overview.resume_sources.some(
      (source) =>
        source.id === harness.document.id &&
        source.sentence_index === 1 &&
        source.progress_percent > 0,
    )
  metrics.collectionOverviewHighlightItemsVisible =
    Array.isArray(overview?.highlight_review_items) &&
    overview.highlight_review_items.some(
      (item) => item.note_id === harness.note.id && item.global_sentence_start === 1,
    )

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  const rail = page.getByRole('complementary', { name: 'Home collection rail' })
  await rail.waitFor({ state: 'visible', timeout: 20000 })
  await rail
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.rootName })
    .first()
    .click()
  const workspaceActions = page.getByRole('region', { name: 'Collection workspace actions' })
  await workspaceActions.waitFor({ state: 'visible', timeout: 20000 })
  const readingProgress = workspaceActions.getByRole('region', { name: 'Collection reading progress' })
  await readingProgress.waitFor({ state: 'visible', timeout: 20000 })
  metrics.homeCollectionReadingProgressVisible =
    (await readingProgress.getByText('1 in progress').isVisible()) &&
    (await readingProgress.getByText('67% read').isVisible())
  const highlightInbox = workspaceActions.getByRole('region', { name: 'Collection highlight review' })
  await highlightInbox.waitFor({ state: 'visible', timeout: 20000 })
  metrics.collectionHighlightInboxVisible = await highlightInbox
    .getByText(harness.noteBody)
    .isVisible({ timeout: 5000 })
    .catch(() => false)
  captures.homeCollectionReadingInbox = await captureLocatorScreenshot(
    page,
    workspaceActions,
    directory,
    `${stagePrefix}-home-collection-reading-inbox.png`,
  )

  await workspaceActions.getByRole('button', { name: 'Continue reading' }).click()
  await page.waitForURL(
    (url) =>
      url.pathname === '/reader' &&
      url.searchParams.get('document') === harness.document.id &&
      url.searchParams.get('sentenceStart') === '1',
    { timeout: 20000 },
  )
  metrics.homeCollectionContinueReadingOpensResume = true
  const jumpButton = page.getByRole('button', { name: `Jump to last read in ${harness.document.title}` })
  await jumpButton.waitFor({ state: 'visible', timeout: 20000 })
  metrics.readerJumpToLastReadVisible = true
  captures.readerResumePoint = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-reader-resume-point.png`,
  )

  await page.getByRole('button', { name: 'Open source collections' }).click()
  await page.waitForURL((url) => url.pathname === '/recall', { timeout: 20000 })
  const sourceReadingContext = page.getByRole('region', { name: 'Source reading context' })
  await sourceReadingContext.waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceOverviewReadingContextVisible =
    (await sourceReadingContext.getByText(/Sentence\s+2/).isVisible()) &&
    (await sourceReadingContext.getByText(new RegExp(escapeRegExp(harness.noteBody))).isVisible())
  captures.sourceReadingContext = await captureLocatorScreenshot(
    page,
    sourceReadingContext,
    directory,
    `${stagePrefix}-source-reading-context.png`,
  )

  await writeFile(
    path.join(directory, `${stagePrefix}-validation.json`),
    JSON.stringify({ captures, metrics, stageLabel: harness.stageLabel }, null, 2),
  )

  return { captures, metrics }
}

async function createReaderHighlightsHarness({ baseUrl, stageLabel, stagePrefix }) {
  const timestamp = Date.now()
  const runToken = String(timestamp).slice(-6)
  const rootCollectionId = `collection:${stagePrefix}-root-${timestamp}`
  const rootName = `${stageLabel} Reading Inbox ${runToken}`
  const noteBody = `${stageLabel} anchored note ${timestamp}`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }

  const document = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} first sentence. ${stageLabel} second sentence carries the highlight. ${stageLabel} third sentence closes the source.`,
    title: `${stageLabel} Resume Source ${timestamp}`,
  })
  await fetch(`${baseUrl}/api/documents/${encodeURIComponent(document.id)}/progress`, {
    body: JSON.stringify({ mode: 'reflowed', sentence_index: 1 }),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  })

  const view = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(document.id)}/view?mode=reflowed&detail_level=default`,
  )
  const note = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(document.id)}/notes`, {
    anchor: buildNoteAnchor(document.id, view, { sentenceStart: 1, sentenceEnd: 1 }),
    body_text: noteBody,
  })

  const now = new Date().toISOString()
  await putJson(`${baseUrl}/api/recall/library/settings`, {
    custom_collections: [
      ...(originalLibrarySettings.custom_collections ?? []),
      {
        created_at: now,
        document_ids: [document.id],
        id: rootCollectionId,
        name: rootName,
        origin: 'manual',
        parent_id: null,
        sort_index: 0,
        updated_at: now,
      },
    ],
  })

  return {
    document,
    note,
    noteBody,
    originalLibrarySettings,
    rootCollectionId,
    rootName,
    stageLabel,
  }
}

async function cleanupReaderHighlightsHarness({ baseUrl, harness }) {
  const metrics = {
    readerHighlightsHarnessDocumentsDeleted: false,
    readerHighlightsHarnessLibrarySettingsRestored: false,
    cleanupUtilityDryRunMatchedAfterReaderHighlights: null,
  }

  await fetch(`${baseUrl}/api/recall/library/settings`, {
    body: JSON.stringify(harness.originalLibrarySettings),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  }).then((response) => {
    metrics.readerHighlightsHarnessLibrarySettingsRestored = response.ok
  }).catch(() => undefined)

  await fetch(`${baseUrl}/api/recall/notes/${encodeURIComponent(harness.note.id)}`, {
    method: 'DELETE',
  }).catch(() => undefined)
  await fetch(`${baseUrl}/api/documents/${encodeURIComponent(harness.document.id)}`, {
    method: 'DELETE',
  }).then((response) => {
    metrics.readerHighlightsHarnessDocumentsDeleted = response.ok || response.status === 404
  }).catch(() => undefined)

  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl }).catch(() => ({ matchedCount: null }))
  metrics.cleanupUtilityDryRunMatchedAfterReaderHighlights = cleanupDryRun.matchedCount
  return metrics
}

function buildNoteAnchor(documentId, viewPayload, { sentenceStart, sentenceEnd }) {
  const block = viewPayload.blocks[0]
  const sentenceTexts = block.metadata?.sentence_texts ?? [block.text]
  const selectedText = sentenceTexts.slice(sentenceStart, sentenceEnd + 1).join(' ').trim()
  const excerptStart = Math.max(sentenceStart - 1, 0)
  const excerptEnd = Math.min(sentenceEnd + 1, sentenceTexts.length - 1)
  const excerptText = sentenceTexts.slice(excerptStart, excerptEnd + 1).join(' ').trim()
  return {
    source_document_id: documentId,
    variant_id: viewPayload.variant_metadata.variant_id,
    block_id: block.id,
    sentence_start: sentenceStart,
    sentence_end: sentenceEnd,
    anchor_text: selectedText,
    excerpt_text: excerptText || selectedText,
  }
}

async function fetchJson(url, init) {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new Error(`Request failed ${response.status}: ${url}`)
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
