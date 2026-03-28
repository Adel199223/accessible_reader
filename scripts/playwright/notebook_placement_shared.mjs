import { captureViewportScreenshot, openHome } from './home_rendered_preview_quality_shared.mjs'

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeTexts(values) {
  return values.map((value) => value.replace(/\s+/g, ' ').trim()).filter(Boolean)
}

async function getWorkspaceSectionLabels(page) {
  return normalizeTexts(await page.locator('.workspace-rail-nav [role="tab"]').allInnerTexts())
}

async function openNotebookFromHome(page, baseUrl) {
  await openHome(page, baseUrl)
  await page.getByRole('button', { name: 'New note' }).waitFor()
  await page.getByRole('button', { name: 'New note' }).click()
  await page.getByRole('heading', { name: 'Notebook', exact: true }).waitFor()
  await page.getByRole('heading', { name: 'Note detail', exact: true }).waitFor()
}

async function resolveNotebookSource(page) {
  const sourceSelect = page.getByRole('combobox', { name: 'Source' })
  if ((await sourceSelect.count()) === 0) {
    throw new Error('Notebook source selector is not available.')
  }

  const optionCount = await sourceSelect.locator('option').count()
  let fallbackOption = null
  for (let index = 0; index < optionCount; index += 1) {
    const option = sourceSelect.locator('option').nth(index)
    const value = await option.getAttribute('value')
    const label = (await option.innerText()).replace(/\s+/g, ' ').trim()
    if (!value) {
      continue
    }
    if (!fallbackOption) {
      fallbackOption = { documentId: value, documentTitle: label }
    }
    if (value === 'doc-search') {
      await sourceSelect.selectOption(value)
      return { documentId: value, documentTitle: label }
    }
  }

  if (!fallbackOption) {
    throw new Error('Notebook source selector does not expose any saved sources.')
  }

  await sourceSelect.selectOption(fallbackOption.documentId)
  return fallbackOption
}

async function createNotebookSeedNote(page, baseUrl, documentId, noteBody) {
  await page.goto(`${baseUrl}/reader?document=${encodeURIComponent(documentId)}`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Add note' }).waitFor()
  await page.getByRole('button', { name: 'Add note' }).click()
  const sentenceButtons = page.locator('[data-reader-sentence="true"]')
  await sentenceButtons.first().waitFor()
  await sentenceButtons.nth(0).click()
  if ((await sentenceButtons.count()) > 1) {
    await sentenceButtons.nth(1).click()
  }
  await page.getByRole('textbox', { name: 'Optional note' }).fill(noteBody)
  await page.getByRole('button', { name: 'Save note' }).click()
  await page.getByRole('textbox', { name: 'Note text' }).waitFor()
}

async function ensureNotebookNoteSelection(page, baseUrl, documentId, noteBody) {
  const noteRows = page.locator('.recall-notes-browser-list > button')
  if ((await noteRows.count()) === 0) {
    await createNotebookSeedNote(page, baseUrl, documentId, noteBody)
    await openNotebookFromHome(page, baseUrl)
    const sourceSelect = page.getByRole('combobox', { name: 'Source' })
    if ((await sourceSelect.count()) > 0) {
      await sourceSelect.selectOption(documentId)
    }
  }

  if ((await noteRows.count()) === 0) {
    throw new Error('Notebook did not expose any visible note rows after seeding doc-search.')
  }

  await noteRows.first().click()
  await page.getByRole('textbox', { name: 'Note text' }).waitFor()
}

async function openGlobalSearch(page) {
  await page.keyboard.press('Control+K')
  await page.getByRole('dialog', { name: 'Search your workspace' }).waitFor()
  return page.getByRole('dialog', { name: 'Search your workspace' })
}

async function findSearchSectionByHeading(dialog, headingText) {
  const sections = dialog.locator('section')
  const sectionCount = await sections.count()

  for (let index = 0; index < sectionCount; index += 1) {
    const section = sections.nth(index)
    const heading = normalizeTexts([await section.locator('h3').first().textContent().catch(() => '')])[0] ?? ''
    if (heading === headingText) {
      return section
    }
  }

  return null
}

async function resolveNotebookSearchResult(dialog, preferredQueries) {
  const searchInput = dialog.getByRole('searchbox', { name: 'Search' })
  const fallbackQueries = ['search sentence', 'search note', 'useful']
  const candidateQueries = normalizeTexts([...(preferredQueries ?? []), ...fallbackQueries])

  for (const query of candidateQueries) {
    await searchInput.fill(query)
    let notebookSection = null

    for (let attempt = 0; attempt < 20; attempt += 1) {
      await dialog.page().waitForTimeout(150)
      const loadingVisible = await dialog.getByText('Searching…', { exact: true }).isVisible().catch(() => false)
      notebookSection = await findSearchSectionByHeading(dialog, 'Notebook')
      const resultCount = notebookSection ? await notebookSection.locator('.workspace-search-result').count() : 0
      if (!loadingVisible && notebookSection && resultCount > 0) {
        break
      }
    }

    if (!notebookSection) {
      continue
    }

    const resultButtons = notebookSection.locator('.workspace-search-result')
    if ((await resultButtons.count()) === 0) {
      continue
    }

    const preferredButton = notebookSection
      .locator('.workspace-search-result')
      .filter({ hasText: new RegExp(escapeRegExp(query), 'i') })
    const fallbackButtonByName = notebookSection.getByRole('button', {
      name: new RegExp(escapeRegExp(query), 'i'),
    })
    const resultButton =
      (await preferredButton.count()) > 0
        ? preferredButton.first()
        : (await fallbackButtonByName.count()) > 0
          ? fallbackButtonByName.first()
          : resultButtons.first()
    const resultLabel = (await resultButton.innerText()).replace(/\s+/g, ' ').trim()

    return {
      query,
      resultButton,
      resultLabel,
    }
  }

  throw new Error('Could not find a Notebook search result in the global search dialog.')
}

async function captureSourceFocusedNotebookForDocument(page, directory, stagePrefix, baseUrl, documentId, documentTitle) {
  await page.goto(`${baseUrl}/reader?document=${encodeURIComponent(documentId)}`, { waitUntil: 'networkidle' })
  await page.getByRole('region', { name: `${documentTitle} workspace` }).waitFor()
  await page.getByRole('tab', { name: 'Source workspace Notebook' }).click()
  await page.getByRole('heading', { name: 'Notebook', exact: true }).waitFor()
  await page.getByRole('heading', { name: 'Reader', exact: true }).waitFor()
  await page.getByRole('region', { name: `${documentTitle} workspace` }).waitFor()
  const sourceFocusedNoteRows = page.locator('.recall-notes-browser-list > button')
  if ((await sourceFocusedNoteRows.count()) > 0) {
    await sourceFocusedNoteRows.first().click()
    await page.getByRole('textbox', { name: 'Note text' }).waitFor()
  }

  return {
    capture: await captureViewportScreenshot(page, directory, `${stagePrefix}-source-focused-notebook-wide-top.png`),
    metrics: {
      sourceFocusedNotebookDetailRestyled:
        (await page.locator('.recall-note-detail-panel-stage698').count()) > 0,
      sourceFocusedNotebookRailRestyled:
        (await page.locator('.recall-notes-focus-rail-stage698').count()) > 0,
      sourceFocusedWorkbenchLayout:
        (await page
          .locator('.recall-note-detail-panel [data-note-workbench-layout]')
          .first()
          .getAttribute('data-note-workbench-layout')
          .catch(() => null)) ?? null,
    },
  }
}

async function captureNotesAlias(page, directory, stagePrefix, baseUrl) {
  await page.goto(`${baseUrl}/recall?section=notes`, { waitUntil: 'networkidle' })
  await page.getByRole('tab', { name: 'Home', selected: true }).waitFor()
  await page.getByRole('heading', { name: 'Notebook', exact: true }).waitFor()
  return captureViewportScreenshot(page, directory, `${stagePrefix}-notes-alias-wide-top.png`)
}

async function captureGraphRegression(page, directory, stagePrefix, baseUrl) {
  await openHome(page, baseUrl)
  await page.getByRole('tab', { name: 'Graph' }).click()
  await page.getByRole('tab', { name: 'Graph', selected: true }).waitFor()
  await page.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor()
  return captureViewportScreenshot(page, directory, `${stagePrefix}-graph-wide-top.png`)
}

export async function captureNotebookPlacementEvidence({
  baseUrl,
  directory,
  page,
  stagePrefix,
}) {
  await openHome(page, baseUrl)
  await page.getByRole('button', { name: 'Add', exact: true }).waitFor()
  await page.getByRole('button', { name: 'New note', exact: true }).waitFor()

  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)
  const workspaceSections = await getWorkspaceSectionLabels(page)
  const addButton = page.getByRole('button', { name: 'Add', exact: true })
  const newNoteButton = page.getByRole('button', { name: 'New note', exact: true })
  const addBox = await addButton.boundingBox()
  const newNoteBox = await newNoteButton.boundingBox()
  const newNoteBesideAdd = Boolean(
    addBox &&
      newNoteBox &&
      Math.abs(addBox.y - newNoteBox.y) < 24 &&
      newNoteBox.x >= addBox.x + addBox.width - 8,
  )
  const seedNoteBody = `${stagePrefix} notebook handoff note`

  await openNotebookFromHome(page, baseUrl)
  const { documentId, documentTitle } = await resolveNotebookSource(page)
  await ensureNotebookNoteSelection(page, baseUrl, documentId, seedNoteBody)
  const notebookWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-notebook-wide-top.png`)
  const desktopWorkbenchLayout =
    (await page
      .locator('.recall-note-detail-stage [data-note-workbench-layout]')
      .first()
      .getAttribute('data-note-workbench-layout')
      .catch(() => null)) ?? null
  const desktopNotebookShellRestyled = (await page.locator('.recall-notes-stage-shell-stage698').count()) > 0
  const desktopNotebookDetailRestyled = (await page.locator('.recall-note-detail-stage698').count()) > 0
  const desktopNotebookNativeRowsVisible = (await page.locator('[data-note-browser-row-kind="library-note"]').count()) > 0

  const noteText = (await page.getByRole('textbox', { name: 'Note text' }).inputValue()).trim()
  const noteRowText = (
    await page.locator('.recall-notes-browser-list > button').first().innerText()
  ).replace(/\s+/g, ' ').trim()
  const noteQuery = noteText.replace(/[.]+$/u, '').trim() || 'search note'
  const noteRowLead = noteRowText.split('·')[0]?.trim() || noteRowText
  const searchCandidates = [noteQuery, noteRowLead, documentTitle]
  const notebookItemCount = await page.locator('.recall-notes-browser-list > button').count()

  const searchDialog = await openGlobalSearch(page)
  const notebookSearch = await resolveNotebookSearchResult(searchDialog, searchCandidates)
  await notebookSearch.resultButton.click()
  await searchDialog.getByRole('button', { name: 'Open note' }).click()
  await page.getByRole('heading', { name: 'Notebook', exact: true }).waitFor()
  await page.getByRole('textbox', { name: 'Note text' }).waitFor()
  const searchNotebookWideTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-search-note-handoff-wide-top.png`,
  )

  const reopenedSearchDialog = await openGlobalSearch(page)
  const reopenedNotebookSearch = await resolveNotebookSearchResult(reopenedSearchDialog, [
    notebookSearch.query,
    notebookSearch.resultLabel,
    ...searchCandidates,
  ])
  await reopenedNotebookSearch.resultButton.click()
  await reopenedSearchDialog.getByRole('button', { name: 'Open in Reader' }).click()
  await page.waitForURL(/\/reader/)
  await page.locator('.reader-sentence-anchored').first().waitFor()
  const searchReaderWideTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-search-note-reader-wide-top.png`,
  )

  const sourceFocusedNotebookEvidence = await captureSourceFocusedNotebookForDocument(
    page,
    directory,
    stagePrefix,
    baseUrl,
    documentId,
    documentTitle,
  )
  const notesAliasWideTop = await captureNotesAlias(page, directory, stagePrefix, baseUrl)
  const graphWideTop = await captureGraphRegression(page, directory, stagePrefix, baseUrl)

  return {
    captures: {
      graphWideTop,
      homeWideTop,
      notebookWideTop,
      notesAliasWideTop,
      searchNotebookWideTop,
      searchReaderWideTop,
      sourceFocusedNotebookWideTop: sourceFocusedNotebookEvidence.capture,
    },
    metrics: {
      desktopNotebookDetailRestyled,
      desktopNotebookNativeRowsVisible,
      desktopNotebookShellRestyled,
      desktopWorkbenchLayout,
      notesAliasResolvedToNotebook: true,
      notesSidebarVisible: workspaceSections.includes('Notes'),
      notebookItemCount,
      notebookSearchResultLabel: notebookSearch.resultLabel,
      notebookSearchValue: notebookSearch.query,
      notebookTabVisible: true,
      notebookSourceDocumentId: documentId,
      notebookSourceDocumentTitle: documentTitle,
      newNoteBesideAdd,
      newNoteVisible: true,
      readerNotebookHandoffVisible: true,
      ...sourceFocusedNotebookEvidence.metrics,
      sourceFocusedNotebookVisible: true,
      workspaceSections,
    },
  }
}
