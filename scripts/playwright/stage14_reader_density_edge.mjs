import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'


const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE14_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE14_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE14_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE14_HEADLESS === '0' ? false : true
const smokePrefix = 'Stage 14 Density Smoke'

await mkdir(outputDir, { recursive: true })

const playwrightModuleUrl = pathToFileURL(path.join(harnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const userDataDir = await mkdtemp(path.join(os.tmpdir(), 'accessible-reader-stage14-edge-'))
const smokeTitle = `${smokePrefix} ${Date.now()}`
const smokeText = [
  'Stage fourteen smoke sentence one.',
  'Stage fourteen smoke sentence two.',
  'Stage fourteen smoke sentence three.',
].join(' ')

const context = await chromium.launchPersistentContext(userDataDir, {
  channel: 'msedge',
  headless,
  viewport: { width: 1440, height: 1180 },
})

let page
try {
  await deleteSmokeDocuments(baseUrl, smokePrefix)

  page = await context.newPage()
  await page.goto(`${baseUrl}/reader`, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle')

  await page.getByRole('button', { name: 'New', exact: true }).click()
  await page.getByRole('dialog', { name: 'Add source' }).waitFor({ state: 'visible' })
  await page.getByPlaceholder('Optional title').fill(smokeTitle)
  await page.getByPlaceholder('Paste text here').fill(smokeText)
  await page.getByRole('button', { name: 'Import text' }).click()

  const librarySection = await openLibrary(page)
  const importedDocumentButton = librarySection.locator(`[title="${smokeTitle}"]`)
  await importedDocumentButton.waitFor({ state: 'visible', timeout: 15000 })
  await importedDocumentButton.click()
  await page.getByRole('heading', { name: smokeTitle, level: 2 }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('heading', { name: 'Current source', level: 3 }).waitFor({ state: 'visible' })
  await page.getByRole('button', { name: 'View notes' }).waitFor({ state: 'visible' })

  const desktopScreenshot = path.join(outputDir, 'stage14-reader-density-desktop.png')
  await page.screenshot({ path: desktopScreenshot, fullPage: true })

  await page.setViewportSize({ width: 920, height: 1280 })
  await page.getByRole('heading', { name: 'Reading context', level: 2 }).waitFor({ state: 'visible' })
  const narrowScreenshot = path.join(outputDir, 'stage14-reader-density-narrow.png')
  await page.screenshot({ path: narrowScreenshot, fullPage: true })

  await deleteSmokeDocuments(baseUrl, smokePrefix)

  const validationPath = path.join(outputDir, 'stage14-reader-density-validation.json')
  await writeFile(
    validationPath,
    JSON.stringify(
      {
        baseUrl,
        desktopScreenshot,
        headless,
        narrowScreenshot,
        smokeTitle,
        url: page.url(),
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  if (page) {
    const failureScreenshot = path.join(outputDir, 'stage14-reader-density-failure.png')
    await page.screenshot({ path: failureScreenshot, fullPage: true }).catch(() => undefined)
  }
  throw error
} finally {
  await context.close()
  await rm(userDataDir, { recursive: true, force: true })
}


async function openLibrary(page) {
  const sourceLibraryHeading = page.getByRole('heading', { name: 'Source library' })
  await sourceLibraryHeading.waitFor({ state: 'visible' })
  const sourceLibrarySection = sourceLibraryHeading.locator('xpath=ancestor::section[1]')
  const showButton = sourceLibrarySection.getByRole('button', { name: 'Show' })
  if (await showButton.isVisible().catch(() => false)) {
    await showButton.click()
    await sourceLibrarySection.getByRole('button', { name: 'Hide' }).waitFor({ state: 'visible' })
  }
  return sourceLibrarySection
}

async function deleteSmokeDocuments(baseUrl, titlePrefix) {
  const response = await fetch(`${baseUrl}/api/documents?query=${encodeURIComponent(titlePrefix)}`)
  if (!response.ok) {
    throw new Error(`Could not query smoke documents: ${response.status}`)
  }
  const documents = await response.json()
  const smokeDocuments = documents.filter((document) => document.title?.startsWith(titlePrefix))
  for (const document of smokeDocuments) {
    const deleteResponse = await fetch(`${baseUrl}/api/documents/${document.id}`, { method: 'DELETE' })
    if (!deleteResponse.ok) {
      throw new Error(`Could not delete smoke document ${document.id}: ${deleteResponse.status}`)
    }
  }
}
