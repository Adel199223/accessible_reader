import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE469_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE469_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE469_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE469_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE469_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE469_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage469-graph-focus-mode-and-drawer-exploration-reset-after-stage468-failure.png'),
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

  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage469-graph-wide-top.png')

  const selectedNode = await getPreferredGraphNodeByLabel(desktopPage, ['Knowledge Graphs', 'Study Cards', 'Stage 10 node'])
  await selectedNode.nodeButton.click()
  await desktopPage.getByRole('button', { name: 'Open details' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const graphSelectedFocusCanvasWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).first(),
    outputDir,
    'stage469-graph-selected-focus-canvas-wide-top.png',
    'locator',
  )
  const graphBottomRailSelectedWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.locator('.recall-graph-focus-rail').first(),
    outputDir,
    'stage469-graph-bottom-rail-selected-wide-top.png',
    'locator',
  )

  const graphDetailDock = desktopPage.getByLabel('Node detail dock').first()
  const graphDetailDockPeekWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDetailDock,
    outputDir,
    'stage469-graph-detail-dock-peek-wide-top.png',
    'locator',
  )

  await desktopPage.getByRole('button', { name: 'Open details' }).click()
  await desktopPage.getByRole('button', { name: 'Close details' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const graphDetailDockOverviewWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDetailDock,
    outputDir,
    'stage469-graph-detail-dock-overview-wide-top.png',
    'locator',
  )

  const mentionsTab = desktopPage.getByRole('tab', { name: /Mentions/i }).first()
  await ensureTabSelected(mentionsTab)
  const graphDetailDockMentionsWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDetailDock,
    outputDir,
    'stage469-graph-detail-dock-mentions-wide-top.png',
    'locator',
  )

  const relationsTab = desktopPage.getByRole('tab', { name: /Relations/i }).first()
  if ((await relationsTab.isDisabled().catch(() => true)) === true) {
    throw new Error(`The selected Graph node "${selectedNode.label}" did not expose a relations tab for Stage 469 evidence.`)
  }
  await ensureTabSelected(relationsTab)
  const graphDetailDockRelationsWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDetailDock,
    outputDir,
    'stage469-graph-detail-dock-relations-wide-top.png',
    'locator',
  )

  await writeFile(
    path.join(
      outputDir,
      'stage469-graph-focus-mode-and-drawer-exploration-reset-after-stage468-validation.json',
    ),
    JSON.stringify(
      {
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
        },
        desktopViewport,
        headless,
        runtimeBrowser,
        selectedNodeLabel: selectedNode.label,
        validationFocus: [
          'wide desktop Graph is judged first after the Stage 468 checkpoint',
          'selected-node focus mode should dim the surrounding canvas more clearly while the bottom rail owns source continuity and backtracking',
          'the right drawer should expand into overview, mentions, and relations tabs instead of one long stacked evidence wall',
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
        path: path.join(outputDir, 'stage469-graph-focus-mode-and-drawer-exploration-reset-after-stage468-failure.png'),
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

async function ensureTabSelected(tab) {
  await tab.waitFor({ state: 'visible', timeout: 20000 })
  if ((await tab.getAttribute('aria-selected')) !== 'true') {
    await tab.click()
    await tab.waitFor({ state: 'visible', timeout: 20000 })
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
    throw new Error('Could not find a visible graph node during the Stage 469 run.')
  }

  const nodeButton = nodeButtons.nth(bestIndex)
  const accessibleName = await nodeButton.getAttribute('aria-label')
  const label = accessibleName?.replace(/^Select node\s+/, '') ?? `node-${bestIndex + 1}`
  return { label, nodeButton }
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
