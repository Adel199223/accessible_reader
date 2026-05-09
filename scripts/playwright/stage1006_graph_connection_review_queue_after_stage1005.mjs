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
const outputDir = process.env.RECALL_STAGE1006_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE1006_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE1006_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE1006_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE1006_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE1006_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage1006-graph-connection-review-failure.png'), { force: true })

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
  harness = await createGraphConnectionReviewHarness({ baseUrl, stageLabel: 'Stage 1006' })
  harness.edge = await waitForHarnessSuggestedEdge({ baseUrl, harness })
  const relationLabel = `${harness.sourceLabel} uses ${harness.targetLabel}`
  const captures = {}
  const metrics = {
    cleanupUtilityDryRunMatchedAfterStage1006: null,
    graphConnectionReviewConfirmRefreshesQueue: false,
    graphConnectionReviewEvidenceOpensReader: false,
    graphConnectionReviewFocusesConnections: false,
    graphConnectionReviewPathFocused: false,
    graphConnectionReviewQueueVisible: false,
    graphConnectionReviewShowsHarnessEdge: false,
    graphGapBuildQueuePreserved: false,
    readerGeneratedOutputsFrozen: false,
  }

  const readerView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(harness.document.id)}/view?mode=reflowed&detail_level=default`,
  )
  metrics.readerGeneratedOutputsFrozen =
    readerView?.mode === 'reflowed' && JSON.stringify(readerView).includes(harness.sourceLabel)

  await page.goto(`${baseUrl}/recall?section=graph`, { waitUntil: 'networkidle' })
  const graphRail = page.getByRole('complementary', { name: 'Graph settings sidebar' })
  await graphRail.waitFor({ state: 'visible', timeout: 20000 })
  const connectionQueue = graphRail.getByRole('region', { name: 'Graph connection review queue' })
  await connectionQueue.waitFor({ state: 'visible', timeout: 20000 })
  metrics.graphConnectionReviewQueueVisible = true
  const graphGapQueue = graphRail.getByRole('region', { name: 'Graph gap build queue' })
  metrics.graphGapBuildQueuePreserved = await graphGapQueue.isVisible().catch(() => false)

  const connectionRow = connectionQueue.locator('[data-graph-connection-review-row-stage1006]').filter({
    hasText: relationLabel,
  })
  await connectionRow.waitFor({ state: 'visible', timeout: 30000 })
  metrics.graphConnectionReviewShowsHarnessEdge =
    (await connectionRow.getByRole('button', { name: 'Review connection' }).isVisible()) &&
    (await connectionRow.getByRole('button', { name: 'Open evidence' }).isVisible()) &&
    (await connectionRow.getByRole('button', { name: 'Confirm' }).isVisible()) &&
    (await connectionRow.getByRole('button', { name: 'Reject' }).isVisible())
  captures.graphConnectionReviewQueue = await captureLocatorScreenshot(
    page,
    connectionQueue,
    outputDir,
    'stage1006-graph-connection-review-queue.png',
  )

  await connectionRow.getByRole('button', { name: 'Review connection' }).click()
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
  const graphFocusTray = page.getByLabel('Graph focus tray')
  metrics.graphConnectionReviewFocusesConnections = true
  metrics.graphConnectionReviewPathFocused = await graphFocusTray.getByText(`${harness.sourceLabel} to ${harness.targetLabel}`).isVisible()
  captures.graphConnectionReviewFocusedRelation = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1006-graph-connection-review-focused-relation.png',
  )

  await connectionRow.getByRole('button', { name: 'Open evidence' }).click()
  await page.waitForURL(/\/reader\?/, { timeout: 20000 })
  metrics.graphConnectionReviewEvidenceOpensReader =
    page.url().includes('/reader') && page.url().includes(`document=${encodeURIComponent(harness.document.id)}`)
  captures.graphConnectionReviewEvidenceReader = await captureViewportScreenshot(
    page,
    outputDir,
    'stage1006-graph-connection-review-evidence-reader.png',
  )

  await page.goto(`${baseUrl}/recall?section=graph`, { waitUntil: 'networkidle' })
  await connectionQueue.waitFor({ state: 'visible', timeout: 20000 })
  const refreshedConnectionRow = connectionQueue.locator('[data-graph-connection-review-row-stage1006]').filter({
    hasText: relationLabel,
  })
  await refreshedConnectionRow.getByRole('button', { name: 'Confirm' }).click()
  await waitForHarnessEdgeStatus({ baseUrl, edgeId: harness.edge.id, status: 'confirmed' })
  await expectHidden(refreshedConnectionRow)
  metrics.graphConnectionReviewConfirmRefreshesQueue = true
  captures.graphConnectionReviewAfterConfirm = await captureLocatorScreenshot(
    page,
    connectionQueue,
    outputDir,
    'stage1006-graph-connection-review-after-confirm.png',
  )

  await cleanupGraphConnectionReviewHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage1006 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage1006: 0,
    graphConnectionReviewConfirmRefreshesQueue: true,
    graphConnectionReviewEvidenceOpensReader: true,
    graphConnectionReviewFocusesConnections: true,
    graphConnectionReviewPathFocused: true,
    graphConnectionReviewQueueVisible: true,
    graphConnectionReviewShowsHarnessEdge: true,
    graphGapBuildQueuePreserved: true,
    readerGeneratedOutputsFrozen: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(
        `Stage 1006 expected ${metricName}: ${expected}, got ${metrics[metricName]}. Metrics: ${JSON.stringify(
          metrics,
        )}`,
      )
    }
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage1006-graph-connection-review-queue-after-stage1005',
  }
  await writeFile(
    path.join(outputDir, 'stage1006-graph-connection-review-queue-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(page, outputDir, 'stage1006-graph-connection-review-failure.png').catch(() => null)
  throw error
} finally {
  await cleanupGraphConnectionReviewHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 1006 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

async function createGraphConnectionReviewHarness({ baseUrl, stageLabel }) {
  const timestamp = Date.now()
  const sourceLabel = `Connection Alpha Kilo${timestamp}`
  const targetLabel = `Connection Beta Kilo${timestamp}`
  const relationSentence = `${sourceLabel} uses ${targetLabel} to prove local relation review.`
  const bodyText = Array.from(
    { length: 12 },
    (_, index) => `${stageLabel} evidence ${index + 1}. ${relationSentence}`,
  ).join(' ')
  const document = await importHarnessDocument({
    baseUrl,
    bodyText,
    title: `${stageLabel} Graph Connection Review Source ${timestamp}`,
  })
  return {
    document,
    edge: null,
    sourceLabel,
    targetLabel,
  }
}

async function waitForHarnessSuggestedEdge({ baseUrl, harness, timeoutMs = 20000 }) {
  const startedAt = Date.now()
  let lastSnapshot = null
  while (Date.now() - startedAt < timeoutMs) {
    lastSnapshot = await fetchJson(`${baseUrl}/api/recall/graph?limit_nodes=240&limit_edges=400`)
    const edge = (lastSnapshot.edges ?? []).find(
      (candidate) =>
        candidate.status === 'suggested' &&
        candidate.relation_type === 'uses' &&
        candidate.source_label === harness.sourceLabel &&
        candidate.target_label === harness.targetLabel,
    )
    if (edge) {
      return edge
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  throw new Error(
    `Timed out waiting for Stage 1006 suggested edge ${harness.sourceLabel} -> ${harness.targetLabel}: ${JSON.stringify(
      lastSnapshot,
    )}`,
  )
}

async function waitForHarnessEdgeStatus({ baseUrl, edgeId, status, timeoutMs = 10000 }) {
  const startedAt = Date.now()
  let lastEdge = null
  while (Date.now() - startedAt < timeoutMs) {
    const snapshot = await fetchJson(`${baseUrl}/api/recall/graph?limit_nodes=240&limit_edges=400`)
    lastEdge = (snapshot.edges ?? []).find((edge) => edge.id === edgeId) ?? null
    if (lastEdge?.status === status) {
      return lastEdge
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`Timed out waiting for edge ${edgeId} status ${status}: ${JSON.stringify(lastEdge)}`)
}

async function expectHidden(locator) {
  await locator
    .waitFor({
      state: 'hidden',
      timeout: 10000,
    })
    .catch(async () => {
      if (await locator.isVisible().catch(() => false)) {
        throw new Error('Expected Stage 1006 connection row to disappear after confirm.')
      }
    })
}

async function cleanupGraphConnectionReviewHarness({ baseUrl, harness }) {
  if (!harness) {
    return
  }
  if (harness.edge?.id) {
    await fetch(`${baseUrl}/api/recall/graph/edges/${encodeURIComponent(harness.edge.id)}/decision`, {
      body: JSON.stringify({ decision: 'rejected' }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    }).catch(() => null)
  }
  if (harness.document?.id) {
    await fetch(`${baseUrl}/api/documents/${encodeURIComponent(harness.document.id)}`, { method: 'DELETE' }).catch(
      () => null,
    )
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
