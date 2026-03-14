import type { DocumentRecord, RecallNoteSearchHit, RecallRetrievalHit } from '../types'
import {
  buildWorkspaceSearchAnchorOptions,
  buildWorkspaceSearchDocumentKey,
  buildWorkspaceSearchNoteKey,
  buildWorkspaceSearchRecallHitKey,
  type WorkspaceSearchSessionState,
} from '../lib/workspaceSearch'

type WorkspaceSearchSurfaceVariant = 'dialog' | 'panel'

interface WorkspaceSearchSurfaceProps {
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
  onQueryChange: (query: string) => void
  onRequestClose?: () => void
  onSelectResult: (resultKey: string) => void
  searchSession: WorkspaceSearchSessionState
  variant: WorkspaceSearchSurfaceVariant
}

interface WorkspaceSearchAction {
  key: string
  label: string
  onClick: () => void
  tone?: 'secondary'
}

interface WorkspaceSearchNormalizedResult {
  actions: WorkspaceSearchAction[]
  badges: string[]
  group: 'sources' | 'notes' | 'recall'
  key: string
  preview: string
  subtitle: string
  title: string
}

function formatRetrievalKind(hitType: RecallRetrievalHit['hit_type']) {
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

function formatDocumentBadge(document: DocumentRecord) {
  return document.source_type.toUpperCase()
}

function buildDocumentResult(
  document: DocumentRecord,
  onOpenReader: WorkspaceSearchSurfaceProps['onOpenReader'],
): WorkspaceSearchNormalizedResult {
  return {
    actions: [
      {
        key: `open-reader:${document.id}`,
        label: 'Open in Reader',
        onClick: () => onOpenReader(document.id),
      },
    ],
    badges: [formatDocumentBadge(document)],
    group: 'sources',
    key: buildWorkspaceSearchDocumentKey(document.id),
    preview: 'Reopen this saved source in Reader without leaving the current workspace search loop.',
    subtitle: document.source_type.toUpperCase(),
    title: document.title,
  }
}

function buildNoteResult(
  note: RecallNoteSearchHit,
  onOpenNote: WorkspaceSearchSurfaceProps['onOpenNote'],
  onOpenReader: WorkspaceSearchSurfaceProps['onOpenReader'],
): WorkspaceSearchNormalizedResult {
  return {
    actions: [
      {
        key: `open-note:${note.id}`,
        label: 'Open note',
        onClick: () => onOpenNote(note.anchor.source_document_id, note.id),
      },
      {
        key: `open-reader:${note.id}`,
        label: 'Open in Reader',
        onClick: () => onOpenReader(note.anchor.source_document_id, buildWorkspaceSearchAnchorOptions(note)),
        tone: 'secondary',
      },
    ],
    badges: ['Note', note.document_title],
    group: 'notes',
    key: buildWorkspaceSearchNoteKey(note.id),
    preview: note.body_text?.trim() || note.anchor.excerpt_text,
    subtitle: note.document_title,
    title: note.anchor.anchor_text,
  }
}

function buildRecallHitResult(
  hit: RecallRetrievalHit,
  onOpenGraph: WorkspaceSearchSurfaceProps['onOpenGraph'],
  onOpenNote: WorkspaceSearchSurfaceProps['onOpenNote'],
  onOpenReader: WorkspaceSearchSurfaceProps['onOpenReader'],
  onOpenStudy: WorkspaceSearchSurfaceProps['onOpenStudy'],
): WorkspaceSearchNormalizedResult {
  const actions: WorkspaceSearchAction[] = []

  if (hit.hit_type === 'node') {
    actions.push({
      key: `open-graph:${hit.id}`,
      label: 'Open in Graph',
      onClick: () => onOpenGraph(hit.node_id ?? null),
    })
  } else if (hit.hit_type === 'card') {
    actions.push({
      key: `open-study:${hit.id}`,
      label: 'Open in Study',
      onClick: () => onOpenStudy(hit.card_id ?? null),
    })
  } else if (hit.hit_type === 'note' && hit.note_id) {
    actions.push({
      key: `open-note:${hit.id}`,
      label: 'Open note',
      onClick: () => onOpenNote(hit.source_document_id, hit.note_id!),
    })
  } else {
    actions.push({
      key: `open-reader:${hit.id}`,
      label: 'Open in Reader',
      onClick: () => onOpenReader(hit.source_document_id, buildWorkspaceSearchAnchorOptions(hit)),
    })
  }

  if (hit.hit_type !== 'chunk') {
    actions.push({
      key: `open-source:${hit.id}`,
      label: 'Open source',
      onClick: () => onOpenReader(hit.source_document_id, buildWorkspaceSearchAnchorOptions(hit)),
      tone: 'secondary',
    })
  }

  return {
    actions,
    badges: [formatRetrievalKind(hit.hit_type), hit.document_title, ...hit.reasons],
    group: 'recall',
    key: buildWorkspaceSearchRecallHitKey(hit.id),
    preview: hit.excerpt,
    subtitle: `${formatRetrievalKind(hit.hit_type)} · ${hit.document_title}`,
    title: hit.title,
  }
}

function normalizeSearchResults(props: WorkspaceSearchSurfaceProps) {
  const { onOpenGraph, onOpenNote, onOpenReader, onOpenStudy, searchSession } = props
  return {
    recentDocuments: searchSession.recentDocuments.map((document) => buildDocumentResult(document, onOpenReader)),
    recallHits: searchSession.hits.map((hit) => buildRecallHitResult(hit, onOpenGraph, onOpenNote, onOpenReader, onOpenStudy)),
    notes: searchSession.notes.map((note) => buildNoteResult(note, onOpenNote, onOpenReader)),
    sourceResults: searchSession.sourceResults.map((document) => buildDocumentResult(document, onOpenReader)),
  }
}

function renderResultList(
  title: string,
  description: string,
  results: WorkspaceSearchNormalizedResult[],
  selectedResultKey: string | null,
  onSelectResult: (resultKey: string) => void,
) {
  return (
    <section className="workspace-search-section stack-gap">
      <div className="section-header section-header-compact">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="workspace-search-results" role="list">
        {results.length ? (
          results.map((result) => (
            <div key={result.key} role="listitem">
              <button
                aria-pressed={selectedResultKey === result.key}
                className={
                  selectedResultKey === result.key
                    ? 'workspace-search-result workspace-search-result-active'
                    : 'workspace-search-result'
                }
                type="button"
                onClick={() => onSelectResult(result.key)}
              >
                <span className="workspace-search-result-main">
                  <strong>{result.title}</strong>
                  <span>{result.subtitle}</span>
                  <p>{result.preview}</p>
                </span>
              </button>
            </div>
          ))
        ) : (
          <p className="small-note">No matches in this group yet.</p>
        )}
      </div>
    </section>
  )
}

export function WorkspaceSearchSurface({
  onQueryChange,
  onRequestClose,
  onSelectResult,
  searchSession,
  variant,
  ...actionProps
}: WorkspaceSearchSurfaceProps) {
  const { notes, recallHits, recentDocuments, sourceResults } = normalizeSearchResults({
    onOpenGraph: actionProps.onOpenGraph,
    onOpenNote: actionProps.onOpenNote,
    onOpenReader: actionProps.onOpenReader,
    onOpenStudy: actionProps.onOpenStudy,
    onQueryChange,
    onRequestClose,
    onSelectResult,
    searchSession,
    variant,
  })

  const queryActive = searchSession.query.trim().length > 0
  const selectedResult =
    [...sourceResults, ...notes, ...recallHits, ...(queryActive ? [] : recentDocuments)].find(
      (result) => result.key === searchSession.selectedResultKey,
    ) ?? null

  function handleRunAction(action: WorkspaceSearchAction) {
    action.onClick()
    onRequestClose?.()
  }

  return (
    <div className={`workspace-search-surface workspace-search-surface-${variant} stack-gap`}>
      <label className="field">
        <span>{variant === 'dialog' ? 'Search' : 'Search workspace'}</span>
        <input
          autoFocus={variant === 'dialog'}
          placeholder="Try a source title, topic, note text, or study clue"
          type="search"
          value={searchSession.query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>

      {searchSession.error ? (
        <div className="inline-error" role="alert">
          <p>{searchSession.error}</p>
        </div>
      ) : null}

      {searchSession.loading ? <p className="small-note">Searching…</p> : null}

      {!searchSession.loading && !queryActive && variant === 'panel' ? (
        <div className="workspace-search-empty-state">
          <strong>Search across sources, notes, graph evidence, and study clues.</strong>
          <p>Start a query here or reopen the shell search from anywhere without losing the same working set.</p>
        </div>
      ) : null}

      {!searchSession.loading && !queryActive && variant === 'dialog' ? (
        <div className="workspace-search-layout">
          <div className="workspace-search-groups">
            {renderResultList(
              'Recent sources',
              'Resume something you saved recently, or start typing to search across Recall.',
              recentDocuments,
              searchSession.selectedResultKey,
              onSelectResult,
            )}
          </div>
          {selectedResult ? (
            <aside className="workspace-search-focus stack-gap" aria-label="Focused search result">
              <div className="section-header section-header-compact">
                <h3>Focused result</h3>
                <p>Keep one result in view while you decide where to open it.</p>
              </div>
              <div className="workspace-search-focus-body stack-gap">
                <div className="workspace-search-focus-heading">
                  <h4>{selectedResult.title}</h4>
                  <p>{selectedResult.subtitle}</p>
                </div>
                <p className="workspace-search-focus-preview">{selectedResult.preview}</p>
                <div className="workspace-search-focus-badges" role="list" aria-label="Focused result details">
                  {selectedResult.badges.map((badge) => (
                    <span key={`${selectedResult.key}:${badge}`} className="status-chip reader-meta-chip" role="listitem">
                      {badge}
                    </span>
                  ))}
                </div>
                <div className="workspace-search-result-actions">
                  {selectedResult.actions.map((action) => (
                    <button
                      key={action.key}
                      className={action.tone === 'secondary' ? 'ghost-button' : undefined}
                      type="button"
                      onClick={() => handleRunAction(action)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      ) : null}

      {!searchSession.loading && queryActive ? (
        <div className="workspace-search-layout">
          <div className="workspace-search-groups">
            {renderResultList(
              'Sources',
              'Reopen source material directly in Reader.',
              sourceResults,
              searchSession.selectedResultKey,
              onSelectResult,
            )}
            {renderResultList(
              'Notes',
              'Compare saved highlights before jumping back to the anchored passage.',
              notes,
              searchSession.selectedResultKey,
              onSelectResult,
            )}
            {renderResultList(
              'Recall hits',
              'Open grounded graph, study, note, and source matches from one remembered search loop.',
              recallHits,
              searchSession.selectedResultKey,
              onSelectResult,
            )}
          </div>
          {selectedResult ? (
            <aside className="workspace-search-focus stack-gap" aria-label="Focused search result">
              <div className="section-header section-header-compact">
                <h3>Focused result</h3>
                <p>Compare this match and choose the right handoff without losing the query.</p>
              </div>
              <div className="workspace-search-focus-body stack-gap">
                <div className="workspace-search-focus-heading">
                  <h4>{selectedResult.title}</h4>
                  <p>{selectedResult.subtitle}</p>
                </div>
                <p className="workspace-search-focus-preview">{selectedResult.preview}</p>
                <div className="workspace-search-focus-badges" role="list" aria-label="Focused result details">
                  {selectedResult.badges.map((badge) => (
                    <span key={`${selectedResult.key}:${badge}`} className="status-chip reader-meta-chip" role="listitem">
                      {badge}
                    </span>
                  ))}
                </div>
                <div className="workspace-search-result-actions">
                  {selectedResult.actions.map((action) => (
                    <button
                      key={action.key}
                      className={action.tone === 'secondary' ? 'ghost-button' : undefined}
                      type="button"
                      onClick={() => handleRunAction(action)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          ) : (
            <aside className="workspace-search-focus stack-gap" aria-label="Focused search result">
              <div className="section-header section-header-compact">
                <h3>Focused result</h3>
                <p>Pick a result to compare its detail before opening it.</p>
              </div>
            </aside>
          )}
        </div>
      ) : null}
    </div>
  )
}
