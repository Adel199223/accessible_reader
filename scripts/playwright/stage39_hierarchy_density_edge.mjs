import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'


const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE39_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE39_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE39_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE39_HEADLESS === '0' ? false : true

await mkdir(outputDir, { recursive: true })

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const browser = await chromium.launch({
  channel: 'msedge',
  headless,
})

try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 980 } })

  await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.recall-source-grid .recall-source-tile:not(.recall-source-tile-add)', { timeout: 20000 })
  await page.waitForTimeout(1000)

  const landingDesktop = path.join(outputDir, 'stage39-landing-desktop.png')
  await page.screenshot({ path: landingDesktop, fullPage: true })

  await page.locator('.recall-source-grid .recall-source-tile:not(.recall-source-tile-add)').first().click()
  await page.waitForSelector('.source-workspace-frame', { timeout: 15000 })
  await page.waitForTimeout(800)

  const focusedLibraryDesktop = path.join(outputDir, 'stage39-focused-library-desktop.png')
  await page.screenshot({ path: focusedLibraryDesktop, fullPage: true })

  await page.getByRole('tab', { name: 'Source workspace Notes' }).click()
  await page.waitForSelector('h2', { timeout: 15000 })
  await page.waitForTimeout(800)

  const focusedNotesDesktop = path.join(outputDir, 'stage39-focused-notes-desktop.png')
  await page.screenshot({ path: focusedNotesDesktop, fullPage: true })

  await page.setViewportSize({ width: 1024, height: 1360 })
  await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.recall-source-grid .recall-source-tile:not(.recall-source-tile-add)', { timeout: 20000 })
  await page.waitForTimeout(1000)

  const landingTablet = path.join(outputDir, 'stage39-landing-tablet.png')
  await page.screenshot({ path: landingTablet, fullPage: true })

  await writeFile(
    path.join(outputDir, 'stage39-hierarchy-density-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        focusedLibraryDesktop,
        focusedNotesDesktop,
        headless,
        landingDesktop,
        landingTablet,
      },
      null,
      2,
    ),
    'utf8',
  )
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
