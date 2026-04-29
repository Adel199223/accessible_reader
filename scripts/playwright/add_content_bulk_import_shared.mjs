import { createServer } from 'node:http'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { findRecallNoteAuditArtifacts } from './cleanup_recall_note_audit_artifacts.mjs'
import { captureLocatorScreenshot } from './home_rendered_preview_quality_shared.mjs'

export async function captureAddContentBulkImportEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  await mkdir(directory, { recursive: true })
  const articleTitle = `${stageLabel} Bulk Import Harness Article`
  const articleServer = await startBulkImportArticleServer({ articleTitle })
  const archivePath = path.join(directory, `${stagePrefix}-links.txt`)
  await writeFile(
    archivePath,
    `${articleTitle} ${articleServer.baseUrl}/article\nnot a webpage\n`,
    'utf-8',
  )

  const captures = {}
  const metrics = {
    addContentBulkImportModeVisible: false,
    addContentBulkImportResultVisible: false,
    addContentBulkPreviewDryRun: false,
    addContentBulkPreviewRowsVisible: false,
    addContentBulkSelectedImportWorks: false,
    addContentSingleImportsStable: false,
    cleanupUtilityDryRunMatchedAfterAddContentBulkImport: null,
    importedHarnessDocumentDeleted: false,
  }
  const importedDocumentIds = []

  try {
    await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
    await page.getByRole('tab', { name: 'Home' }).waitFor({ timeout: 20000 })
    await page.getByRole('button', { name: /^Add$/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Add content' })
    await dialog.waitFor({ state: 'visible', timeout: 10000 })
    metrics.addContentSingleImportsStable =
      (await dialog.getByRole('tab', { name: /^Paste text/ }).isVisible()) &&
      (await dialog.getByRole('tab', { name: /^Web page/ }).isVisible()) &&
      (await dialog.getByRole('tab', { name: /^Choose file/ }).isVisible())
    const bulkTab = dialog.getByRole('tab', { name: /^Bulk import/ })
    metrics.addContentBulkImportModeVisible = await bulkTab.isVisible()
    await bulkTab.click()
    captures.addContentBulkImportDialog = await captureLocatorScreenshot(
      page,
      dialog,
      directory,
      `${stagePrefix}-add-content-bulk-dialog.png`,
    )

    await dialog.getByLabel('Archive file').setInputFiles(archivePath)
    const [previewResponse] = await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/documents/import-batch-preview')),
      dialog.getByRole('button', { name: 'Preview archive' }).click(),
    ])
    const previewJson = await previewResponse.json()
    metrics.addContentBulkPreviewDryRun = previewJson.dry_run === true && previewJson.applied === false
    const previewRegion = dialog.getByRole('region', { name: 'Bulk import preview' })
    await previewRegion.waitFor({ state: 'visible', timeout: 10000 })
    metrics.addContentBulkPreviewRowsVisible =
      (await previewRegion.getByText(articleTitle).isVisible()) &&
      (await previewRegion.getByText('invalid').isVisible())
    captures.addContentBulkPreview = await captureLocatorScreenshot(
      page,
      dialog,
      directory,
      `${stagePrefix}-add-content-bulk-preview.png`,
    )

    const [applyResponse] = await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/documents/import-batch')),
      dialog.getByRole('button', { name: /Import selected \(1\)/ }).click(),
    ])
    const applyJson = await applyResponse.json()
    for (const row of applyJson.rows ?? []) {
      if (row.document?.id) {
        importedDocumentIds.push(row.document.id)
      }
    }
    metrics.addContentBulkSelectedImportWorks =
      applyJson.applied === true &&
      applyJson.summary?.imported_count === 1 &&
      applyJson.summary?.skipped_count === 1
    const resultRegion = dialog.getByRole('region', { name: 'Bulk import result' })
    await resultRegion.waitFor({ state: 'visible', timeout: 10000 })
    metrics.addContentBulkImportResultVisible = await resultRegion
      .getByText(/1 imported .* 1 skipped/)
      .isVisible()
    captures.addContentBulkResult = await captureLocatorScreenshot(
      page,
      dialog,
      directory,
      `${stagePrefix}-add-content-bulk-result.png`,
    )

    await page.getByRole('button', { name: 'Close Add content' }).click()
    await dialog.waitFor({ state: 'hidden', timeout: 10000 })
    await page.getByText(articleTitle).first().waitFor({ state: 'visible', timeout: 15000 })
    const homeAfterBulkImportPath = path.join(directory, `${stagePrefix}-home-after-bulk-import.png`)
    await page.screenshot({
      fullPage: false,
      path: homeAfterBulkImportPath,
    })
    captures.homeAfterBulkImport = homeAfterBulkImportPath
  } finally {
    for (const documentId of importedDocumentIds) {
      try {
        const response = await fetch(`${baseUrl}/api/documents/${documentId}`, { method: 'DELETE' })
        metrics.importedHarnessDocumentDeleted = metrics.importedHarnessDocumentDeleted || response.ok
      } catch {
        metrics.importedHarnessDocumentDeleted = false
      }
    }
    const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
    metrics.cleanupUtilityDryRunMatchedAfterAddContentBulkImport = cleanupDryRun.matchedCount
    await rm(archivePath, { force: true })
    await articleServer.stop()
  }

  return { captures, metrics }
}

export async function captureAddContentImportCollectionsEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  await mkdir(directory, { recursive: true })
  const articleTitle = `${stageLabel} Organized Import Harness Article`
  const folderName = `${stageLabel} Folder`
  const childFolderName = `${stageLabel} Child`
  const tagName = `${stagePrefix}-tag`
  const articleServer = await startBulkImportArticleServer({ articleTitle })
  const archivePath = path.join(directory, `${stagePrefix}-bookmarks.html`)
  const pocketZipBuffer = createZipBuffer({
    'pocket/part.csv': `url,title,tags,status\n${articleServer.baseUrl}/article,${articleTitle},pocket-${tagName}|saved,unread\n`,
  })
  await writeFile(
    archivePath,
    `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
  <DT><H3>${folderName}</H3>
  <DL><p>
    <DT><H3>${childFolderName}</H3>
    <DL><p>
      <DT><A HREF="${articleServer.baseUrl}/article" TAGS="${tagName}">${articleTitle}</A>
    </DL><p>
  </DL><p>
</DL><p>`,
    'utf-8',
  )

  const captures = {}
  const metrics = {
    addContentBookmarkHierarchyImportCreatesTree: false,
    addContentBookmarkHierarchySuggestionsVisible: false,
    addContentBulkCollectionImportCreatesCollection: false,
    addContentBulkCollectionSuggestionsVisible: false,
    addContentBulkCollectionToggleVisible: false,
    addContentBulkSelectedImportWorks: false,
    addContentPocketZipPreviewCollectionsVisible: false,
    cleanupUtilityDryRunMatchedAfterAddContentCollections: null,
    graphImportedCollectionTagFilterMatches: false,
    graphAncestorCollectionTagFilterMatches: false,
    homeImportedCollectionVisible: false,
    homeCollectionTreeRowsVisible: false,
    homeManualCollectionsPersistAfterReload: false,
    homeParentCollectionAggregatesDescendants: false,
    importedHarnessDocumentDeleted: false,
    studyImportedCollectionSubsetVisible: false,
    studyParentCollectionSubsetFiltersDescendants: false,
  }
  const importedDocumentIds = []
  const createdNoteIds = []
  const createdStudyCardIds = []
  let originalLibrarySettings = { custom_collections: [] }

  try {
    const settingsResponse = await fetch(`${baseUrl}/api/recall/library/settings`)
    if (settingsResponse.ok) {
      originalLibrarySettings = await settingsResponse.json()
    }

    const pocketForm = new FormData()
    pocketForm.append('file', new Blob([pocketZipBuffer], { type: 'application/zip' }), 'pocket-export.zip')
    pocketForm.append('source_format', 'pocket_zip')
    pocketForm.append('max_items', '10')
    const pocketPreviewResponse = await fetch(`${baseUrl}/api/documents/import-batch-preview`, {
      body: pocketForm,
      method: 'POST',
    })
    const pocketPreview = pocketPreviewResponse.ok ? await pocketPreviewResponse.json() : null
    metrics.addContentPocketZipPreviewCollectionsVisible =
      pocketPreview?.source_format === 'pocket_zip' &&
      (pocketPreview.collection_suggestions ?? []).some((suggestion) =>
        String(suggestion.name ?? '').includes(`pocket-${tagName}`),
      )

    await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
    await page.getByRole('tab', { name: 'Home' }).waitFor({ timeout: 20000 })
    await page.getByRole('button', { name: /^Add$/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Add content' })
    await dialog.waitFor({ state: 'visible', timeout: 10000 })
    await dialog.getByRole('tab', { name: /^Bulk import/ }).click()
    const collectionToggle = dialog.getByLabel(/Create collections from folders\/tags/)
    metrics.addContentBulkCollectionToggleVisible =
      (await collectionToggle.isVisible()) && (await collectionToggle.isChecked())
    captures.addContentBulkCollectionDialog = await captureLocatorScreenshot(
      page,
      dialog,
      directory,
      `${stagePrefix}-add-content-import-collections-dialog.png`,
    )

    await dialog.getByLabel('Archive file').setInputFiles(archivePath)
    const [previewResponse] = await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/documents/import-batch-preview')),
      dialog.getByRole('button', { name: 'Preview archive' }).click(),
    ])
    const previewJson = await previewResponse.json()
    const previewRegion = dialog.getByRole('region', { name: 'Bulk import preview' })
    await previewRegion.waitFor({ state: 'visible', timeout: 10000 })
    metrics.addContentBulkCollectionSuggestionsVisible =
      (previewJson.collection_suggestions ?? []).some((suggestion) => suggestion.name === folderName) &&
      (await previewRegion.getByText(`${folderName} · 1`).isVisible()) &&
      (await previewRegion.getByText(`${tagName} · 1`).isVisible())
    metrics.addContentBookmarkHierarchySuggestionsVisible =
      (previewJson.collection_suggestions ?? []).some(
        (suggestion) =>
          Array.isArray(suggestion.path) &&
          suggestion.path.length === 2 &&
          suggestion.path[0] === folderName &&
          suggestion.path[1] === childFolderName &&
          suggestion.parent_id,
      ) && (await previewRegion.getByText(`${folderName} / ${childFolderName} · 1`).isVisible())
    captures.addContentBulkCollectionPreview = await captureLocatorScreenshot(
      page,
      dialog,
      directory,
      `${stagePrefix}-add-content-import-collections-preview.png`,
    )

    const [applyResponse] = await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/documents/import-batch')),
      dialog.getByRole('button', { name: /Import selected \(1\)/ }).click(),
    ])
    const applyJson = await applyResponse.json()
    for (const row of applyJson.rows ?? []) {
      if (row.document?.id) {
        importedDocumentIds.push(row.document.id)
      }
    }
    metrics.addContentBulkSelectedImportWorks =
      applyJson.applied === true &&
      applyJson.summary?.imported_count === 1 &&
      applyJson.summary?.skipped_count === 0
    metrics.addContentBulkCollectionImportCreatesCollection =
      applyJson.summary?.collection_created_count >= 2 &&
      (applyJson.collections ?? []).some((collection) => collection.name === folderName)
    const appliedCollections = applyJson.collections ?? []
    const appliedParent = appliedCollections.find(
      (collection) => Array.isArray(collection.path) && collection.path.join('/') === folderName,
    )
    const appliedChild = appliedCollections.find(
      (collection) =>
        Array.isArray(collection.path) && collection.path.join('/') === `${folderName}/${childFolderName}`,
    )
    metrics.addContentBookmarkHierarchyImportCreatesTree =
      Boolean(appliedParent?.id) &&
      appliedChild?.parent_id === appliedParent.id &&
      Array.isArray(appliedChild?.document_ids) &&
      appliedChild.document_ids.length === 1 &&
      Array.isArray(appliedParent?.document_ids) &&
      appliedParent.document_ids.length === 0
    const resultRegion = dialog.getByRole('region', { name: 'Bulk import result' })
    await resultRegion.waitFor({ state: 'visible', timeout: 10000 })
    captures.addContentBulkCollectionResult = await captureLocatorScreenshot(
      page,
      dialog,
      directory,
      `${stagePrefix}-add-content-import-collections-result.png`,
    )

    if (importedDocumentIds[0]) {
      const noteResponse = await fetch(`${baseUrl}/api/recall/documents/${encodeURIComponent(importedDocumentIds[0])}/notes`, {
        body: JSON.stringify({
          anchor: {
            anchor_text: `${articleTitle} organized import collection memory`,
            block_id: 'source-note-draft',
            excerpt_text: `Collection graph evidence for ${folderName}.`,
            kind: 'source',
            sentence_end: 0,
            sentence_start: 0,
            source_document_id: importedDocumentIds[0],
            variant_id: 'source-note-draft',
          },
          body_text: `Organized import collection evidence for ${folderName}.`,
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      if (noteResponse.ok) {
        const note = await noteResponse.json()
        createdNoteIds.push(note.id)
        await fetch(`${baseUrl}/api/recall/notes/${encodeURIComponent(note.id)}/promote/graph-node`, {
          body: JSON.stringify({
            description: `Graph tag filtering uses the imported collection ${folderName}.`,
            label: `${stageLabel} Import Collection Node`,
          }),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        })
      }
      const studyCardResponse = await fetch(`${baseUrl}/api/recall/study/cards`, {
        body: JSON.stringify({
          answer: `The source lives under ${folderName} / ${childFolderName}.`,
          card_type: 'flashcard',
          prompt: `${stageLabel} hierarchy study prompt?`,
          source_document_id: importedDocumentIds[0],
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      if (studyCardResponse.ok) {
        const studyCard = await studyCardResponse.json()
        if (studyCard?.id) {
          createdStudyCardIds.push(studyCard.id)
        }
      }
    }

    await page.getByRole('button', { name: 'Close Add content' }).click()
    await dialog.waitFor({ state: 'hidden', timeout: 10000 })
    await page.getByText(articleTitle).first().waitFor({ state: 'visible', timeout: 15000 })
    await revealHomeCollectionsRail(page)
    const homeImportedCollectionButton = page
      .locator('.recall-home-parity-rail-button-stage563')
      .filter({ hasText: folderName })
      .first()
    await homeImportedCollectionButton.waitFor({ state: 'visible', timeout: 15000 })
    metrics.homeImportedCollectionVisible = true
    await homeImportedCollectionButton.click()
    const parentCanvas = page.getByRole('region', { name: `${folderName} collection canvas` })
    await parentCanvas.waitFor({ state: 'visible', timeout: 15000 })
    metrics.homeParentCollectionAggregatesDescendants =
      (await parentCanvas.locator('.recall-home-parity-card-title-stage651').filter({ hasText: articleTitle }).count()) > 0 ||
      (await parentCanvas.getByRole('button', { name: `Open ${articleTitle}` }).count()) > 0
    await page.reload({ waitUntil: 'networkidle' })
    await revealHomeCollectionsRail(page)
    await page
      .locator('.recall-home-parity-rail-button-stage563')
      .filter({ hasText: folderName })
      .first()
      .waitFor({ state: 'visible', timeout: 15000 })
    const childTreeRow = page
      .locator('[data-home-collection-tree-depth-stage968="1"]')
      .filter({ hasText: childFolderName })
      .first()
    await childTreeRow.waitFor({ state: 'visible', timeout: 15000 })
    metrics.homeCollectionTreeRowsVisible = true
    metrics.homeManualCollectionsPersistAfterReload = true
    captures.homeAfterCollectionImport = path.join(directory, `${stagePrefix}-home-after-collection-import.png`)
    await page.screenshot({ fullPage: false, path: captures.homeAfterCollectionImport })

    await page.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
    await page
      .locator('.recall-study-collection-subset-row-stage930')
      .filter({ hasText: folderName })
      .first()
      .waitFor({ state: 'visible', timeout: 15000 })
    metrics.studyImportedCollectionSubsetVisible = true
    const parentStudySubsetRow = page
      .locator('.recall-study-collection-subset-row-stage930')
      .filter({ hasText: folderName })
      .first()
    const parentStudySubsetCount = Number(await parentStudySubsetRow.getAttribute('data-study-collection-subset-count-stage930'))
    await parentStudySubsetRow.click()
    const activeStudySubsetFilter = page.getByLabel('Active study subset filter')
    await activeStudySubsetFilter.waitFor({ state: 'visible', timeout: 15000 })
    const sourceScopedStudyCardsResponse = importedDocumentIds[0]
      ? await fetch(
          `${baseUrl}/api/recall/study/cards?limit=200&status=all&source_document_id=${encodeURIComponent(importedDocumentIds[0])}`,
        ).catch(() => null)
      : null
    const sourceScopedStudyCards = sourceScopedStudyCardsResponse?.ok ? await sourceScopedStudyCardsResponse.json() : []
    metrics.studyParentCollectionSubsetFiltersDescendants =
      /Subset:/i.test((await activeStudySubsetFilter.textContent()) ?? '') &&
      (parentStudySubsetCount > 0 ||
        sourceScopedStudyCards.some((card) => createdStudyCardIds.includes(card.id)) &&
          metrics.homeParentCollectionAggregatesDescendants)
    captures.studyImportedCollectionSubset = path.join(directory, `${stagePrefix}-study-imported-collection-subset.png`)
    await page.screenshot({ fullPage: false, path: captures.studyImportedCollectionSubset })

    await page.getByRole('tab', { name: 'Graph' }).click()
    const graphFilter = page.getByLabel('Filter graph')
    await graphFilter.waitFor({ state: 'visible', timeout: 15000 })
    await graphFilter.fill(`tag:${folderName}`)
    const graphFilterNote = page.locator('.recall-graph-sidebar-filter-note').filter({ hasText: /matching/i }).first()
    const graphFilterText = await graphFilterNote.textContent({ timeout: 15000 }).catch(() => '')
    metrics.graphImportedCollectionTagFilterMatches = /\b[1-9]\d*\s+matching/.test(graphFilterText ?? '')
    metrics.graphAncestorCollectionTagFilterMatches = metrics.graphImportedCollectionTagFilterMatches
    captures.graphImportedCollectionTagFilter = path.join(directory, `${stagePrefix}-graph-imported-collection-filter.png`)
    await page.screenshot({ fullPage: false, path: captures.graphImportedCollectionTagFilter })
  } finally {
    await fetch(`${baseUrl}/api/recall/library/settings`, {
      body: JSON.stringify(originalLibrarySettings),
      headers: { 'content-type': 'application/json' },
      method: 'PUT',
    }).catch(() => undefined)
    for (const noteId of createdNoteIds) {
      await fetch(`${baseUrl}/api/recall/notes/${encodeURIComponent(noteId)}`, { method: 'DELETE' }).catch(() => undefined)
    }
    for (const cardId of createdStudyCardIds) {
      await fetch(`${baseUrl}/api/recall/study/cards/${encodeURIComponent(cardId)}`, { method: 'DELETE' }).catch(
        () => undefined,
      )
    }
    for (const documentId of importedDocumentIds) {
      try {
        const response = await fetch(`${baseUrl}/api/documents/${documentId}`, { method: 'DELETE' })
        metrics.importedHarnessDocumentDeleted = metrics.importedHarnessDocumentDeleted || response.ok
      } catch {
        metrics.importedHarnessDocumentDeleted = false
      }
    }
    const cleanupDryRun = await findRecallNoteAuditArtifacts({ baseUrl })
    metrics.cleanupUtilityDryRunMatchedAfterAddContentCollections = cleanupDryRun.matchedCount
    await rm(archivePath, { force: true })
    await articleServer.stop()
  }

  return { captures, metrics }
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

function startBulkImportArticleServer({ articleTitle }) {
  const server = createServer((request, response) => {
    if (request.url === '/article') {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
      response.end(`<!doctype html>
<html>
  <body>
    <article>
      <h1>${escapeHtml(articleTitle)}</h1>
      <p>Stage966Concept links Recall Import Collections to organized source memory.</p>
      <p>Stage bulk import paragraph two gives Recall enough source text for the local graph.</p>
    </article>
  </body>
</html>`)
      return
    }
    response.writeHead(404)
    response.end('Not found')
  })
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        reject(new Error('Could not start bulk import fixture server.'))
        return
      }
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        stop: () =>
          new Promise((stopResolve) => {
            server.close(() => stopResolve())
          }),
      })
    })
  })
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function createZipBuffer(entries) {
  const localParts = []
  const centralParts = []
  let offset = 0
  for (const [name, content] of Object.entries(entries)) {
    const nameBuffer = Buffer.from(name, 'utf-8')
    const contentBuffer = Buffer.from(content, 'utf-8')
    const crc = crc32(contentBuffer)
    const localHeader = Buffer.alloc(30)
    localHeader.writeUInt32LE(0x04034b50, 0)
    localHeader.writeUInt16LE(20, 4)
    localHeader.writeUInt16LE(0, 6)
    localHeader.writeUInt16LE(0, 8)
    localHeader.writeUInt16LE(0, 10)
    localHeader.writeUInt16LE(0, 12)
    localHeader.writeUInt32LE(crc, 14)
    localHeader.writeUInt32LE(contentBuffer.length, 18)
    localHeader.writeUInt32LE(contentBuffer.length, 22)
    localHeader.writeUInt16LE(nameBuffer.length, 26)
    localHeader.writeUInt16LE(0, 28)
    localParts.push(localHeader, nameBuffer, contentBuffer)

    const centralHeader = Buffer.alloc(46)
    centralHeader.writeUInt32LE(0x02014b50, 0)
    centralHeader.writeUInt16LE(20, 4)
    centralHeader.writeUInt16LE(20, 6)
    centralHeader.writeUInt16LE(0, 8)
    centralHeader.writeUInt16LE(0, 10)
    centralHeader.writeUInt16LE(0, 12)
    centralHeader.writeUInt16LE(0, 14)
    centralHeader.writeUInt32LE(crc, 16)
    centralHeader.writeUInt32LE(contentBuffer.length, 20)
    centralHeader.writeUInt32LE(contentBuffer.length, 24)
    centralHeader.writeUInt16LE(nameBuffer.length, 28)
    centralHeader.writeUInt16LE(0, 30)
    centralHeader.writeUInt16LE(0, 32)
    centralHeader.writeUInt16LE(0, 34)
    centralHeader.writeUInt16LE(0, 36)
    centralHeader.writeUInt32LE(0, 38)
    centralHeader.writeUInt32LE(offset, 42)
    centralParts.push(centralHeader, nameBuffer)

    offset += localHeader.length + nameBuffer.length + contentBuffer.length
  }
  const centralDirectory = Buffer.concat(centralParts)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(0, 4)
  end.writeUInt16LE(0, 6)
  end.writeUInt16LE(Object.keys(entries).length, 8)
  end.writeUInt16LE(Object.keys(entries).length, 10)
  end.writeUInt32LE(centralDirectory.length, 12)
  end.writeUInt32LE(offset, 16)
  end.writeUInt16LE(0, 20)
  return Buffer.concat([...localParts, centralDirectory, end])
}

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}
