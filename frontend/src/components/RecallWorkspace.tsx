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

function getGraphEdgeDirectionLabel(edge: KnowledgeEdgeRecord, nodeId: string) {
  return edge.source_id === nodeId ? `Points to ${formatRelationLabel(edge.relation_type)}` : `Linked from ${formatRelationLabel(edge.relation_type)}`
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
  onRequestNewSource,
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
  const [studyOverview, setStudyOverview] = useState<StudyOverview | null>(null)
  const [studyCards, setStudyCards] = useState<StudyCardRecord[]>([])
  const [studyStatus, setStudyStatus] = useState<LoadState>('loading')
  const [studyError, setStudyError] = useState<string | null>(null)
  const [studyBusyKey, setStudyBusyKey] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
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
  const librarySectionSnapshot = useMemo(() => buildLibraryBrowseSections(documents), [documents])
  const featuredLibrarySection = libraryBrowseSections[0] ?? null
  const secondaryLibrarySections = libraryBrowseSections.slice(1)
  const showingNoteSearch = deferredNoteSearch.trim().length > 0
  const visibleNotes = showingNoteSearch ? noteSearchResults : documentNotes
  const activeNote =
    visibleNotes.find((note) => note.id === selectedNoteId) ??
    documentNotes.find((note) => note.id === selectedNoteId) ??
    noteSearchResults.find((note) => note.id === selectedNoteId) ??
    visibleNotes[0] ??
    null
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
  const graphQuickPickNodes = useMemo(() => filteredGraphNodes.slice(0, 8), [filteredGraphNodes])
  const graphCanvasNodePositionById = useMemo(
    () => new Map(graphCanvasNodes.map(({ node, x, y }) => [node.id, { x, y }])),
    [graphCanvasNodes],
  )
  const graphFilterActive = deferredGraphFilter.trim().length > 0
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
        ? 'Edit saved notes without losing the active source.'
        : section === 'graph'
          ? 'Validate graph evidence without losing the active source.'
          : 'Review study evidence without losing the active source.'
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
  const resumeSupportDocuments = useMemo(
    () => visibleDocuments.filter((document) => document.id !== resumeSourceDocument?.id).slice(0, 2),
    [resumeSourceDocument?.id, visibleDocuments],
  )

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
  }, [activeStudyCard?.id])

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
  const graphPendingEdgesLabel =
    graphStatus === 'error' ? 'Relations unavailable' : `${graphSnapshot?.pending_edges ?? 0} pending edges`
  const graphConfirmedEdgesLabel =
    graphStatus === 'error' ? 'Retry needed' : `${graphSnapshot?.confirmed_edges ?? 0} confirmed edges`
  const studyNewCountLabel = studyStatus === 'error' ? 'Study unavailable' : `${studyOverview?.new_count ?? 0} new`
  const studyDueCountLabel = studyStatus === 'error' ? 'Counts unavailable' : `${studyOverview?.due_count ?? 0} due`
  const studyReviewCountLabel =
    studyStatus === 'error' ? 'Retry needed' : `${studyOverview?.review_event_count ?? 0} reviews logged`
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

  function renderLibrarySourceTile(document: RecallDocumentRecord) {
    return (
      <button
        aria-label={`Open ${document.title}`}
        key={document.id}
        className="recall-source-tile"
        type="button"
        onClick={() => focusSourceLibrary(document.id)}
      >
        <span className="recall-source-tile-date">{dateFormatter.format(new Date(document.updated_at))}</span>
        <span className="recall-source-tile-head">
          <strong>{document.title}</strong>
        </span>
        <span className="recall-source-tile-preview">{getDocumentSourcePreview(document)}</span>
        <span className="recall-source-tile-meta">
          <span>{document.source_type.toUpperCase()}</span>
          <span>{document.available_modes.length} {document.available_modes.length === 1 ? 'view' : 'views'}</span>
        </span>
      </button>
    )
  }

  function renderLibrarySourceRow(document: RecallDocumentRecord) {
    return (
      <button
        aria-label={`Open ${document.title}`}
        key={`row:${document.id}`}
        className="recall-library-list-row"
        type="button"
        onClick={() => focusSourceLibrary(document.id)}
      >
        <span className="recall-library-list-row-main">
          <strong>{document.title}</strong>
          <span>{getDocumentSourcePreview(document)}</span>
        </span>
        <span className="recall-library-list-row-meta">
          <span>{dateFormatter.format(new Date(document.updated_at))}</span>
          <span>{document.source_type.toUpperCase()}</span>
        </span>
      </button>
    )
  }

  function renderLibrarySupportCard(document: RecallDocumentRecord) {
    return (
      <button
        aria-label={`Open ${document.title}`}
        key={`support:${document.id}`}
        className="recall-library-support-card"
        type="button"
        onClick={() => focusSourceLibrary(document.id)}
      >
        <span className="recall-library-support-card-head">
          <span className="status-chip">Nearby</span>
          <span>{dateFormatter.format(new Date(document.updated_at))}</span>
        </span>
        <strong>{document.title}</strong>
        <span className="recall-library-support-card-preview">{getDocumentSourcePreview(document)}</span>
        <span className="recall-library-support-card-meta">
          <span>{document.source_type.toUpperCase()}</span>
          <span>{document.available_modes.length} {document.available_modes.length === 1 ? 'view' : 'views'}</span>
        </span>
      </button>
    )
  }

  function renderGraphQuickPick(node: KnowledgeNodeRecord) {
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
      >
        <span className="recall-collection-row-head">
          <strong>{node.label}</strong>
          <span>{Math.round(node.confidence * 100)}%</span>
        </span>
        <span className="recall-collection-row-preview">{getGraphNodePreview(node)}</span>
        <span className="recall-collection-row-meta">
          <span className="status-chip">{node.node_type}</span>
          <span className="status-chip">{node.status}</span>
          <span className="status-chip">{formatCountLabel(node.mention_count, 'mention', 'mentions')}</span>
        </span>
      </button>
    )
  }

  function renderBrowseGraphDetailOverlay() {
    const primarySourceDocumentId =
      selectedNodeDetail?.mentions[0]?.source_document_id ?? selectedNodeDetail?.node.source_document_ids[0] ?? null
    const primarySourceDocumentTitle = primarySourceDocumentId
      ? documentTitleById.get(primarySourceDocumentId) ?? 'Saved source'
      : null

    return (
      <aside
        className={
          selectedNodeDetail
            ? 'recall-graph-detail-overlay'
            : 'recall-graph-detail-overlay recall-graph-detail-overlay-empty'
        }
      >
        <div className="toolbar recall-collection-toolbar recall-graph-detail-toolbar">
          <div className="section-header section-header-compact">
            <h3>{selectedNodeDetail ? selectedNodeDetail.node.label : 'Select a node'}</h3>
            <p>
              {nodeDetailLoading
                ? 'Loading source-grounded graph evidence.'
                : selectedNodeDetail
                  ? selectedNodeDetail.node.description ?? 'Review the supporting mentions and linked concepts.'
                  : 'Choose a node from the graph or the quick list to inspect its evidence and relations.'}
            </p>
          </div>
          {selectedNodeDetail ? (
            <div className="recall-actions recall-actions-inline">
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
            </div>
          ) : null}
        </div>

        {nodeDetailLoading ? <p className="small-note">Loading node detail…</p> : null}
        {!nodeDetailLoading && !selectedNodeDetail ? (
          <p className="small-note">
            The graph stays browse-first here. Open a source intentionally only when you want to switch into focused work.
          </p>
        ) : null}
        {!nodeDetailLoading && selectedNodeDetail ? (
          <div className="recall-graph-detail-body stack-gap">
            <div className="recall-graph-detail-summary">
              <div className="recall-detail-panel">
                <strong>Status</strong>
                <span>{selectedNodeDetail.node.status}</span>
              </div>
              <div className="recall-detail-panel">
                <strong>Confidence</strong>
                <span>{Math.round(selectedNodeDetail.node.confidence * 100)}%</span>
              </div>
              <div className="recall-detail-panel">
                <strong>Source docs</strong>
                <span>{selectedNodeDetail.node.source_document_ids.length || selectedNodeDetail.node.document_count}</span>
              </div>
            </div>

            {primarySourceDocumentId && primarySourceDocumentTitle ? (
              <div className="recall-actions recall-actions-inline">
                <button type="button" onClick={() => handleOpenDocumentInReader(primarySourceDocumentId)}>
                  {buildOpenReaderLabel(primarySourceDocumentTitle)}
                </button>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => focusSourceGraph(primarySourceDocumentId, selectedNodeDetail.node.id)}
                >
                  Focus source
                </button>
              </div>
            ) : null}

            <div className="stack-gap">
              <div className="section-header section-header-compact">
                <h4>Mentions</h4>
                <p>Every mention remains tied to the source that created it.</p>
              </div>
              <div className="recall-search-results" role="list">
                {selectedNodeDetail.mentions.map((mention) => (
                  <div key={mention.id} className="recall-search-hit recall-evidence-card" role="listitem">
                    <span className="recall-collection-row-head">
                      <strong>{mention.document_title}</strong>
                      <span>{Math.round(mention.confidence * 100)}%</span>
                    </span>
                    <span className="recall-collection-row-preview">{mention.excerpt}</span>
                    <span className="recall-collection-row-meta">
                      <span className="status-chip">{mention.entity_type}</span>
                      <span className="status-chip">{mention.text}</span>
                    </span>
                    <div className="recall-actions recall-actions-inline">
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => handleOpenMentionInReader(mention.source_document_id)}
                      >
                        {buildOpenReaderLabel(mention.document_title)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="stack-gap">
              <div className="section-header section-header-compact">
                <h4>Relations</h4>
                <p>Confirm inferred links while keeping the graph itself dominant.</p>
              </div>
              <div className="recall-search-results" role="list">
                {selectedNodeEdges.length ? (
                  selectedNodeEdges.map((edge) => (
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
                  ))
                ) : (
                  <div className="recall-detail-panel">
                    <strong>No linked concepts yet</strong>
                    <span>Import more source material or confirm mentions to strengthen this node.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </aside>
    )
  }

  function renderFocusedGraphSection() {
    return (
      <div className="recall-grid recall-grid-browse-condensed">
        <section className="card stack-gap recall-collection-rail recall-collection-rail-condensed">
          <div className="toolbar recall-collection-toolbar">
            <div className="section-header section-header-compact">
              <h2>Graph</h2>
              <p>Keep one source in focus while graph evidence stays beside the live Reader.</p>
            </div>
            <button className="ghost-button" type="button" onClick={() => setBrowseDrawerOpen('graph', true)}>
              Browse
            </button>
          </div>
          <div className="recall-browse-drawer-summary stack-gap">
            <p className="small-note">
              {selectedNodeDetail
                ? 'Stay with the active node here, or reopen browse mode when you want to compare more graph context.'
                : 'Browse mode reopens the wider graph canvas and node picker.'}
            </p>
            <div className="recall-detail-panel recall-browse-summary-card">
              <strong>{selectedNodeDetail?.node.label ?? 'No active node for this source'}</strong>
              <span>
                {selectedNodeDetail
                  ? selectedNodeDetail.node.description ?? formatCountLabel(selectedNodeEdges.length, 'relation', 'relations')
                  : 'Select graph evidence from this source to bring it into the focused split.'}
              </span>
            </div>
          </div>
        </section>

        <div className="recall-main-column recall-source-split-layout">
          {renderFocusedReaderPane()}
          <section className="card stack-gap">
            <div className="toolbar recall-collection-toolbar">
              <div className="section-header section-header-compact">
                <h2>Node detail</h2>
                <p>
                  {selectedNodeDetail
                    ? 'Review source evidence and relation suggestions before they become trusted knowledge.'
                    : 'Choose a node to inspect its provenance and relations.'}
                </p>
              </div>
              {selectedNodeDetail ? (
                <div className="recall-actions">
                  <button
                    disabled={graphBusyKey === `node:${selectedNodeDetail.node.id}:confirmed`}
                    type="button"
                    onClick={() => handleDecideNode('confirmed')}
                  >
                    Confirm node
                  </button>
                  <button
                    className="ghost-button"
                    disabled={graphBusyKey === `node:${selectedNodeDetail.node.id}:rejected`}
                    type="button"
                    onClick={() => handleDecideNode('rejected')}
                  >
                    Reject node
                  </button>
                </div>
              ) : null}
            </div>

            {nodeDetailLoading ? <p className="small-note">Loading node detail…</p> : null}
            {!nodeDetailLoading && selectedNodeDetail ? (
              <div className="stack-gap">
                <section className="recall-graph-stage" aria-label="Graph stage">
                  <div className="recall-graph-stage-copy">
                    <span className="status-chip">Selected node</span>
                    <h3>{selectedNodeDetail.node.label}</h3>
                    <p>
                      {selectedNodeDetail.node.description ??
                        'Inspect the closest concepts and supporting relations before confirming this node.'}
                    </p>
                  </div>
                  <div className="recall-hero-metrics" role="list" aria-label="Selected node summary">
                    <span className="status-chip" role="listitem">{selectedNodeDetail.node.status}</span>
                    <span className="status-chip status-muted" role="listitem">
                      {Math.round(selectedNodeDetail.node.confidence * 100)}% confidence
                    </span>
                    <span className="status-chip status-muted" role="listitem">
                      {formatCountLabel(selectedNodeDetail.mentions.length, 'mention', 'mentions')}
                    </span>
                    <span className="status-chip status-muted" role="listitem">
                      {formatCountLabel(selectedNodeEdges.length, 'relation', 'relations')}
                    </span>
                  </div>
                  <div className="recall-graph-stage-network">
                    <div className="recall-graph-stage-node recall-graph-stage-node-active">
                      <strong>{selectedNodeDetail.node.label}</strong>
                      <span>{selectedNodeDetail.node.node_type}</span>
                    </div>
                    <div className="recall-graph-stage-orbit" role="list">
                      {selectedNodeEdges.slice(0, 4).map((edge) => (
                        <div key={`graph-stage:${edge.id}`} className="recall-graph-stage-node" role="listitem">
                          <strong>{getGraphEdgeCounterpartLabel(edge, selectedNodeDetail.node.id)}</strong>
                          <span>{getGraphEdgeDirectionLabel(edge, selectedNodeDetail.node.id)}</span>
                        </div>
                      ))}
                      {!selectedNodeEdges.length ? (
                        <div className="recall-graph-stage-node recall-graph-stage-node-empty" role="listitem">
                          <strong>No linked concepts yet</strong>
                          <span>Import more source material or confirm mentions to strengthen this node.</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </section>

                <div className="recall-graph-stage-metadata">
                  <div className="recall-detail-panel">
                    <strong>Type</strong>
                    <span>{selectedNodeDetail.node.node_type}</span>
                  </div>
                  <div className="recall-detail-panel">
                    <strong>Aliases</strong>
                    <span>{selectedNodeDetail.node.aliases.join(', ') || 'No alternate labels yet'}</span>
                  </div>
                  <div className="recall-detail-panel">
                    <strong>Source docs</strong>
                    <span>{selectedNodeDetail.node.source_document_ids.length || selectedNodeDetail.node.document_count}</span>
                  </div>
                </div>

                <div className="stack-gap">
                  <div className="section-header section-header-compact">
                    <h3>Mentions</h3>
                    <p>Each mention stays attached to the source document that produced it, with in-place Reader evidence beside it.</p>
                  </div>
                  <div className="recall-search-results" role="list">
                    {selectedNodeDetail.mentions.map((mention) => (
                      <div key={mention.id} className="recall-search-hit recall-evidence-card" role="listitem">
                        <span className="recall-collection-row-head">
                          <strong>{mention.document_title}</strong>
                          <span>{Math.round(mention.confidence * 100)}%</span>
                        </span>
                        <span className="recall-collection-row-preview">{mention.excerpt}</span>
                        <span className="recall-collection-row-meta">
                          <span className="status-chip">{mention.entity_type}</span>
                          <span className="status-chip">{mention.text}</span>
                          {mention.chunk_id ? <span className="status-chip">Chunk evidence</span> : null}
                        </span>
                        <div className="recall-actions recall-actions-inline">
                          {mention.source_document_id === activeSourceDocumentId ? (
                            <button
                              type="button"
                              onClick={() => handleShowGraphEvidenceInFocusedReader(`mention:${mention.id}`, mention.source_document_id)}
                            >
                              {buildShowReaderLabel(mention.document_title)}
                            </button>
                          ) : null}
                          <button
                            className="ghost-button"
                            type="button"
                            onClick={() => handleOpenMentionInReader(mention.source_document_id)}
                          >
                            {buildOpenReaderLabel(mention.document_title)}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="stack-gap">
                  <div className="section-header section-header-compact">
                    <h3>Relations</h3>
                    <p>Confirm or reject inferred links while keeping the supporting source evidence beside live reading.</p>
                  </div>
                  <div className="recall-search-results" role="list">
                    {selectedNodeEdges.map((edge) => (
                      <div key={`${selectedNodeDetail.node.id}:${edge.id}`} className="recall-search-hit recall-edge-card recall-evidence-card" role="listitem">
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
              </div>
            ) : null}
          </section>
        </div>
      </div>
    )
  }

  function renderGraphBrowseSection() {
    return (
      <div className={graphBrowseDrawerOpen ? 'recall-graph-browser-layout' : 'recall-graph-browser-layout recall-graph-browser-layout-condensed'}>
        <aside
          className={
            graphBrowseDrawerOpen
              ? 'card stack-gap recall-graph-sidebar'
              : 'card stack-gap recall-graph-sidebar recall-graph-sidebar-condensed'
          }
        >
          <div className="toolbar recall-collection-toolbar">
            <div className="section-header section-header-compact">
              <h2>Graph</h2>
              <p>Validate saved concepts and relations from one calmer graph-first surface.</p>
            </div>
            <button className="ghost-button" type="button" onClick={() => setBrowseDrawerOpen('graph', !graphBrowseDrawerOpen)}>
              {graphBrowseDrawerOpen ? 'Hide' : 'Show'}
            </button>
          </div>

          {graphBrowseDrawerOpen ? (
            <>
              <label className="field recall-inline-field">
                <span>Find nodes</span>
                <input
                  type="search"
                  placeholder="Search node, type, or alias"
                  value={graphFilterQuery}
                  onChange={(event) => setGraphFilterQuery(event.target.value)}
                />
              </label>

              <div className="recall-hero-metrics recall-graph-sidebar-metrics" role="list" aria-label="Graph metrics">
                <span className="status-chip" role="listitem">
                  {graphStatus === 'error' ? 'Graph unavailable' : graphLoading ? 'Loading graph…' : `${graphSnapshot?.nodes.length ?? 0} nodes`}
                </span>
                <span className="status-chip status-muted" role="listitem">{graphPendingEdgesLabel}</span>
                <span className="status-chip status-muted" role="listitem">{graphConfirmedEdgesLabel}</span>
              </div>

              {activeSourceDocumentId ? (
                <div className="recall-detail-panel">
                  <strong>Last focused source</strong>
                  <span>{documentTitleById.get(activeSourceDocumentId) ?? 'Saved source'}</span>
                </div>
              ) : null}

              <div className="section-header section-header-compact">
                <h3>{graphFilterActive ? 'Matching nodes' : 'Quick picks'}</h3>
                <p>
                  {graphFilterActive
                    ? `Showing ${filteredGraphNodes.length} matching ${filteredGraphNodes.length === 1 ? 'node' : 'nodes'}.`
                    : 'Start from the strongest nodes, then inspect the wider graph in the canvas.'}
                </p>
              </div>

              <div className="recall-graph-quick-picks" role="list">
                {graphLoading ? <p className="small-note">Building the local knowledge graph…</p> : null}
                {!graphLoading && graphStatus === 'error' ? (
                  <div className="stack-gap">
                    <p className="small-note">The knowledge graph is unavailable until the local service reconnects.</p>
                    <div className="inline-actions">
                      <button className="ghost-button" type="button" onClick={handleRetryRecallLoading}>
                        Retry loading
                      </button>
                    </div>
                  </div>
                ) : null}
                {!graphLoading && graphStatus !== 'error' && !graphSnapshot?.nodes.length ? (
                  <p className="small-note">Import more source material to give the graph stronger concepts and relations.</p>
                ) : null}
                {!graphLoading && graphStatus !== 'error' && graphSnapshot?.nodes.length && !filteredGraphNodes.length ? (
                  <p className="small-note">No nodes match that filter yet.</p>
                ) : null}
                {graphQuickPickNodes.map((node) => renderGraphQuickPick(node))}
              </div>
            </>
          ) : (
            <div className="recall-browse-drawer-summary stack-gap">
              <p className="small-note">
                Hide the support rail when you want the graph canvas and selected-node evidence to take over.
              </p>
              <div className="recall-detail-panel recall-browse-summary-card">
                <strong>{selectedNodeDetail?.node.label ?? 'Graph canvas ready'}</strong>
                <span>
                  {selectedNodeDetail
                    ? selectedNodeDetail.node.description ?? formatCountLabel(selectedNodeEdges.length, 'relation', 'relations')
                    : `${graphSnapshot?.nodes.length ?? 0} nodes ready for review.`}
                </span>
              </div>
            </div>
          )}
        </aside>

        <section className="card stack-gap recall-graph-browser-surface">
          <div className="toolbar recall-collection-toolbar">
            <div className="section-header">
              <p className="eyebrow">Knowledge graph</p>
              <h2>See the graph before you validate it.</h2>
              <p>
                One dominant canvas, one lighter support rail, and selected-node evidence that stays close without taking over the page.
              </p>
            </div>
          </div>

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
            <div className="recall-graph-browser-stage">
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
                {renderBrowseGraphDetailOverlay()}
              </div>

              <div className="recall-graph-browser-legend" role="list" aria-label="Graph legend">
                <span className="status-chip" role="listitem">Center node: active focus</span>
                <span className="status-chip status-muted" role="listitem">Inner orbit: directly linked</span>
                <span className="status-chip status-muted" role="listitem">Outer orbit: nearby concepts</span>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    )
  }

  function renderGraphSection() {
    return showFocusedGraphSplitView ? renderFocusedGraphSection() : renderGraphBrowseSection()
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
          <div className={libraryBrowseDrawerOpen ? 'recall-grid' : 'recall-grid recall-grid-browse-condensed'}>
            <section
              className={
                libraryBrowseDrawerOpen
                  ? 'card recall-library-card recall-collection-rail stack-gap'
                  : 'card recall-library-card recall-collection-rail recall-collection-rail-condensed stack-gap'
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
                  <p className="small-note">
                    Keep the active source centered here. Open browsing when you want to switch sources or refine the filter.
                  </p>
                  {sourceWorkspaceDrawerSummary ? (
                    <div className="recall-detail-panel recall-browse-summary-card">
                      <strong>{sourceWorkspaceDrawerSummary.title}</strong>
                      <span>{sourceWorkspaceDrawerSummary.source}</span>
                      <span>
                        {sourceWorkspaceDrawerSummary.updatedAt
                          ? `Updated ${dateFormatter.format(new Date(sourceWorkspaceDrawerSummary.updatedAt))}`
                          : sourceWorkspaceNoteCountLabel}
                      </span>
                    </div>
                  ) : (
                    <div className="recall-detail-panel recall-browse-summary-card">
                      <strong>No active source yet</strong>
                      <span>Open the Home panel when you want to choose a saved source.</span>
                    </div>
                  )}
                </div>
              )}
            </section>

            <div className="recall-main-column">{renderSourceOverviewPanel()}</div>
          </div>
        ) : (
          <section className="card recall-library-landing">
            <div className="recall-library-landing-layout">
              <aside className="recall-library-sidebar stack-gap">
                <div className="recall-library-sidebar-panel recall-library-sidebar-panel-accent stack-gap">
                  <div className="section-header section-header-compact">
                    <h2>Home</h2>
                    <p>
                      {documentsLoading
                        ? 'Loading local collection.'
                        : documentsStatus === 'error'
                          ? 'Reconnect the local service to reload saved sources.'
                          : documents.length === 0
                            ? 'Start with one source and build context from there.'
                            : `${documents.length} saved ${documents.length === 1 ? 'source' : 'sources'} ready inside your local workspace.`}
                    </p>
                  </div>

                  {!documentsLoading && documentsStatus !== 'error' && librarySectionSnapshot.length > 0 ? (
                    <div className="recall-library-sidebar-metrics" role="list" aria-label="Collection snapshot">
                      {librarySectionSnapshot.map((section) => (
                        <div className="recall-library-sidebar-metric" key={section.key} role="listitem">
                          <strong>{section.documents.length}</strong>
                          <span>{section.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <section className="recall-library-sidebar-panel stack-gap">
                  <label className="field recall-inline-field">
                    <span>Search saved sources</span>
                    <input
                      type="search"
                      placeholder="Search saved sources"
                      value={libraryFilterQuery}
                      onChange={(event) =>
                        updateLibraryState((current) => ({ ...current, filterQuery: event.target.value }))
                      }
                    />
                  </label>
                  <p className="small-note">
                    Keep Home selective here, then search when you need to reopen something older or more specific.
                  </p>
                </section>
              </aside>

              <div className="recall-library-canvas stack-gap">
                <div className="section-header recall-library-landing-header">
                  <div className="recall-library-landing-title">
                    <h2>{libraryFilterActive ? 'Search results' : 'Saved sources'}</h2>
                    <p className="recall-library-landing-copy">
                      {documentsLoading
                        ? 'Loading your saved source collection.'
                        : documentsStatus === 'error'
                          ? 'Saved sources are temporarily unavailable until the local service reconnects.'
                          : documents.length === 0
                            ? 'Add one source to start reading, saving notes, and building graph or study context.'
                            : libraryFilterActive
                              ? `Showing ${visibleDocuments.length} matching ${visibleDocuments.length === 1 ? 'source' : 'sources'}.`
                              : 'Start from one deliberate resume point, then expand grouped reopen sections only when you need more of the archive.'}
                    </p>
                  </div>
                  <div className="recall-library-landing-actions">
                    <button aria-label="Add source" type="button" onClick={onRequestNewSource}>
                      Add source
                    </button>
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
                    <p>Your Home is empty. Add a source to start reading, saving notes, and building graph or study context.</p>
                  </div>
                ) : null}
                {!documentsLoading && documentsStatus !== 'error' && documents.length > 0 && visibleDocuments.length === 0 ? (
                  <div className="recall-library-inline-state">
                    <p>No saved sources match that search. Try a different title, type, or locator.</p>
                  </div>
                ) : null}
                {!documentsLoading && documentsStatus !== 'error' && visibleDocuments.length > 0 ? (
                  libraryFilterActive ? (
                    <section className="recall-library-section stack-gap" aria-label="Matching saved sources">
                      <div className="section-header section-header-compact recall-library-section-header">
                        <div>
                          <h3>Matching sources</h3>
                          <p>Open the source you want, then return to grouped browsing when the search is done.</p>
                        </div>
                      </div>
                      <div className="recall-library-list" role="list">
                        {visibleDocuments.map((document) => renderLibrarySourceRow(document))}
                      </div>
                    </section>
                  ) : (
                    <>
                      {resumeSourceDocument ? (
                        <section className="recall-library-priority-band stack-gap" aria-label="Resume now">
                          <div className="section-header section-header-compact recall-library-section-header">
                            <div>
                              <h3>Resume now</h3>
                              <p>Return to the source you last kept active, then dip into grouped reopen sections only when you need to shift context.</p>
                            </div>
                          </div>

                          <div
                            className={
                              resumeSupportDocuments.length > 0
                                ? 'recall-library-priority-layout'
                                : 'recall-library-priority-layout recall-library-priority-layout-single'
                            }
                          >
                            <section className="recall-library-resume-card" aria-label="Resume source">
                              <div className="recall-library-resume-copy">
                                <span className="status-chip">Resume</span>
                                <strong>{resumeSourceDocument.title}</strong>
                                <p>
                                  {formatSourceWorkspaceTabLabel(activeSourceTab)} ready from {getDocumentSourcePreview(resumeSourceDocument)}.
                                </p>
                              </div>
                              <div className="recall-library-resume-meta" role="list" aria-label="Resume source details">
                                <span className="status-chip reader-meta-chip" role="listitem">
                                  {dateFormatter.format(new Date(resumeSourceDocument.updated_at))}
                                </span>
                                <span className="status-chip reader-meta-chip" role="listitem">
                                  {resumeSourceDocument.source_type.toUpperCase()}
                                </span>
                                <span className="status-chip reader-meta-chip" role="listitem">
                                  {resumeSourceDocument.available_modes.length}{' '}
                                  {resumeSourceDocument.available_modes.length === 1 ? 'view' : 'views'}
                                </span>
                              </div>
                              <button type="button" onClick={resumeFocusedSource}>
                                {activeSourceTab === 'reader' ? 'Open Reader' : `Resume ${formatSourceWorkspaceTabLabel(activeSourceTab)}`}
                              </button>
                            </section>

                            {resumeSupportDocuments.length > 0 ? (
                              <div className="recall-library-priority-support" role="list" aria-label="Nearby sources">
                                {resumeSupportDocuments.map((document) => renderLibrarySupportCard(document))}
                              </div>
                            ) : null}
                          </div>
                        </section>
                      ) : null}

                      {featuredLibrarySection ? (
                        <section className="recall-library-section stack-gap" aria-label={featuredLibrarySection.label}>
                          <div className="section-header section-header-compact recall-library-section-header">
                            <div>
                              <h3>{featuredLibrarySection.label}</h3>
                              <p>{featuredLibrarySection.description}</p>
                            </div>
                          </div>
                          <div className="recall-source-grid" aria-label={`${featuredLibrarySection.label} sources`} role="list">
                            {(expandedLibrarySectionKeys[featuredLibrarySection.key]
                              ? featuredLibrarySection.documents
                              : featuredLibrarySection.documents.slice(0, getLibrarySectionDisplayLimit(featuredLibrarySection.key))
                            ).map((document) => renderLibrarySourceTile(document))}
                          </div>
                          {featuredLibrarySection.documents.length > getLibrarySectionDisplayLimit(featuredLibrarySection.key) ? (
                            <div className="recall-library-section-footer">
                              <button
                                className="ghost-button"
                                type="button"
                                onClick={() =>
                                  setExpandedLibrarySectionKeys((current) => ({
                                    ...current,
                                    [featuredLibrarySection.key]: !current[featuredLibrarySection.key],
                                  }))
                                }
                              >
                                {expandedLibrarySectionKeys[featuredLibrarySection.key]
                                  ? `Show fewer ${featuredLibrarySection.label.toLowerCase()} sources`
                                  : `Show all ${featuredLibrarySection.documents.length} ${featuredLibrarySection.label.toLowerCase()} sources`}
                              </button>
                            </div>
                          ) : null}
                        </section>
                      ) : null}

                      {secondaryLibrarySections.map((section) => (
                        <section className="recall-library-section stack-gap" aria-label={section.label} key={section.key}>
                          <div className="section-header section-header-compact recall-library-section-header">
                            <div>
                              <h3>{section.label}</h3>
                              <p>{section.description}</p>
                            </div>
                          </div>
                          <div className="recall-library-list" role="list">
                            {(expandedLibrarySectionKeys[section.key]
                              ? section.documents
                              : section.documents.slice(0, getLibrarySectionDisplayLimit(section.key))
                            ).map((document) => renderLibrarySourceRow(document))}
                          </div>
                          {section.documents.length > getLibrarySectionDisplayLimit(section.key) ? (
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
                      ))}
                    </>
                  )
                ) : null}
              </div>
            </div>
          </section>
        )
      ) : null}

      {section === 'graph' ? renderGraphSection() : null}

      {section === 'study' ? (
        <div
          className={
            showFocusedStudySplitView
              ? studyBrowseDrawerOpen
                ? 'recall-grid'
                : 'recall-grid recall-grid-browse-condensed'
              : studyBrowseDrawerOpen
                ? 'recall-study-browser-layout'
                : 'recall-study-browser-layout recall-study-browser-layout-condensed'
          }
        >
          <section
            className={
              showFocusedStudySplitView
                ? studyBrowseDrawerOpen
                  ? 'card stack-gap recall-collection-rail'
                  : 'card stack-gap recall-collection-rail recall-collection-rail-condensed'
                : studyBrowseDrawerOpen
                  ? 'card stack-gap recall-collection-rail recall-study-sidebar'
                  : 'card stack-gap recall-collection-rail recall-collection-rail-condensed recall-study-sidebar'
            }
          >
            <div className="toolbar recall-collection-toolbar">
              <div className="section-header section-header-compact">
                <h2>{showFocusedStudySplitView ? 'Study queue' : 'Study'}</h2>
                <p>
                  {showFocusedStudySplitView
                    ? 'Source-grounded cards regenerate deterministically and keep their FSRS review state over time.'
                    : 'Keep the next grounded card nearby while the main review loop stays centered.'}
                </p>
              </div>
              <div className="recall-actions recall-actions-inline">
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => setBrowseDrawerOpen('study', !studyBrowseDrawerOpen)}
                >
                  {studyBrowseDrawerOpen ? 'Hide' : 'Show'}
                </button>
                <button
                  disabled={studyBusyKey === 'generate'}
                  type="button"
                  onClick={handleGenerateStudyCards}
                >
                  {studyBusyKey === 'generate' ? 'Refreshing…' : 'Refresh cards'}
                </button>
              </div>
            </div>

            <div
              className={
                showFocusedStudySplitView
                  ? 'recall-hero-metrics'
                  : 'recall-hero-metrics recall-study-sidebar-metrics'
              }
              role="list"
              aria-label="Study overview"
            >
              <span className="status-chip" role="listitem">{studyNewCountLabel}</span>
              <span className="status-chip status-muted" role="listitem">{studyDueCountLabel}</span>
              <span className="status-chip status-muted" role="listitem">{studyReviewCountLabel}</span>
            </div>

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
                    <div className="stack-gap">
                      <p className="small-note">Study cards are unavailable until the local service reconnects.</p>
                      <div className="inline-actions">
                        <button className="ghost-button" type="button" onClick={handleRetryRecallLoading}>
                          Retry loading
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {!studyLoading && studyStatus !== 'error' && studyCards.length === 0 ? (
                    <p className="small-note">No study cards are available for that filter yet.</p>
                  ) : null}
                  {studyCards.map((card) => (
                    <button
                      key={card.id}
                      aria-pressed={activeStudyCard?.id === card.id}
                      className={
                        activeStudyCard?.id === card.id
                          ? 'recall-document-item recall-document-item-compact recall-document-item-active'
                          : 'recall-document-item recall-document-item-compact'
                      }
                      type="button"
                      onClick={() => handleSelectStudyCard(card)}
                    >
                      <span className="recall-collection-row-head">
                        <strong className="recall-document-title">{card.prompt}</strong>
                        <span className="recall-document-meta">{formatStudyStatus(card.status)}</span>
                      </span>
                      <span className="recall-collection-row-preview">{getStudyCardPreview(card)}</span>
                      <span className="recall-collection-row-meta">
                        <span className="status-chip">{card.card_type}</span>
                        <span className="status-chip">{card.document_title}</span>
                        <span className="status-chip">Due {dateFormatter.format(new Date(card.due_at))}</span>
                        <span className="status-chip">{formatCountLabel(card.review_count, 'review', 'reviews')}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="recall-browse-drawer-summary stack-gap">
                <p className="small-note">
                  {showFocusedStudySplitView
                    ? 'Keep the active card centered here. Open browsing when you want to change the queue or filter.'
                    : 'Keep the current card nearby here. Reopen the queue only when you want to switch the review flow.'}
                </p>
                <div className="recall-detail-panel recall-browse-summary-card">
                  <strong>{activeStudyCard?.prompt ?? 'No active card for this source'}</strong>
                  <span>
                    {activeStudyCard
                      ? `${activeStudyCard.document_title} · ${formatStudyStatus(activeStudyCard.status)}`
                      : activeSourceDocumentId
                        ? 'Generate or promote a study card from this source to review it here.'
                        : 'Choose a source to inspect its study state.'}
                  </span>
                </div>
              </div>
            )}
          </section>

          <div
            className={
              showFocusedStudySplitView
                ? 'recall-main-column recall-source-split-layout'
                : 'recall-main-column stack-gap recall-study-browser-main'
            }
          >
            {showFocusedStudySplitView ? renderFocusedReaderPane() : null}

            {!showFocusedStudySplitView ? (
              <section className="card recall-study-stage-card">
                <div className="recall-study-stage-copy">
                  <h2>Recall review</h2>
                  <p className="recall-study-stage-kicker">Review one grounded card at a time.</p>
                  <p>
                    Keep the main review loop centered here, then reopen Reader only when you want to inspect source
                    evidence more closely.
                  </p>
                </div>
                <div className="recall-study-journey" role="list" aria-label="Study flow">
                  <div className="recall-study-step recall-study-step-active" role="listitem">
                    <strong>1</strong>
                    <span>Choose the next card from the queue</span>
                  </div>
                  <div className={showAnswer ? 'recall-study-step recall-study-step-active' : 'recall-study-step'} role="listitem">
                    <strong>2</strong>
                    <span>Reveal the grounded answer only when you are ready</span>
                  </div>
                  <div className={showAnswer ? 'recall-study-step recall-study-step-active' : 'recall-study-step'} role="listitem">
                    <strong>3</strong>
                    <span>Rate recall and let FSRS schedule the next review</span>
                  </div>
                </div>
              </section>
            ) : null}

            <section
              className={
                showFocusedStudySplitView
                  ? 'card stack-gap recall-study-card'
                  : 'card stack-gap recall-study-card recall-study-card-centered'
              }
            >
              <div className="toolbar recall-collection-toolbar">
                <div className="section-header section-header-compact">
                  <h2>{showFocusedStudySplitView ? 'Active card' : 'Review card'}</h2>
                  <p>
                    {activeStudyCard
                      ? showFocusedStudySplitView
                        ? `Grounded in ${activeStudyCard.document_title} and scheduled with FSRS review updates.`
                        : `Stay with ${activeStudyCard.document_title} until you finish this review step.`
                      : 'Choose a card from the queue to review it here.'}
                  </p>
                </div>
                {activeStudyCard ? (
                  <div className="recall-actions">
                    {showFocusedStudySplitView && focusedStudySourceSpan ? (
                      <button
                        type="button"
                        onClick={() => handleShowStudyEvidenceInFocusedReader(activeStudyCard, focusedStudySourceSpan, focusedStudySourceSpanIndex)}
                      >
                        {buildShowReaderLabel(activeStudyCard.document_title)}
                      </button>
                    ) : null}
                    <button
                      className={showFocusedStudySplitView ? 'ghost-button' : undefined}
                      type="button"
                      onClick={() => handleOpenStudyCardInReader(activeStudyCard, focusedStudySourceSpan ?? activeStudySourceSpans[0])}
                    >
                      {buildOpenReaderLabel(activeStudyCard.document_title)}
                    </button>
                  </div>
                ) : null}
              </div>

              {!activeStudyCard ? <p className="small-note">No active study card yet.</p> : null}
              {activeStudyCard ? (
                <div
                  className={
                    showFocusedStudySplitView
                      ? 'study-card-body stack-gap'
                      : 'study-card-body study-card-body-centered stack-gap'
                  }
                >
                  {showFocusedStudySplitView ? (
                    <div className="recall-study-journey" role="list" aria-label="Study flow">
                      <div className="recall-study-step recall-study-step-active" role="listitem">
                        <strong>1</strong>
                        <span>Choose the next due card</span>
                      </div>
                      <div className={showAnswer ? 'recall-study-step recall-study-step-active' : 'recall-study-step'} role="listitem">
                        <strong>2</strong>
                        <span>Reveal the grounded answer</span>
                      </div>
                      <div className={showAnswer ? 'recall-study-step recall-study-step-active' : 'recall-study-step'} role="listitem">
                        <strong>3</strong>
                        <span>Rate recall and schedule the next review</span>
                      </div>
                    </div>
                  ) : null}

                  {showFocusedStudySplitView ? (
                    <>
                      <div className="recall-study-summary">
                        <div className="recall-detail-panel">
                          <strong>Source</strong>
                          <span>{activeStudyCard.document_title}</span>
                        </div>
                        <div className="recall-detail-panel">
                          <strong>Schedule</strong>
                          <span>
                            Due {dateFormatter.format(new Date(activeStudyCard.due_at))} · {formatStudyStatus(activeStudyCard.status)}
                          </span>
                        </div>
                        <div className="recall-detail-panel">
                          <strong>Reviews</strong>
                          <span>{formatCountLabel(activeStudyCard.review_count, 'review', 'reviews')}</span>
                        </div>
                      </div>

                      <div className="recall-hero-metrics" role="list" aria-label="Study card metadata">
                        <span className="status-chip" role="listitem">{activeStudyCard.card_type}</span>
                        <span className="status-chip status-muted" role="listitem">{formatStudyStatus(activeStudyCard.status)}</span>
                        <span className="status-chip status-muted" role="listitem">
                          Due {dateFormatter.format(new Date(activeStudyCard.due_at))}
                        </span>
                        <span className="status-chip status-muted" role="listitem">
                          {formatCountLabel(activeStudyCard.source_spans.length, 'evidence span', 'evidence spans')}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="recall-study-card-context">
                      <strong>{activeStudyCard.document_title}</strong>
                      <div className="recall-hero-metrics recall-study-card-meta" role="list" aria-label="Review card metadata">
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
                  )}

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
                      <p>Try to recall the answer before revealing it, then rate how easily it came back.</p>
                      <button type="button" onClick={() => setShowAnswer(true)}>
                        Show answer
                      </button>
                    </div>
                  )}

                  <div className="stack-gap">
                    <div className="section-header section-header-compact">
                      <h3>Source evidence</h3>
                      <p>
                        {showFocusedStudySplitView
                          ? 'Keep the supporting excerpt close before reopening Reader or logging a review.'
                          : 'Keep one supporting excerpt nearby before reopening Reader or logging a review.'}
                      </p>
                    </div>
                    {showFocusedStudySplitView ? (
                      <div className="recall-search-results" role="list">
                        {activeStudySourceSpans.map((sourceSpan, index) => (
                          <div
                            key={`${activeStudyCard.id}:evidence:${index}`}
                            className="recall-search-hit recall-evidence-card"
                            role="listitem"
                          >
                            <span className="recall-collection-row-head">
                              <strong>{getStudyEvidenceLabel(sourceSpan)}</strong>
                              <span>{activeStudyCard.document_title}</span>
                            </span>
                            <span className="recall-collection-row-preview">{getStudyEvidenceExcerpt(sourceSpan)}</span>
                            <span className="recall-collection-row-meta">
                              {getRecordStringValue(sourceSpan, 'note_id') ? <span className="status-chip">Anchored note</span> : null}
                              {getRecordStringValue(sourceSpan, 'edge_id') ? <span className="status-chip">Graph-backed</span> : null}
                              {getRecordStringValue(sourceSpan, 'chunk_id') ? <span className="status-chip">Chunk excerpt</span> : null}
                              {getRecordNumberValue(sourceSpan, 'global_sentence_start') !== null ? (
                                <span className="status-chip">
                                  Sentences {String(getRecordNumberValue(sourceSpan, 'global_sentence_start'))}-{String(getRecordNumberValue(sourceSpan, 'global_sentence_end'))}
                                </span>
                              ) : null}
                            </span>
                            <div className="recall-actions recall-actions-inline">
                              <button
                                type="button"
                                onClick={() => handleShowStudyEvidenceInFocusedReader(activeStudyCard, sourceSpan, index)}
                              >
                                {buildShowReaderLabel(activeStudyCard.document_title)}
                              </button>
                              <button
                                className="ghost-button"
                                type="button"
                                onClick={() => handleOpenStudyCardInReader(activeStudyCard, sourceSpan)}
                              >
                                {buildOpenReaderLabel(activeStudyCard.document_title)}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
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
                          <div className="recall-detail-panel recall-study-evidence-focus">
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
                            <div className="recall-actions recall-actions-inline">
                              <button
                                type="button"
                                onClick={() => handleOpenStudyCardInReader(activeStudyCard, focusedStudySourceSpan)}
                              >
                                {buildOpenReaderLabel(activeStudyCard.document_title)}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="recall-detail-panel recall-study-evidence-focus">
                            <strong>No evidence span yet</strong>
                            <span>Promote more grounded notes or reader highlights to add supporting excerpts here.</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="study-rating-row">
                    {([
                      ['forgot', 'Forgot'],
                      ['hard', 'Hard'],
                      ['good', 'Good'],
                      ['easy', 'Easy'],
                    ] as const).map(([rating, label]) => (
                      <button
                        key={rating}
                        disabled={!showAnswer || studyBusyKey === `review:${activeStudyCard.id}:${rating}`}
                        type="button"
                        onClick={() => handleReviewCard(rating)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {showFocusedStudySplitView && activeStudyCard.source_spans[0]?.excerpt ? (
                    <div className="recall-detail-panel">
                      <strong>Grounding excerpt</strong>
                      <span>{String(activeStudyCard.source_spans[0].excerpt)}</span>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>
          </div>
        </div>
      ) : null}

      {section === 'notes' ? (
        <div className={notesBrowseDrawerOpen ? 'recall-grid' : 'recall-grid recall-grid-browse-condensed'}>
          <section
            className={
              notesBrowseDrawerOpen
                ? 'card recall-collection-rail stack-gap'
                : 'card recall-collection-rail recall-collection-rail-condensed stack-gap'
            }
          >
            <div className="toolbar recall-collection-toolbar">
              <div className="section-header section-header-compact">
                <h2>Notes</h2>
                <p>
                  Search and manage source-linked highlights captured from Reader in reflowed view.
                </p>
              </div>
              <button className="ghost-button" type="button" onClick={() => setBrowseDrawerOpen('notes', !notesBrowseDrawerOpen)}>
                {notesBrowseDrawerOpen ? 'Hide' : 'Show'}
              </button>
            </div>

            {notesBrowseDrawerOpen || documentsStatus === 'error' ? (
              <>
                <div className="recall-collection-filters">
                  <label className="field recall-inline-field">
                    <span>Selected document</span>
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
                      placeholder="Search highlights and note text"
                      value={noteSearchQuery}
                      onChange={(event) =>
                        updateNotesState((current) => ({ ...current, searchQuery: event.target.value }))
                      }
                    />
                  </label>
                </div>

                <div className="recall-document-list" role="list">
                  {documentsStatus === 'error' ? (
                    <div className="stack-gap">
                      <p className="small-note">Notes are unavailable until the local library reconnects.</p>
                      <div className="inline-actions">
                        <button className="ghost-button" type="button" onClick={handleRetryRecallLoading}>
                          Retry loading
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {documentsStatus !== 'error' && notesLoading ? <p className="small-note">Loading notes…</p> : null}
                  {documentsStatus !== 'error' && !showingNoteSearch && notesStatus === 'error' ? (
                    <div className="stack-gap">
                      <p className="small-note">{notesError}</p>
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
                    <div className="stack-gap">
                      <p className="small-note">{noteSearchError}</p>
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
                    <p className="small-note">
                      {showingNoteSearch
                        ? 'No notes match that query in the selected document.'
                        : 'No notes for this document yet. Add one from Reader to save a local source-linked highlight.'}
                    </p>
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
            ) : (
              <div className="recall-browse-drawer-summary stack-gap">
                <p className="small-note">
                  Keep the active note in focus here. Open browsing when you want to switch documents or search other notes.
                </p>
                <div className="recall-detail-panel recall-browse-summary-card">
                  <strong>{activeNote?.anchor.anchor_text ?? selectedNotesDocumentTitle ?? 'No active note yet'}</strong>
                  <span>
                    {activeNote
                      ? activeNote.body_text?.trim() || activeNote.anchor.excerpt_text
                      : selectedNotesDocumentTitle
                        ? `${sourceWorkspaceNoteCountLabel} for ${selectedNotesDocumentTitle}.`
                        : 'Choose a source to inspect its saved notes.'}
                  </span>
                </div>
              </div>
            )}
          </section>

          <div className={showFocusedNotesSplitView ? 'recall-main-column recall-source-split-layout' : 'recall-main-column stack-gap'}>
            {showFocusedNotesSplitView ? renderFocusedReaderPane() : null}
            <section className="card stack-gap">
              <div className="toolbar">
                <div className="section-header section-header-compact">
                  <h2>Note detail</h2>
                  <p>
                    {activeNote
                      ? 'Edit the note text, inspect the anchor, and promote grounded knowledge from one place.'
                      : 'Choose a note to inspect its anchored passage and next actions.'}
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
                    <button
                      disabled={noteBusyKey === `save:${activeNote.id}`}
                      type="button"
                      onClick={handleSaveNoteChanges}
                    >
                      {noteBusyKey === `save:${activeNote.id}` ? 'Saving…' : 'Save changes'}
                    </button>
                    <button
                      className="ghost-button"
                      disabled={noteBusyKey === `delete:${activeNote.id}`}
                      type="button"
                      onClick={handleDeleteNote}
                    >
                      {noteBusyKey === `delete:${activeNote.id}` ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                ) : null}
              </div>

              {notesMessage ? <p className="small-note">{notesMessage}</p> : null}
              {!activeNote ? <p className="small-note">No active note yet.</p> : null}
              {activeNote ? (
                <div className="stack-gap recall-note-detail">
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
                  <p className="small-note">This note stays included in workspace exports and merge previews.</p>

                  <div className="recall-note-preview">
                    <strong>Highlighted text</strong>
                    <p>{activeNote.anchor.anchor_text}</p>
                    <span>{activeNote.anchor.excerpt_text}</span>
                  </div>

                  <label className="field">
                    <span>Note text</span>
                    <textarea
                      placeholder="Add context, a reminder, or a follow-up question"
                      value={noteDraftBody}
                      onChange={(event) => setNoteDraftBody(event.target.value)}
                    />
                  </label>

                  <div className="recall-detail-panel stack-gap recall-note-promotion-card">
                    <div className="section-header section-header-compact">
                      <h3>Promote note</h3>
                      <p>Turn this note into graph or study knowledge after the anchor and note text look right.</p>
                    </div>
                    <div className="recall-actions recall-actions-inline">
                      <button
                        className="ghost-button"
                        disabled={noteBusyKey === `graph:${activeNote.id}`}
                        type="button"
                        onClick={() => setNotePromotionMode('graph')}
                      >
                        Promote to Graph
                      </button>
                      <button
                        className="ghost-button"
                        disabled={noteBusyKey === `study:${activeNote.id}`}
                        type="button"
                        onClick={() => setNotePromotionMode('study')}
                      >
                        Create Study Card
                      </button>
                    </div>
                  </div>

                  {notePromotionMode === 'graph' ? (
                    <div className="recall-detail-panel stack-gap">
                      <div className="section-header section-header-compact">
                        <h3>Promote to graph</h3>
                        <p>Create a confirmed concept node backed by this note anchor.</p>
                      </div>
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
                        <button
                          className="ghost-button"
                          type="button"
                          onClick={() => setNotePromotionMode(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {notePromotionMode === 'study' ? (
                    <div className="recall-detail-panel stack-gap">
                      <div className="section-header section-header-compact">
                        <h3>Create study card</h3>
                        <p>Turn this note into a manual review card that keeps its own scheduling state.</p>
                      </div>
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
                        <button
                          className="ghost-button"
                          type="button"
                          onClick={() => setNotePromotionMode(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>
          </div>
        </div>
      ) : null}
    </div>
  )
}

