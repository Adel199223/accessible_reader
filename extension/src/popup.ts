import type { BrowserContextResponse, RecallRetrievalHit } from './lib/contracts'


interface TabContextState {
  error: string | null
  response: BrowserContextResponse | null
}

interface TabContextMessageResponse {
  error?: string
  ok: boolean
  state?: TabContextState
}


const statusNode = document.querySelector<HTMLParagraphElement>('#popup-status')
const summaryNode = document.querySelector<HTMLParagraphElement>('#popup-summary')
const suppressionNode = document.querySelector<HTMLParagraphElement>('#popup-suppression')
const hitsNode = document.querySelector<HTMLDivElement>('#popup-hits')
const refreshButton = document.querySelector<HTMLButtonElement>('#popup-refresh')
const openRecallButton = document.querySelector<HTMLButtonElement>('#popup-open-recall')
const openOptionsButton = document.querySelector<HTMLButtonElement>('#popup-open-options')

refreshButton?.addEventListener('click', () => {
  void loadState(true)
})
openRecallButton?.addEventListener('click', () => {
  void chrome.runtime.sendMessage({ path: 'recall', type: 'openApp' })
})
openOptionsButton?.addEventListener('click', () => {
  void chrome.runtime.sendMessage({ type: 'openOptions' })
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
      statusNode.textContent = 'No active tab is available.'
      return
    }
    const response = (await chrome.runtime.sendMessage({
      manual,
      tabId: targetTab.id,
      type: 'getTabContext',
    })) as TabContextMessageResponse
    if (!response.ok || !response.state) {
      statusNode.textContent = response.error ?? 'Could not load Recall context for this tab.'
      return
    }
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


function renderState(state: TabContextState) {
  if (!statusNode || !summaryNode || !suppressionNode || !hitsNode) {
    return
  }
  if (state.error) {
    statusNode.textContent = state.error
    summaryNode.textContent = 'The extension could not reach the local backend.'
    suppressionNode.textContent = 'Check the backend URL in Options and confirm the FastAPI service is running.'
    hitsNode.replaceChildren()
    return
  }

  const response = state.response
  if (!response) {
    statusNode.textContent = 'Waiting for page context from the current tab.'
    summaryNode.textContent = 'Open a normal webpage and let the companion inspect it first.'
    suppressionNode.textContent = ''
    hitsNode.replaceChildren()
    return
  }

  statusNode.textContent = response.should_prompt
    ? 'Recall found grounded local context for this page.'
    : 'Recall did not raise an automatic prompt for this page.'
  summaryNode.textContent = response.summary
  suppressionNode.textContent = response.suppression_reasons.join(' • ')

  hitsNode.replaceChildren()
  if (!response.hits.length) {
    const empty = document.createElement('p')
    empty.className = 'extension-note'
    empty.textContent = 'No related local items cleared the current threshold.'
    hitsNode.append(empty)
    return
  }

  for (const hit of response.hits) {
    hitsNode.append(buildHitCard(hit))
  }
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
    void chrome.runtime.sendMessage({
      documentId: hit.source_document_id,
      path: 'reader',
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
