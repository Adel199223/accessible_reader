import { buildBrowserNoteCaptureState, getReaderAnchorOptionsFromHit, getReaderAnchorOptionsFromNote } from './lib/noteCapture'
import type { BrowserTabContextState, RecallNoteRecord, RecallRetrievalHit } from './lib/contracts'

interface TabContextMessageResponse {
  error?: string
  ok: boolean
  state?: BrowserTabContextState
}

interface BrowserNoteMessageResponse extends TabContextMessageResponse {
  note?: RecallNoteRecord
}


const statusNode = document.querySelector<HTMLParagraphElement>('#popup-status')
const summaryNode = document.querySelector<HTMLParagraphElement>('#popup-summary')
const suppressionNode = document.querySelector<HTMLParagraphElement>('#popup-suppression')
const hitsNode = document.querySelector<HTMLDivElement>('#popup-hits')
const noteStatusNode = document.querySelector<HTMLParagraphElement>('#popup-note-status')
const noteBodyNode = document.querySelector<HTMLTextAreaElement>('#popup-note-body')
const saveNoteButton = document.querySelector<HTMLButtonElement>('#popup-save-note')
const openNoteButton = document.querySelector<HTMLButtonElement>('#popup-open-note')
const refreshButton = document.querySelector<HTMLButtonElement>('#popup-refresh')
const openRecallButton = document.querySelector<HTMLButtonElement>('#popup-open-recall')
const openOptionsButton = document.querySelector<HTMLButtonElement>('#popup-open-options')

let activeTabId: number | null = null
let noteBusy = false
let noteMessage: string | null = null
let savedNote: RecallNoteRecord | null = null
let latestState: BrowserTabContextState | null = null

refreshButton?.addEventListener('click', () => {
  void loadState(true)
})
openRecallButton?.addEventListener('click', () => {
  void chrome.runtime.sendMessage({ path: 'recall', type: 'openApp' })
})
openOptionsButton?.addEventListener('click', () => {
  void chrome.runtime.sendMessage({ type: 'openOptions' })
})
saveNoteButton?.addEventListener('click', () => {
  void handleSaveNote()
})
openNoteButton?.addEventListener('click', () => {
  if (!savedNote) {
    return
  }
  void chrome.runtime.sendMessage({
    documentId: savedNote.anchor.source_document_id,
    path: 'reader',
    sentenceEnd: getReaderAnchorOptionsFromNote(savedNote).sentenceEnd,
    sentenceStart: getReaderAnchorOptionsFromNote(savedNote).sentenceStart,
    type: 'openApp',
  })
})

void loadState(true)


async function loadState(manual: boolean) {
  if (!statusNode || !summaryNode || !suppressionNode || !hitsNode || !refreshButton) {
    return
  }
  refreshButton.disabled = true
  statusNode.textContent = manual ? 'Refreshing grounded Recall context…' : 'Checking the current page…'

  try {
    const targetTab = await findTargetTab()
    if (typeof targetTab?.id !== 'number') {
      activeTabId = null
      statusNode.textContent = 'No active tab is available.'
      latestState = null
      renderNoteCapture(null)
      return
    }
    activeTabId = targetTab.id
    const response = (await chrome.runtime.sendMessage({
      manual,
      tabId: targetTab.id,
      type: 'getTabContext',
    })) as TabContextMessageResponse
    if (!response.ok || !response.state) {
      statusNode.textContent = response.error ?? 'Could not load Recall context for this tab.'
      latestState = null
      renderNoteCapture(null)
      return
    }
    latestState = response.state
    renderState(response.state)
  } finally {
    refreshButton.disabled = false
  }
}


async function findTargetTab() {
  const tabs = await chrome.tabs.query({ currentWindow: true })
  const activeTab = tabs.find((tab) => tab.active && isInspectableUrl(tab.url))
  if (activeTab) {
    return activeTab
  }
  const fallbackTab = tabs
    .filter((tab) => isInspectableUrl(tab.url))
    .sort((left, right) => (right.lastAccessed ?? 0) - (left.lastAccessed ?? 0))[0]
  return fallbackTab
}


function isInspectableUrl(url?: string) {
  return Boolean(url?.startsWith('http://') || url?.startsWith('https://'))
}


function renderState(state: BrowserTabContextState) {
  if (!statusNode || !summaryNode || !suppressionNode || !hitsNode) {
    return
  }
  if (state.error) {
    statusNode.textContent = state.error
    summaryNode.textContent = 'The extension could not reach the local backend.'
    suppressionNode.textContent = 'Check the backend URL in Options and confirm the FastAPI service is running.'
    hitsNode.replaceChildren()
    renderNoteCapture(state)
    return
  }

  const response = state.response
  if (!response) {
    statusNode.textContent = 'Waiting for page context from the current tab.'
    summaryNode.textContent = 'Open a normal webpage and let the companion inspect it first.'
    suppressionNode.textContent = ''
    hitsNode.replaceChildren()
    renderNoteCapture(state)
    return
  }

  statusNode.textContent = response.should_prompt
    ? 'Recall found grounded local context for this page.'
    : response.matched_document
      ? 'Recall recognizes this saved page.'
      : 'Recall did not raise an automatic prompt for this page.'
  summaryNode.textContent = response.summary
  suppressionNode.textContent = response.suppression_reasons.join(' • ')

  hitsNode.replaceChildren()
  if (!response.hits.length) {
    const empty = document.createElement('p')
    empty.className = 'extension-note'
    empty.textContent = 'No related local items cleared the current threshold.'
    hitsNode.append(empty)
    renderNoteCapture(state)
    return
  }

  for (const hit of response.hits) {
    hitsNode.append(buildHitCard(hit))
  }
  renderNoteCapture(state)
}


function buildHitCard(hit: RecallRetrievalHit) {
  const card = document.createElement('article')
  card.className = 'extension-card'

  const header = document.createElement('div')
  header.className = 'extension-card-header'

  const title = document.createElement('strong')
  title.textContent = hit.title

  const meta = document.createElement('span')
  meta.textContent = `${hit.hit_type} • ${Math.round(hit.score * 100)}%`
  header.append(title, meta)

  const documentTitle = document.createElement('span')
  documentTitle.className = 'extension-card-document'
  documentTitle.textContent = hit.document_title

  const excerpt = document.createElement('p')
  excerpt.className = 'extension-card-excerpt'
  excerpt.textContent = hit.excerpt

  const chipRow = document.createElement('div')
  chipRow.className = 'extension-chip-row'
  for (const reason of hit.reasons) {
    const chip = document.createElement('span')
    chip.className = 'extension-chip'
    chip.textContent = reason
    chipRow.append(chip)
  }

  const actions = document.createElement('div')
  actions.className = 'extension-card-actions'

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
  recallButton.className = 'secondary-button'
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


async function handleSaveNote() {
  if (!saveNoteButton || typeof activeTabId !== 'number') {
    return
  }

  noteBusy = true
  noteMessage = null
  renderNoteCapture(latestState)
  try {
    const response = (await chrome.runtime.sendMessage({
      bodyText: noteBodyNode?.value ?? '',
      tabId: activeTabId,
      type: 'createBrowserNote',
    })) as BrowserNoteMessageResponse
    if (!response.ok || !response.note) {
      noteMessage = response.error ?? 'Could not save the selected note.'
      savedNote = null
      return
    }
    savedNote = response.note
    noteMessage = 'Note saved to local Recall.'
    if (noteBodyNode) {
      noteBodyNode.value = ''
    }
    latestState = response.state ?? latestState
  } finally {
    noteBusy = false
    if (latestState) {
      renderState(latestState)
    } else {
      renderNoteCapture(null)
    }
  }
}


function renderNoteCapture(state: BrowserTabContextState | null) {
  if (!noteStatusNode || !noteBodyNode || !saveNoteButton || !openNoteButton) {
    return
  }

  if (savedNote && state?.response?.matched_document?.source_document_id !== savedNote.anchor.source_document_id) {
    savedNote = null
    noteMessage = null
  }

  if (!state) {
    noteStatusNode.textContent = 'Open a saved public page and select text to capture a note.'
    noteBodyNode.disabled = true
    saveNoteButton.disabled = true
    saveNoteButton.textContent = 'Save note'
    openNoteButton.hidden = true
    return
  }

  if (state.error) {
    noteStatusNode.textContent = 'Note capture is unavailable until the local backend reconnects.'
    noteBodyNode.disabled = true
    saveNoteButton.disabled = true
    saveNoteButton.textContent = 'Save note'
    openNoteButton.hidden = true
    return
  }

  const captureState = buildBrowserNoteCaptureState(state.response, state.context?.selectionText ?? '')
  noteStatusNode.textContent = noteMessage ?? captureState.message
  noteBodyNode.disabled = !state.response?.matched_document || noteBusy
  saveNoteButton.disabled = !captureState.canCapture || noteBusy
  saveNoteButton.textContent = noteBusy ? 'Saving…' : 'Save note'
  openNoteButton.hidden = !savedNote
}
