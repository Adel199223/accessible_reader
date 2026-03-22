import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE496_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE496_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE496_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE496_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE496_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE496_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const multiSelectModifier = process.platform === 'darwin' ? 'Meta' : 'Control'
const desktopViewport = {
  width: 1600,
  height: 1080,
}

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage496-post-stage495-home-custom-collection-management-audit-failure.png',
  ),
  { force: true },
)
await rm(
  path.join(
    outputDir,
    'stage496-post-stage495-home-custom-collection-management-audit-failure-reader.png',
  ),
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
  const homeCaptures = await captureHomeCollectionWorkflow(
    desktopPage,
    outputDir,
    'stage496',
    'Stage 496 audit',
    'Audit lane',
    'Audit route',
  )

  await desktopPage.goto(`${baseUrl}/recall?section=graph`, { waitUntil: 'networkidle' })
  await desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(350)
  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage496-graph-wide-top.png')

  desktopReaderPage = await browser.newPage({ viewport: desktopViewport })
  const { sourceTitle } = await openOriginalReaderFromHome(desktopReaderPage)
  const readerOriginalWideTop = await captureViewportScreenshot(
    desktopReaderPage,
    outputDir,
    'stage496-reader-original-wide-top.png',
  )

  await writeFile(
    path.join(
      outputDir,
      'stage496-post-stage495-home-custom-collection-management-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 495 custom collection management reset',
          'Home should now expose organizer-owned collection creation, bulk assignment, and an explicit untagged path without breaking the board-first workspace',
          'Graph and original-only Reader remain regression surfaces while generated-content Reader workflows stay locked out of scope',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphWideTop,
          ...homeCaptures.paths,
          readerOriginalWideTop,
        },
        collection: {
          initialName: homeCaptures.initialCollectionName,
          renamedName: homeCaptures.renamedCollectionName,
          selectedSourceCount: homeCaptures.selectedSourceTitles.length,
          selectedSourceTitles: homeCaptures.selectedSourceTitles,
          untaggedSourceCount: homeCaptures.untaggedSourceCount,
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
        path: path.join(
          outputDir,
          'stage496-post-stage495-home-custom-collection-management-audit-failure.png',
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
          'stage496-post-stage495-home-custom-collection-management-audit-failure-reader.png',
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
    throw new Error('Could not switch Reader into Original view for the Stage 496 audit.')
  }

  await page.waitForTimeout(250)
  return { sourceTitle }
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

async function getVisibleLocator(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first()
    if (await locator.isVisible().catch(() => false)) {
      return locator
    }
  }
  throw new Error(`Could not find a visible locator for selectors: ${selectors.join(', ')}`)
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
