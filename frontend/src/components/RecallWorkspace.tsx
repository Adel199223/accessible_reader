import { useDeferredValue, useEffect, useMemo, useState } from 'react'

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
import type { RecallSection, RecallWorkspaceFocusRequest } from '../lib/appRoute'
import type {
  KnowledgeEdgeRecord,
  KnowledgeGraphSnapshot,
  KnowledgeNodeDetail,
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
  focusRequest?: RecallWorkspaceFocusRequest | null
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
  selectedDocument: RecallDocumentRecord | null,
) {
  if (selectedDocument && selectedDocument.id === note.anchor.source_document_id) {
    return selectedDocument.title
  }
  return 'document_title' in note ? note.document_title : selectedDocument?.title ?? 'Saved note'
}


export function RecallWorkspace({
  focusRequest = null,
  onOpenReader,
  onSectionChange,
  onShellHeroChange,
  section,
}: RecallWorkspaceProps) {
  const [documents, setDocuments] = useState<RecallDocumentRecord[]>([])
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
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
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedNodeDetail, setSelectedNodeDetail] = useState<KnowledgeNodeDetail | null>(null)
  const [nodeDetailLoading, setNodeDetailLoading] = useState(false)
  const [studyOverview, setStudyOverview] = useState<StudyOverview | null>(null)
  const [studyCards, setStudyCards] = useState<StudyCardRecord[]>([])
  const [studyStatus, setStudyStatus] = useState<LoadState>('loading')
  const [studyError, setStudyError] = useState<string | null>(null)
  const [studyBusyKey, setStudyBusyKey] = useState<string | null>(null)
  const [studyFilter, setStudyFilter] = useState<'all' | 'new' | 'due' | 'scheduled'>('all')
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studyMessage, setStudyMessage] = useState<string | null>(null)
  const [documentNotes, setDocumentNotes] = useState<RecallNoteRecord[]>([])
  const [notesStatus, setNotesStatus] = useState<LoadState>('idle')
  const [notesError, setNotesError] = useState<string | null>(null)
  const [noteSearchQuery, setNoteSearchQuery] = useState('')
  const [noteSearchResults, setNoteSearchResults] = useState<RecallNoteSearchHit[]>([])
  const [noteSearchStatus, setNoteSearchStatus] = useState<LoadState>('idle')
  const [noteSearchError, setNoteSearchError] = useState<string | null>(null)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
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
  const deferredSearch = useDeferredValue(searchQuery)
  const deferredNoteSearch = useDeferredValue(noteSearchQuery)

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
        setSelectedDocumentId((current) =>
          current && loadedDocuments.some((document) => document.id === current)
            ? current
            : loadedDocuments[0]?.id ?? null,
        )
      })
      .catch((loadError: Error) => {
        if (active) {
          setDocuments([])
          setSelectedDocumentId(null)
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
  }, [reloadToken])

  useEffect(() => {
    if (!selectedDocumentId) {
      setSelectedDocument(null)
      setDetailStatus('idle')
      setDetailError(null)
      return
    }

    let active = true
    setDetailStatus('loading')
    setDetailError(null)
    void fetchRecallDocument(selectedDocumentId)
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
  }, [selectedDocumentId, reloadToken])

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
    if (!selectedDocumentId) {
      setDocumentNotes([])
      setNotesStatus('idle')
      setNotesError(null)
      return
    }

    void loadNotes(selectedDocumentId)
  }, [selectedDocumentId, reloadToken])

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
    void searchRecallNotes(deferredNoteSearch, 20, selectedDocumentId)
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
  }, [deferredNoteSearch, selectedDocumentId, showingNoteSearch])

  useEffect(() => {
    void loadGraph()
  }, [reloadToken])

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
  }, [studyFilter, reloadToken])

  useEffect(() => {
    setActiveCardId((current) => {
      if (current && studyCards.some((card) => card.id === current)) {
        return current
      }
      return studyCards[0]?.id ?? null
    })
  }, [studyCards])

  useEffect(() => {
    setSelectedNoteId((current) => {
      if (current && visibleNotes.some((note) => note.id === current)) {
        return current
      }
      return visibleNotes[0]?.id ?? null
    })
  }, [visibleNotes])

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
  }, [noteSearchQuery, section, selectedDocumentId, selectedNoteId])

  useEffect(() => {
    if (!focusRequest || focusRequest.section !== section) {
      return
    }

    if (focusRequest.documentId) {
      setSelectedDocumentId(focusRequest.documentId)
    }
    if (focusRequest.noteId) {
      setNoteSearchQuery('')
      setSelectedNoteId(focusRequest.noteId)
    }
    if (focusRequest.nodeId) {
      setSelectedNodeId(focusRequest.nodeId)
    }
    if (focusRequest.cardId) {
      setStudyFilter('all')
      setActiveCardId(focusRequest.cardId)
    }
  }, [focusRequest, section])

  function handleSelectDocument(documentId: string) {
    setDetailStatus('loading')
    setDetailError(null)
    setSelectedDocumentId(documentId)
  }

  function handleSelectRetrievalHit(hit: RecallRetrievalHit) {
    handleSelectDocument(hit.source_document_id)
    if (hit.hit_type === 'note') {
      onSectionChange('notes')
      if (hit.note_id) {
        setSelectedNoteId(hit.note_id)
      }
      return
    }
    if (hit.node_id) {
      setSelectedNodeId(hit.node_id)
    }
    if (hit.hit_type === 'card') {
      onSectionChange('study')
      if (hit.card_id) {
        setActiveCardId(hit.card_id)
      }
      return
    }
    if (hit.hit_type === 'node') {
      onSectionChange('graph')
    }
  }

  async function loadGraph() {
    setGraphStatus('loading')
    setGraphError(null)
    try {
      const snapshot = await fetchRecallGraph()
      setGraphSnapshot(snapshot)
      setSelectedNodeId((current) =>
        current && snapshot.nodes.some((node) => node.id === current) ? current : snapshot.nodes[0]?.id ?? null,
      )
    } catch (loadError) {
      setGraphSnapshot(null)
      setSelectedNodeId(null)
      setSelectedNodeDetail(null)
      setGraphError(getErrorMessage(loadError, 'Could not load the knowledge graph.'))
      setGraphStatus('error')
      return
    }
    setGraphStatus('success')
  }

  async function loadStudy(status: 'all' | 'new' | 'due' | 'scheduled') {
    setStudyStatus('loading')
    setStudyError(null)
    try {
      const [overview, cards] = await Promise.all([
        fetchRecallStudyOverview(),
        fetchRecallStudyCards(status, 24),
      ])
      setStudyOverview(overview)
      setStudyCards(cards)
      setStudyStatus('success')
      return cards
    } catch (loadError) {
      setStudyOverview(null)
      setStudyCards([])
      setActiveCardId(null)
      setStudyError(getErrorMessage(loadError, 'Could not load study cards.'))
      setStudyStatus('error')
      return []
    }
  }

  async function loadNotes(documentId: string) {
    setNotesStatus('loading')
    setNotesError(null)
    try {
      const loadedNotes = await fetchRecallNotes(documentId)
      setDocumentNotes(loadedNotes)
      setNotesStatus('success')
      return loadedNotes
    } catch (loadError) {
      setDocumentNotes([])
      setNotesError(getErrorMessage(loadError, 'Could not load notes for that document.'))
      setNotesStatus('error')
      return []
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
      void searchRecallNotes(deferredNoteSearch, 20, selectedDocumentId)
        .then((hits) => {
          setNoteSearchResults(hits)
          setNoteSearchStatus('success')
        })
        .catch((loadError) => {
          setNoteSearchResults([])
          setNoteSearchStatus('error')
          setNoteSearchError(getErrorMessage(loadError, 'Could not search notes.'))
        })
    } else if (selectedDocumentId) {
      void loadNotes(selectedDocumentId)
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
      setSelectedNoteId((current) => (current === activeNote.id ? null : current))
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
      setSelectedNodeId(nodeDetail.node.id)
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
      setStudyFilter('all')
      const loadedCards = await loadStudy('all')
      if (!loadedCards.some((card) => card.id === promotedCard.id)) {
        setStudyCards((currentCards) => {
          const withoutPromoted = currentCards.filter((card) => card.id !== promotedCard.id)
          return [promotedCard, ...withoutPromoted]
        })
      }
      setActiveCardId(promotedCard.id)
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
    handleSelectDocument(note.anchor.source_document_id)
    onOpenReader(note.anchor.source_document_id, buildReaderAnchorOptions(note))
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
      eyebrow: 'Recall',
      title: 'Reconnect what you already saved.',
      description:
        'Inspect shared source documents, validate graph suggestions, retrieve grounded context, and study from local source-backed cards.',
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
          <section className="card recall-library-card stack-gap">
            <div className="toolbar">
              <div className="section-header section-header-compact">
                <h2>Source library</h2>
                <p>{documentsLoading ? 'Loading…' : documentCountLabel}</p>
              </div>
            </div>

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

              {documents.map((document) => (
                <button
                  key={document.id}
                  aria-pressed={selectedDocumentId === document.id}
                  className={
                    selectedDocumentId === document.id
                      ? 'recall-document-item recall-document-item-active'
                      : 'recall-document-item'
                  }
                  type="button"
                  onClick={() => handleSelectDocument(document.id)}
                >
                  <span className="recall-document-title">{document.title}</span>
                  <span className="recall-document-meta">
                    {document.source_type.toUpperCase()} • {document.chunk_count} chunks • {dateFormatter.format(new Date(document.updated_at))}
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
                      ? 'Shared metadata, export, and Reader handoff for the selected source.'
                      : 'Choose a document to inspect its shared shape.'}
                  </p>
                </div>
                {selectedDocument ? (
                  <div className="recall-actions">
                    <button type="button" onClick={() => onOpenReader(selectedDocument.id)}>
                      Open in Reader
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
                      {selectedDocument.available_modes.map((mode) => (
                        <span key={mode} className="status-chip reader-meta-chip" role="listitem">
                          {formatModeLabel(mode)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="recall-detail-grid">
                    <div className="recall-detail-panel">
                      <strong>Updated</strong>
                      <span>{dateFormatter.format(new Date(selectedDocument.updated_at))}</span>
                    </div>
                    <div className="recall-detail-panel">
                      <strong>Source locator</strong>
                      <span>{selectedDocument.source_locator || selectedDocument.file_name || 'Local paste'}</span>
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
          <section className="card stack-gap">
            <div className="section-header section-header-compact">
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
                      ? 'recall-document-item recall-document-item-active'
                      : 'recall-document-item'
                  }
                  type="button"
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  <span className="recall-document-title">{node.label}</span>
                  <span className="recall-document-meta">
                    {node.node_type} • {node.mention_count} mentions • {node.status}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className="recall-main-column stack-gap">
            <section className="card stack-gap">
              <div className="toolbar">
                <div className="section-header section-header-compact">
                  <h2>Node detail</h2>
                  <p>
                    {selectedNodeDetail
                      ? 'Review source mentions and relation suggestions before they become trusted knowledge.'
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
                  <div className="recall-detail-grid">
                    <div className="recall-detail-panel">
                      <strong>Status</strong>
                      <span>{selectedNodeDetail.node.status}</span>
                    </div>
                    <div className="recall-detail-panel">
                      <strong>Confidence</strong>
                      <span>{Math.round(selectedNodeDetail.node.confidence * 100)}%</span>
                    </div>
                    <div className="recall-detail-panel">
                      <strong>Documents</strong>
                      <span>{selectedNodeDetail.node.document_count}</span>
                    </div>
                    <div className="recall-detail-panel">
                      <strong>Aliases</strong>
                      <span>{selectedNodeDetail.node.aliases.join(', ') || 'No alternate labels yet'}</span>
                    </div>
                  </div>

                  {selectedNodeDetail.node.description ? (
                    <div className="recall-detail-panel">
                      <strong>Grounded description</strong>
                      <span>{selectedNodeDetail.node.description}</span>
                    </div>
                  ) : null}

                  <div className="stack-gap">
                    <div className="section-header section-header-compact">
                      <h3>Mentions</h3>
                      <p>Each mention stays attached to the source document and chunk excerpt that produced it.</p>
                    </div>
                    <div className="recall-search-results" role="list">
                      {selectedNodeDetail.mentions.map((mention) => (
                        <div key={mention.id} className="recall-search-hit" role="listitem">
                          <span className="recall-search-hit-header">
                            <strong>{mention.document_title}</strong>
                            <span>{mention.entity_type} • {Math.round(mention.confidence * 100)}%</span>
                          </span>
                          <span className="recall-search-hit-excerpt">{mention.excerpt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="stack-gap">
                    <div className="section-header section-header-compact">
                      <h3>Relations</h3>
                      <p>Confirm or reject inferred links before they shape retrieval and study cards.</p>
                    </div>
                    <div className="recall-search-results" role="list">
                      {[...selectedNodeDetail.outgoing_edges, ...selectedNodeDetail.incoming_edges].map((edge) => (
                        <div key={`${selectedNodeDetail.node.id}:${edge.id}`} className="recall-search-hit recall-edge-card" role="listitem">
                          <span className="recall-search-hit-header">
                            <strong>{edge.source_label} {formatRelationLabel(edge.relation_type)} {edge.target_label}</strong>
                            <span>{edge.status} • {Math.round(edge.confidence * 100)}%</span>
                          </span>
                          {edge.excerpt ? <span className="recall-search-hit-excerpt">{edge.excerpt}</span> : null}
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
          <section className="card stack-gap">
            <div className="toolbar">
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
                  onClick={() => setStudyFilter(filter)}
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
                      ? 'recall-document-item recall-document-item-active'
                      : 'recall-document-item'
                  }
                  type="button"
                  onClick={() => {
                    setActiveCardId(card.id)
                    setShowAnswer(false)
                  }}
                >
                  <span className="recall-document-title">{card.prompt}</span>
                  <span className="recall-document-meta">
                    {card.document_title} • {formatStudyStatus(card.status)} • {card.review_count} reviews
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className="recall-main-column stack-gap">
            <section className="card stack-gap recall-study-card">
              <div className="section-header section-header-compact">
                <h2>Active card</h2>
                <p>
                  {activeStudyCard
                    ? `Grounded in ${activeStudyCard.document_title} and scheduled with FSRS review updates.`
                    : 'Choose a card from the queue to review it here.'}
                </p>
              </div>

              {!activeStudyCard ? <p className="small-note">No active study card yet.</p> : null}
              {activeStudyCard ? (
                <div className="study-card-body stack-gap">
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
          <section className="card stack-gap">
            <div className="section-header section-header-compact">
              <h2>Notes</h2>
              <p>
                Search and manage source-linked highlights captured from Reader in reflowed view.
              </p>
            </div>

            <label className="field">
              <span>Selected document</span>
              <select
                disabled={documentsStatus === 'error' || documents.length === 0}
                value={selectedDocumentId ?? ''}
                onChange={(event) => handleSelectDocument(event.target.value)}
              >
                {documents.length === 0 ? <option value="">No documents yet</option> : null}
                {documents.map((document) => (
                  <option key={document.id} value={document.id}>
                    {document.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Search notes</span>
              <input
                type="search"
                placeholder="Search highlights and note text"
                value={noteSearchQuery}
                onChange={(event) => setNoteSearchQuery(event.target.value)}
              />
            </label>

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
                      ? 'recall-document-item recall-document-item-active'
                      : 'recall-document-item'
                  }
                  type="button"
                  onClick={() => setSelectedNoteId(note.id)}
                >
                  <span className="recall-document-title">{note.anchor.anchor_text}</span>
                  <span className="recall-document-meta">
                    {getNoteDocumentTitle(note, selectedDocument)} • {dateFormatter.format(new Date(note.updated_at))}
                  </span>
                  <span className="recall-search-hit-excerpt">{note.anchor.excerpt_text}</span>
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
                      ? 'Edit note text, reopen the passage in Reader, or promote the note into manual graph and study knowledge.'
                      : 'Choose a note to inspect its anchored passage and text.'}
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
                ) : null}
              </div>

              {notesMessage ? <p className="small-note">{notesMessage}</p> : null}
              {!activeNote ? <p className="small-note">No active note yet.</p> : null}
              {activeNote ? (
                <div className="stack-gap recall-note-detail">
                  <div className="recall-detail-grid">
                    <div className="recall-detail-panel">
                      <strong>Document</strong>
                      <span>{getNoteDocumentTitle(activeNote, selectedDocument)}</span>
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
