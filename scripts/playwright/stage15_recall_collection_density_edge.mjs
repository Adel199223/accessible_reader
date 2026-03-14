import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'


const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE15_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE15_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE15_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE15_HEADLESS === '0' ? false : true
const smokePrefix = 'Stage 15 Collection Smoke'

await mkdir(outputDir, { recursive: true })

const playwrightModuleUrl = pathToFileURL(path.join(harnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const userDataDir = await mkdtemp(path.join(os.tmpdir(), 'accessible-reader-stage15-edge-'))
const smokeTitle = `${smokePrefix} ${Date.now()}`
const smokeText = [
  'Stage fifteen collection smoke sentence one.',
  'Stage fifteen collection smoke sentence two.',
  'Stage fifteen collection smoke sentence three.',
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

  const readerLibrarySection = await openReaderLibrary(page)
  const importedReaderItem = readerLibrarySection.locator(`[title="${smokeTitle}"]`)
  await importedReaderItem.waitFor({ state: 'visible', timeout: 15000 })
  await importedReaderItem.click()

  await page.getByRole('heading', { name: smokeTitle, level: 2 }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('button', { name: 'Add note' }).click()
  await page.getByRole('button', { name: 'Stage fifteen collection smoke sentence one.' }).click()
  await page.getByRole('button', { name: 'Stage fifteen collection smoke sentence two.' }).click()
  await page.getByRole('textbox', { name: 'Optional note' }).fill('Stage 15 smoke note body.')
  await page.getByRole('button', { name: 'Save note' }).click()
  await page.getByText('Note saved locally.').waitFor({ state: 'visible', timeout: 15000 })

  await page.goto(`${baseUrl}/recall`, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle')

  await page.getByRole('searchbox', { name: 'Filter sources' }).fill(smokeTitle)
  const librarySection = page.getByRole('heading', { name: 'Source library' }).locator('xpath=ancestor::section[1]')
  const libraryItem = librarySection.getByRole('button', { name: new RegExp(smokeTitle) })
  await libraryItem.waitFor({ state: 'visible', timeout: 15000 })
  await libraryItem.click()
  await page.getByRole('heading', { name: smokeTitle, level: 3 }).waitFor({ state: 'visible' })

  const libraryScreenshot = path.join(outputDir, 'stage15-recall-library-density.png')
  await page.screenshot({ path: libraryScreenshot, fullPage: true })

  await page.getByRole('button', { name: 'View notes' }).click()
  await page.getByRole('heading', { name: 'Promote note', level: 3 }).waitFor({ state: 'visible' })
  await page.getByRole('textbox', { name: 'Note text' }).waitFor({ state: 'visible' })

  const notesScreenshot = path.join(outputDir, 'stage15-recall-notes-density.png')
  await page.screenshot({ path: notesScreenshot, fullPage: true })

  await page.getByRole('button', { name: 'Open in Reader' }).click()
  await page.waitForURL(/\/reader\?document=/, { timeout: 15000 })
  await page.getByRole('button', { name: 'Stage fifteen collection smoke sentence one.' }).waitFor({ state: 'visible' })
  await waitForAnchoredSentence(page, 'Stage fifteen collection smoke sentence one.')
  await waitForAnchoredSentence(page, 'Stage fifteen collection smoke sentence two.')

  const readerScreenshot = path.join(outputDir, 'stage15-recall-notes-reader-handoff.png')
  await page.screenshot({ path: readerScreenshot, fullPage: true })

  await deleteSmokeDocuments(baseUrl, smokePrefix)

  const validationPath = path.join(outputDir, 'stage15-recall-collection-density-validation.json')
  await writeFile(
    validationPath,
    JSON.stringify(
      {
        baseUrl,
        headless,
        libraryScreenshot,
        notesScreenshot,
        readerScreenshot,
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
    const failureScreenshot = path.join(outputDir, 'stage15-recall-collection-density-failure.png')
    await page.screenshot({ path: failureScreenshot, fullPage: true }).catch(() => undefined)
  }
  await deleteSmokeDocuments(baseUrl, smokePrefix).catch(() => undefined)
  throw error
} finally {
  await context.close()
  await rm(userDataDir, { recursive: true, force: true })
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

async function openReaderLibrary(page) {
  const libraryHeading = page.getByRole('heading', { name: 'Source library' })
  await libraryHeading.waitFor({ state: 'visible' })
  const librarySection = libraryHeading.locator('xpath=ancestor::section[1]')
  const showButton = librarySection.getByRole('button', { name: 'Show' })
  if (await showButton.isVisible().catch(() => false)) {
    await showButton.click()
    await librarySection.getByRole('button', { name: 'Hide' }).waitFor({ state: 'visible' })
  }
  return librarySection
}

async function waitForAnchoredSentence(page, name) {
  await page.waitForFunction(
    (sentenceName) => {
      const sentence = Array.from(document.querySelectorAll('[data-reader-sentence="true"]')).find(
        (node) => node.textContent?.trim().includes(sentenceName),
      )
      return sentence?.classList.contains('reader-sentence-anchored')
    },
    name,
    { timeout: 15000 },
  )
}
