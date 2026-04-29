import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { captureLocatorScreenshot, captureViewportScreenshot } from './home_rendered_preview_quality_shared.mjs'

export async function captureLibraryReadingQueueHighlightActionsEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  await mkdir(directory, { recursive: true })
  const harness = await createLibraryReadingQueueHarness({ baseUrl, stageLabel, stagePrefix })
  let result
  let validationError
  try {
    result = await captureLibraryReadingQueueHighlightActionsEvidenceForHarness({
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

  const cleanupMetrics = await cleanupLibraryReadingQueueHarness({ baseUrl, harness })
  if (validationError) {
    validationError.libraryReadingQueueHarnessCleanup = cleanupMetrics
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

async function captureLibraryReadingQueueHighlightActionsEvidenceForHarness({
  baseUrl,
  directory,
  harness,
  page,
  stagePrefix,
}) {
  const captures = {}
  const metrics = {
    customParentCollectionQueueAggregatesDescendants: false,
    customParentCollectionQueueRowsVisible: false,
    homeReadingQueueContinueOpensReader: false,
    homeReadingQueueMarkCompleteUpdatesProgress: false,
    homeReadingQueueStateFiltersWork: false,
    homeReadingQueueSummaryVisible: false,
    homeReadingQueueVisible: false,
    highlightCreateStudyOpensPromotion: false,
    highlightOpenNotebookWorks: false,
    highlightOpenReaderWorks: false,
    readerGeneratedOutputsFrozen: false,
    readerNextInQueueAdvancesWithinScope: false,
    readerNextInQueueVisible: false,
    readingQueueAllScopeAvailable: false,
    readingQueueBuiltInScopeAvailable: false,
    sourceOverviewHighlightActionsVisible: false,
    sourceOverviewMarkCompleteUpdatesProgress: false,
    sourceOverviewMarkCompleteVisible: false,
    sourceOverviewReadingContextVisible: false,
  }

  const allQueue = await fetchJson(`${baseUrl}/api/recall/library/reading-queue?scope=all&state=all&limit=50`)
  const capturesQueue = await fetchJson(`${baseUrl}/api/recall/library/reading-queue?scope=captures&state=all&limit=50`)
  const collectionQueue = await fetchJson(
    `${baseUrl}/api/recall/library/reading-queue?collection_id=${encodeURIComponent(harness.rootCollectionId)}&state=all&limit=50`,
  )
  metrics.readingQueueAllScopeAvailable = allQueue.rows?.some((row) => row.id === harness.rootDocument.id)
  metrics.readingQueueBuiltInScopeAvailable =
    capturesQueue.scope === 'captures' &&
    capturesQueue.rows?.some((row) => row.id === harness.rootDocument.id) &&
    capturesQueue.rows?.some((row) => row.id === harness.childDocument.id)
  metrics.customParentCollectionQueueAggregatesDescendants =
    collectionQueue.collection_id === harness.rootCollectionId &&
    collectionQueue.summary?.total_sources === 3 &&
    collectionQueue.summary?.in_progress_sources === 2 &&
    collectionQueue.summary?.unread_sources === 1 &&
    collectionQueue.rows?.some((row) => row.id === harness.rootDocument.id && row.membership === 'direct') &&
    collectionQueue.rows?.some((row) => row.id === harness.childDocument.id && row.membership === 'descendant')

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.rootCollectionName })
    .first()
    .click()
  const queueRegion = page.getByRole('region', { name: 'Reading queue' })
  await queueRegion.waitFor({ state: 'visible', timeout: 20000 })
  metrics.homeReadingQueueVisible = true
  await queueRegion.getByText('2 in progress').waitFor({ state: 'visible', timeout: 20000 })
  await queueRegion.getByText('1 unread').waitFor({ state: 'visible', timeout: 20000 })
  metrics.homeReadingQueueSummaryVisible = true
  await queueRegion.getByText(harness.rootDocument.title).waitFor({ state: 'visible', timeout: 20000 })
  await queueRegion.getByText(harness.childDocument.title).waitFor({ state: 'visible', timeout: 20000 })
  metrics.customParentCollectionQueueRowsVisible = true
  captures.homeReadingQueue = await captureLocatorScreenshot(
    page,
    queueRegion,
    directory,
    `${stagePrefix}-home-reading-queue.png`,
  )

  await queueRegion.getByRole('button', { name: 'Show unread reading queue' }).click()
  await queueRegion.getByText(harness.childDocument.title).waitFor({ state: 'visible', timeout: 20000 })
  const childVisibleInUnread = await queueRegion.getByText(harness.childDocument.title).isVisible()
  await queueRegion.getByRole('button', { name: 'Show in-progress reading queue' }).click()
  await queueRegion.getByText(harness.rootDocument.title).waitFor({ state: 'visible', timeout: 20000 })
  const rootVisibleInProgress = await queueRegion.getByText(harness.rootDocument.title).isVisible()
  metrics.homeReadingQueueStateFiltersWork = childVisibleInUnread && rootVisibleInProgress

  await queueRegion.getByRole('button', { name: `Continue reading ${harness.rootDocument.title}` }).click()
  await page.waitForURL(
    (url) =>
      url.pathname === '/reader' &&
      url.searchParams.get('document') === harness.rootDocument.id &&
      url.searchParams.get('sentenceStart') === '1' &&
      url.searchParams.get('queueCollectionId') === harness.rootCollectionId,
    { timeout: 20000 },
  )
  metrics.homeReadingQueueContinueOpensReader = true
  await page.goto(
    `${baseUrl}/reader?document=${encodeURIComponent(harness.rootDocument.id)}&queueCollectionId=${encodeURIComponent(harness.rootCollectionId)}&queueState=all`,
    { waitUntil: 'networkidle' },
  )
  const nextQueueButton = page.getByRole('button', { name: 'Next in queue' })
  await nextQueueButton.waitFor({ state: 'visible', timeout: 20000 })
  metrics.readerNextInQueueVisible = true
  captures.readerQueueNext = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-reader-next-in-queue.png`,
  )
  await nextQueueButton.click()
  await page.waitForURL(
    (url) =>
      url.pathname === '/reader' &&
      url.searchParams.get('document') !== harness.rootDocument.id &&
      url.searchParams.get('queueCollectionId') === harness.rootCollectionId,
    { timeout: 20000 },
  )
  metrics.readerNextInQueueAdvancesWithinScope = true
  const nextReaderDocumentId = new URL(page.url()).searchParams.get('document')
  const nextReaderView = nextReaderDocumentId
    ? await fetchJson(
        `${baseUrl}/api/documents/${encodeURIComponent(nextReaderDocumentId)}/view?mode=reflowed&detail_level=default`,
      ).catch(() => null)
    : null
  metrics.readerGeneratedOutputsFrozen =
    nextReaderDocumentId !== null &&
    nextReaderDocumentId !== harness.rootDocument.id &&
    nextReaderView?.mode === 'reflowed' &&
    JSON.stringify(nextReaderView).includes('Stage 975')

  await openSourceOverviewFromReader({ documentId: harness.rootDocument.id, page, rootCollectionId: harness.rootCollectionId, baseUrl })
  const sourceReadingContext = page.getByRole('region', { name: 'Source reading context' })
  await sourceReadingContext.waitFor({ state: 'visible', timeout: 20000 })
  const sourceReadingContextHandle = await sourceReadingContext.elementHandle()
  await page
    .waitForFunction(
      (element) => {
        const text = element?.textContent ?? ''
        return text.includes('Sentence 2') && text.includes('Highlighted passage') && text.includes('Resume in Reader')
      },
      sourceReadingContextHandle,
      { timeout: 20000 },
    )
    .catch(() => undefined)
  const sourceReadingContextText = (await sourceReadingContext.textContent().catch(() => '')) ?? ''
  metrics.sourceOverviewReadingContextVisible =
    sourceReadingContextText.includes('Sentence 2') &&
    sourceReadingContextText.includes('Highlighted passage') &&
    sourceReadingContextText.includes('Resume in Reader')
  metrics.sourceOverviewMarkCompleteVisible = await sourceReadingContext
    .getByRole('button', { name: 'Mark complete' })
    .isVisible()
  const sourceHighlightList = page.getByRole('list', { name: 'Source highlight review' })
  await sourceHighlightList.waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceOverviewHighlightActionsVisible =
    (await sourceHighlightList.getByRole('button', { name: 'Open in Reader' }).isVisible()) &&
    (await sourceHighlightList.getByRole('button', { name: 'Open in Notebook' }).isVisible()) &&
    (await sourceHighlightList.getByRole('button', { name: `Create Study card from ${harness.rootDocument.title}` }).isVisible())
  captures.sourceReadingContext = await captureLocatorScreenshot(
    page,
    sourceReadingContext,
    directory,
    `${stagePrefix}-source-reading-context.png`,
  )

  await sourceHighlightList.getByRole('button', { name: 'Open in Reader' }).click()
  await page.waitForURL(
    (url) =>
      url.pathname === '/reader' &&
      url.searchParams.get('document') === harness.rootDocument.id &&
      url.searchParams.get('sentenceStart') === '1',
    { timeout: 20000 },
  )
  metrics.highlightOpenReaderWorks = true

  await openSourceOverviewFromReader({ documentId: harness.rootDocument.id, page, rootCollectionId: harness.rootCollectionId, baseUrl })
  const sourceReadingContextForNotebook = page.getByRole('region', { name: 'Source reading context' })
  await sourceReadingContextForNotebook.waitFor({ state: 'visible', timeout: 20000 })
  const sourceHighlightListForNotebook = page.getByRole('list', { name: 'Source highlight review' })
  await sourceHighlightListForNotebook.getByRole('button', { name: 'Open in Notebook' }).click()
  await page.getByRole('heading', { name: 'Note detail' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('textbox', { name: 'Note text' }).waitFor({ state: 'visible', timeout: 20000 })
  const notebookNoteText = await page.getByRole('textbox', { name: 'Note text' }).inputValue()
  if (!notebookNoteText.includes(harness.noteBody)) {
    throw new Error(`Expected Notebook note detail to show the highlighted note body, found ${notebookNoteText}.`)
  }
  metrics.highlightOpenNotebookWorks = true
  captures.notebookHighlightDetail = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-notebook-highlight-detail.png`,
  )

  await openSourceOverviewFromReader({ documentId: harness.rootDocument.id, page, rootCollectionId: harness.rootCollectionId, baseUrl })
  const sourceReadingContextForStudy = page.getByRole('region', { name: 'Source reading context' })
  await sourceReadingContextForStudy.waitFor({ state: 'visible', timeout: 20000 })
  await page
    .getByRole('list', { name: 'Source highlight review' })
    .getByRole('button', { name: `Create Study card from ${harness.rootDocument.title}` })
    .click()
  const promoteRegion = page.locator('[data-notebook-action-seam="promote-note"], .recall-note-promotion-card').first()
  await promoteRegion.waitFor({ state: 'attached', timeout: 20000 })
  await promoteRegion.scrollIntoViewIfNeeded()
  await promoteRegion.getByRole('tab', { name: 'Create Study Card', selected: true }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await promoteRegion.getByText('Study prompt').waitFor({ state: 'visible', timeout: 20000 })
  metrics.highlightCreateStudyOpensPromotion = true
  captures.highlightStudyPromotion = await captureLocatorScreenshot(
    page,
    promoteRegion,
    directory,
    `${stagePrefix}-highlight-study-promotion.png`,
  )

  await openSourceOverviewFromReader({ documentId: harness.rootDocument.id, page, rootCollectionId: harness.rootCollectionId, baseUrl })
  const sourceReadingContextForComplete = page.getByRole('region', { name: 'Source reading context' })
  await sourceReadingContextForComplete.waitFor({ state: 'visible', timeout: 20000 })
  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes(`/api/recall/documents/${encodeURIComponent(harness.rootDocument.id)}/reading/complete`),
    ),
    sourceReadingContextForComplete.getByRole('button', { name: 'Mark complete' }).click(),
  ])
  const completedAfterSource = await fetchJson(
    `${baseUrl}/api/recall/library/reading-queue?collection_id=${encodeURIComponent(harness.rootCollectionId)}&state=completed&limit=50`,
  )
  metrics.sourceOverviewMarkCompleteUpdatesProgress = completedAfterSource.rows?.some(
    (row) => row.id === harness.rootDocument.id && row.progress_percent === 100,
  )

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.rootCollectionName })
    .first()
    .click()
  const queueRegionForComplete = page.getByRole('region', { name: 'Reading queue' })
  await queueRegionForComplete.waitFor({ state: 'visible', timeout: 20000 })
  await queueRegionForComplete.getByRole('button', { name: 'Show in-progress reading queue' }).click()
  await queueRegionForComplete.getByText(harness.markCompleteDocument.title).waitFor({ state: 'visible', timeout: 20000 })
  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes(`/api/recall/documents/${encodeURIComponent(harness.markCompleteDocument.id)}/reading/complete`),
    ),
    queueRegionForComplete
      .getByRole('button', { name: `Mark ${harness.markCompleteDocument.title} complete` })
      .click(),
  ])
  await queueRegionForComplete.getByRole('button', { name: 'Show completed reading queue' }).click()
  await queueRegionForComplete.getByText(harness.markCompleteDocument.title).waitFor({ state: 'visible', timeout: 20000 })
  metrics.homeReadingQueueMarkCompleteUpdatesProgress = true
  captures.homeReadingQueueCompleted = await captureLocatorScreenshot(
    page,
    queueRegionForComplete,
    directory,
    `${stagePrefix}-home-reading-queue-completed.png`,
  )

  await writeFile(
    path.join(directory, `${stagePrefix}-validation.json`),
    JSON.stringify({ captures, metrics, stageLabel: harness.stageLabel }, null, 2),
  )

  return { captures, metrics }
}

async function createLibraryReadingQueueHarness({ baseUrl, stageLabel, stagePrefix }) {
  const timestamp = Date.now()
  const rootCollectionId = `collection:${stagePrefix}-root-${timestamp}`
  const childCollectionId = `collection:${stagePrefix}-child-${timestamp}`
  const rootCollectionName = `${stageLabel} Queue Root`
  const childCollectionName = `${stageLabel} Queue Child`
  const noteBody = `${stageLabel} highlighted queue insight ${timestamp}`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }

  const rootDocument = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} root opener. ${stageLabel} root highlighted sentence. ${stageLabel} root close.`,
    title: `${stageLabel} Queue Primary ${timestamp}`,
  })
  const markCompleteDocument = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} home completion opener. ${stageLabel} home completion middle. ${stageLabel} home completion close.`,
    title: `${stageLabel} Queue Complete ${timestamp}`,
  })
  const childDocument = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} child unread opener. ${stageLabel} child unread middle. ${stageLabel} child unread close.`,
    title: `${stageLabel} Queue Child ${timestamp}`,
  })

  await putJson(`${baseUrl}/api/documents/${encodeURIComponent(rootDocument.id)}/progress`, {
    mode: 'reflowed',
    sentence_index: 1,
  })
  await putJson(`${baseUrl}/api/documents/${encodeURIComponent(markCompleteDocument.id)}/progress`, {
    mode: 'reflowed',
    sentence_index: 1,
  })

  const view = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(rootDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  const note = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(rootDocument.id)}/notes`, {
    anchor: buildNoteAnchor(rootDocument.id, view, { sentenceStart: 1, sentenceEnd: 1 }),
    body_text: noteBody,
  })
  const card = await postJson(`${baseUrl}/api/recall/study/cards`, {
    answer: `${stageLabel} source-owned answer`,
    card_type: 'flashcard',
    prompt: `${stageLabel} source-owned prompt?`,
    source_document_id: rootDocument.id,
  })

  const now = new Date().toISOString()
  await putJson(`${baseUrl}/api/recall/library/settings`, {
    custom_collections: [
      ...(originalLibrarySettings.custom_collections ?? []),
      {
        created_at: now,
        document_ids: [rootDocument.id, markCompleteDocument.id],
        id: rootCollectionId,
        name: rootCollectionName,
        origin: 'manual',
        parent_id: null,
        sort_index: 0,
        updated_at: now,
      },
      {
        created_at: now,
        document_ids: [childDocument.id],
        id: childCollectionId,
        name: childCollectionName,
        origin: 'manual',
        parent_id: rootCollectionId,
        sort_index: 1,
        updated_at: now,
      },
    ],
  })

  return {
    card,
    childCollectionId,
    childCollectionName,
    childDocument,
    markCompleteDocument,
    note,
    noteBody,
    originalLibrarySettings,
    rootCollectionId,
    rootCollectionName,
    rootDocument,
    stageLabel,
  }
}

async function cleanupLibraryReadingQueueHarness({ baseUrl, harness }) {
  const metrics = {
    cleanupUtilityDryRunMatchedAfterLibraryReadingQueue: null,
    libraryReadingQueueHarnessCardsDeleted: false,
    libraryReadingQueueHarnessDocumentsDeleted: false,
    libraryReadingQueueHarnessLibrarySettingsRestored: false,
    libraryReadingQueueHarnessNotesDeleted: false,
  }

  const settingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`, {
    body: JSON.stringify(harness.originalLibrarySettings),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  }).catch(() => null)
  metrics.libraryReadingQueueHarnessLibrarySettingsRestored = Boolean(settingsResponse?.ok)

  const noteResponse = await fetch(`${baseUrl}/api/recall/notes/${encodeURIComponent(harness.note.id)}`, {
    method: 'DELETE',
  }).catch(() => null)
  metrics.libraryReadingQueueHarnessNotesDeleted = Boolean(noteResponse?.ok || noteResponse?.status === 404)

  const cardResponse = await fetch(`${baseUrl}/api/recall/study/cards/${encodeURIComponent(harness.card.id)}`, {
    method: 'DELETE',
  }).catch(() => null)
  metrics.libraryReadingQueueHarnessCardsDeleted = Boolean(cardResponse?.ok || cardResponse?.status === 404)

  const documentResults = await Promise.all(
    [harness.rootDocument.id, harness.markCompleteDocument.id, harness.childDocument.id].map((documentId) =>
      fetch(`${baseUrl}/api/documents/${encodeURIComponent(documentId)}`, { method: 'DELETE' }).catch(() => null),
    ),
  )
  metrics.libraryReadingQueueHarnessDocumentsDeleted = documentResults.every(
    (response) => response?.ok || response?.status === 404,
  )

  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl }).catch(() => ({ matchedCount: null }))
  metrics.cleanupUtilityDryRunMatchedAfterLibraryReadingQueue = cleanupDryRun.matchedCount
  return metrics
}

async function openSourceOverviewFromReader({ baseUrl, documentId, page, rootCollectionId }) {
  await page.goto(
    `${baseUrl}/reader?document=${encodeURIComponent(documentId)}&queueCollectionId=${encodeURIComponent(rootCollectionId)}&queueState=all`,
    { waitUntil: 'networkidle' },
  )
  await page.getByRole('heading').filter({ hasText: /Stage 975|Queue Primary|Queue Complete|Queue Child/ }).first()
    .waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('button', { name: 'Open source collections' }).click()
  await page.waitForURL((url) => url.pathname === '/recall', { timeout: 20000 })
  const overviewTab = page.getByRole('tab', { name: 'Overview' })
  if (await overviewTab.isVisible().catch(() => false)) {
    await overviewTab.click()
  }
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
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
