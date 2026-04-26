import type { DocumentRecord, RecallNoteSearchHit, RecallRetrievalHit } from '../types'

export interface WorkspaceSearchSessionState {
  error: string | null
  hits: RecallRetrievalHit[]
  loading: boolean
  notes: RecallNoteSearchHit[]
  query: string
  recentDocuments: DocumentRecord[]
  selectedResultKey: string | null
  sourceResults: DocumentRecord[]
}

export const defaultWorkspaceSearchSessionState: WorkspaceSearchSessionState = {
  error: null,
  hits: [],
  loading: false,
  notes: [],
  query: '',
  recentDocuments: [],
  selectedResultKey: null,
  sourceResults: [],
}

export function buildWorkspaceSearchDocumentKey(documentId: string) {
  return `document:${documentId}`
}

export function buildWorkspaceSearchNoteKey(noteId: string) {
  return `note:${noteId}`
}

export function buildWorkspaceSearchRecallHitKey(hitId: string) {
  return `recall:${hitId}`
}

export function getWorkspaceSearchResultKey(result: DocumentRecord | RecallNoteSearchHit | RecallRetrievalHit) {
  if ('hit_type' in result) {
    return buildWorkspaceSearchRecallHitKey(result.id)
  }
  if ('anchor' in result) {
    return buildWorkspaceSearchNoteKey(result.id)
  }
  return buildWorkspaceSearchDocumentKey(result.id)
}

export function getWorkspaceSearchResultKeys(
  searchSession: WorkspaceSearchSessionState,
  options?: { includeRecentDocuments?: boolean },
) {
  const resultKeys = [
    ...searchSession.sourceResults.map((document) => buildWorkspaceSearchDocumentKey(document.id)),
    ...searchSession.notes.map((note) => buildWorkspaceSearchNoteKey(note.id)),
    ...searchSession.hits.map((hit) => buildWorkspaceSearchRecallHitKey(hit.id)),
  ]

  if (!resultKeys.length && options?.includeRecentDocuments) {
    return searchSession.recentDocuments.map((document) => buildWorkspaceSearchDocumentKey(document.id))
  }

  return resultKeys
}

export function buildWorkspaceSearchAnchorOptions(note: RecallNoteSearchHit | RecallRetrievalHit) {
  const anchor = 'anchor' in note ? note.anchor : note.note_anchor
  if (!anchor) {
    return undefined
  }
  if (anchor.kind === 'source') {
    return {
      sentenceEnd: null,
      sentenceStart: null,
    }
  }
  return {
    sentenceEnd: anchor.global_sentence_end ?? anchor.sentence_end,
    sentenceStart: anchor.global_sentence_start ?? anchor.sentence_start,
  }
}
