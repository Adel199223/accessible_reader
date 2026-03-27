import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE602_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE602_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE602_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE602_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE602_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE602_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage600SearchButtonWidthBaseline = 166
const stage600AddButtonWidthBaseline = 56
const stage600SearchPlaceholderAlphaBaseline = 0.9
const stage600SecondaryButtonBackgroundAlphaBaseline = 0.024
const stage600SecondaryButtonBorderAlphaBaseline = 0.052
const stage600SecondaryButtonHeightBaseline = 31

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage602-post-stage601-home-toolbar-scale-and-utility-fill-calibration-audit-failure.png',
  ),
  { force: true },
)
await rm(
  path.join(
    outputDir,
    'stage602-post-stage601-home-toolbar-scale-and-utility-fill-calibration-audit-failure-reader.png',
  ),
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
  const homeEvidence = await captureHomeAudit(page, outputDir, 'stage602')

  await openGraph(page)
  const graphWideTop = await captureViewportScreenshot(page, outputDir, 'stage602-graph-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage602')

  await writeFile(
    path.join(
      outputDir,
      'stage602-post-stage601-home-toolbar-scale-and-utility-fill-calibration-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 601 toolbar scale and utility fill calibration pass',
          'the Home surface should keep the Stage 563 structure while making Search, Add, List, and Sort read closer to Recall in width, height, and lower-contrast fill rhythm',
          'Graph and original-only Reader remain regression surfaces only after the Home-only Stage 601 pass',
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
        path: path.join(
          outputDir,
          'stage602-post-stage601-home-toolbar-scale-and-utility-fill-calibration-audit-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (readerPage && readerPage !== page) {
    await readerPage
      .screenshot({
        path: path.join(
          outputDir,
          'stage602-post-stage601-home-toolbar-scale-and-utility-fill-calibration-audit-failure-reader.png',
        ),
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

  const toolbarCluster = canvas.locator('.recall-home-parity-toolbar-actions-stage601').first()
  await toolbarCluster.waitFor({ state: 'visible', timeout: 20000 })

  const searchButton = canvas.locator('.recall-home-parity-toolbar-button-search-stage601').first()
  await searchButton.waitFor({ state: 'visible', timeout: 20000 })
  const searchButtonBox = await searchButton.boundingBox()
  if (!searchButtonBox) {
    throw new Error('Expected measurable Search trigger bounds in the Stage 602 audit.')
  }
  const searchButtonStyles = await searchButton.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      backgroundColor: styles.backgroundColor,
      borderTopColor: styles.borderTopColor,
      borderRadius: styles.borderRadius,
      color: styles.color,
      paddingLeft: styles.paddingLeft,
      paddingRight: styles.paddingRight,
    }
  })
  const searchPlaceholder = searchButton.locator('.recall-home-parity-toolbar-button-leading-stage569 > span').nth(1)
  await searchPlaceholder.waitFor({ state: 'visible', timeout: 20000 })
  const searchPlaceholderText = normalizeText(await searchPlaceholder.textContent())
  const searchPlaceholderStyles = await searchPlaceholder.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
    }
  })
  const searchHint = searchButton.locator('.recall-home-parity-toolbar-hint-stage601').first()
  await searchHint.waitFor({ state: 'visible', timeout: 20000 })
  const searchHintText = normalizeText(await searchHint.textContent())
  const searchHintStyles = await searchHint.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      letterSpacing: styles.letterSpacing,
    }
  })

  const addButton = canvas.locator('.recall-home-parity-toolbar-button-primary-stage601').first()
  await addButton.waitFor({ state: 'visible', timeout: 20000 })
  const addButtonBox = await addButton.boundingBox()
  if (!addButtonBox) {
    throw new Error('Expected measurable Add trigger bounds in the Stage 602 audit.')
  }

  const secondaryToolbarRow = canvas.locator('.recall-home-parity-toolbar-row-secondary-stage601').first()
  await secondaryToolbarRow.waitFor({ state: 'visible', timeout: 20000 })

  const listButton = canvas.locator('.recall-home-parity-toolbar-button-secondary-stage601').first()
  await listButton.waitFor({ state: 'visible', timeout: 20000 })
  const listButtonBox = await listButton.boundingBox()
  if (!listButtonBox) {
    throw new Error('Expected measurable List trigger bounds in the Stage 602 audit.')
  }
  const listButtonStyles = await listButton.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      backgroundColor: styles.backgroundColor,
      borderTopColor: styles.borderTopColor,
      color: styles.color,
      fontSize: styles.fontSize,
    }
  })

  const sortTrigger = canvas.locator('.recall-home-parity-sort-trigger-stage601').first()
  await sortTrigger.waitFor({ state: 'visible', timeout: 20000 })
  const sortTriggerBox = await sortTrigger.boundingBox()
  if (!sortTriggerBox) {
    throw new Error('Expected measurable Sort trigger bounds in the Stage 602 audit.')
  }
  const sortTriggerStyles = await sortTrigger.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      backgroundColor: styles.backgroundColor,
      borderTopColor: styles.borderTopColor,
      color: styles.color,
      fontSize: styles.fontSize,
    }
  })
  const sortCaret = sortTrigger.locator('.recall-home-parity-sort-caret-stage601').first()
  await sortCaret.waitFor({ state: 'visible', timeout: 20000 })
  const sortCaretText = normalizeText(await sortCaret.textContent())
  const sortCaretStyles = await sortCaret.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      fontSize: styles.fontSize,
      opacity: styles.opacity,
    }
  })

  const searchPlaceholderAlpha = parseCssAlpha(searchPlaceholderStyles.color)
  const searchHintAlpha = parseCssAlpha(searchHintStyles.color)
  const listButtonFillAlpha = parseCssAlpha(listButtonStyles.backgroundColor)
  const listButtonBorderAlpha = parseCssAlpha(listButtonStyles.borderTopColor)

  if (!(searchButtonBox.width > stage600SearchButtonWidthBaseline)) {
    throw new Error(`Expected a wider Search trigger than the Stage 600 baseline, found ${searchButtonBox.width}.`)
  }
  if (!(addButtonBox.width > stage600AddButtonWidthBaseline)) {
    throw new Error(`Expected a wider Add trigger than the Stage 600 baseline, found ${addButtonBox.width}.`)
  }
  if (searchPlaceholderText !== 'Search...') {
    throw new Error(`Expected visible Search placeholder text to stay intact, found ${JSON.stringify(searchPlaceholderText)}.`)
  }
  if (searchHintText !== 'Ctrl+K') {
    throw new Error(`Expected visible Search shortcut hint to stay intact, found ${JSON.stringify(searchHintText)}.`)
  }
  if (!(searchPlaceholderAlpha < stage600SearchPlaceholderAlphaBaseline)) {
    throw new Error(
      `Expected a quieter Search placeholder seam below the Stage 600 baseline, received ${JSON.stringify(
        searchPlaceholderStyles,
      )}.`,
    )
  }
  if (!(listButtonFillAlpha < stage600SecondaryButtonBackgroundAlphaBaseline)) {
    throw new Error(
      `Expected softer secondary utility-pill fill below the Stage 600 baseline, received ${JSON.stringify(
        listButtonStyles,
      )}.`,
    )
  }
  if (!(listButtonBorderAlpha < stage600SecondaryButtonBorderAlphaBaseline)) {
    throw new Error(
      `Expected softer secondary utility-pill border below the Stage 600 baseline, received ${JSON.stringify(
        listButtonStyles,
      )}.`,
    )
  }
  if (!(listButtonBox.height > stage600SecondaryButtonHeightBaseline)) {
    throw new Error(`Expected a taller List pill than the Stage 600 baseline, found ${listButtonBox.height}.`)
  }
  if (!(sortTriggerBox.height > stage600SecondaryButtonHeightBaseline)) {
    throw new Error(`Expected a taller Sort pill than the Stage 600 baseline, found ${sortTriggerBox.height}.`)
  }
  if (!sortCaretText) {
    throw new Error('Expected visible Sort caret text to remain present in the Stage 602 audit.')
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

  const toolbarClusterCapture = await captureLocatorScreenshot(
    page,
    toolbarCluster,
    directory,
    `${stagePrefix}-home-toolbar-cluster.png`,
  )
  const searchButtonCapture = await captureLocatorScreenshot(
    page,
    searchButton,
    directory,
    `${stagePrefix}-home-search-button.png`,
  )
  const secondaryToolbarCapture = await captureLocatorScreenshot(
    page,
    secondaryToolbarRow,
    directory,
    `${stagePrefix}-home-secondary-toolbar.png`,
  )
  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)

  return {
    captures: {
      homeSearchButton: searchButtonCapture,
      homeSecondaryToolbar: secondaryToolbarCapture,
      homeWideTop,
      toolbarCluster: toolbarClusterCapture,
    },
    metrics: {
      addButtonHeight: addButtonBox.height,
      addButtonWidth: addButtonBox.width,
      listButtonBorderAlpha,
      listButtonBox,
      listButtonFillAlpha,
      listButtonStyles,
      searchButtonBox,
      searchButtonStyles,
      searchHintAlpha,
      searchHintStyles,
      searchHintText,
      searchPlaceholderAlpha,
      searchPlaceholderStyles,
      searchPlaceholderText,
      sortCaretStyles,
      sortCaretText,
      sortTriggerBox,
      sortTriggerStyles,
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
    throw new Error('Could not keep Reader in Original mode for the Stage 602 audit.')
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
