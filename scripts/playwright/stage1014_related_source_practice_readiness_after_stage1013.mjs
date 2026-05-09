import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { execFile } from 'node:child_process'
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
const outputDir = process.env.RECALL_STAGE1014_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE1014_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE1014_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE1014_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE1014_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE1014_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage1014-related-source-practice-readiness-failure.png'), { force: true })

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
  harness = await createRelatedSourcePracticeHarness({ baseUrl, stageLabel: 'Stage 1014' })
  harness.edges = await waitForHarnessRelatedEdges({ baseUrl, harness })
  harness.practiceCards = await Promise.all(
    harness.edges.map((edge) => insertHarnessRelationPracticeCard({ edge, harness })),
  )
  let selectedRelationLabel = null
  let selectedPracticeCards = []
  const captures = {}
  const metrics = {
    cleanupUtilityDryRunMatchedAfterStage1014: null,
    generatedReaderOutputsFrozen: false,
    homeCollectionSourceHandoffPreserved: false,
    relationPracticeChipClearRestoresSourceQuestions: false,
    relationPracticeFilterShowsOnlyMatchingCards: false,
    relationPracticeHandoffOpensStudyQuestions: false,
    sourceOverviewRelationPracticeCoverageVisible: false,
  }

  const readerView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(harness.primaryDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  metrics.generatedReaderOutputsFrozen =
    readerView?.mode === 'reflowed' && JSON.stringify(readerView).includes(harness.sourceLabel)

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()
  const readingQueue = page.getByRole('region', { name: 'Reading queue' })
  await readingQueue.waitFor({ state: 'visible', timeout: 30000 })
  const primaryQueueRow = readingQueue.locator('[data-reading-queue-learning-gaps-stage978]').filter({
    hasText: harness.primaryDocument.title,
  })
  await primaryQueueRow.waitFor({ state: 'visible', timeout: 30000 })
  metrics.homeCollectionSourceHandoffPreserved = true
  captures.homeCollectionSourceQueue = await captureLocatorScreenshot(
    page,
    primaryQueueRow,
    outputDir,
    'stage1014-home-collection-source-queue.png',
  )

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: `Open ${harness.primaryDocument.title}` }).first().click()
  await page.getByRole('heading', { name: harness.primaryDocument.title }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const relatedConnectionsList = page.locator('[data-source-overview-related-graph-connections-stage1010="true"]')
  await relatedConnectionsList.waitFor({ state: 'visible', timeout: 30000 })
  let relatedRow = null
  for (const edge of harness.edges) {
    const relationLabel = formatGraphRelationLabel(edge)
    const candidateRow = relatedConnectionsList
      .locator(
        `[data-source-overview-related-graph-row-stage1010][data-source-overview-related-graph-edge-id-stage1014="${cssAttributeValue(
          edge.id,
        )}"]`,
      )
      .filter({ hasText: harness.secondaryDocument.title })
    if (await candidateRow.first().isVisible().catch(() => false)) {
      selectedRelationLabel = relationLabel
      selectedPracticeCards = harness.practiceCards.filter((card) =>
        (card.source_spans ?? []).some((span) => span.edge_id === edge.id),
      )
      relatedRow = candidateRow.first()
      break
    }
  }
  if (!relatedRow || !selectedRelationLabel) {
    throw new Error(
      `Could not find a visible Stage 1014 related row for ${harness.secondaryDocument.title}. Candidate relations: ${harness.edges
        .map(formatGraphRelationLabel)
        .join(', ')}`,
    )
  }
  await relatedRow.waitFor({ state: 'visible', timeout: 20000 })
  await relatedRow.getByText(/practice question/).waitFor({ state: 'visible', timeout: 20000 })
  await relatedRow.getByRole('button', { name: `Practice relation: ${selectedRelationLabel}` }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  metrics.sourceOverviewRelationPracticeCoverageVisible =
    (await relatedRow.getByText(selectedRelationLabel).first().isVisible()) &&
    (await relatedRow.getByText(/practice question/).first().isVisible()) &&
    (await relatedRow.getByRole('button', { name: `Practice relation: ${selectedRelationLabel}` }).isVisible())
  captures.sourceOverviewRelationPracticeReady = await captureLocatorScreenshot(
    page,
    relatedConnectionsList,
    outputDir,
    'stage1014-source-overview-relation-practice-ready.png',
  )

  await relatedRow.getByRole('button', { name: `Practice relation: ${selectedRelationLabel}` }).click()
  await page.waitForURL(/\/recall\?section=study/, { timeout: 20000 })
  const questionManager = page.getByLabel('Study questions manager')
  await questionManager.waitFor({ state: 'visible', timeout: 30000 })
  const relationFilter = questionManager.getByLabel('Active study relation filter')
  await relationFilter.waitFor({ state: 'visible', timeout: 20000 })
  const matchingQuestionRow = questionManager
    .locator('[data-study-relation-question-result-stage1014]')
    .filter({ hasText: harness.sourceLabel })
  await matchingQuestionRow.first().waitFor({ state: 'visible', timeout: 20000 })
  const visibleRelationRows = await countVisibleLocators(
    questionManager.locator('[data-study-relation-question-result-stage1014]'),
  )
  metrics.relationPracticeHandoffOpensStudyQuestions = page.url().includes('/recall?section=study')
  metrics.relationPracticeFilterShowsOnlyMatchingCards =
    (await relationFilter.getByText(`Relation: ${selectedRelationLabel}`).isVisible()) &&
    visibleRelationRows === selectedPracticeCards.length &&
    (await matchingQuestionRow.first().isVisible())
  captures.studyRelationPracticeFilter = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1014-study-relation-practice-filter.png',
  )

  await relationFilter.getByRole('button', { name: 'Clear relation' }).click()
  await expectHidden(relationFilter)
  const restoredSourceQuestionRow = questionManager
    .locator('[data-study-question-schedule-state-stage934]')
    .filter({ hasText: harness.primaryDocument.title })
    .first()
  await restoredSourceQuestionRow.waitFor({ state: 'visible', timeout: 20000 })
  metrics.relationPracticeChipClearRestoresSourceQuestions =
    (await questionManager.locator('[data-study-relation-question-result-stage1014]').count()) === 0 &&
    (await restoredSourceQuestionRow.isVisible())

  await cleanupRelatedSourcePracticeHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage1014 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage1014: 0,
    generatedReaderOutputsFrozen: true,
    homeCollectionSourceHandoffPreserved: true,
    relationPracticeChipClearRestoresSourceQuestions: true,
    relationPracticeFilterShowsOnlyMatchingCards: true,
    relationPracticeHandoffOpensStudyQuestions: true,
    sourceOverviewRelationPracticeCoverageVisible: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(
        `Stage 1014 expected ${metricName}: ${expected}, got ${metrics[metricName]}. Metrics: ${JSON.stringify(
          metrics,
        )}`,
      )
    }
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage1014-related-source-practice-readiness-after-stage1013',
  }
  await writeFile(
    path.join(outputDir, 'stage1014-related-source-practice-readiness-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(page, outputDir, 'stage1014-related-source-practice-readiness-failure.png').catch(
    () => null,
  )
  throw error
} finally {
  await cleanupRelatedSourcePracticeHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 1014 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

function cssAttributeValue(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

async function createRelatedSourcePracticeHarness({ baseUrl, stageLabel }) {
  const timestamp = Date.now()
  const collectionId = `collection:stage1014-relation-practice-${timestamp}`
  const collectionName = `${stageLabel} Relation Practice`
  const sourceLabel = `Relation Practice Alpha Lima${timestamp}`
  const targetLabel = `Relation Practice Beta Lima${timestamp}`
  const relationSentence = `${sourceLabel} uses ${targetLabel} to make related saved sources practice-ready in Study.`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }
  const primaryDocument = await importHarnessDocument({
    baseUrl,
    bodyText: Array.from(
      { length: 12 },
      (_, index) => `${stageLabel} primary relation-practice evidence ${index + 1}. ${relationSentence}`,
    ).join(' '),
    title: `${stageLabel} Relation Practice Primary ${timestamp}`,
  })
  const secondaryDocument = await importHarnessDocument({
    baseUrl,
    bodyText: Array.from(
      { length: 12 },
      (_, index) => `${stageLabel} companion relation-practice evidence ${index + 1}. ${relationSentence}`,
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
    `Timed out waiting for Stage 1014 related edges ${harness.sourceLabel} -> ${harness.targetLabel}: ${JSON.stringify(
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
    id: `card:stage1014-relation-practice:${edge.id.replace(/[^a-zA-Z0-9:_-]/g, '-')}:${Date.now()}`,
    prompt: `How does ${harness.sourceLabel} relate to ${harness.targetLabel} through ${formatGraphRelationLabel(edge)}?`,
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

async function cleanupRelatedSourcePracticeHarness({ baseUrl, harness }) {
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
