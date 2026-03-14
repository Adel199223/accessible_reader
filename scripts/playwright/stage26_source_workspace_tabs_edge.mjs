import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'


const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE26_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE26_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE26_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE26_HEADLESS === '0' ? false : true
const smokePrefix = 'Stage 26 Source Workspace Smoke'

await mkdir(outputDir, { recursive: true })

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const userDataDir = await mkdtemp(path.join(os.tmpdir(), 'accessible-reader-stage26-edge-'))
const smokeTitle = `${smokePrefix} ${Date.now()}`
const sentences = [
  'Stage twenty-six source sentence one.',
  'Stage twenty-six source sentence two.',
  'Stage twenty-six source sentence three.',
]
const smokeText = sentences.join(' ')
const initialNoteBody = 'Stage 26 note body.'
const updatedNoteBody = 'Stage 26 note body, updated from Notes.'
const graphLabel = 'Unified source memory'
const graphDescription = 'This node proves the shared source workspace stays grounded.'
const studyPrompt = 'What does the source workspace keep nearby?'
const studyAnswer = 'Overview, Reader, Notes, Graph, and Study.'

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
  await page.getByRole('tab', { name: 'Source workspace Reader', selected: true }).waitFor({ state: 'visible', timeout: 15000 })

  await page.getByRole('button', { name: 'Add note' }).click()
  await page.getByRole('button', { name: sentences[0] }).click()
  await page.getByRole('button', { name: sentences[1] }).click()
  await page.getByRole('textbox', { name: 'Optional note' }).fill(initialNoteBody)
  await page.getByRole('button', { name: 'Save note' }).click()
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

  const initialReaderScreenshot = path.join(outputDir, 'stage26-source-workspace-reader.png')
  await page.screenshot({ path: initialReaderScreenshot, fullPage: true })

  await page.getByRole('tab', { name: 'Source workspace Notes' }).click()
  await page.waitForURL(/\/recall$/, { timeout: 15000 })
  await page.getByRole('tab', { name: 'Notes', exact: true, selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('tab', { name: 'Source workspace Notes', selected: true }).waitFor({ state: 'visible', timeout: 15000 })

  const noteDetailSection = page.getByRole('heading', { name: 'Note detail', level: 2 }).locator('xpath=ancestor::section[1]')
  const recallNoteText = noteDetailSection.getByRole('textbox', { name: 'Note text' })
  await recallNoteText.waitFor({ state: 'visible', timeout: 15000 })
  if ((await recallNoteText.inputValue()) !== initialNoteBody) {
    throw new Error(`Expected Notes detail to start with "${initialNoteBody}".`)
  }
  await recallNoteText.fill(updatedNoteBody)
  await noteDetailSection.getByRole('button', { name: 'Save changes' }).click()
  await page.getByText('Note updated locally.').waitFor({ state: 'visible', timeout: 15000 })

  const notesScreenshot = path.join(outputDir, 'stage26-source-workspace-notes.png')
  await page.screenshot({ path: notesScreenshot, fullPage: true })

  await noteDetailSection.getByRole('button', { name: 'Open in Reader' }).click()
  await page.waitForURL(/\/reader\?document=/, { timeout: 15000 })
  await page.getByRole('tab', { name: 'Reader', exact: true, selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('tab', { name: 'Source workspace Reader', selected: true }).waitFor({ state: 'visible', timeout: 15000 })

  const firstSentence = page.locator('[data-reader-sentence="true"][data-sentence-index="0"]')
  const secondSentence = page.locator('[data-reader-sentence="true"][data-sentence-index="1"]')
  await firstSentence.waitFor({ state: 'visible', timeout: 15000 })
  await secondSentence.waitFor({ state: 'visible', timeout: 15000 })
  const firstSentenceClass = await firstSentence.getAttribute('class')
  const secondSentenceClass = await secondSentence.getAttribute('class')
  if (!firstSentenceClass?.includes('reader-sentence-anchored') || !secondSentenceClass?.includes('reader-sentence-anchored')) {
    throw new Error('Expected Reader reopen from Notes to preserve the anchored sentence highlight.')
  }

  const readerNoteText = page.getByRole('textbox', { name: 'Note text' })
  await readerNoteText.waitFor({ state: 'visible', timeout: 15000 })
  if ((await readerNoteText.inputValue()) !== updatedNoteBody) {
    throw new Error(`Expected Reader note workbench to preserve "${updatedNoteBody}".`)
  }

  const reopenedReaderScreenshot = path.join(outputDir, 'stage26-source-workspace-reader-return.png')
  await page.screenshot({ path: reopenedReaderScreenshot, fullPage: true })
  const anchoredReaderUrl = page.url()

  await page.getByRole('tab', { name: 'Source workspace Graph' }).click()
  await page.waitForURL(/\/recall$/, { timeout: 15000 })
  await page.getByRole('tab', { name: 'Graph', exact: true, selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('tab', { name: 'Source workspace Graph', selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByText(graphLabel, { exact: true }).waitFor({ state: 'visible', timeout: 15000 })

  const graphScreenshot = path.join(outputDir, 'stage26-source-workspace-graph.png')
  await page.screenshot({ path: graphScreenshot, fullPage: true })

  await page.getByRole('tab', { name: 'Source workspace Study' }).click()
  await page.getByRole('tab', { name: 'Study', exact: true, selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('tab', { name: 'Source workspace Study', selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByText(studyPrompt, { exact: true }).waitFor({ state: 'visible', timeout: 15000 })

  const studyScreenshot = path.join(outputDir, 'stage26-source-workspace-study.png')
  await page.screenshot({ path: studyScreenshot, fullPage: true })

  await page.getByRole('tab', { name: 'Source workspace Overview' }).click()
  await page.getByRole('tab', { name: 'Library', exact: true, selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('tab', { name: 'Source workspace Overview', selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('heading', { name: 'Document detail', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })
  await page.locator('.source-workspace-title', { hasText: smokeTitle }).waitFor({ state: 'visible', timeout: 15000 })

  const overviewScreenshot = path.join(outputDir, 'stage26-source-workspace-overview.png')
  await page.screenshot({ path: overviewScreenshot, fullPage: true })

  await page.getByRole('tab', { name: 'Source workspace Reader' }).click()
  await page.waitForURL(/\/reader\?document=/, { timeout: 15000 })
  await page.getByRole('tab', { name: 'Reader', exact: true, selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('tab', { name: 'Source workspace Reader', selected: true }).waitFor({ state: 'visible', timeout: 15000 })

  const finalReaderScreenshot = path.join(outputDir, 'stage26-source-workspace-reader-final.png')
  await page.screenshot({ path: finalReaderScreenshot, fullPage: true })
  const finalReaderUrl = page.url()

  await deleteSmokeDocuments(baseUrl, smokePrefix)
  const remainingDocuments = await countSmokeDocuments(baseUrl, smokePrefix)

  const validationPath = path.join(outputDir, 'stage26-source-workspace-validation.json')
  await writeFile(
    validationPath,
    JSON.stringify(
      {
        anchoredReaderUrl,
        baseUrl,
        finalReaderScreenshot,
        finalReaderUrl,
        graphLabel,
        graphScreenshot,
        headless,
        initialNoteBody,
        initialReaderScreenshot,
        notesScreenshot,
        overviewScreenshot,
        remainingDocuments,
        reopenedReaderScreenshot,
        smokeTitle,
        studyPrompt,
        studyScreenshot,
        updatedNoteBody,
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  if (page) {
    const failureScreenshot = path.join(outputDir, 'stage26-source-workspace-failure.png')
    await page.screenshot({ path: failureScreenshot, fullPage: true }).catch(() => undefined)
  }
  await deleteSmokeDocuments(baseUrl, smokePrefix).catch(() => undefined)
  throw error
} finally {
  await context.close()
  await rm(userDataDir, { recursive: true, force: true })
}


async function countSmokeDocuments(baseUrl, titlePrefix) {
  const response = await fetch(`${baseUrl}/api/documents?query=${encodeURIComponent(titlePrefix)}`)
  if (!response.ok) {
    throw new Error(`Could not query smoke documents: ${response.status}`)
  }
  const documents = await response.json()
  return documents.filter((document) => document.title?.startsWith(titlePrefix)).length
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
