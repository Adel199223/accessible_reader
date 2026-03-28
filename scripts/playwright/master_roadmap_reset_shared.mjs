import path from 'node:path'

import {
  captureLocatorScreenshot,
  captureViewportScreenshot,
  desktopViewport,
  openHome,
  openOriginalReaderFromHome,
} from './home_rendered_preview_quality_shared.mjs'
import { captureNotebookPlacementEvidence } from './notebook_placement_shared.mjs'

export const focusedViewport = { width: 820, height: 980 }

const clippedHomeSelectors = [
  '.recall-home-browse-group-note',
  '.recall-home-browse-group-button strong',
  '.recall-home-parity-card-title-stage651',
  '.recall-home-parity-card-source-stage651',
  '.recall-home-parity-card-preview-detail-stage565',
  '.recall-home-library-stage-source-summary-stage513-reset',
]

export async function captureMasterRoadmapResetEvidence({
  baseUrl,
  directory,
  focusedPage,
  homePage,
  notebookPage,
  readerPage,
  stagePrefix,
  studyPage,
}) {
  const homeIssueEvidence = await captureShellAndHomeIssueEvidence(homePage, directory, stagePrefix, baseUrl)
  const notebookEvidence = await captureNotebookPlacementEvidence({
    baseUrl,
    directory,
    page: notebookPage,
    stagePrefix,
  })
  const readerEvidence = await openOriginalReaderFromHome(readerPage, directory, stagePrefix, baseUrl)
  const studyEvidence = await captureStudyBaselineEvidence(studyPage, directory, stagePrefix, baseUrl)
  const focusedEvidence = await captureFocusedReaderLedNotebookEvidence(
    focusedPage,
    directory,
    stagePrefix,
    baseUrl,
  )

  return {
    captures: {
      ...notebookEvidence.captures,
      ...homeIssueEvidence.captures,
      ...studyEvidence.captures,
      ...focusedEvidence.captures,
      readerOriginalWideTop: readerEvidence.capture,
    },
    metrics: {
      ...homeIssueEvidence.metrics,
      ...notebookEvidence.metrics,
      ...studyEvidence.metrics,
      ...focusedEvidence.metrics,
      originalReaderSourceTitle: readerEvidence.sourceTitle,
    },
  }
}

async function captureShellAndHomeIssueEvidence(page, directory, stagePrefix, baseUrl) {
  await openHome(page, baseUrl)
  await page.getByRole('button', { name: 'Add', exact: true }).waitFor({ state: 'visible', timeout: 20000 })

  const shellRail = page.locator('.workspace-rail').first()
  await shellRail.waitFor({ state: 'visible', timeout: 20000 })

  const organizerRail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  await organizerRail.waitFor({ state: 'visible', timeout: 20000 })

  const resizeHandle = page.getByRole('separator', { name: 'Resize Home organizer' }).first()
  await resizeHandle.waitFor({ state: 'visible', timeout: 20000 })

  const shellRailWideTop = await captureLocatorScreenshot(page, shellRail, directory, `${stagePrefix}-shell-rail-wide-top.png`)
  const homeOrganizerSeamWideTop = await capturePaddedLocatorScreenshot(
    page,
    resizeHandle,
    directory,
    `${stagePrefix}-home-organizer-seam-wide-top.png`,
    { paddingX: 96, paddingY: 176, minHeight: 320, minWidth: 180 },
  )

  const clippingMetrics = await readHomeClippingMetrics(page)
  const captures = {
    homeOrganizerSeamWideTop,
    shellRailWideTop,
  }

  if (clippingMetrics.examples.length > 0) {
    captures.homeClippedTextWideTop = await captureRectScreenshot(
      page,
      directory,
      `${stagePrefix}-home-clipped-text-wide-top.png`,
      clippingMetrics.examples[0].rect,
      { paddingX: 28, paddingY: 28, minWidth: 260, minHeight: 120 },
    )
  }

  const shellMetrics = await page.evaluate(() => {
    const tabTexts = Array.from(document.querySelectorAll('.workspace-rail-nav [role="tab"]'))
      .map((tab) => tab.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)
    const labelVisible = Array.from(document.querySelectorAll('.workspace-rail-label')).some(isElementVisible)
    const brandCopyVisible = Array.from(document.querySelectorAll('.workspace-rail-brand-copy')).some(isElementVisible)
    const collapseButtonVisible = Array.from(document.querySelectorAll('.workspace-rail button')).some((button) => {
      const label = button.getAttribute('aria-label') ?? button.getAttribute('title') ?? button.textContent ?? ''
      return /collapse|expand|toggle/i.test(label) && isElementVisible(button)
    })
    const organizerRail = document.querySelector('[aria-label="Home collection rail"]')
    const organizerResizeHandle = document.querySelector('[aria-label="Resize Home organizer"]')

    return {
      homeOrganizerRailVisible: Boolean(organizerRail && isElementVisible(organizerRail)),
      homeOrganizerResizeHandleVisible: Boolean(organizerResizeHandle && isElementVisible(organizerResizeHandle)),
      shellRailBrandCopyVisible: brandCopyVisible,
      shellRailCollapseButtonVisible: collapseButtonVisible,
      shellRailLabelVisible: labelVisible,
      workspaceSections: tabTexts,
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

  return {
    captures,
    metrics: {
      ...shellMetrics,
      homeClippedTextExamples: clippingMetrics.examples.map((example) => example.text),
      homeClippedTextSelectors: clippingMetrics.examples.map((example) => example.selector),
      homeVisibleClippingCount: clippingMetrics.examples.length,
    },
  }
}

async function readHomeClippingMetrics(page) {
  return page.evaluate((selectors) => {
    const examples = []

    for (const selector of selectors) {
      const elements = Array.from(document.querySelectorAll(selector))
      for (const element of elements) {
        if (!(element instanceof HTMLElement) || !isElementVisible(element)) {
          continue
        }
        const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? ''
        if (!text) {
          continue
        }
        const clipped =
          element.scrollWidth > element.clientWidth + 1 ||
          element.scrollHeight > element.clientHeight + 1
        const style = window.getComputedStyle(element)
        const lineClamp =
          style.webkitLineClamp && style.webkitLineClamp !== 'none' && style.webkitLineClamp !== 'unset'
            ? style.webkitLineClamp
            : null
        const ellipsis = style.textOverflow === 'ellipsis'
        const truncationRisk =
          clipped ||
          ((lineClamp || ellipsis) && text.length >= 14 && (element.clientWidth < 220 || element.clientHeight <= 24))

        if (!truncationRisk) {
          continue
        }
        const rect = element.getBoundingClientRect()
        examples.push({
          clipped,
          ellipsis,
          lineClamp,
          rect: {
            height: rect.height,
            width: rect.width,
            x: rect.x,
            y: rect.y,
          },
          riskScore:
            (clipped ? 4 : 0) +
            (element.clientWidth < 220 ? 2 : 0) +
            (text.length > 22 ? 1 : 0) +
            (lineClamp ? 1 : 0) +
            (ellipsis ? 1 : 0),
          selector,
          text,
        })
      }
    }

    examples.sort((left, right) => right.riskScore - left.riskScore || right.text.length - left.text.length)
    return { examples: examples.slice(0, 5) }

    function isElementVisible(node) {
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
  }, clippedHomeSelectors)
}

async function captureStudyBaselineEvidence(page, directory, stagePrefix, baseUrl) {
  const response = await page.goto(`${baseUrl}/recall?section=study`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Study navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  const reviewHeading = page.getByRole('heading', { name: 'Review card', level: 2 }).first()
  const supportDock = page.locator('.recall-study-support-dock').first()
  await Promise.all([
    reviewHeading.waitFor({ state: 'visible', timeout: 20000 }),
    supportDock.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  await page.waitForTimeout(350)

  const studyWideTop = await captureViewportScreenshot(page, directory, `${stagePrefix}-study-wide-top.png`)
  const studySupportDockWideTop = await captureLocatorScreenshot(
    page,
    supportDock,
    directory,
    `${stagePrefix}-study-support-dock-wide-top.png`,
  )

  await revealStudyAnswer(page)
  const studyAnswerShownWideTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-study-answer-shown-wide-top.png`,
  )

  const metrics = await page.evaluate(() => {
    const answerButtons = Array.from(document.querySelectorAll('button'))
      .map((button) => button.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)
    return {
      studyGoodRatingVisible: answerButtons.includes('Good'),
      studyReviewHeadingVisible: Boolean(document.querySelector('h2')),
      studySupportDockVisible: Boolean(document.querySelector('.recall-study-support-dock')),
    }
  })

  return {
    captures: {
      studyAnswerShownWideTop,
      studySupportDockWideTop,
      studyWideTop,
    },
    metrics,
  }
}

async function revealStudyAnswer(page) {
  const answerButtons = [
    page.getByRole('button', { name: 'Show answer' }).first(),
    page.getByRole('button', { name: 'Reveal answer' }).first(),
  ]

  for (const answerButton of answerButtons) {
    if (await answerButton.isVisible().catch(() => false)) {
      await answerButton.click()
      break
    }
  }

  await page.getByRole('button', { name: 'Good' }).first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(250)
}

async function captureFocusedReaderLedNotebookEvidence(page, directory, stagePrefix, baseUrl) {
  await openHome(page, baseUrl)
  const sourceButton = await getVisibleLocator(page, [
    '.recall-home-parity-card-stage563',
    '.recall-home-parity-list-row-stage563',
    'button[aria-label^="Open "]',
  ])

  const sourceTitle = await getSourceTitle(sourceButton)
  await sourceButton.click()
  await page.getByRole('region', { name: `${sourceTitle} workspace` }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('tab', { name: 'Source workspace Notebook' }).click()
  await Promise.all([
    page.getByRole('heading', { name: 'Notebook', exact: true }).waitFor({ state: 'visible', timeout: 20000 }),
    page.getByRole('heading', { name: 'Reader', exact: true }).waitFor({ state: 'visible', timeout: 20000 }),
  ])
  await page.waitForTimeout(350)

  const focusedReaderLedNotebookNarrowTop = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-focused-reader-led-notebook-narrow-top.png`,
  )

  return {
    captures: {
      focusedReaderLedNotebookNarrowTop,
    },
    metrics: {
      focusedReaderLedNotebookSourceTitle: sourceTitle,
      focusedReaderVisible: true,
      focusedSourceNotebookVisible: true,
    },
  }
}

async function getVisibleLocator(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first()
    if ((await locator.count()) === 0) {
      continue
    }
    if (await locator.isVisible().catch(() => false)) {
      return locator
    }
    await locator.waitFor({ state: 'visible', timeout: 20000 }).catch(() => undefined)
    if (await locator.isVisible().catch(() => false)) {
      return locator
    }
  }

  throw new Error(`None of the expected selectors became visible: ${selectors.join(', ')}`)
}

async function getSourceTitle(locator) {
  const ariaLabel = (await locator.getAttribute('aria-label'))?.trim()
  if (ariaLabel) {
    const strippedOpen = ariaLabel.replace(/^Open\s+/i, '').trim()
    if (strippedOpen && strippedOpen !== ariaLabel) {
      return strippedOpen
    }
  }

  const strong = locator.locator('strong').first()
  if ((await strong.count()) > 0) {
    const strongText = (await strong.textContent())?.trim()
    if (strongText) {
      return strongText
    }
  }

  const text = (await locator.textContent())?.trim()
  return text || 'Source'
}

async function capturePaddedLocatorScreenshot(page, locator, directory, filename, options = {}) {
  await locator.scrollIntoViewIfNeeded()
  await page.waitForTimeout(150)
  const box = await locator.boundingBox()
  if (!box) {
    throw new Error(`Could not resolve a bounding box for ${filename}.`)
  }
  return captureRectScreenshot(page, directory, filename, box, options)
}

async function captureRectScreenshot(page, directory, filename, rect, options = {}) {
  const viewport = page.viewportSize() ?? desktopViewport
  const paddingX = options.paddingX ?? 24
  const paddingY = options.paddingY ?? 24
  const minWidth = options.minWidth ?? 1
  const minHeight = options.minHeight ?? 1

  const x = Math.max(0, Math.floor(rect.x - paddingX))
  const y = Math.max(0, Math.floor(rect.y - paddingY))
  const width = Math.max(
    1,
    Math.min(
      Math.ceil(Math.max(rect.width + paddingX * 2, minWidth)),
      viewport.width - x,
    ),
  )
  const height = Math.max(
    1,
    Math.min(
      Math.ceil(Math.max(rect.height + paddingY * 2, minHeight)),
      viewport.height - y,
    ),
  )

  const screenshotPath = path.join(directory, filename)
  await page.screenshot({
    clip: {
      height,
      width,
      x,
      y,
    },
    path: screenshotPath,
  })
  return screenshotPath
}
