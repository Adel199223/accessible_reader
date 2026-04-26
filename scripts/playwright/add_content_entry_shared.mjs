import {
  captureLocatorScreenshot,
  captureViewportScreenshot,
  desktopViewport,
  launchBrowserContext,
  openGraph,
  openHome,
  openOriginalReaderFromHome,
} from './home_rendered_preview_quality_shared.mjs'
import { closeTourIfVisible } from './graph_recall_style_shared.mjs'

export { desktopViewport, launchBrowserContext }

function normalizeText(value) {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

function currentRoute(urlValue) {
  const url = new URL(urlValue)
  return `${url.pathname}${url.search}`
}

async function openAddContentDialog(page, trigger) {
  const routeBefore = currentRoute(page.url())
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Add content' })
  await dialog.waitFor({ state: 'visible', timeout: 20000 })
  await page.getByText('One place to add things', { exact: true }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(200)
  return {
    dialog,
    routeAfter: currentRoute(page.url()),
    routeBefore,
  }
}

async function closeAddContentDialog(dialog) {
  await dialog.getByRole('button', { name: 'Close Add content' }).click()
  await dialog.waitFor({ state: 'hidden', timeout: 20000 })
}

async function readDialogModeLabels(dialog) {
  const tabs = dialog.locator('[role="tab"]')
  const count = await tabs.count()
  const labels = []
  let selectedLabel = null

  for (let index = 0; index < count; index += 1) {
    const tab = tabs.nth(index)
    const label = normalizeText(await tab.locator('strong').first().textContent().catch(() => ''))
    if (!label) {
      continue
    }
    labels.push(label)
    if ((await tab.getAttribute('aria-selected')) === 'true') {
      selectedLabel = label
    }
  }

  return { labels, selectedLabel }
}

async function openStudy(page, baseUrl) {
  const response = await page.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Study navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }
  await page.getByRole('heading', { name: 'Review', exact: true, level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByLabel('Study workspace header').waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(300)
}

async function readHomeAddEntryMetrics(page, dialog) {
  const addButton = page.getByRole('button', { name: 'Add', exact: true }).first()
  const newNoteButton = page.getByRole('button', { name: 'New note', exact: true }).first()
  const addTile = page.locator('.recall-home-parity-add-tile-stage563').first()
  const { labels, selectedLabel } = await readDialogModeLabels(dialog)
  const dialogTitle = normalizeText(await dialog.locator('h2').first().textContent().catch(() => ''))
  const dialogEyebrow = normalizeText(await dialog.locator('.workspace-dialog-eyebrow').first().textContent().catch(() => ''))
  const dialogBox = await dialog.boundingBox()
  const modeTabs = dialog.locator('.import-panel-mode')
  const modeCount = await modeTabs.count()
  const modeHeights = []
  for (let index = 0; index < modeCount; index += 1) {
    const box = await modeTabs.nth(index).boundingBox().catch(() => null)
    if (box) {
      modeHeights.push(box.height)
    }
  }
  const maxModeHeight = modeHeights.length > 0 ? Math.max(...modeHeights) : 0

  return {
    addContentCommandRowCompact:
      (await dialog.locator('[data-add-content-command-row-stage880="true"]').count()) > 0,
    addContentDialogHeight: dialogBox?.height ?? 0,
    addContentLegacyHeroVisible: await dialog.locator('.import-panel-entry-hero').isVisible().catch(() => false),
    addContentModeOrderStable: labels.join('|') === ['Paste text', 'Web page', 'Choose file'].join('|'),
    addContentModeTabsCompact: maxModeHeight > 0 && maxModeHeight <= 86,
    addContentModeTabMaxHeight: maxModeHeight,
    addContentPrimaryWorkbenchVisible:
      (await dialog.locator('[data-add-content-primary-workbench-stage880="true"]').count()) > 0,
    addContentSupportRailVisible: await dialog.locator('.import-panel-support-inline').isVisible().catch(() => false),
    addContentSupportSeamInline:
      (await dialog.locator('[data-add-content-support-seam-stage880="true"]').count()) > 0,
    defaultModeLabel: selectedLabel,
    dialogEyebrow,
    dialogTitle,
    homeAddTileVisible: await addTile.isVisible().catch(() => false),
    modeLabels: labels,
    newNoteVisibleOutsideDialog: await newNoteButton.isVisible().catch(() => false),
    notebookActionEmbeddedInDialog: (await dialog.getByRole('button', { name: 'New note', exact: true }).count()) > 0,
    shellAddLabel: normalizeText(await addButton.innerText().catch(() => '')),
  }
}

export async function captureAddContentEntryEvidence({
  baseUrl,
  directory,
  graphPage,
  homePage,
  notebookPage,
  readerPage,
  stageLabel,
  stagePrefix,
  studyPage,
}) {
  await openHome(homePage, baseUrl)
  const homeWideTop = await captureViewportScreenshot(homePage, directory, `${stagePrefix}-home-wide-top.png`)

  const homeAddButton = homePage.getByRole('button', { name: 'Add', exact: true }).first()
  await homeAddButton.waitFor({ state: 'visible', timeout: 20000 })
  const homeDialogOpen = await openAddContentDialog(homePage, homeAddButton)
  const homeDialog = homeDialogOpen.dialog
  const homeDialogMetrics = await readHomeAddEntryMetrics(homePage, homeDialog)

  if (!homeDialogMetrics.homeAddTileVisible) {
    throw new Error(`${stageLabel} expected the Home add tile to remain visible before opening the Add content dialog.`)
  }
  if (!homeDialogMetrics.newNoteVisibleOutsideDialog) {
    throw new Error(`${stageLabel} expected the New note launcher to remain outside the Add content dialog.`)
  }
  if (homeDialogMetrics.notebookActionEmbeddedInDialog) {
    throw new Error(`${stageLabel} expected Add content to stay separate from Notebook creation.`)
  }
  if (!homeDialogMetrics.addContentCommandRowCompact) {
    throw new Error(`${stageLabel} expected Add content to expose the compact command row.`)
  }
  if (homeDialogMetrics.addContentLegacyHeroVisible) {
    throw new Error(`${stageLabel} expected Add content to retire the old internal hero shell.`)
  }
  if (homeDialogMetrics.addContentSupportRailVisible) {
    throw new Error(`${stageLabel} expected Add content support to be inline instead of a side rail.`)
  }
  if (!homeDialogMetrics.addContentSupportSeamInline) {
    throw new Error(`${stageLabel} expected Add content to expose an inline support seam.`)
  }
  if (!homeDialogMetrics.addContentModeTabsCompact) {
    throw new Error(
      `${stageLabel} expected Add content mode tabs to stay compact; max height was ${homeDialogMetrics.addContentModeTabMaxHeight}.`,
    )
  }
  if (!homeDialogMetrics.addContentPrimaryWorkbenchVisible) {
    throw new Error(`${stageLabel} expected Add content to expose the selected import workbench.`)
  }
  if (homeDialogMetrics.dialogTitle !== 'Add content') {
    throw new Error(`${stageLabel} expected the dialog title to stay Add content, found ${homeDialogMetrics.dialogTitle}.`)
  }
  if (homeDialogMetrics.dialogEyebrow !== 'Add to Recall') {
    throw new Error(`${stageLabel} expected the dialog eyebrow to be Add to Recall, found ${homeDialogMetrics.dialogEyebrow}.`)
  }
  if (homeDialogMetrics.defaultModeLabel !== 'Paste text') {
    throw new Error(`${stageLabel} expected Paste text to remain the default import mode, found ${homeDialogMetrics.defaultModeLabel}.`)
  }
  if (homeDialogMetrics.shellAddLabel !== 'Add') {
    throw new Error(`${stageLabel} expected the global launcher label to read Add, found ${homeDialogMetrics.shellAddLabel}.`)
  }
  if (homeDialogOpen.routeBefore !== homeDialogOpen.routeAfter) {
    throw new Error(
      `${stageLabel} expected Home to keep the same route while the Add content dialog opens, found ${homeDialogOpen.routeBefore} -> ${homeDialogOpen.routeAfter}.`,
    )
  }
  if (!homeDialogMetrics.addContentModeOrderStable) {
    throw new Error(`${stageLabel} expected the Add content mode order to stay Paste text / Web page / Choose file, found ${homeDialogMetrics.modeLabels.join(', ')}.`)
  }

  const homeAddDialogWideTop = await captureViewportScreenshot(
    homePage,
    directory,
    `${stagePrefix}-home-add-dialog-wide-top.png`,
  )
  const addDialogPasteMode = await captureLocatorScreenshot(
    homePage,
    homeDialog,
    directory,
    `${stagePrefix}-add-dialog-paste-mode.png`,
  )

  await homeDialog.getByRole('tab', { name: /^Web page/i }).click()
  await homeDialog.getByRole('textbox', { name: 'Article URL' }).waitFor({ state: 'visible', timeout: 20000 })
  await homePage.waitForTimeout(150)
  const addDialogWebMode = await captureLocatorScreenshot(
    homePage,
    homeDialog,
    directory,
    `${stagePrefix}-add-dialog-web-mode.png`,
  )

  await homeDialog.getByRole('tab', { name: /^Choose file/i }).click()
  const fileDrop = homeDialog.getByLabel('File import')
  await fileDrop.waitFor({ state: 'visible', timeout: 20000 })
  await homePage.waitForTimeout(150)
  const addDialogFileMode = await captureLocatorScreenshot(
    homePage,
    homeDialog,
    directory,
    `${stagePrefix}-add-dialog-file-mode.png`,
  )
  const fileDropVisible = await fileDrop.isVisible().catch(() => false)
  if (!fileDropVisible) {
    throw new Error(`${stageLabel} expected the file mode to expose a visible drop-zone style import target.`)
  }

  await closeAddContentDialog(homeDialog)

  const addTile = homePage.locator('.recall-home-parity-add-tile-stage563').first()
  const tileDialogOpen = await openAddContentDialog(homePage, addTile)
  if (tileDialogOpen.routeBefore !== tileDialogOpen.routeAfter) {
    throw new Error(
      `${stageLabel} expected the Home add tile to open the same global dialog without route churn, found ${tileDialogOpen.routeBefore} -> ${tileDialogOpen.routeAfter}.`,
    )
  }
  await closeAddContentDialog(tileDialogOpen.dialog)

  const originalReaderEvidence = await openOriginalReaderFromHome(
    readerPage,
    directory,
    stagePrefix,
    baseUrl,
  )
  const readerAddButton = readerPage.getByRole('button', { name: 'Add', exact: true }).first()
  await readerAddButton.waitFor({ state: 'visible', timeout: 20000 })
  const readerDialogOpen = await openAddContentDialog(readerPage, readerAddButton)
  const readerDialog = readerDialogOpen.dialog
  const readerAddDialogWideTop = await captureViewportScreenshot(
    readerPage,
    directory,
    `${stagePrefix}-reader-add-dialog-wide-top.png`,
  )
  if (readerDialogOpen.routeBefore !== readerDialogOpen.routeAfter) {
    throw new Error(
      `${stageLabel} expected Reader to keep the same route while the Add content dialog opens, found ${readerDialogOpen.routeBefore} -> ${readerDialogOpen.routeAfter}.`,
    )
  }
  await closeAddContentDialog(readerDialog)

  await openGraph(graphPage, baseUrl)
  await closeTourIfVisible(graphPage)
  const graphWideTop = await captureViewportScreenshot(graphPage, directory, `${stagePrefix}-graph-wide-top.png`)

  const notebookResponse = await notebookPage.goto(`${baseUrl}/recall?section=notes`, { waitUntil: 'networkidle' })
  if (!notebookResponse || !notebookResponse.ok()) {
    throw new Error(`${stageLabel} notebook regression navigation failed with status ${notebookResponse?.status() ?? 'unknown'}.`)
  }
  await notebookPage.getByRole('heading', { name: 'Notebook', exact: true }).waitFor({ state: 'visible', timeout: 20000 })
  await notebookPage.waitForTimeout(200)
  const notebookWideTop = await captureViewportScreenshot(
    notebookPage,
    directory,
    `${stagePrefix}-notebook-wide-top.png`,
  )

  await openStudy(studyPage, baseUrl)
  const studyWideTop = await captureViewportScreenshot(studyPage, directory, `${stagePrefix}-study-wide-top.png`)

  const [graphMetrics, notebookMetrics, readerMetrics, studyMetrics] = await Promise.all([
    graphPage.evaluate(() => ({
      graphCanvasVisible: document.querySelector('[aria-label="Knowledge graph canvas"]') instanceof HTMLElement,
    })),
    notebookPage.evaluate(() => {
      const sectionLabels = Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]'))
        .map((tab) => tab.textContent?.replace(/\s+/g, ' ').trim() ?? '')
        .filter(Boolean)
      return {
        notesAliasResolvedToNotebook:
          document.querySelector('[aria-selected="true"][role="tab"]')?.textContent?.replace(/\s+/g, ' ').trim() === 'Home' &&
          Array.from(document.querySelectorAll('h1, h2, h3')).some((heading) => heading.textContent?.trim() === 'Notebook'),
        notesSidebarVisible: sectionLabels.includes('Notes'),
        notebookVisible: Array.from(document.querySelectorAll('h1, h2, h3')).some(
          (heading) => heading.textContent?.trim() === 'Notebook',
        ),
      }
    }),
    readerPage.evaluate(() => ({
      originalReaderVisible: document.querySelector('.reader-workspace') instanceof HTMLElement,
    })),
    studyPage.evaluate(() => ({
      dashboardVisible: document.querySelector('[aria-label="Study workspace header"]') instanceof HTMLElement,
      selectedStudyView:
        Array.from(document.querySelectorAll('[aria-label="Study views"] [role="tab"]'))
          .find((tab) => tab.getAttribute('aria-selected') === 'true')
          ?.textContent?.replace(/\s+/g, ' ').trim() ?? null,
    })),
  ])

  if (!graphMetrics.graphCanvasVisible || !notebookMetrics.notebookVisible || !readerMetrics.originalReaderVisible) {
    throw new Error(`${stageLabel} expected Graph, Notebook, and Reader regression surfaces to remain visible.`)
  }
  if (notebookMetrics.notesSidebarVisible) {
    throw new Error(`${stageLabel} expected Notebook placement to stay embedded with no visible Notes sidebar entry.`)
  }
  if (!notebookMetrics.notesAliasResolvedToNotebook) {
    throw new Error(`${stageLabel} expected /recall?section=notes to keep resolving into the embedded Notebook workspace.`)
  }
  if (!studyMetrics.dashboardVisible || studyMetrics.selectedStudyView !== 'Review') {
    throw new Error(`${stageLabel} expected Study to remain on the review-first dashboard, found ${studyMetrics.selectedStudyView}.`)
  }

  return {
    captures: {
      addDialogFileMode,
      addDialogPasteMode,
      addDialogWebMode,
      graphWideTop,
      homeAddDialogWideTop,
      homeWideTop,
      notebookWideTop,
      readerAddDialogWideTop,
      readerOriginalWideTop: originalReaderEvidence.capture,
      studyWideTop,
    },
    metrics: {
      ...graphMetrics,
      ...homeDialogMetrics,
      ...notebookMetrics,
      ...readerMetrics,
      ...studyMetrics,
      fileDropVisible,
      homeRouteUnchangedOnOpen: homeDialogOpen.routeBefore === homeDialogOpen.routeAfter,
      homeTileLaunchRouteUnchanged: tileDialogOpen.routeBefore === tileDialogOpen.routeAfter,
      originalReaderSourceTitle: originalReaderEvidence.sourceTitle,
      readerRouteUnchangedOnOpen: readerDialogOpen.routeBefore === readerDialogOpen.routeAfter,
    },
  }
}
