import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE430_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE430_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE430_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE430_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE430_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE430_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage430-post-stage429-graph-workbench-control-audit-failure.png'), {
  force: true,
})
await rm(path.join(outputDir, 'stage430-post-stage429-graph-workbench-control-audit-failure-reader.png'), {
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

  const homeWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage430-home-wide-top.png')

  await desktopPage.getByRole('tab', { name: 'Graph', exact: true }).click()
  await desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await ensureGraphBrowseStripVisible(desktopPage)
  await desktopPage.waitForTimeout(350)

  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage430-graph-wide-top.png')
  const graphControlClusterWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByLabel('Graph control seam').first(),
    outputDir,
    'stage430-graph-control-cluster-wide-top.png',
    220,
  )
  const graphUtilityDrawerWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByRole('complementary', { name: 'Graph selector strip' }).first(),
    outputDir,
    'stage430-graph-utility-drawer-wide-top.png',
    980,
  )
  const graphCanvasShellWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.locator('.recall-graph-canvas-shell-v20-reset').first(),
    outputDir,
    'stage430-graph-canvas-shell-wide-top.png',
    920,
  )
  const graphFocusRailWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByLabel('Graph focus rail').first(),
    outputDir,
    'stage430-graph-focus-rail-wide-top.png',
    220,
    'locator',
  )

  await hideGraphBrowseStrip(desktopPage)
  await selectFirstGraphNode(desktopPage)
  await desktopPage.getByRole('button', { name: 'Expand tray' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const graphDock = desktopPage.getByLabel('Node detail dock').first()
  const graphDetailDockPeekWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDock,
    outputDir,
    'stage430-graph-detail-dock-peek-wide-top.png',
    980,
    'locator',
  )

  await desktopPage.getByRole('button', { name: 'Expand tray' }).click()
  await desktopPage.getByRole('button', { name: 'Collapse tray' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const graphDetailDockExpandedWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDock,
    outputDir,
    'stage430-graph-detail-dock-expanded-wide-top.png',
    980,
    'locator',
  )

  desktopReaderPage = await browser.newPage({ viewport: desktopViewport })
  const { sourceTitle } = await openOriginalReaderFromHome(desktopReaderPage)
  const readerOriginalWideTop = await captureViewportScreenshot(
    desktopReaderPage,
    outputDir,
    'stage430-reader-original-wide-top.png',
  )

  await writeFile(
    path.join(outputDir, 'stage430-post-stage429-graph-workbench-control-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Graph audit judged first after the Stage 429 workbench redistribution reset',
          'supporting Graph crops cover the top workbench control cluster, utility drawer, attached focus rail, and inspect drawer in peek and expanded states',
          'Home and original-only Reader checked as regression surfaces while generated-content views remain out of scope',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphCanvasShellWideTop,
          graphControlClusterWideTop,
          graphDetailDockExpandedWideTop,
          graphDetailDockPeekWideTop,
          graphFocusRailWideTop,
          graphUtilityDrawerWideTop,
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
        path: path.join(outputDir, 'stage430-post-stage429-graph-workbench-control-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (desktopReaderPage && desktopReaderPage !== desktopPage) {
    await desktopReaderPage
      .screenshot({
        path: path.join(outputDir, 'stage430-post-stage429-graph-workbench-control-audit-failure-reader.png'),
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

async function ensureGraphBrowseStripVisible(page) {
  const selectorStrip = page.getByRole('complementary', { name: 'Graph selector strip' }).first()
  if (await selectorStrip.isVisible().catch(() => false)) {
    return
  }

  const showBrowseButton = page.getByRole('button', { name: 'Show browse' }).first()
  await showBrowseButton.waitFor({ state: 'visible', timeout: 20000 })
  await showBrowseButton.click()
  await selectorStrip.waitFor({ state: 'visible', timeout: 20000 })
}

async function hideGraphBrowseStrip(page) {
  const selectorStrip = page.getByRole('complementary', { name: 'Graph selector strip' }).first()
  if (!(await selectorStrip.isVisible().catch(() => false))) {
    return
  }

  const hideBrowseButton = page.getByRole('button', { name: 'Hide browse' }).first()
  await hideBrowseButton.waitFor({ state: 'visible', timeout: 20000 })
  await hideBrowseButton.click()
  await selectorStrip.waitFor({ state: 'hidden', timeout: 20000 })
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
    throw new Error('Could not switch Reader into Original view for the Stage 430 audit.')
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

async function captureLocatorTopScreenshot(page, locator, directory, filename, maxHeight = 720, scrollMode = 'pageTop') {
  if (scrollMode === 'locator') {
    await locator.scrollIntoViewIfNeeded()
  } else {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  }
  await page.waitForTimeout(150)

  let box = await locator.boundingBox()
  if (!box) {
    throw new Error(`Could not resolve a bounding box for ${filename}.`)
  }

  let viewportSize = page.viewportSize() ?? desktopViewport
  let clipX = Math.max(0, Math.floor(box.x))
  let clipY = Math.max(0, Math.floor(box.y))
  let clipWidth = Math.min(Math.ceil(box.width), viewportSize.width - clipX)
  let clipHeight = Math.min(Math.ceil(box.height), maxHeight, viewportSize.height - clipY)

  if (clipWidth <= 0 || clipHeight <= 0) {
    await locator.scrollIntoViewIfNeeded()
    await page.waitForTimeout(150)
    box = await locator.boundingBox()
    if (!box) {
      throw new Error(`Could not resolve a bounding box for ${filename} after scrolling.`)
    }
    viewportSize = page.viewportSize() ?? desktopViewport
    clipX = Math.max(0, Math.floor(box.x))
    clipY = Math.max(0, Math.floor(box.y))
    clipWidth = Math.min(Math.ceil(box.width), viewportSize.width - clipX)
    clipHeight = Math.min(Math.ceil(box.height), maxHeight, viewportSize.height - clipY)
  }

  if (clipWidth <= 0 || clipHeight <= 0) {
    throw new Error(`Calculated an empty clip for ${filename}.`)
  }

  const screenshotPath = path.join(directory, filename)
  await page.screenshot({
    path: screenshotPath,
    clip: {
      height: clipHeight,
      width: clipWidth,
      x: clipX,
      y: clipY,
    },
  })
  return screenshotPath
}

async function selectFirstGraphNode(page) {
  const nodeButton = page.locator('button[aria-label^="Select node "]').first()
  await nodeButton.waitFor({ state: 'visible', timeout: 20000 })
  await nodeButton.click()
}

async function getVisibleLocator(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first()
    if ((await locator.count()) > 0) {
      await locator.waitFor({ state: 'visible', timeout: 20000 })
      return locator
    }
  }
  throw new Error(`None of the expected selectors became visible: ${selectors.join(', ')}`)
}

async function getSourceTitle(locator) {
  const strong = locator.locator('strong').first()
  if ((await strong.count()) > 0) {
    const label = (await strong.textContent())?.trim()
    if (label) {
      return label
    }
  }

  const ariaLabel = await locator.getAttribute('aria-label')
  if (ariaLabel) {
    const cleaned = ariaLabel.replace(/^Open\s+/i, '').replace(/\s+from organizer$/i, '').trim()
    if (cleaned) {
      return cleaned
    }
  }

  const text = (await locator.textContent())?.trim()
  if (!text) {
    throw new Error('Could not resolve source title from Home.')
  }
  return text
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
