export type AppSection = 'recall' | 'reader'
export type RecallSection = 'library' | 'graph' | 'study' | 'notes'
export type RecallStudyFilter = 'all' | 'new' | 'due' | 'scheduled'
export type SourceWorkspaceTab = 'overview' | 'reader' | 'notes' | 'graph' | 'study'
export type WorkspaceSection = RecallSection | 'reader'

export interface WorkspaceDockTarget {
  cardId?: string | null
  documentId?: string | null
  nodeId?: string | null
  noteId?: string | null
  section: WorkspaceSection
  sentenceEnd?: number | null
  sentenceStart?: number | null
}

export interface WorkspaceDockAction {
  key: string
  label: string
  target: WorkspaceDockTarget
}

export interface WorkspaceRecentItem {
  badge: string
  key: string
  subtitle?: string | null
  target: WorkspaceDockTarget
  title: string
}

export interface WorkspaceDockContext {
  actions: WorkspaceDockAction[]
  badge: string
  key: string
  meta?: string | null
  recentItem?: WorkspaceRecentItem | null
  section: WorkspaceSection
  subtitle: string
  title: string
}

export interface RecallWorkspaceFocusRequest {
  cardId?: string | null
  documentId?: string | null
  nodeId?: string | null
  noteId?: string | null
  section: RecallSection
  token: number
}

export interface RecallWorkspaceContinuityState {
  browseDrawers: {
    graph: boolean
    library: boolean
    notes: boolean
    study: boolean
  }
  graph: {
    selectedNodeId: string | null
  }
  library: {
    filterQuery: string
    selectedDocumentId: string | null
  }
  notes: {
    searchQuery: string
    selectedDocumentId: string | null
    selectedNoteId: string | null
  }
  study: {
    activeCardId: string | null
    filter: RecallStudyFilter
  }
  sourceWorkspace: {
    activeDocumentId: string | null
    activeTab: SourceWorkspaceTab
  }
}

export interface AppRoute {
  documentId: string | null
  path: AppSection
  sentenceEnd: number | null
  sentenceStart: number | null
}

export const defaultRecallWorkspaceContinuityState: RecallWorkspaceContinuityState = {
  browseDrawers: {
    graph: true,
    library: true,
    notes: true,
    study: true,
  },
  graph: {
    selectedNodeId: null,
  },
  library: {
    filterQuery: '',
    selectedDocumentId: null,
  },
  notes: {
    searchQuery: '',
    selectedDocumentId: null,
    selectedNoteId: null,
  },
  study: {
    activeCardId: null,
    filter: 'all',
  },
  sourceWorkspace: {
    activeDocumentId: null,
    activeTab: 'overview',
  },
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
