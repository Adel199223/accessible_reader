import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'


const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE18_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE18_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE18_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE18_HEADLESS === '0' ? false : true
const smokePrefix = 'Stage 18 Continuity Smoke'

await mkdir(outputDir, { recursive: true })

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const userDataDir = await mkdtemp(path.join(os.tmpdir(), 'accessible-reader-stage18-edge-'))
const smokeTitle = `${smokePrefix} ${Date.now()}`
const smokeText = [
  'Stage eighteen continuity smoke sentence one.',
  'Stage eighteen continuity smoke sentence two.',
  'Stage eighteen continuity smoke sentence three.',
].join(' ')
const notesQuery = 'Stage 18 continuity note body.'

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
  await page.getByRole('button', { name: 'Stage eighteen continuity smoke sentence one.' }).click()
  await page.getByRole('button', { name: 'Stage eighteen continuity smoke sentence two.' }).click()
  await page.getByRole('textbox', { name: 'Optional note' }).fill(notesQuery)
  await page.getByRole('button', { name: 'Save note' }).click()
  await page.getByText('Note saved locally.').waitFor({ state: 'visible', timeout: 15000 })

  await page.goto(`${baseUrl}/recall`, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle')

  const libraryFilter = page.getByRole('searchbox', { name: 'Filter sources' })
  await libraryFilter.fill(smokeTitle)
  const librarySection = page.getByRole('heading', { name: 'Source library' }).locator('xpath=ancestor::section[1]')
  const libraryItem = librarySection.getByRole('button', { name: new RegExp(smokeTitle) })
  await libraryItem.waitFor({ state: 'visible', timeout: 15000 })
  await libraryItem.click()
  await page.getByRole('heading', { name: smokeTitle, level: 3 }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('button', { name: 'View notes' }).click()

  await page.getByRole('tab', { name: 'Notes', selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  const notesSearch = page.getByRole('searchbox', { name: 'Search notes' })
  await notesSearch.fill(notesQuery)
  await page.getByRole('textbox', { name: 'Note text' }).waitFor({ state: 'visible', timeout: 15000 })

  const notesReturnScreenshot = path.join(outputDir, 'stage18-notes-continuity-before-reader.png')
  await page.screenshot({ path: notesReturnScreenshot, fullPage: true })

  await page.getByRole('button', { name: 'Open in Reader' }).click()
  await page.waitForURL(/\/reader\?document=/, { timeout: 15000 })
  await waitForAnchoredSentence(page, 'Stage eighteen continuity smoke sentence one.')
  await waitForAnchoredSentence(page, 'Stage eighteen continuity smoke sentence two.')

  await page.goBack({ waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle')

  await page.getByRole('tab', { name: 'Notes', selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  const notesSearchBox = page.getByRole('searchbox', { name: 'Search notes' })
  const noteDetailSection = page.getByRole('heading', { name: 'Note detail' }).locator('xpath=ancestor::section[1]')
  const noteDetailTextarea = noteDetailSection.locator('label:has-text("Note text") textarea')
  await notesSearchBox.waitFor({ state: 'visible' })
  await noteDetailTextarea.waitFor({ state: 'visible' })
  await page.waitForFunction(
    ({ expectedQuery }) => {
      const searchInput = Array.from(document.querySelectorAll('input, textarea')).find(
        (node) => node.getAttribute('type') === 'search' || node.getAttribute('role') === 'searchbox',
      )
      const noteLabel = Array.from(document.querySelectorAll('label')).find((node) =>
        node.textContent?.includes('Note text'),
      )
      const noteTextarea = noteLabel?.querySelector('textarea')
      return searchInput instanceof HTMLInputElement && noteTextarea instanceof HTMLTextAreaElement
        ? searchInput.value === expectedQuery && noteTextarea.value === expectedQuery
        : false
    },
    { expectedQuery: notesQuery },
    { timeout: 15000 },
  )

  const notesContinuitySearchValue = await notesSearchBox.inputValue()
  const notesContinuityBodyValue = await noteDetailTextarea.inputValue()

  if (notesContinuitySearchValue !== notesQuery) {
    throw new Error(`Notes search continuity failed: expected "${notesQuery}", got "${notesContinuitySearchValue}"`)
  }
  if (notesContinuityBodyValue !== notesQuery) {
    throw new Error(`Notes detail continuity failed: expected "${notesQuery}", got "${notesContinuityBodyValue}"`)
  }

  const notesAfterReaderScreenshot = path.join(outputDir, 'stage18-notes-continuity-after-reader.png')
  await page.screenshot({ path: notesAfterReaderScreenshot, fullPage: true })

  await page.getByRole('tab', { name: 'Library' }).click()
  await page.getByRole('tab', { name: 'Library', selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('heading', { name: smokeTitle, level: 3 }).waitFor({ state: 'visible', timeout: 15000 })

  const libraryContinuityValue = await page.getByRole('searchbox', { name: 'Filter sources' }).inputValue()
  if (libraryContinuityValue !== smokeTitle) {
    throw new Error(`Library filter continuity failed: expected "${smokeTitle}", got "${libraryContinuityValue}"`)
  }

  const libraryAfterReturnScreenshot = path.join(outputDir, 'stage18-library-continuity-after-return.png')
  await page.screenshot({ path: libraryAfterReturnScreenshot, fullPage: true })

  await deleteSmokeDocuments(baseUrl, smokePrefix)

  const validationPath = path.join(outputDir, 'stage18-workspace-continuity-validation.json')
  await writeFile(
    validationPath,
    JSON.stringify(
      {
        baseUrl,
        headless,
        smokeTitle,
        notesQuery,
        notesReturnScreenshot,
        notesAfterReaderScreenshot,
        libraryAfterReturnScreenshot,
        url: page.url(),
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  if (page) {
    const failureScreenshot = path.join(outputDir, 'stage18-workspace-continuity-failure.png')
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
