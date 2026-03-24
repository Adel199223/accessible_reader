import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE519_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE519_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE519_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE519_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE519_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE519_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage519-home-selected-group-card-gutter-and-board-grid-continuity-deflation-reset-after-stage518-failure.png',
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
  const stageList = savedLibrarySection.locator('.recall-home-library-stage-list-stage519-reset').first()
  const cards = stageList.locator('.recall-home-library-stage-row-stage519-reset')
  const firstCard = cards.first()

  await savedLibrarySection.waitFor({ state: 'visible', timeout: 20000 })
  await stageList.waitFor({ state: 'visible', timeout: 20000 })
  await firstCard.waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(300)

  const cardCount = await cards.count()
  const firstCardClassName = ((await firstCard.getAttribute('class').catch(() => '')) ?? '').trim()
  const stageListClassName = ((await stageList.getAttribute('class').catch(() => '')) ?? '').trim()

  const homeWideTop = path.join(outputDir, 'stage519-home-wide-top.png')
  await desktopPage.screenshot({ path: homeWideTop })

  const homeSelectedGroupBoardGridWideTop = path.join(outputDir, 'stage519-home-selected-group-board-grid-wide-top.png')
  await stageList.screenshot({ path: homeSelectedGroupBoardGridWideTop })

  const homeSelectedGroupCardGutterWideTop = path.join(outputDir, 'stage519-home-selected-group-card-gutter-wide-top.png')
  if (cardCount > 1) {
    await screenshotLocatorUnion(
      desktopPage,
      [cards.nth(0), cards.nth(1)],
      homeSelectedGroupCardGutterWideTop,
    )
  } else {
    await firstCard.screenshot({ path: homeSelectedGroupCardGutterWideTop })
  }

  const homeSelectedGroupWideTop = path.join(outputDir, 'stage519-home-selected-group-wide-top.png')
  await savedLibrarySection.screenshot({ path: homeSelectedGroupWideTop })

  await writeFile(
    path.join(
      outputDir,
      'stage519-home-selected-group-card-gutter-and-board-grid-continuity-deflation-reset-after-stage518-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          homeSelectedGroupBoardGridWideTop,
          homeSelectedGroupCardGutterWideTop,
          homeSelectedGroupWideTop,
          homeWideTop,
        },
        cardCount,
        desktopViewport,
        firstCardClassName,
        headless,
        runtimeBrowser,
        selectedGroupLabel,
        stageListClassName,
        validationFocus: [
          'wide desktop Home should now reduce gutter weight between adjacent selected-group cards',
          'the selected-group board grid should now feel more like one continuous results sheet than a tiled card field',
          'the first visible card field should keep scan order clear while reducing board-grid segmentation',
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
          'stage519-home-selected-group-card-gutter-and-board-grid-continuity-deflation-reset-after-stage518-failure.png',
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

async function screenshotLocatorUnion(page, locators, targetPath) {
  const boxes = []
  for (const locator of locators) {
    const box = await locator.boundingBox()
    if (box) {
      boxes.push(box)
    }
  }
  if (!boxes.length) {
    throw new Error('Could not compute a screenshot clip for the selected-group card gutter crop.')
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
