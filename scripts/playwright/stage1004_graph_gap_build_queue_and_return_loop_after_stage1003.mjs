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
const outputDir = process.env.RECALL_STAGE1004_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE1004_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE1004_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE1004_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE1004_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE1004_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage1004-graph-gap-build-queue-failure.png'), { force: true })

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
  harness = await createGraphGapBuildQueueHarness({ baseUrl, stageLabel: 'Stage 1004' })
  const captures = {}
  const metrics = {
    cleanupUtilityDryRunMatchedAfterStage1004: null,
    graphBuildQueueCreateActionVisible: false,
    graphBuildQueueOpenSourceReviewVisible: false,
    graphBuildQueueShowsUnconnectedNote: false,
    graphPromotionBackToGapsVisible: false,
    graphPromotionFocusedGraph: false,
    readerGeneratedOutputsFrozen: false,
    sourceOpenReviewUsesUnconnected: false,
    sourceReturnKeepsRemainingGraphGap: false,
    sourceReturnRemovesPromotedGraphGap: false,
  }

  const unconnectedInbox = await fetchHighlightInbox({
    baseUrl,
    sourceDocumentId: harness.document.id,
    state: 'unconnected',
  })
  if ((unconnectedInbox.rows ?? []).filter((row) => row.source_document_id === harness.document.id).length < 2) {
    throw new Error(`Stage 1004 harness expected two unconnected rows: ${JSON.stringify(unconnectedInbox)}`)
  }

  const readerView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(harness.document.id)}/view?mode=reflowed&detail_level=default`,
  )
  metrics.readerGeneratedOutputsFrozen =
    readerView?.mode === 'reflowed' && JSON.stringify(readerView).includes('Stage 1004 graph gap target')

  await page.goto(`${baseUrl}/recall?section=graph`, { waitUntil: 'networkidle' })
  const graphRail = page.getByRole('complementary', { name: 'Graph settings sidebar' })
  await graphRail.waitFor({ state: 'visible', timeout: 20000 })
  const graphGapQueue = graphRail.getByRole('region', { name: 'Graph gap build queue' })
  await graphGapQueue.waitFor({ state: 'visible', timeout: 20000 })
  await graphGapQueue.getByText(harness.primaryNote.body_text).waitFor({ state: 'visible', timeout: 20000 })
  const primaryQueueRow = graphGapQueue.locator('[data-graph-gap-build-row-stage1004]').filter({
    hasText: harness.primaryNote.body_text,
  })
  metrics.graphBuildQueueShowsUnconnectedNote = true
  metrics.graphBuildQueueCreateActionVisible = await primaryQueueRow
    .getByRole('button', { name: 'Create Graph node' })
    .isVisible()
  metrics.graphBuildQueueOpenSourceReviewVisible = await primaryQueueRow
    .getByRole('button', { name: 'Open source review' })
    .isVisible()
  captures.graphGapBuildQueue = await captureLocatorScreenshot(
    page,
    graphGapQueue,
    outputDir,
    'stage1004-graph-gap-build-queue.png',
  )

  await primaryQueueRow.getByRole('button', { name: 'Open source review' }).click()
  const sourceReview = page.getByRole('region', { name: 'Source highlight review', exact: true })
  await sourceReview.waitFor({ state: 'visible', timeout: 20000 })
  await sourceReview.getByText(harness.primaryNote.body_text).waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceOpenReviewUsesUnconnected =
    (await sourceReview.getByRole('button', { name: 'Show Graph-unconnected highlights' }).isVisible()) &&
    (await sourceReview.getByText('Not in Graph').first().isVisible())
  captures.sourceReviewFromGraphBuildQueue = await captureLocatorScreenshot(
    page,
    sourceReview,
    outputDir,
    'stage1004-source-review-from-graph-build-queue.png',
  )

  await page.goto(`${baseUrl}/recall?section=graph`, { waitUntil: 'networkidle' })
  await graphGapQueue.waitFor({ state: 'visible', timeout: 20000 })
  const refreshedPrimaryQueueRow = graphGapQueue.locator('[data-graph-gap-build-row-stage1004]').filter({
    hasText: harness.primaryNote.body_text,
  })
  await refreshedPrimaryQueueRow.getByRole('button', { name: 'Create Graph node' }).click()
  const workbench = page.getByRole('region', { name: 'Selected note workbench' })
  await workbench.waitFor({ state: 'visible', timeout: 20000 })
  await workbench.getByRole('tab', { name: 'Promote to Graph', selected: true }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await workbench.getByRole('textbox', { name: 'Graph label' }).fill(harness.graphLabel)
  captures.notebookGraphPromotionFromGraphBuildQueue = await captureLocatorScreenshot(
    page,
    workbench,
    outputDir,
    'stage1004-notebook-graph-promotion-from-build-queue.png',
  )
  await workbench.getByRole('button', { name: 'Promote node' }).click()
  await page.getByRole('tab', { name: 'Graph', selected: true }).first().waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('region', { name: `${harness.document.title} workspace` }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const graphFocusTray = page.getByLabel('Graph focus tray')
  await graphFocusTray.getByRole('button', { name: 'Back to Graph gaps' }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  metrics.graphPromotionFocusedGraph = true
  metrics.graphPromotionBackToGapsVisible = true
  captures.focusedGraphWithBackToGraphGaps = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1004-focused-graph-with-back-to-graph-gaps.png',
  )

  const connectedInbox = await waitForGraphCoverage({
    baseUrl,
    noteId: harness.primaryNote.id,
    sourceDocumentId: harness.document.id,
    state: 'connected',
  })
  harness.graphNodeId =
    (connectedInbox.rows ?? []).find((row) => row.note_id === harness.primaryNote.id)?.graph_node_id ?? null

  await graphFocusTray.getByRole('button', { name: 'Back to Graph gaps' }).click()
  await sourceReview.waitFor({ state: 'visible', timeout: 20000 })
  await sourceReview.getByText(harness.remainingNote.body_text).waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceReturnKeepsRemainingGraphGap = true
  metrics.sourceReturnRemovesPromotedGraphGap = !(await sourceReview
    .getByText(harness.primaryNote.body_text)
    .isVisible()
    .catch(() => false))
  captures.sourceReviewAfterBackToGraphGaps = await captureLocatorScreenshot(
    page,
    sourceReview,
    outputDir,
    'stage1004-source-review-after-back-to-graph-gaps.png',
  )

  await cleanupGraphGapBuildQueueHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage1004 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage1004: 0,
    graphBuildQueueCreateActionVisible: true,
    graphBuildQueueOpenSourceReviewVisible: true,
    graphBuildQueueShowsUnconnectedNote: true,
    graphPromotionBackToGapsVisible: true,
    graphPromotionFocusedGraph: true,
    readerGeneratedOutputsFrozen: true,
    sourceOpenReviewUsesUnconnected: true,
    sourceReturnKeepsRemainingGraphGap: true,
    sourceReturnRemovesPromotedGraphGap: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(
        `Stage 1004 expected ${metricName}: ${expected}, got ${metrics[metricName]}. Metrics: ${JSON.stringify(
          metrics,
        )}`,
      )
    }
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage1004-graph-gap-build-queue-and-return-loop-after-stage1003',
  }
  await writeFile(
    path.join(outputDir, 'stage1004-graph-gap-build-queue-and-return-loop-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(page, outputDir, 'stage1004-graph-gap-build-queue-failure.png').catch(() => null)
  throw error
} finally {
  await cleanupGraphGapBuildQueueHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 1004 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

async function createGraphGapBuildQueueHarness({ baseUrl, stageLabel }) {
  const timestamp = Date.now()
  const document = await importHarnessDocument({
    baseUrl,
    bodyText:
      `${stageLabel} opener. ` +
      `${stageLabel} graph gap target. ` +
      `${stageLabel} return loop target. ` +
      `${stageLabel} closer.`,
    title: `${stageLabel} Graph Gap Build Source ${timestamp}`,
  })
  await putJson(`${baseUrl}/api/documents/${encodeURIComponent(document.id)}/progress`, {
    mode: 'reflowed',
    sentence_index: 1,
  })
  const view = await fetchDocumentView({ baseUrl, documentId: document.id })
  const primaryNote = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(document.id)}/notes`, {
    anchor: buildNoteAnchor(document.id, view, { sentenceStart: 1, sentenceEnd: 1 }),
    body_text: `${stageLabel} primary Graph build queue note ${timestamp}`,
  })
  const remainingNote = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(document.id)}/notes`, {
    anchor: buildNoteAnchor(document.id, view, { sentenceStart: 2, sentenceEnd: 2 }),
    body_text: `${stageLabel} remaining Graph gap note ${timestamp}`,
  })

  return {
    document,
    graphLabel: `${stageLabel} Graph Build Queue Node ${timestamp}`,
    graphNodeId: null,
    primaryNote,
    remainingNote,
  }
}

async function cleanupGraphGapBuildQueueHarness({ baseUrl, harness }) {
  if (!harness) {
    return
  }
  if (harness.graphNodeId) {
    await fetch(`${baseUrl}/api/recall/graph/nodes/${encodeURIComponent(harness.graphNodeId)}/decision`, {
      body: JSON.stringify({ decision: 'rejected' }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    }).catch(() => null)
  }
  const notes = [harness.primaryNote, harness.remainingNote].filter(Boolean)
  await Promise.all(
    notes.map((note) =>
      fetch(`${baseUrl}/api/recall/notes/${encodeURIComponent(note.id)}`, { method: 'DELETE' }).catch(() => null),
    ),
  )
  if (harness.document) {
    await fetch(`${baseUrl}/api/documents/${encodeURIComponent(harness.document.id)}`, { method: 'DELETE' }).catch(
      () => null,
    )
  }
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

async function waitForGraphCoverage({ baseUrl, noteId, sourceDocumentId, state, timeoutMs = 10000 }) {
  const startedAt = Date.now()
  let lastPayload = null
  while (Date.now() - startedAt < timeoutMs) {
    lastPayload = await fetchHighlightInbox({ baseUrl, sourceDocumentId, state })
    const matchedRow = (lastPayload.rows ?? []).find((row) => row.note_id === noteId && row.graph_covered && row.graph_node_id)
    if (matchedRow) {
      return lastPayload
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`Timed out waiting for graph coverage for ${noteId} in ${state}: ${JSON.stringify(lastPayload)}`)
}

function fetchHighlightInbox({ baseUrl, sourceDocumentId, state }) {
  const params = new URLSearchParams({ limit: '50', state })
  params.set('source_document_id', sourceDocumentId)
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
