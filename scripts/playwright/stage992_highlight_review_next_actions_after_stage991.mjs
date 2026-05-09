import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import {
  captureLocatorScreenshot,
  captureViewportScreenshot,
  launchBrowserContext,
} from './home_rendered_preview_quality_shared.mjs'
import { desktopViewport } from './study_review_progress_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE992_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE992_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE992_BASE_URL ?? readCliOption('base-url') ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE992_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE992_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE992_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
await rm(path.join(outputDir, 'stage992-highlight-review-next-actions-failure.png'), { force: true })

const { browser, runtimeBrowser } = await launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
})

const page = await browser.newPage({ viewport: desktopViewport })
let harness = null
try {
  harness = await createHighlightReviewNextActionHarness({ baseUrl, stageLabel: 'Stage 992' })
  const captures = {}
  const metrics = {
    cleanupUtilityDryRunMatchedAfterStage992: null,
    homeHighlightReviewNextActionOpensUncoveredFilter: false,
    homeHighlightReviewNextActionSeamVisible: false,
    highlightedReviewCoveredPracticeActionPreserved: false,
    readerGeneratedOutputsFrozen: false,
    sourceHighlightReviewNextActionSeamVisible: false,
    sourceHighlightReviewStudyQuestionsHandoff: false,
  }

  const readerView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(harness.homeDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  metrics.readerGeneratedOutputsFrozen =
    readerView?.mode === 'reflowed' && JSON.stringify(readerView).includes('Stage 992 reviewed uncovered target')

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()

  const collectionReview = page.getByRole('region', { name: 'Collection highlight review', exact: true })
  await collectionReview.waitFor({ state: 'visible', timeout: 20000 })
  await collectionReview.getByRole('button', { name: 'Show reviewed highlights' }).click()
  await collectionReview.getByText(harness.reviewedNote.body_text).waitFor({ state: 'visible', timeout: 20000 })
  const homeNextActions = collectionReview.locator('[data-highlight-review-next-actions-stage992="home"]')
  await homeNextActions.waitFor({ state: 'visible', timeout: 20000 })
  metrics.homeHighlightReviewNextActionSeamVisible =
    (await homeNextActions.getByText('Next action').isVisible()) &&
    (await homeNextActions.getByRole('button', { name: 'Create Study cards' }).isVisible())
  captures.collectionReviewedNextAction = await captureLocatorScreenshot(
    page,
    collectionReview,
    outputDir,
    'stage992-collection-highlight-review-next-action.png',
  )

  await homeNextActions.getByRole('button', { name: 'Create Study cards' }).click()
  await collectionReview.getByText(harness.uncoveredNote.body_text).waitFor({ state: 'visible', timeout: 20000 })
  const uncoveredButton = collectionReview.getByRole('button', { name: 'Show uncovered highlights' })
  metrics.homeHighlightReviewNextActionOpensUncoveredFilter =
    (await uncoveredButton.evaluate((element) => element.classList.contains('primary-button'))) &&
    (await collectionReview.getByText(harness.uncoveredNote.body_text).isVisible())
  captures.collectionUncoveredAfterNextAction = await captureLocatorScreenshot(
    page,
    collectionReview,
    outputDir,
    'stage992-collection-uncovered-after-next-action.png',
  )

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.collectionName })
    .first()
    .click()
  const readingQueue = page.getByRole('region', { name: 'Reading queue' })
  await readingQueue.waitFor({ state: 'visible', timeout: 20000 })
  await readingQueue.getByRole('button', { name: `Review highlights for ${harness.sourceDocument.title}` }).click()

  const sourceReview = page.getByRole('region', { name: 'Source highlight review', exact: true })
  await sourceReview.waitFor({ state: 'visible', timeout: 20000 })
  const sourceNextActions = sourceReview.locator('[data-highlight-review-next-actions-stage992="source"]')
  await sourceNextActions.waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceHighlightReviewNextActionSeamVisible =
    (await sourceNextActions.getByText('Next action').isVisible()) &&
    (await sourceNextActions.getByRole('button', { name: 'Study questions' }).isVisible())
  metrics.highlightedReviewCoveredPracticeActionPreserved =
    await sourceNextActions.getByRole('button', { name: 'Review covered highlights' }).isVisible()
  captures.sourceNextActionBeforeStudyQuestions = await captureLocatorScreenshot(
    page,
    sourceReview,
    outputDir,
    'stage992-source-highlight-review-next-action.png',
  )

  await sourceNextActions.getByRole('button', { name: 'Study questions' }).click()
  await page.waitForURL((url) => url.pathname === '/recall' && url.searchParams.get('section') === 'study', {
    timeout: 20000,
  })
  await page.getByRole('tab', { name: 'Study', exact: true, selected: true }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.getByText(harness.sourceCard.prompt).first().waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceHighlightReviewStudyQuestionsHandoff = true
  captures.sourceScopedStudyQuestions = await captureViewportScreenshot(
    page,
    outputDir,
    'stage992-source-scoped-study-questions.png',
  )

  await cleanupHighlightReviewNextActionHarness({ baseUrl, harness })
  harness = null
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterStage992 = cleanupDryRun.matchedCount

  for (const [metricName, expected] of Object.entries({
    cleanupUtilityDryRunMatchedAfterStage992: 0,
    highlightedReviewCoveredPracticeActionPreserved: true,
    homeHighlightReviewNextActionOpensUncoveredFilter: true,
    homeHighlightReviewNextActionSeamVisible: true,
    readerGeneratedOutputsFrozen: true,
    sourceHighlightReviewNextActionSeamVisible: true,
    sourceHighlightReviewStudyQuestionsHandoff: true,
  })) {
    if (metrics[metricName] !== expected) {
      throw new Error(
        `Stage 992 expected ${metricName}: ${expected}, got ${metrics[metricName]}. Metrics: ${JSON.stringify(
          metrics,
        )}`,
      )
    }
  }

  const validation = {
    captures,
    metrics,
    runtimeBrowser,
    stage: 'stage992-highlight-review-next-actions-after-stage991',
  }
  await writeFile(
    path.join(outputDir, 'stage992-highlight-review-next-actions-validation.json'),
    JSON.stringify(validation, null, 2),
  )
  console.log(JSON.stringify(validation, null, 2))
} catch (error) {
  await captureViewportScreenshot(page, outputDir, 'stage992-highlight-review-next-actions-failure.png').catch(() => null)
  throw error
} finally {
  await cleanupHighlightReviewNextActionHarness({ baseUrl, harness }).catch((error) => {
    console.error(`Stage 992 cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
  })
  await page.close().catch(() => undefined)
  await browser.close()
}

async function createHighlightReviewNextActionHarness({ baseUrl, stageLabel }) {
  const timestamp = Date.now()
  const collectionId = `collection:stage992-highlight-next-actions-${timestamp}`
  const collectionName = `${stageLabel} Highlight Next Actions`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }

  const homeDocument = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} opener. ${stageLabel} reviewed uncovered target. ${stageLabel} second uncovered target.`,
    title: `${stageLabel} Highlight Next Action Home Source ${timestamp}`,
  })
  await putJson(`${baseUrl}/api/documents/${encodeURIComponent(homeDocument.id)}/progress`, {
    mode: 'reflowed',
    sentence_index: 1,
  })
  const homeView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(homeDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  const reviewedNote = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(homeDocument.id)}/notes`, {
    anchor: buildNoteAnchor(homeDocument.id, homeView, { sentenceStart: 1, sentenceEnd: 1 }),
    body_text: `${stageLabel} reviewed uncovered highlight ${timestamp}`,
  })
  await patchJson(`${baseUrl}/api/recall/notes/${encodeURIComponent(reviewedNote.id)}/review-state`, {
    review_state: 'reviewed',
  })
  const uncoveredNote = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(homeDocument.id)}/notes`, {
    anchor: buildNoteAnchor(homeDocument.id, homeView, { sentenceStart: 2, sentenceEnd: 2 }),
    body_text: `${stageLabel} second uncovered highlight ${timestamp}`,
  })

  const sourceDocument = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} source opener. ${stageLabel} covered source target. ${stageLabel} source supporting context.`,
    title: `${stageLabel} Highlight Next Action Source ${timestamp}`,
  })
  await putJson(`${baseUrl}/api/documents/${encodeURIComponent(sourceDocument.id)}/progress`, {
    mode: 'reflowed',
    sentence_index: 1,
  })
  const sourceView = await fetchJson(
    `${baseUrl}/api/documents/${encodeURIComponent(sourceDocument.id)}/view?mode=reflowed&detail_level=default`,
  )
  const sourceNote = await postJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(sourceDocument.id)}/notes`, {
    anchor: buildNoteAnchor(sourceDocument.id, sourceView, { sentenceStart: 1, sentenceEnd: 1 }),
    body_text: `${stageLabel} source covered highlight ${timestamp}`,
  })
  const sourceCard = await postJson(`${baseUrl}/api/recall/notes/${encodeURIComponent(sourceNote.id)}/promote/study-card`, {
    answer: `${stageLabel} source covered answer`,
    prompt: `${stageLabel} source covered prompt?`,
  })

  const now = new Date().toISOString()
  await putJson(`${baseUrl}/api/recall/library/settings`, {
    custom_collections: [
      ...(originalLibrarySettings.custom_collections ?? []),
      {
        created_at: now,
        document_ids: [homeDocument.id, sourceDocument.id],
        id: collectionId,
        name: collectionName,
        origin: 'manual',
        parent_id: null,
        sort_index: 0,
        updated_at: now,
      },
    ],
  })

  return {
    collectionId,
    collectionName,
    homeDocument,
    originalLibrarySettings,
    reviewedNote,
    sourceCard,
    sourceDocument,
    sourceNote,
    uncoveredNote,
  }
}

async function cleanupHighlightReviewNextActionHarness({ baseUrl, harness }) {
  if (!harness) {
    return
  }
  await fetch(`${baseUrl}/api/recall/library/settings`, {
    body: JSON.stringify(harness.originalLibrarySettings),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  }).catch(() => null)
  await fetch(`${baseUrl}/api/recall/study/cards/${encodeURIComponent(harness.sourceCard.id)}`, {
    method: 'DELETE',
  }).catch(() => null)
  const notes = [harness.reviewedNote, harness.uncoveredNote, harness.sourceNote].filter(Boolean)
  await Promise.all(
    notes.map((note) =>
      fetch(`${baseUrl}/api/recall/notes/${encodeURIComponent(note.id)}`, { method: 'DELETE' }).catch(() => null),
    ),
  )
  const documents = [harness.homeDocument, harness.sourceDocument].filter(Boolean)
  await Promise.all(
    documents.map((document) =>
      fetch(`${baseUrl}/api/documents/${encodeURIComponent(document.id)}`, { method: 'DELETE' }).catch(() => null),
    ),
  )
}

async function revealHomeCollectionsRail(page) {
  const showOrganizerButton = page.getByRole('button', { name: /Show organizer/ }).first()
  if (await showOrganizerButton.isVisible().catch(() => false)) {
    await showOrganizerButton.click()
  }
  const organizerOptionsButton = page.getByRole('button', { name: 'Organizer options' }).first()
  await organizerOptionsButton.waitFor({ state: 'visible', timeout: 15000 })
  await organizerOptionsButton.click()
  const lensGroup = page.getByRole('group', { name: 'Organizer lens' })
  await lensGroup.getByRole('button', { name: 'Collections' }).click()
  await page.keyboard.press('Escape').catch(() => undefined)
}

function buildNoteAnchor(documentId, viewPayload, { sentenceStart, sentenceEnd }) {
  let globalOffset = 0
  let selectedBlock = null
  let localSentenceStart = 0
  let localSentenceEnd = 0
  let selectedSentenceTexts = []
  for (const block of viewPayload.blocks) {
    const sentenceTexts = block.metadata?.sentence_texts ?? [block.text]
    const blockGlobalEnd = globalOffset + sentenceTexts.length - 1
    if (sentenceStart <= blockGlobalEnd && sentenceEnd >= globalOffset) {
      selectedBlock = block
      selectedSentenceTexts = sentenceTexts
      localSentenceStart = Math.max(sentenceStart - globalOffset, 0)
      localSentenceEnd = Math.min(sentenceEnd - globalOffset, sentenceTexts.length - 1)
      break
    }
    globalOffset += sentenceTexts.length
  }
  if (!selectedBlock) {
    throw new Error(`Unable to build note anchor for sentence range ${sentenceStart}-${sentenceEnd}.`)
  }
  const selectedText = selectedSentenceTexts.slice(localSentenceStart, localSentenceEnd + 1).join(' ').trim()
  const excerptStart = Math.max(localSentenceStart - 1, 0)
  const excerptEnd = Math.min(localSentenceEnd + 1, selectedSentenceTexts.length - 1)
  const excerptText = selectedSentenceTexts.slice(excerptStart, excerptEnd + 1).join(' ').trim()
  return {
    anchor_text: selectedText,
    block_id: selectedBlock.id,
    excerpt_text: excerptText || selectedText,
    global_sentence_end: sentenceEnd,
    global_sentence_start: sentenceStart,
    sentence_end: localSentenceEnd,
    sentence_start: localSentenceStart,
    source_document_id: documentId,
    variant_id: viewPayload.variant_metadata.variant_id,
  }
}

async function fetchJson(url, init) {
  const response = await fetch(url, init)
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Request failed ${response.status} ${response.statusText} for ${url}: ${text}`)
  }
  return response.json()
}

async function postJson(url, payload) {
  return fetchJson(url, {
    body: JSON.stringify(payload),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  })
}

async function putJson(url, payload) {
  return fetchJson(url, {
    body: JSON.stringify(payload),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  })
}

async function patchJson(url, payload) {
  return fetchJson(url, {
    body: JSON.stringify(payload),
    headers: { 'content-type': 'application/json' },
    method: 'PATCH',
  })
}

function readCliOption(name) {
  const prefix = `--${name}=`
  const inline = process.argv.find((argument) => argument.startsWith(prefix))
  if (inline) {
    return inline.slice(prefix.length)
  }
  const index = process.argv.indexOf(`--${name}`)
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1]
  }
  return null
}
