import path from 'node:path'

import {
  captureLocatorScreenshot,
  captureViewportScreenshot,
  desktopViewport,
  openHome,
} from './home_rendered_preview_quality_shared.mjs'
import {
  captureShellNavigationResetEvidence,
  focusedViewport,
} from './shell_navigation_reset_shared.mjs'

const clippedHomeSelectors = [
  '.recall-home-browse-group-note-stage696-reset',
  '.recall-home-browse-group-source-stage696-reset',
  '.recall-home-parity-card-title-stage696',
  '.recall-home-parity-card-source-stage696',
  '.recall-home-parity-card-preview-detail-stage696',
  '.recall-home-library-stage-source-summary-stage696-reset',
]

export { desktopViewport, focusedViewport }

export async function captureHomeOrganizerErgonomicsEvidence({
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
  const baselineEvidence = await captureShellNavigationResetEvidence({
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
  })
  const homeEvidence = await captureHomeErgonomicsEvidence(homePage, directory, stageLabel, stagePrefix, baseUrl)

  return {
    captures: {
      ...baselineEvidence.captures,
      ...homeEvidence.captures,
    },
    metrics: {
      ...baselineEvidence.metrics,
      ...homeEvidence.metrics,
    },
  }
}

async function captureHomeErgonomicsEvidence(page, directory, stageLabel, stagePrefix, baseUrl) {
  await openHome(page, baseUrl)

  const organizerRail = page.getByRole('complementary', { name: 'Home collection rail' }).first()
  const resizeHandle = page.getByRole('separator', { name: 'Resize Home organizer' }).first()
  const resizeGrip = page.locator('.recall-home-browse-strip-resize-grip-stage696-reset').first()
  const closeButton = page.getByRole('button', { name: 'Hide organizer' }).first()

  await Promise.all([
    organizerRail.waitFor({ state: 'visible', timeout: 20000 }),
    resizeHandle.waitFor({ state: 'visible', timeout: 20000 }),
    resizeGrip.waitFor({ state: 'visible', timeout: 20000 }),
    closeButton.waitFor({ state: 'visible', timeout: 20000 }),
  ])
  await page.mouse.move(8, 8)
  await page.waitForTimeout(220)

  const restMetrics = await readResizeGripMetrics(page)
  const homeOrganizerSeamIdleWideTop = await capturePaddedLocatorScreenshot(
    page,
    resizeHandle,
    directory,
    `${stagePrefix}-home-organizer-seam-idle-wide-top.png`,
    { paddingX: 96, paddingY: 176, minHeight: 320, minWidth: 180 },
  )

  await resizeHandle.hover()
  await page.waitForTimeout(180)
  const hoverMetrics = await readResizeGripMetrics(page)
  const homeOrganizerSeamHoverWideTop = await capturePaddedLocatorScreenshot(
    page,
    resizeHandle,
    directory,
    `${stagePrefix}-home-organizer-seam-hover-wide-top.png`,
    { paddingX: 96, paddingY: 176, minHeight: 320, minWidth: 180 },
  )
  const homeWideTopAfterErgonomics = await captureViewportScreenshot(
    page,
    directory,
    `${stagePrefix}-home-organizer-ergonomics-wide-top.png`,
  )

  if (!(restMetrics.opacity <= 0.24)) {
    throw new Error(`${stageLabel} expected the Home organizer resize grip to stay quiet at rest.`)
  }
  if (!(hoverMetrics.opacity >= 0.48 && hoverMetrics.opacity > restMetrics.opacity + 0.2)) {
    throw new Error(`${stageLabel} expected the Home organizer resize grip to reveal clearly on hover.`)
  }

  const clippingMetrics = await readHomeClippingMetrics(page)
  const captures = {
    homeOrganizerSeamHoverWideTop,
    homeOrganizerSeamIdleWideTop,
    homeWideTopAfterErgonomics,
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
  if (clippingMetrics.examples.length > 0) {
    throw new Error(
      `${stageLabel} expected Home clipping count to fall to zero, but found ${clippingMetrics.examples.length} remaining cases.`,
    )
  }

  return {
    captures,
    metrics: {
      homeOrganizerSeamQuietAtRest: restMetrics.opacity <= 0.24,
      homeResizeGripHoverOpacity: hoverMetrics.opacity,
      homeResizeGripHoverWidth: hoverMetrics.width,
      homeResizeGripOpacityAtRest: restMetrics.opacity,
      homeResizeGripRevealDelta: hoverMetrics.opacity - restMetrics.opacity,
      homeResizeGripWidthAtRest: restMetrics.width,
      homeVisibleClippingCount: clippingMetrics.examples.length,
      homeClippedTextExamples: clippingMetrics.examples.map((example) => example.text),
      homeClippedTextSelectors: clippingMetrics.examples.map((example) => example.selector),
    },
  }
}

async function readResizeGripMetrics(page) {
  return page.evaluate(() => {
    const grip = document.querySelector('.recall-home-browse-strip-resize-grip-stage696-reset')
    if (!(grip instanceof HTMLElement)) {
      return { opacity: 0, width: 0 }
    }
    const style = window.getComputedStyle(grip)
    const rect = grip.getBoundingClientRect()
    return {
      opacity: Number.parseFloat(style.opacity || '0') || 0,
      width: rect.width,
    }
  })
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
        if (!clipped) {
          continue
        }
        const rect = element.getBoundingClientRect()
        examples.push({
          rect: {
            height: rect.height,
            width: rect.width,
            x: rect.x,
            y: rect.y,
          },
          selector,
          text,
        })
      }
    }

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
