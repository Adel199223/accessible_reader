import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE355_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE355_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE355_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE355_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE355_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE355_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}
const focusedViewport = {
  width: 820,
  height: 980,
}

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage355-bundled-narrower-width-focused-graph-node-detail-stack-simplification-after-stage354-failure.png',
  ),
  { force: true },
)

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const { browser, runtimeBrowser } = await launchBrowser(chromium)

let desktopPage
let focusedPage
try {
  desktopPage = await browser.newPage({ viewport: desktopViewport })

  await desktopPage.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await desktopPage.getByRole('heading', { name: 'Home', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  const desktopHomeWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage355-home-wide-top.png')

  await desktopPage.getByRole('tab', { name: 'Graph' }).click()
  await desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(350)

  const desktopGraphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage355-graph-wide-top.png')
  const desktopGraphWorkspace = desktopPage.locator('.recall-graph-browser-workspace').first()
  await desktopGraphWorkspace.waitFor({ state: 'visible', timeout: 20000 })
  const desktopGraphCanvasUtilityWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopGraphWorkspace,
    outputDir,
    'stage355-graph-canvas-utility-wide-top.png',
    760,
  )
  const graphDock = desktopPage.getByLabel('Node detail dock')
  await graphDock.waitFor({ state: 'visible', timeout: 20000 })

  await selectFirstGraphNode(desktopPage)
  await desktopPage.waitForTimeout(350)
  await desktopPage.getByRole('button', { name: 'Show detail' }).waitFor({ state: 'visible', timeout: 20000 })
  const desktopGraphNodeDetailDockPeekWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDock,
    outputDir,
    'stage355-graph-node-detail-dock-peek-wide-top.png',
    980,
  )

  await desktopPage.getByRole('button', { name: 'Show detail' }).click()
  await desktopPage.waitForTimeout(350)
  await desktopPage.getByRole('button', { name: 'Peek only' }).waitFor({ state: 'visible', timeout: 20000 })
  const desktopGraphNodeDetailDockExpandedWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    graphDock,
    outputDir,
    'stage355-graph-node-detail-dock-expanded-wide-top.png',
    980,
  )

  focusedPage = await browser.newPage({ viewport: focusedViewport })
  await focusedPage.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await focusedPage.getByRole('heading', { name: 'Home', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  const { sourceTitle: focusedSourceTitle } = await openSourceWorkspaceFromHome(focusedPage)
  await focusedPage.getByRole('tab', { name: 'Source workspace Graph' }).click()
  await focusedPage.getByRole('heading', { name: 'Node detail', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await focusedPage.waitForTimeout(350)
  const focusedGraphNarrowTop = await captureViewportScreenshot(
    focusedPage,
    outputDir,
    'stage355-focused-graph-narrow-top.png',
  )

  const focusedGraphDetail = focusedPage.locator('.recall-graph-focused-detail-bundled').first()
  const focusedGraphFollowOn = focusedGraphDetail
    .locator('.recall-graph-focused-detail-section-follow-on-milestone')
    .first()
  await focusedGraphDetail.waitFor({ state: 'visible', timeout: 20000 })
  await focusedGraphFollowOn.waitFor({ state: 'visible', timeout: 20000 })
  const focusedGraphNodeDetailRailNarrowTop = await captureLocatorTopScreenshot(
    focusedPage,
    focusedGraphDetail,
    outputDir,
    'stage355-focused-graph-node-detail-rail-narrow-top.png',
    920,
  )
  const focusedGraphEvidenceFlowNarrowPanelTop = await captureLocatorTopScreenshot(
    focusedPage,
    focusedGraphFollowOn,
    outputDir,
    'stage355-focused-graph-evidence-flow-narrow-panel-top.png',
    760,
  )

  await writeFile(
    path.join(
      outputDir,
      'stage355-bundled-narrower-width-focused-graph-node-detail-stack-simplification-after-stage354-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          desktopGraphCanvasUtilityWideTop,
          desktopGraphNodeDetailDockExpandedWideTop,
          desktopGraphNodeDetailDockPeekWideTop,
          desktopGraphWideTop,
          desktopHomeWideTop,
          focusedGraphEvidenceFlowNarrowPanelTop,
          focusedGraphNarrowTop,
          focusedGraphNodeDetailRailNarrowTop,
        },
        desktopViewport,
        focusedViewport,
        headless,
        runtimeBrowser,
        focusedSourceTitle,
        validationFocus: [
          'desktop-first Graph validation with wide desktop browse Graph captures, including a canvas plus utility crop and node-detail dock peek/expanded crops, followed by focused/narrow Graph regression beside live reading',
          'retention of the Stage 223 shell correction and Stage 225 Reader gains',
          'retention of the Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused Notes gains, Stage 251 focused overview gains, Stage 253 focused Study gains, Stage 263 focused Notes drawer-open empty-detail gains, Stage 281 focused Graph gains, Stage 283 focused Study gains, Stage 285 focused Graph gains, Stage 287 focused Study gains, Stage 289 focused Graph gains, Stage 291 focused Study gains, Stage 293 focused Graph gains, Stage 295 focused Graph gains, Stage 297 focused Graph gains, Stage 299 focused Graph gains, Stage 301 focused Graph gains, Stage 303 focused Graph gains, Stage 305 focused Graph gains, Stage 307 focused Graph gains, Stage 309 focused Graph gains, Stage 311 focused Graph gains, Stage 313 focused Graph gains, Stage 315 focused Graph gains, Stage 317 focused Graph gains, Stage 319 focused Graph gains, Stage 321 focused Study gains, Stage 323 focused Study gains, Stage 325 focused Study gains, Stage 327 focused Graph gains, Stage 329 focused Graph gains, Stage 331 focused Graph gains, Stage 333 focused Graph gains, Stage 335 focused Graph gains, Stage 337 focused Study gains, Stage 339 focused Graph gains, Stage 341 focused Graph gains, Stage 343 focused Study gains, Stage 345 focused Graph gains, Stage 347 focused Graph gains, Stage 349 focused Study gains, Stage 351 focused Graph gains, Stage 353 validation findings, and Stage 354 audit findings',
          'neighboring Home, Study, Notes, and Reader stability after the desktop Graph milestone validation',
        ],
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
        path: path.join(
          outputDir,
          'stage355-bundled-narrower-width-focused-graph-node-detail-stack-simplification-after-stage354-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (focusedPage && focusedPage !== desktopPage) {
    await focusedPage
      .screenshot({
        path: path.join(
          outputDir,
          'stage355-bundled-narrower-width-focused-graph-node-detail-stack-simplification-after-stage354-failure-focused.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function captureViewportScreenshot(page, directory, filename) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath })
  return screenshotPath
}

async function captureLocatorTopScreenshot(page, locator, directory, filename, maxHeight = 720) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
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

async function openSourceWorkspaceFromHome(page) {
  const sourceButton = page.locator('.recall-library-home-primary-card, .recall-library-list-row').first()
  await sourceButton.waitFor({ state: 'visible', timeout: 15000 })

  const sourceLabel = (await sourceButton.getAttribute('aria-label')) ?? (await sourceButton.textContent()) ?? 'Source'
  const sourceTitle = sourceLabel.replace(/^Open\s+/i, '').trim() || 'Source'

  await sourceButton.click()
  await page.getByRole('region', { name: `${sourceTitle} workspace` }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)

  return { sourceTitle }
}

async function selectFirstGraphNode(page) {
  const nodeButton = page.locator('button[aria-label^="Select node "]').first()
  await nodeButton.waitFor({ state: 'visible', timeout: 20000 })
  await nodeButton.click()
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
