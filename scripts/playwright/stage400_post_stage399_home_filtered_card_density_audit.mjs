import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE400_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE400_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE400_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE400_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE400_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE400_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage400-post-stage399-home-filtered-card-density-audit-failure.png'), {
  force: true,
})
await rm(path.join(outputDir, 'stage400-post-stage399-home-filtered-card-density-audit-failure-reader.png'), {
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

  const defaultOrganizerGroup = await getOrganizerGroupLabel(
    desktopPage.locator('[aria-label="Saved source groups"] .recall-home-browse-group-button-active').first(),
  )

  const homeWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage400-home-wide-top.png')
  const homeControlSeamWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Home control seam"]']),
    outputDir,
    'stage400-home-control-seam-wide-top.png',
    320,
  )
  const homeOrganizerRailWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Home browse strip"]']),
    outputDir,
    'stage400-home-organizer-rail-wide-top.png',
    980,
  )
  const homePrimaryFlowWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Primary saved source flow"]']),
    outputDir,
    'stage400-home-primary-flow-wide-top.png',
    980,
  )
  const homeSelectedGroupBoardWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Saved library"]']),
    outputDir,
    'stage400-home-selected-group-board-wide-top.png',
    960,
    'locator',
  )
  const homePinnedReopenShelfWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Pinned reopen shelf"]']),
    outputDir,
    'stage400-home-pinned-reopen-shelf-wide-top.png',
    920,
    'locator',
  )

  await collapseOrganizerPreviews(desktopPage)
  const homeOrganizerRailCollapsedWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Home browse strip"]']),
    outputDir,
    'stage400-home-organizer-rail-collapsed-wide-top.png',
    980,
  )
  await expandOrganizerPreviews(desktopPage)

  const alternateOrganizerGroup = await selectAlternateOrganizerGroup(desktopPage)
  const homeAlternateGroupBoardWideTop = alternateOrganizerGroup
    ? await captureLocatorTopScreenshot(
        desktopPage,
        await getVisibleLocator(desktopPage, ['[aria-label="Saved library"]']),
        outputDir,
        'stage400-home-selected-group-board-alternate-wide-top.png',
        960,
        'locator',
      )
    : null

  await desktopPage.getByRole('tab', { name: 'Graph', exact: true }).click()
  await desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await ensureGraphBrowseStripVisible(desktopPage)
  await desktopPage.waitForTimeout(350)
  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage400-graph-wide-top.png')

  desktopReaderPage = await browser.newPage({ viewport: desktopViewport })
  const { sourceTitle } = await openOriginalReaderFromHome(desktopReaderPage)
  const readerOriginalWideTop = await captureViewportScreenshot(
    desktopReaderPage,
    outputDir,
    'stage400-reader-original-wide-top.png',
  )

  await writeFile(
    path.join(outputDir, 'stage400-post-stage399-home-filtered-card-density-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 399 filtered-card density reset',
          'Home evidence covers the stable organizer rail, the denser selected-group board, the tighter pinned reopen sidecar, and the reduced lower dead space',
          'Graph and original-only Reader remain regression surfaces while generated-content Reader workflows stay explicitly out of scope',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphWideTop,
          homeAlternateGroupBoardWideTop,
          homeControlSeamWideTop,
          homeOrganizerRailCollapsedWideTop,
          homeOrganizerRailWideTop,
          homePinnedReopenShelfWideTop,
          homePrimaryFlowWideTop,
          homeSelectedGroupBoardWideTop,
          homeWideTop,
          readerOriginalWideTop,
        },
        defaultOrganizerGroup,
        desktopViewport,
        headless,
        runtimeBrowser,
        sourceTitle,
        switchedOrganizerGroup: alternateOrganizerGroup,
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
        path: path.join(outputDir, 'stage400-post-stage399-home-filtered-card-density-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (desktopReaderPage && desktopReaderPage !== desktopPage) {
    await desktopReaderPage
      .screenshot({
        path: path.join(outputDir, 'stage400-post-stage399-home-filtered-card-density-audit-failure-reader.png'),
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
    throw new Error('Could not switch Reader into Original view for the Stage 400 audit.')
  }

  await page.waitForTimeout(250)
  return { sourceTitle }
}

async function collapseOrganizerPreviews(page) {
  const collapseButton = page.getByRole('button', { name: 'Collapse organizer previews' }).first()
  await collapseButton.waitFor({ state: 'visible', timeout: 20000 })
  await collapseButton.click()
  await page.getByRole('button', { name: 'Expand organizer previews' }).first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
}

async function expandOrganizerPreviews(page) {
  const expandButton = page.getByRole('button', { name: 'Expand organizer previews' }).first()
  await expandButton.waitFor({ state: 'visible', timeout: 20000 })
  await expandButton.click()
  await page.getByRole('button', { name: 'Collapse organizer previews' }).first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
}

async function selectAlternateOrganizerGroup(page) {
  const alternateGroupButton = page.locator('[aria-label="Saved source groups"] button[aria-pressed="false"]').first()
  if ((await alternateGroupButton.count()) === 0) {
    return null
  }

  await alternateGroupButton.waitFor({ state: 'visible', timeout: 20000 })
  const groupLabel = await getOrganizerGroupLabel(alternateGroupButton)
  await alternateGroupButton.click()
  await page.waitForTimeout(250)
  await page
    .locator('[aria-label="Saved source groups"] .recall-home-browse-group-button-active')
    .filter({ hasText: groupLabel })
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(200)
  return groupLabel
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

async function getOrganizerGroupLabel(locator) {
  const strong = locator.locator('strong').first()
  if ((await strong.count()) > 0) {
    const text = await strong.textContent()
    if (text) {
      return text.trim()
    }
  }

  const text = await locator.textContent()
  return text ? text.trim() : 'Unknown group'
}

async function getSourceTitle(locator) {
  const ariaLabel = await locator.getAttribute('aria-label')
  if (ariaLabel) {
    const openLabel = ariaLabel.match(/^Open\s+(.+)$/i)
    if (openLabel?.[1]) {
      return openLabel[1].replace(/\s+from organizer$/i, '').trim()
    }
  }

  const strong = locator.locator('strong').first()
  if ((await strong.count()) > 0) {
    const text = await strong.textContent()
    if (text) {
      return text.trim()
    }
  }

  const text = await locator.textContent()
  if (!text) {
    return 'Source'
  }

  return text.trim().split(/\s+/).slice(0, 6).join(' ')
}

function resolveHarnessDir(configuredHarnessDir) {
  if (path.isAbsolute(configuredHarnessDir)) {
    return configuredHarnessDir
  }
  return path.resolve(repoRoot, configuredHarnessDir)
}

async function launchBrowser(chromium) {
  const launchOptions = { channel: preferredChannel, headless }

  try {
    const browser = await chromium.launch(launchOptions)
    return { browser, runtimeBrowser: preferredChannel }
  } catch (error) {
    if (!allowChromiumFallback) {
      throw error
    }

    const browser = await chromium.launch({ headless })
    return { browser, runtimeBrowser: 'chromium' }
  }
}
