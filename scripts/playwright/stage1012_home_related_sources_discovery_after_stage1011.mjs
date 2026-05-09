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
const outputDir = process.env.RECALL_STAGE1012_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE1012_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE1012_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE1012_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE1012_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE1012_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage1012-home-related-sources-discovery-failure.png'), { force: true })

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
  harness = await createHomeRelatedSourcesHarness({ baseUrl, stageLabel: 'Stage 1012' })
  harness.edge = await waitForHarnessRelatedEdge({ baseUrl, harness })
  const relationLabel = `${harness.edge.source_label} ${formatRelationLabel(harness.edge.relation_type)} ${harness.edge.target_label}`
  const captures = {}
  const metrics = {
    cleanupUtilityDryRunMatchedAfterStage1012: null,
    customCollectionReadingQueueRelatedSignalVisible: false,
    generatedReaderOutputsFrozen: false,
    homeReadingQueueRelatedHandoffOpensSourceOverview: false,
    homeReadingQueueRelatedSignalVisible: false,
    relatedGraphRelationHandoffFocusesGraph: false,
    sourceOverviewRelatedGraphRowsVisible: false,
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
  await primaryQueueRow.getByText(/related source/).waitFor({ state: 'visible', timeout: 20000 })
  await primaryQueueRow
    .getByRole('button', { name: `Open related sources for ${harness.primaryDocument.title}` })
    .waitFor({ state: 'visible', timeout: 20000 })
  metrics.homeReadingQueueRelatedSignalVisible = true
  captures.homeReadingQueueRelatedSourceSignal = await captureLocatorScreenshot(
    page,
    primaryQueueRow,
    outputDir,
    'stage1012-home-reading-queue-related-source-signal.png',
  )

  await primaryQueueRow.getByRole('button', { name: `Open related sources for ${harness.primaryDocument.title}` }).click()
  await page.getByRole('heading', { name: harness.primaryDocument.title }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  metrics.homeReadingQueueRelatedHandoffOpensSourceOverview = true

  const relatedConnectionsList = page.locator('[data-source-overview-related-graph-connections-stage1010="true"]')
  await relatedConnectionsList.waitFor({ state: 'visible', timeout: 30000 })
  const relatedRow = relatedConnectionsList.locator('[data-source-overview-related-graph-row-stage1010]').filter({
    hasText: harness.secondaryDocument.title,
  })
  await relatedRow.waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceOverviewRelatedGraphRowsVisible =
    (await relatedRow.getByText(relationLabel).first().isVisible()) &&
    (await relatedRow.getByText('Suggested relation').first().isVisible()) &&
    (await relatedRow.getByRole('button', { name: `Open related source ${harness.secondaryDocument.title}` }).isVisible()) &&
    (await relatedRow.getByRole('button', { name: `Review relation: ${relationLabel}` }).isVisible())
  captures.sourceOverviewRelatedGraphConnectionsFromHome = await captureLocatorScreenshot(
    page,
    relatedConnectionsList,
    outputDir,
    'stage1012-source-overview-related-graph-connections-from-home.png',
  )

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()
  const collectionReadingQueue = page.getByRole('region', { name: 'Reading queue' })
  await collectionReadingQueue.waitFor({ state: 'visible', timeout: 20000 })
  const collectionQueueRow = collectionReadingQueue.locator('[data-reading-queue-learning-gaps-stage978]').filter({
    hasText: harness.primaryDocument.title,
  })
  await collectionQueueRow.waitFor({ state: 'visible', timeout: 20000 })
  await collectionQueueRow.getByText(/related source/).waitFor({ state: 'visible', timeout: 20000 })
  await collectionQueueRow
    .getByRole('button', { name: `Open related sources for ${harness.primaryDocument.title}` })
    .waitFor({ state: 'visible', timeout: 20000 })
  metrics.customCollectionReadingQueueRelatedSignalVisible = true
  captures.customCollectionReadingQueueRelatedSourceSignal = await captureLocatorScreenshot(
    page,
    collectionQueueRow,
    outputDir,
    'stage1012-custom-collection-reading-queue-related-source-signal.png',
  )

  await collectionQueueRow.getByRole('button', { name: `Open related sources for ${harness.primaryDocument.title}` }).click()
  await page.getByRole('heading', { name: harness.primaryDocument.title }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const sourceRelatedList = page.locator('[data-source-overview-related-graph-connections-stage1010="true"]')
  const sourceRelatedRow = sourceRelatedList.locator('[data-source-overview-related-graph-row-stage1010]').filter({
    hasText: harness.secondaryDocument.title,
  })
  await sourceRelatedRow.waitFor({ state: 'visible', timeout: 20000 })
  await sourceRelatedRow.getByRole('button', { name: `Review relation: ${relationLabel}` }).click()
  await page.waitForURL(/\/recall\?section=graph/, { timeout: 20000 })
  const nodeDetailDock = page.getByLabel('Node detail dock')
  await nodeDetailDock.getByRole('tab', { name: /Connections/i, selected: true }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await nodeDetailDock
    .getByRole('list', { name: 'Selected node connections' })
    .locator('.recall-graph-detail-relation-card', { hasText: relationLabel })
    .waitFor({
      state: 'visible',
      timeout: 20000,
    })
  metrics.relatedGraphRelationHandoffFocusesGraph = true
  captures.relatedGraphRelationFocusFromHomeQueue = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1012-related-graph-relation-focus-from-home-queue.png',
  )

  await cleanupHomeRelatedSourcesHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage1012 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage1012: 0,
    customCollectionReadingQueueRelatedSignalVisible: true,
    generatedReaderOutputsFrozen: true,
    homeReadingQueueRelatedHandoffOpensSourceOverview: true,
    homeReadingQueueRelatedSignalVisible: true,
    relatedGraphRelationHandoffFocusesGraph: true,
    sourceOverviewRelatedGraphRowsVisible: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(
        `Stage 1012 expected ${metricName}: ${expected}, got ${metrics[metricName]}. Metrics: ${JSON.stringify(
          metrics,
        )}`,
      )
    }
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage1012-home-related-sources-discovery-after-stage1011',
  }
  await writeFile(
    path.join(outputDir, 'stage1012-home-related-sources-discovery-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(page, outputDir, 'stage1012-home-related-sources-discovery-failure.png').catch(
    () => null,
  )
  throw error
} finally {
  await cleanupHomeRelatedSourcesHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 1012 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

async function createHomeRelatedSourcesHarness({ baseUrl, stageLabel }) {
  const timestamp = Date.now()
  const collectionId = `collection:stage1012-home-related-sources-${timestamp}`
  const collectionName = `${stageLabel} Related Sources`
  const sourceLabel = `Home Related Alpha Lima${timestamp}`
  const targetLabel = `Home Related Beta Lima${timestamp}`
  const relationSentence = `${sourceLabel} uses ${targetLabel} to make related saved sources discoverable from Home.`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }
  const primaryDocument = await importHarnessDocument({
    baseUrl,
    bodyText: Array.from(
      { length: 10 },
      (_, index) => `${stageLabel} primary related-source evidence ${index + 1}. ${relationSentence}`,
    ).join(' '),
    title: `${stageLabel} Home Related Primary ${timestamp}`,
  })
  const secondaryDocument = await importHarnessDocument({
    baseUrl,
    bodyText: Array.from(
      { length: 10 },
      (_, index) => `${stageLabel} companion related-source evidence ${index + 1}. ${relationSentence}`,
    ).join(' '),
    title: `${stageLabel} Home Related Companion ${timestamp}`,
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
    edge: null,
    originalLibrarySettings,
    primaryDocument,
    secondaryDocument,
    sourceLabel,
    targetLabel,
  }
}

async function waitForHarnessRelatedEdge({ baseUrl, harness, timeoutMs = 30000 }) {
  const startedAt = Date.now()
  let lastSnapshot = null
  while (Date.now() - startedAt < timeoutMs) {
    lastSnapshot = await fetchJson(`${baseUrl}/api/recall/graph?limit_nodes=240&limit_edges=400`)
    const relatedEdges = (lastSnapshot.edges ?? []).filter(
      (candidate) =>
        candidate.status === 'suggested' &&
        candidate.source_document_ids?.includes(harness.primaryDocument.id) &&
        candidate.source_document_ids?.includes(harness.secondaryDocument.id),
    )
    const preferredEdge =
      relatedEdges.find(
        (candidate) =>
          candidate.relation_type === 'uses' &&
          (candidate.excerpt?.includes(harness.sourceLabel) || candidate.excerpt?.includes(harness.targetLabel)),
      ) ?? relatedEdges[0]
    if (preferredEdge) {
      return preferredEdge
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  throw new Error(
    `Timed out waiting for Stage 1012 related edge ${harness.sourceLabel} -> ${harness.targetLabel}: ${JSON.stringify(
      lastSnapshot,
    )}`,
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

async function cleanupHomeRelatedSourcesHarness({ baseUrl, harness }) {
  if (!harness) {
    return
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
