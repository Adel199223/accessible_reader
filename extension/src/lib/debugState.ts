import { buildBrowserNoteCaptureState } from './noteCapture'
import type { BrowserDebugSnapshot, BrowserInspectableTab, RecallRetrievalHit } from './contracts'


export interface BrowserDebugViewModel {
  backendLabel: string
  canSaveNote: boolean
  contextExcerpt: string
  hitLabels: string[]
  matchedDocumentLabel: string
  noteStatus: string
  promptLabel: string
  queryLabel: string
  selectionLabel: string
  status: string
  suppressionLabel: string
  tabLabel: string
}


export function buildDebugTabLabel(tab: BrowserInspectableTab) {
  return `${tab.active ? 'Active' : 'Tab'} • ${tab.title || 'Untitled tab'} • ${tab.url}`
}


export function buildDebugHitLabel(hit: RecallRetrievalHit) {
  return `${hit.hit_type.toUpperCase()} • ${hit.title} • ${hit.document_title}`
}


export function buildDebugViewModel(snapshot: BrowserDebugSnapshot | null): BrowserDebugViewModel {
  if (!snapshot) {
    return {
      backendLabel: 'Backend: awaiting debug inspection.',
      canSaveNote: false,
      contextExcerpt: 'Open a normal webpage in this window, then refresh the debug view.',
      hitLabels: [],
      matchedDocumentLabel: 'Exact saved-page match: unavailable',
      noteStatus: 'Notes are available only when this exact public page is already saved in Recall.',
      promptLabel: 'Prompt visibility: unavailable',
      queryLabel: 'Query: unavailable',
      selectionLabel: 'Selection: unavailable',
      status: 'Select an inspectable browser tab to load Recall debug state.',
      suppressionLabel: 'Suppression: unavailable',
      tabLabel: 'No browser tab selected yet.',
    }
  }

  const captureState = buildBrowserNoteCaptureState(
    snapshot.state.response,
    snapshot.state.context?.selectionText ?? '',
  )
  const response = snapshot.state.response

  return {
    backendLabel: `Backend: ${snapshot.backendBaseUrl}`,
    canSaveNote: captureState.canCapture && !snapshot.state.error,
    contextExcerpt: snapshot.state.context?.pageExcerpt || 'No captured page excerpt yet.',
    hitLabels: response?.hits.map(buildDebugHitLabel) ?? [],
    matchedDocumentLabel: response?.matched_document
      ? `Exact saved-page match: ${response.matched_document.document_title} • ${response.matched_document.source_locator}`
      : 'Exact saved-page match: none',
    noteStatus: snapshot.state.error ? snapshot.state.error : captureState.message,
    promptLabel: `Prompt visibility: ${snapshot.promptVisible ? 'visible' : 'quiet'}`,
    queryLabel: `Query: ${response?.query || 'No query yet.'}`,
    selectionLabel: snapshot.state.context?.selectionText || 'No active selection captured yet.',
    status: snapshot.state.error
      ? snapshot.state.error
      : response
        ? response.summary
        : 'Waiting for page context from the selected tab.',
    suppressionLabel:
      response?.suppression_reasons.length
        ? `Suppression: ${response.suppression_reasons.join(' • ')}`
        : 'Suppression: none',
    tabLabel: buildDebugTabLabel(snapshot.tab),
  }
}
