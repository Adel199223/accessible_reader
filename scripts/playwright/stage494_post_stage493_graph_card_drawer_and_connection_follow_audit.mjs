import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE494_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE494_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE494_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE494_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE494_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE494_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage494-post-stage493-graph-card-drawer-and-connection-follow-audit-failure.png'),
  { force: true },
)
await rm(
  path.join(outputDir, 'stage494-post-stage493-graph-card-drawer-and-connection-follow-audit-failure-reader.png'),
  { force: true },
)

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)
const { browser, runtimeBrowser } = await launchBrowser(chromium)

let desktopPage
let desktopReaderPage
try {
  desktopPage = await browser.newPage({ viewport: desktopViewport })
  await openHome(desktopPage)

  const homeWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage494-home-wide-top.png')

  await desktopPage.getByRole('tab', { name: 'Graph', exact: true }).click()
  await desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(350)

  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage494-graph-wide-top.png')

  const selectedNode = await selectGraphNodeWithFollowConnection(desktopPage, [
    'Stage 10 node',
    'Knowledge Graphs',
    'Study Cards',
  ])

  const graphDetailDockConnectionsWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    getGraphDetailDock(desktopPage),
    outputDir,
    'stage494-graph-detail-dock-connections-wide-top.png',
    'locator',
  )

  const cardTab = getGraphDetailDock(desktopPage).getByRole('tab', { name: /^Card\b/i }).first()
  await ensureTabSelected(cardTab)
  await desktopPage.locator('#graph-detail-panel-card').waitFor({ state: 'visible', timeout: 20000 })

  const graphDetailDockCardWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    getGraphDetailDock(desktopPage),
    outputDir,
    'stage494-graph-detail-dock-card-wide-top.png',
    'locator',
  )

  const readerTab = getGraphDetailDock(desktopPage).getByRole('tab', { name: /^Reader\b/i }).first()
  await ensureTabSelected(readerTab)
  await desktopPage.locator('#graph-detail-panel-reader').waitFor({ state: 'visible', timeout: 20000 })

  const graphDetailDockReaderWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    getGraphDetailDock(desktopPage),
    outputDir,
    'stage494-graph-detail-dock-reader-wide-top.png',
    'locator',
  )

  await desktopPage.getByRole('button', { name: 'Close drawer' }).click()
  await desktopPage.getByRole('button', { name: 'Open card' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const graphDetailDock = getGraphDetailDock(desktopPage)
  await graphDetailDock.waitFor({ state: 'visible', timeout: 20000 })
  const graphDetailDockPeekWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDetailDock,
    outputDir,
    'stage494-graph-detail-dock-peek-wide-top.png',
    'locator',
  )

  await desktopPage.getByRole('button', { name: 'Open card' }).click()
  await desktopPage.getByRole('button', { name: 'Close drawer' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const connectionsTab = getGraphDetailDock(desktopPage).getByRole('tab', { name: /^Connections\b/i }).first()
  if ((await connectionsTab.isDisabled().catch(() => true)) === true) {
    throw new Error(`The selected Graph node "${selectedNode.label}" did not expose a connections tab for Stage 494 evidence.`)
  }
  await ensureTabSelected(connectionsTab)
  await desktopPage.locator('#graph-detail-panel-connections').waitFor({ state: 'visible', timeout: 20000 })
  const followConnectionButton = getGraphDetailDock(desktopPage).getByRole('button', { name: /^Follow / }).first()
  await followConnectionButton.waitFor({ state: 'visible', timeout: 20000 })
  const followButtonLabel = (await followConnectionButton.textContent())?.trim()
  const followedNodeLabel = followButtonLabel?.replace(/^Follow\s+/, '').trim()
  if (!followedNodeLabel) {
    throw new Error(`Could not derive a followed-node label from the Stage 494 connection button: "${followButtonLabel ?? ''}"`)
  }

  await followConnectionButton.click()
  await getGraphDetailDock(desktopPage)
    .getByRole('heading', { name: followedNodeLabel })
    .waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.getByRole('button', { name: 'Open card' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const graphFollowedCardWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage494-graph-followed-card-wide-top.png',
  )

  desktopReaderPage = await browser.newPage({ viewport: desktopViewport })
  const { sourceTitle } = await openOriginalReaderFromHome(desktopReaderPage)
  const readerOriginalWideTop = await captureViewportScreenshot(
    desktopReaderPage,
    outputDir,
    'stage494-reader-original-wide-top.png',
  )

  await writeFile(
    path.join(outputDir, 'stage494-post-stage493-graph-card-drawer-and-connection-follow-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Graph is audited first after the Stage 493 card-drawer and connection-follow reset',
          'the right drawer should now read card-first, with original-only source continuity separated into Reader and linked-card exploration separated into Connections',
          'Home and original-only Reader remain regression surfaces while generated-content Reader views stay explicitly locked out of scope',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphDetailDockCardWideTop,
          graphDetailDockConnectionsWideTop,
          graphDetailDockPeekWideTop,
          graphDetailDockReaderWideTop,
          graphFollowedCardWideTop,
          graphWideTop,
          homeWideTop,
          readerOriginalWideTop,
        },
        desktopViewport,
        followedNodeLabel,
        headless,
        runtimeBrowser,
        selectedNodeLabel: selectedNode.label,
        sourceTitle,
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
        path: path.join(outputDir, 'stage494-post-stage493-graph-card-drawer-and-connection-follow-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (desktopReaderPage && desktopReaderPage !== desktopPage) {
    await desktopReaderPage
      .screenshot({
        path: path.join(outputDir, 'stage494-post-stage493-graph-card-drawer-and-connection-follow-audit-failure-reader.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function openHome(page) {
  await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const homeControlSeam = page.locator('[aria-label="Home control seam"]').first()
  if (!(await homeControlSeam.isVisible().catch(() => false))) {
    const homeTab = page.getByRole('tab', { name: 'Home', exact: true }).first()
    if (await homeTab.isVisible().catch(() => false)) {
      await homeTab.click()
    }
  }
  await page.locator('.recall-home-workspace').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function openReaderFromHome(page) {
  await openHome(page)
  const sourceButton = await getVisibleLocator(page, [
    '[aria-label="Pinned reopen shelf"] button[aria-label^="Open "]',
    '[aria-label="Saved library"] button[aria-label^="Open "]',
    '.recall-library-list-row',
    '.recall-home-continue-row',
    '.recall-home-library-stage-row',
    'button[aria-label^="Open "]',
  ])
  const sourceTitle = await getSourceTitle(sourceButton)
  await sourceButton.click()
  await page.getByRole('region', { name: `${sourceTitle} workspace` }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
  const sourceWorkspace = page.getByRole('region', { name: `${sourceTitle} workspace` })
  await sourceWorkspace.getByRole('tab', { name: 'Source workspace Reader' }).click()
  await page.waitForURL(/\/reader/, { timeout: 20000 })
  await page.locator('article').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
  return { sourceTitle }
}

async function openOriginalReaderFromHome(page) {
  const { sourceTitle } = await openReaderFromHome(page)
  const originalTab = page.getByRole('tab', { name: 'Original', exact: true }).first()
  await originalTab.waitFor({ state: 'visible', timeout: 20000 })
  if ((await originalTab.getAttribute('aria-selected')) !== 'true') {
    await originalTab.click()
    await page.waitForTimeout(250)
  }
  if ((await originalTab.getAttribute('aria-selected')) !== 'true') {
    throw new Error('Could not switch Reader into Original view for the Stage 494 audit.')
  }
  await page.waitForTimeout(250)
  return { sourceTitle }
}

async function ensureTabSelected(tab) {
  await tab.waitFor({ state: 'visible', timeout: 20000 })
  if ((await tab.getAttribute('aria-selected')) !== 'true') {
    await tab.click()
    await tab.page().waitForTimeout(200)
  }
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

function getGraphDetailDock(page) {
  return page.locator('[aria-label="Node detail dock"]').last()
}

async function getPreferredGraphNodeByLabel(page, labels) {
  for (const label of labels) {
    const nodeButton = page.getByRole('button', { name: new RegExp(`^Select node ${escapeRegExp(label)}$`) }).first()
    if (await nodeButton.isVisible().catch(() => false)) {
      return { label, nodeButton }
    }
  }
  return getPreferredGraphNode(page)
}

async function getPreferredGraphNode(page) {
  const nodeButtons = page.locator('button[aria-label^="Select node "]')
  const count = await nodeButtons.count()
  const viewport = page.viewportSize() ?? desktopViewport
  const preferredLeftEdge = 260
  const preferredRightEdge = viewport.width - 320
  const preferredTopEdge = 180
  const preferredBottomEdge = viewport.height - 220
  let bestIndex = -1
  let bestScore = Number.POSITIVE_INFINITY

  for (let index = 0; index < count; index += 1) {
    const nodeButton = nodeButtons.nth(index)
    if (!(await nodeButton.isVisible().catch(() => false))) {
      continue
    }
    const box = await nodeButton.boundingBox()
    if (!box) {
      continue
    }
    const centerX = box.x + box.width / 2
    const centerY = box.y + box.height / 2
    const outsidePreferredBounds =
      centerX < preferredLeftEdge ||
      centerX > preferredRightEdge ||
      centerY < preferredTopEdge ||
      centerY > preferredBottomEdge

    const score =
      Math.abs(centerX - viewport.width / 2) +
      Math.abs(centerY - viewport.height / 2) +
      (outsidePreferredBounds ? 1000 : 0)

    if (score < bestScore) {
      bestIndex = index
      bestScore = score
    }
  }

  if (bestIndex < 0) {
    throw new Error('Could not find a visible graph node during the Stage 494 run.')
  }

  const nodeButton = nodeButtons.nth(bestIndex)
  const accessibleName = await nodeButton.getAttribute('aria-label')
  const label = accessibleName?.replace(/^Select node\s+/, '') ?? `node-${bestIndex + 1}`
  return { label, nodeButton }
}

async function selectGraphNodeWithFollowConnection(page, preferredLabels) {
  const candidateLabels = await getGraphNodeCandidateLabels(page, preferredLabels)

  for (const label of candidateLabels) {
    const nodeButton = page.getByRole('button', { name: new RegExp(`^Select node ${escapeRegExp(label)}$`) }).first()
    if (!(await nodeButton.isVisible().catch(() => false))) {
      continue
    }

    await nodeButton.click()
    await page.getByRole('button', { name: 'Open card' }).waitFor({ state: 'visible', timeout: 20000 })
    await page.waitForTimeout(250)
    await page.getByRole('button', { name: 'Open card' }).click()
    await page.getByRole('button', { name: 'Close drawer' }).waitFor({ state: 'visible', timeout: 20000 })
    await page.waitForTimeout(250)

    const connectionsTab = getGraphDetailDock(page).getByRole('tab', { name: /^Connections\b/i }).first()
    if ((await connectionsTab.isDisabled().catch(() => true)) === true) {
      continue
    }

    await ensureTabSelected(connectionsTab)
    await page.locator('#graph-detail-panel-connections').waitFor({ state: 'visible', timeout: 20000 })

    const connectionsPanel = page.locator('#graph-detail-panel-connections')
    let followButton = getGraphDetailDock(page).getByRole('button', { name: /^Follow / }).first()
    if (!(await followButton.isVisible().catch(() => false))) {
      const showAllButton = connectionsPanel.getByRole('button', { name: /^Show all / }).first()
      if (await showAllButton.isVisible().catch(() => false)) {
        await showAllButton.click()
        await page.waitForTimeout(200)
      }
      followButton = getGraphDetailDock(page).getByRole('button', { name: /^Follow / }).first()
    }

    if (await followButton.isVisible().catch(() => false)) {
      return { label }
    }
  }

  throw new Error(`Could not find a Graph node with a followable connection during the Stage 494 run.`)
}

async function getGraphNodeCandidateLabels(page, preferredLabels) {
  const orderedLabels = []
  const seen = new Set()

  for (const label of preferredLabels) {
    if (!seen.has(label)) {
      orderedLabels.push(label)
      seen.add(label)
    }
  }

  const nodeButtons = page.locator('button[aria-label^="Select node "]')
  const count = await nodeButtons.count()

  for (let index = 0; index < count; index += 1) {
    const nodeButton = nodeButtons.nth(index)
    if (!(await nodeButton.isVisible().catch(() => false))) {
      continue
    }
    const accessibleName = await nodeButton.getAttribute('aria-label')
    const label = accessibleName?.replace(/^Select node\s+/, '').trim()
    if (label && !seen.has(label)) {
      orderedLabels.push(label)
      seen.add(label)
    }
  }

  return orderedLabels
}

async function getVisibleLocator(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first()
    if (await locator.isVisible().catch(() => false)) {
      return locator
    }
  }
  throw new Error(`Could not find a visible locator for any of: ${selectors.join(', ')}`)
}

async function getSourceTitle(sourceButton) {
  const ariaLabel = await sourceButton.getAttribute('aria-label')
  if (ariaLabel?.startsWith('Open ')) {
    return ariaLabel.replace(/^Open\s+/, '').trim()
  }
  const text = (await sourceButton.innerText()).trim()
  if (text) {
    return text.split('\n')[0].trim()
  }
  return 'Saved source'
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
