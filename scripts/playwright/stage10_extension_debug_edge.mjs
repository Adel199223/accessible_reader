import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'


const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir = process.env.RECALL_STAGE10_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const extensionDir = process.env.RECALL_STAGE10_EXTENSION_DIR ?? path.join(repoRoot, 'extension', 'dist-debug')
const harnessDir =
  process.env.RECALL_STAGE10_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const backendBaseUrl = process.env.RECALL_STAGE10_BACKEND_URL ?? 'http://127.0.0.1:8000'
const articleUrl = process.env.RECALL_STAGE10_ARTICLE_URL

if (!articleUrl) {
  throw new Error('RECALL_STAGE10_ARTICLE_URL is required.')
}

await mkdir(outputDir, { recursive: true })

const playwrightModuleUrl = pathToFileURL(
  path.join(harnessDir, 'node_modules', 'playwright', 'index.mjs'),
).href
const { chromium } = await import(playwrightModuleUrl)

const userDataDir = await mkdtemp(path.join(os.tmpdir(), 'accessible-reader-stage10-edge-'))
const context = await chromium.launchPersistentContext(userDataDir, {
  args: [
    `--disable-extensions-except=${extensionDir}`,
    `--load-extension=${extensionDir}`,
  ],
  channel: 'msedge',
  headless: false,
})

try {
  const serviceWorker =
    context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker', { timeout: 10000 }))
  const extensionId = new URL(serviceWorker.url()).host

  const articlePage = await context.newPage()
  await articlePage.goto(articleUrl, { waitUntil: 'domcontentloaded' })
  await articlePage.waitForLoadState('networkidle')
  await articlePage.locator('article').waitFor()

  const targetSelection = 'Debug harness sentence beta.'
  await articlePage.locator('article p').first().evaluate((node, targetText) => {
    const textNode = node.firstChild
    const fullText = node.textContent ?? ''
    const start = fullText.indexOf(targetText)
    if (!textNode || start < 0) {
      throw new Error(`Could not find target text: ${targetText}`)
    }
    const range = document.createRange()
    range.setStart(textNode, start)
    range.setEnd(textNode, start + targetText.length)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }, targetSelection)
  await articlePage.waitForTimeout(800)

  const debugPage = await context.newPage()
  await debugPage.goto(`chrome-extension://${extensionId}/debug.html`, { waitUntil: 'domcontentloaded' })
  await debugPage.waitForLoadState('networkidle')
  await debugPage.click('#debug-refresh')

  try {
    await waitForText(debugPage, '#debug-match', 'Stage 10 Debug Article')
    await waitForText(debugPage, '#debug-selection', targetSelection)
  } catch (error) {
    const failedScreenshot = path.join(outputDir, 'stage10-extension-debug-failure.png')
    await debugPage.screenshot({ path: failedScreenshot, fullPage: true })
    const debugBody = await debugPage.textContent('body')
    throw new Error(
      `Debug page did not surface the expected saved-page match. Body snapshot: ${debugBody ?? 'empty'}`,
      { cause: error },
    )
  }
  await debugPage.fill('#debug-note-body', 'Debug note from the repo harness.')
  await debugPage.click('#debug-save-note')
  await waitForText(debugPage, '#debug-note-status', 'Note saved to local Recall.')
  await debugPage.locator('#debug-open-note').waitFor({ state: 'visible' })

  const popupPage = await context.newPage()
  await popupPage.goto(`chrome-extension://${extensionId}/popup.html`, { waitUntil: 'domcontentloaded' })
  await popupPage.waitForLoadState('networkidle')
  await popupPage.click('#popup-refresh')
  await waitForText(popupPage, '#popup-status', 'Recall recognizes this saved page.')
  await waitForText(popupPage, '#popup-note-status', 'Save the current selection to "Stage 10 Debug Article".')

  const debugScreenshot = path.join(outputDir, 'stage10-extension-debug-page.png')
  await debugPage.screenshot({ path: debugScreenshot, fullPage: true })
  const popupScreenshot = path.join(outputDir, 'stage10-extension-popup-page.png')
  await popupPage.screenshot({ path: popupScreenshot, fullPage: true })

  const recallPage = await context.newPage()
  await recallPage.goto(`${backendBaseUrl}/recall`, { waitUntil: 'domcontentloaded' })
  await recallPage.waitForLoadState('networkidle')
  await recallPage.getByRole('tab', { name: 'Notes' }).click()
  await waitForText(recallPage, 'body', 'Debug note from the repo harness.')
  const recallScreenshot = path.join(outputDir, 'stage10-extension-recall-notes.png')
  await recallPage.screenshot({ path: recallScreenshot, fullPage: true })

  const readerPagePromise = context.waitForEvent('page', { timeout: 10000 })
  await debugPage.click('#debug-open-note')
  const readerPage = await readerPagePromise
  await readerPage.waitForLoadState('domcontentloaded')
  await waitForUrlPart(readerPage, '/reader?document=')

  const readerScreenshot = path.join(outputDir, 'stage10-extension-debug-reader.png')
  await readerPage.screenshot({ path: readerScreenshot, fullPage: true })

  const validationPath = path.join(outputDir, 'stage10-extension-debug-validation.json')
  await writeFile(
    validationPath,
    JSON.stringify(
      {
        articleUrl,
        backendBaseUrl,
        debugScreenshot,
        debugUrl: debugPage.url(),
        extensionId,
        popupScreenshot,
        recallScreenshot,
        readerScreenshot,
        readerUrl: readerPage.url(),
      },
      null,
      2,
    ),
    'utf8',
  )
} finally {
  await context.close()
}


async function waitForText(page, selector, expectedText) {
  await page.waitForFunction(
    ({ expectedText, selector }) => {
      const node = document.querySelector(selector)
      return Boolean(node?.textContent?.includes(expectedText))
    },
    { expectedText, selector },
    { timeout: 10000 },
  )
}


async function waitForUrlPart(page, expectedPart) {
  await page.waitForFunction(
    (expectedPart) => window.location.href.includes(expectedPart),
    expectedPart,
    { timeout: 10000 },
  )
}
