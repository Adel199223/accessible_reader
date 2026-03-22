import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE415_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE415_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE415_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE415_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE415_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE415_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage415-home-organizer-highlight-deflation-after-stage414-failure.png'), {
  force: true,
})

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const { browser, runtimeBrowser } = await launchBrowser(chromium)

let desktopPage
try {
  desktopPage = await browser.newPage({ viewport: desktopViewport })
  await openHome(desktopPage)

  const defaultOrganizerGroup = await getOrganizerGroupLabel(
    desktopPage.locator('[aria-label="Saved source groups"] .recall-home-browse-group-button-active').first(),
  )

  const homeWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage415-home-wide-top.png')
  const homeControlSeamWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Home control seam"]']),
    outputDir,
    'stage415-home-control-seam-wide-top.png',
    220,
  )
  const homeOrganizerRailWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Home browse strip"]']),
    outputDir,
    'stage415-home-organizer-rail-wide-top.png',
    980,
  )
  const homeOrganizerSelectedStateWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Saved source groups"] .recall-home-browse-group-active']),
    outputDir,
    'stage415-home-organizer-selected-state-wide-top.png',
    360,
    'locator',
  )
  const homePrimaryFlowWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Primary saved source flow"]']),
    outputDir,
    'stage415-home-primary-flow-wide-top.png',
    1040,
  )
  const homeSelectedGroupBoardWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Saved library"]']),
    outputDir,
    'stage415-home-selected-group-board-wide-top.png',
    1040,
    'locator',
  )
  const homePinnedReopenShelfWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Pinned reopen shelf"]']),
    outputDir,
    'stage415-home-pinned-reopen-shelf-wide-top.png',
    920,
    'locator',
  )

  await collapseOrganizerPreviews(desktopPage)
  const homeOrganizerRailCollapsedWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Home browse strip"]']),
    outputDir,
    'stage415-home-organizer-rail-collapsed-wide-top.png',
    980,
  )
  await expandOrganizerPreviews(desktopPage)

  const alternateOrganizerGroup = await selectAlternateOrganizerGroup(desktopPage)
  const homeAlternateGroupBoardWideTop = alternateOrganizerGroup
    ? await captureLocatorTopScreenshot(
        desktopPage,
        await getVisibleLocator(desktopPage, ['[aria-label="Saved library"]']),
        outputDir,
        'stage415-home-selected-group-board-alternate-wide-top.png',
        1040,
        'locator',
      )
    : null

  await writeFile(
    path.join(outputDir, 'stage415-home-organizer-highlight-deflation-after-stage414-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          homeAlternateGroupBoardWideTop,
          homeControlSeamWideTop,
          homeOrganizerSelectedStateWideTop,
          homeOrganizerRailCollapsedWideTop,
          homeOrganizerRailWideTop,
          homePinnedReopenShelfWideTop,
          homePrimaryFlowWideTop,
          homeSelectedGroupBoardWideTop,
          homeWideTop,
        },
        defaultOrganizerGroup,
        desktopViewport,
        headless,
        runtimeBrowser,
        switchedOrganizerGroup: alternateOrganizerGroup,
        validationFocus: [
          'wide desktop Home is judged first after the Stage 414 checkpoint',
          'evidence centers the lighter active-row treatment, the softer count chip, the quieter attached preview flow, and the stable pinned next-source sidecar',
          'one dedicated selected-state crop proves the active organizer group no longer depends on strong badge-and-border chrome to feel selected',
          'one collapsed-rail capture proves the tree can stay compact without dropping the active group completely',
          'when another organizer group is available, the capture set confirms the organizer tree is still driving the board instead of restoring a staged intro stack',
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
        path: path.join(outputDir, 'stage415-home-organizer-highlight-deflation-after-stage414-failure.png'),
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
    const label = (await strong.textContent())?.trim()
    if (label) {
      return label
    }
  }

  const text = (await locator.textContent())?.trim()
  if (!text) {
    throw new Error('Could not resolve organizer group label.')
  }
  return text
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

function resolveHarnessDir(candidateDir) {
  if (path.isAbsolute(candidateDir)) {
    return candidateDir
  }
  return path.resolve(repoRoot, candidateDir)
}
