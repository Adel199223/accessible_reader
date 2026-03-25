import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE526_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE526_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE526_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE526_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE526_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE526_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage526-post-stage525-reader-dock-source-stack-and-library-shell-audit-failure.png'),
  { force: true },
)
await rm(
  path.join(outputDir, 'stage526-post-stage525-reader-dock-source-stack-and-library-shell-audit-failure-reader.png'),
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
  const homeWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage526-home-wide-top.png')

  await openGraph(desktopPage)
  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage526-graph-wide-top.png')

  desktopReaderPage = await browser.newPage({ viewport: desktopViewport })
  const sourceTitle = await openOriginalReaderFromHome(desktopReaderPage)
  const readerOriginalWideTop = await captureViewportScreenshot(
    desktopReaderPage,
    outputDir,
    'stage526-reader-original-wide-top.png',
  )
  const readerDockHeaderWideTop = await captureLocatorTopScreenshot(
    desktopReaderPage,
    await getVisibleLocator(desktopReaderPage, ['.reader-support-dock-header']),
    outputDir,
    'stage526-reader-dock-header-wide-top.png',
    280,
  )
  const readerSourceStackWideTop = await captureLocatorTopScreenshot(
    desktopReaderPage,
    await getVisibleLocator(desktopReaderPage, ['.reader-support-pane-source-original-parity', '.reader-support-pane-source']),
    outputDir,
    'stage526-reader-source-stack-wide-top.png',
    980,
    'locator',
  )
  const readerMetrics = await getReaderDockMetrics(desktopReaderPage)

  await openReaderDockNotesTab(desktopReaderPage)
  const readerDockNotesWideTop = await captureLocatorTopScreenshot(
    desktopReaderPage,
    await getVisibleLocator(desktopReaderPage, ['.reader-support-dock-original-parity', '.reader-support-dock']),
    outputDir,
    'stage526-reader-dock-notes-wide-top.png',
    980,
    'locator',
  )

  await writeFile(
    path.join(outputDir, 'stage526-post-stage525-reader-dock-source-stack-and-library-shell-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop original-only Reader is audited first after the Stage 525 dock-source-stack reset',
          'Reader dock crops should show a flatter header seam plus a calmer source-support stack without losing notes continuity',
          'Home and Graph stay in the audit as regression surfaces while generated-content Reader work remains explicitly locked out',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphWideTop,
          homeWideTop,
          readerDockHeaderWideTop,
          readerDockNotesWideTop,
          readerOriginalWideTop,
          readerSourceStackWideTop,
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
        path: path.join(outputDir, 'stage526-post-stage525-reader-dock-source-stack-and-library-shell-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (desktopReaderPage && desktopReaderPage !== desktopPage) {
    await desktopReaderPage
      .screenshot({
        path: path.join(outputDir, 'stage526-post-stage525-reader-dock-source-stack-and-library-shell-audit-failure-reader.png'),
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
    throw new Error('Could not switch Reader into Original view for the Stage 526 audit.')
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

async function getReaderDockMetrics(page) {
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
    const numericStyle = (selector, property) => {
      const element = document.querySelector(selector)
      if (!(element instanceof HTMLElement)) {
        return null
      }
      const value = Number.parseFloat(window.getComputedStyle(element)[property] ?? '')
      return Number.isFinite(value) ? round(value) : null
    }

    const article = rect('.reader-article-shell-original-parity') ?? rect('.reader-article-shell')
    const deck = document.querySelector('.reader-reading-deck-layout-original-parity') ?? document.querySelector('.reader-reading-deck-layout')
    const dock = rect('.reader-support-dock-original-parity') ?? rect('.reader-support-dock')
    const dockHeader = rect('.reader-support-dock-header')
    const sourcePane = rect('.reader-support-pane-source-original-parity') ?? rect('.reader-support-pane-source')
    const sourceGlance = rect('.reader-support-glance-original-parity') ?? rect('.reader-support-glance')
    const embeddedLibrary = rect('.reader-support-pane .library-pane-embedded')

    return {
      articleRect: article,
      articleToDockWidthRatio:
        article && dock && dock.width ? round(article.width / dock.width) : null,
      deckTemplateColumns: deck ? window.getComputedStyle(deck).gridTemplateColumns : null,
      dockHeaderRect: dockHeader,
      dockRect: dock,
      embeddedLibraryRect: embeddedLibrary,
      libraryPaddingBlock: numericStyle('.reader-support-pane .library-pane-embedded', 'paddingTop'),
      sourceGlancePaddingBlock: numericStyle('.reader-support-glance', 'paddingTop'),
      sourceGlanceRect: sourceGlance,
      sourcePaneGap: numericStyle('.reader-support-pane-source', 'gap'),
      sourcePaneRect: sourcePane,
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
