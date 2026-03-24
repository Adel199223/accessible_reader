import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE517_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE517_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE517_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE517_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE517_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE517_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage517-home-selected-group-card-title-emphasis-and-shell-continuity-deflation-reset-after-stage516-failure.png',
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
  const firstCard = savedLibrarySection.locator('.recall-home-library-stage-row-stage517-reset').first()
  const title = firstCard.locator('.recall-home-library-stage-row-title-stage517-reset').first()

  await savedLibrarySection.waitFor({ state: 'visible', timeout: 20000 })
  await firstCard.waitFor({ state: 'visible', timeout: 20000 })
  await title.waitFor({ state: 'visible', timeout: 20000 })
  await desktopPage.waitForTimeout(300)

  const titleText = ((await title.textContent().catch(() => '')) ?? '').trim()
  const cardClassName = ((await firstCard.getAttribute('class').catch(() => '')) ?? '').trim()

  const homeWideTop = path.join(outputDir, 'stage517-home-wide-top.png')
  await desktopPage.screenshot({ path: homeWideTop })

  const homeSelectedGroupCardShellWideTop = path.join(outputDir, 'stage517-home-selected-group-card-shell-wide-top.png')
  await firstCard.screenshot({ path: homeSelectedGroupCardShellWideTop })

  const homeSelectedGroupCardTitleWideTop = path.join(outputDir, 'stage517-home-selected-group-card-title-wide-top.png')
  await title.screenshot({ path: homeSelectedGroupCardTitleWideTop })

  const homeSelectedGroupWideTop = path.join(outputDir, 'stage517-home-selected-group-wide-top.png')
  await savedLibrarySection.screenshot({ path: homeSelectedGroupWideTop })

  await writeFile(
    path.join(
      outputDir,
      'stage517-home-selected-group-card-title-emphasis-and-shell-continuity-deflation-reset-after-stage516-validation.json',
    ),
    JSON.stringify(
      {
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          homeSelectedGroupCardShellWideTop,
          homeSelectedGroupCardTitleWideTop,
          homeSelectedGroupWideTop,
          homeWideTop,
        },
        cardClassName,
        desktopViewport,
        headless,
        runtimeBrowser,
        selectedGroupLabel,
        titleText,
        validationFocus: [
          'wide desktop Home should now treat the selected-group card title as calmer and less heading-like inside the card row',
          'the selected-group card shell should now feel lighter and more attached to the surrounding results sheet',
          'the first visible card row should keep source identity and compact metadata legible while reducing title-and-shell weight',
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
          'stage517-home-selected-group-card-title-emphasis-and-shell-continuity-deflation-reset-after-stage516-failure.png',
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
