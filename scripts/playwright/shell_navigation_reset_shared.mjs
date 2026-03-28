import {
  captureLocatorScreenshot,
  captureViewportScreenshot,
  desktopViewport,
  openGraph,
  openHome,
} from './home_rendered_preview_quality_shared.mjs'
import { closeTourIfVisible } from './graph_recall_style_shared.mjs'
import { captureMasterRoadmapResetEvidence, focusedViewport } from './master_roadmap_reset_shared.mjs'

export { desktopViewport, focusedViewport }

export async function captureShellNavigationResetEvidence({
  baseUrl,
  directory,
  focusedPage,
  graphPage,
  homePage,
  notebookPage,
  readerPage,
  stageLabel,
  stagePrefix,
  studyPage,
}) {
  const baselineEvidence = await captureMasterRoadmapResetEvidence({
    baseUrl,
    directory,
    focusedPage,
    homePage,
    notebookPage,
    readerPage,
    stagePrefix,
    studyPage,
  })
  const homeShellEvidence = await captureHomeCollapseEvidence(homePage, directory, stageLabel, stagePrefix, baseUrl)
  const graphShellEvidence = await captureGraphCollapseEvidence(graphPage, directory, stageLabel, stagePrefix, baseUrl)

  return {
    captures: {
      ...baselineEvidence.captures,
      ...homeShellEvidence.captures,
      ...graphShellEvidence.captures,
    },
    metrics: {
      ...baselineEvidence.metrics,
      ...homeShellEvidence.metrics,
      ...graphShellEvidence.metrics,
    },
  }
}

async function captureHomeCollapseEvidence(page, directory, stageLabel, stagePrefix, baseUrl) {
  await openHome(page, baseUrl)

  const shellRail = page.locator('.workspace-rail').first()
  const organizerRail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  const resizeHandle = page.getByRole('separator', { name: 'Resize Home organizer' }).first()
  const hideButton = page.getByRole('button', { name: 'Hide organizer' }).first()

  await Promise.all([
    shellRail.waitFor({ state: 'visible', timeout: 20000 }),
    organizerRail.waitFor({ state: 'visible', timeout: 20000 }),
    resizeHandle.waitFor({ state: 'visible', timeout: 20000 }),
    hideButton.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  await page.waitForTimeout(250)

  const shellMetrics = await readShellRailMetrics(page)
  if (shellMetrics.shellRailLabelVisible) {
    throw new Error(`${stageLabel} expected the global shell rail to hide visible text labels.`)
  }
  if (shellMetrics.shellRailBrandCopyVisible) {
    throw new Error(`${stageLabel} expected the global shell rail to retire visible brand copy.`)
  }
  if (shellMetrics.shellRailCollapseButtonVisible) {
    throw new Error(`${stageLabel} expected no global shell-rail collapse button in the primary rail.`)
  }
  if (shellMetrics.notesSidebarVisible) {
    throw new Error(`${stageLabel} expected no visible Notes destination in the global shell.`)
  }

  const homeOpenWidth = await measureWidth(organizerRail)
  await nudgeResizablePanel(resizeHandle)
  const homeResizedWidth = await measureWidth(organizerRail)
  if (!(homeResizedWidth > homeOpenWidth)) {
    throw new Error(`${stageLabel} expected the Home organizer width to respond to keyboard resizing.`)
  }

  const shellRailOpenWideTop = await captureLocatorScreenshot(
    page,
    shellRail,
    directory,
    `${stagePrefix}-shell-rail-open-wide-top.png`,
  )
  const homeWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-home-shell-open-wide-top.png`)

  await hideButton.click()
  await organizerRail.waitFor({ state: 'hidden', timeout: 20000 })
  const homeLauncher = page.getByRole('button', { name: 'Show home organizer' }).first()
  await homeLauncher.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)

  const homeCollapsedMetrics = await page.evaluate(() => {
    const organizerRail = document.querySelector('[aria-label="Home collection rail"]')
    const launcher = document.querySelector('[aria-label="Show home organizer"]')
    const controlSeam = document.querySelector('[aria-label="Home control seam"]')
    return {
      homeControlSeamVisibleWhenCollapsed: isElementVisible(controlSeam),
      homeOrganizerLauncherVisibleWhenCollapsed: isElementVisible(launcher),
      homeOrganizerVisibleWhenCollapsed: isElementVisible(organizerRail),
    }

    function isElementVisible(node) {
      if (!(node instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(node)
      const rect = node.getBoundingClientRect()
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width > 0 &&
        rect.height > 0
      )
    }
  })
  if (homeCollapsedMetrics.homeOrganizerVisibleWhenCollapsed) {
    throw new Error(`${stageLabel} expected the Home organizer panel to hide completely after collapse.`)
  }
  if (!homeCollapsedMetrics.homeOrganizerLauncherVisibleWhenCollapsed) {
    throw new Error(`${stageLabel} expected a dedicated Home organizer launcher after collapse.`)
  }

  const shellRailCollapsedWideTop = await captureLocatorScreenshot(
    page,
    shellRail,
    directory,
    `${stagePrefix}-shell-rail-collapsed-wide-top.png`,
  )
  const homeOrganizerLauncherWideTop = await captureLocatorScreenshot(
    page,
    homeLauncher,
    directory,
    `${stagePrefix}-home-organizer-launcher-wide-top.png`,
  )
  const homeCollapsedWideTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-shell-collapsed-wide-top.png`,
  )

  await homeLauncher.click()
  await organizerRail.waitFor({ state: 'visible', timeout: 20000 })
  const homeReopenedWidth = await measureWidth(organizerRail)
  if (Math.abs(homeReopenedWidth - homeResizedWidth) > 1) {
    throw new Error(`${stageLabel} expected the Home organizer width to persist through collapse and reopen.`)
  }

  return {
    captures: {
      homeCollapsedWideTop,
      homeOrganizerLauncherWideTop,
      homeWideTop,
      shellRailCollapsedWideTop,
      shellRailOpenWideTop,
    },
    metrics: {
      ...shellMetrics,
      homeControlSeamVisibleWhenCollapsed: homeCollapsedMetrics.homeControlSeamVisibleWhenCollapsed,
      homeOrganizerLauncherVisibleWhenCollapsed: homeCollapsedMetrics.homeOrganizerLauncherVisibleWhenCollapsed,
      homeOrganizerWidthRestoredAfterCollapse: Math.abs(homeReopenedWidth - homeResizedWidth) <= 1,
    },
  }
}

async function captureGraphCollapseEvidence(page, directory, stageLabel, stagePrefix, baseUrl) {
  await openGraph(page, baseUrl)
  await closeTourIfVisible(page)

  const settingsSidebar = page.getByRole('complementary', { name: 'Graph settings sidebar' }).first()
  const hideButton = page.getByRole('button', { name: 'Hide graph settings' }).first()
  const resizeHandle = page.getByRole('separator', { name: 'Resize graph settings sidebar' }).first()

  await Promise.all([
    settingsSidebar.waitFor({ state: 'visible', timeout: 20000 }),
    hideButton.waitFor({ state: 'visible', timeout: 20000 }),
    resizeHandle.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  await page.waitForTimeout(250)

  const graphOpenWidth = await measureWidth(settingsSidebar)
  await nudgeResizablePanel(resizeHandle)
  const graphResizedWidth = await measureWidth(settingsSidebar)
  if (!(graphResizedWidth > graphOpenWidth)) {
    throw new Error(`${stageLabel} expected the Graph settings width to respond to keyboard resizing.`)
  }

  const graphWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-graph-shell-open-wide-top.png`)
  const graphSettingsOpenWideTop = await captureLocatorScreenshot(
    page,
    settingsSidebar,
    directory,
    `${stagePrefix}-graph-settings-open-wide-top.png`,
  )

  await hideButton.click()
  await settingsSidebar.waitFor({ state: 'hidden', timeout: 20000 })
  const graphLauncher = page.getByRole('button', { name: 'Show graph settings' }).first()
  await graphLauncher.waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)

  const collapsedMetrics = await page.evaluate(() => {
    const launcher = document.querySelector('[aria-label="Show graph settings"]')
    const settingsSidebar = document.querySelector('[aria-label="Graph settings sidebar"]')
    return {
      graphSettingsLauncherVisibleWhenCollapsed: isElementVisible(launcher),
      graphSettingsVisibleWhenCollapsed: isElementVisible(settingsSidebar),
    }

    function isElementVisible(node) {
      if (!(node instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(node)
      const rect = node.getBoundingClientRect()
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width > 0 &&
        rect.height > 0
      )
    }
  })
  if (collapsedMetrics.graphSettingsVisibleWhenCollapsed) {
    throw new Error(`${stageLabel} expected the Graph settings sidebar to hide completely after collapse.`)
  }
  if (!collapsedMetrics.graphSettingsLauncherVisibleWhenCollapsed) {
    throw new Error(`${stageLabel} expected a dedicated Graph settings launcher after collapse.`)
  }

  const graphSettingsLauncherWideTop = await captureLocatorScreenshot(
    page,
    graphLauncher,
    directory,
    `${stagePrefix}-graph-settings-launcher-wide-top.png`,
  )
  const graphCollapsedWideTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-graph-shell-collapsed-wide-top.png`,
  )

  await graphLauncher.click()
  await settingsSidebar.waitFor({ state: 'visible', timeout: 20000 })
  const graphReopenedWidth = await measureWidth(settingsSidebar)
  if (Math.abs(graphReopenedWidth - graphResizedWidth) > 1) {
    throw new Error(`${stageLabel} expected the Graph settings width to persist through collapse and reopen.`)
  }

  return {
    captures: {
      graphCollapsedWideTop,
      graphSettingsLauncherWideTop,
      graphSettingsOpenWideTop,
      graphWideTop,
    },
    metrics: {
      graphSettingsLauncherVisibleWhenCollapsed: collapsedMetrics.graphSettingsLauncherVisibleWhenCollapsed,
      graphSettingsOpenByDefault: true,
      graphSettingsWidthRestoredAfterCollapse: Math.abs(graphReopenedWidth - graphResizedWidth) <= 1,
    },
  }
}

async function measureWidth(locator) {
  const box = await locator.boundingBox()
  if (!box) {
    throw new Error('Could not measure panel width.')
  }
  return box.width
}

async function nudgeResizablePanel(handle) {
  await handle.focus()
  await handle.press('ArrowRight')
  await handle.page().waitForTimeout(150)
}

async function readShellRailMetrics(page) {
  return page.evaluate(() => {
    const sectionButtons = Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]'))
    return {
      notesSidebarVisible: sectionButtons.some((tab) => {
        const label = tab.getAttribute('aria-label') ?? tab.textContent ?? ''
        return /notes/i.test(label) && isElementVisible(tab)
      }),
      shellRailBrandCopyVisible: Array.from(document.querySelectorAll('.workspace-rail-brand-copy')).some(isElementVisible),
      shellRailCollapseButtonVisible: Array.from(document.querySelectorAll('.workspace-rail button')).some((button) => {
        const label = button.getAttribute('aria-label') ?? button.getAttribute('title') ?? button.textContent ?? ''
        return /collapse|expand|toggle/i.test(label) && isElementVisible(button)
      }),
      shellRailLabelVisible: Array.from(document.querySelectorAll('.workspace-rail-label')).some(isElementVisible),
      workspaceSections: sectionButtons
        .map((tab) => (tab.getAttribute('aria-label') ?? tab.textContent ?? '').replace(/\s+/g, ' ').trim())
        .filter(Boolean),
    }

    function isElementVisible(node) {
      if (!(node instanceof HTMLElement)) {
        return false
      }
      const style = window.getComputedStyle(node)
      const rect = node.getBoundingClientRect()
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width > 0 &&
        rect.height > 0
      )
    }
  })
}
