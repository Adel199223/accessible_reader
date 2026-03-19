import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE221_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE221_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE221_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE221_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE221_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE221_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage221-home-expanded-earlier-state-rebalancing-failure.png'), { force: true })

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const { browser, runtimeBrowser } = await launchBrowser(chromium)

let page
try {
  page = await browser.newPage({ viewport: { width: 1600, height: 1020 } })

  await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Home', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(1200)

  const homeDesktop = await captureScreenshot(page, outputDir, 'stage221-home-desktop.png')

  let homeExpandedDesktop = null
  const showMoreEarlierButton = page.getByRole('button', { name: /show all \d+ earlier sources/i })
  if ((await showMoreEarlierButton.count()) > 0) {
    await showMoreEarlierButton.first().click()
    await page.waitForTimeout(900)
    homeExpandedDesktop = await captureScreenshot(page, outputDir, 'stage221-home-expanded-desktop.png')
  }

  await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Home', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(900)

  const { sourceTitle } = await openFirstSource(page)
  const focusedOverviewDesktop = await captureScreenshot(page, outputDir, 'stage221-focused-source-overview-desktop.png')

  await writeFile(
    path.join(outputDir, 'stage221-home-expanded-earlier-state-rebalancing-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        captures: {
          focusedOverviewDesktop,
          homeDesktop,
          homeExpandedDesktop,
        },
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
  if (page) {
    await page
      .screenshot({
        path: path.join(outputDir, 'stage221-home-expanded-earlier-state-rebalancing-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function captureScreenshot(page, directory, filename) {
  const screenshotPath = path.join(directory, filename)
  await page.screenshot({ fullPage: true, path: screenshotPath })
  return screenshotPath
}

async function openFirstSource(page) {
  const firstSourceButton = page.locator('button[aria-label^="Open "]').first()
  await firstSourceButton.waitFor({ state: 'visible', timeout: 15000 })

  const sourceLabel = (await firstSourceButton.getAttribute('aria-label')) ?? (await firstSourceButton.textContent()) ?? 'Source'
  const sourceTitle = sourceLabel.replace(/^Open\s+/i, '').trim() || 'Source'

  await firstSourceButton.click()
  const sourceWorkspace = page.getByRole('region', { name: `${sourceTitle} workspace` })
  await sourceWorkspace.waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(900)

  return { sourceTitle, sourceWorkspace }
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
