import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'


const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE40_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE40_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE40_BASE_URL ?? 'http://127.0.0.1:5173'
const headless = process.env.RECALL_STAGE40_HEADLESS === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage40-benchmark-audit-failure.png'), { force: true })

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
  await page.waitForSelector('.recall-source-grid', { timeout: 20000 })
  await page.waitForTimeout(1200)

  const libraryDesktop = path.join(outputDir, 'stage40-library-landing-desktop.png')
  await page.screenshot({ path: libraryDesktop, fullPage: true })

  await page.getByRole('button', { name: 'New', exact: true }).click()
  await page.getByRole('dialog', { name: 'Add source' }).waitFor({ state: 'visible', timeout: 15000 })
  await page.waitForTimeout(800)

  const addSourceDialog = path.join(outputDir, 'stage40-add-source-dialog-desktop.png')
  await page.screenshot({ path: addSourceDialog })

  await page.keyboard.press('Escape')
  await page.getByRole('dialog', { name: 'Add source' }).waitFor({ state: 'hidden', timeout: 15000 })

  await page.getByRole('tab', { name: 'Graph', exact: true }).click()
  await page.getByRole('heading', { name: 'Knowledge graph', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })
  await page.waitForTimeout(1000)

  const graphDesktop = path.join(outputDir, 'stage40-graph-desktop.png')
  await page.screenshot({ path: graphDesktop, fullPage: true })

  await page.getByRole('tab', { name: 'Study', exact: true }).click()
  await page.getByRole('heading', { name: 'Study queue', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })
  await page.waitForTimeout(1000)

  const studyDesktop = path.join(outputDir, 'stage40-study-desktop.png')
  await page.screenshot({ path: studyDesktop, fullPage: true })

  await page.getByRole('tab', { name: 'Library', exact: true }).click()
  await page.waitForSelector('.recall-source-grid .recall-source-tile:not(.recall-source-tile-add)', { timeout: 20000 })
  await page.locator('.recall-source-grid .recall-source-tile:not(.recall-source-tile-add)').first().click()
  await page.waitForSelector('.source-workspace-frame', { timeout: 15000 })
  await page.getByRole('tab', { name: 'Source workspace Notes' }).click()
  await page.getByRole('heading', { name: 'Reader', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })
  await page.waitForTimeout(1000)

  const focusedNotesDesktop = path.join(outputDir, 'stage40-focused-notes-desktop.png')
  await page.screenshot({ path: focusedNotesDesktop })

  await page.setViewportSize({ width: 1024, height: 1360 })
  await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.recall-source-grid', { timeout: 20000 })
  await page.waitForTimeout(1200)

  const libraryTablet = path.join(outputDir, 'stage40-library-landing-tablet.png')
  await page.screenshot({ path: libraryTablet, fullPage: true })

  await writeFile(
    path.join(outputDir, 'stage40-benchmark-audit-validation.json'),
    JSON.stringify(
      {
        addSourceDialog,
        baseUrl,
        focusedNotesDesktop,
        graphDesktop,
        headless,
        libraryDesktop,
        libraryTablet,
        studyDesktop,
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  if (page) {
    await page.screenshot({
      path: path.join(outputDir, 'stage40-benchmark-audit-failure.png'),
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
