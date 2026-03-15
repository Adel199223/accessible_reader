import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'


const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE32_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE32_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE32_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE32_HEADLESS === '0' ? false : true
const smokePrefix = 'Stage 32 Split Source Smoke'

await mkdir(outputDir, { recursive: true })

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const userDataDir = await mkdtemp(path.join(os.tmpdir(), 'accessible-reader-stage32-edge-'))
const smokeTitle = `${smokePrefix} ${Date.now()}`
const sentences = [
  'Stage thirty-two sentence one.',
  'Stage thirty-two sentence two.',
  'Stage thirty-two sentence three.',
]
const smokeText = sentences.join(' ')
const noteBody = 'Stage 32 note body.'
const graphLabel = 'Split-work graph node'
const studyPrompt = 'What stays visible in the split workspace?'
const studyAnswer = 'The source overview stays visible beside the active tool.'

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
  await page.getByRole('tab', { name: 'Source workspace Reader', selected: true }).waitFor({
    state: 'visible',
    timeout: 15000,
  })

  await page.getByRole('button', { name: 'Add note' }).click()
  await page.getByRole('button', { name: sentences[0] }).click()
  await page.getByRole('button', { name: sentences[1] }).click()
  await page.getByRole('textbox', { name: 'Optional note' }).fill(noteBody)
  await page.getByRole('button', { name: 'Save note' }).click()
  await page.getByText('Note saved locally.').waitFor({ state: 'visible', timeout: 15000 })

  await page.getByRole('button', { name: 'Promote to Graph' }).click()
  await page.locator('label:has-text("Graph label") input').fill(graphLabel)
  await page.getByRole('button', { name: 'Promote node' }).click()
  await page.getByText('Graph node created from the note.').waitFor({ state: 'visible', timeout: 15000 })

  await page.getByRole('button', { name: 'Create Study Card' }).click()
  await page.locator('label:has-text("Study prompt") textarea').fill(studyPrompt)
  await page.locator('label:has-text("Study answer") textarea').fill(studyAnswer)
  await page.getByRole('button', { name: 'Create card' }).click()
  await page.getByText('Study card created from the note.').waitFor({ state: 'visible', timeout: 15000 })

  await page.getByRole('tab', { name: 'Source workspace Notes' }).click()
  await page.waitForURL(/\/recall$/, { timeout: 15000 })
  await page.getByRole('tab', { name: 'Notes', exact: true, selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('heading', { name: 'Note detail', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })

  const focusedNotesSection = page.getByRole('heading', { name: 'Notes', level: 2 }).locator('xpath=ancestor::section[1]')
  await focusedNotesSection.getByRole('button', { name: 'Show' }).waitFor({ state: 'visible', timeout: 15000 })
  await assertHidden(
    focusedNotesSection.getByRole('combobox', { name: 'Selected document' }),
    'Expected focused Notes to keep the browse drawer collapsed.',
  )

  const notesScreenshot = path.join(outputDir, 'stage32-source-split-notes.png')
  await page.screenshot({ path: notesScreenshot, fullPage: true })

  await page.getByRole('tab', { name: 'Source workspace Graph' }).click()
  await page.getByRole('tab', { name: 'Graph', exact: true, selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('heading', { name: 'Node detail', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })

  const focusedGraphSection = page.getByRole('heading', { name: 'Knowledge graph', level: 2 }).locator('xpath=ancestor::section[1]')
  await focusedGraphSection.getByRole('button', { name: 'Show' }).waitFor({ state: 'visible', timeout: 15000 })

  const graphScreenshot = path.join(outputDir, 'stage32-source-split-graph.png')
  await page.screenshot({ path: graphScreenshot, fullPage: true })

  await page.getByRole('tab', { name: 'Source workspace Study' }).click()
  await page.getByRole('tab', { name: 'Study', exact: true, selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('heading', { name: 'Active card', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })

  const focusedStudySection = page.getByRole('heading', { name: 'Study queue', level: 2 }).locator('xpath=ancestor::section[1]')
  await focusedStudySection.getByRole('button', { name: 'Show' }).waitFor({ state: 'visible', timeout: 15000 })
  await assertHidden(
    focusedStudySection.getByRole('tab', { name: 'All', selected: true }),
    'Expected focused Study to keep the browse filters collapsed.',
  )

  const studyScreenshot = path.join(outputDir, 'stage32-source-split-study.png')
  await page.screenshot({ path: studyScreenshot, fullPage: true })

  await page.getByRole('tab', { name: 'Library', exact: true }).click()
  await page.getByRole('tab', { name: 'Notes', exact: true }).click()
  await page.getByRole('tab', { name: 'Notes', exact: true, selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  const browseNotesSection = page.getByRole('heading', { name: 'Notes', level: 2 }).locator('xpath=ancestor::section[1]')
  await browseNotesSection.getByRole('button', { name: 'Hide' }).waitFor({ state: 'visible', timeout: 15000 })
  await browseNotesSection.getByRole('combobox', { name: 'Selected document' }).waitFor({ state: 'visible', timeout: 15000 })

  const notesBrowseScreenshot = path.join(outputDir, 'stage32-source-split-notes-browse.png')
  await page.screenshot({ path: notesBrowseScreenshot, fullPage: true })

  await page.getByRole('tab', { name: 'Study', exact: true }).click()
  await page.getByRole('tab', { name: 'Study', exact: true, selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  const browseStudySection = page.getByRole('heading', { name: 'Study queue', level: 2 }).locator('xpath=ancestor::section[1]')
  await browseStudySection.getByRole('button', { name: 'Hide' }).waitFor({ state: 'visible', timeout: 15000 })
  await browseStudySection.getByRole('tab', { name: 'All', selected: true }).waitFor({ state: 'visible', timeout: 15000 })

  const studyBrowseScreenshot = path.join(outputDir, 'stage32-source-split-study-browse.png')
  await page.screenshot({ path: studyBrowseScreenshot, fullPage: true })

  await deleteSmokeDocuments(baseUrl, smokePrefix)
  const remainingDocuments = await countSmokeDocuments(baseUrl, smokePrefix)

  const validationPath = path.join(outputDir, 'stage32-source-split-validation.json')
  await writeFile(
    validationPath,
    JSON.stringify(
      {
        baseUrl,
        graphLabel,
        graphScreenshot,
        headless,
        noteBody,
        notesBrowseScreenshot,
        notesScreenshot,
        remainingDocuments,
        smokeTitle,
        studyBrowseScreenshot,
        studyPrompt,
        studyScreenshot,
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  if (page) {
    const failureScreenshot = path.join(outputDir, 'stage32-source-split-failure.png')
    await page.screenshot({ path: failureScreenshot, fullPage: true }).catch(() => undefined)
  }
  await deleteSmokeDocuments(baseUrl, smokePrefix).catch(() => undefined)
  throw error
} finally {
  await context.close()
  await rm(userDataDir, { recursive: true, force: true })
}


async function assertHidden(locator, message) {
  if (await locator.isVisible().catch(() => false)) {
    throw new Error(message)
  }
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
