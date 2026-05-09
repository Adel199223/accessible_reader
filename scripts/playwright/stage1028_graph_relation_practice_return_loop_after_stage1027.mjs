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
const outputDir = process.env.RECALL_STAGE1028_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE1028_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE1028_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE1028_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE1028_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE1028_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage1028-graph-relation-practice-return-loop-failure.png'), { force: true })

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
  harness = await createRelationPracticeReviewHarness({ baseUrl, stageLabel: 'Stage 1028' })
  const edges = await waitForHarnessRelatedEdges({ baseUrl, harness })
  harness.edges = edges
  const selectedRelationEdge = edges[0]
  const selectedRelationLabel = formatGraphRelationLabel(selectedRelationEdge)
  await deleteHarnessStudyCardsForSource({ baseUrl, sourceDocumentId: harness.primaryDocument.id })
  await deleteHarnessStudyCardsForSource({ baseUrl, sourceDocumentId: harness.secondaryDocument.id })

  const graphPracticeCard = await insertHarnessRelationPracticeCard({
    edge: selectedRelationEdge,
    harness,
    prompt: `How does ${harness.sourceLabel} return from Graph practice?`,
    suffix: 'graph-return',
  })
  harness.practiceCards.push(graphPracticeCard)

  const metrics = {
    cleanupUtilityDryRunMatchedAfterStage1028: null,
    generatedReaderOutputsFrozen: false,
    graphPracticeConnectionStartsSession: false,
    graphPracticeRecapShowsGraphReturn: false,
    graphPracticeReturnFocusesGraphConnection: false,
    graphPracticeSnapshotCarriesGraphOrigin: false,
    sourcePracticeRecapKeepsSourceReturn: false,
    sourcePracticeReturnFocusesSourceConnection: false,
  }
  const captures = {}

  const readerView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(harness.primaryDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  metrics.generatedReaderOutputsFrozen =
    readerView?.mode === 'reflowed' && JSON.stringify(readerView).includes(harness.sourceLabel)

  const graphRelationRow = await openGraphRelationRow({
    page,
    selectedRelationEdge,
    selectedRelationLabel,
  })
  const graphPracticeButton = graphRelationRow.getByRole('button', {
    name: `Practice connection: ${selectedRelationLabel}`,
  })
  await graphPracticeButton.waitFor({ state: 'visible', timeout: 20000 })
  captures.graphPracticeConnection = await captureLocatorScreenshot(
    page,
    graphRelationRow,
    outputDir,
    'stage1028-graph-practice-connection.png',
  )

  await graphPracticeButton.click()
  await page.waitForURL(/\/recall\?section=study/, { timeout: 20000 })
  const graphActivePrompt = page.getByLabel('Active review prompt').first()
  await graphActivePrompt.waitFor({ state: 'visible', timeout: 30000 })
  metrics.graphPracticeConnectionStartsSession =
    (await graphActivePrompt.innerText()).includes(graphPracticeCard.prompt) &&
    !(await page.getByLabel('Study questions manager').isVisible().catch(() => false))
  const activeGraphSession = await readLatestStudySessionForCard(graphPracticeCard.id)
  metrics.graphPracticeSnapshotCarriesGraphOrigin =
    activeGraphSession?.filter_snapshot?.launch_intent === 'relation-practice-review' &&
    activeGraphSession?.filter_snapshot?.return_surface === 'graph' &&
    activeGraphSession?.filter_snapshot?.relation_edge_id === selectedRelationEdge.id
  captures.graphPracticeActiveSession = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1028-graph-practice-active-session.png',
  )

  await page.getByRole('button', { name: /Show answer|Reveal answer/ }).first().click()
  await page.getByRole('button', { name: 'Good' }).first().click()
  await page.getByText('Connection practiced').waitFor({ state: 'visible', timeout: 30000 })
  const graphReturnButton = page.getByRole('button', { name: 'Back to Graph connection' })
  await graphReturnButton.waitFor({ state: 'visible', timeout: 20000 })
  metrics.graphPracticeRecapShowsGraphReturn =
    (await page.getByText('Connection practiced').isVisible()) &&
    (await graphReturnButton.isVisible()) &&
    !(await page.getByRole('button', { name: 'Back to source connection' }).isVisible().catch(() => false))
  captures.graphPracticeRecap = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1028-graph-practice-recap.png',
  )

  await graphReturnButton.click()
  await page.waitForURL(/\/recall\?section=graph/, { timeout: 20000 })
  const returnedGraphDock = page.getByLabel('Node detail dock')
  await returnedGraphDock.waitFor({ state: 'visible', timeout: 30000 })
  const returnedGraphRelationRow = returnedGraphDock
    .getByRole('list', { name: 'Selected node connections' })
    .locator(
      `[data-graph-detail-relation-row-stage1026][data-graph-detail-relation-focused-stage1028="true"]`,
    )
    .filter({ hasText: selectedRelationLabel })
    .first()
  await returnedGraphRelationRow.waitFor({ state: 'visible', timeout: 30000 })
  metrics.graphPracticeReturnFocusesGraphConnection =
    (await returnedGraphRelationRow.isVisible()) &&
    (await returnedGraphRelationRow.getByText(selectedRelationLabel).isVisible())
  captures.graphPracticeReturnToConnection = await captureLocatorScreenshot(
    page,
    returnedGraphRelationRow,
    outputDir,
    'stage1028-graph-practice-return-to-connection.png',
  )

  const sourcePracticeCard = await insertHarnessRelationPracticeCard({
    edge: selectedRelationEdge,
    harness,
    prompt: `How does ${harness.sourceLabel} return from Source practice?`,
    suffix: 'source-return',
  })
  harness.practiceCards.push(sourcePracticeCard)

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: `Open ${harness.primaryDocument.title}` }).first().click()
  await page.getByRole('heading', { name: harness.primaryDocument.title }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const sourceRelationRow = await findSourceRelationRow({ page, selectedRelationEdge, selectedRelationLabel, harness })
  const sourcePracticeButton = sourceRelationRow.getByRole('button', {
    name: `Practice relation: ${selectedRelationLabel}`,
  })
  await sourcePracticeButton.waitFor({ state: 'visible', timeout: 20000 })
  captures.sourcePracticeConnection = await captureLocatorScreenshot(
    page,
    sourceRelationRow,
    outputDir,
    'stage1028-source-practice-connection.png',
  )

  await sourcePracticeButton.click()
  await page.waitForURL(/\/recall\?section=study/, { timeout: 20000 })
  const sourceActivePrompt = page.getByLabel('Active review prompt').first()
  await sourceActivePrompt.waitFor({ state: 'visible', timeout: 30000 })
  if (!(await sourceActivePrompt.innerText()).includes(sourcePracticeCard.prompt)) {
    throw new Error('Source practice session did not start from the source-return card.')
  }
  await page.getByRole('button', { name: /Show answer|Reveal answer/ }).first().click()
  await page.getByRole('button', { name: 'Good' }).first().click()
  await page.getByText('Connection practiced').waitFor({ state: 'visible', timeout: 30000 })
  const sourceReturnButton = page.getByRole('button', { name: 'Back to source connection' })
  await sourceReturnButton.waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourcePracticeRecapKeepsSourceReturn =
    (await sourceReturnButton.isVisible()) &&
    !(await page.getByRole('button', { name: 'Back to Graph connection' }).isVisible().catch(() => false))
  captures.sourcePracticeRecap = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1028-source-practice-recap.png',
  )

  await sourceReturnButton.click()
  const returnedSourceRelationRow = await findSourceRelationRow({
    page,
    selectedRelationEdge,
    selectedRelationLabel,
    harness,
  })
  metrics.sourcePracticeReturnFocusesSourceConnection =
    (await returnedSourceRelationRow.getAttribute('data-source-overview-related-graph-focused-stage1024')) === 'true'
  captures.sourcePracticeReturnToConnection = await captureLocatorScreenshot(
    page,
    returnedSourceRelationRow,
    outputDir,
    'stage1028-source-practice-return-to-connection.png',
  )

  await cleanupRelationPracticeReviewHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage1028 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage1028: 0,
    generatedReaderOutputsFrozen: true,
    graphPracticeConnectionStartsSession: true,
    graphPracticeRecapShowsGraphReturn: true,
    graphPracticeReturnFocusesGraphConnection: true,
    graphPracticeSnapshotCarriesGraphOrigin: true,
    sourcePracticeRecapKeepsSourceReturn: true,
    sourcePracticeReturnFocusesSourceConnection: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(
        `Stage 1028 expected ${metricName}: ${expected}, got ${metrics[metricName]}. Metrics: ${JSON.stringify(
          metrics,
        )}`,
      )
    }
  }

  const validation = {
    browserUse: {
      attempted: true,
      fallbackReason:
        'In-app Browser page identity was checked separately; repo Playwright captured deterministic seeded interaction evidence.',
    },
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage1028-graph-relation-practice-return-loop-after-stage1027',
  }
  await writeFile(
    path.join(outputDir, 'stage1028-graph-relation-practice-return-loop-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(
    page,
    outputDir,
    'stage1028-graph-relation-practice-return-loop-failure.png',
  ).catch(() => null)
  throw error
} finally {
  await cleanupRelationPracticeReviewHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 1028 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

async function openGraphRelationRow({ page, selectedRelationEdge, selectedRelationLabel }) {
  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: `Open ${harness.primaryDocument.title}` }).first().click()
  await page.getByRole('heading', { name: harness.primaryDocument.title }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const sourceRelationRow = await findSourceRelationRow({ page, selectedRelationEdge, selectedRelationLabel, harness })
  const openRelationButton = sourceRelationRow
    .getByRole('button', { name: `Open relation: ${selectedRelationLabel}` })
    .or(sourceRelationRow.getByRole('button', { name: `Review relation: ${selectedRelationLabel}` }))
    .first()
  await openRelationButton.waitFor({ state: 'visible', timeout: 20000 })
  await openRelationButton.click()
  await page.waitForURL(/\/recall\?section=graph/, { timeout: 20000 })
  const nodeDetailDock = page.getByLabel('Node detail dock')
  await nodeDetailDock.waitFor({ state: 'visible', timeout: 30000 })
  const openCardButton = nodeDetailDock.getByRole('button', { name: 'Open card' }).first()
  if (await openCardButton.isVisible().catch(() => false)) {
    await openCardButton.click()
  }
  const connectionsTab = nodeDetailDock.getByRole('tab', { name: /Connections/ }).first()
  await connectionsTab.waitFor({ state: 'visible', timeout: 30000 })
  await connectionsTab.click()
  const relationRow = nodeDetailDock
    .getByRole('list', { name: 'Selected node connections' })
    .locator('[data-graph-detail-relation-row-stage1026]')
    .filter({ hasText: selectedRelationLabel })
    .first()
  await relationRow.waitFor({ state: 'visible', timeout: 30000 })
  return relationRow
}

async function findSourceRelationRow({ page, selectedRelationEdge, selectedRelationLabel, harness }) {
  const relatedConnectionsList = page.locator('[data-source-overview-related-graph-connections-stage1010="true"]')
  await relatedConnectionsList.waitFor({ state: 'visible', timeout: 30000 })
  const relationRow = relatedConnectionsList
    .locator(
      `[data-source-overview-related-graph-row-stage1010][data-source-overview-related-graph-edge-id-stage1014="${cssAttributeValue(
        selectedRelationEdge.id,
      )}"]`,
    )
    .filter({ hasText: harness.secondaryDocument.title })
    .filter({ hasText: selectedRelationLabel })
    .first()
  await relationRow.waitFor({ state: 'visible', timeout: 30000 })
  return relationRow
}

async function createRelationPracticeReviewHarness({ baseUrl, stageLabel }) {
  const timestamp = Date.now()
  const collectionId = `collection:stage1028-relation-return-${timestamp}`
  const collectionName = `${stageLabel} Relation Return`
  const sourceLabel = `Relation Return Alpha December${timestamp}`
  const targetLabel = `Relation Return Beta December${timestamp}`
  const relationSentence = `${sourceLabel} uses ${targetLabel} to keep Graph practice anchored after review.`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }
  const primaryDocument = await importHarnessDocument({
    baseUrl,
    bodyText: Array.from(
      { length: 12 },
      (_, index) => `${stageLabel} primary Graph return evidence ${index + 1}. ${relationSentence}`,
    ).join(' '),
    title: `${stageLabel} Relation Return Primary ${timestamp}`,
  })
  const secondaryDocument = await importHarnessDocument({
    baseUrl,
    bodyText: Array.from(
      { length: 12 },
      (_, index) => `${stageLabel} companion Graph return evidence ${index + 1}. ${relationSentence}`,
    ).join(' '),
    title: `${stageLabel} Relation Return Companion ${timestamp}`,
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
    `Timed out waiting for Stage 1028 related edges ${harness.sourceLabel} -> ${harness.targetLabel}: ${JSON.stringify(
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

async function insertHarnessRelationPracticeCard({ edge, harness, prompt, suffix }) {
  const timestamp = new Date().toISOString()
  const card = {
    answer: `${harness.sourceLabel} uses ${harness.targetLabel}.`,
    card_type: 'short_answer',
    id: `card:stage1028-relation-return:${suffix}:${edge.id.replace(/[^a-zA-Z0-9:_-]/g, '-')}:${Date.now()}`,
    prompt,
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

async function cleanupRelationPracticeReviewHarness({ baseUrl, harness }) {
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

function cssAttributeValue(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function formatRelationLabel(relationType) {
  return String(relationType ?? '').replace(/_/g, ' ')
}

function formatGraphRelationLabel(edge) {
  return `${edge.source_label} ${formatRelationLabel(edge.relation_type)} ${edge.target_label}`
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

async function readLatestStudySessionForCard(cardId) {
  const databasePath = process.env.ACCESSIBLE_READER_DATA_DIR
    ? path.join(process.env.ACCESSIBLE_READER_DATA_DIR, 'workspace.db')
    : path.join(repoRoot, 'backend', '.data', 'workspace.db')
  const stdout = await runPython(
    `
import json
import sqlite3
import sys

database_path = sys.argv[1]
card_id = sys.argv[2]
with sqlite3.connect(database_path) as connection:
    connection.row_factory = sqlite3.Row
    rows = connection.execute(
        "SELECT * FROM study_review_sessions ORDER BY started_at DESC, created_at DESC"
    ).fetchall()
for row in rows:
    card_ids = json.loads(row["card_ids_json"] or "[]")
    if card_id in card_ids:
        print(json.dumps({
            "id": row["id"],
            "card_ids": card_ids,
            "filter_snapshot": json.loads(row["filter_snapshot_json"] or "{}"),
        }, sort_keys=True))
        break
`,
    [databasePath, cardId],
  )
  return stdout.trim() ? JSON.parse(stdout) : null
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
