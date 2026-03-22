import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE484_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE484_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE484_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE484_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE484_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE484_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage484-post-stage483-home-manual-organizer-ordering-and-selection-audit-failure.png',
  ),
  {
    force: true,
  },
)
await rm(
  path.join(
    outputDir,
    'stage484-post-stage483-home-manual-organizer-ordering-and-selection-audit-failure-reader.png',
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

  const homeWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage484-home-wide-top.png',
  )

  await enableManualMode(desktopPage)
  const collectionGroupOrderBefore = await getOrganizerGroupLabels(desktopPage)
  const collectionGroupLabelToMove = collectionGroupOrderBefore.at(-1)
  if (!collectionGroupLabelToMove) {
    throw new Error('Could not find a Home organizer group for the Stage 484 audit.')
  }
  await desktopPage.getByRole('button', { name: `Move ${collectionGroupLabelToMove} earlier` }).click()
  await waitForCondition(async () => {
    const groupOrder = await getOrganizerGroupLabels(desktopPage)
    return groupOrder.indexOf(collectionGroupLabelToMove) === Math.max(0, collectionGroupOrderBefore.length - 2)
  }, 'The Stage 484 audit could not confirm manual Home group ordering.')
  const collectionGroupOrderAfter = await getOrganizerGroupLabels(desktopPage)

  const homeManualGroupsWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByRole('complementary', { name: 'Home browse strip' }),
    outputDir,
    'stage484-home-manual-groups-wide-top.png',
    980,
    'locator',
  )

  await ensureToggleButtonPressed(desktopPage, 'Recent')
  const activeRecentBranch = await selectHomeBrowseBranchWithMultipleSources(desktopPage)
  const branchSourceOrderBefore = await getOrganizerSourceTitles(activeRecentBranch.group)
  const branchSourceLabelToMove = branchSourceOrderBefore.at(-1)
  if (!branchSourceLabelToMove) {
    throw new Error('Could not find a branch source for the Stage 484 audit.')
  }

  await desktopPage
    .getByRole('button', { name: `Move ${branchSourceLabelToMove} earlier in ${activeRecentBranch.groupLabel}` })
    .click()
  await waitForCondition(async () => {
    const sourceOrder = await getOrganizerSourceTitles(activeRecentBranch.group)
    return sourceOrder.indexOf(branchSourceLabelToMove) === Math.max(0, branchSourceOrderBefore.length - 2)
  }, 'The Stage 484 audit could not confirm manual Home branch ordering.')
  const branchSourceOrderAfter = await getOrganizerSourceTitles(activeRecentBranch.group)

  const homeManualBranchWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    activeRecentBranch.group,
    outputDir,
    'stage484-home-manual-branch-wide-top.png',
    860,
    'locator',
  )

  const selectionGroupLabels = (await getOrganizerGroupLabels(desktopPage)).slice(0, 2)
  if (selectionGroupLabels.length < 2) {
    throw new Error('Could not find two organizer groups for the Stage 484 selection-bar audit.')
  }
  await selectOrganizerGroups(desktopPage, selectionGroupLabels)
  const selectionBar = desktopPage.getByRole('group', { name: 'Organizer selection bar' })
  await selectionBar.waitFor({ state: 'visible', timeout: 20000 })

  const homeOrganizerSelectionBarWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    selectionBar,
    outputDir,
    'stage484-home-organizer-selection-bar-wide-top.png',
    220,
    'locator',
  )

  await desktopPage.goto(`${baseUrl}/recall?section=graph`, { waitUntil: 'networkidle' })
  await desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(350)
  const graphWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage484-graph-wide-top.png',
  )

  desktopReaderPage = await browser.newPage({ viewport: desktopViewport })
  const { sourceTitle } = await openOriginalReaderFromHome(desktopReaderPage)
  const readerOriginalWideTop = await captureViewportScreenshot(
    desktopReaderPage,
    outputDir,
    'stage484-reader-original-wide-top.png',
  )

  await writeFile(
    path.join(
      outputDir,
      'stage484-post-stage483-home-manual-organizer-ordering-and-selection-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 483 manual organizer reset',
          'Home should now feel closer to an active Recall tag-tree workbench with true manual ordering and desktop selection',
          'Graph and original-only Reader remain regression surfaces while generated-content Reader workflows stay locked out of scope',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        branchSourceOrder: {
          after: branchSourceOrderAfter,
          before: branchSourceOrderBefore,
          branchLabel: activeRecentBranch.groupLabel,
          movedSourceLabel: branchSourceLabelToMove,
        },
        captures: {
          graphWideTop,
          homeManualBranchWideTop,
          homeManualGroupsWideTop,
          homeOrganizerSelectionBarWideTop,
          homeWideTop,
          readerOriginalWideTop,
        },
        collectionGroupOrder: {
          after: collectionGroupOrderAfter,
          before: collectionGroupOrderBefore,
          movedGroupLabel: collectionGroupLabelToMove,
        },
        desktopViewport,
        headless,
        runtimeBrowser,
        selectionGroups: selectionGroupLabels,
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
          'stage484-post-stage483-home-manual-organizer-ordering-and-selection-audit-failure.png',
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
          'stage484-post-stage483-home-manual-organizer-ordering-and-selection-audit-failure-reader.png',
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
  await page.getByRole('region', { name: 'Primary saved source flow' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('searchbox', { name: 'Search saved sources' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function enableManualMode(page) {
  const manualButton = page.getByRole('button', { name: 'Manual' })
  await manualButton.waitFor({ state: 'visible', timeout: 20000 })
  if ((await manualButton.getAttribute('aria-pressed')) !== 'true') {
    await manualButton.click()
    await page.waitForTimeout(250)
  }
}

async function ensureToggleButtonPressed(page, name) {
  const button = page.getByRole('button', { name })
  await button.waitFor({ state: 'visible', timeout: 20000 })
  if ((await button.getAttribute('aria-pressed')) !== 'true') {
    await button.click()
    await page.waitForTimeout(250)
  }
}

async function selectHomeBrowseBranchWithMultipleSources(page) {
  const groups = page.locator('.recall-home-browse-group')
  const groupCount = await groups.count()
  if (!groupCount) {
    throw new Error('Could not find any Home organizer groups during the Stage 484 audit.')
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
    await expandOrganizerBranch(group)

    if ((await getOrganizerSourceTitles(group)).length >= 2) {
      return { group, groupLabel }
    }

    if (!fallbackGroup) {
      fallbackGroup = group
      fallbackLabel = groupLabel
    }
  }

  if (fallbackGroup && fallbackLabel) {
    return { group: fallbackGroup, groupLabel: fallbackLabel }
  }

  throw new Error('Could not find a Home organizer branch with visible source rows during the Stage 484 audit.')
}

async function expandOrganizerBranch(group) {
  const revealButton = group.getByRole('button', { name: /^Show all /i }).first()
  if (await revealButton.isVisible().catch(() => false)) {
    await revealButton.click()
    await group.page().waitForTimeout(250)
  }
}

async function selectOrganizerGroups(page, labels) {
  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'
  await page.keyboard.down(modifier)
  try {
    for (const label of labels) {
      const button = await getOrganizerGroupButton(page, label)
      await button.click()
      await page.waitForTimeout(120)
    }
  } finally {
    await page.keyboard.up(modifier)
  }
}

async function getOrganizerGroupLabels(page) {
  const groups = page.locator('.recall-home-browse-group')
  const count = await groups.count()
  const labels = []

  for (let index = 0; index < count; index += 1) {
    const button = groups.nth(index).locator('.recall-home-browse-group-button').first()
    if (!(await button.isVisible().catch(() => false))) {
      continue
    }
    labels.push(await getHomeBrowseGroupLabel(button))
  }

  return labels
}

async function getOrganizerGroupButton(page, label) {
  const button = page.getByRole('button', {
    name: new RegExp(`^${escapeRegExp(label)}(?:\\s|$)`),
  }).first()
  await button.waitFor({ state: 'visible', timeout: 20000 })
  return button
}

async function getOrganizerSourceTitles(group) {
  const sourceButtons = group.locator('button[aria-label^="Open "]')
  const count = await sourceButtons.count()
  const titles = []

  for (let index = 0; index < count; index += 1) {
    const sourceButton = sourceButtons.nth(index)
    if (!(await sourceButton.isVisible().catch(() => false))) {
      continue
    }
    titles.push(await getSourceTitle(sourceButton))
  }

  return titles
}

async function openSourceWorkspaceFromHome(page) {
  await openHome(page)

  const revealButtons = page.getByRole('button', { name: /show all \d+ .* sources/i })
  const revealCount = await revealButtons.count()
  for (let index = 0; index < revealCount; index += 1) {
    await revealButtons.nth(index).click().catch(() => undefined)
  }
  await page.waitForTimeout(250)

  const sourceButton = await getVisibleLocator(page, [
    '[aria-label="Saved library overview"] button[aria-label^="Open "]',
    '[aria-label="Saved library"] button[aria-label^="Open "]',
    '[aria-label="Home browse strip"] button[aria-label$="from organizer"]',
    '.recall-home-browse-group-child-tree-branch-reset',
    '.recall-home-library-stage-row',
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
    throw new Error('Could not switch Reader into Original view for the Stage 484 audit.')
  }

  await page.waitForTimeout(250)
  return { sourceTitle }
}

async function waitForCondition(check, failureMessage, timeoutMs = 5000) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    if (await check()) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 120))
  }
  throw new Error(failureMessage)
}

async function getHomeBrowseGroupLabel(button) {
  const title = (await button.locator('strong').first().textContent().catch(() => null))?.trim()
  if (title) {
    return title
  }

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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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
