import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE527_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE527_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE527_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE527_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE527_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE527_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage527-reader-source-workspace-strip-and-stage-glance-deflation-reset-after-stage526-failure.png',
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
    'stage527-reader-original-wide-top.png',
  )
  const readerSourceWorkspaceWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['.source-workspace-frame-reader-active', '.source-workspace-frame']),
    outputDir,
    'stage527-reader-source-workspace-wide-top.png',
    260,
  )
  const readerEntrySeamWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['.reader-reading-stage-original-parity', '.reader-reading-stage']),
    outputDir,
    'stage527-reader-entry-seam-wide-top.png',
    420,
  )
  const readerArticleStartWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['.reader-reading-deck-layout-original-parity', '.reader-reading-deck-layout']),
    outputDir,
    'stage527-reader-article-start-wide-top.png',
    520,
  )
  const readerMetrics = await getReaderEntryMetrics(desktopPage)

  await writeFile(
    path.join(
      outputDir,
      'stage527-reader-source-workspace-strip-and-stage-glance-deflation-reset-after-stage526-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          readerArticleStartWideTop,
          readerEntrySeamWideTop,
          readerOriginalWideTop,
          readerSourceWorkspaceWideTop,
        },
        desktopViewport,
        headless,
        readerMetrics,
        runtimeBrowser,
        sourceTitle,
        validationFocus: [
          'original-only Reader is reset again immediately after the Stage 526 dock audit rather than reopening another surface',
          'the Reader-active source-workspace crop should show a slimmer header, chip run, and tab seam before the reading deck',
          'the Reader entry-seam and article-start crops should show the article beginning sooner while the dock stays attached',
          'generated-content Reader work stays fully out of scope throughout this implementation pass',
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
          'stage527-reader-source-workspace-strip-and-stage-glance-deflation-reset-after-stage526-failure.png',
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
    throw new Error('Could not switch Reader into Original view for the Stage 527 validation.')
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

async function getReaderEntryMetrics(page) {
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

    const sourceWorkspace = rect('.source-workspace-frame-reader-active', '.source-workspace-frame')
    const stage = rect('.reader-reading-stage-original-parity', '.reader-reading-stage')
    const stageShell = rect('.reader-stage-shell-original-parity', '.reader-stage-shell')
    const stageContext = rect('.reader-stage-context-original-parity', '.reader-stage-context')
    const controlRibbon = rect('.reader-stage-control-ribbon-original-parity', '.reader-stage-control-ribbon')
    const glance = rect('.reader-stage-glance-bar-original-parity', '.reader-stage-glance-bar')
    const documentShell = rect('.reader-document-shell-original-parity', '.reader-document-shell')
    const article = rect('.reader-article-shell-original-parity', '.reader-article-shell')
    const dock = rect('.reader-support-dock-original-parity', '.reader-support-dock')

    return {
      articleRect: article,
      controlRibbonRect: controlRibbon,
      dockRect: dock,
      documentShellRect: documentShell,
      sourceWorkspaceGap: numericStyle('gap', '.source-workspace-frame-reader-active', '.source-workspace-frame'),
      sourceWorkspaceMetaCount: document.querySelectorAll('.source-workspace-meta .status-chip').length,
      sourceWorkspacePaddingBlock: numericStyle('paddingTop', '.source-workspace-frame-reader-active', '.source-workspace-frame'),
      sourceWorkspaceRect: sourceWorkspace,
      sourceWorkspaceToArticleOffset:
        sourceWorkspace && article ? round(article.top - sourceWorkspace.top) : null,
      stageContextRect: stageContext,
      stageGap: numericStyle('gap', '.reader-reading-stage-original-parity', '.reader-reading-stage'),
      stageGlanceRect: glance,
      stageRect: stage,
      stageShellRect: stageShell,
      stageToArticleOffset: stage && article ? round(article.top - stage.top) : null,
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
