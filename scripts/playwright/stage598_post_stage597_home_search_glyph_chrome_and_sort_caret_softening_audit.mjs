import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE598_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE598_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE598_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE598_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE598_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE598_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage596SearchGlyphBorderAlphaBaseline = 0.76
const stage596SearchGlyphHandleAlphaBaseline = 0.76
const stage596SortCaretOpacityBaseline = 0.82
const stage596SortCaretFontSizePxBaseline = 11.84

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage598-post-stage597-home-search-glyph-chrome-and-sort-caret-softening-audit-failure.png',
  ),
  { force: true },
)
await rm(
  path.join(
    outputDir,
    'stage598-post-stage597-home-search-glyph-chrome-and-sort-caret-softening-audit-failure-reader.png',
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
  const homeEvidence = await captureHomeAudit(page, outputDir, 'stage598')

  await openGraph(page)
  const graphWideTop = await captureViewportScreenshot(page, outputDir, 'stage598-graph-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage598')

  await writeFile(
    path.join(
      outputDir,
      'stage598-post-stage597-home-search-glyph-chrome-and-sort-caret-softening-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 597 Search-glyph and sort-caret softening pass',
          'the Home surface should keep the Stage 563 structure while calming the Search glyph chrome and the visible sort-caret emphasis',
          'Graph and original-only Reader remain regression surfaces only after the Home-only Stage 597 pass',
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
          'stage598-post-stage597-home-search-glyph-chrome-and-sort-caret-softening-audit-failure.png',
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
          'stage598-post-stage597-home-search-glyph-chrome-and-sort-caret-softening-audit-failure-reader.png',
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

  const addTile = canvas.locator('.recall-home-parity-add-tile-stage563').first()
  await addTile.waitFor({ state: 'visible', timeout: 20000 })

  const toolbarCluster = canvas.locator('.recall-home-parity-toolbar-actions-stage569').first()
  await toolbarCluster.waitFor({ state: 'visible', timeout: 20000 })

  const representativeCard = canvas.locator('.recall-home-parity-card-stage563').first()
  await representativeCard.waitFor({ state: 'visible', timeout: 20000 })

  const searchButton = canvas.locator('.recall-home-parity-toolbar-button-search-stage567').first()
  await searchButton.waitFor({ state: 'visible', timeout: 20000 })
  const searchGlyph = searchButton.locator('.recall-home-parity-toolbar-search-glyph-stage569').first()
  await searchGlyph.waitFor({ state: 'visible', timeout: 20000 })
  const searchGlyphStyles = await searchGlyph.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    const afterStyles = window.getComputedStyle(node, '::after')
    return {
      borderTopColor: styles.borderTopColor,
      height: styles.height,
      width: styles.width,
      afterBackgroundColor: afterStyles.backgroundColor,
      afterHeight: afterStyles.height,
      afterWidth: afterStyles.width,
    }
  })

  const sortTrigger = canvas.locator('.recall-home-parity-sort-trigger-stage563').first()
  await sortTrigger.waitFor({ state: 'visible', timeout: 20000 })
  const sortCaret = sortTrigger.locator('.recall-home-parity-sort-caret-stage563').first()
  await sortCaret.waitFor({ state: 'visible', timeout: 20000 })
  const sortCaretText = normalizeText(await sortCaret.textContent())
  const sortCaretStyles = await sortCaret.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      opacity: styles.opacity,
    }
  })

  const searchGlyphBorderAlpha = parseCssAlpha(searchGlyphStyles.borderTopColor)
  const searchGlyphHandleAlpha = parseCssAlpha(searchGlyphStyles.afterBackgroundColor)
  const sortCaretOpacity = Number.parseFloat(sortCaretStyles.opacity)
  const sortCaretFontSizePx = Number.parseFloat(sortCaretStyles.fontSize)

  if (searchGlyphBorderAlpha <= 0 || searchGlyphHandleAlpha <= 0) {
    throw new Error(
      `Expected visible Search glyph chrome in the Stage 598 audit, received ${JSON.stringify(searchGlyphStyles)}.`,
    )
  }
  if (searchGlyphBorderAlpha >= stage596SearchGlyphBorderAlphaBaseline) {
    throw new Error(
      `Expected quieter Search glyph border styling below the Stage 596 baseline, received ${JSON.stringify(
        searchGlyphStyles,
      )}.`,
    )
  }
  if (searchGlyphHandleAlpha >= stage596SearchGlyphHandleAlphaBaseline) {
    throw new Error(
      `Expected quieter Search glyph handle styling below the Stage 596 baseline, received ${JSON.stringify(
        searchGlyphStyles,
      )}.`,
    )
  }
  if (!sortCaretText) {
    throw new Error(
      'Expected visible Sort caret text to remain present in the Stage 598 audit.',
    )
  }
  if (!(sortCaretOpacity < stage596SortCaretOpacityBaseline)) {
    throw new Error(
      `Expected softer Sort caret opacity below the Stage 596 baseline, received ${JSON.stringify(sortCaretStyles)}.`,
    )
  }
  if (!(sortCaretFontSizePx < stage596SortCaretFontSizePxBaseline)) {
    throw new Error(
      `Expected calmer Sort caret size below the Stage 596 baseline, received ${JSON.stringify(sortCaretStyles)}.`,
    )
  }

  const toolbarActionCount =
    (await canvas.locator('.recall-home-parity-toolbar-row-primary-stage567').first().evaluate((node) => node.children.length)) +
    (await canvas.locator('.recall-home-parity-toolbar-row-secondary-stage567').first().evaluate((node) => node.children.length))
  const visibleDayGroupCountNodeCount = await canvas.locator('.recall-home-parity-day-group-header-stage563 span').count()

  if (toolbarActionCount !== 4) {
    throw new Error(`Expected 4 visible Home toolbar controls, found ${toolbarActionCount}.`)
  }
  if (visibleDayGroupCountNodeCount !== 0) {
    throw new Error(`Expected no visible day-group count nodes, found ${visibleDayGroupCountNodeCount}.`)
  }

  const addTileCapture = await captureLocatorScreenshot(page, addTile, directory, `${stagePrefix}-home-add-tile.png`)
  const toolbarClusterCapture = await captureLocatorScreenshot(
    page,
    toolbarCluster,
    directory,
    `${stagePrefix}-home-toolbar-cluster.png`,
  )
  const homeCard = await captureLocatorScreenshot(page, representativeCard, directory, `${stagePrefix}-home-card.png`)
  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)

  return {
    captures: {
      addTile: addTileCapture,
      homeCard,
      homeWideTop,
      toolbarCluster: toolbarClusterCapture,
    },
    metrics: {
      searchGlyphBorderAlpha,
      searchGlyphHandleAlpha,
      searchGlyphStyles,
      sortCaretFontSizePx,
      sortCaretOpacity,
      sortCaretStyles,
      sortCaretText,
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
    throw new Error('Could not keep Reader in Original mode for the Stage 598 audit.')
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
