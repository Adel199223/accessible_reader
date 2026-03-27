import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE592_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE592_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE592_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE592_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE592_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE592_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage590PreviewOverlayOpacityBaseline = 0.24
const stage590PreviewOverlayTextureAlphaBaseline = 0.08
const stage590PosterMarkBackgroundAlphaBaseline = 0.28
const stage590PosterMarkBorderAlphaBaseline = 0.18

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage592-post-stage591-home-preview-overlay-texture-and-poster-mark-chrome-softening-audit-failure.png',
  ),
  { force: true },
)
await rm(
  path.join(
    outputDir,
    'stage592-post-stage591-home-preview-overlay-texture-and-poster-mark-chrome-softening-audit-failure-reader.png',
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
  const homeEvidence = await captureHomeAudit(page, outputDir, 'stage592')

  await openGraph(page)
  const graphWideTop = await captureViewportScreenshot(page, outputDir, 'stage592-graph-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage592')

  await writeFile(
    path.join(
      outputDir,
      'stage592-post-stage591-home-preview-overlay-texture-and-poster-mark-chrome-softening-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 591 preview-overlay and poster-mark softening pass',
          'the Home surface should keep the Stage 563 structure while calming the preview overlay texture and the poster mark chrome',
          'Graph and original-only Reader remain regression surfaces only after the Home-only Stage 591 pass',
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
          'stage592-post-stage591-home-preview-overlay-texture-and-poster-mark-chrome-softening-audit-failure.png',
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
          'stage592-post-stage591-home-preview-overlay-texture-and-poster-mark-chrome-softening-audit-failure-reader.png',
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

  const representativeCard = canvas.locator('.recall-home-parity-card-stage563').first()
  await representativeCard.waitFor({ state: 'visible', timeout: 20000 })

  const previewShell = representativeCard.locator('.recall-home-parity-card-preview-stage563').first()
  await previewShell.waitFor({ state: 'visible', timeout: 20000 })
  const previewOverlayStyles = await previewShell.evaluate((node) => {
    const styles = window.getComputedStyle(node, '::after')
    return {
      backgroundImage: styles.backgroundImage,
      opacity: styles.opacity,
    }
  })

  const previewMark = representativeCard.locator('.recall-home-parity-card-preview-mark-stage565').first()
  await previewMark.waitFor({ state: 'visible', timeout: 20000 })
  const previewMarkText = normalizeText(await previewMark.textContent())
  const previewMarkStyles = await previewMark.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      backgroundImage: styles.backgroundImage,
      borderTopColor: styles.borderTopColor,
      color: styles.color,
      fontSize: styles.fontSize,
    }
  })

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
  if (!previewMarkText) {
    throw new Error('Expected representative poster mark text to remain visible in the Stage 592 audit.')
  }

  const previewOverlayOpacity = Number(previewOverlayStyles.opacity)
  const previewOverlayTextureAlpha = parseMaxCssAlpha(previewOverlayStyles.backgroundImage)
  const previewMarkBackgroundAlpha = parseMaxCssAlpha(previewMarkStyles.backgroundImage)
  const previewMarkBorderAlpha = parseCssAlpha(previewMarkStyles.borderTopColor)

  if (previewOverlayOpacity >= stage590PreviewOverlayOpacityBaseline) {
    throw new Error(
      `Expected calmer preview overlay opacity below the Stage 590 baseline, received ${JSON.stringify(
        previewOverlayStyles,
      )}.`,
    )
  }
  if (previewOverlayTextureAlpha >= stage590PreviewOverlayTextureAlphaBaseline) {
    throw new Error(
      `Expected calmer preview overlay texture below the Stage 590 baseline, received ${JSON.stringify(
        previewOverlayStyles,
      )}.`,
    )
  }
  if (previewMarkBackgroundAlpha >= stage590PosterMarkBackgroundAlphaBaseline) {
    throw new Error(
      `Expected softer poster mark chrome below the Stage 590 background baseline, received ${JSON.stringify(
        previewMarkStyles,
      )}.`,
    )
  }
  if (previewMarkBorderAlpha >= stage590PosterMarkBorderAlphaBaseline) {
    throw new Error(
      `Expected softer poster mark border below the Stage 590 baseline, received ${JSON.stringify(
        previewMarkStyles,
      )}.`,
    )
  }

  const addTileCapture = await captureLocatorScreenshot(page, addTile, directory, `${stagePrefix}-home-add-tile.png`)
  const homeCard = await captureLocatorScreenshot(page, representativeCard, directory, `${stagePrefix}-home-card.png`)
  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)

  return {
    captures: {
      addTile: addTileCapture,
      homeCard,
      homeWideTop,
    },
    metrics: {
      previewMarkBackgroundAlpha,
      previewMarkBorderAlpha,
      previewMarkStyles,
      previewMarkText,
      previewOverlayOpacity,
      previewOverlayStyles,
      previewOverlayTextureAlpha,
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
    throw new Error('Could not keep Reader in Original mode for the Stage 592 audit.')
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

function parseMaxCssAlpha(value) {
  const matches = Array.from(value.matchAll(/rgba?\(([^)]+)\)/gi))
  if (!matches.length) {
    return 1
  }
  return matches.reduce((maxAlpha, match) => {
    const parts = match[1].split(',').map((part) => part.trim())
    const alpha = parts.length >= 4 ? Number(parts[3]) : 1
    return Number.isFinite(alpha) ? Math.max(maxAlpha, alpha) : maxAlpha
  }, 0)
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
