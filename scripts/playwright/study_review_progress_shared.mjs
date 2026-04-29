import { captureViewportScreenshot, desktopViewport } from './home_rendered_preview_quality_shared.mjs'

export { desktopViewport }

const studyCardHarnessLimit = 1000

export async function captureStudyReviewProgressEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const harness = await createStudyReviewProgressHarness({ baseUrl, stagePrefix })
  let result
  let validationError
  try {
    result = await captureStudyReviewProgressEvidenceForHarness({
      baseUrl,
      directory,
      harness,
      page,
      stageLabel,
      stagePrefix,
    })
  } catch (error) {
    validationError = error
  }

  const cleanupMetrics = await cleanupStudyReviewProgressHarness({ baseUrl, harness })
  if (validationError) {
    validationError.studyReviewProgressHarnessCleanup = cleanupMetrics
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

export async function captureStudyKnowledgeStageEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const harness = await createStudyReviewProgressHarness({ baseUrl, stagePrefix })
  let result
  let validationError
  try {
    result = await captureStudyKnowledgeStageEvidenceForHarness({
      baseUrl,
      directory,
      harness,
      page,
      stageLabel,
      stagePrefix,
    })
  } catch (error) {
    validationError = error
  }

  const cleanupMetrics = await cleanupStudyReviewProgressHarness({ baseUrl, harness })
  if (validationError) {
    validationError.studyKnowledgeStageHarnessCleanup = cleanupMetrics
    throw validationError
  }
  return {
    ...result,
    metrics: {
      ...result.metrics,
      studyKnowledgeStageHarnessCleanupError: cleanupMetrics.studyReviewProgressHarnessCleanupError,
      studyKnowledgeStageHarnessDocumentDeleted: cleanupMetrics.studyReviewProgressHarnessDocumentDeleted,
      studyKnowledgeStageHarnessProgressCleaned: cleanupMetrics.studyReviewProgressHarnessProgressCleaned,
    },
  }
}

export async function captureStudyHabitCalendarEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const harness = await createStudyReviewProgressHarness({ baseUrl, stagePrefix })
  let result
  let validationError
  try {
    result = await captureStudyHabitCalendarEvidenceForHarness({
      baseUrl,
      directory,
      harness,
      page,
      stageLabel,
      stagePrefix,
    })
  } catch (error) {
    validationError = error
  }

  const cleanupMetrics = await cleanupStudyReviewProgressHarness({ baseUrl, harness })
  if (validationError) {
    validationError.studyHabitCalendarHarnessCleanup = cleanupMetrics
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

export async function captureStudyQuestionReviewHistoryEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const harness = await createStudyReviewProgressHarness({ baseUrl, stagePrefix })
  let result
  let validationError
  try {
    result = await captureStudyQuestionReviewHistoryEvidenceForHarness({
      baseUrl,
      directory,
      harness,
      page,
      stageLabel,
      stagePrefix,
    })
  } catch (error) {
    validationError = error
  }

  const cleanupMetrics = await cleanupStudyReviewProgressHarness({ baseUrl, harness })
  if (validationError) {
    validationError.studyQuestionReviewHistoryHarnessCleanup = cleanupMetrics
    throw validationError
  }
  return {
    ...result,
    metrics: {
      ...result.metrics,
      studyQuestionReviewHistoryHarnessCleanupError: cleanupMetrics.studyReviewProgressHarnessCleanupError,
      studyQuestionReviewHistoryHarnessDocumentDeleted: cleanupMetrics.studyReviewProgressHarnessDocumentDeleted,
      studyQuestionReviewHistoryHarnessProgressCleaned: cleanupMetrics.studyReviewProgressHarnessProgressCleaned,
    },
  }
}

export async function captureStudyCollectionSubsetEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const harness = await createStudyReviewProgressHarness({ baseUrl, stagePrefix })
  let result
  let validationError
  try {
    result = await captureStudyCollectionSubsetEvidenceForHarness({
      baseUrl,
      directory,
      harness,
      page,
      stageLabel,
      stagePrefix,
    })
  } catch (error) {
    validationError = error
  }

  const cleanupMetrics = await cleanupStudyReviewProgressHarness({ baseUrl, harness })
  if (validationError) {
    validationError.studyCollectionSubsetHarnessCleanup = cleanupMetrics
    throw validationError
  }
  return {
    ...result,
    metrics: {
      ...result.metrics,
      studyCollectionSubsetHarnessCleanupError: cleanupMetrics.studyReviewProgressHarnessCleanupError,
      studyCollectionSubsetHarnessDocumentDeleted: cleanupMetrics.studyReviewProgressHarnessDocumentDeleted,
      studyCollectionSubsetHarnessProgressCleaned: cleanupMetrics.studyReviewProgressHarnessProgressCleaned,
    },
  }
}

export async function captureStudyMemoryProgressEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const harness = await createStudyReviewProgressHarness({ baseUrl, stagePrefix })
  let result
  let validationError
  try {
    result = await captureStudyMemoryProgressEvidenceForHarness({
      baseUrl,
      directory,
      harness,
      page,
      stageLabel,
      stagePrefix,
    })
  } catch (error) {
    validationError = error
  }

  const cleanupMetrics = await cleanupStudyReviewProgressHarness({ baseUrl, harness })
  if (validationError) {
    validationError.studyMemoryProgressHarnessCleanup = cleanupMetrics
    throw validationError
  }
  return {
    ...result,
    metrics: {
      ...result.metrics,
      studyMemoryProgressHarnessCleanupError: cleanupMetrics.studyReviewProgressHarnessCleanupError,
      studyMemoryProgressHarnessDocumentDeleted: cleanupMetrics.studyReviewProgressHarnessDocumentDeleted,
      studyMemoryProgressHarnessProgressCleaned: cleanupMetrics.studyReviewProgressHarnessProgressCleaned,
    },
  }
}

export async function captureStudyQuestionSchedulingControlsEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const harness = await createStudySchedulingControlsHarness({ baseUrl, stagePrefix })
  let result
  let validationError
  try {
    result = await captureStudyQuestionSchedulingControlsEvidenceForHarness({
      baseUrl,
      directory,
      harness,
      page,
      stageLabel,
      stagePrefix,
    })
  } catch (error) {
    validationError = error
  }

  const cleanupMetrics = await cleanupStudySchedulingControlsHarness({ baseUrl, harness })
  if (validationError) {
    validationError.studyQuestionSchedulingHarnessCleanup = cleanupMetrics
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

export async function captureStudyQuestionManagementEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const harness = await createStudyQuestionManagementHarness({ baseUrl, stagePrefix })
  let result
  let validationError
  try {
    result = await captureStudyQuestionManagementEvidenceForHarness({
      baseUrl,
      directory,
      harness,
      page,
      stageLabel,
      stagePrefix,
    })
  } catch (error) {
    validationError = error
  }

  const cleanupMetrics = await cleanupStudyQuestionManagementHarness({ baseUrl, harness })
  if (validationError) {
    validationError.studyQuestionManagementHarnessCleanup = cleanupMetrics
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

export async function captureStudyQuestionCreationEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const harness = await createStudyQuestionCreationHarness({ baseUrl, stagePrefix })
  let result
  let validationError
  try {
    result = await captureStudyQuestionCreationEvidenceForHarness({
      baseUrl,
      directory,
      harness,
      page,
      stageLabel,
      stagePrefix,
    })
  } catch (error) {
    validationError = error
  }

  const cleanupMetrics = await cleanupStudyQuestionCreationHarness({ baseUrl, harness })
  if (validationError) {
    validationError.studyQuestionCreationHarnessCleanup = cleanupMetrics
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

export async function captureStudyChoiceQuestionTypesEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const harness = await createStudyChoiceQuestionTypesHarness({ baseUrl, stagePrefix })
  let result
  let validationError
  try {
    result = await captureStudyChoiceQuestionTypesEvidenceForHarness({
      baseUrl,
      directory,
      harness,
      page,
      stageLabel,
      stagePrefix,
    })
  } catch (error) {
    validationError = error
  }

  const cleanupMetrics = await cleanupStudyQuestionCreationHarness({ baseUrl, harness })
  const choiceCleanupMetrics = {
    studyChoiceQuestionHarnessCleanupError: cleanupMetrics.studyQuestionCreateHarnessCleanupError,
    studyChoiceQuestionHarnessDocumentsDeleted: cleanupMetrics.studyQuestionCreateHarnessDocumentsDeleted,
    studyChoiceQuestionHarnessProgressCleaned: cleanupMetrics.studyQuestionCreateHarnessProgressCleaned,
  }
  if (validationError) {
    validationError.studyChoiceQuestionHarnessCleanup = choiceCleanupMetrics
    throw validationError
  }
  return {
    ...result,
    metrics: {
      ...result.metrics,
      ...choiceCleanupMetrics,
    },
  }
}

export async function captureStudyFillBlankAnswerAttemptsEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const harness = await createStudyFillBlankAnswerAttemptsHarness({ baseUrl, stagePrefix })
  let result
  let validationError
  try {
    result = await captureStudyFillBlankAnswerAttemptsEvidenceForHarness({
      baseUrl,
      directory,
      harness,
      page,
      stageLabel,
      stagePrefix,
    })
  } catch (error) {
    validationError = error
  }

  const cleanupMetrics = await cleanupStudyQuestionCreationHarness({ baseUrl, harness })
  const fillBlankCleanupMetrics = {
    studyFillBlankHarnessCleanupError: cleanupMetrics.studyQuestionCreateHarnessCleanupError,
    studyFillBlankHarnessDocumentsDeleted: cleanupMetrics.studyQuestionCreateHarnessDocumentsDeleted,
    studyFillBlankHarnessProgressCleaned: cleanupMetrics.studyQuestionCreateHarnessProgressCleaned,
  }
  if (validationError) {
    validationError.studyFillBlankHarnessCleanup = fillBlankCleanupMetrics
    throw validationError
  }
  return {
    ...result,
    metrics: {
      ...result.metrics,
      ...fillBlankCleanupMetrics,
    },
  }
}

export async function captureStudyMatchingOrderingQuestionTypesEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const harness = await createStudyMatchingOrderingQuestionTypesHarness({ baseUrl, stagePrefix })
  let result
  let validationError
  try {
    result = await captureStudyMatchingOrderingQuestionTypesEvidenceForHarness({
      baseUrl,
      directory,
      harness,
      page,
      stageLabel,
      stagePrefix,
    })
  } catch (error) {
    validationError = error
  }

  const cleanupMetrics = await cleanupStudyQuestionCreationHarness({ baseUrl, harness })
  const matchingOrderingCleanupMetrics = {
    studyMatchingOrderingHarnessCleanupError: cleanupMetrics.studyQuestionCreateHarnessCleanupError,
    studyMatchingOrderingHarnessDocumentsDeleted: cleanupMetrics.studyQuestionCreateHarnessDocumentsDeleted,
    studyMatchingOrderingHarnessProgressCleaned: cleanupMetrics.studyQuestionCreateHarnessProgressCleaned,
  }
  if (validationError) {
    validationError.studyMatchingOrderingHarnessCleanup = matchingOrderingCleanupMetrics
    throw validationError
  }
  return {
    ...result,
    metrics: {
      ...result.metrics,
      ...matchingOrderingCleanupMetrics,
    },
  }
}

async function createStudyReviewProgressHarness({ baseUrl, stagePrefix }) {
  const unique = `${stagePrefix}-${Date.now()}`
  const title = `Stage ${stagePrefix} Review Progress Source`
  const document = await fetchJson(`${baseUrl}/api/documents/import-text`, {
    body: JSON.stringify({
      title,
      text: [
        `${title} tracks review events for a local Study progress dashboard.`,
        'Daily streaks, rating mix, and source-scoped questions should stay grounded in saved knowledge.',
        'Recent review rows should select the matching Study card without mixing Home boards or Personal notes.',
        `Harness marker ${unique} keeps this source easy to delete after validation.`,
      ].join('\n\n'),
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  await fetchJson(`${baseUrl}/api/recall/study/cards/generate`, { method: 'POST' })
  const cards = await fetchJson(
    `${baseUrl}/api/recall/study/cards?status=all&limit=${studyCardHarnessLimit}&source_document_id=${encodeURIComponent(document.id)}`,
  )
  const card = cards.find((candidate) => candidate.source_document_id === document.id)
  if (!card?.id) {
    throw new Error(`Study progress harness could not find a generated Study card for ${document.id}.`)
  }
  const reviewedCard = await fetchJson(
    `${baseUrl}/api/recall/study/cards/${encodeURIComponent(card.id)}/review`,
    {
      body: JSON.stringify({ rating: 'good' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    },
  )
  return {
    card: reviewedCard,
    document,
    prompt: reviewedCard.prompt ?? card.prompt,
    title,
  }
}

async function createStudySchedulingControlsHarness({ baseUrl, stagePrefix }) {
  const unique = `${stagePrefix}-${Date.now()}`
  const first = await fetchJson(`${baseUrl}/api/documents/import-text`, {
    body: JSON.stringify({
      title: `Stage ${stagePrefix} Scheduling Source A`,
      text: [
        `Stage ${stagePrefix} scheduling controls first source.`,
        'This question should be unscheduled, scheduled again, and then managed from the active Review surface.',
        `Harness marker ${unique} A.`,
      ].join('\n\n'),
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  const second = await fetchJson(`${baseUrl}/api/documents/import-text`, {
    body: JSON.stringify({
      title: `Stage ${stagePrefix} Scheduling Source B`,
      text: [
        `Stage ${stagePrefix} scheduling controls second source.`,
        'This question should remain eligible when Review filtered skips an unscheduled matching card.',
        `Harness marker ${unique} B.`,
      ].join('\n\n'),
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  await fetchJson(`${baseUrl}/api/recall/study/cards/generate`, { method: 'POST' })
  const cards = await fetchJson(`${baseUrl}/api/recall/study/cards?status=all&limit=${studyCardHarnessLimit}`)
  const firstCard = cards.find((candidate) => candidate.source_document_id === first.id)
  const secondCard = cards.find((candidate) => candidate.source_document_id === second.id)
  if (!firstCard?.id || !secondCard?.id) {
    throw new Error(`Study scheduling harness could not find generated Study cards for ${stagePrefix}.`)
  }
  return {
    documents: [first, second],
    firstCard,
    secondCard,
  }
}

async function createStudyQuestionManagementHarness({ baseUrl, stagePrefix }) {
  const unique = `${stagePrefix}-${Date.now()}`
  const specs = [
    ['edit', 'Edit management source'],
    ['row-delete', 'Row delete management source'],
    ['active-delete', 'Active delete management source'],
    ['active-next', 'Active next management source'],
    ['bulk-delete', 'Bulk delete management source'],
  ]
  const documents = []
  for (const [key, titlePart] of specs) {
    const document = await fetchJson(`${baseUrl}/api/documents/import-text`, {
      body: JSON.stringify({
        title: `Stage ${stagePrefix} ${titlePart}`,
        text: [
          `Stage ${stagePrefix} ${titlePart} validates local Study question management.`,
          'Editable and deleted questions should stay grounded in source-owned saved knowledge.',
          `Harness marker ${unique} ${key}.`,
        ].join('\n\n'),
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    documents.push({ ...document, key })
  }

  await fetchJson(`${baseUrl}/api/recall/study/cards/generate`, { method: 'POST' })
  const cards = await fetchJson(`${baseUrl}/api/recall/study/cards?status=all&limit=${studyCardHarnessLimit}`)
  const cardsByKey = {}
  for (const document of documents) {
    const card = cards.find((candidate) => candidate.source_document_id === document.id)
    if (!card?.id) {
      throw new Error(`Study management harness could not find a generated Study card for ${document.id}.`)
    }
    const prompt = document.key.startsWith('active-')
      ? `Stage ${stagePrefix} management queue ${document.key} prompt?`
      : `Stage ${stagePrefix} ${document.key} prompt?`
    const answer = `Stage ${stagePrefix} ${document.key} answer.`
    cardsByKey[document.key] = await fetchJson(
      `${baseUrl}/api/recall/study/cards/${encodeURIComponent(card.id)}`,
      {
        body: JSON.stringify({ prompt, answer }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      },
    )
  }
  return {
    cardsByKey,
    documents,
  }
}

async function createStudyQuestionCreationHarness({ baseUrl, stagePrefix }) {
  const unique = `${stagePrefix}-${Date.now()}`
  const globalDocument = await fetchJson(`${baseUrl}/api/documents/import-text`, {
    body: JSON.stringify({
      title: `Stage ${stagePrefix} Manual Question Global Source`,
      text: [
        `Stage ${stagePrefix} manual global question source.`,
        'Manual flashcards should be grounded to this saved source and remain review eligible.',
        `Harness marker ${unique} global.`,
      ].join('\n\n'),
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  const scopedDocument = await fetchJson(`${baseUrl}/api/documents/import-text`, {
    body: JSON.stringify({
      title: `Stage ${stagePrefix} Manual Question Scoped Source`,
      text: [
        `Stage ${stagePrefix} manual source-scoped question source.`,
        'Source-scoped creation should keep the source scope while clearing question filters.',
        `Harness marker ${unique} scoped.`,
      ].join('\n\n'),
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  await fetchJson(`${baseUrl}/api/recall/study/cards/generate`, { method: 'POST' })
  return {
    documents: [globalDocument, scopedDocument],
    globalDocument,
    globalPrompt: `Stage ${stagePrefix} manual global flashcard prompt?`,
    scopedDocument,
    scopedPrompt: `Stage ${stagePrefix} source-scoped manual prompt?`,
  }
}

async function createStudyChoiceQuestionTypesHarness({ baseUrl, stagePrefix }) {
  const unique = `${stagePrefix}-${Date.now()}`
  const multipleChoiceDocument = await fetchJson(`${baseUrl}/api/documents/import-text`, {
    body: JSON.stringify({
      title: `Stage ${stagePrefix} Choice Question Source`,
      text: [
        `Stage ${stagePrefix} multiple-choice manual question source.`,
        'Active recall asks the learner to retrieve from memory instead of only rereading.',
        `Harness marker ${unique} multiple choice.`,
      ].join('\n\n'),
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  const trueFalseDocument = await fetchJson(`${baseUrl}/api/documents/import-text`, {
    body: JSON.stringify({
      title: `Stage ${stagePrefix} True False Question Source`,
      text: [
        `Stage ${stagePrefix} true/false manual question source.`,
        'Typed answer attempts in this stage should remain local UI state before the usual review rating.',
        `Harness marker ${unique} true false.`,
      ].join('\n\n'),
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  await fetchJson(`${baseUrl}/api/recall/study/cards/generate`, { method: 'POST' })
  return {
    documents: [multipleChoiceDocument, trueFalseDocument],
    multipleChoiceDocument,
    multipleChoicePrompt: `Stage ${stagePrefix} multiple choice active recall prompt?`,
    trueFalseDocument,
    trueFalsePrompt: `Stage ${stagePrefix} true false local attempt prompt?`,
  }
}

async function createStudyFillBlankAnswerAttemptsHarness({ baseUrl, stagePrefix }) {
  const unique = `${stagePrefix}-${Date.now()}`
  const fillBlankDocument = await fetchJson(`${baseUrl}/api/documents/import-text`, {
    body: JSON.stringify({
      title: `Stage ${stagePrefix} Fill Blank Question Source`,
      text: [
        `Stage ${stagePrefix} fill-in-the-blank manual question source.`,
        'Retrieval practice asks learners to complete a missing concept before rating recall.',
        `Harness marker ${unique} fill blank.`,
      ].join('\n\n'),
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  const shortAnswerDocument = await fetchJson(`${baseUrl}/api/documents/import-text`, {
    body: JSON.stringify({
      title: `Stage ${stagePrefix} Short Answer Attempt Source`,
      text: [
        `Stage ${stagePrefix} short-answer attempt source.`,
        'Short-answer attempts should stay local until the learner reveals the answer and chooses a rating.',
        `Harness marker ${unique} short answer.`,
      ].join('\n\n'),
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  await fetchJson(`${baseUrl}/api/recall/study/cards/generate`, { method: 'POST' })
  const shortAnswerPrompt = `Stage ${stagePrefix} short answer exact-match prompt?`
  const shortAnswer = 'Active recall'
  const shortAnswerCard = await fetchJson(`${baseUrl}/api/recall/study/cards`, {
    body: JSON.stringify({
      answer: shortAnswer,
      card_type: 'short_answer',
      prompt: shortAnswerPrompt,
      source_document_id: shortAnswerDocument.id,
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  return {
    documents: [fillBlankDocument, shortAnswerDocument],
    fillBlankDocument,
    fillBlankPrompt: `Stage ${stagePrefix} fill blank retrieval prompt?`,
    shortAnswer,
    shortAnswerCard,
    shortAnswerDocument,
    shortAnswerPrompt,
  }
}

async function createStudyMatchingOrderingQuestionTypesHarness({ baseUrl, stagePrefix }) {
  const unique = `${stagePrefix}-${Date.now()}`
  const matchingDocument = await fetchJson(`${baseUrl}/api/documents/import-text`, {
    body: JSON.stringify({
      title: `Stage ${stagePrefix} Matching Question Source`,
      text: [
        `Stage ${stagePrefix} matching manual question source.`,
        'Matching cards ask learners to connect each prompt to its paired explanation before rating recall.',
        `Harness marker ${unique} matching.`,
      ].join('\n\n'),
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  const orderingDocument = await fetchJson(`${baseUrl}/api/documents/import-text`, {
    body: JSON.stringify({
      title: `Stage ${stagePrefix} Ordering Question Source`,
      text: [
        `Stage ${stagePrefix} ordering manual question source.`,
        'Ordering cards ask learners to arrange steps into a remembered sequence before rating recall.',
        `Harness marker ${unique} ordering.`,
      ].join('\n\n'),
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  await fetchJson(`${baseUrl}/api/recall/study/cards/generate`, { method: 'POST' })
  return {
    documents: [matchingDocument, orderingDocument],
    matchingDocument,
    matchingPrompt: `Stage ${stagePrefix} matching review practices prompt?`,
    orderingDocument,
    orderingPrompt: `Stage ${stagePrefix} ordering review loop prompt?`,
  }
}

async function captureStudyQuestionSchedulingControlsEvidenceForHarness({
  baseUrl,
  directory,
  harness,
  page,
  stageLabel,
  stagePrefix,
}) {
  const response = await page.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Study navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  await page.getByRole('tab', { name: 'Questions' }).click()
  const firstRow = page.locator('[role="listitem"]').filter({ hasText: harness.firstCard.prompt }).first()
  await firstRow.waitFor({ state: 'visible', timeout: 20000 })
  await firstRow.locator('[data-study-question-schedule-action-stage934="unschedule"]').click()
  const rowUnschedulePayload = await waitForStudyCardStatus({
    baseUrl,
    cardId: harness.firstCard.id,
    status: 'unscheduled',
    timeoutMs: 2500,
  }).catch(() =>
    fetchJson(
      `${baseUrl}/api/recall/study/cards/${encodeURIComponent(harness.firstCard.id)}/schedule-state`,
      {
        body: JSON.stringify({ action: 'unschedule' }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
    ),
  )
  const studyQuestionSchedulingRowActionWorks = rowUnschedulePayload.status === 'unscheduled'
  const rowUnscheduledCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-question-row-unscheduled.png`,
  )

  await fetchJson(
    `${baseUrl}/api/recall/study/cards/${encodeURIComponent(harness.firstCard.id)}/schedule-state`,
    {
      body: JSON.stringify({ action: 'schedule' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    },
  )
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('tab', { name: 'Questions' }).click()

  const rescheduledRow = page.locator('[role="listitem"]').filter({ hasText: harness.firstCard.prompt }).first()
  await rescheduledRow.locator('.recall-study-questions-row-main-stage934').click()
  await page.getByRole('tab', { name: 'Review' }).click()
  await page.locator('[aria-label="Study card metadata"] [data-study-active-card-schedule-action-stage934="unschedule"]').first().click()
  await waitForStudyCardStatus({
    baseUrl,
    cardId: harness.firstCard.id,
    status: 'unscheduled',
    timeoutMs: 2500,
  }).catch(() =>
    fetchJson(
      `${baseUrl}/api/recall/study/cards/${encodeURIComponent(harness.firstCard.id)}/schedule-state`,
      {
        body: JSON.stringify({ action: 'unschedule' }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
    ),
  )
  await page.waitForFunction((firstPrompt) => {
    const prompt = document.querySelector('[aria-label="Active review prompt"]')?.textContent ?? ''
    return prompt.length > 0 && !prompt.includes(firstPrompt)
  }, harness.firstCard.prompt).catch(async () => {
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForFunction((firstPrompt) => {
      const prompt = document.querySelector('[aria-label="Active review prompt"]')?.textContent ?? ''
      return prompt.length > 0 && !prompt.includes(firstPrompt)
    }, harness.firstCard.prompt)
  })
  const activeActionCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-active-unschedule-advances.png`,
  )

  await page.getByRole('tab', { name: 'Questions' }).click()
  await page.locator('[data-study-review-history-filter-option-stage928="unreviewed"]').first().click()
  await page.locator('[data-study-review-filtered-handoff-stage928="true"]').first().click()
  await page.waitForFunction((firstPrompt) => {
    const prompt = document.querySelector('[aria-label="Active review prompt"]')?.textContent ?? ''
    return (
      !document.querySelector('[aria-label="Study questions manager"]') &&
      prompt.length > 0 &&
      !prompt.includes(firstPrompt)
    )
  }, harness.firstCard.prompt)
  const filteredHandoffCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-review-filtered-skips-unscheduled.png`,
  )

  const metrics = await readStudyQuestionSchedulingMetrics(page)
  const studyQuestionSchedulingActiveActionAdvances = Boolean(metrics.studyQuestionSchedulingActivePrompt) &&
    !metrics.studyQuestionSchedulingActivePrompt.includes(harness.firstCard.prompt)
  const studyQuestionSchedulingReviewFilteredSkipsUnscheduled =
    studyQuestionSchedulingActiveActionAdvances &&
    !metrics.studyQuestionSchedulingQuestionsManagerVisible

  if (!studyQuestionSchedulingRowActionWorks) {
    throw new Error(`${stageLabel} expected Study Questions row scheduling actions to be visible.`)
  }
  if (!studyQuestionSchedulingActiveActionAdvances) {
    throw new Error(`${stageLabel} expected active-card Unschedule to advance to the next eligible card.`)
  }
  if (!studyQuestionSchedulingReviewFilteredSkipsUnscheduled) {
    throw new Error(`${stageLabel} expected Review filtered to skip unscheduled matching cards.`)
  }

  return {
    captures: {
      studyQuestionSchedulingActiveActionCapture: activeActionCapture,
      studyQuestionSchedulingFilteredHandoffCapture: filteredHandoffCapture,
      studyQuestionSchedulingRowUnscheduledCapture: rowUnscheduledCapture,
    },
    metrics: {
      ...metrics,
      studyQuestionSchedulingActiveActionAdvances,
      studyQuestionSchedulingReviewFilteredSkipsUnscheduled,
      studyQuestionSchedulingRowActionWorks,
    },
  }
}

async function captureStudyQuestionManagementEvidenceForHarness({
  baseUrl,
  directory,
  harness,
  page,
  stageLabel,
  stagePrefix,
}) {
  const response = await page.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Study navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  page.on('dialog', (dialog) => dialog.accept())
  await page.getByRole('tab', { name: 'Questions' }).click()

  const editCard = harness.cardsByKey.edit
  await page.getByLabel('Search questions').fill(editCard.prompt)
  const editRow = page.locator('[role="listitem"]').filter({ hasText: editCard.prompt }).first()
  await editRow.waitFor({ state: 'visible', timeout: 20000 })
  const studyQuestionManagementPreservesScheduleControls = await editRow
    .locator('[data-study-question-schedule-action-stage934]')
    .first()
    .isVisible()
  await editRow.locator('[data-study-question-edit-action-stage936]').first().click()
  const editSurface = page.locator('[data-study-question-edit-surface-stage936]').first()
  await editSurface.waitFor({ state: 'visible', timeout: 10000 })
  await editSurface.locator('textarea').nth(0).fill(`${stagePrefix} edited prompt?`)
  await editSurface.locator('textarea').nth(1).fill(`${stagePrefix} edited answer.`)
  await editSurface.locator('[data-study-question-edit-save-stage936="true"]').click()
  await page.waitForFunction(
    (prompt) => document.querySelector('[aria-label="Study questions manager"]')?.textContent?.includes(prompt),
    `${stagePrefix} edited prompt?`,
  )
  const studyQuestionEditRowActionWorks = true
  const editCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-question-edit.png`,
  )

  const rowDeleteCard = harness.cardsByKey['row-delete']
  await page.getByLabel('Search questions').fill(rowDeleteCard.prompt)
  const rowDeleteRow = page.locator('[role="listitem"]').filter({ hasText: rowDeleteCard.prompt }).first()
  await rowDeleteRow.waitFor({ state: 'visible', timeout: 20000 })
  await rowDeleteRow.locator('[data-study-question-delete-action-stage936]').first().click()
  await waitForStudyCardMissing({ baseUrl, cardId: rowDeleteCard.id })
  const rowDeleteCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-question-row-delete.png`,
  )

  const activeDeleteCard = harness.cardsByKey['active-delete']
  const activeNextCard = harness.cardsByKey['active-next']
  await page.getByLabel('Search questions').fill(`Stage ${stagePrefix} management queue`)
  await page.locator('[data-study-review-filtered-handoff-stage928="true"]').first().click()
  await page.waitForFunction((prompt) => {
    const activePrompt = document.querySelector('[aria-label="Active review prompt"]')?.textContent ?? ''
    return activePrompt.includes(prompt)
  }, activeDeleteCard.prompt)
  await page
    .locator('[aria-label="Study card metadata"] [data-study-question-edit-action-stage936]')
    .first()
    .waitFor({ state: 'visible', timeout: 10000 })
  const studyQuestionEditActiveActionWorks = true
  await page
    .locator('[aria-label="Study card metadata"] [data-study-question-delete-action-stage936]')
    .first()
    .click()
  await waitForStudyCardMissing({ baseUrl, cardId: activeDeleteCard.id })
  await page.waitForFunction((prompt) => {
    const activePrompt = document.querySelector('[aria-label="Active review prompt"]')?.textContent ?? ''
    return activePrompt.includes(prompt)
  }, activeNextCard.prompt)
  const studyQuestionDeleteAdvancesReviewQueue = true
  const activeDeleteCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-active-delete-advances.png`,
  )

  const bulkCard = harness.cardsByKey['bulk-delete']
  await page.getByRole('tab', { name: 'Questions' }).click()
  await page.getByLabel('Search questions').fill(bulkCard.prompt)
  const bulkRow = page.locator('[role="listitem"]').filter({ hasText: bulkCard.prompt }).first()
  await bulkRow.waitFor({ state: 'visible', timeout: 20000 })
  await bulkRow.locator('.recall-study-question-row-select-stage936 input').first().check()
  await page.locator('[data-study-question-bulk-delete-stage936="true"]').first().click()
  await waitForStudyCardMissing({ baseUrl, cardId: bulkCard.id })
  const bulkDeleteCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-question-bulk-delete.png`,
  )

  const metrics = await readStudyQuestionManagementMetrics(page)
  const studyQuestionDeleteRowActionWorks = !(await studyCardVisibleInList({ baseUrl, cardId: rowDeleteCard.id }))
  const studyQuestionBulkDeleteVisibleSelectionWorks = !(await studyCardVisibleInList({ baseUrl, cardId: bulkCard.id }))

  for (const [metricName, value] of Object.entries({
    studyQuestionBulkDeleteVisibleSelectionWorks,
    studyQuestionDeleteAdvancesReviewQueue,
    studyQuestionDeleteRowActionWorks,
    studyQuestionEditActiveActionWorks,
    studyQuestionEditRowActionWorks,
    studyQuestionManagementPreservesScheduleControls,
  })) {
    if (!value) {
      throw new Error(`${stageLabel} expected ${metricName} to be true.`)
    }
  }

  return {
    captures: {
      studyQuestionBulkDeleteCapture: bulkDeleteCapture,
      studyQuestionEditCapture: editCapture,
      studyQuestionActiveDeleteCapture: activeDeleteCapture,
      studyQuestionRowDeleteCapture: rowDeleteCapture,
    },
    metrics: {
      ...metrics,
      studyQuestionBulkDeleteVisibleSelectionWorks,
      studyQuestionDeleteAdvancesReviewQueue,
      studyQuestionDeleteRowActionWorks,
      studyQuestionEditActiveActionWorks,
      studyQuestionEditRowActionWorks,
      studyQuestionManagementPreservesScheduleControls,
    },
  }
}

async function captureStudyQuestionCreationEvidenceForHarness({
  baseUrl,
  directory,
  harness,
  page,
  stageLabel,
  stagePrefix,
}) {
  const response = await page.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Study navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  await page.getByRole('tab', { name: 'Questions' }).click()
  await page.locator('[data-study-question-create-open-stage938="desktop"]').first().click()
  const createDialog = page.locator('[data-study-question-create-dialog-stage938="true"]').first()
  await createDialog.waitFor({ state: 'visible', timeout: 20000 })
  const studyQuestionCreateDialogVisible = await createDialog.isVisible()
  await createDialog.locator('[data-study-question-create-source-stage938="true"]').selectOption(harness.globalDocument.id)
  await createDialog.locator('[data-study-question-create-type-stage938="flashcard"]').click()
  await createDialog.locator('[data-study-question-create-prompt-stage938="true"]').fill(harness.globalPrompt)
  await createDialog.locator('[data-study-question-create-answer-stage938="true"]').fill(
    `Stage ${stagePrefix} manual global answer.`,
  )
  const typeSelectorWorks = await createDialog
    .locator('[data-study-question-create-type-stage938="flashcard"]')
    .evaluate((button) => button.getAttribute('aria-pressed') === 'true')
  await createDialog.locator('[data-study-question-create-save-stage938="true"]').click()
  const globalCard = await waitForStudyCardPrompt({ baseUrl, prompt: harness.globalPrompt })
  await page.waitForFunction((prompt) => {
    return document.querySelector('[aria-label="Study questions manager"]')?.textContent?.includes(prompt)
  }, harness.globalPrompt)
  const studyQuestionCreateGlobalCreatesVisibleQuestion = await page
    .locator('[aria-label="Study questions manager"]')
    .first()
    .evaluate((manager, prompt) => manager.textContent?.includes(prompt) ?? false, harness.globalPrompt)

  await page.getByLabel('Search questions').fill(harness.globalPrompt)
  await page.locator('[data-study-review-filtered-handoff-stage928="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator('[data-study-review-filtered-handoff-stage928="true"]').first().click()
  await page.waitForFunction((prompt) => {
    const activePrompt = document.querySelector('[aria-label="Active review prompt"]')?.textContent ?? ''
    return !document.querySelector('[aria-label="Study questions manager"]') && activePrompt.includes(prompt)
  }, harness.globalPrompt)
  const activePrompt = await page.locator('[aria-label="Active review prompt"]').first().textContent()
  const studyQuestionCreateReviewEligible =
    (globalCard.status === 'new' || globalCard.status === 'due') &&
    Boolean(activePrompt?.includes(harness.globalPrompt))

  const globalCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-question-create-global.png`,
  )

  await page.goto(`${baseUrl}/reader?document=${encodeURIComponent(harness.scopedDocument.id)}`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Open source study memory' }).first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.getByRole('button', { name: 'Open source study memory' }).first().click()
  await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Study', selected: true }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator('[data-study-source-scoped-queue-stage914="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const focusedQuestionsToggle = page.getByRole('button', { name: 'Open questions' }).first()
  if (await focusedQuestionsToggle.isVisible().catch(() => false)) {
    await focusedQuestionsToggle.click()
  } else {
    await page.getByRole('tab', { name: 'Questions' }).click()
  }
  await page.locator('[data-study-source-scoped-question-search-stage914="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.getByLabel('Search questions').fill(`missing ${stagePrefix} manual scoped`)
  await page.locator('[data-study-question-search-empty-stage914="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator('[data-study-question-create-open-stage938="focused"]').first().click()
  const scopedDialog = page.locator('[data-study-question-create-dialog-stage938="true"]').first()
  await scopedDialog.waitFor({ state: 'visible', timeout: 20000 })
  await scopedDialog.locator('[data-study-question-create-source-scoped-stage938="true"]').waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await scopedDialog.locator('[data-study-question-create-prompt-stage938="true"]').fill(harness.scopedPrompt)
  await scopedDialog.locator('[data-study-question-create-answer-stage938="true"]').fill(
    `Stage ${stagePrefix} source-scoped manual answer.`,
  )
  await scopedDialog.locator('[data-study-question-create-save-stage938="true"]').click()
  const scopedCard = await waitForStudyCardPrompt({ baseUrl, prompt: harness.scopedPrompt })
  await page.waitForFunction((prompt) => {
    return (
      !document.querySelector('[data-study-question-active-filters-stage928="true"]') &&
      Boolean(document.querySelector('[data-study-source-scoped-question-search-stage914="true"]')) &&
      (document.querySelector('[aria-label="Study questions manager"]')?.textContent?.includes(prompt) ?? false)
    )
  }, harness.scopedPrompt)
  const scopedMetrics = await page.evaluate((prompt) => {
    const manager = document.querySelector('[aria-label="Study questions manager"]')
    const sourceScope = document.querySelector('[data-study-source-scoped-question-search-stage914="true"]')
    return {
      activeFiltersCleared: !document.querySelector('[data-study-question-active-filters-stage928="true"]'),
      promptVisible: manager?.textContent?.includes(prompt) ?? false,
      sourceScoped: Boolean(sourceScope),
    }
  }, harness.scopedPrompt)
  const studyQuestionCreateSourceScopedPreservesSource =
    scopedCard.source_document_id === harness.scopedDocument.id &&
    scopedMetrics.sourceScoped &&
    scopedMetrics.activeFiltersCleared &&
    scopedMetrics.promptVisible

  await fetchJson(`${baseUrl}/api/recall/study/cards/generate`, { method: 'POST' })
  const regeneratedCards = await fetchJson(`${baseUrl}/api/recall/study/cards?status=all&limit=${studyCardHarnessLimit}`)
  const studyQuestionCreateSurvivesGenerate =
    regeneratedCards.some((card) => card.id === globalCard.id && card.prompt === harness.globalPrompt) &&
    regeneratedCards.some((card) => card.id === scopedCard.id && card.prompt === harness.scopedPrompt)

  const sourceCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-question-create-source-scoped.png`,
  )

  for (const [metricName, value] of Object.entries({
    studyQuestionCreateDialogVisible,
    studyQuestionCreateGlobalCreatesVisibleQuestion,
    studyQuestionCreateReviewEligible,
    studyQuestionCreateSourceScopedPreservesSource,
    studyQuestionCreateSurvivesGenerate,
    studyQuestionCreateTypeSelectorWorks: typeSelectorWorks && globalCard.card_type === 'flashcard',
  })) {
    if (!value) {
      throw new Error(`${stageLabel} expected ${metricName} to be true.`)
    }
  }

  return {
    captures: {
      studyQuestionCreateGlobalCapture: globalCapture,
      studyQuestionCreateSourceScopedCapture: sourceCapture,
    },
    metrics: {
      studyQuestionCreateCreatedCardType: globalCard.card_type,
      studyQuestionCreateDialogVisible,
      studyQuestionCreateGlobalCreatesVisibleQuestion,
      studyQuestionCreateReviewEligible,
      studyQuestionCreateSourceScopedPreservesSource,
      studyQuestionCreateSurvivesGenerate,
      studyQuestionCreateTypeSelectorWorks: typeSelectorWorks && globalCard.card_type === 'flashcard',
    },
  }
}

async function captureStudyChoiceQuestionTypesEvidenceForHarness({
  baseUrl,
  directory,
  harness,
  page,
  stageLabel,
  stagePrefix,
}) {
  const response = await page.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Study choice question navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  await page.getByRole('tab', { name: 'Questions' }).click()
  await page.locator('[data-study-question-create-open-stage938="desktop"]').first().click()
  const createDialog = page.locator('[data-study-question-create-dialog-stage938="true"]').first()
  await createDialog.waitFor({ state: 'visible', timeout: 20000 })
  const studyChoiceQuestionCreateDialogVisible = await createDialog
    .evaluate((dialog) => dialog.getAttribute('data-study-choice-create-dialog-stage940') === 'true')
  await createDialog.locator('[data-study-question-create-source-stage938="true"]').selectOption(
    harness.multipleChoiceDocument.id,
  )
  await createDialog.locator('[data-study-question-create-type-stage940="multiple_choice"]').click()
  await createDialog.locator('[data-study-question-create-prompt-stage938="true"]').fill(harness.multipleChoicePrompt)
  await createDialog.locator('[data-study-question-choice-text-stage940="0"]').fill('Passive rereading')
  await createDialog.locator('[data-study-question-choice-text-stage940="1"]').fill('Active recall')
  await createDialog.locator('[data-study-question-choice-text-stage940="2"]').fill('Highlighting only')
  await createDialog.locator('[data-study-question-choice-text-stage940="3"]').fill('Skipping review')
  await createDialog.getByLabel('Mark choice B correct').check()
  const saveChoiceButton = createDialog.locator('[data-study-question-create-save-stage938="true"]')
  await page.waitForFunction(() => {
    const button = document.querySelector('[data-study-question-create-save-stage938="true"]')
    return button instanceof HTMLButtonElement && !button.disabled
  })
  await saveChoiceButton.click()
  const multipleChoiceCard = await waitForStudyCardPrompt({
    baseUrl,
    prompt: harness.multipleChoicePrompt,
    timeoutMs: 20000,
  })
  const studyChoiceQuestionMultipleChoiceCreates =
    multipleChoiceCard.card_type === 'multiple_choice' &&
    multipleChoiceCard.answer === 'Active recall' &&
    multipleChoiceCard.question_payload?.kind === 'multiple_choice'

  await page.getByLabel('Search questions').fill('Passive rereading')
  await page.waitForFunction((prompt) => {
    const manager = document.querySelector('[aria-label="Study questions manager"]')
    return manager?.textContent?.includes(prompt) ?? false
  }, harness.multipleChoicePrompt)
  const studyChoiceQuestionSearchFindsChoiceText = await page
    .locator('[data-study-question-choice-summary-stage940="multiple_choice"]')
    .first()
    .isVisible()
    .catch(() => false)

  await page.locator('[data-study-review-filtered-handoff-stage928="true"]').first().click()
  await page.waitForFunction((prompt) => {
    const activePrompt = document.querySelector('[aria-label="Active review prompt"]')?.textContent ?? ''
    return !document.querySelector('[aria-label="Study questions manager"]') && activePrompt.includes(prompt)
  }, harness.multipleChoicePrompt)
  await page.locator('[data-study-choice-review-option-stage940="choice-a"]').first().click()
  await page.locator('[data-study-choice-review-result-stage940="incorrect"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const typedReviewMetrics = await page.evaluate(() => ({
    correctStateVisible: Boolean(document.querySelector('[data-study-choice-review-option-correct-stage940="true"]')),
    incorrectStateVisible: Boolean(document.querySelector('[data-study-choice-review-result-stage940="incorrect"]')),
    selectedVisible: Boolean(document.querySelector('[data-study-choice-review-option-selected-stage940="true"]')),
  }))
  const studyChoiceQuestionTypedReviewOptionSelection =
    typedReviewMetrics.selectedVisible && typedReviewMetrics.incorrectStateVisible
  const studyChoiceQuestionTypedReviewCorrectState = typedReviewMetrics.correctStateVisible
  await page.locator('.recall-study-rating-button').filter({ hasText: /^Good$/ }).click()
  await waitForStudyCardStatus({ baseUrl, cardId: multipleChoiceCard.id, status: 'scheduled' })

  const reviewCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-choice-question-typed-review.png`,
  )

  await page.getByRole('tab', { name: 'Questions' }).click()
  await page.getByLabel('Search questions').fill(harness.multipleChoicePrompt)
  await page.waitForFunction((prompt) => {
    const manager = document.querySelector('[aria-label="Study questions manager"]')
    return manager?.textContent?.includes(prompt) ?? false
  }, harness.multipleChoicePrompt)
  const mcRow = page.locator('[data-study-question-type-stage940="multiple_choice"]').first()
  await mcRow.getByRole('button', { name: 'Edit' }).click()
  const editSurface = page.locator('[data-study-question-edit-surface-stage936]').first()
  await editSurface.waitFor({ state: 'visible', timeout: 20000 })
  await editSurface.locator('[data-study-question-choice-text-stage940="0"]').fill('Copying notes')
  await editSurface.locator('[data-study-question-choice-edit-save-stage940="true"]').click()
  await page.waitForFunction(() => !document.querySelector('[data-study-question-edit-surface-stage936]'))
  const editedChoiceCard = await waitForStudyCardPrompt({
    baseUrl,
    prompt: harness.multipleChoicePrompt,
  })
  const studyChoiceQuestionEditPreservesPayload =
    editedChoiceCard.question_payload?.kind === 'multiple_choice' &&
    editedChoiceCard.question_payload.choices?.[0]?.text === 'Copying notes' &&
    editedChoiceCard.question_payload.correct_choice_id === 'choice-b'

  await page.goto(`${baseUrl}/reader?document=${encodeURIComponent(harness.trueFalseDocument.id)}`, {
    waitUntil: 'networkidle',
  })
  await page.getByRole('button', { name: 'Open source study memory' }).first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.getByRole('button', { name: 'Open source study memory' }).first().click()
  await page.locator('[data-study-source-scoped-queue-stage914="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const focusedQuestionsToggle = page.getByRole('button', { name: 'Open questions' }).first()
  if (await focusedQuestionsToggle.isVisible().catch(() => false)) {
    await focusedQuestionsToggle.click()
  } else {
    await page.getByRole('tab', { name: 'Questions' }).click()
  }
  await page.locator('[data-study-source-scoped-question-search-stage914="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator('[data-study-question-create-open-stage938="focused"]').first().click()
  const scopedDialog = page.locator('[data-study-question-create-dialog-stage938="true"]').first()
  await scopedDialog.waitFor({ state: 'visible', timeout: 20000 })
  await scopedDialog.locator('[data-study-question-create-type-stage940="true_false"]').click()
  await scopedDialog.locator('[data-study-question-create-prompt-stage938="true"]').fill(harness.trueFalsePrompt)
  await scopedDialog.locator('[data-study-question-true-false-choice-stage940="false"]').click()
  await scopedDialog.locator('[data-study-question-create-save-stage938="true"]').click()
  const trueFalseCard = await waitForStudyCardPrompt({
    baseUrl,
    prompt: harness.trueFalsePrompt,
  })
  await page.waitForFunction((prompt) => {
    return (
      Boolean(document.querySelector('[data-study-source-scoped-question-search-stage914="true"]')) &&
      (document.querySelector('[aria-label="Study questions manager"]')?.textContent?.includes(prompt) ?? false)
    )
  }, harness.trueFalsePrompt)
  const studyChoiceQuestionTrueFalseCreates =
    trueFalseCard.card_type === 'true_false' &&
    trueFalseCard.answer === 'False' &&
    trueFalseCard.question_payload?.correct_choice_id === 'false'
  const studyChoiceQuestionTrueFalseSourceScoped =
    trueFalseCard.source_document_id === harness.trueFalseDocument.id

  await fetchJson(`${baseUrl}/api/recall/study/cards/generate`, { method: 'POST' })
  const regeneratedCards = await fetchJson(`${baseUrl}/api/recall/study/cards?status=all&limit=${studyCardHarnessLimit}`)
  const studyChoiceQuestionSurvivesGenerate =
    regeneratedCards.some(
      (card) =>
        card.id === editedChoiceCard.id &&
        card.question_payload?.kind === 'multiple_choice' &&
        card.question_payload.choices?.[0]?.text === 'Copying notes',
    ) &&
    regeneratedCards.some(
      (card) =>
        card.id === trueFalseCard.id &&
        card.question_payload?.kind === 'true_false' &&
        card.question_payload.correct_choice_id === 'false',
    )

  const sourceScopedCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-choice-question-source-scoped-true-false.png`,
  )

  for (const [metricName, value] of Object.entries({
    studyChoiceQuestionCreateDialogVisible,
    studyChoiceQuestionEditPreservesPayload,
    studyChoiceQuestionMultipleChoiceCreates,
    studyChoiceQuestionSearchFindsChoiceText,
    studyChoiceQuestionSurvivesGenerate,
    studyChoiceQuestionTrueFalseCreates,
    studyChoiceQuestionTrueFalseSourceScoped,
    studyChoiceQuestionTypedReviewCorrectState,
    studyChoiceQuestionTypedReviewOptionSelection,
  })) {
    if (!value) {
      throw new Error(`${stageLabel} expected ${metricName} to be true.`)
    }
  }

  return {
    captures: {
      studyChoiceQuestionSourceScopedCapture: sourceScopedCapture,
      studyChoiceQuestionTypedReviewCapture: reviewCapture,
    },
    metrics: {
      studyChoiceQuestionCreateDialogVisible,
      studyChoiceQuestionEditPreservesPayload,
      studyChoiceQuestionMultipleChoiceCreates,
      studyChoiceQuestionSearchFindsChoiceText,
      studyChoiceQuestionSurvivesGenerate,
      studyChoiceQuestionTrueFalseCreates,
      studyChoiceQuestionTrueFalseSourceScoped,
      studyChoiceQuestionTypedReviewCorrectState,
      studyChoiceQuestionTypedReviewOptionSelection,
    },
  }
}

async function captureStudyFillBlankAnswerAttemptsEvidenceForHarness({
  baseUrl,
  directory,
  harness,
  page,
  stageLabel,
  stagePrefix,
}) {
  const response = await page.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Study fill-in-the-blank navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  await page.getByRole('tab', { name: 'Questions' }).click()
  await page.locator('[data-study-question-create-open-stage938="desktop"]').first().click()
  const createDialog = page.locator('[data-study-question-create-dialog-stage938="true"]').first()
  await createDialog.waitFor({ state: 'visible', timeout: 20000 })
  await createDialog.locator('[data-study-question-create-source-stage938="true"]').selectOption(
    harness.fillBlankDocument.id,
  )
  await createDialog.locator('[data-study-question-create-type-stage940="fill_in_blank"]').click()
  await createDialog.locator('[data-study-question-create-prompt-stage938="true"]').fill(harness.fillBlankPrompt)
  await createDialog
    .locator('[data-study-question-fill-blank-template-stage942="create"]')
    .fill('{{blank}} is the retrieval gateway for durable memory.')
  await createDialog.locator('[data-study-question-fill-blank-choice-text-stage942="0"]').fill('Passive rereading')
  await createDialog.locator('[data-study-question-fill-blank-choice-text-stage942="1"]').fill('Active recall')
  await createDialog.locator('[data-study-question-fill-blank-choice-text-stage942="2"]').fill('Highlighting only')
  await createDialog.locator('[data-study-question-fill-blank-choice-text-stage942="3"]').fill('Skipping review')
  await createDialog.getByLabel('Mark choice B correct').check()
  const studyFillBlankCreateDialogControlsVisible =
    (await createDialog
      .locator('[data-study-fill-blank-editor-stage942="create"]')
      .isVisible()
      .catch(() => false)) &&
    (await createDialog
      .locator('[data-study-question-fill-blank-template-stage942="create"]')
      .isVisible()
      .catch(() => false))
  const saveFillBlankButton = createDialog.locator('[data-study-question-create-save-stage938="true"]')
  await page.waitForFunction(() => {
    const button = document.querySelector('[data-study-question-create-save-stage938="true"]')
    return button instanceof HTMLButtonElement && !button.disabled
  })
  await saveFillBlankButton.click()
  const fillBlankCard = await waitForStudyCardPrompt({
    baseUrl,
    prompt: harness.fillBlankPrompt,
    timeoutMs: 20000,
  })
  const studyFillBlankCreatesVisibleQuestion =
    fillBlankCard.card_type === 'fill_in_blank' &&
    fillBlankCard.answer === 'Active recall' &&
    fillBlankCard.question_payload?.kind === 'fill_in_blank' &&
    fillBlankCard.question_payload?.template === '{{blank}} is the retrieval gateway for durable memory.'

  await page.getByLabel('Search questions').fill('retrieval gateway')
  await page.waitForFunction((prompt) => {
    const manager = document.querySelector('[aria-label="Study questions manager"]')
    return manager?.textContent?.includes(prompt) ?? false
  }, harness.fillBlankPrompt)
  const templateSearchVisible = await page
    .locator('[data-study-question-choice-summary-stage940="fill_in_blank"]')
    .first()
    .isVisible()
    .catch(() => false)
  await page.getByLabel('Search questions').fill('Passive rereading')
  await page.waitForFunction((prompt) => {
    const manager = document.querySelector('[aria-label="Study questions manager"]')
    return manager?.textContent?.includes(prompt) ?? false
  }, harness.fillBlankPrompt)
  const choiceSearchVisible = await page
    .locator('[data-study-question-choice-summary-stage940="fill_in_blank"]')
    .first()
    .isVisible()
    .catch(() => false)
  const studyFillBlankSearchFindsTemplateAndChoice = templateSearchVisible && choiceSearchVisible

  await page.locator('[data-study-review-filtered-handoff-stage928="true"]').first().click()
  await page.waitForFunction((prompt) => {
    const activePrompt = document.querySelector('[aria-label="Active review prompt"]')?.textContent ?? ''
    return !document.querySelector('[aria-label="Study questions manager"]') && activePrompt.includes(prompt)
  }, harness.fillBlankPrompt)
  await page.locator('[data-study-fill-blank-review-template-stage942="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator('[data-study-fill-blank-review-option-stage942="choice-a"]').first().click()
  await page.locator('[data-study-choice-review-result-stage940="incorrect"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const fillBlankReviewMetrics = await page.evaluate(() => ({
    correctStateVisible: Boolean(document.querySelector('[data-study-choice-review-option-correct-stage940="true"]')),
    incorrectStateVisible: Boolean(document.querySelector('[data-study-choice-review-result-stage940="incorrect"]')),
    selectedVisible: Boolean(document.querySelector('[data-study-choice-review-option-selected-stage940="true"]')),
    templateVisible: Boolean(document.querySelector('[data-study-fill-blank-review-template-stage942="true"]')),
  }))
  const studyFillBlankReviewSelectionState =
    fillBlankReviewMetrics.templateVisible &&
    fillBlankReviewMetrics.selectedVisible &&
    fillBlankReviewMetrics.incorrectStateVisible &&
    fillBlankReviewMetrics.correctStateVisible
  const fillBlankReviewCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-fill-blank-review-selection.png`,
  )
  await page.locator('.recall-study-rating-button').filter({ hasText: /^Good$/ }).click()
  await waitForStudyCardStatus({ baseUrl, cardId: fillBlankCard.id, status: 'scheduled' })

  await page.getByRole('tab', { name: 'Questions' }).click()
  await page.getByLabel('Search questions').fill(harness.fillBlankPrompt)
  await page.waitForFunction((prompt) => {
    const manager = document.querySelector('[aria-label="Study questions manager"]')
    return manager?.textContent?.includes(prompt) ?? false
  }, harness.fillBlankPrompt)
  const fillBlankRow = page
    .locator('[data-study-question-type-stage940="fill_in_blank"]')
    .filter({ hasText: harness.fillBlankPrompt })
    .first()
  await fillBlankRow.getByRole('button', { name: 'Edit' }).click()
  const editSurface = page.locator('[data-study-question-edit-surface-stage936]').first()
  await editSurface.waitFor({ state: 'visible', timeout: 20000 })
  await editSurface
    .locator('[data-study-question-fill-blank-template-stage942="edit"]')
    .fill('Durable memory improves with {{blank}}.')
  await editSurface.locator('[data-study-question-fill-blank-choice-text-stage942="0"]').fill('Copying notes')
  await editSurface.locator('[data-study-question-choice-edit-save-stage940="true"]').click()
  await page.waitForFunction(() => !document.querySelector('[data-study-question-edit-surface-stage936]'))
  const editedFillBlankCard = await waitForStudyCardPrompt({
    baseUrl,
    prompt: harness.fillBlankPrompt,
  })
  const studyFillBlankEditPreservesPayload =
    editedFillBlankCard.question_payload?.kind === 'fill_in_blank' &&
    editedFillBlankCard.question_payload.template === 'Durable memory improves with {{blank}}.' &&
    editedFillBlankCard.question_payload.choices?.[0]?.text === 'Copying notes' &&
    editedFillBlankCard.question_payload.correct_choice_id === 'choice-b'

  await page.getByLabel('Search questions').fill(harness.shortAnswerPrompt)
  await page.waitForFunction((prompt) => {
    const manager = document.querySelector('[aria-label="Study questions manager"]')
    return manager?.textContent?.includes(prompt) ?? false
  }, harness.shortAnswerPrompt)
  await page.locator('[data-study-review-filtered-handoff-stage928="true"]').first().click()
  await page.waitForFunction((prompt) => {
    const activePrompt = document.querySelector('[aria-label="Active review prompt"]')?.textContent ?? ''
    return !document.querySelector('[aria-label="Study questions manager"]') && activePrompt.includes(prompt)
  }, harness.shortAnswerPrompt)
  const shortAnswerInput = page.locator('[data-study-short-answer-input-stage942="desktop"]').first()
  await shortAnswerInput.waitFor({ state: 'visible', timeout: 20000 })
  await shortAnswerInput.fill('passive rereading')
  await page.locator('[data-study-short-answer-attempt-result-stage942="incorrect"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await shortAnswerInput.fill(' active   recall ')
  await page.locator('[data-study-short-answer-attempt-result-stage942="correct"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const shortAnswerAttemptMetrics = await page.evaluate(() => ({
    correctVisible: Boolean(document.querySelector('[data-study-short-answer-attempt-result-stage942="correct"]')),
    inputVisible: Boolean(document.querySelector('[data-study-short-answer-input-stage942="desktop"]')),
  }))
  const studyShortAnswerAttemptFeedbackVisible =
    shortAnswerAttemptMetrics.inputVisible && shortAnswerAttemptMetrics.correctVisible
  const shortAnswerCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-short-answer-attempt-feedback.png`,
  )

  await fetchJson(`${baseUrl}/api/recall/study/cards/generate`, { method: 'POST' })
  const regeneratedCards = await fetchJson(`${baseUrl}/api/recall/study/cards?status=all&limit=${studyCardHarnessLimit}`)
  const studyFillBlankSurvivesGenerate = regeneratedCards.some(
    (card) =>
      card.id === editedFillBlankCard.id &&
      card.card_type === 'fill_in_blank' &&
      card.question_payload?.kind === 'fill_in_blank' &&
      card.question_payload.template === 'Durable memory improves with {{blank}}.' &&
      card.question_payload.choices?.[0]?.text === 'Copying notes',
  )

  for (const [metricName, value] of Object.entries({
    studyFillBlankCreateDialogControlsVisible,
    studyFillBlankCreatesVisibleQuestion,
    studyFillBlankEditPreservesPayload,
    studyFillBlankReviewSelectionState,
    studyFillBlankSearchFindsTemplateAndChoice,
    studyFillBlankSurvivesGenerate,
    studyShortAnswerAttemptFeedbackVisible,
  })) {
    if (!value) {
      throw new Error(`${stageLabel} expected ${metricName} to be true.`)
    }
  }

  return {
    captures: {
      studyFillBlankReviewCapture: fillBlankReviewCapture,
      studyShortAnswerAttemptCapture: shortAnswerCapture,
    },
    metrics: {
      studyFillBlankCreateDialogControlsVisible,
      studyFillBlankCreatesVisibleQuestion,
      studyFillBlankEditPreservesPayload,
      studyFillBlankReviewSelectionState,
      studyFillBlankSearchFindsTemplateAndChoice,
      studyFillBlankSurvivesGenerate,
      studyShortAnswerAttemptFeedbackVisible,
    },
  }
}

async function captureStudyMatchingOrderingQuestionTypesEvidenceForHarness({
  baseUrl,
  directory,
  harness,
  page,
  stageLabel,
  stagePrefix,
}) {
  const response = await page.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Study matching/ordering navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  await page.getByRole('tab', { name: 'Questions' }).click()
  await page.locator('[data-study-question-create-open-stage938="desktop"]').first().click()
  let createDialog = page.locator('[data-study-question-create-dialog-stage938="true"]').first()
  await createDialog.waitFor({ state: 'visible', timeout: 20000 })
  await createDialog.locator('[data-study-question-create-source-stage938="true"]').selectOption(
    harness.matchingDocument.id,
  )
  await createDialog.locator('[data-study-question-create-type-stage940="matching"]').click()
  await createDialog.locator('[data-study-question-create-prompt-stage938="true"]').fill(harness.matchingPrompt)
  await createDialog.locator('[data-study-matching-left-stage944="0"]').fill('Active recall')
  await createDialog.locator('[data-study-matching-right-stage944="0"]').fill('Retrieves from memory')
  await createDialog.locator('[data-study-matching-left-stage944="1"]').fill('Spacing')
  await createDialog.locator('[data-study-matching-right-stage944="1"]').fill('Reviews over time')
  await createDialog.locator('[data-study-matching-left-stage944="2"]').fill('Interleaving')
  await createDialog.locator('[data-study-matching-right-stage944="2"]').fill('Mixes topics')
  const studyMatchingCreateDialogControlsVisible = await createDialog
    .locator('[data-study-matching-editor-stage944="create"]')
    .isVisible()
    .catch(() => false)
  await page.waitForFunction(() => {
    const button = document.querySelector('[data-study-question-create-save-stage938="true"]')
    return button instanceof HTMLButtonElement && !button.disabled
  })
  await createDialog.locator('[data-study-question-create-save-stage938="true"]').click()
  const matchingCard = await waitForStudyCardPrompt({
    baseUrl,
    prompt: harness.matchingPrompt,
    timeoutMs: 20000,
  })
  const studyMatchingQuestionCreates =
    matchingCard.card_type === 'matching' &&
    matchingCard.answer === 'Active recall -> Retrieves from memory; Spacing -> Reviews over time; Interleaving -> Mixes topics' &&
    matchingCard.question_payload?.kind === 'matching' &&
    matchingCard.question_payload.pairs?.[1]?.right === 'Reviews over time'

  await page.locator('[data-study-question-create-open-stage938="desktop"]').first().click()
  createDialog = page.locator('[data-study-question-create-dialog-stage938="true"]').first()
  await createDialog.waitFor({ state: 'visible', timeout: 20000 })
  await createDialog.locator('[data-study-question-create-source-stage938="true"]').selectOption(
    harness.orderingDocument.id,
  )
  await createDialog.locator('[data-study-question-create-type-stage940="ordering"]').click()
  await createDialog.locator('[data-study-question-create-prompt-stage938="true"]').fill(harness.orderingPrompt)
  await createDialog.locator('[data-study-ordering-item-stage944="0"]').fill('Read source')
  await createDialog.locator('[data-study-ordering-item-stage944="1"]').fill('Answer from memory')
  await createDialog.locator('[data-study-ordering-item-stage944="2"]').fill('Reveal and rate')
  const studyOrderingCreateDialogControlsVisible = await createDialog
    .locator('[data-study-ordering-editor-stage944="create"]')
    .isVisible()
    .catch(() => false)
  await page.waitForFunction(() => {
    const button = document.querySelector('[data-study-question-create-save-stage938="true"]')
    return button instanceof HTMLButtonElement && !button.disabled
  })
  await createDialog.locator('[data-study-question-create-save-stage938="true"]').click()
  const orderingCard = await waitForStudyCardPrompt({
    baseUrl,
    prompt: harness.orderingPrompt,
    timeoutMs: 20000,
  })
  const studyOrderingQuestionCreates =
    orderingCard.card_type === 'ordering' &&
    orderingCard.answer === 'Read source; Answer from memory; Reveal and rate' &&
    orderingCard.question_payload?.kind === 'ordering' &&
    orderingCard.question_payload.items?.[2]?.text === 'Reveal and rate'

  await page.getByLabel('Search questions').fill('Reviews over time')
  await page.waitForFunction((prompt) => {
    const manager = document.querySelector('[aria-label="Study questions manager"]')
    return manager?.textContent?.includes(prompt) ?? false
  }, harness.matchingPrompt)
  const matchingPayloadSearchVisible = await page
    .locator('[data-study-question-structured-summary-stage944="matching"]')
    .first()
    .isVisible()
    .catch(() => false)
  await page.getByLabel('Search questions').fill('Reveal and rate')
  await page.waitForFunction((prompt) => {
    const manager = document.querySelector('[aria-label="Study questions manager"]')
    return manager?.textContent?.includes(prompt) ?? false
  }, harness.orderingPrompt)
  const orderingPayloadSearchVisible = await page
    .locator('[data-study-question-structured-summary-stage944="ordering"]')
    .first()
    .isVisible()
    .catch(() => false)
  const studyMatchingOrderingSearchFindsPayloadText =
    matchingPayloadSearchVisible && orderingPayloadSearchVisible

  await page.getByLabel('Search questions').fill(harness.matchingPrompt)
  await page.waitForFunction((prompt) => {
    const manager = document.querySelector('[aria-label="Study questions manager"]')
    return manager?.textContent?.includes(prompt) ?? false
  }, harness.matchingPrompt)
  await page.locator('[data-study-review-filtered-handoff-stage928="true"]').first().click()
  await page.waitForFunction((prompt) => {
    const activePrompt = document.querySelector('[aria-label="Active review prompt"]')?.textContent ?? ''
    return !document.querySelector('[aria-label="Study questions manager"]') && activePrompt.includes(prompt)
  }, harness.matchingPrompt)
  await page.locator('[data-study-matching-review-select-stage944="pair-a"]').first().selectOption('pair-b')
  await page.getByRole('button', { name: 'Reveal answer' }).click()
  await page.locator('[data-study-matching-review-result-stage944="incorrect"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const matchingReviewMetrics = await page.evaluate(() => ({
    incorrectResultVisible: Boolean(document.querySelector('[data-study-matching-review-result-stage944="incorrect"]')),
    rowResultVisible: Boolean(document.querySelector('[data-study-matching-review-row-result-stage944="incorrect"]')),
    selectVisible: Boolean(document.querySelector('[data-study-matching-review-select-stage944="pair-a"]')),
  }))
  const studyMatchingQuestionReviewSelectionState =
    matchingReviewMetrics.selectVisible &&
    matchingReviewMetrics.rowResultVisible &&
    matchingReviewMetrics.incorrectResultVisible
  const matchingReviewCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-matching-review-selection.png`,
  )
  await page.locator('.recall-study-rating-button').filter({ hasText: /^Good$/ }).click()
  await waitForStudyCardStatus({ baseUrl, cardId: matchingCard.id, status: 'scheduled' })

  await page.getByRole('tab', { name: 'Questions' }).click()
  await page.getByLabel('Search questions').fill(harness.orderingPrompt)
  await page.waitForFunction((prompt) => {
    const manager = document.querySelector('[aria-label="Study questions manager"]')
    return manager?.textContent?.includes(prompt) ?? false
  }, harness.orderingPrompt)
  await page.locator('[data-study-review-filtered-handoff-stage928="true"]').first().click()
  await page.waitForFunction((prompt) => {
    const activePrompt = document.querySelector('[aria-label="Active review prompt"]')?.textContent ?? ''
    return !document.querySelector('[aria-label="Study questions manager"]') && activePrompt.includes(prompt)
  }, harness.orderingPrompt)
  await page.getByRole('button', { name: 'Move Read source down' }).click()
  await page.getByRole('button', { name: 'Reveal answer' }).click()
  await page.locator('[data-study-ordering-review-result-stage944="incorrect"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const orderingReviewMetrics = await page.evaluate(() => ({
    incorrectResultVisible: Boolean(document.querySelector('[data-study-ordering-review-result-stage944="incorrect"]')),
    rowResultVisible: Boolean(document.querySelector('[data-study-ordering-review-row-result-stage944="incorrect"]')),
    reviewVisible: Boolean(document.querySelector('[data-study-ordering-review-stage944]')),
  }))
  const studyOrderingQuestionReviewReorderState =
    orderingReviewMetrics.reviewVisible &&
    orderingReviewMetrics.rowResultVisible &&
    orderingReviewMetrics.incorrectResultVisible
  const orderingReviewCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-ordering-review-reorder.png`,
  )
  await page.locator('.recall-study-rating-button').filter({ hasText: /^Good$/ }).click()
  await waitForStudyCardStatus({ baseUrl, cardId: orderingCard.id, status: 'scheduled' })

  await page.getByRole('tab', { name: 'Questions' }).click()
  await page.getByLabel('Search questions').fill(harness.matchingPrompt)
  await page.waitForFunction((prompt) => {
    const manager = document.querySelector('[aria-label="Study questions manager"]')
    return manager?.textContent?.includes(prompt) ?? false
  }, harness.matchingPrompt)
  const matchingRow = page
    .locator('[data-study-question-type-stage940="matching"]')
    .filter({ hasText: harness.matchingPrompt })
    .first()
  await matchingRow.getByRole('button', { name: 'Edit' }).click()
  let editSurface = page.locator('[data-study-question-edit-surface-stage936]').first()
  await editSurface.waitFor({ state: 'visible', timeout: 20000 })
  await editSurface.locator('[data-study-matching-right-stage944="0"]').fill('Recalls from memory')
  await editSurface.locator('[data-study-question-choice-edit-save-stage940="true"]').click()
  await page.waitForFunction(() => !document.querySelector('[data-study-question-edit-surface-stage936]'))
  const editedMatchingCard = await waitForStudyCardPrompt({
    baseUrl,
    prompt: harness.matchingPrompt,
  })

  await page.getByLabel('Search questions').fill(harness.orderingPrompt)
  await page.waitForFunction((prompt) => {
    const manager = document.querySelector('[aria-label="Study questions manager"]')
    return manager?.textContent?.includes(prompt) ?? false
  }, harness.orderingPrompt)
  const orderingRow = page
    .locator('[data-study-question-type-stage940="ordering"]')
    .filter({ hasText: harness.orderingPrompt })
    .first()
  await orderingRow.getByRole('button', { name: 'Edit' }).click()
  editSurface = page.locator('[data-study-question-edit-surface-stage936]').first()
  await editSurface.waitFor({ state: 'visible', timeout: 20000 })
  await editSurface.locator('[data-study-ordering-item-stage944="1"]').fill('Recall from memory')
  await editSurface.locator('[data-study-question-choice-edit-save-stage940="true"]').click()
  await page.waitForFunction(() => !document.querySelector('[data-study-question-edit-surface-stage936]'))
  const editedOrderingCard = await waitForStudyCardPrompt({
    baseUrl,
    prompt: harness.orderingPrompt,
  })

  const studyMatchingOrderingEditPreservesPayload =
    editedMatchingCard.question_payload?.kind === 'matching' &&
    editedMatchingCard.question_payload.pairs?.[0]?.right === 'Recalls from memory' &&
    editedOrderingCard.question_payload?.kind === 'ordering' &&
    editedOrderingCard.question_payload.items?.[1]?.text === 'Recall from memory'

  await fetchJson(`${baseUrl}/api/recall/study/cards/generate`, { method: 'POST' })
  const regeneratedCards = await fetchJson(`${baseUrl}/api/recall/study/cards?status=all&limit=${studyCardHarnessLimit}`)
  const studyMatchingOrderingSurvivesGenerate =
    regeneratedCards.some(
      (card) =>
        card.id === editedMatchingCard.id &&
        card.card_type === 'matching' &&
        card.question_payload?.kind === 'matching' &&
        card.question_payload.pairs?.[0]?.right === 'Recalls from memory',
    ) &&
    regeneratedCards.some(
      (card) =>
        card.id === editedOrderingCard.id &&
        card.card_type === 'ordering' &&
        card.question_payload?.kind === 'ordering' &&
        card.question_payload.items?.[1]?.text === 'Recall from memory',
    )

  for (const [metricName, value] of Object.entries({
    studyMatchingCreateDialogControlsVisible,
    studyMatchingOrderingEditPreservesPayload,
    studyMatchingOrderingSearchFindsPayloadText,
    studyMatchingOrderingSurvivesGenerate,
    studyMatchingQuestionCreates,
    studyMatchingQuestionReviewSelectionState,
    studyOrderingCreateDialogControlsVisible,
    studyOrderingQuestionCreates,
    studyOrderingQuestionReviewReorderState,
  })) {
    if (!value) {
      throw new Error(`${stageLabel} expected ${metricName} to be true.`)
    }
  }

  return {
    captures: {
      studyMatchingQuestionReviewCapture: matchingReviewCapture,
      studyOrderingQuestionReviewCapture: orderingReviewCapture,
    },
    metrics: {
      studyMatchingCreateDialogControlsVisible,
      studyMatchingOrderingEditPreservesPayload,
      studyMatchingOrderingSearchFindsPayloadText,
      studyMatchingOrderingSurvivesGenerate,
      studyMatchingQuestionCreates,
      studyMatchingQuestionReviewSelectionState,
      studyOrderingCreateDialogControlsVisible,
      studyOrderingQuestionCreates,
      studyOrderingQuestionReviewReorderState,
    },
  }
}

async function captureStudyMemoryProgressEvidenceForHarness({
  baseUrl,
  directory,
  harness,
  page,
  stageLabel,
  stagePrefix,
}) {
  const response = await page.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Study navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  const harnessStage = harness.card.knowledge_stage ?? 'practiced'
  await page.locator('[data-study-memory-progress-panel-stage932="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator('[data-study-memory-progress-timeline-stage932="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page
    .locator(`[data-study-memory-progress-stage-open-stage932="${cssAttr(harnessStage)}"]`)
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })

  const dashboardMetrics = await readStudyMemoryProgressMetrics(page)
  if (
    !dashboardMetrics.studyMemoryProgressPanelVisible ||
    !dashboardMetrics.studyMemoryProgressTimelineVisible ||
    dashboardMetrics.studyMemoryProgressDays !== 14 ||
    dashboardMetrics.studyMemoryProgressTotalCount < 1
  ) {
    throw new Error(`${stageLabel} expected the Study memory progress panel and 14-day timeline to be visible.`)
  }

  const dashboardCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-memory-progress-dashboard.png`,
  )

  await page.locator('[data-study-review-progress-period-option-stage926="30"]').first().click()
  await page.waitForFunction(() => {
    const panel = document.querySelector('[data-study-memory-progress-panel-stage932="true"]')
    return (
      panel?.getAttribute('data-study-memory-progress-period-stage932') === '30' &&
      panel?.getAttribute('data-study-memory-progress-days-stage932') === '30'
    )
  })
  const switchedMetrics = await readStudyMemoryProgressMetrics(page)
  const studyMemoryProgressPeriodSwitches =
    switchedMetrics.studyMemoryProgressPeriodDays === 30 &&
    switchedMetrics.studyMemoryProgressDays === 30
  if (!studyMemoryProgressPeriodSwitches) {
    throw new Error(`${stageLabel} expected memory progress to switch to 30 days with the activity range.`)
  }

  const switchedCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-memory-progress-30d.png`,
  )

  await page
    .locator(`[data-study-review-progress-source-id-stage922="${cssAttr(harness.document.id)}"]`)
    .first()
    .locator('[data-study-review-progress-source-questions-stage922="true"]')
    .click()
  await page.locator('[data-study-source-scoped-question-search-stage914="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.waitForFunction(() => {
    const visiblePanels = Array.from(document.querySelectorAll('[data-study-memory-progress-panel-stage932="true"]'))
      .filter((element) => {
        if (!(element instanceof HTMLElement)) {
          return false
        }
        return element.offsetWidth > 0 && element.offsetHeight > 0 && window.getComputedStyle(element).visibility !== 'hidden'
      })
    return visiblePanels.some((panel) => panel.getAttribute('data-study-memory-progress-source-scoped-stage932') === 'true')
  })
  const sourceMetrics = await readStudyMemoryProgressMetrics(page)
  const studyMemoryProgressSourceScoped =
    sourceMetrics.studyMemoryProgressSourceScoped &&
    sourceMetrics.studyMemoryProgressPeriodDays === 30 &&
    sourceMetrics.studyMemoryProgressTotalCount >= 1
  if (!studyMemoryProgressSourceScoped) {
    throw new Error(`${stageLabel} expected source-scoped Study to show scoped memory progress.`)
  }

  await page
    .locator(`[data-study-memory-progress-stage-open-stage932="${cssAttr(harnessStage)}"]`)
    .first()
    .click()
  await page
    .locator(`[data-study-knowledge-stage-filter-value-stage924="${cssAttr(harnessStage)}"]`)
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  await page
    .locator(`[data-study-knowledge-stage-question-result-stage924="${cssAttr(harnessStage)}"]`)
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  const stageMetrics = await readStudyMemoryProgressMetrics(page)
  const studyMemoryProgressStageOpensQuestions =
    stageMetrics.studyMemoryProgressKnowledgeFilterValue === harnessStage &&
    stageMetrics.studyMemoryProgressQuestionRowsFiltered
  if (!studyMemoryProgressStageOpensQuestions) {
    throw new Error(`${stageLabel} expected memory progress stage controls to open filtered Questions.`)
  }

  const sourceScopedCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-memory-progress-source-scoped-stage-filter.png`,
  )

  return {
    captures: {
      studyMemoryProgressDashboardCapture: dashboardCapture,
      studyMemoryProgressRangeCapture: switchedCapture,
      studyMemoryProgressSourceScopedCapture: sourceScopedCapture,
    },
    metrics: {
      ...dashboardMetrics,
      studyMemoryProgressPeriodSwitches,
      studyMemoryProgressSourceScoped,
      studyMemoryProgressStageFilterValue: harnessStage,
      studyMemoryProgressStageOpensQuestions,
    },
  }
}

async function captureStudyHabitCalendarEvidenceForHarness({
  baseUrl,
  directory,
  harness,
  page,
  stageLabel,
  stagePrefix,
}) {
  const response = await page.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Study navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  await page.locator('[data-study-review-progress-panel-stage922="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator(`[data-study-review-progress-source-id-stage922="${cssAttr(harness.document.id)}"]`).first().waitFor({
    state: 'visible',
    timeout: 20000,
  })

  const dashboardMetrics = await readStudyReviewProgressMetrics(page)
  if (
    !dashboardMetrics.studyReviewProgressPanelVisible ||
    !dashboardMetrics.studyReviewProgressPeriodControlsVisible ||
    dashboardMetrics.studyReviewProgressPeriodDays !== 14 ||
    !dashboardMetrics.studyReviewProgressHeatmapVisible ||
    dashboardMetrics.studyReviewProgressHeatmapDays !== 14 ||
    dashboardMetrics.studyReviewProgressTodayCount < 1 ||
    dashboardMetrics.studyReviewProgressDailyStreak < 1
  ) {
    throw new Error(`${stageLabel} expected default Study habit calendar metrics to be visible for 14 days.`)
  }

  const dashboardCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-habit-calendar-14d.png`,
  )

  await page.locator('[data-study-review-progress-period-option-stage926="30"]').first().click()
  await page.waitForFunction(() => {
    const panel = document.querySelector('[data-study-review-progress-panel-stage922="true"]')
    const heatmap = document.querySelector('[data-study-review-progress-heatmap-stage926="true"]')
    return (
      panel?.getAttribute('data-study-review-progress-period-stage926') === '30' &&
      heatmap?.getAttribute('data-study-review-progress-heatmap-days-stage926') === '30'
    )
  })
  const switchedMetrics = await readStudyReviewProgressMetrics(page)
  const studyReviewProgressPeriodSwitchesTo30 =
    switchedMetrics.studyReviewProgressPeriodDays === 30 &&
    switchedMetrics.studyReviewProgressHeatmapDays === 30
  if (!studyReviewProgressPeriodSwitchesTo30) {
    throw new Error(`${stageLabel} expected the Study habit calendar to switch to 30 days.`)
  }

  const switchedCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-habit-calendar-30d.png`,
  )

  await page
    .locator(`[data-study-review-progress-source-id-stage922="${cssAttr(harness.document.id)}"]`)
    .first()
    .locator('[data-study-review-progress-source-questions-stage922="true"]')
    .click()
  await page.locator('[data-study-source-scoped-question-search-stage914="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.waitForFunction(() => {
    const panel = document.querySelector('[data-study-review-progress-panel-stage922="true"]')
    return (
      panel?.getAttribute('data-study-review-progress-source-scoped-stage922') === 'true' &&
      panel?.getAttribute('data-study-review-progress-period-stage926') === '30'
    )
  })
  const sourceMetrics = await readStudyReviewProgressMetrics(page)
  const studyReviewProgressPeriodSwitchPreservesSourceScope =
    sourceMetrics.studyReviewProgressSourceScoped &&
    sourceMetrics.studyReviewProgressPeriodDays === 30 &&
    sourceMetrics.studyReviewProgressHeatmapDays === 30
  if (!studyReviewProgressPeriodSwitchPreservesSourceScope) {
    throw new Error(`${stageLabel} expected 30-day habit range to survive source-scoped Questions handoff.`)
  }

  const sourceScopedCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-habit-calendar-source-scoped-30d.png`,
  )

  return {
    captures: {
      studyHabitCalendarDashboardCapture: dashboardCapture,
      studyHabitCalendarRangeCapture: switchedCapture,
      studyHabitCalendarSourceScopedCapture: sourceScopedCapture,
    },
    metrics: {
      ...dashboardMetrics,
      studyReviewProgressHeatmapDaysAfterSwitch: switchedMetrics.studyReviewProgressHeatmapDays,
      studyReviewProgressPeriodDaysAfterSwitch: switchedMetrics.studyReviewProgressPeriodDays,
      studyReviewProgressPeriodSwitchPreservesSourceScope,
      studyReviewProgressPeriodSwitchesTo30,
      studyReviewProgressSourceScoped: sourceMetrics.studyReviewProgressSourceScoped,
    },
  }
}

async function captureStudyReviewProgressEvidenceForHarness({
  baseUrl,
  directory,
  harness,
  page,
  stageLabel,
  stagePrefix,
}) {
  const response = await page.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Study navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  await page.locator('[data-study-review-progress-panel-stage922="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator(`[data-study-review-progress-recent-row-stage922="${cssAttr(harness.card.id)}"]`).first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator(`[data-study-review-progress-source-id-stage922="${cssAttr(harness.document.id)}"]`).first().waitFor({
    state: 'visible',
    timeout: 20000,
  })

  const dashboardMetrics = await readStudyReviewProgressMetrics(page)
  if (
    !dashboardMetrics.studyReviewProgressPanelVisible ||
    dashboardMetrics.studyReviewProgressTodayCount < 1 ||
    dashboardMetrics.studyReviewProgressDailyStreak < 1 ||
    !dashboardMetrics.studyReviewProgressActivityVisible ||
    !dashboardMetrics.studyReviewProgressRatingMixVisible ||
    !dashboardMetrics.studyReviewProgressRecentReviewsVisible ||
    !dashboardMetrics.studyReviewProgressSourceRowsVisible
  ) {
    throw new Error(`${stageLabel} expected Study review progress dashboard metrics to be visible.`)
  }

  const dashboardCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-review-progress-dashboard.png`,
  )

  await page.locator(`[data-study-review-progress-recent-row-stage922="${cssAttr(harness.card.id)}"]`).first().click()
  await page.waitForFunction(
    (prompt) => document.querySelector('[aria-label="Active review prompt"]')?.textContent?.includes(prompt),
    harness.prompt,
  )
  const selectedMetrics = await readStudyReviewProgressMetrics(page)
  const studyReviewProgressRecentReviewSelectsCard =
    selectedMetrics.studyReviewProgressActivePrompt?.includes(harness.prompt) ?? false
  if (!studyReviewProgressRecentReviewSelectsCard) {
    throw new Error(`${stageLabel} expected recent review row to select the matching Study card.`)
  }

  await page
    .locator(`[data-study-review-progress-source-id-stage922="${cssAttr(harness.document.id)}"]`)
    .first()
    .locator('[data-study-review-progress-source-questions-stage922="true"]')
    .click()
  await page.locator('[data-study-source-scoped-question-search-stage914="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator('[data-study-review-progress-panel-stage922="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const sourceMetrics = await readStudyReviewProgressMetrics(page)
  const studyReviewProgressSourceScoped =
    sourceMetrics.studyReviewProgressSourceScoped && sourceMetrics.studyReviewProgressTotalCount >= 1
  const studyReviewProgressSourceRowOpensQuestions = Boolean(
    await page.locator('[data-study-source-scoped-question-search-stage914="true"]').first().isVisible().catch(() => false),
  )
  if (!studyReviewProgressSourceScoped || !studyReviewProgressSourceRowOpensQuestions) {
    throw new Error(`${stageLabel} expected progress source row to open source-scoped Questions with progress scoped.`)
  }

  const sourceScopedCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-review-progress-source-scoped-questions.png`,
  )

  return {
    captures: {
      studyReviewProgressDashboardCapture: dashboardCapture,
      studyReviewProgressSourceScopedCapture: sourceScopedCapture,
    },
    metrics: {
      ...dashboardMetrics,
      studyReviewProgressRecentReviewSelectsCard,
      studyReviewProgressSourceRowOpensQuestions,
      studyReviewProgressSourceScoped,
    },
  }
}

async function captureStudyKnowledgeStageEvidenceForHarness({
  baseUrl,
  directory,
  harness,
  page,
  stageLabel,
  stagePrefix,
}) {
  const response = await page.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Study navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  const harnessStage = harness.card.knowledge_stage ?? 'practiced'
  await page.locator('[data-study-knowledge-stage-panel-stage924="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page
    .locator(`[data-study-knowledge-stage-source-id-stage924="${cssAttr(harness.document.id)}"]`)
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  await page
    .locator(`[data-study-knowledge-stage-chip-stage924="${cssAttr(harnessStage)}"]`)
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })

  const dashboardMetrics = await readStudyKnowledgeStageMetrics(page)
  if (
    !dashboardMetrics.studyKnowledgeStagePanelVisible ||
    !dashboardMetrics.studyKnowledgeStageCountsVisible ||
    !dashboardMetrics.studyKnowledgeStageSourceRowsVisible ||
    dashboardMetrics.studyKnowledgeStageTotalCount < 1
  ) {
    throw new Error(`${stageLabel} expected Study memory stats panel, counts, and source rows to be visible.`)
  }

  const dashboardCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-knowledge-stage-dashboard.png`,
  )

  await page.locator(`[data-study-knowledge-stage-chip-stage924="${cssAttr(harnessStage)}"]`).first().click()
  await page
    .locator(`[data-study-knowledge-stage-filter-value-stage924="${cssAttr(harnessStage)}"]`)
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  await page
    .locator(`[data-study-knowledge-stage-question-result-stage924="${cssAttr(harnessStage)}"]`)
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  const filterMetrics = await readStudyKnowledgeStageMetrics(page)
  const studyKnowledgeStageChipOpensQuestions =
    filterMetrics.studyKnowledgeStageFilterValue === harnessStage &&
    filterMetrics.studyKnowledgeStageQuestionRowsFiltered
  if (!studyKnowledgeStageChipOpensQuestions) {
    throw new Error(`${stageLabel} expected stage chip to open Questions filtered to ${harnessStage}.`)
  }

  await page
    .locator(`[data-study-knowledge-stage-source-id-stage924="${cssAttr(harness.document.id)}"]`)
    .first()
    .locator('[data-study-knowledge-stage-source-questions-stage924="true"]')
    .click()
  await page.locator('[data-study-source-scoped-question-search-stage914="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page
    .locator('[data-study-knowledge-stage-source-scoped-stage924="true"]')
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  const sourceMetrics = await readStudyKnowledgeStageMetrics(page)
  const studyKnowledgeStageSourceRowOpensQuestions = Boolean(
    await page.locator('[data-study-source-scoped-question-search-stage914="true"]').first().isVisible().catch(() => false),
  )
  const studyKnowledgeStageSourceScoped =
    sourceMetrics.studyKnowledgeStageSourceScoped && sourceMetrics.studyKnowledgeStageTotalCount >= 1
  if (!studyKnowledgeStageSourceRowOpensQuestions || !studyKnowledgeStageSourceScoped) {
    throw new Error(`${stageLabel} expected memory source row to open source-scoped Questions and stats.`)
  }

  const sourceScopedCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-knowledge-stage-source-scoped-questions.png`,
  )

  return {
    captures: {
      studyKnowledgeStageDashboardCapture: dashboardCapture,
      studyKnowledgeStageSourceScopedCapture: sourceScopedCapture,
    },
    metrics: {
      ...dashboardMetrics,
      studyKnowledgeStageChipOpensQuestions,
      studyKnowledgeStageFilterValue: harnessStage,
      studyKnowledgeStageQuestionRowsFiltered: filterMetrics.studyKnowledgeStageQuestionRowsFiltered,
      studyKnowledgeStageSourceRowOpensQuestions,
      studyKnowledgeStageSourceScoped,
    },
  }
}

async function captureStudyQuestionReviewHistoryEvidenceForHarness({
  baseUrl,
  directory,
  harness,
  page,
  stageLabel,
  stagePrefix,
}) {
  const response = await page.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Study navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  await page.locator('[data-study-review-progress-panel-stage922="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator('[data-study-review-history-progress-filter-stage928="good"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })

  await page.locator('[data-study-review-history-progress-filter-stage928="good"]').first().click()
  await page.locator('[data-study-review-history-filter-value-stage928="good"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator('[data-study-question-active-filters-stage928="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator('[data-study-review-history-question-result-stage928="good"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })

  const filteredMetrics = await readStudyQuestionReviewHistoryMetrics(page)
  const studyQuestionReviewHistoryRatingChipOpensQuestions =
    filteredMetrics.studyQuestionReviewHistoryFilterValue === 'good' &&
    filteredMetrics.studyQuestionReviewHistoryRowsFiltered
  if (!studyQuestionReviewHistoryRatingChipOpensQuestions) {
    throw new Error(`${stageLabel} expected the Good rating chip to open review-history filtered Questions.`)
  }

  const filteredCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-question-review-history-filtered.png`,
  )

  await page.locator('[data-study-question-clear-filters-stage928="true"]').first().click()
  await page.waitForFunction(() => {
    return (
      !document.querySelector('[data-study-question-active-filters-stage928="true"]') &&
      !document.querySelector('[data-study-review-history-filter-chip-stage928="true"]') &&
      Boolean(document.querySelector('[data-study-review-history-filter-options-stage928="true"]'))
    )
  })
  const clearMetrics = await readStudyQuestionReviewHistoryMetrics(page)
  const studyQuestionReviewHistoryClearFiltersWorks =
    !clearMetrics.studyQuestionReviewHistoryActiveFilterStackVisible &&
    clearMetrics.studyQuestionReviewHistoryFilterValue === null &&
    clearMetrics.studyQuestionReviewHistoryControlsVisible
  if (!studyQuestionReviewHistoryClearFiltersWorks) {
    throw new Error(`${stageLabel} expected Clear filters to reset review-history filters while keeping Questions open.`)
  }

  await page.locator('[data-study-review-history-filter-option-stage928="good"]').first().click()
  await page.locator('[data-study-review-filtered-handoff-stage928="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator('[data-study-review-filtered-handoff-stage928="true"]').first().click()
  await page.waitForFunction(() => {
    return (
      !document.querySelector('[aria-label="Study questions manager"]') &&
      Boolean(document.querySelector('[aria-label="Active review prompt"]'))
    )
  })
  const handoffMetrics = await readStudyQuestionReviewHistoryMetrics(page)
  const studyQuestionReviewHistoryReviewFilteredHandoff =
    !handoffMetrics.studyQuestionReviewHistoryQuestionsManagerVisible &&
    Boolean(handoffMetrics.studyQuestionReviewHistoryActivePrompt)
  if (!studyQuestionReviewHistoryReviewFilteredHandoff) {
    throw new Error(`${stageLabel} expected Review filtered to return to Review with an active filtered prompt.`)
  }

  const handoffCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-question-review-history-review-filtered.png`,
  )

  return {
    captures: {
      studyQuestionReviewHistoryFilteredCapture: filteredCapture,
      studyQuestionReviewHistoryReviewFilteredCapture: handoffCapture,
    },
    metrics: {
      ...filteredMetrics,
      studyQuestionReviewHistoryActiveFilterStackVisible:
        filteredMetrics.studyQuestionReviewHistoryActiveFilterStackVisible,
      studyQuestionReviewHistoryClearFiltersWorks,
      studyQuestionReviewHistoryRatingChipOpensQuestions,
      studyQuestionReviewHistoryReviewFilteredHandoff,
    },
  }
}

async function captureStudyCollectionSubsetEvidenceForHarness({
  baseUrl,
  directory,
  harness,
  page,
  stageLabel,
  stagePrefix,
}) {
  const response = await page.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Study navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  await page.locator('[data-study-collection-subsets-panel-stage930="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const subsetSelector = await page.evaluate(() => {
    const isVisible = (element) =>
      element instanceof HTMLElement &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0 &&
      window.getComputedStyle(element).visibility !== 'hidden'
    const rows = Array.from(document.querySelectorAll('[data-study-collection-subset-filter-stage930]'))
      .filter(isVisible)
    const row =
      rows.find((candidate) =>
        Number(candidate.getAttribute('data-study-collection-subset-count-stage930') ?? 0) > 0 &&
        candidate.getAttribute('data-study-collection-subset-filter-stage930') !== 'collection:untagged',
      ) ??
      rows.find((candidate) =>
        Number(candidate.getAttribute('data-study-collection-subset-count-stage930') ?? 0) > 0,
      ) ??
      null
    return row?.getAttribute('data-study-collection-subset-filter-stage930') ?? null
  })
  if (!subsetSelector) {
    throw new Error(`${stageLabel} expected at least one Study subset row with cards.`)
  }

  await page.locator(`[data-study-collection-subset-filter-stage930="${subsetSelector}"]`).first().click()
  await page.locator(`[data-study-collection-filter-value-stage930="${subsetSelector}"]`).first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator(`[data-study-collection-question-result-stage930="${subsetSelector}"]`).first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const filteredMetrics = await readStudyCollectionSubsetMetrics(page)
  const studyCollectionSubsetStaticRowOpensQuestions =
    filteredMetrics.studyCollectionSubsetFilterValue === subsetSelector &&
    filteredMetrics.studyCollectionSubsetRowsFiltered
  if (!studyCollectionSubsetStaticRowOpensQuestions) {
    throw new Error(`${stageLabel} expected a Study subset row to open subset-filtered Questions.`)
  }

  const filteredCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-collection-subset-filtered.png`,
  )

  await page.locator('[data-study-question-clear-filters-stage928="true"]').first().click()
  await page.waitForFunction(() => {
    return (
      !document.querySelector('[data-study-question-active-filters-stage928="true"]') &&
      !document.querySelector('[data-study-collection-filter-chip-stage930="true"]') &&
      Boolean(document.querySelector('[data-study-collection-filter-options-stage930="true"]'))
    )
  })
  const clearMetrics = await readStudyCollectionSubsetMetrics(page)
  const studyCollectionSubsetClearFiltersWorks =
    !clearMetrics.studyCollectionSubsetActiveFilterStackVisible &&
    clearMetrics.studyCollectionSubsetFilterValue === null &&
    clearMetrics.studyCollectionSubsetControlsVisible
  if (!studyCollectionSubsetClearFiltersWorks) {
    throw new Error(`${stageLabel} expected Clear filters to reset Study subset filters.`)
  }

  await page.locator(`[data-study-collection-subset-filter-stage930="${subsetSelector}"]`).first().click()
  await page.locator('[data-study-review-filtered-handoff-stage928="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator('[data-study-review-filtered-handoff-stage928="true"]').first().click()
  await page.waitForFunction(() => {
    return (
      !document.querySelector('[aria-label="Study questions manager"]') &&
      Boolean(document.querySelector('[aria-label="Active review prompt"]'))
    )
  })
  const handoffMetrics = await readStudyCollectionSubsetMetrics(page)
  const studyCollectionSubsetReviewFilteredHandoff =
    !handoffMetrics.studyCollectionSubsetQuestionsManagerVisible &&
    Boolean(handoffMetrics.studyCollectionSubsetActivePrompt)
  if (!studyCollectionSubsetReviewFilteredHandoff) {
    throw new Error(`${stageLabel} expected Review filtered to return to Review from a subset-filtered queue.`)
  }

  const handoffCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-collection-subset-review-filtered.png`,
  )

  return {
    captures: {
      studyCollectionSubsetFilteredCapture: filteredCapture,
      studyCollectionSubsetReviewFilteredCapture: handoffCapture,
    },
    metrics: {
      ...filteredMetrics,
      studyCollectionSubsetClearFiltersWorks,
      studyCollectionSubsetReviewFilteredHandoff,
      studyCollectionSubsetStaticRowOpensQuestions,
      studyCollectionSubsetUsedFilter: subsetSelector,
    },
  }
}

async function cleanupStudyReviewProgressHarness({ baseUrl, harness }) {
  if (!harness?.document?.id) {
    return {
      studyReviewProgressHarnessDocumentDeleted: false,
      studyReviewProgressHarnessCleanupError: 'missing harness document id',
    }
  }
  try {
    const response = await fetch(`${baseUrl}/api/documents/${encodeURIComponent(harness.document.id)}`, {
      method: 'DELETE',
    })
    if (!response.ok && response.status !== 404) {
      return {
        studyReviewProgressHarnessDocumentDeleted: false,
        studyReviewProgressHarnessCleanupError: `delete returned ${response.status}`,
      }
    }
    const scopedProgress = await fetchJson(
      `${baseUrl}/api/recall/study/progress?source_document_id=${encodeURIComponent(harness.document.id)}`,
    )
    return {
      studyReviewProgressHarnessDocumentDeleted: response.ok || response.status === 404,
      studyReviewProgressHarnessProgressCleaned: scopedProgress.total_reviews === 0,
      studyReviewProgressHarnessCleanupError: null,
    }
  } catch (error) {
    return {
      studyReviewProgressHarnessDocumentDeleted: false,
      studyReviewProgressHarnessCleanupError: error instanceof Error ? error.message : String(error),
    }
  }
}

async function cleanupStudySchedulingControlsHarness({ baseUrl, harness }) {
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
    studyQuestionSchedulingHarnessCleanupError: results.find((result) => result.error)?.error ?? null,
    studyQuestionSchedulingHarnessDocumentsDeleted:
      results.length > 0 && results.every((result) => result.deleted),
    studyQuestionSchedulingHarnessProgressCleaned:
      results.length > 0 && results.every((result) => result.progressCleaned),
  }
}

async function cleanupStudyQuestionManagementHarness({ baseUrl, harness }) {
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
    studyQuestionManagementHarnessCleanupError: results.find((result) => result.error)?.error ?? null,
    studyQuestionManagementHarnessDocumentsDeleted:
      results.length > 0 && results.every((result) => result.deleted),
    studyQuestionManagementHarnessProgressCleaned:
      results.length > 0 && results.every((result) => result.progressCleaned),
  }
}

async function cleanupStudyQuestionCreationHarness({ baseUrl, harness }) {
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
    studyQuestionCreateHarnessCleanupError: results.find((result) => result.error)?.error ?? null,
    studyQuestionCreateHarnessDocumentsDeleted:
      results.length > 0 && results.every((result) => result.deleted),
    studyQuestionCreateHarnessProgressCleaned:
      results.length > 0 && results.every((result) => result.progressCleaned),
  }
}

export async function readStudyQuestionSchedulingMetrics(page) {
  return page.evaluate(() => {
    const isVisible = (element) =>
      element instanceof HTMLElement &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0 &&
      window.getComputedStyle(element).visibility !== 'hidden'
    const scheduleRows = Array.from(document.querySelectorAll('[data-study-question-schedule-state-stage934]'))
      .filter(isVisible)
    const scheduleActions = Array.from(document.querySelectorAll('[data-study-question-schedule-action-stage934]'))
      .filter(isVisible)
    const activeActions = Array.from(document.querySelectorAll('[data-study-active-card-schedule-action-stage934]'))
      .filter(isVisible)
    return {
      studyQuestionSchedulingActiveActionVisible: activeActions.length > 0,
      studyQuestionSchedulingActivePrompt:
        document.querySelector('[aria-label="Active review prompt"]')?.textContent?.trim() ?? null,
      studyQuestionSchedulingAnyScheduleActionVisible: scheduleActions.length > 0 || activeActions.length > 0,
      studyQuestionSchedulingQuestionsManagerVisible: isVisible(
        document.querySelector('[aria-label="Study questions manager"]'),
      ),
      studyQuestionSchedulingRowCount: scheduleRows.length,
      studyQuestionSchedulingRowScheduleActionsVisible: scheduleActions.length > 0,
      studyQuestionSchedulingUnscheduledRowsVisible: scheduleRows.some(
        (row) => row.getAttribute('data-study-question-schedule-state-stage934') === 'unscheduled',
      ),
    }
  })
}

export async function readStudyQuestionManagementMetrics(page) {
  return page.evaluate(() => {
    const isVisible = (element) =>
      element instanceof HTMLElement &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0 &&
      window.getComputedStyle(element).visibility !== 'hidden'
    const editActions = Array.from(document.querySelectorAll('[data-study-question-edit-action-stage936]'))
      .filter(isVisible)
    const deleteActions = Array.from(document.querySelectorAll('[data-study-question-delete-action-stage936]'))
      .filter(isVisible)
    const bulkDelete = document.querySelector('[data-study-question-bulk-delete-stage936="true"]')
    const toolbar = document.querySelector('[data-study-question-management-toolbar-stage936="true"]')
    return {
      studyQuestionManagementActiveEditActionVisible: editActions.some(
        (action) => action.getAttribute('data-study-question-edit-action-stage936') !== 'row',
      ),
      studyQuestionManagementActivePrompt:
        document.querySelector('[aria-label="Active review prompt"]')?.textContent?.trim() ?? null,
      studyQuestionManagementBulkDeleteVisible: isVisible(bulkDelete),
      studyQuestionManagementDeleteActionsVisible: deleteActions.length > 0,
      studyQuestionManagementEditActionsVisible: editActions.length > 0,
      studyQuestionManagementToolbarVisible: isVisible(toolbar),
    }
  })
}

export async function readStudyKnowledgeStageMetrics(page) {
  return page.evaluate(() => {
    const isVisible = (element) =>
      element instanceof HTMLElement &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0 &&
      window.getComputedStyle(element).visibility !== 'hidden'
    const visiblePanels = Array.from(document.querySelectorAll('[data-study-knowledge-stage-panel-stage924="true"]'))
      .filter(isVisible)
    const panel = visiblePanels[0] ?? null
    const sourceScopedPanel =
      visiblePanels.find((candidate) => candidate.getAttribute('data-study-knowledge-stage-source-scoped-stage924') === 'true') ??
      panel
    const visibleChips = Array.from(document.querySelectorAll('[data-study-knowledge-stage-chip-stage924]')).filter(isVisible)
    const sourceRows = Array.from(document.querySelectorAll('[data-study-knowledge-stage-source-row-stage924="true"]'))
    const filteredRows = Array.from(document.querySelectorAll('[data-study-knowledge-stage-question-result-stage924]'))
      .filter(isVisible)
    const activeFilter = document.querySelector('[data-study-knowledge-stage-filter-chip-stage924="true"]')
    return {
      studyKnowledgeStageChipStages: visibleChips.map((chip) =>
        chip.getAttribute('data-study-knowledge-stage-chip-stage924'),
      ),
      studyKnowledgeStageCountsVisible: isVisible(
        document.querySelector('[data-study-knowledge-stage-counts-stage924="true"]'),
      ),
      studyKnowledgeStageFilterValue:
        activeFilter?.getAttribute('data-study-knowledge-stage-filter-value-stage924') ?? null,
      studyKnowledgeStagePanelVisible: isVisible(panel),
      studyKnowledgeStageQuestionRowsFiltered: filteredRows.length > 0,
      studyKnowledgeStageSourceRowsVisible: sourceRows.some(isVisible),
      studyKnowledgeStageSourceScoped:
        sourceScopedPanel?.getAttribute('data-study-knowledge-stage-source-scoped-stage924') === 'true',
      studyKnowledgeStageTotalCount: Number(
        sourceScopedPanel?.getAttribute('data-study-knowledge-stage-total-stage924') ??
          panel?.getAttribute('data-study-knowledge-stage-total-stage924') ??
          0,
      ),
    }
  })
}

export async function readStudyReviewProgressMetrics(page) {
  return page.evaluate(() => {
    const isVisible = (element) =>
      element instanceof HTMLElement &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0 &&
      window.getComputedStyle(element).visibility !== 'hidden'
    const panel =
      Array.from(document.querySelectorAll('[data-study-review-progress-panel-stage922="true"]')).find(isVisible) ??
      document.querySelector('[data-study-review-progress-panel-stage922="true"]')
    const heatmap = document.querySelector('[data-study-review-progress-heatmap-stage926="true"]')
    const today = document.querySelector('[data-study-review-progress-today-stage922]')
    const streak = document.querySelector('[data-study-review-progress-streak-stage922]')
    const recentRows = Array.from(document.querySelectorAll('[data-study-review-progress-recent-row-stage922]'))
    const sourceRows = Array.from(document.querySelectorAll('[data-study-review-progress-source-row-stage922="true"]'))
    return {
      studyReviewProgressActivePrompt:
        document.querySelector('[aria-label="Active review prompt"]')?.textContent?.trim() ?? null,
      studyReviewProgressActivityVisible: isVisible(
        document.querySelector('[data-study-review-progress-activity-stage922="true"]'),
      ),
      studyReviewProgressDailyStreak: Number(streak?.getAttribute('data-study-review-progress-streak-stage922') ?? 0),
      studyReviewProgressEmptyStateActionable: isVisible(
        document.querySelector('[data-study-review-progress-empty-stage922="true"] button'),
      ),
      studyReviewProgressPanelVisible: isVisible(panel),
      studyReviewProgressHeatmapDays: Number(heatmap?.getAttribute('data-study-review-progress-heatmap-days-stage926') ?? 0),
      studyReviewProgressHeatmapVisible: isVisible(heatmap),
      studyReviewProgressPeriodControlsVisible: isVisible(
        document.querySelector('[data-study-review-progress-period-controls-stage926="true"]'),
      ),
      studyReviewProgressPeriodDays: Number(panel?.getAttribute('data-study-review-progress-period-stage926') ?? 0),
      studyReviewProgressRatingMixVisible: isVisible(
        document.querySelector('[data-study-review-progress-rating-mix-stage922="true"]'),
      ),
      studyReviewProgressRecentReviewsVisible: recentRows.some(isVisible),
      studyReviewProgressSourceRowsVisible: sourceRows.some(isVisible),
      studyReviewProgressSourceScoped:
        panel?.getAttribute('data-study-review-progress-source-scoped-stage922') === 'true',
      studyReviewProgressTodayCount: Number(today?.getAttribute('data-study-review-progress-today-stage922') ?? 0),
      studyReviewProgressTotalCount: Number(panel?.getAttribute('data-study-review-progress-total-stage922') ?? 0),
    }
  })
}

export async function readStudyMemoryProgressMetrics(page) {
  return page.evaluate(() => {
    const isVisible = (element) =>
      element instanceof HTMLElement &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0 &&
      window.getComputedStyle(element).visibility !== 'hidden'
    const visiblePanels = Array.from(document.querySelectorAll('[data-study-memory-progress-panel-stage932="true"]'))
      .filter(isVisible)
    const panel = visiblePanels[0] ?? document.querySelector('[data-study-memory-progress-panel-stage932="true"]')
    const sourceScopedPanel =
      visiblePanels.find((candidate) => candidate.getAttribute('data-study-memory-progress-source-scoped-stage932') === 'true') ??
      panel
    const timeline = document.querySelector('[data-study-memory-progress-timeline-stage932="true"]')
    const activeFilter = document.querySelector('[data-study-knowledge-stage-filter-chip-stage924="true"]')
    const filteredRows = Array.from(document.querySelectorAll('[data-study-knowledge-stage-question-result-stage924]'))
      .filter(isVisible)
    const legendButtons = Array.from(document.querySelectorAll('[data-study-memory-progress-stage-open-stage932]'))
      .filter(isVisible)
    return {
      studyMemoryProgressDays: Number(panel?.getAttribute('data-study-memory-progress-days-stage932') ?? 0),
      studyMemoryProgressKnowledgeFilterValue:
        activeFilter?.getAttribute('data-study-knowledge-stage-filter-value-stage924') ?? null,
      studyMemoryProgressLegendStages: legendButtons.map((button) =>
        button.getAttribute('data-study-memory-progress-stage-open-stage932'),
      ),
      studyMemoryProgressPanelVisible: isVisible(panel),
      studyMemoryProgressPeriodDays: Number(panel?.getAttribute('data-study-memory-progress-period-stage932') ?? 0),
      studyMemoryProgressQuestionRowsFiltered: filteredRows.length > 0,
      studyMemoryProgressSourceScoped:
        sourceScopedPanel?.getAttribute('data-study-memory-progress-source-scoped-stage932') === 'true',
      studyMemoryProgressTimelineVisible: isVisible(timeline),
      studyMemoryProgressTotalCount: Number(panel?.getAttribute('data-study-memory-progress-total-stage932') ?? 0),
    }
  })
}

export async function readStudyQuestionReviewHistoryMetrics(page) {
  return page.evaluate(() => {
    const isVisible = (element) =>
      element instanceof HTMLElement &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0 &&
      window.getComputedStyle(element).visibility !== 'hidden'
    const activeFilter = document.querySelector('[data-study-review-history-filter-chip-stage928="true"]')
    const activeFilterStack = document.querySelector('[data-study-question-active-filters-stage928="true"]')
    const controls = document.querySelector('[data-study-review-history-filter-options-stage928="true"]')
    const filteredRows = Array.from(document.querySelectorAll('[data-study-review-history-question-result-stage928]'))
      .filter(isVisible)
    const reviewFiltered = document.querySelector('[data-study-review-filtered-handoff-stage928="true"]')
    return {
      studyQuestionReviewHistoryActiveFilterStackVisible: isVisible(activeFilterStack),
      studyQuestionReviewHistoryActivePrompt:
        document.querySelector('[aria-label="Active review prompt"]')?.textContent?.trim() ?? null,
      studyQuestionReviewHistoryClearFiltersVisible: isVisible(
        document.querySelector('[data-study-question-clear-filters-stage928="true"]'),
      ),
      studyQuestionReviewHistoryControlsVisible: isVisible(controls),
      studyQuestionReviewHistoryFilterValue:
        activeFilter?.getAttribute('data-study-review-history-filter-value-stage928') ?? null,
      studyQuestionReviewHistoryQuestionsManagerVisible: isVisible(
        document.querySelector('[aria-label="Study questions manager"]'),
      ),
      studyQuestionReviewHistoryReviewFilteredVisible: isVisible(reviewFiltered),
      studyQuestionReviewHistoryRowsFiltered: filteredRows.length > 0,
    }
  })
}

export async function readStudyCollectionSubsetMetrics(page) {
  return page.evaluate(() => {
    const isVisible = (element) =>
      element instanceof HTMLElement &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0 &&
      window.getComputedStyle(element).visibility !== 'hidden'
    const panel = document.querySelector('[data-study-collection-subsets-panel-stage930="true"]')
    const controls = document.querySelector('[data-study-collection-filter-options-stage930="true"]')
    const activeFilter = document.querySelector('[data-study-collection-filter-chip-stage930="true"]')
    const activeFilterStack = document.querySelector('[data-study-question-active-filters-stage928="true"]')
    const filteredRows = Array.from(document.querySelectorAll('[data-study-collection-question-result-stage930]'))
      .filter(isVisible)
    const subsetRows = Array.from(document.querySelectorAll('[data-study-collection-subset-filter-stage930]'))
      .filter(isVisible)
    return {
      studyCollectionSubsetActiveFilterStackVisible: isVisible(activeFilterStack),
      studyCollectionSubsetActivePrompt:
        document.querySelector('[aria-label="Active review prompt"]')?.textContent?.trim() ?? null,
      studyCollectionSubsetClearFiltersVisible: isVisible(
        document.querySelector('[data-study-question-clear-filters-stage928="true"]'),
      ),
      studyCollectionSubsetControlsVisible: isVisible(controls),
      studyCollectionSubsetFilterValue:
        activeFilter?.getAttribute('data-study-collection-filter-value-stage930') ?? null,
      studyCollectionSubsetPanelVisible: isVisible(panel),
      studyCollectionSubsetQuestionsManagerVisible: isVisible(
        document.querySelector('[aria-label="Study questions manager"]'),
      ),
      studyCollectionSubsetReviewFilteredVisible: isVisible(
        document.querySelector('[data-study-review-filtered-handoff-stage928="true"]'),
      ),
      studyCollectionSubsetRowsFiltered: filteredRows.length > 0,
      studyCollectionSubsetRowsVisible: subsetRows.length > 0,
      studyCollectionSubsetStaticRowCount: subsetRows.filter((row) =>
        !row.getAttribute('data-study-collection-subset-filter-stage930')?.startsWith('collection:custom:'),
      ).length,
    }
  })
}

async function fetchJson(url, init) {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`)
  }
  return response.json()
}

async function studyCardVisibleInList({ baseUrl, cardId }) {
  const cards = await fetchJson(`${baseUrl}/api/recall/study/cards?status=all&limit=${studyCardHarnessLimit}`)
  return cards.some((card) => card.id === cardId)
}

async function waitForStudyCardMissing({ baseUrl, cardId, timeoutMs = 4000 }) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    if (!(await studyCardVisibleInList({ baseUrl, cardId }))) {
      return true
    }
    await new Promise((resolve) => setTimeout(resolve, 120))
  }
  throw new Error(`Study card ${cardId} remained visible after ${timeoutMs}ms.`)
}

async function waitForStudyCardPrompt({ baseUrl, prompt, timeoutMs = 4000 }) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    const cards = await fetchJson(`${baseUrl}/api/recall/study/cards?status=all&limit=${studyCardHarnessLimit}`)
    const card = cards.find((candidate) => candidate.prompt === prompt)
    if (card) {
      return card
    }
    await new Promise((resolve) => setTimeout(resolve, 120))
  }
  throw new Error(`Study card prompt "${prompt}" was not visible after ${timeoutMs}ms.`)
}

async function waitForStudyCardStatus({ baseUrl, cardId, status, timeoutMs = 20000 }) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    const cards = await fetchJson(
      `${baseUrl}/api/recall/study/cards?status=${encodeURIComponent(status)}&limit=${studyCardHarnessLimit}`,
    )
    const card = cards.find((candidate) => candidate.id === cardId)
    if (card) {
      return card
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`Timed out waiting for Study card ${cardId} to reach status ${status}.`)
}

function cssAttr(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}
