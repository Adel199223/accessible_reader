import { buildBrowserNoteCaptureState, getReaderAnchorOptionsFromHit, getReaderAnchorOptionsFromNote } from './lib/noteCapture'
import type { BrowserContextResponse, PageContext, RecallNoteRecord, RecallRetrievalHit } from './lib/contracts'
import { buildPromptLabel } from './lib/prompt'


interface ContextUpdatedMessage {
  backendBaseUrl: string
  error: string | null
  promptVisible: boolean
  response: BrowserContextResponse | null
  type: 'contextUpdated'
}

interface CapturePageContextMessage {
  type: 'capturePageContext'
}

interface RenderState {
  backendBaseUrl: string
  error: string | null
  noteBusy: boolean
  noteMessage: string | null
  panelOpen: boolean
  promptVisible: boolean
  response: BrowserContextResponse | null
  savedNote: RecallNoteRecord | null
}


const HOST_ID = 'recall-extension-host'
const MAX_META_DESCRIPTION_CHARS = 320
const MAX_PAGE_EXCERPT_CHARS = 720
const MAX_SELECTION_CHARS = 640
const REFRESH_DEBOUNCE_MS = 450

let refreshTimer: number | null = null
let renderState: RenderState = {
  backendBaseUrl: 'http://127.0.0.1:8000',
  error: null,
  noteBusy: false,
  noteMessage: null,
  panelOpen: false,
  promptVisible: false,
  response: null,
  savedNote: null,
}

setupNavigationHooks()
renderOverlay()
scheduleContextRefresh()

document.addEventListener('selectionchange', () => scheduleContextRefresh())
window.addEventListener('focus', () => scheduleContextRefresh())
window.addEventListener('hashchange', () => scheduleContextRefresh())
window.addEventListener('popstate', () => scheduleContextRefresh())
window.addEventListener('recall-urlchange', () => scheduleContextRefresh())

chrome.runtime.onMessage.addListener(
  (message: ContextUpdatedMessage | CapturePageContextMessage, _sender, sendResponse) => {
    if (message.type === 'capturePageContext') {
      void pushPageContext()
        .then((context) => sendResponse({ context, ok: true }))
        .catch((error) =>
          sendResponse({
            error: error instanceof Error ? error.message : 'Could not capture page context.',
            ok: false,
          }),
        )
      return true
    }
    if (message.type !== 'contextUpdated') {
      return
    }
    const nextSavedNote =
      message.response?.matched_document?.source_document_id === renderState.savedNote?.anchor.source_document_id
        ? renderState.savedNote
        : null
    renderState = {
      backendBaseUrl: message.backendBaseUrl,
      error: message.error,
      noteBusy: renderState.noteBusy,
      noteMessage: nextSavedNote ? renderState.noteMessage : null,
      panelOpen:
        message.promptVisible || message.response?.matched_document ? renderState.panelOpen : false,
      promptVisible: message.promptVisible,
      response: message.response,
      savedNote: nextSavedNote,
    }
    renderOverlay()
  },
)


function scheduleContextRefresh() {
  if (refreshTimer) {
    window.clearTimeout(refreshTimer)
  }
  refreshTimer = window.setTimeout(() => {
    refreshTimer = null
    void sendPageContext()
  }, REFRESH_DEBOUNCE_MS)
}


async function sendPageContext() {
  if (!location.href.startsWith('http')) {
    return
  }
  await pushPageContext()
}


async function pushPageContext() {
  const context = capturePageContext()
  await chrome.runtime.sendMessage({
    context,
    type: 'upsertPageContext',
  })
  return context
}


function capturePageContext(): PageContext {
  return {
    metaDescription: getMetaDescription(),
    pageExcerpt: getPageExcerpt(),
    pageTitle: normalizeWhitespace(document.title),
    pageUrl: location.href,
    selectionText: getSelectionText(),
  }
}


function renderOverlay() {
  const host = ensureHost()
  const shadowRoot = host.shadowRoot
  if (!shadowRoot) {
    return
  }

  if (!renderState.response || (!renderState.promptVisible && !renderState.response.matched_document)) {
    host.style.display = 'none'
    return
  }
  host.style.display = 'block'

  shadowRoot.replaceChildren()
  const style = document.createElement('style')
  style.textContent = overlayStyles
  shadowRoot.append(style)

  const wrapper = document.createElement('div')
  wrapper.className = 'recall-extension-wrapper'

  const chip = document.createElement('button')
  chip.className = 'recall-chip'
  chip.type = 'button'
  chip.textContent = buildPromptLabel(renderState.response)
  chip.addEventListener('click', () => {
    renderState = { ...renderState, panelOpen: !renderState.panelOpen }
    renderOverlay()
  })
  wrapper.append(chip)

  if (renderState.panelOpen) {
    wrapper.append(buildPanel(renderState.response))
  }

  shadowRoot.append(wrapper)
}


function buildPanel(response: BrowserContextResponse) {
  const panel = document.createElement('aside')
  panel.className = 'recall-panel'

  const header = document.createElement('div')
  header.className = 'recall-panel-header'

  const titleGroup = document.createElement('div')
  const title = document.createElement('strong')
  title.textContent = 'Recall context'
  const summary = document.createElement('p')
  summary.textContent = response.summary
  titleGroup.append(title, summary)

  const closeButton = document.createElement('button')
  closeButton.className = 'recall-secondary'
  closeButton.type = 'button'
  closeButton.textContent = 'Close'
  closeButton.addEventListener('click', () => {
    renderState = { ...renderState, panelOpen: false }
    renderOverlay()
  })
  header.append(titleGroup, closeButton)
  panel.append(header)

  const actionRow = document.createElement('div')
  actionRow.className = 'recall-panel-actions'

  const openRecallButton = document.createElement('button')
  openRecallButton.type = 'button'
  openRecallButton.textContent = 'Open Recall'
  openRecallButton.addEventListener('click', () => {
    void chrome.runtime.sendMessage({ path: 'recall', type: 'openApp' })
  })

  actionRow.append(openRecallButton)
  if (renderState.promptVisible) {
    const dismissButton = document.createElement('button')
    dismissButton.className = 'recall-secondary'
    dismissButton.type = 'button'
    dismissButton.textContent = 'Dismiss'
    dismissButton.addEventListener('click', () => {
      if (response.page_fingerprint) {
        void chrome.runtime.sendMessage({
          fingerprint: response.page_fingerprint,
          type: 'dismissPrompt',
        })
      }
      renderState = { ...renderState, panelOpen: false, promptVisible: false }
      renderOverlay()
    })
    actionRow.append(dismissButton)
  }
  panel.append(actionRow)

  const noteSection = document.createElement('section')
  noteSection.className = 'recall-hit-card'

  const noteHeader = document.createElement('div')
  noteHeader.className = 'recall-hit-header'
  const noteTitle = document.createElement('strong')
  noteTitle.textContent = 'Saved page note'
  const noteScope = document.createElement('span')
  noteScope.textContent = response.matched_document ? 'exact saved page' : 'unavailable'
  noteHeader.append(noteTitle, noteScope)
  noteSection.append(noteHeader)

  const noteStatus = document.createElement('p')
  noteStatus.className = 'recall-excerpt'
  const captureState = buildBrowserNoteCaptureState(response, capturePageContext().selectionText)
  noteStatus.textContent = renderState.noteMessage ?? captureState.message
  noteSection.append(noteStatus)

  const noteActions = document.createElement('div')
  noteActions.className = 'recall-panel-actions'

  const saveNoteButton = document.createElement('button')
  saveNoteButton.type = 'button'
  saveNoteButton.textContent = renderState.noteBusy ? 'Saving…' : 'Save selection note'
  saveNoteButton.disabled = !captureState.canCapture || renderState.noteBusy
  saveNoteButton.addEventListener('click', () => {
    void handleSaveCurrentSelection()
  })
  noteActions.append(saveNoteButton)

  if (renderState.savedNote) {
    const openNoteButton = document.createElement('button')
    openNoteButton.className = 'recall-secondary'
    openNoteButton.type = 'button'
    openNoteButton.textContent = 'Open note in Reader'
    openNoteButton.addEventListener('click', () => {
      const anchor = getReaderAnchorOptionsFromNote(renderState.savedNote!)
      void chrome.runtime.sendMessage({
        documentId: renderState.savedNote!.anchor.source_document_id,
        path: 'reader',
        sentenceEnd: anchor.sentenceEnd,
        sentenceStart: anchor.sentenceStart,
        type: 'openApp',
      })
    })
    noteActions.append(openNoteButton)
  }
  noteSection.append(noteActions)
  panel.append(noteSection)

  const list = document.createElement('div')
  list.className = 'recall-hit-list'
  if (!response.hits.length) {
    const empty = document.createElement('p')
    empty.className = 'recall-excerpt'
    empty.textContent = 'No related local items cleared the current threshold.'
    list.append(empty)
  } else {
    for (const hit of response.hits.slice(0, 3)) {
      list.append(buildHitCard(hit))
    }
  }
  panel.append(list)
  return panel
}


function buildHitCard(hit: RecallRetrievalHit) {
  const card = document.createElement('section')
  card.className = 'recall-hit-card'

  const header = document.createElement('div')
  header.className = 'recall-hit-header'

  const title = document.createElement('strong')
  title.textContent = hit.title

  const score = document.createElement('span')
  score.textContent = `${hit.hit_type} • ${Math.round(hit.score * 100)}%`
  header.append(title, score)

  const documentTitle = document.createElement('p')
  documentTitle.className = 'recall-document-title'
  documentTitle.textContent = hit.document_title

  const excerpt = document.createElement('p')
  excerpt.className = 'recall-excerpt'
  excerpt.textContent = hit.excerpt

  const chipRow = document.createElement('div')
  chipRow.className = 'recall-chip-row'
  for (const reason of hit.reasons) {
    const chip = document.createElement('span')
    chip.className = 'recall-reason-chip'
    chip.textContent = reason
    chipRow.append(chip)
  }

  const actions = document.createElement('div')
  actions.className = 'recall-panel-actions'

  const readerButton = document.createElement('button')
  readerButton.type = 'button'
  readerButton.textContent = 'Open in Reader'
  readerButton.addEventListener('click', () => {
    const readerAnchor = getReaderAnchorOptionsFromHit(hit)
    void chrome.runtime.sendMessage({
      documentId: hit.source_document_id,
      path: 'reader',
      sentenceEnd: readerAnchor.sentenceEnd,
      sentenceStart: readerAnchor.sentenceStart,
      type: 'openApp',
    })
  })

  const recallButton = document.createElement('button')
  recallButton.className = 'recall-secondary'
  recallButton.type = 'button'
  recallButton.textContent = 'Open Recall'
  recallButton.addEventListener('click', () => {
    void chrome.runtime.sendMessage({ path: 'recall', type: 'openApp' })
  })
  actions.append(readerButton, recallButton)

  card.append(header, documentTitle, excerpt)
  if (chipRow.childElementCount) {
    card.append(chipRow)
  }
  card.append(actions)
  return card
}


async function handleSaveCurrentSelection() {
  if (renderState.noteBusy) {
    return
  }
  renderState = { ...renderState, noteBusy: true, noteMessage: null }
  renderOverlay()
  try {
    const response = (await chrome.runtime.sendMessage({
      bodyText: '',
      type: 'createBrowserNote',
    })) as {
      error?: string
      note?: RecallNoteRecord
      ok: boolean
      state?: {
        response: BrowserContextResponse | null
      }
    }
    if (!response.ok || !response.note) {
      renderState = {
        ...renderState,
        noteBusy: false,
        noteMessage: response.error ?? 'Could not save the selected note.',
        savedNote: null,
      }
      renderOverlay()
      return
    }
    renderState = {
      ...renderState,
      noteBusy: false,
      noteMessage: 'Note saved to local Recall.',
      response: response.state?.response ?? renderState.response,
      savedNote: response.note,
    }
    renderOverlay()
  } catch (error) {
    renderState = {
      ...renderState,
      noteBusy: false,
      noteMessage: error instanceof Error ? error.message : 'Could not save the selected note.',
      savedNote: null,
    }
    renderOverlay()
  }
}


function ensureHost() {
  let host = document.getElementById(HOST_ID)
  if (!host) {
    host = document.createElement('div')
    host.id = HOST_ID
    document.documentElement.append(host)
    host.attachShadow({ mode: 'open' })
  }
  return host
}


function setupNavigationHooks() {
  const originalPushState = history.pushState.bind(history)
  const originalReplaceState = history.replaceState.bind(history)

  history.pushState = function pushState(...args) {
    const result = originalPushState(...args)
    window.dispatchEvent(new Event('recall-urlchange'))
    return result
  }

  history.replaceState = function replaceState(...args) {
    const result = originalReplaceState(...args)
    window.dispatchEvent(new Event('recall-urlchange'))
    return result
  }
}


function getMetaDescription() {
  const node = document.querySelector('meta[name="description"]')
  if (!(node instanceof HTMLMetaElement)) {
    return ''
  }
  return normalizeWhitespace(node.content).slice(0, MAX_META_DESCRIPTION_CHARS)
}


function getSelectionText() {
  return normalizeWhitespace(window.getSelection()?.toString() ?? '').slice(0, MAX_SELECTION_CHARS)
}


function getPageExcerpt() {
  const candidates = [
    document.querySelector('article'),
    document.querySelector('main'),
    document.body,
  ]
  for (const candidate of candidates) {
    if (!candidate) {
      continue
    }
    const text = normalizeWhitespace(candidate.textContent ?? '')
    if (text.length >= 80) {
      return text.slice(0, MAX_PAGE_EXCERPT_CHARS)
    }
  }
  return ''
}


function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}


const overlayStyles = `
  :host {
    all: initial;
  }

  .recall-extension-wrapper {
    position: fixed;
    right: 1rem;
    bottom: 1rem;
    z-index: 2147483647;
    display: grid;
    gap: 0.75rem;
    max-width: min(26rem, calc(100vw - 2rem));
    font-family: "Segoe UI", "Aptos", system-ui, sans-serif;
    color: #16311c;
  }

  .recall-chip,
  .recall-panel button {
    border: none;
    cursor: pointer;
    font: inherit;
  }

  .recall-chip {
    justify-self: end;
    max-width: 100%;
    border-radius: 999px;
    padding: 0.8rem 1rem;
    background: linear-gradient(135deg, #214f2f 0%, #2d6d3d 100%);
    box-shadow: 0 18px 40px rgba(23, 58, 33, 0.28);
    color: white;
    font-size: 0.95rem;
    font-weight: 700;
    text-align: left;
  }

  .recall-panel {
    border-radius: 1.2rem;
    padding: 1rem;
    background: rgba(250, 252, 247, 0.98);
    box-shadow: 0 24px 48px rgba(26, 56, 34, 0.22);
    border: 1px solid rgba(22, 49, 28, 0.12);
    display: grid;
    gap: 0.9rem;
  }

  .recall-panel-header,
  .recall-hit-header,
  .recall-panel-actions {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .recall-panel-header p,
  .recall-document-title,
  .recall-excerpt {
    margin: 0.35rem 0 0;
    line-height: 1.45;
  }

  .recall-hit-list {
    display: grid;
    gap: 0.75rem;
  }

  .recall-hit-card {
    border-radius: 1rem;
    padding: 0.85rem;
    background: white;
    border: 1px solid rgba(22, 49, 28, 0.1);
  }

  .recall-chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    margin: 0.75rem 0;
  }

  .recall-reason-chip {
    border-radius: 999px;
    padding: 0.25rem 0.55rem;
    background: rgba(33, 79, 47, 0.12);
    color: #214f2f;
    font-size: 0.78rem;
    font-weight: 600;
  }

  .recall-panel button {
    border-radius: 999px;
    padding: 0.6rem 0.95rem;
    background: #214f2f;
    color: white;
    font-weight: 700;
  }

  .recall-panel button.recall-secondary {
    background: rgba(33, 79, 47, 0.12);
    color: #214f2f;
  }
`
