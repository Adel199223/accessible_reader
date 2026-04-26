import { captureLocatorScreenshot, captureViewportScreenshot, desktopViewport, openGraph, openHome, openOriginalReaderFromHome } from './home_rendered_preview_quality_shared.mjs'

function round(value) {
  return Number(value.toFixed(3))
}

function normalizeMetricText(value) {
  return (value ?? '').replace(/\s+/g, ' ').trim().toLocaleLowerCase()
}

export async function selectReaderView(page, viewLabel) {
  const didSelect = await trySelectReaderView(page, viewLabel)
  if (!didSelect) {
    throw new Error(`Could not switch Reader into ${viewLabel}.`)
  }
}

export async function trySelectReaderView(page, viewLabel) {
  const tab = page.getByRole('tab', { name: viewLabel, exact: true }).first()
  try {
    await tab.waitFor({ state: 'visible', timeout: 8000 })
  } catch {
    return false
  }
  if ((await tab.getAttribute('aria-disabled')) === 'true') {
    return false
  }
  if ((await tab.getAttribute('aria-selected')) !== 'true') {
    await tab.click().catch(() => undefined)
    await page.waitForTimeout(300)
  }
  return (await tab.getAttribute('aria-selected')) === 'true'
}

async function fetchGeneratedModeTarget(baseUrl, mode) {
  const response = await fetch(`${baseUrl}/api/documents`)
  if (!response.ok) {
    throw new Error(`Could not inspect documents for Reader audit mode ${mode}, received ${response.status}.`)
  }
  const documents = await response.json()
  if (!Array.isArray(documents)) {
    throw new Error('Reader audit expected /api/documents to return an array.')
  }
  const targetDocument = documents.find((document) => Array.isArray(document.available_modes) && document.available_modes.includes(mode))
  if (!targetDocument || typeof targetDocument.id !== 'string' || typeof targetDocument.title !== 'string') {
    throw new Error(`Reader audit requires at least one ${mode}-capable document in the local library.`)
  }

  let snippet = null
  const query =
    mode === 'summary'
      ? `${baseUrl}/api/documents/${targetDocument.id}/view?mode=summary&detail_level=balanced`
      : `${baseUrl}/api/documents/${targetDocument.id}/view?mode=${encodeURIComponent(mode)}`
  const viewResponse = await fetch(query)
  if (viewResponse.ok) {
    const modeView = await viewResponse.json()
    snippet =
      Array.isArray(modeView?.blocks) && typeof modeView.blocks[0]?.text === 'string'
        ? modeView.blocks[0].text.trim()
        : null
  }

  return {
    documentId: targetDocument.id,
    mode,
    snippet,
    title: targetDocument.title,
  }
}

async function fetchDocumentRecord(baseUrl, documentId) {
  const response = await fetch(`${baseUrl}/api/documents`)
  if (!response.ok) {
    throw new Error(`Could not inspect documents for Reader audit record ${documentId}, received ${response.status}.`)
  }
  const documents = await response.json()
  if (!Array.isArray(documents)) {
    throw new Error('Reader audit expected /api/documents to return an array.')
  }
  const targetDocument = documents.find((document) => document?.id === documentId)
  if (!targetDocument) {
    throw new Error(`Reader audit could not find document ${documentId} in /api/documents.`)
  }
  return targetDocument
}

async function fetchReaderSourcePreviewTarget(baseUrl) {
  const response = await fetch(`${baseUrl}/api/recall/documents`)
  if (!response.ok) {
    throw new Error(`Could not inspect recall documents for Reader source preview audit, received ${response.status}.`)
  }
  const documents = await response.json()
  if (!Array.isArray(documents)) {
    throw new Error('Reader source preview audit expected /api/recall/documents to return an array.')
  }
  const targetDocument = documents.find((document) => {
    const sourceLocator = typeof document?.source_locator === 'string' ? document.source_locator.trim() : ''
    const fileName = typeof document?.file_name === 'string' ? document.file_name.trim() : ''
    return typeof document?.id === 'string' && typeof document?.title === 'string' && (sourceLocator || fileName)
  })
  if (!targetDocument) {
    throw new Error('Reader source preview audit requires at least one live document with file_name or source_locator.')
  }

  return {
    documentId: targetDocument.id,
    sourcePreview:
      (typeof targetDocument.source_locator === 'string' ? targetDocument.source_locator.trim() : '') ||
      (typeof targetDocument.file_name === 'string' ? targetDocument.file_name.trim() : ''),
    title: targetDocument.title,
  }
}

async function waitForGeneratedModeState(page, viewLabel) {
  await page.waitForFunction(
    (modeLabel) => {
      const article = document.querySelector('.reader-article-field article')
      const emptyState = document.querySelector(`[aria-label="${modeLabel} empty state"]`)
      const currentTab = Array.from(document.querySelectorAll('[role="tab"]')).find((tab) => {
        if (!(tab instanceof HTMLElement)) {
          return false
        }
        return tab.getAttribute('aria-selected') === 'true' && tab.textContent?.replace(/\s+/g, ' ').trim() === modeLabel
      })
      return Boolean(currentTab && (article || emptyState))
    },
    viewLabel,
    { timeout: 20000 },
  )
}

async function openReaderDocument(page, baseUrl, documentId, title) {
  const response = await page.goto(`${baseUrl}/reader?document=${encodeURIComponent(documentId)}`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Reader navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.getByRole('region', { name: `${title} workspace` }).waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('article').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(300)
}

async function installReaderSpeechHarness(page) {
  await page.addInitScript(() => {
    class RecallHarnessSpeechSynthesisUtterance {
      constructor(text) {
        this.text = text
        this.lang = ''
        this.voice = null
        this.volume = 1
        this.rate = 1
        this.pitch = 1
        this.onend = null
        this.onerror = null
      }
    }

    const voices = [
      {
        default: true,
        lang: 'en-US',
        localService: true,
        name: 'Default voice',
        voiceURI: 'default',
      },
    ]

    const synthesis = {
      paused: false,
      pending: false,
      speaking: false,
      addEventListener() {},
      cancel() {
        this.paused = false
        this.pending = false
        this.speaking = false
      },
      getVoices() {
        return voices
      },
      pause() {
        if (this.speaking) {
          this.paused = true
        }
      },
      removeEventListener() {},
      resume() {
        if (this.speaking) {
          this.paused = false
        }
      },
      speak(utterance) {
        window.__recallReaderHarnessLastUtterance = utterance
        this.paused = false
        this.pending = false
        this.speaking = true
      },
    }

    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: RecallHarnessSpeechSynthesisUtterance,
      writable: true,
    })
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: synthesis,
    })
  })
}

async function openReaderControlsOverflow(page) {
  const panel = page.getByRole('group', { name: 'More reading controls' })
  if (await panel.isVisible().catch(() => false)) {
    return panel
  }
  await page.getByRole('button', { name: 'More reading controls' }).click()
  await panel.waitFor({ state: 'visible', timeout: 20000 })
  return panel
}

async function readReaderControlsOverflowMetrics(page, panel) {
  const layoutMetrics = await panel.evaluate((node) => {
    const round = (value) => Number(value.toFixed(3))
    const sameRow = (leftNode, rightNode) => {
      if (!(leftNode instanceof HTMLElement) || !(rightNode instanceof HTMLElement)) {
        return false
      }
      const leftRect = leftNode.getBoundingClientRect()
      const rightRect = rightNode.getBoundingClientRect()
      const leftCenter = (leftRect.top + leftRect.bottom) / 2
      const rightCenter = (rightRect.top + rightRect.bottom) / 2
      return Math.abs(leftCenter - rightCenter) <= Math.max(leftRect.height, rightRect.height)
    }
    const panelRect = node.getBoundingClientRect()
    const themeGroup = node.querySelector('.controls-overflow-theme')
    const themeLabel = themeGroup?.querySelector('.controls-overflow-section-label')
    const themeOptions = themeGroup?.querySelector('.controls-overflow-theme-options')
    const voiceField = node.querySelector('.controls-overflow-field-inline')
    const voiceLabel = voiceField?.querySelector('.controls-overflow-section-label')
    const voiceControl = voiceField?.querySelector('select')

    return {
      panelHeight: round(panelRect.height),
      panelWidth: round(panelRect.width),
      themeInline: sameRow(themeLabel, themeOptions),
      voiceInline: sameRow(voiceLabel, voiceControl),
    }
  })
  const quickActionLabels = await panel.locator('.controls-overflow-action-button').evaluateAll((buttons) =>
    buttons
      .map((button) => button.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean),
  )
  const themeChoiceLabels = await panel.locator('.controls-overflow-theme-button').evaluateAll((buttons) =>
    buttons
      .map((button) => button.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean),
  )
  const themeGroupVisible = await panel
    .getByRole('group', { name: 'Reading theme' })
    .isVisible()
    .catch(() => false)
  const themeLightVisible = await panel
    .getByRole('button', { name: 'Light theme' })
    .isVisible()
    .catch(() => false)
  const themeDarkVisible = await panel
    .getByRole('button', { name: 'Dark theme' })
    .isVisible()
    .catch(() => false)
  const themeDialogVisible = await page
    .getByRole('dialog', { name: 'Theme' })
    .isVisible()
    .catch(() => false)
  const sentenceLabelVisible = await panel
    .getByText(/^Sentence \d+ of \d+$/)
    .first()
    .isVisible()
    .catch(() => false)
  const shortcutHintVisible = await panel
    .getByText(/Shortcuts:/i)
    .first()
    .isVisible()
    .catch(() => false)
  const voiceControlVisible = await panel
    .getByLabel('Voice')
    .first()
    .isVisible()
    .catch(() => false)
  const rateControlVisible = await panel
    .getByText('Rate', { exact: true })
    .first()
    .isVisible()
    .catch(() => false)

  return {
    actionLabels: quickActionLabels,
    panelHeight: layoutMetrics.panelHeight,
    panelWidth: layoutMetrics.panelWidth,
    rateControlVisible,
    sentenceLabelVisible,
    shortcutHintVisible,
    themeInline: layoutMetrics.themeInline,
    themeChoiceLabels,
    themeDarkVisible,
    themeDialogVisible,
    themeGroupVisible,
    themeLightVisible,
    voiceInline: layoutMetrics.voiceInline,
    voiceControlVisible,
  }
}

async function selectReaderOverflowAction(page, label) {
  const panel = await openReaderControlsOverflow(page)
  await panel.getByRole('button', { name: label, exact: true }).click()
  await page.waitForTimeout(250)
}

async function openReaderSupportTab(page, label) {
  const visibleSupportTab = page.getByRole('tab', { name: label, exact: true })
  if (await visibleSupportTab.isVisible().catch(() => false)) {
    await visibleSupportTab.click()
    await page.waitForTimeout(250)
    return
  }

  await page.getByRole('button', { name: 'Open nearby notebook notes' }).click()
  await page.waitForTimeout(250)
  if (label === 'Source') {
    await page.getByRole('tab', { name: 'Source', exact: true }).click()
    await page.waitForTimeout(250)
  }
}

async function readReaderMetrics(page, expectedTitle, expectedSnippet) {
  return page.evaluate(({ currentTitle, expectedGeneratedSnippet }) => {
    const round = (value) => Number(value.toFixed(3))
    const normalizeMetricText = (value) => (value ?? '').replace(/\s+/g, ' ').trim().toLocaleLowerCase()
    const isVisible = (node) => {
      if (!(node instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(node)
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
    }
    const isVisuallyPresent = (node) => {
      if (!(node instanceof HTMLElement) || !isVisible(node)) {
        return false
      }
      const rect = node.getBoundingClientRect()
      return rect.width > 4 && rect.height > 4
    }
    const sharesRow = (leftRect, rightRect) => {
      if (!leftRect || !rightRect) {
        return false
      }
      const leftCenter = (leftRect.top + leftRect.bottom) / 2
      const rightCenter = (rightRect.top + rightRect.bottom) / 2
      return Math.abs(leftCenter - rightCenter) <= Math.max(leftRect.height, rightRect.height)
    }
    const topbar = document.querySelector('header.workspace-topbar')
    const topbarTitle = topbar?.querySelector('h1')
    const stage = document.querySelector('.reader-reading-stage')
    const sourceWorkspace = document.querySelector('.source-workspace-frame-reader-active')
    const stageShell = stage?.querySelector('.reader-stage-shell')
    const controlRibbon =
      sourceWorkspace?.querySelector('.reader-stage-control-ribbon') ??
      stage?.querySelector('.reader-stage-control-ribbon')
    const deckLayout = stage?.querySelector('.reader-reading-deck-layout')
    const article = stage?.querySelector('.reader-article-shell')
    const articleField = stage?.querySelector('.reader-article-field')
    const shortDocumentCompletionStrip = stage?.querySelector('.reader-short-document-completion-strip')
    const activeListenSeam =
      sourceWorkspace?.querySelector('.reader-active-listen-seam-stage878') ??
      stage?.querySelector('.reader-active-listen-seam-stage878')
    const dock = stage?.querySelector('.reader-support-dock')
    const inlineSupport = stage?.querySelector('.reader-inline-support')
    const supportSurface = dock instanceof HTMLElement ? dock : inlineSupport instanceof HTMLElement ? inlineSupport : null
    const sourceWorkspaceInner =
      sourceWorkspace instanceof HTMLElement
        ? sourceWorkspace.querySelector('.source-workspace-frame-inner')
        : null
    const sourceWorkspaceActions = sourceWorkspace?.querySelector('.source-workspace-strip-actions')
    const sourceWorkspaceMain = sourceWorkspace?.querySelector('.source-workspace-strip-main')
    const sourceLibraryPane =
      supportSurface instanceof HTMLElement ? supportSurface.querySelector('.library-pane') : document.querySelector('.library-pane')
    const sourceLibraryHeading = Array.from(supportSurface?.querySelectorAll('h2') ?? []).find(
      (heading) => heading.textContent?.replace(/\s+/g, ' ').trim() === 'Source library',
    )
    const sourceLibraryStatus = sourceLibraryPane?.querySelector('.library-pane-toolbar p')
    const sourceLibrarySearchLabel = sourceLibraryPane?.querySelector('.field > span')
    const notebookHeading = Array.from(document.querySelectorAll('h3')).find(
      (heading) => heading.textContent?.replace(/\s+/g, ' ').trim() === 'Notebook',
    )
    const savedNotesList = document.querySelector('.reader-saved-notes')
    const savedNoteButtons = Array.from(savedNotesList?.querySelectorAll('.reader-saved-note') ?? []).filter((button) =>
      isVisible(button),
    )
    const savedNoteActiveTile = savedNoteButtons.find((button) => button.getAttribute('aria-pressed') === 'true')
    const firstSavedNoteButton = savedNoteButtons[0]
    const savedNoteSecondary = firstSavedNoteButton?.querySelector('.reader-saved-note-secondary')
    const savedNoteExcerpt = firstSavedNoteButton?.querySelector('small')
    const savedNoteTextLayerCount =
      firstSavedNoteButton instanceof HTMLElement
        ? Array.from(firstSavedNoteButton.children).filter((node) => isVisible(node)).length
        : 0
    const savedNoteMaxHeight =
      savedNoteButtons.length > 0
        ? round(
            Math.max(
              ...savedNoteButtons.map((button) =>
                button instanceof HTMLElement ? button.getBoundingClientRect().height : 0,
              ),
            ),
          )
        : null
    const noteWorkbench = document.querySelector('.reader-note-workbench')
    const noteWorkbenchHeading = Array.from(noteWorkbench?.querySelectorAll('h3') ?? []).find(
      (heading) => heading.textContent?.replace(/\s+/g, ' ').trim() === 'Selected note',
    )
    const noteWorkbenchIntro = Array.from(noteWorkbench?.querySelectorAll('p') ?? []).find(
      (paragraph) =>
        paragraph.textContent?.replace(/\s+/g, ' ').trim() ===
        'Edit the note text and promote grounded knowledge without leaving Reader.',
    )
    const noteWorkbenchMetaLabels = Array.from(noteWorkbench?.querySelectorAll('.reader-note-detail-meta [role="listitem"]') ?? [])
      .filter((item) => isVisible(item))
      .map((item) => item.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)
    const noteWorkbenchPreview = noteWorkbench?.querySelector('[aria-label="Selected note anchor"]')
    const noteWorkbenchPreviewHeading = Array.from(noteWorkbenchPreview?.querySelectorAll('strong') ?? []).find(
      (label) => label.textContent?.replace(/\s+/g, ' ').trim() === 'Highlighted passage',
    )
    const noteWorkbenchPreviewMeta = noteWorkbenchPreview?.querySelector('.reader-note-preview-meta')
    const summaryDetailGroup = document.querySelector('.reader-derived-context [aria-label="Summary detail"]')
    const derivedContext = document.querySelector('.reader-derived-context')
    const derivedContextActions = derivedContext?.querySelector('.reader-derived-context-actions')
    const derivedContextHeaderRow = derivedContext?.querySelector('.reader-derived-context-header-row')
    const derivedContextDescriptor = derivedContext?.querySelector('.reader-derived-context-kicker')
    const derivedDetailLabel = derivedContext?.querySelector('.reader-stage-strip-label')
    const derivedDetailShell = derivedContext?.querySelector('.reader-derived-detail-shell')
    const derivedContextSummary = derivedContext?.querySelector('.reader-derived-context-heading p')
    const derivedContextMetaLabels = Array.from(derivedContext?.querySelectorAll('.reader-derived-context-meta [role="listitem"]') ?? [])
      .filter((item) => isVisible(item))
      .map((item) => item.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)
    const generatedEmptyState = stage?.querySelector('.reader-generated-empty-state')
    const shortDocumentCompletionStripBox =
      shortDocumentCompletionStrip instanceof HTMLElement ? shortDocumentCompletionStrip.getBoundingClientRect() : null
    const activeListenSeamBox =
      activeListenSeam instanceof HTMLElement ? activeListenSeam.getBoundingClientRect() : null
    const activeListenStatus = activeListenSeam?.querySelector('.reader-active-listen-status')
    const activeListenProgress = activeListenSeam?.querySelector('.reader-active-listen-progress')
    const activeListenExcerpt = activeListenSeam?.querySelector('.reader-active-listen-excerpt')
    const activeListenPrimary = activeListenSeam?.querySelector('.reader-active-listen-primary')
    const shortDocumentCompletionSourceHandoff = shortDocumentCompletionStrip?.querySelector(
      '[aria-label="Open Source from short document completion"]',
    )
    const shortDocumentCompletionNotebookHandoff = shortDocumentCompletionStrip?.querySelector(
      '[aria-label="Open Notebook notes from short document completion"]',
    )
    const derivedContextActionLabels = Array.from(derivedContext?.querySelectorAll('.reader-derived-context-branch-group button') ?? [])
      .filter((button) => isVisible(button))
      .map((button) => button.getAttribute('aria-label') ?? button.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)
    const stageHeading = stage?.querySelector('.reader-stage-heading')
    const stageMetadataRow = stage?.querySelector('.reader-stage-glance-meta')
    const workspaceInlineError = document.querySelector('.reader-workspace > .inline-error')
    const sourceStripHeading = sourceWorkspace?.querySelector('.source-workspace-strip-heading')
    const sourceMeta = sourceWorkspace?.querySelector('.source-workspace-meta')
    const stripTitleHeading = sourceWorkspace?.querySelector('.source-workspace-title-heading')
    const sourcePreview = sourceWorkspace?.querySelector('.source-workspace-source')
    const stageUtility = stage?.querySelector('.reader-stage-utility')
    const stageVisibleStripLabels = Array.from(stage?.querySelectorAll('.reader-stage-strip-label') ?? []).filter((node) => {
      if (!(node instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(node)
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
    })
    const stageMetadataItems = Array.from(stage?.querySelectorAll('.reader-stage-glance-meta [role="listitem"]') ?? [])
      .map((node) => node.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)
    const settingsButtonLabel = stage?.querySelector('.reader-stage-settings-button .reader-stage-action-label')
    const supportTabLabelsVisible = Array.from(supportSurface?.querySelectorAll('.reader-support-tab-label') ?? []).some((node) =>
      isVisible(node),
    )
    const supportMetaChips = Array.from(supportSurface?.querySelectorAll('[aria-label="Reader dock summary"] [role="listitem"]') ?? [])
    const supportGlanceVisible = Array.from(dock?.querySelectorAll('.reader-support-glance') ?? []).some((node) =>
      isVisible(node),
    )
    const supportLegacyHeadingVisible = Array.from(dock?.querySelectorAll('h2, h3') ?? []).some((node) => {
      const text = node.textContent?.replace(/\s+/g, ' ').trim()
      return text === 'Active source' && isVisible(node)
    })
    const supportFootnoteVisible = Array.from(
      dock?.querySelectorAll('.reader-support-glance-footnote, .sidebar-footnote') ?? [],
    ).some((node) => isVisible(node))
    const supportCopyVisibleAtRest =
      supportSurface instanceof HTMLElement &&
      (supportSurface.classList.contains('reader-inline-support') ||
        supportSurface.classList.contains('reader-support-dock-collapsed')) &&
      /(Capture ready|Switch to Reflowed|Support compact|saved note|Saved locally|Ready for the next source|Ready when a source opens)/i.test(
        supportSurface.textContent ?? '',
      )

    if (!(stage instanceof HTMLElement) || !(controlRibbon instanceof HTMLElement)) {
      throw new Error('Reader stage shell is not available for the Stage 710 audit.')
    }
    if (!(sourceWorkspace instanceof HTMLElement)) {
      throw new Error('Reader source workspace is not available for the Stage 710 audit.')
    }

    const sourceWorkspaceBox = sourceWorkspace.getBoundingClientRect()
    const sourceWorkspaceInnerBox =
      sourceWorkspaceInner instanceof HTMLElement ? sourceWorkspaceInner.getBoundingClientRect() : sourceWorkspaceBox
    const stageBox = stage.getBoundingClientRect()
    const stageShellBox = stageShell instanceof HTMLElement ? stageShell.getBoundingClientRect() : null
    const controlRibbonBox = controlRibbon.getBoundingClientRect()
    const firstModeTab =
      controlRibbon.querySelector('.reader-stage-mode-strip [role="tab"]') instanceof HTMLElement
        ? controlRibbon.querySelector('.reader-stage-mode-strip [role="tab"]')
        : null
    const modeStripBox =
      controlRibbon.querySelector('.reader-stage-mode-strip') instanceof HTMLElement
        ? controlRibbon.querySelector('.reader-stage-mode-strip').getBoundingClientRect()
        : null
    const primaryTransportButton =
      controlRibbon.querySelector('.reader-stage-transport-tools .transport-button-primary-labeled') instanceof HTMLElement
        ? controlRibbon.querySelector('.reader-stage-transport-tools .transport-button-primary-labeled')
        : null
    const primaryTransportLabel =
      primaryTransportButton?.querySelector('.transport-button-label') instanceof HTMLElement
        ? primaryTransportButton.querySelector('.transport-button-label')
        : null
    const primaryTransportIcon =
      primaryTransportButton?.querySelector('.transport-icon') instanceof SVGElement
        ? primaryTransportButton.querySelector('.transport-icon')
        : null
    const primaryTransportUsesSpeechIcon =
      primaryTransportButton?.querySelector('.transport-icon-read-aloud-start') instanceof SVGElement
    const transportStripBox =
      controlRibbon.querySelector('.reader-stage-transport-strip') instanceof HTMLElement
        ? controlRibbon.querySelector('.reader-stage-transport-strip').getBoundingClientRect()
        : null
    const firstModeTabBox = firstModeTab instanceof HTMLElement ? firstModeTab.getBoundingClientRect() : null
    const primaryTransportButtonBox =
      primaryTransportButton instanceof HTMLElement ? primaryTransportButton.getBoundingClientRect() : null
    const primaryTransportLabelBox =
      primaryTransportLabel instanceof HTMLElement ? primaryTransportLabel.getBoundingClientRect() : null
    const primaryTransportIconBox =
      primaryTransportIcon instanceof SVGElement ? primaryTransportIcon.getBoundingClientRect() : null
    const primaryTransportButtonStyle =
      primaryTransportButton instanceof HTMLElement ? window.getComputedStyle(primaryTransportButton) : null
    const primaryTransportGapValue = primaryTransportButtonStyle?.columnGap || primaryTransportButtonStyle?.gap || '0'
    const primaryTransportGap = Number.isFinite(Number.parseFloat(primaryTransportGapValue))
      ? Number.parseFloat(primaryTransportGapValue)
      : 0
    const primaryTransportHorizontalPadding = primaryTransportButtonStyle
      ? Number.parseFloat(primaryTransportButtonStyle.paddingLeft || '0') +
        Number.parseFloat(primaryTransportButtonStyle.paddingRight || '0')
      : 0
    const primaryTransportExpectedWidth =
      primaryTransportLabelBox && primaryTransportButtonBox
        ? primaryTransportLabelBox.width +
          (primaryTransportIconBox?.width ?? 0) +
          (primaryTransportIconBox ? primaryTransportGap : 0) +
          primaryTransportHorizontalPadding
        : null
    const primaryTransportLabelClipped =
      primaryTransportButtonBox && primaryTransportExpectedWidth
        ? primaryTransportButtonBox.width + 0.5 < primaryTransportExpectedWidth
        : false
    const deckBox = deckLayout instanceof HTMLElement ? deckLayout.getBoundingClientRect() : null
    const articleBox = article instanceof HTMLElement ? article.getBoundingClientRect() : null
    const articleFieldBox = articleField instanceof HTMLElement ? articleField.getBoundingClientRect() : null
    const articleFieldShortDocument =
      articleField instanceof HTMLElement && articleField.classList.contains('reader-article-field-short-document')
    const articleFieldContentFitStage864 =
      articleFieldShortDocument &&
      articleField.classList.contains('reader-article-field-short-document-content-fit-stage864') &&
      articleField.getAttribute('data-reader-short-document-content-fit-stage864') === 'true'
    const derivedContextBox = derivedContext instanceof HTMLElement ? derivedContext.getBoundingClientRect() : null
    const dockBox = dock instanceof HTMLElement ? dock.getBoundingClientRect() : null
    const activeViewLabel =
      Array.from(controlRibbon?.querySelectorAll('.reader-stage-mode-strip [role="tab"]') ?? []).find((tab) => {
        if (!(tab instanceof HTMLElement)) {
          return false
        }
        return tab.getAttribute('aria-selected') === 'true'
      })?.textContent?.replace(/\s+/g, ' ').trim() ?? null
    const createGeneratedButton = Array.from(document.querySelectorAll('button')).find(
      (button) =>
        button.textContent?.replace(/\s+/g, ' ').trim() ===
        (activeViewLabel ? `Create ${activeViewLabel}` : '__no_generated_action__'),
    )
    const generatedEmptyStateRetryVisible = Array.from(generatedEmptyState?.querySelectorAll('button') ?? []).some((button) => {
      if (!(button instanceof HTMLElement)) {
        return false
      }
      return button.textContent?.replace(/\s+/g, ' ').trim() === 'Retry loading' && isVisible(button)
    })

    const retiredCopyVisible = Array.from(document.querySelectorAll('h2, h3, p, span, strong')).some((node) => {
      const text = node.textContent?.replace(/\s+/g, ' ').trim()
      if (!text || !['Reading deck', 'Reader dock', 'Derived locally for easier reading'].includes(text)) {
        return false
      }
      if (!(node instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(node)
      return style.display !== 'none' && style.visibility !== 'hidden'
    })

    const sourceWorkspaceDescriptionVisible = Array.from(document.querySelectorAll('.source-workspace-description')).some((node) => {
      if (!(node instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(node)
      return style.display !== 'none' && style.visibility !== 'hidden' && (node.textContent?.trim()?.length ?? 0) > 0
    })

    const sourceWorkspaceFramedAtRest = (() => {
      const style = window.getComputedStyle(sourceWorkspace)
      const borderTopWidth = Number.parseFloat(style.borderTopWidth || '0')
      const borderBottomWidth = Number.parseFloat(style.borderBottomWidth || '0')
      const hasVisibleBackground =
        style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
        style.backgroundColor !== 'transparent'
      const shadow = style.boxShadow
      const hasVisibleShadow = shadow && shadow !== 'none'
      return borderTopWidth > 0.5 || hasVisibleBackground || hasVisibleShadow || borderBottomWidth > 1.5
    })()
    const sourceWorkspaceStyle = window.getComputedStyle(sourceWorkspace)
    const sourceStripDividerVisible =
      Number.parseFloat(sourceWorkspaceStyle.borderBottomWidth || '0') > 0.5 &&
      sourceWorkspaceStyle.borderBottomStyle !== 'none' &&
      sourceWorkspaceStyle.borderBottomColor !== 'rgba(0, 0, 0, 0)' &&
      sourceWorkspaceStyle.borderBottomColor !== 'transparent'
    const controlRibbonEmbeddedInSourceWorkspace =
      sourceWorkspace instanceof HTMLElement &&
      controlRibbon instanceof HTMLElement &&
      sourceWorkspace.contains(controlRibbon)
    const sourceWorkspaceMainBox =
      sourceWorkspaceMain instanceof HTMLElement ? sourceWorkspaceMain.getBoundingClientRect() : null
    const sourceWorkspaceActionsBox =
      sourceWorkspaceActions instanceof HTMLElement ? sourceWorkspaceActions.getBoundingClientRect() : null
    const sourceToControlGap = controlRibbonEmbeddedInSourceWorkspace
      ? 0
      : round(Math.max(0, controlRibbonBox.top - sourceWorkspaceBox.bottom))
    const compactHeaderSharedRow =
      controlRibbonEmbeddedInSourceWorkspace &&
      sourceWorkspaceMainBox &&
      sourceWorkspaceActionsBox
        ? sharesRow(sourceWorkspaceMainBox, sourceWorkspaceActionsBox)
        : false
    const deckCompact =
      deckLayout instanceof HTMLElement &&
      (deckLayout.classList.contains('reader-reading-deck-layout-compact') ||
        deckLayout.classList.contains('reader-reading-deck-layout-short-support-open-stage866'))

    const headingCountForSourceTitle = Array.from(document.querySelectorAll('h1, h2, h3'))
      .map((node) => node.textContent?.trim() ?? '')
      .filter((text) => text === currentTitle).length
    const visibleArticleHeadings = Array.from(article?.querySelectorAll('h1, h2, h3, h4') ?? []).filter((node) =>
      isVisible(node),
    )
    const leadingArticleHeadingText =
      visibleArticleHeadings[0] instanceof HTMLElement
        ? visibleArticleHeadings[0].textContent?.replace(/\s+/g, ' ').trim() ?? null
        : null
    const leadingArticleHeadingMatchesSourceTitle =
      Boolean(leadingArticleHeadingText) &&
      normalizeMetricText(leadingArticleHeadingText) === normalizeMetricText(currentTitle)
    const stageHeadingVisible =
      stageHeading instanceof HTMLElement &&
      window.getComputedStyle(stageHeading).display !== 'none' &&
      window.getComputedStyle(stageHeading).visibility !== 'hidden'
    const stripTitleHeadingVisible =
      stripTitleHeading instanceof HTMLElement &&
      window.getComputedStyle(stripTitleHeading).display !== 'none' &&
      window.getComputedStyle(stripTitleHeading).visibility !== 'hidden'
    const sourcePreviewVisible =
      sourcePreview instanceof HTMLElement &&
      window.getComputedStyle(sourcePreview).display !== 'none' &&
      window.getComputedStyle(sourcePreview).visibility !== 'hidden'
    const sourcePreviewText =
      sourcePreview instanceof HTMLElement
        ? sourcePreview.textContent?.replace(/\s+/g, ' ').trim() ?? null
        : null
    const settingsLabelVisible =
      settingsButtonLabel instanceof HTMLElement &&
      window.getComputedStyle(settingsButtonLabel).position !== 'absolute' &&
      window.getComputedStyle(settingsButtonLabel).display !== 'none' &&
      window.getComputedStyle(settingsButtonLabel).visibility !== 'hidden'
    const sourceWorkspaceTabs = sourceWorkspace.querySelector('.source-workspace-tabs')
    const sourceWorkspaceNavTrigger = sourceWorkspace.querySelector('.source-workspace-nav-trigger')
    const sourceWorkspaceNoteChipTrigger = sourceWorkspace.querySelector('.source-workspace-meta-action')
    const sourceWorkspaceNavTriggerText =
      sourceWorkspaceNavTrigger instanceof HTMLElement
        ? sourceWorkspaceNavTrigger.textContent?.replace(/\s+/g, ' ').trim() ?? null
        : null
    const sourceWorkspaceNoteChipTriggerText =
      sourceWorkspaceNoteChipTrigger instanceof HTMLElement
        ? sourceWorkspaceNoteChipTrigger.textContent?.replace(/\s+/g, ' ').trim() ?? null
        : null
    const sourceWorkspaceNavTriggerInlineInHeading =
      sourceWorkspaceNavTrigger instanceof HTMLElement &&
      sourceWorkspaceNavTrigger.closest('.source-workspace-strip-heading') instanceof HTMLElement
    const sourceNavTriggerUsesBadgeChrome =
      sourceWorkspaceNavTrigger instanceof HTMLElement &&
      isVisible(sourceWorkspaceNavTrigger) &&
      ['status-chip', 'source-workspace-strip-badge', 'source-workspace-strip-badge-button'].some((className) =>
        sourceWorkspaceNavTrigger.classList.contains(className),
      )
    const sourceNavTriggerQuietInline =
      sourceWorkspaceNavTrigger instanceof HTMLElement &&
      isVisible(sourceWorkspaceNavTrigger) &&
      sourceWorkspaceNavTrigger.classList.contains('source-workspace-nav-trigger-inline')
    const sourceMetaInlineInHeading =
      sourceMeta instanceof HTMLElement &&
      sourceStripHeading instanceof HTMLElement &&
      sourceMeta.closest('.source-workspace-strip-heading') === sourceStripHeading &&
      isVisible(sourceMeta)
    const sourceMetaInlineQuiet =
      sourceMeta instanceof HTMLElement &&
      sourceMeta.classList.contains('source-workspace-meta-inline-quiet') &&
      isVisible(sourceMeta)
    const sourceMetaChipCount = Array.from(sourceMeta?.querySelectorAll('.status-chip') ?? []).filter((item) =>
      isVisible(item),
    ).length
    const sourceMetaInlineLabelVisible = Array.from(
      sourceMeta?.querySelectorAll('.source-workspace-meta-inline-label') ?? [],
    ).some((item) => isVisible(item))
    const sourceInlineTextLabels = Array.from(
      sourceMeta?.querySelectorAll('.source-workspace-meta-inline-label') ?? [],
    )
      .filter((item) => isVisible(item))
      .map((item) => item.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)
    const sourceNoteTriggerUsesInlineText =
      sourceWorkspaceNoteChipTrigger instanceof HTMLElement &&
      sourceWorkspaceNoteChipTrigger.classList.contains('source-workspace-meta-inline-button') &&
      isVisible(sourceWorkspaceNoteChipTrigger)
    const sourceLibraryToggleButton = supportSurface?.querySelector('.library-pane-toolbar .ghost-button')
    const supportHideButtonCount = Array.from(supportSurface?.querySelectorAll('button') ?? [])
      .filter((button) => isVisible(button))
      .map((button) => button.getAttribute('aria-label') ?? button.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter((label) => label === 'Hide')
      .length
    const visibleViewLabels = Array.from(stage?.querySelectorAll('.reader-stage-mode-strip [role="tab"]') ?? [])
      .filter((tab) => isVisible(tab))
      .map((tab) => tab.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)
    const sourceStripMetaLabels = Array.from(sourceWorkspace?.querySelectorAll('.source-workspace-meta [role="listitem"]') ?? [])
      .filter((item) => isVisible(item))
      .map((item) => item.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)
    const visibleTransportButtonLabels = Array.from(stage?.querySelectorAll('.transport-bar button') ?? [])
      .filter((button) => isVisible(button))
      .map((button) => button.getAttribute('aria-label') ?? button.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)
    const topbarActionLabels = Array.from(topbar?.querySelectorAll('.workspace-topbar-actions button') ?? [])
      .filter((button) => isVisible(button))
      .map((button) => button.getAttribute('aria-label') ?? button.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)
    const topbarActionButtonHeights = Array.from(topbar?.querySelectorAll('.workspace-topbar-actions button') ?? [])
      .filter((button) => isVisible(button))
      .map((button) => round(button.getBoundingClientRect().height))
    const topbarShortcutHintVisible = Array.from(topbar?.querySelectorAll('.workspace-topbar-actions .shell-nav-hint') ?? []).some(
      (node) => isVisuallyPresent(node),
    )
    const visibleUtilityLabels = Array.from(
      stage?.querySelectorAll(
        '.reader-stage-transport-tools > button, .reader-stage-transport-tools > .reader-stage-overflow .controls-overflow > button',
      ) ?? [],
    )
      .filter((button) => isVisible(button) && !button.closest('.transport-bar'))
      .map((button) => button.getAttribute('aria-label') ?? button.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)
    const primaryTransportLabeledVisible = Array.from(stage?.querySelectorAll('.transport-button-label') ?? []).some((node) =>
      isVisible(node),
    )
    const transportProgressChipVisible =
      stage?.querySelector('.reader-stage-progress-chip') instanceof HTMLElement &&
      isVisible(stage.querySelector('.reader-stage-progress-chip'))

    return {
      articleFieldHeight: articleFieldBox ? round(articleFieldBox.height) : null,
      articleFieldScrollHeight:
        articleField instanceof HTMLElement ? round(articleField.scrollHeight) : null,
      dockExpanded: dock instanceof HTMLElement && dock.classList.contains('reader-support-dock-expanded'),
      articleFieldShortDocument,
      articleFieldContentFitStage864,
      articleFieldEmptySlabVisible:
        articleFieldShortDocument &&
        !articleFieldContentFitStage864 &&
        articleFieldBox !== null &&
        articleFieldBox.height >= 260,
      readerShortDocumentCompletionStripVisible:
        shortDocumentCompletionStrip instanceof HTMLElement && isVisible(shortDocumentCompletionStrip),
      readerShortDocumentCompletionStripHeight: shortDocumentCompletionStripBox
        ? round(shortDocumentCompletionStripBox.height)
        : null,
      readerShortDocumentFirstViewportDeadZoneVisible:
        articleFieldShortDocument &&
        articleFieldContentFitStage864 &&
        !(shortDocumentCompletionStrip instanceof HTMLElement && isVisible(shortDocumentCompletionStrip)) &&
        !(dock instanceof HTMLElement && dock.classList.contains('reader-support-dock-expanded')),
      readerShortDocumentNotebookHandoffVisible:
        shortDocumentCompletionNotebookHandoff instanceof HTMLElement && isVisible(shortDocumentCompletionNotebookHandoff),
      readerShortDocumentSourceHandoffVisible:
        shortDocumentCompletionSourceHandoff instanceof HTMLElement && isVisible(shortDocumentCompletionSourceHandoff),
      readerActiveListenSeamVisible: activeListenSeam instanceof HTMLElement && isVisible(activeListenSeam),
      readerActiveListenSeamHeight: activeListenSeamBox ? round(activeListenSeamBox.height) : null,
      readerActiveListenStatusLabel:
        activeListenStatus instanceof HTMLElement && isVisible(activeListenStatus)
          ? activeListenStatus.textContent?.replace(/\s+/g, ' ').trim() ?? null
          : null,
      readerActiveSentenceProgressInline:
        activeListenProgress instanceof HTMLElement &&
        isVisible(activeListenProgress) &&
        activeListenProgress.closest('.reader-active-listen-seam-stage878') === activeListenSeam,
      readerActiveCurrentSentenceExcerptVisible:
        activeListenExcerpt instanceof HTMLElement &&
        isVisible(activeListenExcerpt) &&
        (activeListenExcerpt.textContent?.trim()?.length ?? 0) > 0,
      readerActivePrimaryPlaybackLabel:
        activeListenPrimary instanceof HTMLElement && isVisible(activeListenPrimary)
          ? activeListenPrimary.textContent?.replace(/\s+/g, ' ').trim() ?? null
          : null,
      readerActiveTransportToolbarBloomVisible:
        !(activeListenSeam instanceof HTMLElement && isVisible(activeListenSeam)) &&
        ((sourceWorkspace?.querySelector('.reader-stage-progress-chip') instanceof HTMLElement &&
          isVisible(sourceWorkspace.querySelector('.reader-stage-progress-chip'))) ||
          (stage?.querySelector('.reader-stage-progress-chip') instanceof HTMLElement &&
            isVisible(stage.querySelector('.reader-stage-progress-chip')))),
      articleFieldCenteredOffset:
        articleBox && articleFieldBox
          ? round(
              Math.abs(
                articleFieldBox.left + articleFieldBox.width / 2 - (articleBox.left + articleBox.width / 2),
              ),
            )
          : null,
      articleFieldPresent: articleField instanceof HTMLElement,
      articleFieldToShellWidthRatio:
        articleBox && articleFieldBox ? round(articleFieldBox.width / articleBox.width) : null,
      articleShellFramedAtRest:
        article instanceof HTMLElement &&
        (() => {
          const style = window.getComputedStyle(article)
          const borderWidth = Number.parseFloat(style.borderTopWidth || '0')
          const hasVisibleBackground =
            style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
            style.backgroundColor !== 'transparent'
          return borderWidth > 0.5 || hasVisibleBackground
        })(),
      stageFramedAtRest: (() => {
        const style = window.getComputedStyle(stage)
        const borderWidth = Number.parseFloat(style.borderTopWidth || '0')
        const hasVisibleBackground =
          style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
          style.backgroundColor !== 'transparent'
        const beforeStyle = window.getComputedStyle(stage, '::before')
        const beforeVisible =
          beforeStyle.display !== 'none' &&
          beforeStyle.visibility !== 'hidden' &&
          Number.parseFloat(beforeStyle.height || '0') > 0 &&
          Number.parseFloat(beforeStyle.opacity || '1') > 0
        return borderWidth > 0.5 || hasVisibleBackground || beforeVisible
      })(),
      stageHasCardClass: stage.classList.contains('card'),
      stageUsesPriorityShellClass: stage.classList.contains('priority-surface-stage-shell'),
      dockPresent: dock instanceof HTMLElement,
      dockToArticleWidthRatio: articleBox && dockBox ? round(dockBox.width / articleBox.width) : null,
      readerCreateGeneratedLabel:
        createGeneratedButton instanceof HTMLElement
          ? createGeneratedButton.textContent?.replace(/\s+/g, ' ').trim() ?? null
          : null,
      readerCreateGeneratedVisible: createGeneratedButton instanceof HTMLElement,
      readerCreateSimplifiedVisible:
        createGeneratedButton instanceof HTMLElement &&
        createGeneratedButton.textContent?.replace(/\s+/g, ' ').trim() === 'Create Simplified',
      readerCreateSummaryVisible:
        createGeneratedButton instanceof HTMLElement &&
        createGeneratedButton.textContent?.replace(/\s+/g, ' ').trim() === 'Create Summary',
      readerDerivedContextVisible: derivedContext instanceof HTMLElement && isVisible(derivedContext),
      readerDerivedContextActionLabels: derivedContextActionLabels,
      readerDerivedContextActionsVisible:
        derivedContextActions instanceof HTMLElement && isVisible(derivedContextActions),
      readerDerivedContextDescriptorVisible:
        derivedContextDescriptor instanceof HTMLElement && isVisible(derivedContextDescriptor),
      readerDerivedContextDetailInline:
        derivedDetailShell instanceof HTMLElement && derivedDetailShell.classList.contains('reader-derived-detail-shell-inline'),
      readerDerivedContextDetailInHeaderRow:
        derivedDetailShell instanceof HTMLElement &&
        derivedContextHeaderRow instanceof HTMLElement &&
        derivedDetailShell.closest('.reader-derived-context-header-row') === derivedContextHeaderRow,
      readerDerivedContextDetailLabelVisible:
        derivedDetailLabel instanceof HTMLElement && isVisible(derivedDetailLabel),
      readerDerivedContextHeight: derivedContextBox ? round(derivedContextBox.height) : null,
      readerDerivedContextMetaLabels: derivedContextMetaLabels,
      readerDerivedContextSummaryVisible:
        derivedContextSummary instanceof HTMLElement && isVisible(derivedContextSummary),
      readerCurrentViewLabel: activeViewLabel,
      readerPrimaryTransportLabeledVisible: primaryTransportLabeledVisible,
      readerPrimaryTransportLabelClipped: primaryTransportLabelClipped,
      readerPrimaryTransportUsesSpeechIcon: primaryTransportUsesSpeechIcon,
      readerPrimaryTransportWidth: primaryTransportButtonBox ? round(primaryTransportButtonBox.width) : null,
      readerShortDocumentReadAloudAvailable:
        articleFieldShortDocument &&
        primaryTransportButton instanceof HTMLButtonElement &&
        isVisible(primaryTransportButton) &&
        !primaryTransportButton.disabled,
      readerTransportProgressVisible: transportProgressChipVisible,
      readerVisibleUtilityLabels: visibleUtilityLabels,
      readerVisibleViewLabels: visibleViewLabels,
      readerVisibleTransportButtonLabels: visibleTransportButtonLabels,
      readerGeneratedEmptyStateErrorTone:
        generatedEmptyState instanceof HTMLElement &&
        generatedEmptyState.classList.contains('reader-generated-empty-state-error'),
      readerGeneratedEmptyStateNestedInDerivedContext:
        generatedEmptyState instanceof HTMLElement &&
        generatedEmptyState.closest('.reader-derived-context') === derivedContext,
      readerGeneratedEmptyStateRetryVisible: generatedEmptyStateRetryVisible,
      readerGeneratedEmptyStateVisible: generatedEmptyState instanceof HTMLElement && isVisible(generatedEmptyState),
      readerHasArticle: article instanceof HTMLElement,
      readerStageLeft: round(stageBox.left),
      readerStageWidth: round(stageBox.width),
      readerTopbarActionLabels: topbarActionLabels,
      readerTopbarActionMaxHeight: topbarActionButtonHeights.length ? Math.max(...topbarActionButtonHeights) : null,
      readerTopbarActionsCompact:
        topbar?.querySelector('.workspace-topbar-actions') instanceof HTMLElement &&
        topbar.querySelector('.workspace-topbar-actions')?.classList.contains('workspace-topbar-actions-reader-compact'),
      readerTopbarCompact:
        topbar instanceof HTMLElement && topbar.classList.contains('workspace-topbar-reader-compact'),
      readerTopbarHeight: topbar instanceof HTMLElement ? round(topbar.getBoundingClientRect().height) : null,
      readerTopbarShortcutHintVisible: topbarShortcutHintVisible,
      readerTopbarTitleVisible: topbarTitle instanceof HTMLElement && isVisuallyPresent(topbarTitle),
      notebookHeadingVisible: notebookHeading instanceof HTMLElement,
      readerNoteWorkbenchHeadingVisible: noteWorkbenchHeading instanceof HTMLElement && isVisible(noteWorkbenchHeading),
      readerNoteWorkbenchIntroVisible: noteWorkbenchIntro instanceof HTMLElement && isVisible(noteWorkbenchIntro),
      readerNoteWorkbenchMetaLabels: noteWorkbenchMetaLabels,
      readerNoteWorkbenchPreviewHeadingVisible:
        noteWorkbenchPreviewHeading instanceof HTMLElement && isVisible(noteWorkbenchPreviewHeading),
      readerNoteWorkbenchPreviewMetaText:
        noteWorkbenchPreviewMeta instanceof HTMLElement
          ? noteWorkbenchPreviewMeta.textContent?.replace(/\s+/g, ' ').trim() ?? null
          : null,
      readerArticleTop: articleBox ? round(articleBox.top) : null,
      readerContentHeadingCount: headingCountForSourceTitle,
      readerLeadingArticleHeadingMatchesSourceTitle: leadingArticleHeadingMatchesSourceTitle,
      readerLeadingArticleHeadingText: leadingArticleHeadingText,
      readerCompactHeaderWidthRatio: round(
        Math.max(controlRibbonBox.width, sourceWorkspaceInnerBox.width) / stageBox.width,
      ),
      readerControlClusterGap:
        modeStripBox && transportStripBox && sharesRow(modeStripBox, transportStripBox)
          ? round(Math.max(0, transportStripBox.left - modeStripBox.right))
          : null,
      readerControlClusterGapRatio:
        modeStripBox && transportStripBox && sharesRow(modeStripBox, transportStripBox)
          ? round(Math.max(0, transportStripBox.left - modeStripBox.right) / controlRibbonBox.width)
          : null,
      readerControlClusterSameRow:
        modeStripBox && transportStripBox ? sharesRow(modeStripBox, transportStripBox) : false,
      readerControlRibbonEmbeddedInSourceWorkspace: controlRibbonEmbeddedInSourceWorkspace,
      readerControlRibbonCenteredOffset: round(
        Math.abs(controlRibbonBox.left + controlRibbonBox.width / 2 - (stageBox.left + stageBox.width / 2)),
      ),
      readerCompactHeaderSharedRow: compactHeaderSharedRow,
      readerControlRibbonWidthRatio: round(controlRibbonBox.width / stageBox.width),
      readerEmbeddedCompactControlDensity:
        controlRibbon.classList.contains('reader-stage-control-ribbon-embedded-compact'),
      readerEmbeddedModeTabHeight: firstModeTabBox ? round(firstModeTabBox.height) : null,
      readerEmbeddedPrimaryTransportHeight: primaryTransportButtonBox ? round(primaryTransportButtonBox.height) : null,
      readerDeckCenteredOffset:
        deckBox
          ? round(Math.abs(deckBox.left + deckBox.width / 2 - (stageBox.left + stageBox.width / 2)))
          : null,
      readerDeckCompact: deckCompact,
      readerDeckWidthRatio: deckBox ? round(deckBox.width / stageBox.width) : null,
      readerRetiredCopyVisible: retiredCopyVisible,
      readerSourceLibraryVisible: sourceLibraryPane instanceof HTMLElement && isVisible(sourceLibraryPane),
      readerSourceLibraryHeadingVisible: sourceLibraryHeading instanceof HTMLElement && isVisible(sourceLibraryHeading),
      readerSourceLibrarySearchLabelVisible:
        sourceLibrarySearchLabel instanceof HTMLElement && isVisible(sourceLibrarySearchLabel),
      readerSourceLibraryStatusVisible: sourceLibraryStatus instanceof HTMLElement && isVisible(sourceLibraryStatus),
      readerSourceMetaChipCount: sourceMetaChipCount,
      readerSourceInlineTextLabels: sourceInlineTextLabels,
      readerSourceMetaInlineInHeading: sourceMetaInlineInHeading,
      readerSourceMetaInlineLabelVisible: sourceMetaInlineLabelVisible,
      readerSourceMetaInlineQuiet: sourceMetaInlineQuiet,
      readerSourceTypeVisible: sourceInlineTextLabels.length > 0,
      readerSourceStripMetaLabels: sourceStripMetaLabels,
      readerSourceNavTriggerQuietInline: sourceNavTriggerQuietInline,
      readerSourceNavTriggerInlineInHeading: sourceWorkspaceNavTriggerInlineInHeading,
      readerSourceNavTriggerText: sourceWorkspaceNavTriggerText,
      readerSourceNavTriggerUsesBadgeChrome: sourceNavTriggerUsesBadgeChrome,
      readerSourceNavTriggerVisible: sourceWorkspaceNavTrigger instanceof HTMLElement && isVisible(sourceWorkspaceNavTrigger),
      readerSourceToControlGap: sourceToControlGap,
      readerSourceStripNoteChipTriggerText: sourceWorkspaceNoteChipTriggerText,
      readerSourceStripNoteChipTriggerVisible:
        sourceWorkspaceNoteChipTrigger instanceof HTMLElement && isVisible(sourceWorkspaceNoteChipTrigger),
      readerSourceStripNoteTriggerUsesInlineText: sourceNoteTriggerUsesInlineText,
      readerSourceStripCompact: sourceWorkspace.classList.contains('source-workspace-frame-reader-compact'),
      readerSourceStripDividerVisible: sourceStripDividerVisible,
      readerSourceStripExpanded: sourceWorkspace.classList.contains('source-workspace-frame-reader-expanded'),
      readerSourceStripHeadingVisible: stripTitleHeadingVisible,
      readerSourceTitleVisible: stripTitleHeadingVisible,
      readerSourceLibraryToggleVisible:
        sourceLibraryToggleButton instanceof HTMLElement && isVisible(sourceLibraryToggleButton),
      readerSourcePreviewText: sourcePreviewText,
      readerSourcePreviewVisible: sourcePreviewVisible,
      readerSourceTabsVisible: sourceWorkspaceTabs instanceof HTMLElement && isVisible(sourceWorkspaceTabs),
      readerSourceStripCenteredOffset: round(
        Math.abs(
          sourceWorkspaceInnerBox.left +
            sourceWorkspaceInnerBox.width / 2 -
            (stageBox.left + stageBox.width / 2),
        ),
      ),
      readerSourceStripShellCenteredOffset: round(
        Math.abs(
          sourceWorkspaceBox.left +
            sourceWorkspaceBox.width / 2 -
            (stageBox.left + stageBox.width / 2),
        ),
      ),
      readerSourceStripHeight: round(sourceWorkspaceBox.height),
      readerSourceStripLeft: round(sourceWorkspaceInnerBox.left),
      readerSourceStripShellWidthRatio: round(sourceWorkspaceBox.width / stageBox.width),
      readerSourceStripWidthRatio: round(sourceWorkspaceInnerBox.width / stageBox.width),
      readerTransportClusterNearModes:
        modeStripBox && transportStripBox
          ? transportStripBox.left - modeStripBox.right <= Math.max(160, controlRibbonBox.width * 0.44)
          : false,
      readerStageChromeHeight: round((stageShellBox?.height ?? 0) + controlRibbonBox.height),
      readerStageHeadingVisible: stageHeadingVisible,
      readerStageMetadataChipCount: stageMetadataItems.length,
      readerStageMetadataRowVisible: isVisible(stageMetadataRow),
      readerStageMetadataIncludesView: stageMetadataItems.some((item) => / view$/i.test(item)),
      readerStageSettingsLabelVisible: settingsLabelVisible,
      readerStageStripLabelsVisible: stageVisibleStripLabels.length > 0,
      readerStageUtilityRowPresent: stageUtility instanceof HTMLElement,
      readerSupportCopyVisibleAtRest: supportCopyVisibleAtRest,
      readerSupportFootnoteVisible: supportFootnoteVisible,
      readerSupportGlanceVisible: supportGlanceVisible,
      readerSupportHideButtonCount: supportHideButtonCount,
      readerSupportInlineVisible: inlineSupport instanceof HTMLElement && isVisible(inlineSupport),
      readerSupportLegacyHeadingVisible: supportLegacyHeadingVisible,
      readerSupportMetaChipCount: supportMetaChips.length,
      readerSupportTabLabelsVisible: supportTabLabelsVisible,
      readerGeneratedArticleContainsSnippet:
        typeof expectedGeneratedSnippet === 'string' &&
        expectedGeneratedSnippet.length > 0 &&
        article instanceof HTMLElement &&
        article.textContent?.includes(expectedGeneratedSnippet) === true,
      readerGeneratedContextContainsSnippet:
        typeof expectedGeneratedSnippet === 'string' &&
        expectedGeneratedSnippet.length > 0 &&
        derivedContext instanceof HTMLElement &&
        derivedContext.textContent?.includes(expectedGeneratedSnippet) === true,
      readerSavedNoteActiveTileVisible: savedNoteActiveTile instanceof HTMLElement && isVisible(savedNoteActiveTile),
      readerSavedNoteButtonCount: savedNoteButtons.length,
      readerSavedNoteExcerptVisible: savedNoteExcerpt instanceof HTMLElement && isVisible(savedNoteExcerpt),
      readerSavedNoteMaxHeight: savedNoteMaxHeight,
      readerSavedNoteSecondaryVisible: savedNoteSecondary instanceof HTMLElement && isVisible(savedNoteSecondary),
      readerSavedNoteTextLayerCount: savedNoteTextLayerCount,
      readerSourceStripFramedAtRest: sourceWorkspaceFramedAtRest,
      sourceWorkspaceDescriptionVisible,
      summaryDetailInlineVisible: summaryDetailGroup instanceof HTMLElement,
      supportCollapsed:
        (inlineSupport instanceof HTMLElement && isVisible(inlineSupport)) ||
        (dock instanceof HTMLElement && dock.classList.contains('reader-support-dock-collapsed')),
      supportToggleVisible: dock instanceof HTMLElement && dock.querySelector('.reader-support-toggle') instanceof HTMLElement,
      workspaceInlineErrorVisible: workspaceInlineError instanceof HTMLElement && isVisible(workspaceInlineError),
      workbenchVisible: noteWorkbench instanceof HTMLElement,
    }
  }, { currentTitle: expectedTitle, expectedGeneratedSnippet: expectedSnippet })
}

async function captureNotebookWorkbench(page, stagePrefix, directory) {
  await selectReaderView(page, 'Reflowed')
  await selectReaderOverflowAction(page, 'Add note')

  const sentenceButtons = page.locator('[data-reader-sentence="true"]')
  await sentenceButtons.first().waitFor({ state: 'visible', timeout: 20000 })
  await sentenceButtons.nth(0).click()
  if ((await sentenceButtons.count()) > 1) {
    await sentenceButtons.nth(1).click()
  }

  await page.getByRole('textbox', { name: 'Optional note' }).fill(`${stagePrefix} reader note`)
  await page.getByRole('button', { name: 'Save note' }).click()
  await page.getByRole('textbox', { name: 'Note text' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)

  return captureLocatorScreenshot(
    page,
    page.locator('.reader-support-dock').first(),
    directory,
    `${stagePrefix}-reader-notebook-workbench.png`,
  )
}

async function captureNotebookRegression(page, baseUrl, directory, stagePrefix) {
  const response = await page.goto(`${baseUrl}/recall?section=notes`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Notebook alias navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.getByRole('heading', { name: 'Notebook', exact: true }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
  return captureViewportScreenshot(page, directory, `${stagePrefix}-notebook-wide-top.png`)
}

async function captureStudyRegression(page, baseUrl, directory, stagePrefix) {
  const response = await page.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Study navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.getByRole('heading', { name: 'Review', exact: true, level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
  return captureViewportScreenshot(page, directory, `${stagePrefix}-study-wide-top.png`)
}

export async function captureReaderReadingFirstEvidence({
  baseUrl,
  directory,
  page,
  regressionPage,
  stagePrefix,
}) {
  await installReaderSpeechHarness(page)
  const originalReader = await openOriginalReaderFromHome(page, directory, stagePrefix, baseUrl)
  const defaultReaderDocumentId = new URL(page.url()).searchParams.get('document')
  const defaultReaderDocument =
    typeof defaultReaderDocumentId === 'string' && defaultReaderDocumentId.length > 0
      ? await fetchDocumentRecord(baseUrl, defaultReaderDocumentId)
      : null
  const defaultMetrics = await readReaderMetrics(page, originalReader.sourceTitle, null)
  const controlRibbonCapture = await captureLocatorScreenshot(
    page,
    page.locator('.reader-stage-control-ribbon').first(),
    directory,
    `${stagePrefix}-reader-control-ribbon.png`,
  )
  const overflowPanel = await openReaderControlsOverflow(page)
  const defaultOverflowMetrics = await readReaderControlsOverflowMetrics(page, overflowPanel)
  const controlOverflowCapture = await captureLocatorScreenshot(
    page,
    page.locator('.controls-overflow-panel').first(),
    directory,
    `${stagePrefix}-reader-control-overflow.png`,
  )
  const sourceStripCapture = await captureLocatorScreenshot(
    page,
    page.getByRole('region', { name: `${originalReader.sourceTitle} workspace` }).first(),
    directory,
    `${stagePrefix}-reader-source-strip.png`,
  )
  const defaultWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-reader-default-wide-top.png`)
  const defaultArticleFieldCapture = await captureLocatorScreenshot(
    page,
    page.locator('.reader-article-field').first(),
    directory,
    `${stagePrefix}-reader-short-document-article-field.png`,
  )
  const defaultCompletionStripCapture = await captureLocatorScreenshot(
    page,
    page.locator('.reader-short-document-completion-strip').first(),
    directory,
    `${stagePrefix}-reader-short-document-completion-strip.png`,
  )
  await page.keyboard.press('Escape').catch(() => undefined)
  await page.waitForTimeout(150)
  await page.getByRole('button', { name: 'Start read aloud' }).click()
  await page.getByRole('region', { name: 'Active read aloud' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
  const activeListenMetrics = await readReaderMetrics(page, originalReader.sourceTitle, null)
  const activeListenSeamCapture = await captureLocatorScreenshot(
    page,
    page.locator('.reader-active-listen-seam-stage878').first(),
    directory,
    `${stagePrefix}-reader-active-listen-seam.png`,
  )
  const activeListenWideTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-reader-active-listen-wide-top.png`,
  )
  await page.getByRole('button', { name: 'Pause read aloud' }).click()
  await page.getByRole('button', { name: 'Resume read aloud' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
  const pausedListenMetrics = await readReaderMetrics(page, originalReader.sourceTitle, null)
  const pausedListenSeamCapture = await captureLocatorScreenshot(
    page,
    page.locator('.reader-active-listen-seam-stage878').first(),
    directory,
    `${stagePrefix}-reader-paused-listen-seam.png`,
  )
  await page.getByRole('button', { name: 'Stop read aloud' }).click()
  await page.getByRole('button', { name: 'Start read aloud' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
  const idleAfterStopMetrics = await readReaderMetrics(page, originalReader.sourceTitle, null)

  await selectReaderView(page, 'Reflowed')
  await page.waitForTimeout(250)
  const reflowedMetrics = await readReaderMetrics(page, originalReader.sourceTitle, null)
  const reflowedWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-reader-reflowed-wide-top.png`)
  const reflowedArticleFieldCapture = await captureLocatorScreenshot(
    page,
    page.locator('.reader-article-field').first(),
    directory,
    `${stagePrefix}-reader-reflowed-short-document-article-field.png`,
  )
  const reflowedCompletionStripCapture = await captureLocatorScreenshot(
    page,
    page.locator('.reader-short-document-completion-strip').first(),
    directory,
    `${stagePrefix}-reader-reflowed-short-document-completion-strip.png`,
  )
  await selectReaderView(page, 'Original')
  await page.waitForTimeout(250)

  const previewBackedTarget = await fetchReaderSourcePreviewTarget(baseUrl)
  await openReaderDocument(page, baseUrl, previewBackedTarget.documentId, previewBackedTarget.title)
  const previewBackedMetrics = await readReaderMetrics(page, previewBackedTarget.title, null)
  const previewBackedWideTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-reader-preview-backed-wide-top.png`,
  )
  if (typeof defaultReaderDocumentId === 'string' && defaultReaderDocumentId.length > 0) {
    await openReaderDocument(page, baseUrl, defaultReaderDocumentId, originalReader.sourceTitle)
  }

  await openReaderSupportTab(page, 'Source')
  await page.getByRole('searchbox', { name: 'Search saved sources' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
  const sourceSupportMetrics = await readReaderMetrics(page, originalReader.sourceTitle, null)
  const sourceSupportCapture = await captureLocatorScreenshot(
    page,
    page.locator('.reader-support-dock').first(),
    directory,
    `${stagePrefix}-reader-source-support-open.png`,
  )
  const sourceSupportArticleFieldCapture = await captureLocatorScreenshot(
    page,
    page.locator('.reader-article-field').first(),
    directory,
    `${stagePrefix}-reader-source-open-short-document-article-field.png`,
  )
  await page.getByRole('button', { name: 'Start read aloud' }).click()
  await page.getByRole('region', { name: 'Active read aloud' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
  const sourceSupportActiveListenMetrics = await readReaderMetrics(page, originalReader.sourceTitle, null)
  const sourceSupportActiveListenCapture = await captureLocatorScreenshot(
    page,
    page.locator('.reader-active-listen-seam-stage878').first(),
    directory,
    `${stagePrefix}-reader-source-open-active-listen-seam.png`,
  )
  await page.getByRole('button', { name: 'Stop read aloud' }).click()
  await page.getByRole('button', { name: 'Start read aloud' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)

  const notebookWorkbenchCapture = await captureNotebookWorkbench(page, stagePrefix, directory)
  const notebookSupportMetrics = await readReaderMetrics(page, originalReader.sourceTitle, null)
  const notebookSupportArticleFieldCapture = await captureLocatorScreenshot(
    page,
    page.locator('.reader-article-field').first(),
    directory,
    `${stagePrefix}-reader-notebook-open-short-document-article-field.png`,
  )

  const summaryTarget = await fetchGeneratedModeTarget(baseUrl, 'summary')
  await openReaderDocument(page, baseUrl, summaryTarget.documentId, summaryTarget.title)
  let simplifiedWideTop = null
  let simplifiedMetrics = { viewAvailable: false }
  if (await trySelectReaderView(page, 'Simplified')) {
    await waitForGeneratedModeState(page, 'Simplified')
    await page.waitForTimeout(250)
    simplifiedMetrics = {
      viewAvailable: true,
      ...await readReaderMetrics(page, summaryTarget.title, null),
    }
    simplifiedWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-reader-simplified-wide-top.png`)
  }
  await selectReaderView(page, 'Summary')
  await waitForGeneratedModeState(page, 'Summary')
  await page.waitForTimeout(250)
  const summaryMetrics = await readReaderMetrics(page, summaryTarget.title, summaryTarget.snippet)
  const summaryOverflowPanel = await openReaderControlsOverflow(page)
  const summaryOverflowMetrics = await readReaderControlsOverflowMetrics(page, summaryOverflowPanel)
  const summaryWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-reader-summary-wide-top.png`)

  await selectReaderView(page, 'Original')
  const originalWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-reader-original-wide-top.png`)

  await openHome(regressionPage, baseUrl)
  const homeWideTop = await captureViewportScreenshot(regressionPage, directory, `${stagePrefix}-home-wide-top.png`)
  await openGraph(regressionPage, baseUrl)
  const graphWideTop = await captureViewportScreenshot(regressionPage, directory, `${stagePrefix}-graph-wide-top.png`)
  const notebookWideTop = await captureNotebookRegression(regressionPage, baseUrl, directory, stagePrefix)
  const studyWideTop = await captureStudyRegression(regressionPage, baseUrl, directory, stagePrefix)

  return {
    captures: {
      defaultWideTop,
      defaultArticleFieldCapture,
      activeListenSeamCapture,
      activeListenWideTop,
      defaultCompletionStripCapture,
      graphWideTop,
      homeWideTop,
      notebookSupportCapture: notebookWorkbenchCapture,
      notebookSupportArticleFieldCapture,
      notebookWideTop,
      originalWideTop,
      previewBackedWideTop,
      pausedListenSeamCapture,
      reflowedWideTop,
      reflowedArticleFieldCapture,
      reflowedCompletionStripCapture,
      controlRibbonCapture,
      controlOverflowCapture,
      ...(simplifiedWideTop ? { simplifiedWideTop } : {}),
      sourceStripCapture,
      sourceSupportActiveListenCapture,
      sourceSupportCapture,
      sourceSupportArticleFieldCapture,
      studyWideTop,
      summaryWideTop,
    },
    metrics: {
      defaultSourceTitle: originalReader.sourceTitle,
      defaultAvailableModes: Array.isArray(defaultReaderDocument?.available_modes)
        ? defaultReaderDocument.available_modes
        : [],
      defaultReaderOverflowActionLabels: defaultOverflowMetrics.actionLabels,
      defaultReaderOverflowPanelHeight: defaultOverflowMetrics.panelHeight,
      defaultReaderOverflowPanelWidth: defaultOverflowMetrics.panelWidth,
      defaultReaderOverflowRateVisible: defaultOverflowMetrics.rateControlVisible,
      defaultReaderOverflowSentenceLabelVisible: defaultOverflowMetrics.sentenceLabelVisible,
      defaultReaderOverflowShortcutHintVisible: defaultOverflowMetrics.shortcutHintVisible,
      defaultReaderOverflowThemeChoiceLabels: defaultOverflowMetrics.themeChoiceLabels,
      defaultReaderOverflowThemeDarkVisible: defaultOverflowMetrics.themeDarkVisible,
      defaultReaderOverflowThemeDialogVisible: defaultOverflowMetrics.themeDialogVisible,
      defaultReaderOverflowThemeGroupVisible: defaultOverflowMetrics.themeGroupVisible,
      defaultReaderOverflowThemeInline: defaultOverflowMetrics.themeInline,
      defaultReaderOverflowThemeLightVisible: defaultOverflowMetrics.themeLightVisible,
      defaultReaderOverflowVoiceInline: defaultOverflowMetrics.voiceInline,
      defaultReaderOverflowVoiceVisible: defaultOverflowMetrics.voiceControlVisible,
      previewBackedSourcePreviewReference: previewBackedTarget.sourcePreview,
      previewBackedSourceTitle: previewBackedTarget.title,
      simplifiedTargetTitle: summaryTarget.title,
      summaryTargetTitle: summaryTarget.title,
      ...Object.fromEntries(
        Object.entries(defaultMetrics).map(([key, value]) => [`default${key.charAt(0).toUpperCase()}${key.slice(1)}`, value]),
      ),
      ...Object.fromEntries(
        Object.entries(activeListenMetrics).map(([key, value]) => [`active${key.charAt(0).toUpperCase()}${key.slice(1)}`, value]),
      ),
      ...Object.fromEntries(
        Object.entries(pausedListenMetrics).map(([key, value]) => [`paused${key.charAt(0).toUpperCase()}${key.slice(1)}`, value]),
      ),
      ...Object.fromEntries(
        Object.entries(idleAfterStopMetrics).map(([key, value]) => [`idleAfterStop${key.charAt(0).toUpperCase()}${key.slice(1)}`, value]),
      ),
      ...Object.fromEntries(
        Object.entries(reflowedMetrics).map(([key, value]) => [`reflowed${key.charAt(0).toUpperCase()}${key.slice(1)}`, value]),
      ),
      ...Object.fromEntries(
        Object.entries(previewBackedMetrics).map(([key, value]) => [`previewBacked${key.charAt(0).toUpperCase()}${key.slice(1)}`, value]),
      ),
      ...Object.fromEntries(
        Object.entries(sourceSupportMetrics).map(([key, value]) => [`sourceOpen${key.charAt(0).toUpperCase()}${key.slice(1)}`, value]),
      ),
      ...Object.fromEntries(
        Object.entries(sourceSupportActiveListenMetrics).map(([key, value]) => [
          `sourceOpenActive${key.charAt(0).toUpperCase()}${key.slice(1)}`,
          value,
        ]),
      ),
      ...Object.fromEntries(
        Object.entries(notebookSupportMetrics).map(([key, value]) => [`notebookOpen${key.charAt(0).toUpperCase()}${key.slice(1)}`, value]),
      ),
      ...Object.fromEntries(
        Object.entries(simplifiedMetrics).map(([key, value]) => [`simplified${key.charAt(0).toUpperCase()}${key.slice(1)}`, value]),
      ),
      ...Object.fromEntries(
        Object.entries(summaryMetrics).map(([key, value]) => [`summary${key.charAt(0).toUpperCase()}${key.slice(1)}`, value]),
      ),
      readerShortDocumentEmptySlabVisible:
        Boolean(defaultMetrics.articleFieldEmptySlabVisible) || Boolean(reflowedMetrics.articleFieldEmptySlabVisible),
      readerShortDocumentArticleFieldContentFit:
        Boolean(defaultMetrics.articleFieldContentFitStage864) && Boolean(reflowedMetrics.articleFieldContentFitStage864),
      readerShortDocumentArticleFieldHeight: Math.max(
        defaultMetrics.articleFieldHeight ?? 0,
        reflowedMetrics.articleFieldHeight ?? 0,
      ),
      readerShortDocumentCompletionStripVisible:
        Boolean(defaultMetrics.readerShortDocumentCompletionStripVisible) &&
        Boolean(reflowedMetrics.readerShortDocumentCompletionStripVisible),
      readerShortDocumentCompletionStripHeight: Math.max(
        defaultMetrics.readerShortDocumentCompletionStripHeight ?? 0,
        reflowedMetrics.readerShortDocumentCompletionStripHeight ?? 0,
      ),
      readerShortDocumentFirstViewportDeadZoneVisible:
        Boolean(defaultMetrics.readerShortDocumentFirstViewportDeadZoneVisible) ||
        Boolean(reflowedMetrics.readerShortDocumentFirstViewportDeadZoneVisible),
      readerShortDocumentNotebookHandoffVisible:
        Boolean(defaultMetrics.readerShortDocumentNotebookHandoffVisible) &&
        Boolean(reflowedMetrics.readerShortDocumentNotebookHandoffVisible),
      readerShortDocumentSourceHandoffVisible:
        Boolean(defaultMetrics.readerShortDocumentSourceHandoffVisible) &&
        Boolean(reflowedMetrics.readerShortDocumentSourceHandoffVisible),
      readerActiveListenSeamVisible:
        Boolean(activeListenMetrics.readerActiveListenSeamVisible) &&
        Boolean(pausedListenMetrics.readerActiveListenSeamVisible),
      readerActiveTransportToolbarBloomVisible:
        Boolean(activeListenMetrics.readerActiveTransportToolbarBloomVisible) ||
        Boolean(pausedListenMetrics.readerActiveTransportToolbarBloomVisible),
      readerActiveListenStatusLabel: activeListenMetrics.readerActiveListenStatusLabel,
      readerPausedListenStatusLabel: pausedListenMetrics.readerActiveListenStatusLabel,
      readerActiveSentenceProgressInline:
        Boolean(activeListenMetrics.readerActiveSentenceProgressInline) &&
        Boolean(pausedListenMetrics.readerActiveSentenceProgressInline),
      readerActiveCurrentSentenceExcerptVisible:
        Boolean(activeListenMetrics.readerActiveCurrentSentenceExcerptVisible) &&
        Boolean(pausedListenMetrics.readerActiveCurrentSentenceExcerptVisible),
      readerActivePrimaryPlaybackLabel: activeListenMetrics.readerActivePrimaryPlaybackLabel,
      readerPausedPrimaryPlaybackLabel: pausedListenMetrics.readerActivePrimaryPlaybackLabel,
      readerShortDocumentCompletionStripHiddenWhileListening:
        !Boolean(activeListenMetrics.readerShortDocumentCompletionStripVisible) &&
        !Boolean(pausedListenMetrics.readerShortDocumentCompletionStripVisible),
      readerIdleCompletionStripReturnsAfterStop: Boolean(idleAfterStopMetrics.readerShortDocumentCompletionStripVisible),
      readerShortDocumentSupportOpenEmptySlabVisible:
        Boolean(sourceSupportMetrics.articleFieldEmptySlabVisible) || Boolean(notebookSupportMetrics.articleFieldEmptySlabVisible),
      readerShortDocumentSourceOpenArticleFieldContentFit: Boolean(sourceSupportMetrics.articleFieldContentFitStage864),
      readerShortDocumentNotebookOpenArticleFieldContentFit: Boolean(notebookSupportMetrics.articleFieldContentFitStage864),
      readerShortDocumentSupportOpenCompactHeaderSharedRow:
        Boolean(sourceSupportMetrics.readerCompactHeaderSharedRow) &&
        Boolean(notebookSupportMetrics.readerCompactHeaderSharedRow),
      readerShortDocumentSupportOpenDeckCompact:
        Boolean(sourceSupportMetrics.readerDeckCompact) && Boolean(notebookSupportMetrics.readerDeckCompact),
      readerSupportOpenShortDocumentContentFitStable:
        Boolean(sourceSupportMetrics.articleFieldContentFitStage864) &&
        Boolean(notebookSupportMetrics.articleFieldContentFitStage864) &&
        !Boolean(sourceSupportMetrics.readerShortDocumentCompletionStripVisible) &&
        !Boolean(notebookSupportMetrics.readerShortDocumentCompletionStripVisible),
      readerSupportOpenActiveListenSeamVisible: Boolean(sourceSupportActiveListenMetrics.readerActiveListenSeamVisible),
      readerLongDocumentArticleFieldStable:
        !previewBackedMetrics.articleFieldShortDocument && !previewBackedMetrics.articleFieldContentFitStage864,
      readerLongDocumentCompletionStripVisible: Boolean(previewBackedMetrics.readerShortDocumentCompletionStripVisible),
      readerGeneratedOutputsFrozen:
        !summaryMetrics.readerGeneratedContextContainsSnippet &&
        (typeof summaryTarget.snippet !== 'string' ||
          summaryTarget.snippet.length === 0 ||
          Boolean(summaryMetrics.readerGeneratedArticleContainsSnippet)),
      readerShortDocumentReadAloudAvailable:
        Boolean(defaultMetrics.readerShortDocumentReadAloudAvailable) &&
        Boolean(reflowedMetrics.readerShortDocumentReadAloudAvailable),
      summaryReaderOverflowActionLabels: summaryOverflowMetrics.actionLabels,
      summaryReaderOverflowPanelHeight: summaryOverflowMetrics.panelHeight,
      summaryReaderOverflowPanelWidth: summaryOverflowMetrics.panelWidth,
      summaryReaderOverflowRateVisible: summaryOverflowMetrics.rateControlVisible,
      summaryReaderOverflowSentenceLabelVisible: summaryOverflowMetrics.sentenceLabelVisible,
      summaryReaderOverflowShortcutHintVisible: summaryOverflowMetrics.shortcutHintVisible,
      summaryReaderOverflowThemeChoiceLabels: summaryOverflowMetrics.themeChoiceLabels,
      summaryReaderOverflowThemeDarkVisible: summaryOverflowMetrics.themeDarkVisible,
      summaryReaderOverflowThemeDialogVisible: summaryOverflowMetrics.themeDialogVisible,
      summaryReaderOverflowThemeGroupVisible: summaryOverflowMetrics.themeGroupVisible,
      summaryReaderOverflowThemeInline: summaryOverflowMetrics.themeInline,
      summaryReaderOverflowThemeLightVisible: summaryOverflowMetrics.themeLightVisible,
      summaryReaderOverflowVoiceInline: summaryOverflowMetrics.voiceInline,
      summaryReaderOverflowVoiceVisible: summaryOverflowMetrics.voiceControlVisible,
    },
  }
}

export { desktopViewport }
