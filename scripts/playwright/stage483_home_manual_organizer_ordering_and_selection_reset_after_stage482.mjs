import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE483_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE483_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE483_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE483_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE483_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE483_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage483-home-manual-organizer-ordering-and-selection-reset-after-stage482-failure.png',
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
try {
  desktopPage = await browser.newPage({ viewport: desktopViewport })
  await openHome(desktopPage)

  const homeWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage483-home-wide-top.png',
  )

  await enableManualMode(desktopPage)
  const collectionGroupOrderBefore = await getOrganizerGroupLabels(desktopPage)
  const collectionGroupLabelToMove = collectionGroupOrderBefore.at(-1)
  if (!collectionGroupLabelToMove) {
    throw new Error('Could not find a Home organizer group to reorder during the Stage 483 run.')
  }

  await desktopPage.getByRole('button', { name: `Move ${collectionGroupLabelToMove} earlier` }).click()
  await waitForCondition(async () => {
    const groupOrder = await getOrganizerGroupLabels(desktopPage)
    return groupOrder.indexOf(collectionGroupLabelToMove) === Math.max(0, collectionGroupOrderBefore.length - 2)
  }, 'The Home organizer group did not move earlier in manual mode.')
  const collectionGroupOrderAfter = await getOrganizerGroupLabels(desktopPage)

  const homeManualGroupsWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByRole('complementary', { name: 'Home browse strip' }),
    outputDir,
    'stage483-home-manual-groups-wide-top.png',
    980,
    'locator',
  )

  await ensureToggleButtonPressed(desktopPage, 'Recent')
  const activeRecentBranch = await selectHomeBrowseBranchWithMultipleSources(desktopPage)
  const branchSourceOrderBefore = await getOrganizerSourceTitles(activeRecentBranch.group)
  const branchSourceLabelToMove = branchSourceOrderBefore.at(-1)
  if (!branchSourceLabelToMove) {
    throw new Error('Could not find a Home branch source to reorder during the Stage 483 run.')
  }

  await desktopPage
    .getByRole('button', { name: `Move ${branchSourceLabelToMove} earlier in ${activeRecentBranch.groupLabel}` })
    .click()
  await waitForCondition(async () => {
    const sourceOrder = await getOrganizerSourceTitles(activeRecentBranch.group)
    return sourceOrder.indexOf(branchSourceLabelToMove) === Math.max(0, branchSourceOrderBefore.length - 2)
  }, 'The active Home branch source did not move earlier in manual mode.')
  const branchSourceOrderAfter = await getOrganizerSourceTitles(activeRecentBranch.group)

  const homeManualBranchWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    activeRecentBranch.group,
    outputDir,
    'stage483-home-manual-branch-wide-top.png',
    860,
    'locator',
  )

  const selectionGroupLabels = (await getOrganizerGroupLabels(desktopPage)).slice(0, 2)
  if (selectionGroupLabels.length < 2) {
    throw new Error('Could not find two organizer groups for the Stage 483 multi-selection capture.')
  }
  await selectOrganizerGroups(desktopPage, selectionGroupLabels)
  const selectionBar = desktopPage.getByRole('group', { name: 'Organizer selection bar' })
  await selectionBar.waitFor({ state: 'visible', timeout: 20000 })

  const homeOrganizerSelectionBarWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    selectionBar,
    outputDir,
    'stage483-home-organizer-selection-bar-wide-top.png',
    220,
    'locator',
  )

  await writeFile(
    path.join(
      outputDir,
      'stage483-home-manual-organizer-ordering-and-selection-reset-after-stage482-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        branchSourceOrder: {
          after: branchSourceOrderAfter,
          before: branchSourceOrderBefore,
          branchLabel: activeRecentBranch.groupLabel,
          movedSourceLabel: branchSourceLabelToMove,
        },
        captures: {
          homeManualBranchWideTop,
          homeManualGroupsWideTop,
          homeOrganizerSelectionBarWideTop,
          homeWideTop,
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
        validationFocus: [
          'wide desktop Home should now expose a real Manual organizer mode instead of treating the left rail as a passive sort shell',
          'manual mode should visibly reorder top-level organizer groups and the active branch source rows',
          'desktop modifier selection should surface a bottom organizer selection bar so the left rail feels like an active work surface',
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
          'stage483-home-manual-organizer-ordering-and-selection-reset-after-stage482-failure.png',
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
    throw new Error('Could not find any Home organizer groups during the Stage 483 run.')
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

  throw new Error('Could not find a Home organizer branch with visible source rows during the Stage 483 run.')
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

  throw new Error('Could not derive a source title from an organizer source button.')
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
