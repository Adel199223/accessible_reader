import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { inflateRawSync } from 'node:zlib'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { captureLocatorScreenshot, captureViewportScreenshot, openHome } from './home_rendered_preview_quality_shared.mjs'

export async function captureSourceLearningExportsEvidence({
  baseUrl,
  directory,
  includeRestoreEvidence = false,
  page,
  restoreBaseUrl = baseUrl,
  stageLabel,
  stagePrefix,
}) {
  const harness = await createSourceLearningExportsHarness({ baseUrl, stagePrefix })
  let result
  let validationError
  try {
    result = await captureSourceLearningExportsEvidenceForHarness({
      baseUrl,
      directory,
      harness,
      includeRestoreEvidence,
      page,
      restoreBaseUrl,
      stageLabel,
      stagePrefix,
    })
  } catch (error) {
    validationError = error
    await captureViewportScreenshot(page, directory, `${stagePrefix}-failure.png`).catch(() => null)
  }

  const cleanupMetrics = await cleanupSourceLearningExportsHarness({ baseUrl, harness })
  if (validationError) {
    validationError.sourceLearningExportsHarnessCleanup = cleanupMetrics
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

async function captureSourceLearningExportsEvidenceForHarness({
  baseUrl,
  directory,
  harness,
  includeRestoreEvidence,
  page,
  restoreBaseUrl,
  stageLabel,
  stagePrefix,
}) {
  const plainExport = await fetchText(
    `${baseUrl}/api/recall/documents/${encodeURIComponent(harness.document.id)}/export.md`,
  )
  const learningPack = await fetchText(
    `${baseUrl}/api/recall/documents/${encodeURIComponent(harness.document.id)}/learning-export.md`,
  )
  const manifest = await fetchJson(`${baseUrl}/api/workspace/export.manifest.json`)
  const workspaceZipBuffer = await fetchBuffer(`${baseUrl}/api/workspace/export.zip`)
  const zipEntries = readZipEntries(workspaceZipBuffer)
  const workspaceZipPath = path.join(directory, `${stagePrefix}-workspace-export.zip`)
  const workspaceManifestPath = path.join(directory, `${stagePrefix}-manifest.json`)
  await writeFile(workspaceZipPath, workspaceZipBuffer)
  await writeFile(workspaceManifestPath, zipEntries['manifest.json'] ?? JSON.stringify(manifest, null, 2))
  const zipPreview = await postImportPreviewFile({
    baseUrl,
    content: workspaceZipBuffer,
    fileName: 'workspace-export.zip',
    mediaType: 'application/zip',
  })
  const manifestPreview = await postImportPreviewFile({
    baseUrl,
    content: Buffer.from(zipEntries['manifest.json'] ?? JSON.stringify(manifest)),
    fileName: 'manifest.json',
    mediaType: 'application/json',
  })
  const invalidZipPreview = await postImportPreviewFile({
    baseUrl,
    content: Buffer.from('not a workspace zip'),
    fileName: 'not-a-workspace-backup.zip',
    mediaType: 'application/zip',
    parseJson: false,
  })
  const sourceLearningPackEntry = Object.entries(zipEntries).find(
    ([name, content]) =>
      name.startsWith('sources/') &&
      name.endsWith('/learning-pack.md') &&
      content.includes(harness.document.title) &&
      content.includes(harness.marker),
  )

  await openHome(page, baseUrl)
  const workspaceExportPanel = page.locator('[data-home-workspace-export-stage958="true"]').first()
  await workspaceExportPanel.waitFor({ state: 'visible', timeout: 20000 })
  const homeWorkspaceExportCountsVisible =
    (await workspaceExportPanel.locator('[data-home-workspace-export-counts-stage958="true"]').count()) > 0
  const homeWorkspaceZipActionVisible =
    (await workspaceExportPanel.locator('[data-home-workspace-export-zip-stage958="true"]').count()) > 0
  const workspaceExportCapture = await captureLocatorScreenshot(
    page,
    workspaceExportPanel,
    directory,
    `${stagePrefix}-home-workspace-export.png`,
  )
  const backupPreviewInput = workspaceExportPanel.locator('[data-home-workspace-backup-preview-input-stage960="true"]')
  const homeWorkspaceBackupPreviewVisible =
    (await workspaceExportPanel.locator('[data-home-workspace-backup-preview-stage960="true"]').count()) > 0 &&
    (await backupPreviewInput.count()) > 0
  await backupPreviewInput.setInputFiles(workspaceZipPath)
  await workspaceExportPanel
    .locator('[data-home-workspace-backup-preview-dry-run-stage960="true"]')
    .waitFor({ state: 'visible', timeout: 20000 })
  const workspaceBackupPreviewCapture = await captureLocatorScreenshot(
    page,
    workspaceExportPanel,
    directory,
    `${stagePrefix}-home-workspace-backup-preview.png`,
  )
  const zipPreviewText = await workspaceExportPanel
    .locator('[data-home-workspace-backup-preview-summary-stage960="true"]')
    .innerText()
  await backupPreviewInput.setInputFiles(workspaceManifestPath)
  await workspaceExportPanel.getByText(/Manifest ·/).waitFor({ state: 'visible', timeout: 20000 })
  const manifestPreviewText = await workspaceExportPanel
    .locator('[data-home-workspace-backup-preview-summary-stage960="true"]')
    .innerText()

  const sourceButton = await revealHomeSourceButton(page, harness.document.title)
  await sourceButton.click()
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const sourceOverview = page.locator('.recall-source-overview-card').first()
  await sourceOverview.waitFor({ state: 'visible', timeout: 20000 })
  const sourceOverviewCapture = await captureLocatorScreenshot(
    page,
    sourceOverview,
    directory,
    `${stagePrefix}-source-overview-export-actions.png`,
  )
  const plainLinkHref = await page.getByRole('link', { name: 'Export source' }).first().getAttribute('href')
  const plainLinkVisible = (await page.getByRole('link', { name: 'Export source' }).count()) > 0
  const learningLink = page.getByRole('link', { name: 'Export learning pack' }).first()
  const learningLinkHref = await learningLink.getAttribute('href')
  const learningLinkVisible = (await learningLink.count()) > 0
  const restoreEvidence = includeRestoreEvidence
    ? await captureWorkspaceBackupRestoreEvidence({
        baseUrl,
        directory,
        harness,
        page,
        restoreBaseUrl,
        stagePrefix,
        workspaceZipPath,
      })
    : { captures: {}, metrics: {} }
  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })

  const learningPackSections = [
    '## Learning Pack',
    '### Source Review Summary',
    '### Notebook Notes',
    '### Graph Memory',
    '### Study Questions',
    '### Recent Study Attempts',
    '### Recent Review Sessions',
  ]
  const zipManifest = JSON.parse(zipEntries['manifest.json'] ?? '{}')
  const zipLearningPack = sourceLearningPackEntry?.[1] ?? ''
  const metrics = {
    homeWorkspaceExportCountsVisible,
    homeWorkspaceExportVisible: true,
    homeWorkspaceZipActionVisible,
    learningPackExportIncludesAttemptSummary:
      learningPack.includes('Recent Study Attempts') && learningPack.includes(harness.card.prompt),
    learningPackExportIncludesGraphMemory: learningPack.includes(harness.graphLabel),
    learningPackExportIncludesNote: learningPack.includes(harness.note.body_text),
    learningPackExportIncludesReviewProgress: learningPack.includes('Source Review Summary'),
    learningPackExportIncludesSections: learningPackSections.every((section) => learningPack.includes(section)),
    learningPackExportIncludesSessionSummary:
      learningPack.includes('Recent Review Sessions') && learningPack.includes(harness.session.id),
    learningPackExportIncludesStudyCard: learningPack.includes(harness.card.prompt),
    learningPackExportIncludesSourceMarkdown:
      learningPack.includes(`# ${harness.document.title}`) && learningPack.includes(harness.marker),
    learningPackExportOmitsSoftDeletedCard: !learningPack.includes(harness.deletedPrompt),
    plainSourceExportBackwardCompatible:
      plainExport.includes(`# ${harness.document.title}`) &&
      plainExport.includes(harness.marker) &&
      !plainExport.includes('## Learning Pack') &&
      !plainExport.includes(harness.note.body_text) &&
      !plainExport.includes(harness.card.prompt),
    sourceOverviewLearningPackExportHref: normalizePathname(learningLinkHref, baseUrl),
    sourceOverviewLearningPackExportLinkVisible: learningLinkVisible,
    sourceOverviewPlainExportHref: normalizePathname(plainLinkHref, baseUrl),
    sourceOverviewPlainExportLinkVisible: plainLinkVisible,
    workspaceManifestIncludesAttempts: (manifest.entity_counts?.study_answer_attempt ?? 0) > 0,
    workspaceManifestIncludesReviewSessions: (manifest.entity_counts?.study_review_session ?? 0) > 0,
    workspaceBackupPreviewAcceptsManifest:
      manifestPreview.status === 200 &&
      manifestPreview.json?.backup?.source_kind === 'manifest' &&
      manifestPreview.json?.backup?.bundle_coverage_available === false &&
      manifestPreviewText.includes('Manifest'),
    workspaceBackupPreviewAcceptsZip:
      zipPreview.status === 200 &&
      zipPreview.json?.backup?.source_kind === 'zip' &&
      zipPreviewText.includes('ZIP'),
    workspaceBackupPreviewAppliedFalse: zipPreview.json?.applied === false && manifestPreview.json?.applied === false,
    workspaceBackupPreviewDryRun: zipPreview.json?.dry_run === true && manifestPreview.json?.dry_run === true,
    workspaceBackupPreviewIncludesAttachmentCoverage:
      zipPreview.json?.backup?.bundle_coverage_available === true &&
      Number.isInteger(zipPreview.json?.backup?.attachment_count) &&
      Number.isInteger(zipPreview.json?.backup?.bundled_attachment_count),
    workspaceBackupPreviewIncludesAttemptAndSessionEntities:
      (zipPreview.json?.backup?.entity_counts?.study_answer_attempt ?? 0) > 0 &&
      (zipPreview.json?.backup?.entity_counts?.study_review_session ?? 0) > 0,
    workspaceBackupPreviewIncludesLearningPacks: (zipPreview.json?.backup?.learning_pack_count ?? 0) > 0,
    workspaceBackupPreviewInvalidZipRejected: invalidZipPreview.status === 400,
    workspaceBackupPreviewManifestApplyBlocked:
      manifestPreview.json?.can_apply === false &&
      (manifestPreview.json?.apply_blockers ?? []).some((blocker) => /manifest/i.test(blocker)),
    homeWorkspaceBackupPreviewVisible,
    workspaceZipIncludesDataPayload: Boolean(zipEntries['workspace-data.json']),
    workspaceZipIncludesLearningPack: Boolean(sourceLearningPackEntry),
    workspaceZipIncludesManifest: Boolean(zipEntries['manifest.json']),
    workspaceZipDataPayloadIncludesAttempts:
      (JSON.parse(zipEntries['workspace-data.json'] ?? '{}')?.study_answer_attempts ?? []).length > 0,
    workspaceZipDataPayloadIncludesReviewSessions:
      (JSON.parse(zipEntries['workspace-data.json'] ?? '{}')?.study_review_sessions ?? []).length > 0,
    workspaceZipLearningPackIncludesAttempt: zipLearningPack.includes('Recent Study Attempts'),
    workspaceZipLearningPackIncludesNote: zipLearningPack.includes(harness.note.body_text),
    workspaceZipLearningPackIncludesSession: zipLearningPack.includes(harness.session.id),
    workspaceZipLearningPackOmitsSoftDeletedCard: !zipLearningPack.includes(harness.deletedPrompt),
    workspaceZipManifestIncludesAttempts: (zipManifest.entity_counts?.study_answer_attempt ?? 0) > 0,
    workspaceZipManifestIncludesReviewSessions: (zipManifest.entity_counts?.study_review_session ?? 0) > 0,
    cleanupUtilityDryRunMatchedAfterSourceLearningExports: cleanupDryRun.matchedCount,
    ...restoreEvidence.metrics,
  }
  const captures = {
    ...restoreEvidence.captures,
    sourceOverviewCapture,
    workspaceBackupPreviewCapture,
    workspaceExportCapture,
  }

  await writeFile(
    path.join(directory, `${stagePrefix}-validation.json`),
    JSON.stringify({ captures, metrics, stageLabel }, null, 2),
  )

  return { captures, metrics }
}

async function captureWorkspaceBackupRestoreEvidence({
  baseUrl,
  directory,
  harness,
  page,
  restoreBaseUrl,
  stagePrefix,
  workspaceZipPath,
}) {
  const targetBaseUrl = restoreBaseUrl || baseUrl
  const usesSeparateRestoreWorkspace = normalizeOrigin(targetBaseUrl) !== normalizeOrigin(baseUrl)
  const deleteResponse = usesSeparateRestoreWorkspace
    ? { ok: true, status: null }
    : await fetch(`${baseUrl}/api/documents/${encodeURIComponent(harness.document.id)}`, {
        method: 'DELETE',
      }).catch((error) => ({ ok: false, status: 0, error }))
  const deletedStatus = await fetch(`${targetBaseUrl}/api/documents/${encodeURIComponent(harness.document.id)}`)
    .then((response) => response.status)
    .catch(() => 0)
  const previewAfterDelete = await postImportPreviewFile({
    baseUrl: targetBaseUrl,
    content: await fetchFileBuffer(workspaceZipPath),
    fileName: 'workspace-export.zip',
    mediaType: 'application/zip',
  })

  if (usesSeparateRestoreWorkspace) {
    await page.goto(`${targetBaseUrl}/recall`, { waitUntil: 'networkidle' })
  } else {
    await openHome(page, targetBaseUrl)
  }
  const workspaceExportPanel = page.locator('[data-home-workspace-export-stage958="true"]').first()
  await workspaceExportPanel.waitFor({ state: 'visible', timeout: 20000 })
  const backupPreviewInput = workspaceExportPanel.locator('[data-home-workspace-backup-preview-input-stage960="true"]')
  await backupPreviewInput.setInputFiles(workspaceZipPath)
  await workspaceExportPanel
    .locator('[data-home-workspace-backup-preview-dry-run-stage960="true"]')
    .waitFor({ state: 'visible', timeout: 20000 })
  const readinessText = await workspaceExportPanel
    .locator('[data-home-workspace-backup-restore-readiness-stage962="true"]')
    .innerText()
  const restoreButton = workspaceExportPanel.locator('[data-home-workspace-backup-restore-stage962="true"]')
  const restoreButtonVisible = await restoreButton.isVisible().catch(() => false)
  if (restoreButtonVisible) {
    await restoreButton.click()
  }
  const restoreResult = workspaceExportPanel.locator('[data-home-workspace-backup-restore-result-stage962="true"]')
  await restoreResult.waitFor({ state: 'visible', timeout: 30000 })
  await page.waitForFunction(
    () => {
      const result = document.querySelector('[data-home-workspace-backup-restore-result-stage962="true"]')
      const text = result?.textContent ?? ''
      return /imported/.test(text) && !/Restoring/i.test(text)
    },
    null,
    { timeout: 60000 },
  )
  const restoreResultText = await restoreResult.innerText()
  const restoreCapture = await captureLocatorScreenshot(
    page,
    workspaceExportPanel,
    directory,
    `${stagePrefix}-home-workspace-backup-restore.png`,
  )
  const restoredStatus = await fetch(`${targetBaseUrl}/api/documents/${encodeURIComponent(harness.document.id)}`)
    .then((response) => response.status)
    .catch(() => 0)
  const restoredLearningPack = await fetchText(
    `${targetBaseUrl}/api/recall/documents/${encodeURIComponent(harness.document.id)}/learning-export.md`,
  ).catch(() => '')
  const restoredProgress = await fetchJson(
    `${targetBaseUrl}/api/recall/study/progress?source_document_id=${encodeURIComponent(harness.document.id)}`,
  ).catch(() => null)
  const restoredSearch = await fetchJson(
    `${targetBaseUrl}/api/documents?query=${encodeURIComponent(harness.marker)}`,
  ).catch(() => [])

  return {
    captures: {
      workspaceBackupRestoreCapture: restoreCapture,
    },
    metrics: {
      workspaceBackupRestoreActionVisible: restoreButtonVisible,
      workspaceBackupRestoreDeleteBeforeApplyStatus: deleteResponse.status ?? null,
      workspaceBackupRestoreDeletedDocumentMissing: deletedStatus === 404,
      workspaceBackupRestoreImportsMissingItems: /[1-9]\d* items? imported/.test(restoreResultText),
      workspaceBackupRestoreReadinessVisible: /ready to restore/i.test(readinessText),
      workspaceBackupRestoreRestoresDocument: restoredStatus === 200,
      workspaceBackupRestoreRestoresLearningPackState:
        restoredLearningPack.includes(harness.note.body_text) &&
        restoredLearningPack.includes(harness.graphLabel) &&
        restoredLearningPack.includes(harness.card.prompt) &&
        restoredLearningPack.includes(harness.session.id),
      workspaceBackupRestoreRestoresProgress:
        (restoredProgress?.total_attempts ?? 0) > 0 && (restoredProgress?.recent_sessions ?? []).length > 0,
      workspaceBackupRestoreRestoresSearch: Array.isArray(restoredSearch)
        ? restoredSearch.some((document) => document.id === harness.document.id)
        : false,
      workspaceBackupRestoreResultVisible: restoreResultText.includes('imported'),
      workspaceBackupRestoreUsesSeparateWorkspace: usesSeparateRestoreWorkspace,
      workspaceBackupPreviewZipCanApplyAfterDelete:
        previewAfterDelete.status === 200 &&
        previewAfterDelete.json?.can_apply === true &&
        Object.values(previewAfterDelete.json?.restorable_entity_counts ?? {}).some((count) => count > 0),
    },
  }
}

async function postImportPreviewFile({
  baseUrl,
  content,
  fileName,
  mediaType,
  parseJson = true,
}) {
  const formData = new FormData()
  formData.append('file', new Blob([content], { type: mediaType }), fileName)
  const response = await fetch(`${baseUrl}/api/workspace/import-preview`, {
    body: formData,
    method: 'POST',
  })
  const json = parseJson ? await response.json().catch(() => null) : await response.json().catch(() => null)
  return {
    json,
    status: response.status,
  }
}

async function fetchFileBuffer(filePath) {
  const { readFile } = await import('node:fs/promises')
  return readFile(filePath)
}

async function createSourceLearningExportsHarness({ baseUrl, stagePrefix }) {
  const unique = `${stagePrefix}-${Date.now()}`
  const marker = `Stage 958 source learning export marker ${unique}`
  const document = await fetchJson(`${baseUrl}/api/documents/import-text`, {
    body: JSON.stringify({
      text: [
        'Source learning exports should make the full local learning loop portable.',
        'Notebook notes, graph memory, Study questions, attempts, and sessions should travel with the source.',
        marker,
      ].join('\n\n'),
      title: `Stage ${stagePrefix} Source Learning Export Source`,
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })

  try {
    const note = await fetchJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(document.id)}/notes`, {
      body: JSON.stringify({
        anchor: {
          anchor_text: `Source note for ${document.title}`,
          block_id: `source:${document.id}`,
          excerpt_text: 'Learning pack source note excerpt.',
          global_sentence_end: 0,
          global_sentence_start: 0,
          kind: 'source',
          sentence_end: 0,
          sentence_start: 0,
          source_document_id: document.id,
          variant_id: '',
        },
        body_text: `Portable source note for ${unique}.`,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    const graphLabel = `Stage 958 Export Memory ${unique}`
    await fetchJson(`${baseUrl}/api/recall/notes/${encodeURIComponent(note.id)}/promote/graph-node`, {
      body: JSON.stringify({
        description: 'Promoted source memory should appear in the learning pack.',
        label: graphLabel,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    const card = await createMultipleChoiceStudyCard({
      baseUrl,
      documentId: document.id,
      marker: unique,
    })
    const deletedPrompt = `Which deleted card should stay out of the Stage 958 learning pack ${unique}?`
    const deletedCard = await fetchJson(`${baseUrl}/api/recall/study/cards`, {
      body: JSON.stringify({
        answer: 'This deleted card should not export.',
        card_type: 'short_answer',
        prompt: deletedPrompt,
        question_difficulty: 'easy',
        source_document_id: document.id,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    await fetchJson(`${baseUrl}/api/recall/study/cards/${encodeURIComponent(deletedCard.id)}`, {
      method: 'DELETE',
    })

    const session = await fetchJson(`${baseUrl}/api/recall/study/sessions`, {
      body: JSON.stringify({
        card_ids: [card.id],
        filter_snapshot: {
          source_document_id: document.id,
          stage: '958',
        },
        settings_snapshot: {
          default_session_limit: 10,
          default_timer_seconds: 30,
        },
        source_document_id: document.id,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    const attempt = await fetchJson(`${baseUrl}/api/recall/study/cards/${encodeURIComponent(card.id)}/attempts`, {
      body: JSON.stringify({
        response: {
          elapsed_ms: 4200,
          hint_used: true,
          selected_choice_id: 'choice-learning-pack',
          time_limit_seconds: 30,
        },
        session_id: session.id,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    await fetchJson(`${baseUrl}/api/recall/study/cards/${encodeURIComponent(card.id)}/review`, {
      body: JSON.stringify({
        attempt_id: attempt.id,
        rating: 'good',
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    await fetchJson(`${baseUrl}/api/recall/study/sessions/${encodeURIComponent(session.id)}/complete`, {
      body: JSON.stringify({
        summary: {
          attempted: 1,
          correct: 1,
          difficulty_mix: { medium: 1 },
          hints_used: 1,
          sources_touched: [document.id],
          stage: '958',
          timed_out: 0,
        },
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    return {
      attempt,
      card,
      deletedPrompt,
      document,
      graphLabel,
      marker,
      note,
      session,
    }
  } catch (error) {
    await cleanupSourceLearningExportsHarness({ baseUrl, harness: { document } })
    throw error
  }
}

async function createMultipleChoiceStudyCard({ baseUrl, documentId, marker }) {
  return fetchJson(`${baseUrl}/api/recall/study/cards`, {
    body: JSON.stringify({
      answer: 'A portable source learning pack.',
      card_type: 'multiple_choice',
      prompt: `What does Stage 958 export for ${marker}?`,
      question_difficulty: 'medium',
      question_payload: {
        choices: [
          { id: 'choice-learning-pack', text: 'A portable source learning pack.' },
          { id: 'choice-reader-strip', text: 'A crowded Reader action strip.' },
          { id: 'choice-cloud-sync', text: 'A cloud sync workflow.' },
        ],
        correct_choice_id: 'choice-learning-pack',
        kind: 'multiple_choice',
      },
      source_document_id: documentId,
      support_payload: {
        explanation: 'The learning pack carries source-owned learning memory without changing Reader output.',
        hint: 'Look for the portable export format.',
        source_excerpt: 'Notebook notes, graph memory, Study questions, attempts, and sessions should travel with the source.',
      },
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
}

async function cleanupSourceLearningExportsHarness({ baseUrl, harness }) {
  const documentId = harness?.document?.id
  if (!documentId) {
    return {
      sourceLearningExportsHarnessDeleted: false,
      sourceLearningExportsHarnessProgressCleaned: false,
    }
  }
  const response = await fetch(`${baseUrl}/api/documents/${encodeURIComponent(documentId)}`, {
    method: 'DELETE',
  }).catch((error) => ({ ok: false, status: 0, error }))
  const scopedProgress = await fetchJson(
    `${baseUrl}/api/recall/study/progress?source_document_id=${encodeURIComponent(documentId)}`,
  ).catch(() => null)
  return {
    sourceLearningExportsHarnessDeleteStatus: response.status ?? null,
    sourceLearningExportsHarnessDeleted: response.ok || response.status === 404,
    sourceLearningExportsHarnessProgressCleaned: scopedProgress?.total_reviews === 0,
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

async function fetchJson(url, init) {
  const response = await fetch(url, init)
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Request failed ${response.status} ${response.statusText} for ${url}: ${text}`)
  }
  return response.json()
}

async function fetchText(url, init) {
  const response = await fetch(url, init)
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Request failed ${response.status} ${response.statusText} for ${url}: ${text}`)
  }
  return response.text()
}

async function fetchBuffer(url, init) {
  const response = await fetch(url, init)
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Request failed ${response.status} ${response.statusText} for ${url}: ${text}`)
  }
  return Buffer.from(await response.arrayBuffer())
}

function normalizePathname(href, baseUrl) {
  if (!href) {
    return ''
  }
  return new URL(href, baseUrl).pathname
}

function normalizeOrigin(url) {
  try {
    return new URL(url).origin
  } catch {
    return url
  }
}

function readZipEntries(buffer) {
  const entries = {}
  let offset = 0
  while (offset <= buffer.length - 30) {
    const signature = buffer.readUInt32LE(offset)
    if (signature !== 0x04034b50) {
      offset += 1
      continue
    }
    const flags = buffer.readUInt16LE(offset + 6)
    const method = buffer.readUInt16LE(offset + 8)
    const compressedSize = buffer.readUInt32LE(offset + 18)
    const fileNameLength = buffer.readUInt16LE(offset + 26)
    const extraFieldLength = buffer.readUInt16LE(offset + 28)
    const fileNameStart = offset + 30
    const fileNameEnd = fileNameStart + fileNameLength
    const dataStart = fileNameEnd + extraFieldLength
    const dataEnd = dataStart + compressedSize
    if (flags & 0x08) {
      throw new Error('ZIP entries with data descriptors are not supported by this audit parser.')
    }
    if (dataEnd > buffer.length) {
      break
    }
    const name = buffer.subarray(fileNameStart, fileNameEnd).toString('utf8')
    const compressed = buffer.subarray(dataStart, dataEnd)
    const content =
      method === 0 ? compressed : method === 8 ? inflateRawSync(compressed) : Buffer.from('')
    entries[name] = content.toString('utf8')
    offset = dataEnd
  }
  return entries
}
