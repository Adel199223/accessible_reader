import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'


const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE19_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE19_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE19_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE19_HEADLESS === '0' ? false : true
const smokePrefix = 'Stage 19 Context Smoke'

await mkdir(outputDir, { recursive: true })

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const userDataDir = await mkdtemp(path.join(os.tmpdir(), 'accessible-reader-stage19-edge-'))
const smokeTitle = `${smokePrefix} ${Date.now()}`
const smokeText = [
  'Stage nineteen current context sentence one.',
  'Stage nineteen current context sentence two.',
  'Stage nineteen current context sentence three.',
].join(' ')
const noteAnchorText = 'Stage nineteen current context sentence one. Stage nineteen current context sentence two.'
const noteBody = 'Stage 19 dock note body.'

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
  await page.getByRole('button', { name: 'Stage nineteen current context sentence one.' }).click()
  await page.getByRole('button', { name: 'Stage nineteen current context sentence two.' }).click()
  await page.getByRole('textbox', { name: 'Optional note' }).fill(noteBody)
  await page.getByRole('button', { name: 'Save note' }).click()
  await page.getByText('Note saved locally.').waitFor({ state: 'visible', timeout: 15000 })

  await page.goto(`${baseUrl}/recall`, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle')

  await page.getByRole('searchbox', { name: 'Filter sources' }).fill(smokeTitle)
  await page.getByRole('heading', { name: smokeTitle, level: 3 }).waitFor({ state: 'visible', timeout: 15000 })

  const currentContextPanel = getDockPanel(page, 'Current context')
  await currentContextPanel.getByText(smokeTitle).waitFor({ state: 'visible', timeout: 15000 })
  await currentContextPanel.getByRole('button', { name: /View note/i }).click()

  await page.getByRole('tab', { name: 'Notes', selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  await currentContextPanel.getByText(noteAnchorText).waitFor({ state: 'visible', timeout: 15000 })

  const recentWorkPanel = getDockPanel(page, 'Recent work')
  await recentWorkPanel.getByRole('button', { name: new RegExp(smokeTitle) }).waitFor({ state: 'visible', timeout: 15000 })

  const notesDockScreenshot = path.join(outputDir, 'stage19-current-context-notes.png')
  await page.screenshot({ path: notesDockScreenshot, fullPage: true })

  await currentContextPanel.getByRole('button', { name: 'Open in Reader' }).click()
  await page.waitForURL(/\/reader\?document=/, { timeout: 15000 })
  await page.getByRole('tab', { name: 'Reader', selected: true }).waitFor({ state: 'visible', timeout: 15000 })
  await currentContextPanel.getByText(smokeTitle).waitFor({ state: 'visible', timeout: 15000 })

  await recentWorkPanel.getByRole('button', { name: new RegExp(noteAnchorText) }).waitFor({ state: 'visible', timeout: 15000 })

  const readerDockScreenshot = path.join(outputDir, 'stage19-current-context-reader.png')
  await page.screenshot({ path: readerDockScreenshot, fullPage: true })

  await recentWorkPanel.getByRole('button', { name: new RegExp(noteAnchorText) }).click()

  await page.waitForURL(/\/recall$/, { timeout: 15000 })
  await page.getByRole('tab', { name: 'Notes', selected: true }).waitFor({ state: 'visible', timeout: 15000 })

  const noteDetailSection = page.getByRole('heading', { name: 'Note detail' }).locator('xpath=ancestor::section[1]')
  await noteDetailSection.locator('label:has-text("Note text") textarea').waitFor({ state: 'visible', timeout: 15000 })
  const noteBodyValue = await noteDetailSection.locator('label:has-text("Note text") textarea').inputValue()
  if (noteBodyValue !== noteBody) {
    throw new Error(`Expected reopened note body "${noteBody}", got "${noteBodyValue}"`)
  }

  await deleteSmokeDocuments(baseUrl, smokePrefix)

  const validationPath = path.join(outputDir, 'stage19-current-context-validation.json')
  await writeFile(
    validationPath,
    JSON.stringify(
      {
        baseUrl,
        headless,
        noteAnchorText,
        noteBody,
        notesDockScreenshot,
        readerDockScreenshot,
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
    const failureScreenshot = path.join(outputDir, 'stage19-current-context-failure.png')
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

function getDockPanel(page, headingName) {
  return page.getByRole('heading', { name: headingName }).locator('xpath=ancestor::*[contains(@class, "workspace-context-panel")][1]')
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
