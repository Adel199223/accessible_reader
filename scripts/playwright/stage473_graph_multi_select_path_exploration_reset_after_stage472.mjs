import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE473_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE473_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE473_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE473_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE473_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE473_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage473-graph-multi-select-path-exploration-reset-after-stage472-failure.png'),
  { force: true },
)

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)
const { browser, runtimeBrowser } = await launchBrowser(chromium)

let desktopPage
try {
  desktopPage = await browser.newPage({ viewport: desktopViewport })
  await openGraph(desktopPage)

  const graphWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage473-graph-wide-top.png',
  )

  const pathPair = await getVisibleGraphPathPair(desktopPage)
  const pathSelectionState = await enterGraphPathSelection(desktopPage, pathPair)

  const graphPathSelectionWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage473-graph-path-selection-wide-top.png',
  )
  const graphPathSelectionRailWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByLabel('Graph focus rail').first(),
    outputDir,
    'stage473-graph-path-selection-rail-wide-top.png',
    'locator',
  )

  const pathResultState = await executeGraphPathSearch(desktopPage, pathPair)
  const graphPathResultWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage473-graph-path-result-wide-top.png',
  )
  const graphPathResultRailWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByLabel('Graph focus rail').first(),
    outputDir,
    'stage473-graph-path-result-rail-wide-top.png',
    'locator',
  )

  const restoredFocusState = await restoreSingleNodeGraphFocus(desktopPage, pathPair.startLabel)
  const graphRestoredFocusWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage473-graph-restored-focus-wide-top.png',
  )
  const graphRestoredFocusRailWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByLabel('Graph focus rail').first(),
    outputDir,
    'stage473-graph-restored-focus-rail-wide-top.png',
    'locator',
  )
  const graphRestoredFocusDockWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByLabel('Node detail dock').first(),
    outputDir,
    'stage473-graph-restored-focus-dock-wide-top.png',
    'locator',
  )

  await writeFile(
    path.join(
      outputDir,
      'stage473-graph-multi-select-path-exploration-reset-after-stage472-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphPathResultRailWideTop,
          graphPathResultWideTop,
          graphPathSelectionRailWideTop,
          graphPathSelectionWideTop,
          graphRestoredFocusDockWideTop,
          graphRestoredFocusRailWideTop,
          graphRestoredFocusWideTop,
          graphWideTop,
        },
        desktopViewport,
        graphPathSelectionState: pathSelectionState,
        graphPathResultState: pathResultState,
        headless,
        restoredFocusState,
        runtimeBrowser,
        validationFocus: [
          'wide desktop Graph is judged first after the Stage 472 checkpoint',
          'multi-select should move the bottom rail into an active path-selection workflow instead of leaving it as passive status copy',
          'finding a path should highlight the visible route while the right drawer yields until single-node focus is restored',
        ],
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  if (desktopPage) {
    await desktopPage
      .screenshot({
        path: path.join(outputDir, 'stage473-graph-multi-select-path-exploration-reset-after-stage472-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function openGraph(page) {
  await page.goto(`${baseUrl}/recall?section=graph`, { waitUntil: 'networkidle' })
  await page.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function enterGraphPathSelection(page, pathPair) {
  const focusRail = page.getByLabel('Graph focus rail').first()
  const startNodeButton = getGraphNodeButtonByLabel(page, pathPair.startLabel)
  await startNodeButton.click({ modifiers: ['Control'] })
  await page.getByRole('button', { name: 'Clear selection' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(200)

  const endNodeButton = getGraphNodeButtonByLabel(page, pathPair.endLabel)
  await endNodeButton.click({ modifiers: ['Control'] })
  await page.getByRole('button', { name: 'Find path' }).waitFor({ state: 'visible', timeout: 20000 })
  await focusRail.getByText('Ready to find a path').waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)

  return {
    endLabel: pathPair.endLabel,
    focusSummary: (await focusRail.textContent())?.trim() ?? null,
    startLabel: pathPair.startLabel,
    stepCount: pathPair.stepCount,
  }
}

async function executeGraphPathSearch(page, pathPair) {
  const focusRail = page.getByLabel('Graph focus rail').first()
  await page.getByRole('button', { name: 'Find path' }).click()
  await focusRail.getByText('Shortest visible path').waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)

  return {
    endLabel: pathPair.endLabel,
    pathNodeLabels: pathPair.pathNodeLabels,
    startLabel: pathPair.startLabel,
    stepCount: pathPair.stepCount,
  }
}

async function restoreSingleNodeGraphFocus(page, focusLabel) {
  const focusRail = page.getByLabel('Graph focus rail').first()
  const nodeButton = getGraphNodeButtonByLabel(page, focusLabel)
  await nodeButton.click()
  await page.getByRole('button', { name: 'Open details' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByLabel('Node detail dock').first().waitFor({ state: 'visible', timeout: 20000 })
  await focusRail.getByText('Focus mode').waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)

  return {
    focusLabel,
    focusSummary: (await focusRail.textContent())?.trim() ?? null,
  }
}

async function fetchGraphSnapshot() {
  const response = await fetch(`${baseUrl}/api/recall/graph?limit_nodes=80&limit_edges=120`)
  if (!response.ok) {
    throw new Error(`Could not load graph snapshot for Stage 473. Received ${response.status}.`)
  }
  return response.json()
}

async function getVisibleGraphPathPair(page) {
  const snapshot = await fetchGraphSnapshot()
  const uniqueNodesByLabel = buildUniqueNodeMap(snapshot.nodes ?? [])
  const visibleNodes = await getVisibleUniqueGraphNodes(page, uniqueNodesByLabel)

  if (visibleNodes.length < 2) {
    throw new Error('Stage 473 could not find at least two visible uniquely labeled Graph nodes.')
  }

  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id))
  const visibleEdges = (snapshot.edges ?? []).filter(
    (edge) => visibleNodeIds.has(edge.source_id) && visibleNodeIds.has(edge.target_id),
  )

  const candidates = []
  for (let index = 0; index < visibleNodes.length; index += 1) {
    const startNode = visibleNodes[index]
    for (let offset = index + 1; offset < visibleNodes.length; offset += 1) {
      const endNode = visibleNodes[offset]
      const pathResult = findShortestPath(visibleEdges, startNode.id, endNode.id)
      if (!pathResult || pathResult.nodeIds.length < 2) {
        continue
      }
      candidates.push({
        endLabel: endNode.label,
        pathNodeIds: pathResult.nodeIds,
        pathNodeLabels: pathResult.nodeIds.map((nodeId) => nodeLabelById(snapshot.nodes ?? [], nodeId) ?? nodeId),
        startLabel: startNode.label,
        stepCount: pathResult.nodeIds.length - 1,
      })
    }
  }

  if (!candidates.length) {
    throw new Error('Stage 473 could not find a visible connected Graph node pair for path exploration.')
  }

  const preferredCandidates = candidates.filter((candidate) => candidate.stepCount >= 2 && candidate.stepCount <= 4)
  const rankedCandidates = preferredCandidates.length ? preferredCandidates : candidates
  rankedCandidates.sort((left, right) => {
    if (right.stepCount !== left.stepCount) {
      return right.stepCount - left.stepCount
    }
    const leftLength = left.startLabel.length + left.endLabel.length
    const rightLength = right.startLabel.length + right.endLabel.length
    if (leftLength !== rightLength) {
      return leftLength - rightLength
    }
    return left.startLabel.localeCompare(right.startLabel)
  })

  return rankedCandidates[0]
}

function findShortestPath(edges, startNodeId, endNodeId) {
  if (startNodeId === endNodeId) {
    return { nodeIds: [startNodeId] }
  }

  const adjacency = new Map()
  for (const edge of edges) {
    const sourceEntries = adjacency.get(edge.source_id) ?? []
    sourceEntries.push(edge.target_id)
    adjacency.set(edge.source_id, sourceEntries)

    const targetEntries = adjacency.get(edge.target_id) ?? []
    targetEntries.push(edge.source_id)
    adjacency.set(edge.target_id, targetEntries)
  }

  if (!adjacency.has(startNodeId) || !adjacency.has(endNodeId)) {
    return null
  }

  const previousNodeIdByNodeId = new Map([[startNodeId, null]])
  const pendingNodeIds = [startNodeId]

  while (pendingNodeIds.length) {
    const currentNodeId = pendingNodeIds.shift()
    if (!currentNodeId) {
      continue
    }
    if (currentNodeId === endNodeId) {
      break
    }
    for (const neighborNodeId of adjacency.get(currentNodeId) ?? []) {
      if (previousNodeIdByNodeId.has(neighborNodeId)) {
        continue
      }
      previousNodeIdByNodeId.set(neighborNodeId, currentNodeId)
      pendingNodeIds.push(neighborNodeId)
    }
  }

  if (!previousNodeIdByNodeId.has(endNodeId)) {
    return null
  }

  const nodeIds = []
  let cursorNodeId = endNodeId
  while (cursorNodeId) {
    nodeIds.unshift(cursorNodeId)
    cursorNodeId = previousNodeIdByNodeId.get(cursorNodeId) ?? null
  }

  return { nodeIds }
}

function buildUniqueNodeMap(nodes) {
  const nodesByLabel = new Map()
  for (const node of nodes) {
    const matchingNodes = nodesByLabel.get(node.label) ?? []
    matchingNodes.push(node)
    nodesByLabel.set(node.label, matchingNodes)
  }

  return new Map(
    [...nodesByLabel.entries()]
      .filter(([, matchingNodes]) => matchingNodes.length === 1)
      .map(([label, matchingNodes]) => [label, matchingNodes[0]]),
  )
}

async function getVisibleUniqueGraphNodes(page, uniqueNodesByLabel) {
  const nodeButtons = page.locator('button[aria-label^="Select node "]')
  const count = await nodeButtons.count()
  const visibleNodes = []
  const seenLabels = new Set()

  for (let index = 0; index < count; index += 1) {
    const nodeButton = nodeButtons.nth(index)
    if (!(await nodeButton.isVisible().catch(() => false))) {
      continue
    }

    const accessibleName = await nodeButton.getAttribute('aria-label')
    const label = accessibleName?.replace(/^Select node\s+/, '') ?? null
    if (!label || seenLabels.has(label)) {
      continue
    }

    const node = uniqueNodesByLabel.get(label)
    if (!node) {
      continue
    }

    seenLabels.add(label)
    visibleNodes.push(node)
  }

  return visibleNodes
}

function nodeLabelById(nodes, nodeId) {
  return nodes.find((node) => node.id === nodeId)?.label ?? null
}

function getGraphNodeButtonByLabel(page, label) {
  return page.getByRole('button', { name: new RegExp(`^Select node ${escapeRegExp(label)}$`) }).first()
}

async function captureViewportScreenshot(page, directory, filename) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath })
  return screenshotPath
}

async function captureLocatorTopScreenshot(page, locator, directory, filename, scrollMode = 'pageTop') {
  if (scrollMode === 'locator') {
    await locator.scrollIntoViewIfNeeded()
  } else {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  }
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await locator.screenshot({ path: screenshotPath })
  return screenshotPath
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function resolveHarnessDir(candidatePath) {
  return candidatePath.startsWith('\\\\wsl.localhost\\')
    ? candidatePath.replace(/^\\\\wsl\.localhost\\[^\\]+/, '')
    : candidatePath
}

async function launchBrowser(chromium) {
  try {
    const browser = await chromium.launch({ channel: preferredChannel, headless })
    return { browser, runtimeBrowser: preferredChannel }
  } catch (error) {
    if (!allowChromiumFallback) {
      throw error
    }
    const browser = await chromium.launch({ headless })
    return { browser, runtimeBrowser: 'chromium' }
  }
}
