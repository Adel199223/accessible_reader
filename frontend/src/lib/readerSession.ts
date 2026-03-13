import type { DocumentRecord, SummaryDetail, ViewMode } from '../types'

export interface ReaderSession {
  documentId: string | null
  mode: ViewMode
  summaryDetail: SummaryDetail
}

export interface ResolvedReaderSession extends ReaderSession {
  document: DocumentRecord | null
}

export const readerSessionStorageKey = 'accessible-reader.session'

const defaultReaderSession: ReaderSession = {
  documentId: null,
  mode: 'reflowed',
  summaryDetail: 'balanced',
}

const validModes = new Set<ViewMode>(['original', 'reflowed', 'simplified', 'summary'])
const validSummaryDetails = new Set<SummaryDetail>(['short', 'balanced', 'detailed'])

export function loadReaderSession(): ReaderSession {
  if (typeof window === 'undefined') {
    return defaultReaderSession
  }

  try {
    const raw = window.localStorage.getItem(readerSessionStorageKey)
    if (!raw) {
      return defaultReaderSession
    }

    const parsed = JSON.parse(raw) as Partial<ReaderSession>
    return {
      documentId: typeof parsed.documentId === 'string' && parsed.documentId ? parsed.documentId : null,
      mode: parsed.mode && validModes.has(parsed.mode) ? parsed.mode : defaultReaderSession.mode,
      summaryDetail:
        parsed.summaryDetail && validSummaryDetails.has(parsed.summaryDetail)
          ? parsed.summaryDetail
          : defaultReaderSession.summaryDetail,
    }
  } catch {
    return defaultReaderSession
  }
}

export function saveReaderSession(session: ReaderSession) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(readerSessionStorageKey, JSON.stringify(session))
}

function defaultModeForDocument(document: DocumentRecord | null | undefined): ViewMode {
  if (!document) {
    return defaultReaderSession.mode
  }
  return document.available_modes.includes('reflowed') ? 'reflowed' : document.available_modes[0] ?? 'reflowed'
}

export function resolveReaderSession(
  documents: DocumentRecord[],
  session: ReaderSession,
  options?: {
    currentDocument?: DocumentRecord | null
    preserveCurrentWhenFiltered?: boolean
  },
): ResolvedReaderSession {
  const preferredDocument = session.documentId
    ? documents.find((document) => document.id === session.documentId) ?? null
    : null

  if (preferredDocument) {
    return {
      document: preferredDocument,
      documentId: preferredDocument.id,
      mode: preferredDocument.available_modes.includes(session.mode)
        ? session.mode
        : defaultModeForDocument(preferredDocument),
      summaryDetail: session.summaryDetail,
    }
  }

  const currentDocument = options?.currentDocument ?? null
  if (
    options?.preserveCurrentWhenFiltered &&
    currentDocument &&
    (!session.documentId || currentDocument.id === session.documentId)
  ) {
    return {
      document: currentDocument,
      documentId: currentDocument.id,
      mode: currentDocument.available_modes.includes(session.mode)
        ? session.mode
        : defaultModeForDocument(currentDocument),
      summaryDetail: session.summaryDetail,
    }
  }

  const fallbackDocument = documents[0] ?? null
  return {
    document: fallbackDocument,
    documentId: fallbackDocument?.id ?? null,
    mode: defaultModeForDocument(fallbackDocument),
    summaryDetail: session.summaryDetail,
  }
}
