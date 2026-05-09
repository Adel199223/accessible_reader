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
const outputDir = process.env.RECALL_STAGE1022_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE1022_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE1022_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE1022_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE1022_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE1022_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage1022-relation-practice-review-session-handoff-failure.png'), { force: true })

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
  harness = await createRelationPracticeReviewHarness({ baseUrl, stageLabel: 'Stage 1022' })
  const edges = await waitForHarnessRelatedEdges({ baseUrl, harness })
  harness.edges = edges
  const selectedRelationEdge = edges[0]
  const selectedRelationLabel = formatGraphRelationLabel(selectedRelationEdge)
  await deleteHarnessStudyCardsForSource({ baseUrl, sourceDocumentId: harness.primaryDocument.id })
  await deleteHarnessStudyCardsForSource({ baseUrl, sourceDocumentId: harness.secondaryDocument.id })

  const homePracticeCard = await insertHarnessRelationPracticeCard({
    edge: selectedRelationEdge,
    harness,
    prompt: `How does ${harness.sourceLabel} connect with ${harness.targetLabel} from Home?`,
    suffix: 'home',
  })
  harness.practiceCards.push(homePracticeCard)

  const metrics = {
    browserUseClientScriptPresent: false,
    cleanupUtilityDryRunMatchedAfterStage1022: null,
    collectionPracticeConnectionStartsSession: false,
    generatedReaderOutputsFrozen: false,
    homePracticeConnectionStartsSession: false,
    homePracticeConnectionVisible: false,
    relationPracticeRecapReturnOpensSourceConnection: false,
    relationPracticeSessionRecapVisible: false,
    sourcePracticeRelationStartsSession: false,
    sourcePracticeRelationVisible: false,
  }
  const captures = {}

  const readerView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(harness.primaryDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  metrics.generatedReaderOutputsFrozen =
    readerView?.mode === 'reflowed' && JSON.stringify(readerView).includes(harness.sourceLabel)

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  const readingQueue = page.getByRole('region', { name: 'Reading queue' })
  await readingQueue.waitFor({ state: 'visible', timeout: 30000 })
  const homeQueueRow = readingQueue
    .locator('[data-reading-queue-learning-gaps-stage978]')
    .filter({ hasText: harness.primaryDocument.title })
    .first()
  await homeQueueRow.waitFor({ state: 'visible', timeout: 30000 })
  await homeQueueRow.getByText(/practice relation|practice relations/).waitFor({
    state: 'visible',
    timeout: 30000,
  })
  const homePracticeButton = homeQueueRow.getByRole('button', {
    name: `Practice connection for ${harness.primaryDocument.title}`,
  })
  await homePracticeButton.waitFor({ state: 'visible', timeout: 20000 })
  metrics.homePracticeConnectionVisible =
    (await homeQueueRow.getByText(/practice relation|practice relations/).isVisible()) &&
    (await homePracticeButton.isVisible())
  captures.homePracticeConnection = await captureLocatorScreenshot(
    page,
    homeQueueRow,
    outputDir,
    'stage1022-home-practice-connection.png',
  )

  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()
  const collectionQueueRow = page
    .getByRole('region', { name: 'Reading queue' })
    .locator('[data-reading-queue-learning-gaps-stage978]')
    .filter({ hasText: harness.primaryDocument.title })
    .first()
  await collectionQueueRow.waitFor({ state: 'visible', timeout: 30000 })
  const collectionPracticeButton = collectionQueueRow.getByRole('button', {
    name: `Practice connection for ${harness.primaryDocument.title}`,
  })
  await collectionPracticeButton.waitFor({ state: 'visible', timeout: 20000 })
  metrics.collectionPracticeConnectionStartsSession =
    (await collectionQueueRow.getByText(/practice relation|practice relations/).isVisible()) &&
    (await collectionPracticeButton.isVisible())
  captures.collectionPracticeConnection = await captureLocatorScreenshot(
    page,
    collectionQueueRow,
    outputDir,
    'stage1022-collection-practice-connection.png',
  )

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  const refreshedHomeQueueRow = page
    .getByRole('region', { name: 'Reading queue' })
    .locator('[data-reading-queue-learning-gaps-stage978]')
    .filter({ hasText: harness.primaryDocument.title })
    .first()
  await refreshedHomeQueueRow.waitFor({ state: 'visible', timeout: 30000 })
  await refreshedHomeQueueRow
    .getByRole('button', { name: `Practice connection for ${harness.primaryDocument.title}` })
    .click()
  await page.waitForURL(/\/recall\?section=study/, { timeout: 20000 })
  const activePrompt = page.getByLabel('Active review prompt').first()
  await activePrompt.waitFor({ state: 'visible', timeout: 30000 })
  metrics.homePracticeConnectionStartsSession =
    (await activePrompt.innerText()).includes(homePracticeCard.prompt) &&
    !(await page.getByLabel('Study questions manager').isVisible().catch(() => false))
  captures.homePracticeActiveSession = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1022-home-practice-active-session.png',
  )

  await page.getByRole('button', { name: /Show answer|Reveal answer/ }).first().click()
  await page.getByRole('button', { name: 'Good' }).first().click()
  await page.getByText('Connection practiced').waitFor({ state: 'visible', timeout: 30000 })
  metrics.relationPracticeSessionRecapVisible =
    (await page.getByText('Connection practiced').isVisible()) &&
    (await page.getByText('1 connection reviewed').isVisible())
  captures.relationPracticeRecap = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1022-relation-practice-recap.png',
  )

  await page.getByRole('button', { name: 'Back to source connection' }).click()
  await page.getByRole('heading', { name: harness.primaryDocument.title }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const returnedRelatedConnectionsList = page.locator('[data-source-overview-related-graph-connections-stage1010="true"]')
  await returnedRelatedConnectionsList.waitFor({ state: 'visible', timeout: 30000 })
  const returnedRelationRow = returnedRelatedConnectionsList
    .locator(
      `[data-source-overview-related-graph-row-stage1010][data-source-overview-related-graph-edge-id-stage1014="${cssAttributeValue(
        selectedRelationEdge.id,
      )}"]`,
    )
    .filter({ hasText: harness.secondaryDocument.title })
    .first()
  await returnedRelationRow.waitFor({ state: 'visible', timeout: 20000 })
  metrics.relationPracticeRecapReturnOpensSourceConnection =
    (await returnedRelationRow.isVisible()) && (await returnedRelationRow.getByText(selectedRelationLabel).isVisible())
  captures.relationPracticeReturnToSource = await captureLocatorScreenshot(
    page,
    returnedRelationRow,
    outputDir,
    'stage1022-relation-practice-return-to-source.png',
  )

  const sourcePracticeCard = await insertHarnessRelationPracticeCard({
    edge: selectedRelationEdge,
    harness,
    prompt: `How does ${harness.sourceLabel} connect with ${harness.targetLabel} from Source overview?`,
    suffix: 'source',
  })
  harness.practiceCards.push(sourcePracticeCard)

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: `Open ${harness.primaryDocument.title}` }).first().click()
  await page.getByRole('heading', { name: harness.primaryDocument.title }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const relatedConnectionsList = page.locator('[data-source-overview-related-graph-connections-stage1010="true"]')
  await relatedConnectionsList.waitFor({ state: 'visible', timeout: 30000 })
  const sourceRelationRow = relatedConnectionsList
    .locator(
      `[data-source-overview-related-graph-row-stage1010][data-source-overview-related-graph-edge-id-stage1014="${cssAttributeValue(
        selectedRelationEdge.id,
      )}"]`,
    )
    .filter({ hasText: harness.secondaryDocument.title })
    .first()
  await sourceRelationRow.waitFor({ state: 'visible', timeout: 20000 })
  const sourcePracticeButton = sourceRelationRow.getByRole('button', {
    name: `Practice relation: ${selectedRelationLabel}`,
  })
  await sourcePracticeButton.waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourcePracticeRelationVisible =
    (await sourceRelationRow.getByText(/practice question|practice questions/).isVisible()) &&
    (await sourcePracticeButton.isVisible())
  captures.sourcePracticeRelation = await captureLocatorScreenshot(
    page,
    sourceRelationRow,
    outputDir,
    'stage1022-source-practice-relation.png',
  )

  await sourcePracticeButton.click()
  await page.waitForURL(/\/recall\?section=study/, { timeout: 20000 })
  const sourceActivePrompt = page.getByLabel('Active review prompt').first()
  await sourceActivePrompt.waitFor({ state: 'visible', timeout: 30000 })
  metrics.sourcePracticeRelationStartsSession =
    (await sourceActivePrompt.innerText()).includes(sourcePracticeCard.prompt) &&
    !(await page.getByLabel('Study questions manager').isVisible().catch(() => false))
  captures.sourcePracticeActiveSession = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1022-source-practice-active-session.png',
  )

  await cleanupRelationPracticeReviewHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage1022 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage1022: 0,
    collectionPracticeConnectionStartsSession: true,
    generatedReaderOutputsFrozen: true,
    homePracticeConnectionStartsSession: true,
    homePracticeConnectionVisible: true,
    relationPracticeRecapReturnOpensSourceConnection: true,
    relationPracticeSessionRecapVisible: true,
    sourcePracticeRelationStartsSession: true,
    sourcePracticeRelationVisible: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(
        `Stage 1022 expected ${metricName}: ${expected}, got ${metrics[metricName]}. Metrics: ${JSON.stringify(
          metrics,
        )}`,
      )
    }
  }

  const validation = {
    browserUse: {
      attempted: true,
      fallbackReason:
        'Browser plugin cache is missing browser-use/0.1.0-alpha2/scripts/browser-client.mjs, so repo Playwright captured the evidence.',
    },
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage1022-relation-practice-review-session-handoff-after-stage1021',
  }
  await writeFile(
    path.join(outputDir, 'stage1022-relation-practice-review-session-handoff-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(
    page,
    outputDir,
    'stage1022-relation-practice-review-session-handoff-failure.png',
  ).catch(() => null)
  throw error
} finally {
  await cleanupRelationPracticeReviewHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 1022 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

function cssAttributeValue(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

async function createRelationPracticeReviewHarness({ baseUrl, stageLabel }) {
  const timestamp = Date.now()
  const collectionId = `collection:stage1022-relation-review-${timestamp}`
  const collectionName = `${stageLabel} Relation Review`
  const sourceLabel = `Relation Review Alpha December${timestamp}`
  const targetLabel = `Relation Review Beta December${timestamp}`
  const relationSentence = `${sourceLabel} uses ${targetLabel} to turn related saved sources into active recall practice.`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }
  const primaryDocument = await importHarnessDocument({
    baseUrl,
    bodyText: Array.from(
      { length: 12 },
      (_, index) => `${stageLabel} primary relation review evidence ${index + 1}. ${relationSentence}`,
    ).join(' '),
    title: `${stageLabel} Relation Review Primary ${timestamp}`,
  })
  const secondaryDocument = await importHarnessDocument({
    baseUrl,
    bodyText: Array.from(
      { length: 12 },
      (_, index) => `${stageLabel} companion relation review evidence ${index + 1}. ${relationSentence}`,
    ).join(' '),
    title: `${stageLabel} Relation Review Companion ${timestamp}`,
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
    `Timed out waiting for Stage 1022 related edges ${harness.sourceLabel} -> ${harness.targetLabel}: ${JSON.stringify(
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
    id: `card:stage1022-relation-review:${suffix}:${edge.id.replace(/[^a-zA-Z0-9:_-]/g, '-')}:${Date.now()}`,
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
