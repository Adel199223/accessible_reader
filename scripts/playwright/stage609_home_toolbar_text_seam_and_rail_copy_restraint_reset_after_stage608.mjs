import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE609_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE609_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE609_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE609_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE609_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE609_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }
const stage608SearchLabelAlphaBaseline = 0.76
const stage608HintAlphaBaseline = 0.64
const stage608RailHeadingMetaAlphaBaseline = 0.38
const stage608RailNoteAlphaBaseline = 0.46
const stage608ActiveSupportAlphaBaseline = 0.4
const stage608InactiveSupportAlphaBaseline = 0.42
const stage608PreviewLabelAlphaBaseline = 0.42

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(outputDir, 'stage609-home-toolbar-text-seam-and-rail-copy-restraint-reset-after-stage608-failure.png'),
  { force: true },
)

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)
const { browser, runtimeBrowser } = await launchBrowser(chromium)

let page
try {
  page = await browser.newPage({ viewport: desktopViewport })
  const homeEvidence = await captureHomeImplementation(page, outputDir, 'stage609')

  await writeFile(
    path.join(outputDir, 'stage609-home-toolbar-text-seam-and-rail-copy-restraint-reset-after-stage608-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: homeEvidence.captures,
        desktopViewport,
        headless,
        implementationFocus: [
          'Home keeps the Stage 563 selected-collection rail plus day-grouped canvas structure.',
          'The next polish pass should reduce the remaining Recall mismatch by softening the top-right Search/Ctrl+K reading seam and calming the last quiet-copy seams inside the rail.',
          'The toolbar layout, rail ownership, grouping, and lower-card identity seam should stay intact while the visible text chrome reads less assertive.',
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
        path: path.join(outputDir, 'stage609-home-toolbar-text-seam-and-rail-copy-restraint-reset-after-stage608-failure.png'),
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

  const canvas = page.locator('.recall-home-parity-canvas-stage563').first()
  const rail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  await canvas.waitFor({ state: 'visible', timeout: 20000 })
  await rail.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)

  const searchLabel = canvas.locator('.recall-home-parity-toolbar-search-label-stage609').first()
  const searchHint = canvas.locator('.recall-home-parity-toolbar-hint-stage609').first()
  const railHeadingMeta = rail.locator('.recall-home-parity-rail-heading-meta-stage609').first()
  const railNote = rail.locator('.recall-home-parity-rail-note-stage609').first()
  const activeSupport = rail.locator('.recall-home-parity-rail-button-active-stage599 .recall-home-parity-rail-support-stage609').first()
  const inactiveSupport = rail.locator('.recall-home-parity-rail-button-inactive-stage575 .recall-home-parity-rail-support-stage609').first()
  const previewLabel = rail.locator('.recall-home-parity-rail-preview-label-stage609').first()

  await Promise.all([
    searchLabel.waitFor({ state: 'visible', timeout: 20000 }),
    searchHint.waitFor({ state: 'visible', timeout: 20000 }),
    railHeadingMeta.waitFor({ state: 'visible', timeout: 20000 }),
    railNote.waitFor({ state: 'visible', timeout: 20000 }),
    activeSupport.waitFor({ state: 'visible', timeout: 20000 }),
    inactiveSupport.waitFor({ state: 'visible', timeout: 20000 }),
    previewLabel.waitFor({ state: 'visible', timeout: 20000 }),
  ])

  const [searchLabelState, searchHintState, railHeadingMetaState, railNoteState, activeSupportState, inactiveSupportState, previewLabelState] =
    await Promise.all([
      readTextNodeState(searchLabel),
      readTextNodeState(searchHint),
      readTextNodeState(railHeadingMeta),
      readTextNodeState(railNote),
      readTextNodeState(activeSupport),
      readTextNodeState(inactiveSupport),
      readTextNodeState(previewLabel),
    ])

  if (!(searchLabelState.alpha < stage608SearchLabelAlphaBaseline)) {
    throw new Error(`Expected a softer Search label seam than the Stage 608 baseline, found ${searchLabelState.alpha}.`)
  }
  if (!(searchHintState.alpha < stage608HintAlphaBaseline)) {
    throw new Error(`Expected a softer Ctrl+K seam than the Stage 608 baseline, found ${searchHintState.alpha}.`)
  }
  if (!(railHeadingMetaState.alpha < stage608RailHeadingMetaAlphaBaseline)) {
    throw new Error(`Expected a softer rail heading-meta seam than the Stage 608 baseline, found ${railHeadingMetaState.alpha}.`)
  }
  if (!(railNoteState.alpha < stage608RailNoteAlphaBaseline)) {
    throw new Error(`Expected a softer rail summary seam than the Stage 608 baseline, found ${railNoteState.alpha}.`)
  }
  if (!(activeSupportState.alpha < stage608ActiveSupportAlphaBaseline)) {
    throw new Error(`Expected a softer active rail support seam than the Stage 608 baseline, found ${activeSupportState.alpha}.`)
  }
  if (!(inactiveSupportState.alpha < stage608InactiveSupportAlphaBaseline)) {
    throw new Error(`Expected a softer inactive rail support seam than the Stage 608 baseline, found ${inactiveSupportState.alpha}.`)
  }
  if (!(previewLabelState.alpha < stage608PreviewLabelAlphaBaseline)) {
    throw new Error(`Expected a softer active preview label seam than the Stage 608 baseline, found ${previewLabelState.alpha}.`)
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

  const toolbarRow = canvas.locator('.recall-home-parity-toolbar-row-primary-stage601').first()
  const toolbarCapture = await captureLocatorScreenshot(page, toolbarRow, directory, `${stagePrefix}-home-toolbar.png`)
  const railCapture = await captureLocatorScreenshot(page, rail, directory, `${stagePrefix}-home-rail.png`)
  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)

  return {
    captures: {
      homeRail: railCapture,
      homeToolbar: toolbarCapture,
      homeWideTop,
    },
    metrics: {
      activeSupportAlpha: activeSupportState.alpha,
      activeSupportFontSizePx: activeSupportState.fontSizePx,
      activeSupportText: activeSupportState.text,
      inactiveSupportAlpha: inactiveSupportState.alpha,
      inactiveSupportFontSizePx: inactiveSupportState.fontSizePx,
      inactiveSupportText: inactiveSupportState.text,
      previewLabelAlpha: previewLabelState.alpha,
      previewLabelFontSizePx: previewLabelState.fontSizePx,
      previewLabelText: previewLabelState.text,
      railHeadingMetaAlpha: railHeadingMetaState.alpha,
      railHeadingMetaFontSizePx: railHeadingMetaState.fontSizePx,
      railHeadingMetaText: railHeadingMetaState.text,
      railNoteAlpha: railNoteState.alpha,
      railNoteFontSizePx: railNoteState.fontSizePx,
      railNoteText: railNoteState.text,
      searchHintAlpha: searchHintState.alpha,
      searchHintFontSizePx: searchHintState.fontSizePx,
      searchHintText: searchHintState.text,
      searchLabelAlpha: searchLabelState.alpha,
      searchLabelFontSizePx: searchLabelState.fontSizePx,
      searchLabelText: searchLabelState.text,
      toolbarActionCount,
      visibleDayGroupCountNodeCount,
    },
  }
}

async function readTextNodeState(locator) {
  const text = normalizeText(await locator.textContent())
  const styles = await locator.evaluate((node) => {
    const computed = window.getComputedStyle(node)
    return {
      color: computed.color,
      fontSize: computed.fontSize,
    }
  })
  if (!text) {
    throw new Error('Expected visible text to remain present in the Stage 609 Home copy-restraint pass.')
  }
  return {
    alpha: parseColorAlpha(styles.color),
    fontSizePx: Number.parseFloat(styles.fontSize),
    styles,
    text,
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
