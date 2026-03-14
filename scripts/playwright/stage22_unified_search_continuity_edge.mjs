import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'


const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE22_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE22_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE22_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE22_HEADLESS === '0' ? false : true
const smokePrefix = 'Stage 22 Search Smoke'

await mkdir(outputDir, { recursive: true })

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const userDataDir = await mkdtemp(path.join(os.tmpdir(), 'accessible-reader-stage22-edge-'))
const smokeTitle = `${smokePrefix} ${Date.now()}`
const sentences = [
  'Stage twenty-two search sentence one.',
  'Stage twenty-two search sentence two.',
  'Stage twenty-two search sentence three.',
]
const smokeText = sentences.join(' ')
const noteAnchorText = `${sentences[0]} ${sentences[1]}`
const noteBody = 'Stage 22 search note body.'

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
  await page.getByRole('dialog', { name: 'Add source' }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByPlaceholder('Optional title').fill(smokeTitle)
  await page.getByPlaceholder('Paste text here').fill(smokeText)
  await page.getByRole('button', { name: 'Import text' }).click()

  await page.getByRole('heading', { name: smokeTitle, level: 2 }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('button', { name: 'Add note' }).click()
  await page.getByRole('button', { name: sentences[0] }).click()
  await page.getByRole('button', { name: sentences[1] }).click()
  await page.getByRole('textbox', { name: 'Optional note' }).fill(noteBody)
  await page.getByRole('button', { name: 'Save note' }).click()
  await page.getByText('Note saved locally.').waitFor({ state: 'visible', timeout: 15000 })

  await page.getByRole('tab', { name: 'Library' }).click()
  await page.waitForURL(/\/recall$/, { timeout: 15000 })
  await page.getByRole('tab', { name: 'Library', selected: true }).waitFor({ state: 'visible', timeout: 15000 })

  const searchSection = page.getByRole('heading', { name: 'Search workspace', level: 2 }).locator('xpath=ancestor::section[1]')
  const panelSearchBox = searchSection.getByRole('searchbox', { name: 'Search workspace' })
  await panelSearchBox.fill(smokeTitle)

  const sourcesSection = searchSection.getByRole('heading', { name: 'Sources', level: 3 }).locator('xpath=ancestor::section[1]')
  const sourceResultButton = sourcesSection.getByRole('button', { name: new RegExp(escapeRegex(smokeTitle)) })
  await sourceResultButton.waitFor({ state: 'visible', timeout: 15000 })

  const libraryScreenshot = path.join(outputDir, 'stage22-search-library.png')
  await page.screenshot({ path: libraryScreenshot, fullPage: true })

  await page.getByRole('button', { name: /Search\s*Ctrl\+K/i }).click()
  const searchDialog = page.getByRole('dialog', { name: 'Search your workspace' })
  await searchDialog.waitFor({ state: 'visible', timeout: 15000 })
  await searchDialog.getByRole('searchbox', { name: 'Search' }).waitFor({ state: 'visible', timeout: 15000 })
  const dialogQuery = await searchDialog.getByRole('searchbox', { name: 'Search' }).inputValue()
  if (dialogQuery !== smokeTitle) {
    throw new Error(`Expected dialog to remember "${smokeTitle}", got "${dialogQuery}"`)
  }
  await searchDialog.getByRole('button', { name: 'Open in Reader' }).waitFor({ state: 'visible', timeout: 15000 })

  const dialogScreenshot = path.join(outputDir, 'stage22-search-dialog.png')
  await page.screenshot({ path: dialogScreenshot, fullPage: true })

  await searchDialog.getByRole('button', { name: 'Close' }).click()
  await searchDialog.waitFor({ state: 'hidden', timeout: 15000 })

  await panelSearchBox.fill(noteBody)
  const notesSection = searchSection.getByRole('heading', { name: 'Notes', level: 3 }).locator('xpath=ancestor::section[1]')
  const noteResultButton = notesSection.getByRole('button', { name: new RegExp(escapeRegex(noteAnchorText)) })
  await noteResultButton.waitFor({ state: 'visible', timeout: 15000 })
  await noteResultButton.click()
  await searchSection.getByRole('button', { name: 'Open note' }).click()

  await page.getByRole('tab', { name: 'Notes', selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  const noteDetail = page.getByRole('heading', { name: 'Note detail', level: 2 }).locator('xpath=ancestor::section[1]')
  await noteDetail.locator('label:has-text("Note text") textarea').waitFor({ state: 'visible', timeout: 15000 })
  const storedNoteBody = await noteDetail.locator('label:has-text("Note text") textarea').inputValue()
  if (storedNoteBody !== noteBody) {
    throw new Error(`Expected Notes detail to preserve "${noteBody}", got "${storedNoteBody}"`)
  }

  await page.getByRole('button', { name: /Search\s*Ctrl\+K/i }).click()
  await searchDialog.waitFor({ state: 'visible', timeout: 15000 })
  const resumedQuery = await searchDialog.getByRole('searchbox', { name: 'Search' }).inputValue()
  if (resumedQuery !== noteBody) {
    throw new Error(`Expected dialog to preserve note query "${noteBody}", got "${resumedQuery}"`)
  }

  const dialogNotesSection = searchDialog.getByRole('heading', { name: 'Notes', level: 3 }).locator('xpath=ancestor::section[1]')
  await dialogNotesSection.getByRole('button', { name: new RegExp(escapeRegex(noteAnchorText)) }).click()
  await searchDialog.getByRole('button', { name: 'Open in Reader' }).click()

  await page.waitForURL(/\/reader\?document=/, { timeout: 15000 })
  await page.getByRole('tab', { name: 'Reader', selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  const firstSentence = page.locator('[data-reader-sentence="true"][data-sentence-index="0"]')
  const secondSentence = page.locator('[data-reader-sentence="true"][data-sentence-index="1"]')
  await firstSentence.waitFor({ state: 'visible', timeout: 15000 })
  await secondSentence.waitFor({ state: 'visible', timeout: 15000 })

  const firstSentenceClass = await firstSentence.getAttribute('class')
  const secondSentenceClass = await secondSentence.getAttribute('class')
  if (!firstSentenceClass?.includes('reader-sentence-anchored') || !secondSentenceClass?.includes('reader-sentence-anchored')) {
    throw new Error('Expected anchored Reader reopen to highlight the saved note sentence range.')
  }

  const readerScreenshot = path.join(outputDir, 'stage22-search-reader.png')
  await page.screenshot({ path: readerScreenshot, fullPage: true })
  const anchoredReaderUrl = page.url()

  await page.getByRole('tab', { name: 'Library' }).click()
  await page.getByRole('tab', { name: 'Library', selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  const restoredPanelQuery = await searchSection.getByRole('searchbox', { name: 'Search workspace' }).inputValue()
  if (restoredPanelQuery !== noteBody) {
    throw new Error(`Expected Library search panel to preserve "${noteBody}", got "${restoredPanelQuery}"`)
  }

  await deleteSmokeDocuments(baseUrl, smokePrefix)

  const validationPath = path.join(outputDir, 'stage22-search-continuity-validation.json')
  await writeFile(
    validationPath,
    JSON.stringify(
      {
        anchoredReaderUrl,
        baseUrl,
        dialogScreenshot,
        finalLibraryUrl: page.url(),
        headless,
        libraryScreenshot,
        noteAnchorText,
        noteBody,
        readerScreenshot,
        smokeTitle,
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  if (page) {
    const failureScreenshot = path.join(outputDir, 'stage22-search-continuity-failure.png')
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

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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
