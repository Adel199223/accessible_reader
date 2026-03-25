import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE523_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE523_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE523_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE523_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE523_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE523_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage523-reader-top-seam-and-dock-deflation-reset-after-stage522-failure.png',
  ),
  { force: true },
)

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)
const { browser, runtimeBrowser } = await launchBrowser(chromium)

let desktopPage
try {
  desktopPage = await browser.newPage({ viewport: desktopViewport })
  const sourceTitle = await openOriginalReaderFromHome(desktopPage)

  const readerOriginalWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage523-reader-original-wide-top.png',
  )
  const readerTopSeamWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['.reader-reading-stage-original-parity', '.reader-reading-stage']),
    outputDir,
    'stage523-reader-top-seam-wide-top.png',
    408,
  )
  const readerArticleLaneWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['.reader-document-shell-original-parity', '.reader-document-shell']),
    outputDir,
    'stage523-reader-article-lane-wide-top.png',
    980,
  )
  const readerSupportDockWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['.reader-support-dock-original-parity', '.reader-support-dock']),
    outputDir,
    'stage523-reader-support-dock-wide-top.png',
    980,
  )

  await openReaderDockNotesTab(desktopPage)
  const readerDockNotesWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['.reader-support-dock-original-parity', '.reader-support-dock']),
    outputDir,
    'stage523-reader-dock-notes-wide-top.png',
    980,
  )

  const readerMetrics = await getReaderMetrics(desktopPage)

  await writeFile(
    path.join(outputDir, 'stage523-reader-top-seam-and-dock-deflation-reset-after-stage522-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          readerArticleLaneWideTop,
          readerDockNotesWideTop,
          readerOriginalWideTop,
          readerSupportDockWideTop,
          readerTopSeamWideTop,
        },
        desktopViewport,
        headless,
        readerMetrics,
        runtimeBrowser,
        sourceTitle,
        validationFocus: [
          'original-only Reader is reset again immediately after the Stage 522 Home audit rather than reopening another Home slice',
          'the Reader seam crop should show a shorter title-and-controls stack before the article lane begins',
          'the article lane and dock crops should show a wider reading lead with a calmer attached companion rail',
          'the dock-notes crop confirms note continuity still holds while generated-content Reader work stays fully out of scope',
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
        path: path.join(
          outputDir,
          'stage523-reader-top-seam-and-dock-deflation-reset-after-stage522-failure.png',
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
    throw new Error('Could not switch Reader into Original view for the Stage 523 validation.')
  }

  await page
    .locator('.reader-reading-stage-original-parity')
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
  return sourceTitle
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

async function getReaderMetrics(page) {
  return page.evaluate(() => {
    const round = (value) => (value === null || value === undefined ? null : Number(value.toFixed(2)))
    const rect = (selector) => {
      const element = document.querySelector(selector)
      if (!(element instanceof HTMLElement)) {
        return null
      }
      const box = element.getBoundingClientRect()
      return {
        bottom: round(box.bottom),
        height: round(box.height),
        left: round(box.left),
        top: round(box.top),
        width: round(box.width),
      }
    }

    const stage = rect('.reader-reading-stage-original-parity') ?? rect('.reader-reading-stage')
    const article = rect('.reader-article-shell-original-parity') ?? rect('.reader-article-shell')
    const dock = rect('.reader-support-dock-original-parity') ?? rect('.reader-support-dock')
    const primaryTransport =
      rect('.reader-reading-stage-original-parity .transport-button-primary') ??
      rect('.reader-stage-control-ribbon .transport-button-primary')
    const deck = document.querySelector('.reader-reading-deck-layout-original-parity') ?? document.querySelector('.reader-reading-deck-layout')

    return {
      articleRect: article,
      articleToDockWidthRatio:
        article && dock && dock.width ? round(article.width / dock.width) : null,
      deckTemplateColumns: deck ? window.getComputedStyle(deck).gridTemplateColumns : null,
      dockRect: dock,
      primaryTransportRect: primaryTransport,
      stageRect: stage,
      topSeamHeight: stage && article ? round(article.top - stage.top) : null,
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
