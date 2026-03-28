import { captureLocatorScreenshot, captureViewportScreenshot, desktopViewport } from './home_rendered_preview_quality_shared.mjs'
import { captureReaderRegressionEvidence, selectReaderView } from './reader_workspace_reset_shared.mjs'

async function openReader(page, baseUrl) {
  const response = await page.goto(`${baseUrl}/reader`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Reader navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.locator('.reader-workspace').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function fetchGeneratedModeTarget(baseUrl) {
  const response = await fetch(`${baseUrl}/api/documents`)
  if (!response.ok) {
    throw new Error(`Could not inspect documents for Stage 702, received ${response.status}.`)
  }
  const documents = await response.json()
  if (!Array.isArray(documents)) {
    throw new Error('Stage 702 expected /api/documents to return an array.')
  }
  const summaryDocument = documents.find((document) => Array.isArray(document.available_modes) && document.available_modes.includes('summary'))
  const simplifiedDocument = documents.find(
    (document) => Array.isArray(document.available_modes) && document.available_modes.includes('simplified'),
  )
  if (!summaryDocument || typeof summaryDocument.title !== 'string') {
    throw new Error('Stage 702 requires at least one summary-capable document in the local library.')
  }
  let summarySnippet = null
  const summaryViewResponse = await fetch(
    `${baseUrl}/api/documents/${summaryDocument.id}/view?mode=summary&detail_level=balanced`,
  )
  if (summaryViewResponse.ok) {
    const summaryView = await summaryViewResponse.json()
    summarySnippet =
      Array.isArray(summaryView?.blocks) && typeof summaryView.blocks[0]?.text === 'string'
        ? summaryView.blocks[0].text.trim()
        : null
  }
  return {
    ...summaryDocument,
    simplifiedTargetTitle: typeof simplifiedDocument?.title === 'string' ? simplifiedDocument.title : null,
    summarySnippet,
  }
}

async function ensureLibraryOpen(page) {
  const showButton = page.getByRole('button', { name: 'Show' }).first()
  if (await showButton.isVisible().catch(() => false)) {
    await showButton.click()
  }
  await page.getByPlaceholder('Search saved sources').waitFor({ state: 'visible', timeout: 20000 })
}

async function openReaderDocumentByTitle(page, baseUrl, title) {
  await openReader(page, baseUrl)
  await ensureLibraryOpen(page)

  const searchInput = page.getByPlaceholder('Search saved sources').first()
  await searchInput.fill(title)
  await page.waitForTimeout(250)

  const documentButton = page.getByTitle(title).first()
  await documentButton.waitFor({ state: 'visible', timeout: 20000 })
  await documentButton.click()

  await page.getByRole('heading', { name: title, level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(300)
}

async function readGeneratedModeMetrics(page, summarySnippet) {
  return page.evaluate(({ expectedSummarySnippet }) => {
    const currentSummaryDetail = Array.from(document.querySelectorAll('.reader-derived-detail-button')).find(
      (button) => button.getAttribute('aria-pressed') === 'true',
    )
    const derivedContext = document.querySelector('.reader-derived-context')
    const articleShell = document.querySelector('.reader-article-shell')
    const createSummary = Array.from(document.querySelectorAll('button')).find((button) => button.textContent?.trim() === 'Create Summary')
    const createSimplified = Array.from(document.querySelectorAll('button')).find((button) => button.textContent?.trim() === 'Create Simplified')
    const notebookBranch = Array.from(document.querySelectorAll('.reader-derived-context button')).find(
      (button) => button.textContent?.trim() === 'Notebook',
    )
    const graphBranch = Array.from(document.querySelectorAll('.reader-derived-context button')).find(
      (button) => button.textContent?.trim() === 'Graph',
    )
    const studyBranch = Array.from(document.querySelectorAll('.reader-derived-context button')).find(
      (button) => button.textContent?.trim() === 'Study',
    )
    const reflowedBranch = Array.from(document.querySelectorAll('.reader-derived-context button')).find(
      (button) => button.textContent?.trim() === 'Reflowed view',
    )
    const settingsSummaryDetail = document.querySelector('.settings-drawer [aria-label="Summary detail"]')

    const summaryPlaceholder = Array.from(document.querySelectorAll('.placeholder')).find((node) =>
      node.textContent?.includes('No summary yet.'),
    )

    return {
      articleContainsSummarySnippet:
        typeof expectedSummarySnippet === 'string' &&
        expectedSummarySnippet.length > 0 &&
        articleShell instanceof HTMLElement &&
        articleShell.textContent?.includes(expectedSummarySnippet) === true,
      createSimplifiedVisible: createSimplified instanceof HTMLElement,
      createSummaryVisible: createSummary instanceof HTMLElement,
      currentSummaryDetailLabel: currentSummaryDetail?.textContent?.trim() ?? null,
      derivedContextContainsSummarySnippet:
        typeof expectedSummarySnippet === 'string' &&
        expectedSummarySnippet.length > 0 &&
        derivedContext instanceof HTMLElement &&
        derivedContext.textContent?.includes(expectedSummarySnippet) === true,
      derivedContextVisible: derivedContext instanceof HTMLElement,
      graphBranchVisible: graphBranch instanceof HTMLElement,
      notebookBranchVisible: notebookBranch instanceof HTMLElement,
      reflowedBranchVisible: reflowedBranch instanceof HTMLElement,
      settingsSummaryDetailVisible: settingsSummaryDetail instanceof HTMLElement,
      studyBranchVisible: studyBranch instanceof HTMLElement,
      summaryPlaceholderVisible: summaryPlaceholder instanceof HTMLElement,
      summaryDetailInlineVisible: document.querySelector('.reader-derived-context [aria-label="Summary detail"]') instanceof HTMLElement,
    }
  }, { expectedSummarySnippet: summarySnippet })
}

export async function captureReaderGeneratedModeRefinementEvidence({
  baseUrl,
  directory,
  page,
  stagePrefix,
}) {
  const targetDocument = await fetchGeneratedModeTarget(baseUrl)
  await openReaderDocumentByTitle(page, baseUrl, targetDocument.title)

  await selectReaderView(page, 'Original')
  const originalMetrics = await readGeneratedModeMetrics(page, targetDocument.summarySnippet)
  const originalWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-reader-original-generated-baseline.png`)

  await selectReaderView(page, 'Reflowed')
  const reflowedContext = page.locator('.reader-derived-context').first()
  await reflowedContext.waitFor({ state: 'visible', timeout: 20000 })
  const reflowedMetrics = await readGeneratedModeMetrics(page, targetDocument.summarySnippet)
  const reflowedContextCapture = await captureLocatorScreenshot(
    page,
    reflowedContext,
    directory,
    `${stagePrefix}-reader-reflowed-derived-context.png`,
  )

  let simplifiedMetrics = {
    createSimplifiedVisible: false,
    derivedContextVisible: false,
  }
  let simplifiedWideTop = null
  if (targetDocument.simplifiedTargetTitle) {
    await openReaderDocumentByTitle(page, baseUrl, targetDocument.simplifiedTargetTitle)
    await selectReaderView(page, 'Simplified')
    await page.getByRole('button', { name: 'Create Simplified' }).waitFor({ state: 'visible', timeout: 20000 })
    simplifiedMetrics = await readGeneratedModeMetrics(page, targetDocument.summarySnippet)
    simplifiedWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-reader-simplified-missing.png`)
  }

  await openReaderDocumentByTitle(page, baseUrl, targetDocument.title)
  await selectReaderView(page, 'Summary')
  await page.getByRole('group', { name: 'Summary detail' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(200)
  const summaryMetrics = await readGeneratedModeMetrics(page, targetDocument.summarySnippet)
  const summaryContextCapture = await captureLocatorScreenshot(
    page,
    page.locator('.reader-derived-context').first(),
    directory,
    `${stagePrefix}-reader-summary-derived-context.png`,
  )
  const summaryWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-reader-summary-wide-top.png`)

  return {
    captures: {
      originalWideTop,
      reflowedContextCapture,
      simplifiedWideTop,
      summaryContextCapture,
      summaryWideTop,
    },
    metrics: {
      targetDocumentTitle: targetDocument.title,
      targetDocumentModes: targetDocument.available_modes,
      simplifiedAvailableInLiveData: Boolean(targetDocument.simplifiedTargetTitle),
      summaryReadyInLiveData: Boolean(targetDocument.summarySnippet),
      originalDerivedContextVisible: originalMetrics.derivedContextVisible,
      reflowedBranchVisible: reflowedMetrics.reflowedBranchVisible,
      reflowedDerivedContextVisible: reflowedMetrics.derivedContextVisible,
      reflowedGraphBranchVisible: reflowedMetrics.graphBranchVisible,
      reflowedNotebookBranchVisible: reflowedMetrics.notebookBranchVisible,
      reflowedStudyBranchVisible: reflowedMetrics.studyBranchVisible,
      simplifiedCreateVisible: simplifiedMetrics.createSimplifiedVisible,
      simplifiedDerivedContextVisible: simplifiedMetrics.derivedContextVisible,
      summaryArticleContainsSummarySnippet: summaryMetrics.articleContainsSummarySnippet,
      summaryContextContainsSummarySnippet: summaryMetrics.derivedContextContainsSummarySnippet,
      summaryCreateVisible: summaryMetrics.createSummaryVisible,
      summaryCurrentDetailLabel: summaryMetrics.currentSummaryDetailLabel,
      summaryDerivedContextVisible: summaryMetrics.derivedContextVisible,
      summaryGraphBranchVisible: summaryMetrics.graphBranchVisible,
      summaryInlineDetailVisible: summaryMetrics.summaryDetailInlineVisible,
      summaryNotebookBranchVisible: summaryMetrics.notebookBranchVisible,
      summaryPlaceholderVisible: summaryMetrics.summaryPlaceholderVisible,
      summaryReflowedBranchVisible: summaryMetrics.reflowedBranchVisible,
      summarySettingsDetailVisible: summaryMetrics.settingsSummaryDetailVisible,
      summaryStudyBranchVisible: summaryMetrics.studyBranchVisible,
    },
  }
}

export { captureReaderRegressionEvidence, desktopViewport }
