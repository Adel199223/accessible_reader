import { access, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const harnessDir =
  process.env.RECALL_HTML_PREVIEW_PLAYWRIGHT_HARNESS ??
  process.env.RECALL_OPEN_APP_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const headless = parseBooleanEnv(process.env.RECALL_HTML_PREVIEW_HEADLESS, true)
const preferredChannel = process.env.RECALL_HTML_PREVIEW_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = parseBooleanEnv(process.env.RECALL_HTML_PREVIEW_ALLOW_CHROMIUM_FALLBACK, true)
const viewport = { width: 1280, height: 720 }
const captureAspectRatio = viewport.width / viewport.height

const { inputPath, outputPath } = parseArgs(process.argv.slice(2))
const resolvedHarnessDir = resolveHarnessDir(harnessDir)
const playwrightEntry = path.join(resolvedHarnessDir, 'node_modules', 'playwright', 'index.mjs')
await ensureReadable(playwrightEntry, `Playwright harness not found at "${playwrightEntry}".`)

const playwrightModuleUrl = pathToFileURL(playwrightEntry).href
const { chromium } = await import(playwrightModuleUrl)
const { browser } = await launchBrowser(chromium)

try {
  const page = await browser.newPage({ viewport })
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' }).catch(() => undefined)
  await page.goto(pathToFileURL(path.resolve(inputPath)).href, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => undefined)
  await page.waitForTimeout(550)

  await page.evaluate(() => window.scrollTo(0, 0)).catch(() => undefined)
  const clip = await resolveCaptureClip(page, viewport)

  await mkdir(path.dirname(outputPath), { recursive: true })
  await page.screenshot({
    path: outputPath,
    ...(clip ? { clip } : {}),
    type: 'png',
  })
} finally {
  await browser.close()
}

function parseArgs(args) {
  let inputPath = ''
  let outputPath = ''

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--input') {
      inputPath = args[index + 1] ?? ''
      index += 1
      continue
    }
    if (argument === '--output') {
      outputPath = args[index + 1] ?? ''
      index += 1
    }
  }

  if (!inputPath || !outputPath) {
    throw new Error('Usage: node render_saved_html_preview_asset.mjs --input <html-path> --output <png-path>')
  }

  return { inputPath, outputPath }
}

async function resolveCaptureClip(page, viewportSize) {
  const capturePlan = await page.evaluate(
    ({ aspectRatio, viewportHeight, viewportWidth }) => {
      const rootSelectors = ['article', 'main', '[role="main"]', 'body']
      const descendantSelectors = ['article', 'main', '[role="main"]', 'section', 'div', 'figure', 'blockquote', 'p']
      const chromeTokens = [
        'ad',
        'ads',
        'alert',
        'avatar',
        'banner',
        'breadcrumb',
        'button',
        'caption',
        'comment',
        'consent',
        'cookie',
        'drawer',
        'footer',
        'header',
        'hero',
        'icon',
        'logo',
        'masthead',
        'menu',
        'modal',
        'nav',
        'newsletter',
        'notice',
        'pagination',
        'popover',
        'promo',
        'search',
        'share',
        'sidebar',
        'social',
        'subscribe',
        'tab',
        'toolbar',
      ]
      const chromeSelectors = ['header', 'nav', 'footer', 'aside', '[role="navigation"]', '[role="banner"]']
      const minimumCandidateHeight = 96
      const minimumCandidateWidth = 240

      function clamp(value, minimum, maximum) {
        return Math.min(Math.max(value, minimum), maximum)
      }

      function normalizeText(value) {
        return (value ?? '').replace(/\s+/g, ' ').trim()
      }

      function elementTokens(element) {
        const tokens = [
          element.id,
          element.getAttribute('role'),
          element.getAttribute('aria-label'),
          element.getAttribute('class'),
          element.getAttribute('data-testid'),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return tokens
      }

      function countMeaningfulImages(element) {
        let count = 0
        for (const image of element.querySelectorAll('img, picture, figure, video, canvas')) {
          if (!(image instanceof HTMLElement)) {
            continue
          }
          const rect = image.getBoundingClientRect()
          if (rect.width >= 96 && rect.height >= 72) {
            count += 1
          }
        }
        return count
      }

      function isElementVisible(element) {
        const style = window.getComputedStyle(element)
        if (style.display === 'none' || style.visibility === 'hidden') {
          return false
        }
        return Number.parseFloat(style.opacity || '1') > 0.02
      }

      function toAbsoluteRect(element) {
        const rect = element.getBoundingClientRect()
        return {
          height: rect.height,
          width: rect.width,
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY,
        }
      }

      function hasChromeAncestor(element) {
        for (const selector of chromeSelectors) {
          if (element.closest(selector)) {
            return true
          }
        }
        return false
      }

      function buildCandidate(element, sourceKind) {
        if (!(element instanceof HTMLElement) || !isElementVisible(element)) {
          return null
        }

        const rect = toAbsoluteRect(element)
        if (rect.width < minimumCandidateWidth || rect.height < minimumCandidateHeight) {
          return null
        }

        const text = normalizeText(element.innerText)
        const textLength = text.length
        const headingCount =
          (element.matches('h1, h2, h3') ? 1 : 0) + element.querySelectorAll('h1, h2, h3').length
        const paragraphCount =
          (element.matches('p, li, blockquote, figcaption, pre') ? 1 : 0) +
          element.querySelectorAll('p, li, blockquote, figcaption, pre').length
        const imageCount = countMeaningfulImages(element)
        const interactiveCount = element.querySelectorAll('a, button, input, select, textarea').length
        const tokens = elementTokens(element)
        const chromeHitCount = chromeTokens.reduce((count, token) => count + (tokens.includes(token) ? 1 : 0), 0)
        const area = Math.max(rect.width * rect.height, 1)
        const textDensity = (textLength + headingCount * 60 + paragraphCount * 40) / Math.sqrt(area)
        const articleLikeBonus =
          element.matches('article')
            ? 34
            : element.matches('main, [role="main"]')
              ? 28
              : element.matches('section')
                ? 18
                : 0
        const rootBonus = sourceKind === 'root' ? 8 : 0
        const contentScore =
          Math.min(165, textDensity * 12) +
          Math.min(84, headingCount * 22 + paragraphCount * 12) +
          Math.min(34, imageCount * 12)
        const largeRegionPenalty =
          Math.max(0, rect.height - viewportHeight * 0.92) / 10 +
          Math.max(0, rect.width - viewportWidth * 0.92) / 16
        const chromePenalty = chromeHitCount * 30 + Math.min(42, interactiveCount * 1.6)
        const lowContentPenalty =
          textLength < 40 && imageCount === 0
            ? 58
            : textLength < 88 && imageCount === 0
              ? 26
              : 0
        const blankBandPenalty =
          rect.height > viewportHeight * 0.34 && textLength < 56 && imageCount === 0 ? 52 : 0
        const topChromePenalty =
          rect.y < viewportHeight * 0.16 && textLength < 88 && headingCount === 0 && imageCount === 0 ? 24 : 0
        const ancestorPenalty = hasChromeAncestor(element) ? 26 : 0
        const bodyPenalty = element.matches('body') ? 18 : 0
        const score =
          contentScore +
          articleLikeBonus +
          rootBonus -
          largeRegionPenalty -
          chromePenalty -
          lowContentPenalty -
          blankBandPenalty -
          topChromePenalty -
          ancestorPenalty -
          bodyPenalty

        if (score < 14) {
          return null
        }

        return {
          rect,
          score,
        }
      }

      function buildClipFromRect(rect, documentWidth, documentHeight) {
        const paddingX = clamp(rect.width * 0.06, 24, 56)
        const paddingY = clamp(rect.height * 0.08, 18, 48)
        let clipWidth = rect.width + paddingX * 2
        let clipHeight = rect.height + paddingY * 2

        if (clipWidth / clipHeight > aspectRatio) {
          clipHeight = clipWidth / aspectRatio
        } else {
          clipWidth = clipHeight * aspectRatio
        }

        clipWidth = clamp(clipWidth, 320, Math.min(viewportWidth, documentWidth))
        clipHeight = clamp(clipHeight, 180, Math.min(viewportHeight, documentHeight))

        const centerX = rect.x + rect.width / 2
        const centerY = rect.y + rect.height / 2
        const maximumX = Math.max(0, documentWidth - clipWidth)
        const maximumY = Math.max(0, documentHeight - clipHeight)
        const clipX = clamp(centerX - clipWidth / 2, 0, maximumX)
        const clipY = clamp(centerY - clipHeight / 2, 0, maximumY)

        return {
          height: Math.max(1, clipHeight),
          width: Math.max(1, clipWidth),
          x: clipX,
          y: clipY,
        }
      }

      const documentElement = document.documentElement
      const body = document.body
      const documentWidth = Math.max(
        viewportWidth,
        documentElement?.scrollWidth ?? 0,
        documentElement?.clientWidth ?? 0,
        body?.scrollWidth ?? 0,
        body?.clientWidth ?? 0,
      )
      const documentHeight = Math.max(
        viewportHeight,
        documentElement?.scrollHeight ?? 0,
        documentElement?.clientHeight ?? 0,
        body?.scrollHeight ?? 0,
        body?.clientHeight ?? 0,
      )

      const roots = rootSelectors
        .flatMap((selector) => Array.from(document.querySelectorAll(selector)))
        .filter((value, index, values) => values.indexOf(value) === index)

      const candidates = []
      const seen = new Set()

      function addElementCandidate(element, sourceKind) {
        if (!(element instanceof HTMLElement) || seen.has(element)) {
          return
        }
        seen.add(element)
        const candidate = buildCandidate(element, sourceKind)
        if (candidate) {
          candidates.push(candidate)
        }
      }

      for (const root of roots) {
        addElementCandidate(root, 'root')
        for (const descendant of root.querySelectorAll(descendantSelectors.join(', '))) {
          addElementCandidate(descendant, 'descendant')
        }
      }

      const bestCandidate = candidates
        .sort((left, right) => right.score - left.score || left.rect.y - right.rect.y)[0] ?? null

      if (!bestCandidate) {
        return null
      }

      const clip = buildClipFromRect(bestCandidate.rect, documentWidth, documentHeight)
      const maximumScrollY = Math.max(0, documentHeight - viewportHeight)
      const scrollY = clamp(
        clip.y - Math.max(16, (viewportHeight - clip.height) / 2),
        0,
        maximumScrollY,
      )

      return {
        clip,
        scrollY,
      }
    },
    {
      aspectRatio: captureAspectRatio,
      viewportHeight: viewportSize.height,
      viewportWidth: viewportSize.width,
    },
  )

  if (!capturePlan?.clip) {
    return null
  }

  await page.evaluate((scrollY) => window.scrollTo(0, scrollY), capturePlan.scrollY ?? 0).catch(() => undefined)
  await page.waitForTimeout(250)

  return {
    height: capturePlan.clip.height,
    width: capturePlan.clip.width,
    x: capturePlan.clip.x,
    y: Math.max(0, capturePlan.clip.y - (capturePlan.scrollY ?? 0)),
  }
}

async function launchBrowser(chromium) {
  try {
    return {
      browser: await chromium.launch({
        channel: preferredChannel,
        headless,
      }),
      runtimeBrowser: preferredChannel,
    }
  } catch (error) {
    if (!allowChromiumFallback) {
      throw new Error(
        `Could not launch Microsoft Edge through Playwright for HTML preview rendering. Confirm that Edge is installed and that the harness directory "${resolvedHarnessDir}" is valid.`,
        { cause: error },
      )
    }

    return {
      browser: await chromium.launch({ headless }),
      runtimeBrowser: 'chromium',
    }
  }
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
