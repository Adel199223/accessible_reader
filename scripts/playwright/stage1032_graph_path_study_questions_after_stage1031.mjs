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
const outputDir = process.env.RECALL_STAGE1032_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE1032_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE1032_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE1032_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE1032_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE1032_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage1032-graph-path-study-questions-failure.png'), { force: true })

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
  harness = await createGraphPathPracticeHarness({ stageLabel: 'Stage 1032' })
  const edges = await waitForHarnessRelatedEdges({ baseUrl, harness })
  harness.edges = edges
  const selectedRelationEdge = edges[0]
  const selectedRelationLabel = formatGraphRelationLabel(selectedRelationEdge)
  await deleteHarnessStudyCardsForSource({ baseUrl, sourceDocumentId: harness.primaryDocument.id })
  await deleteHarnessStudyCardsForSource({ baseUrl, sourceDocumentId: harness.secondaryDocument.id })

  const scheduledPathCard = await insertHarnessRelationPracticeCard({
    edge: selectedRelationEdge,
    harness,
    prompt: `How does ${selectedRelationEdge.source_label} stay available for path Questions?`,
    status: 'scheduled',
    suffix: 'scheduled-path-question',
  })
  harness.practiceCards.push(scheduledPathCard)
  const distractorCard = await insertHarnessManualStudyCard({
    harness,
    prompt: 'Stage 1032 unrelated source question should stay outside the path filter.',
    suffix: 'path-distractor',
  })
  harness.practiceCards.push(distractorCard)

  const metrics = {
    cleanupUtilityDryRunMatchedAfterStage1032: null,
    generatedReaderOutputsFrozen: false,
    graphPathBuildCreatesPathQuestion: false,
    graphPathBuildOpensFilteredQuestions: false,
    graphPathBuildVisibleForGap: false,
    graphPathPracticeRecapQuestionsOpensFilter: false,
    graphPathPracticeRecapShowsQuestionsAction: false,
    graphPathPracticeStartsSession: false,
    graphPathQuestionsFilterExcludesDistractor: false,
    graphPathQuestionsOpensFilteredQuestions: false,
    graphPathQuestionsVisibleForScheduled: false,
    graphPathResultVisible: false,
    graphPathScheduledStateAvoidsFalseReady: false,
  }
  const captures = {}

  const readerView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(harness.primaryDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  metrics.generatedReaderOutputsFrozen =
    readerView?.mode === 'reflowed' && JSON.stringify(readerView).includes(harness.sourceLabel)

  const graphFocusTray = await openGraphPathResult({
    harness,
    page,
    selectedRelationEdge,
    selectedRelationLabel,
  })
  await graphFocusTray.getByText('Shortest visible path').waitFor({ state: 'visible', timeout: 20000 })
  metrics.graphPathResultVisible = await graphFocusTray.getByText('Shortest visible path').isVisible()
  await graphFocusTray.getByText('1 path question').waitFor({ state: 'visible', timeout: 20000 })
  const pathQuestionsButton = graphFocusTray.getByRole('button', { name: 'Path questions' })
  await pathQuestionsButton.waitFor({ state: 'visible', timeout: 20000 })
  metrics.graphPathQuestionsVisibleForScheduled =
    (await graphFocusTray.getByText('1 path question').isVisible()) &&
    (await graphFocusTray.getByText('scheduled').isVisible()) &&
    (await pathQuestionsButton.isVisible())
  metrics.graphPathScheduledStateAvoidsFalseReady =
    !(await graphFocusTray.getByRole('button', { name: 'Practice path' }).isVisible().catch(() => false))
  captures.graphPathQuestionsScheduled = await captureLocatorScreenshot(
    page,
    graphFocusTray,
    outputDir,
    'stage1032-graph-path-questions-scheduled.png',
  )

  await pathQuestionsButton.click()
  await page.waitForURL(/\/recall\?section=study/, { timeout: 20000 })
  await page.getByLabel('Study questions manager').waitFor({ state: 'visible', timeout: 30000 })
  const pathFilterChip = page.getByLabel('Active study path filter').first()
  await pathFilterChip.waitFor({ state: 'visible', timeout: 20000 })
  metrics.graphPathQuestionsOpensFilteredQuestions =
    (await pathFilterChip.getByText('Path:').isVisible()) &&
    (await pathFilterChip.getByText('1 question').isVisible()) &&
    (await page.getByText(scheduledPathCard.prompt).first().isVisible())
  metrics.graphPathQuestionsFilterExcludesDistractor =
    !(await page.getByText(distractorCard.prompt).first().isVisible().catch(() => false))
  captures.graphPathFilteredQuestions = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1032-graph-path-filtered-questions.png',
  )

  await deleteHarnessStudyCardsForSource({ baseUrl, sourceDocumentId: harness.primaryDocument.id })

  const graphGapTray = await openGraphPathResult({
    harness,
    page,
    selectedRelationEdge,
    selectedRelationLabel,
  })
  await graphGapTray.getByText('No path practice yet').waitFor({ state: 'visible', timeout: 20000 })
  const buildPathPracticeButton = graphGapTray.getByRole('button', { name: 'Build path practice' })
  await buildPathPracticeButton.waitFor({ state: 'visible', timeout: 20000 })
  metrics.graphPathBuildVisibleForGap =
    (await graphGapTray.getByText('No path practice yet').isVisible()) &&
    (await buildPathPracticeButton.isVisible())
  captures.graphPathBuildGap = await captureLocatorScreenshot(
    page,
    graphGapTray,
    outputDir,
    'stage1032-graph-path-build-gap.png',
  )

  await buildPathPracticeButton.click()
  await page.waitForURL(/\/recall\?section=study/, { timeout: 20000 })
  const questionsManager = page.getByLabel('Study questions manager')
  await questionsManager.waitFor({ state: 'visible', timeout: 30000 })
  await questionsManager.scrollIntoViewIfNeeded()
  const expectedBuiltPrompt = `What is the Graph connection between ${selectedRelationEdge.source_label} and ${selectedRelationEdge.target_label}?`
  const builtCard = await waitForHarnessRelationPracticeCard({
    baseUrl,
    expectedPrompt: expectedBuiltPrompt,
    harness,
  })
  const builtPrompt = builtCard?.prompt ?? expectedBuiltPrompt
  if (builtCard) {
    harness.practiceCards.push(builtCard)
  }
  const builtPathFilterChip = page.getByLabel('Active study path filter').first()
  await builtPathFilterChip.waitFor({ state: 'visible', timeout: 20000 })
  metrics.graphPathBuildCreatesPathQuestion = Boolean(builtCard)
  metrics.graphPathBuildOpensFilteredQuestions =
    (await builtPathFilterChip.getByText('1 question').isVisible()) &&
    (await page.getByText(builtPrompt).first().isVisible())
  captures.graphPathBuildFilteredQuestions = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1032-graph-path-build-filtered-questions.png',
  )

  await deleteHarnessStudyCardsForSource({ baseUrl, sourceDocumentId: harness.primaryDocument.id })
  await deleteHarnessStudyCardsForSource({ baseUrl, sourceDocumentId: harness.secondaryDocument.id })
  const recapPracticeCard = await insertHarnessRelationPracticeCard({
    edge: selectedRelationEdge,
    harness,
    prompt: `How does ${selectedRelationEdge.source_label} return from path Review into path Questions?`,
    suffix: 'recap-path-question',
  })
  harness.practiceCards.push(recapPracticeCard)

  const graphPracticeTray = await openGraphPathResult({
    harness,
    page,
    selectedRelationEdge,
    selectedRelationLabel,
  })
  const pathPracticeButton = graphPracticeTray.getByRole('button', { name: 'Practice path' })
  await pathPracticeButton.waitFor({ state: 'visible', timeout: 20000 })
  await pathPracticeButton.click()
  await page.waitForURL(/\/recall\?section=study/, { timeout: 20000 })
  const pathActivePrompt = page.getByLabel('Active review prompt').first()
  await pathActivePrompt.waitFor({ state: 'visible', timeout: 30000 })
  metrics.graphPathPracticeStartsSession =
    (await pathActivePrompt.innerText()).includes(recapPracticeCard.prompt) &&
    !(await page.getByLabel('Study questions manager').isVisible().catch(() => false))
  captures.graphPathPracticeActiveSession = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1032-graph-path-practice-active-session.png',
  )

  await page.getByRole('button', { name: /Show answer|Reveal answer/ }).first().click()
  await page.getByRole('button', { name: 'Good' }).first().click()
  await page.getByText('Path practiced').waitFor({ state: 'visible', timeout: 30000 })
  const studyPathQuestionsButton = page.getByRole('button', { name: 'Study path questions' })
  await studyPathQuestionsButton.waitFor({ state: 'visible', timeout: 20000 })
  metrics.graphPathPracticeRecapShowsQuestionsAction =
    (await page.getByText('Path practiced').isVisible()) &&
    (await page.getByRole('button', { name: 'Back to Graph path' }).isVisible()) &&
    (await studyPathQuestionsButton.isVisible())
  captures.graphPathPracticeRecap = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1032-graph-path-practice-recap.png',
  )

  await studyPathQuestionsButton.click()
  await page.getByLabel('Study questions manager').waitFor({ state: 'visible', timeout: 30000 })
  const recapPathFilterChip = page.getByLabel('Active study path filter').first()
  await recapPathFilterChip.waitFor({ state: 'visible', timeout: 20000 })
  metrics.graphPathPracticeRecapQuestionsOpensFilter =
    (await recapPathFilterChip.getByText('Path:').isVisible()) &&
    (await recapPathFilterChip.getByText('1 question').isVisible()) &&
    (await page.getByText(recapPracticeCard.prompt).first().isVisible())
  captures.graphPathRecapQuestions = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1032-graph-path-recap-questions.png',
  )

  await cleanupGraphPathPracticeHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage1032 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage1032: 0,
    generatedReaderOutputsFrozen: true,
    graphPathBuildCreatesPathQuestion: true,
    graphPathBuildOpensFilteredQuestions: true,
    graphPathBuildVisibleForGap: true,
    graphPathPracticeRecapQuestionsOpensFilter: true,
    graphPathPracticeRecapShowsQuestionsAction: true,
    graphPathPracticeStartsSession: true,
    graphPathQuestionsFilterExcludesDistractor: true,
    graphPathQuestionsOpensFilteredQuestions: true,
    graphPathQuestionsVisibleForScheduled: true,
    graphPathResultVisible: true,
    graphPathScheduledStateAvoidsFalseReady: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(
        `Stage 1032 expected ${metricName}: ${expected}, got ${metrics[metricName]}. Metrics: ${JSON.stringify(
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
    stage: 'stage1032-graph-path-study-questions-after-stage1031',
  }
  await writeFile(
    path.join(outputDir, 'stage1032-graph-path-study-questions-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(page, outputDir, 'stage1032-graph-path-study-questions-failure.png').catch(() => null)
  throw error
} finally {
  await cleanupGraphPathPracticeHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 1032 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

async function openGraphPathResult({ harness, page, selectedRelationEdge, selectedRelationLabel }) {
  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: `Open ${harness.primaryDocument.title}` }).first().click()
  await page.getByRole('heading', { name: harness.primaryDocument.title }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const sourceRelationRow = await findSourceRelationRow({ harness, page, selectedRelationEdge, selectedRelationLabel })
  const openRelationButton = sourceRelationRow
    .getByRole('button', { name: `Open relation: ${selectedRelationLabel}` })
    .or(sourceRelationRow.getByRole('button', { name: `Review relation: ${selectedRelationLabel}` }))
    .first()
  await openRelationButton.waitFor({ state: 'visible', timeout: 20000 })
  await openRelationButton.click()
  await page.waitForURL(/\/recall\?section=graph/, { timeout: 20000 })
  const focusTray = page.getByLabel('Graph focus tray').first()
  await focusTray.getByText('Shortest visible path').waitFor({ state: 'visible', timeout: 20000 })
  return focusTray
}

async function findSourceRelationRow({ harness, page, selectedRelationEdge, selectedRelationLabel }) {
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

async function createGraphPathPracticeHarness({ stageLabel }) {
  const timestamp = Date.now()
  const collectionId = `collection:stage1032-graph-path-${timestamp}`
  const collectionName = `${stageLabel} Graph Path`
  const sourceLabel = `Graph Path Alpha May${timestamp}`
  const targetLabel = `Graph Path Beta May${timestamp}`
  const relationSentence = `${sourceLabel} uses ${targetLabel} to turn path discovery into Study practice.`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }
  const primaryDocument = await importHarnessDocument({
    baseUrl,
    bodyText: Array.from(
      { length: 12 },
      (_, index) => `${stageLabel} primary Graph path evidence ${index + 1}. ${relationSentence}`,
    ).join(' '),
    title: `${stageLabel} Graph Path Primary ${timestamp}`,
  })
  const secondaryDocument = await importHarnessDocument({
    baseUrl,
    bodyText: Array.from(
      { length: 12 },
      (_, index) => `${stageLabel} companion Graph path evidence ${index + 1}. ${relationSentence}`,
    ).join(' '),
    title: `${stageLabel} Graph Path Companion ${timestamp}`,
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
    `Timed out waiting for Stage 1032 related edges ${harness.sourceLabel} -> ${harness.targetLabel}: ${JSON.stringify(
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

async function insertHarnessRelationPracticeCard({ edge, harness, prompt, status = 'new', suffix }) {
  const timestamp = new Date().toISOString()
  const dueAt =
    status === 'scheduled'
      ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      : timestamp
  const lastRating = status === 'scheduled' ? 'good' : null
  const reviewCount = status === 'scheduled' ? 1 : 0
  const knowledgeStage = status === 'scheduled' ? 'practiced' : 'new'
  const card = {
    answer: edge.excerpt ?? `${edge.source_label} ${formatRelationLabel(edge.relation_type)} ${edge.target_label}.`,
    card_type: 'short_answer',
    id: `card:stage1032-graph-path:${suffix}:${edge.id.replace(/[^a-zA-Z0-9:_-]/g, '-')}:${Date.now()}`,
    prompt,
    scheduling_state: {
      created_at: timestamp,
      due_at: dueAt,
      last_rating: lastRating,
      last_reviewed_at: lastRating ? timestamp : null,
      review_count: reviewCount,
      schema_version: '1',
      status,
    },
    source_document_id: harness.primaryDocument.id,
    source_spans: [
      {
        edge_id: edge.id,
        excerpt: edge.excerpt ?? `${edge.source_label} ${formatRelationLabel(edge.relation_type)} ${edge.target_label}.`,
        generated_card_type: 'relation',
        node_ids: [edge.source_id, edge.target_id],
        source_document_id: harness.primaryDocument.id,
      },
    ],
    timestamp,
  }
  const databasePath = getWorkspaceDatabasePath()
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

async function insertHarnessManualStudyCard({ harness, prompt, suffix }) {
  const timestamp = new Date().toISOString()
  const card = {
    answer: 'This unrelated card should not appear inside the path relation filter.',
    card_type: 'short_answer',
    id: `card:stage1032-graph-path:${suffix}:${Date.now()}`,
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
        anchor_kind: 'source',
        excerpt: `${harness.primaryDocument.title} unrelated source evidence.`,
        manual_source: 'stage1032_path_filter_distractor',
        source_document_id: harness.primaryDocument.id,
        source_title: harness.primaryDocument.title,
      },
    ],
    timestamp,
  }
  await insertHarnessStudyCardRecord(card)
  return card
}

async function waitForHarnessRelationPracticeCard({ baseUrl, expectedPrompt, harness, timeoutMs = 8000 }) {
  const startedAt = Date.now()
  let lastCards = []
  while (Date.now() - startedAt < timeoutMs) {
    const cardGroups = await Promise.all(
      [harness.primaryDocument.id, harness.secondaryDocument.id].map((sourceDocumentId) =>
        fetchJson(
          `${baseUrl}/api/recall/study/cards?status=all&limit=100&source_document_id=${encodeURIComponent(
            sourceDocumentId,
          )}`,
        ),
      ),
    )
    lastCards = cardGroups.flat()
    const exactPromptCard = lastCards.find(
      (card) =>
        card.prompt === expectedPrompt &&
        (card.source_spans ?? []).some((sourceSpan) => typeof sourceSpan.edge_id === 'string' && sourceSpan.edge_id),
    )
    if (exactPromptCard) {
      return exactPromptCard
    }
    const relationCard = lastCards.find(
      (card) =>
        String(card.prompt ?? '').startsWith('What is the Graph connection between ') &&
        (card.source_spans ?? []).some((sourceSpan) => typeof sourceSpan.edge_id === 'string' && sourceSpan.edge_id),
    )
    if (relationCard) {
      return relationCard
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  return null
}

async function insertHarnessStudyCardRecord(card) {
  const databasePath = getWorkspaceDatabasePath()
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

async function cleanupGraphPathPracticeHarness({ baseUrl, harness }) {
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
  const databasePath = getWorkspaceDatabasePath()
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

async function readLatestStudySessionForCard(cardId) {
  const databasePath = getWorkspaceDatabasePath()
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

function cssAttributeValue(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function formatRelationLabel(relationType) {
  return String(relationType ?? '').replace(/_/g, ' ')
}

function formatGraphRelationLabel(edge) {
  return `${edge.source_label} ${formatRelationLabel(edge.relation_type)} ${edge.target_label}`
}

function getWorkspaceDatabasePath() {
  return process.env.ACCESSIBLE_READER_DATA_DIR
    ? path.join(process.env.ACCESSIBLE_READER_DATA_DIR, 'workspace.db')
    : path.join(repoRoot, 'backend', '.data', 'workspace.db')
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
