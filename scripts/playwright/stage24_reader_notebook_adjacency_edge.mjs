import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'


const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE24_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE24_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE24_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE24_HEADLESS === '0' ? false : true
const smokePrefix = 'Stage 24 Notebook Smoke'

await mkdir(outputDir, { recursive: true })

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const userDataDir = await mkdtemp(path.join(os.tmpdir(), 'accessible-reader-stage24-edge-'))
const smokeTitle = `${smokePrefix} ${Date.now()}`
const sentences = [
  'Stage twenty-four notebook sentence one.',
  'Stage twenty-four notebook sentence two.',
  'Stage twenty-four notebook sentence three.',
]
const smokeText = sentences.join(' ')
const initialNoteBody = 'Stage 24 note body.'
const updatedNoteBody = 'Stage 24 updated note body.'
const graphLabel = 'Notebook takeaway'
const graphDescription = 'Promoted directly from the Reader note workbench.'
const studyPrompt = 'What should you remember from this note?'
const studyAnswer = 'Stage twenty-four notebook sentence two.'

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
  await page.getByRole('textbox', { name: 'Optional note' }).fill(initialNoteBody)
  await page.getByRole('button', { name: 'Save note' }).click()
  await page.getByText('Note saved locally.').waitFor({ state: 'visible', timeout: 15000 })

  const readerNoteText = page.getByRole('textbox', { name: 'Note text' })
  await readerNoteText.waitFor({ state: 'visible', timeout: 15000 })
  if ((await readerNoteText.inputValue()) !== initialNoteBody) {
    throw new Error(`Expected Reader note workbench to show "${initialNoteBody}".`)
  }

  await readerNoteText.fill(updatedNoteBody)
  await page.getByRole('button', { name: 'Save changes' }).click()
  await page.getByText('Note saved locally.').waitFor({ state: 'visible', timeout: 15000 })

  await page.getByRole('button', { name: 'Promote to Graph' }).click()
  const graphLabelInput = page.locator('label:has-text("Graph label") input')
  await graphLabelInput.waitFor({ state: 'visible', timeout: 15000 })
  await graphLabelInput.fill(graphLabel)
  await page.locator('label:has-text("Graph description") textarea').fill(graphDescription)
  await page.getByRole('button', { name: 'Promote node' }).click()
  await page.getByText('Graph node created from the note.').waitFor({ state: 'visible', timeout: 15000 })

  await page.getByRole('button', { name: 'Create Study Card' }).click()
  const studyPromptInput = page.locator('label:has-text("Study prompt") textarea')
  await studyPromptInput.waitFor({ state: 'visible', timeout: 15000 })
  await studyPromptInput.fill(studyPrompt)
  await page.locator('label:has-text("Study answer") textarea').fill(studyAnswer)
  await page.getByRole('button', { name: 'Create card' }).click()
  await page.getByText('Study card created from the note.').waitFor({ state: 'visible', timeout: 15000 })

  const readerWorkbenchScreenshot = path.join(outputDir, 'stage24-reader-notebook-workbench.png')
  await page.screenshot({ path: readerWorkbenchScreenshot, fullPage: true })

  await page.getByRole('button', { name: 'Open in Notes' }).click()
  await page.waitForURL(/\/recall$/, { timeout: 15000 })
  await page.getByRole('tab', { name: 'Notes', selected: true }).waitFor({ state: 'visible', timeout: 15000 })

  const noteDetailSection = page.getByRole('heading', { name: 'Note detail', level: 2 }).locator('xpath=ancestor::section[1]')
  const recallNoteText = noteDetailSection.locator('label:has-text("Note text") textarea')
  await recallNoteText.waitFor({ state: 'visible', timeout: 15000 })
  if ((await recallNoteText.inputValue()) !== updatedNoteBody) {
    throw new Error(`Expected Notes section to keep "${updatedNoteBody}" after Reader save.`)
  }

  const notesScreenshot = path.join(outputDir, 'stage24-reader-notebook-notes.png')
  await page.screenshot({ path: notesScreenshot, fullPage: true })

  await noteDetailSection.getByRole('button', { name: 'Open in Reader' }).click()
  await page.waitForURL(/\/reader\?document=/, { timeout: 15000 })
  await page.getByRole('tab', { name: 'Reader', selected: true }).waitFor({ state: 'visible', timeout: 15000 })

  const firstSentence = page.locator('[data-reader-sentence="true"][data-sentence-index="0"]')
  const secondSentence = page.locator('[data-reader-sentence="true"][data-sentence-index="1"]')
  await firstSentence.waitFor({ state: 'visible', timeout: 15000 })
  await secondSentence.waitFor({ state: 'visible', timeout: 15000 })
  const firstSentenceClass = await firstSentence.getAttribute('class')
  const secondSentenceClass = await secondSentence.getAttribute('class')
  if (!firstSentenceClass?.includes('reader-sentence-anchored') || !secondSentenceClass?.includes('reader-sentence-anchored')) {
    throw new Error('Expected Reader reopen from Notes to keep the anchored sentence highlight.')
  }
  if ((await page.getByRole('textbox', { name: 'Note text' }).inputValue()) !== updatedNoteBody) {
    throw new Error(`Expected Reader reopen to preserve "${updatedNoteBody}" in the note workbench.`)
  }

  const reopenedReaderScreenshot = path.join(outputDir, 'stage24-reader-notebook-reader-return.png')
  await page.screenshot({ path: reopenedReaderScreenshot, fullPage: true })
  const reopenedReaderUrl = page.url()

  await deleteSmokeDocuments(baseUrl, smokePrefix)

  const validationPath = path.join(outputDir, 'stage24-reader-notebook-validation.json')
  await writeFile(
    validationPath,
    JSON.stringify(
      {
        baseUrl,
        graphDescription,
        graphLabel,
        headless,
        initialNoteBody,
        notesScreenshot,
        readerWorkbenchScreenshot,
        reopenedReaderScreenshot,
        reopenedReaderUrl,
        smokeTitle,
        studyAnswer,
        studyPrompt,
        updatedNoteBody,
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  if (page) {
    const failureScreenshot = path.join(outputDir, 'stage24-reader-notebook-failure.png')
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
