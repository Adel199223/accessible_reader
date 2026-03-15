import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'


const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE43_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE43_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE43_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE43_HEADLESS === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage43-library-selectivity-failure.png'), { force: true })

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const browser = await chromium.launch({
  channel: 'msedge',
  headless,
})

let page
try {
  page = await browser.newPage({ viewport: { width: 1600, height: 980 } })

  await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.recall-library-landing-layout', { timeout: 20000 })
  await page.waitForSelector('.recall-library-section', { timeout: 20000 })
  await page.waitForSelector('.recall-source-tile, .recall-library-list-row', { timeout: 20000 })
  await page.waitForTimeout(1200)

  if ((await page.locator('.recall-library-section').count()) < 1) {
    throw new Error('Expected Stage 43 Library landing to render grouped sections.')
  }

  const libraryDesktop = path.join(outputDir, 'stage43-library-landing-desktop.png')
  await page.screenshot({ path: libraryDesktop, fullPage: true })

  await page.getByRole('button', { name: 'Add source', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Add content' })
  await dialog.waitFor({ state: 'visible', timeout: 15000 })
  await page.waitForSelector('.import-panel-mode-tabs', { timeout: 15000 })
  const dialogHeadingCount = await dialog.getByRole('heading', { level: 2 }).count()
  if (dialogHeadingCount !== 1) {
    throw new Error(`Expected exactly one level-2 heading in the Stage 43 add-content dialog, found ${dialogHeadingCount}.`)
  }
  await page.waitForTimeout(800)

  const addContentDialog = path.join(outputDir, 'stage43-add-content-dialog-desktop.png')
  await page.screenshot({ path: addContentDialog })

  await page.keyboard.press('Escape')
  await dialog.waitFor({ state: 'hidden', timeout: 15000 })

  await page.setViewportSize({ width: 1024, height: 1360 })
  await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.recall-library-landing-layout', { timeout: 20000 })
  await page.waitForSelector('.recall-library-section', { timeout: 20000 })
  await page.waitForTimeout(1200)

  const libraryTablet = path.join(outputDir, 'stage43-library-landing-tablet.png')
  await page.screenshot({ path: libraryTablet, fullPage: true })

  await writeFile(
    path.join(outputDir, 'stage43-library-selectivity-validation.json'),
    JSON.stringify(
      {
        addContentDialog,
        baseUrl,
        headless,
        libraryDesktop,
        libraryTablet,
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  if (page) {
    await page.screenshot({
      path: path.join(outputDir, 'stage43-library-selectivity-failure.png'),
      fullPage: true,
    }).catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
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
