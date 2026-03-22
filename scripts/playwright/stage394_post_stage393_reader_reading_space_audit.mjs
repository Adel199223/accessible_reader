import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE394_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE394_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE394_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE394_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE394_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE394_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}
const focusedViewport = {
  width: 820,
  height: 980,
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage394-post-stage393-reader-reading-space-audit-failure.png'), {
  force: true,
})
await rm(path.join(outputDir, 'stage394-post-stage393-reader-reading-space-audit-failure-reader.png'), {
  force: true,
})
await rm(path.join(outputDir, 'stage394-post-stage393-reader-reading-space-audit-failure-focused.png'), {
  force: true,
})

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const { browser, runtimeBrowser } = await launchBrowser(chromium)

let desktopPage
let desktopReaderPage
let focusedPage
try {
  desktopPage = await browser.newPage({ viewport: desktopViewport })
  await openHome(desktopPage)

  const homeWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage394-home-wide-top.png')

  await desktopPage.getByRole('tab', { name: 'Graph', exact: true }).click()
  await desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await ensureGraphBrowseStripVisible(desktopPage)
  await desktopPage.waitForTimeout(350)
  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage394-graph-wide-top.png')

  desktopReaderPage = await browser.newPage({ viewport: desktopViewport })
  const { sourceTitle } = await openOriginalReaderFromHome(desktopReaderPage)
  const readerOriginalWideTop = await captureViewportScreenshot(
    desktopReaderPage,
    outputDir,
    'stage394-reader-original-wide-top.png',
  )
  const readerControlSeamWideTop = await captureLocatorTopScreenshot(
    desktopReaderPage,
    await getVisibleLocator(desktopReaderPage, ['.reader-stage-control-ribbon-original-parity', '.reader-stage-control-ribbon']),
    outputDir,
    'stage394-reader-control-seam-wide-top.png',
    380,
  )
  const readerArticleLaneWideTop = await captureLocatorTopScreenshot(
    desktopReaderPage,
    await getVisibleLocator(desktopReaderPage, ['.reader-document-shell-original-parity', '.reader-document-shell']),
    outputDir,
    'stage394-reader-article-lane-wide-top.png',
    980,
  )
  const readerSupportDockWideTop = await captureLocatorTopScreenshot(
    desktopReaderPage,
    await getVisibleLocator(desktopReaderPage, ['.reader-support-dock-original-parity', '.reader-support-dock']),
    outputDir,
    'stage394-reader-support-dock-wide-top.png',
    980,
  )

  await openReaderDockNotesTab(desktopReaderPage)
  const readerDockNotesWideTop = await captureLocatorTopScreenshot(
    desktopReaderPage,
    await getVisibleLocator(desktopReaderPage, ['.reader-support-dock-original-parity', '.reader-support-dock']),
    outputDir,
    'stage394-reader-dock-notes-wide-top.png',
    980,
  )

  focusedPage = await browser.newPage({ viewport: focusedViewport })
  const { sourceTitle: focusedSourceTitle } = await openOriginalReaderFromHome(focusedPage)
  const readerOriginalNarrowTop = await captureViewportScreenshot(
    focusedPage,
    outputDir,
    'stage394-reader-original-narrow-top.png',
  )

  await writeFile(
    path.join(outputDir, 'stage394-post-stage393-reader-reading-space-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'original-only Reader is judged first on wide desktop after the Stage 393 reading-space reset',
          'Reader-specific crops cover the compressed top seam, earlier article start, calmer attached dock, and dock-notes state',
          'Graph and Home remain regression surfaces while generated-content Reader workflows stay explicitly out of scope',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphWideTop,
          homeWideTop,
          readerArticleLaneWideTop,
          readerControlSeamWideTop,
          readerDockNotesWideTop,
          readerOriginalNarrowTop,
          readerOriginalWideTop,
          readerSupportDockWideTop,
        },
        desktopViewport,
        focusedViewport,
        headless,
        runtimeBrowser,
        sourceTitle,
        focusedSourceTitle,
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
        path: path.join(outputDir, 'stage394-post-stage393-reader-reading-space-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (desktopReaderPage && desktopReaderPage !== desktopPage) {
    await desktopReaderPage
      .screenshot({
        path: path.join(outputDir, 'stage394-post-stage393-reader-reading-space-audit-failure-reader.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (focusedPage && focusedPage !== desktopPage) {
    await focusedPage
      .screenshot({
        path: path.join(outputDir, 'stage394-post-stage393-reader-reading-space-audit-failure-focused.png'),
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

async function openSourceWorkspaceFromHome(page) {
  await openHome(page)

  const sourceButton = await getVisibleLocator(page, [
    'button[aria-label^="Open "]',
    '.recall-home-continue-row',
    '.recall-home-library-stage-row',
    '.recall-library-list-row',
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
    throw new Error('Could not switch Reader into Original view for the Stage 394 audit.')
  }

  await page.waitForTimeout(250)
  return { sourceTitle }
}

async function openReaderDockNotesTab(page) {
  const readerDock = await getVisibleLocator(page, ['.reader-support-dock-original-parity', '.reader-support-dock'])
  const notesTab = readerDock.getByRole('tab', { name: 'Notes', exact: true })
  await notesTab.waitFor({ state: 'visible', timeout: 20000 })
  await notesTab.click()
  await readerDock.getByRole('heading', { name: 'Notes', level: 3 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
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
  const ariaLabel = (await locator.getAttribute('aria-label'))?.trim()
  if (ariaLabel) {
    const strippedOpen = ariaLabel.replace(/^Open\s+/i, '').replace(/\s+from organizer$/i, '').trim()
    if (strippedOpen && strippedOpen !== ariaLabel) {
      return strippedOpen
    }
  }

  const strong = locator.locator('strong').first()
  if ((await strong.count()) > 0) {
    const strongText = (await strong.textContent())?.trim()
    if (strongText) {
      return strongText
    }
  }

  const text = (await locator.textContent())?.trim()
  if (text) {
    return text.split('\n').map((value) => value.trim()).find(Boolean) ?? 'Source'
  }

  return 'Source'
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
      return {
        browser,
        runtimeBrowser: channel,
      }
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}
