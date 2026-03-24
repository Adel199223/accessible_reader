import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE509_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE509_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE509_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE509_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE509_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE509_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage509-home-organizer-child-row-metadata-and-branch-footer-deflation-reset-after-stage508-failure.png',
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

  const activeBranch = selectedGroupButton.locator('xpath=..')
  const childrenContainer = activeBranch.locator('.recall-home-browse-group-children-stage509-reset').first()
  const firstChildRow = childrenContainer.locator('.recall-home-browse-group-child-row-stage509-reset').first()
  const footer = activeBranch.locator('.recall-home-browse-group-footer-stage509-reset').first()
  const footerButton = footer.locator('.recall-home-browse-group-footer-button-stage509-reset').first()

  await activeBranch.waitFor({ state: 'visible', timeout: 20000 })
  await childrenContainer.waitFor({ state: 'visible', timeout: 20000 })
  await firstChildRow.waitFor({ state: 'visible', timeout: 20000 })
  await footer.waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(300)

  const branchShowsPreviewChildren = await childrenContainer
    .locator('.recall-home-browse-group-child-stage509-reset')
    .first()
    .isVisible()
    .catch(() => false)

  const footerButtonText = ((await footerButton.textContent().catch(() => '')) ?? '').trim()

  const homeWideTop = path.join(outputDir, 'stage509-home-wide-top.png')
  await desktopPage.screenshot({ path: homeWideTop })

  const homeOrganizerChildRowsWideTop = path.join(outputDir, 'stage509-home-organizer-child-rows-wide-top.png')
  await childrenContainer.screenshot({ path: homeOrganizerChildRowsWideTop })

  const homeOrganizerChildRowWideTop = path.join(outputDir, 'stage509-home-organizer-child-row-wide-top.png')
  await firstChildRow.screenshot({ path: homeOrganizerChildRowWideTop })

  const homeOrganizerBranchFooterWideTop = path.join(outputDir, 'stage509-home-organizer-branch-footer-wide-top.png')
  await footer.screenshot({ path: homeOrganizerBranchFooterWideTop })

  const homeSelectedGroupWideTop = path.join(outputDir, 'stage509-home-selected-group-wide-top.png')
  await desktopPage.screenshot({ path: homeSelectedGroupWideTop })

  await writeFile(
    path.join(
      outputDir,
      'stage509-home-organizer-child-row-metadata-and-branch-footer-deflation-reset-after-stage508-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          homeOrganizerBranchFooterWideTop,
          homeOrganizerChildRowWideTop,
          homeOrganizerChildRowsWideTop,
          homeSelectedGroupWideTop,
          homeWideTop,
        },
        desktopViewport,
        footerButtonText,
        headless,
        runtimeBrowser,
        selectedGroupLabel,
        branchShowsPreviewChildren,
        validationFocus: [
          'wide desktop Home should now treat the active branch child rows as a lighter continuation instead of a metadata-heavy attached list',
          'child-row metadata should read quieter while source titles stay easy to scan at default and widened organizer widths',
          'the Show all or Show fewer branch footer should now read more like attached continuation than a detached pill button',
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
          'stage509-home-organizer-child-row-metadata-and-branch-footer-deflation-reset-after-stage508-failure.png',
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
