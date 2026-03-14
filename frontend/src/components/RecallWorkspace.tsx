import { useCallback, useDeferredValue, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'

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
  retrieveRecall,
  searchRecallNotes,
  reviewRecallStudyCard,
  updateRecallNote,
} from '../api'
import type {
  RecallSection,
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
  RecallRetrievalHit,
  StudyCardRecord,
  StudyCardStatus,
  RecallNoteStudyPromotionRequest,
  StudyOverview,
  StudyReviewRating,
} from '../types'
import type { WorkspaceHeroProps } from './WorkspaceHero'


interface RecallWorkspaceProps {
  continuityState: RecallWorkspaceContinuityState
  focusRequest?: RecallWorkspaceFocusRequest | null
  onContinuityStateChange: Dispatch<SetStateAction<RecallWorkspaceContinuityState>>
  onShellContextChange: (context: WorkspaceDockContext | null) => void
  onSectionChange: (section: RecallSection) => void
  onShellHeroChange: (hero: WorkspaceHeroProps) => void
  onOpenReader: (
    documentId: string,
    options?: {
      sentenceEnd?: number | null
      sentenceStart?: number | null
    },
  ) => void
  section: RecallSection
}
type LoadState = 'idle' | 'loading' | 'success' | 'error'


function formatModeLabel(mode: string) {
  return mode.slice(0, 1).toUpperCase() + mode.slice(1)
}


function formatRelationLabel(relationType: string) {
  return relationType.replace(/_/g, ' ')
}


function formatHitType(hitType: RecallRetrievalHit['hit_type']) {
  if (hitType === 'chunk') {
    return 'Chunk'
  }
  if (hitType === 'node') {
    return 'Node'
  }
  if (hitType === 'note') {
    return 'Note'
  }
  return 'Card'
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

function getGraphNodePreview(node: KnowledgeNodeRecord) {
  const description = node.description?.trim()
  if (description) {
    return description
  }
  return `${formatCountLabel(node.mention_count, 'mention', 'mentions')} across ${formatCountLabel(node.document_count, 'source document', 'source documents')}.`
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


export function RecallWorkspace({
  continuityState,
  focusRequest = null,
  onContinuityStateChange,
  onShellContextChange,
  onOpenReader,
  onSectionChange,
  onShellHeroChange,
  section,
}: RecallWorkspaceProps) {
  const [documents, setDocuments] = useState<RecallDocumentRecord[]>([])
  const [selectedDocument, setSelectedDocument] = useState<RecallDocumentRecord | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [retrievalResults, setRetrievalResults] = useState<RecallRetrievalHit[]>([])
  const [retrievalError, setRetrievalError] = useState<string | null>(null)
  const [documentsStatus, setDocumentsStatus] = useState<LoadState>('loading')
  const [documentsError, setDocumentsError] = useState<string | null>(null)
  const [detailStatus, setDetailStatus] = useState<LoadState>('idle')
  const [detailError, setDetailError] = useState<string | null>(null)
  const [retrievalLoading, setRetrievalLoading] = useState(false)
  const [graphSnapshot, setGraphSnapshot] = useState<KnowledgeGraphSnapshot | null>(null)
  const [graphStatus, setGraphStatus] = useState<LoadState>('loading')
  const [graphError, setGraphError] = useState<string | null>(null)
  const [graphBusyKey, setGraphBusyKey] = useState<string | null>(null)
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
  const libraryFilterQuery = continuityState.library.filterQuery
  const selectedLibraryDocumentId = continuityState.library.selectedDocumentId
  const selectedNodeId = continuityState.graph.selectedNodeId
  const studyFilter = continuityState.study.filter
  const activeCardId = continuityState.study.activeCardId
  const selectedNotesDocumentId = continuityState.notes.selectedDocumentId
  const noteSearchQuery = continuityState.notes.searchQuery
  const selectedNoteId = continuityState.notes.selectedNoteId
  const deferredLibraryFilter = useDeferredValue(libraryFilterQuery)
  const deferredSearch = useDeferredValue(searchQuery)
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
    if (!normalized) {
      return documents
    }
    return documents.filter((document) =>
      [document.title, document.source_type, document.source_locator ?? '', document.file_name ?? '']
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    )
  }, [deferredLibraryFilter, documents])
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
  const libraryFilterActive = deferredLibraryFilter.trim().length > 0
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
  const activeStudySourceSpans = useMemo(() => activeStudyCard?.source_spans ?? [], [activeStudyCard])
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
        badge: 'Library',
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
    if (!deferredSearch.trim()) {
      setRetrievalResults([])
      setRetrievalError(null)
      return
    }

    let active = true
    setRetrievalLoading(true)
    setRetrievalError(null)
    void retrieveRecall(deferredSearch)
      .then((hits) => {
        if (active) {
          setRetrievalResults(hits)
        }
      })
      .catch((searchError: Error) => {
        if (active) {
          setRetrievalError(getErrorMessage(searchError, 'Could not search saved knowledge.'))
        }
      })
      .finally(() => {
        if (active) {
          setRetrievalLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [deferredSearch])

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
  }, [focusRequest, section, updateGraphState, updateLibraryState, updateNotesState, updateStudyState])

  function handleSelectLibraryDocument(documentId: string) {
    setDetailStatus('loading')
    setDetailError(null)
    updateLibraryState((current) => ({ ...current, selectedDocumentId: documentId }))
  }

  function handleSelectNotesDocument(documentId: string) {
    updateNotesState((current) => ({
      ...current,
      selectedDocumentId: documentId,
    }))
  }

  function handleOpenDocumentInReader(
    documentId: string,
    options?: {
      sentenceEnd?: number | null
      sentenceStart?: number | null
    },
  ) {
    handleSelectLibraryDocument(documentId)
    onOpenReader(documentId, options)
  }

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

  function handleSelectRetrievalHit(hit: RecallRetrievalHit) {
    handleSelectLibraryDocument(hit.source_document_id)
    if (hit.hit_type === 'note') {
      updateNotesState((current) => ({
        ...current,
        searchQuery: '',
        selectedDocumentId: hit.source_document_id,
        selectedNoteId: hit.note_id ?? current.selectedNoteId,
      }))
      onSectionChange('notes')
      return
    }
    if (hit.node_id) {
      updateGraphState((current) => ({ ...current, selectedNodeId: hit.node_id ?? current.selectedNodeId }))
    }
    if (hit.hit_type === 'card') {
      updateStudyState((current) => ({
        ...current,
        filter: 'all',
        activeCardId: hit.card_id ?? current.activeCardId,
      }))
      onSectionChange('study')
      return
    }
    if (hit.hit_type === 'node') {
      onSectionChange('graph')
    }
  }

  function handleRetryRecallLoading() {
    setError(null)
    setRetrievalError(null)
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
      onSectionChange('graph')
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
      onSectionChange('study')
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
      ? 'Library unavailable'
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

  useEffect(() => {
    onShellHeroChange({
      compact: true,
      eyebrow: 'Recall',
      title: 'Reconnect what you already saved.',
      description: 'Search, reopen, validate, and study from one local workspace.',
      metrics: [
        { label: documentsLoading ? 'Loading library…' : documentCountLabel },
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
        <div className="recall-grid">
          <section className="card recall-library-card recall-collection-rail stack-gap">
            <div className="toolbar recall-collection-toolbar">
              <div className="section-header section-header-compact">
                <h2>Source library</h2>
                <p>
                  {documentsLoading
                    ? 'Loading…'
                    : libraryFilterActive
                      ? `${visibleDocuments.length} matches`
                      : documentCountLabel}
                </p>
              </div>
            </div>

            <label className="field recall-inline-field">
              <span>Filter sources</span>
              <input
                type="search"
                placeholder="Filter by title, type, or locator"
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
              {!documentsLoading && documentsStatus !== 'error' && documents.length > 0 && visibleDocuments.length === 0 ? (
                <p className="small-note">
                  No saved sources match that filter. The current document detail stays available on the right.
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
          </section>

          <div className="recall-main-column stack-gap">
            <section className="card stack-gap recall-detail-card">
              <div className="toolbar">
                <div className="section-header section-header-compact">
                  <h2>Document detail</h2>
                  <p>
                    {selectedDocument
                      ? 'Keep the selected source summary and its next actions close to the list.'
                      : 'Choose a source to inspect its shared shape and next actions.'}
                  </p>
                </div>
                {selectedDocument ? (
                  <div className="recall-actions">
                    <button type="button" onClick={() => onOpenReader(selectedDocument.id)}>
                      Open in Reader
                    </button>
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => {
                        updateNotesState((current) => ({
                          ...current,
                          selectedDocumentId: selectedDocument.id,
                        }))
                        onSectionChange('notes')
                      }}
                    >
                      View notes
                    </button>
                    <a className="secondary-button" href={buildRecallExportUrl(selectedDocument.id)}>
                      Export Markdown
                    </a>
                  </div>
                ) : null}
              </div>

              {detailLoading ? <p className="small-note">Loading document detail…</p> : null}
              {!detailLoading && documentsStatus === 'error' ? (
                <div className="stack-gap">
                  <p className="small-note">Document detail is unavailable until the library reloads.</p>
                  <div className="inline-actions">
                    <button className="ghost-button" type="button" onClick={handleRetryRecallLoading}>
                      Retry loading
                    </button>
                  </div>
                </div>
              ) : null}
              {!detailLoading && detailStatus === 'error' ? (
                <div className="stack-gap">
                  <p className="small-note">{detailError}</p>
                  <div className="inline-actions">
                    <button className="ghost-button" type="button" onClick={handleRetryRecallLoading}>
                      Retry loading
                    </button>
                  </div>
                </div>
              ) : null}
              {!detailLoading && documentsStatus !== 'error' && detailStatus !== 'error' && !selectedDocument ? (
                <p className="small-note">No shared document selected yet.</p>
              ) : null}
              {selectedDocument ? (
                <div className="recall-detail-body stack-gap">
                  <div className="recall-detail-heading">
                    <h3>{selectedDocument.title}</h3>
                    <div className="reader-meta-row" role="list" aria-label="Recall document metadata">
                      <span className="status-chip reader-meta-chip" role="listitem">{selectedDocument.source_type.toUpperCase()}</span>
                      <span className="status-chip reader-meta-chip" role="listitem">{selectedDocument.chunk_count} chunks</span>
                      <span className="status-chip reader-meta-chip" role="listitem">{selectedDocumentNoteCountLabel}</span>
                      {selectedDocument.available_modes.map((mode) => (
                        <span key={mode} className="status-chip reader-meta-chip" role="listitem">
                          {formatModeLabel(mode)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="recall-detail-brief">
                    <strong>Source locator</strong>
                    <span>{getDocumentSourcePreview(selectedDocument)}</span>
                  </div>
                  <div className="recall-detail-grid">
                    <div className="recall-detail-panel">
                      <strong>Updated</strong>
                      <span>{dateFormatter.format(new Date(selectedDocument.updated_at))}</span>
                    </div>
                    <div className="recall-detail-panel">
                      <strong>Available views</strong>
                      <span>{selectedDocument.available_modes.map(formatModeLabel).join(', ')}</span>
                    </div>
                    <div className="recall-detail-panel">
                      <strong>Reader handoff</strong>
                      <span>Open this source directly in Reader without losing your Recall context.</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="card stack-gap recall-search-card">
              <div className="section-header section-header-compact">
                <h2>Hybrid retrieval</h2>
                <p>Blend chunk text, graph labels, and study-card cues across your local Recall workspace.</p>
              </div>

              <label className="field">
                <span>Search saved knowledge</span>
                <input
                  type="search"
                  placeholder="Try a phrase, concept, or study prompt"
                  value={searchQuery}
                  onChange={(event) => {
                    const nextValue = event.target.value
                    setSearchQuery(nextValue)
                    setRetrievalLoading(Boolean(nextValue.trim()))
                  }}
                />
              </label>

            <div className="recall-search-results" role="list">
              {retrievalLoading ? <p className="small-note">Searching chunks, nodes, cards, and notes…</p> : null}
              {!retrievalLoading && retrievalError ? <p className="small-note">{retrievalError}</p> : null}
              {!retrievalLoading && !retrievalError && !searchQuery.trim() ? (
                <p className="small-note">
                  Search across chunk text, graph suggestions, study prompts, and saved notes without leaving Recall.
                </p>
              ) : null}
              {!retrievalLoading && !retrievalError && searchQuery.trim() && retrievalResults.length === 0 ? (
                <p className="small-note">No saved chunks, nodes, cards, or notes match that query yet.</p>
              ) : null}

                {retrievalResults.map((hit) => (
                  <button
                    key={hit.id}
                    className="recall-search-hit"
                    role="listitem"
                    type="button"
                    onClick={() => handleSelectRetrievalHit(hit)}
                  >
                    <span className="recall-search-hit-header">
                      <strong>{hit.title}</strong>
                      <span>{formatHitType(hit.hit_type)} • {hit.document_title}</span>
                    </span>
                    <span className="recall-search-hit-excerpt">{hit.excerpt}</span>
                    <span className="recall-hit-reasons">
                      {hit.reasons.map((reason) => (
                        <span key={`${hit.id}:${reason}`} className="status-chip reader-meta-chip">
                          {reason}
                        </span>
                      ))}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : null}

      {section === 'graph' ? (
        <div className="recall-grid">
          <section className="card stack-gap recall-collection-rail">
            <div className="section-header section-header-compact recall-collection-toolbar">
              <h2>Knowledge graph</h2>
              <p>Inspect extracted concepts, validate links, and keep the graph grounded in saved source evidence.</p>
            </div>
            <div className="recall-hero-metrics" role="list" aria-label="Knowledge graph metrics">
              <span className="status-chip" role="listitem">
                {graphStatus === 'error' ? 'Graph unavailable' : graphLoading ? 'Loading graph…' : `${graphSnapshot?.nodes.length ?? 0} nodes`}
              </span>
              <span className="status-chip status-muted" role="listitem">{graphPendingEdgesLabel}</span>
              <span className="status-chip status-muted" role="listitem">{graphConfirmedEdgesLabel}</span>
            </div>

            <div className="recall-document-list" role="list">
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

              {graphSnapshot?.nodes.map((node) => (
                <button
                  key={node.id}
                  aria-pressed={selectedNodeId === node.id}
                  className={
                    selectedNodeId === node.id
                      ? 'recall-document-item recall-document-item-compact recall-document-item-active'
                      : 'recall-document-item recall-document-item-compact'
                  }
                  type="button"
                  onClick={() => updateGraphState((current) => ({ ...current, selectedNodeId: node.id }))}
                >
                  <span className="recall-collection-row-head">
                    <strong className="recall-document-title">{node.label}</strong>
                    <span className="recall-document-meta">{Math.round(node.confidence * 100)}%</span>
                  </span>
                  <span className="recall-collection-row-preview">{getGraphNodePreview(node)}</span>
                  <span className="recall-collection-row-meta">
                    <span className="status-chip">{node.node_type}</span>
                    <span className="status-chip">{node.status}</span>
                    <span className="status-chip">{formatCountLabel(node.mention_count, 'mention', 'mentions')}</span>
                    <span className="status-chip">{formatCountLabel(node.document_count, 'doc', 'docs')}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className="recall-main-column stack-gap">
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

                  <div className="recall-detail-grid">
                    <div className="recall-detail-panel">
                      <strong>Type</strong>
                      <span>{selectedNodeDetail.node.node_type}</span>
                    </div>
                    <div className="recall-detail-panel">
                      <strong>Documents</strong>
                      <span>{selectedNodeDetail.node.document_count}</span>
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

                  {selectedNodeDetail.node.description ? (
                    <div className="recall-detail-brief">
                      <strong>Grounded description</strong>
                      <span>{selectedNodeDetail.node.description}</span>
                    </div>
                  ) : null}

                  <div className="stack-gap">
                    <div className="section-header section-header-compact">
                      <h3>Mentions</h3>
                      <p>Each mention stays attached to the source document that produced it, with Reader reopen nearby.</p>
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
                      <p>Confirm or reject inferred links while keeping the supporting source document close by.</p>
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
      ) : null}

      {section === 'study' ? (
        <div className="recall-grid">
          <section className="card stack-gap recall-collection-rail">
            <div className="toolbar recall-collection-toolbar">
              <div className="section-header section-header-compact">
                <h2>Study queue</h2>
                <p>Source-grounded cards regenerate deterministically and keep their FSRS review state over time.</p>
              </div>
              <button
                disabled={studyBusyKey === 'generate'}
                type="button"
                onClick={handleGenerateStudyCards}
              >
                {studyBusyKey === 'generate' ? 'Refreshing…' : 'Refresh cards'}
              </button>
            </div>

            <div className="recall-hero-metrics" role="list" aria-label="Study overview">
              <span className="status-chip" role="listitem">{studyNewCountLabel}</span>
              <span className="status-chip status-muted" role="listitem">{studyDueCountLabel}</span>
              <span className="status-chip status-muted" role="listitem">{studyReviewCountLabel}</span>
            </div>

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

            <div className="recall-document-list" role="list">
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
                  onClick={() => {
                    updateStudyState((current) => ({ ...current, activeCardId: card.id }))
                    setShowAnswer(false)
                  }}
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
          </section>

          <div className="recall-main-column stack-gap">
            <section className="card stack-gap recall-study-card">
              <div className="toolbar recall-collection-toolbar">
                <div className="section-header section-header-compact">
                  <h2>Active card</h2>
                  <p>
                    {activeStudyCard
                      ? `Grounded in ${activeStudyCard.document_title} and scheduled with FSRS review updates.`
                      : 'Choose a card from the queue to review it here.'}
                  </p>
                </div>
                {activeStudyCard ? (
                  <div className="recall-actions">
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => handleOpenStudyCardInReader(activeStudyCard, activeStudySourceSpans[0])}
                    >
                      {buildOpenReaderLabel(activeStudyCard.document_title)}
                    </button>
                  </div>
                ) : null}
              </div>

              {!activeStudyCard ? <p className="small-note">No active study card yet.</p> : null}
              {activeStudyCard ? (
                <div className="study-card-body stack-gap">
                  <div className="recall-detail-grid">
                    <div className="recall-detail-panel">
                      <strong>Source</strong>
                      <span>{activeStudyCard.document_title}</span>
                    </div>
                    <div className="recall-detail-panel">
                      <strong>Type</strong>
                      <span>{activeStudyCard.card_type}</span>
                    </div>
                    <div className="recall-detail-panel">
                      <strong>Due</strong>
                      <span>{dateFormatter.format(new Date(activeStudyCard.due_at))}</span>
                    </div>
                    <div className="recall-detail-panel">
                      <strong>Reviews</strong>
                      <span>{activeStudyCard.review_count}</span>
                    </div>
                  </div>

                  <div className="recall-hero-metrics" role="list" aria-label="Study card metadata">
                    <span className="status-chip" role="listitem">{activeStudyCard.card_type}</span>
                    <span className="status-chip status-muted" role="listitem">{formatStudyStatus(activeStudyCard.status)}</span>
                    <span className="status-chip status-muted" role="listitem">Due {dateFormatter.format(new Date(activeStudyCard.due_at))}</span>
                  </div>

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
                    <button type="button" onClick={() => setShowAnswer(true)}>
                      Show answer
                    </button>
                  )}

                  <div className="stack-gap">
                    <div className="section-header section-header-compact">
                      <h3>Source evidence</h3>
                      <p>Keep the supporting excerpt close before reopening Reader or logging a review.</p>
                    </div>
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

                  {activeStudyCard.source_spans[0]?.excerpt ? (
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
        <div className="recall-grid">
          <section className="card recall-collection-rail stack-gap">
            <div className="section-header section-header-compact">
              <h2>Notes</h2>
              <p>
                Search and manage source-linked highlights captured from Reader in reflowed view.
              </p>
            </div>

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
          </section>

          <div className="recall-main-column stack-gap">
            <section className="card stack-gap">
              <div className="toolbar">
                <div className="section-header section-header-compact">
                  <h2>Note detail</h2>
                  <p>
                    {activeNote
                      ? 'Keep the anchored passage, note text, and next actions together in one place.'
                      : 'Choose a note to inspect its anchored passage and next actions.'}
                  </p>
                </div>
                {activeNote ? (
                  <div className="recall-actions">
                    <button type="button" onClick={() => handleOpenNoteInReader(activeNote)}>
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
                  <div className="recall-detail-grid">
                    <div className="recall-detail-panel">
                      <strong>Document</strong>
                      <span>{getNoteDocumentTitle(activeNote, documentTitleById, selectedNotesDocumentTitle)}</span>
                    </div>
                    <div className="recall-detail-panel">
                      <strong>Updated</strong>
                      <span>{dateFormatter.format(new Date(activeNote.updated_at))}</span>
                    </div>
                    <div className="recall-detail-panel">
                      <strong>Anchor range</strong>
                      <span>
                        Sentences {activeNote.anchor.global_sentence_start ?? activeNote.anchor.sentence_start}
                        {' '}to{' '}
                        {activeNote.anchor.global_sentence_end ?? activeNote.anchor.sentence_end}
                      </span>
                    </div>
                    <div className="recall-detail-panel">
                      <strong>Workspace portability</strong>
                      <span>Included in workspace exports and merge previews.</span>
                    </div>
                  </div>

                  <div className="recall-detail-panel stack-gap">
                    <div className="section-header section-header-compact">
                      <h3>Promote note</h3>
                      <p>Turn this note into confirmed graph or study knowledge without leaving Recall.</p>
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
