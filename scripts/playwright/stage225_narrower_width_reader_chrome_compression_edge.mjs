import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE225_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE225_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE225_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE225_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE225_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE225_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const viewport = {
  width: 820,
  height: 980,
}

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage225-narrower-width-reader-chrome-compression-failure.png'), { force: true })

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const { browser, runtimeBrowser } = await launchBrowser(chromium)

let page
try {
  page = await browser.newPage({ viewport })

  const { sourceTitle } = await openReader(page)
  const readerNarrowTop = await captureScreenshot(page, outputDir, 'stage225-reader-narrow-top.png')

  await page.getByLabel('Read aloud controls').scrollIntoViewIfNeeded()
  await page.waitForTimeout(200)
  await page.getByRole('button', { name: 'More reading controls' }).click()
  await page.getByRole('group', { name: 'More reading controls' }).waitFor({ state: 'visible', timeout: 10000 })
  await page.waitForTimeout(250)
  const readerNarrowOverflowOpen = await captureScreenshot(
    page,
    outputDir,
    'stage225-reader-narrow-overflow-open.png',
  )

  await page.keyboard.press('Escape')
  await page.waitForTimeout(250)
  const readerNarrowFull = await captureScreenshot(page, outputDir, 'stage225-reader-narrow-full.png', {
    fullPage: true,
  })

  await writeFile(
    path.join(outputDir, 'stage225-narrower-width-reader-chrome-compression-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        captures: {
          readerNarrowFull,
          readerNarrowOverflowOpen,
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
        path: path.join(outputDir, 'stage225-narrower-width-reader-chrome-compression-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function captureScreenshot(page, directory, filename, options = {}) {
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ path: screenshotPath, ...options })
  return screenshotPath
}

async function openReader(page) {
  await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Home', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })

  const firstSourceButton = page.locator('button[aria-label^="Open "]').first()
  await firstSourceButton.waitFor({ state: 'visible', timeout: 15000 })

  const sourceLabel = (await firstSourceButton.getAttribute('aria-label')) ?? (await firstSourceButton.textContent()) ?? 'Source'
  const sourceTitle = sourceLabel.replace(/^Open\s+/i, '').trim() || 'Source'

  await firstSourceButton.click()
  await page.getByRole('region', { name: `${sourceTitle} workspace` }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('button', { name: 'Open in Reader' }).first().click()
  await page.waitForURL(/\/reader/, { timeout: 20000 })
  await page.getByRole('article', { name: sourceTitle }).waitFor({ state: 'visible', timeout: 20000 })
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(900)

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
