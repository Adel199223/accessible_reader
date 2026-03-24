import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE521_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE521_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE521_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE521_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE521_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE521_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage521-home-selected-group-title-wrap-and-row-height-continuity-deflation-reset-after-stage520-failure.png',
  ),
  { force: true },
)

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)
const { browser, runtimeBrowser } = await launchBrowser(chromium)

let desktopPage
try {
  desktopPage = await browser.newPage({ viewport: desktopViewport })
  await openHome(desktopPage)
  await ensureToggleButtonPressed(desktopPage, 'Collections')
  await clearHomeSearch(desktopPage)

  const browseStrip = desktopPage.getByRole('complementary', { name: 'Home browse strip' })
  const { button: selectedGroupButton, label: selectedGroupLabel } = await getFirstVisibleOrganizerGroupButton(browseStrip)
  await selectedGroupButton.click()
  await desktopPage.waitForTimeout(250)

  const savedLibrarySection = desktopPage.getByRole('region', { name: 'Saved library' })
  const stageList = savedLibrarySection.locator('.recall-home-library-stage-list-stage521-reset').first()
  const cards = stageList.locator('.recall-home-library-stage-row-stage521-reset')
  const firstCard = cards.first()

  await savedLibrarySection.waitFor({ state: 'visible', timeout: 20000 })
  await stageList.waitFor({ state: 'visible', timeout: 20000 })
  await firstCard.waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(300)

  const cardCount = await cards.count()
  const firstCardClassName = ((await firstCard.getAttribute('class').catch(() => '')) ?? '').trim()
  const stageListClassName = ((await stageList.getAttribute('class').catch(() => '')) ?? '').trim()
  const firstRowCards = await getFirstVisibleRowCards(cards)
  const { focusCards: titleWrapCards, longestTitleText } = await getTitleWrapFocusCards(firstRowCards)

  const homeWideTop = path.join(outputDir, 'stage521-home-wide-top.png')
  await desktopPage.screenshot({ path: homeWideTop })

  const homeSelectedGroupTitleWrapWideTop = path.join(outputDir, 'stage521-home-selected-group-title-wrap-wide-top.png')
  await screenshotLocatorUnion(desktopPage, titleWrapCards, homeSelectedGroupTitleWrapWideTop)

  const homeSelectedGroupRowHeightWideTop = path.join(outputDir, 'stage521-home-selected-group-row-height-wide-top.png')
  await screenshotLocatorUnion(desktopPage, firstRowCards, homeSelectedGroupRowHeightWideTop)

  const homeSelectedGroupWideTop = path.join(outputDir, 'stage521-home-selected-group-wide-top.png')
  await savedLibrarySection.screenshot({ path: homeSelectedGroupWideTop })

  await writeFile(
    path.join(
      outputDir,
      'stage521-home-selected-group-title-wrap-and-row-height-continuity-deflation-reset-after-stage520-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          homeSelectedGroupRowHeightWideTop,
          homeSelectedGroupTitleWrapWideTop,
          homeSelectedGroupWideTop,
          homeWideTop,
        },
        cardCount,
        desktopViewport,
        firstCardClassName,
        firstRowCardCount: firstRowCards.length,
        headless,
        longestTitleText,
        runtimeBrowser,
        selectedGroupLabel,
        stageListClassName,
        validationFocus: [
          'wide desktop Home should now keep longer selected-group titles calmer inside the visible board row',
          'the first visible selected-group row should now read more evenly instead of stepping through a jagged title rhythm',
          'the calmer title-wrap treatment should preserve source identity while keeping the selected-group board attached and continuous',
        ],
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  if (desktopPage) {
    await desktopPage
      .screenshot({
        path: path.join(
          outputDir,
          'stage521-home-selected-group-title-wrap-and-row-height-continuity-deflation-reset-after-stage520-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  throw error
} finally {
  await browser.close()
}

async function openHome(page) {
  await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  await page.locator('.recall-home-workspace').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('searchbox', { name: 'Search saved sources' }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
}

async function ensureToggleButtonPressed(page, name) {
  const button = page.getByRole('button', { name, exact: true }).first()
  await button.waitFor({ state: 'visible', timeout: 20000 })
  if ((await button.getAttribute('aria-pressed')) !== 'true') {
    await button.click()
    await page.waitForTimeout(150)
  }
}

async function clearHomeSearch(page) {
  const searchbox = page.getByRole('searchbox', { name: 'Search saved sources' })
  await searchbox.waitFor({ state: 'visible', timeout: 20000 })
  if ((await searchbox.inputValue()) !== '') {
    await searchbox.fill('')
    await page.waitForTimeout(150)
  }
}

async function getFirstVisibleOrganizerGroupButton(browseStrip) {
  const buttons = await browseStrip.locator('.recall-home-browse-groups .recall-home-browse-group-button').all()
  for (const button of buttons) {
    if (!(await button.isVisible().catch(() => false))) {
      continue
    }
    const label = ((await button.locator('strong').first().textContent().catch(() => '')) ?? '').trim()
    if (!label || /^All (collections|recent groups)$/i.test(label)) {
      continue
    }
    return { button, label }
  }
  throw new Error('Could not find a visible organizer branch button beyond the overview row.')
}

async function getFirstVisibleRowCards(cards) {
  const rowCards = []
  let firstTop = null
  const count = await cards.count()
  for (let index = 0; index < count; index += 1) {
    const card = cards.nth(index)
    if (!(await card.isVisible().catch(() => false))) {
      continue
    }
    const box = await card.boundingBox()
    if (!box) {
      continue
    }
    if (firstTop === null) {
      firstTop = box.y
    }
    if (Math.abs(box.y - firstTop) > 18) {
      break
    }
    rowCards.push(card)
  }
  if (!rowCards.length) {
    throw new Error('Could not find the first visible selected-group row for the Stage 521 capture.')
  }
  return rowCards
}

async function getTitleWrapFocusCards(cards) {
  if (cards.length === 1) {
    return {
      focusCards: cards,
      longestTitleText: await getCardTitle(cards[0]),
    }
  }

  let longestIndex = 0
  let longestTitleText = ''

  for (let index = 0; index < cards.length; index += 1) {
    const titleText = await getCardTitle(cards[index])
    if (titleText.length > longestTitleText.length) {
      longestIndex = index
      longestTitleText = titleText
    }
  }

  const neighborIndex = longestIndex === cards.length - 1 ? longestIndex - 1 : longestIndex + 1
  const focusCards = []
  for (const index of [Math.min(longestIndex, neighborIndex), Math.max(longestIndex, neighborIndex)]) {
    const card = cards[index]
    if (card) {
      focusCards.push(card)
    }
  }

  return { focusCards, longestTitleText }
}

async function getCardTitle(card) {
  return ((await card.locator('.recall-home-library-stage-row-title-stage521-reset').textContent().catch(() => '')) ?? '').trim()
}

async function screenshotLocatorUnion(page, locators, targetPath) {
  const boxes = []
  for (const locator of locators) {
    const box = await locator.boundingBox()
    if (box) {
      boxes.push(box)
    }
  }
  if (!boxes.length) {
    throw new Error('Could not compute a screenshot clip for the Stage 521 selected-group crop.')
  }
  const left = Math.max(0, Math.min(...boxes.map((box) => box.x)) - 10)
  const top = Math.max(0, Math.min(...boxes.map((box) => box.y)) - 10)
  const right = Math.max(...boxes.map((box) => box.x + box.width)) + 10
  const bottom = Math.max(...boxes.map((box) => box.y + box.height)) + 10
  await page.screenshot({
    path: targetPath,
    clip: {
      x: left,
      y: top,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top),
    },
  })
}

function resolveHarnessDir(candidate) {
  if (path.isAbsolute(candidate)) {
    return candidate
  }
  return path.resolve(repoRoot, candidate)
}

async function launchBrowser(chromium) {
  const channel = preferredChannel?.trim()
  if (channel) {
    try {
      const browser = await chromium.launch({
        channel,
        headless,
      })
      return { browser, runtimeBrowser: channel }
    } catch (error) {
      if (!allowChromiumFallback) {
        throw error
      }
    }
  }

  const browser = await chromium.launch({ headless })
  return { browser, runtimeBrowser: 'chromium' }
}
