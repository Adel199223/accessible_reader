import { useDeferredValue, useEffect, useMemo, useState } from 'react'

import {
  buildRecallExportUrl,
  decideRecallGraphEdge,
  decideRecallGraphNode,
  fetchRecallDocument,
  fetchRecallDocuments,
  fetchRecallGraph,
  fetchRecallGraphNode,
  fetchRecallStudyCards,
  fetchRecallStudyOverview,
  generateRecallStudyCards,
  retrieveRecall,
  reviewRecallStudyCard,
} from '../api'
import type {
  KnowledgeEdgeRecord,
  KnowledgeGraphSnapshot,
  KnowledgeNodeDetail,
  RecallDocumentRecord,
  RecallRetrievalHit,
  StudyCardRecord,
  StudyCardStatus,
  StudyOverview,
  StudyReviewRating,
} from '../types'


interface RecallWorkspaceProps {
  onOpenReader: (documentId: string) => void
}


type RecallSection = 'library' | 'graph' | 'study'


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
  return 'Card'
}


function formatStudyStatus(status: StudyCardStatus) {
  return status.slice(0, 1).toUpperCase() + status.slice(1)
}


export function RecallWorkspace({ onOpenReader }: RecallWorkspaceProps) {
  const [section, setSection] = useState<RecallSection>('library')
  const [documents, setDocuments] = useState<RecallDocumentRecord[]>([])
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<RecallDocumentRecord | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [retrievalResults, setRetrievalResults] = useState<RecallRetrievalHit[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [retrievalLoading, setRetrievalLoading] = useState(false)
  const [graphSnapshot, setGraphSnapshot] = useState<KnowledgeGraphSnapshot | null>(null)
  const [graphLoading, setGraphLoading] = useState(true)
  const [graphBusyKey, setGraphBusyKey] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedNodeDetail, setSelectedNodeDetail] = useState<KnowledgeNodeDetail | null>(null)
  const [nodeDetailLoading, setNodeDetailLoading] = useState(false)
  const [studyOverview, setStudyOverview] = useState<StudyOverview | null>(null)
  const [studyCards, setStudyCards] = useState<StudyCardRecord[]>([])
  const [studyLoading, setStudyLoading] = useState(true)
  const [studyBusyKey, setStudyBusyKey] = useState<string | null>(null)
  const [studyFilter, setStudyFilter] = useState<'all' | 'new' | 'due' | 'scheduled'>('all')
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studyMessage, setStudyMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const deferredSearch = useDeferredValue(searchQuery)

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

  useEffect(() => {
    let active = true
    void fetchRecallDocuments()
      .then((loadedDocuments) => {
        if (!active) {
          return
        }
        setDocuments(loadedDocuments)
        const nextDocumentId = loadedDocuments[0]?.id ?? null
        if (nextDocumentId) {
          setDetailLoading(true)
        }
        setSelectedDocumentId((current) => current ?? nextDocumentId)
      })
      .catch((loadError: Error) => {
        if (active) {
          setError(loadError.message)
        }
      })
      .finally(() => {
        if (active) {
          setDocumentsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedDocumentId) {
      setSelectedDocument(null)
      return
    }

    let active = true
    void fetchRecallDocument(selectedDocumentId)
      .then((document) => {
        if (active) {
          setSelectedDocument(document)
        }
      })
      .catch((loadError: Error) => {
        if (active) {
          setError(loadError.message)
        }
      })
      .finally(() => {
        if (active) {
          setDetailLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [selectedDocumentId])

  useEffect(() => {
    if (!deferredSearch.trim()) {
      setRetrievalResults([])
      return
    }

    let active = true
    setRetrievalLoading(true)
    void retrieveRecall(deferredSearch)
      .then((hits) => {
        if (active) {
          setRetrievalResults(hits)
        }
      })
      .catch((searchError: Error) => {
        if (active) {
          setError(searchError.message)
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
    void loadGraph()
  }, [])

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
  }, [studyFilter])

  useEffect(() => {
    setActiveCardId((current) => {
      if (current && studyCards.some((card) => card.id === current)) {
        return current
      }
      return studyCards[0]?.id ?? null
    })
  }, [studyCards])

  function handleSelectDocument(documentId: string) {
    setDetailLoading(true)
    setSelectedDocumentId(documentId)
  }

  function handleSelectRetrievalHit(hit: RecallRetrievalHit) {
    handleSelectDocument(hit.source_document_id)
    if (hit.node_id) {
      setSelectedNodeId(hit.node_id)
    }
    if (hit.hit_type === 'card') {
      setSection('study')
      if (hit.card_id) {
        setActiveCardId(hit.card_id)
      }
      return
    }
    if (hit.hit_type === 'node') {
      setSection('graph')
    }
  }

  async function loadGraph() {
    setGraphLoading(true)
    try {
      const snapshot = await fetchRecallGraph()
      setGraphSnapshot(snapshot)
      setSelectedNodeId((current) => current ?? snapshot.nodes[0]?.id ?? null)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load the knowledge graph.')
    } finally {
      setGraphLoading(false)
    }
  }

  async function loadStudy(status: 'all' | 'new' | 'due' | 'scheduled') {
    setStudyLoading(true)
    try {
      const [overview, cards] = await Promise.all([
        fetchRecallStudyOverview(),
        fetchRecallStudyCards(status, 24),
      ])
      setStudyOverview(overview)
      setStudyCards(cards)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load study cards.')
    } finally {
      setStudyLoading(false)
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

  const documentCountLabel = documents.length === 1 ? '1 source document' : `${documents.length} source documents`
  const graphNodeCountLabel = graphSnapshot ? `${graphSnapshot.nodes.length} visible nodes` : 'Loading graph…'
  const studyCountLabel = studyOverview
    ? `${studyOverview.new_count + studyOverview.due_count + studyOverview.scheduled_count} cards`
    : 'Loading study…'

  return (
    <div className="recall-workspace stack-gap">
      <section className="card recall-hero">
        <div className="section-header">
          <p className="eyebrow">Recall</p>
          <h1>Reconnect what you already saved.</h1>
          <p>
            Inspect shared source documents, validate graph suggestions, retrieve grounded context, and study from local source-backed cards.
          </p>
        </div>
        <div className="recall-hero-metrics" role="list" aria-label="Recall metrics">
          <span className="status-chip" role="listitem">{documentsLoading ? 'Loading library…' : documentCountLabel}</span>
          <span className="status-chip status-muted" role="listitem">{graphNodeCountLabel}</span>
          <span className="status-chip status-muted" role="listitem">{studyCountLabel}</span>
        </div>
      </section>

      <div className="recall-stage-tabs" aria-label="Recall sections" role="tablist">
        {([
          ['library', 'Library'],
          ['graph', 'Graph'],
          ['study', 'Study'],
        ] as const).map(([path, label]) => (
          <button
            key={path}
            aria-selected={section === path}
            className={section === path ? 'recall-stage-tab recall-stage-tab-active' : 'recall-stage-tab'}
            role="tab"
            type="button"
            onClick={() => setSection(path)}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? <p className="inline-error">{error}</p> : null}
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
              {!documentsLoading && documents.length === 0 ? (
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
              {!detailLoading && !selectedDocument ? (
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
                {retrievalLoading ? <p className="small-note">Searching chunks, nodes, and cards…</p> : null}
                {!retrievalLoading && !searchQuery.trim() ? (
                  <p className="small-note">
                    Search across chunk text, graph suggestions, and study prompts without leaving Recall.
                  </p>
                ) : null}
                {!retrievalLoading && searchQuery.trim() && retrievalResults.length === 0 ? (
                  <p className="small-note">No saved chunks, nodes, or cards match that query yet.</p>
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
              <span className="status-chip" role="listitem">{graphLoading ? 'Loading graph…' : `${graphSnapshot?.nodes.length ?? 0} nodes`}</span>
              <span className="status-chip status-muted" role="listitem">{graphSnapshot?.pending_edges ?? 0} pending edges</span>
              <span className="status-chip status-muted" role="listitem">{graphSnapshot?.confirmed_edges ?? 0} confirmed edges</span>
            </div>

            <div className="recall-document-list" role="list">
              {graphLoading ? <p className="small-note">Building the local knowledge graph…</p> : null}
              {!graphLoading && !graphSnapshot?.nodes.length ? (
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
              <span className="status-chip" role="listitem">{studyOverview?.new_count ?? 0} new</span>
              <span className="status-chip status-muted" role="listitem">{studyOverview?.due_count ?? 0} due</span>
              <span className="status-chip status-muted" role="listitem">{studyOverview?.review_event_count ?? 0} reviews logged</span>
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
              {!studyLoading && studyCards.length === 0 ? (
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
    </div>
  )
}
