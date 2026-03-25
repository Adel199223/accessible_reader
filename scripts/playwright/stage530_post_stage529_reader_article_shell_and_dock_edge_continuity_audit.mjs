import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE530_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE530_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE530_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE530_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE530_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE530_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage530-post-stage529-reader-article-shell-and-dock-edge-continuity-audit-failure.png',
  ),
  { force: true },
)
await rm(
  path.join(
    outputDir,
    'stage530-post-stage529-reader-article-shell-and-dock-edge-continuity-audit-failure-reader.png',
  ),
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
  const homeWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage530-home-wide-top.png')

  await openGraph(desktopPage)
  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage530-graph-wide-top.png')

  desktopReaderPage = await browser.newPage({ viewport: desktopViewport })
  const sourceTitle = await openOriginalReaderFromHome(desktopReaderPage)
  const readerOriginalWideTop = await captureViewportScreenshot(
    desktopReaderPage,
    outputDir,
    'stage530-reader-original-wide-top.png',
  )
  const readerDeckJoinWideTop = await captureLocatorTopScreenshot(
    desktopReaderPage,
    await getVisibleLocator(desktopReaderPage, ['.reader-reading-deck-layout-original-parity', '.reader-reading-deck-layout']),
    outputDir,
    'stage530-reader-deck-join-wide-top.png',
    430,
  )
  const readerArticleLeadWideTop = await captureLocatorTopScreenshot(
    desktopReaderPage,
    await getVisibleLocator(desktopReaderPage, ['.reader-article-shell-original-parity', '.reader-article-shell']),
    outputDir,
    'stage530-reader-article-lead-wide-top.png',
    430,
  )
  const readerDockEdgeWideTop = await captureDockEdgeScreenshot(
    desktopReaderPage,
    outputDir,
    'stage530-reader-dock-edge-wide-top.png',
    430,
  )
  const readerMetrics = await getReaderDeckMetrics(desktopReaderPage)

  await writeFile(
    path.join(
      outputDir,
      'stage530-post-stage529-reader-article-shell-and-dock-edge-continuity-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop original-only Reader is audited first after the Stage 529 deck-shell reset',
          'Reader deck crops should confirm a flatter article shell and a tighter dock edge without reopening generated-content work',
          'Home and Graph stay in the audit as regression surfaces while original-only Reader remains the only active surface',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphWideTop,
          homeWideTop,
          readerArticleLeadWideTop,
          readerDeckJoinWideTop,
          readerDockEdgeWideTop,
          readerOriginalWideTop,
        },
        desktopViewport,
        headless,
        readerMetrics,
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
        path: path.join(
          outputDir,
          'stage530-post-stage529-reader-article-shell-and-dock-edge-continuity-audit-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (desktopReaderPage && desktopReaderPage !== desktopPage) {
    await desktopReaderPage
      .screenshot({
        path: path.join(
          outputDir,
          'stage530-post-stage529-reader-article-shell-and-dock-edge-continuity-audit-failure-reader.png',
        ),
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
  await page.locator('.recall-home-workspace').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('searchbox', { name: 'Search saved sources' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function openGraph(page) {
  await page.goto(`${baseUrl}/recall?section=graph`, { waitUntil: 'networkidle' })
  await page.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function openReaderFromHome(page) {
  await openHome(page)
  const sourceButton = await getVisibleLocator(page, [
    '[aria-label="Pinned reopen shelf"] button[aria-label^="Open "]',
    '[aria-label="Saved library overview"] button[aria-label^="Open "]',
    '[aria-label="Saved library"] button[aria-label^="Open "]',
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
  return sourceTitle
}

async function openOriginalReaderFromHome(page) {
  const sourceTitle = await openReaderFromHome(page)
  const originalTab = page.getByRole('tab', { name: 'Original', exact: true }).first()
  await originalTab.waitFor({ state: 'visible', timeout: 20000 })

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if ((await originalTab.getAttribute('aria-selected')) === 'true') {
      break
    }
    await originalTab.click()
    await page.waitForTimeout(250)
  }

  if ((await originalTab.getAttribute('aria-selected')) !== 'true') {
    throw new Error('Could not switch Reader into Original view for the Stage 530 audit.')
  }

  await page
    .locator('.reader-reading-stage-original-parity')
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
  return sourceTitle
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

async function captureDockEdgeScreenshot(page, directory, filename, maxHeight = 720) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(150)

  const article = await getVisibleLocator(page, ['.reader-article-shell-original-parity', '.reader-article-shell'])
  const dock = await getVisibleLocator(page, ['.reader-support-dock-original-parity', '.reader-support-dock'])
  const articleBox = await article.boundingBox()
  const dockBox = await dock.boundingBox()

  if (!articleBox || !dockBox) {
    throw new Error(`Could not resolve a dock-edge crop for ${filename}.`)
  }

  const viewportSize = page.viewportSize() ?? desktopViewport
  const clipX = Math.max(0, Math.floor(dockBox.x - 250))
  const clipY = Math.max(0, Math.floor(Math.min(articleBox.y, dockBox.y)))
  const clipRight = Math.min(viewportSize.width, Math.ceil(dockBox.x + dockBox.width))
  const clipBottom = Math.min(
    viewportSize.height,
    Math.ceil(Math.max(articleBox.y + articleBox.height, dockBox.y + dockBox.height)),
  )
  const clipWidth = clipRight - clipX
  const clipHeight = Math.min(clipBottom - clipY, maxHeight)

  if (clipWidth <= 0 || clipHeight <= 0) {
    throw new Error(`Calculated an empty dock-edge clip for ${filename}.`)
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

async function getVisibleLocator(page, selectors) {
  for (const selector of selectors) {
    const matches = await page.locator(selector).all()
    for (const locator of matches) {
      if (await locator.isVisible().catch(() => false)) {
        return locator
      }
    }
  }
  throw new Error(`Could not find a visible locator for selectors: ${selectors.join(', ')}`)
}

async function getSourceTitle(locator) {
  const ariaLabel = await locator.getAttribute('aria-label')
  if (ariaLabel) {
    const match = ariaLabel.match(/^Open (.+?)(?: from organizer)?$/i)
    if (match?.[1]) {
      return match[1]
    }
  }

  const headingText = ((await locator.locator('strong').first().textContent().catch(() => '')) ?? '').trim()
  if (headingText) {
    return headingText
  }

  const fallbackText = ((await locator.textContent().catch(() => '')) ?? '').trim()
  if (fallbackText) {
    return fallbackText.split('\n')[0].trim()
  }

  return 'Saved source'
}

async function getReaderDeckMetrics(page) {
  return page.evaluate(() => {
    const round = (value) => (value === null || value === undefined ? null : Number(value.toFixed(2)))
    const getElement = (...selectors) =>
      selectors
        .map((selector) => document.querySelector(selector))
        .find((element) => element instanceof HTMLElement) ?? null
    const rect = (...selectors) => {
      const element = getElement(...selectors)
      if (!(element instanceof HTMLElement)) {
        return null
      }
      const box = element.getBoundingClientRect()
      return {
        bottom: round(box.bottom),
        height: round(box.height),
        left: round(box.left),
        right: round(box.right),
        top: round(box.top),
        width: round(box.width),
      }
    }
    const numericStyle = (property, ...selectors) => {
      const element = getElement(...selectors)
      if (!(element instanceof HTMLElement)) {
        return null
      }
      const value = Number.parseFloat(window.getComputedStyle(element)[property] ?? '')
      return Number.isFinite(value) ? round(value) : null
    }

    const deck = rect('.reader-reading-deck-layout-original-parity', '.reader-reading-deck-layout')
    const documentShell = rect('.reader-document-shell-original-parity', '.reader-document-shell')
    const article = rect('.reader-article-shell-original-parity', '.reader-article-shell')
    const dock = rect('.reader-support-dock-original-parity', '.reader-support-dock')

    return {
      articleRect: article,
      articlePaddingInlineEnd: numericStyle('paddingRight', '.reader-article-shell-original-parity', '.reader-article-shell'),
      articlePaddingInlineStart: numericStyle('paddingLeft', '.reader-article-shell-original-parity', '.reader-article-shell'),
      articleRadiusTopRight: numericStyle('borderTopRightRadius', '.reader-article-shell-original-parity', '.reader-article-shell'),
      articleToDockGap: article && dock ? round(dock.left - article.right) : null,
      articleToDockWidthRatio: article && dock ? round(article.width / dock.width) : null,
      deckGap: numericStyle('columnGap', '.reader-reading-deck-layout-original-parity', '.reader-reading-deck-layout'),
      deckRect: deck,
      dockRect: dock,
      dockPaddingInlineEnd: numericStyle('paddingRight', '.reader-support-dock-original-parity', '.reader-support-dock'),
      dockPaddingInlineStart: numericStyle('paddingLeft', '.reader-support-dock-original-parity', '.reader-support-dock'),
      dockRadiusTopLeft: numericStyle('borderTopLeftRadius', '.reader-support-dock-original-parity', '.reader-support-dock'),
      documentShellRect: documentShell,
      documentShellInsetEnd: documentShell && article ? round(documentShell.right - article.right) : null,
      documentShellInsetStart: documentShell && article ? round(article.left - documentShell.left) : null,
      dockTopOffset: dock && article ? round(dock.top - article.top) : null,
      seamOverlap: article && dock ? round(article.right - dock.left) : null,
    }
  })
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
  const channelsToTry = [preferredChannel]
  if (allowChromiumFallback && !channelsToTry.includes('chromium')) {
    channelsToTry.push('chromium')
  }

  let lastError
  for (const channel of channelsToTry) {
    try {
      const browser = await chromium.launch({
        channel,
        headless,
      })
      return { browser, runtimeBrowser: channel }
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}
