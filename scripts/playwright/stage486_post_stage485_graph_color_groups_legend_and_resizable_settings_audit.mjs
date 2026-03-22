import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE486_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE486_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE486_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE486_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE486_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE486_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage486-post-stage485-graph-color-groups-legend-and-resizable-settings-audit-failure.png'),
  { force: true },
)
await rm(
  path.join(outputDir, 'stage486-post-stage485-graph-color-groups-legend-and-resizable-settings-audit-failure-reader.png'),
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
  await openHome(desktopPage)

  const homeWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage486-home-wide-top.png')

  await desktopPage.getByRole('tab', { name: 'Graph', exact: true }).click()
  await desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(350)

  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage486-graph-wide-top.png')

  await desktopPage.getByRole('button', { name: 'Show settings' }).click()
  const graphRail = desktopPage.getByRole('complementary', { name: 'Graph settings sidebar' }).first()
  await graphRail.waitFor({ state: 'visible', timeout: 20000 })

  const graphSettingsGroupsWideTop = await captureViewportScreenshot(
    desktopPage,
    outputDir,
    'stage486-graph-settings-groups-wide-top.png',
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
    'stage486-graph-resized-settings-wide-top.png',
  )

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
    'stage486-graph-legend-filtered-wide-top.png',
  )

  desktopReaderPage = await browser.newPage({ viewport: desktopViewport })
  const { sourceTitle } = await openOriginalReaderFromHome(desktopReaderPage)
  const readerOriginalWideTop = await captureViewportScreenshot(
    desktopReaderPage,
    outputDir,
    'stage486-reader-original-wide-top.png',
  )

  await writeFile(
    path.join(
      outputDir,
      'stage486-post-stage485-graph-color-groups-legend-and-resizable-settings-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Graph is audited first after the Stage 485 color-groups, legend, and resizable-settings reset',
          'Graph should now expose explicit group ownership, a live legend, and a widenable settings drawer while preserving the canvas-first shell',
          'Home and original-only Reader remain regression surfaces, and generated-content Reader views stay locked out of scope',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphLegendFilteredWideTop,
          graphResizedSettingsWideTop,
          graphSettingsGroupsWideTop,
          graphWideTop,
          homeWideTop,
          readerOriginalWideTop,
        },
        desktopViewport,
        graphSettingsDrawer: {
          widthAfterResize: graphSettingsDrawerWidthAfter,
          widthBeforeResize: graphSettingsDrawerWidthBefore,
        },
        headless,
        legendFilter: legendFilter.drawerLabel,
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
        path: path.join(outputDir, 'stage486-post-stage485-graph-color-groups-legend-and-resizable-settings-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (desktopReaderPage && desktopReaderPage !== desktopPage) {
    await desktopReaderPage
      .screenshot({
        path: path.join(outputDir, 'stage486-post-stage485-graph-color-groups-legend-and-resizable-settings-audit-failure-reader.png'),
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
  await page.waitForTimeout(500)
  const homeControlSeam = page.locator('[aria-label="Home control seam"]').first()
  if (!(await homeControlSeam.isVisible().catch(() => false))) {
    const homeTab = page.getByRole('tab', { name: 'Home', exact: true }).first()
    if (await homeTab.isVisible().catch(() => false)) {
      await homeTab.click()
    }
  }
  await page.locator('.recall-home-workspace').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function openReaderFromHome(page) {
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
  await page.waitForTimeout(350)
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
  if ((await originalTab.getAttribute('aria-selected')) !== 'true') {
    await originalTab.click()
    await page.waitForTimeout(250)
  }
  if ((await originalTab.getAttribute('aria-selected')) !== 'true') {
    throw new Error('Could not switch Reader into Original view for the Stage 486 audit.')
  }
  await page.waitForTimeout(250)
  return { sourceTitle }
}

async function dragGraphSettingsResizeHandle(page, { deltaX }) {
  const resizeHandle = page.getByRole('separator', { name: 'Resize graph settings sidebar' }).first()
  const handleBox = await resizeHandle.boundingBox()
  if (!handleBox) {
    throw new Error('Could not measure the Graph settings resize handle during the Stage 486 audit.')
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

  throw new Error('Could not find a visible Graph legend filter during the Stage 486 audit.')
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
