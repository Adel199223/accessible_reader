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
const outputDir = process.env.RECALL_STAGE1002_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE1002_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE1002_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE1002_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE1002_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE1002_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage1002-home-graph-gap-queue-lens-failure.png'), { force: true })

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
  harness = await createHomeGraphGapQueueHarness({ baseUrl, stageLabel: 'Stage 1002' })
  const captures = {}
  const metrics = {
    cleanupUtilityDryRunMatchedAfterStage1002: null,
    collectionGraphGapQueueApiBeforeLimit: false,
    collectionGraphGapQueueSummaryCounts: false,
    homeGraphGapFilterRowsOnly: false,
    homeGraphGapFilterVisible: false,
    homeGraphGapReviewHandoffUsesUnconnected: false,
    notebookGraphPromotionFocusedGraph: false,
    readerGeneratedOutputsFrozen: false,
    sourceGuidedSessionGraphActionPreserved: false,
    sourceGraphGapResolvedAfterPromotion: false,
  }

  const graphGapQueue = await fetchJson(
    `${baseUrl}/api/recall/library/reading-queue?collection_id=${encodeURIComponent(
      harness.collectionId,
    )}&state=in_progress&learning_filter=graph_gaps&limit=1`,
  )
  metrics.collectionGraphGapQueueApiBeforeLimit =
    graphGapQueue.learning_filter === 'graph_gaps' &&
    graphGapQueue.rows?.length === 1 &&
    graphGapQueue.rows[0]?.id === harness.gapDocument.id &&
    graphGapQueue.rows[0]?.highlight_review_counts?.ungraphed === 1
  metrics.collectionGraphGapQueueSummaryCounts =
    graphGapQueue.learning_summary?.graph_gap_sources === 1 &&
    graphGapQueue.learning_summary?.needs_review_sources === 1 &&
    graphGapQueue.learning_summary?.covered_sources === 0

  const readerView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(harness.gapDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  metrics.readerGeneratedOutputsFrozen =
    readerView?.mode === 'reflowed' && JSON.stringify(readerView).includes('Stage 1002 graph gap target')

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()

  const readingQueue = page.getByRole('region', { name: 'Reading queue' })
  await readingQueue.waitFor({ state: 'visible', timeout: 20000 })
  await readingQueue.getByRole('button', { name: 'Show sources with Graph gaps' }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  metrics.homeGraphGapFilterVisible = true
  captures.homeGraphGapQueueAll = await captureLocatorScreenshot(
    page,
    readingQueue,
    outputDir,
    'stage1002-home-graph-gap-queue-all.png',
  )

  await readingQueue.getByRole('button', { name: 'Show sources with Graph gaps' }).click()
  await readingQueue.getByText(harness.gapDocument.title).waitFor({ state: 'visible', timeout: 20000 })
  await readingQueue.getByText('1 not in Graph').waitFor({ state: 'visible', timeout: 20000 })
  await hiddenReadingQueueRow(readingQueue, harness.connectedDocument.title)
  await hiddenReadingQueueRow(readingQueue, harness.dismissedDocument.title)
  metrics.homeGraphGapFilterRowsOnly = true
  captures.homeGraphGapQueueFiltered = await captureLocatorScreenshot(
    page,
    readingQueue,
    outputDir,
    'stage1002-home-graph-gap-queue-filtered.png',
  )

  await readingQueue.getByRole('button', { name: `Review highlights for ${harness.gapDocument.title}` }).click()
  const sourceReview = page.getByRole('region', { name: 'Source highlight review', exact: true })
  await sourceReview.waitFor({ state: 'visible', timeout: 20000 })
  await sourceReview.getByText(harness.gapNote.body_text).waitFor({ state: 'visible', timeout: 20000 })
  metrics.homeGraphGapReviewHandoffUsesUnconnected =
    (await sourceReview.getByText('Not in Graph').first().isVisible()) &&
    !(await sourceReview.getByText(harness.connectedNote.body_text).isVisible().catch(() => false))
  captures.sourceReviewFromGraphGapQueue = await captureLocatorScreenshot(
    page,
    sourceReview,
    outputDir,
    'stage1002-source-review-from-graph-gap-queue.png',
  )

  const sourceSession = sourceReview.locator('[data-highlight-review-session-stage996="source"]')
  await sourceSession.getByRole('button', { name: 'Start visible review' }).click()
  await sourceSession.getByText('1 of 1').waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceGuidedSessionGraphActionPreserved =
    (await sourceSession.getByText('Not in Graph').isVisible()) &&
    (await sourceSession.getByRole('button', { name: 'Create Graph node' }).isVisible())

  const gapRow = sourceReview.locator('[data-highlight-review-row-state-stage976]').filter({
    hasText: harness.gapNote.body_text,
  })
  await gapRow.getByRole('button', { name: 'Create Graph node' }).click()
  const workbench = page.getByRole('region', { name: 'Selected note workbench' })
  await workbench.waitFor({ state: 'visible', timeout: 20000 })
  await workbench.getByRole('tab', { name: 'Promote to Graph', selected: true }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await workbench.getByRole('textbox', { name: 'Graph label' }).fill(harness.gapGraphLabel)
  captures.notebookGraphPromotionFromGraphGapQueue = await captureLocatorScreenshot(
    page,
    workbench,
    outputDir,
    'stage1002-notebook-graph-promotion-from-graph-gap-queue.png',
  )
  await workbench.getByRole('button', { name: 'Promote node' }).click()
  await page.getByRole('tab', { name: 'Graph', selected: true }).first().waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('region', { name: `${harness.gapDocument.title} workspace` }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  metrics.notebookGraphPromotionFocusedGraph = true
  captures.focusedGraphAfterGraphGapPromotion = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1002-focused-graph-after-graph-gap-promotion.png',
  )

  const connectedInbox = await waitForGraphCoverage({
    baseUrl,
    collectionId: harness.collectionId,
    noteId: harness.gapNote.id,
    state: 'connected',
  })
  const connectedRow = connectedInbox.rows.find((row) => row.note_id === harness.gapNote.id)
  harness.gapGraphNodeId = connectedRow?.graph_node_id ?? null
  const resolvedGraphGapQueue = await fetchJson(
    `${baseUrl}/api/recall/library/reading-queue?collection_id=${encodeURIComponent(
      harness.collectionId,
    )}&state=in_progress&learning_filter=graph_gaps&limit=10`,
  )
  metrics.sourceGraphGapResolvedAfterPromotion =
    resolvedGraphGapQueue.learning_summary?.graph_gap_sources === 0 && resolvedGraphGapQueue.rows?.length === 0

  await cleanupHomeGraphGapQueueHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage1002 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage1002: 0,
    collectionGraphGapQueueApiBeforeLimit: true,
    collectionGraphGapQueueSummaryCounts: true,
    homeGraphGapFilterRowsOnly: true,
    homeGraphGapFilterVisible: true,
    homeGraphGapReviewHandoffUsesUnconnected: true,
    notebookGraphPromotionFocusedGraph: true,
    readerGeneratedOutputsFrozen: true,
    sourceGuidedSessionGraphActionPreserved: true,
    sourceGraphGapResolvedAfterPromotion: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(
        `Stage 1002 expected ${metricName}: ${expected}, got ${metrics[metricName]}. Metrics: ${JSON.stringify(
          metrics,
        )}`,
      )
    }
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage1002-home-graph-gap-learning-queue-lens-after-stage1001',
  }
  await writeFile(
    path.join(outputDir, 'stage1002-home-graph-gap-learning-queue-lens-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(page, outputDir, 'stage1002-home-graph-gap-queue-lens-failure.png').catch(() => null)
  throw error
} finally {
  await cleanupHomeGraphGapQueueHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 1002 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

async function createHomeGraphGapQueueHarness({ baseUrl, stageLabel }) {
  const timestamp = Date.now()
  const collectionId = `collection:stage1002-home-graph-gap-queue-${timestamp}`
  const collectionName = `${stageLabel} Graph Gap Queue`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }

  const gapDocument = await importHarnessDocument({
    baseUrl,
    bodyText: `${stageLabel} opener. ${stageLabel} graph gap target. ${stageLabel} graph gap closer.`,
    title: `${stageLabel} Graph Gap Source ${timestamp}`,
  })
  await putJson(`${baseUrl}/api/documents/${encodeURIComponent(gapDocument.id)}/progress`, {
    mode: 'reflowed',
    sentence_index: 1,
  })
  const gapView = await fetchDocumentView({ baseUrl, documentId: gapDocument.id })
  const gapNote = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(gapDocument.id)}/notes`, {
    anchor: buildNoteAnchor(gapDocument.id, gapView, { sentenceStart: 1, sentenceEnd: 1 }),
    body_text: `${stageLabel} unconnected Graph queue note ${timestamp}`,
  })

  const connectedDocument = await importHarnessDocument({
    baseUrl,
    bodyText: `${stageLabel} connected opener. ${stageLabel} connected graph target. ${stageLabel} connected closer.`,
    title: `${stageLabel} Connected Graph Source ${timestamp}`,
  })
  await putJson(`${baseUrl}/api/documents/${encodeURIComponent(connectedDocument.id)}/progress`, {
    mode: 'reflowed',
    sentence_index: 1,
  })
  const connectedView = await fetchDocumentView({ baseUrl, documentId: connectedDocument.id })
  const connectedNote = await postJson(
    `${baseUrl}/api/recall/documents/${encodeURIComponent(connectedDocument.id)}/notes`,
    {
      anchor: buildNoteAnchor(connectedDocument.id, connectedView, { sentenceStart: 1, sentenceEnd: 1 }),
      body_text: `${stageLabel} connected Graph queue note ${timestamp}`,
    },
  )
  const connectedGraphDetail = await postJson(
    `${baseUrl}/api/recall/notes/${encodeURIComponent(connectedNote.id)}/promote/graph-node`,
    {
      description: 'Temporary Stage 1002 connected graph queue node.',
      label: `${stageLabel} Connected Graph Queue Node ${timestamp}`,
    },
  )

  const dismissedDocument = await importHarnessDocument({
    baseUrl,
    bodyText: `${stageLabel} dismissed opener. ${stageLabel} dismissed graph target. ${stageLabel} dismissed closer.`,
    title: `${stageLabel} Dismissed Graph Source ${timestamp}`,
  })
  await putJson(`${baseUrl}/api/documents/${encodeURIComponent(dismissedDocument.id)}/progress`, {
    mode: 'reflowed',
    sentence_index: 1,
  })
  const dismissedView = await fetchDocumentView({ baseUrl, documentId: dismissedDocument.id })
  const dismissedNote = await postJson(
    `${baseUrl}/api/recall/documents/${encodeURIComponent(dismissedDocument.id)}/notes`,
    {
      anchor: buildNoteAnchor(dismissedDocument.id, dismissedView, { sentenceStart: 1, sentenceEnd: 1 }),
      body_text: `${stageLabel} dismissed Graph queue note ${timestamp}`,
    },
  )
  await patchJson(`${baseUrl}/api/recall/notes/${encodeURIComponent(dismissedNote.id)}/review-state`, {
    review_state: 'dismissed',
  })

  const now = new Date().toISOString()
  await putJson(`${baseUrl}/api/recall/library/settings`, {
    custom_collections: [
      ...(originalLibrarySettings.custom_collections ?? []),
      {
        created_at: now,
        document_ids: [gapDocument.id, connectedDocument.id, dismissedDocument.id],
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
    connectedDocument,
    connectedGraphNodeId: connectedGraphDetail.node.id,
    connectedNote,
    dismissedDocument,
    dismissedNote,
    gapDocument,
    gapGraphLabel: `${stageLabel} Graph Gap Queue Node ${timestamp}`,
    gapGraphNodeId: null,
    gapNote,
    originalLibrarySettings,
  }
}

async function cleanupHomeGraphGapQueueHarness({ baseUrl, harness }) {
  if (!harness) {
    return
  }
  await fetch(`${baseUrl}/api/recall/library/settings`, {
    body: JSON.stringify(harness.originalLibrarySettings),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  }).catch(() => null)
  const graphNodeIds = [harness.connectedGraphNodeId, harness.gapGraphNodeId].filter(Boolean)
  await Promise.all(
    graphNodeIds.map((nodeId) =>
      fetch(`${baseUrl}/api/recall/graph/nodes/${encodeURIComponent(nodeId)}/decision`, {
        body: JSON.stringify({ decision: 'rejected' }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }).catch(() => null),
    ),
  )
  const notes = [harness.gapNote, harness.connectedNote, harness.dismissedNote].filter(Boolean)
  await Promise.all(
    notes.map((note) =>
      fetch(`${baseUrl}/api/recall/notes/${encodeURIComponent(note.id)}`, { method: 'DELETE' }).catch(() => null),
    ),
  )
  const documents = [harness.gapDocument, harness.connectedDocument, harness.dismissedDocument].filter(Boolean)
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

async function hiddenReadingQueueRow(readingQueue, title) {
  await readingQueue.getByText(title).waitFor({ state: 'hidden', timeout: 20000 })
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

async function waitForGraphCoverage({ baseUrl, collectionId, noteId, state, timeoutMs = 10000 }) {
  const startedAt = Date.now()
  let lastPayload = null
  while (Date.now() - startedAt < timeoutMs) {
    lastPayload = await fetchHighlightInbox({ baseUrl, collectionId, state })
    const matchedRow = (lastPayload.rows ?? []).find((row) => row.note_id === noteId && row.graph_covered && row.graph_node_id)
    if (matchedRow) {
      return lastPayload
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`Timed out waiting for graph coverage for ${noteId} in ${state}: ${JSON.stringify(lastPayload)}`)
}

function fetchHighlightInbox({ baseUrl, collectionId, state }) {
  const params = new URLSearchParams({ limit: '50', state })
  params.set('collection_id', collectionId)
  return fetchJson(`${baseUrl}/api/recall/library/highlight-review-inbox?${params.toString()}`)
}

function fetchDocumentView({ baseUrl, documentId }) {
  return fetchJson(`${baseUrl}/api/documents/${encodeURIComponent(documentId)}/view?mode=reflowed&detail_level=default`)
}

async function importHarnessDocument({ baseUrl, bodyText, title }) {
  return postJson(`${baseUrl}/api/documents/import-text`, {
    text: bodyText,
    title,
  })
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
