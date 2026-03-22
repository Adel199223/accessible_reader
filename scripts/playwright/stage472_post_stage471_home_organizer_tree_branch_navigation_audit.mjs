import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE472_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE472_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE472_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE472_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE472_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE472_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage472-post-stage471-home-organizer-tree-branch-navigation-audit-failure.png',
  ),
  {
    force: true,
  },
)
await rm(
  path.join(
    outputDir,
    'stage472-post-stage471-home-organizer-tree-branch-navigation-audit-failure-reader.png',
  ),
  {
    force: true,
  },
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

  const homeWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage472-home-wide-top.png')
  const {
    childCountBeforeExpansion,
    group,
    groupLabel,
    homeOrganizerTreeBranchWideTop,
    expansionButtonLabel,
  } = await captureHomeOrganizerTreeBranch(desktopPage)
  const {
    childCountAfterExpansion,
    homeOrganizerTreeBranchExpandedWideTop,
  } = await expandHomeOrganizerTreeBranch(desktopPage, group)
  const homeSelectedBranchBoardWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, [
      '.recall-home-selected-group-stage-tree-branch-reset',
      '[aria-label="Saved library"]',
    ]),
    outputDir,
    'stage472-home-selected-branch-board-wide-top.png',
    880,
    'locator',
  )

  await desktopPage.getByRole('button', { name: 'Hide organizer' }).click()
  await desktopPage.getByRole('group', { name: 'Compact organizer controls' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)
  const homeCompactControlsWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getVisibleLocator(desktopPage, [
      '.recall-home-compact-control-deck-organizer-control-reset',
      '[aria-label="Compact organizer controls"]',
    ]),
    outputDir,
    'stage472-home-compact-controls-wide-top.png',
    320,
    'locator',
  )

  await desktopPage.getByRole('tab', { name: 'Graph', exact: true }).click()
  await desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(350)
  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage472-graph-wide-top.png')

  desktopReaderPage = await browser.newPage({ viewport: desktopViewport })
  const { sourceTitle } = await openOriginalReaderFromHome(desktopReaderPage)
  const readerOriginalWideTop = await captureViewportScreenshot(
    desktopReaderPage,
    outputDir,
    'stage472-reader-original-wide-top.png',
  )

  await writeFile(
    path.join(
      outputDir,
      'stage472-post-stage471-home-organizer-tree-branch-navigation-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 471 organizer tree-branch reset',
          'Home evidence should show an active organizer branch that owns more direct source navigation, an expanded tree tail when needed, a cleaner selected-branch board start, and an organizer-hidden compact fallback that keeps controls accessible',
          'Graph and original-only Reader remain regression surfaces while generated-content Reader workflows stay explicitly out of scope',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphWideTop,
          homeCompactControlsWideTop,
          homeOrganizerTreeBranchExpandedWideTop,
          homeOrganizerTreeBranchWideTop,
          homeSelectedBranchBoardWideTop,
          homeWideTop,
          readerOriginalWideTop,
        },
        childCountAfterExpansion,
        childCountBeforeExpansion,
        desktopViewport,
        expansionButtonLabel,
        groupLabel,
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
        path: path.join(
          outputDir,
          'stage472-post-stage471-home-organizer-tree-branch-navigation-audit-failure.png',
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
          'stage472-post-stage471-home-organizer-tree-branch-navigation-audit-failure-reader.png',
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
  await page.locator('[aria-label="Home control seam"]').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function captureHomeOrganizerTreeBranch(page) {
  const { group, groupLabel } = await selectHomeBrowseBranchForCapture(page)
  const footerButton = group.locator('.recall-home-browse-group-footer-tree-branch-reset button').first()
  const childCountBeforeExpansion = await countHomeOrganizerBranchSources(group)
  const expansionButtonLabel = (await footerButton.textContent())?.trim() ?? null
  const homeOrganizerTreeBranchWideTop = await captureLocatorTopScreenshot(
    page,
    group,
    outputDir,
    'stage472-home-organizer-tree-branch-wide-top.png',
    820,
    'locator',
  )

  return {
    childCountBeforeExpansion,
    expansionButtonLabel,
    group,
    groupLabel,
    homeOrganizerTreeBranchWideTop,
  }
}

async function expandHomeOrganizerTreeBranch(page, group) {
  const footerButton = group.locator('.recall-home-browse-group-footer-tree-branch-reset button').first()
  if (!(await footerButton.isVisible().catch(() => false))) {
    return {
      childCountAfterExpansion: await countHomeOrganizerBranchSources(group),
      homeOrganizerTreeBranchExpandedWideTop: await captureLocatorTopScreenshot(
        page,
        group,
        outputDir,
        'stage472-home-organizer-tree-branch-expanded-wide-top.png',
        880,
        'locator',
      ),
    }
  }

  const previousCount = await countHomeOrganizerBranchSources(group)
  await footerButton.click()
  await page.waitForTimeout(250)
  await page.waitForFunction(
    ({ selector, previous }) => {
      const root = document.querySelector(selector)
      if (!root) {
        return false
      }
      const visibleChildButtons = root.querySelectorAll('button[aria-label^="Open "]').length
      const footer = root.querySelector('.recall-home-browse-group-footer-tree-branch-reset button')
      return visibleChildButtons > previous || !footer
    },
    {
      previous: previousCount,
      selector: '.recall-home-browse-group-active-tree-branch-reset',
    },
    { timeout: 20000 },
  )
  await page.waitForTimeout(200)

  return {
    childCountAfterExpansion: await countHomeOrganizerBranchSources(group),
    homeOrganizerTreeBranchExpandedWideTop: await captureLocatorTopScreenshot(
      page,
      group,
      outputDir,
      'stage472-home-organizer-tree-branch-expanded-wide-top.png',
      880,
      'locator',
    ),
  }
}

async function selectHomeBrowseBranchForCapture(page) {
  const groups = page.locator('.recall-home-browse-group')
  const groupCount = await groups.count()
  if (!groupCount) {
    throw new Error('Could not find any Home organizer groups to capture.')
  }

  let fallbackGroup = null
  let fallbackLabel = null

  for (let index = 0; index < groupCount; index += 1) {
    const group = groups.nth(index)
    const button = group.locator('.recall-home-browse-group-button').first()
    if (!(await button.isVisible().catch(() => false))) {
      continue
    }

    const groupLabel = await getHomeBrowseGroupLabel(button)
    await button.click()
    await page.waitForTimeout(250)

    if (await group.locator('.recall-home-browse-group-footer-tree-branch-reset button').first().isVisible().catch(() => false)) {
      return { group, groupLabel }
    }

    if (!fallbackGroup && (await countHomeOrganizerBranchSources(group)) > 0) {
      fallbackGroup = group
      fallbackLabel = groupLabel
    }
  }

  if (fallbackGroup && fallbackLabel) {
    return { group: fallbackGroup, groupLabel: fallbackLabel }
  }

  throw new Error('Could not find an active Home organizer branch with visible source rows.')
}

async function countHomeOrganizerBranchSources(group) {
  return await group.locator('button[aria-label^="Open "]').count()
}

async function openSourceWorkspaceFromHome(page) {
  await openHome(page)

  const sourceButton = await getVisibleLocator(page, [
    '[aria-label="Home browse strip"] button[aria-label$="from organizer"]',
    '.recall-home-browse-group-child-tree-branch-reset',
    '[aria-label="Saved library"] button[aria-label^="Open "]',
    '[aria-label="Pinned reopen shelf"] button[aria-label^="Open "]',
    '.recall-home-library-stage-row',
    '.recall-home-continue-row',
    '.recall-library-list-row',
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
    throw new Error('Could not switch Reader into Original view for the Stage 472 audit.')
  }

  await page.waitForTimeout(250)
  return { sourceTitle }
}

async function getHomeBrowseGroupLabel(button) {
  const text = (await button.textContent())?.trim()
  if (!text) {
    return 'Unknown group'
  }
  return text.split('\n')[0].trim()
}

async function getSourceTitle(buttonLocator) {
  const ariaLabel = await buttonLocator.getAttribute('aria-label')
  if (ariaLabel) {
    const labelMatch = ariaLabel.match(/^Open (.*?)(?: from organizer)?$/)
    if (labelMatch?.[1]) {
      return labelMatch[1]
    }
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
