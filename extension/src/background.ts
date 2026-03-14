import { RECALL_EXTENSION_DEBUG } from './lib/buildFlags'
import { shouldShowPrompt } from './lib/prompt'
import { fetchWithTimeout } from './lib/network'
import { ensureSettings, loadSettings, normalizeBackendBaseUrl } from './lib/settings'
import type {
  BrowserDebugSnapshot,
  BrowserTabContextState,
  BrowserContextRequest,
  BrowserContextResponse,
  BrowserRecallNoteCreateRequest,
  HealthResponse,
  PageContext,
  RecallNoteRecord,
} from './lib/contracts'

interface TabContextState extends BrowserTabContextState {
  dismissedFingerprints: string[]
}

type ExtensionMessage =
  | { type: 'createBrowserNote'; bodyText?: string; tabId?: number }
  | { type: 'debugCreateBrowserNote'; bodyText?: string; tabId: number }
  | { type: 'debugInspectTab'; refresh?: boolean; tabId: number }
  | { type: 'dismissPrompt'; fingerprint: string }
  | { type: 'getTabContext'; manual?: boolean; tabId?: number }
  | { type: 'openApp'; documentId?: string; path: 'recall' | 'reader'; sentenceEnd?: number; sentenceStart?: number }
  | { type: 'openOptions' }
  | { type: 'probeBackend'; backendBaseUrl?: string }
  | { type: 'upsertPageContext'; context: PageContext }


const tabStates = new Map<number, TabContextState>()

void ensureSettings()
void chrome.action.setBadgeBackgroundColor({ color: '#1f5a32' })

chrome.runtime.onInstalled.addListener(() => {
  void ensureSettings()
  void chrome.action.setBadgeBackgroundColor({ color: '#1f5a32' })
})

chrome.tabs.onRemoved.addListener((tabId) => {
  tabStates.delete(tabId)
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    tabStates.delete(tabId)
    void clearBadge(tabId)
  }
})

chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  void (async () => {
    switch (message.type) {
      case 'upsertPageContext': {
        const tabId = sender.tab?.id
        if (typeof tabId !== 'number') {
          return { ok: false }
        }
        const state = getOrCreateTabState(tabId)
        state.context = message.context
        const nextState = await refreshTabContext(tabId, false)
        return { ok: true, state: nextState }
      }
      case 'getTabContext': {
        const tabId = message.tabId ?? sender.tab?.id
        if (typeof tabId !== 'number') {
          return { ok: false, error: 'No active tab available.' }
        }
        if (message.manual) {
          const state = await captureAndRefreshTabContext(tabId, true)
          return { ok: true, state }
        }
        return { ok: true, state: getOrCreateTabState(tabId) }
      }
      case 'debugInspectTab': {
        if (!RECALL_EXTENSION_DEBUG) {
          return { ok: false, error: 'Debug inspection is available only in the debug build.' }
        }
        const snapshot = await inspectTabState(message.tabId, Boolean(message.refresh))
        if (!snapshot) {
          return { ok: false, error: 'Could not inspect the requested tab.' }
        }
        return { ok: true, snapshot }
      }
      case 'dismissPrompt': {
        const tabId = sender.tab?.id
        if (typeof tabId !== 'number') {
          return { ok: false }
        }
        const state = getOrCreateTabState(tabId)
        if (!state.dismissedFingerprints.includes(message.fingerprint)) {
          state.dismissedFingerprints = [...state.dismissedFingerprints, message.fingerprint]
        }
        const settings = await loadSettings()
        await updateBadge(tabId, state, settings)
        await notifyTab(tabId, state, settings)
        return { ok: true }
      }
      case 'createBrowserNote': {
        const tabId = message.tabId ?? sender.tab?.id
        if (typeof tabId !== 'number') {
          return { ok: false, error: 'No active tab is available.' }
        }
        let state = getOrCreateTabState(tabId)
        if (!state.context) {
          await requestPageContextFromTab(tabId)
          state = getOrCreateTabState(tabId)
        }
        if (!state.context) {
          return { ok: false, error: 'Waiting for page context from the current tab.' }
        }
        const settings = await loadSettings()
        const note = await fetchBrowserNote(settings.backendBaseUrl, state.context, message.bodyText)
        const nextState = await refreshTabContext(tabId, true, settings)
        return { ok: true, note, state: nextState }
      }
      case 'debugCreateBrowserNote': {
        if (!RECALL_EXTENSION_DEBUG) {
          return { ok: false, error: 'Debug note capture is available only in the debug build.' }
        }
        let state = getOrCreateTabState(message.tabId)
        if (!state.context) {
          await requestPageContextFromTab(message.tabId)
          state = getOrCreateTabState(message.tabId)
        }
        if (!state.context) {
          return { ok: false, error: 'Waiting for page context from the selected tab.' }
        }
        const settings = await loadSettings()
        const note = await fetchBrowserNote(settings.backendBaseUrl, state.context, message.bodyText)
        const nextState = await refreshTabContext(message.tabId, true, settings)
        const snapshot = await buildDebugSnapshot(message.tabId, nextState, settings)
        return { ok: true, note, snapshot }
      }
      case 'openApp': {
        const settings = await loadSettings()
        const baseUrl = normalizeBackendBaseUrl(settings.backendBaseUrl)
        let targetUrl = `${baseUrl}/recall`
        if (message.path === 'reader' && message.documentId) {
          const search = new URLSearchParams({ document: message.documentId })
          if (typeof message.sentenceStart === 'number') {
            search.set('sentenceStart', String(message.sentenceStart))
          }
          const sentenceEnd =
            typeof message.sentenceEnd === 'number' ? message.sentenceEnd : message.sentenceStart
          if (typeof sentenceEnd === 'number') {
            search.set('sentenceEnd', String(sentenceEnd))
          }
          targetUrl = `${baseUrl}/reader?${search.toString()}`
        }
        await chrome.tabs.create({ url: targetUrl })
        return { ok: true }
      }
      case 'openOptions': {
        await chrome.runtime.openOptionsPage()
        return { ok: true }
      }
      case 'probeBackend': {
        const result = await probeBackend(message.backendBaseUrl)
        return result
      }
      default:
        return { ok: false, error: 'Unsupported message.' }
    }
  })()
    .then((response) => sendResponse(response))
    .catch((error) =>
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : 'Unexpected extension error.',
      }),
    )
  return true
})


function getOrCreateTabState(tabId: number) {
  const existing = tabStates.get(tabId)
  if (existing) {
    return existing
  }
  const nextState: TabContextState = {
    context: null,
    dismissedFingerprints: [],
    error: null,
    response: null,
  }
  tabStates.set(tabId, nextState)
  return nextState
}


async function refreshTabContext(
  tabId: number,
  manual: boolean,
  settings?: Awaited<ReturnType<typeof loadSettings>>,
) {
  const state = getOrCreateTabState(tabId)
  if (!state.context) {
    return state
  }

  const resolvedSettings = settings ?? (await loadSettings())
  const previousFingerprint = state.response?.page_fingerprint
  try {
    state.response = await fetchBrowserContext(
      resolvedSettings.backendBaseUrl,
      state.context,
      manual,
      resolvedSettings.resultLimit,
    )
    state.error = null
    if (previousFingerprint && previousFingerprint !== state.response.page_fingerprint) {
      state.dismissedFingerprints = []
    }
  } catch (error) {
    state.response = null
    state.error = error instanceof Error ? error.message : 'Could not reach the local Recall backend.'
  }

  await updateBadge(tabId, state, resolvedSettings)
  await notifyTab(tabId, state, resolvedSettings)
  return state
}


async function requestPageContextFromTab(tabId: number) {
  try {
    await chrome.tabs.sendMessage(tabId, {
      type: 'capturePageContext',
    })
  } catch {
    // Content scripts are not always ready when the worker asks for a refresh.
  }
}


async function captureAndRefreshTabContext(tabId: number, manual: boolean) {
  await requestPageContextFromTab(tabId)
  const settings = await loadSettings()
  return refreshTabContext(tabId, manual, settings)
}


async function inspectTabState(tabId: number, refresh: boolean): Promise<BrowserDebugSnapshot | null> {
  const settings = await loadSettings()
  const state = refresh ? await captureAndRefreshTabContext(tabId, true) : getOrCreateTabState(tabId)
  return buildDebugSnapshot(tabId, state, settings)
}


async function buildDebugSnapshot(
  tabId: number,
  state: TabContextState,
  settings: Awaited<ReturnType<typeof loadSettings>>,
): Promise<BrowserDebugSnapshot | null> {
  try {
    const tab = await chrome.tabs.get(tabId)
    return {
      backendBaseUrl: settings.backendBaseUrl,
      promptVisible: shouldShowPrompt(state.response, settings, state.dismissedFingerprints),
      state: {
        context: state.context,
        error: state.error,
        response: state.response,
      },
      tab: {
        active: Boolean(tab.active),
        id: tab.id ?? tabId,
        title: tab.title ?? 'Untitled tab',
        url: tab.url ?? '',
      },
    }
  } catch {
    return null
  }
}


async function fetchBrowserContext(
  backendBaseUrl: string,
  context: PageContext,
  manual: boolean,
  limit: number,
) {
  const requestBody: BrowserContextRequest = {
    limit,
    manual,
    meta_description: context.metaDescription,
    page_excerpt: context.pageExcerpt,
    page_title: context.pageTitle,
    page_url: context.pageUrl,
    selection_text: context.selectionText,
  }
  const response = await fetchWithTimeout(`${normalizeBackendBaseUrl(backendBaseUrl)}/api/recall/browser/context`, {
    body: JSON.stringify(requestBody),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  if (!response.ok) {
    let detail = `Request failed with status ${response.status}.`
    try {
      const payload = (await response.json()) as { detail?: string }
      if (payload.detail) {
        detail = payload.detail
      }
    } catch {
      // Ignore JSON parsing problems and fall back to the generic message.
    }
    throw new Error(detail)
  }
  return (await response.json()) as BrowserContextResponse
}


async function fetchBrowserNote(
  backendBaseUrl: string,
  context: PageContext,
  bodyText?: string,
) {
  const requestBody: BrowserRecallNoteCreateRequest = {
    body_text: bodyText?.trim() ? bodyText.trim() : null,
    page_url: context.pageUrl,
    selection_text: context.selectionText,
  }
  const response = await fetchWithTimeout(`${normalizeBackendBaseUrl(backendBaseUrl)}/api/recall/browser/notes`, {
    body: JSON.stringify(requestBody),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  if (!response.ok) {
    let detail = `Request failed with status ${response.status}.`
    try {
      const payload = (await response.json()) as { detail?: string }
      if (payload.detail) {
        detail = payload.detail
      }
    } catch {
      // Ignore JSON parsing problems and fall back to the generic message.
    }
    throw new Error(detail)
  }
  return (await response.json()) as RecallNoteRecord
}


async function updateBadge(tabId: number, state: TabContextState, settings: Awaited<ReturnType<typeof loadSettings>>) {
  if (state.error) {
    await chrome.action.setBadgeText({ tabId, text: '!' })
    return
  }
  const promptVisible = shouldShowPrompt(state.response, settings, state.dismissedFingerprints)
  if (!promptVisible || !state.response) {
    await clearBadge(tabId)
    return
  }
  const nextText = String(Math.min(state.response.hits.length, 9))
  await chrome.action.setBadgeText({ tabId, text: nextText })
}


async function clearBadge(tabId: number) {
  await chrome.action.setBadgeText({ tabId, text: '' })
}


async function notifyTab(tabId: number, state: TabContextState, settings: Awaited<ReturnType<typeof loadSettings>>) {
  try {
    await chrome.tabs.sendMessage(tabId, {
      backendBaseUrl: settings.backendBaseUrl,
      error: state.error,
      promptVisible: shouldShowPrompt(state.response, settings, state.dismissedFingerprints),
      response: state.response,
      type: 'contextUpdated',
    })
  } catch {
    // Content scripts are not always present when the worker refreshes.
  }
}


async function probeBackend(backendBaseUrl?: string) {
  const settings = backendBaseUrl ? { backendBaseUrl: normalizeBackendBaseUrl(backendBaseUrl) } : await loadSettings()
  try {
    const response = await fetchWithTimeout(`${normalizeBackendBaseUrl(settings.backendBaseUrl)}/api/health`)
    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}.`)
    }
    const payload = (await response.json()) as HealthResponse
    return { ok: true, payload }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not reach the local Recall backend.',
    }
  }
}
