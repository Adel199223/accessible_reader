import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE359_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE359_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE359_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE359_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE359_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE359_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}
const focusedViewport = {
  width: 820,
  height: 980,
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage359-desktop-first-reader-redesign-milestone-after-stage358-failure.png'), {
  force: true,
})

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const { browser, runtimeBrowser } = await launchBrowser(chromium)

let desktopReaderPage
let focusedReaderPage
try {
  desktopReaderPage = await browser.newPage({ viewport: desktopViewport })
  const { sourceTitle } = await openReaderFromHome(desktopReaderPage)
  const {
    readerContextPanelWideTop,
    readerMainPanelWideTop,
    readerWideTop,
  } = await captureWideReaderArtifacts(desktopReaderPage, outputDir, 'stage359')

  focusedReaderPage = await browser.newPage({ viewport: focusedViewport })
  const { sourceTitle: focusedSourceTitle } = await openReaderFromHome(focusedReaderPage)
  const {
    readerNarrowFull,
    readerNarrowOverflowOpen,
    readerNarrowTop,
  } = await captureReaderNarrowRegressionArtifacts(focusedReaderPage, outputDir, 'stage359')

  await writeFile(
    path.join(outputDir, 'stage359-desktop-first-reader-redesign-milestone-after-stage358-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          readerContextPanelWideTop,
          readerMainPanelWideTop,
          readerNarrowFull,
          readerNarrowOverflowOpen,
          readerNarrowTop,
          readerWideTop,
        },
        desktopViewport,
        focusedViewport,
        headless,
        runtimeBrowser,
        sourceTitle,
        focusedSourceTitle,
        validationFocus: [
          'desktop-first Reader milestone validation with a wide Reader top-state plus explicit main-panel and reading-context crops',
          'focused and narrow Reader regression captures covering top-state, overflow-open controls, and full-page reading flow',
          'neighboring Home, Graph, Notes, and Study stay as regression surfaces for the Stage 360 audit while Reader remains the active milestone',
        ],
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  if (desktopReaderPage) {
    await desktopReaderPage
      .screenshot({
        path: path.join(outputDir, 'stage359-desktop-first-reader-redesign-milestone-after-stage358-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (focusedReaderPage && focusedReaderPage !== desktopReaderPage) {
    await focusedReaderPage
      .screenshot({
        path: path.join(
          outputDir,
          'stage359-desktop-first-reader-redesign-milestone-after-stage358-failure-focused.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function captureWideReaderArtifacts(page, directory, stagePrefix) {
  const readerWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-reader-wide-top.png`)

  const readerMainPanel = await getVisibleLocator(page, [
    '.reader-shell-grid .main-panel',
    '.reader-reading-card',
    '.reader-shell-grid',
  ])
  const readerMainPanelWideTop = await captureLocatorTopScreenshot(
    page,
    readerMainPanel,
    directory,
    `${stagePrefix}-reader-main-panel-wide-top.png`,
    980,
  )

  const readerContextPanel = await getVisibleLocator(page, [
    '.reader-context-panel',
    '.reader-context-switcher',
  ])
  const readerContextPanelWideTop = await captureLocatorTopScreenshot(
    page,
    readerContextPanel,
    directory,
    `${stagePrefix}-reader-context-panel-wide-top.png`,
    940,
  )

  return {
    readerContextPanelWideTop,
    readerMainPanelWideTop,
    readerWideTop,
  }
}

async function captureReaderNarrowRegressionArtifacts(page, directory, stagePrefix) {
  const readerNarrowTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-reader-narrow-top.png`)

  await page.getByLabel('Read aloud transport').scrollIntoViewIfNeeded()
  await page.waitForTimeout(200)
  await page.getByRole('button', { name: 'More reading controls' }).click()
  await page.getByRole('group', { name: 'More reading controls' }).waitFor({ state: 'visible', timeout: 10000 })
  await page.waitForTimeout(250)
  const readerNarrowOverflowOpen = await captureScreenshot(
    page,
    directory,
    `${stagePrefix}-reader-narrow-overflow-open.png`,
  )

  await page.keyboard.press('Escape')
  await page.waitForTimeout(250)
  const readerNarrowFull = await captureScreenshot(page, directory, `${stagePrefix}-reader-narrow-full.png`, {
    fullPage: true,
  })

  return {
    readerNarrowFull,
    readerNarrowOverflowOpen,
    readerNarrowTop,
  }
}

async function captureViewportScreenshot(page, directory, filename) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath })
  return screenshotPath
}

async function captureScreenshot(page, directory, filename, options = {}) {
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath, ...options })
  return screenshotPath
}

async function captureLocatorTopScreenshot(page, locator, directory, filename, maxHeight = 720, scrollMode = 'pageTop') {
  if (scrollMode === 'locator') {
    await locator.scrollIntoViewIfNeeded()
  } else {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  }
  await page.waitForTimeout(150)

  const box = await locator.boundingBox()
  if (!box) {
    throw new Error(`Could not resolve a bounding box for ${filename}.`)
  }

  const viewportSize = page.viewportSize() ?? desktopViewport
  const clipX = Math.max(0, Math.floor(box.x))
  const clipY = Math.max(0, Math.floor(box.y))
  const clipWidth = Math.max(1, Math.min(Math.ceil(box.width), viewportSize.width - clipX))
  const clipHeight = Math.max(1, Math.min(Math.ceil(box.height), maxHeight, viewportSize.height - clipY))
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({
    path: screenshotPath,
    clip: {
      x: clipX,
      y: clipY,
      width: clipWidth,
      height: clipHeight,
    },
  })
  return screenshotPath
}

async function getVisibleLocator(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first()
    if ((await locator.count()) > 0) {
      await locator.waitFor({ state: 'visible', timeout: 20000 })
      return locator
    }
  }
  throw new Error(`None of the expected selectors became visible: ${selectors.join(', ')}`)
}

async function openSourceWorkspaceFromHome(page) {
  await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Home', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })

  const sourceButton = await getVisibleLocator(page, [
    'button[aria-label^="Open "]',
    '.recall-home-lead-card button',
    '.recall-home-continue-row',
    '.recall-library-list-row',
    '.recall-library-home-primary-card',
  ])

  const sourceTitle = await getSourceTitle(sourceButton)
  await sourceButton.click()
  await page.getByRole('region', { name: `${sourceTitle} workspace` }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)

  return { sourceTitle }
}

async function openReaderFromHome(page) {
  const { sourceTitle } = await openSourceWorkspaceFromHome(page)
  await page.getByRole('tab', { name: 'Reader', exact: true }).click()
  await page.waitForURL(/\/reader/, { timeout: 20000 })
  await page.locator('article').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.getByLabel('Read aloud transport').waitFor({ state: 'visible', timeout: 20000 })
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(350)
  return { sourceTitle }
}

async function getSourceTitle(locator) {
  const ariaLabel = (await locator.getAttribute('aria-label'))?.trim()
  if (ariaLabel) {
    const strippedOpen = ariaLabel.replace(/^Open\s+/i, '').trim()
    if (strippedOpen && strippedOpen !== ariaLabel) {
      return strippedOpen
    }
  }

  const strong = locator.locator('strong').first()
  if ((await strong.count()) > 0) {
    const strongText = (await strong.textContent())?.trim()
    if (strongText) {
      return strongText
    }
  }

  const leadCardStrong = locator
    .locator('xpath=ancestor::*[contains(@class, "recall-home-lead-card")][1]//strong')
    .first()
  if ((await leadCardStrong.count()) > 0) {
    const leadCardStrongText = (await leadCardStrong.textContent())?.trim()
    if (leadCardStrongText) {
      return leadCardStrongText
    }
  }

  const text = (await locator.textContent())?.trim()
  return text || 'Source'
}

function resolveHarnessDir(value) {
  if (process.platform === 'win32') {
    return value
  }
  const windowsDriveMatch = value.match(/^([A-Za-z]):\\(.*)$/)
  if (!windowsDriveMatch) {
    return value
  }
  const [, drive, rest] = windowsDriveMatch
  return `/mnt/${drive.toLowerCase()}/${rest.replace(/\\/g, '/')}`
}

async function launchBrowser(chromium) {
  if (preferredChannel === 'bundled') {
    return {
      browser: await chromium.launch({ headless }),
      runtimeBrowser: 'chromium',
    }
  }

  try {
    return {
      browser: await chromium.launch({
        channel: preferredChannel,
        headless,
      }),
      runtimeBrowser: preferredChannel,
    }
  } catch (error) {
    if (!allowChromiumFallback) {
      throw error
    }
    return {
      browser: await chromium.launch({ headless }),
      runtimeBrowser: 'chromium',
    }
  }
}
