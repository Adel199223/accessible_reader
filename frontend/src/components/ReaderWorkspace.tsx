import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'

import {
  createRecallNote,
  deleteRecallNote,
  deleteDocumentRecord,
  fetchDocumentView,
  fetchDocuments,
  fetchRecallNotes,
  generateDocumentView,
  promoteRecallNoteToGraphNode,
  promoteRecallNoteToStudyCard,
  saveProgress,
  updateRecallNote,
} from '../api'
import type {
  DocumentRecord,
  DocumentView,
  HealthResponse,
  RecallNoteGraphPromotionRequest,
  RecallNoteRecord,
  RecallNoteStudyPromotionRequest,
  ReaderSettings,
  SummaryDetail,
  ViewMode,
} from '../types'
import type { WorkspaceHeroProps } from './WorkspaceHero'
import { ControlsOverflow } from './ControlsOverflow'
import { LibraryPane } from './LibraryPane'
import { ReaderSurface } from './ReaderSurface'
import { SourceWorkspaceFrame, type SourceWorkspaceFrameState } from './SourceWorkspaceFrame'
import { ThemePanel } from './ThemePanel'
import { useSpeech } from '../hooks/useSpeech'
import type { WorkspaceDockContext } from '../lib/appRoute'
import { loadReaderSession, resolveReaderSession, saveReaderSession } from '../lib/readerSession'
import { buildRenderableBlocks, type RenderSentence, type RenderableBlock } from '../lib/segment'


interface ReaderWorkspaceProps {
  health: HealthResponse | null
  onOpenRecallGraph: (documentId: string) => void
  onOpenRecallLibrary: (documentId: string) => void
  onOpenRecallNotes: (documentId: string, noteId?: string | null) => void
  onOpenRecallStudy: (documentId: string) => void
  onRequestNewSource: () => void
  onShellContextChange: (context: WorkspaceDockContext | null) => void
  onShellHeroChange: (hero: WorkspaceHeroProps) => void
  onShellSourceWorkspaceChange: (workspace: SourceWorkspaceFrameState | null) => void
  routeDocumentId?: string | null
  routeSentenceEnd?: number | null
  routeSentenceStart?: number | null
  settings: ReaderSettings
  onSettingsChange: Dispatch<SetStateAction<ReaderSettings>>
}

type LoadState = 'idle' | 'loading' | 'success' | 'error'

interface NoteSelection {
  anchorText: string
  blockId: string
  excerptText: string
  globalSentenceEnd: number
  globalSentenceStart: number
  sentenceEnd: number
  sentenceStart: number
}

interface SentenceRange {
  end: number
  start: number
}


const viewModeOptions: Array<{
  label: string
  mode: ViewMode
}> = [
  {
    label: 'Original',
    mode: 'original',
  },
  {
    label: 'Reflowed',
    mode: 'reflowed',
  },
  {
    label: 'Simplified',
    mode: 'simplified',
  },
  {
    label: 'Summary',
    mode: 'summary',
  },
]

function TransportIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className="transport-icon"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  )
}

function PlayIcon() {
  return (
    <TransportIcon>
      <polygon fill="currentColor" points="8 6 18 12 8 18 8 6" />
    </TransportIcon>
  )
}

function PauseIcon() {
  return (
    <TransportIcon>
      <path d="M8 6v12" />
      <path d="M16 6v12" />
    </TransportIcon>
  )
}

function PreviousIcon() {
  return (
    <TransportIcon>
      <path d="M7 6v12" />
      <polygon fill="currentColor" points="18 6 9 12 18 18 18 6" />
    </TransportIcon>
  )
}

function NextIcon() {
  return (
    <TransportIcon>
      <path d="M17 6v12" />
      <polygon fill="currentColor" points="8 6 17 12 8 18 8 6" />
    </TransportIcon>
  )
}

function StopIcon() {
  return (
    <TransportIcon>
      <rect fill="currentColor" height="10" rx="1.5" stroke="none" width="10" x="7" y="7" />
    </TransportIcon>
  )
}

function ThemeIcon() {
  return (
    <TransportIcon>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.75v2.5" />
      <path d="M12 18.75v2.5" />
      <path d="m5.2 5.2 1.75 1.75" />
      <path d="m17.05 17.05 1.75 1.75" />
      <path d="M2.75 12h2.5" />
      <path d="M18.75 12h2.5" />
      <path d="m5.2 18.8 1.75-1.75" />
      <path d="m17.05 6.95 1.75-1.75" />
    </TransportIcon>
  )
}

function SupportSourceIcon() {
  return (
    <svg aria-hidden="true" className="reader-support-tab-icon" viewBox="0 0 24 24">
      <path d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v10.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25Z" />
      <path d="M8 8h8M8 12h8M8 16h5.5" />
    </svg>
  )
}

function SupportNotebookIcon() {
  return (
    <svg aria-hidden="true" className="reader-support-tab-icon" viewBox="0 0 24 24">
      <path d="M7 4.75h7.5L18 8.2v11.05H7z" />
      <path d="M14.5 4.75V8.5H18M9.25 11h6.5M9.25 14h6.5M9.25 17h4.25" />
    </svg>
  )
}

function buildAccessibilitySnapshot(settings: ReaderSettings) {
  return {
    contrast_theme: settings.contrast_theme,
    focus_mode: settings.focus_mode,
    font_preset: settings.font_preset,
    line_spacing: settings.line_spacing,
    line_width: settings.line_width,
    preferred_voice: settings.preferred_voice,
    speech_rate: settings.speech_rate,
    text_size: settings.text_size,
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function formatSourceTypeLabel(sourceType: string) {
  return sourceType
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatSummaryDetailLabel(detail: SummaryDetail) {
  return detail.charAt(0).toUpperCase() + detail.slice(1)
}

function formatSentenceSpanLabel(start: number | null | undefined, end: number | null | undefined) {
  if (start === null || start === undefined || end === null || end === undefined) {
    return 'Anchored passage'
  }
  const sentenceCount = end - start + 1
  return `${sentenceCount} ${sentenceCount === 1 ? 'anchored sentence' : 'anchored sentences'}`
}

function buildSavedNoteSecondaryText(note: RecallNoteRecord) {
  const noteBody = note.body_text?.replace(/\s+/g, ' ').trim()
  if (noteBody) {
    return noteBody
  }

  const anchorText = note.anchor.anchor_text.replace(/\s+/g, ' ').trim()
  const excerptText = note.anchor.excerpt_text.replace(/\s+/g, ' ').trim()
  if (excerptText && excerptText !== anchorText) {
    return excerptText
  }

  return null
}

function buildSentenceRangeSet(range: SentenceRange | null) {
  const indexes = new Set<number>()
  if (!range) {
    return indexes
  }
  for (let index = range.start; index <= range.end; index += 1) {
    indexes.add(index)
  }
  return indexes
}

function buildNoteHighlightSet(notes: RecallNoteRecord[]) {
  const indexes = new Set<number>()
  for (const note of notes) {
    const start = note.anchor.global_sentence_start
    const end = note.anchor.global_sentence_end
    if (start === null || start === undefined || end === null || end === undefined) {
      continue
    }
    for (let index = start; index <= end; index += 1) {
      indexes.add(index)
    }
  }
  return indexes
}

function normalizeNoteBody(bodyText: string) {
  const trimmed = bodyText.trim()
  return trimmed.length > 0 ? trimmed : null
}

function upsertNoteRecord(notes: RecallNoteRecord[], updatedNote: RecallNoteRecord) {
  return notes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
}

function removeNoteRecord(notes: RecallNoteRecord[], noteId: string) {
  return notes.filter((note) => note.id !== noteId)
}

function findMatchingNoteByRange(notes: RecallNoteRecord[], range: SentenceRange | null) {
  if (!range) {
    return null
  }
  return (
    notes.find((note) => {
      const start = note.anchor.global_sentence_start ?? note.anchor.sentence_start
      const end = note.anchor.global_sentence_end ?? note.anchor.sentence_end
      return start === range.start && end === range.end
    }) ?? null
  )
}

function buildInitialNoteStudyDraft(note: RecallNoteRecord | null): RecallNoteStudyPromotionRequest {
  return {
    prompt: note?.body_text?.trim() || 'What should you remember from this note?',
    answer: note?.anchor.anchor_text ?? '',
  }
}

function buildNoteSelection(
  sentence: RenderSentence,
  block: RenderableBlock | undefined,
  existingSelection: NoteSelection | null,
): NoteSelection | null {
  if (!block) {
    return null
  }

  if (!existingSelection || existingSelection.blockId !== sentence.blockId) {
    const sentenceText = block.sentences[sentence.sentenceIndexInBlock]?.text ?? sentence.text
    return {
      anchorText: sentenceText,
      blockId: sentence.blockId,
      excerptText: sentenceText,
      globalSentenceEnd: sentence.globalIndex,
      globalSentenceStart: sentence.globalIndex,
      sentenceEnd: sentence.sentenceIndexInBlock,
      sentenceStart: sentence.sentenceIndexInBlock,
    }
  }

  const sentenceStart = Math.min(existingSelection.sentenceStart, sentence.sentenceIndexInBlock)
  const sentenceEnd = Math.max(existingSelection.sentenceEnd, sentence.sentenceIndexInBlock)
  const selectedSentences = block.sentences.slice(sentenceStart, sentenceEnd + 1)
  if (selectedSentences.length === 0) {
    return null
  }

  const excerptStart = Math.max(sentenceStart - 1, 0)
  const excerptEnd = Math.min(sentenceEnd + 1, block.sentences.length - 1)
  return {
    anchorText: selectedSentences.map((item) => item.text).join(' ').trim(),
    blockId: sentence.blockId,
    excerptText: block.sentences.slice(excerptStart, excerptEnd + 1).map((item) => item.text).join(' ').trim(),
    globalSentenceEnd: selectedSentences[selectedSentences.length - 1].globalIndex,
    globalSentenceStart: selectedSentences[0].globalIndex,
    sentenceEnd,
    sentenceStart,
  }
}

function findRenderableBlock(blocks: RenderableBlock[], blockId: string) {
  return blocks.find((block) => block.id === blockId)
}

export function ReaderWorkspace({
  health,
  onOpenRecallGraph,
  onOpenRecallLibrary,
  onOpenRecallNotes,
  onOpenRecallStudy,
  onRequestNewSource,
  onShellContextChange,
  onShellHeroChange,
  onShellSourceWorkspaceChange,
  onSettingsChange,
  routeDocumentId = null,
  routeSentenceEnd = null,
  routeSentenceStart = null,
  settings,
}: ReaderWorkspaceProps) {
  const [initialSession] = useState(() =>
    routeDocumentId
      ? {
          documentId: routeDocumentId,
          mode: 'reflowed' as ViewMode,
          summaryDetail: 'balanced' as SummaryDetail,
        }
      : loadReaderSession(),
  )
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [activeDocument, setActiveDocument] = useState<DocumentRecord | null>(null)
  const [search, setSearch] = useState('')
  const [documentsLoading, setDocumentsLoading] = useState(true)
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(() => initialSession.documentId)
  const [activeMode, setActiveMode] = useState<ViewMode>(() => initialSession.mode)
  const [summaryDetail, setSummaryDetail] = useState<SummaryDetail>(() => initialSession.summaryDetail)
  const [view, setView] = useState<DocumentView | null>(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewError, setViewError] = useState<string | null>(null)
  const [documentsError, setDocumentsError] = useState<string | null>(null)
  const [transformBusy, setTransformBusy] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(() => !initialSession.documentId)
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null)
  const [themePanelOpen, setThemePanelOpen] = useState(false)
  const [notes, setNotes] = useState<RecallNoteRecord[]>([])
  const [notesStatus, setNotesStatus] = useState<LoadState>('idle')
  const [notesError, setNotesError] = useState<string | null>(null)
  const [noteCaptureActive, setNoteCaptureActive] = useState(false)
  const [noteSelection, setNoteSelection] = useState<NoteSelection | null>(null)
  const [noteDraftBody, setNoteDraftBody] = useState('')
  const [noteSaveBusy, setNoteSaveBusy] = useState(false)
  const [selectedReaderNoteId, setSelectedReaderNoteId] = useState<string | null>(null)
  const [selectedReaderNoteDraftBody, setSelectedReaderNoteDraftBody] = useState('')
  const [notePromotionMode, setNotePromotionMode] = useState<'graph' | 'study' | null>(null)
  const [noteGraphDraft, setNoteGraphDraft] = useState<RecallNoteGraphPromotionRequest>({
    label: '',
    description: '',
  })
  const [noteStudyDraft, setNoteStudyDraft] = useState<RecallNoteStudyPromotionRequest>({
    prompt: 'What should you remember from this note?',
    answer: '',
  })
  const [noteBusyKey, setNoteBusyKey] = useState<string | null>(null)
  const [noteMessage, setNoteMessage] = useState<string | null>(null)
  const [readerContextTab, setReaderContextTab] = useState<'source' | 'notes'>(() =>
    routeSentenceStart !== null ? 'notes' : 'source',
  )
  const [readerSupportExpanded, setReaderSupportExpanded] = useState(() => routeSentenceStart !== null)
  const [routeAnchorRange, setRouteAnchorRange] = useState<SentenceRange | null>(() =>
    routeSentenceStart === null
      ? null
      : {
          end: routeSentenceEnd ?? routeSentenceStart,
          start: routeSentenceStart,
        },
  )
  const deferredSearch = useDeferredValue(search)
  const pendingRouteAnchorScrollRef = useRef(Boolean(routeSentenceStart !== null))
  const handledRouteAnchorNoteKeyRef = useRef<string | null>(null)

  async function loadDocuments(
    nextQuery = deferredSearch,
    preferredDocumentId?: string | null,
    preferredMode = activeMode,
  ) {
    setDocumentsLoading(true)
    setDocumentsError(null)
    try {
      const loadedDocuments = await fetchDocuments(nextQuery)
      setDocuments(loadedDocuments)
      const nextDocumentId =
        preferredDocumentId !== undefined ? preferredDocumentId : activeDocument?.id ?? null
      const nextSession = resolveReaderSession(
        loadedDocuments,
        {
          documentId: nextDocumentId,
          mode: preferredMode,
          summaryDetail,
        },
        {
          currentDocument: preferredDocumentId === null ? null : activeDocument,
          preserveCurrentWhenFiltered: nextQuery.trim().length > 0,
        },
      )
      const shouldAutoCollapseLibrary =
        nextQuery.trim().length === 0 &&
        Boolean(nextSession.document) &&
        (activeDocument === null || preferredDocumentId !== activeDocument.id)
      startTransition(() => {
        setActiveDocument(nextSession.document)
        setActiveDocumentId(nextSession.documentId)
        setActiveMode(nextSession.mode)
        setSummaryDetail(nextSession.summaryDetail)
        if (shouldAutoCollapseLibrary) {
          setLibraryOpen(false)
        }
      })
    } catch (error) {
      setDocumentsError(getErrorMessage(error, 'Could not load documents.'))
    } finally {
      setDocumentsLoading(false)
    }
  }

  async function loadNotes(documentId: string) {
    setNotesStatus('loading')
    setNotesError(null)
    try {
      const loadedNotes = await fetchRecallNotes(documentId)
      setNotes(loadedNotes)
      setNotesStatus('success')
      return loadedNotes
    } catch (error) {
      setNotes([])
      setNotesStatus('error')
      setNotesError(getErrorMessage(error, 'Could not load saved notes.'))
      return []
    }
  }

  useEffect(() => {
    void loadDocuments(deferredSearch, activeDocumentId, activeMode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredSearch])

  useEffect(() => {
    if (documentsLoading) {
      return
    }

    if (!activeDocument) {
      setView(null)
      setViewError(null)
      return
    }

    let active = true
    setViewLoading(true)
    setViewError(null)
    void fetchDocumentView(activeDocument.id, activeMode, summaryDetail)
      .then((loadedView) => {
        if (!active) {
          return
        }
        setView(loadedView)
      })
      .catch((error: Error) => {
        if (!active) {
          return
        }
        setView(null)
        setViewError(error.message)
      })
      .finally(() => {
        if (active) {
          setViewLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [activeDocument, activeMode, documentsLoading, summaryDetail])

  useEffect(() => {
    if (documentsLoading) {
      return
    }

    if (!activeDocument) {
      setNotes([])
      setNotesStatus('idle')
      setNotesError(null)
      return
    }
    void loadNotes(activeDocument.id)
  }, [activeDocument, documentsLoading])

  const selectedDocument = activeDocument
  const initialSentenceIndex = selectedDocument?.progress_by_mode[activeMode] ?? 0
  const { blocks: renderBlocks, flatSentences } = buildRenderableBlocks(view)
  const readerTextCharacterCount = useMemo(
    () =>
      renderBlocks.reduce((total, block) => {
        const normalizedBlockText = block.sentences
          .map((sentence) => sentence.text)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
        return total + normalizedBlockText.length
      }, 0),
    [renderBlocks],
  )
  const readerShortDocumentLayout = useMemo(
    () =>
      renderBlocks.length > 0 &&
      renderBlocks.length <= 3 &&
      flatSentences.length > 0 &&
      flatSentences.length <= 6 &&
      readerTextCharacterCount <= 320,
    [flatSentences.length, readerTextCharacterCount, renderBlocks.length],
  )
  const canAnnotateCurrentView = activeMode === 'reflowed' && view?.detail_level === 'default' && Boolean(view)
  const noteHighlightIndexes = useMemo(
    () => (canAnnotateCurrentView ? buildNoteHighlightSet(notes) : new Set<number>()),
    [canAnnotateCurrentView, notes],
  )
  const selectedSentenceIndexes = useMemo(
    () =>
      noteCaptureActive && noteSelection
        ? buildSentenceRangeSet({
            end: noteSelection.globalSentenceEnd,
            start: noteSelection.globalSentenceStart,
          })
        : new Set<number>(),
    [noteCaptureActive, noteSelection],
  )
  const anchoredSentenceIndexes = useMemo(
    () => (canAnnotateCurrentView ? buildSentenceRangeSet(routeAnchorRange) : new Set<number>()),
    [canAnnotateCurrentView, routeAnchorRange],
  )
  const activeReaderNote =
    notes.find((note) => note.id === selectedReaderNoteId) ??
    findMatchingNoteByRange(notes, routeAnchorRange) ??
    notes[0] ??
    null
  const activeReaderNoteSentenceSpanLabel = activeReaderNote
    ? formatSentenceSpanLabel(
        activeReaderNote.anchor.global_sentence_start ?? activeReaderNote.anchor.sentence_start,
        activeReaderNote.anchor.global_sentence_end ?? activeReaderNote.anchor.sentence_end,
      )
    : null
  const currentModeOption = viewModeOptions.find((option) => option.mode === activeMode)
  const visibleViewModeOptions = viewModeOptions.filter(
    (option) => option.mode === activeMode || selectedDocument?.available_modes.includes(option.mode),
  )
  const sourceWorkspaceCounts = useMemo(
    () =>
      selectedDocument
        ? [
            {
              ariaLabel: 'Open nearby notebook notes',
              label: notes.length === 1 ? '1 note' : `${notes.length} notes`,
              onSelect: () => {
                setReaderContextTab('notes')
                setReaderSupportExpanded(true)
              },
            },
          ]
        : [],
    [notes.length, selectedDocument],
  )

  useEffect(() => {
    if (!selectedDocument) {
      return
    }

    if (!selectedDocument.available_modes.includes(activeMode)) {
      startTransition(() => {
        setActiveMode(selectedDocument.available_modes.includes('reflowed') ? 'reflowed' : 'original')
      })
    }
  }, [selectedDocument, activeMode])

  useEffect(() => {
    if (canAnnotateCurrentView) {
      return
    }

    setNoteCaptureActive(false)
    setNoteSelection(null)
    setNoteDraftBody('')
  }, [canAnnotateCurrentView])

  useEffect(() => {
    setNoteMessage(null)
  }, [activeDocumentId, activeMode])

  useEffect(() => {
    handledRouteAnchorNoteKeyRef.current = null
  }, [activeDocumentId])

  useEffect(() => {
    if (!routeAnchorRange) {
      handledRouteAnchorNoteKeyRef.current = null
      return
    }
    const routeAnchorKey = `${routeAnchorRange.start}:${routeAnchorRange.end}`
    if (handledRouteAnchorNoteKeyRef.current === routeAnchorKey) {
      return
    }
    const matchingNote = findMatchingNoteByRange(notes, routeAnchorRange)
    if (!matchingNote) {
      return
    }
    handledRouteAnchorNoteKeyRef.current = routeAnchorKey
    setSelectedReaderNoteId(matchingNote.id)
  }, [notes, routeAnchorRange])

  useEffect(() => {
    if (noteCaptureActive) {
      return
    }
    if (selectedReaderNoteId && notes.some((note) => note.id === selectedReaderNoteId)) {
      return
    }
    const nextNoteId = notes[0]?.id ?? null
    if (nextNoteId !== selectedReaderNoteId) {
      setSelectedReaderNoteId(nextNoteId)
    }
  }, [noteCaptureActive, notes, selectedReaderNoteId])

  useEffect(() => {
    setSelectedReaderNoteDraftBody(activeReaderNote?.body_text ?? '')
    setNotePromotionMode(null)
    setNoteGraphDraft({
      label: '',
      description: '',
    })
    setNoteStudyDraft(buildInitialNoteStudyDraft(activeReaderNote))
  }, [activeReaderNote])

  const speech = useSpeech({
    sentences: flatSentences,
    preferredVoice: settings.preferred_voice,
    rate: settings.speech_rate,
    initialSentenceIndex,
    onSentenceChange: (sentenceIndex) => {
      if (!activeDocumentId) {
        return
      }
      setDocuments((currentDocuments) =>
        currentDocuments.map((document) =>
          document.id === activeDocumentId
            ? {
                ...document,
                progress_by_mode: {
                  ...document.progress_by_mode,
                  [activeMode]: sentenceIndex,
                },
              }
            : document,
        ),
      )
      setActiveDocument((currentDocument) =>
        currentDocument && currentDocument.id === activeDocumentId
          ? {
              ...currentDocument,
              progress_by_mode: {
                ...currentDocument.progress_by_mode,
                [activeMode]: sentenceIndex,
              },
            }
          : currentDocument,
      )
    },
  })

  useEffect(() => {
    if (!routeAnchorRange || !canAnnotateCurrentView || !pendingRouteAnchorScrollRef.current) {
      return
    }

    const element = document.querySelector<HTMLElement>(
      `[data-sentence-index="${routeAnchorRange.start}"]`,
    )
    if (!element) {
      return
    }
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    pendingRouteAnchorScrollRef.current = false
  }, [canAnnotateCurrentView, routeAnchorRange, view])

  useEffect(() => {
    if (routeAnchorRange) {
      return
    }
    const element = document.querySelector<HTMLElement>(
      `[data-sentence-index="${speech.currentSentenceIndex}"]`,
    )
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [routeAnchorRange, speech.currentSentenceIndex, view])

  useEffect(() => {
    if (!selectedDocument) {
      return
    }
    const accessibilitySnapshot = buildAccessibilitySnapshot(settings)
    const timeout = window.setTimeout(() => {
      void saveProgress(selectedDocument.id, activeMode, speech.currentSentenceIndex, {
        accessibilitySnapshot,
        summaryDetail,
      }).catch(() => undefined)
    }, 250)
    return () => window.clearTimeout(timeout)
  }, [activeMode, selectedDocument, settings, speech.currentSentenceIndex, summaryDetail])

  useEffect(() => {
    if (!selectedDocument || !selectedDocument.available_modes.includes(activeMode)) {
      return
    }

    saveReaderSession({
      documentId: selectedDocument.id,
      mode: activeMode,
      summaryDetail,
    })
  }, [selectedDocument, activeMode, summaryDetail])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) {
        return
      }
      if (noteCaptureActive) {
        return
      }
      const target = event.target instanceof HTMLElement ? event.target : null
      const targetElement = event.target instanceof Element ? event.target : null
      if (
        target &&
        (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName) ||
          target.isContentEditable ||
          Boolean(targetElement?.closest('[data-reader-sentence="true"]')))
      ) {
        return
      }
      if (event.key === ' ') {
        event.preventDefault()
        if (speech.isSpeaking && !speech.isPaused) {
          setRouteAnchorRange(null)
          speech.pause()
        } else if (speech.isPaused) {
          setRouteAnchorRange(null)
          speech.resume()
        } else {
          setRouteAnchorRange(null)
          speech.start()
        }
      }
      if (event.altKey && event.key === 'ArrowRight') {
        event.preventDefault()
        setRouteAnchorRange(null)
        speech.next()
      }
      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault()
        setRouteAnchorRange(null)
        speech.previous()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [noteCaptureActive, speech])

  async function handleGenerate(mode: 'simplified' | 'summary') {
    if (!activeDocumentId) {
      return
    }
    setTransformBusy(true)
    setViewError(null)
    try {
      const generatedView = await generateDocumentView(activeDocumentId, mode, summaryDetail)
      setView(generatedView)
      setDocuments((currentDocuments) =>
        currentDocuments.map((document) =>
          document.id === activeDocumentId && !document.available_modes.includes(mode)
            ? { ...document, available_modes: [...document.available_modes, mode] }
            : document,
        ),
      )
      setActiveDocument((currentDocument) =>
        currentDocument && currentDocument.id === activeDocumentId && !currentDocument.available_modes.includes(mode)
          ? { ...currentDocument, available_modes: [...currentDocument.available_modes, mode] }
          : currentDocument,
      )
    } catch (error) {
      setViewError(error instanceof Error ? error.message : `Could not generate ${mode}.`)
    } finally {
      setTransformBusy(false)
    }
  }

  function resetNoteComposer() {
    setNoteCaptureActive(false)
    setNoteSelection(null)
    setNoteDraftBody('')
  }

  function handleStartNoteCapture() {
    speech.stop()
    setRouteAnchorRange(null)
    setNoteMessage(null)
    setNotesError(null)
    setNotePromotionMode(null)
    setNoteCaptureActive(true)
    setNoteSelection(null)
    setNoteDraftBody('')
  }

  function handleCancelNoteCapture() {
    resetNoteComposer()
  }

  async function handleSaveNote() {
    if (!activeDocumentId || !view || !noteSelection) {
      return
    }
    const variantId = typeof view.variant_metadata?.variant_id === 'string' ? view.variant_metadata.variant_id : null
    if (!variantId) {
      setNotesError('Reader could not resolve this reflowed view for note saving yet.')
      return
    }

    setNoteSaveBusy(true)
    setNotesError(null)
    setNoteMessage(null)
    try {
      const savedNote = await createRecallNote(activeDocumentId, {
        anchor: {
          source_document_id: activeDocumentId,
          variant_id: variantId,
          block_id: noteSelection.blockId,
          sentence_start: noteSelection.sentenceStart,
          sentence_end: noteSelection.sentenceEnd,
          global_sentence_start: noteSelection.globalSentenceStart,
          global_sentence_end: noteSelection.globalSentenceEnd,
          anchor_text: noteSelection.anchorText,
          excerpt_text: noteSelection.excerptText,
        },
        body_text: normalizeNoteBody(noteDraftBody),
      })
      setNotes((currentNotes) => [savedNote, ...currentNotes])
      setNotesStatus('success')
      setNoteMessage('Note saved locally.')
      setSelectedReaderNoteId(savedNote.id)
      setSelectedReaderNoteDraftBody(savedNote.body_text ?? '')
      setNotePromotionMode(null)
      setNoteStudyDraft(buildInitialNoteStudyDraft(savedNote))
      resetNoteComposer()
    } catch (error) {
      setNotesStatus('error')
      setNotesError(getErrorMessage(error, 'Could not save that note.'))
    } finally {
      setNoteSaveBusy(false)
    }
  }

  function handleTransportStart() {
    setRouteAnchorRange(null)
    speech.start()
  }

  function handleTransportPause() {
    setRouteAnchorRange(null)
    speech.pause()
  }

  function handleTransportResume() {
    setRouteAnchorRange(null)
    speech.resume()
  }

  function handleTransportPrevious() {
    setRouteAnchorRange(null)
    speech.previous()
  }

  function handleTransportNext() {
    setRouteAnchorRange(null)
    speech.next()
  }

  function handleTransportStop() {
    setRouteAnchorRange(null)
    speech.stop()
  }

  function handleSelectSentence(sentence: RenderSentence) {
    if (noteCaptureActive) {
      const block = findRenderableBlock(renderBlocks, sentence.blockId)
      setNoteSelection((currentSelection) => buildNoteSelection(sentence, block, currentSelection))
      setNoteMessage(null)
      return
    }

    setRouteAnchorRange(null)
    speech.jumpTo(sentence.globalIndex)
  }

  function handleSetActiveMode(nextMode: ViewMode) {
    speech.stop()
    setRouteAnchorRange(null)
    resetNoteComposer()
    startTransition(() => {
      setActiveMode(nextMode)
    })
  }

  function openReaderSupport(nextTab: 'source' | 'notes') {
    setReaderContextTab(nextTab)
    if (nextTab === 'source') {
      setLibraryOpen(true)
    }
    setReaderSupportExpanded(true)
  }

  function handleReaderSupportTab(nextTab: 'source' | 'notes') {
    const supportLockedOpen = noteCaptureActive || Boolean(routeAnchorRange) || notePromotionMode !== null
    if (readerSupportExpanded && readerContextTab === nextTab && !supportLockedOpen) {
      setReaderSupportExpanded(false)
      return
    }
    openReaderSupport(nextTab)
  }

  function handleOpenSavedNote(note: RecallNoteRecord) {
    speech.stop()
    resetNoteComposer()
    pendingRouteAnchorScrollRef.current = true
    setReaderContextTab('notes')
    setReaderSupportExpanded(true)
    setSelectedReaderNoteId(note.id)
    setNoteMessage(null)
    startTransition(() => {
      setActiveMode('reflowed')
    })
    setRouteAnchorRange({
      end: note.anchor.global_sentence_end ?? note.anchor.sentence_end,
      start: note.anchor.global_sentence_start ?? note.anchor.sentence_start,
    })
  }

  async function handleSaveSelectedNoteChanges() {
    if (!activeReaderNote) {
      return
    }
    setNoteBusyKey(`save:${activeReaderNote.id}`)
    setNotesError(null)
    setNoteMessage(null)
    try {
      const updatedNote = await updateRecallNote(activeReaderNote.id, {
        body_text: normalizeNoteBody(selectedReaderNoteDraftBody),
      })
      setNotes((currentNotes) => upsertNoteRecord(currentNotes, updatedNote))
      setSelectedReaderNoteDraftBody(updatedNote.body_text ?? '')
      setNoteMessage('Note saved locally.')
    } catch (error) {
      setNotesError(getErrorMessage(error, 'Could not save that note.'))
    } finally {
      setNoteBusyKey(null)
    }
  }

  async function handleDeleteSelectedNote() {
    if (!activeReaderNote) {
      return
    }
    const confirmed = window.confirm('Delete this note from local Recall?')
    if (!confirmed) {
      return
    }
    setNoteBusyKey(`delete:${activeReaderNote.id}`)
    setNotesError(null)
    setNoteMessage(null)
    try {
      await deleteRecallNote(activeReaderNote.id)
      setNotes((currentNotes) => removeNoteRecord(currentNotes, activeReaderNote.id))
      setNoteMessage('Note deleted.')
      setSelectedReaderNoteId((currentId) => (currentId === activeReaderNote.id ? null : currentId))
      setNotePromotionMode(null)
    } catch (error) {
      setNotesError(getErrorMessage(error, 'Could not delete that note.'))
    } finally {
      setNoteBusyKey(null)
    }
  }

  async function handlePromoteSelectedNoteToGraph() {
    if (!activeReaderNote) {
      return
    }
    setNoteBusyKey(`graph:${activeReaderNote.id}`)
    setNotesError(null)
    setNoteMessage(null)
    try {
      await promoteRecallNoteToGraphNode(activeReaderNote.id, {
        label: noteGraphDraft.label,
        description: noteGraphDraft.description?.trim().length ? noteGraphDraft.description.trim() : null,
      })
      setNotePromotionMode(null)
      setNoteMessage('Graph node created from the note.')
    } catch (error) {
      setNotesError(getErrorMessage(error, 'Could not promote that note into the graph.'))
    } finally {
      setNoteBusyKey(null)
    }
  }

  async function handlePromoteSelectedNoteToStudyCard() {
    if (!activeReaderNote) {
      return
    }
    setNoteBusyKey(`study:${activeReaderNote.id}`)
    setNotesError(null)
    setNoteMessage(null)
    try {
      await promoteRecallNoteToStudyCard(activeReaderNote.id, {
        prompt: noteStudyDraft.prompt,
        answer: noteStudyDraft.answer,
      })
      setNotePromotionMode(null)
      setNoteMessage('Study card created from the note.')
    } catch (error) {
      setNotesError(getErrorMessage(error, 'Could not create a study card from that note.'))
    } finally {
      setNoteBusyKey(null)
    }
  }

  const hasActiveDocument = Boolean(selectedDocument)
  const canUseSpeechTransport = speech.isSupported && flatSentences.length > 0
  const notesLoading = notesStatus === 'loading'
  const noteSaveDisabled = !noteSelection || noteSaveBusy
  const selectedReaderNoteSaveDisabled = !activeReaderNote || noteBusyKey === `save:${activeReaderNote.id}`
  const currentSentenceLabel = `Sentence ${flatSentences.length === 0 ? 0 : speech.currentSentenceIndex + 1} of ${flatSentences.length}`
  const readerOriginalParityMode = hasActiveDocument && activeMode === 'original'
  const showReaderDerivedContext = hasActiveDocument && (activeMode === 'simplified' || activeMode === 'summary')
  const readerTransportExpanded = speech.isSpeaking || speech.isPaused
  const readerSupportLockedOpen = noteCaptureActive || Boolean(routeAnchorRange) || notePromotionMode !== null
  const transportAction =
    speech.isSpeaking && !speech.isPaused
      ? {
          active: true,
          ariaLabel: 'Pause read aloud',
          icon: <PauseIcon />,
          onClick: handleTransportPause,
          title: 'Pause read aloud',
        }
      : speech.isPaused
        ? {
            active: true,
            ariaLabel: 'Resume read aloud',
            icon: <PlayIcon />,
            onClick: handleTransportResume,
            title: 'Resume read aloud',
          }
        : {
            active: false,
            ariaLabel: 'Start read aloud',
            icon: <PlayIcon />,
            onClick: handleTransportStart,
            title: 'Start read aloud',
          }
  const readerViewLabel = currentModeOption?.label ?? activeMode
  const readerSourceTypeLabel = selectedDocument ? formatSourceTypeLabel(selectedDocument.source_type) : null
  const showReaderGenerationAction = (activeMode === 'simplified' || activeMode === 'summary') && !view
  const libraryMetricLabel = documentsLoading
    ? 'Loading Home…'
    : documentsError
      ? 'Home unavailable'
      : `${documents.length} ${documents.length === 1 ? 'source document' : 'source documents'}`
  const readerStatusMetricLabel = hasActiveDocument ? `${readerViewLabel} view` : 'Reader ready'
  const notesMetricLabel = hasActiveDocument
    ? canAnnotateCurrentView
      ? notesStatus === 'error'
        ? 'Notebook unavailable'
        : `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`
      : view?.generated_by === 'openai'
        ? 'AI view open'
        : 'Source view ready'
    : health?.openai_configured
      ? 'AI ready'
      : 'AI optional'
  const emptyStateTitle = documentsLoading
    ? 'Loading your reading space'
    : documentsError
      ? 'Reader is temporarily unavailable'
      : 'Open a source to start reading'
  const emptyStateDescription = documentsLoading
    ? 'Your local library is loading. Reading controls appear after a document opens.'
    : documentsError
      ? 'Reader could not reconnect to the local library yet. Retry loading after the backend is running again.'
      : 'Use Add to bring in a source from anywhere in Recall, or reopen something from Home.'
  const currentContextNoteLabel = notesLoading
    ? 'Loading notes…'
    : `${notes.length} saved ${notes.length === 1 ? 'note' : 'notes'}`
  const currentContextReadinessLabel = selectedDocument
    ? canAnnotateCurrentView
      ? noteCaptureActive
        ? 'Capture active'
        : 'Capture ready'
      : 'Switch to Reflowed for capture'
    : 'Ready when a source opens'
  const readerStageMetadata = [
    noteCaptureActive ? 'Capture active' : null,
    routeAnchorRange ? formatSentenceSpanLabel(routeAnchorRange.start, routeAnchorRange.end) : null,
    notesStatus === 'error' ? 'Notebook unavailable' : null,
  ].filter(Boolean)
  const readerDerivedContextLabel =
    activeMode === 'reflowed'
      ? 'Reflowed'
      : activeMode === 'simplified'
        ? 'Simplified'
        : 'Summary'
  const readerGeneratedEmptyStateDescription =
    activeMode === 'simplified'
      ? 'Create one for lighter wording that stays attached to this source.'
      : 'Create one for a compressed overview of this source.'
  const readerGeneratedEmptyStateTitle =
    activeMode === 'simplified' ? 'No simplified view yet' : 'No summary yet'
  const generatedViewUnavailable = Boolean(
    showReaderGenerationAction &&
      !documentsError &&
      !viewLoading &&
      !view &&
      (!viewError || /not available yet/i.test(viewError)),
  )
  const generatedViewLoadError = Boolean(
    showReaderGenerationAction &&
      !documentsError &&
      !viewLoading &&
      !view &&
      viewError &&
      !/not available yet/i.test(viewError),
  )
  const readerDerivedContextSummary =
    activeMode === 'reflowed'
      ? 'Local spacing, sentence jumps, and note capture stay attached to this saved source.'
      : activeMode === 'simplified'
        ? 'Lighter wording stays attached to this saved source.'
        : 'Compressed overview stays attached to this saved source.'
  const readerDerivedMetadata = [
    generatedViewLoadError ? 'Unavailable' : view?.generated_by === 'openai' ? 'AI generated' : null,
    view?.cached ? 'Cached' : null,
  ].filter(Boolean)
  const showReaderSummaryDetailControls = activeMode === 'summary'
  const showReaderGeneratedState = Boolean(selectedDocument && !view && !viewLoading && showReaderGenerationAction)
  const showReaderDerivedContextSummary = !showReaderGeneratedState
  const showReaderDerivedActionColumn =
    (showReaderGenerationAction && !generatedViewLoadError) || generatedViewLoadError
  const readerStageStyle = {
    ['--reader-line-width' as string]: `${settings.line_width}ch`,
  } as CSSProperties
  const readerOverflowActions = [
    ...(canAnnotateCurrentView && !noteCaptureActive
      ? [
          {
            label: 'Add note',
            onSelect: () => {
              openReaderSupport('notes')
              handleStartNoteCapture()
            },
          },
        ]
      : []),
  ]
  const notesPanelSummary = selectedDocument
    ? notesLoading
      ? 'Loading notebook notes for the active source.'
      : notesStatus === 'error'
        ? 'Notebook notes are temporarily unavailable for this source.'
        : activeReaderNote
          ? `Working note: ${activeReaderNote.anchor.anchor_text}`
          : readerOriginalParityMode
            ? `${notes.length} saved ${notes.length === 1 ? 'note' : 'notes'} stay nearby in Notebook for this source.`
            : `${notes.length} saved ${notes.length === 1 ? 'note' : 'notes'} for ${selectedDocument.title}.`
    : 'Open a source to keep notebook highlights close by.'
  const visibleSavedNotes = !noteCaptureActive && activeReaderNote ? notes.filter((note) => note.id !== activeReaderNote.id) : notes
  const visibleSavedNoteItems = visibleSavedNotes.map((note) => ({
    note,
    secondaryText: buildSavedNoteSecondaryText(note),
  }))
  const savedNotesListLabel = !noteCaptureActive && activeReaderNote ? 'Other saved notes' : 'Saved notes'
  const shellContext = useMemo<WorkspaceDockContext | null>(() => {
    if (!selectedDocument) {
      return null
    }

    const hasAnchorRange = Boolean(routeAnchorRange)
    const recentKey = hasAnchorRange
      ? `reader-anchor:${selectedDocument.id}:${routeAnchorRange?.start ?? 0}:${routeAnchorRange?.end ?? 0}`
      : `document:${selectedDocument.id}`
    const subtitle = hasAnchorRange
      ? `${formatSentenceSpanLabel(routeAnchorRange?.start, routeAnchorRange?.end)} in ${readerViewLabel}`
      : `${readerViewLabel} view · ${currentSentenceLabel}`
    const noteActionLabel = activeReaderNote ? 'Open in Notebook' : 'View in Notebook'

    return {
      actions: [
        {
          key: `reader-notes:${selectedDocument.id}`,
          label: noteActionLabel,
          target: {
            documentId: selectedDocument.id,
            noteId: activeReaderNote?.id ?? notes[0]?.id ?? null,
            section: 'notes',
          },
        },
        {
          key: `reader-library:${selectedDocument.id}`,
          label: 'Source',
          target: {
            documentId: selectedDocument.id,
            section: 'library',
          },
        },
      ],
      badge: 'Reader',
      key: recentKey,
      meta: `${currentContextNoteLabel} · ${currentContextReadinessLabel}`,
      recentItem: {
        badge: hasAnchorRange ? 'Reader anchor' : 'Reader',
        key: recentKey,
        subtitle,
        target: {
          documentId: selectedDocument.id,
          section: 'reader',
          sentenceEnd: routeAnchorRange?.end ?? null,
          sentenceStart: routeAnchorRange?.start ?? null,
        },
        title: selectedDocument.title,
      },
      section: 'reader',
      subtitle,
      title: selectedDocument.title,
    }
  }, [
    currentContextNoteLabel,
    currentContextReadinessLabel,
    currentSentenceLabel,
    activeReaderNote,
    notes,
    readerViewLabel,
    routeAnchorRange,
    selectedDocument,
  ])

  useEffect(() => {
    setLibraryOpen(!hasActiveDocument)
    if (!hasActiveDocument) {
      setReaderContextTab('source')
      setReaderSupportExpanded(false)
    }
  }, [hasActiveDocument])

  useEffect(() => {
    if (noteCaptureActive) {
      setReaderContextTab('notes')
      setReaderSupportExpanded(true)
    }
  }, [noteCaptureActive])

  useEffect(() => {
    if (routeAnchorRange) {
      setReaderContextTab('notes')
      setReaderSupportExpanded(true)
    }
  }, [routeAnchorRange])

  async function handleDeleteDocument(documentToDelete: DocumentRecord) {
    const confirmed = window.confirm(`Delete "${documentToDelete.title}" from this device?`)
    if (!confirmed) {
      return
    }

    const deletingActiveDocument = documentToDelete.id === activeDocumentId
    setDeletingDocumentId(documentToDelete.id)
    setViewError(null)

    try {
      if (deletingActiveDocument) {
        speech.stop()
        setRouteAnchorRange(null)
        resetNoteComposer()
        setView(null)
        setActiveDocument(null)
        setActiveDocumentId(null)
      }

      await deleteDocumentRecord(documentToDelete.id)
      await loadDocuments(
        search,
        deletingActiveDocument ? null : activeDocumentId,
        deletingActiveDocument ? 'reflowed' : activeMode,
      )
    } catch (error) {
      setViewError(error instanceof Error ? error.message : 'Could not delete that document.')
    } finally {
      setDeletingDocumentId(null)
    }
  }

  function handleRetryReaderLoading() {
    setViewError(null)
    void loadDocuments(search, activeDocumentId, activeMode)
  }

  function handleRetryNotesLoading() {
    if (!activeDocumentId) {
      return
    }
    void loadNotes(activeDocumentId)
  }

  const libraryErrorMessage = documentsError ? 'Saved documents are unavailable until Reader reconnects.' : null
  const readerErrorMessage = documentsError ?? (generatedViewUnavailable || generatedViewLoadError ? null : viewError)
  const canRetryReaderLoading = Boolean(documentsError || (selectedDocument && viewError && !showReaderGenerationAction))
  const showUnavailableEmptyState = !selectedDocument && Boolean(documentsError)

  useEffect(() => {
    onShellHeroChange({
      compact: true,
      eyebrow: hasActiveDocument ? 'Reader' : 'Recall',
      title: hasActiveDocument ? 'Read without losing context.' : 'Read what you saved.',
      description: hasActiveDocument
        ? 'Document first, with calmer support attached nearby.'
        : 'Open a saved source or use New without leaving the Recall workspace.',
      metrics: [
        { label: libraryMetricLabel },
        { label: readerStatusMetricLabel, tone: 'muted' },
        { label: notesMetricLabel, tone: 'muted' },
      ],
    })
  }, [
    hasActiveDocument,
    libraryMetricLabel,
    notesMetricLabel,
    onShellHeroChange,
    readerStatusMetricLabel,
  ])

  useEffect(() => {
    onShellContextChange(shellContext)
  }, [onShellContextChange, shellContext])

  useEffect(() => {
    if (!selectedDocument) {
      onShellSourceWorkspaceChange(null)
      return
    }

    onShellSourceWorkspaceChange({
      activeTab: 'reader',
      counts: sourceWorkspaceCounts,
      description: 'Attached source context for the active document.',
      document: {
        availableModes: selectedDocument.available_modes,
        fileName: selectedDocument.file_name ?? null,
        id: selectedDocument.id,
        sourceType: selectedDocument.source_type,
        title: selectedDocument.title,
      },
      onSelectTab: (tab) => {
        if (tab === 'reader') {
          return
        }
        if (tab === 'overview') {
          onOpenRecallLibrary(selectedDocument.id)
          return
        }
        if (tab === 'notes') {
          onOpenRecallNotes(selectedDocument.id, activeReaderNote?.id ?? notes[0]?.id ?? null)
          return
        }
        if (tab === 'graph') {
          onOpenRecallGraph(selectedDocument.id)
          return
        }
        onOpenRecallStudy(selectedDocument.id)
      },
      readerLayout: readerSupportExpanded ? 'expanded' : 'compact',
      readerLineWidthCh: settings.line_width,
    })
  }, [
    activeReaderNote,
    notes,
    onOpenRecallGraph,
    onOpenRecallLibrary,
    onOpenRecallNotes,
    onOpenRecallStudy,
    onShellSourceWorkspaceChange,
    readerSupportExpanded,
    settings.line_width,
    selectedDocument,
    sourceWorkspaceCounts,
  ])

  return (
    <div className="reader-workspace stack-gap">
      {readerErrorMessage ? (
        <div className="inline-error stack-gap" role="alert">
          <p>{readerErrorMessage}</p>
          {canRetryReaderLoading ? (
            <div className="inline-actions">
              <button className="ghost-button" type="button" onClick={handleRetryReaderLoading}>
                Retry loading
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="reader-shell-grid reader-shell-grid-reader-milestone">
        <main className="main-panel reader-reading-column">
          {selectedDocument ? (
            <SourceWorkspaceFrame
              activeTab="reader"
              counts={sourceWorkspaceCounts}
              description="Attached source context for the active document."
              document={{
                availableModes: selectedDocument.available_modes,
                fileName: selectedDocument.file_name ?? null,
                id: selectedDocument.id,
                sourceType: selectedDocument.source_type,
                title: selectedDocument.title,
              }}
              readerLayout={readerSupportExpanded ? 'expanded' : 'compact'}
              readerLineWidthCh={settings.line_width}
              onSelectTab={(tab) => {
                if (tab === 'reader') {
                  return
                }
                if (tab === 'overview') {
                  onOpenRecallLibrary(selectedDocument.id)
                  return
                }
                if (tab === 'notes') {
                  onOpenRecallNotes(selectedDocument.id, activeReaderNote?.id ?? notes[0]?.id ?? null)
                  return
                }
                if (tab === 'graph') {
                  onOpenRecallGraph(selectedDocument.id)
                  return
                }
                onOpenRecallStudy(selectedDocument.id)
              }}
            />
          ) : null}
          {selectedDocument ? (
            <section
              className={`reader-card reader-reading-stage${
                readerOriginalParityMode ? ' reader-reading-stage-original-parity' : ''
              }`}
              style={readerStageStyle}
            >
              {readerStageMetadata.length ? (
                <div
                  className={`reader-stage-shell${readerOriginalParityMode ? ' reader-stage-shell-original-parity' : ''}${
                    readerSupportExpanded ? ' reader-stage-shell-expanded' : ' reader-stage-shell-compact'
                  }`}
                >
                  <div className={`reader-stage-context${readerOriginalParityMode ? ' reader-stage-context-original-parity' : ''}`}>
                    <div
                      className={`reader-stage-support-row${
                        readerOriginalParityMode ? ' reader-stage-support-row-original-parity' : ''
                      }`}
                    >
                      <div
                        className={`reader-meta-row reader-stage-glance-meta${
                          readerOriginalParityMode ? ' reader-stage-glance-meta-original-parity' : ''
                        }`}
                        role="list"
                        aria-label="Reader metadata"
                      >
                        {readerStageMetadata.map((item) => (
                          <span key={item} className="status-chip reader-meta-chip" role="listitem">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div
                className={`reader-stage-control-ribbon${
                  readerOriginalParityMode ? ' reader-stage-control-ribbon-original-parity' : ''
                }${readerSupportExpanded ? ' reader-stage-control-ribbon-expanded' : ' reader-stage-control-ribbon-compact'}`}
              >
                <div
                  aria-label="Reader views"
                  className={`reader-stage-mode-strip${readerOriginalParityMode ? ' reader-stage-mode-strip-original-parity' : ''}`}
                >
                  <div className="recall-stage-tabs recall-stage-tabs-compact" aria-label="Reader views" role="tablist">
                    {visibleViewModeOptions.map((option) => (
                      <button
                        key={option.mode}
                        aria-selected={activeMode === option.mode}
                        className={activeMode === option.mode ? 'recall-stage-tab recall-stage-tab-active' : 'recall-stage-tab'}
                        role="tab"
                        type="button"
                        onClick={() => handleSetActiveMode(option.mode)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  aria-label="Read aloud controls"
                  className={`reader-stage-transport-strip${
                    readerOriginalParityMode ? ' reader-stage-transport-strip-original-parity' : ''
                  }`}
                >
                  {readerTransportExpanded ? (
                    <span className="status-chip reader-meta-chip reader-stage-progress-chip">{currentSentenceLabel}</span>
                  ) : null}
                  <div
                    className={`reader-stage-transport-tools${
                      readerSupportExpanded ? '' : ' reader-stage-transport-tools-inline-support'
                    }`}
                  >
                    <div className="transport-bar" aria-label="Read aloud transport" role="toolbar">
                      {readerTransportExpanded ? (
                        <button
                          aria-label="Previous sentence"
                          className="transport-button"
                          disabled={!canUseSpeechTransport}
                          title="Previous sentence"
                          type="button"
                          onClick={handleTransportPrevious}
                        >
                          <PreviousIcon />
                        </button>
                      ) : null}
                      <button
                        aria-label={transportAction.ariaLabel}
                        className={`transport-button transport-button-primary${
                          readerTransportExpanded ? '' : ' transport-button-primary-labeled'
                        }${transportAction.active ? ' transport-button-active' : ''}`}
                        disabled={!canUseSpeechTransport}
                        title={transportAction.title}
                        type="button"
                        onClick={transportAction.onClick}
                      >
                        {transportAction.icon}
                        {!readerTransportExpanded ? <span className="transport-button-label">Read aloud</span> : null}
                      </button>
                      {readerTransportExpanded ? (
                        <button
                          aria-label="Next sentence"
                          className="transport-button"
                          disabled={!canUseSpeechTransport}
                          title="Next sentence"
                          type="button"
                          onClick={handleTransportNext}
                        >
                          <NextIcon />
                        </button>
                      ) : null}
                      {readerTransportExpanded ? (
                        <button
                          aria-label="Stop read aloud"
                          className="transport-button transport-button-quiet"
                          disabled={!canUseSpeechTransport || (!speech.isSpeaking && !speech.isPaused)}
                          title="Stop read aloud"
                          type="button"
                          onClick={handleTransportStop}
                        >
                          <StopIcon />
                        </button>
                      ) : null}
                    </div>
                    <div className="reader-stage-overflow">
                      <ControlsOverflow
                        actions={readerOverflowActions}
                        contrastTheme={settings.contrast_theme}
                        preferredVoice={settings.preferred_voice}
                        speechRate={settings.speech_rate}
                        voiceChoices={speech.voiceChoices}
                        onContrastThemeChange={(nextTheme) =>
                          onSettingsChange((currentSettings) => ({
                            ...currentSettings,
                            contrast_theme: nextTheme,
                          }))
                        }
                        onPreferredVoiceChange={(nextVoice) =>
                          onSettingsChange((currentSettings) => ({
                            ...currentSettings,
                            preferred_voice: nextVoice,
                          }))
                        }
                        onSpeechRateChange={(nextRate) =>
                          onSettingsChange((currentSettings) => ({
                            ...currentSettings,
                            speech_rate: nextRate,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`reader-reading-deck-layout${
                  readerOriginalParityMode ? ' reader-reading-deck-layout-original-parity' : ''
                }${readerSupportExpanded ? ' reader-reading-deck-layout-expanded' : ' reader-reading-deck-layout-compact'}`}
              >
                <div
                  className={`reader-document-shell reader-reading-lane${
                    readerOriginalParityMode ? ' reader-document-shell-original-parity' : ''
                  }`}
                >
                  {showReaderDerivedContext ? (
                    <section
                      aria-label={`${readerViewLabel} context`}
                      className={`reader-derived-context${showReaderGeneratedState ? ' reader-derived-context-has-generated-state' : ''}${
                        showReaderDerivedActionColumn ? '' : ' reader-derived-context-no-actions'
                      }`}
                    >
                      <div className="reader-derived-context-copy">
                        <div
                          className={`reader-derived-context-header-row${
                            showReaderSummaryDetailControls ? ' reader-derived-context-header-row-with-detail' : ''
                          }`}
                        >
                          <div className="reader-derived-context-heading">
                            <div className="reader-derived-context-title-row">
                              <h3>{readerDerivedContextLabel}</h3>
                              {readerSourceTypeLabel ? (
                                <span className="reader-derived-context-note">From {readerSourceTypeLabel.toLowerCase()} source</span>
                              ) : null}
                            </div>
                            {showReaderDerivedContextSummary ? <p>{readerDerivedContextSummary}</p> : null}
                          </div>
                          {showReaderSummaryDetailControls ? (
                            <div className="reader-derived-detail-shell reader-derived-detail-shell-inline">
                              <div
                                aria-label="Summary detail"
                                className="reader-derived-detail-controls"
                                role="group"
                              >
                                {(['short', 'balanced', 'detailed'] as SummaryDetail[]).map((detail) => (
                                  <button
                                    key={detail}
                                    aria-pressed={summaryDetail === detail}
                                    className={
                                      summaryDetail === detail
                                        ? 'reader-derived-detail-button reader-derived-detail-button-active'
                                        : 'reader-derived-detail-button'
                                    }
                                    type="button"
                                    onClick={() => setSummaryDetail(detail)}
                                  >
                                    {formatSummaryDetailLabel(detail)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                        {readerDerivedMetadata.length > 0 ? (
                          <div className="reader-meta-row reader-derived-context-meta" role="list" aria-label={`${readerViewLabel} provenance`}>
                            {readerDerivedMetadata.map((item) => (
                              <span key={item} className="status-chip reader-meta-chip" role="listitem">
                                {item}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        {showReaderGeneratedState ? (
                          <div
                            aria-label={`${readerViewLabel} empty state`}
                            className={`reader-generated-empty-state reader-generated-empty-state-inline${
                              generatedViewLoadError ? ' reader-generated-empty-state-error' : ''
                            }`}
                            role={generatedViewLoadError ? 'alert' : 'status'}
                          >
                            <div className="reader-generated-empty-state-copy">
                              <h4>{generatedViewLoadError ? `${readerViewLabel} is temporarily unavailable` : readerGeneratedEmptyStateTitle}</h4>
                              <p>{generatedViewLoadError ? viewError : readerGeneratedEmptyStateDescription}</p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                      {showReaderDerivedActionColumn ? (
                        <div className="reader-derived-context-actions">
                          {showReaderGenerationAction && !generatedViewLoadError ? (
                            <button disabled={transformBusy} type="button" onClick={() => handleGenerate(activeMode)}>
                              {transformBusy ? 'Working…' : `Create ${readerViewLabel}`}
                            </button>
                          ) : null}
                          {generatedViewLoadError ? (
                            <button className="ghost-button" type="button" onClick={handleRetryReaderLoading}>
                              Retry loading
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </section>
                  ) : null}
                  {viewLoading ? <p className="placeholder">Loading view…</p> : null}
                  {view ? (
                    <div className={`reader-article-shell${readerOriginalParityMode ? ' reader-article-shell-original-parity' : ''}`}>
                      <div
                        className={`reader-article-field${
                          readerOriginalParityMode ? ' reader-article-field-original-parity' : ''
                        }${readerShortDocumentLayout ? ' reader-article-field-short-document' : ''}`}
                      >
                        <ReaderSurface
                          accessibleLabel={selectedDocument.title}
                          blocks={renderBlocks}
                          activeSentenceIndex={speech.currentSentenceIndex}
                          anchoredSentenceIndexes={anchoredSentenceIndexes}
                          notedSentenceIndexes={noteHighlightIndexes}
                          selectedSentenceIndexes={selectedSentenceIndexes}
                          settings={settings}
                          onSelectSentence={handleSelectSentence}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                {readerSupportExpanded ? (
                  <section
                    className={`card reader-support-dock stack-gap priority-surface-support-rail priority-surface-support-rail-quiet${
                      readerOriginalParityMode ? ' reader-support-dock-original-parity' : ''
                    } reader-support-dock-expanded`}
                  >
                  <div className="reader-support-dock-header">
                    <div className="reader-support-dock-toolbar">
                      <div className="recall-stage-tabs reader-support-tabs" aria-label="Reader context" role="tablist">
                        <button
                          aria-label="Source"
                          aria-selected={readerContextTab === 'source'}
                          className={readerContextTab === 'source' ? 'recall-stage-tab recall-stage-tab-active' : 'recall-stage-tab'}
                          role="tab"
                          type="button"
                          onClick={() => handleReaderSupportTab('source')}
                        >
                          <SupportSourceIcon />
                          <span className="reader-support-tab-label">Source</span>
                        </button>
                        <button
                          aria-label="Notebook"
                          aria-selected={readerContextTab === 'notes'}
                          className={readerContextTab === 'notes' ? 'recall-stage-tab recall-stage-tab-active' : 'recall-stage-tab'}
                          role="tab"
                          type="button"
                          onClick={() => handleReaderSupportTab('notes')}
                        >
                          <SupportNotebookIcon />
                          <span className="reader-support-tab-label">Notebook</span>
                        </button>
                      </div>
                      {!readerSupportLockedOpen ? (
                        <button
                          className="ghost-button reader-support-toggle"
                          type="button"
                          onClick={() => setReaderSupportExpanded(false)}
                        >
                          Hide
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {readerContextTab === 'source' ? (
                    <div
                      className={`reader-support-pane reader-support-pane-source stack-gap${
                        readerOriginalParityMode ? ' reader-support-pane-source-original-parity' : ''
                      }`}
                    >
                      <div className="reader-support-library-shell stack-gap">
                        <LibraryPane
                          activeDocumentId={activeDocumentId}
                          deletingDocumentId={deletingDocumentId}
                          documents={documents}
                          embedded
                          errorMessage={libraryErrorMessage}
                          hasAnyDocuments={documents.length > 0 || Boolean(activeDocument)}
                          open={libraryOpen}
                          loading={documentsLoading}
                          searchLabel="Search saved sources"
                          searchPlaceholder="Search saved sources"
                          searchValue={search}
                          showHeader={false}
                          showSearchLabel={false}
                          showToggle={false}
                          title="Source library"
                          onDelete={handleDeleteDocument}
                          onSearchChange={setSearch}
                          onSelect={(document) => {
                            speech.stop()
                            setRouteAnchorRange(null)
                            resetNoteComposer()
                            startTransition(() => {
                              setActiveDocument(document)
                              setActiveDocumentId(document.id)
                              setActiveMode('reflowed')
                            })
                          }}
                          onToggleOpen={() => setLibraryOpen((current) => !current)}
                        />
                      </div>
                    </div>
                  ) : (
                    <section
                      className={`reader-support-pane reader-support-pane-notes stack-gap reader-notes-panel${
                        readerOriginalParityMode ? ' reader-support-pane-notes-original-parity' : ''
                      }`}
                    >
              <div className="toolbar">
                <div className="section-header section-header-compact">
                  <h3>Notebook</h3>
                  <p>{notesPanelSummary}</p>
                </div>
                {selectedDocument ? (
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => onOpenRecallNotes(selectedDocument.id, activeReaderNote?.id ?? notes[0]?.id ?? null)}
                  >
                    Open in Notebook
                  </button>
                ) : null}
              </div>

              {!canAnnotateCurrentView && selectedDocument ? (
                <p className="small-note">Switch back to Reflowed to capture new notes or jump to anchored highlights in place.</p>
              ) : null}

              {canAnnotateCurrentView ? (
                <div className="reader-note-status">
                  {notesLoading ? <p className="small-note">Loading notebook…</p> : null}
                  {!notesLoading && notesStatus === 'error' ? (
                    <div className="inline-actions">
                      <p className="small-note">{notesError}</p>
                      <button className="ghost-button" type="button" onClick={handleRetryNotesLoading}>
                        Retry notes
                      </button>
                    </div>
                  ) : null}
                  {!notesLoading && notesStatus !== 'error' && noteMessage ? <p className="small-note">{noteMessage}</p> : null}
                  {!notesLoading && notesStatus === 'success' && !notes.length ? (
                    <p className="small-note">Add a note to keep a local, source-linked highlight in this reflowed view.</p>
                  ) : null}
                </div>
              ) : null}

              {noteCaptureActive ? (
                <section className="reader-note-composer stack-gap" aria-label="Note capture">
                  <div className="section-header section-header-compact">
                    <h3>Capture note</h3>
                    <p>Click one sentence to start, then click another sentence in the same block to extend the highlight.</p>
                  </div>
                  {noteSelection ? (
                    <>
                      <div className="reader-note-preview">
                        <strong>Highlighted passage</strong>
                        <p>{noteSelection.anchorText}</p>
                        <span>{noteSelection.excerptText}</span>
                      </div>
                      <label className="field">
                        <span>Optional note</span>
                        <textarea
                          placeholder="Add a short reminder, question, or takeaway"
                          value={noteDraftBody}
                          onChange={(event) => setNoteDraftBody(event.target.value)}
                        />
                      </label>
                      <div className="inline-actions">
                        <button disabled={noteSaveDisabled} type="button" onClick={handleSaveNote}>
                          {noteSaveBusy ? 'Saving…' : 'Save note'}
                        </button>
                        <button className="ghost-button" type="button" onClick={handleCancelNoteCapture}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="small-note">Select a sentence in the reading surface to start the note anchor.</p>
                  )}
                </section>
              ) : null}

              {visibleSavedNoteItems.length ? (
                <div aria-label={savedNotesListLabel} className="reader-saved-notes" role="list">
                  {visibleSavedNoteItems.map(({ note, secondaryText }) => (
                    <button
                      key={note.id}
                      aria-pressed={activeReaderNote?.id === note.id}
                      className={
                        activeReaderNote?.id === note.id
                          ? 'reader-saved-note reader-saved-note-active'
                          : 'reader-saved-note'
                      }
                      type="button"
                      onClick={() => handleOpenSavedNote(note)}
                    >
                      <strong>{note.anchor.anchor_text}</strong>
                      {secondaryText ? <span className="reader-saved-note-secondary">{secondaryText}</span> : null}
                    </button>
                  ))}
                  </div>
                ) : null}

                    {!noteCaptureActive && activeReaderNote ? (
                      <section className="reader-note-workbench stack-gap" aria-label="Selected note">
                        <div className="reader-note-workbench-toolbar">
                          <div className="recall-actions recall-actions-inline">
                            <button
                              disabled={selectedReaderNoteSaveDisabled}
                              type="button"
                              onClick={handleSaveSelectedNoteChanges}
                            >
                              {noteBusyKey === `save:${activeReaderNote.id}` ? 'Saving…' : 'Save changes'}
                            </button>
                            <button
                              className="ghost-button"
                              disabled={noteBusyKey === `delete:${activeReaderNote.id}`}
                              type="button"
                              onClick={handleDeleteSelectedNote}
                            >
                              {noteBusyKey === `delete:${activeReaderNote.id}` ? 'Deleting…' : 'Delete'}
                            </button>
                          </div>
                        </div>

                        <div className="recall-note-preview reader-note-anchor-preview" aria-label="Selected note anchor">
                          {activeReaderNoteSentenceSpanLabel ? (
                            <span className="reader-note-preview-meta">{activeReaderNoteSentenceSpanLabel}</span>
                          ) : null}
                          <p>{activeReaderNote.anchor.anchor_text}</p>
                          <span>{activeReaderNote.anchor.excerpt_text}</span>
                        </div>

                        <label className="field">
                          <span>Note text</span>
                          <textarea
                            placeholder="Add context, a reminder, or a follow-up question"
                            value={selectedReaderNoteDraftBody}
                            onChange={(event) => setSelectedReaderNoteDraftBody(event.target.value)}
                          />
                        </label>

                        <div className="recall-detail-panel stack-gap recall-note-promotion-card">
                          <div className="section-header section-header-compact">
                            <h3>Promote note</h3>
                            <p>Turn this note into graph or study knowledge while the source stays in view.</p>
                          </div>
                          <div className="recall-actions recall-actions-inline">
                            <button
                              className="ghost-button"
                              disabled={noteBusyKey === `graph:${activeReaderNote.id}`}
                              type="button"
                              onClick={() => setNotePromotionMode('graph')}
                            >
                              Promote to Graph
                            </button>
                            <button
                              className="ghost-button"
                              disabled={noteBusyKey === `study:${activeReaderNote.id}`}
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
                                disabled={noteBusyKey === `graph:${activeReaderNote.id}`}
                                type="button"
                                onClick={handlePromoteSelectedNoteToGraph}
                              >
                                {noteBusyKey === `graph:${activeReaderNote.id}` ? 'Promoting…' : 'Promote node'}
                              </button>
                              <button className="ghost-button" type="button" onClick={() => setNotePromotionMode(null)}>
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
                                disabled={noteBusyKey === `study:${activeReaderNote.id}`}
                                type="button"
                                onClick={handlePromoteSelectedNoteToStudyCard}
                              >
                                {noteBusyKey === `study:${activeReaderNote.id}` ? 'Creating…' : 'Create card'}
                              </button>
                              <button className="ghost-button" type="button" onClick={() => setNotePromotionMode(null)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </section>
                    ) : null}
                  </section>
                )}
                  </section>
                ) : null}
              </div>
            </section>
          ) : (
            <section className="card empty-state-card reader-empty-stage stack-gap">
              <div className="toolbar">
                <div className="section-header">
                  <p className="eyebrow">{showUnavailableEmptyState ? 'Local service unavailable' : 'Ready when you are'}</p>
                  <h2>{emptyStateTitle}</h2>
                  <p>{emptyStateDescription}</p>
                </div>
                <button
                  aria-controls="theme-panel"
                  aria-expanded={themePanelOpen}
                  className="ghost-button app-toolbar-button"
                  type="button"
                  onClick={() => setThemePanelOpen((current) => !current)}
                >
                  <ThemeIcon />
                  <span>Theme</span>
                </button>
              </div>
              {showUnavailableEmptyState ? (
                <>
                  <div className="inline-actions">
                    <button className="ghost-button" type="button" onClick={handleRetryReaderLoading}>
                      Retry loading
                    </button>
                    <button type="button" onClick={onRequestNewSource}>
                      Add source
                    </button>
                  </div>
                  <p className="small-note">
                    The Add action in the shell still works for local text, files, and public article links while Reader reconnects.
                  </p>
                </>
              ) : (
                <div className="empty-state-steps" role="list" aria-label="How to begin">
                  <div className="empty-state-step" role="listitem">
                    <strong>1. Add or reopen something</strong>
                    <span>Use Add for fresh sources, or reopen something from Home.</span>
                  </div>
                  <div className="empty-state-step" role="listitem">
                    <strong>2. Read in calmer view</strong>
                    <span>Reflowed opens first so spacing and line breaks stay easier to scan.</span>
                  </div>
                  <div className="empty-state-step" role="listitem">
                    <strong>3. Keep context docked nearby</strong>
                    <span>Use Search, Notebook, and Source context without leaving the reading lane.</span>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
      <ThemePanel
        key={`theme-${themePanelOpen ? 'open' : 'closed'}-${activeDocumentId ?? 'empty'}`}
        open={themePanelOpen}
        settings={settings}
        onClose={() => setThemePanelOpen(false)}
        onChange={onSettingsChange}
      />
    </div>
  )
}
