import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE141_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE141_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE141_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE141_HEADLESS === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage141-graph-intro-shell-demotion-failure.png'), { force: true })

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
  await page.getByRole('heading', { name: 'Home', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(1200)

  const homeDesktop = path.join(outputDir, 'stage141-home-landing-desktop.png')
  await page.screenshot({ path: homeDesktop, fullPage: true })

  await page.getByRole('tab', { name: 'Graph', exact: true }).click()
  await page.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(1000)

  const graphDesktop = path.join(outputDir, 'stage141-graph-browse-desktop.png')
  await page.screenshot({ path: graphDesktop, fullPage: true })

  await page.getByRole('tab', { name: 'Study', exact: true }).click()
  await page.getByRole('heading', { name: 'Review card', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(1000)

  const studyDesktop = path.join(outputDir, 'stage141-study-browse-desktop.png')
  await page.screenshot({ path: studyDesktop, fullPage: true })

  await page.getByRole('tab', { name: 'Home', exact: true }).click()
  await page.getByRole('heading', { name: 'Home', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })

  const firstSourceButton = page.locator('button[aria-label^="Open "]').first()
  await firstSourceButton.waitFor({ state: 'visible', timeout: 15000 })
  await firstSourceButton.click()
  await page.getByRole('tab', { name: 'Source workspace Study' }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('tab', { name: 'Source workspace Study' }).click()
  await page.getByRole('heading', { name: 'Reader', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('heading', { name: 'Active card', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })
  await page.waitForTimeout(1000)

  const focusedStudyDesktop = path.join(outputDir, 'stage141-focused-study-desktop.png')
  await page.screenshot({ path: focusedStudyDesktop, fullPage: true })

  await writeFile(
    path.join(outputDir, 'stage141-graph-intro-shell-demotion-validation.json'),
    JSON.stringify(
      {
        baseUrl,
        focusedStudyDesktop,
        graphDesktop,
        headless,
        homeDesktop,
        studyDesktop,
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
        path: path.join(outputDir, 'stage141-graph-intro-shell-demotion-failure.png'),
        fullPage: true,
      })
      .catch(() => undefined)
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
