import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'


const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE16_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE16_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE16_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE16_HEADLESS === '0' ? false : true
const smokePrefix = 'Stage 16 Graph Study Smoke'

await mkdir(outputDir, { recursive: true })

const playwrightModuleUrl = pathToFileURL(path.join(harnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)

const userDataDir = await mkdtemp(path.join(os.tmpdir(), 'accessible-reader-stage16-edge-'))
const smokeTitle = `${smokePrefix} ${Date.now()}`
const smokeNodeLabel = `${smokeTitle} concept`
const smokePrompt = `What does ${smokeTitle} capture?`
const smokeAnswer = 'A promoted manual note.'
const smokeText = [
  'Stage sixteen graph study smoke sentence one.',
  'Stage sixteen graph study smoke sentence two.',
  'Stage sixteen graph study smoke sentence three.',
].join(' ')

const context = await chromium.launchPersistentContext(userDataDir, {
  channel: 'msedge',
  headless,
  viewport: { width: 1440, height: 1180 },
})

let page
try {
  await deleteSmokeDocuments(baseUrl, smokePrefix)
  const smokeSetup = await createSmokeSetup(baseUrl, {
    smokeAnswer,
    smokeNodeLabel,
    smokePrompt,
    smokeText,
    smokeTitle,
  })

  page = await context.newPage()
  await page.goto(`${baseUrl}/recall`, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle')

  await page.getByRole('tab', { name: 'Graph' }).click()
  const graphRail = page.getByRole('heading', { name: 'Knowledge graph', level: 2 }).locator('xpath=ancestor::section[1]')
  const graphNodeButton = graphRail.getByRole('button', { name: new RegExp(escapeRegExp(smokeNodeLabel), 'i') })
  await graphNodeButton.waitFor({ state: 'visible', timeout: 15000 })
  await graphNodeButton.click()

  const nodeDetailSection = page.getByRole('heading', { name: 'Node detail', level: 2 }).locator('xpath=ancestor::section[1]')
  await nodeDetailSection
    .getByRole('button', { name: new RegExp(escapeRegExp(`Open ${smokeTitle} in Reader`), 'i') })
    .first()
    .waitFor({ state: 'visible', timeout: 15000 })

  const graphScreenshot = path.join(outputDir, 'stage16-recall-graph-density.png')
  await page.screenshot({ path: graphScreenshot, fullPage: true })

  await nodeDetailSection
    .getByRole('button', { name: new RegExp(escapeRegExp(`Open ${smokeTitle} in Reader`), 'i') })
    .first()
    .click()
  await page.waitForFunction(
    (documentId) => {
      const url = new URL(window.location.href)
      return url.pathname === '/reader' && url.searchParams.get('document') === documentId
    },
    smokeSetup.document.id,
    { timeout: 15000 },
  )
  await page.getByRole('article', { name: smokeTitle }).waitFor({ state: 'visible', timeout: 15000 })

  const graphReaderScreenshot = path.join(outputDir, 'stage16-recall-graph-reader-handoff.png')
  await page.screenshot({ path: graphReaderScreenshot, fullPage: true })

  await page.goto(`${baseUrl}/recall`, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Search' }).click()
  const searchDialog = page.getByRole('dialog', { name: 'Search your workspace' })
  await searchDialog.waitFor({ state: 'visible', timeout: 15000 })
  await searchDialog.getByRole('searchbox', { name: 'Search' }).fill(smokePrompt)
  const recallHitsSection = searchDialog.getByRole('heading', { name: 'Recall hits', level: 3 }).locator('xpath=ancestor::section[1]')
  await recallHitsSection
    .getByRole('button', { name: new RegExp(escapeRegExp(smokePrompt), 'i') })
    .click()

  const activeCardSection = page.getByRole('heading', { name: 'Active card', level: 2 }).locator('xpath=ancestor::section[1]')
  await activeCardSection.getByText(smokePrompt).waitFor({ state: 'visible', timeout: 15000 })
  await activeCardSection.getByRole('heading', { name: 'Source evidence', level: 3 }).waitFor({ state: 'visible', timeout: 15000 })

  const studyScreenshot = path.join(outputDir, 'stage16-recall-study-density.png')
  await page.screenshot({ path: studyScreenshot, fullPage: true })

  await activeCardSection
    .getByRole('button', { name: new RegExp(escapeRegExp(`Open ${smokeTitle} in Reader`), 'i') })
    .first()
    .click()
  await page.waitForFunction(
    (documentId) => {
      const url = new URL(window.location.href)
      return (
        url.pathname === '/reader' &&
        url.searchParams.get('document') === documentId &&
        url.searchParams.get('sentenceStart') === '0' &&
        url.searchParams.get('sentenceEnd') === '1'
      )
    },
    smokeSetup.document.id,
    { timeout: 15000 },
  )
  await page.locator('[data-reader-sentence="true"]').filter({ hasText: 'Stage sixteen graph study smoke sentence one.' }).first().waitFor({
    state: 'visible',
    timeout: 15000,
  })
  await waitForAnchoredSentence(page, 'Stage sixteen graph study smoke sentence one.')
  await waitForAnchoredSentence(page, 'Stage sixteen graph study smoke sentence two.')

  const studyReaderScreenshot = path.join(outputDir, 'stage16-recall-study-reader-handoff.png')
  await page.screenshot({ path: studyReaderScreenshot, fullPage: true })

  await deleteSmokeDocuments(baseUrl, smokePrefix)

  const validationPath = path.join(outputDir, 'stage16-recall-graph-study-density-validation.json')
  await writeFile(
    validationPath,
    JSON.stringify(
      {
        baseUrl,
        graphReaderScreenshot,
        graphScreenshot,
        headless,
        smokeTitle,
        studyReaderScreenshot,
        studyScreenshot,
        url: page.url(),
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  if (page) {
    const failureScreenshot = path.join(outputDir, 'stage16-recall-graph-study-density-failure.png')
    await page.screenshot({ path: failureScreenshot, fullPage: true }).catch(() => undefined)
  }
  await deleteSmokeDocuments(baseUrl, smokePrefix).catch(() => undefined)
  throw error
} finally {
  await context.close()
  await rm(userDataDir, { recursive: true, force: true })
}


async function createSmokeSetup(baseUrl, options) {
  const importResponse = await fetch(`${baseUrl}/api/documents/import-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: options.smokeText,
      title: options.smokeTitle,
    }),
  })
  const document = await parseJsonResponse(importResponse, 'Could not import the Stage 16 smoke document.')

  const viewResponse = await fetch(
    `${baseUrl}/api/documents/${document.id}/view?mode=reflowed&detail_level=default`,
  )
  const viewPayload = await parseJsonResponse(viewResponse, 'Could not load the smoke document view.')

  const noteResponse = await fetch(`${baseUrl}/api/recall/documents/${document.id}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      anchor: buildNoteAnchor(document.id, viewPayload),
      body_text: 'Stage 16 smoke note body.',
    }),
  })
  const note = await parseJsonResponse(noteResponse, 'Could not create the Stage 16 smoke note.')

  const graphPromotionResponse = await fetch(`${baseUrl}/api/recall/notes/${note.id}/promote/graph-node`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      label: options.smokeNodeLabel,
      description: 'Stage 16 smoke node promoted from a saved note.',
    }),
  })
  const nodeDetail = await parseJsonResponse(graphPromotionResponse, 'Could not promote the smoke note into Graph.')

  const studyPromotionResponse = await fetch(`${baseUrl}/api/recall/notes/${note.id}/promote/study-card`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: options.smokePrompt,
      answer: options.smokeAnswer,
    }),
  })
  const studyCard = await parseJsonResponse(studyPromotionResponse, 'Could not promote the smoke note into Study.')

  return {
    document,
    nodeDetail,
    note,
    studyCard,
  }
}

function buildNoteAnchor(documentId, viewPayload) {
  const block = viewPayload.blocks[0]
  const sentenceTexts = block.metadata?.sentence_texts ?? []
  const selectedText = sentenceTexts.slice(0, 2).join(' ').trim()
  const excerptText = sentenceTexts.slice(0, 3).join(' ').trim()
  return {
    anchor_text: selectedText,
    block_id: block.id,
    excerpt_text: excerptText || selectedText,
    sentence_end: 1,
    sentence_start: 0,
    source_document_id: documentId,
    variant_id: viewPayload.variant_metadata.variant_id,
  }
}

async function parseJsonResponse(response, errorMessage) {
  if (!response.ok) {
    throw new Error(`${errorMessage} (${response.status})`)
  }
  return response.json()
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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
