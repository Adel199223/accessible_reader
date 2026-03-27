import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE608_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE608_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE608_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE608_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE608_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE608_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage604TitleFontSizePxBaseline = 13.44
const stage604SourceFontSizePxBaseline = 9.76
const stage604ChipFontSizePxBaseline = 7.04
const stage602TitleFontSizePxCeiling = 14.24
const stage602SourceFontSizePxCeiling = 10.24
const stage602ChipFontSizePxCeiling = 7.52
const stage602CardHeightPxCeiling = 215.2

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage608-post-stage607-home-card-identity-seam-rebalance-audit-failure.png'),
  { force: true },
)
await rm(
  path.join(outputDir, 'stage608-post-stage607-home-card-identity-seam-rebalance-audit-failure-reader.png'),
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
  const homeEvidence = await captureHomeAudit(page, outputDir, 'stage608')

  await openGraph(page)
  const graphWideTop = await captureViewportScreenshot(page, outputDir, 'stage608-graph-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage608')

  await writeFile(
    path.join(outputDir, 'stage608-post-stage607-home-card-identity-seam-rebalance-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 607 card-identity seam rebalance pass',
          'the Home surface should keep the Stage 563 structure while making the lower title, source row, and collection chip slightly more legible beneath the poster',
          'Graph and original-only Reader remain regression surfaces only after the Home-only Stage 607 pass',
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
        path: path.join(outputDir, 'stage608-post-stage607-home-card-identity-seam-rebalance-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (readerPage && readerPage !== page) {
    await readerPage
      .screenshot({
        path: path.join(outputDir, 'stage608-post-stage607-home-card-identity-seam-rebalance-audit-failure-reader.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function captureHomeAudit(page, directory, stagePrefix) {
  await openHome(page)

  const canvas = page.locator('.recall-home-parity-canvas-stage563').first()
  await canvas.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)

  const representativeCard = canvas.locator('.recall-home-parity-card-stage603').first()
  await representativeCard.waitFor({ state: 'visible', timeout: 20000 })
  const representativeCardBox = await representativeCard.boundingBox()
  if (!representativeCardBox) {
    throw new Error('Expected measurable representative card bounds in the Stage 608 audit.')
  }

  const title = representativeCard.locator('.recall-home-parity-card-title-stage607').first()
  await title.waitFor({ state: 'visible', timeout: 20000 })
  const titleText = normalizeText(await title.textContent())
  const titleStyles = await title.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      lineHeight: styles.lineHeight,
    }
  })

  const source = representativeCard.locator('.recall-home-parity-card-source-stage607').first()
  await source.waitFor({ state: 'visible', timeout: 20000 })
  const sourceText = normalizeText(await source.textContent())
  const sourceStyles = await source.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      color: styles.color,
      fontSize: styles.fontSize,
    }
  })

  const chip = representativeCard.locator('.recall-home-parity-card-chip-stage607').first()
  await chip.waitFor({ state: 'visible', timeout: 20000 })
  const chipText = normalizeText(await chip.textContent())
  const chipStyles = await chip.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      paddingLeft: styles.paddingLeft,
      paddingRight: styles.paddingRight,
    }
  })

  const titleFontSizePx = Number.parseFloat(titleStyles.fontSize)
  const sourceFontSizePx = Number.parseFloat(sourceStyles.fontSize)
  const chipFontSizePx = Number.parseFloat(chipStyles.fontSize)
  const sourceAlpha = parseColorAlpha(sourceStyles.color)
  const chipAlpha = parseColorAlpha(chipStyles.color)

  if (!(titleFontSizePx > stage604TitleFontSizePxBaseline && titleFontSizePx < stage602TitleFontSizePxCeiling)) {
    throw new Error(`Expected title size between the Stage 604 and Stage 602 baselines, found ${titleFontSizePx}.`)
  }
  if (!(sourceFontSizePx > stage604SourceFontSizePxBaseline && sourceFontSizePx < stage602SourceFontSizePxCeiling)) {
    throw new Error(`Expected source size between the Stage 604 and Stage 602 baselines, found ${sourceFontSizePx}.`)
  }
  if (!(chipFontSizePx > stage604ChipFontSizePxBaseline && chipFontSizePx < stage602ChipFontSizePxCeiling)) {
    throw new Error(`Expected chip size between the Stage 604 and Stage 602 baselines, found ${chipFontSizePx}.`)
  }
  if (!(representativeCardBox.height < stage602CardHeightPxCeiling)) {
    throw new Error(`Expected representative card height to stay below the Stage 602 ceiling, found ${representativeCardBox.height}.`)
  }
  if (!titleText || !sourceText || !chipText) {
    throw new Error('Expected title, source, and collection chip text to stay visible in the Stage 608 audit.')
  }

  const toolbarActionCount =
    (await canvas.locator('.recall-home-parity-toolbar-row-primary-stage601').first().evaluate((node) => node.children.length)) +
    (await canvas.locator('.recall-home-parity-toolbar-row-secondary-stage601').first().evaluate((node) => node.children.length))
  const visibleDayGroupCountNodeCount = await canvas.locator('.recall-home-parity-day-group-header-stage563 span').count()

  if (toolbarActionCount !== 4) {
    throw new Error(`Expected 4 visible Home toolbar controls, found ${toolbarActionCount}.`)
  }
  if (visibleDayGroupCountNodeCount !== 0) {
    throw new Error(`Expected no visible day-group count nodes, found ${visibleDayGroupCountNodeCount}.`)
  }

  const homeCardCapture = await captureLocatorScreenshot(page, representativeCard, directory, `${stagePrefix}-home-card.png`)
  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)

  return {
    captures: {
      homeCard: homeCardCapture,
      homeWideTop,
    },
    metrics: {
      cardHeight: representativeCardBox.height,
      chipAlpha,
      chipFontSizePx,
      chipStyles,
      chipText,
      sourceAlpha,
      sourceFontSizePx,
      sourceStyles,
      sourceText,
      titleFontSizePx,
      titleStyles,
      titleText,
      toolbarActionCount,
      visibleDayGroupCountNodeCount,
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
  await page.locator('.recall-home-parity-canvas-stage563').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function openOriginalReaderFromHome(page, directory, stagePrefix) {
  await openHome(page)
  const rail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  const capturesButton = rail.locator('.recall-home-parity-rail-button-stage563').first()
  await capturesButton.click()
  await page.waitForTimeout(200)
  const sourceButton = page.locator('.recall-home-parity-card-stage563, .recall-home-parity-list-row-stage563').first()
  await sourceButton.waitFor({ state: 'visible', timeout: 20000 })
  const sourceTitle =
    normalizeText(await sourceButton.locator('strong').first().textContent().catch(() => '')) ||
    normalizeText(((await sourceButton.getAttribute('aria-label')) ?? '').replace(/^Open\s+/i, '')) ||
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
    throw new Error('Could not keep Reader in Original mode for the Stage 608 audit.')
  }

  const capture = await captureViewportScreenshot(page, directory, `${stagePrefix}-reader-original-wide-top.png`)
  return { capture, sourceTitle }
}

async function captureViewportScreenshot(page, directory, filename) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath })
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

function parseColorAlpha(value) {
  const match = value.match(/rgba?\(([^)]+)\)/i)
  if (!match) {
    return Number.NaN
  }
  const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()))
  return parts.length >= 4 ? parts[3] : 1
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
