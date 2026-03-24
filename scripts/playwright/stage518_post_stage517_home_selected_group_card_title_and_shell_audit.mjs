import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE518_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE518_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE518_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE518_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE518_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE518_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true
const desktopViewport = { width: 1600, height: 1080 }

await mkdir(outputDir, { recursive: true })
await rm(
  path.join(
    outputDir,
    'stage518-post-stage517-home-selected-group-card-title-and-shell-audit-failure.png',
  ),
  { force: true },
)
await rm(
  path.join(
    outputDir,
    'stage518-post-stage517-home-selected-group-card-title-and-shell-audit-failure-reader.png',
  ),
  { force: true },
)

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightModuleUrl = pathToFileURL(path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')).href
const { chromium } = await import(playwrightModuleUrl)
const { browser, runtimeBrowser } = await launchBrowser(chromium)

let desktopPage
let desktopReaderPage
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

  const homeWideTop = path.join(outputDir, 'stage518-home-wide-top.png')
  await desktopPage.screenshot({ path: homeWideTop })

  const homeSelectedGroupCardShellWideTop = path.join(outputDir, 'stage518-home-selected-group-card-shell-wide-top.png')
  await firstCard.screenshot({ path: homeSelectedGroupCardShellWideTop })

  const homeSelectedGroupCardTitleWideTop = path.join(outputDir, 'stage518-home-selected-group-card-title-wide-top.png')
  await title.screenshot({ path: homeSelectedGroupCardTitleWideTop })

  const homeSelectedGroupWideTop = path.join(outputDir, 'stage518-home-selected-group-wide-top.png')
  await savedLibrarySection.screenshot({ path: homeSelectedGroupWideTop })

  await openGraph(desktopPage)
  const graphWideTop = path.join(outputDir, 'stage518-graph-wide-top.png')
  await desktopPage.screenshot({ path: graphWideTop })

  desktopReaderPage = await browser.newPage({ viewport: desktopViewport })
  const readerSourceTitle = await openOriginalReaderFromHome(desktopReaderPage)
  const readerOriginalWideTop = path.join(outputDir, 'stage518-reader-original-wide-top.png')
  await desktopReaderPage.screenshot({ path: readerOriginalWideTop })

  await writeFile(
    path.join(
      outputDir,
      'stage518-post-stage517-home-selected-group-card-title-and-shell-audit-validation.json',
    ),
    JSON.stringify(
      {
        auditFocus: [
          'wide desktop Home is audited first after the Stage 517 selected-group card title emphasis and shell continuity deflation pass',
          'the first visible selected-group card should now feel less boxed and less title-heavy while keeping source identity explicit',
          'Graph and original-only Reader should remain stable while the lighter card shell holds in the selected-group board',
        ],
        baseUrl,
        benchmarkMatrix: 'docs/ux/recall_benchmark_matrix.md',
        captures: {
          graphWideTop,
          homeSelectedGroupCardShellWideTop,
          homeSelectedGroupCardTitleWideTop,
          homeSelectedGroupWideTop,
          homeWideTop,
          readerOriginalWideTop,
        },
        cardClassName,
        desktopViewport,
        headless,
        runtimeBrowser,
        selectedGroupLabel,
        sourceTitle: readerSourceTitle,
        titleText,
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
          'stage518-post-stage517-home-selected-group-card-title-and-shell-audit-failure.png',
        ),
        fullPage: true,
      })
      .catch(() => undefined)
  }
  if (desktopReaderPage && desktopReaderPage !== desktopPage) {
    await desktopReaderPage
      .screenshot({
        path: path.join(
          outputDir,
          'stage518-post-stage517-home-selected-group-card-title-and-shell-audit-failure-reader.png',
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

async function openGraph(page) {
  await page.goto(`${baseUrl}/recall?section=graph`, { waitUntil: 'networkidle' })
  await page.getByRole('region', { name: 'Knowledge graph canvas' }).waitFor({ state: 'visible', timeout: 20000 })
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

async function openReaderFromHome(page) {
  await openHome(page)
  const sourceButton = await getVisibleLocator(page, [
    '[aria-label="Pinned reopen shelf"] button[aria-label^="Open "]',
    '[aria-label="Saved library overview"] button[aria-label^="Open "]',
    '[aria-label="Saved library"] button[aria-label^="Open "]',
    '.recall-home-library-stage-row',
    'button[aria-label^="Open "]',
  ])
  const sourceTitle = await getSourceTitle(sourceButton)
  await sourceButton.click()
  await page.getByRole('region', { name: `${sourceTitle} workspace` }).waitFor({ state: 'visible', timeout: 20000 })
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
  const sourceWorkspace = page.getByRole('region', { name: `${sourceTitle} workspace` })
  await sourceWorkspace.getByRole('tab', { name: 'Source workspace Reader' }).click()
  await page.waitForURL(/\/reader/, { timeout: 20000 })
  await page.locator('article').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(350)
  return sourceTitle
}

async function openOriginalReaderFromHome(page) {
  const sourceTitle = await openReaderFromHome(page)
  const originalTab = page.getByRole('tab', { name: 'Original', exact: true }).first()
  await originalTab.waitFor({ state: 'visible', timeout: 20000 })
  if ((await originalTab.getAttribute('aria-selected')) !== 'true') {
    await originalTab.click()
    await page.waitForTimeout(250)
  }
  if ((await originalTab.getAttribute('aria-selected')) !== 'true') {
    throw new Error('Could not switch Reader into Original view for the Stage 518 audit.')
  }
  await page.waitForTimeout(250)
  return sourceTitle
}

async function getVisibleLocator(page, selectors) {
  for (const selector of selectors) {
    const matches = await page.locator(selector).all()
    for (const locator of matches) {
      if (await locator.isVisible().catch(() => false)) {
        return locator
      }
    }
  }
  throw new Error(`Could not find a visible locator for selectors: ${selectors.join(', ')}`)
}

async function getSourceTitle(locator) {
  const ariaLabel = await locator.getAttribute('aria-label')
  if (ariaLabel) {
    const match = ariaLabel.match(/^Open (.+?)(?: from organizer)?$/i)
    if (match?.[1]) {
      return match[1]
    }
  }

  const headingText = ((await locator.locator('strong').first().textContent().catch(() => '')) ?? '').trim()
  if (headingText) {
    return headingText
  }

  const fallbackText = ((await locator.textContent().catch(() => '')) ?? '').trim()
  if (fallbackText) {
    return fallbackText.split('\n')[0].trim()
  }

  throw new Error('Could not determine source title from the selected Home source button.')
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
