import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE507_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE507_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE507_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE507_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE507_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE507_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage507-home-organizer-group-row-and-count-badge-deflation-reset-after-stage505-failure.png',
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
  const groupsList = browseStrip.locator('.recall-home-browse-groups-stage507-reset').first()
  const overviewButton = browseStrip.getByRole('button', { name: /All collections/i }).first()

  await groupsList.waitFor({ state: 'visible', timeout: 20000 })
  await overviewButton.waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(300)

  const homeWideTop = path.join(outputDir, 'stage507-home-wide-top.png')
  await desktopPage.screenshot({ path: homeWideTop })

  const homeOrganizerOverviewRowWideTop = path.join(outputDir, 'stage507-home-organizer-overview-row-wide-top.png')
  await overviewButton.screenshot({ path: homeOrganizerOverviewRowWideTop })

  const homeOrganizerGroupRowsWideTop = path.join(outputDir, 'stage507-home-organizer-group-rows-wide-top.png')
  await groupsList.screenshot({ path: homeOrganizerGroupRowsWideTop })

  const { button: selectedGroupButton, label: selectedGroupLabel } = await getFirstVisibleOrganizerGroupButton(browseStrip)
  await selectedGroupButton.click()
  await desktopPage.waitForTimeout(250)

  const activeBranch = selectedGroupButton.locator('xpath=..')
  await activeBranch.waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(250)

  const branchShowsPreviewChildren = await activeBranch
    .locator('.recall-home-browse-group-child-stage504-reset')
    .first()
    .isVisible()
    .catch(() => false)

  const homeOrganizerActiveGroupRowWideTop = path.join(
    outputDir,
    'stage507-home-organizer-active-group-row-wide-top.png',
  )
  await activeBranch.screenshot({ path: homeOrganizerActiveGroupRowWideTop })

  const homeSelectedGroupWideTop = path.join(outputDir, 'stage507-home-selected-group-wide-top.png')
  await desktopPage.screenshot({ path: homeSelectedGroupWideTop })

  await writeFile(
    path.join(
      outputDir,
      'stage507-home-organizer-group-row-and-count-badge-deflation-reset-after-stage505-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          homeOrganizerActiveGroupRowWideTop,
          homeOrganizerGroupRowsWideTop,
          homeOrganizerOverviewRowWideTop,
          homeSelectedGroupWideTop,
          homeWideTop,
        },
        desktopViewport,
        headless,
        runtimeBrowser,
        selectedGroupLabel,
        branchShowsPreviewChildren,
        validationFocus: [
          'wide desktop Home should now treat the top-level organizer rows as one flatter continuous rail instead of a stack of compact mini-panels',
          'overview or reset state and top-level counts should read like lighter readouts instead of standalone chips',
          'after drilling into a branch, the lighter row treatment should still preserve the branch handoff into the selected-group board',
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
          'stage507-home-organizer-group-row-and-count-badge-deflation-reset-after-stage505-failure.png',
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
