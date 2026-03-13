import { shouldShowPrompt } from './lib/prompt'
import { fetchWithTimeout } from './lib/network'
import { ensureSettings, loadSettings, normalizeBackendBaseUrl } from './lib/settings'
import type {
  BrowserContextRequest,
  BrowserContextResponse,
  HealthResponse,
  PageContext,
} from './lib/contracts'


interface TabContextState {
  context: PageContext | null
  dismissedFingerprints: string[]
  error: string | null
  response: BrowserContextResponse | null
}

type ExtensionMessage =
  | { type: 'dismissPrompt'; fingerprint: string }
  | { type: 'getTabContext'; manual?: boolean; tabId?: number }
  | { type: 'openApp'; documentId?: string; path: 'recall' | 'reader' }
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
          const state = await refreshTabContext(tabId, true)
          return { ok: true, state }
        }
        return { ok: true, state: getOrCreateTabState(tabId) }
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
      case 'openApp': {
        const settings = await loadSettings()
        const targetUrl =
          message.path === 'reader' && message.documentId
            ? `${normalizeBackendBaseUrl(settings.backendBaseUrl)}/reader?document=${encodeURIComponent(message.documentId)}`
            : `${normalizeBackendBaseUrl(settings.backendBaseUrl)}/recall`
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


async function refreshTabContext(tabId: number, manual: boolean) {
  const state = getOrCreateTabState(tabId)
  if (!state.context) {
    return state
  }

  const settings = await loadSettings()
  const previousFingerprint = state.response?.page_fingerprint
  try {
    state.response = await fetchBrowserContext(settings.backendBaseUrl, state.context, manual, settings.resultLimit)
    state.error = null
    if (previousFingerprint && previousFingerprint !== state.response.page_fingerprint) {
      state.dismissedFingerprints = []
    }
  } catch (error) {
    state.response = null
    state.error = error instanceof Error ? error.message : 'Could not reach the local Recall backend.'
  }

  await updateBadge(tabId, state, settings)
  await notifyTab(tabId, state, settings)
  return state
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
