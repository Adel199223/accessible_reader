import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE391_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE391_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE391_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE391_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE391_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE391_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}
const focusedViewport = {
  width: 820,
  height: 980,
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage391-home-tree-filtered-browse-reset-after-stage390-failure.png'), {
  force: true,
})
await rm(path.join(outputDir, 'stage391-home-tree-filtered-browse-reset-after-stage390-failure-focused.png'), {
  force: true,
})

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const { browser, runtimeBrowser } = await launchBrowser(chromium)

let desktopPage
let focusedPage
try {
  desktopPage = await browser.newPage({ viewport: desktopViewport })
  await openHome(desktopPage)

  const defaultOrganizerGroup = await getOrganizerGroupLabel(
    desktopPage.locator('[aria-label="Saved source groups"] .recall-home-browse-group-button-active').first(),
  )

  const homeWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage391-home-wide-top.png')
  const homeControlSeamWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Home control seam"]']),
    outputDir,
    'stage391-home-control-seam-wide-top.png',
    320,
  )
  const homeOrganizerRailWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Home browse strip"]']),
    outputDir,
    'stage391-home-organizer-rail-wide-top.png',
    980,
  )
  const homePrimaryFlowWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Primary saved source flow"]']),
    outputDir,
    'stage391-home-primary-flow-wide-top.png',
    980,
  )
  const homePinnedReopenShelfWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Pinned reopen shelf"]']),
    outputDir,
    'stage391-home-pinned-reopen-shelf-wide-top.png',
    920,
    'locator',
  )
  const homeSelectedGroupStageWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, ['[aria-label="Saved library"]']),
    outputDir,
    'stage391-home-selected-group-stage-wide-top.png',
    920,
    'locator',
  )
  const homeOtherLibraryGroupsWideTop = await captureOptionalLocatorTopScreenshot(
    desktopPage,
    ['[aria-label="Saved library lanes"]'],
    outputDir,
    'stage391-home-other-library-groups-wide-top.png',
    980,
    'locator',
  )

  const alternateOrganizerGroup = await selectAlternateOrganizerGroup(desktopPage)
  const homeAlternateGroupStageWideTop = alternateOrganizerGroup
    ? await captureLocatorTopScreenshot(
        desktopPage,
        await getVisibleLocator(desktopPage, ['[aria-label="Saved library"]']),
        outputDir,
        'stage391-home-selected-group-stage-alternate-wide-top.png',
        920,
        'locator',
      )
    : null

  focusedPage = await browser.newPage({ viewport: focusedViewport })
  const { sourceTitle } = await openSourceWorkspaceFromHome(focusedPage)
  const focusedOverviewNarrowTop = await captureViewportScreenshot(
    focusedPage,
    outputDir,
    'stage391-focused-overview-narrow-top.png',
  )

  await writeFile(
    path.join(outputDir, 'stage391-home-tree-filtered-browse-reset-after-stage390-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          focusedOverviewNarrowTop,
          homeAlternateGroupStageWideTop,
          homeControlSeamWideTop,
          homeOrganizerRailWideTop,
          homeOtherLibraryGroupsWideTop,
          homePinnedReopenShelfWideTop,
          homePrimaryFlowWideTop,
          homeSelectedGroupStageWideTop,
          homeWideTop,
        },
        defaultOrganizerGroup,
        desktopViewport,
        focusedViewport,
        headless,
        runtimeBrowser,
        sourceTitle,
        switchedOrganizerGroup: alternateOrganizerGroup,
        validationFocus: [
          'wide desktop Home is judged first after the Stage 390 graph checkpoint',
          'evidence centers the slimmer Home seam, organizer rail, pinned reopen shelf, and denser selected-group board',
          'when another organizer group is available, the capture set confirms the left rail is actively driving the right-side board instead of leaving Home as one static hero card',
          'focused overview stays coherent while Graph and original-only Reader remain regression-only in this stage',
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
        path: path.join(outputDir, 'stage391-home-tree-filtered-browse-reset-after-stage390-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (focusedPage && focusedPage !== desktopPage) {
    await focusedPage
      .screenshot({
        path: path.join(outputDir, 'stage391-home-tree-filtered-browse-reset-after-stage390-failure-focused.png'),
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

async function captureOptionalLocatorTopScreenshot(
  page,
  selectors,
  directory,
  filename,
  maxHeight = 720,
  scrollMode = 'pageTop',
) {
  const locator = await getOptionalVisibleLocator(page, selectors)
  if (!locator) {
    return null
  }
  return captureLocatorTopScreenshot(page, locator, directory, filename, maxHeight, scrollMode)
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

async function getOptionalVisibleLocator(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first()
    if ((await locator.count()) > 0) {
      await locator.waitFor({ state: 'visible', timeout: 20000 })
      return locator
    }
  }
  return null
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
    const text = (await strong.textContent())?.trim()
    if (text) {
      return text
    }
  }

  const text = (await locator.textContent())?.trim()
  if (text) {
    return text.split('\n').map((value) => value.trim()).find(Boolean) ?? 'Organizer group'
  }

  return 'Organizer group'
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
