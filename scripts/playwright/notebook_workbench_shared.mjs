import {
  captureLocatorScreenshot,
  captureViewportScreenshot,
  desktopViewport,
} from './home_rendered_preview_quality_shared.mjs'

export { desktopViewport }

function createStageHarnessNoteTracker() {
  return {
    createdBodyTexts: [],
    createdNotes: [],
    cleanupFailures: [],
  }
}

async function withStageHarnessNoteCleanup(args, implementation) {
  const harnessNoteTracker = createStageHarnessNoteTracker()

  try {
    const result = await implementation({
      ...args,
      harnessNoteTracker,
    })
    const cleanupMetrics = await cleanupStageHarnessCreatedNotes(args.baseUrl, harnessNoteTracker)
    return {
      ...result,
      metrics: {
        ...result.metrics,
        ...cleanupMetrics,
      },
    }
  } catch (error) {
    const cleanupMetrics = await cleanupStageHarnessCreatedNotes(args.baseUrl, harnessNoteTracker)
    error.stageHarnessCleanupMetrics = cleanupMetrics
    throw error
  }
}

export function summarizeStageHarnessCleanupMetrics(...metricSets) {
  const metrics = metricSets.filter(Boolean)
  const failures = metrics.flatMap((metric) =>
    Array.isArray(metric.stageHarnessCreatedNoteCleanupFailures)
      ? metric.stageHarnessCreatedNoteCleanupFailures
      : [],
  )
  const attemptedCount = metrics.reduce(
    (total, metric) => total + Number(metric.stageHarnessCreatedNoteCleanupAttemptedCount ?? 0),
    0,
  )
  const cleanedCount = metrics.reduce(
    (total, metric) => total + Number(metric.stageHarnessCreatedNoteCleanupDeletedCount ?? 0),
    0,
  )
  const trackedCount = metrics.reduce(
    (total, metric) => total + Number(metric.stageHarnessCreatedNoteTrackedCount ?? 0),
    0,
  )

  return {
    personalNotesAuditArtifactsHiddenAfterRun: metrics.every(
      (metric) => metric.personalNotesAuditArtifactsHiddenAfterRun !== false,
    ),
    sourceMemoryAuditArtifactsHiddenAfterRun: metrics.every(
      (metric) => metric.sourceMemoryAuditArtifactsHiddenAfterRun !== false,
    ),
    stageHarnessCreatedNoteCleanupAttemptedCount: attemptedCount,
    stageHarnessCreatedNoteCleanupDeletedCount: cleanedCount,
    stageHarnessCreatedNoteCleanupFailureCount: failures.length,
    stageHarnessCreatedNoteCleanupFailures: failures,
    stageHarnessCreatedNoteTrackedCount: trackedCount,
    stageHarnessCreatedNotesCleanedUp:
      metrics.length > 0 && metrics.every((metric) => metric.stageHarnessCreatedNotesCleanedUp !== false),
  }
}

async function trackStageHarnessCreatedNote({ baseUrl, bodyText, context, tracker }) {
  if (!tracker || !bodyText) {
    return
  }
  tracker.createdBodyTexts.push(bodyText)
  try {
    const note = await findRecallNoteByExactBody(baseUrl, bodyText)
    if (!note?.id) {
      tracker.cleanupFailures.push({
        bodyText,
        context,
        reason: 'created note id was not resolved',
      })
      return
    }
    tracker.createdNotes.push({
      bodyText,
      context,
      documentId: note.anchor?.source_document_id ?? null,
      id: note.id,
    })
  } catch (error) {
    tracker.cleanupFailures.push({
      bodyText,
      context,
      reason: error instanceof Error ? error.message : String(error),
    })
  }
}

async function cleanupStageHarnessCreatedNotes(baseUrl, tracker) {
  const failures = [...(tracker.cleanupFailures ?? [])]
  const uniqueNotes = []
  const seenIds = new Set()
  for (const note of tracker.createdNotes ?? []) {
    if (!note?.id || seenIds.has(note.id)) {
      continue
    }
    seenIds.add(note.id)
    uniqueNotes.push(note)
  }

  let deletedCount = 0
  for (const note of uniqueNotes) {
    try {
      const response = await fetch(`${baseUrl}/api/recall/notes/${encodeURIComponent(note.id)}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        failures.push({
          bodyText: note.bodyText,
          context: note.context,
          id: note.id,
          reason: `delete returned ${response.status}`,
        })
      } else {
        deletedCount += 1
      }
    } catch (error) {
      failures.push({
        bodyText: note.bodyText,
        context: note.context,
        id: note.id,
        reason: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const hiddenChecks = await Promise.all(
    [...new Set(tracker.createdBodyTexts ?? [])].map(async (bodyText) => {
      try {
        return {
          bodyText,
          hidden: !(await hasRecallNoteExactBody(baseUrl, bodyText)),
        }
      } catch (error) {
        failures.push({
          bodyText,
          reason: error instanceof Error ? error.message : String(error),
        })
        return {
          bodyText,
          hidden: false,
        }
      }
    }),
  )
  const allTrackedBodiesHidden = hiddenChecks.every((check) => check.hidden)
  for (const check of hiddenChecks) {
    if (!check.hidden) {
      failures.push({
        bodyText: check.bodyText,
        reason: 'created note body still appears in recall note search after cleanup',
      })
    }
  }

  return {
    personalNotesAuditArtifactsHiddenAfterRun: allTrackedBodiesHidden,
    sourceMemoryAuditArtifactsHiddenAfterRun: allTrackedBodiesHidden,
    stageHarnessCreatedNoteCleanupAttemptedCount: uniqueNotes.length,
    stageHarnessCreatedNoteCleanupDeletedCount: deletedCount,
    stageHarnessCreatedNoteCleanupFailureCount: failures.length,
    stageHarnessCreatedNoteCleanupFailures: failures,
    stageHarnessCreatedNoteTrackedCount: tracker.createdBodyTexts.length,
    stageHarnessCreatedNotesCleanedUp:
      tracker.createdBodyTexts.length === 0 ||
      (uniqueNotes.length === tracker.createdBodyTexts.length && failures.length === 0 && allTrackedBodiesHidden),
  }
}

async function findRecallNoteByExactBody(baseUrl, bodyText) {
  const hits = await searchRecallNotesByBody(baseUrl, bodyText)
  return (
    hits.find((hit) => hit?.anchor?.kind === 'source' && hit.body_text === bodyText) ??
    hits.find((hit) => hit?.body_text === bodyText) ??
    null
  )
}

async function hasRecallNoteExactBody(baseUrl, bodyText) {
  const hits = await searchRecallNotesByBody(baseUrl, bodyText)
  return hits.some((hit) => hit?.body_text === bodyText)
}

async function searchRecallNotesByBody(baseUrl, bodyText) {
  const search = new URLSearchParams({
    limit: '50',
    query: bodyText,
  })
  return fetchJson(`${baseUrl}/api/recall/notes/search?${search.toString()}`)
}

export async function captureNotebookWorkbenchEvidence({
  baseUrl,
  directory,
  page,
  selectSentenceAnchor = false,
  stageLabel,
  stagePrefix,
}) {
  const response = await page.goto(`${baseUrl}/recall?section=notes`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Notebook navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  const commandRow = page.getByRole('region', { name: 'Notebook command row' }).first()
  const browsePanel = page.locator('.recall-notes-browser-card-stage872').first()
  const detailPanel = page.locator('.recall-note-detail-stage872').first()
  const fusedWorkbench = detailPanel.locator('[data-note-workbench-layout="fused"]').first()
  const sourceHandoffInline = detailPanel.locator('.recall-note-source-handoff-inline-stage872').first()
  const promoteInline = detailPanel.locator('.recall-note-promote-inline-stage872').first()

  await Promise.all([
    page.getByRole('heading', { name: 'Notebook', exact: true }).waitFor({ state: 'visible', timeout: 20000 }),
    commandRow.waitFor({ state: 'visible', timeout: 20000 }),
    browsePanel.waitFor({ state: 'visible', timeout: 20000 }),
    detailPanel.waitFor({ state: 'visible', timeout: 20000 }),
    fusedWorkbench.waitFor({ state: 'visible', timeout: 20000 }),
    sourceHandoffInline.waitFor({ state: 'visible', timeout: 20000 }),
    promoteInline.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  if (selectSentenceAnchor) {
    await selectSentenceAnchoredNotebookRow(page, stageLabel, baseUrl)
  }
  await page.waitForTimeout(300)

  const commandRowBox = await readMeasuredBox(commandRow, 'Notebook command row')
  const workbenchBox = await readMeasuredBox(detailPanel, 'Notebook selected-note workbench')
  const metrics = await readNotebookWorkbenchMetrics(page, {
    commandRowHeight: commandRowBox.height,
    commandRowTop: commandRowBox.y,
    workbenchHeight: workbenchBox.height,
    workbenchTop: workbenchBox.y,
  })

  if (metrics.notebookTopHeroVisible) {
    throw new Error(`${stageLabel} expected the old embedded Notebook top hero shell to be retired.`)
  }
  if (!metrics.notebookCommandRowCompact) {
    throw new Error(`${stageLabel} expected the Notebook command row to stay compact, found height ${metrics.notebookCommandRowHeight}.`)
  }
  if (metrics.notebookBrowsePanelChromeVisible) {
    throw new Error(`${stageLabel} expected the old browse-glance panel chrome to be retired.`)
  }
  if (!metrics.notebookEditorSingleSurface) {
    throw new Error(`${stageLabel} expected selected-note editing to be owned by one fused workbench surface.`)
  }
  if (metrics.notebookDetachedSourceHandoffCardVisible) {
    throw new Error(`${stageLabel} expected Source handoff to be inline, not a detached card.`)
  }
  if (metrics.notebookDetachedPromoteCardVisible) {
    throw new Error(`${stageLabel} expected Promote note to be inline, not a detached card.`)
  }
  if (!metrics.notebookSourceHandoffInlineVisible || !metrics.notebookPromoteActionsInlineVisible) {
    throw new Error(`${stageLabel} expected inline Source handoff and Promote note seams to stay visible.`)
  }
  if (!metrics.notebookSelectedNoteLeadBandFused) {
    throw new Error(`${stageLabel} expected selected-note Notebook to use one fused note-owned top band.`)
  }
  if (metrics.notebookNoteDetailIntroVisible) {
    throw new Error(`${stageLabel} expected the old selected-note Note detail intro block to stay retired.`)
  }
  if (metrics.notebookWorkbenchNestedPanelCount > 0) {
    throw new Error(`${stageLabel} expected selected-note passage/editor panes to be flat inside one workbench surface.`)
  }
  if (!metrics.notebookSourceHandoffActionSeamCompact || !metrics.notebookPromoteActionSeamCompact) {
    throw new Error(`${stageLabel} expected Source handoff and Promote note to render as compact attached action seams.`)
  }
  if (!metrics.notebookBrowseRailListFirst) {
    throw new Error(`${stageLabel} expected the Notebook browse rail to read as a flat list-first rail.`)
  }
  if (!selectSentenceAnchor && metrics.notebookBrowseActiveRowPanelChromeVisible) {
    throw new Error(`${stageLabel} expected the active browse row to avoid old mini-card panel chrome.`)
  }
  if (!selectSentenceAnchor && !metrics.notebookBrowseActiveRowTimestampInline) {
    throw new Error(`${stageLabel} expected active browse-row timestamp metadata to stay inline and compact.`)
  }
  if (!metrics.notebookBrowseRailHeaderCompact) {
    throw new Error(`${stageLabel} expected the Browse notebook rail header to stay compact.`)
  }
  if (selectSentenceAnchor && !metrics.notebookSentenceAnchorHighlightPanelStable) {
    throw new Error(`${stageLabel} expected a sentence-anchored note to keep the Highlighted passage panel.`)
  }

  const notebookWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-notebook-wide-top.png`)
  const notebookWorkbenchCrop = await captureLocatorScreenshot(
    page,
    detailPanel,
    directory,
    `${stagePrefix}-notebook-selected-workbench.png`,
  )
  const notebookCommandRowCrop = await captureLocatorScreenshot(
    page,
    commandRow,
    directory,
    `${stagePrefix}-notebook-command-row.png`,
  )
  const notebookBrowseRailCrop = await captureLocatorScreenshot(
    page,
    browsePanel,
    directory,
    `${stagePrefix}-notebook-browse-rail.png`,
  )

  return {
    captures: {
      notebookBrowseRailCrop,
      notebookCommandRowCrop,
      notebookWideTop,
      notebookWorkbenchCrop,
    },
    metrics,
  }
}

export async function captureNotebookEmptyStateEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const response = await page.goto(`${baseUrl}/recall?section=notes`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Notebook navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  const commandRow = page.getByRole('region', { name: 'Notebook command row' }).first()
  const detailPanel = page.locator('.recall-note-detail-stage872').first()

  await Promise.all([
    page.getByRole('heading', { name: 'Notebook', exact: true }).waitFor({ state: 'visible', timeout: 20000 }),
    commandRow.waitFor({ state: 'visible', timeout: 20000 }),
    detailPanel.waitFor({ state: 'visible', timeout: 20000 }),
  ])

  const noActiveSource = await selectSourceWithNoNotebookRows(page)
  let noActiveCapture = null
  let noActiveDetailCrop = null
  let noActiveDetailIntroVisible = false
  let noActiveWorkbenchTopOffset = null

  if (noActiveSource.found) {
    await page.locator('.recall-note-empty-workbench-stage874').first().waitFor({ state: 'visible', timeout: 10000 })
    await page.waitForTimeout(200)
    noActiveDetailIntroVisible = await page
      .locator('.recall-note-detail-stage872 .recall-note-detail-toolbar-stage698')
      .first()
      .isVisible()
      .catch(() => false)
    noActiveWorkbenchTopOffset = await readOptionalTopOffset(
      page.locator('.recall-note-empty-workbench-stage874[data-notebook-empty-state-kind="source-empty"]').first(),
    )
    noActiveCapture = await captureViewportScreenshot(page, directory, `${stagePrefix}-notebook-no-active-empty.png`)
    noActiveDetailCrop = await captureLocatorScreenshot(
      page,
      detailPanel,
      directory,
      `${stagePrefix}-notebook-no-active-empty-detail.png`,
    )
  }

  const searchField = commandRow.getByRole('searchbox', { name: 'Search notebook' })
  const missingQuery = `stage-${stagePrefix}-missing-note`
  await searchField.fill(missingQuery)
  await page.locator('.recall-note-empty-workbench-stage874[data-notebook-empty-state-kind="search-empty"]').first()
    .waitFor({ state: 'visible', timeout: 12000 })
  await page.waitForTimeout(200)

  const searchEmptyDetailIntroVisible = await page
    .locator('.recall-note-detail-stage872 .recall-note-detail-toolbar-stage698')
    .first()
    .isVisible()
    .catch(() => false)
  const searchEmptyWorkbenchTopOffset = await readOptionalTopOffset(
    page.locator('.recall-note-empty-workbench-stage874[data-notebook-empty-state-kind="search-empty"]').first(),
  )

  const searchEmptyCapture = await captureViewportScreenshot(page, directory, `${stagePrefix}-notebook-search-empty.png`)
  const searchEmptyDetailCrop = await captureLocatorScreenshot(
    page,
    detailPanel,
    directory,
    `${stagePrefix}-notebook-search-empty-detail.png`,
  )

  const metricsBeforeCapture = await readNotebookEmptyStateMetrics(page, {
    noActiveDetailIntroVisible,
    noActiveSourceAvailable: noActiveSource.found,
    noActiveSourceValue: noActiveSource.value,
    noActiveWorkbenchTopOffset,
    searchEmptyDetailIntroVisible,
    searchEmptyWorkbenchTopOffset,
  })

  let captureNavigates = false
  const captureButton = commandRow.getByRole('button', { name: 'Capture in Reader' }).first()
  if (await captureButton.isVisible().catch(() => false)) {
    await captureButton.click()
    await page.waitForURL(/\/reader(?:\?|$)/, { timeout: 12000 }).catch(() => undefined)
    captureNavigates = page.url().includes('/reader')
  }

  const metrics = {
    ...metricsBeforeCapture,
    notebookCaptureInReaderNavigates: captureNavigates,
  }

  if (metrics.notebookNoActiveSourceAvailable && !metrics.notebookEmptyWorkbenchOwned) {
    throw new Error(`${stageLabel} expected the no-active-note Notebook state to be owned by the compact workbench.`)
  }
  if (metrics.notebookEmptyLegacyHeroVisible || metrics.notebookEmptyLegacyGuidanceCardsVisible) {
    throw new Error(`${stageLabel} expected old Notebook no-active empty hero/guidance chrome to stay retired.`)
  }
  if (metrics.notebookNoActiveSourceAvailable && metrics.notebookEmptyDetailIntroVisible) {
    throw new Error(`${stageLabel} expected no-active Notebook empty state not to render the old Note detail intro.`)
  }
  if (!metrics.notebookSearchEmptyWorkbenchOwned) {
    throw new Error(`${stageLabel} expected search-empty Notebook state to be owned by the compact workbench.`)
  }
  if (metrics.notebookSearchEmptyDetailIntroVisible) {
    throw new Error(`${stageLabel} expected search-empty Notebook state not to render the old Note detail intro.`)
  }
  if (metrics.notebookSearchEmptyLegacyGuidanceCardsVisible) {
    throw new Error(`${stageLabel} expected search-empty Notebook state not to revive old guidance cards.`)
  }
  if (!metrics.notebookSearchEmptyCaptureInReaderVisible || !metrics.notebookCaptureInReaderNavigates) {
    throw new Error(`${stageLabel} expected search-empty Notebook state to expose a working Capture in Reader handoff.`)
  }

  return {
    captures: {
      notebookNoActiveCapture: noActiveCapture,
      notebookNoActiveDetailCrop: noActiveDetailCrop,
      notebookSearchEmptyCapture: searchEmptyCapture,
      notebookSearchEmptyDetailCrop: searchEmptyDetailCrop,
    },
    metrics,
  }
}

export async function captureNotebookNewNoteDraftEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
  verifySourceReaderHandoff = false,
}) {
  return withStageHarnessNoteCleanup(
    {
      baseUrl,
      directory,
      page,
      stageLabel,
      stagePrefix,
      verifySourceReaderHandoff,
    },
    captureNotebookNewNoteDraftEvidenceImpl,
  )
}

async function captureNotebookNewNoteDraftEvidenceImpl({
  baseUrl,
  directory,
  harnessNoteTracker,
  page,
  stageLabel,
  stagePrefix,
  verifySourceReaderHandoff = false,
}) {
  const response = await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Home navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  const homeNewNoteButton = page.getByRole('button', { name: 'New note' }).first()
  await homeNewNoteButton.waitFor({ state: 'visible', timeout: 20000 })
  await homeNewNoteButton.click()

  const commandRow = page.getByRole('region', { name: 'Notebook command row' }).first()
  const draftRegion = page.getByRole('region', { name: 'New note draft' }).first()
  await Promise.all([
    commandRow.waitFor({ state: 'visible', timeout: 20000 }),
    draftRegion.waitFor({ state: 'visible', timeout: 20000 }),
  ])

  const draftText = `Stage ${stagePrefix} source-attached note ${Date.now()}`
  const sourceSelect = commandRow.getByRole('combobox', { name: 'Source' })
  const initialSourceValue = await sourceSelect.inputValue().catch(() => '')
  const saveButton = draftRegion.getByRole('button', { name: 'Save note' })
  const captureButton = commandRow.getByRole('button', { name: 'Capture in Reader' })
  const draftVisibleAtRest = await draftRegion.isVisible().catch(() => false)
  const saveDisabledAtRest = await saveButton.isDisabled().catch(() => false)
  const captureVisibleAtRest = await captureButton.isVisible().catch(() => false)

  await draftRegion.getByRole('textbox', { name: 'New note text' }).fill(draftText)
  await saveButton.click()
  await page.getByRole('region', { name: 'Selected note workbench' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('textbox', { name: 'Note text' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(300)
  await trackStageHarnessCreatedNote({
    baseUrl,
    bodyText: draftText,
    context: `${stagePrefix}:notebook-new-note-draft`,
    tracker: harnessNoteTracker,
  })

  const metrics = await page.evaluate(({ captureVisibleAtRest, draftText, draftVisibleAtRest, initialSourceValue, saveDisabledAtRest }) => {
    const isVisible = (selector) => {
      const element = document.querySelector(selector)
      if (!(element instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(element)
      const box = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1
    }
    const selectedWorkbench = document.querySelector('[aria-label="Selected note workbench"]')
    const selectedText = selectedWorkbench?.textContent ?? ''
    const noteText = document.querySelector(
      '.recall-note-workbench-editor-stage872 textarea, .recall-note-workbench-editor textarea',
    )
    const commandRow = document.querySelector('.recall-notes-command-row-stage872')
    const sourceContextPanel = document.querySelector('[data-notebook-source-context-panel="true"]')
    const headingTexts = [...(selectedWorkbench?.querySelectorAll('h3') ?? [])].map((heading) =>
      heading.textContent?.replace(/\s+/g, ' ').trim(),
    )
    const sourceContextPanelVisible = isVisible('[data-notebook-source-context-panel="true"]')
    const sourceHighlightedPassageVisible = headingTexts.includes('Highlighted passage')
    const sourceSyntheticHighlightVisible =
      sourceContextPanel instanceof HTMLElement &&
      (selectedText.includes('Source note for ') || selectedText.includes('Manual note attached to '))
    return {
      homeNewNoteOpensDraft: Boolean(draftVisibleAtRest),
      notebookCaptureInReaderStillAvailable:
        Boolean(captureVisibleAtRest) &&
        commandRow instanceof HTMLElement &&
        [...commandRow.querySelectorAll('button')].some((button) => button.textContent?.trim() === 'Capture in Reader'),
      notebookNewNoteCreatesSourceAttachedNote: selectedText.includes('Source note') && selectedText.includes(draftText),
      notebookNewNoteDraftSaveDisabledAtRest: Boolean(saveDisabledAtRest),
      notebookNewNoteDraftSourceDefaulted: Boolean(initialSourceValue),
      notebookNewNoteDraftVisible: Boolean(draftVisibleAtRest),
      notebookNewNoteDraftClosedAfterSave: !isVisible('[aria-label="New note draft"]'),
      notebookNewNoteSavedUsesSourceContext:
        sourceContextPanelVisible && !sourceHighlightedPassageVisible && !sourceSyntheticHighlightVisible,
      notebookSourceAnchorContextPanelVisible: sourceContextPanelVisible,
      notebookSourceAnchorHighlightedPassageVisible: sourceHighlightedPassageVisible,
      notebookSourceAnchorNoteSelectedAfterSave:
        noteText instanceof HTMLTextAreaElement && noteText.value === draftText && selectedText.includes('Source note'),
      notebookSourceAnchorReaderHandoffUnanchored: null,
      notebookSourceAnchorSyntheticHighlightVisible: sourceSyntheticHighlightVisible,
    }
  }, { captureVisibleAtRest, draftText, draftVisibleAtRest, initialSourceValue, saveDisabledAtRest })

  if (!metrics.notebookNewNoteDraftSaveDisabledAtRest) {
    throw new Error(`${stageLabel} expected the source note draft save action to stay disabled before body text is entered.`)
  }
  if (!metrics.homeNewNoteOpensDraft || !metrics.notebookNewNoteDraftVisible) {
    throw new Error(`${stageLabel} expected Home New note to open the embedded Notebook source-note draft.`)
  }
  if (!metrics.notebookNewNoteDraftSourceDefaulted) {
    throw new Error(`${stageLabel} expected the Notebook source-note draft to default to a saved source.`)
  }
  if (
    !metrics.notebookNewNoteCreatesSourceAttachedNote ||
    !metrics.notebookSourceAnchorNoteSelectedAfterSave ||
    !metrics.notebookNewNoteSavedUsesSourceContext
  ) {
    throw new Error(`${stageLabel} expected saving the draft to create and select a source-attached note.`)
  }
  if (!metrics.notebookCaptureInReaderStillAvailable) {
    throw new Error(`${stageLabel} expected Capture in Reader to remain available beside the new-note flow.`)
  }

  const newNoteCapture = await captureViewportScreenshot(page, directory, `${stagePrefix}-notebook-new-note-saved.png`)
  const selectedWorkbenchCrop = await captureLocatorScreenshot(
    page,
    page.getByRole('region', { name: 'Selected note workbench' }).first(),
    directory,
    `${stagePrefix}-notebook-new-note-selected-workbench.png`,
  )

  if (verifySourceReaderHandoff) {
    await page
      .getByRole('region', { name: 'Selected note workbench' })
      .getByRole('button', { name: 'Open in Reader' })
      .click()
    await page.waitForURL(/\/reader(?:\?|$)/, { timeout: 12000 })
    const handoffUrl = new URL(page.url())
    metrics.notebookSourceAnchorReaderHandoffUnanchored =
      handoffUrl.pathname === '/reader' &&
      Boolean(handoffUrl.searchParams.get('document')) &&
      !handoffUrl.searchParams.has('sentenceStart') &&
      !handoffUrl.searchParams.has('sentenceEnd')
    if (!metrics.notebookSourceAnchorReaderHandoffUnanchored) {
      throw new Error(`${stageLabel} expected source-note Open in Reader to omit sentence anchors.`)
    }
  }

  return {
    captures: {
      newNoteCapture,
      selectedWorkbenchCrop,
    },
    metrics,
  }
}

export async function captureHomePersonalNoteLaneEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  return withStageHarnessNoteCleanup(
    {
      baseUrl,
      directory,
      page,
      stageLabel,
      stagePrefix,
    },
    captureHomePersonalNoteLaneEvidenceImpl,
  )
}

async function captureHomePersonalNoteLaneEvidenceImpl({
  baseUrl,
  directory,
  harnessNoteTracker,
  page,
  stageLabel,
  stagePrefix,
}) {
  const response = await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Home navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  const homeNewNoteButton = page.getByRole('button', { name: 'New note' }).first()
  await homeNewNoteButton.waitFor({ state: 'visible', timeout: 20000 })
  await homeNewNoteButton.click()

  const commandRow = page.getByRole('region', { name: 'Notebook command row' }).first()
  const draftRegion = page.getByRole('region', { name: 'New note draft' }).first()
  await Promise.all([
    commandRow.waitFor({ state: 'visible', timeout: 20000 }),
    draftRegion.waitFor({ state: 'visible', timeout: 20000 }),
  ])

  const draftText = `Stage ${stagePrefix} library-native personal note ${Date.now()}`
  const saveButton = draftRegion.getByRole('button', { name: 'Save note' })
  await draftRegion.getByRole('textbox', { name: 'New note text' }).fill(draftText)
  await saveButton.click()
  await page.getByRole('region', { name: 'Selected note workbench' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('[data-notebook-source-context-panel="true"]').first().waitFor({ state: 'visible', timeout: 20000 })
  await trackStageHarnessCreatedNote({
    baseUrl,
    bodyText: draftText,
    context: `${stagePrefix}:home-personal-note-lane`,
    tracker: harnessNoteTracker,
  })

  await page.getByRole('tab', { name: 'Home' }).first().click()
  const personalNoteLane = page.locator('[data-home-personal-note-lane="true"]').first()
  await personalNoteLane.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(300)

  const initialMetrics = await readHomePersonalNoteLaneMetrics(page, draftText)
  if (!initialMetrics.homePersonalNoteLaneVisible) {
    throw new Error(`${stageLabel} expected the Home Personal notes lane to be visible after saving a source note.`)
  }
  if (!initialMetrics.homeNewNoteSavedAppearsInLibrary) {
    throw new Error(`${stageLabel} expected the saved source note to appear in the Home Personal notes lane.`)
  }
  if (!initialMetrics.homePersonalNoteUsesBodyPreview || !initialMetrics.homePersonalNoteSyntheticAnchorHidden) {
    throw new Error(`${stageLabel} expected Home personal-note rows to use body preview without synthetic anchor copy.`)
  }

  const homePersonalNoteLaneCrop = await captureLocatorScreenshot(
    page,
    personalNoteLane,
    directory,
    `${stagePrefix}-home-personal-note-lane.png`,
  )

  const organizerOptions = page.getByRole('button', { name: 'Organizer options' }).first()
  if (await organizerOptions.isVisible().catch(() => false)) {
    await organizerOptions.click()
  }
  const homeSearchField = page.getByRole('searchbox', { name: 'Filter saved sources' }).first()
  await homeSearchField.waitFor({ state: 'visible', timeout: 12000 })
  await homeSearchField.fill(draftText)
  await page.waitForTimeout(700)

  const searchMetrics = await readHomePersonalNoteLaneMetrics(page, draftText)
  if (!searchMetrics.homePersonalNoteSearchResultVisible) {
    throw new Error(`${stageLabel} expected Home Matches to include the source-note result.`)
  }

  const homePersonalNoteSearchCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-personal-note-search.png`,
  )

  await page.locator('[data-home-personal-note-item]').first().click()
  await page.getByRole('region', { name: 'Selected note workbench' }).first().waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('[data-notebook-source-context-panel="true"]').first().waitFor({ state: 'visible', timeout: 20000 })
  const notebookMetrics = await readHomePersonalNoteOpenedNotebookMetrics(page, draftText)
  if (!notebookMetrics.homePersonalNoteOpensEmbeddedNotebook) {
    throw new Error(`${stageLabel} expected a Home personal-note row to reopen embedded Notebook detail.`)
  }

  const notebookFromHomeNoteCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-personal-note-opens-notebook.png`,
  )

  await page.keyboard.press('Control+K')
  const searchDialog = page.getByRole('dialog', { name: 'Search your workspace' }).first()
  await searchDialog.waitFor({ state: 'visible', timeout: 12000 })
  await searchDialog.getByRole('searchbox', { name: 'Search' }).fill(draftText)
  await page.waitForTimeout(900)
  await searchDialog.getByRole('button', { name: /personal note/i }).first().click()
  await searchDialog.getByRole('button', { name: 'Open in Reader' }).click()
  await page.waitForURL(/\/reader(?:\?|$)/, { timeout: 12000 })
  const handoffUrl = new URL(page.url())
  const workspaceSearchSourceNoteReaderHandoffUnanchored =
    handoffUrl.pathname === '/reader' &&
    Boolean(handoffUrl.searchParams.get('document')) &&
    !handoffUrl.searchParams.has('sentenceStart') &&
    !handoffUrl.searchParams.has('sentenceEnd')
  if (!workspaceSearchSourceNoteReaderHandoffUnanchored) {
    throw new Error(`${stageLabel} expected workspace search source-note Reader handoff to omit sentence anchors.`)
  }

  return {
    captures: {
      homePersonalNoteLaneCrop,
      homePersonalNoteSearchCapture,
      notebookFromHomeNoteCapture,
    },
    metrics: {
      ...initialMetrics,
      ...searchMetrics,
      ...notebookMetrics,
      workspaceSearchSourceNoteReaderHandoffUnanchored,
    },
  }
}

export async function captureHomeSourceMemorySignalEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  return withStageHarnessNoteCleanup(
    {
      baseUrl,
      directory,
      page,
      stageLabel,
      stagePrefix,
    },
    captureHomeSourceMemorySignalEvidenceImpl,
  )
}

export async function captureHomeReviewReadySourceEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  return withStageHarnessNoteCleanup(
    {
      baseUrl,
      directory,
      page,
      stageLabel,
      stagePrefix,
    },
    captureHomeReviewReadySourceEvidenceImpl,
  )
}

export async function captureStudyScheduleDrilldownEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  return withStageHarnessNoteCleanup(
    {
      baseUrl,
      directory,
      page,
      stageLabel,
      stagePrefix,
    },
    captureStudyScheduleDrilldownEvidenceImpl,
  )
}

export async function captureHomeMemoryFilterEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  return withStageHarnessNoteCleanup(
    {
      baseUrl,
      directory,
      page,
      stageLabel,
      stagePrefix,
    },
    captureHomeMemoryFilterEvidenceImpl,
  )
}

async function captureHomeMemoryFilterEvidenceImpl({
  baseUrl,
  directory,
  harnessNoteTracker,
  page,
  stageLabel,
  stagePrefix,
}) {
  const preferredMemorySource = await findSourceMemoryStackDocument(baseUrl)
  if (!preferredMemorySource?.id) {
    throw new Error(`${stageLabel} expected at least one source with graph and study memory for Home memory filters.`)
  }

  const draftText = `Stage ${stagePrefix} home memory filter note ${Date.now()}`
  await fetchJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(preferredMemorySource.id)}/notes`, {
    body: JSON.stringify({
      anchor: {
        anchor_text: `Source note for ${preferredMemorySource.title}`,
        block_id: `source:${preferredMemorySource.id}`,
        excerpt_text: `Manual note attached to ${preferredMemorySource.title}.`,
        global_sentence_end: 0,
        global_sentence_start: 0,
        kind: 'source',
        sentence_end: 0,
        sentence_start: 0,
        source_document_id: preferredMemorySource.id,
        variant_id: '',
      },
      body_text: draftText,
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  await trackStageHarnessCreatedNote({
    baseUrl,
    bodyText: draftText,
    context: `${stagePrefix}:home-memory-filter`,
    tracker: harnessNoteTracker,
  })

  let temporaryMemoryFilterDocumentId = null
  try {
  const temporaryMemoryFilterDocument = await fetchJson(`${baseUrl}/api/documents/import-text`, {
    body: JSON.stringify({
      text: `Temporary Stage ${stagePrefix} memory-filter source without attached memory. ${Date.now()}`,
      title: `Stage ${stagePrefix} memory filter no-memory source ${Date.now()}`,
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  temporaryMemoryFilterDocumentId = temporaryMemoryFilterDocument?.id ?? null

  const response = await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Home navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  await page.getByRole('button', { name: /Sort Home sources/i }).first().waitFor({ state: 'visible', timeout: 20000 })
  const baselineBoardMetrics = await readHomeMemoryFilterMetrics(page)
  if (baselineBoardMetrics.homeMemoryFilterActiveValue !== 'all') {
    await selectHomeMemoryFilterOption(page, 'All')
  }
  const controlsVisible = await openHomeMemoryFilterControls(page)
  if (!controlsVisible) {
    throw new Error(`${stageLabel} expected compact Memory controls inside the Home sort menu.`)
  }

  await selectHomeMemoryFilterOption(page, 'Any')
  await waitForHomeMemoryFilter(page, 'any')
  const anyMetrics = await readHomeMemoryFilterMetrics(page)
  const homeMemoryFilterAnyNarrowsSourceBoard =
    anyMetrics.homeMemoryFilterActiveValue === 'any' &&
    anyMetrics.homeMemoryFilterVisibleCount > 0 &&
    (baselineBoardMetrics.homeMemoryFilterVisibleCount > anyMetrics.homeMemoryFilterVisibleCount ||
      anyMetrics.homeMemoryFilterAnyUsesSourceOwnedCounts)
  if (!homeMemoryFilterAnyNarrowsSourceBoard) {
    throw new Error(
      `${stageLabel} expected Any memory filter to narrow the Home source board or confirm every visible source has source-owned memory; got ${anyMetrics.homeMemoryFilterVisibleCount} of ${baselineBoardMetrics.homeMemoryFilterVisibleCount}.`,
    )
  }

  const homeMemoryFilterAnyCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-memory-filter-any.png`,
  )

  let homeSearchField = await openHomeOrganizerSearchField(page)
  await homeSearchField.fill(preferredMemorySource.title)
  await page.waitForTimeout(900)
  await page
    .locator('[data-home-source-memory-signal-stage908="true"][data-home-source-memory-signal-surface-stage908="card"]')
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })

  await selectHomeMemoryFilterOption(page, 'Notes')
  await waitForHomeMemoryFilter(page, 'notes')
  const notesMetrics = await readHomeMemoryFilterMetrics(page)
  await selectHomeMemoryFilterOption(page, 'Graph')
  await waitForHomeMemoryFilter(page, 'graph')
  const graphMetrics = await readHomeMemoryFilterMetrics(page)
  await selectHomeMemoryFilterOption(page, 'Study')
  await waitForHomeMemoryFilter(page, 'study')
  const studyMetrics = await readHomeMemoryFilterMetrics(page)

  if (
    !notesMetrics.homeMemoryFilterSourceOwnedNotesOnly ||
    !graphMetrics.homeMemoryFilterSourceOwnedGraphOnly ||
    !studyMetrics.homeMemoryFilterSourceOwnedStudyOnly ||
    !studyMetrics.homeMemoryFilterMatchesSourceResults
  ) {
    throw new Error(`${stageLabel} expected Notes, Graph, and Study filters to use source-owned memory counts in Matches.`)
  }

  const homeMemoryFilterMatchesCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-memory-filter-matches.png`,
  )

  homeSearchField = await openHomeOrganizerSearchField(page)
  await homeSearchField.fill('')
  await page.waitForTimeout(700)
  await page.waitForFunction(() => ![...document.querySelectorAll('h3')].some((heading) => heading.textContent?.trim() === 'Matches'))
  const personalNotesSection = page.locator('[data-home-personal-notes-organizer-section-stage898="true"]').first()
  await personalNotesSection.waitFor({ state: 'visible', timeout: 20000 })
  await personalNotesSection.getByRole('button').first().evaluate((button) => button.click())
  await page.locator('[data-home-personal-notes-board-stage898="true"]').first().waitFor({ state: 'visible', timeout: 20000 })
  const personalNotesMetrics = await readHomeMemoryFilterMetrics(page)
  if (!personalNotesMetrics.homeMemoryFilterPreservesPersonalNotesBoard) {
    throw new Error(`${stageLabel} expected Personal notes board to stay note-owned while memory filter is active.`)
  }

  const homeMemoryFilterPersonalNotesCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-memory-filter-personal-notes-board.png`,
  )

  await homeSearchField.fill(preferredMemorySource.title)
  await page.waitForTimeout(900)
  const filteredSignal = page
    .locator('[data-home-source-memory-signal-stage908="true"][data-home-source-memory-signal-surface-stage908="card"]')
    .first()
  await filteredSignal.waitFor({ state: 'visible', timeout: 20000 })
  await filteredSignal.click()
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('[data-source-overview-memory-stack-stage906="true"]').first().waitFor({ state: 'visible', timeout: 20000 })
  const openedStackMetrics = await readHomeSourceMemoryOpenedStackMetrics(page)
  if (!openedStackMetrics.homeSourceMemorySignalOpensSourceOverviewStack) {
    throw new Error(`${stageLabel} expected memory-filtered signal to open Source overview memory stack.`)
  }

  const homeMemoryFilterOpensStackCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-memory-filter-opens-stack.png`,
  )

  await page.getByRole('tab', { name: 'Home' }).first().click()
  homeSearchField = await openHomeOrganizerSearchField(page)
  const emptyQuery = `stage910-empty-${Date.now()}`
  await homeSearchField.fill(emptyQuery)
  await page.waitForTimeout(500)
  await selectHomeMemoryFilterOption(page, 'Notes')
  await waitForHomeMemoryFilter(page, 'notes')
  await page.locator('[data-home-memory-filter-clear-empty-stage910="true"]').first().waitFor({
    state: 'visible',
    timeout: 12000,
  })
  const emptyBeforeClearMetrics = await readHomeMemoryFilterMetrics(page)
  await page.locator('[data-home-memory-filter-clear-empty-stage910="true"]').first().click()
  await waitForHomeMemoryFilter(page, 'all')
  const emptyAfterClearMetrics = await readHomeMemoryFilterMetrics(page)
  const homeMemoryFilterEmptyStateClearable =
    emptyBeforeClearMetrics.homeMemoryFilterEmptyStateClearVisible &&
    emptyAfterClearMetrics.homeMemoryFilterActiveValue === 'all'
  if (!homeMemoryFilterEmptyStateClearable) {
    throw new Error(`${stageLabel} expected empty memory-filter state to expose a working clear action.`)
  }

  const homeMemoryFilterEmptyCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-memory-filter-empty-clearable.png`,
  )

  return {
    captures: {
      homeMemoryFilterAnyCapture,
      homeMemoryFilterEmptyCapture,
      homeMemoryFilterMatchesCapture,
      homeMemoryFilterOpensStackCapture,
      homeMemoryFilterPersonalNotesCapture,
    },
    metrics: {
      ...openedStackMetrics,
      homeMemoryFilterAnyNarrowsSourceBoard,
      homeMemoryFilterControlsVisible: controlsVisible,
      homeMemoryFilterEmptyStateClearable,
      homeMemoryFilterGraphOnlyUsesSourceOwnedCounts: graphMetrics.homeMemoryFilterSourceOwnedGraphOnly,
      homeMemoryFilterMatchesSourceResults: studyMetrics.homeMemoryFilterMatchesSourceResults,
      homeMemoryFilterNotesOnlyUsesSourceOwnedCounts: notesMetrics.homeMemoryFilterSourceOwnedNotesOnly,
      homeMemoryFilterPreservesPersonalNotesBoard:
        personalNotesMetrics.homeMemoryFilterPreservesPersonalNotesBoard,
      homeMemoryFilterSignalsOpenSourceOverviewStack:
        openedStackMetrics.homeSourceMemorySignalOpensSourceOverviewStack,
      homeMemoryFilterStudyOnlyUsesSourceOwnedCounts: studyMetrics.homeMemoryFilterSourceOwnedStudyOnly,
    },
  }
  } finally {
    if (temporaryMemoryFilterDocumentId) {
      await fetch(`${baseUrl}/api/documents/${encodeURIComponent(temporaryMemoryFilterDocumentId)}`, {
        method: 'DELETE',
      }).catch(() => undefined)
    }
  }
}

async function captureHomeSourceMemorySignalEvidenceImpl({
  baseUrl,
  directory,
  harnessNoteTracker,
  page,
  stageLabel,
  stagePrefix,
}) {
  const preferredMemorySource = await findSourceMemoryStackDocument(baseUrl)
  if (!preferredMemorySource?.id) {
    throw new Error(`${stageLabel} expected at least one source with graph and study memory for Home source-memory signals.`)
  }

  const draftText = `Stage ${stagePrefix} home source memory signal note ${Date.now()}`
  await fetchJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(preferredMemorySource.id)}/notes`, {
    body: JSON.stringify({
      anchor: {
        anchor_text: `Source note for ${preferredMemorySource.title}`,
        block_id: `source:${preferredMemorySource.id}`,
        excerpt_text: `Manual note attached to ${preferredMemorySource.title}.`,
        global_sentence_end: 0,
        global_sentence_start: 0,
        kind: 'source',
        sentence_end: 0,
        sentence_start: 0,
        source_document_id: preferredMemorySource.id,
        variant_id: '',
      },
      body_text: draftText,
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  await trackStageHarnessCreatedNote({
    baseUrl,
    bodyText: draftText,
    context: `${stagePrefix}:home-source-memory-signal`,
    tracker: harnessNoteTracker,
  })

  const response = await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Home navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  const sourceBoardMetrics = await readHomePersonalNotesSourceBoardMetrics(page)
  if (!sourceBoardMetrics.homeSourceCardBoardPreserved || !sourceBoardMetrics.homeOpenOverviewDensityPreserved) {
    throw new Error(`${stageLabel} expected Home source boards to remain source-card boards before memory search.`)
  }

  const organizerOptions = page.getByRole('button', { name: 'Organizer options' }).first()
  if (await organizerOptions.isVisible().catch(() => false)) {
    await organizerOptions.click()
  }
  const homeSearchField = page.getByRole('searchbox', { name: 'Filter saved sources' }).first()
  await homeSearchField.waitFor({ state: 'visible', timeout: 12000 })
  await homeSearchField.fill(preferredMemorySource.title)
  await page.waitForTimeout(900)

  const cardSignal = page
    .locator(
      '[data-home-source-memory-signal-stage908="true"][data-home-source-memory-signal-surface-stage908="card"]',
    )
    .first()
  await cardSignal.waitFor({ state: 'visible', timeout: 20000 })
  const cardMetrics = await readHomeSourceMemorySignalMetrics(page, 'card')
  if (!cardMetrics.homeSourceMemorySignalsVisible || !cardMetrics.homeSourceMemorySignalsUseSourceOwnedCounts) {
    throw new Error(`${stageLabel} expected Home source cards to show source-owned memory counts.`)
  }
  if (!cardMetrics.homeMatchesSourceMemorySignalVisible) {
    throw new Error(`${stageLabel} expected Home Matches to show source-memory signals for matched sources.`)
  }

  const homeSourceMemorySignalsCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-source-memory-signals.png`,
  )

  await cardSignal.click()
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('[data-source-overview-memory-stack-stage906="true"]').first().waitFor({ state: 'visible', timeout: 20000 })
  const openedStackMetrics = await readHomeSourceMemoryOpenedStackMetrics(page)
  if (!openedStackMetrics.homeSourceMemorySignalOpensSourceOverviewStack) {
    throw new Error(`${stageLabel} expected source-memory signal to open Source overview memory stack.`)
  }

  const homeSourceMemoryOpenedStackCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-source-memory-opens-stack.png`,
  )

  await page.getByRole('tab', { name: 'Home' }).first().click()
  await page.getByRole('button', { name: 'List' }).first().waitFor({ state: 'visible', timeout: 12000 })
  await page.getByRole('button', { name: 'List' }).first().click()
  await page
    .locator(
      '[data-home-source-memory-signal-stage908="true"][data-home-source-memory-signal-surface-stage908="list"]',
    )
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  const listMetrics = await readHomeSourceMemorySignalMetrics(page, 'list')
  if (!listMetrics.homeSourceListRowsShowMemorySignal) {
    throw new Error(`${stageLabel} expected Home source list rows to show source-memory signals.`)
  }

  const homeSourceMemoryListCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-source-memory-list-signals.png`,
  )

  return {
    captures: {
      homeSourceMemoryListCapture,
      homeSourceMemoryOpenedStackCapture,
      homeSourceMemorySignalsCapture,
    },
    metrics: {
      ...sourceBoardMetrics,
      ...cardMetrics,
      ...openedStackMetrics,
      homeSourceListRowsShowMemorySignal: listMetrics.homeSourceListRowsShowMemorySignal,
    },
  }
}

async function captureStudyScheduleDrilldownEvidenceImpl({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const response = await page.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Study navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  await page.locator('[data-study-review-dashboard-stage916="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator('[data-study-schedule-bucket-drilldowns-stage918="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const initialMetrics = await readStudyScheduleDrilldownMetrics(page)
  if (!initialMetrics.studyScheduleBucketDrilldownsVisible) {
    throw new Error(`${stageLabel} expected Study dashboard bucket drilldowns to be visible.`)
  }

  const dashboardCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-schedule-dashboard-drilldowns.png`,
  )

  const dueMetrics = await openStudyScheduleBucket(page, 'due-now')
  const studyScheduleDueBucketOpensQuestions =
    dueMetrics.studyScheduleQuestionsVisible &&
    dueMetrics.studyScheduleActiveFilter === 'due-now' &&
    dueMetrics.studyScheduleRowsMatchActiveBucket
  if (!studyScheduleDueBucketOpensQuestions) {
    throw new Error(`${stageLabel} expected Due now bucket to open Questions with a due-now schedule filter.`)
  }
  const dueQuestionsCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-schedule-due-questions.png`,
  )

  const thisWeekMetrics = await openStudyScheduleBucket(page, 'due-this-week')
  const studyScheduleThisWeekBucketFiltersQuestions =
    thisWeekMetrics.studyScheduleActiveFilter === 'due-this-week' &&
    thisWeekMetrics.studyScheduleRowsMatchActiveBucket

  const upcomingMetrics = await openStudyScheduleBucket(page, 'upcoming')
  const studyScheduleUpcomingBucketFiltersQuestions =
    upcomingMetrics.studyScheduleActiveFilter === 'upcoming' &&
    upcomingMetrics.studyScheduleRowsMatchActiveBucket

  const reviewedMetrics = await openStudyScheduleBucket(page, 'reviewed')
  const studyScheduleReviewedBucketFiltersQuestions =
    reviewedMetrics.studyScheduleActiveFilter === 'reviewed' &&
    reviewedMetrics.studyScheduleRowsMatchActiveBucket

  if (
    !studyScheduleThisWeekBucketFiltersQuestions ||
    !studyScheduleUpcomingBucketFiltersQuestions ||
    !studyScheduleReviewedBucketFiltersQuestions
  ) {
    throw new Error(`${stageLabel} expected This week, Upcoming, and Reviewed buckets to filter Questions.`)
  }

  const chipClear = page.locator('[data-study-schedule-filter-clear-stage918="true"]').first()
  await chipClear.waitFor({ state: 'visible', timeout: 12000 })
  await chipClear.click()
  await page.waitForFunction(() => !document.querySelector('[data-study-schedule-filter-chip-stage918="true"]'))
  const afterClearMetrics = await readStudyScheduleDrilldownMetrics(page)
  const studyScheduleFilterChipClearable = afterClearMetrics.studyScheduleActiveFilter === 'all'
  if (!studyScheduleFilterChipClearable) {
    throw new Error(`${stageLabel} expected the schedule filter chip to clear.`)
  }

  const searchableDrilldown = await openFirstStudyScheduleBucketWithVisibleRows(page)
  let studyScheduleQuestionSearchComposesWithBucket = false
  if (searchableDrilldown) {
    const firstRowText =
      (await page.locator('[data-study-schedule-question-result-stage918]').first().textContent().catch(() => '')) ?? ''
    const query = buildHarnessSearchQuery(firstRowText)
    await page.getByRole('searchbox', { name: 'Search questions' }).first().fill(query)
    await page.waitForTimeout(500)
    const searchMetrics = await readStudyScheduleDrilldownMetrics(page, searchableDrilldown)
    studyScheduleQuestionSearchComposesWithBucket =
      searchMetrics.studyScheduleQuestionSearchActive &&
      searchMetrics.studyScheduleActiveFilter === searchableDrilldown &&
      searchMetrics.studyScheduleRowsMatchActiveBucket &&
      searchMetrics.studyScheduleVisibleQuestionCount > 0
  }
  if (!studyScheduleQuestionSearchComposesWithBucket) {
    throw new Error(`${stageLabel} expected question search to compose with an active schedule bucket.`)
  }

  await page
    .getByRole('searchbox', { name: 'Search questions' })
    .first()
    .fill(`stage918-no-match-${Date.now()}`)
  await page.locator('[data-study-schedule-empty-stage918="true"]').first().waitFor({
    state: 'visible',
    timeout: 12000,
  })
  const emptyCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-schedule-empty-clearable.png`,
  )
  await page.locator('[data-study-schedule-empty-clear-stage918="true"]').first().click()
  await page.waitForFunction(() => !document.querySelector('[data-study-schedule-filter-chip-stage918="true"]'))
  const emptyClearMetrics = await readStudyScheduleDrilldownMetrics(page)
  const studyScheduleEmptyStateClearable = emptyClearMetrics.studyScheduleActiveFilter === 'all'
  if (!studyScheduleEmptyStateClearable) {
    throw new Error(`${stageLabel} expected the schedule empty state to clear the active bucket.`)
  }

  await page.getByRole('searchbox', { name: 'Search questions' }).first().fill('')
  await openStudyScheduleBucket(page, 'due-now')
  await page.locator('[aria-label="Study filters"]').first().getByRole('tab', { name: 'New' }).click()
  await page.waitForFunction(() => !document.querySelector('[data-study-schedule-filter-chip-stage918="true"]'))
  const statusClearMetrics = await readStudyScheduleDrilldownMetrics(page)
  const studyScheduleStatusTabsClearDrilldown = statusClearMetrics.studyScheduleActiveFilter === 'all'
  if (!studyScheduleStatusTabsClearDrilldown) {
    throw new Error(`${stageLabel} expected status tabs to clear schedule drilldown state.`)
  }

  await page.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  await page.locator('[data-study-review-dashboard-source-review-stage916="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator('[data-study-review-dashboard-source-review-stage916="true"]').first().click()
  await page.locator('[data-study-source-scoped-queue-stage914="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator('[data-study-schedule-bucket-drilldowns-stage918="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const scopedDrilldown = await openFirstStudyScheduleBucketWithVisibleRows(page, ['due-now', 'new', 'upcoming', 'reviewed'])
  const sourceScopeMetrics = await readStudyScheduleDrilldownMetrics(page, scopedDrilldown ?? 'all')
  const studyScheduleDrilldownSourceScopeStable =
    Boolean(scopedDrilldown) &&
    sourceScopeMetrics.studyScheduleSourceScopeVisible &&
    sourceScopeMetrics.studyScheduleQuestionsVisible &&
    sourceScopeMetrics.studyScheduleActiveFilter === scopedDrilldown &&
    sourceScopeMetrics.studyScheduleRowsMatchActiveBucket
  if (!studyScheduleDrilldownSourceScopeStable) {
    throw new Error(`${stageLabel} expected source-scoped Study bucket drilldown to stay scoped to that source.`)
  }
  const sourceScopedCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-schedule-source-scoped-drilldown.png`,
  )

  return {
    captures: {
      dashboardCapture,
      dueQuestionsCapture,
      emptyCapture,
      sourceScopedCapture,
    },
    metrics: {
      ...initialMetrics,
      studyScheduleDrilldownSourceScopeStable,
      studyScheduleDueBucketOpensQuestions,
      studyScheduleEmptyStateClearable,
      studyScheduleFilterChipClearable,
      studyScheduleQuestionSearchComposesWithBucket,
      studyScheduleReviewedBucketFiltersQuestions,
      studyScheduleStatusTabsClearDrilldown,
      studyScheduleThisWeekBucketFiltersQuestions,
      studyScheduleUpcomingBucketFiltersQuestions,
    },
  }
}

async function captureHomeReviewReadySourceEvidenceImpl({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const preferredMemorySource = await findSourceMemoryStackDocument(baseUrl)
  if (!preferredMemorySource?.id) {
    throw new Error(`${stageLabel} expected at least one source with study memory for review-ready Home signals.`)
  }

  const response = await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Home navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  const sourceBoardMetrics = await readHomePersonalNotesSourceBoardMetrics(page)
  if (!sourceBoardMetrics.homeSourceCardBoardPreserved || !sourceBoardMetrics.homeOpenOverviewDensityPreserved) {
    throw new Error(`${stageLabel} expected Home source boards to stay source-card boards before review signals.`)
  }

  const organizerOptions = page.getByRole('button', { name: 'Organizer options' }).first()
  if (await organizerOptions.isVisible().catch(() => false)) {
    await organizerOptions.click()
  }
  const homeSearchField = page.getByRole('searchbox', { name: 'Filter saved sources' }).first()
  await homeSearchField.waitFor({ state: 'visible', timeout: 12000 })
  await homeSearchField.fill(preferredMemorySource.title)
  await page.waitForTimeout(900)

  const cardSignal = page
    .locator('[data-home-review-ready-signal-stage916="true"][data-home-review-ready-signal-surface-stage916="card"]')
    .first()
  await cardSignal.waitFor({ state: 'visible', timeout: 20000 })
  const cardMetrics = await readHomeReviewReadySignalMetrics(page, 'card')
  if (!cardMetrics.homeReviewReadySourceSignalsVisible || !cardMetrics.homeReviewReadySourceSignalsUseDueCounts) {
    throw new Error(`${stageLabel} expected Home source cards to show source-owned review-ready counts.`)
  }
  if (!cardMetrics.homeReviewReadyMatchesSignalVisible) {
    throw new Error(`${stageLabel} expected Home Matches to show review-ready signals for matched sources.`)
  }

  const homeReviewReadySignalCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-review-ready-signals.png`,
  )

  await cardSignal.click()
  await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Study', selected: true }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator('[data-study-source-scoped-queue-stage914="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const homeReviewReadySignalOpensSourceScopedStudy = await readStudySourceScopedQueueVisible(page)
  if (!homeReviewReadySignalOpensSourceScopedStudy) {
    throw new Error(`${stageLabel} expected Home review signal to open source-scoped Study Review.`)
  }

  const homeReviewReadyStudyHandoffCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-review-ready-signal-study-handoff.png`,
  )

  let dashboardPage
  let questionsPage
  let dashboardMetrics
  let dashboardCapture
  let dashboardQuestionsCapture
  let studyReviewDashboardSourceRowOpensSourceScopedQuestions = false
  let studyReviewDashboardSourceRowOpensSourceScopedStudy = false
  const browser = page.context().browser()
  if (!browser) {
    throw new Error(`${stageLabel} expected a browser instance for fresh Study dashboard checks.`)
  }
  try {
    dashboardPage = await browser.newPage({ viewport: desktopViewport })
    await dashboardPage.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
    await dashboardPage.locator('[data-study-review-dashboard-stage916="true"]').first().waitFor({
      state: 'visible',
      timeout: 20000,
    })
    dashboardMetrics = await readStudyReviewDashboardMetrics(dashboardPage)
    if (
      !dashboardMetrics.studyReviewDashboardVisible ||
      !dashboardMetrics.studyReviewDashboardUsesScheduleBuckets ||
      !dashboardMetrics.studyReviewDashboardSourceBreakdownVisible
    ) {
      throw new Error(`${stageLabel} expected Study Review dashboard buckets and source breakdown to be visible.`)
    }

    dashboardCapture = await captureViewportScreenshot(
      dashboardPage,
      directory,
      `${stagePrefix}-study-review-dashboard.png`,
    )

    await dashboardPage.locator('[data-study-review-dashboard-source-review-stage916="true"]').first().click()
    await dashboardPage.locator('[data-study-source-scoped-queue-stage914="true"]').first().waitFor({
      state: 'visible',
      timeout: 20000,
    })
    studyReviewDashboardSourceRowOpensSourceScopedStudy = await readStudySourceScopedQueueVisible(dashboardPage)
    if (!studyReviewDashboardSourceRowOpensSourceScopedStudy) {
      throw new Error(`${stageLabel} expected Study dashboard source row to open source-scoped Study Review.`)
    }

    questionsPage = await browser.newPage({ viewport: desktopViewport })
    await questionsPage.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
    await questionsPage.locator('[data-study-review-dashboard-source-questions-stage916="true"]').first().waitFor({
      state: 'visible',
      timeout: 20000,
    })
    await questionsPage.locator('[data-study-review-dashboard-source-questions-stage916="true"]').first().click()
    await questionsPage.locator('[data-study-source-scoped-question-search-stage914="true"]').first().waitFor({
      state: 'visible',
      timeout: 20000,
    })
    studyReviewDashboardSourceRowOpensSourceScopedQuestions = true
    dashboardQuestionsCapture = await captureViewportScreenshot(
      questionsPage,
      directory,
      `${stagePrefix}-study-review-dashboard-source-questions.png`,
    )
  } finally {
    await questionsPage?.close().catch(() => undefined)
    await dashboardPage?.close().catch(() => undefined)
  }

  await page.getByRole('tab', { name: 'Home' }).first().click()
  await page.getByRole('button', { name: 'List' }).first().waitFor({ state: 'visible', timeout: 12000 })
  await page.getByRole('button', { name: 'List' }).first().click()
  await page
    .locator('[data-home-review-ready-signal-stage916="true"][data-home-review-ready-signal-surface-stage916="list"]')
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  const listMetrics = await readHomeReviewReadySignalMetrics(page, 'list')

  const homeReviewReadyListCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-review-ready-list-signals.png`,
  )

  return {
    captures: {
      dashboardCapture,
      dashboardQuestionsCapture,
      homeReviewReadyListCapture,
      homeReviewReadySignalCapture,
      homeReviewReadyStudyHandoffCapture,
    },
    metrics: {
      ...sourceBoardMetrics,
      ...cardMetrics,
      ...dashboardMetrics,
      homeReviewReadySignalOpensSourceScopedStudy,
      homeSourceListRowsShowReviewReadySignal: listMetrics.homeSourceListRowsShowReviewReadySignal,
      studyReviewDashboardSourceRowOpensSourceScopedQuestions,
      studyReviewDashboardSourceRowOpensSourceScopedStudy,
    },
  }
}

export async function captureHomePersonalNotesCollectionBoardEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  return withStageHarnessNoteCleanup(
    {
      baseUrl,
      directory,
      page,
      stageLabel,
      stagePrefix,
    },
    captureHomePersonalNotesCollectionBoardEvidenceImpl,
  )
}

async function captureHomePersonalNotesCollectionBoardEvidenceImpl({
  baseUrl,
  directory,
  harnessNoteTracker,
  page,
  stageLabel,
  stagePrefix,
}) {
  const response = await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Home navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  const homeNewNoteButton = page.getByRole('button', { name: 'New note' }).first()
  await homeNewNoteButton.waitFor({ state: 'visible', timeout: 20000 })
  await homeNewNoteButton.click()

  const draftRegion = page.getByRole('region', { name: 'New note draft' }).first()
  await draftRegion.waitFor({ state: 'visible', timeout: 20000 })

  const draftText = `Stage ${stagePrefix} personal notes board body ${Date.now()}`
  await draftRegion.getByRole('textbox', { name: 'New note text' }).fill(draftText)
  await draftRegion.getByRole('button', { name: 'Save note' }).click()
  await page.getByRole('region', { name: 'Selected note workbench' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('[data-notebook-source-context-panel="true"]').first().waitFor({ state: 'visible', timeout: 20000 })
  await trackStageHarnessCreatedNote({
    baseUrl,
    bodyText: draftText,
    context: `${stagePrefix}:home-personal-notes-board`,
    tracker: harnessNoteTracker,
  })

  await page.getByRole('tab', { name: 'Home' }).first().click()
  const organizerSection = page.locator('[data-home-personal-notes-organizer-section-stage898="true"]').first()
  await organizerSection.waitFor({ state: 'visible', timeout: 20000 })

  const sourceBoardMetrics = await readHomePersonalNotesSourceBoardMetrics(page)
  if (!sourceBoardMetrics.homeSourceCardBoardPreserved || !sourceBoardMetrics.homeOpenOverviewDensityPreserved) {
    throw new Error(`${stageLabel} expected source boards to stay source-card boards before opening Personal notes.`)
  }

  await organizerSection.getByRole('button').first().click()
  const board = page.locator('[data-home-personal-notes-board-stage898="true"]').first()
  await board.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(300)

  const boardMetrics = await readHomePersonalNotesCollectionBoardMetrics(page, draftText)
  if (!boardMetrics.homePersonalNotesOrganizerSectionVisible || !boardMetrics.homePersonalNotesOrganizerSectionSelectable) {
    throw new Error(`${stageLabel} expected Personal notes to be visible and selectable in the Home organizer.`)
  }
  if (
    !boardMetrics.homePersonalNotesBoardVisible ||
    !boardMetrics.homePersonalNotesBoardStartsWithNoteItems ||
    !boardMetrics.homePersonalNotesBoardUsesBodyPreview ||
    !boardMetrics.homePersonalNotesBoardSyntheticAnchorHidden
  ) {
    throw new Error(`${stageLabel} expected the Personal notes board to render note-owned body previews without synthetic anchors.`)
  }

  const personalNotesBoardCapture = await captureLocatorScreenshot(
    page,
    board,
    directory,
    `${stagePrefix}-home-personal-notes-board.png`,
  )

  await board.locator('[data-home-personal-note-board-open-notebook-stage898="true"]').first().click()
  await page.getByRole('region', { name: 'Selected note workbench' }).first().waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('[data-notebook-source-context-panel="true"]').first().waitFor({ state: 'visible', timeout: 20000 })
  const notebookMetrics = await readHomePersonalNoteOpenedNotebookMetrics(page, draftText)
  if (!notebookMetrics.homePersonalNoteOpensEmbeddedNotebook) {
    throw new Error(`${stageLabel} expected the Personal notes board to reopen embedded Notebook detail.`)
  }

  const personalNotesNotebookCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-personal-notes-board-opens-notebook.png`,
  )

  await page.getByRole('tab', { name: 'Home' }).first().click()
  await page.locator('[data-home-personal-notes-board-stage898="true"]').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('[data-home-personal-note-board-reader-stage898="true"]').first().click()
  await page.waitForURL(/\/reader(?:\?|$)/, { timeout: 12000 })
  const handoffUrl = new URL(page.url())
  const homePersonalNotesBoardReaderHandoffUnanchored =
    handoffUrl.pathname === '/reader' &&
    Boolean(handoffUrl.searchParams.get('document')) &&
    !handoffUrl.searchParams.has('sentenceStart') &&
    !handoffUrl.searchParams.has('sentenceEnd')
  if (!homePersonalNotesBoardReaderHandoffUnanchored) {
    throw new Error(`${stageLabel} expected Personal notes board Reader handoff to omit sentence anchors.`)
  }

  return {
    captures: {
      personalNotesBoardCapture,
      personalNotesNotebookCapture,
    },
    metrics: {
      ...sourceBoardMetrics,
      ...boardMetrics,
      ...notebookMetrics,
      homePersonalNotesBoardOpensEmbeddedNotebook: notebookMetrics.homePersonalNoteOpensEmbeddedNotebook,
      homePersonalNotesBoardReaderHandoffUnanchored,
    },
  }
}

export async function captureSourceOverviewMemoryEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  return withStageHarnessNoteCleanup(
    {
      baseUrl,
      directory,
      page,
      stageLabel,
      stagePrefix,
    },
    captureSourceOverviewMemoryEvidenceImpl,
  )
}

export async function captureSourceMemorySearchEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  return withStageHarnessNoteCleanup(
    {
      baseUrl,
      directory,
      page,
      stageLabel,
      stagePrefix,
    },
    captureSourceMemorySearchEvidenceImpl,
  )
}

export async function captureSourceReviewQueueEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  return withStageHarnessNoteCleanup(
    {
      baseUrl,
      directory,
      page,
      stageLabel,
      stagePrefix,
    },
    captureSourceReviewQueueEvidenceImpl,
  )
}

async function captureSourceMemorySearchEvidenceImpl({
  baseUrl,
  directory,
  harnessNoteTracker,
  page,
  stageLabel,
  stagePrefix,
}) {
  const preferredMemorySource = await findSourceMemoryStackDocument(baseUrl)
  if (!preferredMemorySource?.id) {
    throw new Error(`${stageLabel} expected at least one source with graph and study memory.`)
  }

  const [graphSnapshot, studyCards] = await Promise.all([
    fetchJson(`${baseUrl}/api/recall/graph?limit_nodes=120&limit_edges=160`),
    fetchJson(`${baseUrl}/api/recall/study/cards?status=all&limit=200`),
  ])
  const graphNode = (graphSnapshot?.nodes ?? []).find((node) =>
    (node?.source_document_ids ?? []).includes(preferredMemorySource.id),
  )
  const studyCard = (Array.isArray(studyCards) ? studyCards : []).find(
    (card) => card?.source_document_id === preferredMemorySource.id,
  )
  if (!graphNode?.label || !studyCard?.prompt) {
    throw new Error(`${stageLabel} expected graph and study memory for the preferred source.`)
  }

  const sourceTextQuery = await findSourceMemoryTextQuery(baseUrl, preferredMemorySource)
  const draftText = `Stage ${stagePrefix} source memory search personal note ${Date.now()}`
  await fetchJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(preferredMemorySource.id)}/notes`, {
    body: JSON.stringify({
      anchor: {
        anchor_text: `Source note for ${preferredMemorySource.title}`,
        block_id: `source:${preferredMemorySource.id}`,
        excerpt_text: `Manual note attached to ${preferredMemorySource.title}.`,
        global_sentence_end: 0,
        global_sentence_start: 0,
        kind: 'source',
        sentence_end: 0,
        sentence_start: 0,
        source_document_id: preferredMemorySource.id,
        variant_id: '',
      },
      body_text: draftText,
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  await trackStageHarnessCreatedNote({
    baseUrl,
    bodyText: draftText,
    context: `${stagePrefix}:source-memory-search`,
    tracker: harnessNoteTracker,
  })

  const response = await page.goto(`${baseUrl}/reader?document=${encodeURIComponent(preferredMemorySource.id)}`, {
    waitUntil: 'networkidle',
  })
  if (!response || !response.ok()) {
    throw new Error(`Source memory search navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.getByRole('region', { name: `${preferredMemorySource.title} workspace` }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await openSourceWorkspaceDestination(page, 'Overview')
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })

  const sourceMemoryPanel = page.locator('[data-source-overview-personal-notes-panel-stage900="true"]').first()
  await sourceMemoryPanel.waitFor({ state: 'visible', timeout: 20000 })
  const searchInput = sourceMemoryPanel.getByRole('searchbox', { name: 'Search source memory' })
  await searchInput.waitFor({ state: 'visible', timeout: 20000 })
  const sourceMemorySearchControlsVisible =
    (await sourceMemoryPanel.locator('[data-source-memory-search-controls-stage912="true"]').count()) > 0
  if (!sourceMemorySearchControlsVisible) {
    throw new Error(`${stageLabel} expected source-memory search controls to be visible.`)
  }

  await searchInput.fill(draftText)
  const personalNoteResult = sourceMemoryPanel
    .locator('[data-source-memory-search-result-stage912="personal-note"]')
    .filter({ hasText: draftText })
    .first()
  await personalNoteResult.waitFor({ state: 'visible', timeout: 20000 })
  const sourceMemorySearchFindsPersonalNotes = true

  await personalNoteResult.locator('[data-source-overview-memory-open-notebook-stage900="true"]').first().click()
  const selectedWorkbench = page.getByRole('region', { name: 'Selected note workbench' }).first()
  await selectedWorkbench.waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('[data-notebook-source-context-panel="true"]').first().waitFor({ state: 'visible', timeout: 20000 })
  const sourceMemorySearchPersonalNoteOpensNotebook = await page.evaluate((expectedText) => {
    const noteText = document.querySelector(
      '.recall-note-workbench-editor-stage872 textarea, .recall-note-workbench-editor textarea',
    )
    const sourceContext = document.querySelector('[data-notebook-source-context-panel="true"]')
    return (
      window.location.pathname === '/recall' &&
      sourceContext instanceof HTMLElement &&
      noteText instanceof HTMLTextAreaElement &&
      noteText.value === expectedText
    )
  }, draftText)
  if (!sourceMemorySearchPersonalNoteOpensNotebook) {
    throw new Error(`${stageLabel} expected personal-note search result to open embedded Notebook.`)
  }

  await selectedWorkbench.getByRole('button', { name: 'Open source' }).first().click()
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await sourceMemoryPanel.waitFor({ state: 'visible', timeout: 20000 })

  await searchInput.fill(graphNode.label)
  await sourceMemoryPanel
    .locator('[data-source-memory-search-result-stage912="graph"]')
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  const sourceMemorySearchFindsGraphItems = true
  await sourceMemoryPanel.locator('[data-source-overview-graph-memory-open-stage906="true"]').first().click()
  await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Graph', selected: true }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const sourceMemorySearchGraphItemOpensFocusedGraph = true

  await openSourceWorkspaceDestination(page, 'Overview')
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await sourceMemoryPanel.waitFor({ state: 'visible', timeout: 20000 })

  await searchInput.fill(studyCard.prompt)
  await sourceMemoryPanel
    .locator('[data-source-memory-search-result-stage912="study"]')
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  const sourceMemorySearchFindsStudyItems = true
  await sourceMemoryPanel.locator('[data-source-overview-study-memory-open-stage906="true"]').first().click()
  await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Study', selected: true }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const sourceMemorySearchStudyItemOpensFocusedStudy = true

  await openSourceWorkspaceDestination(page, 'Overview')
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await sourceMemoryPanel.waitFor({ state: 'visible', timeout: 20000 })

  await searchInput.fill(`no ${stagePrefix} memory match ${Date.now()}`)
  await sourceMemoryPanel.locator('[data-source-memory-search-empty-state-stage912="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await sourceMemoryPanel.locator('[data-source-memory-search-clear-stage912="true"]').first().click()
  await page.waitForTimeout(250)
  const sourceMemorySearchEmptyStateClearable = await page.evaluate(() => {
    const input = document.querySelector('[data-source-memory-search-control-stage912="true"]')
    const stack = document.querySelector('[data-source-overview-memory-stack-stage906="true"]')
    return input instanceof HTMLInputElement && input.value === '' && stack instanceof HTMLElement
  })
  if (!sourceMemorySearchEmptyStateClearable) {
    throw new Error(`${stageLabel} expected source-memory empty search to clear back to the memory stack.`)
  }

  await searchInput.fill(sourceTextQuery)
  await sourceMemoryPanel
    .locator('[data-source-memory-search-result-stage912="source-text"]')
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  const sourceMemorySearchFindsSourceText = true
  const sourceMemorySearchCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-source-memory-search-results.png`,
  )

  await sourceMemoryPanel.locator('[data-source-memory-search-source-text-open-reader-stage912="true"]').first().click()
  await page.waitForURL(/\/reader(?:\?|$)/, { timeout: 12000 })
  const sourceMemorySearchReaderHandoffPreservesAnchorSemantics = await page.evaluate(() => {
    const url = new URL(window.location.href)
    return (
      url.pathname === '/reader' &&
      Boolean(url.searchParams.get('document')) &&
      url.searchParams.has('sentenceStart') &&
      url.searchParams.has('sentenceEnd')
    )
  })
  if (!sourceMemorySearchReaderHandoffPreservesAnchorSemantics) {
    throw new Error(`${stageLabel} expected source-text search result to open Reader with sentence anchors.`)
  }

  await page.getByRole('button', { name: 'Find source memory' }).first().waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('button', { name: 'Find source memory' }).first().click()
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await searchInput.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForFunction(
    () => {
      const input = document.querySelector('[data-source-memory-search-control-stage912="true"]')
      return input instanceof HTMLInputElement && document.activeElement === input
    },
    { timeout: 3000 },
  ).catch(() => {})
  const readerSourceMemorySearchOpensSourceOverview = await page.evaluate(() => {
    const input = document.querySelector('[data-source-memory-search-control-stage912="true"]')
    return window.location.pathname === '/recall' && input instanceof HTMLInputElement && document.activeElement === input
  })
  if (!readerSourceMemorySearchOpensSourceOverview) {
    throw new Error(`${stageLabel} expected Reader Find memory to open Source overview with source search focused.`)
  }

  const readerSourceMemorySearchCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-reader-source-memory-find.png`,
  )

  return {
    captures: {
      readerSourceMemorySearchCapture,
      sourceMemorySearchCapture,
    },
    metrics: {
      readerSourceMemorySearchOpensSourceOverview,
      sourceMemorySearchControlsVisible,
      sourceMemorySearchEmptyStateClearable,
      sourceMemorySearchFindsGraphItems,
      sourceMemorySearchFindsPersonalNotes,
      sourceMemorySearchFindsSourceText,
      sourceMemorySearchFindsStudyItems,
      sourceMemorySearchGraphItemOpensFocusedGraph,
      sourceMemorySearchPersonalNoteOpensNotebook,
      sourceMemorySearchReaderHandoffPreservesAnchorSemantics,
      sourceMemorySearchStudyItemOpensFocusedStudy,
    },
  }
}

async function captureSourceReviewQueueEvidenceImpl({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  const preferredMemorySource = await findSourceMemoryStackDocument(baseUrl)
  if (!preferredMemorySource?.id) {
    throw new Error(`${stageLabel} expected at least one source with graph and study memory.`)
  }

  const studyCards = await fetchJson(`${baseUrl}/api/recall/study/cards?status=all&limit=200`)
  const sourceCards = orderHarnessStudyCardsForReviewQueue(
    (Array.isArray(studyCards) ? studyCards : []).filter(
      (card) => card?.source_document_id === preferredMemorySource.id,
    ),
  )
  const primaryCard = sourceCards[0] ?? null
  if (!primaryCard?.id || !primaryCard.prompt) {
    throw new Error(`${stageLabel} expected at least one source-local study card.`)
  }

  const promptQuery = buildHarnessSearchQuery(primaryCard.prompt)
  const evidenceQuery = buildHarnessStudyEvidenceSearchQuery(primaryCard) ?? buildHarnessSearchQuery(primaryCard.answer)
  const expectedCounts = {
    due: sourceCards.filter((card) => card.status === 'due').length,
    new: sourceCards.filter((card) => card.status === 'new').length,
    scheduled: sourceCards.filter((card) => card.status === 'scheduled').length,
    total: sourceCards.length,
  }
  const readerUrl = `${baseUrl}/reader?document=${encodeURIComponent(preferredMemorySource.id)}`
  const response = await page.goto(readerUrl, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Source review navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.getByRole('region', { name: `${preferredMemorySource.title} workspace` }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await openSourceWorkspaceDestination(page, 'Overview')
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })

  const reviewPanelHeading = page.locator('[data-source-overview-review-panel-stage914="true"]').first()
  await reviewPanelHeading.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForFunction(
    (expectedTotal) => {
      const isVisible = (element) => {
        if (!(element instanceof HTMLElement)) {
          return false
        }
        const style = window.getComputedStyle(element)
        const box = element.getBoundingClientRect()
        return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1
      }
      return Array.from(document.querySelectorAll('[data-source-overview-review-counts-stage914="true"]')).some(
        (row) => isVisible(row) && row.textContent?.includes(`${expectedTotal} total`),
      )
    },
    expectedCounts.total,
    { timeout: 20000 },
  )
  const sourceOverviewReviewPanelVisible = true
  const reviewCountText = await page.evaluate((expectedTotal) => {
    const isVisible = (element) => {
      if (!(element instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(element)
      const box = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1
    }
    const row = Array.from(document.querySelectorAll('[data-source-overview-review-counts-stage914="true"]')).find(
      (candidate) => isVisible(candidate) && candidate.textContent?.includes(`${expectedTotal} total`),
    )
    return (row?.textContent ?? '').replace(/\s+/g, ' ')
  }, expectedCounts.total)
  const sourceOverviewReviewUsesSourceOwnedCounts =
    /\d+ due/.test(reviewCountText) &&
    /\d+ new/.test(reviewCountText) &&
    /\d+ scheduled/.test(reviewCountText) &&
    reviewCountText.includes(`${expectedCounts.total} total`)
  if (!sourceOverviewReviewUsesSourceOwnedCounts) {
    throw new Error(
      `${stageLabel} expected Source review counts to reflect source-local Study cards; expected total ${expectedCounts.total}, saw "${reviewCountText}".`,
    )
  }

  const sourceReviewPanelCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-source-review-panel.png`,
  )

  await page.locator('[data-source-overview-review-due-handoff-stage914="true"]').first().click()
  await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Study', selected: true }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator('[data-study-source-scoped-queue-stage914="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const sourceOverviewReviewDueHandoffOpensSourceScopedStudy = true
  const studySourceScopedQueueVisible = true
  const sourceReviewQueueCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-source-scoped-review-queue.png`,
  )

  await openSourceWorkspaceDestination(page, 'Overview')
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('[data-source-overview-review-questions-handoff-stage914="true"]').first().click()
  await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Study', selected: true }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.locator('[data-study-source-scoped-queue-stage914="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const questionSearchInput = page.getByRole('searchbox', { name: 'Search questions' }).first()
  await questionSearchInput.waitFor({ state: 'visible', timeout: 20000 })
  const sourceOverviewReviewQuestionsHandoffOpensSourceScopedQuestions = true
  const studySourceScopedQuestionSearchVisible =
    (await page.locator('[data-study-source-scoped-question-search-stage914="true"]').count()) > 0

  await questionSearchInput.fill(promptQuery)
  await page
    .locator('[data-study-question-search-result-stage914="true"]')
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  const studySourceScopedQuestionSearchFindsPrompt = true

  await questionSearchInput.fill(evidenceQuery)
  await page
    .locator('[data-study-question-search-result-stage914="true"]')
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
  const studySourceScopedQuestionSearchFindsEvidence = true
  const sourceQuestionSearchCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-source-scoped-question-search.png`,
  )

  const clearSearchButton = page.locator('[data-study-question-search-clear-stage914="true"]').last()
  if (await clearSearchButton.isVisible().catch(() => false)) {
    await clearSearchButton.click()
  } else {
    await questionSearchInput.fill('')
  }

  await openSourceWorkspaceDestination(page, 'Overview')
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('[data-source-overview-review-due-handoff-stage914="true"]').first().click()
  await page.locator('[data-study-source-scoped-queue-stage914="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.getByRole('button', { name: /Show answer|Reveal answer/ }).first().click()
  await page.getByRole('button', { name: 'Good' }).last().click()
  await page.locator('[data-study-source-scoped-queue-stage914="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page.waitForTimeout(700)
  const studySourceScopedReviewStaysInSourceAfterRating = await page.evaluate((sourceTitle) => {
    const scopedQueue = document.querySelector('[data-study-source-scoped-queue-stage914="true"]')
    return scopedQueue instanceof HTMLElement && (document.body.textContent ?? '').includes(sourceTitle)
  }, preferredMemorySource.title)
  if (!studySourceScopedReviewStaysInSourceAfterRating) {
    throw new Error(`${stageLabel} expected source-scoped Study review to stay scoped after rating.`)
  }

  await page.goto(readerUrl, { waitUntil: 'networkidle' })
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
  const readerSourceStudyCountOpensSourceScopedStudy = true
  const readerStudySourceScopeCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-reader-study-count-source-scoped.png`,
  )

  return {
    captures: {
      readerStudySourceScopeCapture,
      sourceQuestionSearchCapture,
      sourceReviewPanelCapture,
      sourceReviewQueueCapture,
    },
    metrics: {
      readerSourceStudyCountOpensSourceScopedStudy,
      sourceOverviewReviewDueHandoffOpensSourceScopedStudy,
      sourceOverviewReviewPanelVisible,
      sourceOverviewReviewQuestionsHandoffOpensSourceScopedQuestions,
      sourceOverviewReviewUsesSourceOwnedCounts,
      studySourceScopedQuestionSearchFindsEvidence,
      studySourceScopedQuestionSearchFindsPrompt,
      studySourceScopedQuestionSearchVisible,
      studySourceScopedQueueVisible,
      studySourceScopedReviewStaysInSourceAfterRating,
    },
  }
}

async function captureSourceOverviewMemoryEvidenceImpl({
  baseUrl,
  directory,
  harnessNoteTracker,
  page,
  stageLabel,
  stagePrefix,
}) {
  const preferredMemorySource = await findSourceMemoryStackDocument(baseUrl).catch(() => null)
  const response = await page.goto(
    preferredMemorySource?.id
      ? `${baseUrl}/reader?document=${encodeURIComponent(preferredMemorySource.id)}`
      : `${baseUrl}/recall`,
    { waitUntil: 'networkidle' },
  )
  if (!response || !response.ok()) {
    throw new Error(`Source memory navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  if (preferredMemorySource?.id) {
    await page.getByRole('region', { name: `${preferredMemorySource.title} workspace` }).waitFor({ state: 'visible', timeout: 20000 })
    await openSourceWorkspaceDestination(page, 'Overview')
  } else {
    const sourceButton = page.locator('.recall-home-parity-card-stage563, .recall-home-parity-list-row-stage563').first()
    await sourceButton.waitFor({ state: 'visible', timeout: 20000 })
    await sourceButton.click()
  }
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })

  const sourceMemoryPanel = page.locator('[data-source-overview-personal-notes-panel-stage900="true"]').first()
  await sourceMemoryPanel.waitFor({ state: 'visible', timeout: 20000 })
  const draftText = `Stage ${stagePrefix} source overview memory body ${Date.now()}`

  await sourceMemoryPanel.locator('[data-source-overview-new-note-stage900="true"]').first().click()
  const draftRegion = page.getByRole('region', { name: 'New note draft' }).first()
  await draftRegion.waitFor({ state: 'visible', timeout: 20000 })
  await draftRegion.getByRole('textbox', { name: 'New note text' }).fill(draftText)
  await draftRegion.getByRole('button', { name: 'Save note' }).click()

  const selectedWorkbench = page.getByRole('region', { name: 'Selected note workbench' }).first()
  await selectedWorkbench.waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('[data-notebook-source-context-panel="true"]').first().waitFor({ state: 'visible', timeout: 20000 })
  await trackStageHarnessCreatedNote({
    baseUrl,
    bodyText: draftText,
    context: `${stagePrefix}:source-overview-memory`,
    tracker: harnessNoteTracker,
  })

  const sourceOverviewNewNoteCreatesSourceAttachedNote = await page.evaluate((expectedText) => {
    const selectedWorkbench = document.querySelector('[aria-label="Selected note workbench"]')
    const noteText = document.querySelector(
      '.recall-note-workbench-editor-stage872 textarea, .recall-note-workbench-editor textarea',
    )
    const sourceContext = document.querySelector('[data-notebook-source-context-panel="true"]')
    const selectedText = selectedWorkbench?.textContent ?? ''
    return (
      sourceContext instanceof HTMLElement &&
      noteText instanceof HTMLTextAreaElement &&
      noteText.value === expectedText &&
      !selectedText.includes('Source note for ') &&
      !selectedText.includes('Manual note attached to ')
    )
  }, draftText)
  if (!sourceOverviewNewNoteCreatesSourceAttachedNote) {
    throw new Error(`${stageLabel} expected Source overview New note to create a source-attached Notebook note.`)
  }

  await selectedWorkbench.getByRole('button', { name: 'Open source' }).first().click()
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await sourceMemoryPanel.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(300)

  const overviewMetrics = await readSourceOverviewMemoryMetrics(page, draftText)
  if (
    !overviewMetrics.sourceOverviewPersonalNotesPanelVisible ||
    !overviewMetrics.sourceOverviewPersonalNotesUsesBodyPreview ||
    !overviewMetrics.sourceOverviewPersonalNotesSyntheticAnchorHidden
  ) {
    throw new Error(`${stageLabel} expected Source overview memory to use body previews without synthetic anchors.`)
  }

  const sourceOverviewMemoryCapture = await captureLocatorScreenshot(
    page,
    sourceMemoryPanel,
    directory,
    `${stagePrefix}-source-overview-memory-panel.png`,
  )

  let sourceOverviewGraphMemoryItemOpensFocusedGraph = false
  const graphMemoryButton = sourceMemoryPanel.locator('[data-source-overview-graph-memory-open-stage906="true"]').first()
  if (await graphMemoryButton.isVisible().catch(() => false)) {
    await graphMemoryButton.click()
    await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Graph', selected: true }).waitFor({ state: 'visible', timeout: 20000 })
    await page.waitForTimeout(300)
    sourceOverviewGraphMemoryItemOpensFocusedGraph = true
    await openSourceWorkspaceDestination(page, 'Overview')
    await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
    await sourceMemoryPanel.waitFor({ state: 'visible', timeout: 20000 })
  }

  let sourceOverviewStudyMemoryItemOpensFocusedStudy = false
  const studyMemoryButton = sourceMemoryPanel.locator('[data-source-overview-study-memory-open-stage906="true"]').first()
  if (await studyMemoryButton.isVisible().catch(() => false)) {
    await studyMemoryButton.click()
    await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Study', selected: true }).waitFor({ state: 'visible', timeout: 20000 })
    await page.waitForTimeout(300)
    sourceOverviewStudyMemoryItemOpensFocusedStudy = true
    await openSourceWorkspaceDestination(page, 'Overview')
    await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
    await sourceMemoryPanel.waitFor({ state: 'visible', timeout: 20000 })
  }

  await sourceMemoryPanel.locator('[data-source-overview-memory-open-notebook-stage900="true"]').first().click()
  await selectedWorkbench.waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('[data-notebook-source-context-panel="true"]').first().waitFor({ state: 'visible', timeout: 20000 })
  const openNotebookMetrics = await readSourceOverviewOpenedNotebookMetrics(page, draftText)
  if (!openNotebookMetrics.sourceOverviewPersonalNotesOpensEmbeddedNotebook) {
    throw new Error(`${stageLabel} expected Source overview memory to reopen embedded Notebook with the selected source note.`)
  }
  const sourceOverviewNotebookCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-source-overview-memory-opens-notebook.png`,
  )

  await selectedWorkbench.getByRole('button', { name: 'Open source' }).first().click()
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await sourceMemoryPanel.waitFor({ state: 'visible', timeout: 20000 })
  await sourceMemoryPanel.locator('[data-source-overview-memory-reader-stage900="true"]').first().click()
  await page.waitForURL(/\/reader(?:\?|$)/, { timeout: 12000 })
  const handoffUrl = new URL(page.url())
  const sourceOverviewPersonalNotesReaderHandoffUnanchored =
    handoffUrl.pathname === '/reader' &&
    Boolean(handoffUrl.searchParams.get('document')) &&
    !handoffUrl.searchParams.has('sentenceStart') &&
    !handoffUrl.searchParams.has('sentenceEnd')
  const sourceOverviewSourceNoteReaderHandoffUnanchored = sourceOverviewPersonalNotesReaderHandoffUnanchored
  if (!sourceOverviewPersonalNotesReaderHandoffUnanchored) {
    throw new Error(`${stageLabel} expected Source overview source-note Reader handoff to omit sentence anchors.`)
  }

  await page
    .locator(
      '.source-workspace-meta-action[aria-label="Open nearby notebook notes"], [aria-label="Open Notebook notes from short document completion"]',
    )
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
    .catch(() => undefined)
  const readerSourceMemoryCountMetrics = await readReaderSourceMemoryCountMetrics(page)
  if (!readerSourceMemoryCountMetrics.readerSourceMemoryCountsActionable) {
    throw new Error(`${stageLabel} expected Reader source memory note, graph, and study counts to be actionable.`)
  }

  const readerUrl = page.url()
  await page.getByRole('button', { name: 'Open source graph memory' }).first().click()
  await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Graph', selected: true }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(300)
  const readerSourceGraphCountOpensFocusedGraph = true
  if (!readerSourceGraphCountOpensFocusedGraph) {
    throw new Error(`${stageLabel} expected Reader graph memory count to open focused Graph.`)
  }

  await page.goto(readerUrl, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Open source study memory' }).first().waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('button', { name: 'Open source study memory' }).first().click()
  await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Study', selected: true }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(300)
  const readerSourceStudyCountOpensFocusedStudy = true
  if (!readerSourceStudyCountOpensFocusedStudy) {
    throw new Error(`${stageLabel} expected Reader study memory count to open focused Study.`)
  }

  await page.goto(readerUrl, { waitUntil: 'networkidle' })
  await page
    .locator(
      '.source-workspace-meta-action[aria-label="Open nearby notebook notes"], [aria-label="Open Notebook notes from short document completion"]',
    )
    .first()
    .waitFor({ state: 'visible', timeout: 20000 })
    .catch(() => undefined)
  const readerSourceNotebookContinuityVisible = await readReaderSourceNotebookContinuityVisible(page)
  if (!readerSourceNotebookContinuityVisible) {
    throw new Error(`${stageLabel} expected Reader source workspace to expose nearby Notebook/source-memory continuity.`)
  }
  const nearbyNotebookButton = page.getByRole('button', { name: 'Open nearby notebook notes' }).first()
  if (await nearbyNotebookButton.isVisible().catch(() => false)) {
    await nearbyNotebookButton.click()
    await selectedWorkbench.waitFor({ state: 'visible', timeout: 20000 })
  } else {
    await page.getByRole('button', { name: 'Open Notebook notes from short document completion' }).first().click()
    await page.getByRole('heading', { name: 'Notebook', level: 3 }).waitFor({ state: 'visible', timeout: 20000 })
    await page.locator('[data-reader-source-notebook-continuity-stage900="true"]').first().click()
    await selectedWorkbench.waitFor({ state: 'visible', timeout: 20000 })
  }
  await page.locator('[data-notebook-source-context-panel="true"]').first().waitFor({ state: 'visible', timeout: 20000 })
  const readerContinuityMetrics = await readReaderSourceNotebookContinuityMetrics(page, draftText)
  if (!readerContinuityMetrics.readerSourceNotebookContinuityOpensEmbeddedNotebook) {
    throw new Error(`${stageLabel} expected Reader Notebook continuity to open embedded Notebook on the source note.`)
  }
  const readerContinuityCapture = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-reader-source-notebook-continuity.png`,
  )

  return {
    captures: {
      readerContinuityCapture,
      sourceOverviewMemoryCapture,
      sourceOverviewNotebookCapture,
    },
    metrics: {
      ...overviewMetrics,
      ...openNotebookMetrics,
      ...readerContinuityMetrics,
      ...readerSourceMemoryCountMetrics,
      readerSourceNotebookContinuityVisible,
      readerSourceGraphCountOpensFocusedGraph,
      readerSourceStudyCountOpensFocusedStudy,
      sourceOverviewGraphMemoryItemOpensFocusedGraph,
      sourceOverviewStudyMemoryItemOpensFocusedStudy,
      sourceOverviewNewNoteCreatesSourceAttachedNote,
      sourceOverviewPersonalNotesReaderHandoffUnanchored,
      sourceOverviewSourceNoteReaderHandoffUnanchored,
    },
  }
}

export async function captureSourceNotePromotionEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  return withStageHarnessNoteCleanup(
    {
      baseUrl,
      directory,
      page,
      stageLabel,
      stagePrefix,
    },
    captureSourceNotePromotionEvidenceImpl,
  )
}

async function captureSourceNotePromotionEvidenceImpl({
  baseUrl,
  directory,
  harnessNoteTracker,
  page,
  stageLabel,
  stagePrefix,
}) {
  const response = await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Home navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  const homeNewNoteButton = page.getByRole('button', { name: 'New note' }).first()
  await homeNewNoteButton.waitFor({ state: 'visible', timeout: 20000 })
  await homeNewNoteButton.click()

  const commandRow = page.getByRole('region', { name: 'Notebook command row' }).first()
  const draftRegion = page.getByRole('region', { name: 'New note draft' }).first()
  await Promise.all([
    commandRow.waitFor({ state: 'visible', timeout: 20000 }),
    draftRegion.waitFor({ state: 'visible', timeout: 20000 }),
  ])

  const noteBody = `Stage ${stagePrefix} source note insight ${Date.now()}. Body evidence stays personal.`
  const expectedGraphLabel = noteBody.match(/^(.+?[.!?])(?:\s|$)/)?.[1] ?? noteBody
  await draftRegion.getByRole('textbox', { name: 'New note text' }).fill(noteBody)
  await draftRegion.getByRole('button', { name: 'Save note' }).click()
  await page.getByRole('region', { name: 'Selected note workbench' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('[data-notebook-source-context-panel="true"]').first().waitFor({ state: 'visible', timeout: 20000 })
  await trackStageHarnessCreatedNote({
    baseUrl,
    bodyText: noteBody,
    context: `${stagePrefix}:source-note-promotion`,
    tracker: harnessNoteTracker,
  })

  const promotionCard = page.locator('.recall-note-promote-inline-stage872').first()
  await promotionCard.waitFor({ state: 'visible', timeout: 12000 })
  await promotionCard.getByRole('tab', { name: 'Promote to Graph' }).click()
  const graphLabelInput = promotionCard.getByRole('textbox', { name: 'Graph label' })
  const graphDescriptionInput = promotionCard.getByRole('textbox', { name: 'Graph description' })
  await graphLabelInput.waitFor({ state: 'visible', timeout: 12000 })
  const graphLabelDefault = await graphLabelInput.inputValue()
  const graphDescriptionDefault = await graphDescriptionInput.inputValue()
  if (graphLabelDefault !== expectedGraphLabel || graphDescriptionDefault !== noteBody) {
    throw new Error(
      `${stageLabel} expected source-note Graph defaults to be "${expectedGraphLabel}" / body text, got "${graphLabelDefault}" / "${graphDescriptionDefault}".`,
    )
  }

  const defaultMetrics = await readSourceNotePromotionDefaultMetrics(page, {
    expectedGraphLabel,
    noteBody,
  })
  if (!defaultMetrics.notebookSourceNoteGraphDefaultUsesBody) {
    throw new Error(`${stageLabel} expected source-note Graph defaults to use note body, not synthetic anchor text.`)
  }

  const graphPromotionResponsePromise = page.waitForResponse(
    (response) => response.url().includes('/promote/graph-node') && response.request().method() === 'POST',
    { timeout: 12000 },
  )
  await promotionCard.getByRole('button', { name: 'Promote node' }).click()
  const graphPromotionResponse = await graphPromotionResponsePromise
  if (!graphPromotionResponse.ok()) {
    throw new Error(`${stageLabel} source-note Graph promotion request failed with ${graphPromotionResponse.status()}.`)
  }
  await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Graph', selected: true }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByText(expectedGraphLabel, { exact: false }).first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(900)
  const graphMetrics = await readSourceNoteGraphEvidenceMetrics(page, noteBody)
  if (!graphMetrics.graphSourceNoteEvidenceUsesBodyPreview) {
    throw new Error(`${stageLabel} expected promoted Graph evidence to show source-note body preview.`)
  }
  if (!graphMetrics.sourceNotePromotionSyntheticAnchorHidden) {
    throw new Error(`${stageLabel} expected promoted Graph evidence to hide synthetic source-note anchors.`)
  }

  const graphCapture = await captureViewportScreenshot(page, directory, `${stagePrefix}-source-note-graph-promotion.png`)

  await page.goto(`${baseUrl}/recall?section=notes`, { waitUntil: 'networkidle' })
  await page.getByRole('region', { name: 'Selected note workbench' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('[data-notebook-source-context-panel="true"]').first().waitFor({ state: 'visible', timeout: 20000 })
  const studyPromotionCard = page.locator('.recall-note-promote-inline-stage872').first()
  await studyPromotionCard.getByRole('tab', { name: 'Create Study Card' }).click()
  const studyPromptInput = studyPromotionCard.getByRole('textbox', { name: 'Study prompt' })
  const studyAnswerInput = studyPromotionCard.getByRole('textbox', { name: 'Study answer' })
  await studyPromptInput.waitFor({ state: 'visible', timeout: 12000 })
  const studyPromptDefault = await studyPromptInput.inputValue()
  const studyAnswerDefault = await studyAnswerInput.inputValue()
  if (studyPromptDefault !== 'What should you remember from this source note?' || studyAnswerDefault !== noteBody) {
    throw new Error(
      `${stageLabel} expected source-note Study defaults to use source-note prompt and body, got "${studyPromptDefault}" / "${studyAnswerDefault}".`,
    )
  }
  const studyDefaultMetrics = await readSourceNoteStudyDefaultMetrics(page, noteBody)
  if (!studyDefaultMetrics.notebookSourceNoteStudyDefaultUsesBody) {
    throw new Error(`${stageLabel} expected source-note Study defaults to use the source-note prompt and body answer.`)
  }

  const studyPromotionResponsePromise = page.waitForResponse(
    (response) => response.url().includes('/promote/study-card') && response.request().method() === 'POST',
    { timeout: 12000 },
  )
  await studyPromotionCard.getByRole('button', { name: 'Create card' }).click()
  const studyPromotionResponse = await studyPromotionResponsePromise
  if (!studyPromotionResponse.ok()) {
    throw new Error(`${stageLabel} source-note Study promotion request failed with ${studyPromotionResponse.status()}.`)
  }
  await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Study', selected: true }).waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Home' }).click()
  await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Home', selected: true }).waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Study' }).click()
  await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Study', selected: true }).waitFor({ state: 'visible', timeout: 20000 })
  const evidenceSupport = page.getByRole('region', { name: 'Study evidence support' }).first()
  await evidenceSupport.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(900)
  const studyMetrics = await readSourceNoteStudyEvidenceMetrics(page, noteBody)
  if (!studyMetrics.studySourceNoteEvidenceUsesBodyPreview) {
    throw new Error(`${stageLabel} expected promoted Study evidence to show source-note body preview.`)
  }

  const studyCapture = await captureViewportScreenshot(page, directory, `${stagePrefix}-source-note-study-promotion.png`)

  await evidenceSupport.getByRole('button', { name: /Open .* in Reader/ }).first().click()
  await page.waitForURL(/\/reader(?:\?|$)/, { timeout: 12000 })
  const handoffUrl = new URL(page.url())
  const studySourceNoteReaderHandoffUnanchored =
    handoffUrl.pathname === '/reader' &&
    Boolean(handoffUrl.searchParams.get('document')) &&
    !handoffUrl.searchParams.has('sentenceStart') &&
    !handoffUrl.searchParams.has('sentenceEnd')
  if (!studySourceNoteReaderHandoffUnanchored) {
    throw new Error(`${stageLabel} expected source-note Study evidence Reader handoff to omit sentence anchors.`)
  }

  await page.goto(`${baseUrl}/recall?section=notes`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Notebook', exact: true }).waitFor({ state: 'visible', timeout: 20000 })
  await selectSentenceAnchoredNotebookRow(page, stageLabel, baseUrl)
  const sentencePromotionCard = page.locator('.recall-note-promote-inline-stage872').first()
  await sentencePromotionCard.getByRole('tab', { name: 'Promote to Graph' }).click()
  const sentenceGraphLabelInput = sentencePromotionCard.getByRole('textbox', { name: 'Graph label' })
  const sentenceGraphDescriptionInput = sentencePromotionCard.getByRole('textbox', { name: 'Graph description' })
  await sentenceGraphLabelInput.waitFor({ state: 'visible', timeout: 12000 })
  const sentenceGraphLabelDefault = await sentenceGraphLabelInput.inputValue()
  const sentenceGraphDescriptionDefault = await sentenceGraphDescriptionInput.inputValue()
  await sentencePromotionCard.getByRole('tab', { name: 'Create Study Card' }).click()
  const sentenceStudyPromptInput = sentencePromotionCard.getByRole('textbox', { name: 'Study prompt' })
  const sentenceStudyAnswerInput = sentencePromotionCard.getByRole('textbox', { name: 'Study answer' })
  await sentenceStudyPromptInput.waitFor({ state: 'visible', timeout: 12000 })
  const sentenceStudyPromptDefault = await sentenceStudyPromptInput.inputValue()
  const sentenceStudyAnswerDefault = await sentenceStudyAnswerInput.inputValue()
  const sentenceMetrics = await readSentenceNotePromotionDefaultMetrics(page, {
    sentenceGraphDescriptionDefault,
    sentenceGraphLabelDefault,
    sentenceStudyAnswerDefault,
    sentenceStudyPromptDefault,
  })
  if (!sentenceMetrics.sentenceNotePromotionDefaultsStable) {
    throw new Error(`${stageLabel} expected sentence-note promotion defaults and highlight panel to remain stable.`)
  }

  const sentenceCapture = await captureViewportScreenshot(page, directory, `${stagePrefix}-sentence-note-promotion-stability.png`)

  return {
    captures: {
      graphCapture,
      sentenceCapture,
      studyCapture,
    },
    metrics: {
      ...defaultMetrics,
      ...graphMetrics,
      ...studyDefaultMetrics,
      ...studyMetrics,
      ...sentenceMetrics,
      notebookSourceNoteGraphDefaultLabel: graphLabelDefault,
      notebookSourceNoteGraphDefaultDescription: graphDescriptionDefault,
      notebookSourceNoteStudyDefaultAnswer: studyAnswerDefault,
      notebookSourceNoteStudyDefaultPrompt: studyPromptDefault,
      studySourceNoteReaderHandoffUnanchored,
    },
  }
}

async function readSourceNotePromotionDefaultMetrics(page, expected) {
  return page.evaluate(({ expectedGraphLabel, noteBody }) => {
    const selectedWorkbench = document.querySelector('[aria-label="Selected note workbench"]')
    const selectedText = selectedWorkbench?.textContent ?? ''
    const graphLabel = selectedWorkbench?.querySelector('input')?.value ?? ''
    const graphDescription = selectedWorkbench?.querySelector('textarea')?.value ?? ''
    const sourceContextPanel = document.querySelector('[data-notebook-source-context-panel="true"]')
    const highlightedPassageVisible = [...(selectedWorkbench?.querySelectorAll('h3') ?? [])].some(
      (heading) => heading.textContent?.replace(/\s+/g, ' ').trim() === 'Highlighted passage',
    )
    const syntheticVisible = selectedText.includes('Source note for ') || selectedText.includes('Manual note attached to ')

    return {
      notebookSourceNoteGraphDefaultUsesBody:
        graphLabel === expectedGraphLabel &&
        graphDescription === noteBody &&
        sourceContextPanel instanceof HTMLElement &&
        !highlightedPassageVisible &&
        !syntheticVisible,
      sourceNotePromotionSyntheticAnchorHidden: !syntheticVisible,
    }
  }, expected)
}

async function readSourceNoteStudyDefaultMetrics(page, noteBody) {
  return page.evaluate((expectedBody) => {
    const selectedWorkbench = document.querySelector('[aria-label="Selected note workbench"]')
    const selectedText = selectedWorkbench?.textContent ?? ''
    const fields = [...(selectedWorkbench?.querySelectorAll('textarea') ?? [])]
      .filter((field) => field instanceof HTMLTextAreaElement)
      .map((field) => field.value)
    const syntheticVisible = selectedText.includes('Source note for ') || selectedText.includes('Manual note attached to ')

    return {
      notebookSourceNoteStudyDefaultUsesBody:
        fields.includes('What should you remember from this source note?') &&
        fields.includes(expectedBody) &&
        !syntheticVisible,
      sourceNotePromotionSyntheticAnchorHidden: !syntheticVisible,
    }
  }, noteBody)
}

async function readSourceNoteGraphEvidenceMetrics(page, noteBody) {
  return page.evaluate((expectedBody) => {
    const text = document.body.textContent ?? ''
    const syntheticVisible = text.includes('Source note for ') || text.includes('Manual note attached to ')

    return {
      graphSourceNoteEvidenceUsesBodyPreview:
        text.includes(expectedBody) && text.includes('Source note') && text.includes('Personal note'),
      sourceNotePromotionSyntheticAnchorHidden: !syntheticVisible,
    }
  }, noteBody)
}

async function readSourceNoteStudyEvidenceMetrics(page, noteBody) {
  return page.evaluate((expectedBody) => {
    const text = document.body.textContent ?? ''
    const syntheticVisible = text.includes('Source note for ') || text.includes('Manual note attached to ')

    return {
      sourceNotePromotionSyntheticAnchorHidden: !syntheticVisible,
      studySourceNoteEvidenceUsesBodyPreview:
        text.includes(expectedBody) && text.includes('Source note') && text.includes('Personal note'),
    }
  }, noteBody)
}

async function readSentenceNotePromotionDefaultMetrics(page, defaults) {
  return page.evaluate(
    ({ sentenceGraphDescriptionDefault, sentenceGraphLabelDefault, sentenceStudyAnswerDefault, sentenceStudyPromptDefault }) => {
      const selectedWorkbench = document.querySelector('[aria-label="Selected note workbench"]')
      const selectedText = selectedWorkbench?.textContent ?? ''
      const highlightPanel = document.querySelector('[data-notebook-highlight-panel="true"]')
      const sourceContextPanel = document.querySelector('[data-notebook-source-context-panel="true"]')
      const highlightedPassageVisible = [...(selectedWorkbench?.querySelectorAll('h3') ?? [])].some(
        (heading) => heading.textContent?.replace(/\s+/g, ' ').trim() === 'Highlighted passage',
      )

      return {
        notebookSentenceAnchorHighlightPanelStable:
          highlightPanel instanceof HTMLElement &&
          !(sourceContextPanel instanceof HTMLElement) &&
          highlightedPassageVisible &&
          /anchored sentence(s)?/i.test(selectedText),
        sentenceNotePromotionDefaultsStable:
          Boolean(sentenceGraphLabelDefault) &&
          Boolean(sentenceStudyAnswerDefault) &&
          sentenceGraphLabelDefault === sentenceStudyAnswerDefault &&
          !sentenceGraphLabelDefault.includes('personal note') &&
          Boolean(sentenceGraphDescriptionDefault || sentenceStudyPromptDefault),
      }
    },
    defaults,
  )
}

async function readNotebookWorkbenchMetrics(page, measured) {
  return page.evaluate(({ commandRowHeight, commandRowTop, workbenchHeight, workbenchTop }) => {
    const isVisible = (selector) => {
      const element = document.querySelector(selector)
      if (!(element instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(element)
      const box = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1
    }

    const commandRow = document.querySelector('.recall-notes-command-row-stage872')
    const sourceField = commandRow?.querySelector('select')
    const searchField = commandRow?.querySelector('input[type="search"]')
    const fusedWorkbench = document.querySelector('[data-note-workbench-layout="fused"]')
    const noteText = document.querySelector(
      '.recall-note-workbench-editor-stage872 textarea, .recall-note-workbench-editor textarea',
    )
    const sourceInline = document.querySelector('.recall-note-source-handoff-inline-stage872')
    const promoteInline = document.querySelector('.recall-note-promote-inline-stage872')
    const selectedDetail = document.querySelector('.recall-note-detail-stage886')
    const flatWorkbenchPaneCount = document.querySelectorAll('.recall-note-workbench-pane-flat-stage886').length
    const nestedWorkbenchPanelCount = [...document.querySelectorAll(
      '[data-note-workbench-layout="fused"] > .recall-note-workbench-preview, [data-note-workbench-layout="fused"] > .recall-note-workbench-editor',
    )].filter(
      (element) =>
        element instanceof HTMLElement &&
        !element.classList.contains('recall-note-workbench-pane-flat-stage886'),
    ).length
    const sourceSeam = document.querySelector('.recall-note-source-handoff-action-seam-stage886')
    const promoteSeam = document.querySelector('.recall-note-promote-action-seam-stage886')
    const selectedWorkbench = document.querySelector('[aria-label="Selected note workbench"]')
    const selectedWorkbenchText = selectedWorkbench?.textContent ?? ''
    const selectedHeadings = [...(selectedWorkbench?.querySelectorAll('h3') ?? [])].map((heading) =>
      heading.textContent?.replace(/\s+/g, ' ').trim(),
    )
    const sourceContextPanel = document.querySelector('[data-notebook-source-context-panel="true"]')
    const highlightPanel = document.querySelector('[data-notebook-highlight-panel="true"]')
    const sourceContextPanelVisible = isVisible('[data-notebook-source-context-panel="true"]')
    const highlightedPassageVisible = selectedHeadings.includes('Highlighted passage')
    const sourceSyntheticHighlightVisible =
      sourceContextPanel instanceof HTMLElement &&
      (selectedWorkbenchText.includes('Source note for ') ||
        selectedWorkbenchText.includes('Manual note attached to '))
    const browseRail = document.querySelector('.recall-notes-browser-card-stage888')
    const browseHeader = document.querySelector('.recall-notes-browser-toolbar-stage888')
    const browseList = document.querySelector('.recall-notes-browser-list-stage888')
    const activeBrowseRow = document.querySelector('.recall-note-browser-row-active-stage888')
    const activeBrowseTimestamp = activeBrowseRow?.querySelector('.recall-document-meta')
    const activeBrowseRowStyle =
      activeBrowseRow instanceof HTMLElement ? window.getComputedStyle(activeBrowseRow) : null
    const activeBrowseTimestampStyle =
      activeBrowseTimestamp instanceof HTMLElement ? window.getComputedStyle(activeBrowseTimestamp) : null
    const browseHeaderBox = browseHeader instanceof HTMLElement ? browseHeader.getBoundingClientRect() : null
    const activeBrowseTimestampBox =
      activeBrowseTimestamp instanceof HTMLElement ? activeBrowseTimestamp.getBoundingClientRect() : null

    return {
      notebookBrowseActiveRowPanelChromeVisible:
        activeBrowseRowStyle == null ||
        (activeBrowseRowStyle.boxShadow !== 'none' && activeBrowseRowStyle.boxShadow !== '') ||
        Number.parseFloat(activeBrowseRowStyle.borderTopWidth) > 0.5 ||
        Number.parseFloat(activeBrowseRowStyle.borderRightWidth) > 0.5 ||
        Number.parseFloat(activeBrowseRowStyle.borderBottomWidth) > 0.5,
      notebookBrowseActiveRowTimestampInline:
        activeBrowseTimestamp instanceof HTMLElement &&
        activeBrowseTimestampStyle?.position === 'static' &&
        Number.parseFloat(activeBrowseTimestampStyle.fontSize) <= 12 &&
        (activeBrowseTimestampBox?.height ?? 99) <= 18,
      notebookBrowsePanelChromeVisible: isVisible('.recall-notes-browser-glance'),
      notebookBrowseRailHeaderCompact: Boolean(browseHeaderBox) && browseHeaderBox.height <= 46,
      notebookBrowseRailListFirst:
        browseRail instanceof HTMLElement &&
        browseList instanceof HTMLElement &&
        activeBrowseRow instanceof HTMLElement &&
        !isVisible('.recall-notes-browser-glance'),
      notebookCommandRowCompact: Boolean(commandRow) && commandRowHeight <= 104,
      notebookCommandRowHeight: commandRowHeight,
      notebookCommandRowSearchVisible: sourceField instanceof HTMLElement && searchField instanceof HTMLElement,
      notebookDetachedPromoteCardVisible: isVisible('.recall-note-promotion-card'),
      notebookDetachedSourceHandoffCardVisible: isVisible('.recall-note-dock-card'),
      notebookEditorSingleSurface:
        fusedWorkbench instanceof HTMLElement &&
        noteText instanceof HTMLElement &&
        sourceInline instanceof HTMLElement &&
        promoteInline instanceof HTMLElement &&
        flatWorkbenchPaneCount >= 2,
      notebookNoteDetailIntroVisible: isVisible('.recall-note-detail-stage886 .recall-note-detail-toolbar-stage698'),
      notebookPromoteActionsInlineVisible: promoteInline instanceof HTMLElement,
      notebookPromoteActionSeamCompact:
        promoteSeam instanceof HTMLElement && promoteSeam.classList.contains('recall-note-action-seam-stage886'),
      notebookSelectedNoteLeadBandFused:
        commandRow instanceof HTMLElement &&
        commandRow.classList.contains('recall-notes-command-row-stage886') &&
        commandRow.getAttribute('data-notebook-selected-note-lead-band') === 'fused' &&
        selectedDetail instanceof HTMLElement,
      notebookSelectedWorkbenchHeight: workbenchHeight,
      notebookSelectedWorkbenchTopOffset: workbenchTop,
      notebookSentenceAnchorHighlightPanelStable:
        highlightPanel instanceof HTMLElement &&
        highlightedPassageVisible &&
        /anchored sentence(s)?/i.test(selectedWorkbenchText),
      notebookSourceAnchorContextPanelVisible: sourceContextPanelVisible,
      notebookSourceAnchorHighlightedPassageVisible: sourceContextPanelVisible && highlightedPassageVisible,
      notebookSourceAnchorSyntheticHighlightVisible: sourceSyntheticHighlightVisible,
      notebookSourceHandoffInlineVisible: sourceInline instanceof HTMLElement,
      notebookSourceHandoffActionSeamCompact:
        sourceSeam instanceof HTMLElement && sourceSeam.classList.contains('recall-note-action-seam-stage886'),
      notebookTopHeroVisible: isVisible('.recall-notes-stage-shell'),
      notebookWorkbenchNestedPanelCount: nestedWorkbenchPanelCount,
      notebookWorkbenchTopBandGap: Math.max(0, workbenchTop - (commandRowTop + commandRowHeight)),
    }
  }, measured)
}

async function readHomePersonalNoteLaneMetrics(page, draftText) {
  return page.evaluate((expectedText) => {
    const isVisible = (selector) => {
      const element = document.querySelector(selector)
      if (!(element instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(element)
      const box = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1
    }

    const lane = document.querySelector('[data-home-personal-note-lane="true"]')
    const laneText = lane?.textContent ?? ''
    const bodyPreview = lane?.querySelector('[data-home-personal-note-preview="body"]')?.textContent ?? ''
    const syntheticAnchorVisible =
      laneText.includes('Source note for ') || laneText.includes('Manual note attached to ')

    return {
      homeNewNoteSavedAppearsInLibrary: laneText.includes(expectedText),
      homePersonalNoteLaneVisible: isVisible('[data-home-personal-note-lane="true"]'),
      homePersonalNoteSearchResultVisible: isVisible('[data-home-personal-note-item="search-result"]'),
      homePersonalNoteSyntheticAnchorHidden: !syntheticAnchorVisible,
      homePersonalNoteUsesBodyPreview: bodyPreview.includes(expectedText),
    }
  }, draftText)
}

async function readHomePersonalNotesSourceBoardMetrics(page) {
  return page.evaluate(() => {
    const isVisibleElement = (element) => {
      if (!(element instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(element)
      const box = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1
    }

    const sourceCards = [...document.querySelectorAll('.recall-home-parity-card-stage563')].filter(isVisibleElement)
    const noteBoardVisible = isVisibleElement(document.querySelector('[data-home-personal-notes-board-stage898="true"]'))
    const grid = document.querySelector('.recall-home-parity-grid-stage615')
    const gridColumns =
      grid instanceof HTMLElement
        ? window
            .getComputedStyle(grid)
            .gridTemplateColumns.split(' ')
            .filter((column) => column.trim().length > 0).length
        : 0

    return {
      homeOpenOverviewDensityPreserved: gridColumns >= 4,
      homeSourceCardBoardPreserved: sourceCards.length > 0 && !noteBoardVisible,
    }
  })
}

async function openHomeMemoryFilterControls(page) {
  const trigger = page.getByRole('button', { name: /Sort Home sources/i }).first()
  await trigger.waitFor({ state: 'visible', timeout: 12000 })
  await trigger.click()
  const group = page.getByRole('group', { name: 'Memory filter' }).first()
  await group.waitFor({ state: 'visible', timeout: 12000 })
  return group.evaluate((element) => {
    if (!(element instanceof HTMLElement)) {
      return false
    }
    const labels = [...element.querySelectorAll('button')]
      .map((button) => button.textContent?.trim())
      .filter(Boolean)
    const style = window.getComputedStyle(element)
    const box = element.getBoundingClientRect()
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      box.width > 1 &&
      box.height > 1 &&
      ['All', 'Any', 'Notes', 'Graph', 'Study'].every((label) => labels.includes(label))
    )
  })
}

async function openHomeOrganizerSearchField(page) {
  const searchField = page.getByRole('searchbox', { name: 'Filter saved sources' }).first()
  if (await searchField.isVisible().catch(() => false)) {
    return searchField
  }

  const organizerOptions = page.getByRole('button', { name: 'Organizer options' }).first()
  if (await organizerOptions.isVisible().catch(() => false)) {
    await organizerOptions.click()
  }
  await searchField.waitFor({ state: 'visible', timeout: 12000 })
  return searchField
}

async function selectHomeMemoryFilterOption(page, label) {
  const groupVisible = await page.getByRole('group', { name: 'Memory filter' }).first().isVisible().catch(() => false)
  if (!groupVisible) {
    await openHomeMemoryFilterControls(page)
  }
  const group = page.getByRole('group', { name: 'Memory filter' }).first()
  await group.getByRole('button', { name: label }).click()
  await page.waitForTimeout(500)
}

async function waitForHomeMemoryFilter(page, expectedFilter) {
  await page.waitForFunction((filter) => {
    const canvas = document.querySelector(
      '.recall-home-parity-canvas-stage563[data-home-memory-filter-active-stage910]',
    )
    return canvas?.getAttribute('data-home-memory-filter-active-stage910') === filter
  }, expectedFilter)
}

async function readHomeMemoryFilterMetrics(page) {
  return page.evaluate(() => {
    const isVisibleElement = (element) => {
      if (!(element instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(element)
      const box = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1
    }
    const visibleElements = (selector) => [...document.querySelectorAll(selector)].filter(isVisibleElement)
    const canvas = document.querySelector(
      '.recall-home-parity-canvas-stage563[data-home-memory-filter-active-stage910]',
    )
    const activeFilter = canvas?.getAttribute('data-home-memory-filter-active-stage910') ?? null
    const visibleCount = Number(canvas?.getAttribute('data-home-memory-filter-visible-count-stage910') ?? '0')
    const controls = document.querySelector('[data-home-memory-filter-controls-stage910="true"]')
    const controlLabels = [...(controls?.querySelectorAll('button') ?? [])]
      .map((button) => button.textContent?.trim())
      .filter(Boolean)
    const signals = visibleElements('[data-home-source-memory-signal-stage908="true"]')
    const cardSignals = visibleElements(
      '[data-home-source-memory-signal-stage908="true"][data-home-source-memory-signal-surface-stage908="card"]',
    )
    const sourceCards = visibleElements('.recall-home-parity-card-stage563')
    const sourceRows = visibleElements('.recall-home-parity-list-row-stage563')
    const personalNoteBoard = document.querySelector('[data-home-personal-notes-board-stage898="true"]')
    const personalNoteBoardItems = visibleElements('[data-home-personal-note-board-item-stage898="true"]')
    const sourceOwnedSignalsHave = (attribute) =>
      signals.length > 0 && signals.every((signal) => Number(signal.getAttribute(attribute) ?? '0') > 0)
    const matchesHeadingVisible = [...document.querySelectorAll('h3')].some(
      (heading) => heading.textContent?.trim() === 'Matches' && isVisibleElement(heading),
    )

    return {
      homeMemoryFilterActiveValue: activeFilter,
      homeMemoryFilterAnyUsesSourceOwnedCounts:
        activeFilter === 'any' &&
        visibleCount > 0 &&
        signals.length > 0 &&
        signals.length >= sourceCards.length + sourceRows.length,
      homeMemoryFilterControlsVisible:
        isVisibleElement(controls) &&
        ['All', 'Any', 'Notes', 'Graph', 'Study'].every((label) => controlLabels.includes(label)),
      homeMemoryFilterEmptyStateClearVisible: isVisibleElement(
        document.querySelector('[data-home-memory-filter-clear-empty-stage910="true"]'),
      ),
      homeMemoryFilterMatchesSourceResults:
        matchesHeadingVisible && cardSignals.length > 0 && sourceCards.length > 0 && personalNoteBoardItems.length === 0,
      homeMemoryFilterPreservesPersonalNotesBoard:
        activeFilter !== 'all' &&
        isVisibleElement(personalNoteBoard) &&
        personalNoteBoardItems.length > 0 &&
        sourceCards.length === 0 &&
        sourceRows.length === 0,
      homeMemoryFilterSourceOwnedGraphOnly:
        activeFilter === 'graph' &&
        visibleCount > 0 &&
        sourceOwnedSignalsHave('data-home-source-memory-graph-count-stage908'),
      homeMemoryFilterSourceOwnedNotesOnly:
        activeFilter === 'notes' &&
        visibleCount > 0 &&
        sourceOwnedSignalsHave('data-home-source-memory-note-count-stage908'),
      homeMemoryFilterSourceOwnedStudyOnly:
        activeFilter === 'study' &&
        visibleCount > 0 &&
        sourceOwnedSignalsHave('data-home-source-memory-study-count-stage908'),
      homeMemoryFilterVisibleCount: visibleCount,
    }
  })
}

async function readHomeSourceMemorySignalMetrics(page, surface) {
  return page.evaluate((signalSurface) => {
    const isVisibleElement = (element) => {
      if (!(element instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(element)
      const box = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1
    }

    const signal = document.querySelector(
      `[data-home-source-memory-signal-stage908="true"][data-home-source-memory-signal-surface-stage908="${signalSurface}"]`,
    )
    const signalText = signal?.textContent ?? ''
    const noteCount = Number(signal?.getAttribute('data-home-source-memory-note-count-stage908') ?? '0')
    const graphCount = Number(signal?.getAttribute('data-home-source-memory-graph-count-stage908') ?? '0')
    const studyCount = Number(signal?.getAttribute('data-home-source-memory-study-count-stage908') ?? '0')
    const totalCount = Number(signal?.getAttribute('data-home-source-memory-total-stage908') ?? '0')
    const sourceCards = [...document.querySelectorAll('.recall-home-parity-card-stage563')].filter(isVisibleElement)
    const sourceRows = [...document.querySelectorAll('.recall-home-parity-list-row-stage563')].filter(isVisibleElement)
    const noteBoardItems = [...document.querySelectorAll('[data-home-personal-note-board-item-stage898="true"]')].filter(
      isVisibleElement,
    )
    const grid = document.querySelector('.recall-home-parity-grid-stage615')
    const gridColumns =
      grid instanceof HTMLElement
        ? window
            .getComputedStyle(grid)
            .gridTemplateColumns.split(' ')
            .filter((column) => column.trim().length > 0).length
        : 0
    const syntheticAnchorVisible =
      signalText.includes('Source note for ') || signalText.includes('Manual note attached to ')
    const countsSum = noteCount + graphCount + studyCount

    return {
      homeMatchesSourceMemorySignalVisible:
        isVisibleElement(signal) &&
        [...document.querySelectorAll('h3')].some((heading) => heading.textContent?.trim() === 'Matches'),
      homeSourceListRowsShowMemorySignal: signalSurface === 'list' && isVisibleElement(signal) && sourceRows.length > 0,
      homeSourceMemorySignalsDoNotMixBoardItems: noteBoardItems.length === 0 && (sourceCards.length > 0 || sourceRows.length > 0),
      homeSourceMemorySignalsPreservePreviewDensity: (gridColumns >= 1 && sourceCards.length > 0) || sourceRows.length > 0,
      homeSourceMemorySignalsUseSourceOwnedCounts:
        isVisibleElement(signal) &&
        totalCount === countsSum &&
        totalCount > 0 &&
        noteCount > 0 &&
        graphCount > 0 &&
        studyCount > 0 &&
        !syntheticAnchorVisible,
      homeSourceMemorySignalsVisible: isVisibleElement(signal),
    }
  }, surface)
}

async function readHomeReviewReadySignalMetrics(page, surface) {
  return page.evaluate((signalSurface) => {
    const isVisibleElement = (element) => {
      if (!(element instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(element)
      const box = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1
    }

    const signal = document.querySelector(
      `[data-home-review-ready-signal-stage916="true"][data-home-review-ready-signal-surface-stage916="${signalSurface}"]`,
    )
    const signalText = signal?.textContent ?? ''
    const dueCount = Number(signal?.getAttribute('data-home-review-ready-due-count-stage916') ?? '0')
    const newCount = Number(signal?.getAttribute('data-home-review-ready-new-count-stage916') ?? '0')
    const scheduledCount = Number(signal?.getAttribute('data-home-review-ready-scheduled-count-stage916') ?? '0')
    const totalCount = Number(signal?.getAttribute('data-home-review-ready-total-stage916') ?? '0')
    const sourceCards = [...document.querySelectorAll('.recall-home-parity-card-stage563')].filter(isVisibleElement)
    const sourceRows = [...document.querySelectorAll('.recall-home-parity-list-row-stage563')].filter(isVisibleElement)
    const noteBoardItems = [...document.querySelectorAll('[data-home-personal-note-board-item-stage898="true"]')].filter(
      isVisibleElement,
    )
    const syntheticAnchorVisible =
      signalText.includes('Source note for ') || signalText.includes('Manual note attached to ')
    const countSum = dueCount + newCount + scheduledCount

    return {
      homeReviewReadyMatchesSignalVisible:
        isVisibleElement(signal) &&
        [...document.querySelectorAll('h3')].some((heading) => heading.textContent?.trim() === 'Matches'),
      homeReviewReadySignalsDoNotMixBoardItems: noteBoardItems.length === 0 && (sourceCards.length > 0 || sourceRows.length > 0),
      homeReviewReadySignalsPreservePreviewDensity: sourceCards.length > 0 || sourceRows.length > 0,
      homeReviewReadySourceSignalsUseDueCounts:
        isVisibleElement(signal) &&
        totalCount === countSum &&
        totalCount > 0 &&
        signalText.includes('Review') &&
        signalText.includes('due') &&
        signalText.includes('new') &&
        !syntheticAnchorVisible,
      homeReviewReadySourceSignalsVisible: isVisibleElement(signal),
      homeSourceListRowsShowReviewReadySignal: signalSurface === 'list' && isVisibleElement(signal) && sourceRows.length > 0,
    }
  }, surface)
}

async function readStudyReviewDashboardMetrics(page) {
  return page.evaluate(() => {
    const isVisibleElement = (element) => {
      if (!(element instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(element)
      const box = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1
    }
    const dashboard = document.querySelector('[data-study-review-dashboard-stage916="true"]')
    const buckets = document.querySelector('[data-study-review-dashboard-buckets-stage916="true"]')
    const bucketText = buckets?.textContent ?? ''
    const sourceBreakdown = document.querySelector('[data-study-review-dashboard-source-breakdown-stage916="true"]')
    const sourceRows = [...document.querySelectorAll('[data-study-review-dashboard-source-row-stage916="true"]')].filter(
      isVisibleElement,
    )
    const rowHasReview = sourceRows.some((row) =>
      Boolean(row.querySelector('[data-study-review-dashboard-source-review-stage916="true"]')),
    )
    const rowHasQuestions = sourceRows.some((row) =>
      Boolean(row.querySelector('[data-study-review-dashboard-source-questions-stage916="true"]')),
    )

    return {
      studyReviewDashboardSourceBreakdownVisible:
        isVisibleElement(sourceBreakdown) && sourceRows.length > 0 && rowHasReview && rowHasQuestions,
      studyReviewDashboardUsesScheduleBuckets:
        isVisibleElement(buckets) &&
        ['Due now', 'This week', 'Upcoming', 'New', 'Reviewed', 'Total'].every((label) =>
          bucketText.includes(label),
        ),
      studyReviewDashboardVisible: isVisibleElement(dashboard),
    }
  })
}

async function openStudyScheduleBucket(page, drilldown) {
  const bucket = page.locator(`[data-study-schedule-bucket-stage918="${drilldown}"]`).first()
  await bucket.waitFor({ state: 'visible', timeout: 20000 })
  await bucket.click()
  await page.locator('[data-study-source-scoped-question-search-stage914="true"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  })
  await page
    .locator(`[data-study-schedule-filter-chip-stage918="true"][data-study-schedule-filter-value-stage918="${drilldown}"]`)
    .first()
    .waitFor({ state: 'visible', timeout: 12000 })
  await page.waitForTimeout(250)
  return readStudyScheduleDrilldownMetrics(page, drilldown)
}

async function openFirstStudyScheduleBucketWithVisibleRows(
  page,
  drilldowns = ['due-now', 'due-this-week', 'upcoming', 'new', 'reviewed'],
) {
  for (const drilldown of drilldowns) {
    const metrics = await openStudyScheduleBucket(page, drilldown)
    if (metrics.studyScheduleVisibleQuestionCount > 0) {
      return drilldown
    }
  }
  return null
}

async function readStudyScheduleDrilldownMetrics(page, expectedDrilldown = null) {
  return page.evaluate((expected) => {
    const isVisibleElement = (element) => {
      if (!(element instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(element)
      const box = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1
    }
    const drilldownSurface = document.querySelector('[data-study-schedule-bucket-drilldowns-stage918="true"]')
    const bucketButtons = [
      ...document.querySelectorAll('[data-study-schedule-bucket-stage918]'),
    ].filter(isVisibleElement)
    const visibleBucketValues = bucketButtons.map((button) =>
      button.getAttribute('data-study-schedule-bucket-stage918'),
    )
    const chip = document.querySelector('[data-study-schedule-filter-chip-stage918="true"]')
    const activeFilter = chip?.getAttribute('data-study-schedule-filter-value-stage918') ?? 'all'
    const questionsSurface = document.querySelector('[data-study-source-scoped-question-search-stage914="true"]')
    const sourceScope = document.querySelector('[data-study-source-scoped-queue-stage914="true"]')
    const rows = [...document.querySelectorAll('[data-study-schedule-question-result-stage918]')].filter(
      isVisibleElement,
    )
    const rowValues = rows.map((row) => row.getAttribute('data-study-schedule-question-result-stage918'))
    const emptyState = document.querySelector('[data-study-schedule-empty-stage918="true"]')
    const searchInput = document.querySelector('[data-study-source-scoped-question-search-stage914="true"] input')
    const searchActive = Boolean(searchInput instanceof HTMLInputElement && searchInput.value.trim())
    const expectedValue = expected ?? activeFilter
    const rowsMatchActiveBucket =
      activeFilter !== 'all' &&
      (rows.length === 0 ? isVisibleElement(emptyState) : rowValues.every((value) => value === activeFilter))

    return {
      studyScheduleActiveFilter: activeFilter,
      studyScheduleBucketDrilldownsVisible:
        isVisibleElement(drilldownSurface) &&
        ['due-now', 'due-this-week', 'upcoming', 'new', 'reviewed'].every((value) =>
          visibleBucketValues.includes(value),
        ),
      studyScheduleEmptyStateVisible: isVisibleElement(emptyState),
      studyScheduleExpectedFilterVisible: expectedValue === activeFilter,
      studyScheduleQuestionSearchActive: searchActive,
      studyScheduleQuestionsVisible: isVisibleElement(questionsSurface),
      studyScheduleRowsMatchActiveBucket: rowsMatchActiveBucket,
      studyScheduleSourceScopeVisible: isVisibleElement(sourceScope),
      studyScheduleVisibleQuestionCount: rows.length,
    }
  }, expectedDrilldown)
}

async function readStudySourceScopedQueueVisible(page) {
  return page.evaluate(() => {
    const scopedQueue = document.querySelector('[data-study-source-scoped-queue-stage914="true"]')
    if (!(scopedQueue instanceof HTMLElement)) {
      return false
    }
    const style = window.getComputedStyle(scopedQueue)
    const box = scopedQueue.getBoundingClientRect()
    return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1
  })
}

async function readHomeSourceMemoryOpenedStackMetrics(page) {
  return page.evaluate(() => {
    const isVisibleElement = (element) => {
      if (!(element instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(element)
      const box = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1
    }
    const visibleStacks = [...document.querySelectorAll('[data-source-overview-memory-stack-stage906="true"]')].filter(
      isVisibleElement,
    )
    const visibleStackHasKind = (kind) =>
      visibleStacks.some((stack) =>
        Boolean(stack.querySelector(`[data-source-overview-memory-stack-kind-stage906="${kind}"]`)),
      )
    return {
      homeSourceMemorySignalOpensSourceOverviewStack:
        window.location.pathname === '/recall' &&
        visibleStacks.length > 0 &&
        visibleStackHasKind('personal-note') &&
        visibleStackHasKind('graph') &&
        visibleStackHasKind('study'),
    }
  })
}

async function readHomePersonalNotesCollectionBoardMetrics(page, draftText) {
  return page.evaluate((expectedText) => {
    const isVisible = (selector) => {
      const element = document.querySelector(selector)
      if (!(element instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(element)
      const box = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1
    }

    const organizerSection = document.querySelector('[data-home-personal-notes-organizer-section-stage898="true"]')
    const selectedOrganizerSection = document.querySelector(
      '[data-home-personal-notes-organizer-selected-stage898="true"]',
    )
    const board = document.querySelector('[data-home-personal-notes-board-stage898="true"]')
    const boardText = board?.textContent ?? ''
    const firstPreview = board?.querySelector('[data-home-personal-note-board-preview-stage898="body"]')?.textContent ?? ''
    const syntheticAnchorVisible =
      boardText.includes('Source note for ') || boardText.includes('Manual note attached to ')

    return {
      homePersonalNotesBoardStartsWithNoteItems: isVisible(
        '[data-home-personal-notes-board-starts-with-note-items-stage898="true"]',
      ),
      homePersonalNotesBoardSyntheticAnchorHidden: !syntheticAnchorVisible,
      homePersonalNotesBoardUsesBodyPreview: firstPreview.includes(expectedText) || boardText.includes(expectedText),
      homePersonalNotesBoardVisible: isVisible('[data-home-personal-notes-board-stage898="true"]'),
      homePersonalNotesOrganizerSectionSelectable: selectedOrganizerSection instanceof HTMLElement,
      homePersonalNotesOrganizerSectionVisible:
        organizerSection instanceof HTMLElement && isVisible('[data-home-personal-notes-organizer-section-stage898="true"]'),
    }
  }, draftText)
}

async function readHomePersonalNoteOpenedNotebookMetrics(page, draftText) {
  return page.evaluate((expectedText) => {
    const isVisible = (element) => {
      if (!(element instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(element)
      const box = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1
    }
    const selectedWorkbench = document.querySelector('[aria-label="Selected note workbench"]')
    const selectedText = selectedWorkbench?.textContent ?? ''
    const sourceContext = document.querySelector('[data-notebook-source-context-panel="true"]')
    const noteText = document.querySelector(
      '.recall-note-workbench-editor-stage872 textarea, .recall-note-workbench-editor textarea',
    )
    const highlightedPassageVisible = [...document.querySelectorAll('h3')].some(
      (heading) => heading.textContent?.replace(/\s+/g, ' ').trim() === 'Highlighted passage',
    )
    const sourceContextPanelVisible = isVisible(sourceContext)
    const sourceSyntheticHighlightVisible =
      selectedText.includes('Source note for ') || selectedText.includes('Manual note attached to ')
    return {
      homePersonalNoteOpensEmbeddedNotebook:
        window.location.pathname === '/recall' &&
        sourceContextPanelVisible &&
        noteText instanceof HTMLTextAreaElement &&
        noteText.value === expectedText &&
        !highlightedPassageVisible &&
        !sourceSyntheticHighlightVisible,
      notebookSourceAnchorContextPanelVisible: sourceContextPanelVisible,
      notebookSourceAnchorHighlightedPassageVisible: sourceContextPanelVisible && highlightedPassageVisible,
      notebookSourceAnchorSyntheticHighlightVisible: sourceSyntheticHighlightVisible,
    }
  }, draftText)
}

async function readSourceOverviewMemoryMetrics(page, draftText) {
  return page.evaluate((expectedText) => {
    const isVisible = (selector) => {
      const element = document.querySelector(selector)
      if (!(element instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(element)
      const box = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1
    }

    const panel = document.querySelector('[data-source-overview-personal-notes-panel-stage900="true"]')
    const panelText = panel?.textContent ?? ''
    const bodyPreview =
      panel?.querySelector('[data-source-overview-memory-preview-stage900="body"]')?.textContent ?? ''
    const syntheticAnchorVisible =
      panelText.includes('Source note for ') || panelText.includes('Manual note attached to ')

    return {
      sourceOverviewMemoryStackIncludesGraphItems:
        Boolean(panel?.querySelector('[data-source-overview-memory-stack-kind-stage906="graph"]')),
      sourceOverviewMemoryStackIncludesPersonalNotes:
        Boolean(panel?.querySelector('[data-source-overview-memory-stack-kind-stage906="personal-note"]')),
      sourceOverviewMemoryStackIncludesStudyItems:
        Boolean(panel?.querySelector('[data-source-overview-memory-stack-kind-stage906="study"]')),
      sourceOverviewMemoryStackVisible: isVisible('[data-source-overview-memory-stack-stage906="true"]'),
      sourceOverviewPersonalNotesPanelVisible: isVisible('[data-source-overview-personal-notes-panel-stage900="true"]'),
      sourceOverviewPersonalNotesSyntheticAnchorHidden: !syntheticAnchorVisible,
      sourceOverviewPersonalNotesUsesBodyPreview:
        bodyPreview.includes(expectedText) || panelText.includes(expectedText),
    }
  }, draftText)
}

async function readSourceOverviewOpenedNotebookMetrics(page, draftText) {
  return page.evaluate((expectedText) => {
    const isVisibleElement = (element) => {
      if (!(element instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(element)
      const box = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1
    }
    const selectedWorkbench = document.querySelector('[aria-label="Selected note workbench"]')
    const selectedText = selectedWorkbench?.textContent ?? ''
    const sourceContext = document.querySelector('[data-notebook-source-context-panel="true"]')
    const noteText = document.querySelector(
      '.recall-note-workbench-editor-stage872 textarea, .recall-note-workbench-editor textarea',
    )
    const highlightedPassageVisible = [...document.querySelectorAll('h3')].some(
      (heading) => heading.textContent?.replace(/\s+/g, ' ').trim() === 'Highlighted passage',
    )
    const syntheticAnchorVisible =
      selectedText.includes('Source note for ') || selectedText.includes('Manual note attached to ')

    return {
      sourceOverviewPersonalNotesOpensEmbeddedNotebook:
        window.location.pathname === '/recall' &&
        isVisibleElement(sourceContext) &&
        noteText instanceof HTMLTextAreaElement &&
        noteText.value === expectedText &&
        !highlightedPassageVisible &&
        !syntheticAnchorVisible,
    }
  }, draftText)
}

async function readReaderSourceNotebookContinuityVisible(page) {
  return page.evaluate(() => {
    const isVisibleElement = (element) => {
      if (!(element instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(element)
      const box = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1
    }
    const actions = Array.from(
      document.querySelectorAll(
        '.source-workspace-meta-action, [aria-label="Open Notebook notes from short document completion"]',
      ),
    )
    const element = actions.find((candidate) => {
      const label = candidate.getAttribute('aria-label') ?? ''
      const text = candidate.textContent?.replace(/\s+/g, ' ').trim() ?? ''
      return label === 'Open nearby notebook notes' || label === 'Open Notebook notes from short document completion' || text === 'Notebook notes'
    })
    if (!(element instanceof HTMLElement)) {
      return false
    }
    return (
      /\d+ notes?/.test(document.body.textContent ?? '') &&
      isVisibleElement(element)
    )
  })
}

async function readReaderSourceMemoryCountMetrics(page) {
  return page.evaluate(() => {
    const isVisibleElement = (element) => {
      if (!(element instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(element)
      const box = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1
    }
    const visibleButton = (label) => {
      const button = document.querySelector(`button[aria-label="${label}"]`)
      return button instanceof HTMLElement && isVisibleElement(button)
    }
    return {
      readerSourceGraphCountVisible: visibleButton('Open source graph memory'),
      readerSourceMemoryCountsActionable:
        visibleButton('Open nearby notebook notes') &&
        visibleButton('Open source graph memory') &&
        visibleButton('Open source study memory'),
      readerSourceStudyCountVisible: visibleButton('Open source study memory'),
    }
  })
}

async function readReaderSourceNotebookContinuityMetrics(page, draftText) {
  return page.evaluate((expectedText) => {
    const selectedWorkbench = document.querySelector('[aria-label="Selected note workbench"]')
    const selectedText = selectedWorkbench?.textContent ?? ''
    const sourceContext = document.querySelector('[data-notebook-source-context-panel="true"]')
    const noteText = document.querySelector(
      '.recall-note-workbench-editor-stage872 textarea, .recall-note-workbench-editor textarea',
    )
    const syntheticAnchorVisible =
      selectedText.includes('Source note for ') || selectedText.includes('Manual note attached to ')
    return {
      readerSourceNotebookContinuityOpensEmbeddedNotebook:
        window.location.pathname === '/recall' &&
        sourceContext instanceof HTMLElement &&
        noteText instanceof HTMLTextAreaElement &&
        noteText.value === expectedText &&
        !syntheticAnchorVisible,
    }
  }, draftText)
}

async function openSourceWorkspaceDestination(page, destination) {
  const tab = page.getByRole('tab', { name: `Source workspace ${destination}` }).first()
  if (await tab.isVisible().catch(() => false)) {
    await tab.click()
    return
  }

  const trigger = page.getByRole('button', { name: 'Open source workspace destinations' }).first()
  await trigger.waitFor({ state: 'visible', timeout: 12000 })
  await trigger.click()
  await page.getByRole('button', { name: `Open source workspace ${destination}` }).first().click()
}

async function readNotebookEmptyStateMetrics(page, selectedState) {
  return page.evaluate(({
    noActiveDetailIntroVisible,
    noActiveSourceAvailable,
    noActiveSourceValue,
    noActiveWorkbenchTopOffset,
    searchEmptyDetailIntroVisible,
    searchEmptyWorkbenchTopOffset,
  }) => {
    const isVisible = (selector) => {
      const element = document.querySelector(selector)
      if (!(element instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(element)
      const box = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1
    }
    const queryText = (selector) => document.querySelector(selector)?.textContent?.trim() ?? ''

    const commandRow = document.querySelector('.recall-notes-command-row-stage872')
    const captureButtons = [...document.querySelectorAll('button')].filter(
      (button) => button.textContent?.trim() === 'Capture in Reader',
    )
    const noActiveEmpty = document.querySelector(
      '.recall-note-empty-workbench-stage874[data-notebook-empty-state-kind="source-empty"]',
    )
    const searchEmpty = document.querySelector(
      '.recall-note-empty-workbench-stage874[data-notebook-empty-state-kind="search-empty"]',
    )

    return {
      notebookCaptureInReaderVisible: captureButtons.some((button) => button instanceof HTMLElement),
      notebookEmptyDetailIntroVisible: Boolean(noActiveDetailIntroVisible),
      notebookEmptyLegacyGuidanceCardsVisible: isVisible('.recall-note-empty-guidance-card-stage698'),
      notebookEmptyLegacyHeroVisible: isVisible('.recall-note-empty-hero-stage698'),
      notebookEmptyStateCopy: queryText('.recall-note-empty-workbench-stage874'),
      notebookEmptyWorkbenchTopOffset: noActiveWorkbenchTopOffset,
      notebookEmptyWorkbenchOwned: Boolean(noActiveSourceAvailable) || noActiveEmpty instanceof HTMLElement,
      notebookNoActiveSourceAvailable: noActiveSourceAvailable,
      notebookNoActiveSourceValue: noActiveSourceValue,
      notebookSearchEmptyCaptureInReaderVisible:
        commandRow instanceof HTMLElement &&
        captureButtons.some((button) => commandRow.contains(button)),
      notebookSearchEmptyDetailIntroVisible: Boolean(searchEmptyDetailIntroVisible),
      notebookSearchEmptyLegacyGuidanceCardsVisible: isVisible(
        '.recall-note-empty-guidance-card-stage698',
      ),
      notebookSearchEmptyWorkbenchTopOffset: searchEmptyWorkbenchTopOffset,
      notebookSearchEmptyWorkbenchOwned: searchEmpty instanceof HTMLElement,
    }
  }, selectedState)
}

async function selectSourceWithNoNotebookRows(page) {
  const sourceSelect = page.getByRole('combobox', { name: 'Source' }).first()
  const sourceValues = await sourceSelect.locator('option').evaluateAll((options) =>
    options
      .map((option) => option.value)
      .filter((value) => Boolean(value)),
  )

  for (const value of sourceValues) {
    await sourceSelect.selectOption(value)
    await page.waitForTimeout(600)
    const rowCount = await page.locator('[data-note-browser-row-kind="library-note"]').count()
    const emptyVisible = await page
      .locator('.recall-note-empty-workbench-stage874')
      .first()
      .isVisible()
      .catch(() => false)
    const emptyKind = await page
      .locator('.recall-note-empty-workbench-stage874')
      .first()
      .getAttribute('data-notebook-empty-state-kind')
      .catch(() => null)

    if (rowCount === 0 && emptyVisible && emptyKind === 'source-empty') {
      return { found: true, value }
    }
  }

  if (sourceValues[0]) {
    await sourceSelect.selectOption(sourceValues[0])
    await page.waitForTimeout(300)
  }

  return { found: false, value: null }
}

async function selectSentenceAnchoredNotebookRow(page, stageLabel, baseUrl) {
  const sourceSelect = page.getByRole('combobox', { name: 'Source' }).first()
  const searchField = page.getByRole('searchbox', { name: 'Search notebook' }).first()
  if (await searchField.isVisible().catch(() => false)) {
    await searchField.fill('')
    await page.waitForTimeout(300)
  }
  const sourceValues = await sourceSelect.locator('option').evaluateAll((options) =>
    options
      .map((option) => option.value)
      .filter((value) => Boolean(value)),
  )
  const candidateSourceValues = ['__current__', ...sourceValues]

  for (const sourceValue of candidateSourceValues) {
    if (sourceValue !== '__current__') {
      await sourceSelect.selectOption(sourceValue)
      await page.waitForTimeout(700)
    }

    const selected = await selectVisibleSentenceAnchoredNotebookRow(page)
    if (selected) {
      return
    }
  }

  const seededDocumentId = await seedSentenceAnchoredNotebookNote(baseUrl, stageLabel)
  if (await searchField.isVisible().catch(() => false)) {
    await searchField.fill('')
  }
  await sourceSelect.selectOption(seededDocumentId)
  await page.waitForTimeout(900)
  const selected = await selectVisibleSentenceAnchoredNotebookRow(page)
  if (selected) {
    return
  }

  throw new Error(`${stageLabel} expected at least one sentence-anchored Notebook note for regression evidence.`)
}

async function selectVisibleSentenceAnchoredNotebookRow(page) {
  const rows = page.locator('[data-note-browser-row-kind="library-note"]')
  const rowCount = await rows.count()

  for (let index = 0; index < rowCount; index += 1) {
    const row = rows.nth(index)
    const text = await row.textContent().catch(() => '')
    if (/anchored sentence(s)?/i.test(text ?? '') || /Anchored passage/i.test(text ?? '')) {
      await row.click()
      await page.locator('[data-notebook-highlight-panel="true"]').first().waitFor({ state: 'visible', timeout: 12000 })
      return true
    }
  }

  return false
}

async function seedSentenceAnchoredNotebookNote(baseUrl, stageLabel) {
  const documents = await fetchJson(`${baseUrl}/api/documents`)
  for (const document of documents) {
    if (!document?.id || !Array.isArray(document.available_modes) || !document.available_modes.includes('reflowed')) {
      continue
    }
    const view = await fetchJson(`${baseUrl}/api/documents/${encodeURIComponent(document.id)}/view?mode=reflowed`).catch(
      () => null,
    )
    const variantId = view?.variant_metadata?.variant_id
    const block = Array.isArray(view?.blocks)
      ? view.blocks.find((candidate) => candidate?.id && typeof candidate.text === 'string' && candidate.text.trim())
      : null
    if (!variantId || !block) {
      continue
    }

    await fetchJson(`${baseUrl}/api/recall/documents/${encodeURIComponent(document.id)}/notes`, {
      body: JSON.stringify({
        anchor: {
          anchor_text: block.text,
          block_id: block.id,
          excerpt_text: block.text,
          global_sentence_end: 0,
          global_sentence_start: 0,
          kind: 'sentence',
          sentence_end: 0,
          sentence_start: 0,
          source_document_id: document.id,
          variant_id: variantId,
        },
        body_text: `Stage ${stageLabel} sentence-anchor regression note`,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    return document.id
  }

  throw new Error(`${stageLabel} could not seed a sentence-anchored Notebook note for regression evidence.`)
}

function getHarnessStudyReviewPriority(status) {
  if (status === 'due') {
    return 0
  }
  if (status === 'new') {
    return 1
  }
  if (status === 'scheduled') {
    return 2
  }
  return 3
}

function orderHarnessStudyCardsForReviewQueue(cards) {
  return [...cards].sort((left, right) => {
    const priorityDelta = getHarnessStudyReviewPriority(left?.status) - getHarnessStudyReviewPriority(right?.status)
    if (priorityDelta !== 0) {
      return priorityDelta
    }
    const leftDueAt = new Date(left?.due_at ?? '').getTime()
    const rightDueAt = new Date(right?.due_at ?? '').getTime()
    if (Number.isFinite(leftDueAt) && Number.isFinite(rightDueAt) && leftDueAt !== rightDueAt) {
      return leftDueAt - rightDueAt
    }
    return String(left?.prompt ?? '').localeCompare(String(right?.prompt ?? ''))
  })
}

function buildHarnessSearchQuery(value) {
  const words = String(value ?? '')
    .replace(/^\s*\d+[.)]?\s*/, '')
    .replace(/_{2,}/g, ' ')
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 0 && !/^\d+$/.test(word))
  if (words.length === 0) {
    return 'source'
  }
  return words[0]
}

function buildHarnessStudyEvidenceSearchQuery(card) {
  const sourceSpans = Array.isArray(card?.source_spans) ? card.source_spans : []
  for (const span of sourceSpans) {
    for (const key of ['excerpt', 'evidence', 'preview', 'anchor_text', 'text']) {
      const value = span?.[key]
      if (typeof value === 'string' && value.trim().length > 8) {
        return buildHarnessSearchQuery(value)
      }
    }
  }
  return null
}

async function findSourceMemoryStackDocument(baseUrl) {
  const [documents, graphSnapshot, studyCards] = await Promise.all([
    fetchJson(`${baseUrl}/api/documents`),
    fetchJson(`${baseUrl}/api/recall/graph?limit_nodes=120&limit_edges=160`),
    fetchJson(`${baseUrl}/api/recall/study/cards?status=all&limit=200`),
  ])
  const graphDocumentIds = new Set()
  for (const node of graphSnapshot?.nodes ?? []) {
    for (const documentId of node?.source_document_ids ?? []) {
      graphDocumentIds.add(documentId)
    }
  }
  const studyDocumentIds = new Set(
    (Array.isArray(studyCards) ? studyCards : [])
      .map((card) => card?.source_document_id)
      .filter(Boolean),
  )
  return (
    (Array.isArray(documents) ? documents : []).find(
      (document) => document?.id && graphDocumentIds.has(document.id) && studyDocumentIds.has(document.id),
    ) ?? null
  )
}

async function findSourceMemoryTextQuery(baseUrl, document) {
  const mode = Array.isArray(document?.available_modes) && document.available_modes.includes('reflowed')
    ? 'reflowed'
    : Array.isArray(document?.available_modes) && document.available_modes.includes('original')
      ? 'original'
      : 'reflowed'
  const view = await fetchJson(`${baseUrl}/api/documents/${encodeURIComponent(document.id)}/view?mode=${mode}`)
  for (const block of view?.blocks ?? []) {
    const metadata = block?.metadata && typeof block.metadata === 'object' ? block.metadata : {}
    const sentenceTexts = Array.isArray(metadata?.sentence_texts)
      ? metadata.sentence_texts.filter((value) => typeof value === 'string' && value.trim().length > 12)
      : []
    const candidates = sentenceTexts.length > 0 ? sentenceTexts : typeof block?.text === 'string' ? [block.text] : []
    for (const candidate of candidates) {
      const words = candidate
        .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
        .split(/\s+/)
        .map((word) => word.trim())
        .filter((word) => word.length > 2)
      if (words.length >= 3) {
        return words.slice(0, Math.min(5, words.length)).join(' ')
      }
    }
  }
  throw new Error(`Could not derive source-text search query for ${document?.title ?? document?.id ?? 'source'}.`)
}

async function fetchJson(url, init) {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`)
  }
  return response.json()
}

async function readMeasuredBox(locator, label) {
  const box = await locator.boundingBox()
  if (!box) {
    throw new Error(`Could not measure ${label}.`)
  }
  return box
}

async function readOptionalTopOffset(locator) {
  const box = await locator.boundingBox().catch(() => null)
  return box?.y ?? null
}
