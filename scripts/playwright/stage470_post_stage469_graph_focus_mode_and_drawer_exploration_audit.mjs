import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE470_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE470_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE470_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE470_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE470_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE470_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage470-post-stage469-graph-focus-mode-and-drawer-exploration-audit-failure.png'),
  { force: true },
)
await rm(
  path.join(outputDir, 'stage470-post-stage469-graph-focus-mode-and-drawer-exploration-audit-failure-reader.png'),
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

  const homeWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage470-home-wide-top.png')

  await desktopPage.getByRole('tab', { name: 'Graph', exact: true }).click()
  await desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(350)

  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage470-graph-wide-top.png')

  const selectedNode = await getPreferredGraphNodeByLabel(desktopPage, ['Knowledge Graphs', 'Study Cards', 'Stage 10 node'])
  await selectedNode.nodeButton.click()
  await desktopPage.getByRole('button', { name: 'Open details' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const graphSelectedFocusCanvasWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).first(),
    outputDir,
    'stage470-graph-selected-focus-canvas-wide-top.png',
    'locator',
  )
  const graphBottomRailSelectedWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.locator('.recall-graph-focus-rail').first(),
    outputDir,
    'stage470-graph-bottom-rail-selected-wide-top.png',
    'locator',
  )

  const graphDetailDock = desktopPage.getByLabel('Node detail dock').first()
  const graphDetailDockPeekWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDetailDock,
    outputDir,
    'stage470-graph-detail-dock-peek-wide-top.png',
    'locator',
  )

  await desktopPage.getByRole('button', { name: 'Open details' }).click()
  await desktopPage.getByRole('button', { name: 'Close details' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const graphDetailDockOverviewWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDetailDock,
    outputDir,
    'stage470-graph-detail-dock-overview-wide-top.png',
    'locator',
  )

  const mentionsTab = desktopPage.getByRole('tab', { name: /Mentions/i }).first()
  await ensureTabSelected(mentionsTab)
  const graphDetailDockMentionsWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDetailDock,
    outputDir,
    'stage470-graph-detail-dock-mentions-wide-top.png',
    'locator',
  )

  const relationsTab = desktopPage.getByRole('tab', { name: /Relations/i }).first()
  if ((await relationsTab.isDisabled().catch(() => true)) === true) {
    throw new Error(`The selected Graph node "${selectedNode.label}" did not expose a relations tab for Stage 470 evidence.`)
  }
  await ensureTabSelected(relationsTab)
  const graphDetailDockRelationsWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDetailDock,
    outputDir,
    'stage470-graph-detail-dock-relations-wide-top.png',
    'locator',
  )

  desktopReaderPage = await browser.newPage({ viewport: desktopViewport })
  const { sourceTitle } = await openOriginalReaderFromHome(desktopReaderPage)
  const readerOriginalWideTop = await captureViewportScreenshot(
    desktopReaderPage,
    outputDir,
    'stage470-reader-original-wide-top.png',
  )

  await writeFile(
    path.join(
      outputDir,
      'stage470-post-stage469-graph-focus-mode-and-drawer-exploration-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Graph is audited first after the Stage 469 focus-mode and drawer-exploration reset',
          'selected-node Graph work should now read as one focus-mode flow: calmer canvas, stronger bottom rail, and a tabbed right drawer',
          'Home and original-only Reader remain regression surfaces while generated-content Reader views stay locked out of scope',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphBottomRailSelectedWideTop,
          graphDetailDockMentionsWideTop,
          graphDetailDockOverviewWideTop,
          graphDetailDockPeekWideTop,
          graphDetailDockRelationsWideTop,
          graphSelectedFocusCanvasWideTop,
          graphWideTop,
          homeWideTop,
          readerOriginalWideTop,
        },
        desktopViewport,
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
        path: path.join(outputDir, 'stage470-post-stage469-graph-focus-mode-and-drawer-exploration-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (desktopReaderPage && desktopReaderPage !== desktopPage) {
    await desktopReaderPage
      .screenshot({
        path: path.join(outputDir, 'stage470-post-stage469-graph-focus-mode-and-drawer-exploration-audit-failure-reader.png'),
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
  await page.locator('[aria-label="Home control seam"]').first().waitFor({ state: 'visible', timeout: 20000 })
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
    throw new Error('Could not switch Reader into Original view for the Stage 470 audit.')
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
    throw new Error('Could not find a visible graph node during the Stage 470 run.')
  }

  const nodeButton = nodeButtons.nth(bestIndex)
  const accessibleName = await nodeButton.getAttribute('aria-label')
  const label = accessibleName?.replace(/^Select node\s+/, '') ?? `node-${bestIndex + 1}`
  return { label, nodeButton }
}

async function getVisibleLocator(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first()
    if (await locator.isVisible().catch(() => false)) {
      return locator
    }
  }
  throw new Error(`Could not find a visible locator for selectors: ${selectors.join(', ')}`)
}

async function getSourceTitle(locator) {
  const ariaLabel = await locator.getAttribute('aria-label')
  if (ariaLabel?.startsWith('Open ')) {
    return ariaLabel.replace(/^Open\s+/, '')
  }
  const textContent = (await locator.textContent())?.trim()
  if (textContent) {
    return textContent.split('\n')[0].trim()
  }
  throw new Error('Could not derive a source title from the selected Home locator.')
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
