import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE362_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE362_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE362_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE362_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE362_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE362_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}
const focusedViewport = {
  width: 820,
  height: 980,
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage362-post-stage361-notes-milestone-audit-failure.png'), {
  force: true,
})

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const { browser, runtimeBrowser } = await launchBrowser(chromium)

let desktopPage
let desktopReaderPage
let focusedPage
try {
  desktopPage = await browser.newPage({ viewport: desktopViewport })
  await desktopPage.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await desktopPage.getByRole('heading', { name: 'Home', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(350)
  const desktopHomeWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage362-home-wide-top.png')

  await desktopPage.getByRole('tab', { name: 'Graph', exact: true }).click()
  await desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(350)
  const desktopGraphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage362-graph-wide-top.png')

  desktopReaderPage = await browser.newPage({ viewport: desktopViewport })
  const { sourceTitle } = await openReaderFromHome(desktopReaderPage)
  const desktopReaderWideTop = await captureViewportScreenshot(
    desktopReaderPage,
    outputDir,
    'stage362-reader-wide-top.png',
  )

  await desktopPage.getByRole('tab', { name: 'Notes', exact: true }).click()
  await desktopPage.getByRole('heading', { name: 'Notes', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(350)
  const {
    noteDetailWideTop,
    notesBrowseRailWideTop,
    notesWideTop,
  } = await captureWideNotesArtifacts(desktopPage, outputDir, 'stage362')

  await desktopPage.getByRole('tab', { name: 'Study', exact: true }).click()
  await desktopPage.getByRole('heading', { name: 'Review card', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(350)
  const desktopStudyWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage362-study-wide-top.png')

  focusedPage = await browser.newPage({ viewport: focusedViewport })
  const { sourceTitle: focusedSourceTitle } = await openSourceWorkspaceFromHome(focusedPage)
  const focusedOverviewNarrowTop = await captureViewportScreenshot(
    focusedPage,
    outputDir,
    'stage362-focused-overview-narrow-top.png',
  )

  await focusedPage.getByRole('tab', { name: 'Source workspace Graph' }).click()
  await focusedPage.getByRole('heading', { name: 'Node detail', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await focusedPage.waitForTimeout(350)
  const focusedGraphNarrowTop = await captureViewportScreenshot(
    focusedPage,
    outputDir,
    'stage362-focused-graph-narrow-top.png',
  )

  await focusedPage.getByRole('tab', { name: 'Source workspace Notes' }).click()
  await focusedPage.getByRole('heading', { name: 'Notes', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await focusedPage.waitForTimeout(350)
  const {
    focusedNotesDrawerOpenNarrowTop,
    focusedNotesNarrowTop,
  } = await captureFocusedNotesRegressionArtifacts(focusedPage, outputDir, 'stage362')

  await focusedPage.getByRole('tab', { name: 'Source workspace Study' }).click()
  await focusedPage.getByRole('heading', { name: 'Study queue', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await focusedPage.waitForTimeout(350)
  const focusedStudyNarrowTop = await captureViewportScreenshot(
    focusedPage,
    outputDir,
    'stage362-focused-study-narrow-top.png',
  )

  await focusedPage.getByRole('tab', { name: 'Source workspace Reader' }).click()
  await focusedPage.waitForURL(/\/reader/, { timeout: 20000 })
  await focusedPage.locator('article').first().waitFor({ state: 'visible', timeout: 20000 })
  await focusedPage.getByLabel('Read aloud transport').waitFor({ state: 'visible', timeout: 20000 })
  await focusedPage.waitForTimeout(350)
  const focusedReaderNarrowTop = await captureViewportScreenshot(
    focusedPage,
    outputDir,
    'stage362-focused-reader-narrow-top.png',
  )

  await writeFile(
    path.join(outputDir, 'stage362-post-stage361-notes-milestone-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'full Notes milestone audit with wide desktop Home, Graph, Reader, Notes, and Study captures in that order',
          'Notes-specific wide desktop milestone crops for the browse rail and note detail while Home, Graph, Reader, and Study stay regression-only',
          'focused regressions second: overview, Graph, Notes default, Notes drawer-open Search notes, Study, and Reader',
          'Notes remains the active milestone under judgment while neighboring surfaces are checked for drift only',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          desktopGraphWideTop,
          desktopHomeWideTop,
          desktopReaderWideTop,
          desktopStudyWideTop,
          focusedGraphNarrowTop,
          focusedNotesDrawerOpenNarrowTop,
          focusedNotesNarrowTop,
          focusedOverviewNarrowTop,
          focusedReaderNarrowTop,
          focusedStudyNarrowTop,
          noteDetailWideTop,
          notesBrowseRailWideTop,
          notesWideTop,
        },
        desktopViewport,
        focusedViewport,
        headless,
        runtimeBrowser,
        sourceTitle,
        focusedSourceTitle,
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
        path: path.join(outputDir, 'stage362-post-stage361-notes-milestone-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (desktopReaderPage && desktopReaderPage !== desktopPage) {
    await desktopReaderPage
      .screenshot({
        path: path.join(outputDir, 'stage362-post-stage361-notes-milestone-audit-failure-reader.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (focusedPage && focusedPage !== desktopPage) {
    await focusedPage
      .screenshot({
        path: path.join(outputDir, 'stage362-post-stage361-notes-milestone-audit-failure-focused.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function captureWideNotesArtifacts(page, directory, stagePrefix) {
  const notesSection = await getSectionByHeading(page, 'Notes')
  const notesBrowseSection = await getOptionalSectionByHeading(page, 'Browse notes', 3) ?? notesSection
  await ensureNotesDrawerOpen(page, notesSection)
  await ensureNoteSelection(page, notesBrowseSection)
  const noteDetailSection = await getSectionByHeading(page, 'Note detail')

  const notesWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-notes-wide-top.png`)
  const notesBrowseRailWideTop = await captureLocatorTopScreenshot(
    page,
    notesBrowseSection,
    directory,
    `${stagePrefix}-notes-browse-rail-wide-top.png`,
    960,
  )
  const noteDetailWideTop = await captureLocatorTopScreenshot(
    page,
    noteDetailSection,
    directory,
    `${stagePrefix}-note-detail-wide-top.png`,
    980,
  )

  return {
    noteDetailWideTop,
    notesBrowseRailWideTop,
    notesWideTop,
  }
}

async function captureFocusedNotesRegressionArtifacts(page, directory, stagePrefix) {
  const notesSection = await getSectionByHeading(page, 'Notes')
  const focusedNotesNarrowTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-focused-notes-narrow-top.png`,
  )

  await ensureNotesDrawerOpen(page, notesSection)
  await page.waitForTimeout(250)
  const focusedNotesDrawerOpenNarrowTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-focused-notes-drawer-open-narrow-top.png`,
  )

  return {
    focusedNotesDrawerOpenNarrowTop,
    focusedNotesNarrowTop,
  }
}

async function captureViewportScreenshot(page, directory, filename) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath })
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

async function getSectionByHeading(page, headingName, level = 2) {
  const heading = page.getByRole('heading', { name: headingName, level }).first()
  await heading.waitFor({ state: 'visible', timeout: 20000 })
  return heading.locator('xpath=ancestor::section[1]')
}

async function getOptionalSectionByHeading(page, headingName, level = 2) {
  const heading = page.getByRole('heading', { name: headingName, level }).first()
  if ((await heading.count()) === 0) {
    return null
  }
  await heading.waitFor({ state: 'visible', timeout: 20000 })
  return heading.locator('xpath=ancestor::section[1]')
}

async function ensureNotesDrawerOpen(page, notesSection) {
  const searchBox = page.getByRole('searchbox', { name: 'Search notes' }).first()
  if (await searchBox.isVisible().catch(() => false)) {
    return
  }

  const showButton = notesSection.getByRole('button', { name: 'Show', exact: true })
  if (await showButton.isVisible().catch(() => false)) {
    await showButton.click()
  }
  await searchBox.waitFor({ state: 'visible', timeout: 20000 })
}

async function ensureNoteSelection(page, notesSection) {
  const openInReaderButton = page.getByRole('button', { name: 'Open in Reader' })
  if (await openInReaderButton.isVisible().catch(() => false)) {
    return
  }

  const noteRow = notesSection.locator('.recall-document-list button').first()
  if ((await noteRow.count()) > 0) {
    await noteRow.click()
    await page.waitForTimeout(250)
  }
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
