export type AppSection = 'recall' | 'reader'
export type RecallSection = 'library' | 'graph' | 'study' | 'notes'
export type RecallLibrarySurface = 'home' | 'notebook'
export type RecallHomeOrganizerLens = 'collections' | 'recent'
export type RecallHomeMemoryFilter = 'all' | 'any' | 'notes' | 'graph' | 'study'
export type RecallHomeViewMode = 'board' | 'list'
export type RecallLibrarySortDirection = 'asc' | 'desc'
export type RecallLibrarySortMode = 'updated' | 'created' | 'title' | 'manual'
export type RecallStudyFilter = 'all' | 'new' | 'due' | 'scheduled' | 'unscheduled'
export type RecallStudyScheduleDrilldown = 'all' | 'due-now' | 'due-this-week' | 'upcoming' | 'new' | 'reviewed'
export type RecallStudyKnowledgeStageFilter = 'all' | 'new' | 'learning' | 'practiced' | 'confident' | 'mastered'
export type RecallStudyReviewHistoryFilter = 'all' | 'unreviewed' | 'forgot' | 'hard' | 'good' | 'easy'
export type RecallStudyDifficultyFilter = 'all' | 'easy' | 'medium' | 'hard'
export type RecallStudyLaunchIntent = 'review' | 'questions' | 'generate' | 'start-session'
export type RecallReaderLaunchIntent = 'resume' | 'highlight'
export type RecallReaderQueueScope = 'all' | 'web' | 'documents' | 'captures' | 'untagged'
export type RecallReaderQueueState = 'all' | 'unread' | 'in_progress' | 'completed'
export type RecallStudyCollectionFilter =
  | 'all'
  | 'collection:web'
  | 'collection:documents'
  | 'collection:captures'
  | 'collection:untagged'
  | `collection:custom:${string}`
export type RecallStudyProgressPeriodDays = 14 | 30 | 90 | 365
export type RecallHomeReviewFilter = RecallStudyScheduleDrilldown
export type SourceWorkspaceTab = 'overview' | 'reader' | 'notes' | 'graph' | 'study'
export type SourceWorkspaceMode = 'browse' | 'focused'
export type WorkspaceSection = RecallSection | 'reader'

export interface ReaderAnchorRange {
  sentenceEnd: number
  sentenceStart: number
}

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
  librarySurface?: RecallLibrarySurface | null
  newNote?: boolean | null
  nodeId?: string | null
  noteId?: string | null
  readerIntent?: RecallReaderLaunchIntent | null
  readerMode?: 'original' | 'reflowed' | 'simplified' | 'summary' | null
  readerSentenceEnd?: number | null
  readerSentenceStart?: number | null
  section: RecallSection
  scheduleDrilldown?: RecallStudyScheduleDrilldown | null
  sourceMemorySearchFocus?: boolean | null
  sourceTab?: SourceWorkspaceTab | null
  studyIntent?: RecallStudyLaunchIntent | null
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
    focusTrailNodeIds: string[]
    pathSelectedNodeIds: string[]
    selectedNodeId: string | null
    tourDismissed: boolean
    tourStep: number | null
  }
  library: {
    activeSurface: RecallLibrarySurface
    filterQuery: string
    homeMemoryFilter: RecallHomeMemoryFilter
    homeReviewFilter: RecallHomeReviewFilter
    homeOrganizerLens: RecallHomeOrganizerLens
    homeOrganizerVisible: boolean
    homeSortDirection: RecallLibrarySortDirection
    homeSortMode: RecallLibrarySortMode
    homeViewMode: RecallHomeViewMode
    selectedDocumentId: string | null
  }
  notes: {
    searchQuery: string
    selectedDocumentId: string | null
    selectedNoteId: string | null
  }
  study: {
    activeCardId: string | null
    collectionFilter: RecallStudyCollectionFilter
    difficultyFilter?: RecallStudyDifficultyFilter
    filter: RecallStudyFilter
    knowledgeStageFilter: RecallStudyKnowledgeStageFilter
    progressPeriodDays: RecallStudyProgressPeriodDays
    questionSearchQuery: string
    reviewHistoryFilter: RecallStudyReviewHistoryFilter
    scheduleDrilldown: RecallStudyScheduleDrilldown
    sourceScopeDocumentId: string | null
  }
  sourceWorkspace: {
    activeDocumentId: string | null
    activeTab: SourceWorkspaceTab
    memorySearchFocusToken: number | null
    memorySearchQuery: string
    mode: SourceWorkspaceMode
    readerAnchor: ReaderAnchorRange | null
  }
}

export interface AppRoute {
  documentId: string | null
  path: AppSection
  queueCollectionId: string | null
  queueScope: RecallReaderQueueScope | null
  queueState: RecallReaderQueueState | null
  recallSection: RecallSection
  sentenceEnd: number | null
  sentenceStart: number | null
}

export const defaultRecallWorkspaceContinuityState: RecallWorkspaceContinuityState = {
  browseDrawers: {
    graph: true,
    library: true,
    notes: true,
    study: false,
  },
  graph: {
    focusTrailNodeIds: [],
    pathSelectedNodeIds: [],
    selectedNodeId: null,
    tourDismissed: false,
    tourStep: null,
  },
  library: {
    activeSurface: 'home',
    filterQuery: '',
    homeMemoryFilter: 'all',
    homeReviewFilter: 'all',
    homeOrganizerLens: 'collections',
    homeOrganizerVisible: true,
    homeSortDirection: 'desc',
    homeSortMode: 'updated',
    homeViewMode: 'board',
    selectedDocumentId: null,
  },
  notes: {
    searchQuery: '',
    selectedDocumentId: null,
    selectedNoteId: null,
  },
  study: {
    activeCardId: null,
    collectionFilter: 'all',
    difficultyFilter: 'all',
    filter: 'all',
    knowledgeStageFilter: 'all',
    progressPeriodDays: 14,
    questionSearchQuery: '',
    reviewHistoryFilter: 'all',
    scheduleDrilldown: 'all',
    sourceScopeDocumentId: null,
  },
  sourceWorkspace: {
    activeDocumentId: null,
    activeTab: 'overview',
    memorySearchFocusToken: null,
    memorySearchQuery: '',
    mode: 'browse',
    readerAnchor: null,
  },
}

export function shouldOpenRecallBrowseDrawerByDefault(section: RecallSection, hasFocusedTarget = false) {
  if (hasFocusedTarget) {
    return false
  }
  return section === 'library' || section === 'graph' || section === 'notes'
}


export function parseAppRoute(locationLike: Pick<Location, 'pathname' | 'search'>): AppRoute {
  const pathname = locationLike.pathname.replace(/\/+$/, '') || '/'
  const searchParams = new URLSearchParams(locationLike.search)
  const documentId = searchParams.get('document')
  const recallSection = parseRecallSection(searchParams.get('section'))
  const queueScope = parseReaderQueueScope(searchParams.get('queueScope'))
  const queueCollectionId = searchParams.get('queueCollectionId')
  const queueState = parseReaderQueueState(searchParams.get('queueState'))
  const sentenceStart = parseRouteSentenceIndex(searchParams.get('sentenceStart'))
  const sentenceEnd = parseRouteSentenceIndex(searchParams.get('sentenceEnd'))
  if (pathname === '/reader') {
    return {
      path: 'reader',
      documentId,
      queueCollectionId,
      queueScope,
      queueState,
      recallSection,
      sentenceStart,
      sentenceEnd: sentenceEnd ?? sentenceStart,
    }
  }
  return {
    path: 'recall',
    documentId: null,
    queueCollectionId: null,
    queueScope: null,
    queueState: null,
    recallSection,
    sentenceStart: null,
    sentenceEnd: null,
  }
}


export function buildAppHref(
  path: AppSection,
  documentId?: string | null,
  options?: {
    queueCollectionId?: string | null
    queueScope?: RecallReaderQueueScope | null
    queueState?: RecallReaderQueueState | null
    recallSection?: RecallSection | null
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
    if (options?.queueScope) {
      search.set('queueScope', options.queueScope)
    }
    if (options?.queueCollectionId) {
      search.set('queueCollectionId', options.queueCollectionId)
    }
    if (options?.queueState && options.queueState !== 'all') {
      search.set('queueState', options.queueState)
    }
    return `/reader?${search.toString()}`
  }
  if (path === 'recall' && options?.recallSection && options.recallSection !== 'library') {
    const search = new URLSearchParams({ section: options.recallSection })
    return `/recall?${search.toString()}`
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

function parseRecallSection(value: string | null): RecallSection {
  if (value === 'graph' || value === 'study' || value === 'notes') {
    return value
  }
  return 'library'
}

function parseReaderQueueScope(value: string | null): RecallReaderQueueScope | null {
  if (value === 'all' || value === 'web' || value === 'documents' || value === 'captures' || value === 'untagged') {
    return value
  }
  return null
}

function parseReaderQueueState(value: string | null): RecallReaderQueueState | null {
  if (value === 'all' || value === 'unread' || value === 'in_progress' || value === 'completed') {
    return value
  }
  return null
}
