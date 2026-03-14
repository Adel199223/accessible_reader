import { useDeferredValue, useEffect, useState } from 'react'

import { fetchDocuments, retrieveRecall, searchRecallNotes } from '../api'
import type { DocumentRecord, RecallNoteSearchHit, RecallRetrievalHit } from '../types'
import { WorkspaceDialogFrame } from './WorkspaceDialogFrame'

interface WorkspaceSearchDialogProps {
  onClose: () => void
  onOpenGraph: (nodeId: string | null) => void
  onOpenNote: (documentId: string, noteId: string) => void
  onOpenReader: (
    documentId: string,
    options?: {
      sentenceEnd?: number | null
      sentenceStart?: number | null
    },
  ) => void
  onOpenStudy: (cardId: string | null) => void
  open: boolean
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function buildAnchorOptions(note: RecallNoteSearchHit | RecallRetrievalHit) {
  const anchor = 'anchor' in note ? note.anchor : note.note_anchor
  if (!anchor) {
    return undefined
  }
  return {
    sentenceEnd: anchor.global_sentence_end ?? anchor.sentence_end,
    sentenceStart: anchor.global_sentence_start ?? anchor.sentence_start,
  }
}

export function WorkspaceSearchDialog({
  onClose,
  onOpenGraph,
  onOpenNote,
  onOpenReader,
  onOpenStudy,
  open,
}: WorkspaceSearchDialogProps) {
  const [query, setQuery] = useState('')
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [notes, setNotes] = useState<RecallNoteSearchHit[]>([])
  const [hits, setHits] = useState<RecallRetrievalHit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const deferredQuery = useDeferredValue(query)

  useEffect(() => {
    if (!open) {
      return
    }

    let active = true
    const trimmedQuery = deferredQuery.trim()

    if (!trimmedQuery) {
      void fetchDocuments('')
        .then((loadedDocuments) => {
          if (!active) {
            return
          }
          setDocuments(loadedDocuments.slice(0, 8))
          setNotes([])
          setHits([])
        })
        .catch((loadError) => {
          if (active) {
            setDocuments([])
            setError(getErrorMessage(loadError, 'Could not load recent sources.'))
          }
        })
        .finally(() => {
          if (active) {
            setLoading(false)
          }
        })

      return () => {
        active = false
      }
    }

    void Promise.all([
      fetchDocuments(trimmedQuery),
      searchRecallNotes(trimmedQuery, 8, null),
      retrieveRecall(trimmedQuery, 8),
    ])
      .then(([loadedDocuments, loadedNotes, loadedHits]) => {
        if (!active) {
          return
        }
        setDocuments(loadedDocuments.slice(0, 8))
        setNotes(loadedNotes)
        setHits(loadedHits)
      })
      .catch((loadError) => {
        if (active) {
          setDocuments([])
          setNotes([])
          setHits([])
          setError(getErrorMessage(loadError, 'Could not search your workspace yet.'))
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [deferredQuery, open])

  return (
    <WorkspaceDialogFrame
      description="Find saved sources, grounded Recall hits, and source-linked notes without leaving the current workspace."
      onClose={onClose}
      open={open}
      title="Search your workspace"
      wide
    >
      <label className="field">
        <span>Search</span>
        <input
          autoFocus
          placeholder="Try a source title, topic, note text, or study clue"
          type="search"
          value={query}
          onChange={(event) => {
            setLoading(true)
            setError(null)
            setQuery(event.target.value)
          }}
        />
      </label>

      {error ? (
        <div className="inline-error" role="alert">
          <p>{error}</p>
        </div>
      ) : null}

      {loading ? <p className="small-note">Searching…</p> : null}

      {!loading && !deferredQuery.trim() ? (
        <section className="workspace-search-section stack-gap">
          <div className="section-header section-header-compact">
            <h3>Recent sources</h3>
            <p>Open something you saved recently, or start typing to search across Recall.</p>
          </div>
          <div className="workspace-search-results" role="list">
            {documents.map((document) => (
              <div key={document.id} className="workspace-search-result" role="listitem">
                <button
                  className="workspace-search-result-main"
                  type="button"
                  onClick={() => {
                    onOpenReader(document.id)
                    onClose()
                  }}
                >
                  <strong>{document.title}</strong>
                  <span>{document.source_type.toUpperCase()}</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {!loading && deferredQuery.trim() ? (
        <>
          <section className="workspace-search-section stack-gap">
            <div className="section-header section-header-compact">
              <h3>Sources</h3>
              <p>Reopen source material directly in Reader.</p>
            </div>
            <div className="workspace-search-results" role="list">
              {documents.length ? (
                documents.map((document) => (
                  <div key={document.id} className="workspace-search-result" role="listitem">
                    <button
                      className="workspace-search-result-main"
                      type="button"
                      onClick={() => {
                        onOpenReader(document.id)
                        onClose()
                      }}
                    >
                      <strong>{document.title}</strong>
                      <span>{document.source_type.toUpperCase()}</span>
                    </button>
                  </div>
                ))
              ) : (
                <p className="small-note">No saved sources match yet.</p>
              )}
            </div>
          </section>

          <section className="workspace-search-section stack-gap">
            <div className="section-header section-header-compact">
              <h3>Notes</h3>
              <p>Jump into saved highlights or reopen them at the anchored passage.</p>
            </div>
            <div className="workspace-search-results" role="list">
              {notes.length ? (
                notes.map((note) => (
                  <div key={note.id} className="workspace-search-result" role="listitem">
                    <button
                      className="workspace-search-result-main"
                      type="button"
                      onClick={() => {
                        onOpenNote(note.anchor.source_document_id, note.id)
                        onClose()
                      }}
                    >
                      <strong>{note.anchor.anchor_text}</strong>
                      <span>{note.document_title}</span>
                      {note.body_text ? <p>{note.body_text}</p> : null}
                    </button>
                    <div className="workspace-search-result-actions">
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => {
                          onOpenReader(note.anchor.source_document_id, buildAnchorOptions(note))
                          onClose()
                        }}
                      >
                        Open in Reader
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="small-note">No saved notes match yet.</p>
              )}
            </div>
          </section>

          <section className="workspace-search-section stack-gap">
            <div className="section-header section-header-compact">
              <h3>Recall hits</h3>
              <p>Open grounded graph, study, chunk, or note matches from one place.</p>
            </div>
            <div className="workspace-search-results" role="list">
              {hits.length ? (
                hits.map((hit) => (
                  <div key={hit.id} className="workspace-search-result" role="listitem">
                    <button
                      className="workspace-search-result-main"
                      type="button"
                      onClick={() => {
                        if (hit.hit_type === 'node') {
                          onOpenGraph(hit.node_id ?? null)
                        } else if (hit.hit_type === 'card') {
                          onOpenStudy(hit.card_id ?? null)
                        } else if (hit.hit_type === 'note' && hit.note_id) {
                          onOpenNote(hit.source_document_id, hit.note_id)
                        } else {
                          onOpenReader(hit.source_document_id, buildAnchorOptions(hit))
                        }
                        onClose()
                      }}
                    >
                      <strong>{hit.title}</strong>
                      <span>{hit.document_title}</span>
                      <p>{hit.excerpt}</p>
                    </button>
                    <div className="workspace-search-result-actions">
                      {hit.hit_type === 'note' && hit.note_id ? (
                        <button
                          className="ghost-button"
                          type="button"
                          onClick={() => {
                            onOpenReader(hit.source_document_id, buildAnchorOptions(hit))
                            onClose()
                          }}
                        >
                          Open in Reader
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <p className="small-note">No grounded Recall hits match yet.</p>
              )}
            </div>
          </section>
        </>
      ) : null}
    </WorkspaceDialogFrame>
  )
}
