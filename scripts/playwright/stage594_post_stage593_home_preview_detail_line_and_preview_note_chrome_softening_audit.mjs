import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE594_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE594_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE594_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE594_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE594_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE594_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage592PreviewDetailAlphaBaseline = 0.62
const stage592PreviewDetailFontSizeBaseline = 8.96
const stage592PreviewNoteAlphaBaseline = 0.54
const stage592PreviewNoteFontSizeBaseline = 8.32

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage594-post-stage593-home-preview-detail-line-and-preview-note-chrome-softening-audit-failure.png',
  ),
  { force: true },
)
await rm(
  path.join(
    outputDir,
    'stage594-post-stage593-home-preview-detail-line-and-preview-note-chrome-softening-audit-failure-reader.png',
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
  const homeEvidence = await captureHomeAudit(page, outputDir, 'stage594')

  await openGraph(page)
  const graphWideTop = await captureViewportScreenshot(page, outputDir, 'stage594-graph-wide-top.png')

  readerPage = await browser.newPage({ viewport: desktopViewport })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, outputDir, 'stage594')

  await writeFile(
    path.join(
      outputDir,
      'stage594-post-stage593-home-preview-detail-line-and-preview-note-chrome-softening-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 593 preview-detail-line and preview-note softening pass',
          'the Home surface should keep the Stage 563 structure while calming the preview detail line and the lower preview note chrome',
          'Graph and original-only Reader remain regression surfaces only after the Home-only Stage 593 pass',
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
          'stage594-post-stage593-home-preview-detail-line-and-preview-note-chrome-softening-audit-failure.png',
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
          'stage594-post-stage593-home-preview-detail-line-and-preview-note-chrome-softening-audit-failure-reader.png',
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

  const previewDetail = representativeCard.locator('.recall-home-parity-card-preview-detail-stage565').first()
  await previewDetail.waitFor({ state: 'visible', timeout: 20000 })
  const previewDetailText = normalizeText(await previewDetail.textContent())
  const previewDetailStyles = await previewDetail.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      letterSpacing: styles.letterSpacing,
    }
  })

  const previewNote = representativeCard.locator('.recall-home-parity-card-preview-note-stage569').first()
  await previewNote.waitFor({ state: 'visible', timeout: 20000 })
  const previewNoteText = normalizeText(await previewNote.textContent())
  const previewNoteStyles = await previewNote.evaluate((node) => {
    const styles = window.getComputedStyle(node)
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      letterSpacing: styles.letterSpacing,
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
  if (!previewDetailText) {
    throw new Error('Expected representative preview detail text to remain visible in the Stage 594 audit.')
  }
  if (!previewNoteText) {
    throw new Error('Expected representative preview note text to remain visible in the Stage 594 audit.')
  }

  const previewDetailAlpha = parseCssAlpha(previewDetailStyles.color)
  const previewDetailFontSize = Number.parseFloat(previewDetailStyles.fontSize)
  const previewNoteAlpha = parseCssAlpha(previewNoteStyles.color)
  const previewNoteFontSize = Number.parseFloat(previewNoteStyles.fontSize)

  if (previewDetailAlpha >= stage592PreviewDetailAlphaBaseline) {
    throw new Error(
      `Expected quieter preview detail styling below the Stage 592 baseline, received ${JSON.stringify(
        previewDetailStyles,
      )}.`,
    )
  }
  if (previewDetailFontSize >= stage592PreviewDetailFontSizeBaseline) {
    throw new Error(
      `Expected smaller preview detail text below the Stage 592 baseline, received ${JSON.stringify(
        previewDetailStyles,
      )}.`,
    )
  }
  if (previewNoteAlpha >= stage592PreviewNoteAlphaBaseline) {
    throw new Error(
      `Expected softer preview note styling below the Stage 592 baseline, received ${JSON.stringify(
        previewNoteStyles,
      )}.`,
    )
  }
  if (previewNoteFontSize >= stage592PreviewNoteFontSizeBaseline) {
    throw new Error(
      `Expected smaller preview note text below the Stage 592 baseline, received ${JSON.stringify(
        previewNoteStyles,
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
      previewDetailAlpha,
      previewDetailFontSize,
      previewDetailStyles,
      previewDetailText,
      previewNoteAlpha,
      previewNoteFontSize,
      previewNoteStyles,
      previewNoteText,
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
    throw new Error('Could not keep Reader in Original mode for the Stage 594 audit.')
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
