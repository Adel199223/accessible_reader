import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'

import {
  buildRecallExportUrl,
  deleteRecallNote,
  decideRecallGraphEdge,
  decideRecallGraphNode,
  fetchRecallNotes,
  fetchRecallDocument,
  fetchRecallDocuments,
  fetchRecallGraph,
  fetchRecallGraphNode,
  fetchRecallStudyCards,
  fetchRecallStudyOverview,
  generateRecallStudyCards,
  promoteRecallNoteToGraphNode,
  promoteRecallNoteToStudyCard,
  searchRecallNotes,
  reviewRecallStudyCard,
  updateRecallNote,
} from '../api'
import type {
  ReaderAnchorRange,
  RecallSection,
  SourceWorkspaceTab,
  WorkspaceDockAction,
  WorkspaceDockContext,
  RecallStudyFilter,
  RecallWorkspaceContinuityState,
  RecallWorkspaceFocusRequest,
} from '../lib/appRoute'
import type {
  KnowledgeEdgeRecord,
  KnowledgeGraphSnapshot,
  KnowledgeNodeDetail,
  KnowledgeNodeRecord,
  RecallDocumentRecord,
  RecallNoteGraphPromotionRequest,
  RecallNoteRecord,
  RecallNoteSearchHit,
  ReaderSettings,
  StudyCardRecord,
  StudyCardStatus,
  RecallNoteStudyPromotionRequest,
  StudyOverview,
  StudyReviewRating,
  ViewMode,
} from '../types'
import type { WorkspaceHeroProps } from './WorkspaceHero'
import { FocusedSourceReaderPane } from './FocusedSourceReaderPane'
import type { SourceWorkspaceFrameState } from './SourceWorkspaceFrame'


interface RecallWorkspaceProps {
  continuityState: RecallWorkspaceContinuityState
  focusRequest?: RecallWorkspaceFocusRequest | null
  onContinuityStateChange: Dispatch<SetStateAction<RecallWorkspaceContinuityState>>
  onShellContextChange: (context: WorkspaceDockContext | null) => void
  onSectionChange: (section: RecallSection) => void
  onShellHeroChange: (hero: WorkspaceHeroProps) => void
  onRequestNewSource: () => void
  onShellSourceWorkspaceChange: (workspace: SourceWorkspaceFrameState | null) => void
  onOpenReader: (
    documentId: string,
    options?: {
      sentenceEnd?: number | null
      sentenceStart?: number | null
    },
  ) => void
  settings: ReaderSettings
  section: RecallSection
}
type LoadState = 'idle' | 'loading' | 'success' | 'error'


function formatModeLabel(mode: string) {
  return mode.slice(0, 1).toUpperCase() + mode.slice(1)
}

function formatSourceWorkspaceTabLabel(tab: SourceWorkspaceTab) {
  if (tab === 'overview') {
    return 'Overview'
  }
  return tab.slice(0, 1).toUpperCase() + tab.slice(1)
}


function formatRelationLabel(relationType: string) {
  return relationType.replace(/_/g, ' ')
}


function formatStudyStatus(status: StudyCardStatus) {
  return status.slice(0, 1).toUpperCase() + status.slice(1)
}

function formatCountLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`
}

function formatSentenceSpanLabel(start: number | null | undefined, end: number | null | undefined) {
  if (start === null || start === undefined || end === null || end === undefined) {
    return 'Anchored passage'
  }
  const sentenceCount = end - start + 1
  return `${sentenceCount} ${sentenceCount === 1 ? 'anchored sentence' : 'anchored sentences'}`
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function upsertNoteRecord<T extends RecallNoteRecord | RecallNoteSearchHit>(items: T[], updatedNote: RecallNoteRecord) {
  return items.map((item) => (item.id === updatedNote.id ? { ...item, ...updatedNote } : item))
}

function removeNoteRecord<T extends { id: string }>(items: T[], noteId: string) {
  return items.filter((item) => item.id !== noteId)
}

function buildReaderAnchorOptions(note: RecallNoteRecord | RecallNoteSearchHit) {
  return {
    sentenceEnd: note.anchor.global_sentence_end ?? note.anchor.sentence_end,
    sentenceStart: note.anchor.global_sentence_start ?? note.anchor.sentence_start,
  }
}

function getNoteDocumentTitle(
  note: RecallNoteRecord | RecallNoteSearchHit,
  documentTitleById: Map<string, string>,
  fallbackTitle?: string | null,
) {
  const documentTitle = documentTitleById.get(note.anchor.source_document_id)
  if (documentTitle) {
    return documentTitle
  }
  return 'document_title' in note ? note.document_title : fallbackTitle ?? 'Saved note'
}

function getDocumentSourcePreview(document: RecallDocumentRecord) {
  return document.source_locator || document.file_name || 'Local paste'
}

interface LibraryBrowseSection {
  description: string
  documents: RecallDocumentRecord[]
  key: 'today' | 'this-week' | 'earlier'
  label: string
}

interface GraphCanvasNodeLayout {
  emphasis: 'ambient' | 'focus' | 'linked'
  node: KnowledgeNodeRecord
  x: number
  y: number
}

interface GraphCanvasLayout {
  edges: KnowledgeEdgeRecord[]
  focusNodeId: string | null
  nodes: GraphCanvasNodeLayout[]
}

function getLibrarySectionDisplayLimit(sectionKey: LibraryBrowseSection['key']) {
  if (sectionKey === 'today') {
    return 3
  }
  if (sectionKey === 'this-week') {
    return 5
  }
  return 6
}

function getHomeWorkspaceSectionDisplayLimit(sectionKey: LibraryBrowseSection['key']) {
  if (sectionKey === 'today') {
    return 3
  }
  if (sectionKey === 'this-week') {
    return 3
  }
  return 4
}

function getFeaturedLibraryVisibleDisplayLimit(
  sectionKey: LibraryBrowseSection['key'],
  compactMergedHomeLead = false,
) {
  const baseLimit = getLibrarySectionDisplayLimit(sectionKey)
  if (!compactMergedHomeLead) {
    return baseLimit + 1
  }
  if (sectionKey === 'earlier') {
    return baseLimit + 1
  }
  if (sectionKey === 'this-week') {
    return baseLimit + 1
  }
  return baseLimit + 1
}

function buildLibraryBrowseSections(documents: RecallDocumentRecord[], now: Date = new Date()): LibraryBrowseSection[] {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const mondayOffset = (now.getDay() + 6) % 7
  const startOfWeek = startOfToday - mondayOffset * 24 * 60 * 60 * 1000

  const sections: LibraryBrowseSection[] = [
    { key: 'today', label: 'Today', description: 'Most recently touched sources.', documents: [] },
    { key: 'this-week', label: 'This week', description: 'Recent sources still close at hand.', documents: [] },
    { key: 'earlier', label: 'Earlier', description: 'Older saved sources still ready to reopen.', documents: [] },
  ]

  for (const document of documents) {
    const updatedAt = new Date(document.updated_at).getTime()
    if (!Number.isFinite(updatedAt)) {
      sections[2].documents.push(document)
      continue
    }

    if (updatedAt >= startOfToday) {
      sections[0].documents.push(document)
      continue
    }

    if (updatedAt >= startOfWeek) {
      sections[1].documents.push(document)
      continue
    }

    sections[2].documents.push(document)
  }

  return sections.filter((section) => section.documents.length > 0)
}

function getGraphNodePreview(node: KnowledgeNodeRecord) {
  const description = node.description?.trim()
  if (description) {
    return description
  }
  return `${formatCountLabel(node.mention_count, 'mention', 'mentions')} across ${formatCountLabel(node.document_count, 'source document', 'source documents')}.`
}

function getGraphEdgeCounterpartLabel(edge: KnowledgeEdgeRecord, nodeId: string) {
  return edge.source_id === nodeId ? edge.target_label : edge.source_label
}

function sortGraphNodesForBrowse(
  nodes: KnowledgeNodeRecord[],
  selectedNodeId: string | null,
  activeSourceDocumentId: string | null,
) {
  return [...nodes].sort((left, right) => {
    const leftSelected = left.id === selectedNodeId ? 1 : 0
    const rightSelected = right.id === selectedNodeId ? 1 : 0
    if (leftSelected !== rightSelected) {
      return rightSelected - leftSelected
    }

    const leftActiveSource = activeSourceDocumentId && left.source_document_ids.includes(activeSourceDocumentId) ? 1 : 0
    const rightActiveSource = activeSourceDocumentId && right.source_document_ids.includes(activeSourceDocumentId) ? 1 : 0
    if (leftActiveSource !== rightActiveSource) {
      return rightActiveSource - leftActiveSource
    }

    if (left.mention_count !== right.mention_count) {
      return right.mention_count - left.mention_count
    }

    if (left.document_count !== right.document_count) {
      return right.document_count - left.document_count
    }

    if (left.confidence !== right.confidence) {
      return right.confidence - left.confidence
    }

    return left.label.localeCompare(right.label)
  })
}

function placeGraphOrbit(nodes: KnowledgeNodeRecord[], emphasis: GraphCanvasNodeLayout['emphasis'], radiusX: number, radiusY: number) {
  if (!nodes.length) {
    return []
  }

  return nodes.map<GraphCanvasNodeLayout>((node, index) => {
    const angle = (-Math.PI / 2) + (index * (2 * Math.PI)) / nodes.length
    return {
      emphasis,
      node,
      x: 50 + Math.cos(angle) * radiusX,
      y: 52 + Math.sin(angle) * radiusY,
    }
  })
}

function buildGraphCanvasLayout(
  nodes: KnowledgeNodeRecord[],
  edges: KnowledgeEdgeRecord[],
  selectedNodeId: string | null,
  activeSourceDocumentId: string | null,
): GraphCanvasLayout {
  if (!nodes.length) {
    return {
      edges: [],
      focusNodeId: null,
      nodes: [],
    }
  }

  const orderedNodes = sortGraphNodesForBrowse(nodes, selectedNodeId, activeSourceDocumentId)
  const visibleNodes = orderedNodes.slice(0, 11)
  const focusNode = visibleNodes.find((node) => node.id === selectedNodeId) ?? visibleNodes[0]
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id))
  const visibleEdges = edges.filter((edge) => visibleNodeIds.has(edge.source_id) && visibleNodeIds.has(edge.target_id))
  const directlyConnectedNodeIds = new Set(
    visibleEdges.flatMap((edge) => {
      if (edge.source_id === focusNode.id) {
        return [edge.target_id]
      }
      if (edge.target_id === focusNode.id) {
        return [edge.source_id]
      }
      return []
    }),
  )

  const orbitNodes = visibleNodes.filter((node) => node.id !== focusNode.id)
  const linkedNodes = orbitNodes.filter((node) => directlyConnectedNodeIds.has(node.id)).slice(0, 5)
  const ambientNodes = orbitNodes.filter((node) => !directlyConnectedNodeIds.has(node.id))

  return {
    edges: visibleEdges,
    focusNodeId: focusNode.id,
    nodes: [
      {
        emphasis: 'focus',
        node: focusNode,
        x: 50,
        y: 52,
      },
      ...placeGraphOrbit(linkedNodes, 'linked', 28, 22),
      ...placeGraphOrbit(ambientNodes, 'ambient', 42, 34),
    ],
  }
}

function getNoteRowPreview(note: RecallNoteRecord | RecallNoteSearchHit) {
  const trimmedBody = note.body_text?.trim()
  if (trimmedBody) {
    return trimmedBody
  }
  return note.anchor.excerpt_text
}

function getRecordStringValue(record: Record<string, unknown>, key: string) {
  const value = record[key]
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function getRecordNumberValue(record: Record<string, unknown>, key: string) {
  const value = record[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function getStudyCardPreview(card: StudyCardRecord) {
  const promotedFromNote = card.source_spans.some((span) => Boolean(getRecordStringValue(span, 'note_id')))
  if (promotedFromNote) {
    return `Promoted from a saved note in ${card.document_title}.`
  }
  return `Grounded in saved source evidence from ${card.document_title}.`
}

function buildStudyQueuePreview(cards: StudyCardRecord[], activeCardId: string | null, limit: number) {
  if (cards.length <= limit) {
    return cards
  }
  const preview = cards.slice(0, limit)
  if (!activeCardId || preview.some((card) => card.id === activeCardId)) {
    return preview
  }
  const activeCard = cards.find((card) => card.id === activeCardId)
  if (!activeCard) {
    return preview
  }
  return [activeCard, ...preview.slice(0, Math.max(0, limit - 1))]
}

function getStudyEvidenceLabel(sourceSpan: Record<string, unknown>) {
  if (getRecordStringValue(sourceSpan, 'note_id')) {
    return 'Saved note'
  }
  if (getRecordStringValue(sourceSpan, 'edge_id')) {
    return 'Graph relation'
  }
  if (getRecordStringValue(sourceSpan, 'chunk_id')) {
    return 'Source chunk'
  }
  return 'Source evidence'
}

function getStudyEvidenceExcerpt(sourceSpan: Record<string, unknown>) {
  return getRecordStringValue(sourceSpan, 'excerpt') ?? getRecordStringValue(sourceSpan, 'anchor_text') ?? 'No excerpt saved.'
}

function buildOpenReaderLabel(documentTitle: string) {
  return `Open ${documentTitle} in Reader`
}

function buildShowReaderLabel(documentTitle: string) {
  return `Show ${documentTitle} in Reader`
}

function buildAnchorTextCandidates(...values: Array<string | null | undefined>) {
  const seen = new Set<string>()
  const candidates: string[] = []
  for (const value of values) {
    const trimmed = value?.trim()
    if (!trimmed || seen.has(trimmed)) {
      continue
    }
    seen.add(trimmed)
    candidates.push(trimmed)
  }
  return candidates
}

function mapRecallSectionToSourceTab(section: RecallSection): SourceWorkspaceTab {
  if (section === 'library') {
    return 'overview'
  }
  return section
}

function buildReaderOptionsFromSourceSpan(sourceSpan?: Record<string, unknown>) {
  if (!sourceSpan) {
    return undefined
  }
  const sentenceStart =
    getRecordNumberValue(sourceSpan, 'global_sentence_start') ?? getRecordNumberValue(sourceSpan, 'sentence_start')
  const sentenceEnd =
    getRecordNumberValue(sourceSpan, 'global_sentence_end') ?? getRecordNumberValue(sourceSpan, 'sentence_end')
  if (sentenceStart === null || sentenceStart === undefined || sentenceEnd === null || sentenceEnd === undefined) {
    return undefined
  }
  return {
    sentenceEnd,
    sentenceStart,
  }
}

function areReaderAnchorsEqual(left: ReaderAnchorRange | null | undefined, right: ReaderAnchorRange | null | undefined) {
  if (!left && !right) {
    return true
  }
  if (!left || !right) {
    return false
  }
  return left.sentenceStart === right.sentenceStart && left.sentenceEnd === right.sentenceEnd
}

function buildReaderAnchorRangeFromNote(note: RecallNoteRecord | RecallNoteSearchHit): ReaderAnchorRange {
  return {
    sentenceEnd: note.anchor.global_sentence_end ?? note.anchor.sentence_end,
    sentenceStart: note.anchor.global_sentence_start ?? note.anchor.sentence_start,
  }
}

function buildReaderAnchorRangeFromSourceSpan(sourceSpan?: Record<string, unknown>): ReaderAnchorRange | null {
  if (!sourceSpan) {
    return null
  }
  const readerOptions = buildReaderOptionsFromSourceSpan(sourceSpan)
  if (!readerOptions) {
    return null
  }
  return readerOptions
}


export function RecallWorkspace({
  continuityState,
  focusRequest = null,
  onContinuityStateChange,
  onShellContextChange,
  onOpenReader,
  onSectionChange,
  onShellHeroChange,
  onShellSourceWorkspaceChange,
  settings,
  section,
}: RecallWorkspaceProps) {
  const [documents, setDocuments] = useState<RecallDocumentRecord[]>([])
  const [selectedDocument, setSelectedDocument] = useState<RecallDocumentRecord | null>(null)
  const [sourceWorkspaceDocument, setSourceWorkspaceDocument] = useState<RecallDocumentRecord | null>(null)
  const [documentsStatus, setDocumentsStatus] = useState<LoadState>('loading')
  const [documentsError, setDocumentsError] = useState<string | null>(null)
  const [detailStatus, setDetailStatus] = useState<LoadState>('idle')
  const [detailError, setDetailError] = useState<string | null>(null)
  const [sourceWorkspaceStatus, setSourceWorkspaceStatus] = useState<LoadState>('idle')
  const [graphSnapshot, setGraphSnapshot] = useState<KnowledgeGraphSnapshot | null>(null)
  const [graphStatus, setGraphStatus] = useState<LoadState>('loading')
  const [graphError, setGraphError] = useState<string | null>(null)
  const [graphBusyKey, setGraphBusyKey] = useState<string | null>(null)
  const [graphFilterQuery, setGraphFilterQuery] = useState('')
  const [selectedNodeDetail, setSelectedNodeDetail] = useState<KnowledgeNodeDetail | null>(null)
  const [nodeDetailLoading, setNodeDetailLoading] = useState(false)
  const [graphDetailPeekOpen, setGraphDetailPeekOpen] = useState(false)
  const [graphDetailMentionsExpanded, setGraphDetailMentionsExpanded] = useState(false)
  const [graphDetailRelationsExpanded, setGraphDetailRelationsExpanded] = useState(false)
  const [studyOverview, setStudyOverview] = useState<StudyOverview | null>(null)
  const [studyCards, setStudyCards] = useState<StudyCardRecord[]>([])
  const [studyStatus, setStudyStatus] = useState<LoadState>('loading')
  const [studyError, setStudyError] = useState<string | null>(null)
  const [studyBusyKey, setStudyBusyKey] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studyEvidencePeekOpen, setStudyEvidencePeekOpen] = useState(false)
  const [studyMessage, setStudyMessage] = useState<string | null>(null)
  const [documentNotes, setDocumentNotes] = useState<RecallNoteRecord[]>([])
  const [sourceWorkspaceNotes, setSourceWorkspaceNotes] = useState<RecallNoteRecord[]>([])
  const [sourceWorkspaceNotesStatus, setSourceWorkspaceNotesStatus] = useState<LoadState>('idle')
  const [selectedDocumentNoteCount, setSelectedDocumentNoteCount] = useState<number | null>(null)
  const [selectedDocumentNoteCountStatus, setSelectedDocumentNoteCountStatus] = useState<LoadState>('idle')
  const [notesStatus, setNotesStatus] = useState<LoadState>('idle')
  const [notesError, setNotesError] = useState<string | null>(null)
  const [noteSearchResults, setNoteSearchResults] = useState<RecallNoteSearchHit[]>([])
  const [noteSearchStatus, setNoteSearchStatus] = useState<LoadState>('idle')
  const [noteSearchError, setNoteSearchError] = useState<string | null>(null)
  const [noteDraftBody, setNoteDraftBody] = useState('')
  const [notePromotionMode, setNotePromotionMode] = useState<'graph' | 'study' | null>(null)
  const [noteGraphDraft, setNoteGraphDraft] = useState<RecallNoteGraphPromotionRequest>({
    label: '',
    description: '',
  })
  const [noteStudyDraft, setNoteStudyDraft] = useState<RecallNoteStudyPromotionRequest>({
    prompt: '',
    answer: '',
  })
  const [noteBusyKey, setNoteBusyKey] = useState<string | null>(null)
  const [notesMessage, setNotesMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [focusedReaderMode, setFocusedReaderMode] = useState<ViewMode>('reflowed')
  const [focusedGraphEvidenceKey, setFocusedGraphEvidenceKey] = useState<string | null>(null)
  const [focusedStudySourceSpanIndex, setFocusedStudySourceSpanIndex] = useState(0)
  const [studyQueueExpanded, setStudyQueueExpanded] = useState(false)
  const [expandedLibrarySectionKeys, setExpandedLibrarySectionKeys] = useState<Record<LibraryBrowseSection['key'], boolean>>({
    today: false,
    'this-week': false,
    earlier: false,
  })
  const previousActiveSourceDocumentIdRef = useRef<string | null>(null)
  const libraryFilterQuery = continuityState.library.filterQuery
  const selectedLibraryDocumentId = continuityState.library.selectedDocumentId
  const selectedNodeId = continuityState.graph.selectedNodeId
  const studyFilter = continuityState.study.filter
  const activeCardId = continuityState.study.activeCardId
  const selectedNotesDocumentId = continuityState.notes.selectedDocumentId
  const noteSearchQuery = continuityState.notes.searchQuery
  const selectedNoteId = continuityState.notes.selectedNoteId
  const activeSourceDocumentId = continuityState.sourceWorkspace.activeDocumentId
  const activeSourceTab = continuityState.sourceWorkspace.activeTab
  const activeSourceMode = continuityState.sourceWorkspace.mode
  const activeSourceReaderAnchor = continuityState.sourceWorkspace.readerAnchor
  const libraryBrowseDrawerOpen = continuityState.browseDrawers.library
  const graphBrowseDrawerOpen = continuityState.browseDrawers.graph
  const notesBrowseDrawerOpen = continuityState.browseDrawers.notes
  const studyBrowseDrawerOpen = continuityState.browseDrawers.study
  const sourceWorkspaceFocused = activeSourceMode === 'focused'
  const showFocusedLibraryOverview = section === 'library' && sourceWorkspaceFocused && Boolean(activeSourceDocumentId)
  const showFocusedNotesSplitView =
    section === 'notes' && sourceWorkspaceFocused && !notesBrowseDrawerOpen && Boolean(activeSourceDocumentId)
  const showFocusedGraphSplitView =
    section === 'graph' && sourceWorkspaceFocused && !graphBrowseDrawerOpen && Boolean(activeSourceDocumentId)
  const showFocusedStudySplitView =
    section === 'study' && sourceWorkspaceFocused && !studyBrowseDrawerOpen && Boolean(activeSourceDocumentId)
  const deferredLibraryFilter = useDeferredValue(libraryFilterQuery)
  const deferredGraphFilter = useDeferredValue(graphFilterQuery)
  const deferredNoteSearch = useDeferredValue(noteSearchQuery)

  const updateContinuityState = useCallback((updater: (current: RecallWorkspaceContinuityState) => RecallWorkspaceContinuityState) => {
    onContinuityStateChange(updater)
  }, [onContinuityStateChange])

  const updateLibraryState = useCallback((updater: (current: RecallWorkspaceContinuityState['library']) => RecallWorkspaceContinuityState['library']) => {
    updateContinuityState((current) => ({
      ...current,
      library: updater(current.library),
    }))
  }, [updateContinuityState])

  const updateGraphState = useCallback((updater: (current: RecallWorkspaceContinuityState['graph']) => RecallWorkspaceContinuityState['graph']) => {
    updateContinuityState((current) => ({
      ...current,
      graph: updater(current.graph),
    }))
  }, [updateContinuityState])

  const updateStudyState = useCallback((updater: (current: RecallWorkspaceContinuityState['study']) => RecallWorkspaceContinuityState['study']) => {
    updateContinuityState((current) => ({
      ...current,
      study: updater(current.study),
    }))
  }, [updateContinuityState])

  const updateNotesState = useCallback((updater: (current: RecallWorkspaceContinuityState['notes']) => RecallWorkspaceContinuityState['notes']) => {
    updateContinuityState((current) => ({
      ...current,
      notes: updater(current.notes),
    }))
  }, [updateContinuityState])

  const updateSourceWorkspaceState = useCallback((updater: (current: RecallWorkspaceContinuityState['sourceWorkspace']) => RecallWorkspaceContinuityState['sourceWorkspace']) => {
    updateContinuityState((current) => ({
      ...current,
      sourceWorkspace: updater(current.sourceWorkspace),
    }))
  }, [updateContinuityState])

  const setSourceWorkspaceReaderAnchor = useCallback((nextAnchor: ReaderAnchorRange | null) => {
    updateSourceWorkspaceState((current) =>
      areReaderAnchorsEqual(current.readerAnchor, nextAnchor)
        ? current
        : {
            ...current,
            readerAnchor: nextAnchor,
          },
    )
  }, [updateSourceWorkspaceState])

  const updateBrowseDrawersState = useCallback((updater: (current: RecallWorkspaceContinuityState['browseDrawers']) => RecallWorkspaceContinuityState['browseDrawers']) => {
    updateContinuityState((current) => ({
      ...current,
      browseDrawers: updater(current.browseDrawers),
    }))
  }, [updateContinuityState])

  const setBrowseDrawerOpen = useCallback((targetSection: RecallSection, open: boolean) => {
    updateBrowseDrawersState((current) => ({
      ...current,
      [targetSection]: open,
    }))
  }, [updateBrowseDrawersState])

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
      }),
    [],
  )

  const homeDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
        month: 'short',
      }),
    [],
  )

  const activeStudyCard = studyCards.find((card) => card.id === activeCardId) ?? studyCards[0] ?? null
  const documentTitleById = useMemo(() => new Map(documents.map((document) => [document.id, document.title])), [documents])
  const visibleDocuments = useMemo(() => {
    const normalized = deferredLibraryFilter.trim().toLowerCase()
    const filtered = !normalized
      ? documents
      : documents.filter((document) =>
          [document.title, document.source_type, document.source_locator ?? '', document.file_name ?? '']
            .join(' ')
            .toLowerCase()
            .includes(normalized),
        )
    return [...filtered].sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime())
  }, [deferredLibraryFilter, documents])
  const libraryFilterActive = deferredLibraryFilter.trim().length > 0
  const libraryBrowseSections = useMemo(
    () => (libraryFilterActive ? [] : buildLibraryBrowseSections(visibleDocuments)),
    [libraryFilterActive, visibleDocuments],
  )
  const featuredLibrarySection = libraryBrowseSections[0] ?? null
  const compactMergedHomeLeadSection = !libraryFilterActive && !activeSourceDocumentId && !!featuredLibrarySection
  const featuredLibrarySectionDisplayLimit = featuredLibrarySection
    ? getFeaturedLibraryVisibleDisplayLimit(featuredLibrarySection.key, compactMergedHomeLeadSection)
    : 0
  const secondaryLibrarySections = libraryBrowseSections.slice(1)
  const showingNoteSearch = deferredNoteSearch.trim().length > 0
  const visibleNotes = showingNoteSearch ? noteSearchResults : documentNotes
  const activeNote =
    visibleNotes.find((note) => note.id === selectedNoteId) ??
    documentNotes.find((note) => note.id === selectedNoteId) ??
    noteSearchResults.find((note) => note.id === selectedNoteId) ??
    visibleNotes[0] ??
    null
  const showFocusedNotesEmptyDetailLane = showFocusedNotesSplitView && !activeNote
  const showFocusedNotesDrawerOpenEmptyState =
    section === 'notes' &&
    sourceWorkspaceFocused &&
    notesBrowseDrawerOpen &&
    !activeNote &&
    documentsStatus !== 'error' &&
    notesStatus !== 'loading' &&
    noteSearchStatus !== 'loading' &&
    visibleNotes.length === 0 &&
    !(showingNoteSearch ? noteSearchStatus === 'error' : notesStatus === 'error')
  const showFocusedNotesDrawerOpenEmptyDetailPanel = showFocusedNotesDrawerOpenEmptyState
  const activeNoteId = activeNote?.id ?? null
  const activeNoteAnchorText = activeNote?.anchor.anchor_text ?? ''
  const activeNoteBodyText = activeNote?.body_text ?? ''
  const activeSourceGraphNodes = useMemo(
    () =>
      activeSourceDocumentId && graphSnapshot
        ? graphSnapshot.nodes.filter((node) => node.source_document_ids.includes(activeSourceDocumentId))
        : [],
    [activeSourceDocumentId, graphSnapshot],
  )
  const activeSourceStudyCards = useMemo(
    () =>
      activeSourceDocumentId
        ? studyCards.filter((card) => card.source_document_id === activeSourceDocumentId)
        : [],
    [activeSourceDocumentId, studyCards],
  )
  const visibleStudyQueueCards = useMemo(
    () =>
      showFocusedStudySplitView || studyQueueExpanded || studyStatus === 'error'
        ? studyCards
        : buildStudyQueuePreview(studyCards, activeStudyCard?.id ?? null, 4),
    [activeStudyCard?.id, showFocusedStudySplitView, studyCards, studyQueueExpanded, studyStatus],
  )
  const hiddenStudyQueueCount = Math.max(0, studyCards.length - visibleStudyQueueCards.length)
  const showStudySidebar =
    showFocusedStudySplitView || studyBrowseDrawerOpen || studyStatus === 'error'
  const sourceWorkspaceNoteCountLabel =
    sourceWorkspaceNotesStatus === 'loading'
      ? 'Loading notes…'
      : sourceWorkspaceNotesStatus === 'error'
        ? 'Notes unavailable'
        : sourceWorkspaceNotes.length === 1
          ? '1 saved note'
          : `${sourceWorkspaceNotes.length} saved notes`
  const selectedDocumentNoteCountLabel =
    selectedDocumentNoteCountStatus === 'loading'
      ? 'Loading notes…'
      : selectedDocumentNoteCountStatus === 'error'
        ? 'Notes unavailable'
        : selectedDocumentNoteCount === 1
          ? '1 note'
          : `${selectedDocumentNoteCount ?? 0} notes`
  const selectedNotesDocumentTitle =
    (selectedNotesDocumentId ? documentTitleById.get(selectedNotesDocumentId) : null) ?? selectedDocument?.title ?? null
  const selectedNotesCountLabel =
    notesStatus === 'loading'
      ? 'Loading notes…'
      : notesStatus === 'error'
        ? 'Notes unavailable'
        : showingNoteSearch
          ? visibleNotes.length === 1
            ? '1 matching note'
            : `${visibleNotes.length} matching notes`
          : documentNotes.length === 1
            ? '1 saved note'
            : `${documentNotes.length} saved notes`
  const selectedNodeEdges = useMemo(
    () => (selectedNodeDetail ? [...selectedNodeDetail.outgoing_edges, ...selectedNodeDetail.incoming_edges] : []),
    [selectedNodeDetail],
  )
  const filteredGraphNodes = useMemo(() => {
    const normalized = deferredGraphFilter.trim().toLowerCase()
    const nodes = graphSnapshot?.nodes ?? []
    const filtered = !normalized
      ? nodes
      : nodes.filter((node) =>
          [node.label, node.node_type, node.description ?? '', node.aliases.join(' ')]
            .join(' ')
            .toLowerCase()
            .includes(normalized),
        )
    return sortGraphNodesForBrowse(filtered, selectedNodeId, activeSourceDocumentId)
  }, [activeSourceDocumentId, deferredGraphFilter, graphSnapshot?.nodes, selectedNodeId])
  const graphCanvasLayout = useMemo(
    () => buildGraphCanvasLayout(filteredGraphNodes, graphSnapshot?.edges ?? [], selectedNodeId, activeSourceDocumentId),
    [activeSourceDocumentId, filteredGraphNodes, graphSnapshot?.edges, selectedNodeId],
  )
  const graphCanvasNodes = graphCanvasLayout.nodes
  const graphCanvasEdges = graphCanvasLayout.edges
  const graphCanvasFocusNodeId = graphCanvasLayout.focusNodeId
  const graphFilterActive = deferredGraphFilter.trim().length > 0
  const graphQuickPickNodes = useMemo(
    () => filteredGraphNodes.slice(0, graphFilterActive ? 6 : 1),
    [filteredGraphNodes, graphFilterActive],
  )
  const graphCanvasNodePositionById = useMemo(
    () => new Map(graphCanvasNodes.map(({ node, x, y }) => [node.id, { x, y }])),
    [graphCanvasNodes],
  )

  useEffect(() => {
    setGraphDetailMentionsExpanded(false)
    setGraphDetailRelationsExpanded(false)
  }, [selectedNodeId])
  const activeStudySourceSpans = useMemo(() => activeStudyCard?.source_spans ?? [], [activeStudyCard])
  const focusedGraphEvidence = useMemo(() => {
    if (!selectedNodeDetail || !activeSourceDocumentId) {
      return null
    }

    if (focusedGraphEvidenceKey?.startsWith('edge:')) {
      const edgeId = focusedGraphEvidenceKey.slice('edge:'.length)
      const matchingEdge = selectedNodeEdges.find(
        (edge) => edge.id === edgeId && edge.source_document_ids.includes(activeSourceDocumentId),
      )
      if (matchingEdge) {
        return {
          documentId: activeSourceDocumentId,
          excerpt: matchingEdge.excerpt ?? selectedNodeDetail.node.description ?? matchingEdge.target_label,
          key: focusedGraphEvidenceKey,
        }
      }
    }

    if (focusedGraphEvidenceKey?.startsWith('mention:')) {
      const mentionId = focusedGraphEvidenceKey.slice('mention:'.length)
      const matchingMention = selectedNodeDetail.mentions.find(
        (mention) => mention.id === mentionId && mention.source_document_id === activeSourceDocumentId,
      )
      if (matchingMention) {
        return {
          documentId: activeSourceDocumentId,
          excerpt: matchingMention.excerpt,
          key: focusedGraphEvidenceKey,
        }
      }
    }

    const primaryMention = selectedNodeDetail.mentions.find(
      (mention) => mention.source_document_id === activeSourceDocumentId,
    )
    if (primaryMention) {
      return {
        documentId: activeSourceDocumentId,
        excerpt: primaryMention.excerpt,
        key: `mention:${primaryMention.id}`,
      }
    }

    const primaryEdge = selectedNodeEdges.find((edge) => edge.source_document_ids.includes(activeSourceDocumentId))
    if (!primaryEdge) {
      return null
    }
    return {
      documentId: activeSourceDocumentId,
      excerpt: primaryEdge.excerpt ?? selectedNodeDetail.node.description ?? primaryEdge.target_label,
      key: `edge:${primaryEdge.id}`,
    }
  }, [activeSourceDocumentId, focusedGraphEvidenceKey, selectedNodeDetail, selectedNodeEdges])
  const focusedStudySourceSpan = activeStudySourceSpans[focusedStudySourceSpanIndex] ?? activeStudySourceSpans[0] ?? null
  const focusedStudyEvidenceExcerpt = focusedStudySourceSpan ? getStudyEvidenceExcerpt(focusedStudySourceSpan) : ''
  const focusedStudyGroundingExcerpt =
    typeof activeStudyCard?.source_spans[0]?.excerpt === 'string' ? String(activeStudyCard.source_spans[0].excerpt) : ''
  const showFocusedStudyGroundingExcerpt =
    focusedStudyGroundingExcerpt.trim().length > 0 &&
    focusedStudyGroundingExcerpt.trim() !== focusedStudyEvidenceExcerpt.trim()
  const focusedReaderAnchorCandidates = useMemo(() => {
    if (section === 'notes' && activeNote) {
      return buildAnchorTextCandidates(activeNote.anchor.anchor_text, activeNote.anchor.excerpt_text)
    }
    if (section === 'graph' && focusedGraphEvidence) {
      return buildAnchorTextCandidates(focusedGraphEvidence.excerpt)
    }
    if (section === 'study' && focusedStudySourceSpan) {
      return buildAnchorTextCandidates(
        getRecordStringValue(focusedStudySourceSpan, 'anchor_text'),
        getRecordStringValue(focusedStudySourceSpan, 'excerpt'),
      )
    }
    return []
  }, [activeNote, focusedGraphEvidence, focusedStudySourceSpan, section])
  const sourceWorkspacePrimaryNote = sourceWorkspaceNotes[0] ?? null
  const sourceWorkspacePrimaryNode = activeSourceGraphNodes[0] ?? null
  const sourceWorkspacePrimaryStudyCard = activeSourceStudyCards[0] ?? null
  const sourceWorkspaceCounts = useMemo(
    () =>
      sourceWorkspaceDocument
        ? [
            {
              label: sourceWorkspaceNoteCountLabel,
              tone: 'muted' as const,
            },
            {
              label:
                activeSourceGraphNodes.length === 1 ? '1 graph node' : `${activeSourceGraphNodes.length} graph nodes`,
              tone: 'muted' as const,
            },
            {
              label:
                activeSourceStudyCards.length === 1 ? '1 study card' : `${activeSourceStudyCards.length} study cards`,
              tone: 'muted' as const,
            },
          ]
        : [],
    [activeSourceGraphNodes.length, activeSourceStudyCards.length, sourceWorkspaceDocument, sourceWorkspaceNoteCountLabel],
  )
  const sourceWorkspaceDescription =
    section === 'library'
      ? 'Keep one source in focus while Reader, Notes, Graph, and Study stay nearby.'
      : section === 'notes'
        ? 'Edit saved notes beside the live source.'
        : section === 'graph'
          ? 'Validate graph evidence beside the live source.'
          : 'Review study evidence beside the live source.'
  const shellContext = useMemo<WorkspaceDockContext | null>(() => {
    if (section === 'library') {
      if (!selectedDocument) {
        return null
      }

      const noteActionLabel =
        selectedDocumentNoteCount === 1 && selectedDocumentNoteCountStatus === 'success' ? 'View note' : 'View notes'

      return {
        actions: [
          {
            key: `library-reader:${selectedDocument.id}`,
            label: 'Open in Reader',
            target: {
              documentId: selectedDocument.id,
              section: 'reader',
            },
          },
          {
            key: `library-notes:${selectedDocument.id}`,
            label: noteActionLabel,
            target: {
              documentId: selectedDocument.id,
              section: 'notes',
            },
          },
        ],
        badge: 'Home',
        key: `document:${selectedDocument.id}`,
        meta: getDocumentSourcePreview(selectedDocument),
        recentItem: {
          badge: 'Source',
          key: `document:${selectedDocument.id}`,
          subtitle: getDocumentSourcePreview(selectedDocument),
          target: {
            documentId: selectedDocument.id,
            section: 'library',
          },
          title: selectedDocument.title,
        },
        section: 'library',
        subtitle: `${selectedDocument.source_type.toUpperCase()} source · ${selectedDocumentNoteCountLabel}`,
        title: selectedDocument.title,
      }
    }

    if (section === 'notes') {
      if (activeNote) {
        const noteDocumentTitle = getNoteDocumentTitle(activeNote, documentTitleById, selectedNotesDocumentTitle)
        return {
          actions: [
            {
              key: `notes-reader:${activeNote.id}`,
              label: 'Open in Reader',
              target: {
                documentId: activeNote.anchor.source_document_id,
                section: 'reader',
                sentenceEnd: activeNote.anchor.global_sentence_end ?? activeNote.anchor.sentence_end,
                sentenceStart: activeNote.anchor.global_sentence_start ?? activeNote.anchor.sentence_start,
              },
            },
            {
              key: `notes-source:${activeNote.id}`,
              label: 'Source',
              target: {
                documentId: activeNote.anchor.source_document_id,
                section: 'library',
              },
            },
          ],
          badge: 'Notes',
          key: `note:${activeNote.id}`,
          meta: activeNote.body_text?.trim() || activeNote.anchor.excerpt_text,
          recentItem: {
            badge: 'Note',
            key: `note:${activeNote.id}`,
            subtitle: noteDocumentTitle,
            target: {
              documentId: activeNote.anchor.source_document_id,
              noteId: activeNote.id,
              section: 'notes',
            },
            title: activeNote.anchor.anchor_text,
          },
          section: 'notes',
          subtitle: `${noteDocumentTitle} · ${formatSentenceSpanLabel(
            activeNote.anchor.global_sentence_start ?? activeNote.anchor.sentence_start,
            activeNote.anchor.global_sentence_end ?? activeNote.anchor.sentence_end,
          )}`,
          title: activeNote.anchor.anchor_text,
        }
      }

      if (!selectedNotesDocumentId) {
        return null
      }

      return {
        actions: [
          {
            key: `notes-doc-source:${selectedNotesDocumentId}`,
            label: 'Open source',
            target: {
              documentId: selectedNotesDocumentId,
              section: 'library',
            },
          },
        ],
        badge: 'Notes',
        key: `notes-document:${selectedNotesDocumentId}`,
        meta:
          noteSearchQuery.trim().length > 0
            ? `Filtered by "${noteSearchQuery}".`
            : notesStatus === 'success'
              ? `${documentNotes.length} saved ${documentNotes.length === 1 ? 'note' : 'notes'} ready.`
              : 'Choose a saved note to inspect it.',
        recentItem: null,
        section: 'notes',
        subtitle: selectedNotesDocumentTitle
          ? `Saved notes for ${selectedNotesDocumentTitle}.`
          : 'Choose a document to inspect its saved notes.',
        title: selectedNotesDocumentTitle ?? 'Saved notes',
      }
    }

    if (section === 'graph') {
      if (!selectedNodeDetail) {
        return null
      }

      const primaryMention = selectedNodeDetail.mentions[0]
      const graphActions: WorkspaceDockAction[] = primaryMention
        ? [
            {
              key: `graph-source:${selectedNodeDetail.node.id}`,
              label: 'Open source',
              target: {
                documentId: primaryMention.source_document_id,
                section: 'reader',
              },
            },
            {
              key: `graph-notes:${selectedNodeDetail.node.id}`,
              label: 'View notes',
              target: {
                documentId: primaryMention.source_document_id,
                section: 'notes',
              },
            },
          ]
        : []

      return {
        actions: graphActions,
        badge: 'Graph',
        key: `node:${selectedNodeDetail.node.id}`,
        meta: primaryMention ? `${primaryMention.document_title} · ${primaryMention.excerpt}` : null,
        recentItem: {
          badge: 'Node',
          key: `node:${selectedNodeDetail.node.id}`,
          subtitle: selectedNodeDetail.node.description ?? `${formatCountLabel(selectedNodeDetail.mentions.length, 'mention', 'mentions')} in focus`,
          target: {
            nodeId: selectedNodeDetail.node.id,
            section: 'graph',
          },
          title: selectedNodeDetail.node.label,
        },
        section: 'graph',
        subtitle:
          selectedNodeDetail.node.description ??
          `${formatCountLabel(selectedNodeDetail.mentions.length, 'mention', 'mentions')} · ${formatCountLabel(
            selectedNodeDetail.outgoing_edges.length + selectedNodeDetail.incoming_edges.length,
            'linked edge',
            'linked edges',
          )}`,
        title: selectedNodeDetail.node.label,
      }
    }

    if (section === 'study') {
      if (!activeStudyCard) {
        return null
      }

      const primarySourceSpan = activeStudySourceSpans[0]
      const readerOptions = buildReaderOptionsFromSourceSpan(primarySourceSpan)
      return {
        actions: [
          {
            key: `study-reader:${activeStudyCard.id}`,
            label: 'Open in Reader',
            target: {
              documentId: activeStudyCard.source_document_id,
              section: 'reader',
              sentenceEnd: readerOptions?.sentenceEnd ?? null,
              sentenceStart: readerOptions?.sentenceStart ?? null,
            },
          },
          {
            key: `study-source:${activeStudyCard.id}`,
            label: 'Source',
            target: {
              documentId: activeStudyCard.source_document_id,
              section: 'library',
            },
          },
        ],
        badge: 'Study',
        key: `card:${activeStudyCard.id}`,
        meta: getStudyEvidenceExcerpt(primarySourceSpan),
        recentItem: {
          badge: 'Card',
          key: `card:${activeStudyCard.id}`,
          subtitle: `${activeStudyCard.document_title} · ${formatStudyStatus(activeStudyCard.status)}`,
          target: {
            cardId: activeStudyCard.id,
            section: 'study',
          },
          title: activeStudyCard.prompt,
        },
        section: 'study',
        subtitle: `${activeStudyCard.document_title} · ${formatStudyStatus(activeStudyCard.status)} card`,
        title: activeStudyCard.prompt,
      }
    }

    return null
  }, [
    activeNote,
    activeStudyCard,
    activeStudySourceSpans,
    documentNotes.length,
    documentTitleById,
    noteSearchQuery,
    notesStatus,
    section,
    selectedDocument,
    selectedDocumentNoteCount,
    selectedDocumentNoteCountLabel,
    selectedDocumentNoteCountStatus,
    selectedNodeDetail,
    selectedNotesDocumentId,
    selectedNotesDocumentTitle,
  ])

  const sourceWorkspaceDrawerSummary = useMemo(() => {
    if (!sourceWorkspaceDocument) {
      return null
    }
    return {
      source: getDocumentSourcePreview(sourceWorkspaceDocument),
      title: sourceWorkspaceDocument.title,
      updatedAt: sourceWorkspaceDocument.updated_at,
    }
  }, [sourceWorkspaceDocument])
  const resumeSourceDocument = useMemo(
    () => sourceWorkspaceDocument ?? documents.find((document) => document.id === activeSourceDocumentId) ?? null,
    [activeSourceDocumentId, documents, sourceWorkspaceDocument],
  )
  const homeExcludedDocumentId = libraryFilterActive ? null : resumeSourceDocument?.id ?? null
  const visibleFeaturedLibraryDocuments = useMemo(() => {
    if (!featuredLibrarySection) {
      return []
    }
    const featuredDocuments = featuredLibrarySection.documents.filter((document) => document.id !== homeExcludedDocumentId)
    return expandedLibrarySectionKeys[featuredLibrarySection.key]
      ? featuredDocuments
      : featuredDocuments.slice(0, featuredLibrarySectionDisplayLimit)
  }, [expandedLibrarySectionKeys, featuredLibrarySection, featuredLibrarySectionDisplayLimit, homeExcludedDocumentId])
  const homeFeaturedPrimaryDocument =
    !libraryFilterActive && !resumeSourceDocument ? visibleFeaturedLibraryDocuments[0] ?? null : null
  const homeSecondaryLibrarySections = useMemo(
    () =>
      secondaryLibrarySections
        .map((section) => ({
          ...section,
          documents: section.documents.filter((document) => document.id !== homeExcludedDocumentId),
        }))
        .filter((section) => section.documents.length > 0),
    [homeExcludedDocumentId, secondaryLibrarySections],
  )
  const homeLeadDocument = resumeSourceDocument ?? homeFeaturedPrimaryDocument
  const homeContinueDocuments = useMemo(() => {
    if (libraryFilterActive) {
      return []
    }

    const featuredDocuments = visibleFeaturedLibraryDocuments.filter(
      (document) => document.id !== (resumeSourceDocument?.id ?? null),
    )

    if (resumeSourceDocument) {
      return featuredDocuments.slice(0, 3)
    }

    return featuredDocuments.filter((document) => document.id !== (homeFeaturedPrimaryDocument?.id ?? null)).slice(0, 3)
  }, [homeFeaturedPrimaryDocument, libraryFilterActive, resumeSourceDocument, visibleFeaturedLibraryDocuments])
  const homeWorkspaceSectionCounts = useMemo(
    () =>
      libraryBrowseSections
        .map((section) => ({
          key: section.key,
          label: section.label,
          count: section.documents.filter((document) => document.id !== homeExcludedDocumentId).length,
        }))
        .filter((section) => section.count > 0),
    [homeExcludedDocumentId, libraryBrowseSections],
  )
  const homeWorkspaceLibrarySections = useMemo(() => {
    if (libraryFilterActive) {
      return []
    }

    const excludedIds = new Set<string>()
    if (homeLeadDocument) {
      excludedIds.add(homeLeadDocument.id)
    }
    for (const document of homeContinueDocuments) {
      excludedIds.add(document.id)
    }

    const sectionsToRender = [featuredLibrarySection, ...homeSecondaryLibrarySections].filter(
      (section): section is LibraryBrowseSection => Boolean(section),
    )

    return sectionsToRender
      .map((section) => ({
        ...section,
        documents: section.documents.filter((document) => document.id !== homeExcludedDocumentId && !excludedIds.has(document.id)),
      }))
      .filter((section) => section.documents.length > 0)
  }, [
    featuredLibrarySection,
    homeContinueDocuments,
    homeExcludedDocumentId,
    homeLeadDocument,
    homeSecondaryLibrarySections,
    libraryFilterActive,
  ])
  const homeStageLibrarySection = homeWorkspaceLibrarySections[0] ?? null
  const homeStageLibraryDocuments = useMemo(() => {
    if (!homeStageLibrarySection) {
      return []
    }
    return homeStageLibrarySection.documents.slice(0, 4)
  }, [homeStageLibrarySection])
  const homeRemainingLibrarySections = useMemo(() => {
    if (libraryFilterActive || homeWorkspaceLibrarySections.length === 0) {
      return []
    }
    if (!homeStageLibrarySection || homeStageLibraryDocuments.length === 0) {
      return homeWorkspaceLibrarySections
    }

    const stagedDocumentIds = new Set(homeStageLibraryDocuments.map((document) => document.id))

    return homeWorkspaceLibrarySections
      .map((section) =>
        section.key === homeStageLibrarySection.key
          ? {
              ...section,
              documents: section.documents.filter((document) => !stagedDocumentIds.has(document.id)),
            }
          : section,
      )
      .filter((section) => section.documents.length > 0)
  }, [homeStageLibraryDocuments, homeStageLibrarySection, homeWorkspaceLibrarySections, libraryFilterActive])
  const homeWorkspaceLeadLabel = resumeSourceDocument ? 'Continue where you left off' : 'Open next'
  const homeWorkspaceLeadSummary =
    documentsStatus === 'error'
      ? 'Saved sources are temporarily unavailable until the local service reconnects.'
      : resumeSourceDocument
        ? `${formatSourceWorkspaceTabLabel(activeSourceTab)} is still ready from ${getDocumentSourcePreview(resumeSourceDocument)}.`
        : 'Start from one clear source, then keep moving through the saved library without dropping into an archive wall.'
  const homeWorkspaceContinueHeading = resumeSourceDocument ? 'Continue working' : 'Pick up with one source'
  const homeWorkspaceContinueSummary = resumeSourceDocument
    ? 'Resume the exact source and tab you were using, then reopen nearby material without losing the flow.'
    : 'Open one strong next source first, then scan the denser library cards and rows around it only when you need more.'
  const homeWorkspaceLeadActionLabel = resumeSourceDocument
    ? activeSourceTab === 'reader'
      ? 'Resume Reader'
      : `Resume ${formatSourceWorkspaceTabLabel(activeSourceTab)}`
    : 'Open source'

  const loadGraph = useCallback(async () => {
    setGraphStatus('loading')
    setGraphError(null)
    try {
      const snapshot = await fetchRecallGraph()
      setGraphSnapshot(snapshot)
      updateGraphState((current) => ({
        ...current,
        selectedNodeId:
          current.selectedNodeId && snapshot.nodes.some((node) => node.id === current.selectedNodeId)
            ? current.selectedNodeId
            : snapshot.nodes[0]?.id ?? null,
      }))
    } catch (loadError) {
      setGraphSnapshot(null)
      setSelectedNodeDetail(null)
      setGraphError(getErrorMessage(loadError, 'Could not load the knowledge graph.'))
      setGraphStatus('error')
      return
    }
    setGraphStatus('success')
  }, [updateGraphState])

  const loadStudy = useCallback(async (status: RecallStudyFilter) => {
    setStudyStatus('loading')
    setStudyError(null)
    try {
      const overview = await fetchRecallStudyOverview()
      const totalStudyCards = overview.new_count + overview.due_count + overview.scheduled_count
      const cards = await fetchRecallStudyCards(status, Math.min(100, Math.max(24, totalStudyCards || 24)))
      setStudyOverview(overview)
      setStudyCards(cards)
      setStudyStatus('success')
      return cards
    } catch (loadError) {
      setStudyOverview(null)
      setStudyCards([])
      updateStudyState((current) => ({ ...current, activeCardId: null }))
      setStudyError(getErrorMessage(loadError, 'Could not load study cards.'))
      setStudyStatus('error')
      return []
    }
  }, [updateStudyState])

  const loadNotes = useCallback(async (documentId: string) => {
    setNotesStatus('loading')
    setNotesError(null)
    try {
      const loadedNotes = await fetchRecallNotes(documentId)
      setDocumentNotes(loadedNotes)
      if (documentId === selectedLibraryDocumentId) {
        setSelectedDocumentNoteCount(loadedNotes.length)
        setSelectedDocumentNoteCountStatus('success')
      }
      setNotesStatus('success')
      return loadedNotes
    } catch (loadError) {
      setDocumentNotes([])
      if (documentId === selectedLibraryDocumentId) {
        setSelectedDocumentNoteCount(null)
        setSelectedDocumentNoteCountStatus('error')
      }
      setNotesError(getErrorMessage(loadError, 'Could not load notes for that document.'))
      setNotesStatus('error')
      return []
    }
  }, [selectedLibraryDocumentId])

  useEffect(() => {
    let active = true
    setDocumentsStatus('loading')
    setDocumentsError(null)
    void fetchRecallDocuments()
      .then((loadedDocuments) => {
        if (!active) {
          return
        }
        setDocuments(loadedDocuments)
        setDocumentsStatus('success')
        updateContinuityState((current) => ({
          ...current,
          library: {
            ...current.library,
            selectedDocumentId:
              current.library.selectedDocumentId &&
              loadedDocuments.some((document) => document.id === current.library.selectedDocumentId)
                ? current.library.selectedDocumentId
                : loadedDocuments[0]?.id ?? null,
          },
          notes: {
            ...current.notes,
            selectedDocumentId:
              current.notes.selectedDocumentId &&
              loadedDocuments.some((document) => document.id === current.notes.selectedDocumentId)
                ? current.notes.selectedDocumentId
                : loadedDocuments[0]?.id ?? null,
          },
          sourceWorkspace: {
            ...current.sourceWorkspace,
            activeDocumentId:
              current.sourceWorkspace.activeDocumentId &&
              loadedDocuments.some((document) => document.id === current.sourceWorkspace.activeDocumentId)
                ? current.sourceWorkspace.activeDocumentId
                : current.sourceWorkspace.mode === 'focused' &&
                    current.library.selectedDocumentId &&
                    loadedDocuments.some((document) => document.id === current.library.selectedDocumentId)
                  ? current.library.selectedDocumentId
                  : current.sourceWorkspace.mode === 'focused' &&
                      current.notes.selectedDocumentId &&
                      loadedDocuments.some((document) => document.id === current.notes.selectedDocumentId)
                    ? current.notes.selectedDocumentId
                    : current.sourceWorkspace.mode === 'focused'
                      ? loadedDocuments[0]?.id ?? null
                      : null,
          },
        }))
      })
      .catch((loadError: Error) => {
        if (active) {
          setDocuments([])
          setSelectedDocument(null)
          setDetailStatus('idle')
          setDetailError(null)
          setDocumentsStatus('error')
          setDocumentsError(getErrorMessage(loadError, 'Could not load saved documents.'))
        }
      })

    return () => {
      active = false
    }
  }, [reloadToken, updateContinuityState])

  useEffect(() => {
    if (!selectedLibraryDocumentId) {
      setSelectedDocument(null)
      setDetailStatus('idle')
      setDetailError(null)
      return
    }

    let active = true
    setDetailStatus('loading')
    setDetailError(null)
    void fetchRecallDocument(selectedLibraryDocumentId)
      .then((document) => {
        if (active) {
          setSelectedDocument(document)
          setDetailStatus('success')
        }
      })
      .catch((loadError: Error) => {
        if (active) {
          setSelectedDocument(null)
          setDetailStatus('error')
          setDetailError(getErrorMessage(loadError, 'Could not load document detail.'))
        }
      })

    return () => {
      active = false
    }
  }, [reloadToken, selectedLibraryDocumentId])

  useEffect(() => {
    if (!activeSourceDocumentId) {
      setSourceWorkspaceDocument(null)
      setSourceWorkspaceStatus('idle')
      return
    }

    if (activeSourceDocumentId === selectedDocument?.id && detailStatus === 'success') {
      setSourceWorkspaceDocument(selectedDocument)
      setSourceWorkspaceStatus('success')
      return
    }

    let active = true
    setSourceWorkspaceStatus('loading')
    void fetchRecallDocument(activeSourceDocumentId)
      .then((document) => {
        if (!active) {
          return
        }
        setSourceWorkspaceDocument(document)
        setSourceWorkspaceStatus('success')
      })
      .catch(() => {
        if (!active) {
          return
        }
        setSourceWorkspaceDocument(documents.find((document) => document.id === activeSourceDocumentId) ?? null)
        setSourceWorkspaceStatus('error')
      })

    return () => {
      active = false
    }
  }, [activeSourceDocumentId, detailStatus, documents, selectedDocument])

  useEffect(() => {
    if (previousActiveSourceDocumentIdRef.current === activeSourceDocumentId) {
      return
    }
    previousActiveSourceDocumentIdRef.current = activeSourceDocumentId
    setFocusedGraphEvidenceKey(null)
    setFocusedStudySourceSpanIndex(0)
    if (!activeSourceDocumentId) {
      setFocusedReaderMode('reflowed')
      setSourceWorkspaceReaderAnchor(null)
      return
    }
    setFocusedReaderMode('reflowed')
    setSourceWorkspaceReaderAnchor(null)
  }, [activeSourceDocumentId, setSourceWorkspaceReaderAnchor])

  useEffect(() => {
    if (!sourceWorkspaceDocument) {
      return
    }
    if (sourceWorkspaceDocument.available_modes.includes(focusedReaderMode)) {
      return
    }
    setFocusedReaderMode(sourceWorkspaceDocument.available_modes.includes('reflowed') ? 'reflowed' : 'original')
  }, [focusedReaderMode, sourceWorkspaceDocument])

  useEffect(() => {
    if (!selectedNodeDetail || !activeSourceDocumentId) {
      setFocusedGraphEvidenceKey(null)
      return
    }

    const primaryMention = selectedNodeDetail.mentions.find(
      (mention) => mention.source_document_id === activeSourceDocumentId,
    )
    if (primaryMention) {
      setFocusedGraphEvidenceKey((currentKey) => currentKey ?? `mention:${primaryMention.id}`)
      return
    }

    const primaryEdge = selectedNodeEdges.find((edge) => edge.source_document_ids.includes(activeSourceDocumentId))
    setFocusedGraphEvidenceKey((currentKey) => currentKey ?? (primaryEdge ? `edge:${primaryEdge.id}` : null))
  }, [activeSourceDocumentId, selectedNodeDetail, selectedNodeEdges])

  useEffect(() => {
    setFocusedStudySourceSpanIndex(0)
    setStudyEvidencePeekOpen(false)
  }, [activeStudyCard?.id])

  useEffect(() => {
    setStudyQueueExpanded(false)
  }, [section, showFocusedStudySplitView, studyBrowseDrawerOpen, studyFilter])

  useEffect(() => {
    if (section !== 'study' || showFocusedStudySplitView) {
      setStudyEvidencePeekOpen(false)
    }
  }, [section, showFocusedStudySplitView])

  useEffect(() => {
    if (!selectedLibraryDocumentId) {
      setSelectedDocumentNoteCount(null)
      setSelectedDocumentNoteCountStatus('idle')
      return
    }

    let active = true
    setSelectedDocumentNoteCountStatus('loading')
    void fetchRecallNotes(selectedLibraryDocumentId)
      .then((loadedNotes) => {
        if (!active) {
          return
        }
        setSelectedDocumentNoteCount(loadedNotes.length)
        setSelectedDocumentNoteCountStatus('success')
      })
      .catch(() => {
        if (!active) {
          return
        }
        setSelectedDocumentNoteCount(null)
        setSelectedDocumentNoteCountStatus('error')
      })

    return () => {
      active = false
    }
  }, [reloadToken, selectedLibraryDocumentId])

  useEffect(() => {
    if (!activeSourceDocumentId) {
      setSourceWorkspaceNotes([])
      setSourceWorkspaceNotesStatus('idle')
      return
    }

    if (activeSourceDocumentId === selectedNotesDocumentId && !showingNoteSearch) {
      if (notesStatus === 'success') {
        setSourceWorkspaceNotes(documentNotes)
        setSourceWorkspaceNotesStatus('success')
        return
      }
      if (notesStatus === 'loading') {
        setSourceWorkspaceNotes([])
        setSourceWorkspaceNotesStatus('loading')
        return
      }
      if (notesStatus === 'error') {
        setSourceWorkspaceNotes([])
        setSourceWorkspaceNotesStatus('error')
        return
      }
    }

    let active = true
    setSourceWorkspaceNotesStatus('loading')
    void fetchRecallNotes(activeSourceDocumentId)
      .then((loadedNotes) => {
        if (!active) {
          return
        }
        setSourceWorkspaceNotes(loadedNotes)
        setSourceWorkspaceNotesStatus('success')
      })
      .catch(() => {
        if (!active) {
          return
        }
        setSourceWorkspaceNotes([])
        setSourceWorkspaceNotesStatus('error')
      })

    return () => {
      active = false
    }
  }, [activeSourceDocumentId, documentNotes, notesStatus, selectedNotesDocumentId, showingNoteSearch])

  useEffect(() => {
    if (!selectedNotesDocumentId) {
      setDocumentNotes([])
      setNotesStatus('idle')
      setNotesError(null)
      return
    }

    void loadNotes(selectedNotesDocumentId)
  }, [loadNotes, reloadToken, selectedNotesDocumentId])

  useEffect(() => {
    if (!showingNoteSearch) {
      setNoteSearchResults([])
      setNoteSearchStatus('idle')
      setNoteSearchError(null)
      return
    }

    let active = true
    setNoteSearchStatus('loading')
    setNoteSearchError(null)
    void searchRecallNotes(deferredNoteSearch, 20, selectedNotesDocumentId)
      .then((hits) => {
        if (active) {
          setNoteSearchResults(hits)
          setNoteSearchStatus('success')
        }
      })
      .catch((loadError: Error) => {
        if (active) {
          setNoteSearchResults([])
          setNoteSearchStatus('error')
          setNoteSearchError(getErrorMessage(loadError, 'Could not search notes.'))
        }
      })

    return () => {
      active = false
    }
  }, [deferredNoteSearch, selectedNotesDocumentId, showingNoteSearch])

  useEffect(() => {
    void loadGraph()
  }, [loadGraph, reloadToken])

  useEffect(() => {
    setGraphDetailPeekOpen(false)
    setGraphDetailMentionsExpanded(false)
    setGraphDetailRelationsExpanded(false)
    if (!selectedNodeId) {
      setSelectedNodeDetail(null)
      return
    }

    let active = true
    setNodeDetailLoading(true)
    void fetchRecallGraphNode(selectedNodeId)
      .then((nodeDetail) => {
        if (active) {
          setSelectedNodeDetail(nodeDetail)
        }
      })
      .catch((loadError: Error) => {
        if (active) {
          setError(loadError.message)
        }
      })
      .finally(() => {
        if (active) {
          setNodeDetailLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [selectedNodeId])

  useEffect(() => {
    if (section !== 'graph' || !activeSourceDocumentId || !graphSnapshot) {
      return
    }
    const currentNodeMatches =
      selectedNodeId && graphSnapshot.nodes.some((node) => node.id === selectedNodeId && node.source_document_ids.includes(activeSourceDocumentId))
    if (currentNodeMatches) {
      return
    }
    const matchingNode = graphSnapshot.nodes.find((node) => node.source_document_ids.includes(activeSourceDocumentId))
    if (!matchingNode) {
      updateGraphState((current) => ({
        ...current,
        selectedNodeId: null,
      }))
      return
    }
    updateGraphState((current) => ({ ...current, selectedNodeId: matchingNode.id }))
  }, [activeSourceDocumentId, graphSnapshot, section, selectedNodeId, updateGraphState])

  useEffect(() => {
    void loadStudy(studyFilter)
  }, [loadStudy, reloadToken, studyFilter])

  useEffect(() => {
    updateStudyState((current) => ({
      ...current,
      activeCardId:
        current.activeCardId && studyCards.some((card) => card.id === current.activeCardId)
          ? current.activeCardId
          : studyCards[0]?.id ?? null,
    }))
  }, [studyCards, updateStudyState])

  useEffect(() => {
    if (section !== 'study' || !activeSourceDocumentId || studyCards.length === 0) {
      return
    }
    const currentCardMatches =
      activeCardId && studyCards.some((card) => card.id === activeCardId && card.source_document_id === activeSourceDocumentId)
    if (currentCardMatches) {
      return
    }
    const matchingCard = studyCards.find((card) => card.source_document_id === activeSourceDocumentId)
    if (!matchingCard) {
      updateStudyState((current) => ({
        ...current,
        activeCardId: null,
      }))
      return
    }
    updateStudyState((current) => ({
      ...current,
      activeCardId: matchingCard.id,
    }))
  }, [activeCardId, activeSourceDocumentId, section, studyCards, updateStudyState])

  useEffect(() => {
    updateNotesState((current) => ({
      ...current,
      selectedNoteId:
        current.selectedNoteId && visibleNotes.some((note) => note.id === current.selectedNoteId)
          ? current.selectedNoteId
          : visibleNotes[0]?.id ?? null,
    }))
  }, [updateNotesState, visibleNotes])

  useEffect(() => {
    setNoteDraftBody(activeNote?.body_text ?? '')
  }, [activeNote?.body_text, activeNote?.id])

  useEffect(() => {
    if (!activeNoteId) {
      setNotePromotionMode(null)
      setNoteGraphDraft({ label: '', description: '' })
      setNoteStudyDraft({ prompt: '', answer: '' })
      return
    }
    setNotePromotionMode(null)
    setNoteGraphDraft({
      label: activeNoteAnchorText,
      description: activeNoteBodyText,
    })
    setNoteStudyDraft({
      prompt: activeNoteBodyText.trim() || 'What should you remember from this note?',
      answer: activeNoteAnchorText,
    })
  }, [activeNoteAnchorText, activeNoteBodyText, activeNoteId])

  useEffect(() => {
    setNotesMessage(null)
  }, [noteSearchQuery, section, selectedNoteId, selectedNotesDocumentId])

  useEffect(() => {
    if (!focusRequest || focusRequest.section !== section) {
      return
    }

    updateSourceWorkspaceState((current) => ({
      ...current,
      activeDocumentId: focusRequest.documentId ?? current.activeDocumentId,
      activeTab: mapRecallSectionToSourceTab(focusRequest.section),
    }))

    if (focusRequest.documentId) {
      if (focusRequest.section === 'library') {
        updateLibraryState((current) => ({ ...current, selectedDocumentId: focusRequest.documentId ?? null }))
      }
      if (focusRequest.section === 'notes') {
        updateNotesState((current) => ({ ...current, selectedDocumentId: focusRequest.documentId ?? null }))
      }
    }
    if (focusRequest.noteId) {
      updateNotesState((current) => ({
        ...current,
        searchQuery: '',
        selectedNoteId: focusRequest.noteId ?? null,
      }))
    }
    if (focusRequest.nodeId) {
      updateGraphState((current) => ({ ...current, selectedNodeId: focusRequest.nodeId ?? null }))
    }
    if (focusRequest.cardId) {
      updateStudyState((current) => ({
        ...current,
        filter: 'all',
        activeCardId: focusRequest.cardId ?? null,
      }))
    }
  }, [focusRequest, section, updateGraphState, updateLibraryState, updateNotesState, updateSourceWorkspaceState, updateStudyState])

  useEffect(() => {
    if (section !== 'library' || !selectedLibraryDocumentId || !sourceWorkspaceFocused) {
      return
    }
    updateSourceWorkspaceState((current) =>
      current.activeDocumentId === selectedLibraryDocumentId && current.activeTab === 'overview'
        ? current
        : {
            ...current,
            activeDocumentId: selectedLibraryDocumentId,
            activeTab: 'overview',
          },
    )
  }, [section, selectedLibraryDocumentId, sourceWorkspaceFocused, updateSourceWorkspaceState])

  useEffect(() => {
    if (section !== 'notes' || !selectedNotesDocumentId) {
      return
    }
    updateSourceWorkspaceState((current) =>
      current.activeDocumentId === selectedNotesDocumentId && current.activeTab === 'notes'
        ? current
        : {
            ...current,
            activeDocumentId: selectedNotesDocumentId,
            activeTab: 'notes',
          },
    )
  }, [section, selectedNotesDocumentId, updateSourceWorkspaceState])

  useEffect(() => {
    if (section !== 'graph' || !selectedNodeDetail) {
      return
    }
    if (selectedNodeId && selectedNodeDetail.node.id !== selectedNodeId) {
      return
    }
    const sourceDocumentId = selectedNodeDetail.mentions[0]?.source_document_id ?? selectedNodeDetail.node.source_document_ids[0] ?? null
    if (!sourceDocumentId) {
      return
    }
    updateSourceWorkspaceState((current) =>
      current.activeTab === 'graph' && current.activeDocumentId && current.activeDocumentId !== sourceDocumentId
        ? current
        : current.activeDocumentId === sourceDocumentId && current.activeTab === 'graph'
          ? current
          : {
              ...current,
              activeDocumentId: sourceDocumentId,
              activeTab: 'graph',
            },
    )
  }, [section, selectedNodeDetail, selectedNodeId, updateSourceWorkspaceState])

  useEffect(() => {
    if (section !== 'study' || !activeStudyCard) {
      return
    }
    updateSourceWorkspaceState((current) =>
      current.activeTab === 'study' &&
      current.activeDocumentId &&
      current.activeDocumentId !== activeStudyCard.source_document_id
        ? current
        : current.activeDocumentId === activeStudyCard.source_document_id && current.activeTab === 'study'
          ? current
          : {
              ...current,
              activeDocumentId: activeStudyCard.source_document_id,
              activeTab: 'study',
            },
    )
  }, [activeStudyCard, section, updateSourceWorkspaceState])

  useEffect(() => {
    if (!showFocusedNotesSplitView || !activeNote || activeNote.anchor.source_document_id !== activeSourceDocumentId) {
      return
    }
    setSourceWorkspaceReaderAnchor(buildReaderAnchorRangeFromNote(activeNote))
  }, [activeNote, activeSourceDocumentId, setSourceWorkspaceReaderAnchor, showFocusedNotesSplitView])

  useEffect(() => {
    if (!showFocusedStudySplitView || !focusedStudySourceSpan || !activeStudyCard) {
      return
    }
    const anchorRange = buildReaderAnchorRangeFromSourceSpan(focusedStudySourceSpan)
    if (!anchorRange) {
      return
    }
    setSourceWorkspaceReaderAnchor(anchorRange)
  }, [activeStudyCard, focusedStudySourceSpan, setSourceWorkspaceReaderAnchor, showFocusedStudySplitView])

  const handleSelectLibraryDocument = useCallback((documentId: string) => {
    setDetailStatus('loading')
    setDetailError(null)
    updateLibraryState((current) => ({ ...current, selectedDocumentId: documentId }))
  }, [updateLibraryState])

  const handleSelectGraphNode = useCallback((node: KnowledgeNodeRecord) => {
    updateGraphState((current) => ({ ...current, selectedNodeId: node.id }))
    updateSourceWorkspaceState((current) => ({
      ...current,
      activeDocumentId: node.source_document_ids[0] ?? current.activeDocumentId,
      activeTab: 'graph',
      readerAnchor:
        current.activeDocumentId === (node.source_document_ids[0] ?? current.activeDocumentId)
          ? current.readerAnchor
          : null,
    }))
  }, [updateGraphState, updateSourceWorkspaceState])

  function handleSelectNotesDocument(documentId: string) {
    updateNotesState((current) => ({
      ...current,
      selectedDocumentId: documentId,
    }))
  }

  const handleOpenDocumentInReader = useCallback((
    documentId: string,
    options?: {
      sentenceEnd?: number | null
      sentenceStart?: number | null
    },
  ) => {
    handleSelectLibraryDocument(documentId)
    updateSourceWorkspaceState((current) => ({
      ...current,
      activeDocumentId: documentId,
      activeTab: 'reader',
      mode: 'focused',
      readerAnchor:
        options?.sentenceStart !== null &&
        options?.sentenceStart !== undefined &&
        options?.sentenceEnd !== null &&
        options?.sentenceEnd !== undefined
          ? {
              sentenceEnd: options.sentenceEnd,
              sentenceStart: options.sentenceStart,
            }
          : current.readerAnchor,
    }))
    onOpenReader(documentId, options)
  }, [handleSelectLibraryDocument, onOpenReader, updateSourceWorkspaceState])

  function handleOpenMentionInReader(sourceDocumentId: string) {
    handleOpenDocumentInReader(sourceDocumentId)
  }

  function handleOpenEdgeInReader(edge: KnowledgeEdgeRecord) {
    const sourceDocumentId = edge.source_document_ids[0]
    if (!sourceDocumentId) {
      return
    }
    handleOpenDocumentInReader(sourceDocumentId)
  }

  function handleOpenStudyCardInReader(card: StudyCardRecord, sourceSpan?: Record<string, unknown>) {
    handleOpenDocumentInReader(card.source_document_id, buildReaderOptionsFromSourceSpan(sourceSpan))
  }

  function handleShowNoteInFocusedReader(note: RecallNoteRecord | RecallNoteSearchHit) {
    handleSelectLibraryDocument(note.anchor.source_document_id)
    setSourceWorkspaceReaderAnchor(buildReaderAnchorRangeFromNote(note))
  }

  function handleShowGraphEvidenceInFocusedReader(evidenceKey: string, sourceDocumentId: string) {
    handleSelectLibraryDocument(sourceDocumentId)
    setFocusedGraphEvidenceKey(evidenceKey)
  }

  function handleShowStudyEvidenceInFocusedReader(
    card: StudyCardRecord,
    sourceSpan: Record<string, unknown>,
    sourceSpanIndex: number,
  ) {
    handleSelectLibraryDocument(card.source_document_id)
    setFocusedStudySourceSpanIndex(sourceSpanIndex)
    const anchorRange = buildReaderAnchorRangeFromSourceSpan(sourceSpan)
    if (anchorRange) {
      setSourceWorkspaceReaderAnchor(anchorRange)
    }
  }

  function handleSelectStudyCard(card: StudyCardRecord) {
    updateStudyState((current) => ({ ...current, activeCardId: card.id }))
    updateSourceWorkspaceState((current) => ({
      ...current,
      activeDocumentId: card.source_document_id,
      activeTab: 'study',
      readerAnchor:
        current.activeDocumentId === card.source_document_id ? current.readerAnchor : null,
    }))
    setShowAnswer(false)
    setStudyEvidencePeekOpen(false)
    setFocusedStudySourceSpanIndex(0)
  }

  function handleRetryRecallLoading() {
    setError(null)
    setReloadToken((current) => current + 1)
  }

  function handleRetryNotesLoading() {
    setNotesMessage(null)
    if (showingNoteSearch) {
      setNoteSearchStatus('loading')
      setNoteSearchError(null)
      void searchRecallNotes(deferredNoteSearch, 20, selectedNotesDocumentId)
        .then((hits) => {
          setNoteSearchResults(hits)
          setNoteSearchStatus('success')
        })
        .catch((loadError) => {
          setNoteSearchResults([])
          setNoteSearchStatus('error')
          setNoteSearchError(getErrorMessage(loadError, 'Could not search notes.'))
        })
    } else if (selectedNotesDocumentId) {
      void loadNotes(selectedNotesDocumentId)
    }
  }

  async function handleDecideNode(decision: 'confirmed' | 'rejected') {
    if (!selectedNodeDetail) {
      return
    }
    setGraphBusyKey(`node:${selectedNodeDetail.node.id}:${decision}`)
    setError(null)
    try {
      await decideRecallGraphNode(selectedNodeDetail.node.id, decision)
      await Promise.all([loadGraph(), fetchRecallGraphNode(selectedNodeDetail.node.id).then(setSelectedNodeDetail)])
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'Could not update that node.')
    } finally {
      setGraphBusyKey(null)
    }
  }

  async function handleDecideEdge(edge: KnowledgeEdgeRecord, decision: 'confirmed' | 'rejected') {
    setGraphBusyKey(`edge:${edge.id}:${decision}`)
    setError(null)
    try {
      await decideRecallGraphEdge(edge.id, decision)
      await loadGraph()
      if (selectedNodeId) {
        const nodeDetail = await fetchRecallGraphNode(selectedNodeId)
        setSelectedNodeDetail(nodeDetail)
      }
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'Could not update that edge.')
    } finally {
      setGraphBusyKey(null)
    }
  }

  async function handleGenerateStudyCards() {
    setStudyBusyKey('generate')
    setStudyMessage(null)
    setError(null)
    try {
      const result = await generateRecallStudyCards()
      setStudyMessage(`Refreshed ${result.total_count} study cards.`)
      await loadStudy(studyFilter)
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Could not refresh study cards.')
    } finally {
      setStudyBusyKey(null)
    }
  }

  async function handleSaveNoteChanges() {
    if (!activeNote) {
      return
    }
    setNoteBusyKey(`save:${activeNote.id}`)
    setNotesMessage(null)
    setNotesError(null)
    setNoteSearchError(null)
    try {
      const updatedNote = await updateRecallNote(activeNote.id, {
        body_text: noteDraftBody.trim().length > 0 ? noteDraftBody.trim() : null,
      })
      setDocumentNotes((currentNotes) => upsertNoteRecord(currentNotes, updatedNote))
      setNoteSearchResults((currentResults) => upsertNoteRecord(currentResults, updatedNote))
      setNoteDraftBody(updatedNote.body_text ?? '')
      setNotesMessage('Note updated locally.')
    } catch (saveError) {
      const message = getErrorMessage(saveError, 'Could not update that note.')
      if (showingNoteSearch) {
        setNoteSearchError(message)
      } else {
        setNotesError(message)
      }
    } finally {
      setNoteBusyKey(null)
    }
  }

  async function handleDeleteNote() {
    if (!activeNote) {
      return
    }
    const confirmed = window.confirm('Delete this note from local Recall?')
    if (!confirmed) {
      return
    }

    setNoteBusyKey(`delete:${activeNote.id}`)
    setNotesMessage(null)
    setNotesError(null)
    setNoteSearchError(null)
    try {
      await deleteRecallNote(activeNote.id)
      setDocumentNotes((currentNotes) => removeNoteRecord(currentNotes, activeNote.id))
      setNoteSearchResults((currentResults) => removeNoteRecord(currentResults, activeNote.id))
      if (activeNote.anchor.source_document_id === selectedLibraryDocumentId) {
        setSelectedDocumentNoteCount((current) => (current === null ? current : Math.max(0, current - 1)))
      }
      updateNotesState((current) => ({
        ...current,
        selectedNoteId: current.selectedNoteId === activeNote.id ? null : current.selectedNoteId,
      }))
      setNoteDraftBody('')
      setNotesMessage('Note deleted.')
    } catch (deleteError) {
      const message = getErrorMessage(deleteError, 'Could not delete that note.')
      if (showingNoteSearch) {
        setNoteSearchError(message)
      } else {
        setNotesError(message)
      }
    } finally {
      setNoteBusyKey(null)
    }
  }

  async function handlePromoteNoteToGraph() {
    if (!activeNote) {
      return
    }
    setNoteBusyKey(`graph:${activeNote.id}`)
    setNotesMessage(null)
    setNotesError(null)
    setNoteSearchError(null)
    try {
      const nodeDetail = await promoteRecallNoteToGraphNode(activeNote.id, {
        label: noteGraphDraft.label,
        description: noteGraphDraft.description?.trim().length ? noteGraphDraft.description.trim() : null,
      })
      await loadGraph()
      updateGraphState((current) => ({ ...current, selectedNodeId: nodeDetail.node.id }))
      setSelectedNodeDetail(nodeDetail)
      setNotePromotionMode(null)
      setNotesMessage('Note promoted to the graph.')
      focusSourceGraph(activeNote.anchor.source_document_id, nodeDetail.node.id)
    } catch (promotionError) {
      const message = getErrorMessage(promotionError, 'Could not promote that note into the graph.')
      if (showingNoteSearch) {
        setNoteSearchError(message)
      } else {
        setNotesError(message)
      }
    } finally {
      setNoteBusyKey(null)
    }
  }

  async function handlePromoteNoteToStudyCard() {
    if (!activeNote) {
      return
    }
    setNoteBusyKey(`study:${activeNote.id}`)
    setNotesMessage(null)
    setNotesError(null)
    setNoteSearchError(null)
    try {
      const promotedCard = await promoteRecallNoteToStudyCard(activeNote.id, {
        prompt: noteStudyDraft.prompt,
        answer: noteStudyDraft.answer,
      })
      updateStudyState((current) => ({
        ...current,
        filter: 'all',
      }))
      const loadedCards = await loadStudy('all')
      if (!loadedCards.some((card) => card.id === promotedCard.id)) {
        setStudyCards((currentCards) => {
          const withoutPromoted = currentCards.filter((card) => card.id !== promotedCard.id)
          return [promotedCard, ...withoutPromoted]
        })
      }
      updateStudyState((current) => ({
        ...current,
        filter: 'all',
        activeCardId: promotedCard.id,
      }))
      setShowAnswer(false)
      setNotePromotionMode(null)
      setNotesMessage('Study card created from the note.')
      focusSourceStudy(activeNote.anchor.source_document_id, promotedCard.id)
    } catch (promotionError) {
      const message = getErrorMessage(promotionError, 'Could not create a study card from that note.')
      if (showingNoteSearch) {
        setNoteSearchError(message)
      } else {
        setNotesError(message)
      }
    } finally {
      setNoteBusyKey(null)
    }
  }

  function handleOpenNoteInReader(note: RecallNoteRecord | RecallNoteSearchHit) {
    handleSelectNotesDocument(note.anchor.source_document_id)
    handleOpenDocumentInReader(note.anchor.source_document_id, buildReaderAnchorOptions(note))
  }

  async function handleReviewCard(rating: StudyReviewRating) {
    if (!activeStudyCard) {
      return
    }
    setStudyBusyKey(`review:${activeStudyCard.id}:${rating}`)
    setError(null)
    try {
      const reviewedCard = await reviewRecallStudyCard(activeStudyCard.id, rating)
      setStudyCards((currentCards) =>
        currentCards.map((card) => (card.id === reviewedCard.id ? reviewedCard : card)),
      )
      setShowAnswer(false)
      setStudyEvidencePeekOpen(false)
      await loadStudy(studyFilter)
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : 'Could not save that review.')
    } finally {
      setStudyBusyKey(null)
    }
  }

  const documentsLoading = documentsStatus === 'loading'
  const detailLoading = detailStatus === 'loading'
  const graphLoading = graphStatus === 'loading'
  const studyLoading = studyStatus === 'loading'
  const notesLoading = notesStatus === 'loading'
  const noteSearchLoading = noteSearchStatus === 'loading'
  const documentCountLabel =
    documentsStatus === 'error'
      ? 'Home unavailable'
      : documents.length === 1
        ? '1 source document'
        : `${documents.length} source documents`
  const graphNodeCountLabel =
    graphStatus === 'error'
      ? 'Graph unavailable'
      : graphSnapshot
        ? `${graphSnapshot.nodes.length} visible nodes`
        : 'Loading graph…'
  const studyCountLabel =
    studyStatus === 'error'
      ? 'Study unavailable'
      : studyOverview
        ? `${studyOverview.new_count + studyOverview.due_count + studyOverview.scheduled_count} cards`
        : 'Loading study…'
  const homeSavedSourceLabel = `${documents.length} ready`
  const homeSidebarStatusCopy =
    documentsLoading
      ? 'Loading local collection.'
      : documentsStatus === 'error'
        ? 'Reconnect the local service to reload saved sources.'
        : documents.length === 0
          ? 'Start with one source and build context from there.'
          : null
  const libraryLandingIntroCopy =
    documentsLoading
      ? 'Loading your saved source collection.'
      : documentsStatus === 'error'
        ? 'Saved sources are temporarily unavailable until the local service reconnects.'
        : documents.length === 0
          ? 'Add one source to start reading, saving notes, and building graph or study context.'
          : libraryFilterActive
            ? `Showing ${visibleDocuments.length} matching ${visibleDocuments.length === 1 ? 'source' : 'sources'}.`
            : resumeSourceDocument
              ? 'Resume one source now, then expand grouped sections only when you need more.'
              : 'Open one saved source now.'
  const showInlineHomeSearch = !documentsLoading && documentsStatus !== 'error' && documents.length > 0
  const homeInlineHeading = libraryFilterActive ? 'Search results' : 'Home'
  const homeInlineSummary =
    documentsLoading
      ? 'Loading saved sources.'
      : documentsStatus === 'error'
        ? 'Saved sources are unavailable until the local service reconnects.'
        : documents.length === 0
          ? 'Add one source to start reading, saving notes, and building graph or study context.'
          : libraryFilterActive
            ? libraryLandingIntroCopy
            : `${homeSavedSourceLabel}.`
  const graphSidebarGlanceLabel =
    graphStatus === 'error'
      ? 'Graph unavailable'
      : graphLoading
        ? 'Loading graph…'
        : formatCountLabel(graphSnapshot?.nodes.length ?? 0, 'node', 'nodes')
  const graphSidebarGlanceMeta =
    graphStatus === 'error'
      ? 'Reconnect the local service to reload the graph.'
      : `${graphSnapshot?.pending_edges ?? 0} pending · ${graphSnapshot?.confirmed_edges ?? 0} confirmed`
  const graphQuickPickSectionLabel = graphFilterActive ? 'Matching nodes' : 'Quick picks'
  const graphQuickPickSectionNote = graphFilterActive
    ? `${filteredGraphNodes.length} matching ${filteredGraphNodes.length === 1 ? 'node' : 'nodes'}`
    : null
  const studyNewCountLabel = studyStatus === 'error' ? 'Study unavailable' : `${studyOverview?.new_count ?? 0} new`
  const studyDueCountLabel = studyStatus === 'error' ? 'Counts unavailable' : `${studyOverview?.due_count ?? 0} due`
  const studyReviewCountLabel =
    studyStatus === 'error' ? 'Retry needed' : `${studyOverview?.review_event_count ?? 0} reviews logged`
  const collapsedStudyBrowseRail = !showFocusedStudySplitView && !studyBrowseDrawerOpen
  const collapsedStudyQueueOverview = studyStatus === 'error'
    ? 'Study unavailable'
    : studyOverview
      ? studyOverview.due_count > 0
        ? `${studyOverview.due_count} due`
        : studyOverview.new_count > 0
          ? `${studyOverview.new_count} new`
          : `${studyOverview.scheduled_count} scheduled`
      : 'Loading study…'
  const activeStudyCardSidebarSummary = activeStudyCard
    ? `${activeStudyCard.document_title} · ${formatStudyStatus(activeStudyCard.status)} · Due ${dateFormatter.format(new Date(activeStudyCard.due_at))}`
    : activeSourceDocumentId
      ? 'Generate or promote a study card from this source to review it here.'
      : 'Choose a source to inspect its study state.'
  const activeStudyCardCollapsedRailSummary = activeStudyCard
    ? null
    : activeSourceDocumentId
      ? 'Generate or promote a study card from this source to review it here.'
      : 'Choose a source to inspect its study state.'
  const collapsedStudyBrowseRailLabel = activeStudyCard ? 'Up next' : formatModeLabel(studyFilter)
  const browseStudyEvidenceExpanded = showFocusedStudySplitView || showAnswer || studyEvidencePeekOpen
  const browseStudyEvidenceSummary = focusedStudySourceSpan
    ? getStudyEvidenceLabel(focusedStudySourceSpan)
    : 'Add a note or highlight to keep one excerpt nearby.'
  const overallError = error ?? documentsError ?? detailError ?? graphError ?? studyError
  const canRetryRecallLoading = Boolean(documentsError || detailError || graphError || studyError)
  const sourceOverviewDocument =
    section === 'library'
      ? selectedDocument
      : sourceWorkspaceDocument ?? (activeSourceDocumentId === selectedDocument?.id ? selectedDocument : null)
  const sourceOverviewLoading = section === 'library' ? detailLoading : sourceWorkspaceStatus === 'loading' && !sourceOverviewDocument
  const sourceOverviewError =
    documentsStatus === 'error'
      ? 'Source overview is unavailable until the local collection reconnects.'
      : section === 'library'
        ? detailStatus === 'error'
          ? detailError
          : null
        : !sourceOverviewDocument && sourceWorkspaceStatus === 'error'
          ? 'Could not load source detail for the active workspace.'
          : null
  const sourceOverviewNoteCountLabel =
    sourceOverviewDocument?.id && sourceOverviewDocument.id === selectedLibraryDocumentId
      ? selectedDocumentNoteCountLabel
      : sourceWorkspaceNoteCountLabel
  const sourceOverviewDescription =
    section === 'notes'
      ? 'Keep the source summary visible while editing saved notes and grounded promotions.'
      : section === 'graph'
        ? 'Keep the source summary visible while validating graph evidence and relation suggestions.'
        : section === 'study'
          ? 'Keep the source summary visible while reviewing study evidence and scheduling actions.'
          : 'Work from one source-centered summary with nearby reading, notes, graph, and study handoffs.'

  const focusSourceLibrary = useCallback((documentId: string) => {
    handleSelectLibraryDocument(documentId)
    updateSourceWorkspaceState((current) => ({
      ...current,
      activeDocumentId: documentId,
      activeTab: 'overview',
      mode: 'focused',
      readerAnchor: current.activeDocumentId === documentId ? current.readerAnchor : null,
    }))
    setBrowseDrawerOpen('library', false)
    onSectionChange('library')
  }, [handleSelectLibraryDocument, onSectionChange, setBrowseDrawerOpen, updateSourceWorkspaceState])

  const focusSourceNotes = useCallback((documentId: string, noteId?: string | null) => {
    handleSelectLibraryDocument(documentId)
    updateSourceWorkspaceState((current) => ({
      ...current,
      activeDocumentId: documentId,
      activeTab: 'notes',
      mode: 'focused',
      readerAnchor: current.activeDocumentId === documentId ? current.readerAnchor : null,
    }))
    updateNotesState((current) => ({
      ...current,
      searchQuery: '',
      selectedDocumentId: documentId,
      selectedNoteId: noteId ?? current.selectedNoteId,
    }))
    setBrowseDrawerOpen('notes', false)
    onSectionChange('notes')
  }, [handleSelectLibraryDocument, onSectionChange, setBrowseDrawerOpen, updateNotesState, updateSourceWorkspaceState])

  const focusSourceGraph = useCallback((documentId: string, nodeId?: string | null) => {
    handleSelectLibraryDocument(documentId)
    const matchingNodeId =
      nodeId ?? graphSnapshot?.nodes.find((node) => node.source_document_ids.includes(documentId))?.id ?? null
    updateSourceWorkspaceState((current) => ({
      ...current,
      activeDocumentId: documentId,
      activeTab: 'graph',
      mode: 'focused',
      readerAnchor: current.activeDocumentId === documentId ? current.readerAnchor : null,
    }))
    updateGraphState((current) => ({
      ...current,
      selectedNodeId: matchingNodeId,
    }))
    setBrowseDrawerOpen('graph', false)
    onSectionChange('graph')
  }, [
    graphSnapshot,
    handleSelectLibraryDocument,
    onSectionChange,
    setBrowseDrawerOpen,
    updateGraphState,
    updateSourceWorkspaceState,
  ])

  const focusSourceStudy = useCallback((documentId: string, cardId?: string | null) => {
    handleSelectLibraryDocument(documentId)
    const matchingCardId = cardId ?? studyCards.find((card) => card.source_document_id === documentId)?.id ?? null
    updateSourceWorkspaceState((current) => ({
      ...current,
      activeDocumentId: documentId,
      activeTab: 'study',
      mode: 'focused',
      readerAnchor: current.activeDocumentId === documentId ? current.readerAnchor : null,
    }))
    updateStudyState((current) => ({
      ...current,
      filter: 'all',
      activeCardId: matchingCardId,
    }))
    setBrowseDrawerOpen('study', false)
    onSectionChange('study')
  }, [
    handleSelectLibraryDocument,
    onSectionChange,
    setBrowseDrawerOpen,
    studyCards,
    updateSourceWorkspaceState,
    updateStudyState,
  ])

  const resumeFocusedSource = useCallback(() => {
    if (!activeSourceDocumentId) {
      return
    }

    if (activeSourceTab === 'reader') {
      handleOpenDocumentInReader(activeSourceDocumentId, activeSourceReaderAnchor ?? undefined)
      return
    }

    if (activeSourceTab === 'notes') {
      focusSourceNotes(activeSourceDocumentId, selectedNoteId)
      return
    }

    if (activeSourceTab === 'graph') {
      focusSourceGraph(activeSourceDocumentId, selectedNodeId)
      return
    }

    if (activeSourceTab === 'study') {
      focusSourceStudy(activeSourceDocumentId, activeCardId)
      return
    }

    focusSourceLibrary(activeSourceDocumentId)
  }, [
    activeCardId,
    activeSourceDocumentId,
    activeSourceReaderAnchor,
    activeSourceTab,
    focusSourceGraph,
    focusSourceLibrary,
    focusSourceNotes,
    focusSourceStudy,
    handleOpenDocumentInReader,
    selectedNodeId,
    selectedNoteId,
  ])

  function renderFocusedReaderPane() {
    const focusedReaderDocument =
      sourceWorkspaceDocument ?? (activeSourceDocumentId === selectedDocument?.id ? selectedDocument : null)
    const focusedReaderActiveMode =
      focusedReaderDocument?.available_modes.includes(focusedReaderMode)
        ? focusedReaderMode
        : focusedReaderDocument?.available_modes.includes('reflowed')
          ? 'reflowed'
          : 'original'

    return (
      <FocusedSourceReaderPane
        activeMode={focusedReaderActiveMode}
        anchorTextCandidates={focusedReaderAnchorCandidates}
        document={focusedReaderDocument}
        notes={sourceWorkspaceNotes}
        onModeChange={setFocusedReaderMode}
        onOpenInReader={handleOpenDocumentInReader}
        onResolvedAnchorRange={setSourceWorkspaceReaderAnchor}
        requestedAnchorRange={activeSourceReaderAnchor}
        settings={settings}
      />
    )
  }

  function renderSourceOverviewPanel(splitView = false) {
    return (
      <section
        className={
          splitView
            ? 'card stack-gap recall-detail-card recall-source-overview-card recall-source-overview-card-split'
            : 'card stack-gap recall-detail-card recall-source-overview-card'
        }
      >
        <div className="toolbar">
          <div className="section-header section-header-compact">
            <h2>Source overview</h2>
            <p>{sourceOverviewDescription}</p>
          </div>
          {sourceOverviewDocument ? (
            <div className="recall-actions">
              <button type="button" onClick={() => onOpenReader(sourceOverviewDocument.id)}>
                Open in Reader
              </button>
              <a className="secondary-button" href={buildRecallExportUrl(sourceOverviewDocument.id)}>
                Export Markdown
              </a>
            </div>
          ) : null}
        </div>

        {sourceOverviewLoading ? <p className="small-note">Loading source overview…</p> : null}
        {!sourceOverviewLoading && sourceOverviewError ? (
          <div className="stack-gap">
            <p className="small-note">{sourceOverviewError}</p>
            <div className="inline-actions">
              <button className="ghost-button" type="button" onClick={handleRetryRecallLoading}>
                Retry loading
              </button>
            </div>
          </div>
        ) : null}
        {!sourceOverviewLoading && !sourceOverviewError && !sourceOverviewDocument ? (
          <p className="small-note">Choose a source to inspect its shared shape and next actions.</p>
        ) : null}
        {sourceOverviewDocument ? (
          <div className="recall-detail-body stack-gap">
            <div className="recall-detail-heading">
              <h3>{sourceOverviewDocument.title}</h3>
              <div className="reader-meta-row" role="list" aria-label="Recall document metadata">
                <span className="status-chip reader-meta-chip" role="listitem">
                  {sourceOverviewDocument.source_type.toUpperCase()}
                </span>
                <span className="status-chip reader-meta-chip" role="listitem">
                  {sourceOverviewDocument.chunk_count} chunks
                </span>
                <span className="status-chip reader-meta-chip" role="listitem">{sourceOverviewNoteCountLabel}</span>
              </div>
            </div>
            <div className="recall-detail-brief">
              <strong>Source locator</strong>
              <span>{getDocumentSourcePreview(sourceOverviewDocument)}</span>
            </div>
            <div className="recall-detail-grid">
              <div className="recall-detail-panel">
                <strong>Updated</strong>
                <span>{dateFormatter.format(new Date(sourceOverviewDocument.updated_at))}</span>
              </div>
              <div className="recall-detail-panel">
                <strong>Available views</strong>
                <span>{sourceOverviewDocument.available_modes.map(formatModeLabel).join(', ')}</span>
              </div>
              <div className="recall-detail-panel">
                <strong>Reader handoff</strong>
                <span>Open this source directly in Reader without losing your Recall context.</span>
              </div>
            </div>
            <div className="recall-source-overview-grid">
              <div className="recall-detail-panel recall-source-summary-card">
                <strong>Saved notes</strong>
                <span>{sourceOverviewNoteCountLabel}</span>
                <p className="small-note">
                  {sourceWorkspacePrimaryNote
                    ? sourceWorkspacePrimaryNote.body_text?.trim() || sourceWorkspacePrimaryNote.anchor.anchor_text
                    : sourceWorkspaceNotesStatus === 'loading'
                      ? 'Loading saved note context for this source.'
                      : 'Capture a source-linked highlight from Reader to keep a note close by.'}
                </p>
                <div className="recall-actions recall-actions-inline">
                  <button className="ghost-button" type="button" onClick={() => focusSourceNotes(sourceOverviewDocument.id)}>
                    View notes
                  </button>
                  {sourceWorkspacePrimaryNote ? (
                    <button className="ghost-button" type="button" onClick={() => handleOpenNoteInReader(sourceWorkspacePrimaryNote)}>
                      Open anchor
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="recall-detail-panel recall-source-summary-card">
                <strong>Graph context</strong>
                <span>
                  {activeSourceGraphNodes.length === 1
                    ? '1 graph node nearby'
                    : `${activeSourceGraphNodes.length} graph nodes nearby`}
                </span>
                <p className="small-note">
                  {sourceWorkspacePrimaryNode
                    ? sourceWorkspacePrimaryNode.description ?? sourceWorkspacePrimaryNode.label
                    : 'No graph node has been grounded from this source yet.'}
                </p>
                <div className="recall-actions recall-actions-inline">
                  <button className="ghost-button" type="button" onClick={() => focusSourceGraph(sourceOverviewDocument.id)}>
                    Open graph
                  </button>
                </div>
              </div>
              <div className="recall-detail-panel recall-source-summary-card">
                <strong>Study state</strong>
                <span>
                  {activeSourceStudyCards.length === 1
                    ? '1 study card nearby'
                    : `${activeSourceStudyCards.length} study cards nearby`}
                </span>
                <p className="small-note">
                  {sourceWorkspacePrimaryStudyCard
                    ? sourceWorkspacePrimaryStudyCard.prompt
                    : 'No study card is currently visible for this source in Study.'}
                </p>
                <div className="recall-actions recall-actions-inline">
                  <button className="ghost-button" type="button" onClick={() => focusSourceStudy(sourceOverviewDocument.id)}>
                    Open study
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    )
  }

  useEffect(() => {
    onShellHeroChange({
      compact: true,
      eyebrow: 'Recall',
      title: 'Reconnect what you already saved.',
      description: 'Search, reopen, validate, and study from one local workspace.',
      metrics: [
        { label: documentsLoading ? 'Loading saved sources…' : documentCountLabel },
        { label: graphNodeCountLabel, tone: 'muted' },
        { label: studyCountLabel, tone: 'muted' },
      ],
    })
  }, [
    documentCountLabel,
    documentsLoading,
    graphNodeCountLabel,
    onShellHeroChange,
    studyCountLabel,
  ])

  useEffect(() => {
    onShellContextChange(shellContext)
  }, [onShellContextChange, shellContext])

  useEffect(() => {
    if (
      !sourceWorkspaceFocused ||
      !activeSourceDocumentId ||
      (!sourceWorkspaceDocument && sourceWorkspaceStatus !== 'loading')
    ) {
      onShellSourceWorkspaceChange(null)
      return
    }
    const sourceDocumentId = activeSourceDocumentId

    function handleSelectSourceWorkspaceTab(tab: SourceWorkspaceTab) {
      updateSourceWorkspaceState((current) => ({
        ...current,
        activeDocumentId: sourceDocumentId,
        activeTab: tab,
      }))

      if (tab === 'reader') {
        onOpenReader(sourceDocumentId)
        return
      }

      if (tab === 'overview') {
        updateLibraryState((current) => ({ ...current, selectedDocumentId: sourceDocumentId }))
        setBrowseDrawerOpen('library', false)
        onSectionChange('library')
        return
      }

      if (tab === 'notes') {
        focusSourceNotes(sourceDocumentId)
        return
      }

      if (tab === 'graph') {
        focusSourceGraph(sourceDocumentId)
        return
      }

      focusSourceStudy(sourceDocumentId)
    }

    onShellSourceWorkspaceChange({
      activeTab: activeSourceTab,
      counts: sourceWorkspaceCounts,
      description: sourceWorkspaceDescription,
      document: {
        availableModes: sourceWorkspaceDocument?.available_modes ?? [],
        chunkCount: sourceWorkspaceDocument?.chunk_count ?? null,
        fileName: sourceWorkspaceDocument?.file_name ?? null,
        id: sourceWorkspaceDocument?.id ?? activeSourceDocumentId,
        sourceLocator: sourceWorkspaceDocument?.source_locator ?? null,
        sourceType: sourceWorkspaceDocument?.source_type ?? 'source',
        title: sourceWorkspaceDocument?.title ?? 'Loading source…',
      },
      onSelectTab: handleSelectSourceWorkspaceTab,
    })
  }, [
    activeSourceDocumentId,
    activeSourceMode,
    activeSourceTab,
    focusSourceGraph,
    focusSourceLibrary,
    focusSourceNotes,
    focusSourceStudy,
    onOpenReader,
    onSectionChange,
    onShellSourceWorkspaceChange,
    setBrowseDrawerOpen,
    sourceWorkspaceCounts,
    sourceWorkspaceDescription,
    sourceWorkspaceDocument,
    sourceWorkspaceFocused,
    sourceWorkspaceStatus,
    updateLibraryState,
    updateSourceWorkspaceState,
  ])

  function renderLibrarySourceRow(document: RecallDocumentRecord) {
    const updatedLabel = homeDateFormatter.format(new Date(document.updated_at))
    const availableViewLabel = `${document.available_modes.length} ${document.available_modes.length === 1 ? 'view' : 'views'} ready`

    return (
      <button
        aria-label={`Open ${document.title}`}
        key={`row:${document.id}`}
        className="recall-library-list-row"
        type="button"
        onClick={() => focusSourceLibrary(document.id)}
      >
        <span className="recall-library-list-row-main">
          <span className="recall-library-row-overline">{document.source_type.toUpperCase()}</span>
          <strong>{document.title}</strong>
          <span>{getDocumentSourcePreview(document)}</span>
        </span>
        <span className="recall-library-list-row-meta">
          <span className="recall-library-row-timestamp">{updatedLabel}</span>
          <span>{availableViewLabel}</span>
        </span>
      </button>
    )
  }

  function renderHomeContinueCard(document: RecallDocumentRecord) {
    const updatedLabel = homeDateFormatter.format(new Date(document.updated_at))
    const availableViewLabel = `${document.available_modes.length} ${document.available_modes.length === 1 ? 'view' : 'views'} ready`
    const isResumeCard = document.id === resumeSourceDocument?.id
    const handleOpen = () => {
      if (isResumeCard) {
        resumeFocusedSource()
        return
      }
      focusSourceLibrary(document.id)
    }

    return (
      <div className="recall-home-lead-card">
        <span className="recall-home-lead-card-topline">
          <span className="status-chip">{homeWorkspaceLeadLabel}</span>
          <span className="recall-library-row-overline">{document.source_type.toUpperCase()}</span>
        </span>
        <span className="recall-home-lead-card-copy">
          <strong>{document.title}</strong>
          <span>{homeWorkspaceLeadSummary}</span>
          <span className="recall-home-lead-card-note">{availableViewLabel}</span>
        </span>
        <span className="recall-home-lead-card-meta" role="list" aria-label={`${document.title} details`}>
          <span role="listitem">{getDocumentSourcePreview(document)}</span>
          <span>{updatedLabel}</span>
          <span role="listitem">{document.source_type.toUpperCase()}</span>
          <span role="listitem">{availableViewLabel}</span>
        </span>
        <div className="recall-home-lead-card-actions">
          <button
            aria-label={isResumeCard ? homeWorkspaceLeadActionLabel : `Open ${document.title}`}
            type="button"
            onClick={handleOpen}
          >
            {isResumeCard ? homeWorkspaceLeadActionLabel : 'Open source'}
          </button>
        </div>
      </div>
    )
  }

  function renderHomeContinueRow(document: RecallDocumentRecord) {
    const updatedLabel = homeDateFormatter.format(new Date(document.updated_at))
    const availableViewLabel = `${document.available_modes.length} ${document.available_modes.length === 1 ? 'view' : 'views'} ready`

    return (
      <button
        aria-label={`Open ${document.title}`}
        className="recall-home-continue-row"
        key={`continue:${document.id}`}
        type="button"
        onClick={() => focusSourceLibrary(document.id)}
      >
        <span className="recall-home-continue-row-main">
          <span className="recall-library-row-overline">{document.source_type.toUpperCase()}</span>
          <strong>{document.title}</strong>
          <span>{getDocumentSourcePreview(document)}</span>
        </span>
        <span className="recall-home-continue-row-meta">
          <span>{updatedLabel}</span>
          <span>{availableViewLabel}</span>
        </span>
      </button>
    )
  }

  function renderHomeLibraryStageRow(document: RecallDocumentRecord) {
    const updatedLabel = homeDateFormatter.format(new Date(document.updated_at))
    const availableViewLabel = `${document.available_modes.length} ${document.available_modes.length === 1 ? 'view' : 'views'} ready`

    return (
      <button
        aria-label={`Open ${document.title}`}
        className="recall-home-library-stage-row"
        key={`stage:${document.id}`}
        type="button"
        onClick={() => focusSourceLibrary(document.id)}
      >
        <span className="recall-home-library-stage-row-copy">
          <span className="recall-library-row-overline">{document.source_type.toUpperCase()}</span>
          <strong>{document.title}</strong>
          <span>{getDocumentSourcePreview(document)}</span>
        </span>
        <span className="recall-home-library-stage-row-meta">
          <span>{updatedLabel}</span>
          <span>{availableViewLabel}</span>
        </span>
      </button>
    )
  }

  function renderHomeLibrarySection(section: LibraryBrowseSection, options?: { stream?: boolean }) {
    const displayLimit = getHomeWorkspaceSectionDisplayLimit(section.key)
    const visibleSectionDocuments = expandedLibrarySectionKeys[section.key]
      ? section.documents
      : section.documents.slice(0, displayLimit)
    const isWideSection = section.key === 'earlier'
    const isStreamSection = options?.stream ?? false

    return (
      <section
        aria-label={section.label}
        className={[
          'recall-home-library-card',
          isWideSection ? 'recall-home-library-card-wide' : '',
          isStreamSection ? 'recall-home-library-card-stream' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        key={section.key}
      >
        <div className="section-header section-header-compact recall-home-library-card-header">
          <div>
            <div className="recall-library-section-heading-row">
              <h3>{section.label}</h3>
              <span className="recall-library-section-count">
                {formatCountLabel(section.documents.length, 'source', 'sources')}
              </span>
            </div>
            <p>{section.description}</p>
          </div>
        </div>
        <div className="recall-library-list recall-home-library-list" role="list">
          {visibleSectionDocuments.map((document) => renderLibrarySourceRow(document))}
        </div>
        {section.documents.length > displayLimit ? (
          <div className="recall-library-section-footer">
            <button
              className="ghost-button"
              type="button"
              onClick={() =>
                setExpandedLibrarySectionKeys((current) => ({
                  ...current,
                  [section.key]: !current[section.key],
                }))
              }
            >
              {expandedLibrarySectionKeys[section.key]
                ? `Show fewer ${section.label.toLowerCase()} sources`
                : `Show all ${section.documents.length} ${section.label.toLowerCase()} sources`}
            </button>
          </div>
        ) : null}
      </section>
    )
  }

  function renderCollapsedStudySupportStrip() {
    if (!collapsedStudyBrowseRail || studyStatus === 'error' || showFocusedStudySplitView) {
      return null
    }

    return (
      <div
        className="recall-study-toolbar-utility"
        aria-label="Browse study support"
      >
        <div className="recall-study-toolbar-glance" aria-label="Active study queue summary">
          <div className="recall-study-toolbar-glance-top">
            <span className="recall-study-toolbar-kicker">{collapsedStudyBrowseRailLabel}</span>
            <span className="recall-study-toolbar-meta">{collapsedStudyQueueOverview}</span>
          </div>
          {activeStudyCardCollapsedRailSummary ? (
            <span className="recall-study-toolbar-caption">{activeStudyCardCollapsedRailSummary}</span>
          ) : null}
          {activeStudyCard ? (
            <span className="recall-study-toolbar-caption">
              Grounded: {browseStudyEvidenceSummary}
            </span>
          ) : null}
        </div>
        <div className="recall-actions recall-actions-inline recall-study-toolbar-actions">
          <button
            aria-label="Show queue"
            className="ghost-button recall-study-sidebar-toggle-button"
            type="button"
            onClick={() => setBrowseDrawerOpen('study', true)}
          >
            Queue
          </button>
          {focusedStudySourceSpan ? (
            <button
              aria-label="Preview evidence"
              className="ghost-button recall-study-evidence-summary-button"
              type="button"
              onClick={() => setStudyEvidencePeekOpen(true)}
            >
              Preview evidence
            </button>
          ) : null}
          <button
            aria-label={studyBusyKey === 'generate' ? 'Refreshing cards' : 'Refresh cards'}
            className="ghost-button recall-study-sidebar-utility-button"
            disabled={studyBusyKey === 'generate'}
            type="button"
            onClick={handleGenerateStudyCards}
          >
            {studyBusyKey === 'generate' ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>
    )
  }

  function renderGraphQuickPick(node: KnowledgeNodeRecord) {
    const sourceDocumentCount = node.source_document_ids.length || node.document_count
    const quickPickGlance = node.aliases[0]?.trim() || formatCountLabel(sourceDocumentCount, 'source doc', 'source docs')
    const quickPickSummary = `${quickPickGlance} · ${formatCountLabel(node.mention_count, 'mention', 'mentions')}`

    return (
      <button
        key={node.id}
        aria-pressed={selectedNodeId === node.id}
        className={
          selectedNodeId === node.id
            ? 'recall-graph-quick-pick recall-graph-quick-pick-active'
            : 'recall-graph-quick-pick'
        }
        type="button"
        onClick={() => handleSelectGraphNode(node)}
        title={getGraphNodePreview(node)}
        >
        <span className="recall-graph-quick-pick-topline">
          <strong>{node.label}</strong>
          <span className="recall-graph-quick-pick-node-type">{node.node_type}</span>
        </span>
        <span className="recall-graph-quick-pick-summary">{quickPickSummary}</span>
        <span className="recall-graph-quick-pick-confidence">{Math.round(node.confidence * 100)}% confidence</span>
      </button>
    )
  }

  function renderBrowseGraphDetailDock() {
    type BrowseGraphMention = NonNullable<typeof selectedNodeDetail>['mentions'][number]
    type BrowseGraphSourceRun = {
      continuesPrimarySource?: boolean
      documentTitle: string
      mentions: BrowseGraphMention[]
      sourceDocumentId: string | null
      startIndex: number
    }

    const primarySourceDocumentId =
      selectedNodeDetail?.mentions[0]?.source_document_id ?? selectedNodeDetail?.node.source_document_ids[0] ?? null
    const primarySourceDocumentTitle = primarySourceDocumentId
      ? documentTitleById.get(primarySourceDocumentId) ?? 'Saved source'
      : null
    const primaryMention = selectedNodeDetail?.mentions[0] ?? null
    const graphDetailExpanded = Boolean(selectedNodeDetail) && graphDetailPeekOpen
    const selectedNodeSourceDocumentCount = selectedNodeDetail
      ? selectedNodeDetail.node.source_document_ids.length || selectedNodeDetail.node.document_count
      : 0
    const mentionSourceRuns = selectedNodeDetail
      ? selectedNodeDetail.mentions.reduce<BrowseGraphSourceRun[]>((runs, mention, index) => {
          const lastRun = runs[runs.length - 1]
          if (
            lastRun &&
            lastRun.sourceDocumentId === mention.source_document_id &&
            lastRun.documentTitle === mention.document_title
          ) {
            lastRun.mentions.push(mention)
            return runs
          }
          runs.push({
            documentTitle: mention.document_title,
            mentions: [mention],
            sourceDocumentId: mention.source_document_id,
            startIndex: index,
          })
          return runs
        }, [])
      : []
    const leadingSourceRun = mentionSourceRuns[0] ?? null
    const leadingMention = leadingSourceRun?.mentions[0] ?? primaryMention
    const continuationSourceRuns = mentionSourceRuns.reduce<BrowseGraphSourceRun[]>((runs, sourceRun, runIndex) => {
      const continuationMentions = runIndex === 0 ? sourceRun.mentions.slice(1) : sourceRun.mentions
      if (!continuationMentions.length) {
        return runs
      }
      runs.push({
        continuesPrimarySource: runIndex === 0,
        documentTitle: sourceRun.documentTitle,
        mentions: continuationMentions,
        sourceDocumentId: sourceRun.sourceDocumentId,
        startIndex: runIndex === 0 ? sourceRun.startIndex + 1 : sourceRun.startIndex,
      })
      return runs
    }, [])
    const visibleContinuationSourceRuns = graphDetailExpanded
      ? graphDetailMentionsExpanded
        ? continuationSourceRuns
        : continuationSourceRuns.slice(0, 2)
      : []
    const hiddenContinuationSourceRunCount = Math.max(
      continuationSourceRuns.length - visibleContinuationSourceRuns.length,
      0,
    )
    const continuationMentionCount = continuationSourceRuns.reduce(
      (total, sourceRun) => total + sourceRun.mentions.length,
      0,
    )
    const visibleRelations = selectedNodeDetail
      ? graphDetailExpanded
        ? graphDetailRelationsExpanded
          ? selectedNodeEdges
          : selectedNodeEdges.slice(0, 2)
        : []
      : []
    const graphDetailPeekCopy =
      leadingMention?.excerpt ??
      selectedNodeDetail?.node.description ??
      'Preview one grounded clue here, then expand only when you want the full evidence stack.'
    const graphDetailPeekLabel =
      leadingMention?.document_title ?? primarySourceDocumentTitle ?? selectedNodeDetail?.node.label ?? 'Grounded evidence'
    const graphDetailMetaSummary = selectedNodeDetail
      ? `${selectedNodeDetail.node.status} · ${Math.round(selectedNodeDetail.node.confidence * 100)}% confidence`
      : null
    const graphDetailFollowOnSummary = [
      continuationMentionCount
        ? formatCountLabel(continuationMentionCount, 'follow-on mention', 'follow-on mentions')
        : null,
      selectedNodeEdges.length ? formatCountLabel(selectedNodeEdges.length, 'relation', 'relations') : null,
    ]
      .filter(Boolean)
      .join(' · ')
    const graphDetailCountSummary = selectedNodeDetail
      ? [
          formatCountLabel(selectedNodeSourceDocumentCount, 'source doc', 'source docs'),
          formatCountLabel(selectedNodeDetail.mentions.length, 'mention', 'mentions'),
          formatCountLabel(selectedNodeEdges.length, 'relation', 'relations'),
        ].join(' · ')
      : null
    const graphDetailSelectedNodeCopy = selectedNodeDetail
      ? `${graphDetailCountSummary}. Start with one grounded clue, then expand the tray only when you need grouped continuation and nearby relations.`
      : 'Loading grounded evidence.'

    if (!selectedNodeDetail && !nodeDetailLoading) {
      return (
        <section
          aria-label="Node detail dock"
          className="recall-graph-detail-dock recall-graph-detail-dock-tray recall-graph-detail-dock-empty priority-surface-support-rail priority-surface-support-rail-strong"
        >
          <div className="recall-graph-detail-dock-header">
            <div className="recall-graph-detail-dock-heading">
              <span className="recall-graph-detail-dock-kicker">Inspect</span>
              <h3>Choose one node</h3>
              <p>Pick from the canvas or the filter strip to open one attached clue tray instead of a separate detail page.</p>
            </div>
          </div>
        </section>
      )
    }

    return (
      <section
        aria-label="Node detail dock"
        className={
          selectedNodeDetail
            ? graphDetailExpanded
              ? 'recall-graph-detail-dock recall-graph-detail-dock-tray recall-graph-detail-dock-expanded priority-surface-support-rail priority-surface-support-rail-strong'
              : 'recall-graph-detail-dock recall-graph-detail-dock-tray recall-graph-detail-dock-peek priority-surface-support-rail priority-surface-support-rail-strong'
            : 'recall-graph-detail-dock recall-graph-detail-dock-tray recall-graph-detail-dock-empty priority-surface-support-rail priority-surface-support-rail-strong'
        }
      >
        <div className="recall-graph-detail-dock-header">
          <div className="recall-graph-detail-dock-heading">
            <div className="recall-graph-detail-dock-topline">
              <div className="recall-graph-detail-dock-title-group">
                <span className="recall-graph-detail-dock-kicker">Inspect</span>
                <h3>{selectedNodeDetail ? selectedNodeDetail.node.label : 'Loading node detail'}</h3>
              </div>
              {selectedNodeDetail ? (
                <span className="recall-graph-detail-dock-meta-inline">
                  {selectedNodeDetail.node.node_type} · {Math.round(selectedNodeDetail.node.confidence * 100)}% confidence
                </span>
              ) : null}
            </div>
            {selectedNodeDetail ? (
              <div className="recall-graph-detail-dock-meta-row">
                <span className="status-chip recall-graph-detail-dock-chip-status">{selectedNodeDetail.node.status}</span>
                {graphDetailCountSummary ? (
                  <span className="recall-graph-detail-dock-meta-inline">{graphDetailCountSummary}</span>
                ) : null}
              </div>
            ) : null}
            <p>{selectedNodeDetail ? graphDetailSelectedNodeCopy : 'Loading source-grounded graph evidence.'}</p>
          </div>
          {selectedNodeDetail ? (
            <div className="recall-actions recall-actions-inline recall-graph-detail-dock-actions">
              {!graphDetailExpanded ? (
                <button type="button" onClick={() => setGraphDetailPeekOpen(true)}>
                  Expand tray
                </button>
              ) : (
                <>
                  <button
                    disabled={graphBusyKey === `node:${selectedNodeDetail.node.id}:confirmed`}
                    type="button"
                    onClick={() => handleDecideNode('confirmed')}
                  >
                    Confirm
                  </button>
                  <button
                    className="ghost-button"
                    disabled={graphBusyKey === `node:${selectedNodeDetail.node.id}:rejected`}
                    type="button"
                    onClick={() => handleDecideNode('rejected')}
                  >
                    Reject
                  </button>
                </>
              )}
              {primarySourceDocumentId ? (
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => focusSourceGraph(primarySourceDocumentId, selectedNodeDetail.node.id)}
                >
                  Focus source
                </button>
              ) : null}
              {primarySourceDocumentId && primarySourceDocumentTitle ? (
                <button
                  className="ghost-button"
                  aria-label={buildOpenReaderLabel(primarySourceDocumentTitle)}
                  type="button"
                  onClick={() => handleOpenDocumentInReader(primarySourceDocumentId)}
                >
                  Open source
                </button>
              ) : null}
              {graphDetailExpanded ? (
                <button
                  className="ghost-button recall-graph-detail-expand-button"
                  type="button"
                  onClick={() => setGraphDetailPeekOpen(false)}
                >
                  Collapse tray
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {nodeDetailLoading ? <p className="small-note">Loading node detail…</p> : null}
        {!nodeDetailLoading && selectedNodeDetail ? (
          <div
            className={
              graphDetailExpanded
                ? 'recall-graph-detail-dock-body recall-graph-detail-dock-body-expanded'
                : 'recall-graph-detail-dock-body recall-graph-detail-dock-body-peek'
            }
          >
            <div className="recall-graph-detail-flow">
              <article
                className={
                  graphDetailExpanded
                    ? 'recall-graph-detail-card recall-graph-detail-card-leading'
                    : 'recall-graph-detail-card recall-graph-detail-card-leading recall-graph-detail-card-leading-peek'
                }
              >
                <div className="recall-graph-detail-card-header">
                  <span className="recall-graph-detail-card-kicker">Grounded clue</span>
                  <strong>{graphDetailPeekLabel}</strong>
                  {leadingMention ? (
                    <span className="recall-graph-detail-card-confidence">
                      {Math.round(leadingMention.confidence * 100)}%
                    </span>
                  ) : graphDetailMetaSummary ? (
                    <span className="recall-graph-detail-card-confidence">{graphDetailMetaSummary}</span>
                  ) : null}
                </div>
                <p className="recall-graph-detail-card-copy">{graphDetailPeekCopy}</p>
                {leadingMention ? (
                  <div className="recall-graph-detail-card-meta">
                    <span className="status-chip">{leadingMention.entity_type}</span>
                    <span className="status-chip">{leadingMention.text}</span>
                    {leadingMention.chunk_id ? <span className="status-chip">Chunk evidence</span> : null}
                  </div>
                ) : null}
              </article>

              {graphDetailExpanded && (continuationSourceRuns.length || selectedNodeEdges.length) ? (
                <div className="recall-graph-detail-secondary-stack">
                  {continuationSourceRuns.length ? (
                    <section className="recall-graph-detail-follow-on">
                      <div className="recall-graph-detail-follow-on-header">
                        <div className="section-header section-header-compact">
                          <h3>Continuation</h3>
                          <p>Grouped by source so the tray stays readable.</p>
                        </div>
                        <div className="recall-graph-detail-follow-on-header-actions">
                          {graphDetailFollowOnSummary ? (
                            <span className="recall-graph-detail-follow-on-summary">{graphDetailFollowOnSummary}</span>
                          ) : null}
                          {continuationSourceRuns.length > 2 ? (
                            <button
                              className="ghost-button"
                              type="button"
                              onClick={() => setGraphDetailMentionsExpanded((current) => !current)}
                            >
                              {graphDetailMentionsExpanded ? 'Show less' : `Show all ${continuationSourceRuns.length}`}
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <div className="recall-graph-detail-follow-on-groups" role="list" aria-label="Selected node mentions">
                        {visibleContinuationSourceRuns.map((sourceRun) => {
                          const leadExcerpt = sourceRun.mentions[0]?.excerpt ?? 'Grounded evidence available.'
                          return (
                            <article
                              key={`graph-follow-on:${sourceRun.startIndex}:${sourceRun.documentTitle}`}
                              className={
                                sourceRun.continuesPrimarySource
                                  ? 'recall-graph-detail-follow-on-group recall-graph-detail-follow-on-group-same-source'
                                  : 'recall-graph-detail-follow-on-group'
                              }
                              role="listitem"
                            >
                              <div className="recall-graph-detail-follow-on-group-header">
                                <strong>{sourceRun.continuesPrimarySource ? 'Same source' : sourceRun.documentTitle}</strong>
                                <span>{formatCountLabel(sourceRun.mentions.length, 'mention', 'mentions')}</span>
                              </div>
                              <p className="recall-graph-detail-follow-on-group-copy">{leadExcerpt}</p>
                              {graphDetailMentionsExpanded && sourceRun.mentions.length > 1 ? (
                                <div className="recall-graph-detail-follow-on-group-list">
                                  {sourceRun.mentions.slice(1).map((mention) => (
                                    <span key={mention.id} className="recall-graph-detail-follow-on-group-list-item">
                                      {mention.excerpt}
                                    </span>
                                  ))}
                                </div>
                              ) : sourceRun.mentions.length > 1 ? (
                                <span className="recall-graph-detail-follow-on-group-note">
                                  +{sourceRun.mentions.length - 1} more from this source
                                </span>
                              ) : null}
                              {sourceRun.sourceDocumentId ? (
                                <div className="recall-actions recall-actions-inline recall-graph-detail-follow-on-group-actions">
                                  <button
                                    className="ghost-button"
                                    type="button"
                                    onClick={() => handleOpenDocumentInReader(sourceRun.sourceDocumentId as string)}
                                  >
                                    Open source
                                  </button>
                                </div>
                              ) : null}
                            </article>
                          )
                        })}
                        {hiddenContinuationSourceRunCount > 0 ? (
                          <div className="recall-graph-detail-follow-on-remainder" role="listitem">
                            {formatCountLabel(hiddenContinuationSourceRunCount, 'more grouped source run', 'more grouped source runs')} hidden until you expand them.
                          </div>
                        ) : null}
                      </div>
                    </section>
                  ) : null}

                  {selectedNodeEdges.length ? (
                    <section className="recall-graph-detail-relations">
                      <div className="recall-graph-detail-follow-on-header">
                        <div className="section-header section-header-compact">
                          <h3>Nearby relations</h3>
                          <p>Links stay attached beneath the main clue instead of becoming a separate stage.</p>
                        </div>
                        <div className="recall-graph-detail-follow-on-header-actions">
                          <span className="recall-graph-detail-follow-on-summary">
                            {formatCountLabel(selectedNodeEdges.length, 'relation', 'relations')}
                          </span>
                          {selectedNodeEdges.length > 2 ? (
                            <button
                              className="ghost-button"
                              type="button"
                              onClick={() => setGraphDetailRelationsExpanded((current) => !current)}
                            >
                              {graphDetailRelationsExpanded ? 'Show less' : `Show all ${selectedNodeEdges.length}`}
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <div className="recall-search-results recall-graph-detail-relation-list" role="list" aria-label="Selected node relations">
                        {visibleRelations.map((edge) => (
                          <div
                            key={`${selectedNodeDetail.node.id}:${edge.id}`}
                            className="recall-search-hit recall-edge-card recall-evidence-card recall-graph-detail-relation-card"
                            role="listitem"
                          >
                            <span className="recall-collection-row-head">
                              <strong>{edge.source_label} {formatRelationLabel(edge.relation_type)} {edge.target_label}</strong>
                              <span>{Math.round(edge.confidence * 100)}%</span>
                            </span>
                            {edge.excerpt ? <span className="recall-collection-row-preview">{edge.excerpt}</span> : null}
                            <span className="recall-collection-row-meta">
                              <span className="status-chip">{edge.status}</span>
                              <span className="status-chip">{edge.provenance}</span>
                              <span className="status-chip">{formatCountLabel(edge.evidence_count, 'evidence span', 'evidence spans')}</span>
                            </span>
                            <div className="recall-actions recall-actions-inline">
                              <button
                                disabled={graphBusyKey === `edge:${edge.id}:confirmed`}
                                type="button"
                                onClick={() => handleDecideEdge(edge, 'confirmed')}
                              >
                                Confirm
                              </button>
                              <button
                                className="ghost-button"
                                disabled={graphBusyKey === `edge:${edge.id}:rejected`}
                                type="button"
                                onClick={() => handleDecideEdge(edge, 'rejected')}
                              >
                                Reject
                              </button>
                              {edge.source_document_ids[0] ? (
                                <button
                                  className="ghost-button"
                                  type="button"
                                  onClick={() => handleOpenEdgeInReader(edge)}
                                >
                                  {buildOpenReaderLabel(documentTitleById.get(edge.source_document_ids[0]) ?? 'Saved source')}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    )
  }

  function renderFocusedGraphSection() {
    type FocusedGraphMention = NonNullable<typeof selectedNodeDetail>['mentions'][number]
    type FocusedGraphMentionSourceRun = {
      continuesPrimarySource?: boolean
      documentTitle: string
      mentions: FocusedGraphMention[]
      sourceDocumentId: string | null
      startIndex: number
    }
    type FocusedGraphMentionRenderState = {
      belongsToLeadingSourceCluster?: boolean
      bridgesLeadingSourceCluster?: boolean
      cardKey: string
      clustersLeadingSourceRun?: boolean
      continuesRepeatedSourceRun?: boolean
      deepensRepeatedSourceTail?: boolean
      isFollowOnRunLead?: boolean
      isFollowOnRunListItem?: boolean
      isLeadingMention?: boolean
      mention: FocusedGraphMention
      repeatsPreviousSource?: boolean
    }

    const focusedGraphAliases = selectedNodeDetail?.node.aliases.filter((alias) => alias.trim().length > 0) ?? []
    const focusedGraphLinkedLabels = selectedNodeDetail
      ? selectedNodeEdges
          .slice(0, 2)
          .map((edge) => getGraphEdgeCounterpartLabel(edge, selectedNodeDetail.node.id))
      : []
    const focusedGraphMoreNearbyCount = Math.max(selectedNodeEdges.length - focusedGraphLinkedLabels.length, 0)
    const hasFocusedGraphSupplementaryPanels =
      focusedGraphAliases.length > 0 || focusedGraphLinkedLabels.length > 0 || focusedGraphMoreNearbyCount > 0
    const focusedGraphMentionSourceRuns = selectedNodeDetail
      ? selectedNodeDetail.mentions.reduce<FocusedGraphMentionSourceRun[]>((runs, mention, index) => {
          const lastRun = runs[runs.length - 1]
          if (
            lastRun &&
            lastRun.sourceDocumentId === mention.source_document_id &&
            lastRun.documentTitle === mention.document_title
          ) {
            lastRun.mentions.push(mention)
            return runs
          }
          runs.push({
            documentTitle: mention.document_title,
            mentions: [mention],
            sourceDocumentId: mention.source_document_id,
            startIndex: index,
          })
          return runs
        }, [])
      : []
    const focusedGraphLeadingSourceRun = focusedGraphMentionSourceRuns[0] ?? null
    const focusedGraphLeadingMention = focusedGraphLeadingSourceRun?.mentions[0] ?? null
    const focusedGraphLeadingSourceRunLength = focusedGraphMentionSourceRuns[0]?.mentions.length ?? 0
    const focusedGraphContinuationSourceRuns = focusedGraphMentionSourceRuns.reduce<FocusedGraphMentionSourceRun[]>(
      (runs, sourceRun, runIndex) => {
        const continuationMentions = runIndex === 0 ? sourceRun.mentions.slice(1) : sourceRun.mentions
        if (!continuationMentions.length) {
          return runs
        }
        runs.push({
          continuesPrimarySource: runIndex === 0,
          documentTitle: sourceRun.documentTitle,
          mentions: continuationMentions,
          sourceDocumentId: sourceRun.sourceDocumentId,
          startIndex: runIndex === 0 ? sourceRun.startIndex + 1 : sourceRun.startIndex,
        })
        return runs
      },
      [],
    )
    const focusedGraphContinuationMentionCount = focusedGraphContinuationSourceRuns.reduce(
      (total, sourceRun) => total + sourceRun.mentions.length,
      0,
    )
    const focusedGraphFollowOnSummary = [
      focusedGraphContinuationMentionCount
        ? formatCountLabel(focusedGraphContinuationMentionCount, 'follow-on mention', 'follow-on mentions')
        : null,
      selectedNodeEdges.length ? formatCountLabel(selectedNodeEdges.length, 'relation', 'relations') : null,
    ]
      .filter(Boolean)
      .join(' · ')
    const focusedGraphHasFollowOnBundle =
      focusedGraphContinuationMentionCount > 0 || selectedNodeEdges.length > 0

    function renderFocusedGraphMentionCard({
      belongsToLeadingSourceCluster = false,
      bridgesLeadingSourceCluster = false,
      cardKey,
      clustersLeadingSourceRun = false,
      continuesRepeatedSourceRun = false,
      deepensRepeatedSourceTail = false,
      isFollowOnRunLead = false,
      isFollowOnRunListItem = false,
      isLeadingMention = false,
      mention,
      repeatsPreviousSource = false,
    }: FocusedGraphMentionRenderState) {
      const mergeRepeatSourceUtilitySeam = !isLeadingMention && repeatsPreviousSource

      return (
        <div
          key={cardKey}
          className={
            isLeadingMention
              ? [
                  'recall-search-hit',
                  'recall-evidence-card',
                  'recall-graph-focused-mention-card',
                  'recall-graph-focused-mention-card-leading',
                  clustersLeadingSourceRun ? 'recall-graph-focused-mention-card-leading-source-clustered' : '',
                ]
                  .filter(Boolean)
                  .join(' ')
              : [
                  'recall-search-hit',
                  'recall-evidence-card',
                  'recall-graph-focused-mention-card',
                  'recall-graph-focused-mention-card-trailing',
                  repeatsPreviousSource ? 'recall-graph-focused-mention-card-repeat-source' : '',
                  continuesRepeatedSourceRun ? 'recall-graph-focused-mention-card-repeat-source-continuation' : '',
                  deepensRepeatedSourceTail ? 'recall-graph-focused-mention-card-repeat-source-deep-tail' : '',
                  isFollowOnRunLead ? 'recall-graph-focused-mention-card-follow-on-lead' : '',
                  isFollowOnRunListItem ? 'recall-graph-focused-mention-card-follow-on-list-item' : '',
                  belongsToLeadingSourceCluster ? 'recall-graph-focused-mention-card-leading-source-continuation' : '',
                  bridgesLeadingSourceCluster ? 'recall-graph-focused-mention-card-leading-source-bridge' : '',
                ]
                  .filter(Boolean)
                  .join(' ')
          }
          role="listitem"
        >
          <span className="recall-collection-row-head">
            <strong title={repeatsPreviousSource ? mention.document_title : undefined}>
              {repeatsPreviousSource ? 'Same source' : mention.document_title}
            </strong>
            {!mergeRepeatSourceUtilitySeam ? (
              <span
                className={
                  isLeadingMention
                    ? 'recall-graph-focused-mention-confidence'
                    : 'recall-graph-focused-mention-confidence recall-graph-focused-mention-confidence-trailing'
                }
              >
                {Math.round(mention.confidence * 100)}%
              </span>
            ) : null}
          </span>
          <span className="recall-collection-row-preview">{mention.excerpt}</span>
          <span
            className={
              isLeadingMention
                ? 'recall-collection-row-meta recall-graph-focused-mention-meta-leading'
                : 'recall-collection-row-meta'
            }
          >
            <span className="status-chip">{mention.entity_type}</span>
            <span className="status-chip">{mention.text}</span>
            {mention.chunk_id ? <span className="status-chip">Chunk evidence</span> : null}
          </span>
          <div
            className={
              isLeadingMention
                ? 'recall-actions recall-actions-inline recall-graph-focused-evidence-actions recall-graph-focused-evidence-actions-leading'
                : [
                    'recall-actions',
                    'recall-actions-inline',
                    'recall-graph-focused-evidence-actions',
                    'recall-graph-focused-evidence-actions-trailing',
                    mergeRepeatSourceUtilitySeam ? 'recall-graph-focused-evidence-actions-repeat-source' : '',
                    continuesRepeatedSourceRun ? 'recall-graph-focused-evidence-actions-repeat-source-continuation' : '',
                    deepensRepeatedSourceTail ? 'recall-graph-focused-evidence-actions-repeat-source-deep-tail' : '',
                    belongsToLeadingSourceCluster ? 'recall-graph-focused-evidence-actions-leading-source-continuation' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')
            }
          >
            {mergeRepeatSourceUtilitySeam ? (
              <span
                className={[
                  'recall-graph-focused-mention-confidence',
                  'recall-graph-focused-mention-confidence-trailing',
                  'recall-graph-focused-mention-confidence-inline',
                  continuesRepeatedSourceRun ? 'recall-graph-focused-mention-confidence-inline-continuation' : '',
                  deepensRepeatedSourceTail ? 'recall-graph-focused-mention-confidence-inline-deep-tail' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {Math.round(mention.confidence * 100)}%
              </span>
            ) : null}
            {mention.source_document_id === activeSourceDocumentId ? (
              <button
                aria-label={buildShowReaderLabel(mention.document_title)}
                className="recall-graph-focused-evidence-button recall-graph-focused-evidence-button-show"
                type="button"
                onClick={() =>
                  handleShowGraphEvidenceInFocusedReader(
                    `mention:${mention.id}`,
                    mention.source_document_id,
                  )
                }
              >
                Show
              </button>
            ) : null}
            <button
              aria-label={buildOpenReaderLabel(mention.document_title)}
              className="ghost-button recall-graph-focused-evidence-button recall-graph-focused-evidence-button-open"
              type="button"
              onClick={() => handleOpenMentionInReader(mention.source_document_id)}
            >
              {isLeadingMention ? 'Reader' : 'Open'}
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="recall-grid recall-grid-browse-condensed recall-focused-split-grid recall-focused-split-grid-graph-readable recall-focused-split-grid-graph-milestone-reset">
        <section className="card stack-gap recall-collection-rail recall-collection-rail-condensed recall-source-side-rail recall-graph-focus-rail">
          <div className="toolbar recall-collection-toolbar">
            <div className="section-header section-header-compact">
              <h2>Graph</h2>
              <p>Keep the active node nearby while live reading stays primary.</p>
            </div>
            <button className="ghost-button" type="button" onClick={() => setBrowseDrawerOpen('graph', true)}>
              Browse
            </button>
          </div>
          <div className="recall-browse-drawer-summary stack-gap">
            <div className="recall-detail-panel recall-browse-summary-card recall-graph-focus-summary">
              <strong>{selectedNodeDetail?.node.label ?? 'No active node for this source'}</strong>
              <span>
                {selectedNodeDetail
                  ? selectedNodeDetail.node.description ?? formatCountLabel(selectedNodeEdges.length, 'relation', 'relations')
                  : 'Open browsing when you want to bring graph evidence from this source into view.'}
              </span>
            </div>
          </div>
        </section>

        <div className="recall-main-column recall-source-split-layout recall-source-split-layout-graph-focused recall-source-split-layout-graph-focused-density-reset recall-source-split-layout-graph-focused-rail-readable recall-source-split-layout-graph-focused-text-wall-reset recall-source-split-layout-graph-focused-milestone-reset">
          {renderFocusedReaderPane()}
          <section className="card stack-gap recall-source-secondary-panel recall-graph-focused-detail recall-graph-focused-detail-bundled recall-graph-focused-detail-hierarchy-reset recall-graph-focused-detail-density-reset recall-graph-focused-detail-rail-readable recall-graph-focused-detail-milestone-reset">
            <div className="toolbar recall-collection-toolbar recall-graph-focused-detail-toolbar recall-graph-focused-detail-toolbar-rail-readable">
              <div className="section-header section-header-compact recall-graph-focused-detail-heading">
                <h2>Node detail</h2>
                <p>
                  {selectedNodeDetail
                    ? 'Review grounded mentions and relation suggestions beside the live source.'
                    : 'Choose a node to inspect its grounded evidence.'}
                </p>
              </div>
              {selectedNodeDetail ? (
                <div className="recall-actions recall-graph-focused-detail-actions recall-graph-focused-detail-decision-row">
                  <button
                    aria-label="Confirm node"
                    className="recall-graph-focused-detail-button recall-graph-focused-detail-button-confirm"
                    disabled={graphBusyKey === `node:${selectedNodeDetail.node.id}:confirmed`}
                    type="button"
                    onClick={() => handleDecideNode('confirmed')}
                  >
                    Confirm
                  </button>
                  <button
                    aria-label="Reject node"
                    className="ghost-button recall-graph-focused-detail-button recall-graph-focused-detail-button-reject"
                    disabled={graphBusyKey === `node:${selectedNodeDetail.node.id}:rejected`}
                    type="button"
                    onClick={() => handleDecideNode('rejected')}
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </div>

            {nodeDetailLoading ? <p className="small-note">Loading node detail…</p> : null}
            {!nodeDetailLoading && !selectedNodeDetail ? (
              <div className="recall-surface-state recall-source-secondary-empty">
                <p>Select a graph node from this source to inspect its evidence here.</p>
              </div>
            ) : null}
            {!nodeDetailLoading && selectedNodeDetail ? (
              <div className="stack-gap recall-graph-focused-detail-stack recall-graph-focused-detail-stack-hierarchy-reset">
                <section
                  className={
                    hasFocusedGraphSupplementaryPanels
                      ? 'recall-graph-focus-stage recall-graph-focus-stage-primary recall-graph-focus-stage-glance recall-graph-focus-stage-glance-rich recall-graph-focus-stage-glance-rail'
                      : 'recall-graph-focus-stage recall-graph-focus-stage-primary recall-graph-focus-stage-primary-compact recall-graph-focus-stage-glance recall-graph-focus-stage-glance-rich recall-graph-focus-stage-glance-rail'
                  }
                  aria-label="Graph stage"
                >
                  <div className="recall-graph-focus-stage-copy">
                    <span className="status-chip">Selected node</span>
                    <h3>{selectedNodeDetail.node.label}</h3>
                    <p>
                      {selectedNodeDetail.node.description ??
                        'Inspect the closest concepts and supporting relations before confirming this node.'}
                    </p>
                  </div>
                  <div className="recall-hero-metrics recall-graph-focus-stage-meta" role="list" aria-label="Selected node summary">
                    <span className="status-chip recall-graph-focus-stage-chip recall-graph-focus-stage-chip-status" role="listitem">
                      {selectedNodeDetail.node.status}
                    </span>
                    <span className="status-chip status-muted recall-graph-focus-stage-chip" role="listitem">
                      {selectedNodeDetail.node.node_type}
                    </span>
                    <span
                      className="status-chip status-muted recall-graph-focus-stage-chip recall-graph-focus-stage-chip-confidence"
                      role="listitem"
                    >
                      {Math.round(selectedNodeDetail.node.confidence * 100)}% confidence
                    </span>
                    <span className="status-chip status-muted recall-graph-focus-stage-chip" role="listitem">
                      {formatCountLabel(selectedNodeDetail.mentions.length, 'mention', 'mentions')}
                    </span>
                    <span className="status-chip status-muted recall-graph-focus-stage-chip" role="listitem">
                      {formatCountLabel(selectedNodeEdges.length, 'relation', 'relations')}
                    </span>
                  </div>
                  {hasFocusedGraphSupplementaryPanels ? (
                    <div className="recall-graph-focus-stage-grid">
                      {focusedGraphAliases.length ? (
                        <div className="recall-detail-panel recall-graph-focus-stage-panel">
                          <strong>Aliases</strong>
                          <span>{focusedGraphAliases.join(', ')}</span>
                        </div>
                      ) : null}
                      {focusedGraphLinkedLabels.length ? (
                        <div className="recall-detail-panel recall-graph-focus-stage-panel">
                          <strong>Linked concepts</strong>
                          <span>{focusedGraphLinkedLabels.join(' • ')}</span>
                        </div>
                      ) : null}
                      {focusedGraphMoreNearbyCount > 0 ? (
                        <div className="recall-detail-panel recall-graph-focus-stage-panel">
                          <strong>More nearby</strong>
                          <span>{formatCountLabel(focusedGraphMoreNearbyCount, 'additional relation', 'additional relations')}</span>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </section>

                <div
                  className={[
                    'stack-gap',
                    'recall-graph-focused-evidence-flow-bundle',
                    'recall-graph-focused-evidence-flow-readable',
                    focusedGraphHasFollowOnBundle ? 'recall-graph-focused-evidence-flow-bundle-fused' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div
                    className={[
                      'stack-gap',
                        'recall-graph-focused-detail-section',
                        'recall-graph-focused-detail-section-leading',
                        'recall-graph-focused-detail-section-leading-clue',
                        'recall-graph-focused-detail-section-leading-density-reset',
                        focusedGraphLeadingSourceRunLength > 0
                          ? 'recall-graph-focused-detail-section-leading-entry-softened'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    >
                      <div className="section-header section-header-compact recall-graph-focused-mentions-entry">
                      <h3>Grounded clue</h3>
                      <span className="recall-graph-focused-mentions-entry-summary">
                        {focusedGraphLeadingMention?.document_title ??
                          formatCountLabel(selectedNodeDetail.mentions.length, 'grounded mention', 'grounded mentions')}
                      </span>
                      <p>Start with the strongest grounded clue, then move into grouped follow-on evidence and relations only when you need more context.</p>
                    </div>
                    <div
                      className={[
                        'recall-search-results',
                        'recall-graph-focused-mention-list',
                        focusedGraphLeadingSourceRunLength > 1 ? 'recall-graph-focused-mention-list-leading-clustered' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      role="list"
                    >
                      {focusedGraphLeadingMention ? (
                        <div
                          className={[
                            'recall-graph-focused-mention-source-run',
                            'recall-graph-focused-mention-source-run-leading',
                            focusedGraphLeadingSourceRunLength > 1 ? 'recall-graph-focused-mention-source-run-leading-cluster' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          role="presentation"
                        >
                          {renderFocusedGraphMentionCard({
                            cardKey: focusedGraphLeadingMention.id,
                            clustersLeadingSourceRun: focusedGraphLeadingSourceRunLength > 1,
                            isLeadingMention: true,
                            mention: focusedGraphLeadingMention,
                          })}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {focusedGraphHasFollowOnBundle ? (
                    <div
                      className={[
                        'stack-gap',
                        'recall-graph-focused-detail-section',
                        'recall-graph-focused-detail-section-follow-on',
                        'recall-graph-focused-detail-section-follow-on-bundle',
                        'recall-graph-focused-detail-section-follow-on-milestone',
                        'recall-graph-focused-detail-section-follow-on-text-wall-reset',
                      ].join(' ')}
                    >
                      <div className="section-header section-header-compact recall-graph-focused-follow-on-entry">
                        <h3>More evidence</h3>
                        {focusedGraphFollowOnSummary ? (
                          <span className="recall-graph-focused-follow-on-entry-summary">{focusedGraphFollowOnSummary}</span>
                        ) : null}
                        <p>Follow-on excerpts and nearby relations stay grouped here as one quieter support flow beside Reader.</p>
                      </div>

                      {focusedGraphContinuationSourceRuns.length ? (
                        <div className="stack-gap recall-graph-focused-follow-on-body recall-graph-focused-follow-on-body-readable">
                          <div
                            className={[
                              'recall-search-results',
                              'recall-graph-focused-mention-list',
                              'recall-graph-focused-mention-list-follow-on',
                            ].join(' ')}
                            role="list"
                          >
                            {focusedGraphContinuationSourceRuns.map((sourceRun) => (
                              (() => {
                                const [leadMention, ...trailMentions] = sourceRun.mentions
                                if (!leadMention) {
                                  return null
                                }

                                return (
                                  <div
                                    key={`follow-on-source-run:${sourceRun.startIndex}:${sourceRun.documentTitle}`}
                                    className={[
                                      'recall-graph-focused-mention-source-run',
                                      'recall-graph-focused-mention-source-run-follow-on',
                                      'recall-graph-focused-follow-on-run-card',
                                      'recall-graph-focused-follow-on-run-card-text-wall-reset',
                                      sourceRun.mentions.length > 1 ? 'recall-graph-focused-mention-source-run-repeated' : '',
                                      sourceRun.continuesPrimarySource ? 'recall-graph-focused-follow-on-run-card-same-source' : '',
                                      sourceRun.continuesPrimarySource
                                        ? 'recall-graph-focused-mention-source-run-follow-on-same-source'
                                        : '',
                                    ]
                                      .filter(Boolean)
                                      .join(' ')}
                                    role="presentation"
                                  >
                                    <div className="recall-graph-focused-follow-on-run-header">
                                      <strong>{sourceRun.continuesPrimarySource ? 'Same source' : sourceRun.documentTitle}</strong>
                                      <span>{formatCountLabel(sourceRun.mentions.length, 'grounded mention', 'grounded mentions')}</span>
                                    </div>
                                    <div
                                      className={[
                                        'recall-graph-focused-follow-on-run-body',
                                        'recall-graph-focused-follow-on-run-body-text-wall-reset',
                                        sourceRun.continuesPrimarySource ? 'recall-graph-focused-follow-on-run-body-same-source' : '',
                                        trailMentions.length ? 'recall-graph-focused-follow-on-run-body-has-trail' : '',
                                      ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    >
                                      {renderFocusedGraphMentionCard({
                                        belongsToLeadingSourceCluster: Boolean(sourceRun.continuesPrimarySource),
                                        bridgesLeadingSourceCluster: Boolean(sourceRun.continuesPrimarySource),
                                        cardKey: `follow-on-mention:${sourceRun.startIndex}:${leadMention.id}`,
                                        continuesRepeatedSourceRun: false,
                                        deepensRepeatedSourceTail: false,
                                        isFollowOnRunLead: true,
                                        isFollowOnRunListItem: false,
                                        mention: leadMention,
                                        repeatsPreviousSource: Boolean(sourceRun.continuesPrimarySource),
                                      })}
                                      {trailMentions.length ? (
                                        <div
                                          className={[
                                            'recall-graph-focused-follow-on-trail',
                                            sourceRun.continuesPrimarySource
                                              ? 'recall-graph-focused-follow-on-trail-same-source'
                                              : '',
                                            trailMentions.length > 3 ? 'recall-graph-focused-follow-on-trail-deep' : '',
                                          ]
                                            .filter(Boolean)
                                            .join(' ')}
                                        >
                                          {trailMentions.map((mention, trailIndex) => {
                                            const mentionIndex = trailIndex + 1
                                            const repeatsPreviousSource = Boolean(sourceRun.continuesPrimarySource) || mentionIndex > 0
                                            const continuesRepeatedSourceRun = sourceRun.continuesPrimarySource
                                              ? mentionIndex > 0
                                              : mentionIndex > 1
                                            const deepensRepeatedSourceTail = sourceRun.continuesPrimarySource
                                              ? mentionIndex > 1
                                              : mentionIndex > 2

                                            return renderFocusedGraphMentionCard({
                                              belongsToLeadingSourceCluster: false,
                                              bridgesLeadingSourceCluster: false,
                                              cardKey: `follow-on-mention:${sourceRun.startIndex}:${mention.id}`,
                                              continuesRepeatedSourceRun,
                                              deepensRepeatedSourceTail,
                                              isFollowOnRunLead: false,
                                              isFollowOnRunListItem: true,
                                              mention,
                                              repeatsPreviousSource,
                                            })
                                          })}
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                )
                              })()
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {selectedNodeEdges.length ? (
                        <div
                          className={[
                            'stack-gap',
                            'recall-graph-focused-detail-section',
                            'recall-graph-focused-detail-section-relations',
                            'recall-graph-focused-detail-section-relations-follow-on',
                            'recall-graph-focused-detail-section-relations-readable',
                            'recall-graph-focused-detail-section-relations-text-wall-reset',
                          ].join(' ')}
                        >
                          <div className="section-header section-header-compact">
                            <h3>Relations</h3>
                            <p>Confirm or reject inferred links while keeping the supporting source evidence beside live reading.</p>
                          </div>
                          <div className="recall-search-results recall-graph-focused-relation-list" role="list">
                            {selectedNodeEdges.map((edge) => (
                              <div
                                key={`${selectedNodeDetail.node.id}:${edge.id}`}
                                className="recall-search-hit recall-edge-card recall-evidence-card"
                                role="listitem"
                              >
                                <span className="recall-collection-row-head">
                                  <strong>{edge.source_label} {formatRelationLabel(edge.relation_type)} {edge.target_label}</strong>
                                  <span>{Math.round(edge.confidence * 100)}%</span>
                                </span>
                                {edge.excerpt ? <span className="recall-collection-row-preview">{edge.excerpt}</span> : null}
                                <span className="recall-collection-row-meta">
                                  <span className="status-chip">{edge.status}</span>
                                  <span className="status-chip">{edge.provenance}</span>
                                  <span className="status-chip">{formatCountLabel(edge.evidence_count, 'evidence span', 'evidence spans')}</span>
                                  {edge.source_document_ids[0] ? (
                                    <span className="status-chip">
                                      {documentTitleById.get(edge.source_document_ids[0]) ?? 'Saved source'}
                                    </span>
                                  ) : null}
                                </span>
                                <div className="recall-actions recall-actions-inline">
                                  <button
                                    disabled={graphBusyKey === `edge:${edge.id}:confirmed`}
                                    type="button"
                                    onClick={() => handleDecideEdge(edge, 'confirmed')}
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    className="ghost-button"
                                    disabled={graphBusyKey === `edge:${edge.id}:rejected`}
                                    type="button"
                                    onClick={() => handleDecideEdge(edge, 'rejected')}
                                  >
                                    Reject
                                  </button>
                                  {activeSourceDocumentId && edge.source_document_ids.includes(activeSourceDocumentId) ? (
                                    <button
                                      type="button"
                                      onClick={() => handleShowGraphEvidenceInFocusedReader(`edge:${edge.id}`, activeSourceDocumentId)}
                                    >
                                      {buildShowReaderLabel(documentTitleById.get(activeSourceDocumentId) ?? 'Saved source')}
                                    </button>
                                  ) : null}
                                  {edge.source_document_ids[0] ? (
                                    <button
                                      className="ghost-button"
                                      type="button"
                                      onClick={() => handleOpenEdgeInReader(edge)}
                                    >
                                      {buildOpenReaderLabel(documentTitleById.get(edge.source_document_ids[0]) ?? 'Saved source')}
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    )
  }

  function renderGraphBrowseSection() {
    const graphSelectedNodeSummary = selectedNodeDetail
      ? [
          formatCountLabel(selectedNodeDetail.mentions.length, 'mention', 'mentions'),
          formatCountLabel(selectedNodeEdges.length, 'relation', 'relations'),
        ].join(' · ')
      : `${graphSnapshot?.nodes.length ?? 0} nodes ready for review.`
    const graphSelectedNodeSourceLabel =
      selectedNodeDetail?.mentions[0]?.document_title ??
      (selectedNodeDetail?.node.source_document_ids[0]
        ? documentTitleById.get(selectedNodeDetail.node.source_document_ids[0]) ?? 'Saved source'
        : null)
    const graphHeaderGuide = selectedNodeDetail
      ? 'Canvas leads, while one attached inspect tray keeps the grounded clue and grouped follow-on evidence nearby.'
      : 'Browse the map first, then open one attached tray only when you want grounded evidence and nearby relations.'

    return (
      <div className="recall-graph-browser-layout recall-graph-browser-layout-milestone-reset">
        <div className="recall-graph-browser-header recall-graph-browser-header-finish priority-surface-stage-shell">
          <div
            className="recall-graph-browser-surface-intro recall-graph-browser-surface-intro-milestone"
            aria-label="Graph surface intro"
          >
            <span className="eyebrow">Graph workspace</span>
            <strong>{selectedNodeDetail ? 'Canvas leads. Inspect in one tray.' : 'Graph canvas first.'}</strong>
            <span>{graphHeaderGuide}</span>
          </div>
          <div className="recall-graph-browser-header-utility">
            <div className="recall-graph-browser-header-meta" role="list" aria-label="Graph metrics">
              <span className="status-chip" role="listitem">{graphSidebarGlanceLabel}</span>
              <span className="status-chip status-muted" role="listitem">{graphSidebarGlanceMeta}</span>
            </div>
            {selectedNodeDetail ? (
              <div className="recall-graph-browser-header-selected" aria-label="Selected node overview">
                <span className="recall-graph-browser-node-peek-kicker">Inspecting</span>
                <strong>{selectedNodeDetail.node.label}</strong>
                <span>{graphSelectedNodeSummary}</span>
                {graphSelectedNodeSourceLabel ? (
                  <span className="recall-graph-browser-node-peek-source">{graphSelectedNodeSourceLabel}</span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div
          className={
            graphBrowseDrawerOpen
              ? 'recall-graph-browser-workspace recall-graph-browser-workspace-tools-open'
              : 'recall-graph-browser-workspace recall-graph-browser-workspace-tools-collapsed'
          }
        >
          {graphBrowseDrawerOpen ? (
            <aside aria-label="Graph selector strip" className="recall-graph-browser-utility-strip">
              <div className="recall-graph-browser-utility-shell recall-graph-browser-utility-shell-finish priority-surface-support-rail">
                <div className="recall-graph-browser-utility-shell-topline">
                  <div className="recall-graph-browser-utility-header" aria-label="Graph glance">
                    <span className="recall-graph-browser-node-peek-kicker">Browse</span>
                    <strong>{graphSidebarGlanceLabel}</strong>
                    <span>{graphSidebarGlanceMeta}</span>
                  </div>
                  <button
                    aria-label="Hide graph selector strip"
                    className="ghost-button recall-graph-sidebar-toggle"
                    type="button"
                    onClick={() => setBrowseDrawerOpen('graph', false)}
                  >
                    Hide
                  </button>
                </div>
                <div className="recall-graph-browser-utility-controls">
                  <label className="field recall-inline-field recall-graph-sidebar-search">
                    <span className="visually-hidden">Find nodes</span>
                    <input
                      aria-label="Find nodes"
                      type="search"
                      placeholder="Search node, type, or alias"
                      value={graphFilterQuery}
                      onChange={(event) => setGraphFilterQuery(event.target.value)}
                    />
                  </label>
                </div>
                <div className="recall-graph-browser-node-peek recall-graph-browser-node-peek-selected-strip">
                  <span className="recall-graph-browser-node-peek-kicker">Current node</span>
                  <strong>{selectedNodeDetail?.node.label ?? 'No node pinned yet'}</strong>
                  <span>{selectedNodeDetail ? graphSelectedNodeSummary : 'Pick from the map or the list to inspect one clue.'}</span>
                  {graphSelectedNodeSourceLabel ? (
                    <span className="recall-graph-browser-node-peek-source">{graphSelectedNodeSourceLabel}</span>
                  ) : null}
                </div>
                <div className="recall-graph-browser-utility-list-head">
                  <strong>{graphQuickPickSectionLabel}</strong>
                  <span>
                    {graphFilterActive && graphQuickPickSectionNote
                      ? graphQuickPickSectionNote
                      : 'Pick a node from the list or the canvas.'}
                  </span>
                </div>
                <div className="recall-graph-quick-picks" role="list" aria-label={graphQuickPickSectionLabel}>
                  {graphLoading ? <p className="small-note recall-graph-sidebar-status">Loading nodes…</p> : null}
                  {!graphLoading && graphStatus === 'error' ? (
                    <p className="small-note recall-graph-sidebar-status">Graph unavailable.</p>
                  ) : null}
                  {!graphLoading && graphStatus !== 'error' && !graphSnapshot?.nodes.length ? (
                    <p className="small-note recall-graph-sidebar-status">No nodes yet.</p>
                  ) : null}
                  {!graphLoading && graphStatus !== 'error' && graphSnapshot?.nodes.length && !filteredGraphNodes.length ? (
                    <p className="small-note recall-graph-sidebar-status">No matches yet.</p>
                  ) : null}
                  {graphQuickPickNodes.map((node) => renderGraphQuickPick(node))}
                </div>
              </div>
            </aside>
          ) : (
            <div className="recall-graph-browser-collapsed-utility">
              <button
                aria-label="Show graph selector strip"
                className="ghost-button"
                type="button"
                onClick={() => setBrowseDrawerOpen('graph', true)}
              >
                Show graph tools
              </button>
              <div className="recall-graph-browser-node-peek recall-graph-browser-node-peek-inline">
                <span className="recall-graph-browser-node-peek-kicker">Selected</span>
                <strong>{selectedNodeDetail?.node.label ?? 'Graph canvas ready'}</strong>
                <span>{graphSelectedNodeSummary}</span>
              </div>
            </div>
          )}

          <section className="stack-gap recall-graph-browser-surface recall-graph-browser-surface-unboxed recall-graph-browser-surface-milestone-reset">

          {graphLoading ? <div className="recall-library-inline-state" role="status">Loading graph canvas…</div> : null}
          {!graphLoading && graphStatus === 'error' ? (
            <div className="recall-library-inline-state" role="alert">
              <p>The knowledge graph is unavailable until the local service reconnects.</p>
              <button className="ghost-button" type="button" onClick={handleRetryRecallLoading}>
                Retry loading
              </button>
            </div>
          ) : null}
          {!graphLoading && graphStatus !== 'error' && !graphSnapshot?.nodes.length ? (
            <div className="recall-library-inline-state">
              <p>Import more source material to give the graph stronger concepts and relations.</p>
            </div>
          ) : null}
          {!graphLoading && graphStatus !== 'error' && (graphSnapshot?.nodes.length ?? 0) > 0 && !filteredGraphNodes.length ? (
            <div className="recall-library-inline-state">
              <p>No nodes match that filter. Try another label, type, or alias.</p>
            </div>
          ) : null}

          {!graphLoading && graphStatus !== 'error' && graphCanvasNodes.length > 0 ? (
            <div className="recall-graph-browser-stage recall-graph-browser-stage-milestone-reset">
              <div className="recall-graph-canvas-shell recall-graph-canvas-shell-finish">
                <div className="recall-graph-canvas" aria-label="Knowledge graph canvas" role="region">
                  <div className="recall-graph-canvas-grid" aria-hidden="true" />
                  <svg
                    aria-hidden="true"
                    className="recall-graph-canvas-svg"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 100"
                  >
                    {graphCanvasEdges.map((edge) => {
                      const sourcePosition = graphCanvasNodePositionById.get(edge.source_id)
                      const targetPosition = graphCanvasNodePositionById.get(edge.target_id)
                      if (!sourcePosition || !targetPosition) {
                        return null
                      }
                      const edgeFocused = edge.source_id === graphCanvasFocusNodeId || edge.target_id === graphCanvasFocusNodeId
                      return (
                        <line
                          key={edge.id}
                          className={edgeFocused ? 'recall-graph-edge recall-graph-edge-focused' : 'recall-graph-edge'}
                          x1={sourcePosition.x}
                          x2={targetPosition.x}
                          y1={sourcePosition.y}
                          y2={targetPosition.y}
                        />
                      )
                    })}
                  </svg>
                  <div className="recall-graph-node-layer">
                    {graphCanvasNodes.map(({ emphasis, node, x, y }) => {
                      const className = [
                        'recall-graph-node-button',
                        emphasis === 'focus'
                          ? 'recall-graph-node-button-focus'
                          : emphasis === 'linked'
                            ? 'recall-graph-node-button-linked'
                            : 'recall-graph-node-button-ambient',
                        selectedNodeId === node.id ? 'recall-graph-node-button-active' : '',
                        activeSourceDocumentId && node.source_document_ids.includes(activeSourceDocumentId)
                          ? 'recall-graph-node-button-source-backed'
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')
                      return (
                        <button
                          key={node.id}
                          aria-label={`Select node ${node.label}`}
                          aria-pressed={selectedNodeId === node.id}
                          className={className}
                          style={{ left: `${x}%`, top: `${y}%` }}
                          type="button"
                          onClick={() => handleSelectGraphNode(node)}
                        >
                          <strong>{node.label}</strong>
                          <span>{node.node_type}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="recall-graph-canvas-shell-footer">
                  <div className="recall-graph-browser-legend" role="list" aria-label="Graph legend">
                    <span className="status-chip" role="listitem">Center node: active focus</span>
                    <span className="status-chip status-muted" role="listitem">Inner orbit: directly linked</span>
                    <span className="status-chip status-muted" role="listitem">Outer orbit: nearby concepts</span>
                  </div>
                </div>
                {renderBrowseGraphDetailDock()}
              </div>
            </div>
          ) : null}
        </section>
        </div>
      </div>
    )
  }

  function renderGraphSection() {
    return showFocusedGraphSplitView ? renderFocusedGraphSection() : renderGraphBrowseSection()
  }

  function renderStudyQueuePreviewRow(card: StudyCardRecord) {
    return (
      <button
        key={card.id}
        aria-pressed={activeStudyCard?.id === card.id}
        className={
          activeStudyCard?.id === card.id
            ? 'recall-study-queue-preview-row recall-study-queue-preview-row-active'
            : 'recall-study-queue-preview-row'
        }
        type="button"
        onClick={() => handleSelectStudyCard(card)}
      >
        <span className="recall-study-queue-preview-row-head">
          <strong>{card.prompt}</strong>
          <span className="recall-study-queue-preview-row-status">{formatStudyStatus(card.status)}</span>
        </span>
        <span className="recall-study-queue-preview-row-preview">{getStudyCardPreview(card)}</span>
        <span className="recall-study-queue-preview-row-meta">
          <span>{card.card_type}</span>
          <span>Due {dateFormatter.format(new Date(card.due_at))}</span>
        </span>
      </button>
    )
  }

  function renderDesktopStudySection() {
    const studyWorkspaceBadge =
      studyStatus === 'error'
        ? 'Study unavailable'
        : activeStudyCard
          ? 'Review ready'
          : studyCards.length > 0
            ? 'Study queue'
            : 'Study workspace'
    const studyWorkspaceSummary =
      studyStatus === 'error'
        ? 'Reconnect the local service to reload study cards and review state.'
        : activeStudyCard
          ? 'Keep one active review lane in motion while queue and grounding stay docked instead of framing the whole page.'
          : studyCards.length > 0
            ? 'Choose one grounded card, then keep queue changes and supporting evidence in the side dock.'
            : 'Generate or promote a grounded card to begin a calmer review flow.'
    const studyWorkspaceNote =
      studyStatus === 'error'
        ? 'Reconnect local study service'
        : activeStudyCard?.document_title ??
          (studyCards.length > 0 ? collapsedStudyQueueOverview : 'No active card yet')
    const queuePreviewCards = studyCards.filter((card) => card.id !== activeStudyCard?.id).slice(0, 4)

    return (
      <div className="recall-study-workspace stack-gap">
        <section className="card recall-study-stage-shell priority-surface-stage-shell">
          <div className="recall-study-stage-shell-copy">
            <div className="reader-stage-kicker-row">
              <span className="status-chip recall-study-stage-badge">{studyWorkspaceBadge}</span>
              <span className="recall-study-stage-note">{studyWorkspaceNote}</span>
            </div>
            <div className="recall-study-stage-heading">
              <h2>Study</h2>
              <p>{studyWorkspaceSummary}</p>
            </div>
          </div>

          <div className="recall-study-stage-actions">
            <div className="reader-meta-row" role="list" aria-label="Study workspace summary">
              <span className="status-chip reader-meta-chip" role="listitem">{studyCountLabel}</span>
              <span className="status-chip reader-meta-chip" role="listitem">{studyDueCountLabel}</span>
              <span className="status-chip reader-meta-chip" role="listitem">{studyReviewCountLabel}</span>
              {activeStudyCard ? (
                <span className="status-chip reader-meta-chip" role="listitem">{activeStudyCard.card_type}</span>
              ) : null}
            </div>
          </div>
        </section>

        <div
          className={
            studyBrowseDrawerOpen
              ? 'recall-study-stage-grid recall-study-stage-grid-queue-open'
              : 'recall-study-stage-grid'
          }
        >
          <section className="card stack-gap recall-study-card recall-study-review-stage">
            <div className="toolbar recall-collection-toolbar recall-study-review-toolbar">
              <div className="section-header section-header-compact recall-study-review-heading">
                <h2>Review card</h2>
                <p>
                  {activeStudyCard
                    ? 'Keep the prompt, reveal, answer, and rating together in one continuous review lane.'
                    : 'Choose a grounded card from the queue dock to start reviewing here.'}
                </p>
              </div>
              {activeStudyCard ? (
                <div className="recall-hero-metrics recall-study-review-metrics" role="list" aria-label="Study card metadata">
                  <span className="status-chip" role="listitem">{activeStudyCard.card_type}</span>
                  <span className="status-chip status-muted" role="listitem">{formatStudyStatus(activeStudyCard.status)}</span>
                  <span className="status-chip status-muted" role="listitem">
                    Due {dateFormatter.format(new Date(activeStudyCard.due_at))}
                  </span>
                  <span className="status-chip status-muted" role="listitem">
                    {formatCountLabel(activeStudyCard.review_count, 'review', 'reviews')}
                  </span>
                </div>
              ) : null}
            </div>

            {!activeStudyCard ? (
              <div className="recall-library-inline-state recall-study-review-empty">
                <p>
                  {studyStatus === 'error'
                    ? 'Study cards are unavailable until the local service reconnects.'
                    : 'No active study card yet. Open the queue dock to choose one or refresh the local card set.'}
                </p>
              </div>
            ) : (
              <div
                className={
                  showAnswer
                    ? 'study-card-body study-card-body-centered stack-gap recall-study-review-body recall-study-review-body-answer-shown'
                    : 'study-card-body study-card-body-centered stack-gap recall-study-review-body'
                }
              >
                <div className="recall-study-review-glance">
                  <div className="recall-study-review-glance-copy">
                    <strong>{activeStudyCard.prompt}</strong>
                    <span>{activeStudyCardSidebarSummary}</span>
                  </div>
                  <div className="recall-study-review-glance-meta">
                    <span className="status-chip status-muted">{browseStudyEvidenceSummary}</span>
                    <span className="status-chip status-muted">
                      {formatCountLabel(activeStudyCard.source_spans.length, 'evidence span', 'evidence spans')}
                    </span>
                  </div>
                </div>

                <div className="study-card-face recall-study-review-prompt-panel">
                  <strong>Prompt</strong>
                  <p>{activeStudyCard.prompt}</p>
                </div>

                {showAnswer ? (
                  <div className="study-card-answer recall-study-review-answer-panel">
                    <strong>Answer</strong>
                    <p>{activeStudyCard.answer}</p>
                  </div>
                ) : (
                  <div className="study-card-reveal recall-study-review-reveal-band">
                    <p>Recall the answer before revealing it, then rate how easily it came back.</p>
                    <button type="button" onClick={() => setShowAnswer(true)}>
                      Show answer
                    </button>
                  </div>
                )}

                {showAnswer ? (
                  <div className="recall-study-rating-panel recall-study-review-rating-band">
                    <p className="recall-study-rating-note">Rate recall to schedule the next review.</p>
                    <div className="study-rating-row recall-study-review-rating-row">
                      {([
                        ['forgot', 'Forgot'],
                        ['hard', 'Hard'],
                        ['good', 'Good'],
                        ['easy', 'Easy'],
                      ] as const).map(([rating, label]) => (
                        <button
                          key={rating}
                          className="recall-study-rating-button"
                          disabled={studyBusyKey === `review:${activeStudyCard.id}:${rating}`}
                          type="button"
                          onClick={() => handleReviewCard(rating)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="small-note recall-study-rating-placeholder recall-study-review-placeholder">
                    Reveal the answer to rate recall.
                  </p>
                )}
              </div>
            )}
          </section>

          <aside className="recall-study-support-dock stack-gap">
            <section
              className="card stack-gap recall-study-queue-dock priority-surface-support-rail priority-surface-support-rail-quiet"
              aria-label="Study queue support"
            >
              {studyBrowseDrawerOpen || studyStatus === 'error' ? (
                <>
                  <div className="toolbar recall-study-queue-dock-toolbar">
                    <div className="section-header section-header-compact recall-study-dock-heading">
                      <h3>Study queue</h3>
                      <p>Open the full queue only when you want to change cards or filters.</p>
                    </div>
                    <div className="recall-actions recall-actions-inline">
                      <button
                        aria-label={studyBrowseDrawerOpen ? 'Hide queue' : 'Show queue'}
                        className="ghost-button"
                        type="button"
                        onClick={() => setBrowseDrawerOpen('study', !studyBrowseDrawerOpen)}
                      >
                        {studyBrowseDrawerOpen ? 'Hide queue' : 'Show queue'}
                      </button>
                      <button
                        aria-label={studyBusyKey === 'generate' ? 'Refreshing cards' : 'Refresh cards'}
                        className="ghost-button"
                        disabled={studyBusyKey === 'generate'}
                        type="button"
                        onClick={handleGenerateStudyCards}
                      >
                        {studyBusyKey === 'generate' ? 'Refreshing…' : 'Refresh'}
                      </button>
                    </div>
                  </div>

                  <div className="recall-study-queue-dock-summary" aria-label="Active study queue summary">
                    <strong>{activeStudyCard?.prompt ?? 'No active card yet'}</strong>
                    <span>{activeStudyCardSidebarSummary}</span>
                  </div>

                  {studyStatus === 'error' ? (
                    <div className="recall-surface-state stack-gap">
                      <p>Study cards are unavailable until the local service reconnects.</p>
                      <div className="inline-actions">
                        <button className="ghost-button" type="button" onClick={handleRetryRecallLoading}>
                          Retry loading
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="recall-stage-tabs" aria-label="Study filters" role="tablist">
                        {([
                          ['all', 'All'],
                          ['new', 'New'],
                          ['due', 'Due'],
                          ['scheduled', 'Scheduled'],
                        ] as const).map(([filter, label]) => (
                          <button
                            key={filter}
                            aria-selected={studyFilter === filter}
                            className={studyFilter === filter ? 'recall-stage-tab recall-stage-tab-active' : 'recall-stage-tab'}
                            role="tab"
                            type="button"
                            onClick={() => updateStudyState((current) => ({ ...current, filter }))}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      <div className="recall-document-list recall-study-queue-dock-list" role="list">
                        {studyLoading ? <p className="small-note">Loading study cards…</p> : null}
                        {!studyLoading && studyCards.length === 0 ? (
                          <div className="recall-surface-state">
                            <p>No study cards are available for that filter yet.</p>
                          </div>
                        ) : null}
                        {visibleStudyQueueCards.map((card) => (
                          <button
                            key={card.id}
                            aria-pressed={activeStudyCard?.id === card.id}
                            className={
                              activeStudyCard?.id === card.id
                                ? 'recall-document-item recall-document-item-compact recall-document-item-active recall-study-queue-item'
                                : 'recall-document-item recall-document-item-compact recall-study-queue-item'
                            }
                            type="button"
                            onClick={() => handleSelectStudyCard(card)}
                          >
                            <span className="recall-study-queue-item-head">
                              <strong className="recall-document-title">{card.prompt}</strong>
                              <span className="recall-study-queue-item-status">{formatStudyStatus(card.status)}</span>
                            </span>
                            <span className="recall-document-meta">{card.document_title}</span>
                            <span className="recall-collection-row-preview">{getStudyCardPreview(card)}</span>
                            <span className="recall-study-queue-item-meta">
                              <span>{card.card_type}</span>
                              <span>Due {dateFormatter.format(new Date(card.due_at))}</span>
                              <span>{formatCountLabel(card.review_count, 'review', 'reviews')}</span>
                            </span>
                          </button>
                        ))}
                      </div>

                      {studyQueueExpanded || hiddenStudyQueueCount > 0 ? (
                        <button
                          className="ghost-button recall-study-queue-toggle"
                          type="button"
                          onClick={() => setStudyQueueExpanded((current) => !current)}
                        >
                          {studyQueueExpanded ? 'Show fewer cards' : `Show all ${studyCards.length} cards`}
                        </button>
                      ) : null}
                    </>
                  )}
                </>
              ) : (
                <>
                  {renderCollapsedStudySupportStrip()}
                  {queuePreviewCards.length > 0 ? (
                    <div className="recall-study-queue-preview-list" role="list" aria-label="Upcoming study cards">
                      {queuePreviewCards.map((card) => renderStudyQueuePreviewRow(card))}
                    </div>
                  ) : (
                    <div className="recall-study-queue-preview-empty">
                      <strong>No secondary cards yet</strong>
                      <span>Generate or promote more cards to keep the queue moving after this review.</span>
                    </div>
                  )}
                </>
              )}
            </section>

            <section
              className="card stack-gap recall-study-evidence-dock priority-surface-support-rail"
              aria-label="Study evidence support"
            >
              <div className="toolbar recall-study-evidence-dock-toolbar">
                <div className="section-header section-header-compact recall-study-dock-heading">
                  <h3>{browseStudyEvidenceExpanded ? 'Supporting evidence' : 'Grounding'}</h3>
                  <p>
                    {browseStudyEvidenceExpanded
                      ? 'Keep one grounded excerpt nearby before reopening Reader or logging the next review.'
                      : 'Keep the supporting source docked here instead of turning the review lane into another dashboard.'}
                  </p>
                </div>
                {focusedStudySourceSpan ? (
                  <div className="recall-actions recall-actions-inline recall-study-evidence-dock-actions">
                    {!showAnswer ? (
                      <button
                        className="ghost-button recall-study-evidence-summary-button"
                        type="button"
                        onClick={() => setStudyEvidencePeekOpen((current) => !current)}
                      >
                        {studyEvidencePeekOpen ? 'Hide preview' : 'Preview evidence'}
                      </button>
                    ) : null}
                    <button
                      className="ghost-button recall-study-evidence-reader-button"
                      type="button"
                      onClick={() => handleOpenStudyCardInReader(activeStudyCard, focusedStudySourceSpan)}
                    >
                      {buildOpenReaderLabel(activeStudyCard?.document_title ?? 'Saved source')}
                    </button>
                  </div>
                ) : null}
              </div>

              {focusedStudySourceSpan ? (
                browseStudyEvidenceExpanded ? (
                  <>
                    {activeStudySourceSpans.length > 1 ? (
                      <div className="recall-study-evidence-tabs" aria-label="Evidence spans" role="tablist">
                        {activeStudySourceSpans.map((sourceSpan, index) => (
                          <button
                            key={`${activeStudyCard?.id ?? 'study'}:desktop-tab:${index}`}
                            aria-selected={focusedStudySourceSpanIndex === index}
                            className={
                              focusedStudySourceSpanIndex === index
                                ? 'recall-study-evidence-tab recall-study-evidence-tab-active'
                                : 'recall-study-evidence-tab'
                            }
                            role="tab"
                            type="button"
                            onClick={() => setFocusedStudySourceSpanIndex(index)}
                          >
                            Evidence {index + 1}
                            {getRecordStringValue(sourceSpan, 'note_id') ? ' · Note' : ''}
                          </button>
                        ))}
                      </div>
                    ) : null}

                    <div className="recall-detail-panel recall-study-evidence-focus recall-study-evidence-focus-compact">
                      <span className="recall-collection-row-head">
                        <strong>{getStudyEvidenceLabel(focusedStudySourceSpan)}</strong>
                        <span>{activeStudyCard?.document_title ?? 'Saved source'}</span>
                      </span>
                      <span className="recall-collection-row-preview">{getStudyEvidenceExcerpt(focusedStudySourceSpan)}</span>
                      <span className="recall-collection-row-meta">
                        {getRecordStringValue(focusedStudySourceSpan, 'note_id') ? <span className="status-chip">Anchored note</span> : null}
                        {getRecordStringValue(focusedStudySourceSpan, 'edge_id') ? <span className="status-chip">Graph-backed</span> : null}
                        {getRecordStringValue(focusedStudySourceSpan, 'chunk_id') ? <span className="status-chip">Chunk excerpt</span> : null}
                        {getRecordNumberValue(focusedStudySourceSpan, 'global_sentence_start') !== null ? (
                          <span className="status-chip">
                            Sentences {String(getRecordNumberValue(focusedStudySourceSpan, 'global_sentence_start'))}-{String(getRecordNumberValue(focusedStudySourceSpan, 'global_sentence_end'))}
                          </span>
                        ) : null}
                      </span>
                    </div>

                    {showFocusedStudyGroundingExcerpt ? (
                      <div className="recall-study-focused-grounding-inline">
                        <strong>Grounding</strong>
                        <span>{focusedStudyGroundingExcerpt}</span>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="recall-study-evidence-dock-summary">
                    <strong>{browseStudyEvidenceSummary}</strong>
                    <span>{activeStudyCard?.document_title ?? 'Saved source'}</span>
                    <p>{focusedStudyEvidenceExcerpt}</p>
                  </div>
                )
              ) : (
                <div className="recall-study-evidence-dock-summary recall-study-evidence-dock-summary-empty">
                  <strong>No evidence span yet</strong>
                  <span>Promote more grounded notes or reader highlights to keep a supporting excerpt nearby.</span>
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    )
  }

  function renderNotesBrowseContent({
    emptyStateClassName = 'recall-surface-state',
    emptyStateMessage,
    filtersClassName = 'recall-collection-filters',
  }: {
    emptyStateClassName?: string
    emptyStateMessage?: string
    filtersClassName?: string
  }) {
    return (
      <>
        <div className={filtersClassName}>
          <label className="field recall-inline-field">
            <span>Source</span>
            <select
              disabled={documentsStatus === 'error' || documents.length === 0}
              value={selectedNotesDocumentId ?? ''}
              onChange={(event) => handleSelectNotesDocument(event.target.value)}
            >
              {documents.length === 0 ? <option value="">No documents yet</option> : null}
              {documents.map((document) => (
                <option key={document.id} value={document.id}>
                  {document.title}
                </option>
              ))}
            </select>
          </label>

          <label className="field recall-inline-field">
            <span>Search notes</span>
            <input
              type="search"
              placeholder="Search highlights or note text"
              value={noteSearchQuery}
              onChange={(event) =>
                updateNotesState((current) => ({ ...current, searchQuery: event.target.value }))
              }
            />
          </label>
        </div>

        <div className="recall-document-list recall-notes-browser-list" role="list">
          {documentsStatus === 'error' ? (
            <div className="recall-surface-state stack-gap">
              <p>Notes are unavailable until the local library reconnects.</p>
              <div className="inline-actions">
                <button className="ghost-button" type="button" onClick={handleRetryRecallLoading}>
                  Retry loading
                </button>
              </div>
            </div>
          ) : null}
          {documentsStatus !== 'error' && notesLoading ? <p className="small-note">Loading notes…</p> : null}
          {documentsStatus !== 'error' && !showingNoteSearch && notesStatus === 'error' ? (
            <div className="recall-surface-state stack-gap">
              <p>{notesError}</p>
              <div className="inline-actions">
                <button className="ghost-button" type="button" onClick={handleRetryNotesLoading}>
                  Retry notes
                </button>
              </div>
            </div>
          ) : null}
          {documentsStatus !== 'error' && showingNoteSearch && noteSearchLoading ? (
            <p className="small-note">Searching notes…</p>
          ) : null}
          {documentsStatus !== 'error' && showingNoteSearch && noteSearchStatus === 'error' ? (
            <div className="recall-surface-state stack-gap">
              <p>{noteSearchError}</p>
              <div className="inline-actions">
                <button className="ghost-button" type="button" onClick={handleRetryNotesLoading}>
                  Retry notes
                </button>
              </div>
            </div>
          ) : null}
          {documentsStatus !== 'error' &&
          !notesLoading &&
          !noteSearchLoading &&
          visibleNotes.length === 0 &&
          !(showingNoteSearch ? noteSearchStatus === 'error' : notesStatus === 'error') ? (
            <div className={emptyStateClassName}>
              <p>
                {emptyStateMessage ??
                  (showingNoteSearch
                    ? 'No notes match that query in the selected document.'
                    : 'No notes for this document yet. Add one from Reader to save a local source-linked highlight.')}
              </p>
            </div>
          ) : null}

          {visibleNotes.map((note) => (
            <button
              key={note.id}
              aria-pressed={activeNote?.id === note.id}
              className={
                activeNote?.id === note.id
                  ? 'recall-document-item recall-document-item-compact recall-document-item-active'
                  : 'recall-document-item recall-document-item-compact'
              }
              type="button"
              onClick={() =>
                updateNotesState((current) => ({
                  ...current,
                  selectedNoteId: note.id,
                }))
              }
            >
              <span className="recall-collection-row-head">
                <span className="recall-document-title">{note.anchor.anchor_text}</span>
                <span className="recall-document-meta">{dateFormatter.format(new Date(note.updated_at))}</span>
              </span>
              <span className="recall-collection-row-preview">{getNoteRowPreview(note)}</span>
              <span className="recall-collection-row-meta">
                <span className="status-chip reader-meta-chip">
                  {getNoteDocumentTitle(note, documentTitleById, selectedNotesDocumentTitle)}
                </span>
                <span className="status-chip reader-meta-chip">
                  {(note.anchor.global_sentence_end ?? note.anchor.sentence_end) -
                    (note.anchor.global_sentence_start ?? note.anchor.sentence_start) +
                    1}{' '}
                  sentences
                </span>
              </span>
            </button>
          ))}
        </div>
      </>
    )
  }

  function renderDesktopNotesEmptyState() {
    const selectedSourceReady = Boolean(selectedNotesDocumentId && selectedNotesDocumentTitle)
    const emptyStateLead =
      documentsStatus === 'error'
        ? 'Reconnect the local library to reopen saved note anchors here.'
        : selectedSourceReady
          ? showingNoteSearch
            ? `Search is active for ${selectedNotesDocumentTitle}. Clear or refine it to reopen a saved note.`
            : `${selectedNotesCountLabel} stay local to ${selectedNotesDocumentTitle} and open here when you need to edit, reopen, or promote them.`
          : 'Choose one saved source on the left to make note browsing and note detail primary here.'
    const emptyStateFooter =
      documentsStatus === 'error'
        ? 'Reader handoff, note search, and promotion all stay available again once the local service reconnects.'
        : showingNoteSearch
          ? 'Try another phrase or clear the search to return to the broader saved note stream.'
          : selectedSourceReady
            ? 'Capture the next highlight from Reader when you want to turn another passage into an editable local note.'
            : 'Once a source is selected, saved note anchors, note text, and promotion tools stay together in this workspace.'

    return (
      <div className="recall-note-empty-stage stack-gap">
        <div className="recall-note-empty-hero">
          <div className="recall-note-empty-hero-copy">
            <div className="reader-stage-kicker-row">
              <span className="status-chip recall-notes-stage-badge">
                {selectedSourceReady ? 'Selected source' : 'Choose a source'}
              </span>
              <span className="recall-notes-stage-note">
                {selectedSourceReady ? selectedNotesCountLabel : 'Notes workspace'}
              </span>
            </div>
            <strong>{selectedNotesDocumentTitle ?? 'No active note yet'}</strong>
            <p>{emptyStateLead}</p>
          </div>
          {selectedNotesDocumentId ? (
            <div className="recall-actions recall-actions-inline">
              <button type="button" onClick={() => focusSourceLibrary(selectedNotesDocumentId)}>
                Open source
              </button>
            </div>
          ) : null}
        </div>

        <div className="recall-note-empty-steps" role="list" aria-label="How notes work">
          <div className="empty-state-step recall-note-empty-step" role="listitem">
            <strong>1. Browse one saved source</strong>
            <span>Keep the note stream on the left and reopen the specific anchor only when it deserves the main detail stage.</span>
          </div>
          <div className="empty-state-step recall-note-empty-step" role="listitem">
            <strong>2. Capture from Reader</strong>
            <span>Use Add note in Reader to save a local highlight that lands back here with its anchored passage intact.</span>
          </div>
          <div className="empty-state-step recall-note-empty-step" role="listitem">
            <strong>3. Promote later, not first</strong>
            <span>Push a stable note into Graph or Study only after the anchor and note text are clear enough to keep.</span>
          </div>
        </div>

        <p className="small-note recall-note-empty-stage-note">{emptyStateFooter}</p>
      </div>
    )
  }

  function renderActiveNoteDetailBody({ includeReaderDockAction = true }: { includeReaderDockAction?: boolean } = {}) {
    if (!activeNote) {
      return null
    }

    return (
      <div className="recall-note-detail recall-note-detail-layout">
        <div className="recall-note-detail-main stack-gap">
          <div className="reader-meta-row recall-note-detail-meta" role="list" aria-label="Selected note metadata">
            <span className="status-chip reader-meta-chip" role="listitem">
              Updated {dateFormatter.format(new Date(activeNote.updated_at))}
            </span>
            <span className="status-chip reader-meta-chip" role="listitem">
              {formatSentenceSpanLabel(
                activeNote.anchor.global_sentence_start ?? activeNote.anchor.sentence_start,
                activeNote.anchor.global_sentence_end ?? activeNote.anchor.sentence_end,
              )}
            </span>
            <span className="status-chip reader-meta-chip" role="listitem">
              Export ready
            </span>
          </div>
          <p className="small-note recall-note-detail-intro">Included in exports and merge previews.</p>

          <div className="recall-note-preview recall-note-preview-stage">
            <div className="section-header section-header-compact">
              <h3>Highlighted passage</h3>
              <p>Keep the original anchor visible while you edit the saved note and decide what should happen next.</p>
            </div>
            <p>{activeNote.anchor.anchor_text}</p>
            <span>{activeNote.anchor.excerpt_text}</span>
          </div>

          <div className="recall-detail-panel recall-note-editor-card stack-gap">
            <div className="section-header section-header-compact">
              <h3>Note text</h3>
              <p>Add context, a reminder, or the follow-up question that should stay attached to this anchor.</p>
            </div>
            <label className="field">
              <span className="visually-hidden">Note text</span>
              <textarea
                placeholder="Add context, a reminder, or a follow-up question"
                value={noteDraftBody}
                onChange={(event) => setNoteDraftBody(event.target.value)}
              />
            </label>

            <div className="inline-actions recall-note-detail-actions">
              <button
                disabled={noteBusyKey === `save:${activeNote.id}`}
                type="button"
                onClick={handleSaveNoteChanges}
              >
                {noteBusyKey === `save:${activeNote.id}` ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>

        <aside className="recall-note-detail-dock stack-gap">
          <div className="recall-detail-panel recall-note-dock-card stack-gap">
            <div className="section-header section-header-compact">
              <h3>Keep this grounded</h3>
              <p>Reopen the source or jump back into Reader when you need the surrounding passage, not a second panel stack.</p>
            </div>
            <div className="reader-meta-row recall-note-detail-meta" role="list" aria-label="Note source summary">
              <span className="status-chip reader-meta-chip" role="listitem">
                {getNoteDocumentTitle(activeNote, documentTitleById, selectedNotesDocumentTitle)}
              </span>
              <span className="status-chip reader-meta-chip" role="listitem">
                {formatSentenceSpanLabel(
                  activeNote.anchor.global_sentence_start ?? activeNote.anchor.sentence_start,
                  activeNote.anchor.global_sentence_end ?? activeNote.anchor.sentence_end,
                )}
              </span>
            </div>
            <div className="recall-actions recall-actions-inline">
              <button
                className="ghost-button"
                type="button"
                onClick={() => focusSourceLibrary(activeNote.anchor.source_document_id)}
              >
                Open source
              </button>
              {includeReaderDockAction ? (
                <button className="ghost-button" type="button" onClick={() => handleOpenNoteInReader(activeNote)}>
                  Open in Reader
                </button>
              ) : null}
            </div>
          </div>

          <div className="recall-detail-panel stack-gap recall-note-promotion-card recall-note-promotion-dock">
            <div className="section-header section-header-compact">
              <h3>Promote note</h3>
              <p>Branch into Graph or Study only after the anchor and note text look stable enough to keep.</p>
            </div>
            <div className="recall-stage-tabs" aria-label="Note promotion" role="tablist">
              <button
                aria-selected={notePromotionMode === 'graph'}
                className={notePromotionMode === 'graph' ? 'recall-stage-tab recall-stage-tab-active' : 'recall-stage-tab'}
                disabled={noteBusyKey === `graph:${activeNote.id}`}
                role="tab"
                type="button"
                onClick={() => setNotePromotionMode('graph')}
              >
                Promote to Graph
              </button>
              <button
                aria-selected={notePromotionMode === 'study'}
                className={notePromotionMode === 'study' ? 'recall-stage-tab recall-stage-tab-active' : 'recall-stage-tab'}
                disabled={noteBusyKey === `study:${activeNote.id}`}
                role="tab"
                type="button"
                onClick={() => setNotePromotionMode('study')}
              >
                Create Study Card
              </button>
            </div>

            {notePromotionMode === 'graph' ? (
              <div className="stack-gap">
                <label className="field">
                  <span>Graph label</span>
                  <input
                    type="text"
                    value={noteGraphDraft.label}
                    onChange={(event) =>
                      setNoteGraphDraft((current) => ({ ...current, label: event.target.value }))
                    }
                  />
                </label>
                <label className="field">
                  <span>Graph description</span>
                  <textarea
                    placeholder="Optional context for the promoted concept"
                    value={noteGraphDraft.description ?? ''}
                    onChange={(event) =>
                      setNoteGraphDraft((current) => ({ ...current, description: event.target.value }))
                    }
                  />
                </label>
                <div className="recall-actions recall-actions-inline">
                  <button
                    disabled={noteBusyKey === `graph:${activeNote.id}`}
                    type="button"
                    onClick={handlePromoteNoteToGraph}
                  >
                    {noteBusyKey === `graph:${activeNote.id}` ? 'Promoting…' : 'Promote node'}
                  </button>
                  <button className="ghost-button" type="button" onClick={() => setNotePromotionMode(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            {notePromotionMode === 'study' ? (
              <div className="stack-gap">
                <label className="field">
                  <span>Study prompt</span>
                  <textarea
                    value={noteStudyDraft.prompt}
                    onChange={(event) =>
                      setNoteStudyDraft((current) => ({ ...current, prompt: event.target.value }))
                    }
                  />
                </label>
                <label className="field">
                  <span>Study answer</span>
                  <textarea
                    value={noteStudyDraft.answer}
                    onChange={(event) =>
                      setNoteStudyDraft((current) => ({ ...current, answer: event.target.value }))
                    }
                  />
                </label>
                <div className="recall-actions recall-actions-inline">
                  <button
                    disabled={noteBusyKey === `study:${activeNote.id}`}
                    type="button"
                    onClick={handlePromoteNoteToStudyCard}
                  >
                    {noteBusyKey === `study:${activeNote.id}` ? 'Creating…' : 'Create card'}
                  </button>
                  <button className="ghost-button" type="button" onClick={() => setNotePromotionMode(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="recall-detail-panel recall-note-utility-card stack-gap">
            <div className="section-header section-header-compact">
              <h3>Manage note</h3>
              <p>Delete the note if the anchor no longer helps, or keep it here as a local-first handoff into other work.</p>
            </div>
            <div className="inline-actions recall-note-utility-actions">
              <button
                className="ghost-button recall-note-delete-button"
                disabled={noteBusyKey === `delete:${activeNote.id}`}
                type="button"
                onClick={handleDeleteNote}
              >
                {noteBusyKey === `delete:${activeNote.id}` ? 'Deleting…' : 'Delete note'}
              </button>
            </div>
          </div>
        </aside>
      </div>
    )
  }

  function renderFocusedNotesSection() {
    return (
      <div
        className={
          notesBrowseDrawerOpen
            ? 'recall-grid recall-focused-split-grid'
            : 'recall-grid recall-grid-browse-condensed recall-focused-split-grid'
        }
      >
        <section
          className={
            notesBrowseDrawerOpen
              ? showFocusedNotesDrawerOpenEmptyState
                ? 'card recall-collection-rail recall-collection-rail-condensed stack-gap recall-source-side-rail recall-notes-focus-rail recall-notes-focus-rail-drawer-empty'
                : 'card recall-collection-rail stack-gap'
              : showFocusedNotesEmptyDetailLane
                ? 'card recall-collection-rail recall-collection-rail-condensed stack-gap recall-source-side-rail recall-notes-focus-rail recall-notes-focus-rail-empty'
                : 'card recall-collection-rail recall-collection-rail-condensed stack-gap recall-source-side-rail recall-notes-focus-rail'
          }
        >
          <div className="toolbar recall-collection-toolbar">
            <div className="section-header section-header-compact">
              <h2>Notes</h2>
              <p>
                {showFocusedNotesDrawerOpenEmptyState
                  ? 'Browse saved notes for this source.'
                  : showFocusedNotesEmptyDetailLane
                    ? 'Browse saved notes without losing the live reading view.'
                    : 'Search and manage source-linked highlights captured from Reader in reflowed view.'}
              </p>
            </div>
            <button className="ghost-button" type="button" onClick={() => setBrowseDrawerOpen('notes', !notesBrowseDrawerOpen)}>
              {notesBrowseDrawerOpen ? 'Hide' : 'Show'}
            </button>
          </div>

          {notesBrowseDrawerOpen || documentsStatus === 'error' ? (
            renderNotesBrowseContent({
              emptyStateClassName:
                showFocusedNotesDrawerOpenEmptyState ? 'recall-surface-state recall-notes-browse-empty-state' : 'recall-surface-state',
              emptyStateMessage:
                showFocusedNotesDrawerOpenEmptyState && !showingNoteSearch
                  ? 'No saved notes yet. Add one from Reader to keep it here.'
                  : undefined,
              filtersClassName:
                showFocusedNotesDrawerOpenEmptyState
                  ? 'recall-collection-filters recall-notes-browse-empty-filters'
                  : 'recall-collection-filters',
            })
          ) : (
            <div className="recall-browse-drawer-summary stack-gap">
              <div
                className={
                  showFocusedNotesEmptyDetailLane
                    ? 'recall-detail-panel recall-browse-summary-card recall-note-summary-card recall-note-summary-card-empty'
                    : 'recall-detail-panel recall-browse-summary-card recall-note-summary-card'
                }
              >
                <strong>{activeNote?.anchor.anchor_text ?? selectedNotesDocumentTitle ?? 'No active note yet'}</strong>
                <span>
                  {activeNote
                    ? activeNote.body_text?.trim() || activeNote.anchor.excerpt_text
                    : selectedNotesDocumentTitle
                      ? showFocusedNotesEmptyDetailLane
                        ? sourceWorkspaceNoteCountLabel
                        : `${sourceWorkspaceNoteCountLabel} for ${selectedNotesDocumentTitle}.`
                      : 'Choose a source to inspect its saved notes.'}
                </span>
                {showFocusedNotesEmptyDetailLane ? (
                  <span className="recall-note-empty-detail-hint">
                    {sourceWorkspaceNotesStatus === 'error'
                      ? 'Note detail returns after the note index reconnects.'
                      : sourceWorkspaceNotes.length > 0
                        ? 'Select a saved note to open detail.'
                        : 'Save a note from Reader to open detail here.'}
                  </span>
                ) : null}
                {activeNote ? (
                  <span className="recall-note-summary-meta">
                    {getNoteDocumentTitle(activeNote, documentTitleById, selectedNotesDocumentTitle)} ·{' '}
                    {formatSentenceSpanLabel(
                      activeNote.anchor.global_sentence_start ?? activeNote.anchor.sentence_start,
                      activeNote.anchor.global_sentence_end ?? activeNote.anchor.sentence_end,
                    )}
                  </span>
                ) : null}
                {showFocusedNotesEmptyDetailLane ? null : (
                  <div className="recall-actions recall-actions-inline">
                    <button className="ghost-button" type="button" onClick={() => setBrowseDrawerOpen('notes', true)}>
                      Browse notes
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <div
          className={
            showFocusedNotesSplitView
              ? showFocusedNotesEmptyDetailLane
                ? 'recall-main-column recall-source-split-layout recall-source-split-layout-notes-empty'
                : 'recall-main-column recall-source-split-layout'
              : 'recall-main-column stack-gap'
          }
        >
          {showFocusedNotesSplitView ? renderFocusedReaderPane() : null}
          <section
            className={
              showFocusedNotesEmptyDetailLane
                ? 'card stack-gap recall-source-secondary-panel recall-note-detail-panel recall-note-detail-panel-empty'
                : showFocusedNotesDrawerOpenEmptyDetailPanel
                  ? 'card stack-gap recall-source-secondary-panel recall-note-detail-panel recall-note-detail-panel-drawer-empty'
                  : 'card stack-gap recall-source-secondary-panel recall-note-detail-panel'
            }
          >
            <div className="toolbar">
              <div className="section-header section-header-compact">
                <h2>Note detail</h2>
                <p>
                  {activeNote
                    ? 'Edit the saved note, inspect the anchor, and branch into graph or study when it helps.'
                    : showFocusedNotesDrawerOpenEmptyDetailPanel
                      ? 'Select a saved note.'
                      : showFocusedNotesDrawerOpenEmptyState
                        ? 'Select a note to inspect its anchor.'
                        : 'Choose a note to inspect its anchored passage.'}
                </p>
              </div>
              {activeNote ? (
                <div className="recall-actions">
                  {showFocusedNotesSplitView ? (
                    <button type="button" onClick={() => handleShowNoteInFocusedReader(activeNote)}>
                      Show in Reader
                    </button>
                  ) : null}
                  <button
                    className={showFocusedNotesSplitView ? 'ghost-button' : undefined}
                    type="button"
                    onClick={() => handleOpenNoteInReader(activeNote)}
                  >
                    Open in Reader
                  </button>
                </div>
              ) : null}
            </div>

            {notesMessage ? <p className="small-note">{notesMessage}</p> : null}
            {!activeNote ? (
              <p className={showFocusedNotesSplitView ? 'small-note recall-note-detail-empty-note' : 'small-note'}>
                No active note yet.
              </p>
            ) : (
              renderActiveNoteDetailBody({ includeReaderDockAction: false })
            )}
          </section>
        </div>
      </div>
    )
  }

  function renderDesktopNotesSection() {
    const notesWorkspaceSummary = activeNote
      ? 'Keep one saved anchor editable here while the broader note stream stays nearby.'
      : selectedNotesDocumentTitle
        ? 'Browse one source, reopen its passage in Reader, and only promote the note after it feels stable.'
        : 'Choose one source, search its saved highlights, and work from a calmer note detail stage instead of a blank center panel.'
    const notesWorkspaceBadge =
      documentsStatus === 'error'
        ? 'Notes unavailable'
        : activeNote
          ? 'Current note'
          : selectedNotesDocumentTitle
            ? 'Selected source'
            : 'Notes workspace'

    return (
      <div className="recall-notes-workspace stack-gap">
        <section className="card recall-notes-stage-shell priority-surface-stage-shell">
          <div className="recall-notes-stage-shell-copy">
            <div className="reader-stage-kicker-row">
              <span className="status-chip recall-notes-stage-badge">{notesWorkspaceBadge}</span>
              <span className="recall-notes-stage-note">
                {selectedNotesDocumentTitle ?? (documentsStatus === 'error' ? 'Reconnect local library' : 'Pick a saved source')}
              </span>
            </div>
            <div className="recall-notes-stage-heading">
              <h2>Notes</h2>
              <p>{notesWorkspaceSummary}</p>
            </div>
          </div>

          <div className="recall-notes-stage-actions">
            <div className="reader-meta-row" role="list" aria-label="Notes workspace summary">
              <span className="status-chip reader-meta-chip" role="listitem">
                {selectedNotesCountLabel}
              </span>
              <span className="status-chip reader-meta-chip" role="listitem">
                {showingNoteSearch ? 'Search active' : 'Local-first notes'}
              </span>
              {activeNote ? (
                <span className="status-chip reader-meta-chip" role="listitem">
                  {formatSentenceSpanLabel(
                    activeNote.anchor.global_sentence_start ?? activeNote.anchor.sentence_start,
                    activeNote.anchor.global_sentence_end ?? activeNote.anchor.sentence_end,
                  )}
                </span>
              ) : null}
            </div>
            {!activeNote && selectedNotesDocumentId ? (
              <div className="recall-actions recall-actions-inline">
                <button type="button" onClick={() => focusSourceLibrary(selectedNotesDocumentId)}>
                  Open source
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <div className="recall-notes-stage-grid">
          <section className="card recall-notes-browser-card stack-gap">
            <div className="toolbar recall-notes-browser-toolbar">
              <div className="section-header section-header-compact">
                <h3>Browse notes</h3>
                <p>Keep the saved stream visible, then open one anchored note into the main detail stage only when it matters.</p>
              </div>
            </div>
            {renderNotesBrowseContent({
              emptyStateClassName: 'recall-surface-state recall-notes-browser-empty-state',
              filtersClassName: 'recall-collection-filters recall-notes-browser-filters',
            })}
          </section>

          <section className="card stack-gap recall-note-detail-panel recall-note-detail-stage">
            <div className="toolbar recall-note-detail-toolbar">
              <div className="section-header section-header-compact">
                <h2>Note detail</h2>
                <p>
                  {activeNote
                    ? 'Edit one note in full, then branch into Reader, Graph, or Study only when the anchor is ready.'
                    : 'Choose a saved note to open its anchored passage, editable note text, and next-step tools in one place.'}
                </p>
              </div>
            </div>

            {notesMessage ? <p className="small-note">{notesMessage}</p> : null}
            {activeNote ? renderActiveNoteDetailBody() : renderDesktopNotesEmptyState()}
          </section>
        </div>
      </div>
    )
  }

  function renderNotesSection() {
    return sourceWorkspaceFocused ? renderFocusedNotesSection() : renderDesktopNotesSection()
  }

  return (
    <div className="stack-gap">
      {overallError ? (
        <div className="inline-error stack-gap" role="alert">
          <p>{overallError}</p>
          {canRetryRecallLoading ? (
            <div className="inline-actions">
              <button className="ghost-button" type="button" onClick={handleRetryRecallLoading}>
                Retry loading
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      {studyMessage ? <p className="small-note">{studyMessage}</p> : null}

      {section === 'library' ? (
        showFocusedLibraryOverview ? (
          <div
            className={
              libraryBrowseDrawerOpen
                ? 'recall-grid recall-overview-focus-layout'
                : 'recall-grid recall-grid-browse-condensed recall-overview-focus-layout recall-overview-focus-layout-condensed'
            }
          >
            <section
              className={
                libraryBrowseDrawerOpen
                  ? 'card recall-library-card recall-collection-rail stack-gap recall-overview-focus-rail'
                  : 'card recall-library-card recall-collection-rail recall-collection-rail-condensed stack-gap recall-source-side-rail recall-library-focus-rail recall-overview-focus-rail'
              }
            >
              <div className="toolbar recall-collection-toolbar">
                <div className="section-header section-header-compact">
                  <h2>Home</h2>
                  <p>
                    {documentsLoading
                      ? 'Loading…'
                      : libraryFilterActive
                        ? `${visibleDocuments.length} matches`
                        : documentCountLabel}
                  </p>
                </div>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => setBrowseDrawerOpen('library', !libraryBrowseDrawerOpen)}
                >
                  {libraryBrowseDrawerOpen ? 'Hide' : 'Show'}
                </button>
              </div>

              {libraryBrowseDrawerOpen || documentsStatus === 'error' ? (
                <>
                  <label className="field recall-inline-field">
                    <span>Filter sources</span>
                    <input
                      type="search"
                      placeholder="Search saved sources"
                      value={libraryFilterQuery}
                      onChange={(event) =>
                        updateLibraryState((current) => ({ ...current, filterQuery: event.target.value }))
                      }
                    />
                  </label>

                  <div className="recall-document-list" role="list">
                    {documentsLoading ? <p className="small-note">Loading saved documents…</p> : null}
                    {!documentsLoading && documentsStatus === 'error' ? (
                      <div className="stack-gap">
                        <p className="small-note">Saved documents are unavailable until the local service reconnects.</p>
                        <div className="inline-actions">
                          <button className="ghost-button" type="button" onClick={handleRetryRecallLoading}>
                            Retry loading
                          </button>
                        </div>
                      </div>
                    ) : null}
                    {!documentsLoading && documentsStatus !== 'error' && documents.length === 0 ? (
                      <p className="small-note">
                        Reader imports appear here automatically once they reach shared storage.
                      </p>
                    ) : null}
                    {!documentsLoading &&
                    documentsStatus !== 'error' &&
                    documents.length > 0 &&
                    visibleDocuments.length === 0 ? (
                      <p className="small-note">
                        No saved sources match that filter. The current source overview stays visible on the right.
                      </p>
                    ) : null}

                    {visibleDocuments.map((document) => (
                      <button
                        key={document.id}
                        aria-pressed={selectedLibraryDocumentId === document.id}
                        className={
                          selectedLibraryDocumentId === document.id
                            ? 'recall-document-item recall-document-item-compact recall-document-item-active'
                            : 'recall-document-item recall-document-item-compact'
                        }
                        type="button"
                        onClick={() => handleSelectLibraryDocument(document.id)}
                      >
                        <span className="recall-collection-row-head">
                          <span className="recall-document-title">{document.title}</span>
                          <span className="recall-document-meta">{dateFormatter.format(new Date(document.updated_at))}</span>
                        </span>
                        <span className="recall-collection-row-preview">{getDocumentSourcePreview(document)}</span>
                        <span className="recall-collection-row-meta">
                          <span className="status-chip reader-meta-chip">{document.source_type.toUpperCase()}</span>
                          <span className="status-chip reader-meta-chip">{document.chunk_count} chunks</span>
                          <span className="status-chip reader-meta-chip">
                            {document.available_modes.length} {document.available_modes.length === 1 ? 'view' : 'views'}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="recall-browse-drawer-summary stack-gap">
                  {sourceWorkspaceDrawerSummary ? (
                    <div className="recall-detail-panel recall-browse-summary-card recall-overview-focus-summary-card">
                      <strong>{sourceWorkspaceDrawerSummary.title}</strong>
                      <span>{sourceWorkspaceDrawerSummary.source}</span>
                      <span className="recall-overview-focus-summary-meta">
                        {sourceWorkspaceDrawerSummary.updatedAt
                          ? `Updated ${dateFormatter.format(new Date(sourceWorkspaceDrawerSummary.updatedAt))}`
                          : sourceWorkspaceNoteCountLabel}
                      </span>
                    </div>
                  ) : (
                    <div className="recall-detail-panel recall-browse-summary-card recall-overview-focus-summary-card">
                      <strong>No active source yet</strong>
                      <span className="recall-overview-focus-summary-meta">
                        Open the Home panel when you want to choose a saved source.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </section>

            <div className="recall-main-column">{renderSourceOverviewPanel()}</div>
          </div>
        ) : (
          <section className="recall-library-landing recall-library-landing-unboxed">
            <div className="recall-library-landing-layout">
              <div className="recall-library-canvas stack-gap">
                <div className="recall-home-workspace stack-gap">
                  <div className="recall-home-toolbar priority-surface-stage-shell">
                    <div className="recall-home-toolbar-copy">
                      <div className="section-header section-header-compact recall-home-toolbar-heading">
                        <div className="recall-home-toolbar-heading-copy">
                          <h2>{homeInlineHeading}</h2>
                          <p className="recall-home-toolbar-summary">
                            {!documentsLoading && documentsStatus !== 'error' && documents.length > 0
                              ? homeInlineSummary
                              : homeSidebarStatusCopy ?? homeInlineSummary}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="recall-home-toolbar-utility">
                      {!libraryFilterActive && homeWorkspaceSectionCounts.length > 0 ? (
                        <div className="recall-home-toolbar-metrics" role="list" aria-label="Home snapshot">
                          <span className="status-chip reader-meta-chip" role="listitem">
                            {homeSavedSourceLabel}
                          </span>
                          <span className="status-chip reader-meta-chip" role="listitem">
                            {graphNodeCountLabel}
                          </span>
                          <span className="status-chip reader-meta-chip" role="listitem">
                            {studyCountLabel}
                          </span>
                        </div>
                      ) : null}
                      {!libraryFilterActive && documentsStatus !== 'error' ? (
                        <p className="recall-home-toolbar-note">
                          Keep <strong>New</strong> and shell <strong>Search</strong> primary, then use the library lane below when you want a source-only pass.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {documentsLoading ? (
                    <div className="recall-library-inline-state" role="status">
                      Loading saved sources…
                    </div>
                  ) : null}
                  {!documentsLoading && documentsStatus === 'error' ? (
                    <div className="recall-library-inline-state" role="alert">
                      <p>Saved sources are unavailable until the local service reconnects.</p>
                      <button className="ghost-button" type="button" onClick={handleRetryRecallLoading}>
                        Retry loading
                      </button>
                    </div>
                  ) : null}
                  {!documentsLoading && documentsStatus !== 'error' && documents.length === 0 ? (
                    <div className="recall-library-inline-state">
                      <p>Your Home is empty. Use New to add a source, then return here to reopen reading, notes, graph, and study work.</p>
                    </div>
                  ) : null}
                  {!documentsLoading && documentsStatus !== 'error' && documents.length > 0 && visibleDocuments.length === 0 ? (
                    <div className="recall-library-inline-state">
                      <p>No saved sources match that search. Try a different title, type, or locator.</p>
                    </div>
                  ) : null}
                  {!documentsLoading && documentsStatus !== 'error' && visibleDocuments.length > 0 ? (
                    libraryFilterActive ? (
                      <section className="recall-home-library-card recall-home-library-card-wide stack-gap" aria-label="Matching saved sources">
                        <div className="section-header section-header-compact recall-home-library-card-header">
                          <div className="recall-home-library-stage-heading">
                            <div className="recall-library-section-heading-row">
                              <h3>Matching sources</h3>
                              <span className="recall-library-section-count">
                                {formatCountLabel(visibleDocuments.length, 'source', 'sources')}
                              </span>
                            </div>
                            <p>Open the source you want, then clear the filter when you want the grouped library flow back.</p>
                          </div>
                          {showInlineHomeSearch ? (
                            <label className="field recall-inline-field recall-home-library-stage-search">
                              <span className="visually-hidden">Search saved sources</span>
                              <input
                                aria-label="Search saved sources"
                                type="search"
                                placeholder="Search saved sources"
                                value={libraryFilterQuery}
                                onChange={(event) =>
                                  updateLibraryState((current) => ({ ...current, filterQuery: event.target.value }))
                                }
                              />
                            </label>
                          ) : null}
                        </div>
                        <div className="recall-library-list recall-home-library-list" role="list">
                          {visibleDocuments.map((document) => renderLibrarySourceRow(document))}
                        </div>
                      </section>
                    ) : (
                      <>
                        {homeLeadDocument || homeStageLibrarySection ? (
                          <div className="recall-home-stage-shell priority-surface-stage-shell">
                            {homeLeadDocument ? (
                              <section className="recall-home-continue-panel recall-home-continue-stage stack-gap" aria-label={homeWorkspaceContinueHeading}>
                                <div className="section-header section-header-compact recall-home-panel-header">
                                  <div>
                                    <h3>{homeWorkspaceContinueHeading}</h3>
                                    <p>{homeWorkspaceContinueSummary}</p>
                                  </div>
                                </div>
                                {renderHomeContinueCard(homeLeadDocument)}
                                {homeContinueDocuments.length > 0 ? (
                                  <div className="recall-home-continue-list" role="list" aria-label="Nearby sources">
                                    {homeContinueDocuments.map((document) => renderHomeContinueRow(document))}
                                  </div>
                                ) : null}
                              </section>
                            ) : null}

                            <aside
                              className="recall-home-library-stage stack-gap priority-surface-support-rail priority-surface-support-rail-quiet"
                              aria-label="Saved library"
                            >
                              <div className="section-header section-header-compact recall-home-library-stage-header">
                                <div className="recall-home-library-stage-heading">
                                  <div className="recall-library-section-heading-row">
                                    <h3>Saved library</h3>
                                    {homeStageLibrarySection ? (
                                      <span className="recall-library-section-count">
                                        {formatCountLabel(homeStageLibrarySection.documents.length, 'source', 'sources')}
                                      </span>
                                    ) : null}
                                  </div>
                                  <p>
                                    {homeStageLibrarySection
                                      ? `${homeStageLibrarySection.label} now starts inside the main workspace so you can keep browsing without dropping into a detached archive tail.`
                                      : 'Keep the wider saved-source library nearby while one source stays primary.'}
                                  </p>
                                </div>
                                {showInlineHomeSearch ? (
                                  <label className="field recall-inline-field recall-home-library-stage-search">
                                    <span className="visually-hidden">Search saved sources</span>
                                    <input
                                      aria-label="Search saved sources"
                                      type="search"
                                      placeholder="Search saved sources"
                                      value={libraryFilterQuery}
                                      onChange={(event) =>
                                        updateLibraryState((current) => ({ ...current, filterQuery: event.target.value }))
                                      }
                                    />
                                  </label>
                                ) : null}
                              </div>
                              {!libraryFilterActive && homeWorkspaceSectionCounts.length > 0 ? (
                                <div className="recall-home-library-stage-metrics" role="list" aria-label="Home snapshot">
                                  {homeWorkspaceSectionCounts.map((section) => (
                                    <span className="status-chip reader-meta-chip" key={section.key} role="listitem">
                                      {section.label} · {section.count}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                              {homeStageLibrarySection ? (
                                <div className="recall-home-library-stage-source">
                                  <strong>{homeStageLibrarySection.label}</strong>
                                  <span>Keep moving through the denser saved-source flow while the lead source stays closer at hand.</span>
                                </div>
                              ) : null}
                              {homeStageLibraryDocuments.length > 0 ? (
                                <div className="recall-home-library-stage-list" role="list">
                                  {homeStageLibraryDocuments.map((document) => renderHomeLibraryStageRow(document))}
                                </div>
                              ) : null}
                              {homeRemainingLibrarySections.length > 0 ? (
                                <p className="recall-home-library-stage-note">
                                  Then continue through the fuller saved-source lanes below when you want a broader pass across the workspace.
                                </p>
                              ) : null}
                            </aside>
                          </div>
                        ) : null}

                        {homeRemainingLibrarySections.length > 0 ? (
                          <section className="recall-home-library-stream stack-gap priority-surface-stage-shell" aria-label="Saved library lanes">
                            <div className="section-header section-header-compact recall-home-library-stream-header">
                              <div>
                                <h3>Continue through the library</h3>
                                <p>
                                  The lower library is now a continuation of the active workspace, not a separate archive wall.
                                </p>
                              </div>
                              <div className="recall-home-library-stream-meta" role="list" aria-label="Library flow status">
                                <span className="status-chip reader-meta-chip" role="listitem">
                                  {homeSavedSourceLabel}
                                </span>
                                <span className="status-chip reader-meta-chip" role="listitem">
                                  Shell Search stays global
                                </span>
                              </div>
                            </div>
                            <div className="recall-home-library-stream-grid">
                              {homeRemainingLibrarySections.map((section) => renderHomeLibrarySection(section, { stream: true }))}
                            </div>
                          </section>
                        ) : null}
                      </>
                    )
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        )
      ) : null}

      {section === 'graph' ? renderGraphSection() : null}

      {section === 'study' ? (
        sourceWorkspaceFocused && activeSourceDocumentId ? (
        <div
          className={
            showFocusedStudySplitView
              ? studyBrowseDrawerOpen
                ? 'recall-grid recall-focused-split-grid'
                : 'recall-grid recall-grid-browse-condensed recall-focused-split-grid'
              : studyBrowseDrawerOpen
                ? 'recall-study-browser-layout'
                : 'recall-study-browser-layout recall-study-browser-layout-condensed'
          }
        >
          {showStudySidebar ? (
            <section
              className={
                showFocusedStudySplitView
                  ? studyBrowseDrawerOpen
                    ? 'card stack-gap recall-collection-rail recall-source-side-rail recall-study-focus-rail'
                    : 'card stack-gap recall-collection-rail recall-collection-rail-condensed recall-source-side-rail recall-study-focus-rail'
                  : 'card stack-gap recall-collection-rail recall-study-sidebar'
              }
            >
            {collapsedStudyBrowseRail && studyStatus !== 'error' ? null : (
              <>
                <div
                  className={
                    showFocusedStudySplitView
                      ? 'toolbar recall-collection-toolbar recall-study-focus-rail-toolbar'
                      : !studyBrowseDrawerOpen
                      ? 'toolbar recall-collection-toolbar recall-study-sidebar-toolbar-collapsed'
                      : 'toolbar recall-collection-toolbar'
                  }
                >
                  <div className="section-header section-header-compact">
                    <h2>{showFocusedStudySplitView ? 'Study queue' : collapsedStudyBrowseRail ? 'Session' : 'Queue'}</h2>
                    {showFocusedStudySplitView || studyBrowseDrawerOpen ? (
                      <p>
                        {showFocusedStudySplitView
                          ? 'Keep the next card nearby while the live source stays visible.'
                          : 'Keep one grounded question in focus.'}
                      </p>
                    ) : null}
                  </div>
                  <div
                    className={
                      showFocusedStudySplitView
                        ? 'recall-actions recall-actions-inline recall-study-focus-rail-actions'
                        : 'recall-actions recall-actions-inline'
                    }
                  >
                    <button
                      aria-label={studyBrowseDrawerOpen ? 'Hide queue' : 'Show queue'}
                      className={
                        showFocusedStudySplitView
                          ? 'ghost-button recall-study-focus-rail-button recall-study-focus-rail-button-queue'
                          : !studyBrowseDrawerOpen
                            ? 'ghost-button recall-study-sidebar-toggle-button'
                            : 'ghost-button'
                      }
                      type="button"
                      onClick={() => setBrowseDrawerOpen('study', !studyBrowseDrawerOpen)}
                    >
                      {studyBrowseDrawerOpen ? 'Hide queue' : 'Queue'}
                    </button>
                    <button
                      aria-label={studyBusyKey === 'generate' ? 'Refreshing cards' : 'Refresh cards'}
                      className={
                        showFocusedStudySplitView
                          ? 'ghost-button recall-study-focus-rail-button recall-study-focus-rail-button-refresh'
                          : !studyBrowseDrawerOpen
                            ? 'ghost-button recall-study-sidebar-utility-button'
                            : undefined
                      }
                      disabled={studyBusyKey === 'generate'}
                      type="button"
                      onClick={handleGenerateStudyCards}
                    >
                      {studyBusyKey === 'generate' ? 'Refreshing…' : 'Refresh'}
                    </button>
                  </div>
                </div>

                <div
                  className={
                    showFocusedStudySplitView
                      ? 'recall-study-sidebar-focus recall-study-focus-rail-summary'
                      : 'recall-study-sidebar-focus'
                  }
                >
                  <div className="recall-study-sidebar-focus-header">
                    <span
                      className={
                        showFocusedStudySplitView
                          ? 'status-chip status-muted recall-study-focus-rail-kicker'
                          : 'status-chip status-muted'
                      }
                    >
                      {showFocusedStudySplitView ? 'Focused review' : `${formatModeLabel(studyFilter)} queue`}
                    </span>
                    {!showFocusedStudySplitView ? <span className="recall-document-meta">{studyCountLabel}</span> : null}
                  </div>
                  <strong>{activeStudyCard?.prompt ?? 'No active card yet'}</strong>
                  <span className={showFocusedStudySplitView ? 'recall-study-focus-rail-summary-text' : undefined}>
                    {activeStudyCardSidebarSummary}
                  </span>
                  <div
                    className={
                      showFocusedStudySplitView
                        ? 'recall-hero-metrics recall-study-focus-rail-metrics'
                        : 'recall-hero-metrics recall-study-sidebar-metrics'
                    }
                    role="list"
                    aria-label="Study overview"
                  >
                    <span className="status-chip" role="listitem">{studyNewCountLabel}</span>
                    <span className="status-chip status-muted" role="listitem">{studyDueCountLabel}</span>
                    <span className="status-chip status-muted" role="listitem">{studyReviewCountLabel}</span>
                  </div>
                </div>
              </>
            )}

            {studyBrowseDrawerOpen || studyStatus === 'error' ? (
              <>
                <div className="recall-stage-tabs" aria-label="Study filters" role="tablist">
                  {([
                    ['all', 'All'],
                    ['new', 'New'],
                    ['due', 'Due'],
                    ['scheduled', 'Scheduled'],
                  ] as const).map(([filter, label]) => (
                    <button
                      key={filter}
                      aria-selected={studyFilter === filter}
                      className={studyFilter === filter ? 'recall-stage-tab recall-stage-tab-active' : 'recall-stage-tab'}
                      role="tab"
                      type="button"
                      onClick={() => updateStudyState((current) => ({ ...current, filter }))}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div
                  className={
                    showFocusedStudySplitView
                      ? 'recall-document-list'
                      : 'recall-document-list recall-study-sidebar-list'
                  }
                  role="list"
                >
                  {studyLoading ? <p className="small-note">Loading study cards…</p> : null}
                  {!studyLoading && studyStatus === 'error' ? (
                    <div className="recall-surface-state stack-gap">
                      <p>Study cards are unavailable until the local service reconnects.</p>
                      <div className="inline-actions">
                        <button className="ghost-button" type="button" onClick={handleRetryRecallLoading}>
                          Retry loading
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {!studyLoading && studyStatus !== 'error' && studyCards.length === 0 ? (
                    <div className="recall-surface-state">
                      <p>No study cards are available for that filter yet.</p>
                    </div>
                  ) : null}
                  {visibleStudyQueueCards.map((card) => (
                    <button
                      key={card.id}
                      aria-pressed={activeStudyCard?.id === card.id}
                      className={
                        activeStudyCard?.id === card.id
                          ? 'recall-document-item recall-document-item-compact recall-document-item-active recall-study-queue-item'
                          : 'recall-document-item recall-document-item-compact recall-study-queue-item'
                      }
                      type="button"
                      onClick={() => handleSelectStudyCard(card)}
                    >
                      <span className="recall-study-queue-item-head">
                        <strong className="recall-document-title">{card.prompt}</strong>
                        <span className="recall-study-queue-item-status">{formatStudyStatus(card.status)}</span>
                      </span>
                      <span className="recall-document-meta">{card.document_title}</span>
                      <span className="recall-collection-row-preview">{getStudyCardPreview(card)}</span>
                      <span className="recall-study-queue-item-meta">
                        <span>{card.card_type}</span>
                        <span>Due {dateFormatter.format(new Date(card.due_at))}</span>
                        <span>{formatCountLabel(card.review_count, 'review', 'reviews')}</span>
                      </span>
                    </button>
                  ))}
                </div>
                {!showFocusedStudySplitView && studyStatus !== 'error' && (studyQueueExpanded || hiddenStudyQueueCount > 0) ? (
                  <button
                    className="ghost-button recall-study-queue-toggle"
                    type="button"
                    onClick={() => setStudyQueueExpanded((current) => !current)}
                  >
                    {studyQueueExpanded ? 'Show fewer cards' : `Show all ${studyCards.length} cards`}
                  </button>
                ) : null}
              </>
            ) : showFocusedStudySplitView ? (
              <p className="small-note recall-study-sidebar-hint">
                {showFocusedStudySplitView
                  ? 'Open the queue only when you want to change cards or filters.'
                  : 'Queue support is hidden until you want to switch cards or change the filter.'}
              </p>
            ) : null}
            </section>
          ) : null}

          <div
            className={
              showFocusedStudySplitView
                ? 'recall-main-column recall-source-split-layout recall-source-split-layout-study-focused recall-source-split-layout-study-focused-flow-reset'
                : collapsedStudyBrowseRail
                  ? 'recall-main-column stack-gap recall-study-browser-main recall-study-browser-main-condensed recall-study-browser-main-lifted'
                  : 'recall-main-column stack-gap recall-study-browser-main'
            }
          >
            {showFocusedStudySplitView ? renderFocusedReaderPane() : null}

            <section
              className={
                showFocusedStudySplitView
                  ? 'card stack-gap recall-study-card recall-source-secondary-panel recall-study-focused-panel recall-study-focused-panel-bundled recall-study-focused-panel-hierarchy-reset recall-study-focused-panel-flow-reset recall-study-focused-panel-body-fused'
                  : collapsedStudyBrowseRail
                    ? 'card stack-gap recall-study-card recall-study-card-centered recall-study-card-browse-condensed recall-study-card-browse-expanded'
                    : 'card stack-gap recall-study-card recall-study-card-centered'
              }
            >
              <div
                className={
                  showFocusedStudySplitView
                    ? 'toolbar recall-collection-toolbar recall-study-focused-panel-toolbar'
                    : 'toolbar recall-collection-toolbar'
                }
              >
                <div
                  className={
                    showFocusedStudySplitView
                      ? 'section-header section-header-compact recall-study-focused-panel-heading'
                      : 'section-header section-header-compact'
                  }
                >
                  <h2>{showFocusedStudySplitView ? 'Active card' : 'Review card'}</h2>
                  {!activeStudyCard ? (
                    <p>
                      Choose a card from the queue to review it here.
                    </p>
                  ) : null}
                </div>
                {showFocusedStudySplitView ? null : (
                  renderCollapsedStudySupportStrip()
                )}
              </div>

              {!activeStudyCard ? <p className="small-note">No active study card yet.</p> : null}
              {activeStudyCard ? (
                <div
                  className={
                    showFocusedStudySplitView
                      ? `study-card-body stack-gap recall-study-focused-body-flow recall-study-focused-body-flow-reset recall-study-focused-body-flow-fused${showAnswer ? ' recall-study-focused-answer-shown' : ''}`
                      : 'study-card-body study-card-body-centered stack-gap'
                  }
                >
                  {showFocusedStudySplitView ? (
                    <div
                      className={
                        showAnswer
                          ? 'recall-study-focused-glance recall-study-focused-glance-fused recall-study-focused-glance-answer-shown'
                          : 'recall-study-focused-glance recall-study-focused-glance-fused'
                      }
                    >
                      <div className="recall-study-focused-glance-copy">
                        <strong>{showAnswer ? 'Review answer' : 'Focused review'}</strong>
                        <span>{activeStudyCard.document_title}</span>
                      </div>
                      <div className="recall-hero-metrics recall-study-focused-meta" role="list" aria-label="Study card metadata">
                        <span className="status-chip" role="listitem">{activeStudyCard.card_type}</span>
                        <span className="status-chip status-muted" role="listitem">{formatStudyStatus(activeStudyCard.status)}</span>
                        <span className="status-chip status-muted" role="listitem">
                          Due {dateFormatter.format(new Date(activeStudyCard.due_at))}
                        </span>
                        <span className="status-chip status-muted" role="listitem">
                          {formatCountLabel(activeStudyCard.review_count, 'review', 'reviews')}
                        </span>
                        <span className="status-chip status-muted" role="listitem">
                          {formatCountLabel(activeStudyCard.source_spans.length, 'evidence span', 'evidence spans')}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {showFocusedStudySplitView ? (
                    <div className="recall-study-focused-active-stack">
                      <div
                        className={
                          showAnswer
                            ? 'recall-detail-panel recall-study-focused-review-panel recall-study-focused-review-panel-compact recall-study-focused-review-panel-fused recall-study-focused-review-panel-answer-shown'
                            : 'recall-detail-panel recall-study-focused-review-panel recall-study-focused-review-panel-compact recall-study-focused-review-panel-fused'
                        }
                      >
                        <div className="recall-study-focused-review-section recall-study-focused-review-section-prompt">
                          <strong>Prompt</strong>
                          <p>{activeStudyCard.prompt}</p>
                        </div>

                        {showAnswer ? (
                          <div className="recall-study-focused-review-section recall-study-focused-review-section-answer">
                            <strong>Answer</strong>
                            <p>{activeStudyCard.answer}</p>
                          </div>
                        ) : (
                          <div className="recall-study-focused-reveal recall-study-focused-reveal-compact">
                            <p>Recall the answer before revealing it.</p>
                            <button type="button" onClick={() => setShowAnswer(true)}>
                              Reveal answer
                            </button>
                          </div>
                        )}

                        {showAnswer ? (
                          <div className="study-rating-row study-rating-row-focused recall-study-focused-rating recall-study-focused-rating-answer-shown">
                            {([
                              ['forgot', 'Forgot'],
                              ['hard', 'Hard'],
                              ['good', 'Good'],
                              ['easy', 'Easy'],
                            ] as const).map(([rating, label]) => (
                              <button
                                key={rating}
                                disabled={studyBusyKey === `review:${activeStudyCard.id}:${rating}`}
                                type="button"
                                onClick={() => handleReviewCard(rating)}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {!showFocusedStudySplitView ? (
                    <>
                      <div className="study-card-face">
                        <strong>Prompt</strong>
                        <p>{activeStudyCard.prompt}</p>
                      </div>

                      {showAnswer ? (
                        <div className="study-card-answer">
                          <strong>Answer</strong>
                          <p>{activeStudyCard.answer}</p>
                        </div>
                      ) : (
                        <div className="study-card-reveal">
                          <p>Recall the answer before revealing it.</p>
                          <button type="button" onClick={() => setShowAnswer(true)}>
                            Show answer
                          </button>
                        </div>
                      )}
                    </>
                  ) : null}

                  <div
                    className={
                      showFocusedStudySplitView
                        ? showAnswer
                          ? 'recall-study-focused-support-stack recall-study-focused-support-stack-answer-shown'
                          : 'recall-study-focused-support-stack'
                        : 'stack-gap recall-study-support-stack'
                    }
                  >
                    {showFocusedStudySplitView ? (
                      <div
                        className={
                          showAnswer
                            ? 'recall-study-focused-evidence recall-detail-panel recall-study-focused-evidence-fused recall-study-focused-evidence-answer-shown'
                            : 'recall-study-focused-evidence recall-detail-panel recall-study-focused-evidence-fused'
                        }
                      >
                        <div
                          className={
                            showAnswer
                              ? 'recall-study-focused-evidence-header recall-study-focused-evidence-header-answer-shown'
                              : 'recall-study-focused-evidence-header'
                          }
                        >
                          <div className="section-header section-header-compact recall-study-focused-evidence-copy">
                            <h3>Supporting evidence</h3>
                            <p>
                              {showAnswer
                                ? 'Keep one grounded excerpt nearby before reopening the full Reader.'
                                : 'Use one excerpt as a quick reminder only when you need it.'}
                            </p>
                          </div>
                          {focusedStudySourceSpan ? (
                            <div
                              className={
                                showAnswer
                                  ? 'recall-actions recall-actions-inline recall-study-focused-evidence-actions recall-study-focused-evidence-actions-answer-shown'
                                  : 'recall-actions recall-actions-inline recall-study-focused-evidence-actions'
                              }
                            >
                              <button
                                aria-label={buildShowReaderLabel(activeStudyCard.document_title)}
                                type="button"
                                onClick={() => handleShowStudyEvidenceInFocusedReader(activeStudyCard, focusedStudySourceSpan, focusedStudySourceSpanIndex)}
                              >
                                Show
                              </button>
                              <button
                                aria-label={buildOpenReaderLabel(activeStudyCard.document_title)}
                                className="ghost-button"
                                type="button"
                                onClick={() => handleOpenStudyCardInReader(activeStudyCard, focusedStudySourceSpan)}
                              >
                                Open
                              </button>
                            </div>
                          ) : null}
                        </div>

                        {activeStudySourceSpans.length > 1 ? (
                          <div className="recall-study-evidence-tabs" aria-label="Evidence spans" role="tablist">
                            {activeStudySourceSpans.map((sourceSpan, index) => (
                              <button
                                key={`${activeStudyCard.id}:focused-tab:${index}`}
                                aria-selected={focusedStudySourceSpanIndex === index}
                                className={
                                  focusedStudySourceSpanIndex === index
                                    ? 'recall-study-evidence-tab recall-study-evidence-tab-active'
                                    : 'recall-study-evidence-tab'
                                }
                                role="tab"
                                type="button"
                                onClick={() => setFocusedStudySourceSpanIndex(index)}
                              >
                                Evidence {index + 1}
                                {getRecordStringValue(sourceSpan, 'note_id') ? ' · Note' : ''}
                              </button>
                            ))}
                          </div>
                        ) : null}

                        {focusedStudySourceSpan ? (
                          <div className="recall-study-evidence-focus recall-study-evidence-focus-compact recall-study-evidence-focus-inline">
                            <span className="recall-collection-row-head">
                              <strong>{getStudyEvidenceLabel(focusedStudySourceSpan)}</strong>
                              <span>{activeStudyCard.document_title}</span>
                            </span>
                            <span className="recall-collection-row-preview">{getStudyEvidenceExcerpt(focusedStudySourceSpan)}</span>
                            <span className="recall-collection-row-meta">
                              {getRecordStringValue(focusedStudySourceSpan, 'note_id') ? <span className="status-chip">Anchored note</span> : null}
                              {getRecordStringValue(focusedStudySourceSpan, 'edge_id') ? <span className="status-chip">Graph-backed</span> : null}
                              {getRecordStringValue(focusedStudySourceSpan, 'chunk_id') ? <span className="status-chip">Chunk excerpt</span> : null}
                              {getRecordNumberValue(focusedStudySourceSpan, 'global_sentence_start') !== null ? (
                                <span className="status-chip">
                                  Sentences {String(getRecordNumberValue(focusedStudySourceSpan, 'global_sentence_start'))}-{String(getRecordNumberValue(focusedStudySourceSpan, 'global_sentence_end'))}
                                </span>
                              ) : null}
                            </span>
                          </div>
                        ) : (
                          <div className="recall-study-evidence-focus recall-study-evidence-focus-compact recall-study-evidence-focus-inline recall-study-evidence-focus-empty">
                            <strong>No evidence span yet</strong>
                            <span>Promote more grounded notes or reader highlights to add supporting excerpts here.</span>
                          </div>
                        )}

                        {showFocusedStudyGroundingExcerpt ? (
                          <div className="recall-study-focused-grounding-inline">
                            <strong>Grounding</strong>
                            <span>{focusedStudyGroundingExcerpt}</span>
                          </div>
                        ) : null}
                      </div>
                    ) : browseStudyEvidenceExpanded ? (
                      <>
                        <div className="toolbar recall-study-support-toolbar">
                          <div className="section-header section-header-compact recall-study-support-heading">
                            <h3>Source evidence</h3>
                            <p>
                              {!showAnswer && studyEvidencePeekOpen
                                ? 'Preview the supporting excerpt, then return to the recall flow when you are ready to answer.'
                                : 'Keep one supporting excerpt nearby before reopening Reader or logging a review.'}
                            </p>
                          </div>
                          <div className="recall-actions recall-actions-inline recall-study-support-actions">
                            {!showAnswer && studyEvidencePeekOpen ? (
                              <button
                                className="ghost-button recall-study-evidence-summary-button"
                                type="button"
                                onClick={() => setStudyEvidencePeekOpen(false)}
                              >
                                Hide preview
                              </button>
                            ) : null}
                            {focusedStudySourceSpan ? (
                              <button
                                className="ghost-button recall-study-evidence-reader-button"
                                type="button"
                                onClick={() => handleOpenStudyCardInReader(activeStudyCard, focusedStudySourceSpan)}
                              >
                                {buildOpenReaderLabel(activeStudyCard.document_title)}
                              </button>
                            ) : null}
                          </div>
                        </div>

                        {activeStudySourceSpans.length > 1 ? (
                          <div className="recall-study-evidence-tabs" aria-label="Evidence spans" role="tablist">
                            {activeStudySourceSpans.map((sourceSpan, index) => (
                              <button
                                key={`${activeStudyCard.id}:tab:${index}`}
                                aria-selected={focusedStudySourceSpanIndex === index}
                                className={
                                  focusedStudySourceSpanIndex === index
                                    ? 'recall-study-evidence-tab recall-study-evidence-tab-active'
                                    : 'recall-study-evidence-tab'
                                }
                                role="tab"
                                type="button"
                                onClick={() => setFocusedStudySourceSpanIndex(index)}
                              >
                                Evidence {index + 1}
                                {getRecordStringValue(sourceSpan, 'note_id') ? ' · Note' : ''}
                              </button>
                            ))}
                          </div>
                        ) : null}

                        {focusedStudySourceSpan ? (
                          <div className="recall-detail-panel recall-study-evidence-focus recall-study-evidence-focus-compact">
                            <span className="recall-collection-row-head">
                              <strong>{getStudyEvidenceLabel(focusedStudySourceSpan)}</strong>
                              <span>{activeStudyCard.document_title}</span>
                            </span>
                            <span className="recall-collection-row-preview">{getStudyEvidenceExcerpt(focusedStudySourceSpan)}</span>
                            <span className="recall-collection-row-meta">
                              {getRecordStringValue(focusedStudySourceSpan, 'note_id') ? <span className="status-chip">Anchored note</span> : null}
                              {getRecordStringValue(focusedStudySourceSpan, 'edge_id') ? <span className="status-chip">Graph-backed</span> : null}
                              {getRecordStringValue(focusedStudySourceSpan, 'chunk_id') ? <span className="status-chip">Chunk excerpt</span> : null}
                              {getRecordNumberValue(focusedStudySourceSpan, 'global_sentence_start') !== null ? (
                                <span className="status-chip">
                                  Sentences {String(getRecordNumberValue(focusedStudySourceSpan, 'global_sentence_start'))}-{String(getRecordNumberValue(focusedStudySourceSpan, 'global_sentence_end'))}
                                </span>
                              ) : null}
                            </span>
                          </div>
                        ) : (
                          <div className="recall-detail-panel recall-study-evidence-focus recall-study-evidence-focus-compact">
                            <strong>No evidence span yet</strong>
                            <span>Promote more grounded notes or reader highlights to add supporting excerpts here.</span>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>

                  {showFocusedStudySplitView ? null : showAnswer ? (
                    <div className="recall-study-rating-panel">
                      <p className="recall-study-rating-note">Rate recall to schedule the next review.</p>
                      <div className="study-rating-row study-rating-row-compact">
                        {([
                          ['forgot', 'Forgot'],
                          ['hard', 'Hard'],
                          ['good', 'Good'],
                          ['easy', 'Easy'],
                        ] as const).map(([rating, label]) => (
                          <button
                            key={rating}
                            className="recall-study-rating-button"
                            disabled={studyBusyKey === `review:${activeStudyCard.id}:${rating}`}
                            type="button"
                            onClick={() => handleReviewCard(rating)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="small-note recall-study-rating-placeholder">
                      Reveal the answer to rate recall.
                    </p>
                  )}

                </div>
              ) : null}
            </section>
          </div>
        </div>
        ) : (
          renderDesktopStudySection()
        )
      ) : null}

      {section === 'notes' ? renderNotesSection() : null}
    </div>
  )
}

