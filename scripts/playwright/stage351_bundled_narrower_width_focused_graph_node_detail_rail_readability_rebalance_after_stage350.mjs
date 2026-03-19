import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE351_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE351_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE351_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE351_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE351_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE351_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const viewport = {
  width: 820,
  height: 980,
}

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage351-bundled-narrower-width-focused-graph-node-detail-rail-readability-rebalance-after-stage350-failure.png',
  ),
  { force: true },
)

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const { browser, runtimeBrowser } = await launchBrowser(chromium)

let page
try {
  page = await browser.newPage({ viewport })

  const { sourceTitle } = await openFocusedOverview(page)
  const focusedOverviewNarrowTop = await captureViewportScreenshot(
    page,
    outputDir,
    'stage351-focused-overview-narrow-top.png',
  )

  await page.getByRole('tab', { name: 'Source workspace Graph' }).click()
  await page.getByRole('heading', { name: 'Node detail', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
  const focusedGraphNarrowTop = await captureViewportScreenshot(page, outputDir, 'stage351-focused-graph-narrow-top.png')

  const graphFocusedDetail = page.locator('.recall-graph-focused-detail-bundled').first()
  const graphFocusedBody = graphFocusedDetail.locator('.recall-graph-focused-detail-stack-hierarchy-reset').first()
  const selectedNodeGlance = graphFocusedDetail.locator('.recall-graph-focus-stage-glance').first()
  const leadingGroundedEvidenceCard = graphFocusedDetail.locator('.recall-graph-focused-mention-card-leading').first()
  const evidenceFlowBundle = graphFocusedDetail.locator('.recall-graph-focused-evidence-flow-bundle-fused').first()
  const followOnBundle = graphFocusedDetail.locator('.recall-graph-focused-detail-section-follow-on-bundle').first()
  const relationsFollowOn = graphFocusedDetail.locator('.recall-graph-focused-detail-section-relations-follow-on').first()
  await graphFocusedBody.waitFor({ state: 'visible', timeout: 20000 })
  await selectedNodeGlance.waitFor({ state: 'visible', timeout: 20000 })
  await leadingGroundedEvidenceCard.waitFor({ state: 'visible', timeout: 20000 })
  await evidenceFlowBundle.waitFor({ state: 'visible', timeout: 20000 })
  await followOnBundle.waitFor({ state: 'visible', timeout: 20000 })
  await evidenceFlowBundle.locator('.recall-graph-focused-follow-on-entry').waitFor({ state: 'visible', timeout: 20000 })
  await followOnBundle.locator('.recall-graph-focused-follow-on-entry').waitFor({ state: 'visible', timeout: 20000 })
  await leadingGroundedEvidenceCard.locator('.recall-collection-row-preview').waitFor({ state: 'visible', timeout: 20000 })
  await leadingGroundedEvidenceCard.locator('.recall-collection-row-meta').waitFor({ state: 'visible', timeout: 20000 })
  await evidenceFlowBundle
    .locator('.recall-graph-focused-mention-card-trailing, .recall-edge-card')
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  await followOnBundle
    .locator('.recall-graph-focused-mention-card-trailing, .recall-edge-card')
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  if ((await relationsFollowOn.count()) > 0) {
    await relationsFollowOn.locator('.recall-edge-card').first().waitFor({ state: 'visible', timeout: 20000 })
  }
  await page.waitForTimeout(350)
  const focusedGraphNodeDetailRailNarrowTop = await captureLocatorTopScreenshot(
    page,
    graphFocusedDetail,
    outputDir,
    'stage351-focused-graph-node-detail-rail-narrow-top.png',
    920,
  )
  const focusedGraphRightRailReadabilityNarrowPanelTop = await captureLocatorTopScreenshot(
    page,
    graphFocusedBody,
    outputDir,
    'stage351-focused-graph-right-rail-readability-narrow-panel-top.png',
    840,
  )
  const focusedGraphLeadingEvidenceMetaDensityNarrowPanelTop = await captureLocatorTopScreenshot(
    page,
    leadingGroundedEvidenceCard,
    outputDir,
    'stage351-focused-graph-leading-evidence-meta-density-narrow-panel-top.png',
    500,
  )
  const focusedGraphFollowOnBundleNarrowPanelTop = await captureLocatorTopScreenshot(
    page,
    followOnBundle,
    outputDir,
    'stage351-focused-graph-follow-on-bundle-narrow-panel-top.png',
    760,
  )
  const focusedGraphRelationsFollowOnNarrowPanelTop =
    (await relationsFollowOn.count()) > 0
      ? await captureLocatorTopScreenshot(
          page,
          relationsFollowOn,
          outputDir,
          'stage351-focused-graph-relations-follow-on-narrow-panel-top.png',
          760,
        )
      : null

  await page.getByRole('tab', { name: 'Source workspace Study' }).click()
  await page.getByRole('heading', { name: 'Study queue', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
  const focusedStudyNarrowTop = await captureViewportScreenshot(page, outputDir, 'stage351-focused-study-narrow-top.png')

  await page.getByRole('button', { name: /^(Reveal|Show) answer$/ }).click()
  await page.waitForTimeout(350)
  const focusedStudyAnswerShownNarrowTop = await captureViewportScreenshot(
    page,
    outputDir,
    'stage351-focused-study-answer-shown-narrow-top.png',
  )

  await page.getByRole('tab', { name: 'Source workspace Notes' }).click()
  await page.getByRole('heading', { name: 'Notes', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
  const notesSection = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Notes', level: 2 }),
  })
  await notesSection.getByRole('button', { name: 'Show', exact: true }).click()
  await page.getByRole('searchbox', { name: 'Search notes' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
  const focusedNotesDrawerOpenEmptyNarrowTop = await captureViewportScreenshot(
    page,
    outputDir,
    'stage351-focused-notes-drawer-open-empty-narrow-top.png',
  )

  await page.getByRole('tab', { name: 'Source workspace Reader' }).click()
  await page.waitForURL(/\/reader/, { timeout: 20000 })
  await page.getByRole('article', { name: sourceTitle }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
  const readerNarrowTop = await captureViewportScreenshot(page, outputDir, 'stage351-reader-narrow-top.png')

  await writeFile(
    path.join(
      outputDir,
      'stage351-bundled-narrower-width-focused-graph-node-detail-rail-readability-rebalance-after-stage350-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          focusedGraphFollowOnBundleNarrowPanelTop,
          focusedGraphLeadingEvidenceMetaDensityNarrowPanelTop,
          focusedGraphNarrowTop,
          focusedGraphNodeDetailRailNarrowTop,
          focusedGraphRelationsFollowOnNarrowPanelTop,
          focusedGraphRightRailReadabilityNarrowPanelTop,
          focusedNotesDrawerOpenEmptyNarrowTop,
          focusedOverviewNarrowTop,
          focusedStudyAnswerShownNarrowTop,
          focusedStudyNarrowTop,
          readerNarrowTop,
        },
        headless,
        runtimeBrowser,
        sourceTitle,
        validationFocus: [
          'bundled narrower-width focused Graph node-detail rail readability rebalance with a dedicated right-rail crop, evidence preview crop, follow-on bundle crop, and relations-follow-on crop beside live reading',
          'retention of the Stage 223 shell correction and Stage 225 Reader gains',
          'retention of the Stage 227 focused-source strip compression, Stage 229 split balance, Stage 249 focused Notes gains, Stage 251 focused overview gains, Stage 253 focused Study gains, Stage 263 focused Notes drawer-open empty-detail gains, Stage 281 focused Graph gains, Stage 283 focused Study gains, Stage 285 focused Graph gains, Stage 287 focused Study gains, Stage 289 focused Graph gains, Stage 291 focused Study gains, Stage 293 focused Graph gains, Stage 295 focused Graph gains, Stage 297 focused Graph gains, Stage 299 focused Graph gains, Stage 301 focused Graph gains, Stage 303 focused Graph gains, Stage 305 focused Graph gains, Stage 307 focused Graph gains, Stage 309 focused Graph gains, Stage 311 focused Graph gains, Stage 313 focused Graph gains, Stage 315 focused Graph gains, Stage 317 focused Graph gains, Stage 319 focused Graph gains, Stage 321 focused Study gains, Stage 323 focused Study gains, Stage 325 focused Study gains, Stage 327 focused Graph gains, Stage 329 focused Graph gains, Stage 331 focused Graph gains, Stage 333 focused Graph gains, Stage 335 focused Graph gains, Stage 337 focused Study gains, Stage 339 focused Graph gains, Stage 341 focused Graph gains, Stage 343 focused Study gains, Stage 345 focused Graph gains, Stage 347 focused Graph gains, Stage 349 focused Study gains, and Stage 350 validation findings',
          'neighboring focused Study, Notes, overview, and Reader stability after the focused Graph rail-readability validation',
        ],
        viewport,
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
          'stage351-bundled-narrower-width-focused-graph-node-detail-rail-readability-rebalance-after-stage350-failure.png',
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

  const viewportSize = page.viewportSize() ?? viewport
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

async function openFocusedOverview(page) {
  await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Home', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })

  const firstSourceButton = page.locator('button[aria-label^="Open "]').first()
  await firstSourceButton.waitFor({ state: 'visible', timeout: 15000 })

  const sourceLabel =
    (await firstSourceButton.getAttribute('aria-label')) ?? (await firstSourceButton.textContent()) ?? 'Source'
  const sourceTitle = sourceLabel.replace(/^Open\s+/i, '').trim() || 'Source'

  await firstSourceButton.click()
  await page.getByRole('region', { name: `${sourceTitle} workspace` }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)

  return { sourceTitle }
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
