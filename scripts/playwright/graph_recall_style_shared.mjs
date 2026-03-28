import {
  captureLocatorScreenshot,
  captureViewportScreenshot,
  openGraph,
} from './home_rendered_preview_quality_shared.mjs'

const graphTourTitles = [
  'Welcome to GraphView 2.0',
  'Customize your view',
  'Navigate with ease',
  'Need help?',
  'Filter by tag',
  'Discover connections',
]

const graphTourCaptureSuffixes = [
  'graph-tour-welcome.png',
  'graph-tour-customize.png',
  'graph-tour-navigation.png',
  'graph-tour-help.png',
  'graph-tour-filter.png',
  'graph-tour-discover.png',
]

const preferredGroupLabels = ['Captures', 'Web', 'Documents', 'Concept']
const preferredPathNodeLabels = ['Stage 10 node', 'Stage 13 node']
const graphCanvasSafeBottomMargin = 156

export async function captureGraphRecallStyleEvidence({
  baseUrl,
  directory,
  page,
  stageLabel,
  stagePrefix,
}) {
  await openGraph(page, baseUrl)

  const controlSeam = page.getByLabel('Graph control seam').first()
  const searchBox = controlSeam.getByRole('searchbox', { name: 'Search by title' }).first()
  const viewControls = controlSeam.getByRole('group', { name: 'Graph view controls' }).first()
  const settingsSidebar = page.getByRole('complementary', { name: 'Graph settings sidebar' }).first()
  const countPill = page.locator('.recall-graph-canvas-count-pill').first()
  const utilityCorners = page.getByLabel('Graph utility corners').first()
  const tour = page.getByLabel('Graph View tour').first()

  await Promise.all([
    controlSeam.waitFor({ state: 'visible', timeout: 20000 }),
    searchBox.waitFor({ state: 'visible', timeout: 20000 }),
    viewControls.waitFor({ state: 'visible', timeout: 20000 }),
    settingsSidebar.waitFor({ state: 'visible', timeout: 20000 }),
    countPill.waitFor({ state: 'visible', timeout: 20000 }),
    utilityCorners.waitFor({ state: 'visible', timeout: 20000 }),
    tour.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  await page.waitForTimeout(350)

  const initialMetrics = await readGraphBrowseMetrics(page)
  const searchPlaceholder = (await searchBox.getAttribute('placeholder')) ?? ''
  if (!initialMetrics.settingsOpenByDefault) {
    throw new Error(`${stageLabel} expected Graph settings to open by default.`)
  }
  if (!initialMetrics.tourVisible) {
    throw new Error(`${stageLabel} expected the Graph View tour to be visible on first open.`)
  }
  if (initialMetrics.idleFocusTrayVisible || initialMetrics.idleDetailDockVisible) {
    throw new Error(`${stageLabel} expected idle Graph browse to stay contextual with no focus tray or detail dock.`)
  }
  if (initialMetrics.helpControlsVisible) {
    throw new Error(`${stageLabel} expected help controls to stay hidden while the Graph View tour is visible.`)
  }
  if (initialMetrics.floatingLegendVisible) {
    throw new Error(`${stageLabel} expected no floating Graph legend outside the settings sidebar.`)
  }
  if (initialMetrics.sectionTitles.slice(0, 3).join('|') !== 'Presets|Filters|Groups') {
    throw new Error(`${stageLabel} expected Graph settings to lead with Presets, Filters, and Groups.`)
  }
  if (initialMetrics.settingsStatusRowVisible) {
    throw new Error(`${stageLabel} expected no visible Graph settings status row under the header.`)
  }
  if (initialMetrics.presetDraftInputVisible) {
    throw new Error(`${stageLabel} expected the preset draft input to stay hidden at rest.`)
  }
  if (!initialMetrics.savedViewsCollapsed) {
    throw new Error(`${stageLabel} expected the Saved views disclosure to stay collapsed at rest.`)
  }
  if (!initialMetrics.advancedFiltersCollapsed || !initialMetrics.advancedLayoutCollapsed) {
    throw new Error(`${stageLabel} expected advanced Graph settings disclosures to be collapsed at rest.`)
  }
  if (initialMetrics.searchNavigationVisible) {
    throw new Error(`${stageLabel} expected search stepping to stay hidden before any multi-match query is active.`)
  }
  if (initialMetrics.persistentStatusSeamVisible) {
    throw new Error(`${stageLabel} expected no persistent multi-chip status seam in the Graph control corner.`)
  }
  if (initialMetrics.nodeCoreCount < 1 || initialMetrics.labelTrackCount < 1) {
    throw new Error(`${stageLabel} expected circular node cores with external label tracks on the Graph canvas.`)
  }
  if (searchPlaceholder !== 'Search by title') {
    throw new Error(`${stageLabel} expected the search corner placeholder to be "Search by title", found "${searchPlaceholder}".`)
  }
  if (!initialMetrics.viewControlLabels.includes('Fit to view') || !initialMetrics.viewControlLabels.includes('Lock graph')) {
    throw new Error(`${stageLabel} expected fit and lock controls to remain accessible from the Graph utility corner.`)
  }
  if (!initialMetrics.viewControlsIconOnly) {
    throw new Error(`${stageLabel} expected fit and lock controls to render icon-first with no visible text labels at rest.`)
  }
  if (!initialMetrics.countPillClearsSidebar) {
    throw new Error(`${stageLabel} expected the Graph count pill to clear the open settings rail.`)
  }

  const graphWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-graph-wide-top.png`)

  const tourCaptures = {}
  for (let index = 0; index < graphTourTitles.length; index += 1) {
    const title = graphTourTitles[index]
    await waitForTourStep(page, title)
    tourCaptures[slugifyTourTitle(title)] = await captureLocatorScreenshot(
      page,
      page.getByLabel('Graph View tour').first(),
      directory,
      `${stagePrefix}-${graphTourCaptureSuffixes[index]}`,
    )
    if (index < graphTourTitles.length - 1) {
      await page.getByLabel('Graph View tour').getByRole('button', { name: /Let's explore|Next/i }).click()
      await page.waitForTimeout(250)
    }
  }

  await page.getByLabel('Graph View tour').getByRole('button', { name: 'Start exploring' }).click()
  await waitForTourHidden(page)

  const helpControls = page.getByRole('group', { name: 'Graph help controls' }).first()
  await Promise.all([
    helpControls.waitFor({ state: 'visible', timeout: 20000 }),
    page.getByRole('button', { name: 'Replay Graph tour' }).waitFor({ state: 'visible', timeout: 20000 }),
    page.getByRole('button', { name: 'Graph help' }).waitFor({ state: 'visible', timeout: 20000 }),
  ])
  await page.waitForTimeout(250)

  const idleMetrics = await readGraphBrowseMetrics(page)
  if (!idleMetrics.helpControlsVisible) {
    throw new Error(`${stageLabel} expected compact help controls after dismissing the Graph View tour.`)
  }
  if (idleMetrics.idleFocusTrayVisible || idleMetrics.idleDetailDockVisible) {
    throw new Error(`${stageLabel} expected the Graph idle state to keep the focus tray and detail dock hidden after the tour.`)
  }
  if (idleMetrics.statusNoteVisible) {
    throw new Error(`${stageLabel} expected no visible idle zoom or lock readout in the Graph control corner.`)
  }

  const graphSettingsOpenWideTop = await captureLocatorScreenshot(
    page,
    settingsSidebar,
    directory,
    `${stagePrefix}-graph-settings-open-sidebar.png`,
  )
  const graphTopRightCornerWideTop = await captureLocatorScreenshot(
    page,
    controlSeam,
    directory,
    `${stagePrefix}-graph-top-right-corner.png`,
  )
  const graphBottomUtilityWideTop = await captureLocatorScreenshot(
    page,
    utilityCorners,
    directory,
    `${stagePrefix}-graph-bottom-utility-corners.png`,
  )
  const graphIdleWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-graph-idle-wide-top.png`)

  await searchBox.fill('Stage 10')
  await page.waitForTimeout(250)
  const singleMatchMetrics = await readGraphBrowseMetrics(page)
  if (singleMatchMetrics.searchNavigationVisible) {
    throw new Error(`${stageLabel} expected single-match search states to keep search stepping hidden.`)
  }

  const multiMatchQuery = await findGraphMultiMatchQuery(page, searchBox)
  if (!multiMatchQuery) {
    throw new Error(`${stageLabel} could not discover a multi-match Graph search query from the visible graph.`)
  }
  const multiMatchMetrics = await readGraphBrowseMetrics(page)
  if (!multiMatchMetrics.searchNavigationVisible) {
    throw new Error(`${stageLabel} expected multi-match search states to expose compact stepping controls.`)
  }

  await searchBox.fill('')
  await page.waitForTimeout(250)

  const [selectedNodeLabel] = await getVisibleNodeLabels(page, 1)
  await clickNode(page, selectedNodeLabel)
  await Promise.all([
    page.getByLabel('Graph focus tray').first().waitFor({ state: 'visible', timeout: 20000 }),
    page.getByLabel('Node detail dock').first().waitFor({ state: 'visible', timeout: 20000 }),
    page.getByRole('button', { name: 'Open card' }).first().waitFor({ state: 'visible', timeout: 20000 }),
  ])
  await page.waitForTimeout(250)
  const selectedMetrics = await readGraphBrowseMetrics(page)
  if (!selectedMetrics.selectedFocusTrayVisible || !selectedMetrics.selectedDetailDockVisible) {
    throw new Error(`${stageLabel} expected a selected node to reveal both the Graph focus tray and the detail dock.`)
  }
  const graphSelectedWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-graph-selected-wide-top.png`)

  await openGraph(page, baseUrl)
  await closeTourIfVisible(page)
  const [pathStartNodeLabel, pathEndNodeLabel] = await getPathNodeLabels(page)
  await clickNode(page, pathStartNodeLabel, { modifiers: ['Control'] })
  await page.getByRole('button', { name: 'Clear selection' }).waitFor({ state: 'visible', timeout: 20000 })
  await clickNode(page, pathEndNodeLabel, { modifiers: ['Control'] })
  const findPathButton = page.getByRole('button', { name: 'Find path' }).first()
  await findPathButton.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
  const graphPathReadyWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-graph-path-ready-wide-top.png`)

  await findPathButton.click()
  const pathOutcome = page.getByLabel('Graph focus tray').getByText(/Shortest visible path|No visible path/i).first()
  await pathOutcome.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
  const pathOutcomeTitle = ((await pathOutcome.textContent()) ?? '').trim()
  const graphPathResultWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-graph-path-result-wide-top.png`)

  await openGraph(page, baseUrl)
  await closeTourIfVisible(page)
  const groupFilterLabel = await applyGraphGroupFilter(page)
  await page.getByRole('button', { name: 'Show all groups' }).first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
  const filteredMetrics = await readGraphBrowseMetrics(page)
  if (!filteredMetrics.showAllGroupsVisible) {
    throw new Error(`${stageLabel} expected an active Graph group filter to expose a visible reset path.`)
  }
  const graphFilteredWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-graph-filtered-wide-top.png`)

  return {
    captures: {
      graphFilteredWideTop,
      graphBottomUtilityWideTop,
      graphIdleWideTop,
      graphPathReadyWideTop,
      graphPathResultWideTop,
      graphSelectedWideTop,
      graphSettingsOpenWideTop,
      graphTopRightCornerWideTop,
      graphWideTop,
      ...tourCaptures,
    },
    metrics: {
      advancedFiltersCollapsed: initialMetrics.advancedFiltersCollapsed,
      advancedLayoutCollapsed: initialMetrics.advancedLayoutCollapsed,
      filterGroupLabel: groupFilterLabel,
      graphSearchPlaceholder: searchPlaceholder,
      helpControlsVisibleAfterDismiss: idleMetrics.helpControlsVisible,
      idleCountPillClearsSidebar: idleMetrics.countPillClearsSidebar,
      idleCountPillLabelText: idleMetrics.countPillLabelText,
      idleCountPillText: idleMetrics.countPillText,
      idleDetailDockVisible: idleMetrics.idleDetailDockVisible,
      idleFocusTrayVisible: idleMetrics.idleFocusTrayVisible,
      nodeCoreCount: initialMetrics.nodeCoreCount,
      nodeLabelTrackCount: initialMetrics.labelTrackCount,
      persistentStatusSeamVisible: initialMetrics.persistentStatusSeamVisible,
      presetDraftInputVisibleOnOpen: initialMetrics.presetDraftInputVisible,
      multiMatchQuery,
      savedViewsCollapsedByDefault: initialMetrics.savedViewsCollapsed,
      searchNavigationVisibleOnMultiMatch: multiMatchMetrics.searchNavigationVisible,
      searchNavigationVisibleOnSingleMatch: singleMatchMetrics.searchNavigationVisible,
      selectedDetailDockVisible: selectedMetrics.selectedDetailDockVisible,
      selectedFocusTrayVisible: selectedMetrics.selectedFocusTrayVisible,
      selectedNodeLabel,
      sectionTitles: initialMetrics.sectionTitles,
      settingsOpenByDefault: initialMetrics.settingsOpenByDefault,
      settingsStatusRowVisibleOnOpen: initialMetrics.settingsStatusRowVisible,
      showAllGroupsVisible: filteredMetrics.showAllGroupsVisible,
      statusNoteVisibleAfterDismiss: idleMetrics.statusNoteVisible,
      tourSequence: [...graphTourTitles],
      tourVisibleOnOpen: initialMetrics.tourVisible,
      viewControlLabels: idleMetrics.viewControlLabels,
      viewControlsIconOnly: idleMetrics.viewControlsIconOnly,
      visibleNodeLabels: await getVisibleNodeLabels(
        page,
        Math.min(4, await page.locator('button[aria-label^="Select node "]').count()),
        { strict: false },
      ),
      pathEndNodeLabel,
      pathOutcomeTitle,
      pathStartNodeLabel,
      floatingLegendVisible: initialMetrics.floatingLegendVisible,
    },
  }
}

async function waitForTourStep(page, title) {
  const tour = page.getByLabel('Graph View tour').first()
  await tour.waitFor({ state: 'visible', timeout: 20000 })
  await tour.getByText(title, { exact: true }).waitFor({ state: 'visible', timeout: 20000 })
}

export async function closeTourIfVisible(page) {
  const closeButton = page.getByRole('button', { name: 'Close Graph tour' })
  if ((await closeButton.count()) === 0) {
    return
  }
  await closeButton.first().click()
  await waitForTourHidden(page)
}

async function waitForTourHidden(page) {
  await page.waitForFunction(() => !document.querySelector('[aria-label="Graph View tour"]'))
}

async function clickNode(page, nodeLabel, options = {}) {
  const nodeButton = page.getByRole('button', { name: `Select node ${nodeLabel}` }).first()
  await nodeButton.waitFor({ state: 'visible', timeout: 20000 })
  if ((options.modifiers ?? []).length > 0) {
    await nodeButton.evaluate(
      (button, modifiers) => {
        button.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            ctrlKey: modifiers.includes('Control'),
            metaKey: modifiers.includes('Meta'),
            shiftKey: modifiers.includes('Shift'),
          }),
        )
      },
      options.modifiers ?? [],
    )
    await page.waitForTimeout(250)
    return
  }

  const clickTarget = await nodeButton.evaluate((button) => {
    const target = button.querySelector('.recall-graph-node-button-core') ?? button
    const buttonRect = button.getBoundingClientRect()
    const rect = target.getBoundingClientRect()
    return {
      x: rect.left - buttonRect.left + rect.width / 2,
      y: rect.top - buttonRect.top + rect.height / 2,
    }
  })
  await nodeButton.click({
    ...options,
    position: clickTarget,
  })
  await page.waitForTimeout(250)
}

async function getVisibleNodeLabels(page, limit, options = {}) {
  const labels = await page.evaluate(
    ({ requestedLimit, safeBottomMargin }) => {
    const settingsSidebar = document.querySelector('[aria-label="Graph settings sidebar"]')
    const sidebarRect = settingsSidebar?.getBoundingClientRect()
    const minClickableX = sidebarRect ? sidebarRect.right + 24 : 0
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const maxClickableY = viewportHeight - safeBottomMargin

    const resolvedLabels = []
    for (const button of document.querySelectorAll('button[aria-label^="Select node "]')) {
      const label = button.getAttribute('aria-label')?.replace(/^Select node\s+/, '').trim() ?? ''
      if (!label) {
        continue
      }

      const clickTarget = button.querySelector('.recall-graph-node-button-core') ?? button
      const rect = clickTarget.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      if (
        centerX < minClickableX ||
        centerX < 0 ||
        centerX > viewportWidth ||
        centerY < 0 ||
        centerY > maxClickableY
      ) {
        continue
      }

      const topElement = document.elementFromPoint(centerX, centerY)
      if (topElement && !button.contains(topElement) && !topElement.contains(button)) {
        continue
      }

      resolvedLabels.push(label)
      if (resolvedLabels.length >= requestedLimit) {
        break
      }
    }

    return resolvedLabels
    },
    { requestedLimit: limit, safeBottomMargin: graphCanvasSafeBottomMargin },
  )
  if ((options.strict ?? true) && labels.length < limit) {
    throw new Error(`Expected at least ${limit} visible Graph nodes but found ${labels.length}.`)
  }
  return labels
}

async function applyGraphGroupFilter(page) {
  const legendList = page.getByRole('list', { name: 'Graph legend items' }).first()
  await legendList.waitFor({ state: 'visible', timeout: 20000 })

  for (const label of preferredGroupLabels) {
    const button = legendList.getByRole('button', { name: new RegExp(`^${escapeRegExp(label)}`, 'i') }).first()
    if ((await button.count()) === 0) {
      continue
    }
    await button.click()
    await page.waitForTimeout(250)
    return label
  }

  const button = legendList.getByRole('button').first()
  const buttonLabel = (await button.textContent())?.trim() ?? 'group'
  await button.click()
  await page.waitForTimeout(250)
  return buttonLabel
}

async function findGraphMultiMatchQuery(page, searchBox) {
  const candidateQueries = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('button[aria-label^="Select node "]'))
      .map((button) => button.getAttribute('aria-label')?.replace(/^Select node\s+/, '').trim() ?? '')
      .filter(Boolean)

    const rankedQueries = [
      'Stage',
      'node',
      'debug',
      'article',
      'capture',
      'local',
      'web',
      'document',
    ]

    for (const label of labels) {
      const normalizedLabel = label.replace(/\s+/g, ' ').trim()
      if (normalizedLabel.length >= 5) {
        rankedQueries.push(normalizedLabel.slice(0, Math.min(normalizedLabel.length, 10)).trim())
      }
      for (const token of normalizedLabel.split(/[^A-Za-z0-9]+/)) {
        if (token.length >= 3) {
          rankedQueries.push(token)
        }
      }
    }

    return Array.from(
      new Set(
        rankedQueries
          .map((query) => query.replace(/\s+/g, ' ').trim())
          .filter((query) => query.length >= 3),
      ),
    )
  })

  for (const query of candidateQueries) {
    await searchBox.fill(query)
    await page.waitForTimeout(250)
    const { searchNavigationVisible } = await readGraphBrowseMetrics(page)
    if (searchNavigationVisible) {
      return query
    }
  }

  return null
}

async function getPathNodeLabels(page) {
  const selection = await page.evaluate(
    async ({ preferredLabels, safeBottomMargin }) => {
    const settingsSidebar = document.querySelector('[aria-label="Graph settings sidebar"]')
    const sidebarRect = settingsSidebar?.getBoundingClientRect()
    const minClickableX = sidebarRect ? sidebarRect.right + 24 : 0
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const maxClickableY = viewportHeight - safeBottomMargin

    const visibleLabels = []
    for (const button of document.querySelectorAll('button[aria-label^="Select node "]')) {
      const label = button.getAttribute('aria-label')?.replace(/^Select node\s+/, '').trim() ?? ''
      if (!label) {
        continue
      }

      const clickTarget = button.querySelector('.recall-graph-node-button-core') ?? button
      const rect = clickTarget.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      if (
        centerX < minClickableX ||
        centerX < 0 ||
        centerX > viewportWidth ||
        centerY < 0 ||
        centerY > maxClickableY
      ) {
        continue
      }

      const topElement = document.elementFromPoint(centerX, centerY)
      if (topElement && !button.contains(topElement) && !topElement.contains(button)) {
        continue
      }

      visibleLabels.push(label)
    }

    const response = await fetch('/api/recall/graph?limit_nodes=40&limit_edges=60')
    if (!response.ok) {
      return { pair: null, visibleLabels }
    }

    const snapshot = await response.json()
    const visibleNodes = snapshot.nodes.filter((node) => visibleLabels.includes(node.label))
    const visibleNodeIds = new Set(visibleNodes.map((node) => node.id))
    const adjacency = new Map()

    for (const node of visibleNodes) {
      adjacency.set(node.id, new Set())
    }

    for (const edge of snapshot.edges ?? []) {
      if (!visibleNodeIds.has(edge.source_id) || !visibleNodeIds.has(edge.target_id)) {
        continue
      }
      adjacency.get(edge.source_id)?.add(edge.target_id)
      adjacency.get(edge.target_id)?.add(edge.source_id)
    }

    const labelByNodeId = new Map(visibleNodes.map((node) => [node.id, node.label]))
    const visiblePreferred = preferredLabels.filter((label) => visibleLabels.includes(label))
    const orderedLabels =
      visiblePreferred.length >= 2
        ? [...visiblePreferred, ...visibleLabels.filter((label) => !visiblePreferred.includes(label))]
        : visibleLabels

    for (let leftIndex = 0; leftIndex < orderedLabels.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < orderedLabels.length; rightIndex += 1) {
        const leftLabel = orderedLabels[leftIndex]
        const rightLabel = orderedLabels[rightIndex]
        const leftNode = visibleNodes.find((node) => node.label === leftLabel)
        const rightNode = visibleNodes.find((node) => node.label === rightLabel)
        if (!leftNode || !rightNode) {
          continue
        }
        const visited = new Set([leftNode.id])
        const queue = [leftNode.id]

        while (queue.length > 0) {
          const currentNodeId = queue.shift()
          if (currentNodeId === rightNode.id) {
            return { pair: [leftLabel, rightLabel], visibleLabels }
          }
          for (const nextNodeId of adjacency.get(currentNodeId) ?? []) {
            if (visited.has(nextNodeId)) {
              continue
            }
            visited.add(nextNodeId)
            queue.push(nextNodeId)
          }
        }
      }
    }

    const fallbackPair = visibleLabels.length >= 2 ? visibleLabels.slice(0, 2) : null
    return { pair: fallbackPair, visibleLabels }
    },
    { preferredLabels: preferredPathNodeLabels, safeBottomMargin: graphCanvasSafeBottomMargin },
  )

  if (selection.pair?.length >= 2) {
    return selection.pair.slice(0, 2)
  }

  const visibleLabels = selection.visibleLabels.slice(0, 5)
  const preferredVisibleLabels = preferredPathNodeLabels.filter((label) => visibleLabels.includes(label))
  if (preferredVisibleLabels.length >= 2) {
    return preferredVisibleLabels.slice(0, 2)
  }
  return visibleLabels.slice(0, 2)
}

async function readGraphBrowseMetrics(page) {
  return page.evaluate(() => {
    const settingsSidebar = document.querySelector('[aria-label="Graph settings sidebar"]')
    const tour = document.querySelector('[aria-label="Graph View tour"]')
    const helpControls = document.querySelector('[aria-label="Graph help controls"]')
    const countPill = document.querySelector('.recall-graph-canvas-count-pill')
    const countPillLabel = document.querySelector('.recall-graph-canvas-count-pill-label')
    const countPillRect = countPill?.getBoundingClientRect() ?? null
    const settingsSidebarRect = settingsSidebar?.getBoundingClientRect() ?? null
    const focusTray = document.querySelector('[aria-label="Graph focus tray"]')
    const detailDock = document.querySelector('[aria-label="Node detail dock"]')
    const floatingLegend = document.querySelector('[aria-label="Graph legend"]')
    const nodeButtons = Array.from(document.querySelectorAll('button[aria-label^="Select node "]'))
    const viewControlButtons = Array.from(
      document.querySelectorAll('[aria-label="Graph view controls"] button'),
    )
    const nodeCoreCount = nodeButtons.filter((button) => button.querySelector('.recall-graph-node-button-core')).length
    const labelTrackCount = nodeButtons.filter((button) => button.querySelector('.recall-graph-node-button-label-track')).length
    const countPillText = countPill?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
    const countPillLabelText = countPillLabel?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
    const viewControlLabels = viewControlButtons.map(
      (button) => button.getAttribute('aria-label') ?? button.getAttribute('title') ?? '',
    )
    const viewControlsIconOnly = viewControlButtons.every(
      (button) => (button.textContent?.replace(/\s+/g, ' ').trim() ?? '') === '',
    )
    const searchNavigationVisible = Boolean(document.querySelector('[aria-label="Graph search navigation"]'))
    const persistentStatusSeamVisible = Boolean(document.querySelector('.recall-graph-browser-control-utility-status-workbench-reset'))
    const settingsStatusRowVisible = Boolean(document.querySelector('.recall-graph-settings-panel-status'))
    const presetDraftInputVisible = Boolean(document.querySelector('input[aria-label="Graph preset name"]'))
    const statusNoteVisible = Boolean(document.querySelector('.recall-graph-browser-control-status-note'))
    const sectionTitles = Array.from(document.querySelectorAll('.recall-graph-sidebar-section-head strong')).map((element) =>
      element.textContent?.trim() ?? '',
    )
    const disclosureButtons = Array.from(
      document.querySelectorAll('button.recall-graph-settings-disclosure-toggle[aria-expanded]'),
    )
    const savedViewsButton = disclosureButtons.find((button) => button.textContent?.includes('Saved views'))
    const advancedFiltersButton = disclosureButtons.find((button) => button.textContent?.includes('Advanced filters'))
    const advancedLayoutButton = disclosureButtons.find((button) => button.textContent?.includes('Advanced layout'))
    const showAllGroupsVisible = Array.from(document.querySelectorAll('button')).some(
      (button) => button.textContent?.trim() === 'Show all groups',
    )
    return {
      advancedFiltersCollapsed: advancedFiltersButton?.getAttribute('aria-expanded') === 'false',
      advancedLayoutCollapsed: advancedLayoutButton?.getAttribute('aria-expanded') === 'false',
      countPillClearsSidebar: Boolean(
        !countPillRect ||
          !settingsSidebarRect ||
          countPillRect.left >= settingsSidebarRect.right + 8,
      ),
      countPillLabelText,
      countPillText,
      floatingLegendVisible: Boolean(floatingLegend),
      helpControlsVisible: Boolean(helpControls),
      idleDetailDockVisible: Boolean(detailDock),
      idleFocusTrayVisible: Boolean(focusTray),
      labelTrackCount,
      nodeCoreCount,
      persistentStatusSeamVisible,
      presetDraftInputVisible,
      savedViewsCollapsed: savedViewsButton?.getAttribute('aria-expanded') === 'false',
      searchNavigationVisible,
      sectionTitles,
      selectedDetailDockVisible: Boolean(detailDock),
      selectedFocusTrayVisible: Boolean(focusTray),
      settingsOpenByDefault: Boolean(settingsSidebar),
      settingsStatusRowVisible,
      showAllGroupsVisible,
      statusNoteVisible,
      tourVisible: Boolean(tour),
      viewControlLabels,
      viewControlsIconOnly,
    }
  })
}

function slugifyTourTitle(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
