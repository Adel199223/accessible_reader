import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'


const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE37_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE37_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE37_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE37_HEADLESS === '0' ? false : true
const smokePrefix = 'Stage 37 Collection Landing'

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage37-collection-landing-failure.png'), { force: true })

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const userDataDir = await mkdtemp(path.join(os.tmpdir(), 'accessible-reader-stage37-edge-'))
const smokeTitle = `${smokePrefix} ${Date.now()}`
const smokeText = [
  'Stage thirty-seven sentence one.',
  'Stage thirty-seven sentence two.',
  'Stage thirty-seven sentence three.',
].join(' ')
const noteBody = 'Stage 37 note body.'
const graphLabel = 'Stage 37 graph node'
const studyPrompt = 'What should the default Recall landing feel like?'
const studyAnswer = 'It should feel collection-first before source focus begins.'

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
  await page.getByRole('button', { name: 'Stage thirty-seven sentence one.' }).click()
  await page.getByRole('button', { name: 'Stage thirty-seven sentence two.' }).click()
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

  await page.getByRole('tab', { name: 'Library', exact: true }).click()
  await page.waitForURL(/\/recall$/, { timeout: 15000 })
  await page.getByRole('heading', { name: 'Saved sources', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('button', { name: 'Open Reader' }).waitFor({ state: 'visible', timeout: 15000 })
  await assertHidden(
    page.getByRole('heading', { name: 'Source overview', level: 2 }),
    'Expected browse-first Library landing to hide the focused source detail by default.',
  )
  await assertHidden(
    page.getByText('Focused source'),
    'Expected browse-first Library landing to hide the focused source strip.',
  )

  const landingScreenshot = path.join(outputDir, 'stage37-collection-landing.png')
  await page.screenshot({ path: landingScreenshot, fullPage: true })

  await page.getByRole('button', { name: `Open ${smokeTitle}` }).click()
  await page.getByRole('region', { name: `${smokeTitle} workspace` }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })

  const focusedScreenshot = path.join(outputDir, 'stage37-focused-library.png')
  await page.screenshot({ path: focusedScreenshot, fullPage: true })

  const focusedWorkspace = page.getByRole('region', { name: `${smokeTitle} workspace` })
  await focusedWorkspace.getByRole('tab', { name: 'Source workspace Notes' }).click()
  await page.getByRole('heading', { name: 'Reader', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('heading', { name: 'Note detail', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })

  await page.getByRole('tab', { name: 'Library', exact: true }).click()
  await page.getByRole('heading', { name: 'Saved sources', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('button', { name: `Open ${smokeTitle}` }).click()
  await page.getByRole('region', { name: `${smokeTitle} workspace` }).waitFor({ state: 'visible', timeout: 15000 })
  await focusedWorkspace.getByRole('tab', { name: 'Source workspace Graph' }).click()
  await page.getByRole('heading', { name: 'Reader', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('heading', { name: 'Node detail', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })

  await page.getByRole('tab', { name: 'Library', exact: true }).click()
  await page.getByRole('heading', { name: 'Saved sources', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('button', { name: `Open ${smokeTitle}` }).click()
  await page.getByRole('region', { name: `${smokeTitle} workspace` }).waitFor({ state: 'visible', timeout: 15000 })
  await focusedWorkspace.getByRole('tab', { name: 'Source workspace Study' }).click()
  await page.getByRole('heading', { name: 'Reader', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })
  await page.getByRole('heading', { name: 'Active card', level: 2 }).waitFor({ state: 'visible', timeout: 15000 })

  const studyScreenshot = path.join(outputDir, 'stage37-focused-study.png')
  await page.screenshot({ path: studyScreenshot, fullPage: true })

  await deleteSmokeDocuments(baseUrl, smokePrefix)
  const remainingDocuments = await countSmokeDocuments(baseUrl, smokePrefix)

  const validationPath = path.join(outputDir, 'stage37-collection-landing-validation.json')
  await writeFile(
    validationPath,
    JSON.stringify(
      {
        baseUrl,
        focusedScreenshot,
        graphLabel,
        headless,
        landingScreenshot,
        noteBody,
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
    const failureScreenshot = path.join(outputDir, 'stage37-collection-landing-failure.png')
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

async function assertHidden(locator, message) {
  if (await locator.isVisible().catch(() => false)) {
    throw new Error(message)
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
