import type { BrowserContextResponse, RecallNoteAnchor, RecallNoteRecord, RecallRetrievalHit } from './contracts'


export interface ReaderAnchorOptions {
  sentenceEnd?: number
  sentenceStart?: number
}

export interface BrowserNoteCaptureState {
  canCapture: boolean
  message: string
  selectionText: string
}


export function buildBrowserNoteCaptureState(
  response: BrowserContextResponse | null,
  selectionText: string,
): BrowserNoteCaptureState {
  const normalizedSelection = normalizeWhitespace(selectionText)
  if (!response?.matched_document) {
    return {
      canCapture: false,
      message: 'Notes are available only when this exact public page is already saved in Recall.',
      selectionText: normalizedSelection,
    }
  }
  if (!normalizedSelection) {
    return {
      canCapture: false,
      message: `This page matches "${response.matched_document.document_title}". Select text on the page to save a note.`,
      selectionText: normalizedSelection,
    }
  }
  return {
    canCapture: true,
    message: `Save the current selection to "${response.matched_document.document_title}".`,
    selectionText: normalizedSelection,
  }
}


export function getReaderAnchorOptionsFromHit(hit: RecallRetrievalHit): ReaderAnchorOptions {
  return getReaderAnchorOptionsFromAnchor(hit.note_anchor)
}


export function getReaderAnchorOptionsFromNote(note: RecallNoteRecord): ReaderAnchorOptions {
  return getReaderAnchorOptionsFromAnchor(note.anchor)
}


function getReaderAnchorOptionsFromAnchor(anchor?: RecallNoteAnchor | null): ReaderAnchorOptions {
  if (!anchor) {
    return {}
  }
  const sentenceStart = anchor.global_sentence_start ?? anchor.sentence_start
  const sentenceEnd = anchor.global_sentence_end ?? anchor.sentence_end
  return { sentenceEnd, sentenceStart }
}


function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}
