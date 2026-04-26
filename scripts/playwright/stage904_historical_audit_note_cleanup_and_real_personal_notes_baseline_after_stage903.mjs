import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  deleteRecallNoteAuditArtifacts,
  findRecallNoteAuditArtifacts,
} from './cleanup_recall_note_audit_artifacts.mjs'
import {
  captureLocatorScreenshot,
  captureViewportScreenshot,
  launchBrowserContext,
} from './home_rendered_preview_quality_shared.mjs'
import { desktopViewport } from './notebook_workbench_shared.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const outputDir =
  process.env.RECALL_STAGE904_OUTPUT_DIR ?? path.join(repoRoot, 'output', 'playwright')
const harnessDir =
  process.env.RECALL_STAGE904_PLAYWRIGHT_HARNESS ??
  'C:\\Users\\FA507\\AppData\\Local\\Temp\\accessible-reader-playwright'
const baseUrl = process.env.RECALL_STAGE904_BASE_URL ?? 'http://127.0.0.1:8000'
const headless = process.env.RECALL_STAGE904_HEADLESS === '0' ? false : true
const preferredChannel = process.env.RECALL_STAGE904_BROWSER_CHANNEL ?? 'msedge'
const allowChromiumFallback = process.env.RECALL_STAGE904_ALLOW_CHROMIUM_FALLBACK === '0' ? false : true

await mkdir(outputDir, { recursive: true })
for (const failureFile of [
  'stage904-historical-cleanup-failure-home.png',
  'stage904-historical-cleanup-failure-source-overview.png',
]) {
  await rm(path.join(outputDir, failureFile), { force: true })
}

const beforeCleanup = await findRecallNoteAuditArtifacts({ baseUrl })
const applyCleanup = await deleteRecallNoteAuditArtifacts({ baseUrl })
const afterCleanup = await findRecallNoteAuditArtifacts({ baseUrl })

const { browser, runtimeBrowser } = await launchBrowserContext({
  allowChromiumFallback,
  harnessDir,
  headless,
  preferredChannel,
  repoRoot,
})

let homePage
let sourceOverviewPage
try {
  homePage = await browser.newPage({ viewport: desktopViewport })
  sourceOverviewPage = await browser.newPage({ viewport: desktopViewport })

  const homeEvidence = await captureHomeArtifactAbsenceEvidence(homePage)
  const sourceOverviewEvidence = await captureSourceMemoryArtifactAbsenceEvidence(sourceOverviewPage)

  const metrics = {
    cleanupUtilityApplyDeletedCount: applyCleanup.deletedCount,
    cleanupUtilityApplyFailures: applyCleanup.deleteFailures,
    cleanupUtilityDryRunMatchedAfterApply: afterCleanup.matchedCount,
    cleanupUtilityDryRunMatchedBeforeApply: beforeCleanup.matchedCount,
    homePersonalNotesAuditArtifactsAbsent: homeEvidence.homePersonalNotesAuditArtifactsAbsent,
    sourceMemoryAuditArtifactsAbsent: sourceOverviewEvidence.sourceMemoryAuditArtifactsAbsent,
    workspaceSearchAuditArtifactsAbsent: afterCleanup.matchedCount === 0,
  }

  if (metrics.cleanupUtilityApplyFailures.length > 0) {
    throw new Error(`Stage 904 cleanup apply had ${metrics.cleanupUtilityApplyFailures.length} delete failure(s).`)
  }
  if (metrics.cleanupUtilityDryRunMatchedAfterApply !== 0) {
    throw new Error(
      `Stage 904 expected no matched audit notes after cleanup, found ${metrics.cleanupUtilityDryRunMatchedAfterApply}.`,
    )
  }
  if (
    !metrics.homePersonalNotesAuditArtifactsAbsent ||
    !metrics.sourceMemoryAuditArtifactsAbsent ||
    !metrics.workspaceSearchAuditArtifactsAbsent
  ) {
    throw new Error('Stage 904 expected historical audit artifacts to be absent from personal-note surfaces.')
  }

  await writeFile(
    path.join(outputDir, 'stage904-historical-audit-note-cleanup-and-real-personal-notes-baseline-validation.json'),
    JSON.stringify(
      {
        auditFocus: [
          'Apply the guarded source-note audit-artifact cleanup to historical local notes.',
          'Confirm cleanup deletes only matched source-attached Stage-marker notes.',
          'Confirm Home Personal notes, Source memory, and workspace note search no longer expose historical audit artifacts.',
        ],
        baseUrl,
        captures: {
          ...homeEvidence.captures,
          ...sourceOverviewEvidence.captures,
        },
        cleanupApply: applyCleanup,
        cleanupDryRunAfterApply: afterCleanup,
        cleanupDryRunBeforeApply: beforeCleanup,
        desktopViewport,
        headless,
        metrics,
        runtimeBrowser,
      },
      null,
      2,
    ),
    'utf8',
  )
} catch (error) {
  await Promise.all([
    captureFailure(homePage, outputDir, 'stage904-historical-cleanup-failure-home.png'),
    captureFailure(sourceOverviewPage, outputDir, 'stage904-historical-cleanup-failure-source-overview.png'),
  ])
  await writeFile(
    path.join(outputDir, 'stage904-historical-audit-note-cleanup-failure.json'),
    JSON.stringify(
      {
        cleanupApply: applyCleanup,
        cleanupDryRunAfterApply: afterCleanup,
        cleanupDryRunBeforeApply: beforeCleanup,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
    'utf8',
  ).catch(() => undefined)
  throw error
} finally {
  await browser.close()
}

async function captureHomeArtifactAbsenceEvidence(page) {
  const response = await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Home navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  await page.getByRole('tab', { name: 'Home', selected: true }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(400)
  const homeWideTop = await captureViewportScreenshot(page, outputDir, 'stage904-home-after-historical-cleanup.png')

  const organizerSection = page.locator('[data-home-personal-notes-organizer-section-stage898="true"]').first()
  if (await organizerSection.isVisible().catch(() => false)) {
    await organizerSection.getByRole('button').first().click()
    await page.waitForTimeout(500)
  }

  const board = page.locator('[data-home-personal-notes-board-stage898="true"]').first()
  let personalNotesBoardCapture = null
  if (await board.isVisible().catch(() => false)) {
    personalNotesBoardCapture = await captureLocatorScreenshot(
      page,
      board,
      outputDir,
      'stage904-home-personal-notes-board-after-cleanup.png',
    )
  }

  const homePersonalNotesAuditArtifactsAbsent = await page.evaluate(() => {
    const pattern = /Stage stage\d{3}/i
    const personalNoteSurfaces = [
      document.querySelector('[data-home-personal-note-lane="true"]'),
      document.querySelector('[data-home-personal-notes-board-stage898="true"]'),
    ]
    return personalNoteSurfaces.every((surface) => !pattern.test(surface?.textContent ?? ''))
  })

  return {
    captures: {
      homeWideTop,
      personalNotesBoardCapture,
    },
    homePersonalNotesAuditArtifactsAbsent,
  }
}

async function captureSourceMemoryArtifactAbsenceEvidence(page) {
  const response = await page.goto(`${baseUrl}/recall`, { waitUntil: 'networkidle' })
  if (!response || !response.ok()) {
    throw new Error(`Home navigation failed with status ${response?.status() ?? 'unknown'}.`)
  }

  const sourceButton = page.locator('.recall-home-parity-card-stage563, .recall-home-parity-list-row-stage563').first()
  await sourceButton.waitFor({ state: 'visible', timeout: 20000 })
  await sourceButton.click()
  await page.getByRole('heading', { name: 'Source overview', level: 2 }).waitFor({ state: 'visible', timeout: 20000 })
  await page.waitForTimeout(400)

  const sourceMemoryPanel = page.locator('[data-source-overview-personal-notes-panel-stage900="true"]').first()
  const sourceOverviewCapture = await captureViewportScreenshot(
    page,
    outputDir,
    'stage904-source-overview-after-historical-cleanup.png',
  )
  let sourceMemoryPanelCapture = null
  if (await sourceMemoryPanel.isVisible().catch(() => false)) {
    sourceMemoryPanelCapture = await captureLocatorScreenshot(
      page,
      sourceMemoryPanel,
      outputDir,
      'stage904-source-memory-panel-after-cleanup.png',
    )
  }

  const sourceMemoryAuditArtifactsAbsent = await page.evaluate(() => {
    const pattern = /Stage stage\d{3}/i
    const sourceMemoryPanel = document.querySelector('[data-source-overview-personal-notes-panel-stage900="true"]')
    return !pattern.test(sourceMemoryPanel?.textContent ?? '')
  })

  return {
    captures: {
      sourceMemoryPanelCapture,
      sourceOverviewCapture,
    },
    sourceMemoryAuditArtifactsAbsent,
  }
}

async function captureFailure(page, directory, filename) {
  if (!page) {
    return
  }
  await page
    .screenshot({
      fullPage: true,
      path: path.join(directory, filename),
    })
    .catch(() => undefined)
}
