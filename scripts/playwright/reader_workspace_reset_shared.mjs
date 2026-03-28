import { captureLocatorScreenshot, captureViewportScreenshot, desktopViewport, openHome, openOriginalReaderFromHome } from './home_rendered_preview_quality_shared.mjs'

function round(value) {
  return Number(value.toFixed(3))
}

export async function openGraph(page, baseUrl) {
  const response = await page.goto(`${baseUrl}/recall?section=graph`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Graph navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

export async function selectReaderView(page, viewLabel) {
  const tab = page.getByRole('tab', { name: viewLabel, exact: true }).first()
  await tab.waitFor({ state: 'visible', timeout: 20000 })
  if ((await tab.getAttribute('aria-selected')) !== 'true') {
    await tab.click()
    await page.waitForTimeout(300)
  }
  if ((await tab.getAttribute('aria-selected')) !== 'true') {
    throw new Error(`Could not switch Reader into ${viewLabel}.`)
  }
}

async function readReaderLayoutMetrics(page, sourceTitle) {
  return page.evaluate(({ sourceTitle: currentSourceTitle }) => {
    const round = (value) => Number(value.toFixed(3))
    const topbar = document.querySelector('header.workspace-topbar')
    const sourceWorkspace = document.querySelector('.source-workspace-frame-reader-active')
    const stage = document.querySelector('.reader-reading-stage')
    const stageShell = stage?.querySelector('.reader-stage-shell')
    const controlRibbon = stage?.querySelector('.reader-stage-control-ribbon')
    const supportRow = stage?.querySelector('.reader-stage-support-row')
    const article = stage?.querySelector('.reader-article-shell')
    const dock = stage?.querySelector('.reader-support-dock')
    const libraryShell = dock?.querySelector('.reader-support-library-shell')
    const readerTabs = dock?.querySelector('.reader-support-tabs')
    const sourceBadge = sourceWorkspace?.querySelector('.source-workspace-strip-badge')
    const headingCountForSourceTitle = Array.from(document.querySelectorAll('h1, h2, h3'))
      .map((node) => node.textContent?.trim() ?? '')
      .filter((text) => text === currentSourceTitle).length
    const sentenceButtons = Array.from(document.querySelectorAll('[data-reader-sentence="true"]'))
      .map((node) => node.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)

    if (!(topbar instanceof HTMLElement)) {
      throw new Error('Reader topbar is not available for the Stage 700 audit.')
    }
    if (!(sourceWorkspace instanceof HTMLElement)) {
      throw new Error('Reader source workspace strip is not available for the Stage 700 audit.')
    }
    if (!(stage instanceof HTMLElement) || !(stageShell instanceof HTMLElement) || !(controlRibbon instanceof HTMLElement)) {
      throw new Error('Reader stage shell is not available for the Stage 700 audit.')
    }
    if (!(article instanceof HTMLElement) || !(dock instanceof HTMLElement)) {
      throw new Error('Reader article lane or support dock is not available for the Stage 700 audit.')
    }

    const sourceWorkspaceBox = sourceWorkspace.getBoundingClientRect()
    const stageShellBox = stageShell.getBoundingClientRect()
    const controlRibbonBox = controlRibbon.getBoundingClientRect()
    const articleBox = article.getBoundingClientRect()
    const dockBox = dock.getBoundingClientRect()

    const eyebrowVisible = Array.from(document.querySelectorAll('.workspace-topbar-eyebrow')).some((node) => {
      const text = node.textContent?.trim() ?? ''
      if (!text) {
        return false
      }
      const parent = node instanceof HTMLElement ? node : null
      if (!parent) {
        return false
      }
      const style = window.getComputedStyle(parent)
      return text === 'Reader workspace' && style.display !== 'none' && style.visibility !== 'hidden'
    })

    return {
      dockToArticleWidthRatio: round(dockBox.width / articleBox.width),
      readerContentHeadingCount: headingCountForSourceTitle,
      readerEyebrowVisible: eyebrowVisible,
      readerFirstSentence: sentenceButtons[0] ?? null,
      readerSourceBadgeText: sourceBadge?.textContent?.trim() ?? null,
      readerSourceStripHeight: round(sourceWorkspaceBox.height),
      readerStageChromeHeight: round(stageShellBox.height + controlRibbonBox.height),
      readerStageSupportRowVisible: supportRow instanceof HTMLElement,
      readerSupportDockVisible: true,
      readerSupportLibraryVisible: libraryShell instanceof HTMLElement,
      readerSupportTabsVisible: readerTabs instanceof HTMLElement,
      readerTopbarQuiet: topbar.classList.contains('workspace-topbar-quiet'),
      readerTopbarReader: topbar.classList.contains('workspace-topbar-reader'),
    }
  }, { sourceTitle })
}

async function ensureNotebookWorkbench(page, stagePrefix) {
  await selectReaderView(page, 'Reflowed')

  const addNoteButton = page.getByRole('button', { name: 'Add note' }).first()
  await addNoteButton.waitFor({ state: 'visible', timeout: 20000 })
  await addNoteButton.click()

  const sentenceButtons = page.locator('[data-reader-sentence="true"]')
  await sentenceButtons.first().waitFor({ state: 'visible', timeout: 20000 })
  await sentenceButtons.nth(0).click()
  if ((await sentenceButtons.count()) > 1) {
    await sentenceButtons.nth(1).click()
  }

  const draftBody = `${stagePrefix} reader notebook handoff`
  await page.getByRole('textbox', { name: 'Optional note' }).fill(draftBody)
  await page.getByRole('button', { name: 'Save note' }).click()
  await page.getByRole('textbox', { name: 'Note text' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)

  return page.evaluate(() => {
    const notesTab = Array.from(document.querySelectorAll('.reader-support-tabs [role="tab"]')).find(
      (node) => node.textContent?.trim() === 'Notebook',
    )
    const selectedNote = document.querySelector('.reader-note-workbench')
    const noteText = document.querySelector('textarea[placeholder*="Add context"]')
    const promoteGraphButton = Array.from(document.querySelectorAll('button')).find(
      (node) => node.textContent?.trim() === 'Promote to Graph',
    )
    const createStudyButton = Array.from(document.querySelectorAll('button')).find(
      (node) => node.textContent?.trim() === 'Create Study Card',
    )

    return {
      notebookTabSelected: notesTab?.getAttribute('aria-selected') === 'true',
      promoteGraphVisible: promoteGraphButton instanceof HTMLElement,
      selectedNoteTextLength: noteText instanceof HTMLTextAreaElement ? noteText.value.trim().length : 0,
      selectedNoteWorkbenchVisible: selectedNote instanceof HTMLElement,
      studyPromotionVisible: createStudyButton instanceof HTMLElement,
    }
  })
}

export async function captureReaderWorkspaceResetEvidence({
  baseUrl,
  directory,
  page,
  stagePrefix,
}) {
  const originalReader = await openOriginalReaderFromHome(page, directory, stagePrefix, baseUrl)
  const sourceWorkspace = page.getByRole('region', { name: `${originalReader.sourceTitle} workspace` }).first()
  const readerDock = page.locator('.reader-support-dock').first()
  const readerStage = page.locator('.reader-reading-stage').first()
  const sourceStripCapture = await captureLocatorScreenshot(page, sourceWorkspace, directory, `${stagePrefix}-reader-source-strip.png`)
  const readerStageCapture = await captureViewportScreenshot(page, directory, `${stagePrefix}-reader-wide-top.png`)
  const readerDockCapture = await captureLocatorScreenshot(page, readerDock, directory, `${stagePrefix}-reader-dock.png`)
  const originalMetrics = await readReaderLayoutMetrics(page, originalReader.sourceTitle)

  const notebookMetrics = await ensureNotebookWorkbench(page, stagePrefix)
  const notebookWorkbenchCapture = await captureLocatorScreenshot(
    page,
    readerDock,
    directory,
    `${stagePrefix}-reader-notebook-workbench.png`,
  )
  const reflowedReaderCapture = await captureViewportScreenshot(page, directory, `${stagePrefix}-reader-reflowed-wide-top.png`)

  return {
    captures: {
      notebookWorkbenchCapture,
      readerDockCapture,
      readerOriginalWideTop: originalReader.capture,
      readerStageCapture,
      readerReflowedWideTop: reflowedReaderCapture,
      sourceStripCapture,
    },
    metrics: {
      originalReaderSourceTitle: originalReader.sourceTitle,
      ...originalMetrics,
      ...notebookMetrics,
    },
  }
}

export async function captureReaderRegressionEvidence({
  baseUrl,
  directory,
  page,
  stagePrefix,
}) {
  await openHome(page, baseUrl)
  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-wide-top.png`)
  await openGraph(page, baseUrl)
  const graphWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-graph-wide-top.png`)
  return {
    captures: {
      graphWideTop,
      homeWideTop,
    },
  }
}

export { desktopViewport }
