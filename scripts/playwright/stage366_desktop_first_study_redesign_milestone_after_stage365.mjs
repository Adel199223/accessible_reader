import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE366_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE366_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE366_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE366_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE366_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE366_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = {
  width: 1600,
  height: 1080,
}
const focusedViewport = {
  width: 820,
  height: 980,
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage366-desktop-first-study-redesign-milestone-after-stage365-failure.png'), {
  force: true,
})

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const { browser, runtimeBrowser } = await launchBrowser(chromium)

let desktopPage
let focusedPage
try {
  desktopPage = await browser.newPage({ viewport: desktopViewport })
  await openDesktopStudy(desktopPage)
  const {
    studyAnswerShownReviewLaneWideTop,
    studyAnswerShownWideTop,
    studyReviewLaneWideTop,
    studySupportDockWideTop,
    studyWideTop,
  } = await captureWideStudyArtifacts(desktopPage, outputDir, 'stage366')

  focusedPage = await browser.newPage({ viewport: focusedViewport })
  const { sourceTitle } = await openFocusedStudy(focusedPage)
  const {
    focusedStudyAnswerShownNarrowTop,
    focusedStudyNarrowTop,
  } = await captureFocusedStudyArtifacts(focusedPage, outputDir, 'stage366')

  await writeFile(
    path.join(outputDir, 'stage366-desktop-first-study-redesign-milestone-after-stage365-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          focusedStudyAnswerShownNarrowTop,
          focusedStudyNarrowTop,
          studyAnswerShownReviewLaneWideTop,
          studyAnswerShownWideTop,
          studyReviewLaneWideTop,
          studySupportDockWideTop,
          studyWideTop,
        },
        desktopViewport,
        focusedViewport,
        headless,
        runtimeBrowser,
        sourceTitle,
        validationFocus: [
          'desktop-first Study milestone validation with a wide Study top-state, a focused review-lane crop, and a support-dock crop',
          'wide Study answer-shown proof showing the active review lane and docked evidence after reveal',
          'focused and narrow Study regression captures for pre-answer and answer-shown states after the desktop redesign settles first',
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
        path: path.join(outputDir, 'stage366-desktop-first-study-redesign-milestone-after-stage365-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (focusedPage && focusedPage !== desktopPage) {
    await focusedPage
      .screenshot({
        path: path.join(
          outputDir,
          'stage366-desktop-first-study-redesign-milestone-after-stage365-failure-focused.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function openDesktopStudy(page) {
  await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await page.getByRole('tab', { name: 'Study', exact: true }).click()
  await page.getByRole('heading', { name: 'Review card', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function captureWideStudyArtifacts(page, directory, stagePrefix) {
  const reviewSection = await getSectionByHeading(page, 'Review card')
  const queueDock = page.getByLabel('Study queue support').first()
  await queueDock.waitFor({ state: 'visible', timeout: 20000 })
  const evidenceDock = page.getByLabel('Study evidence support').first()
  await evidenceDock.waitFor({ state: 'visible', timeout: 20000 })

  const studyWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-study-wide-top.png`)
  const studyReviewLaneWideTop = await captureLocatorTopScreenshot(
    page,
    reviewSection,
    directory,
    `${stagePrefix}-study-review-lane-wide-top.png`,
    960,
  )
  const studySupportDockWideTop = await captureLocatorTopScreenshot(
    page,
    page.locator('.recall-study-support-dock').first(),
    directory,
    `${stagePrefix}-study-support-dock-wide-top.png`,
    980,
  )

  await revealStudyAnswer(page)
  const studyAnswerShownWideTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-answer-shown-wide-top.png`,
  )
  const studyAnswerShownReviewLaneWideTop = await captureLocatorTopScreenshot(
    page,
    reviewSection,
    directory,
    `${stagePrefix}-study-answer-shown-review-lane-wide-top.png`,
    980,
  )

  return {
    studyAnswerShownReviewLaneWideTop,
    studyAnswerShownWideTop,
    studyReviewLaneWideTop,
    studySupportDockWideTop,
    studyWideTop,
  }
}

async function openFocusedStudy(page) {
  const { sourceTitle } = await openSourceWorkspaceFromHome(page)
  await page.getByRole('tab', { name: 'Source workspace Study' }).click()
  await page.getByRole('heading', { name: 'Study queue', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
  return { sourceTitle }
}

async function captureFocusedStudyArtifacts(page, directory, stagePrefix) {
  const focusedStudyNarrowTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-focused-study-narrow-top.png`,
  )

  await revealStudyAnswer(page)
  const focusedStudyAnswerShownNarrowTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-focused-study-answer-shown-narrow-top.png`,
  )

  return {
    focusedStudyAnswerShownNarrowTop,
    focusedStudyNarrowTop,
  }
}

async function revealStudyAnswer(page) {
  const answerButtons = [
    page.getByRole('button', { name: 'Show answer' }).first(),
    page.getByRole('button', { name: 'Reveal answer' }).first(),
  ]

  for (const answerButton of answerButtons) {
    if (await answerButton.isVisible().catch(() => false)) {
      await answerButton.click()
      break
    }
  }
  await page.getByRole('button', { name: 'Good' }).first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
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

async function getSectionByHeading(page, headingName, level = 2) {
  const heading = page.getByRole('heading', { name: headingName, level }).first()
  await heading.waitFor({ state: 'visible', timeout: 20000 })
  return heading.locator('xpath=ancestor::section[1]')
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

  const text = (await locator.textContent())?.trim()
  return text || 'Source'
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
  const channelsToTry = [preferredChannel]
  if (allowChromiumFallback && !channelsToTry.includes('chromium')) {
    channelsToTry.push('chromium')
  }

  let lastError
  for (const channel of channelsToTry) {
    try {
      const browser = await chromium.launch({
        channel,
        headless,
      })
      return {
        browser,
        runtimeBrowser: channel,
      }
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}
