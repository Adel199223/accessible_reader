import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'


const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE28_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE28_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE28_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE28_HEADLESS === '0' ? false : true
const smokePrefix = 'Stage 28 Shared Source Pane Smoke'

await mkdir(outputDir, { recursive: true })

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const userDataDir = await mkdtemp(path.join(os.tmpdir(), 'accessible-reader-stage28-edge-'))
const smokeTitle = `${smokePrefix} ${Date.now()}`
const sentences = [
  'Stage twenty-eight sentence one.',
  'Stage twenty-eight sentence two.',
  'Stage twenty-eight sentence three.',
]
const smokeText = sentences.join(' ')
const initialNoteBody = 'Stage 28 note body.'
const graphLabel = 'Shared source pane memory'
const studyPrompt = 'What stays nearby in the shared source pane?'
const studyAnswer = 'Overview, notes, graph, and study context.'

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
  await page.locator('label:has-text("Graph label") input').waitFor({ state: 'visible', timeout: 15000 })
  await page.locator('label:has-text("Graph label") input').fill(graphLabel)
  await page.getByRole('button', { name: 'Promote node' }).click()
  await page.getByText('Graph node created from the note.').waitFor({ state: 'visible', timeout: 15000 })

  await page.getByRole('button', { name: 'Create Study Card' }).click()
  await page.locator('label:has-text("Study prompt") textarea').waitFor({ state: 'visible', timeout: 15000 })
  await page.locator('label:has-text("Study prompt") textarea').fill(studyPrompt)
  await page.locator('label:has-text("Study answer") textarea').fill(studyAnswer)
  await page.getByRole('button', { name: 'Create card' }).click()
  await page.getByText('Study card created from the note.').waitFor({ state: 'visible', timeout: 15000 })

  await page.getByRole('tab', { name: 'Source workspace Overview' }).click()
  await page.waitForURL(/\/recall$/, { timeout: 15000 })
  await page.getByRole('tab', { name: 'Library', exact: true, selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('tab', { name: 'Source workspace Overview', selected: true }).waitFor({ state: 'visible', timeout: 15000 })

  const librarySection = page.getByRole('heading', { name: 'Source library', level: 2 }).locator('xpath=ancestor::section[1]')
  await librarySection.getByRole('button', { name: 'Show' }).waitFor({ state: 'visible', timeout: 15000 })
  if (await librarySection.getByRole('searchbox', { name: 'Filter sources' }).isVisible().catch(() => false)) {
    throw new Error('Expected source-focused Library landing to collapse the browse drawer.')
  }

  const overviewSection = page.getByRole('heading', { name: 'Source overview', level: 2 }).locator('xpath=ancestor::section[1]')
  await overviewSection.getByText('Saved notes').waitFor({ state: 'visible', timeout: 15000 })
  await overviewSection.getByText('Graph context').waitFor({ state: 'visible', timeout: 15000 })
  await overviewSection.getByText('Study state').waitFor({ state: 'visible', timeout: 15000 })
  await overviewSection.getByText(initialNoteBody).first().waitFor({ state: 'visible', timeout: 15000 })

  const overviewScreenshot = path.join(outputDir, 'stage28-source-overview.png')
  await page.screenshot({ path: overviewScreenshot, fullPage: true })

  await page.getByRole('tab', { name: 'Source workspace Notes' }).click()
  await page.getByRole('tab', { name: 'Notes', exact: true, selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  const notesSection = page.getByRole('heading', { name: 'Notes', level: 2 }).locator('xpath=ancestor::section[1]')
  await notesSection.getByRole('button', { name: 'Show' }).waitFor({ state: 'visible', timeout: 15000 })
  if (await notesSection.getByRole('combobox', { name: 'Selected document' }).isVisible().catch(() => false)) {
    throw new Error('Expected source-focused Notes landing to keep the browse drawer collapsed.')
  }
  await page.getByRole('heading', { name: 'Note detail', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })

  const notesScreenshot = path.join(outputDir, 'stage28-source-notes-focused.png')
  await page.screenshot({ path: notesScreenshot, fullPage: true })

  await page.getByRole('tab', { name: 'Notes', exact: true }).click()
  await notesSection.getByRole('button', { name: 'Hide' }).waitFor({ state: 'visible', timeout: 15000 })
  await notesSection.getByRole('combobox', { name: 'Selected document' }).waitFor({ state: 'visible', timeout: 15000 })

  const notesBrowseScreenshot = path.join(outputDir, 'stage28-source-notes-browse.png')
  await page.screenshot({ path: notesBrowseScreenshot, fullPage: true })

  await page.getByRole('tab', { name: 'Source workspace Graph' }).click()
  await page.getByRole('tab', { name: 'Graph', exact: true, selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  const graphSection = page.getByRole('heading', { name: 'Knowledge graph', level: 2 }).locator('xpath=ancestor::section[1]')
  await graphSection.getByRole('button', { name: 'Show' }).waitFor({ state: 'visible', timeout: 15000 })
  const nodeDetailSection = page.getByRole('heading', { name: 'Node detail', level: 2 }).locator('xpath=ancestor::section[1]')
  await nodeDetailSection.waitFor({ state: 'visible', timeout: 15000 })

  const graphScreenshot = path.join(outputDir, 'stage28-source-graph-focused.png')
  await page.screenshot({ path: graphScreenshot, fullPage: true })

  await page.getByRole('tab', { name: 'Source workspace Study' }).click()
  await page.getByRole('tab', { name: 'Study', exact: true, selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  const studySection = page.getByRole('heading', { name: 'Study queue', level: 2 }).locator('xpath=ancestor::section[1]')
  await studySection.getByRole('button', { name: 'Show' }).waitFor({ state: 'visible', timeout: 15000 })
  const activeCardSection = page.getByRole('heading', { name: 'Active card', level: 2 }).locator('xpath=ancestor::section[1]')
  await activeCardSection.waitFor({ state: 'visible', timeout: 15000 })

  const studyScreenshot = path.join(outputDir, 'stage28-source-study-focused.png')
  await page.screenshot({ path: studyScreenshot, fullPage: true })

  await deleteSmokeDocuments(baseUrl, smokePrefix)
  const remainingDocuments = await countSmokeDocuments(baseUrl, smokePrefix)

  const validationPath = path.join(outputDir, 'stage28-source-pane-validation.json')
  await writeFile(
    validationPath,
    JSON.stringify(
      {
        baseUrl,
        graphLabel,
        graphScreenshot,
        headless,
        initialNoteBody,
        notesBrowseScreenshot,
        notesScreenshot,
        overviewScreenshot,
        remainingDocuments,
        smokeTitle,
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
    const failureScreenshot = path.join(outputDir, 'stage28-source-pane-failure.png')
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
