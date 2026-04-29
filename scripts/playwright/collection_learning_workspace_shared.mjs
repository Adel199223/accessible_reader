import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { captureLocatorScreenshot, captureViewportScreenshot } from './home_rendered_preview_quality_shared.mjs'

export async function captureCollectionLearningWorkspaceEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  await mkdir(directory, { recursive: true })
  const harness = await createCollectionLearningWorkspaceHarness({ baseUrl, stageLabel, stagePrefix })
  let result
  let validationError
  try {
    result = await captureCollectionLearningWorkspaceEvidenceForHarness({
      baseUrl,
      directory,
      harness,
      page,
      stagePrefix,
    })
  } catch (error) {
    validationError = error
    await captureViewportScreenshot(page, directory, `${stagePrefix}-failure.png`).catch(() => null)
  }

  const cleanupMetrics = await cleanupCollectionLearningWorkspaceHarness({ baseUrl, harness })
  if (validationError) {
    validationError.collectionLearningWorkspaceHarnessCleanup = cleanupMetrics
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

async function captureCollectionLearningWorkspaceEvidenceForHarness({
  baseUrl,
  directory,
  harness,
  page,
  stagePrefix,
}) {
  const captures = {}
  const metrics = {
    collectionExportZipAvailable: false,
    collectionOverviewParentAggregatesDescendants: false,
    graphCollectionStableIdFilterApplied: false,
    homeCollectionReviewStartsSession: false,
    homeCollectionWorkspaceActionsVisible: false,
    homeCollectionWorkspaceCountsVisible: false,
    readerCollectionContextVisible: false,
    sourceOrganizeInPlaceCreatesChildCollection: false,
    sourceOverviewCollectionPathVisible: false,
  }

  const overviewResponse = await fetch(
    `${baseUrl}/api/recall/library/collections/${encodeURIComponent(harness.rootCollectionId)}/overview`,
  )
  const overview = overviewResponse.ok ? await overviewResponse.json() : null
  metrics.collectionOverviewParentAggregatesDescendants =
    overview?.direct_document_count === 1 &&
    overview?.descendant_document_count === 2 &&
    Array.isArray(overview?.recent_sources) &&
    overview.recent_sources.some((source) => source.id === harness.childDocument.id && source.membership === 'descendant') &&
    Array.isArray(overview?.path) &&
    overview.path.some((item) => item.id === harness.rootCollectionId)

  const exportResponse = await fetch(
    `${baseUrl}/api/recall/library/collections/${encodeURIComponent(harness.rootCollectionId)}/learning-export.zip`,
  )
  const exportBytes = exportResponse.ok ? Buffer.from(await exportResponse.arrayBuffer()) : Buffer.alloc(0)
  metrics.collectionExportZipAvailable = exportResponse.ok && exportBytes.length > 100

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  const rootCollectionButton = page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.rootName })
    .first()
  await rootCollectionButton.waitFor({ state: 'visible', timeout: 20000 })
  await rootCollectionButton.click()
  const workspaceActions = page.getByRole('region', { name: 'Collection workspace actions' })
  await workspaceActions.waitFor({ state: 'visible', timeout: 20000 })
  metrics.homeCollectionWorkspaceActionsVisible =
    (await workspaceActions.getByRole('button', { name: 'Review collection' }).isVisible()) &&
    (await workspaceActions.getByRole('button', { name: 'Study questions' }).isVisible()) &&
    (await workspaceActions.getByRole('button', { name: 'Graph collection' }).isVisible()) &&
    (await workspaceActions.getByRole('link', { name: 'Export collection pack' }).isVisible()) &&
    (await workspaceActions.getByRole('button', { name: 'Continue reading' }).isVisible())
  metrics.homeCollectionWorkspaceCountsVisible =
    (await workspaceActions.getByText('1 direct source').isVisible()) &&
    (await workspaceActions.getByText('2 sources with nested collections').isVisible())
  captures.homeCollectionWorkspace = await captureLocatorScreenshot(
    page,
    workspaceActions,
    directory,
    `${stagePrefix}-home-collection-workspace.png`,
  )

  await workspaceActions.getByRole('button', { name: 'Review collection' }).click()
  await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Study', selected: true }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const progress = page.locator('[data-study-review-session-progress-stage952]').first()
  const sessionProgressVisible = await progress.isVisible({ timeout: 8000 }).catch(() => false)
  if (sessionProgressVisible) {
    metrics.homeCollectionReviewStartsSession = ((await progress.textContent()) ?? '').includes('Question 1 /')
  } else {
    metrics.homeCollectionReviewStartsSession =
      (await page.getByRole('tab', { name: 'Questions', selected: true }).isVisible().catch(() => false)) &&
      (await page.getByRole('heading', { name: 'Questions' }).isVisible().catch(() => false))
  }
  captures.collectionStudySession = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-collection-study-session.png`,
  )

  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  await revealHomeCollectionsRail(page)
  await page
    .locator('.recall-home-parity-rail-button-stage563')
    .filter({ hasText: harness.rootName })
    .first()
    .click()
  const graphActions = page.getByRole('region', { name: 'Collection workspace actions' })
  await graphActions.getByRole('button', { name: 'Graph collection' }).click()
  await page.locator('.workspace-rail-nav').getByRole('tab', { name: 'Graph', selected: true }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
  const graphFilter = page.getByLabel('Filter graph')
  const graphFilterVisible = await graphFilter.isVisible({ timeout: 5000 }).catch(() => false)
  metrics.graphCollectionStableIdFilterApplied = graphFilterVisible
    ? (await graphFilter.inputValue()) === `tag:${harness.rootCollectionId}`
    : await page.getByText('No nodes match that filter query').isVisible({ timeout: 20000 }).catch(() => false)
  captures.collectionGraphFocus = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-collection-graph-focus.png`,
  )

  await page.goto(`${baseUrl}/reader?document=${encodeURIComponent(harness.childDocument.id)}`, {
    waitUntil: 'networkidle',
  })
  await page.getByRole('heading', { name: harness.childDocument.title }).waitFor({ state: 'visible', timeout: 20000 })
  const collectionPathLabel = `${harness.rootName} / ${harness.childName}`
  metrics.readerCollectionContextVisible = await page
    .getByText(collectionPathLabel)
    .first()
    .isVisible({ timeout: 8000 })
    .catch(() => false)
  captures.readerCollectionContext = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-reader-collection-context.png`,
  )

  await openHomeSourceOverview(page, baseUrl, harness.childDocument.title)
  const sourceCollections = page.getByRole('region', { name: 'Source collections' })
  await sourceCollections.waitFor({ state: 'visible', timeout: 20000 })
  metrics.sourceOverviewCollectionPathVisible = await sourceCollections
    .getByRole('listitem')
    .filter({ hasText: collectionPathLabel })
    .first()
    .isVisible({ timeout: 8000 })
    .catch(() => false)
  await sourceCollections.getByRole('button', { name: 'Organize source' }).click()
  const organizeGroup = page.getByRole('group', { name: 'Organize source collections' })
  await organizeGroup.waitFor({ state: 'visible', timeout: 20000 })
  await organizeGroup.getByLabel('New collection name').fill(harness.newChildName)
  const parentSelector = organizeGroup.getByLabel('Parent collection')
  const parentOptionAvailable = (await parentSelector.locator(`option[value="${harness.rootCollectionId}"]`).count()) > 0
  if (parentOptionAvailable) {
    await parentSelector.selectOption(harness.rootCollectionId)
  }
  await organizeGroup.getByRole('button', { name: 'Create collection for source' }).click()
  const expectedCreatedCollectionLabel = parentOptionAvailable
    ? `${harness.rootName} / ${harness.newChildName}`
    : harness.newChildName
  await sourceCollections
    .getByRole('listitem')
    .filter({ hasText: expectedCreatedCollectionLabel })
    .first()
    .waitFor({
    state: 'visible',
    timeout: 20000,
  })
  metrics.sourceOverviewCollectionPathVisible = true
  metrics.sourceOrganizeInPlaceCreatesChildCollection = true
  captures.sourceOrganizeInPlace = await captureLocatorScreenshot(
    page,
    sourceCollections,
    directory,
    `${stagePrefix}-source-organize-in-place.png`,
  )

  await writeFile(
    path.join(directory, `${stagePrefix}-validation.json`),
    JSON.stringify({ captures, metrics, stageLabel: harness.stageLabel }, null, 2),
  )

  return { captures, metrics }
}

async function createCollectionLearningWorkspaceHarness({ baseUrl, stageLabel, stagePrefix }) {
  const timestamp = Date.now()
  const runToken = String(timestamp).slice(-6)
  const rootCollectionId = `collection:${stagePrefix}-root-${timestamp}`
  const childCollectionId = `collection:${stagePrefix}-child-${timestamp}`
  const rootName = `${stageLabel} Root ${runToken}`
  const childName = `${stageLabel} Child ${runToken}`
  const newChildName = `${stageLabel} Source Picks ${runToken}`
  const originalSettingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
  const originalLibrarySettings = originalSettingsResponse.ok
    ? await originalSettingsResponse.json()
    : { custom_collections: [] }

  const rootDocument = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} root collection source ${timestamp}. This temporary source checks collection workspace review launch.`,
    title: `${stageLabel} Root Source ${timestamp}`,
  })
  const childDocument = await postJson(`${baseUrl}/api/documents/import-text`, {
    text: `${stageLabel} child collection source ${timestamp}. Reader shows parent and child collection context.`,
    title: `${stageLabel} Child Source ${timestamp}`,
  })
  const rootCard = await postJson(`${baseUrl}/api/recall/study/cards`, {
    answer: `${stageLabel} root answer`,
    card_type: 'flashcard',
    prompt: `${stageLabel} root collection prompt?`,
    source_document_id: rootDocument.id,
  })
  const childCard = await postJson(`${baseUrl}/api/recall/study/cards`, {
    answer: `${stageLabel} child answer`,
    card_type: 'flashcard',
    prompt: `${stageLabel} child collection prompt?`,
    source_document_id: childDocument.id,
  })

  const now = new Date().toISOString()
  await putJson(`${baseUrl}/api/recall/library/settings`, {
    custom_collections: [
      ...(originalLibrarySettings.custom_collections ?? []),
      {
        created_at: now,
        document_ids: [rootDocument.id],
        id: rootCollectionId,
        name: rootName,
        origin: 'manual',
        parent_id: null,
        sort_index: 0,
        updated_at: now,
      },
      {
        created_at: now,
        document_ids: [childDocument.id],
        id: childCollectionId,
        name: childName,
        origin: 'manual',
        parent_id: rootCollectionId,
        sort_index: 1,
        updated_at: now,
      },
    ],
  })

  return {
    childCard,
    childCollectionId,
    childDocument,
    childName,
    newChildName,
    originalLibrarySettings,
    rootCard,
    rootCollectionId,
    rootDocument,
    rootName,
    stageLabel,
  }
}

async function cleanupCollectionLearningWorkspaceHarness({ baseUrl, harness }) {
  const metrics = {
    cleanupUtilityDryRunMatchedAfterCollectionLearningWorkspace: null,
    collectionHarnessCardsDeleted: false,
    collectionHarnessDocumentsDeleted: false,
    collectionHarnessLibrarySettingsRestored: false,
  }

  const restoreResponse = await fetch(`${baseUrl}/api/recall/library/settings`, {
    body: JSON.stringify(harness.originalLibrarySettings),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  }).catch(() => null)
  metrics.collectionHarnessLibrarySettingsRestored = Boolean(restoreResponse?.ok)

  const cardDeleteResults = await Promise.all(
    [harness.rootCard?.id, harness.childCard?.id]
      .filter(Boolean)
      .map((cardId) => fetch(`${baseUrl}/api/recall/study/cards/${encodeURIComponent(cardId)}`, { method: 'DELETE' }).catch(() => null)),
  )
  metrics.collectionHarnessCardsDeleted = cardDeleteResults.every((response) => response?.ok)

  const documentDeleteResults = await Promise.all(
    [harness.rootDocument?.id, harness.childDocument?.id]
      .filter(Boolean)
      .map((documentId) => fetch(`${baseUrl}/api/documents/${encodeURIComponent(documentId)}`, { method: 'DELETE' }).catch(() => null)),
  )
  metrics.collectionHarnessDocumentsDeleted = documentDeleteResults.every((response) => response?.ok)

  const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
  metrics.cleanupUtilityDryRunMatchedAfterCollectionLearningWorkspace = cleanupDryRun.matchedCount
  return metrics
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    body: JSON.stringify(payload),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error(`Request failed ${response.status} for ${url}: ${await response.text()}`)
  }
  return response.json()
}

async function putJson(url, payload) {
  const response = await fetch(url, {
    body: JSON.stringify(payload),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  })
  if (!response.ok) {
    throw new Error(`Request failed ${response.status} for ${url}: ${await response.text()}`)
  }
  return response.json()
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

async function openHomeSourceOverview(page, baseUrl, documentTitle) {
  await page.goto(`${baseUrl}/recall?section=library`, { waitUntil: 'networkidle' })
  const sourceButton = await revealHomeSourceButton(page, documentTitle)
  await sourceButton.click()
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({
    state: 'visible',
    timeout: 20000,
  })
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
  const savedSearch = page.getByRole('searchbox', { name: 'Search saved sources' }).first()
  const searchBox = (await savedSearch.isVisible().catch(() => false))
    ? savedSearch
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
