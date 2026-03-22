import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE485_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE485_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE485_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE485_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE485_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE485_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage485-graph-color-groups-legend-and-resizable-settings-reset-after-stage484-failure.png'),
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

  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage485-graph-wide-top.png')

  const graphLegend = desktopPage.getByRole('group', { name: 'Graph legend' }).first()
  await graphLegend.waitFor({ state: 'visible', timeout: 20000 })
  const initialLegendHeading = await readGraphLegendHeading(graphLegend)
  if (!initialLegendHeading.includes('Source groups')) {
    throw new Error(`Expected the default Stage 485 legend to start in Source groups mode, received "${initialLegendHeading}".`)
  }

  await desktopPage.getByRole('button', { name: 'Show settings' }).click()
  const graphRail = desktopPage.getByRole('complementary', { name: 'Graph settings sidebar' }).first()
  await graphRail.waitFor({ state: 'visible', timeout: 20000 })

  const graphSettingsGroupsWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage485-graph-settings-groups-wide-top.png',
  )

  const graphSettingsDrawerWidthBefore = await readGraphSettingsDrawerWidth(graphRail)
  await dragGraphSettingsResizeHandle(desktopPage, { deltaX: 112 })
  await desktopPage.waitForFunction(
    ({ minimumWidth, selector }) => {
      const rail = document.querySelector(selector)
      return Boolean(rail && parseFloat(getComputedStyle(rail).width) >= minimumWidth)
    },
    {
      minimumWidth: graphSettingsDrawerWidthBefore + 90,
      selector: '[aria-label="Graph settings sidebar"]',
    },
  )
  const graphSettingsDrawerWidthAfter = await readGraphSettingsDrawerWidth(graphRail)

  const graphResizedSettingsWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage485-graph-resized-settings-wide-top.png',
  )

  await graphRail.getByRole('button', { name: 'Node type' }).click()
  await desktopPage.waitForFunction(() => {
    const legend = document.querySelector('[aria-label="Graph legend"]')
    return Boolean(legend?.textContent?.includes('Node groups'))
  })
  const graphNodeGroupsWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage485-graph-node-groups-wide-top.png',
  )

  await graphRail.getByRole('button', { name: 'Source type' }).click()
  await desktopPage.waitForFunction(() => {
    const legend = document.querySelector('[aria-label="Graph legend"]')
    return Boolean(legend?.textContent?.includes('Source groups'))
  })

  const legendFilter = await getPreferredGraphLegendFilter(desktopPage, ['Captures', 'Web', 'Documents'])
  await legendFilter.legendButton.click()
  await desktopPage.waitForFunction(
    ({ label, legendSelector, railSelector }) => {
      const legend = document.querySelector(legendSelector)
      const railButton = Array.from(document.querySelectorAll(`${railSelector} button`)).find(
        (button) => button.textContent?.trim() === label,
      )
      return Boolean(
        legend?.querySelector('button[aria-pressed="true"]')?.textContent?.includes(label) &&
          railButton?.getAttribute('aria-pressed') === 'true',
      )
    },
    {
      label: legendFilter.drawerLabel,
      legendSelector: '[aria-label="Graph legend"]',
      railSelector: '[aria-label="Graph settings sidebar"]',
    },
  )

  const graphLegendFilteredWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage485-graph-legend-filtered-wide-top.png',
  )

  await writeFile(
    path.join(
      outputDir,
      'stage485-graph-color-groups-legend-and-resizable-settings-reset-after-stage484-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphLegendFilteredWideTop,
          graphNodeGroupsWideTop,
          graphResizedSettingsWideTop,
          graphSettingsGroupsWideTop,
          graphWideTop,
        },
        desktopViewport,
        graphLegend: {
          defaultHeading: initialLegendHeading,
          filteredLabel: legendFilter.drawerLabel,
        },
        graphSettingsDrawer: {
          widthAfterResize: graphSettingsDrawerWidthAfter,
          widthBeforeResize: graphSettingsDrawerWidthBefore,
        },
        headless,
        runtimeBrowser,
        validationFocus: [
          'wide desktop Graph should now expose explicit color-group ownership instead of relying on implicit node accents',
          'the graph legend should stay visible on the canvas and let the user toggle matching content filters directly',
          'the settings drawer should widen through the new resize handle without breaking the canvas-first layout',
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
        path: path.join(outputDir, 'stage485-graph-color-groups-legend-and-resizable-settings-reset-after-stage484-failure.png'),
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

async function dragGraphSettingsResizeHandle(page, { deltaX }) {
  const resizeHandle = page.getByRole('separator', { name: 'Resize graph settings sidebar' }).first()
  const handleBox = await resizeHandle.boundingBox()
  if (!handleBox) {
    throw new Error('Could not measure the Graph settings resize handle during the Stage 485 run.')
  }

  const startX = handleBox.x + handleBox.width / 2
  const startY = handleBox.y + handleBox.height / 2
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX + deltaX, startY, { steps: 18 })
  await page.mouse.up()
  await page.waitForTimeout(260)
}

async function readGraphSettingsDrawerWidth(graphRail) {
  return graphRail.evaluate((element) => Math.round(parseFloat(getComputedStyle(element).width)))
}

async function readGraphLegendHeading(graphLegend) {
  return graphLegend.locator('.recall-graph-browser-legend-head').innerText()
}

async function captureViewportScreenshot(page, directory, filename) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath })
  return screenshotPath
}

async function getPreferredGraphLegendFilter(page, labels) {
  const graphLegend = page.getByRole('group', { name: 'Graph legend' }).first()
  for (const label of labels) {
    const legendButton = graphLegend.getByRole('button', { name: new RegExp(label, 'i') }).first()
    if (await legendButton.isVisible().catch(() => false)) {
      return {
        drawerLabel: label,
        legendButton,
      }
    }
  }

  throw new Error('Could not find a visible Graph legend filter during the Stage 485 run.')
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
