import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE564_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE564_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE564_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE564_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE564_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE564_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage564-post-stage563-home-structural-recall-parity-audit-failure.png'),
  { force: true },
)
await rm(
  path.join(outputDir, 'stage564-post-stage563-home-structural-recall-parity-audit-failure-reader.png'),
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
  const homeEvidence = await captureHomeStructuralParityAudit(page, outputDir, 'stage564')

  await openGraph(page)
  const graphWideTop = await captureViewportScreenshot(page, outputDir, 'stage564-graph-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage564')

  await writeFile(
    path.join(
      outputDir,
      'stage564-post-stage563-home-structural-recall-parity-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 563 structural Recall-parity reset',
          'the Home surface should keep the collection rail, compact top-right utility cluster, and date-grouped canvas while advanced controls stay secondary',
          'Graph and original-only Reader remain the regression surfaces for the shared shell after the Home-only reset',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          ...homeEvidence.captures,
          graphWideTop,
          readerOriginalWideTop: readerEvidence.capture,
        },
        desktopViewport,
        headless,
        homeMetrics: homeEvidence.metrics,
        readerSourceTitle: readerEvidence.sourceTitle,
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
        path: path.join(outputDir, 'stage564-post-stage563-home-structural-recall-parity-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (readerPage && readerPage !== page) {
    await readerPage
      .screenshot({
        path: path.join(outputDir, 'stage564-post-stage563-home-structural-recall-parity-audit-failure-reader.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function captureHomeStructuralParityAudit(page, directory, stagePrefix) {
  await openHome(page)

  const rail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  const canvas = page.getByRole('region', { name: 'Home collection canvas' }).first()
  await rail.waitFor({ state: 'visible', timeout: 20000 })
  await canvas.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)

  const toolbarActions = canvas.locator('.recall-home-parity-toolbar-actions-stage563').first()
  const toolbarActionCount = await toolbarActions.evaluate((node) => node.children.length)
  const addTile = canvas.getByRole('button', { name: /Add content to/i }).first()
  const addTileBox = await addTile.boundingBox()
  const dayGroups = await getVisibleLocators(canvas, '.recall-home-parity-day-group-stage563')
  const dayLabels = []
  for (const group of dayGroups.slice(0, 3)) {
    dayLabels.push((((await group.locator('h3').first().textContent()) ?? '').trim()))
  }

  if (toolbarActionCount !== 4) {
    throw new Error(`Expected 4 compact Home toolbar controls in the Stage 564 audit, found ${toolbarActionCount}.`)
  }
  if (!dayLabels.length) {
    throw new Error('The Stage 564 audit could not find any visible Home day groups.')
  }
  if (!addTileBox || addTileBox.height < 180) {
    throw new Error(`Home Add Content tile measured ${addTileBox ? addTileBox.height : 'null'}px tall; the canvas lead tile regressed.`)
  }

  await clickRailSection(rail, 'Web')
  await expectVisibleText(canvas.getByRole('heading', { name: 'Web', level: 2 }), 'Web canvas heading')
  const webCardBox = await canvas.getByRole('button', { name: 'Open Stage 10 Debug Article' }).first().boundingBox()
  if (!webCardBox) {
    throw new Error('The Stage 564 audit could not measure the Web card after changing the selected rail section.')
  }

  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)
  const homeRail = await captureLocatorTopScreenshot(page, rail, directory, `${stagePrefix}-home-collection-rail.png`, 980)
  const homeCanvas = await captureLocatorTopScreenshot(page, canvas, directory, `${stagePrefix}-home-collection-canvas.png`, 980)

  return {
    captures: {
      homeCanvas,
      homeRail,
      homeWideTop,
    },
    metrics: {
      addTileHeight: roundMetric(addTileBox.height),
      dayLabels,
      toolbarActionCount,
      webCardWidth: roundMetric(webCardBox.width),
    },
  }
}

async function openGraph(page) {
  const response = await page.goto(`${baseUrl}/recall?section=graph`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Graph navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function openHome(page) {
  const response = await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Home navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.locator('.recall-home-workspace').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('region', { name: 'Home collection canvas' }).first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function openOriginalReaderFromHome(page, directory, stagePrefix) {
  await openHome(page)
  const rail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  const capturesSectionButton = rail
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: 'Captures' })
    .first()
  if (await capturesSectionButton.isVisible().catch(() => false)) {
    await clickRailSection(rail, 'Captures')
    await expectVisibleText(page.getByRole('heading', { name: 'Captures', level: 2 }).first(), 'Captures canvas heading')
  }

  const sourceButton = page.locator('.recall-home-parity-card-stage563, .recall-home-parity-list-row-stage563').first()
  await sourceButton.waitFor({ state: 'visible', timeout: 20000 })
  const sourceTitle =
    ((await sourceButton.locator('strong').first().textContent().catch(() => '')) ?? '').trim() ||
    (((await sourceButton.getAttribute('aria-label')) ?? '').replace(/^Open\s+/i, '').trim()) ||
    'Home source'
  await sourceButton.click()
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('button', { name: 'Open in Reader' }).click()
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
    throw new Error('Could not keep Reader in Original mode for the Stage 564 audit.')
  }

  const capture = await captureViewportScreenshot(page, directory, `${stagePrefix}-reader-original-wide-top.png`)
  return { capture, sourceTitle }
}

async function clickRailSection(rail, label) {
  const buttons = await getVisibleLocators(rail, '.recall-home-parity-rail-button-stage563')
  for (const button of buttons) {
    const text = ((await button.textContent()) ?? '').replace(/\s+/g, ' ').trim()
    if (text.includes(label)) {
      await button.click()
      await rail.page().waitForTimeout(250)
      return
    }
  }
  throw new Error(`Could not find the "${label}" collection rail button.`)
}

async function expectVisibleText(locator, label) {
  await locator.waitFor({ state: 'visible', timeout: 20000 })
  const text = ((await locator.textContent()) ?? '').trim()
  if (!text) {
    throw new Error(`Expected visible text for ${label}, but the locator was empty.`)
  }
  return text
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

function roundMetric(value) {
  return Math.round(value * 100) / 100
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
