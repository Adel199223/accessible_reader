import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE498_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE498_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE498_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE498_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE498_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE498_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage498-graph-filter-query-and-visibility-controls-reset-after-stage497-closeout-failure.png'),
  { force: true },
)

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)
const { browser, runtimeBrowser } = await launchBrowser(chromium)

let desktopPage
try {
  desktopPage = await browser.newPage({ viewport: desktopViewport })
  await openGraph(desktopPage)

  const graphWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage498-graph-wide-top.png',
  )

  const graphRail = await openGraphSettings(desktopPage)
  await normalizeGraphView(desktopPage, graphRail)

  await scrollGraphRailToTop(desktopPage)
  const graphSettingsDefaultWideTop = await captureLocatorTopScreenshot(
    pageOrLocatorPage(graphRail),
    graphRail,
    outputDir,
    'stage498-graph-settings-default-wide-top.png',
  )

  const queryTargetLabel = await getFirstVisibleGraphNodeLabel(desktopPage)
  const filterQuery = `search:${buildGraphSearchToken(queryTargetLabel)}`
  const graphFilterInput = graphRail.getByRole('searchbox', { name: 'Filter graph' })
  await graphFilterInput.fill(filterQuery)
  await waitForFilterQueryState(desktopPage, filterQuery)

  await scrollGraphSectionIntoView(desktopPage, 'Filter query')
  const graphBoundedQueryWideTop = await captureLocatorTopScreenshot(
    pageOrLocatorPage(graphRail),
    graphRail,
    outputDir,
    'stage498-graph-bounded-query-wide-top.png',
  )

  await scrollGraphSectionIntoView(desktopPage, 'Visibility')
  await clickGraphRailButton(desktopPage, 'Reference content')
  await waitForToggleState(desktopPage, 'Reference content', false)
  await waitForVisibilitySummary(desktopPage, ['Reference content hidden'])

  await scrollGraphSectionIntoView(desktopPage, 'Visibility')
  const graphVisibilityControlsWideTop = await captureLocatorTopScreenshot(
    pageOrLocatorPage(graphRail),
    graphRail,
    outputDir,
    'stage498-graph-visibility-controls-wide-top.png',
  )

  const savedPresetName = `Filter audit ${Date.now()}`
  const presetNameInput = graphRail.getByLabel('Graph preset name')
  await presetNameInput.fill(savedPresetName)
  await graphRail.getByRole('button', { name: 'Save new preset' }).click()
  await waitForSavedPresetState(desktopPage, savedPresetName, true)
  await waitForPresetStatusNote(desktopPage, new RegExp(`${escapeRegExp(savedPresetName)} is active and ready to reuse\\.`, 'i'))

  await graphRail.getByRole('button', { name: 'Explore' }).click()
  await waitForStarterPresetState(desktopPage, 'Explore')
  await graphRail.getByRole('button', { name: new RegExp(escapeRegExp(savedPresetName), 'i') }).click()
  await waitForSavedPresetState(desktopPage, savedPresetName, true)
  await waitForFilterQueryValue(desktopPage, filterQuery)
  await waitForToggleState(desktopPage, 'Reference content', false)

  await scrollGraphRailToTop(desktopPage)
  const graphSavedViewReapplyWideTop = await captureLocatorTopScreenshot(
    pageOrLocatorPage(graphRail),
    graphRail,
    outputDir,
    'stage498-graph-saved-view-reapply-wide-top.png',
  )

  await writeFile(
    path.join(outputDir, 'stage498-graph-filter-query-and-visibility-controls-reset-after-stage497-closeout-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphBoundedQueryWideTop,
          graphSavedViewReapplyWideTop,
          graphSettingsDefaultWideTop,
          graphVisibilityControlsWideTop,
          graphWideTop,
        },
        desktopViewport,
        graphFilterWorkflow: {
          filterQuery,
          queryTargetLabel,
          savedPresetName,
          visibilityState: {
            showLeafNodes: true,
            showReferenceNodes: false,
            showUnconnectedNodes: true,
          },
        },
        headless,
        runtimeBrowser,
        validationFocus: [
          'wide desktop Graph should now expose a bounded filter-query workflow instead of only plain substring filtering',
          'explicit visibility controls should read like real graph-management toggles inside the settings sidebar, including the reference-content fallback',
          'saved views should preserve the filter query and visibility choices when the user returns from the default Explore state',
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
        path: path.join(outputDir, 'stage498-graph-filter-query-and-visibility-controls-reset-after-stage497-closeout-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function openGraph(page) {
  await page.goto(`${baseUrl}/recall?section=graph`, { waitUntil: 'networkidle' })
  await page.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function openGraphSettings(page) {
  const openSettingsButton = page.getByRole('button', { name: 'Show settings' }).first()
  const hideSettingsButton = page.getByRole('button', { name: 'Hide settings' }).first()
  if (await openSettingsButton.isVisible().catch(() => false)) {
    await openSettingsButton.click()
  } else {
    await hideSettingsButton.waitFor({ state: 'visible', timeout: 20000 })
  }

  const graphRail = page.getByRole('complementary', { name: 'Graph settings sidebar' }).first()
  await graphRail.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
  return graphRail
}

async function normalizeGraphView(page, graphRail) {
  const exploreButton = graphRail.getByRole('button', { name: 'Explore' }).first()
  await exploreButton.waitFor({ state: 'visible', timeout: 20000 })
  await exploreButton.click()
  await waitForStarterPresetState(page, 'Explore')

  const showAllButton = page.getByRole('button', { name: 'Show all' }).first()
  if (await showAllButton.isVisible().catch(() => false)) {
    await showAllButton.click()
    await page.waitForTimeout(250)
  }

  const graphFilterInput = graphRail.getByRole('searchbox', { name: 'Filter graph' })
  await graphFilterInput.waitFor({ state: 'visible', timeout: 20000 })
  if ((await graphFilterInput.inputValue()) !== '') {
    await graphFilterInput.fill('')
  }
  await waitForToggleState(page, 'Unconnected', true)
  await waitForToggleState(page, 'Leaf nodes', true)
  await waitForToggleState(page, 'Reference content', true)
}

async function captureViewportScreenshot(page, directory, filename) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath })
  return screenshotPath
}

async function captureLocatorTopScreenshot(page, locator, directory, filename, maxHeight = 980) {
  await locator.scrollIntoViewIfNeeded()
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  const box = await locator.boundingBox()
  if (!box) {
    throw new Error(`Could not measure locator bounds for ${filename}.`)
  }
  await page.screenshot({
    path: screenshotPath,
    clip: {
      x: Math.max(0, Math.floor(box.x)),
      y: Math.max(0, Math.floor(box.y)),
      width: Math.max(1, Math.floor(box.width)),
      height: Math.max(1, Math.floor(Math.min(box.height, maxHeight))),
    },
  })
  return screenshotPath
}

async function getFirstVisibleGraphNodeLabel(page) {
  const firstNodeButton = page.locator('button[aria-label^="Select node "]').first()
  await firstNodeButton.waitFor({ state: 'visible', timeout: 20000 })
  const ariaLabel = await firstNodeButton.getAttribute('aria-label')
  const nodeLabel = ariaLabel?.replace(/^Select node\s+/, '').trim()
  if (!nodeLabel) {
    throw new Error('Could not derive a graph node label for the Stage 498 filter-query validation.')
  }
  return nodeLabel
}

async function waitForFilterQueryState(page, filterQuery) {
  await page.waitForFunction(
    ({ filterQuery: expectedQuery }) => {
      const graphRail = document.querySelector('[aria-label="Graph settings sidebar"]')
      const input = graphRail?.querySelector('input[aria-label="Filter graph"]')
      const notes = Array.from(graphRail?.querySelectorAll('.recall-graph-sidebar-filter-note') ?? [])
      const statusText = document.body.textContent ?? ''
      return (
        input instanceof HTMLInputElement &&
        input.value === expectedQuery &&
        !statusText.includes('No nodes match that filter query.') &&
        (
          notes.some((note) => /matching\s+\d+\s+node/i.test(note.textContent ?? '')) ||
          statusText.includes('Filter query active')
        )
      )
    },
    { filterQuery },
  )
}

async function waitForFilterQueryValue(page, filterQuery) {
  await page.waitForFunction(
    ({ filterQuery: expectedQuery }) => {
      const graphRail = document.querySelector('[aria-label="Graph settings sidebar"]')
      const input = graphRail?.querySelector('input[aria-label="Filter graph"]')
      return input instanceof HTMLInputElement && input.value === expectedQuery
    },
    { filterQuery },
  )
}

async function waitForToggleState(page, buttonName, expectedPressed) {
  await page.waitForFunction(
    ({ buttonName: expectedName, expectedPressed: expectedState }) => {
      const buttons = Array.from(document.querySelectorAll('[aria-label="Graph settings sidebar"] button'))
      const match = buttons.find((button) => button.textContent?.trim() === expectedName)
      return Boolean(match && match.getAttribute('aria-pressed') === String(expectedState))
    },
    { buttonName, expectedPressed },
  )
}

async function waitForVisibilitySummary(page, summaries) {
  await page.waitForFunction(
    ({ summaries: expectedSummaries }) => {
      const graphRail = document.querySelector('[aria-label="Graph settings sidebar"]')
      const sectionText = graphRail?.textContent ?? ''
      return expectedSummaries.every((summary) => sectionText.includes(summary))
    },
    { summaries },
  )
}

async function waitForSavedPresetState(page, presetName, expectedPressed) {
  await page.waitForFunction(
    ({ expectedPressed: expectedState, presetName: expectedName }) => {
      const buttons = Array.from(document.querySelectorAll('[aria-label="Saved graph presets"] button'))
      const match = buttons.find((button) => button.textContent?.includes(expectedName))
      return Boolean(match && match.getAttribute('aria-pressed') === String(expectedState))
    },
    { expectedPressed, presetName },
  )
}

async function waitForStarterPresetState(page, presetName) {
  await page.waitForFunction(
    ({ presetName: expectedName }) => {
      const buttons = Array.from(document.querySelectorAll('[aria-label="Graph starter presets"] button'))
      const match = buttons.find((button) => button.textContent?.trim() === expectedName)
      return Boolean(match && match.getAttribute('aria-pressed') === 'true')
    },
    { presetName },
  )
}

async function waitForPresetStatusNote(page, pattern) {
  const graphRail = page.getByRole('complementary', { name: 'Graph settings sidebar' }).first()
  await graphRail.getByText(pattern).waitFor({ state: 'visible', timeout: 20000 })
}

async function clickGraphRailButton(page, buttonName) {
  await page.evaluate((requestedButtonName) => {
    const graphRail = document.querySelector('[aria-label="Graph settings sidebar"]')
    if (!(graphRail instanceof HTMLElement)) {
      throw new Error('Graph settings sidebar is not mounted.')
    }
    const button = Array.from(graphRail.querySelectorAll('button')).find(
      (candidate) => candidate.textContent?.trim() === requestedButtonName,
    )
    if (!(button instanceof HTMLButtonElement)) {
      throw new Error(`Could not find Graph settings button "${requestedButtonName}".`)
    }
    button.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    button.click()
  }, buttonName)
  await page.waitForTimeout(150)
}

async function scrollGraphSectionIntoView(page, sectionHeading) {
  await page.evaluate((requestedHeading) => {
    const graphRail = document.querySelector('[aria-label="Graph settings sidebar"]')
    if (!(graphRail instanceof HTMLElement)) {
      throw new Error('Graph settings sidebar is not mounted.')
    }
    const heading = Array.from(graphRail.querySelectorAll('*')).find(
      (candidate) => candidate.textContent?.trim() === requestedHeading,
    )
    if (!(heading instanceof HTMLElement)) {
      throw new Error(`Could not find Graph settings section "${requestedHeading}".`)
    }
    heading.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, sectionHeading)
  await page.waitForTimeout(150)
}

async function scrollGraphRailToTop(page) {
  await page.evaluate(() => {
    const graphRail = document.querySelector('[aria-label="Graph settings sidebar"]')
    if (graphRail instanceof HTMLElement) {
      graphRail.scrollTop = 0
    }
  })
  await page.waitForTimeout(150)
}

function pageOrLocatorPage(locator) {
  return locator.page()
}

function buildGraphSearchToken(nodeLabel) {
  const normalizedTokens = nodeLabel
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((token) => token.length >= 3)
  return normalizedTokens.at(-1) ?? nodeLabel.trim().toLowerCase()
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function resolveHarnessDir(candidatePath) {
  return candidatePath.startsWith('\\\\wsl.localhost\\')
    ? candidatePath.replace(/^\\\\wsl\.localhost\\[^\\]+/, '')
    : candidatePath
}

async function launchBrowser(chromium) {
  try {
    const browser = await chromium.launch({ channel: preferredChannel, headless })
    return { browser, runtimeBrowser: preferredChannel }
  } catch (error) {
    if (!allowChromiumFallback) {
      throw error
    }
    const browser = await chromium.launch({ headless })
    return { browser, runtimeBrowser: 'chromium' }
  }
}
