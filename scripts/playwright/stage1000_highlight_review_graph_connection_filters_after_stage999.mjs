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
const outputDir = process.env.RECALL_STAGE1000_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE1000_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE1000_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE1000_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE1000_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE1000_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage1000-highlight-review-graph-filters-failure.png'), { force: true })

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
  harness = await createHighlightReviewGraphFilterHarness({ baseUrl, stageLabel: 'Stage 1000' })
  const captures = {}
  const metrics = {
    cleanupUtilityDryRunMatchedAfterStage1000: null,
    homeConnectedFilterShowsOpenGraphAfterReload: false,
    homeGraphPromotionFromUnconnectedFocusedGraph: false,
    homeGraphUnconnectedFilterVisible: false,
    homeSessionGraphActionPreserved: false,
    homeUnconnectedFilterShowsOnlyGraphGaps: false,
    readerGeneratedOutputsFrozen: false,
    sourceConnectedFilterOpenGraphFocusedNode: false,
    sourceLearningGapGraphFilterVisible: false,
    sourceUnconnectedFilterShowsGraphGap: false,
    sourceUnconnectedSessionPreserved: false,
    stage998RowActionsPreserved: false,
  }

  const readerView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(harness.homeDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  metrics.readerGeneratedOutputsFrozen =
    readerView?.mode === 'reflowed' && JSON.stringify(readerView).includes('Stage 1000 home graph filter target')

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()

  const collectionReview = page.getByRole('region', { name: 'Collection highlight review', exact: true })
  await collectionReview.waitFor({ state: 'visible', timeout: 20000 })
  metrics.homeGraphUnconnectedFilterVisible =
    (await collectionReview.getByRole('group', { name: 'Collection highlight review Graph filters' }).isVisible()) &&
    (await collectionReview.getByRole('button', { name: 'Show Graph-unconnected highlights' }).isVisible()) &&
    (await collectionReview.getByRole('button', { name: 'Show Graph-connected highlights' }).isVisible())

  await collectionReview.getByRole('button', { name: 'Show Graph-unconnected highlights' }).click()
  await collectionReview.getByText(harness.homeNoteBody).waitFor({ state: 'visible', timeout: 20000 })
  const homeUnconnectedRow = collectionReview.locator('[data-highlight-review-row-state-stage976]').filter({
    hasText: harness.homeNoteBody,
  })
  metrics.homeUnconnectedFilterShowsOnlyGraphGaps =
    (await homeUnconnectedRow.getByText('Not in Graph').isVisible()) &&
    !(await collectionReview.getByText(harness.sourceConnectedNoteBody).isVisible().catch(() => false))
  const homeSession = collectionReview.locator('[data-highlight-review-session-stage996="home"]')
  await homeSession.getByRole('button', { name: 'Start visible review' }).click()
  await homeSession.getByText('1 of 2').waitFor({ state: 'visible', timeout: 20000 })
  metrics.homeSessionGraphActionPreserved =
    (await homeSession.getByText('Not in Graph').isVisible()) &&
    (await homeSession.getByRole('button', { name: 'Create Graph node' }).isVisible())
  metrics.stage998RowActionsPreserved =
    (await homeUnconnectedRow.getByRole('button', { name: 'Create Graph node' }).isVisible()) &&
    (await homeUnconnectedRow.getByRole('button', { name: `Create Study card from ${harness.homeDocument.title}` }).isVisible())
  captures.homeUnconnectedGraphFilter = await captureLocatorScreenshot(
    page,
    collectionReview,
    outputDir,
    'stage1000-home-unconnected-graph-filter.png',
  )

  await homeUnconnectedRow.getByRole('button', { name: 'Create Graph node' }).click()
  const workbench = page.getByRole('region', { name: 'Selected note workbench' })
  await workbench.waitFor({ state: 'visible', timeout: 20000 })
  await workbench.getByRole('tab', { name: 'Promote to Graph', selected: true }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await workbench.getByRole('textbox', { name: 'Graph label' }).fill(harness.homeGraphLabel)
  captures.notebookGraphPromotionFromUnconnected = await captureLocatorScreenshot(
    page,
    workbench,
    outputDir,
    'stage1000-notebook-graph-promotion-from-unconnected.png',
  )
  await workbench.getByRole('button', { name: 'Promote node' }).click()
  await page.getByRole('tab', { name: 'Graph', selected: true }).first().waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('region', { name: `${harness.homeDocument.title} workspace` }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  metrics.homeGraphPromotionFromUnconnectedFocusedGraph = true
  captures.homeFocusedGraphAfterUnconnectedPromotion = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1000-home-focused-graph-after-unconnected-promotion.png',
  )

  const homeConnectedInbox = await waitForGraphCoverage({
    baseUrl,
    collectionId: harness.collectionId,
    noteId: harness.homeNote.id,
    reviewState: 'reviewed',
    state: 'connected',
  })
  const homeConnectedRow = homeConnectedInbox.rows.find((row) => row.note_id === harness.homeNote.id)
  harness.homeGraphNodeId = homeConnectedRow?.graph_node_id ?? null

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()
  await collectionReview.waitFor({ state: 'visible', timeout: 20000 })
  await collectionReview.getByRole('button', { name: 'Show Graph-connected highlights' }).click()
  await collectionReview.getByText(harness.homeNoteBody).waitFor({ state: 'visible', timeout: 20000 })
  metrics.homeConnectedFilterShowsOpenGraphAfterReload =
    (await collectionReview.getByText('Connected to Graph').first().isVisible()) &&
    (await collectionReview.getByRole('button', { name: 'Open Graph node' }).first().isVisible())
  captures.homeConnectedGraphFilterAfterReload = await captureLocatorScreenshot(
    page,
    collectionReview,
    outputDir,
    'stage1000-home-connected-graph-filter-after-reload.png',
  )

  await collectionReview.getByRole('button', { name: 'Show Graph-unconnected highlights' }).click()
  await collectionReview.getByText(harness.sourceUnconnectedNoteBody).waitFor({ state: 'visible', timeout: 20000 })
  const sourceUnconnectedCollectionRow = collectionReview.locator('[data-highlight-review-row-state-stage976]').filter({
    hasText: harness.sourceUnconnectedNoteBody,
  })
  await sourceUnconnectedCollectionRow.getByRole('button', { name: 'Open in Notebook' }).click()
  const overviewTab = page.getByRole('tab', { name: 'Overview' }).first()
  await overviewTab.waitFor({ state: 'visible', timeout: 20000 })
  await overviewTab.click()
  const learningGaps = page.locator('[data-source-learning-gaps-stage978="true"]')
  await learningGaps.waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceLearningGapGraphFilterVisible =
    (await learningGaps.getByText(/not in Graph/i).isVisible()) &&
    (await learningGaps.getByRole('button', { name: 'Graph-unconnected highlights' }).isVisible())
  captures.sourceLearningGapGraphFilter = await captureLocatorScreenshot(
    page,
    learningGaps,
    outputDir,
    'stage1000-source-learning-gap-graph-filter.png',
  )

  await learningGaps.getByRole('button', { name: 'Graph-unconnected highlights' }).click()
  const sourceReview = page.getByRole('region', { name: 'Source highlight review', exact: true })
  await sourceReview.waitFor({ state: 'visible', timeout: 20000 })
  await sourceReview.getByText(harness.sourceUnconnectedNoteBody).waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceUnconnectedFilterShowsGraphGap =
    (await sourceReview.getByText('Not in Graph').first().isVisible()) &&
    !(await sourceReview.getByText(harness.sourceConnectedNoteBody).isVisible().catch(() => false))
  const sourceSession = sourceReview.locator('[data-highlight-review-session-stage996="source"]')
  await sourceSession.getByRole('button', { name: 'Start visible review' }).click()
  await sourceSession.getByText('1 of 1').waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceUnconnectedSessionPreserved =
    (await sourceSession.getByText('Not in Graph').isVisible()) &&
    (await sourceSession.getByRole('button', { name: 'Create Graph node' }).isVisible())
  captures.sourceUnconnectedGraphFilter = await captureLocatorScreenshot(
    page,
    sourceReview,
    outputDir,
    'stage1000-source-unconnected-graph-filter.png',
  )

  await sourceReview.getByRole('button', { name: 'Show Graph-connected highlights' }).click()
  await sourceReview.getByText(harness.sourceConnectedNoteBody).waitFor({ state: 'visible', timeout: 20000 })
  await sourceReview.getByRole('button', { name: 'Open Graph node' }).first().click()
  await page.getByRole('tab', { name: 'Graph', selected: true }).first().waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('region', { name: `${harness.sourceDocument.title} workspace` }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const sourceGraphDetail = await fetchJson(
    `${baseUrl}/api/recall/graph/nodes/${encodeURIComponent(harness.sourceGraphNodeId)}`,
  )
  metrics.sourceConnectedFilterOpenGraphFocusedNode =
    sourceGraphDetail?.node?.id === harness.sourceGraphNodeId && sourceGraphDetail.node.status !== 'rejected'
  captures.sourceFocusedGraphFromConnectedFilter = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1000-source-focused-graph-from-connected-filter.png',
  )

  await cleanupHighlightReviewGraphFilterHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage1000 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage1000: 0,
    homeConnectedFilterShowsOpenGraphAfterReload: true,
    homeGraphPromotionFromUnconnectedFocusedGraph: true,
    homeGraphUnconnectedFilterVisible: true,
    homeSessionGraphActionPreserved: true,
    homeUnconnectedFilterShowsOnlyGraphGaps: true,
    readerGeneratedOutputsFrozen: true,
    sourceConnectedFilterOpenGraphFocusedNode: true,
    sourceLearningGapGraphFilterVisible: true,
    sourceUnconnectedFilterShowsGraphGap: true,
    sourceUnconnectedSessionPreserved: true,
    stage998RowActionsPreserved: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(
        `Stage 1000 expected ${metricName}: ${expected}, got ${metrics[metricName]}. Metrics: ${JSON.stringify(
          metrics,
        )}`,
      )
    }
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage1000-highlight-review-graph-connection-filters-after-stage999',
  }
  await writeFile(
    path.join(outputDir, 'stage1000-highlight-review-graph-filter-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(page, outputDir, 'stage1000-highlight-review-graph-filters-failure.png').catch(
    () => null,
  )
  throw error
} finally {
  await cleanupHighlightReviewGraphFilterHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 1000 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

async function createHighlightReviewGraphFilterHarness({ baseUrl, stageLabel }) {
  const timestamp = Date.now()
  const collectionId = `collection:stage1000-highlight-graph-filters-${timestamp}`
  const collectionName = `${stageLabel} Graph Filter Queue`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }

  const homeDocument = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} home opener. ${stageLabel} home graph filter target. ${stageLabel} home graph follow-up.`,
    title: `${stageLabel} Graph Filter Home Source ${timestamp}`,
  })
  const homeView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(homeDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  const homeNoteBody = `${stageLabel} home graph filter note ${timestamp}`
  const homeNote = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(homeDocument.id)}/notes`, {
    anchor: buildNoteAnchor(homeDocument.id, homeView, { sentenceStart: 1, sentenceEnd: 1 }),
    body_text: homeNoteBody,
  })

  const sourceDocument = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} source opener. ${stageLabel} source connected graph target. ${stageLabel} source unconnected graph target.`,
    title: `${stageLabel} Graph Filter Source ${timestamp}`,
  })
  const sourceView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(sourceDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  const sourceConnectedNoteBody = `${stageLabel} source connected graph filter note ${timestamp}`
  const sourceConnectedNote = await postJson(
    `${baseUrl}/api/recall/documents/${encodeURIComponent(sourceDocument.id)}/notes`,
    {
      anchor: buildNoteAnchor(sourceDocument.id, sourceView, { sentenceStart: 1, sentenceEnd: 1 }),
      body_text: sourceConnectedNoteBody,
    },
  )
  const sourceGraphDetail = await postJson(
    `${baseUrl}/api/recall/notes/${encodeURIComponent(sourceConnectedNote.id)}/promote/graph-node`,
    {
      description: 'Temporary Stage 1000 source connected graph node.',
      label: `${stageLabel} Source Connected Graph Node ${timestamp}`,
    },
  )

  const sourceUnconnectedNoteBody = `${stageLabel} source unconnected graph filter note ${timestamp}`
  const sourceUnconnectedNote = await postJson(
    `${baseUrl}/api/recall/documents/${encodeURIComponent(sourceDocument.id)}/notes`,
    {
      anchor: buildNoteAnchor(sourceDocument.id, sourceView, { sentenceStart: 2, sentenceEnd: 2 }),
      body_text: sourceUnconnectedNoteBody,
    },
  )

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
    homeGraphLabel: `${stageLabel} Home Graph Filter Node ${timestamp}`,
    homeGraphNodeId: null,
    homeNote,
    homeNoteBody,
    originalLibrarySettings,
    sourceConnectedNote,
    sourceConnectedNoteBody,
    sourceDocument,
    sourceGraphNodeId: sourceGraphDetail.node.id,
    sourceUnconnectedNote,
    sourceUnconnectedNoteBody,
  }
}

async function cleanupHighlightReviewGraphFilterHarness({ baseUrl, harness }) {
  if (!harness) {
    return
  }
  await fetch(`${baseUrl}/api/recall/library/settings`, {
    body: JSON.stringify(harness.originalLibrarySettings),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  }).catch(() => null)
  const graphNodeIds = [harness.homeGraphNodeId, harness.sourceGraphNodeId].filter(Boolean)
  await Promise.all(
    graphNodeIds.map((nodeId) =>
      fetch(`${baseUrl}/api/recall/graph/nodes/${encodeURIComponent(nodeId)}/decision`, {
        body: JSON.stringify({ decision: 'rejected' }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }).catch(() => null),
    ),
  )
  const notes = [harness.homeNote, harness.sourceConnectedNote, harness.sourceUnconnectedNote].filter(Boolean)
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

async function waitForGraphCoverage({
  baseUrl,
  collectionId = null,
  noteId,
  reviewState,
  sourceDocumentId = null,
  state,
  timeoutMs = 10000,
}) {
  const startedAt = Date.now()
  let lastPayload = null
  while (Date.now() - startedAt < timeoutMs) {
    lastPayload = await fetchHighlightInbox({ baseUrl, collectionId, sourceDocumentId, state })
    const matchedRow = (lastPayload.rows ?? []).find(
      (row) => row.note_id === noteId && row.review_state === reviewState && row.graph_covered && row.graph_node_id,
    )
    if (matchedRow) {
      return lastPayload
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(
    `Timed out waiting for graph coverage for ${noteId} in ${state}/${reviewState}: ${JSON.stringify(lastPayload)}`,
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
