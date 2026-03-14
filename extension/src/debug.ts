import { RECALL_EXTENSION_DEBUG } from './lib/buildFlags'
import { buildDebugViewModel } from './lib/debugState'
import { getReaderAnchorOptionsFromNote } from './lib/noteCapture'
import type { BrowserDebugSnapshot, RecallNoteRecord } from './lib/contracts'


interface DebugInspectResponse {
  error?: string
  ok: boolean
  snapshot?: BrowserDebugSnapshot | null
}

interface DebugCreateNoteResponse extends DebugInspectResponse {
  note?: RecallNoteRecord
}


const tabSelectNode = document.querySelector<HTMLSelectElement>('#debug-tab-select')
const refreshButton = document.querySelector<HTMLButtonElement>('#debug-refresh')
const openRecallButton = document.querySelector<HTMLButtonElement>('#debug-open-recall')
const statusNode = document.querySelector<HTMLParagraphElement>('#debug-status')
const tabNode = document.querySelector<HTMLParagraphElement>('#debug-tab')
const backendNode = document.querySelector<HTMLParagraphElement>('#debug-backend')
const queryNode = document.querySelector<HTMLParagraphElement>('#debug-query')
const promptNode = document.querySelector<HTMLParagraphElement>('#debug-prompt')
const suppressionNode = document.querySelector<HTMLParagraphElement>('#debug-suppression')
const selectionNode = document.querySelector<HTMLParagraphElement>('#debug-selection')
const matchNode = document.querySelector<HTMLParagraphElement>('#debug-match')
const contextNode = document.querySelector<HTMLParagraphElement>('#debug-context')
const hitsNode = document.querySelector<HTMLDivElement>('#debug-hits')
const noteStatusNode = document.querySelector<HTMLParagraphElement>('#debug-note-status')
const noteBodyNode = document.querySelector<HTMLTextAreaElement>('#debug-note-body')
const saveNoteButton = document.querySelector<HTMLButtonElement>('#debug-save-note')
const openNoteButton = document.querySelector<HTMLButtonElement>('#debug-open-note')

let currentSnapshot: BrowserDebugSnapshot | null = null
let savedNote: RecallNoteRecord | null = null

void initialize()

refreshButton?.addEventListener('click', () => {
  void inspectSelectedTab(true)
})
openRecallButton?.addEventListener('click', () => {
  void chrome.runtime.sendMessage({ path: 'recall', type: 'openApp' })
})
saveNoteButton?.addEventListener('click', () => {
  void saveNoteForSelectedTab()
})
openNoteButton?.addEventListener('click', () => {
  if (!savedNote) {
    return
  }
  const anchor = getReaderAnchorOptionsFromNote(savedNote)
  void chrome.runtime.sendMessage({
    documentId: savedNote.anchor.source_document_id,
    path: 'reader',
    sentenceEnd: anchor.sentenceEnd,
    sentenceStart: anchor.sentenceStart,
    type: 'openApp',
  })
})
tabSelectNode?.addEventListener('change', () => {
  savedNote = null
  void inspectSelectedTab(false)
})


async function initialize() {
  if (!RECALL_EXTENSION_DEBUG) {
    if (statusNode) {
      statusNode.textContent = 'This page is available only in the debug build.'
    }
    if (saveNoteButton) {
      saveNoteButton.disabled = true
    }
    return
  }

  await loadInspectableTabs()
  await inspectSelectedTab(false)
}


async function loadInspectableTabs() {
  if (!tabSelectNode) {
    return
  }
  const tabs = await chrome.tabs.query({ currentWindow: true })
  const inspectableTabs = tabs
    .filter((tab) => Boolean(tab.id) && isInspectableUrl(tab.url))
    .sort((left, right) => Number(Boolean(right.active)) - Number(Boolean(left.active)) || (right.lastAccessed ?? 0) - (left.lastAccessed ?? 0))

  tabSelectNode.replaceChildren()
  if (!inspectableTabs.length) {
    const option = document.createElement('option')
    option.value = ''
    option.textContent = 'No inspectable tabs in this window'
    tabSelectNode.append(option)
    tabSelectNode.disabled = true
    return
  }

  tabSelectNode.disabled = false
  for (const tab of inspectableTabs) {
    const option = document.createElement('option')
    option.value = String(tab.id)
    option.textContent = `${tab.active ? 'Active' : 'Tab'} • ${tab.title || 'Untitled tab'}`
    tabSelectNode.append(option)
  }
  const activeTab = inspectableTabs.find((tab) => tab.active) ?? inspectableTabs[0]
  tabSelectNode.value = String(activeTab.id)
}


async function inspectSelectedTab(refresh: boolean) {
  if (!tabSelectNode || !statusNode || !refreshButton) {
    return
  }
  const tabId = Number(tabSelectNode.value)
  if (!Number.isFinite(tabId)) {
    statusNode.textContent = 'Open a normal webpage in this window before using the debug inspector.'
    renderSnapshot(null)
    return
  }

  refreshButton.disabled = true
  statusNode.textContent = refresh ? 'Refreshing Recall debug state…' : 'Loading cached Recall debug state…'
  try {
    const response = (await chrome.runtime.sendMessage({
      refresh,
      tabId,
      type: 'debugInspectTab',
    })) as DebugInspectResponse
    if (!response.ok) {
      statusNode.textContent = response.error ?? 'Could not load Recall debug state.'
      renderSnapshot(null)
      return
    }
    currentSnapshot = response.snapshot ?? null
    renderSnapshot(currentSnapshot)
  } finally {
    refreshButton.disabled = false
  }
}


async function saveNoteForSelectedTab() {
  if (!tabSelectNode || !saveNoteButton) {
    return
  }
  const tabId = Number(tabSelectNode.value)
  if (!Number.isFinite(tabId)) {
    return
  }

  saveNoteButton.disabled = true
  try {
    const response = (await chrome.runtime.sendMessage({
      bodyText: noteBodyNode?.value ?? '',
      tabId,
      type: 'debugCreateBrowserNote',
    })) as DebugCreateNoteResponse
    if (!response.ok || !response.note) {
      if (noteStatusNode) {
        noteStatusNode.textContent = response.error ?? 'Could not save the selected note.'
      }
      savedNote = null
      return
    }
    savedNote = response.note
    currentSnapshot = response.snapshot ?? currentSnapshot
    if (noteBodyNode) {
      noteBodyNode.value = ''
    }
    renderSnapshot(currentSnapshot)
    if (noteStatusNode) {
      noteStatusNode.textContent = 'Note saved to local Recall.'
    }
  } finally {
    saveNoteButton.disabled = false
  }
}


function renderSnapshot(snapshot: BrowserDebugSnapshot | null) {
  const model = buildDebugViewModel(snapshot)

  if (statusNode) {
    statusNode.textContent = model.status
  }
  if (tabNode) {
    tabNode.textContent = model.tabLabel
  }
  if (backendNode) {
    backendNode.textContent = model.backendLabel
  }
  if (queryNode) {
    queryNode.textContent = model.queryLabel
  }
  if (promptNode) {
    promptNode.textContent = model.promptLabel
  }
  if (suppressionNode) {
    suppressionNode.textContent = model.suppressionLabel
  }
  if (selectionNode) {
    selectionNode.textContent = `Selection: ${model.selectionLabel}`
  }
  if (matchNode) {
    matchNode.textContent = model.matchedDocumentLabel
  }
  if (contextNode) {
    contextNode.textContent = `Excerpt: ${model.contextExcerpt}`
  }
  if (noteStatusNode) {
    noteStatusNode.textContent = model.noteStatus
  }
  if (saveNoteButton) {
    saveNoteButton.disabled = !model.canSaveNote
  }
  if (openNoteButton) {
    openNoteButton.hidden = !savedNote
  }
  if (!hitsNode) {
    return
  }

  hitsNode.replaceChildren()
  if (!model.hitLabels.length) {
    const empty = document.createElement('p')
    empty.className = 'extension-note'
    empty.textContent = 'No retrieval hits are cached for this page yet.'
    hitsNode.append(empty)
    return
  }

  for (const label of model.hitLabels) {
    const card = document.createElement('article')
    card.className = 'extension-card'
    const text = document.createElement('p')
    text.className = 'extension-note'
    text.textContent = label
    card.append(text)
    hitsNode.append(card)
  }
}


function isInspectableUrl(url?: string) {
  return Boolean(url?.startsWith('http://') || url?.startsWith('https://'))
}
