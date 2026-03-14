export type AppSection = 'recall' | 'reader'
export type RecallSection = 'library' | 'graph' | 'study' | 'notes'
export type WorkspaceSection = RecallSection | 'reader'

export interface RecallWorkspaceFocusRequest {
  cardId?: string | null
  documentId?: string | null
  nodeId?: string | null
  noteId?: string | null
  section: RecallSection
  token: number
}

export interface AppRoute {
  documentId: string | null
  path: AppSection
  sentenceEnd: number | null
  sentenceStart: number | null
}


export function parseAppRoute(locationLike: Pick<Location, 'pathname' | 'search'>): AppRoute {
  const pathname = locationLike.pathname.replace(/\/+$/, '') || '/'
  const searchParams = new URLSearchParams(locationLike.search)
  const documentId = searchParams.get('document')
  const sentenceStart = parseRouteSentenceIndex(searchParams.get('sentenceStart'))
  const sentenceEnd = parseRouteSentenceIndex(searchParams.get('sentenceEnd'))
  if (pathname === '/reader') {
    return {
      path: 'reader',
      documentId,
      sentenceStart,
      sentenceEnd: sentenceEnd ?? sentenceStart,
    }
  }
  return { path: 'recall', documentId: null, sentenceStart: null, sentenceEnd: null }
}


export function buildAppHref(
  path: AppSection,
  documentId?: string | null,
  options?: {
    sentenceEnd?: number | null
    sentenceStart?: number | null
  },
) {
  if (path === 'reader' && documentId) {
    const search = new URLSearchParams({ document: documentId })
    if (options?.sentenceStart !== undefined && options.sentenceStart !== null) {
      search.set('sentenceStart', String(options.sentenceStart))
    }
    const resolvedSentenceEnd =
      options?.sentenceEnd !== undefined ? options.sentenceEnd : options?.sentenceStart
    if (resolvedSentenceEnd !== undefined && resolvedSentenceEnd !== null) {
      search.set('sentenceEnd', String(resolvedSentenceEnd))
    }
    return `/reader?${search.toString()}`
  }
  return `/${path}`
}

function parseRouteSentenceIndex(value: string | null) {
  if (!value) {
    return null
  }
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}
