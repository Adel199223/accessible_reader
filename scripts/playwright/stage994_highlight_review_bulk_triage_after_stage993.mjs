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
const outputDir = process.env.RECALL_STAGE994_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE994_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE994_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE994_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE994_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE994_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage994-highlight-review-bulk-triage-failure.png'), { force: true })

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
  harness = await createHighlightReviewBulkTriageHarness({ baseUrl, stageLabel: 'Stage 994' })
  const captures = {}
  const metrics = {
    cleanupUtilityDryRunMatchedAfterStage994: null,
    homeBulkMarkReviewedSelectedVisible: false,
    homeBulkTriageSeamVisible: false,
    homeReviewedFilterShowsBulkReviewedRows: false,
    readerGeneratedOutputsFrozen: false,
    rowHandoffsPreserved: false,
    sourceBulkDismissSelectedVisible: false,
    sourceBulkRestoreSelectedVisible: false,
    sourceBulkTriageSeamVisible: false,
    stage992NextActionsPreserved: false,
  }

  const readerView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(harness.homeDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  metrics.readerGeneratedOutputsFrozen =
    readerView?.mode === 'reflowed' && JSON.stringify(readerView).includes('Stage 994 home bulk target one')

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()

  const collectionReview = page.getByRole('region', { name: 'Collection highlight review', exact: true })
  await collectionReview.waitFor({ state: 'visible', timeout: 20000 })
  await collectionReview.getByText(harness.homeNoteBodyA).waitFor({ state: 'visible', timeout: 20000 })
  await collectionReview.getByText(harness.homeNoteBodyB).waitFor({ state: 'visible', timeout: 20000 })
  const homeBulkActions = collectionReview.locator('[data-highlight-review-bulk-actions-stage994="home"]')
  await homeBulkActions.waitFor({ state: 'visible', timeout: 20000 })
  const homeRowCheckboxCount = await collectionReview.locator('[data-highlight-review-row-select-stage994="home"]').count()
  metrics.homeBulkTriageSeamVisible =
    (await homeBulkActions.getByText('Bulk triage').isVisible()) &&
    (await homeBulkActions.getByRole('button', { name: 'Select visible highlights' }).isVisible()) &&
    homeRowCheckboxCount >= 2
  const homeNextActions = collectionReview.locator('[data-highlight-review-next-actions-stage992="home"]')
  metrics.stage992NextActionsPreserved =
    (await homeNextActions.getByText('Next action').isVisible()) &&
    (await homeNextActions.getByRole('button', { name: 'Create Study cards' }).isVisible())
  metrics.rowHandoffsPreserved =
    (await collectionReview.getByRole('button', { name: `Create Study card from ${harness.homeDocument.title}` }).first().isVisible()) &&
    (await collectionReview.getByRole('button', { name: 'Open in Notebook' }).first().isVisible())
  captures.homeBulkTriageBeforeReview = await captureLocatorScreenshot(
    page,
    collectionReview,
    outputDir,
    'stage994-home-highlight-review-bulk-triage-before-review.png',
  )

  await homeBulkActions.getByRole('button', { name: 'Select visible highlights' }).click()
  await homeBulkActions.getByText('2 selected').waitFor({ state: 'visible', timeout: 20000 })
  await homeBulkActions.getByRole('button', { name: 'Mark selected reviewed' }).click()
  await waitForHighlightInboxRows({
    baseUrl,
    collectionId: harness.collectionId,
    noteIds: [harness.homeNoteA.id, harness.homeNoteB.id],
    reviewState: 'reviewed',
    state: 'reviewed',
  })
  metrics.homeBulkMarkReviewedSelectedVisible = true

  await collectionReview.getByRole('button', { name: 'Show reviewed highlights' }).click()
  await collectionReview.getByText(harness.homeNoteBodyA).waitFor({ state: 'visible', timeout: 20000 })
  await collectionReview.getByText(harness.homeNoteBodyB).waitFor({ state: 'visible', timeout: 20000 })
  metrics.homeReviewedFilterShowsBulkReviewedRows = true
  captures.homeBulkReviewedFilter = await captureLocatorScreenshot(
    page,
    collectionReview,
    outputDir,
    'stage994-home-highlight-review-bulk-reviewed-filter.png',
  )

  await patchJson(`${baseUrl}/api/recall/notes/${encodeURIComponent(harness.sourceNoteA.id)}/review-state`, {
    review_state: 'unreviewed',
  })
  await patchJson(`${baseUrl}/api/recall/notes/${encodeURIComponent(harness.sourceNoteB.id)}/review-state`, {
    review_state: 'unreviewed',
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
  await readingQueue.getByRole('button', { name: `Review highlights for ${harness.sourceDocument.title}` }).click()
  const sourceReview = page.getByRole('region', { name: 'Source highlight review', exact: true })
  await sourceReview.waitFor({ state: 'visible', timeout: 20000 })
  await sourceReview.getByText(harness.sourceNoteBodyA).waitFor({ state: 'visible', timeout: 20000 })
  await sourceReview.getByText(harness.sourceNoteBodyB).waitFor({ state: 'visible', timeout: 20000 })
  const sourceBulkActions = sourceReview.locator('[data-highlight-review-bulk-actions-stage994="source"]')
  await sourceBulkActions.waitFor({ state: 'visible', timeout: 20000 })
  const sourceRowCheckboxCount = await sourceReview.locator('[data-highlight-review-row-select-stage994="source"]').count()
  metrics.sourceBulkTriageSeamVisible =
    (await sourceBulkActions.getByText('Bulk triage').isVisible()) &&
    (await sourceBulkActions.getByRole('button', { name: 'Select visible highlights' }).isVisible()) &&
    sourceRowCheckboxCount >= 2
  captures.sourceBulkTriageBeforeDismiss = await captureLocatorScreenshot(
    page,
    sourceReview,
    outputDir,
    'stage994-source-highlight-review-bulk-triage-before-dismiss.png',
  )

  await sourceBulkActions.getByRole('button', { name: 'Select visible highlights' }).click()
  await sourceBulkActions.getByText('2 selected').waitFor({ state: 'visible', timeout: 20000 })
  await sourceBulkActions.getByRole('button', { name: 'Dismiss selected' }).click()
  await waitForHighlightInboxRows({
    baseUrl,
    noteIds: [harness.sourceNoteA.id, harness.sourceNoteB.id],
    reviewState: 'dismissed',
    sourceDocumentId: harness.sourceDocument.id,
    state: 'dismissed',
  })
  await sourceReview.getByRole('button', { name: 'Show dismissed highlights' }).click()
  await sourceReview.getByText(harness.sourceNoteBodyA).waitFor({ state: 'visible', timeout: 20000 })
  await sourceReview.getByText(harness.sourceNoteBodyB).waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceBulkDismissSelectedVisible = true
  captures.sourceBulkDismissedFilter = await captureLocatorScreenshot(
    page,
    sourceReview,
    outputDir,
    'stage994-source-highlight-review-bulk-dismissed-filter.png',
  )

  await sourceBulkActions.getByRole('button', { name: 'Select visible highlights' }).click()
  await sourceBulkActions.getByText('2 selected').waitFor({ state: 'visible', timeout: 20000 })
  await sourceBulkActions.getByRole('button', { name: 'Restore selected' }).click()
  await waitForHighlightInboxRows({
    baseUrl,
    noteIds: [harness.sourceNoteA.id, harness.sourceNoteB.id],
    reviewState: 'unreviewed',
    sourceDocumentId: harness.sourceDocument.id,
    state: 'needs_review',
  })
  await sourceReview.getByRole('button', { name: 'Show highlights needing review' }).click()
  await sourceReview.getByText(harness.sourceNoteBodyA).waitFor({ state: 'visible', timeout: 20000 })
  await sourceReview.getByText(harness.sourceNoteBodyB).waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceBulkRestoreSelectedVisible = true
  captures.sourceBulkRestoredNeedsReview = await captureLocatorScreenshot(
    page,
    sourceReview,
    outputDir,
    'stage994-source-highlight-review-bulk-restored-needs-review.png',
  )

  await cleanupHighlightReviewBulkTriageHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage994 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage994: 0,
    homeBulkMarkReviewedSelectedVisible: true,
    homeBulkTriageSeamVisible: true,
    homeReviewedFilterShowsBulkReviewedRows: true,
    readerGeneratedOutputsFrozen: true,
    rowHandoffsPreserved: true,
    sourceBulkDismissSelectedVisible: true,
    sourceBulkRestoreSelectedVisible: true,
    sourceBulkTriageSeamVisible: true,
    stage992NextActionsPreserved: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(
        `Stage 994 expected ${metricName}: ${expected}, got ${metrics[metricName]}. Metrics: ${JSON.stringify(
          metrics,
        )}`,
      )
    }
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage994-highlight-review-bulk-triage-after-stage993',
  }
  await writeFile(
    path.join(outputDir, 'stage994-highlight-review-bulk-triage-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(page, outputDir, 'stage994-highlight-review-bulk-triage-failure.png').catch(() => null)
  throw error
} finally {
  await cleanupHighlightReviewBulkTriageHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 994 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

async function createHighlightReviewBulkTriageHarness({ baseUrl, stageLabel }) {
  const timestamp = Date.now()
  const collectionId = `collection:stage994-highlight-bulk-triage-${timestamp}`
  const collectionName = `${stageLabel} Highlight Bulk Triage`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }

  const homeDocument = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} home opener. ${stageLabel} home bulk target one. ${stageLabel} home bulk target two.`,
    title: `${stageLabel} Highlight Bulk Home Source ${timestamp}`,
  })
  const homeView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(homeDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  const homeNoteBodyA = `${stageLabel} home bulk review note one ${timestamp}`
  const homeNoteBodyB = `${stageLabel} home bulk review note two ${timestamp}`
  const homeNoteA = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(homeDocument.id)}/notes`, {
    anchor: buildNoteAnchor(homeDocument.id, homeView, { sentenceStart: 1, sentenceEnd: 1 }),
    body_text: homeNoteBodyA,
  })
  const homeNoteB = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(homeDocument.id)}/notes`, {
    anchor: buildNoteAnchor(homeDocument.id, homeView, { sentenceStart: 2, sentenceEnd: 2 }),
    body_text: homeNoteBodyB,
  })

  const sourceDocument = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} source opener. ${stageLabel} source bulk target one. ${stageLabel} source bulk target two.`,
    title: `${stageLabel} Highlight Bulk Source ${timestamp}`,
  })
  const sourceView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(sourceDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  const sourceNoteBodyA = `${stageLabel} source bulk review note one ${timestamp}`
  const sourceNoteBodyB = `${stageLabel} source bulk review note two ${timestamp}`
  const sourceNoteA = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(sourceDocument.id)}/notes`, {
    anchor: buildNoteAnchor(sourceDocument.id, sourceView, { sentenceStart: 1, sentenceEnd: 1 }),
    body_text: sourceNoteBodyA,
  })
  const sourceNoteB = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(sourceDocument.id)}/notes`, {
    anchor: buildNoteAnchor(sourceDocument.id, sourceView, { sentenceStart: 2, sentenceEnd: 2 }),
    body_text: sourceNoteBodyB,
  })
  await patchJson(`${baseUrl}/api/recall/notes/${encodeURIComponent(sourceNoteA.id)}/review-state`, {
    review_state: 'dismissed',
  })
  await patchJson(`${baseUrl}/api/recall/notes/${encodeURIComponent(sourceNoteB.id)}/review-state`, {
    review_state: 'dismissed',
  })

  const now = new Date().toISOString()
  await putJson(`${baseUrl}/api/recall/library/settings`, {
    custom_collections: [
      ...(originalLibrarySettings.custom_collections ?? []),
      {
        created_at: now,
        document_ids: [homeDocument.id, sourceDocument.id],
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
    homeDocument,
    homeNoteA,
    homeNoteB,
    homeNoteBodyA,
    homeNoteBodyB,
    originalLibrarySettings,
    sourceDocument,
    sourceNoteA,
    sourceNoteB,
    sourceNoteBodyA,
    sourceNoteBodyB,
  }
}

async function cleanupHighlightReviewBulkTriageHarness({ baseUrl, harness }) {
  if (!harness) {
    return
  }
  await fetch(`${baseUrl}/api/recall/library/settings`, {
    body: JSON.stringify(harness.originalLibrarySettings),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  }).catch(() => null)
  const notes = [harness.homeNoteA, harness.homeNoteB, harness.sourceNoteA, harness.sourceNoteB].filter(Boolean)
  await Promise.all(
    notes.map((note) =>
      fetch(`${baseUrl}/api/recall/notes/${encodeURIComponent(note.id)}`, { method: 'DELETE' }).catch(() => null),
    ),
  )
  const documents = [harness.homeDocument, harness.sourceDocument].filter(Boolean)
  await Promise.all(
    documents.map((document) =>
      fetch(`${baseUrl}/api/documents/${encodeURIComponent(document.id)}`, { method: 'DELETE' }).catch(() => null),
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

async function waitForHighlightInboxRows({
  baseUrl,
  collectionId = null,
  noteIds,
  reviewState,
  sourceDocumentId = null,
  state,
  timeoutMs = 10000,
}) {
  const startedAt = Date.now()
  let lastPayload = null
  while (Date.now() - startedAt < timeoutMs) {
    const params = new URLSearchParams({ limit: '50', state })
    if (collectionId) {
      params.set('collection_id', collectionId)
    }
    if (sourceDocumentId) {
      params.set('source_document_id', sourceDocumentId)
    }
    lastPayload = await fetchJson(`${baseUrl}/api/recall/library/highlight-review-inbox?${params.toString()}`)
    const matchedIds = new Set(
      (lastPayload.rows ?? [])
        .filter((row) => noteIds.includes(row.note_id) && row.review_state === reviewState)
        .map((row) => row.note_id),
    )
    if (noteIds.every((noteId) => matchedIds.has(noteId))) {
      return lastPayload
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(
    `Timed out waiting for highlight review rows ${noteIds.join(', ')} in ${state}/${reviewState}: ${JSON.stringify(
      lastPayload,
    )}`,
  )
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
