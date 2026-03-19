import { useEffect, useMemo, useRef, useState } from 'react'

import { fetchDocumentView } from '../api'
import type { ReaderAnchorRange } from '../lib/appRoute'
import { buildRenderableBlocks } from '../lib/segment'
import type { DocumentView, RecallDocumentRecord, RecallNoteRecord, ReaderSettings, ViewMode } from '../types'
import { ReaderSurface } from './ReaderSurface'

interface FocusedSourceReaderPaneProps {
  activeMode: ViewMode
  anchorTextCandidates?: string[]
  document: RecallDocumentRecord | null
  notes: RecallNoteRecord[]
  onModeChange: (mode: ViewMode) => void
  onOpenInReader: (
    documentId: string,
    options?: {
      sentenceEnd?: number | null
      sentenceStart?: number | null
    },
  ) => void
  onResolvedAnchorRange?: (range: ReaderAnchorRange | null) => void
  requestedAnchorRange?: ReaderAnchorRange | null
  settings: ReaderSettings
}

function formatModeLabel(mode: ViewMode) {
  return mode.slice(0, 1).toUpperCase() + mode.slice(1)
}

function formatSentenceSpanLabel(start: number, end: number) {
  const sentenceCount = end - start + 1
  return `${sentenceCount} ${sentenceCount === 1 ? 'anchored sentence' : 'anchored sentences'}`
}

function areAnchorRangesEqual(left: ReaderAnchorRange | null | undefined, right: ReaderAnchorRange | null | undefined) {
  if (!left && !right) {
    return true
  }
  if (!left || !right) {
    return false
  }
  return left.sentenceStart === right.sentenceStart && left.sentenceEnd === right.sentenceEnd
}

function buildSentenceRangeSet(range: ReaderAnchorRange | null) {
  const indexes = new Set<number>()
  if (!range) {
    return indexes
  }
  for (let index = range.sentenceStart; index <= range.sentenceEnd; index += 1) {
    indexes.add(index)
  }
  return indexes
}

function buildNoteHighlightSet(notes: RecallNoteRecord[], sentenceCount: number) {
  const indexes = new Set<number>()
  for (const note of notes) {
    const start = note.anchor.global_sentence_start
    const end = note.anchor.global_sentence_end
    if (start === null || start === undefined || end === null || end === undefined) {
      continue
    }
    for (let index = start; index <= end && index < sentenceCount; index += 1) {
      indexes.add(index)
    }
  }
  return indexes
}

function normalizeAnchorRange(range: ReaderAnchorRange | null | undefined, sentenceCount: number) {
  if (!range || sentenceCount <= 0) {
    return null
  }
  const sentenceStart = Math.max(0, Math.min(range.sentenceStart, sentenceCount - 1))
  const sentenceEnd = Math.max(sentenceStart, Math.min(range.sentenceEnd, sentenceCount - 1))
  return {
    sentenceEnd,
    sentenceStart,
  }
}

function normalizeAnchorText(value: string) {
  return value
    .toLowerCase()
    .replace(/\.\.\./g, ' ')
    .replace(/[_\W]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function resolveAnchorRangeFromTextCandidates(
  sentenceTexts: string[],
  candidates: string[],
) {
  if (sentenceTexts.length === 0) {
    return null
  }

  const normalizedSentences = sentenceTexts.map(normalizeAnchorText)
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeAnchorText(candidate)
    if (!normalizedCandidate) {
      continue
    }

    for (let start = 0; start < normalizedSentences.length; start += 1) {
      let combined = ''
      for (let end = start; end < normalizedSentences.length && end < start + 6; end += 1) {
        combined = combined ? `${combined} ${normalizedSentences[end]}` : normalizedSentences[end]
        if (!combined) {
          continue
        }
        if (
          combined === normalizedCandidate ||
          combined.includes(normalizedCandidate)
        ) {
          return {
            sentenceEnd: end,
            sentenceStart: start,
          }
        }
      }
    }
  }

  return null
}

export function FocusedSourceReaderPane({
  activeMode,
  anchorTextCandidates = [],
  document,
  notes,
  onModeChange,
  onOpenInReader,
  onResolvedAnchorRange,
  requestedAnchorRange = null,
  settings,
}: FocusedSourceReaderPaneProps) {
  const [reloadToken, setReloadToken] = useState(0)
  const [view, setView] = useState<DocumentView | null>(null)
  const [viewKey, setViewKey] = useState<string | null>(null)
  const [viewErrorState, setViewErrorState] = useState<{
    key: string
    message: string
  } | null>(null)
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState(0)
  const surfaceRef = useRef<HTMLDivElement | null>(null)
  const lastScrollKeyRef = useRef<string | null>(null)
  const expectedViewKey = document ? `${document.id}:${activeMode}` : null

  useEffect(() => {
    if (!document) {
      return
    }

    let active = true
    void fetchDocumentView(document.id, activeMode)
      .then((loadedView) => {
        if (!active) {
          return
        }
        setView(loadedView)
        setViewKey(`${document.id}:${activeMode}`)
        setViewErrorState(null)
      })
      .catch((error) => {
        if (!active) {
          return
        }
        setView(null)
        setViewKey(null)
        setViewErrorState({
          key: `${document.id}:${activeMode}`,
          message: error instanceof Error ? error.message : 'Could not load Reader content for this source.',
        })
      })

    return () => {
      active = false
    }
  }, [activeMode, document, reloadToken])

  const availableModes = document?.available_modes ?? []
  const activeView = expectedViewKey && viewKey === expectedViewKey ? view : null
  const viewError = viewErrorState?.key === expectedViewKey ? viewErrorState.message : null
  const viewLoading = Boolean(document) && !activeView && !viewError
  const { blocks: renderBlocks, flatSentences } = useMemo(() => buildRenderableBlocks(activeView), [activeView])
  const resolvedAnchorRange = useMemo(() => {
    const textMatchedRange = resolveAnchorRangeFromTextCandidates(
      flatSentences.map((sentence) => sentence.text),
      anchorTextCandidates,
    )
    if (textMatchedRange) {
      return textMatchedRange
    }
    return normalizeAnchorRange(requestedAnchorRange, flatSentences.length)
  }, [anchorTextCandidates, flatSentences, requestedAnchorRange])
  const anchoredSentenceIndexes = useMemo(
    () => buildSentenceRangeSet(resolvedAnchorRange),
    [resolvedAnchorRange],
  )
  const notedSentenceIndexes = useMemo(
    () => (activeMode === 'reflowed' ? buildNoteHighlightSet(notes, flatSentences.length) : new Set<number>()),
    [activeMode, flatSentences.length, notes],
  )
  const activeSentenceIndex =
    resolvedAnchorRange?.sentenceStart ??
    (flatSentences.length > 0 ? Math.min(selectedSentenceIndex, flatSentences.length - 1) : 0)

  useEffect(() => {
    if (!onResolvedAnchorRange || !resolvedAnchorRange) {
      return
    }
    if (areAnchorRangesEqual(requestedAnchorRange, resolvedAnchorRange)) {
      return
    }
    onResolvedAnchorRange(resolvedAnchorRange)
  }, [onResolvedAnchorRange, requestedAnchorRange, resolvedAnchorRange])

  useEffect(() => {
    if (!document || !resolvedAnchorRange) {
      lastScrollKeyRef.current = null
      return
    }
    const scrollKey = `${document.id}:${activeMode}:${resolvedAnchorRange.sentenceStart}:${resolvedAnchorRange.sentenceEnd}`
    if (lastScrollKeyRef.current === scrollKey) {
      return
    }
    const sentenceElement = surfaceRef.current?.querySelector<HTMLElement>(
      `[data-sentence-index="${resolvedAnchorRange.sentenceStart}"]`,
    )
    if (!sentenceElement) {
      return
    }
    lastScrollKeyRef.current = scrollKey
    sentenceElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeMode, document, resolvedAnchorRange, view])

  return (
    <section className="reader-card recall-focused-reader-card stack-gap">
      <div className="recall-focused-reader-shell">
        <div className="reader-toolbar recall-focused-reader-toolbar">
          <div className="reader-toolbar-main recall-focused-reader-toolbar-main">
            <h2>Reader</h2>
            <p className="small-note">
              Keep the live source visible while surrounding note, graph, and study work stay secondary.
            </p>
          </div>
          {document ? (
            <div className="reader-toolbar-actions">
              <button
                className="ghost-button"
                type="button"
                onClick={() => onOpenInReader(document.id, resolvedAnchorRange ?? undefined)}
              >
                Open in Reader
              </button>
            </div>
          ) : null}
        </div>

        {document ? (
          <div className="recall-focused-reader-toolbar-row">
            <div className="reader-meta-row recall-focused-reader-meta" role="list" aria-label="Focused Reader metadata">
              <span className="status-chip reader-meta-chip" role="listitem">
                {document.source_type.toUpperCase()}
              </span>
              <span className="status-chip reader-meta-chip" role="listitem">
                {formatModeLabel(activeMode)} view
              </span>
              {resolvedAnchorRange ? (
                <span className="status-chip reader-meta-chip" role="listitem">
                  {formatSentenceSpanLabel(resolvedAnchorRange.sentenceStart, resolvedAnchorRange.sentenceEnd)}
                </span>
              ) : null}
            </div>

            {availableModes.length > 1 ? (
              <div className="recall-stage-tabs recall-focused-reader-modes" aria-label="Focused Reader modes" role="tablist">
                {availableModes.map((mode) => (
                  <button
                    key={mode}
                    aria-selected={activeMode === mode}
                    className={activeMode === mode ? 'recall-stage-tab recall-stage-tab-active' : 'recall-stage-tab'}
                    role="tab"
                    type="button"
                    onClick={() => onModeChange(mode)}
                  >
                    {formatModeLabel(mode)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {!document ? <p className="small-note">Choose a source to keep its live content visible here.</p> : null}
      {viewLoading ? <p className="small-note">Loading Reader content…</p> : null}
      {document && viewError ? (
        <div className="stack-gap">
          <p className="small-note">{viewError}</p>
          <div className="inline-actions">
            <button
              className="ghost-button"
              type="button"
              onClick={() => {
                setViewErrorState(null)
                setReloadToken((current) => current + 1)
              }}
            >
              Retry loading
            </button>
          </div>
        </div>
      ) : null}
      {document && activeView ? (
        <div ref={surfaceRef} className="recall-focused-reader-surface">
          <div className="recall-focused-reader-title">
            <h3>{document.title}</h3>
            <p className="small-note">
              {resolvedAnchorRange
                ? 'Anchored evidence stays visible here while you validate the supporting work beside it.'
                : 'Live reading stays here while you validate the supporting work beside it.'}
            </p>
          </div>
          <ReaderSurface
            accessibleLabel={`${document.title} Reader`}
            activeSentenceIndex={activeSentenceIndex}
            anchoredSentenceIndexes={anchoredSentenceIndexes}
            blocks={renderBlocks}
            notedSentenceIndexes={notedSentenceIndexes}
            onSelectSentence={(sentence) => setSelectedSentenceIndex(sentence.globalIndex)}
            settings={settings}
          />
        </div>
      ) : null}
    </section>
  )
}
