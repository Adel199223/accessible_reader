import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE534_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE534_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE534_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE534_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE534_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE534_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage534-post-stage533-graph-steering-surfaces-audit-failure.png'),
  { force: true },
)
await rm(
  path.join(outputDir, 'stage534-post-stage533-graph-steering-surfaces-audit-failure-reader.png'),
  { force: true },
)

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)
const { browser, runtimeBrowser } = await launchBrowser(chromium)

let page
let readerPage
try {
  page = await browser.newPage({ viewport: desktopViewport })
  await openGraph(page)

  const graphWideTop = await captureViewportScreenshot(page, outputDir, 'stage534-graph-wide-top.png')

  const graphControlSeam = page.getByLabel('Graph control seam').first()
  await graphControlSeam.waitFor({ state: 'visible', timeout: 20000 })
  const graphControlCornerWideTop = await captureLocatorTopScreenshot(
    page,
    graphControlSeam,
    outputDir,
    'stage534-graph-control-corner-wide-top.png',
    220,
  )

  const graphLegend = page.getByRole('group', { name: 'Graph legend' }).first()
  await graphLegend.waitFor({ state: 'visible', timeout: 20000 })
  const graphLegendWideTop = await captureLocatorTopScreenshot(
    page,
    graphLegend,
    outputDir,
    'stage534-graph-legend-wide-top.png',
    320,
  )

  const graphFocusRail = page.getByLabel('Graph focus rail').first()
  await graphFocusRail.waitFor({ state: 'visible', timeout: 20000 })
  const graphFocusRailIdleWideTop = await captureLocatorTopScreenshot(
    page,
    graphFocusRail,
    outputDir,
    'stage534-graph-focus-rail-idle-wide-top.png',
    260,
  )
  const [primaryNodeLabel, secondaryNodeLabel] = await getVisibleNodeLabels(page, 2)

  await clickLegendButton(page, 'Captures')
  await waitForLegendButtonState(page, 'Captures', true)
  await waitForLegendResetVisible(page, true)
  const graphLegendFilteredWideTop = await captureLocatorTopScreenshot(
    page,
    graphLegend,
    outputDir,
    'stage534-graph-legend-filtered-wide-top.png',
    320,
  )

  await clickLegendReset(page)
  await waitForLegendButtonState(page, 'Captures', false)
  await waitForLegendResetVisible(page, false)

  await clickNode(page, primaryNodeLabel)
  await page.getByLabel('Node detail dock').first().waitFor({ state: 'visible', timeout: 20000 })
  const graphFocusRailSelectedWideTop = await captureLocatorTopScreenshot(
    page,
    graphFocusRail,
    outputDir,
    'stage534-graph-focus-rail-selected-wide-top.png',
    260,
  )

  await openGraph(page)
  const graphFocusRailReset = page.getByLabel('Graph focus rail').first()
  await graphFocusRailReset.waitFor({ state: 'visible', timeout: 20000 })
  const [pathStartNodeLabel, pathEndNodeLabel] = await getVisibleNodeLabels(page, 2)
  await clickNode(page, pathStartNodeLabel, { modifiers: ['Control'] })
  await page.getByRole('button', { name: 'Clear selection' }).waitFor({ state: 'visible', timeout: 20000 })
  await clickNode(page, pathEndNodeLabel, { modifiers: ['Control'] })
  await page.getByRole('button', { name: 'Find path' }).waitFor({ state: 'visible', timeout: 20000 })
  const graphFocusRailPathWideTop = await captureLocatorTopScreenshot(
    page,
    graphFocusRailReset,
    outputDir,
    'stage534-graph-focus-rail-path-wide-top.png',
    260,
  )

  await openHome(page)
  const homeWideTop = await captureViewportScreenshot(page, outputDir, 'stage534-home-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const { sourceTitle } = await openOriginalReaderFromHome(readerPage)
  const readerOriginalWideTop = await captureViewportScreenshot(
    readerPage,
    outputDir,
    'stage534-reader-original-wide-top.png',
  )

  await writeFile(
    path.join(outputDir, 'stage534-post-stage533-graph-steering-surfaces-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Graph is audited first after the Stage 533 steering-surfaces readability reset',
          'the control corner, live legend, and bottom focus rail should all read more clearly in default-state Graph work',
          'Home and original-only Reader remain regression surfaces, and generated-content Reader work stays locked out of scope',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphControlCornerWideTop,
          graphFocusRailIdleWideTop,
          graphFocusRailPathWideTop,
          graphFocusRailSelectedWideTop,
          graphLegendFilteredWideTop,
          graphLegendWideTop,
          graphWideTop,
          homeWideTop,
          readerOriginalWideTop,
        },
        desktopViewport,
        headless,
        nodeLabels: {
          pathEnd: pathEndNodeLabel,
          pathStart: pathStartNodeLabel,
          selected: primaryNodeLabel,
        },
        runtimeBrowser,
        sourceTitle,
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  if (page) {
    await page
      .screenshot({
        path: path.join(outputDir, 'stage534-post-stage533-graph-steering-surfaces-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (readerPage && readerPage !== page) {
    await readerPage
      .screenshot({
        path: path.join(outputDir, 'stage534-post-stage533-graph-steering-surfaces-audit-failure-reader.png'),
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

async function openHome(page) {
  const response = await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Home audit navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.locator('.recall-home-workspace').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function openOriginalReaderFromHome(page) {
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
  await page.waitForTimeout(300)
  const sourceWorkspace = page.getByRole('region', { name: `${sourceTitle} workspace` })
  await sourceWorkspace.getByRole('tab', { name: 'Source workspace Reader' }).click()
  await page.waitForURL(/\/reader/, { timeout: 20000 })
  await page.locator('article').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(300)

  const originalTab = page.getByRole('tab', { name: 'Original', exact: true }).first()
  await originalTab.waitFor({ state: 'visible', timeout: 20000 })
  if ((await originalTab.getAttribute('aria-selected')) !== 'true') {
    await originalTab.click()
    await page.waitForTimeout(250)
  }
  if ((await originalTab.getAttribute('aria-selected')) !== 'true') {
    throw new Error('Could not switch Reader into Original view for the Stage 534 audit.')
  }
  return { sourceTitle }
}

async function clickNode(page, nodeLabel, options = {}) {
  const nodeButton = page.getByRole('button', { name: `Select node ${nodeLabel}` }).first()
  await nodeButton.waitFor({ state: 'visible', timeout: 20000 })
  await nodeButton.click(options)
  await page.waitForTimeout(250)
}

async function getVisibleNodeLabels(page, limit) {
  const labels = await page.locator('button[aria-label^="Select node "]').evaluateAll((buttons, requestedLimit) => {
    return buttons
      .map((button) => button.getAttribute('aria-label')?.replace(/^Select node\s+/, '').trim() ?? '')
      .filter(Boolean)
      .slice(0, requestedLimit)
  }, limit)
  if (labels.length < limit) {
    throw new Error(`Expected at least ${limit} visible graph nodes but found ${labels.length}.`)
  }
  return labels
}

async function clickLegendButton(page, label) {
  const button = page.getByRole('group', { name: 'Graph legend' }).getByRole('button', { name: new RegExp(label, 'i') }).first()
  await button.waitFor({ state: 'visible', timeout: 20000 })
  await button.click()
  await page.waitForTimeout(200)
}

async function clickLegendReset(page) {
  const resetButton = page.getByRole('group', { name: 'Graph legend' }).getByRole('button', { name: 'Show all groups' }).first()
  await resetButton.waitFor({ state: 'visible', timeout: 20000 })
  await resetButton.click()
  await page.waitForTimeout(200)
}

async function waitForLegendButtonState(page, label, expectedPressed) {
  await page.waitForFunction(
    ({ expectedPressed: expectedState, label: expectedLabel }) => {
      const legend = document.querySelector('[aria-label="Graph legend"]')
      const buttons = Array.from(legend?.querySelectorAll('button') ?? [])
      const match = buttons.find((button) => button.textContent?.includes(expectedLabel))
      return Boolean(match && match.getAttribute('aria-pressed') === String(expectedState))
    },
    { expectedPressed, label },
  )
}

async function waitForLegendResetVisible(page, expectedVisible) {
  await page.waitForFunction((expectedState) => {
    const legend = document.querySelector('[aria-label="Graph legend"]')
    const buttons = Array.from(legend?.querySelectorAll('button') ?? [])
    const resetButton = buttons.find((button) => button.textContent?.trim() === 'Show all groups')
    return expectedState ? Boolean(resetButton) : !resetButton
  }, expectedVisible)
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

async function getVisibleLocator(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first()
    if (await locator.isVisible().catch(() => false)) {
      return locator
    }
  }
  throw new Error(`Could not find a visible locator for any of: ${selectors.join(', ')}`)
}

async function getSourceTitle(sourceButton) {
  const ariaLabel = await sourceButton.getAttribute('aria-label')
  if (ariaLabel?.startsWith('Open ')) {
    return ariaLabel.replace(/^Open\s+/, '').trim()
  }
  const text = (await sourceButton.innerText()).trim()
  if (text) {
    return text.split('\n')[0].trim()
  }
  return 'Saved source'
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
