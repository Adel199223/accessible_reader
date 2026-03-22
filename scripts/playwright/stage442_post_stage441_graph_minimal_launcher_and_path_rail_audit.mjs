import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE442_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE442_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE442_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE442_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE442_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE442_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage442-post-stage441-graph-minimal-launcher-and-path-rail-audit-failure.png'), {
  force: true,
})
await rm(path.join(outputDir, 'stage442-post-stage441-graph-minimal-launcher-and-path-rail-audit-failure-reader.png'), {
  force: true,
})

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const { browser, runtimeBrowser } = await launchBrowser(chromium)

let desktopPage
let desktopReaderPage
try {
  desktopPage = await browser.newPage({ viewport: desktopViewport })
  await openHome(desktopPage)

  const homeWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage442-home-wide-top.png')

  await desktopPage.getByRole('tab', { name: 'Graph', exact: true }).click()
  await desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(350)

  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage442-graph-wide-top.png')
  const graphMinimalLauncherWideTop = await captureViewportClip(
    desktopPage,
    outputDir,
    'stage442-graph-minimal-launcher-wide-top.png',
    { x: 92, y: 74, width: 1380, height: 164 },
  )
  const graphCompactPathRailWideTop = await captureViewportClip(
    desktopPage,
    outputDir,
    'stage442-graph-compact-path-rail-wide-top.png',
    { x: 412, y: 770, width: 780, height: 180 },
  )

  await showGraphTools(desktopPage)
  await desktopPage.waitForTimeout(250)

  const graphToolsOverlayWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByRole('complementary', { name: 'Graph tools sidebar' }).first(),
    outputDir,
    'stage442-graph-tools-overlay-wide-top.png',
    980,
  )

  await hideGraphTools(desktopPage)
  await selectFirstGraphNode(desktopPage)
  await desktopPage.getByRole('button', { name: 'Open details' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const graphDetailDock = desktopPage.getByLabel('Node detail dock').first()
  const graphDetailDockPeekWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDetailDock,
    outputDir,
    'stage442-graph-detail-dock-peek-wide-top.png',
    980,
    'locator',
  )

  await desktopPage.getByRole('button', { name: 'Open details' }).click()
  await desktopPage.getByRole('button', { name: 'Close details' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const graphDetailDockExpandedWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDetailDock,
    outputDir,
    'stage442-graph-detail-dock-expanded-wide-top.png',
    980,
    'locator',
  )

  desktopReaderPage = await browser.newPage({ viewport: desktopViewport })
  const { sourceTitle } = await openOriginalReaderFromHome(desktopReaderPage)
  const readerOriginalWideTop = await captureViewportScreenshot(
    desktopReaderPage,
    outputDir,
    'stage442-reader-original-wide-top.png',
  )

  await writeFile(
    path.join(outputDir, 'stage442-post-stage441-graph-minimal-launcher-and-path-rail-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Graph audit judged first after the Stage 441 minimal-launcher and compact-path-rail reset',
          'supporting Graph crops cover the smaller launcher pod, the lighter search pod, the compact path rail, and the attached tools and inspect drawers',
          'Home and original-only Reader checked as regression surfaces while generated-content Reader views remain out of scope',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphCompactPathRailWideTop,
          graphDetailDockExpandedWideTop,
          graphDetailDockPeekWideTop,
          graphMinimalLauncherWideTop,
          graphToolsOverlayWideTop,
          graphWideTop,
          homeWideTop,
          readerOriginalWideTop,
        },
        desktopViewport,
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
        path: path.join(outputDir, 'stage442-post-stage441-graph-minimal-launcher-and-path-rail-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (desktopReaderPage && desktopReaderPage !== desktopPage) {
    await desktopReaderPage
      .screenshot({
        path: path.join(outputDir, 'stage442-post-stage441-graph-minimal-launcher-and-path-rail-audit-failure-reader.png'),
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

async function showGraphTools(page) {
  const toolsSidebar = page.getByRole('complementary', { name: 'Graph tools sidebar' }).first()
  if (await toolsSidebar.isVisible().catch(() => false)) {
    return
  }

  const showToolsButton = page.getByRole('button', { name: 'Show tools' }).first()
  await showToolsButton.waitFor({ state: 'visible', timeout: 20000 })
  await showToolsButton.click()
  await toolsSidebar.waitFor({ state: 'visible', timeout: 20000 })
}

async function hideGraphTools(page) {
  const toolsSidebar = page.getByRole('complementary', { name: 'Graph tools sidebar' }).first()
  if (!(await toolsSidebar.isVisible().catch(() => false))) {
    return
  }

  const hideToolsButton = page.getByRole('button', { name: 'Hide tools' }).first()
  await hideToolsButton.waitFor({ state: 'visible', timeout: 20000 })
  await hideToolsButton.click()
  await toolsSidebar.waitFor({ state: 'hidden', timeout: 20000 })
}

async function openSourceWorkspaceFromHome(page) {
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

  return { sourceTitle }
}

async function openReaderFromHome(page) {
  const { sourceTitle } = await openSourceWorkspaceFromHome(page)
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

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if ((await originalTab.getAttribute('aria-selected')) === 'true') {
      await page.waitForTimeout(250)
      return { sourceTitle }
    }
    await originalTab.click()
    await page.waitForTimeout(250)
  }

  if ((await originalTab.getAttribute('aria-selected')) !== 'true') {
    throw new Error('Could not switch Reader into Original view for the Stage 442 audit.')
  }

  await page.waitForTimeout(250)
  return { sourceTitle }
}

async function captureViewportScreenshot(page, directory, filename) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath })
  return screenshotPath
}

async function captureViewportClip(page, directory, filename, clip) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath, clip })
  return screenshotPath
}

async function captureLocatorTopScreenshot(page, locator, directory, filename, maxHeight = 720, scrollMode = 'pageTop') {
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

async function selectFirstGraphNode(page) {
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
    throw new Error('Could not find a visible graph node to select during the Stage 442 audit.')
  }

  const nodeButton = nodeButtons.nth(bestIndex)
  await nodeButton.waitFor({ state: 'visible', timeout: 20000 })

  try {
    await nodeButton.click()
  } catch {
    await nodeButton.evaluate((element) => {
      element.click()
    })
  }
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
    return ariaLabel.replace(/^Open\s+/, '').trim()
  }

  const text = (await locator.textContent())?.trim()
  if (text) {
    return text.split('\n').map((value) => value.trim()).filter(Boolean)[0] ?? 'Saved source'
  }

  return 'Saved source'
}

function resolveHarnessDir(value) {
  if (process.platform === 'win32') {
    return value
  }
  const windowsDriveMatch = value.match(/^([A-Za-z]):\\(.*)$/)
  if (!windowsDriveMatch) {
    return value
  }
  const [, drive, rest] = windowsDriveMatch
  return `/mnt/${drive.toLowerCase()}/${rest.replace(/\\/g, '/')}`
}

async function launchBrowser(chromium) {
  try {
    const browser = await chromium.launch({
      channel: preferredChannel,
      headless,
    })
    return { browser, runtimeBrowser: preferredChannel }
  } catch (error) {
    if (!allowChromiumFallback) {
      throw error
    }
    const browser = await chromium.launch({ headless })
    return { browser, runtimeBrowser: 'chromium' }
  }
}
