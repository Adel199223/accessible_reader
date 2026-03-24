import { access, mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const targetUrl = process.env.RECALL_OPEN_APP_URL ?? 'http://127.0.0.1:8000/recall'
const harnessDir =
  process.env.RECALL_OPEN_APP_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const headless = parseBooleanEnv(process.env.RECALL_OPEN_APP_HEADLESS, false)
const exitAfterLoad = parseBooleanEnv(process.env.RECALL_OPEN_APP_EXIT_AFTER_LOAD, false)
const viewport = { width: 1600, height: 1080 }

const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightEntry = path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')
await ensureReadable(playwrightEntry, `Playwright harness not found at "${playwrightEntry}".`)

const playwrightModuleUrl = pathToFileURL(playwrightEntry).href
const { chromium } = await import(playwrightModuleUrl)

const userDataDir = await mkdtemp(path.join(os.tmpdir(), 'accessible-reader-open-app-edge-'))
let context

try {
  try {
    context = await chromium.launchPersistentContext(userDataDir, {
      channel: 'msedge',
      headless,
      viewport,
    })
  } catch (error) {
    throw new Error(
      `Could not launch Microsoft Edge through Playwright. Confirm that Edge is installed and that the harness directory "${resolvedHarnessDir}" is valid.`,
      { cause: error },
    )
  }

  const browser = context.browser()
  if (!browser) {
    throw new Error('Playwright did not expose a browser handle for the Edge persistent context.')
  }

  const page = context.pages()[0] ?? (await context.newPage())
  const response = await page.goto(targetUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle')

  if (response && !response.ok()) {
    throw new Error(`Loaded "${targetUrl}" but received HTTP ${response.status()}.`)
  }

  if (exitAfterLoad) {
    await context.close()
    context = undefined
  } else {
    console.log(`Recall app opened in Edge at ${targetUrl}. Close the Edge window to end this launcher.`)
    await new Promise((resolve) => browser.once('disconnected', resolve))
  }
} finally {
  if (context) {
    await context.close().catch(() => undefined)
  }
  await rm(userDataDir, { recursive: true, force: true }).catch(() => undefined)
}

function parseBooleanEnv(value, defaultValue) {
  if (value == null || value === '') {
    return defaultValue
  }

  const normalized = value.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true
  }
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false
  }
  return defaultValue
}

function resolveHarnessDir(candidate) {
  if (path.isAbsolute(candidate)) {
    return candidate
  }
  return path.resolve(repoRoot, candidate)
}

async function ensureReadable(filePath, message) {
  try {
    await access(filePath)
  } catch {
    throw new Error(message)
  }
}
