import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE495_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE495_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE495_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE495_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE495_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE495_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const multiSelectModifier = process.platform === 'darwin' ? 'Meta' : 'Control'
const desktopViewport = {
  width: 1600,
  height: 1080,
}

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage495-home-custom-collection-management-reset-after-stage494-failure.png',
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
  const captures = await captureHomeCollectionWorkflow(
    desktopPage,
    outputDir,
    'stage495',
    'Stage 495 run',
    'Working set',
    'Pinned work lane',
  )

  await writeFile(
    path.join(
      outputDir,
      'stage495-home-custom-collection-management-reset-after-stage494-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: captures.paths,
        collection: {
          initialName: captures.initialCollectionName,
          renamedName: captures.renamedCollectionName,
          selectedSourceCount: captures.selectedSourceTitles.length,
          selectedSourceTitles: captures.selectedSourceTitles,
          untaggedSourceCount: captures.untaggedSourceCount,
        },
        desktopViewport,
        headless,
        runtimeBrowser,
        validationFocus: [
          'wide desktop Home should now support real custom collection creation from the organizer workbench',
          'bulk assignment should happen inside the organizer itself, with an explicit untagged lane for sources outside custom collections',
          'the renamed custom collection should still drive the right-side board without reviving detached shelf layouts',
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
          'stage495-home-custom-collection-management-reset-after-stage494-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function captureHomeCollectionWorkflow(page, directory, prefix, stageLabel, initialCollectionName, renamedCollectionName) {
  await openHome(page)
  await ensureToggleButtonPressed(page, 'Collections')
  await clearHomeSearch(page)

  const browseStrip = page.getByRole('complementary', { name: 'Home browse strip' })
  const primaryFlow = page.getByRole('region', { name: 'Primary saved source flow' })
  const homeWideTop = await captureViewportScreenshot(page, directory, `${prefix}-home-wide-top.png`)
  const homeCollectionsOverviewWideTop = await captureLocatorTopScreenshot(
    page,
    browseStrip,
    directory,
    `${prefix}-home-collections-overview-wide-top.png`,
    980,
    'locator',
  )

  await browseStrip.getByRole('button', { name: /^New collection/ }).click()
  await browseStrip.getByRole('group', { name: 'Collection management' }).waitFor({ state: 'visible', timeout: 20000 })
  await browseStrip.getByRole('textbox', { name: 'Collection name' }).fill(initialCollectionName)
  const homeCreateCollectionStateWideTop = await captureLocatorTopScreenshot(
    page,
    browseStrip,
    directory,
    `${prefix}-home-create-collection-state-wide-top.png`,
    980,
    'locator',
  )
  await browseStrip.getByRole('button', { name: 'Create collection' }).click()

  const initialCollectionButton = browseStrip.getByRole('button', {
    name: new RegExp(`^${escapeRegExp(initialCollectionName)}`, 'i'),
  })
  await initialCollectionButton.waitFor({ state: 'visible', timeout: 20000 })

  const untaggedButton = browseStrip.getByRole('button', { name: /^Untagged/i })
  await untaggedButton.click()
  await page.waitForTimeout(250)

  const untaggedSourceButtons = await getVisibleOrganizerSourceButtons(browseStrip)
  if (untaggedSourceButtons.length < 2) {
    throw new Error(`${stageLabel} could not find two visible untagged source rows for bulk assignment.`)
  }
  const selectedSourceButtons = untaggedSourceButtons.slice(0, 2)
  const selectedSourceTitles = []
  for (const button of selectedSourceButtons) {
    selectedSourceTitles.push(await getSourceTitle(button))
  }

  const homeUntaggedBranchWideTop = await captureLocatorTopScreenshot(
    page,
    browseStrip,
    directory,
    `${prefix}-home-untagged-branch-wide-top.png`,
    980,
    'locator',
  )

  for (const button of selectedSourceButtons) {
    await button.click({ modifiers: [multiSelectModifier] })
    await page.waitForTimeout(120)
  }

  const selectionBar = browseStrip.getByRole('group', { name: 'Organizer selection bar' })
  await selectionBar.waitFor({ state: 'visible', timeout: 20000 })
  await selectionBar.getByRole('button', { name: 'Add to collections' }).click()

  const assignmentPanel = browseStrip.getByRole('group', { name: 'Collection assignment panel' })
  await assignmentPanel.waitFor({ state: 'visible', timeout: 20000 })
  const homeCollectionAssignmentWideTop = await captureLocatorTopScreenshot(
    page,
    browseStrip,
    directory,
    `${prefix}-home-collection-assignment-state-wide-top.png`,
    980,
    'locator',
  )

  await browseStrip.getByRole('button', { name: new RegExp(`^Add ${escapeRegExp(initialCollectionName)}$`) }).click()
  await initialCollectionButton.click()
  await page.waitForTimeout(250)

  for (const sourceTitle of selectedSourceTitles) {
    await browseStrip
      .getByRole('button', { name: new RegExp(`^Open ${escapeRegExp(sourceTitle)} from organizer$`) })
      .waitFor({ state: 'visible', timeout: 20000 })
  }

  await browseStrip.getByRole('button', { name: 'Rename collection' }).click()
  const collectionNameField = browseStrip.getByRole('textbox', { name: 'Collection name' })
  await collectionNameField.fill(renamedCollectionName)
  await browseStrip.getByRole('button', { name: 'Save name' }).click()

  const renamedCollectionButton = browseStrip.getByRole('button', {
    name: new RegExp(`^${escapeRegExp(renamedCollectionName)}`, 'i'),
  })
  await renamedCollectionButton.waitFor({ state: 'visible', timeout: 20000 })
  await renamedCollectionButton.click()
  await page.waitForTimeout(250)

  for (const sourceTitle of selectedSourceTitles) {
    await browseStrip
      .getByRole('button', { name: new RegExp(`^Open ${escapeRegExp(sourceTitle)} from organizer$`) })
      .waitFor({ state: 'visible', timeout: 20000 })
  }
  await waitForCondition(
    async () => (await getVisibleBoardSourceTitles(primaryFlow)).length >= selectedSourceTitles.length,
    `${stageLabel} did not show the renamed custom collection on the right-side board.`,
  )

  const homeRenamedCustomCollectionBoardWideTop = await captureViewportScreenshot(
    page,
    directory,
    `${prefix}-home-renamed-custom-collection-board-wide-top.png`,
  )

  return {
    initialCollectionName,
    paths: {
      homeCollectionAssignmentWideTop,
      homeCollectionsOverviewWideTop,
      homeCreateCollectionStateWideTop,
      homeRenamedCustomCollectionBoardWideTop,
      homeUntaggedBranchWideTop,
      homeWideTop,
    },
    renamedCollectionName,
    selectedSourceTitles,
    untaggedSourceCount: untaggedSourceButtons.length,
  }
}

async function openHome(page) {
  await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await page.getByRole('region', { name: 'Primary saved source flow' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('searchbox', { name: 'Search saved sources' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function ensureToggleButtonPressed(page, name) {
  const button = page.getByRole('button', { name, exact: true }).first()
  await button.waitFor({ state: 'visible', timeout: 20000 })
  if ((await button.getAttribute('aria-pressed')) !== 'true') {
    await button.click()
    await page.waitForTimeout(250)
  }
}

async function clearHomeSearch(page) {
  const searchbox = page.getByRole('searchbox', { name: 'Search saved sources' })
  await searchbox.waitFor({ state: 'visible', timeout: 20000 })
  if ((await searchbox.inputValue()).trim().length > 0) {
    await searchbox.fill('')
    await page.waitForTimeout(250)
  }
}

async function getVisibleOrganizerSourceButtons(browseStrip) {
  const sourceButtons = browseStrip.locator('button[aria-label$="from organizer"]')
  const buttonCount = await sourceButtons.count()
  const visibleButtons = []
  for (let index = 0; index < buttonCount; index += 1) {
    const button = sourceButtons.nth(index)
    if (await button.isVisible().catch(() => false)) {
      visibleButtons.push(button)
    }
  }
  return visibleButtons
}

async function getVisibleBoardSourceTitles(primaryFlow) {
  const buttonLocators = [
    primaryFlow.locator('[aria-label="Saved library"] button[aria-label^="Open "]'),
    primaryFlow.locator('[aria-label="Saved library overview"] button[aria-label^="Open "]'),
  ]
  for (const locator of buttonLocators) {
    const count = await locator.count()
    if (!count) {
      continue
    }
    const titles = []
    for (let index = 0; index < count; index += 1) {
      const button = locator.nth(index)
      if (await button.isVisible().catch(() => false)) {
        titles.push(await getSourceTitle(button))
      }
    }
    if (titles.length) {
      return titles
    }
  }
  return []
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

async function waitForCondition(callback, message, timeoutMs = 20000, intervalMs = 150) {
  const startTime = Date.now()
  while (Date.now() - startTime < timeoutMs) {
    if (await callback()) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
  throw new Error(message)
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
