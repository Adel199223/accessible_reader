import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE504_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE504_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE504_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE504_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE504_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE504_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage504-home-organizer-utility-button-flattening-and-branch-list-density-deflation-reset-after-stage503-failure.png',
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
  const controlDeck = browseStrip.getByRole('group', { name: 'Organizer controls' }).first()
  const utilityCluster = browseStrip.getByRole('group', { name: 'Organizer utilities' }).first()

  await controlDeck.waitFor({ state: 'visible', timeout: 20000 })
  await utilityCluster.waitFor({ state: 'visible', timeout: 20000 })
  await browseStrip.locator('.recall-home-browse-groups-stage504-reset').first().waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(300)

  const homeWideTop = path.join(outputDir, 'stage504-home-wide-top.png')
  await desktopPage.screenshot({ path: homeWideTop })

  const homeOrganizerControlDeckWideTop = path.join(outputDir, 'stage504-home-organizer-control-deck-wide-top.png')
  await controlDeck.screenshot({ path: homeOrganizerControlDeckWideTop })

  const homeOrganizerUtilityClusterWideTop = path.join(
    outputDir,
    'stage504-home-organizer-utility-cluster-wide-top.png',
  )
  await utilityCluster.screenshot({ path: homeOrganizerUtilityClusterWideTop })

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

  const homeOrganizerBranchListWideTop = path.join(outputDir, 'stage504-home-organizer-branch-list-wide-top.png')
  await activeBranch.screenshot({ path: homeOrganizerBranchListWideTop })

  const homeSelectedGroupWideTop = path.join(outputDir, 'stage504-home-selected-group-wide-top.png')
  await desktopPage.screenshot({ path: homeSelectedGroupWideTop })

  await writeFile(
    path.join(
      outputDir,
      'stage504-home-organizer-utility-button-flattening-and-branch-list-density-deflation-reset-after-stage503-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          homeOrganizerBranchListWideTop,
          homeOrganizerControlDeckWideTop,
          homeOrganizerUtilityClusterWideTop,
          homeSelectedGroupWideTop,
          homeWideTop,
        },
        desktopViewport,
        headless,
        runtimeBrowser,
        selectedGroupLabel,
        branchShowsPreviewChildren,
        validationFocus: [
          'wide desktop Home should now treat New, collapse or clear, and hide as one compact organizer utility cluster instead of a detached button seam',
          'the organizer utility cluster should read as part of the same control deck rhythm that owns the lens, sort, and view controls',
          'after drilling into a branch, the selected organizer list should look denser and less carded while preserving the branch handoff into the selected-group board',
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
          'stage504-home-organizer-utility-button-flattening-and-branch-list-density-deflation-reset-after-stage503-failure.png',
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
