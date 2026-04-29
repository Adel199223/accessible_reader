import { writeFile } from 'node:fs/promises'
import path from 'node:path'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { captureLocatorScreenshot, captureViewportScreenshot, openHome } from './home_rendered_preview_quality_shared.mjs'

const studyCardHarnessLimit = 1000

export async function captureReaderSourceQuizLaunchEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const harness = await createReaderSourceQuizLaunchHarness({ baseUrl, stagePrefix })
  let result
  let validationError
  try {
    result = await captureReaderSourceQuizLaunchEvidenceForHarness({
      baseUrl,
      directory,
      harness,
      page,
      stageLabel,
      stagePrefix,
    })
  } catch (error) {
    validationError = error
    await captureViewportScreenshot(page, directory, `${stagePrefix}-failure.png`).catch(() => null)
  }

  const cleanupMetrics = await cleanupReaderSourceQuizLaunchHarness({ baseUrl, harness })
  if (validationError) {
    validationError.readerSourceQuizLaunchHarnessCleanup = cleanupMetrics
    throw validationError
  }
  return {
    ...result,
    metrics: {
      ...result.metrics,
      ...cleanupMetrics,
    },
  }
}

async function captureReaderSourceQuizLaunchEvidenceForHarness({
  baseUrl,
  directory,
  harness,
  page,
  stageLabel,
  stagePrefix,
}) {
  const startEvidence = await captureReaderStartSourceQuizEvidence({
    baseUrl,
    directory,
    document: harness.startDocument,
    page,
    stagePrefix,
  })
  const questionsEvidence = await captureReaderStudyQuestionsEvidence({
    baseUrl,
    directory,
    document: harness.questionsDocument,
    page,
    stagePrefix,
  })
  const generateEvidence = await captureReaderGenerateQuestionsEvidence({
    baseUrl,
    directory,
    document: harness.generateDocument,
    page,
    stagePrefix,
  })
  const sourceOverviewEvidence = await captureSourceOverviewLaunchEvidence({
    baseUrl,
    directory,
    document: harness.overviewDocument,
    page,
    stagePrefix,
  })
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })

  const metrics = {
    ...generateEvidence.metrics,
    ...questionsEvidence.metrics,
    ...sourceOverviewEvidence.metrics,
    ...startEvidence.metrics,
    cleanupUtilityDryRunMatchedAfterReaderSourceQuizLaunch: cleanupDryRun.matchedCount,
  }
  const captures = {
    ...generateEvidence.captures,
    ...questionsEvidence.captures,
    ...sourceOverviewEvidence.captures,
    ...startEvidence.captures,
  }

  await writeFile(
    path.join(directory, `${stagePrefix}-validation.json`),
    JSON.stringify({ captures, metrics, stageLabel }, null, 2),
  )

  return { captures, metrics }
}

async function captureReaderStartSourceQuizEvidence({ baseUrl, directory, document, page, stagePrefix }) {
  await openReaderDocument(page, baseUrl, document)
  const workspace = page.getByRole('region', { name: `${document.title} workspace` }).first()
  await workspace.waitFor({ state: 'visible', timeout: 20000 })
  const sourceStripAction = workspace.getByRole('button', { name: `Start source quiz for ${document.title}` }).first()
  await sourceStripAction.waitFor({ state: 'visible', timeout: 20000 })
  const sourceStripCapture = await captureLocatorScreenshot(
    page,
    workspace,
    directory,
    `${stagePrefix}-reader-source-strip-start-quiz.png`,
  )
  const shortCompletionStudyCtaVisible =
    (await page.locator('[data-reader-short-completion-study-cta-stage956="true"]').count()) > 0

  await sourceStripAction.click()
  await page.waitForURL(/\/recall/, { timeout: 20000 })
  await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Study', selected: true }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const progress = page.locator('[data-study-review-session-progress-stage952]').first()
  await progress.waitFor({ state: 'visible', timeout: 20000 })
  const reviewCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-reader-start-source-quiz-session.png`,
  )

  const progressLabel = (await progress.getAttribute('data-study-review-session-progress-stage952')) ?? ''
  const sourceScopedQueueVisible =
    (await page.locator('[data-study-source-scoped-queue-stage914="true"]').count()) > 0

  return {
    captures: {
      readerSourceQuizSessionCapture: reviewCapture,
      readerSourceStripStartQuizCapture: sourceStripCapture,
    },
    metrics: {
      readerShortCompletionStudyCtaVisible: shortCompletionStudyCtaVisible,
      readerSourceScopedSessionProgressLabel: progressLabel,
      readerSourceScopePreservedForSession: sourceScopedQueueVisible,
      readerStartSourceQuizCtaVisible: true,
      readerStartSourceQuizStartsSession: progressLabel.startsWith('1/'),
    },
  }
}

async function captureReaderStudyQuestionsEvidence({ baseUrl, directory, document, page, stagePrefix }) {
  await openReaderDocument(page, baseUrl, document)
  const workspace = page.getByRole('region', { name: `${document.title} workspace` }).first()
  await workspace.waitFor({ state: 'visible', timeout: 20000 })
  const sourceStripAction = workspace.getByRole('button', { name: `Study questions for ${document.title}` }).first()
  await sourceStripAction.waitFor({ state: 'visible', timeout: 20000 })
  let sessionRequestCount = 0
  const countSessionRequest = (request) => {
    if (request.method() === 'POST' && /\/api\/recall\/study\/sessions$/.test(request.url())) {
      sessionRequestCount += 1
    }
  }
  page.on('request', countSessionRequest)
  try {
    await sourceStripAction.click()
    await page.waitForURL(/\/recall/, { timeout: 20000 })
    await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Study', selected: true }).waitFor({
      state: 'visible',
      timeout: 20000,
    })
    await page.getByRole('tab', { name: 'Questions', selected: true }).waitFor({ state: 'visible', timeout: 20000 })
    await page.getByLabel('Study questions manager').waitFor({ state: 'visible', timeout: 20000 })
  } finally {
    page.off('request', countSessionRequest)
  }
  const capture = await captureViewportScreenshot(page, directory, `${stagePrefix}-reader-study-questions-handoff.png`)
  const sourceScopedQuestionsVisible =
    (await page.locator('[data-study-source-scoped-queue-stage914="true"]').count()) > 0

  return {
    captures: {
      readerStudyQuestionsHandoffCapture: capture,
    },
    metrics: {
      readerStudyQuestionsDoesNotStartSession: sessionRequestCount === 0,
      readerStudyQuestionsOpensManager: true,
      readerStudyQuestionsPreservesSourceScope: sourceScopedQuestionsVisible,
    },
  }
}

async function captureReaderGenerateQuestionsEvidence({ baseUrl, directory, document, page, stagePrefix }) {
  await openReaderDocument(page, baseUrl, document)
  const workspace = page.getByRole('region', { name: `${document.title} workspace` }).first()
  await workspace.waitFor({ state: 'visible', timeout: 20000 })
  const sourceStripAction = workspace.getByRole('button', { name: `Generate questions for ${document.title}` }).first()
  await sourceStripAction.waitFor({ state: 'visible', timeout: 20000 })
  let generateRequestCount = 0
  const countGenerateRequest = (request) => {
    if (request.method() === 'POST' && /\/api\/recall\/study\/cards\/generate$/.test(request.url())) {
      generateRequestCount += 1
    }
  }
  page.on('request', countGenerateRequest)
  try {
    await sourceStripAction.click()
    await page.waitForURL(/\/recall/, { timeout: 20000 })
    await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Study', selected: true }).waitFor({
      state: 'visible',
      timeout: 20000,
    })
    await page.getByLabel('Study generation controls').waitFor({ state: 'visible', timeout: 20000 })
  } finally {
    page.off('request', countGenerateRequest)
  }
  const capture = await captureViewportScreenshot(page, directory, `${stagePrefix}-reader-generate-questions-handoff.png`)
  const generationControls = page.getByLabel('Study generation controls').first()
  const sourceScoped = (await generationControls.getAttribute('data-study-quiz-generation-source-scoped-stage946')) === 'true'

  return {
    captures: {
      readerGenerateQuestionsHandoffCapture: capture,
    },
    metrics: {
      readerGenerateQuestionsDoesNotBlindGenerate: generateRequestCount === 0,
      readerGenerateQuestionsOpensControls: true,
      readerGenerateQuestionsPreservesSourceScope: sourceScoped,
    },
  }
}

async function captureSourceOverviewLaunchEvidence({ baseUrl, directory, document, page, stagePrefix }) {
  await openHome(page, baseUrl)
  const sourceButton = await revealHomeSourceButton(page, document.title)
  await sourceButton.click()
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  const sourceOverviewButton = page
    .locator('[data-source-overview-source-quiz-launch-stage956="start-session"]')
    .first()
  await sourceOverviewButton.waitFor({ state: 'visible', timeout: 20000 })
  const overviewCapture = await captureViewportScreenshot(page, directory, `${stagePrefix}-source-overview-start-quiz.png`)
  await sourceOverviewButton.click()
  await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Study', selected: true }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const progress = page.locator('[data-study-review-session-progress-stage952]').first()
  await progress.waitFor({ state: 'visible', timeout: 20000 })
  const sessionCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-source-overview-started-session.png`,
  )
  const progressLabel = (await progress.getAttribute('data-study-review-session-progress-stage952')) ?? ''

  return {
    captures: {
      sourceOverviewSessionCapture: sessionCapture,
      sourceOverviewStartQuizCapture: overviewCapture,
    },
    metrics: {
      sourceOverviewSourceQuizLaunchStartsSession: progressLabel.startsWith('1/'),
      sourceOverviewSourceQuizLaunchVisible: true,
    },
  }
}

async function revealHomeSourceButton(page, documentTitle) {
  const directButton = page.getByRole('button', { name: `Open ${documentTitle}` }).first()
  if (await directButton.isVisible().catch(() => false)) {
    return directButton
  }

  const organizerButton = page.getByRole('button', { name: `Open ${documentTitle} from organizer` }).first()
  if (await organizerButton.isVisible().catch(() => false)) {
    return organizerButton
  }

  const showAllButtons = page.getByRole('button', { name: /show all \d+ .* sources/i })
  const showAllCount = await showAllButtons.count()
  for (let index = 0; index < showAllCount; index += 1) {
    await showAllButtons.nth(index).click().catch(() => undefined)
  }
  if (await directButton.isVisible().catch(() => false)) {
    return directButton
  }
  if (await organizerButton.isVisible().catch(() => false)) {
    return organizerButton
  }

  const organizerOptions = page.getByRole('button', { name: 'Organizer options' }).first()
  if (await organizerOptions.isVisible().catch(() => false)) {
    await organizerOptions.click()
  }
  const searchBox =
    (await page.getByRole('searchbox', { name: 'Search saved sources' }).first().isVisible().catch(() => false))
      ? page.getByRole('searchbox', { name: 'Search saved sources' }).first()
      : page.getByRole('searchbox', { name: 'Filter saved sources' }).first()
  await searchBox.waitFor({ state: 'visible', timeout: 12000 })
  await searchBox.fill(documentTitle)
  await page.waitForTimeout(900)
  if (await directButton.isVisible().catch(() => false)) {
    return directButton
  }
  if (await organizerButton.isVisible().catch(() => false)) {
    return organizerButton
  }
  throw new Error(`Could not reveal Home source button for ${documentTitle}.`)
}

async function createReaderSourceQuizLaunchHarness({ baseUrl, stagePrefix }) {
  const unique = `${stagePrefix}-${Date.now()}`
  const documents = []
  try {
    const startDocument = await createHarnessDocument({
      baseUrl,
      text: [
        'Reader-led source quiz launch should start from saved source material.',
        'Eligible source questions should open a persisted source-scoped quiz session.',
        `Harness marker ${unique} start.`,
      ].join('\n\n'),
      title: `Stage ${stagePrefix} Reader Start Quiz Source`,
    })
    documents.push(startDocument)
    const startCards = await createManualSourceCardsForDifficulties({
      answer: 'A persisted source-scoped quiz session.',
      baseUrl,
      documentId: startDocument.id,
      prompt: `What should eligible Reader source questions open for ${stagePrefix}?`,
    })

    const questionsDocument = await createHarnessDocument({
      baseUrl,
      text: [
        `Questions branch ${unique}.`,
      ].join('\n\n'),
      title: `Stage ${stagePrefix} Reader Study Questions Source`,
    })
    documents.push(questionsDocument)
    await deleteSourceStudyCards({ baseUrl, documentId: questionsDocument.id })
    const questionsCard = await createManualSourceCard({
      answer: 'Study questions.',
      baseUrl,
      documentId: questionsDocument.id,
      prompt: `Where should Reader route a source when no cards are due for ${stagePrefix}?`,
    })
    await fetchJson(`${baseUrl}/api/recall/study/cards/${encodeURIComponent(questionsCard.id)}/review`, {
      body: JSON.stringify({ rating: 'good' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    await fetchJson(`${baseUrl}/api/recall/study/cards/${encodeURIComponent(questionsCard.id)}/schedule-state`, {
      body: JSON.stringify({ action: 'unschedule' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    await deferEligibleSourceStudyCards({ baseUrl, documentId: questionsDocument.id })

    const generateDocument = await createHarnessDocument({
      baseUrl,
      text: [
        'Reader-led source quiz launch should open generation controls for empty sources.',
        'The generator must wait for the user instead of running blind defaults.',
        `Harness marker ${unique} generate.`,
      ].join('\n\n'),
      title: `Stage ${stagePrefix} Reader Generate Questions Source`,
    })
    documents.push(generateDocument)
    await deleteSourceStudyCards({ baseUrl, documentId: generateDocument.id })

    const overviewDocument = await createHarnessDocument({
      baseUrl,
      text: [
        'Source overview should use the same persisted source quiz launch model.',
        'Eligible source questions should start Review with saved quiz settings.',
        `Harness marker ${unique} overview.`,
      ].join('\n\n'),
      title: `Stage ${stagePrefix} Source Overview Quiz Source`,
    })
    documents.push(overviewDocument)
    const overviewCards = await createManualSourceCardsForDifficulties({
      answer: 'The same persisted source quiz launch model.',
      baseUrl,
      documentId: overviewDocument.id,
      prompt: `What launch model should Source overview use for ${stagePrefix}?`,
    })

    return {
      documents,
      generateDocument,
      overviewCard: overviewCards[0],
      overviewCards,
      overviewDocument,
      questionsCard,
      questionsDocument,
      startCard: startCards[0],
      startCards,
      startDocument,
    }
  } catch (error) {
    await cleanupReaderSourceQuizLaunchHarness({ baseUrl, harness: { documents } })
    throw error
  }
}

async function cleanupReaderSourceQuizLaunchHarness({ baseUrl, harness }) {
  const documents = Array.isArray(harness?.documents) ? harness.documents : []
  const results = []
  for (const document of documents) {
    if (!document?.id) {
      results.push({ deleted: false, error: 'missing harness document id', progressCleaned: false })
      continue
    }
    try {
      const response = await fetch(`${baseUrl}/api/documents/${encodeURIComponent(document.id)}`, {
        method: 'DELETE',
      })
      const scopedProgress = await fetchJson(
        `${baseUrl}/api/recall/study/progress?source_document_id=${encodeURIComponent(document.id)}`,
      )
      results.push({
        deleted: response.ok || response.status === 404,
        error: response.ok || response.status === 404 ? null : `delete returned ${response.status}`,
        progressCleaned: scopedProgress.total_reviews === 0,
      })
    } catch (error) {
      results.push({
        deleted: false,
        error: error instanceof Error ? error.message : String(error),
        progressCleaned: false,
      })
    }
  }
  return {
    readerSourceQuizLaunchHarnessCleanupError: results.find((result) => result.error)?.error ?? null,
    readerSourceQuizLaunchHarnessDocumentsDeleted:
      results.length > 0 && results.every((result) => result.deleted),
    readerSourceQuizLaunchHarnessProgressCleaned:
      results.length > 0 && results.every((result) => result.progressCleaned),
  }
}

async function openReaderDocument(page, baseUrl, document) {
  const response = await page.goto(`${baseUrl}/reader?document=${encodeURIComponent(document.id)}`, {
    waitUntil: 'networkidle',
  })
  if (!response || !response.ok()) {
    throw new Error(`Reader navigation failed for ${document.id} with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.getByRole('region', { name: `${document.title} workspace` }).waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('article').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(450)
}

async function createHarnessDocument({ baseUrl, text, title }) {
  return fetchJson(`${baseUrl}/api/documents/import-text`, {
    body: JSON.stringify({ text, title }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
}

async function createManualSourceCardsForDifficulties({ answer, baseUrl, documentId, prompt }) {
  const cards = []
  for (const difficulty of ['easy', 'medium', 'hard']) {
    cards.push(
      await createManualSourceCard({
        answer,
        baseUrl,
        difficulty,
        documentId,
        prompt: `${prompt} (${difficulty})`,
      }),
    )
  }
  return cards
}

async function createManualSourceCard({ answer, baseUrl, difficulty = 'medium', documentId, prompt }) {
  return fetchJson(`${baseUrl}/api/recall/study/cards`, {
    body: JSON.stringify({
      answer,
      card_type: 'short_answer',
      prompt,
      question_difficulty: difficulty,
      source_document_id: documentId,
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
}

async function generateOneSourceCard({ baseUrl, documentId }) {
  await fetchJson(`${baseUrl}/api/recall/study/cards/generate`, {
    body: JSON.stringify({
      include_explanations: true,
      include_hints: true,
      max_per_source: 1,
      question_types: ['short_answer'],
      source_document_id: documentId,
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  const cards = await fetchJson(`${baseUrl}/api/recall/study/cards?status=all&limit=${studyCardHarnessLimit}`)
  const card = cards.find((candidate) => candidate.source_document_id === documentId)
  if (!card?.id) {
    throw new Error(`Reader source quiz launch harness could not find a generated Study card for ${documentId}.`)
  }
  return card
}

async function deleteSourceStudyCards({ baseUrl, documentId }) {
  const cards = await fetchJson(
    `${baseUrl}/api/recall/study/cards?status=all&limit=${studyCardHarnessLimit}&source_document_id=${encodeURIComponent(documentId)}`,
  )
  for (const card of cards) {
    if (!card?.id) {
      continue
    }
    await fetchJson(`${baseUrl}/api/recall/study/cards/${encodeURIComponent(card.id)}`, {
      method: 'DELETE',
    })
  }
}

async function deferEligibleSourceStudyCards({ baseUrl, documentId }) {
  const cards = await fetchJson(
    `${baseUrl}/api/recall/study/cards?status=all&limit=${studyCardHarnessLimit}&source_document_id=${encodeURIComponent(documentId)}`,
  )
  for (const card of cards) {
    if (!card?.id || (card.status !== 'new' && card.status !== 'due')) {
      continue
    }
    await fetchJson(`${baseUrl}/api/recall/study/cards/${encodeURIComponent(card.id)}/schedule-state`, {
      body: JSON.stringify({ action: 'unschedule' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
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
