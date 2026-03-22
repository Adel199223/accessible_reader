import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE444_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE444_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE444_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE444_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE444_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE444_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage444-post-stage443-home-single-board-pinned-cluster-audit-failure.png'), {
  force: true,
})
await rm(path.join(outputDir, 'stage444-post-stage443-home-single-board-pinned-cluster-audit-failure-reader.png'), {
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

  const homeWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage444-home-wide-top.png')
  const homeOrganizerDockWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Home browse strip"]']),
    outputDir,
    'stage444-home-organizer-dock-wide-top.png',
    960,
  )
  const homePrimaryBoardWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Primary saved source flow"]']),
    outputDir,
    'stage444-home-primary-board-wide-top.png',
    980,
  )
  const homePinnedClusterWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Pinned reopen shelf"]']),
    outputDir,
    'stage444-home-pinned-cluster-wide-top.png',
    520,
    'locator',
  )
  const homeActiveBoardWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Saved library"]']),
    outputDir,
    'stage444-home-active-board-wide-top.png',
    820,
    'locator',
  )

  await desktopPage.getByRole('tab', { name: 'Graph', exact: true }).click()
  await desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(350)
  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage444-graph-wide-top.png')

  desktopReaderPage = await browser.newPage({ viewport: desktopViewport })
  const { sourceTitle } = await openOriginalReaderFromHome(desktopReaderPage)
  const readerOriginalWideTop = await captureViewportScreenshot(
    desktopReaderPage,
    outputDir,
    'stage444-reader-original-wide-top.png',
  )

  await writeFile(
    path.join(outputDir, 'stage444-post-stage443-home-single-board-pinned-cluster-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 443 single-board pinned-cluster reset',
          'Home evidence centers the organizer-led board, the fused pinned reopen cluster, and the earlier source list beginning inside the same board shell',
          'Graph and original-only Reader remain regression surfaces while generated-content Reader workflows stay explicitly out of scope',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphWideTop,
          homeActiveBoardWideTop,
          homeOrganizerDockWideTop,
          homePinnedClusterWideTop,
          homePrimaryBoardWideTop,
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
        path: path.join(outputDir, 'stage444-post-stage443-home-single-board-pinned-cluster-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (desktopReaderPage && desktopReaderPage !== desktopPage) {
    await desktopReaderPage
      .screenshot({
        path: path.join(outputDir, 'stage444-post-stage443-home-single-board-pinned-cluster-audit-failure-reader.png'),
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
    throw new Error('Could not switch Reader into Original view for the Stage 444 audit.')
  }

  await page.waitForTimeout(250)
  return { sourceTitle }
}

async function getSourceTitle(buttonLocator) {
  const ariaLabel = await buttonLocator.getAttribute('aria-label')
  if (ariaLabel?.startsWith('Open ')) {
    return ariaLabel.replace(/^Open /, '')
  }
  const text = (await buttonLocator.textContent())?.trim()
  if (text) {
    return text.split('\n')[0].trim()
  }
  throw new Error('Could not derive a source title from the Home opener button.')
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
    if (await locator.isVisible().catch(() => false)) {
      return locator
    }
  }
  throw new Error(`Could not find a visible locator for selectors: ${selectors.join(', ')}`)
}

async function launchBrowser(chromium) {
  if (preferredChannel) {
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
    }
  }

  const browser = await chromium.launch({ headless })
  return { browser, runtimeBrowser: 'chromium' }
}

function resolveHarnessDir(dir) {
  if (path.isAbsolute(dir)) {
    return dir
  }

  return path.resolve(repoRoot, dir)
}
