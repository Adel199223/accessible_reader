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
const outputDir = process.env.RECALL_STAGE1010_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE1010_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE1010_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE1010_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE1010_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE1010_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage1010-source-related-connections-failure.png'), { force: true })

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
  harness = await createSourceRelatedConnectionsHarness({ baseUrl, stageLabel: 'Stage 1010' })
  harness.edge = await waitForHarnessRelatedEdge({ baseUrl, harness })
  const relationLabel = `${harness.edge.source_label} ${formatRelationLabel(harness.edge.relation_type)} ${harness.edge.target_label}`
  const captures = {}
  const metrics = {
    cleanupUtilityDryRunMatchedAfterStage1010: null,
    graphConnectionReviewScopeControlsPreserved: false,
    graphConnectionReviewSourceQueuePreserved: false,
    readerGeneratedOutputsFrozen: false,
    relatedGraphRelationHandoffFocusesGraph: false,
    relatedSourceNavigationWorks: false,
    sourceOverviewRelatedGraphRowsVisible: false,
    sourceOverviewRelatedGraphSummaryVisible: false,
    sourceOverviewReviewConnectionsHandoffPreserved: false,
  }

  const readerView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(harness.primaryDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  metrics.readerGeneratedOutputsFrozen =
    readerView?.mode === 'reflowed' && JSON.stringify(readerView).includes(harness.sourceLabel)

  await openSourceOverview(page, harness.primaryDocument.title)
  const graphConnectionSummary = page.locator('[data-source-overview-graph-connection-summary-stage1008="true"]')
  await graphConnectionSummary.waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceOverviewRelatedGraphSummaryVisible =
    (await graphConnectionSummary.getByText('related source').first().isVisible()) &&
    (await graphConnectionSummary.getByText('suggested connection').first().isVisible())

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
  captures.sourceOverviewRelatedGraphConnections = await captureLocatorScreenshot(
    page,
    relatedConnectionsList,
    outputDir,
    'stage1010-source-overview-related-graph-connections.png',
  )

  const reviewConnectionsButton = page.locator('[data-source-overview-review-graph-connections-stage1008="true"]')
  await reviewConnectionsButton.waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceOverviewReviewConnectionsHandoffPreserved = true

  await reviewConnectionsButton.click()
  await page.waitForURL(/\/recall\?section=graph/, { timeout: 20000 })
  const graphRail = page.getByRole('complementary', { name: 'Graph settings sidebar' })
  await graphRail.waitFor({ state: 'visible', timeout: 20000 })
  const connectionQueue = graphRail.getByRole('region', { name: 'Graph connection review queue' })
  await connectionQueue.waitFor({ state: 'visible', timeout: 20000 })
  const scopeControls = connectionQueue.getByRole('group', { name: 'Graph connection review scope' })
  metrics.graphConnectionReviewScopeControlsPreserved =
    (await scopeControls.getByRole('button', { name: 'All' }).isVisible()) &&
    (await scopeControls.getByRole('button', { name: 'This source' }).isVisible()) &&
    (await scopeControls.getByRole('button', { name: 'Strong' }).isVisible()) &&
    (await scopeControls.getByRole('button', { name: 'Multi-evidence' }).isVisible()) &&
    ((await scopeControls.getByRole('button', { name: 'This source' }).getAttribute('aria-pressed')) === 'true')
  const queueRow = connectionQueue.locator('[data-graph-connection-review-row-stage1006]').filter({
    hasText: relationLabel,
  })
  await queueRow.waitFor({ state: 'visible', timeout: 20000 })
  metrics.graphConnectionReviewSourceQueuePreserved = true
  captures.graphConnectionReviewSourceQueuePreserved = await captureLocatorScreenshot(
    page,
    connectionQueue,
    outputDir,
    'stage1010-source-scoped-graph-queue-preserved.png',
  )

  await openSourceOverview(page, harness.primaryDocument.title)
  const primaryRelatedList = page.locator('[data-source-overview-related-graph-connections-stage1010="true"]')
  const primaryRelatedRow = primaryRelatedList.locator('[data-source-overview-related-graph-row-stage1010]').filter({
    hasText: harness.secondaryDocument.title,
  })
  await primaryRelatedRow.waitFor({ state: 'visible', timeout: 20000 })
  await primaryRelatedRow
    .getByRole('button', { name: `Open related source ${harness.secondaryDocument.title}` })
    .click()
  await page.getByRole('heading', { name: harness.secondaryDocument.title }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  metrics.relatedSourceNavigationWorks = true
  captures.relatedSourceNavigation = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1010-related-source-navigation.png',
  )

  const secondaryRelatedList = page.locator('[data-source-overview-related-graph-connections-stage1010="true"]')
  const secondaryRelatedRow = secondaryRelatedList.locator('[data-source-overview-related-graph-row-stage1010]').filter({
    hasText: harness.primaryDocument.title,
  })
  await secondaryRelatedRow.waitFor({ state: 'visible', timeout: 20000 })
  await secondaryRelatedRow.getByRole('button', { name: `Review relation: ${relationLabel}` }).click()
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
  captures.relatedGraphRelationFocus = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1010-related-graph-relation-focus.png',
  )

  await cleanupSourceRelatedConnectionsHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage1010 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage1010: 0,
    graphConnectionReviewScopeControlsPreserved: true,
    graphConnectionReviewSourceQueuePreserved: true,
    readerGeneratedOutputsFrozen: true,
    relatedGraphRelationHandoffFocusesGraph: true,
    relatedSourceNavigationWorks: true,
    sourceOverviewRelatedGraphRowsVisible: true,
    sourceOverviewRelatedGraphSummaryVisible: true,
    sourceOverviewReviewConnectionsHandoffPreserved: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(
        `Stage 1010 expected ${metricName}: ${expected}, got ${metrics[metricName]}. Metrics: ${JSON.stringify(
          metrics,
        )}`,
      )
    }
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage1010-source-related-connections-after-stage1009',
  }
  await writeFile(
    path.join(outputDir, 'stage1010-source-related-connections-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(page, outputDir, 'stage1010-source-related-connections-failure.png').catch(
    () => null,
  )
  throw error
} finally {
  await cleanupSourceRelatedConnectionsHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 1010 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

async function createSourceRelatedConnectionsHarness({ baseUrl, stageLabel }) {
  const timestamp = Date.now()
  const sourceLabel = `Related Source Alpha Lima${timestamp}`
  const targetLabel = `Related Source Beta Lima${timestamp}`
  const relationSentence = `${sourceLabel} uses ${targetLabel} to keep source related graph navigation grounded.`
  const primaryDocument = await importHarnessDocument({
    baseUrl,
    bodyText: Array.from(
      { length: 10 },
      (_, index) => `${stageLabel} primary evidence ${index + 1}. ${relationSentence}`,
    ).join(' '),
    title: `${stageLabel} Related Graph Primary ${timestamp}`,
  })
  const secondaryDocument = await importHarnessDocument({
    baseUrl,
    bodyText: Array.from(
      { length: 10 },
      (_, index) => `${stageLabel} companion evidence ${index + 1}. ${relationSentence}`,
    ).join(' '),
    title: `${stageLabel} Related Graph Companion ${timestamp}`,
  })
  return {
    edge: null,
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
    `Timed out waiting for Stage 1010 related edge ${harness.sourceLabel} -> ${harness.targetLabel}: ${JSON.stringify(
      lastSnapshot,
    )}`,
  )
}

async function openSourceOverview(page, title) {
  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: `Open ${title}` }).first().click()
  await page.getByRole('heading', { name: title }).waitFor({ state: 'visible', timeout: 20000 })
}

function formatRelationLabel(relationType) {
  return String(relationType ?? '').replace(/_/g, ' ')
}

async function cleanupSourceRelatedConnectionsHarness({ baseUrl, harness }) {
  if (!harness) {
    return
  }
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
