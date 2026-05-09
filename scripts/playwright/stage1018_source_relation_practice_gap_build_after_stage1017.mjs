import { execFile } from 'node:child_process'
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
const outputDir = process.env.RECALL_STAGE1018_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE1018_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE1018_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE1018_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE1018_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE1018_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage1018-source-relation-practice-gap-build-failure.png'), { force: true })

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
  harness = await createRelationPracticeQueueHarness({ baseUrl, stageLabel: 'Stage 1018' })
  const edges = await waitForHarnessRelatedEdges({ baseUrl, harness })
  harness.edges = edges
  await deleteHarnessStudyCardsForSource({ baseUrl, sourceDocumentId: harness.primaryDocument.id })
  await deleteHarnessStudyCardsForSource({ baseUrl, sourceDocumentId: harness.secondaryDocument.id })
  let selectedRelationEdge = null
  let selectedRelationLabel = null
  const metrics = {
    cleanupUtilityDryRunMatchedAfterStage1018: null,
    createdCardHasRelationSpan: false,
    generatedReaderOutputsFrozen: false,
    homeRelationPracticeQueueSignalAfterCreate: false,
    sourceNoPracticeCreateActionVisible: false,
    sourcePracticeReadyAfterCreate: false,
    studyRelationFilterShowsCreatedCard: false,
    relationPracticeClearRestoresSourceQuestions: false,
  }
  const captures = {}

  const readerView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(harness.primaryDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  metrics.generatedReaderOutputsFrozen =
    readerView?.mode === 'reflowed' && JSON.stringify(readerView).includes(harness.sourceLabel)

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: `Open ${harness.primaryDocument.title}` }).first().click()
  await page.getByRole('heading', { name: harness.primaryDocument.title }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const relatedConnectionsList = page.locator('[data-source-overview-related-graph-connections-stage1010="true"]')
  await relatedConnectionsList.waitFor({ state: 'visible', timeout: 30000 })
  let sourceRelationRow = null
  for (const edge of harness.edges) {
    const relationLabel = formatGraphRelationLabel(edge)
    const candidateRow = relatedConnectionsList
      .locator(
        `[data-source-overview-related-graph-row-stage1010][data-source-overview-related-graph-edge-id-stage1014="${cssAttributeValue(
          edge.id,
        )}"]`,
      )
      .filter({ hasText: harness.secondaryDocument.title })
      .first()
    if (await candidateRow.isVisible().catch(() => false)) {
      selectedRelationEdge = edge
      selectedRelationLabel = relationLabel
      sourceRelationRow = candidateRow
      break
    }
  }
  if (!sourceRelationRow || !selectedRelationEdge || !selectedRelationLabel) {
    throw new Error(
      `Could not find a visible Stage 1018 related row for ${harness.secondaryDocument.title}. Candidate relations: ${harness.edges
        .map(formatGraphRelationLabel)
        .join(', ')}`,
    )
  }
  await sourceRelationRow.getByText('No practice yet').waitFor({ state: 'visible', timeout: 20000 })
  const createPracticeButton = sourceRelationRow.getByRole('button', {
    name: `Create practice card: ${selectedRelationLabel}`,
  })
  await createPracticeButton.waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceNoPracticeCreateActionVisible =
    (await sourceRelationRow.getByText('No practice yet').isVisible()) && (await createPracticeButton.isVisible())
  captures.sourceNoPracticeCreateAction = await captureLocatorScreenshot(
    page,
    sourceRelationRow,
    outputDir,
    'stage1018-source-no-practice-create-action.png',
  )

  await createPracticeButton.click()
  await page.waitForURL(/\/recall\?section=study/, { timeout: 20000 })
  const questionManager = page.getByLabel('Study questions manager')
  await questionManager.waitFor({ state: 'visible', timeout: 30000 })
  const relationFilter = questionManager.getByLabel('Active study relation filter')
  await relationFilter.waitFor({ state: 'visible', timeout: 20000 })
  const relationFilterText = await relationFilter.innerText()
  const relationQuestionCountMatch = relationFilterText.match(/(\d+)\s+questions?/i)
  const relationQuestionCount = relationQuestionCountMatch
    ? Number.parseInt(relationQuestionCountMatch[1], 10)
    : Number.NaN
  const visibleRelationRows = await countVisibleLocators(
    questionManager.locator('[data-study-relation-question-result-stage1014]'),
  )
  const matchingQuestionRow = questionManager.locator('[data-study-relation-question-result-stage1014]').first()
  await matchingQuestionRow.waitFor({ state: 'visible', timeout: 20000 })
  const expectedPrompt = buildRelationPracticePrompt(selectedRelationEdge)
  metrics.studyRelationFilterShowsCreatedCard =
    relationFilterText.includes(selectedRelationLabel) &&
    Number.isFinite(relationQuestionCount) &&
    relationQuestionCount === visibleRelationRows &&
    visibleRelationRows === 1 &&
    (await matchingQuestionRow.getByText(expectedPrompt).isVisible())
  captures.studyRelationPracticeFromCreateAction = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1018-study-relation-practice-from-create-action.png',
  )
  const sourceStudyCards = await fetchJson(
    `${baseUrl}/api/recall/study/cards?status=all&limit=100&source_document_id=${encodeURIComponent(
      harness.primaryDocument.id,
    )}`,
  )
  const createdCard = sourceStudyCards.find((card) =>
    (card.source_spans ?? []).some((span) => span.edge_id === selectedRelationEdge.id),
  )
  if (createdCard) {
    harness.practiceCards = [createdCard]
  }
  metrics.createdCardHasRelationSpan = Boolean(
    createdCard &&
      createdCard.prompt === expectedPrompt &&
      (createdCard.source_spans ?? []).some(
        (span) => span.edge_id === selectedRelationEdge.id && span.manual_source === 'study_relation_manual',
      ),
  )

  await relationFilter.getByRole('button', { name: 'Clear relation' }).click()
  await expectHidden(relationFilter)
  const restoredSourceQuestionRow = questionManager
    .locator('[data-study-question-schedule-state-stage934]')
    .filter({ hasText: harness.primaryDocument.title })
    .first()
  await restoredSourceQuestionRow.waitFor({ state: 'visible', timeout: 20000 })
  metrics.relationPracticeClearRestoresSourceQuestions =
    (await questionManager.locator('[data-study-relation-question-result-stage1014]').count()) === 0 &&
    (await restoredSourceQuestionRow.isVisible())

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: `Open ${harness.primaryDocument.title}` }).first().click()
  await page.getByRole('heading', { name: harness.primaryDocument.title }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await relatedConnectionsList.waitFor({ state: 'visible', timeout: 30000 })
  const refreshedSourceRelationRow = relatedConnectionsList
    .locator(
      `[data-source-overview-related-graph-row-stage1010][data-source-overview-related-graph-edge-id-stage1014="${cssAttributeValue(
        selectedRelationEdge.id,
      )}"]`,
    )
    .filter({ hasText: harness.secondaryDocument.title })
    .first()
  await refreshedSourceRelationRow.waitFor({ state: 'visible', timeout: 20000 })
  await refreshedSourceRelationRow.getByText(/practice question/).waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourcePracticeReadyAfterCreate =
    (await refreshedSourceRelationRow.getByText(/practice question/).isVisible()) &&
    (await refreshedSourceRelationRow.getByRole('button', { name: `Practice relation: ${selectedRelationLabel}` }).isVisible()) &&
    !(await refreshedSourceRelationRow.getByRole('button', { name: `Create practice card: ${selectedRelationLabel}` }).isVisible().catch(() => false))
  captures.sourcePracticeReadyAfterCreate = await captureLocatorScreenshot(
    page,
    refreshedSourceRelationRow,
    outputDir,
    'stage1018-source-practice-ready-after-create.png',
  )

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  const readingQueue = page.getByRole('region', { name: 'Reading queue' })
  await readingQueue.waitFor({ state: 'visible', timeout: 30000 })
  const primaryQueueRow = readingQueue
    .locator('[data-reading-queue-learning-gaps-stage978]')
    .filter({ hasText: harness.primaryDocument.title })
    .first()
  await primaryQueueRow.waitFor({ state: 'visible', timeout: 30000 })
  await primaryQueueRow.getByText(/practice relation/).waitFor({ state: 'visible', timeout: 30000 })
  metrics.homeRelationPracticeQueueSignalAfterCreate =
    (await primaryQueueRow.getByText(/practice relation/).isVisible()) &&
    (await primaryQueueRow.getByRole('button', { name: `Practice connection for ${harness.primaryDocument.title}` }).isVisible())
  captures.homeRelationPracticeQueueSignalAfterCreate = await captureLocatorScreenshot(
    page,
    primaryQueueRow,
    outputDir,
    'stage1018-home-relation-practice-queue-signal-after-create.png',
  )

  await cleanupRelationPracticeQueueHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage1018 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage1018: 0,
    createdCardHasRelationSpan: true,
    generatedReaderOutputsFrozen: true,
    homeRelationPracticeQueueSignalAfterCreate: true,
    relationPracticeClearRestoresSourceQuestions: true,
    sourceNoPracticeCreateActionVisible: true,
    sourcePracticeReadyAfterCreate: true,
    studyRelationFilterShowsCreatedCard: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(
        `Stage 1018 expected ${metricName}: ${expected}, got ${metrics[metricName]}. Metrics: ${JSON.stringify(
          metrics,
        )}`,
      )
    }
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage1018-source-relation-practice-gap-build-after-stage1017',
  }
  await writeFile(
    path.join(outputDir, 'stage1018-source-relation-practice-gap-build-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(page, outputDir, 'stage1018-source-relation-practice-gap-build-failure.png').catch(
    () => null,
  )
  throw error
} finally {
  await cleanupRelationPracticeQueueHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 1018 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

function cssAttributeValue(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

async function createRelationPracticeQueueHarness({ baseUrl, stageLabel }) {
  const timestamp = Date.now()
  const collectionId = `collection:stage1018-relation-practice-${timestamp}`
  const collectionName = `${stageLabel} Relation Practice`
  const sourceLabel = `Relation Practice Alpha November${timestamp}`
  const targetLabel = `Relation Practice Beta November${timestamp}`
  const relationSentence = `${sourceLabel} uses ${targetLabel} to make related saved sources practice-ready from Source overview.`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }
  const primaryDocument = await importHarnessDocument({
    baseUrl,
    bodyText: Array.from(
      { length: 12 },
      (_, index) => `${stageLabel} primary Home relation-practice queue evidence ${index + 1}. ${relationSentence}`,
    ).join(' '),
    title: `${stageLabel} Relation Practice Primary ${timestamp}`,
  })
  const secondaryDocument = await importHarnessDocument({
    baseUrl,
    bodyText: Array.from(
      { length: 12 },
      (_, index) => `${stageLabel} companion Home relation-practice queue evidence ${index + 1}. ${relationSentence}`,
    ).join(' '),
    title: `${stageLabel} Relation Practice Companion ${timestamp}`,
  })
  await putJson(`${baseUrl}/api/documents/${encodeURIComponent(primaryDocument.id)}/progress`, {
    mode: 'reflowed',
    sentence_index: 1,
  })
  await putJson(`${baseUrl}/api/documents/${encodeURIComponent(secondaryDocument.id)}/progress`, {
    mode: 'reflowed',
    sentence_index: 1,
  })
  await backdateHarnessReadingSessions({
    documentIds: [primaryDocument.id, secondaryDocument.id],
    isoTimestamp: '2000-01-01T00:00:00.000Z',
  })
  const now = new Date().toISOString()
  await putJson(`${baseUrl}/api/recall/library/settings`, {
    custom_collections: [
      ...(originalLibrarySettings.custom_collections ?? []),
      {
        created_at: now,
        document_ids: [primaryDocument.id],
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
    edges: [],
    originalLibrarySettings,
    practiceCards: [],
    primaryDocument,
    secondaryDocument,
    sourceLabel,
    targetLabel,
  }
}

async function backdateHarnessReadingSessions({ documentIds, isoTimestamp }) {
  const databasePath = process.env.ACCESSIBLE_READER_DATA_DIR
    ? path.join(process.env.ACCESSIBLE_READER_DATA_DIR, 'workspace.db')
    : path.join(repoRoot, 'backend', '.data', 'workspace.db')
  await runPython(
    `
import sqlite3
import sys

database_path = sys.argv[1]
updated_at = sys.argv[2]
document_ids = sys.argv[3:]
with sqlite3.connect(database_path) as connection:
    connection.executemany(
        "UPDATE reading_sessions SET updated_at = ? WHERE source_document_id = ?",
        [(updated_at, document_id) for document_id in document_ids],
    )
`,
    [databasePath, isoTimestamp, ...documentIds],
  )
}

async function waitForHarnessRelatedEdges({ baseUrl, harness, timeoutMs = 30000 }) {
  const startedAt = Date.now()
  let lastSnapshot = null
  while (Date.now() - startedAt < timeoutMs) {
    lastSnapshot = await fetchJson(`${baseUrl}/api/recall/graph?limit_nodes=240&limit_edges=400`)
    const nodeById = new Map((lastSnapshot.nodes ?? []).map((node) => [node.id, node]))
    const relatedEdges = (lastSnapshot.edges ?? []).filter(
      (candidate) =>
        candidate.status !== 'rejected' &&
        graphConnectionEdgeMatchesSourceDocument(candidate, harness.primaryDocument.id, nodeById) &&
        graphConnectionEdgeDocumentIds(candidate, nodeById).includes(harness.secondaryDocument.id),
    )
    const preferredEdges = [
      ...relatedEdges.filter(
        (candidate) =>
          candidate.relation_type === 'uses' &&
          (candidate.excerpt?.includes(harness.sourceLabel) || candidate.excerpt?.includes(harness.targetLabel)),
      ),
      ...relatedEdges.filter(
        (candidate) =>
          candidate.relation_type !== 'uses' ||
          (!candidate.excerpt?.includes(harness.sourceLabel) && !candidate.excerpt?.includes(harness.targetLabel)),
      ),
    ]
    if (preferredEdges.length > 0) {
      return preferredEdges
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  throw new Error(
    `Timed out waiting for Stage 1018 related edges ${harness.sourceLabel} -> ${harness.targetLabel}: ${JSON.stringify(
      lastSnapshot,
    )}`,
  )
}

function graphConnectionEdgeMatchesSourceDocument(edge, sourceDocumentId, nodeById) {
  if (!sourceDocumentId) {
    return false
  }
  if ((edge.source_document_ids ?? []).includes(sourceDocumentId)) {
    return true
  }
  const sourceNode = nodeById.get(edge.source_id)
  const targetNode = nodeById.get(edge.target_id)
  return Boolean(
    sourceNode?.source_document_ids?.includes(sourceDocumentId) ||
      targetNode?.source_document_ids?.includes(sourceDocumentId),
  )
}

function graphConnectionEdgeDocumentIds(edge, nodeById) {
  const documentIds = new Set(edge.source_document_ids ?? [])
  const sourceNode = nodeById.get(edge.source_id)
  const targetNode = nodeById.get(edge.target_id)
  for (const documentId of sourceNode?.source_document_ids ?? []) {
    documentIds.add(documentId)
  }
  for (const documentId of targetNode?.source_document_ids ?? []) {
    documentIds.add(documentId)
  }
  return Array.from(documentIds)
}

async function insertHarnessRelationPracticeCard({ edge, harness }) {
  const timestamp = new Date().toISOString()
  const card = {
    answer: `${harness.sourceLabel} uses ${harness.targetLabel}.`,
    card_type: 'short_answer',
    id: `card:stage1016-relation-practice:${edge.id.replace(/[^a-zA-Z0-9:_-]/g, '-')}:${Date.now()}`,
    prompt: `How does ${harness.sourceLabel} relate to ${harness.targetLabel} from Home?`,
    scheduling_state: {
      created_at: timestamp,
      due_at: timestamp,
      last_rating: null,
      last_reviewed_at: null,
      review_count: 0,
      schema_version: '1',
      status: 'new',
    },
    source_document_id: harness.primaryDocument.id,
    source_spans: [
      {
        edge_id: edge.id,
        excerpt: edge.excerpt ?? `${harness.sourceLabel} uses ${harness.targetLabel}.`,
        generated_card_type: 'relation',
        node_ids: [edge.source_id, edge.target_id],
        source_document_id: harness.primaryDocument.id,
      },
    ],
    timestamp,
  }
  const databasePath = process.env.ACCESSIBLE_READER_DATA_DIR
    ? path.join(process.env.ACCESSIBLE_READER_DATA_DIR, 'workspace.db')
    : path.join(repoRoot, 'backend', '.data', 'workspace.db')
  await runPython(
    `
import json
import sqlite3
import sys

database_path = sys.argv[1]
card = json.loads(sys.argv[2])
with sqlite3.connect(database_path) as connection:
    connection.execute(
        """
        INSERT INTO review_cards (
            id,
            source_document_id,
            prompt,
            answer,
            card_type,
            source_spans_json,
            scheduling_state_json,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            source_document_id = excluded.source_document_id,
            prompt = excluded.prompt,
            answer = excluded.answer,
            card_type = excluded.card_type,
            source_spans_json = excluded.source_spans_json,
            scheduling_state_json = excluded.scheduling_state_json,
            updated_at = excluded.updated_at
        """,
        (
            card["id"],
            card["source_document_id"],
            card["prompt"],
            card["answer"],
            card["card_type"],
            json.dumps(card["source_spans"], sort_keys=True),
            json.dumps(card["scheduling_state"], sort_keys=True),
            card["timestamp"],
            card["timestamp"],
        ),
    )
`,
    [databasePath, JSON.stringify(card)],
  )
  return card
}

async function deleteHarnessStudyCardsForSource({ baseUrl, sourceDocumentId }) {
  const cards = await fetchJson(
    `${baseUrl}/api/recall/study/cards?status=all&limit=100&source_document_id=${encodeURIComponent(sourceDocumentId)}`,
  )
  await Promise.all(
    cards.map((card) =>
      fetch(`${baseUrl}/api/recall/study/cards/${encodeURIComponent(card.id)}`, { method: 'DELETE' }).catch(
        () => null,
      ),
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

function formatRelationLabel(relationType) {
  return String(relationType ?? '').replace(/_/g, ' ')
}

function formatGraphRelationLabel(edge) {
  return `${edge.source_label} ${formatRelationLabel(edge.relation_type)} ${edge.target_label}`
}

function buildRelationPracticePrompt(edge) {
  return `What is the Graph connection between ${edge.source_label} and ${edge.target_label}?`
}

async function expectHidden(locator) {
  await locator.waitFor({ state: 'hidden', timeout: 20000 })
}

async function countVisibleLocators(locator) {
  const count = await locator.count()
  let visibleCount = 0
  for (let index = 0; index < count; index += 1) {
    if (await locator.nth(index).isVisible().catch(() => false)) {
      visibleCount += 1
    }
  }
  return visibleCount
}

async function cleanupRelationPracticeQueueHarness({ baseUrl, harness }) {
  if (!harness) {
    return
  }
  for (const card of harness.practiceCards ?? []) {
    if (card?.id) {
      await fetch(`${baseUrl}/api/recall/study/cards/${encodeURIComponent(card.id)}`, { method: 'DELETE' }).catch(
        () => null,
      )
    }
  }
  await fetch(`${baseUrl}/api/recall/library/settings`, {
    body: JSON.stringify(harness.originalLibrarySettings),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  }).catch(() => null)
  for (const document of [harness.secondaryDocument, harness.primaryDocument]) {
    if (!document?.id) {
      continue
    }
    await fetch(`${baseUrl}/api/documents/${encodeURIComponent(document.id)}`, { method: 'DELETE' }).catch(() => null)
  }
}

function runPython(source, args) {
  const executable = process.env.PYTHON ?? 'python3'
  return new Promise((resolve, reject) => {
    execFile(executable, ['-c', source, ...args], { cwd: repoRoot }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Python helper failed: ${stderr || error.message}`))
        return
      }
      resolve(stdout)
    })
  })
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
