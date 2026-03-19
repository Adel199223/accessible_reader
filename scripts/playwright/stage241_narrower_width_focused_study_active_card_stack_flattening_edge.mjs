import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE241_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE241_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE241_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE241_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE241_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE241_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const viewport = {
  width: 820,
  height: 980,
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage241-narrower-width-focused-study-active-card-stack-flattening-failure.png'), {
  force: true,
})

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const { browser, runtimeBrowser } = await launchBrowser(chromium)

let page
try {
  page = await browser.newPage({ viewport })

  const { sourceTitle } = await openFocusedOverview(page)
  const focusedOverviewNarrowTop = await captureTopScreenshot(
    page,
    outputDir,
    'stage241-focused-overview-narrow-top.png',
  )

  await page.getByRole('tab', { name: 'Source workspace Study' }).click()
  await page.getByRole('heading', { name: 'Study queue', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
  const focusedStudyNarrowTop = await captureTopScreenshot(page, outputDir, 'stage241-focused-study-narrow-top.png')

  await page.getByRole('button', { name: 'Show answer' }).click()
  await page.waitForTimeout(350)
  const focusedStudyAnswerShownNarrowTop = await captureTopScreenshot(
    page,
    outputDir,
    'stage241-focused-study-answer-shown-narrow-top.png',
  )
  const focusedStudyAnswerShownNarrowFull = await captureFullPageScreenshot(
    page,
    outputDir,
    'stage241-focused-study-answer-shown-narrow-full.png',
  )

  await page.getByRole('button', { name: 'Show queue' }).click()
  await page.getByRole('tab', { name: 'All' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
  const focusedStudyQueueOpenNarrowTop = await captureTopScreenshot(
    page,
    outputDir,
    'stage241-focused-study-queue-open-narrow-top.png',
  )

  await page.getByRole('tab', { name: 'Source workspace Reader' }).click()
  await page.waitForURL(/\/reader/, { timeout: 20000 })
  await page.getByRole('article', { name: sourceTitle }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
  const readerNarrowTop = await captureTopScreenshot(page, outputDir, 'stage241-reader-narrow-top.png')

  await writeFile(
    path.join(outputDir, 'stage241-narrower-width-focused-study-active-card-stack-flattening-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        captures: {
          focusedOverviewNarrowTop,
          focusedStudyAnswerShownNarrowFull,
          focusedStudyAnswerShownNarrowTop,
          focusedStudyNarrowTop,
          focusedStudyQueueOpenNarrowTop,
          readerNarrowTop,
        },
        headless,
        runtimeBrowser,
        sourceTitle,
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
        path: path.join(outputDir, 'stage241-narrower-width-focused-study-active-card-stack-flattening-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function captureTopScreenshot(page, directory, filename) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath })
  return screenshotPath
}

async function captureFullPageScreenshot(page, directory, filename) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(150)
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath, fullPage: true })
  return screenshotPath
}

async function openFocusedOverview(page) {
  await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Home', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })

  const firstSourceButton = page.locator('button[aria-label^="Open "]').first()
  await firstSourceButton.waitFor({ state: 'visible', timeout: 15000 })

  const sourceLabel = (await firstSourceButton.getAttribute('aria-label')) ?? (await firstSourceButton.textContent()) ?? 'Source'
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
