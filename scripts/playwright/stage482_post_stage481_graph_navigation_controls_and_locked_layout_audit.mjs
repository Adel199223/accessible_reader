import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE482_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE482_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE482_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE482_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE482_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE482_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage482-post-stage481-graph-navigation-controls-and-locked-layout-audit-failure.png'),
  { force: true },
)
await rm(
  path.join(outputDir, 'stage482-post-stage481-graph-navigation-controls-and-locked-layout-audit-failure-reader.png'),
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

  const homeWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage482-home-wide-top.png')

  await desktopPage.getByRole('tab', { name: 'Graph', exact: true }).click()
  await desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(350)

  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage482-graph-wide-top.png')

  const graphCanvas = desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).first()
  const graphViewportStage = desktopPage.locator('.recall-graph-canvas-viewport-stage').first()
  const initialGraphScale = await graphViewportStage.getAttribute('data-graph-scale')
  if (!initialGraphScale) {
    throw new Error('Graph viewport stage did not expose a starting scale during the Stage 482 audit.')
  }

  await zoomAndPanGraphCanvas(desktopPage, graphCanvas)
  await waitForStageScaleChange(graphViewportStage, initialGraphScale)
  const graphZoomedPannedWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage482-graph-zoomed-panned-wide-top.png',
  )
  const zoomedGraphScale = await graphViewportStage.getAttribute('data-graph-scale')

  await desktopPage.getByRole('button', { name: 'Show settings' }).click()
  await desktopPage.getByRole('complementary', { name: 'Graph settings sidebar' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.getByRole('button', { name: 'Lock graph' }).click()
  await desktopPage.getByRole('button', { name: 'Unlock graph' }).waitFor({ state: 'visible', timeout: 20000 })

  const lockedNode = await getPreferredGraphNodeByLabel(desktopPage, ['Stage 10 node', 'Knowledge Graphs', 'Study Cards'])
  await dragGraphNode(desktopPage, lockedNode.nodeButton, { deltaX: 104, deltaY: 60 })
  const graphLockedLayoutWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage482-graph-locked-layout-wide-top.png',
  )

  await desktopPage.getByRole('button', { name: 'Unlock graph' }).click()
  await desktopPage.getByRole('button', { name: 'Fit to view' }).click()
  await waitForStageScaleChange(graphViewportStage, zoomedGraphScale)
  const fitResetGraphScale = await graphViewportStage.getAttribute('data-graph-scale')
  const graphFitResetWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage482-graph-fit-reset-wide-top.png',
  )

  desktopReaderPage = await browser.newPage({ viewport: desktopViewport })
  const { sourceTitle } = await openOriginalReaderFromHome(desktopReaderPage)
  const readerOriginalWideTop = await captureViewportScreenshot(
    desktopReaderPage,
    outputDir,
    'stage482-reader-original-wide-top.png',
  )

  await writeFile(
    path.join(
      outputDir,
      'stage482-post-stage481-graph-navigation-controls-and-locked-layout-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Graph is audited first after the Stage 481 navigation-controls and locked-layout reset',
          'Graph should now own fit-to-view, lock/unlock, zoom, and pan directly from the corner control seam while the drawer stays focused on filters and presets',
          'Home and original-only Reader remain regression surfaces, and generated-content Reader views stay locked out of scope',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphFitResetWideTop,
          graphLockedLayoutWideTop,
          graphWideTop,
          graphZoomedPannedWideTop,
          homeWideTop,
          readerOriginalWideTop,
        },
        desktopViewport,
        graphScale: {
          fitReset: fitResetGraphScale,
          wideTop: initialGraphScale,
          zoomedPanned: zoomedGraphScale,
        },
        headless,
        runtimeBrowser,
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
        path: path.join(outputDir, 'stage482-post-stage481-graph-navigation-controls-and-locked-layout-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (desktopReaderPage && desktopReaderPage !== desktopPage) {
    await desktopReaderPage
      .screenshot({
        path: path.join(outputDir, 'stage482-post-stage481-graph-navigation-controls-and-locked-layout-audit-failure-reader.png'),
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
    throw new Error('Could not switch Reader into Original view for the Stage 482 audit.')
  }
  await page.waitForTimeout(250)
  return { sourceTitle }
}

async function zoomAndPanGraphCanvas(page, graphCanvas) {
  const canvasBox = await graphCanvas.boundingBox()
  if (!canvasBox) {
    throw new Error('Could not measure the Graph canvas during the Stage 482 audit.')
  }

  const centerX = canvasBox.x + canvasBox.width / 2
  const centerY = canvasBox.y + canvasBox.height / 2
  await page.mouse.move(centerX, centerY)
  await page.mouse.wheel(0, 420)
  await page.waitForTimeout(220)
  await page.mouse.move(centerX, centerY)
  await page.mouse.down()
  await page.mouse.move(centerX + 118, centerY + 68, { steps: 16 })
  await page.mouse.up()
  await page.waitForTimeout(260)
}

async function dragGraphNode(page, nodeButton, { deltaX, deltaY }) {
  const nodeBox = await nodeButton.boundingBox()
  if (!nodeBox) {
    throw new Error('Could not measure the locked Graph node for the Stage 482 audit.')
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
    throw new Error('Could not find a visible graph node during the Stage 482 audit.')
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
