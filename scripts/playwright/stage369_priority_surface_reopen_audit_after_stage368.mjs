import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE369_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE369_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE369_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE369_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE369_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE369_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage369-priority-surface-reopen-audit-failure.png'), {
  force: true,
})

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const { browser, runtimeBrowser } = await launchBrowser(chromium)

let desktopPage
let desktopReaderPage
try {
  desktopPage = await browser.newPage({ viewport: desktopViewport })
  await desktopPage.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await desktopPage.getByRole('heading', { name: 'Home', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(350)
  const homeWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage369-home-wide-top.png')
  const homeSnapshotWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByLabel('Collection snapshot').first(),
    outputDir,
    'stage369-home-snapshot-wide-top.png',
    720,
  )

  await desktopPage.getByRole('tab', { name: 'Graph', exact: true }).click()
  await desktopPage.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(350)
  const graphWideTop = await captureViewportScreenshot(desktopPage, outputDir, 'stage369-graph-wide-top.png')
  const graphDetailDockWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    desktopPage.getByLabel('Node detail dock').first(),
    outputDir,
    'stage369-graph-detail-dock-wide-top.png',
    760,
    'locator',
  )

  desktopReaderPage = await browser.newPage({ viewport: desktopViewport })
  const { sourceTitle } = await openReaderFromHome(desktopReaderPage)
  const readerWideTop = await captureViewportScreenshot(desktopReaderPage, outputDir, 'stage369-reader-wide-top.png')
  const readerSupportDockWideTop = await captureLocatorTopScreenshot(
    desktopReaderPage,
    await getSectionByHeading(desktopReaderPage, 'Reader dock'),
    outputDir,
    'stage369-reader-support-dock-wide-top.png',
    920,
  )

  await desktopPage.getByRole('tab', { name: 'Notes', exact: true }).click()
  await desktopPage.getByRole('heading', { name: 'Notes', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(350)
  const {
    noteDetailWideTop,
    notesBrowseRailWideTop,
    notesWideTop,
  } = await captureWideNotesArtifacts(desktopPage, outputDir, 'stage369')
  const notesContextWideTop = await captureLocatorTopScreenshot(
    desktopPage,
    await getSectionByHeading(desktopPage, 'Current context'),
    outputDir,
    'stage369-notes-context-wide-top.png',
    760,
  )

  await writeFile(
    path.join(outputDir, 'stage369-priority-surface-reopen-audit-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'wide-desktop reopen audit on Home, Graph, Reader, and Notes only',
          'Study is intentionally parked again and excluded from the active priority queue unless a direct regression is found later',
          'supporting crops show the current Home snapshot area, Graph detail dock, Reader dock, and Notes browse/detail/context balance',
          'the audit exists to choose one highest unfinished priority surface for the next broad milestone rather than restarting cross-surface hopping',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphDetailDockWideTop,
          graphWideTop,
          homeSnapshotWideTop,
          homeWideTop,
          noteDetailWideTop,
          notesBrowseRailWideTop,
          notesContextWideTop,
          notesWideTop,
          readerSupportDockWideTop,
          readerWideTop,
        },
        desktopViewport,
        headless,
        runtimeBrowser,
        sourceTitle,
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
        path: path.join(outputDir, 'stage369-priority-surface-reopen-audit-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (desktopReaderPage && desktopReaderPage !== desktopPage) {
    await desktopReaderPage
      .screenshot({
        path: path.join(outputDir, 'stage369-priority-surface-reopen-audit-failure-reader.png'),
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
  const notesBrowseSection = (await getOptionalSectionByHeading(page, 'Browse notes', 3)) ?? notesSection
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
