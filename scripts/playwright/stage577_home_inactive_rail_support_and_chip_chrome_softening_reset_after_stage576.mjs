import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE577_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE577_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE577_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE577_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE577_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE577_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage575InactiveSupportFontSizeBaseline = 10.56
const stage575InactiveSupportAlphaBaseline = 0.58
const stage575InactiveCountFontSizeBaseline = 9.6
const stage575InactiveCountAlphaBaseline = 0.5
const stage575CardChipFontSizeBaseline = 8.64
const stage575CardChipAlphaBaseline = 0.6

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage577-home-inactive-rail-support-and-chip-chrome-softening-reset-after-stage576-failure.png',
  ),
  { force: true },
)

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)
const { browser, runtimeBrowser } = await launchBrowser(chromium)

let page
try {
  page = await browser.newPage({ viewport: desktopViewport })
  const homeEvidence = await captureHomeImplementation(page, outputDir, 'stage577')

  await writeFile(
    path.join(
      outputDir,
      'stage577-home-inactive-rail-support-and-chip-chrome-softening-reset-after-stage576-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: homeEvidence.captures,
        desktopViewport,
        headless,
        implementationFocus: [
          'Home keeps the Stage 563 selected-collection rail plus day-grouped canvas structure.',
          'The next polish pass should make inactive rail support lines quieter and lighten the remaining pill/chip chrome.',
          'The structure, toolbar ownership, and accessibility state should stay intact while the small chrome gets lighter.',
        ],
        metrics: homeEvidence.metrics,
        runtimeBrowser,
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
        path: path.join(
          outputDir,
          'stage577-home-inactive-rail-support-and-chip-chrome-softening-reset-after-stage576-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function captureHomeImplementation(page, directory, stagePrefix) {
  await openHome(page)

  const rail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  const canvas = page.locator('.recall-home-parity-canvas-stage563').first()
  const toolbar = canvas.locator('.recall-home-parity-toolbar-stage563').first()
  await rail.waitFor({ state: 'visible', timeout: 20000 })
  await canvas.waitFor({ state: 'visible', timeout: 20000 })
  await toolbar.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)

  const activeRailButton = rail.locator('.recall-home-parity-rail-button-active-stage563').first()
  await activeRailButton.waitFor({ state: 'visible', timeout: 20000 })
  const activeRailLabel = normalizeText(await activeRailButton.locator('strong').first().textContent())
  const activeRailSupportText = normalizeText(
    await activeRailButton.locator('.recall-home-parity-rail-button-copy-stage563 span').first().textContent(),
  )
  const canvasAriaLabel = (await canvas.getAttribute('aria-label')) ?? ''
  const inactiveRailButtons = await getVisibleLocators(rail, '.recall-home-parity-rail-button-inactive-stage575')
  const inactiveRailButtonCount = inactiveRailButtons.length
  const firstInactiveRailButton = inactiveRailButtons[0]
  const firstInactiveRailSupport = firstInactiveRailButton
    ? firstInactiveRailButton.locator('.recall-home-parity-rail-button-copy-stage563 span').first()
    : null
  const firstInactiveRailCount = firstInactiveRailButton
    ? firstInactiveRailButton.locator('.recall-home-parity-rail-count-stage563').first()
    : null
  const firstInactiveRailSupportStyles = firstInactiveRailSupport
    ? await firstInactiveRailSupport.evaluate((node) => {
        const styles = window.getComputedStyle(node)
        return {
          color: styles.color,
          fontSize: styles.fontSize,
        }
      })
    : null
  const firstInactiveRailCountStyles = firstInactiveRailCount
    ? await firstInactiveRailCount.evaluate((node) => {
        const styles = window.getComputedStyle(node)
        return {
          backgroundColor: styles.backgroundColor,
          borderTopColor: styles.borderTopColor,
          color: styles.color,
          fontSize: styles.fontSize,
        }
      })
    : null

  const primaryRowCount = await toolbar
    .locator('.recall-home-parity-toolbar-row-primary-stage567')
    .first()
    .evaluate((node) => node.children.length)
  const secondaryRowCount = await toolbar
    .locator('.recall-home-parity-toolbar-row-secondary-stage567')
    .first()
    .evaluate((node) => node.children.length)
  const toolbarActionCount = primaryRowCount + secondaryRowCount

  if (canvasAriaLabel !== `${activeRailLabel} collection canvas`) {
    throw new Error(`Expected Home canvas aria-label "${activeRailLabel} collection canvas", received "${canvasAriaLabel}".`)
  }
  if (activeRailSupportText !== 'Local captures') {
    throw new Error(`Expected active selected-row support text "Local captures", received "${activeRailSupportText}".`)
  }
  if (inactiveRailButtonCount < 2) {
    throw new Error(`Expected at least two inactive rail rows, found ${inactiveRailButtonCount}.`)
  }
  if (toolbarActionCount !== 4 || primaryRowCount !== 2 || secondaryRowCount !== 2) {
    throw new Error(`Expected a 2+2 Home toolbar cluster, found ${primaryRowCount}+${secondaryRowCount}.`)
  }

  const inactiveSupportFontSize = parseFloat(firstInactiveRailSupportStyles?.fontSize ?? '0')
  const inactiveSupportAlpha = parseCssAlpha(firstInactiveRailSupportStyles?.color ?? '')
  if (
    !firstInactiveRailSupportStyles ||
    inactiveSupportFontSize >= stage575InactiveSupportFontSizeBaseline ||
    inactiveSupportAlpha >= stage575InactiveSupportAlphaBaseline
  ) {
    throw new Error(
      `Expected quieter inactive rail support styling below the Stage 575 baseline, received ${JSON.stringify(firstInactiveRailSupportStyles)}.`,
    )
  }

  const inactiveCountFontSize = parseFloat(firstInactiveRailCountStyles?.fontSize ?? '0')
  const inactiveCountAlpha = parseCssAlpha(firstInactiveRailCountStyles?.color ?? '')
  if (
    !firstInactiveRailCountStyles ||
    inactiveCountFontSize >= stage575InactiveCountFontSizeBaseline ||
    inactiveCountAlpha >= stage575InactiveCountAlphaBaseline
  ) {
    throw new Error(
      `Expected lighter inactive rail count styling below the Stage 575 baseline, received ${JSON.stringify(firstInactiveRailCountStyles)}.`,
    )
  }

  const visibleDayGroupCountNodeCount = await canvas.locator('.recall-home-parity-day-group-header-stage563 span').count()
  const firstDayGroup = canvas.locator('.recall-home-parity-day-group-stage563').first()
  const firstDayGroupAriaLabel = (await firstDayGroup.getAttribute('aria-label')) ?? ''
  if (visibleDayGroupCountNodeCount !== 0) {
    throw new Error(`Expected no visible day-group count nodes, found ${visibleDayGroupCountNodeCount}.`)
  }
  if (!/sources/i.test(firstDayGroupAriaLabel)) {
    throw new Error(`Expected first day-group aria-label to keep the source count context, received "${firstDayGroupAriaLabel}".`)
  }

  const representativeCard = canvas.locator('.recall-home-parity-card-stage563').first()
  await representativeCard.waitFor({ state: 'visible', timeout: 20000 })
  const cardChip = representativeCard.locator('.recall-home-parity-card-chip-stage563').first()
  await cardChip.waitFor({ state: 'visible', timeout: 20000 })
  const cardChipText = normalizeText(await cardChip.textContent())
  const cardChipStyles = await cardChip.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      backgroundColor: styles.backgroundColor,
      borderTopColor: styles.borderTopColor,
      color: styles.color,
      fontSize: styles.fontSize,
    }
  })
  const cardChipFontSize = parseFloat(cardChipStyles.fontSize)
  const cardChipAlpha = parseCssAlpha(cardChipStyles.color)
  if (cardChipText !== activeRailLabel) {
    throw new Error(`Expected representative card chip text "${activeRailLabel}", received "${cardChipText}".`)
  }
  if (cardChipFontSize >= stage575CardChipFontSizeBaseline || cardChipAlpha >= stage575CardChipAlphaBaseline) {
    throw new Error(`Expected lighter board-card chip styling below the Stage 575 baseline, received ${JSON.stringify(cardChipStyles)}.`)
  }

  const homeToolbarClosed = await captureLocatorTopScreenshot(page, toolbar, directory, `${stagePrefix}-home-toolbar-closed.png`, 210)
  const homeRail = await captureLocatorTopScreenshot(page, rail, directory, `${stagePrefix}-home-collection-rail.png`, 980)
  const homeCard = await captureLocatorScreenshot(page, representativeCard, directory, `${stagePrefix}-home-card.png`)
  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)

  return {
    captures: {
      homeCard,
      homeRail,
      homeToolbarClosed,
      homeWideTop,
    },
    metrics: {
      activeRailLabel,
      activeRailSupportText,
      canvasAriaLabel,
      cardChipStyles,
      firstDayGroupAriaLabel,
      firstInactiveRailCountStyles,
      firstInactiveRailSupportStyles,
      inactiveRailButtonCount,
      toolbarActionCount,
      visibleDayGroupCountNodeCount,
    },
  }
}

async function openHome(page) {
  const response = await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Home navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.locator('.recall-home-workspace').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('.recall-home-parity-canvas-stage563').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function getVisibleLocators(scope, selector) {
  const matches = scope.locator(selector)
  const visibleLocators = []
  const count = await matches.count()
  for (let index = 0; index < count; index += 1) {
    const locator = matches.nth(index)
    if (await locator.isVisible().catch(() => false)) {
      visibleLocators.push(locator)
    }
  }
  return visibleLocators
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

async function captureLocatorScreenshot(page, locator, directory, filename) {
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
      height: Math.max(1, Math.floor(box.height)),
    },
  })
  return screenshotPath
}

function normalizeText(value) {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

function parseCssAlpha(colorValue) {
  const match = colorValue.match(/rgba?\(([^)]+)\)/i)
  if (!match) {
    return 1
  }
  const parts = match[1].split(',').map((part) => part.trim())
  if (parts.length < 4) {
    return 1
  }
  return Number(parts[3])
}

function resolveHarnessDir(directory) {
  if (!path.isAbsolute(directory)) {
    return path.resolve(repoRoot, directory)
  }
  return directory
}

async function launchBrowser(chromium) {
  if (preferredChannel) {
    try {
      const browser = await chromium.launch({ channel: preferredChannel, headless })
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
