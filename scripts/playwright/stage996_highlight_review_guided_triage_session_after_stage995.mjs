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
const outputDir = process.env.RECALL_STAGE996_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE996_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE996_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE996_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE996_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE996_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage996-highlight-review-guided-session-failure.png'), { force: true })

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
  harness = await createHighlightReviewGuidedSessionHarness({ baseUrl, stageLabel: 'Stage 996' })
  const captures = {}
  const metrics = {
    cleanupUtilityDryRunMatchedAfterStage996: null,
    homeDismissedFilterRecoversSessionDismissedRow: false,
    homeGuidedSessionCompletes: false,
    homeGuidedSessionMarksReviewedAndAdvances: false,
    homeGuidedSessionSeamVisible: false,
    homeReviewedFilterRecoversSessionReviewedRow: false,
    readerGeneratedOutputsFrozen: false,
    rowHandoffsPreserved: false,
    sourceSelectedSessionDismissesOnlySelected: false,
    sourceSelectedSessionSeamVisible: false,
    sourceUnselectedRowRemainsNeedsReview: false,
    stage992NextActionsPreserved: false,
    stage994BulkTriagePreserved: false,
  }

  const readerView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(harness.homeDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  metrics.readerGeneratedOutputsFrozen =
    readerView?.mode === 'reflowed' && JSON.stringify(readerView).includes('Stage 996 home guided target one')

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
  const homeVisibleBefore = await fetchHighlightInbox({
    baseUrl,
    collectionId: harness.collectionId,
    state: 'needs_review',
  })
  const homeSessionRows = homeVisibleBefore.rows.filter((row) =>
    [harness.homeNoteA.id, harness.homeNoteB.id].includes(row.note_id),
  )
  if (homeSessionRows.length !== 2) {
    throw new Error(`Expected two home session rows, got ${JSON.stringify(homeVisibleBefore.rows)}`)
  }
  const [homeFirstRow, homeSecondRow] = homeSessionRows
  const homeFirstBody = rowPreview(homeFirstRow)
  const homeSecondBody = rowPreview(homeSecondRow)
  const homeSession = collectionReview.locator('[data-highlight-review-session-stage996="home"]')
  await homeSession.waitFor({ state: 'visible', timeout: 20000 })
  const homeBulkActions = collectionReview.locator('[data-highlight-review-bulk-actions-stage994="home"]')
  const homeNextActions = collectionReview.locator('[data-highlight-review-next-actions-stage992="home"]')
  metrics.homeGuidedSessionSeamVisible =
    (await homeSession.getByText('Review session').isVisible()) &&
    (await homeSession.getByRole('button', { name: 'Start visible review' }).isVisible()) &&
    (await homeSession.getByRole('button', { name: 'Review selected' }).isVisible())
  metrics.stage994BulkTriagePreserved =
    (await homeBulkActions.getByText('Bulk triage').isVisible()) &&
    (await homeBulkActions.getByRole('button', { name: 'Select visible highlights' }).isVisible())
  metrics.stage992NextActionsPreserved =
    (await homeNextActions.getByText('Next action').isVisible()) &&
    (await homeNextActions.getByRole('button', { name: 'Create Study cards' }).isVisible())
  metrics.rowHandoffsPreserved =
    (await collectionReview.getByRole('button', { name: `Create Study card from ${harness.homeDocument.title}` }).first().isVisible()) &&
    (await collectionReview.getByRole('button', { name: 'Open in Notebook' }).first().isVisible())
  captures.homeGuidedSessionBeforeStart = await captureLocatorScreenshot(
    page,
    collectionReview,
    outputDir,
    'stage996-home-highlight-review-guided-session-before-start.png',
  )

  await homeSession.getByRole('button', { name: 'Start visible review' }).click()
  await homeSession.getByText('1 of 2').waitFor({ state: 'visible', timeout: 20000 })
  await homeSession.getByText(homeFirstBody).waitFor({ state: 'visible', timeout: 20000 })
  captures.homeGuidedSessionFirstRow = await captureLocatorScreenshot(
    page,
    collectionReview,
    outputDir,
    'stage996-home-highlight-review-guided-session-first-row.png',
  )
  await homeSession.getByRole('button', { name: 'Mark reviewed' }).click()
  await waitForHighlightInboxRows({
    baseUrl,
    collectionId: harness.collectionId,
    noteIds: [homeFirstRow.note_id],
    reviewState: 'reviewed',
    state: 'reviewed',
  })
  await homeSession.getByText('2 of 2').waitFor({ state: 'visible', timeout: 20000 })
  await homeSession.getByText(homeSecondBody).waitFor({ state: 'visible', timeout: 20000 })
  metrics.homeGuidedSessionMarksReviewedAndAdvances = true
  captures.homeGuidedSessionSecondRow = await captureLocatorScreenshot(
    page,
    collectionReview,
    outputDir,
    'stage996-home-highlight-review-guided-session-second-row.png',
  )
  await homeSession.getByRole('button', { name: 'Dismiss' }).click()
  await waitForHighlightInboxRows({
    baseUrl,
    collectionId: harness.collectionId,
    noteIds: [homeSecondRow.note_id],
    reviewState: 'dismissed',
    state: 'dismissed',
  })
  await homeSession.getByText('Session complete.', { exact: true }).waitFor({ state: 'visible', timeout: 20000 })
  metrics.homeGuidedSessionCompletes = true

  await collectionReview.getByRole('button', { name: 'Show reviewed highlights' }).click()
  await collectionReview.getByText(homeFirstBody).waitFor({ state: 'visible', timeout: 20000 })
  metrics.homeReviewedFilterRecoversSessionReviewedRow = true
  await collectionReview.getByRole('button', { name: 'Show dismissed highlights' }).click()
  await collectionReview.getByText(homeSecondBody).waitFor({ state: 'visible', timeout: 20000 })
  metrics.homeDismissedFilterRecoversSessionDismissedRow = true
  captures.homeGuidedSessionRecoverableFilters = await captureLocatorScreenshot(
    page,
    collectionReview,
    outputDir,
    'stage996-home-highlight-review-guided-session-recoverable-filters.png',
  )

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  const homeReviewForSource = page.getByRole('region', { name: 'Collection highlight review', exact: true })
  await homeReviewForSource.waitFor({ state: 'visible', timeout: 20000 })
  await homeReviewForSource.getByRole('button', { name: 'Show all highlights' }).click()
  await homeReviewForSource.getByText(harness.sourceNoteBodyA).waitFor({ state: 'visible', timeout: 20000 })
  const sourceLaunchRow = homeReviewForSource.locator('[data-highlight-review-row-state-stage976]').filter({
    hasText: harness.sourceNoteBodyA,
  })
  await sourceLaunchRow.getByRole('button', { name: 'Open in Notebook' }).click()
  const overviewTab = page.locator('button').filter({ hasText: 'Overview' }).first()
  await overviewTab.waitFor({ state: 'visible', timeout: 20000 })
  await overviewTab.click()
  const sourceReview = page.getByRole('region', { name: 'Source highlight review', exact: true })
  await sourceReview.waitFor({ state: 'visible', timeout: 20000 })
  await sourceReview.getByText(harness.sourceNoteBodyA).waitFor({ state: 'visible', timeout: 20000 })
  await sourceReview.getByText(harness.sourceNoteBodyB).waitFor({ state: 'visible', timeout: 20000 })
  const sourceSession = sourceReview.locator('[data-highlight-review-session-stage996="source"]')
  await sourceSession.waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceSelectedSessionSeamVisible =
    (await sourceSession.getByText('Review session').isVisible()) &&
    (await sourceSession.getByRole('button', { name: 'Review selected' }).isVisible())
  const sourceRowA = sourceReview.locator('[data-highlight-review-row-state-stage976]').filter({
    hasText: harness.sourceNoteBodyA,
  })
  await sourceRowA.locator('[data-highlight-review-row-select-stage994="source"]').check()
  await sourceSession.getByRole('button', { name: 'Review selected' }).click()
  await sourceSession.getByText('1 of 1').waitFor({ state: 'visible', timeout: 20000 })
  await sourceSession.getByText(harness.sourceNoteBodyA).waitFor({ state: 'visible', timeout: 20000 })
  captures.sourceSelectedGuidedSessionBeforeDismiss = await captureLocatorScreenshot(
    page,
    sourceReview,
    outputDir,
    'stage996-source-highlight-review-selected-guided-session-before-dismiss.png',
  )
  await sourceSession.getByRole('button', { name: 'Dismiss' }).click()
  await waitForHighlightInboxRows({
    baseUrl,
    noteIds: [harness.sourceNoteA.id],
    reviewState: 'dismissed',
    sourceDocumentId: harness.sourceDocument.id,
    state: 'dismissed',
  })
  await sourceSession.getByText('Session complete.', { exact: true }).waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceSelectedSessionDismissesOnlySelected = true

  const sourceNeedsReview = await fetchHighlightInbox({
    baseUrl,
    sourceDocumentId: harness.sourceDocument.id,
    state: 'needs_review',
  })
  metrics.sourceUnselectedRowRemainsNeedsReview =
    sourceNeedsReview.rows.some((row) => row.note_id === harness.sourceNoteB.id && row.review_state === 'unreviewed') &&
    !sourceNeedsReview.rows.some((row) => row.note_id === harness.sourceNoteA.id)
  await sourceReview.getByText(harness.sourceNoteBodyB).waitFor({ state: 'visible', timeout: 20000 })
  await sourceReview.getByRole('button', { name: 'Show dismissed highlights' }).click()
  await sourceReview.getByText(harness.sourceNoteBodyA).waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceUnselectedRowRemainsNeedsReview =
    metrics.sourceUnselectedRowRemainsNeedsReview &&
    !(await sourceReview.getByText(harness.sourceNoteBodyB).isVisible().catch(() => false))
  captures.sourceSelectedGuidedSessionDismissedFilter = await captureLocatorScreenshot(
    page,
    sourceReview,
    outputDir,
    'stage996-source-highlight-review-selected-guided-session-dismissed-filter.png',
  )

  await cleanupHighlightReviewGuidedSessionHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage996 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage996: 0,
    homeDismissedFilterRecoversSessionDismissedRow: true,
    homeGuidedSessionCompletes: true,
    homeGuidedSessionMarksReviewedAndAdvances: true,
    homeGuidedSessionSeamVisible: true,
    homeReviewedFilterRecoversSessionReviewedRow: true,
    readerGeneratedOutputsFrozen: true,
    rowHandoffsPreserved: true,
    sourceSelectedSessionDismissesOnlySelected: true,
    sourceSelectedSessionSeamVisible: true,
    sourceUnselectedRowRemainsNeedsReview: true,
    stage992NextActionsPreserved: true,
    stage994BulkTriagePreserved: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(
        `Stage 996 expected ${metricName}: ${expected}, got ${metrics[metricName]}. Metrics: ${JSON.stringify(
          metrics,
        )}`,
      )
    }
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage996-highlight-review-guided-triage-session-after-stage995',
  }
  await writeFile(
    path.join(outputDir, 'stage996-highlight-review-guided-triage-session-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(page, outputDir, 'stage996-highlight-review-guided-session-failure.png').catch(
    () => null,
  )
  throw error
} finally {
  await cleanupHighlightReviewGuidedSessionHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 996 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

async function createHighlightReviewGuidedSessionHarness({ baseUrl, stageLabel }) {
  const timestamp = Date.now()
  const collectionId = `collection:stage996-highlight-guided-session-${timestamp}`
  const collectionName = `${stageLabel} Highlight Guided Session`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }

  const homeDocument = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} home opener. ${stageLabel} home guided target one. ${stageLabel} home guided target two.`,
    title: `${stageLabel} Highlight Guided Home Source ${timestamp}`,
  })
  const homeView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(homeDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  const homeNoteBodyA = `${stageLabel} home guided review note one ${timestamp}`
  const homeNoteBodyB = `${stageLabel} home guided review note two ${timestamp}`
  const homeNoteA = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(homeDocument.id)}/notes`, {
    anchor: buildNoteAnchor(homeDocument.id, homeView, { sentenceStart: 1, sentenceEnd: 1 }),
    body_text: homeNoteBodyA,
  })
  const homeNoteB = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(homeDocument.id)}/notes`, {
    anchor: buildNoteAnchor(homeDocument.id, homeView, { sentenceStart: 2, sentenceEnd: 2 }),
    body_text: homeNoteBodyB,
  })

  const sourceDocument = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} source opener. ${stageLabel} source guided target one. ${stageLabel} source guided target two.`,
    title: `${stageLabel} Highlight Guided Source ${timestamp}`,
  })
  const sourceView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(sourceDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  const sourceNoteBodyA = `${stageLabel} source guided selected note ${timestamp}`
  const sourceNoteBodyB = `${stageLabel} source guided unselected note ${timestamp}`
  const sourceNoteA = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(sourceDocument.id)}/notes`, {
    anchor: buildNoteAnchor(sourceDocument.id, sourceView, { sentenceStart: 1, sentenceEnd: 1 }),
    body_text: sourceNoteBodyA,
  })
  const sourceNoteB = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(sourceDocument.id)}/notes`, {
    anchor: buildNoteAnchor(sourceDocument.id, sourceView, { sentenceStart: 2, sentenceEnd: 2 }),
    body_text: sourceNoteBodyB,
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

async function cleanupHighlightReviewGuidedSessionHarness({ baseUrl, harness }) {
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
    lastPayload = await fetchHighlightInbox({ baseUrl, collectionId, sourceDocumentId, state })
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

function fetchHighlightInbox({ baseUrl, collectionId = null, sourceDocumentId = null, state }) {
  const params = new URLSearchParams({ limit: '50', state })
  if (collectionId) {
    params.set('collection_id', collectionId)
  }
  if (sourceDocumentId) {
    params.set('source_document_id', sourceDocumentId)
  }
  return fetchJson(`${baseUrl}/api/recall/library/highlight-review-inbox?${params.toString()}`)
}

function rowPreview(row) {
  return row.body_preview ?? row.excerpt_preview ?? row.anchor_text
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
