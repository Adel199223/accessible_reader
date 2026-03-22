import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE481_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE481_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE481_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE481_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE481_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE481_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage481-graph-navigation-controls-and-locked-layout-reset-after-stage480-failure.png'),
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
    'stage481-graph-wide-top.png',
  )

  const graphCanvas = desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).first()
  const graphViewportStage = desktopPage.locator('.recall-graph-canvas-viewport-stage').first()
  const initialGraphScale = await graphViewportStage.getAttribute('data-graph-scale')
  if (!initialGraphScale) {
    throw new Error('Graph viewport stage did not expose a starting scale during the Stage 481 run.')
  }

  await zoomAndPanGraphCanvas(desktopPage, graphCanvas)
  await waitForStageScaleChange(graphViewportStage, initialGraphScale)

  const graphZoomedPannedWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage481-graph-zoomed-panned-wide-top.png',
  )
  const zoomedGraphScale = await graphViewportStage.getAttribute('data-graph-scale')

  await desktopPage.getByRole('button', { name: 'Show settings' }).click()
  const graphRail = desktopPage.getByRole('complementary', { name: 'Graph settings sidebar' }).first()
  await graphRail.waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.getByRole('button', { name: 'Lock graph' }).click()
  await desktopPage.getByRole('button', { name: 'Unlock graph' }).waitFor({ state: 'visible', timeout: 20000 })

  const lockedNode = await getPreferredGraphNodeByLabel(desktopPage, ['Stage 10 node', 'Knowledge Graphs', 'Study Cards'])
  const lockedNodeStyleBefore = await lockedNode.nodeButton.getAttribute('style')
  await dragGraphNode(desktopPage, lockedNode.nodeButton, { deltaX: 110, deltaY: 64 })
  await desktopPage.waitForFunction(
    ({ selector, styleValue }) => {
      const node = document.querySelector(selector)
      return Boolean(node && node.getAttribute('style') !== styleValue)
    },
    { selector: `[aria-label="Select node ${lockedNode.label}"]`, styleValue: lockedNodeStyleBefore },
  )

  const graphLockedLayoutWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage481-graph-locked-layout-wide-top.png',
  )
  const lockedGraphScale = await graphViewportStage.getAttribute('data-graph-scale')
  const lockedNodeStyleAfter = await lockedNode.nodeButton.getAttribute('style')

  await desktopPage.getByRole('button', { name: 'Unlock graph' }).click()
  await desktopPage.getByRole('button', { name: 'Lock graph' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.getByRole('button', { name: 'Fit to view' }).click()
  await waitForStageScaleEquals(graphViewportStage, initialGraphScale)

  const graphFitResetWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage481-graph-fit-reset-wide-top.png',
  )

  await writeFile(
    path.join(
      outputDir,
      'stage481-graph-navigation-controls-and-locked-layout-reset-after-stage480-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphFitResetWideTop,
          graphLockedLayoutWideTop,
          graphWideTop,
          graphZoomedPannedWideTop,
        },
        desktopViewport,
        graphScale: {
          fitReset: initialGraphScale,
          lockedLayout: lockedGraphScale,
          wideTop: initialGraphScale,
          zoomedPanned: zoomedGraphScale,
        },
        headless,
        lockedNodeLabel: lockedNode.label,
        lockedNodeStyleAfter,
        lockedNodeStyleBefore,
        runtimeBrowser,
        validationFocus: [
          'wide desktop Graph should now expose real fit-to-view and lock-graph controls in the corner seam',
          'the canvas should support zoom and pan directly while the drawer remains focused on presets and filtering',
          'locking the graph should enable manual node arrangement, then fit-to-view should restore the settled overview after unlocking',
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
        path: path.join(outputDir, 'stage481-graph-navigation-controls-and-locked-layout-reset-after-stage480-failure.png'),
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

async function zoomAndPanGraphCanvas(page, graphCanvas) {
  const canvasBox = await graphCanvas.boundingBox()
  if (!canvasBox) {
    throw new Error('Could not measure the Graph canvas during the Stage 481 run.')
  }

  const centerX = canvasBox.x + canvasBox.width / 2
  const centerY = canvasBox.y + canvasBox.height / 2
  await page.mouse.move(centerX, centerY)
  await page.mouse.wheel(0, 420)
  await page.waitForTimeout(220)
  await page.mouse.move(centerX, centerY)
  await page.mouse.down()
  await page.mouse.move(centerX + 120, centerY + 72, { steps: 16 })
  await page.mouse.up()
  await page.waitForTimeout(260)
}

async function dragGraphNode(page, nodeButton, { deltaX, deltaY }) {
  const nodeBox = await nodeButton.boundingBox()
  if (!nodeBox) {
    throw new Error('Could not measure the locked Graph node for the Stage 481 run.')
  }

  const startX = nodeBox.x + nodeBox.width / 2
  const startY = nodeBox.y + nodeBox.height / 2
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX + deltaX, startY + deltaY, { steps: 18 })
  await page.mouse.up()
  await page.waitForTimeout(260)
}

async function waitForStageScaleChange(stageLocator, startingScale) {
  await stageLocator.page().waitForFunction(
    ({ scale, selector }) => {
      const stage = document.querySelector(selector)
      return Boolean(stage && stage.getAttribute('data-graph-scale') !== scale)
    },
    {
      scale: startingScale,
      selector: '.recall-graph-canvas-viewport-stage',
    },
  )
}

async function waitForStageScaleEquals(stageLocator, expectedScale) {
  await stageLocator.page().waitForFunction(
    ({ scale, selector }) => {
      const stage = document.querySelector(selector)
      return Boolean(stage && stage.getAttribute('data-graph-scale') === scale)
    },
    {
      scale: expectedScale,
      selector: '.recall-graph-canvas-viewport-stage',
    },
  )
}

async function captureViewportScreenshot(page, directory, filename) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath })
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
    throw new Error('Could not find a visible graph node during the Stage 481 run.')
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
