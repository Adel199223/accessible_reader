import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'


const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE30_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE30_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE30_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE30_HEADLESS === '0' ? false : true
const smokePrefix = 'Stage 30 Focused Source Smoke'

await mkdir(outputDir, { recursive: true })

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const userDataDir = await mkdtemp(path.join(os.tmpdir(), 'accessible-reader-stage30-edge-'))
const smokeTitle = `${smokePrefix} ${Date.now()}`
const sentences = [
  'Stage thirty source sentence one.',
  'Stage thirty source sentence two.',
  'Stage thirty source sentence three.',
]
const smokeText = sentences.join(' ')
const noteBody = 'Stage 30 note body.'

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
  await page.getByRole('tab', { name: 'Reader', exact: true, selected: true }).waitFor({ state: 'visible', timeout: 15000 })
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

  const supportToggle = page.getByRole('button', { name: 'Show workspace support' })
  await supportToggle.waitFor({ state: 'visible', timeout: 15000 })
  await assertHidden(page.getByRole('heading', { name: 'Current context', level: 2 }), 'Expected Current context to stay hidden in source-focused mode until reopened.')
  await assertHidden(page.getByRole('heading', { name: 'Recent work', level: 2 }), 'Expected Recent work to stay hidden in source-focused mode until reopened.')

  const readerFocusedScreenshot = path.join(outputDir, 'stage30-focused-source-reader.png')
  await page.screenshot({ path: readerFocusedScreenshot, fullPage: true })

  await supportToggle.click()
  await page.getByRole('button', { name: 'Hide workspace support' }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('heading', { name: 'Current context', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('heading', { name: 'Recent work', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByText('Stage 30 note body.').first().waitFor({ state: 'visible', timeout: 15000 })

  const readerSupportScreenshot = path.join(outputDir, 'stage30-focused-source-support-open.png')
  await page.screenshot({ path: readerSupportScreenshot, fullPage: true })

  await page.getByRole('button', { name: 'Hide workspace support' }).click()
  await page.getByRole('button', { name: 'Show workspace support' }).waitFor({ state: 'visible', timeout: 15000 })
  await assertHidden(page.getByRole('heading', { name: 'Current context', level: 2 }), 'Expected support chrome to collapse again after hiding it.')

  await page.getByRole('tab', { name: 'Source workspace Overview' }).click()
  await page.waitForURL(/\/recall$/, { timeout: 15000 })
  await page.getByRole('tab', { name: 'Library', exact: true, selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('tab', { name: 'Source workspace Overview', selected: true }).waitFor({
    state: 'visible',
    timeout: 15000,
  })
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })
  await assertHidden(page.getByRole('heading', { name: 'Current context', level: 2 }), 'Expected Library overview to stay source-focused with support chrome collapsed.')

  const overviewScreenshot = path.join(outputDir, 'stage30-focused-source-overview.png')
  await page.screenshot({ path: overviewScreenshot, fullPage: true })

  await page.getByRole('tab', { name: 'Notes', exact: true }).click()
  await page.getByRole('tab', { name: 'Notes', exact: true, selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  const notesSection = page.getByRole('heading', { name: 'Notes', level: 2 }).locator('xpath=ancestor::section[1]')
  await notesSection.getByRole('button', { name: 'Hide' }).waitFor({ state: 'visible', timeout: 15000 })
  await notesSection.getByRole('combobox', { name: 'Selected document' }).waitFor({ state: 'visible', timeout: 15000 })

  const notesBrowseScreenshot = path.join(outputDir, 'stage30-focused-source-notes-browse.png')
  await page.screenshot({ path: notesBrowseScreenshot, fullPage: true })

  await page.getByRole('tab', { name: 'Source workspace Reader' }).click()
  await page.waitForURL(/\/reader\?document=/, { timeout: 15000 })
  await page.getByRole('tab', { name: 'Reader', exact: true, selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('tab', { name: 'Source workspace Reader', selected: true }).waitFor({
    state: 'visible',
    timeout: 15000,
  })
  await page.getByRole('button', { name: 'Show workspace support' }).waitFor({ state: 'visible', timeout: 15000 })
  await assertHidden(page.getByRole('heading', { name: 'Current context', level: 2 }), 'Expected Reader return to restore collapsed support chrome.')

  const readerReturnScreenshot = path.join(outputDir, 'stage30-focused-source-reader-return.png')
  await page.screenshot({ path: readerReturnScreenshot, fullPage: true })

  await deleteSmokeDocuments(baseUrl, smokePrefix)
  const remainingDocuments = await countSmokeDocuments(baseUrl, smokePrefix)

  const validationPath = path.join(outputDir, 'stage30-focused-source-validation.json')
  await writeFile(
    validationPath,
    JSON.stringify(
      {
        baseUrl,
        headless,
        noteBody,
        notesBrowseScreenshot,
        overviewScreenshot,
        readerFocusedScreenshot,
        readerReturnScreenshot,
        readerSupportScreenshot,
        remainingDocuments,
        smokeTitle,
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  if (page) {
    const failureScreenshot = path.join(outputDir, 'stage30-focused-source-failure.png')
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
