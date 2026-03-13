import { startTransition, useDeferredValue, useEffect, useState, type CSSProperties, type ReactNode } from 'react'

import {
  deleteDocumentRecord,
  fetchDocumentView,
  fetchDocuments,
  fetchHealth,
  fetchSettings,
  generateDocumentView,
  importFileDocument,
  importTextDocument,
  importUrlDocument,
  saveProgress,
  saveSettings,
} from './api'
import { ControlsOverflow } from './components/ControlsOverflow'
import { ImportPanel } from './components/ImportPanel'
import { LibraryPane } from './components/LibraryPane'
import { ReaderSurface } from './components/ReaderSurface'
import { SettingsPanel } from './components/SettingsPanel'
import { useSpeech } from './hooks/useSpeech'
import { loadReaderSession, resolveReaderSession, saveReaderSession } from './lib/readerSession'
import { buildRenderableBlocks } from './lib/segment'
import type {
  DocumentRecord,
  DocumentView,
  HealthResponse,
  ReaderSettings,
  SummaryDetail,
  ViewMode,
} from './types'

const defaultSettings: ReaderSettings = {
  font_preset: 'system',
  text_size: 22,
  line_spacing: 1.7,
  line_width: 72,
  contrast_theme: 'soft',
  focus_mode: false,
  preferred_voice: 'default',
  speech_rate: 1,
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

function fontPresetToStack(fontPreset: ReaderSettings['font_preset']) {
  if (fontPreset === 'atkinson') {
    return '"Atkinson Hyperlegible Next", "Atkinson Hyperlegible", "Trebuchet MS", "Segoe UI", sans-serif'
  }
  if (fontPreset === 'comic') {
    return '"Comic Sans MS", "Trebuchet MS", "Segoe UI", sans-serif'
  }
  return '"Atkinson Hyperlegible Next", "Atkinson Hyperlegible", "Segoe UI", "Verdana", sans-serif'
}

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

function SettingsIcon() {
  return (
    <TransportIcon>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2.8v2.1" />
      <path d="M12 19.1v2.1" />
      <path d="m4.9 4.9 1.5 1.5" />
      <path d="m17.6 17.6 1.5 1.5" />
      <path d="M2.8 12h2.1" />
      <path d="M19.1 12h2.1" />
      <path d="m4.9 19.1 1.5-1.5" />
      <path d="m17.6 6.4 1.5-1.5" />
    </TransportIcon>
  )
}

export default function App() {
  const [initialSession] = useState(() => loadReaderSession())
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [activeDocument, setActiveDocument] = useState<DocumentRecord | null>(null)
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [settings, setSettings] = useState<ReaderSettings>(defaultSettings)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [search, setSearch] = useState('')
  const [documentsLoading, setDocumentsLoading] = useState(true)
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(() => initialSession.documentId)
  const [activeMode, setActiveMode] = useState<ViewMode>(() => initialSession.mode)
  const [summaryDetail, setSummaryDetail] = useState<SummaryDetail>(() => initialSession.summaryDetail)
  const [view, setView] = useState<DocumentView | null>(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewError, setViewError] = useState<string | null>(null)
  const [importBusy, setImportBusy] = useState(false)
  const [transformBusy, setTransformBusy] = useState(false)
  const [importPanelOpen, setImportPanelOpen] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(() => !initialSession.documentId)
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const deferredSearch = useDeferredValue(search)

  async function loadDocuments(
    nextQuery = deferredSearch,
    preferredDocumentId?: string | null,
    preferredMode = activeMode,
  ) {
    setDocumentsLoading(true)
    try {
      const loadedDocuments = await fetchDocuments(nextQuery)
      setDocuments(loadedDocuments)
      const nextDocumentId =
        preferredDocumentId !== undefined ? preferredDocumentId : activeDocument?.id ?? null
      const nextSession = resolveReaderSession(loadedDocuments, {
        documentId: nextDocumentId,
        mode: preferredMode,
        summaryDetail,
      }, {
        currentDocument: preferredDocumentId === null ? null : activeDocument,
        preserveCurrentWhenFiltered: nextQuery.trim().length > 0,
      })
      const shouldAutoCollapseLibrary =
        nextQuery.trim().length === 0 &&
        Boolean(nextSession.document) &&
        (activeDocument === null || preferredDocumentId !== activeDocument.id)
      startTransition(() => {
        setActiveDocument(nextSession.document)
        setActiveDocumentId(nextSession.documentId)
        setActiveMode(nextSession.mode)
        if (shouldAutoCollapseLibrary) {
          setLibraryOpen(false)
        }
      })
    } catch (error) {
      setViewError(error instanceof Error ? error.message : 'Could not load documents.')
    } finally {
      setDocumentsLoading(false)
    }
  }

  useEffect(() => {
    void fetchHealth().then(setHealth).catch(() => setHealth(null))
    void fetchSettings()
      .then((loadedSettings) => {
        setSettings(loadedSettings)
        setSettingsLoaded(true)
      })
      .catch(() => {
        setSettingsLoaded(true)
      })
  }, [])

  useEffect(() => {
    void loadDocuments(deferredSearch, activeDocumentId, activeMode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredSearch])

  useEffect(() => {
    if (!settingsLoaded) {
      return
    }
    const timeout = window.setTimeout(() => {
      void saveSettings(settings).catch(() => undefined)
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [settings, settingsLoaded])

  useEffect(() => {
    if (documentsLoading) {
      return
    }

    if (!activeDocumentId) {
      setView(null)
      setViewError(null)
      return
    }

    let active = true
    setViewLoading(true)
    setViewError(null)
    void fetchDocumentView(activeDocumentId, activeMode, summaryDetail)
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
  }, [activeDocumentId, activeMode, documentsLoading, summaryDetail])

  const selectedDocument = activeDocument
  const initialSentenceIndex = selectedDocument?.progress_by_mode[activeMode] ?? 0
  const { blocks: renderBlocks, flatSentences } = buildRenderableBlocks(view)
  const currentModeOption = viewModeOptions.find((option) => option.mode === activeMode)

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
    const element = document.querySelector<HTMLElement>(
      `[data-sentence-index="${speech.currentSentenceIndex}"]`,
    )
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [speech.currentSentenceIndex, view])

  useEffect(() => {
    if (!activeDocumentId) {
      return
    }
    const timeout = window.setTimeout(() => {
      void saveProgress(activeDocumentId, activeMode, speech.currentSentenceIndex).catch(() => undefined)
    }, 250)
    return () => window.clearTimeout(timeout)
  }, [activeDocumentId, activeMode, speech.currentSentenceIndex])

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
      const target = event.target as HTMLElement | null
      if (
        target &&
        (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName) ||
          target.isContentEditable ||
          Boolean(target.closest('[data-reader-sentence="true"]')))
      ) {
        return
      }
      if (event.key === ' ') {
        event.preventDefault()
        if (speech.isSpeaking && !speech.isPaused) {
          speech.pause()
        } else if (speech.isPaused) {
          speech.resume()
        } else {
          speech.start()
        }
      }
      if (event.altKey && event.key === 'ArrowRight') {
        event.preventDefault()
        speech.next()
      }
      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault()
        speech.previous()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [speech])

  async function handleImportText(title: string, text: string) {
    setImportBusy(true)
    setViewError(null)
    try {
      const importedDocument = await importTextDocument(text, title || undefined)
      setActiveDocument(importedDocument)
      await loadDocuments('', importedDocument.id, 'reflowed')
      startTransition(() => {
        setSearch('')
        setActiveMode('reflowed')
      })
      setImportPanelOpen(false)
    } catch (error) {
      setViewError(error instanceof Error ? error.message : 'Could not import pasted text.')
    } finally {
      setImportBusy(false)
    }
  }

  async function handleImportFile(file: File) {
    setImportBusy(true)
    setViewError(null)
    try {
      const importedDocument = await importFileDocument(file)
      setActiveDocument(importedDocument)
      await loadDocuments('', importedDocument.id, 'reflowed')
      startTransition(() => {
        setSearch('')
        setActiveMode('reflowed')
      })
      setImportPanelOpen(false)
    } catch (error) {
      setViewError(error instanceof Error ? error.message : 'Could not import that file.')
    } finally {
      setImportBusy(false)
    }
  }

  async function handleImportUrl(url: string) {
    setImportBusy(true)
    setViewError(null)
    try {
      const importedDocument = await importUrlDocument(url)
      setActiveDocument(importedDocument)
      await loadDocuments('', importedDocument.id, 'reflowed')
      startTransition(() => {
        setSearch('')
        setActiveMode('reflowed')
      })
      setImportPanelOpen(false)
    } catch (error) {
      setViewError(error instanceof Error ? error.message : 'Could not import that webpage.')
    } finally {
      setImportBusy(false)
    }
  }

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

  function handleSetActiveMode(nextMode: ViewMode) {
    speech.stop()
    startTransition(() => {
      setActiveMode(nextMode)
    })
  }

  const appStyle = {
    ['--app-font-family' as string]: fontPresetToStack(settings.font_preset),
  } as CSSProperties
  const hasActiveDocument = Boolean(selectedDocument)
  const importPanelCollapsed = hasActiveDocument && !importPanelOpen
  const canUseSpeechTransport = speech.isSupported && flatSentences.length > 0
  const currentSentenceLabel = `Sentence ${flatSentences.length === 0 ? 0 : speech.currentSentenceIndex + 1} of ${flatSentences.length}`
  const readerTitleId = 'reader-document-title'
  const transportAction =
    speech.isSpeaking && !speech.isPaused
      ? {
          active: true,
          ariaLabel: 'Pause read aloud',
          icon: <PauseIcon />,
          onClick: speech.pause,
          title: 'Pause read aloud',
        }
      : speech.isPaused
        ? {
            active: true,
            ariaLabel: 'Resume read aloud',
            icon: <PlayIcon />,
            onClick: speech.resume,
            title: 'Resume read aloud',
          }
        : {
            active: false,
            ariaLabel: 'Start read aloud',
            icon: <PlayIcon />,
            onClick: () => speech.start(),
            title: 'Start read aloud',
          }
  const readerViewLabel = currentModeOption?.label ?? activeMode
  const readerMetadata = [
    readerViewLabel,
    view?.generated_by === 'openai' ? 'AI generated' : null,
    view?.cached ? 'Cached' : null,
  ].filter(Boolean)
  const emptyStateTitle = documentsLoading
    ? 'Loading your reading space'
    : 'Add something to start reading'
  const emptyStateDescription = documentsLoading
    ? 'Your local library is loading. Reading controls appear after a document opens.'
    : 'Paste text, choose a file, or import a public article link on the left. Reading controls appear here after a document opens.'

  useEffect(() => {
    setLibraryOpen(!hasActiveDocument)
  }, [hasActiveDocument])

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

  return (
    <div
      className={`app-shell ${settings.contrast_theme === 'high' ? 'theme-high' : 'theme-soft'} ${
        settings.focus_mode ? 'focus-mode' : ''
      }`}
      style={appStyle}
    >
      <aside className="sidebar">
        <div className="sidebar-inner">
          <header className="page-header page-header-compact brand-card">
            <h1>Accessible Reader</h1>
            <p>Read clearly. Keep your place.</p>
          </header>
          <ImportPanel
            busy={importBusy}
            collapsed={importPanelCollapsed}
            onToggleCollapsed={
              hasActiveDocument
                ? () => {
                    setImportPanelOpen((current) => !current)
                  }
                : undefined
            }
            onImportFile={handleImportFile}
            onImportText={handleImportText}
            onImportUrl={handleImportUrl}
          />
          <LibraryPane
            activeDocumentId={activeDocumentId}
            deletingDocumentId={deletingDocumentId}
            documents={documents}
            hasAnyDocuments={documents.length > 0 || Boolean(activeDocument)}
            open={libraryOpen}
            loading={documentsLoading}
            searchValue={search}
            onDelete={handleDeleteDocument}
            onSearchChange={setSearch}
            onSelect={(document) => {
              speech.stop()
              setImportPanelOpen(false)
              startTransition(() => {
                setActiveDocument(document)
                setActiveDocumentId(document.id)
                setActiveMode('reflowed')
              })
            }}
            onToggleOpen={() => setLibraryOpen((current) => !current)}
          />
          {hasActiveDocument ? (
            <p className="sidebar-footnote">
              {health?.openai_configured
                ? 'AI ready for Simplify and Summary.'
                : 'Simplify and Summary need OPENAI_API_KEY.'}
            </p>
          ) : null}
        </div>
      </aside>

      <main className="main-panel">
        {!selectedDocument ? (
          <div className="app-toolbar">
            <button
              aria-controls="settings-drawer"
              aria-expanded={settingsOpen}
              className="ghost-button app-toolbar-button"
              type="button"
              onClick={() => setSettingsOpen((current) => !current)}
            >
              <SettingsIcon />
              <span>Settings</span>
            </button>
          </div>
        ) : null}
        {viewError ? <p className="inline-error">{viewError}</p> : null}
        {selectedDocument ? (
          <>
            <section className="sticky-transport-shell" aria-label="Read aloud controls">
              <div className="card sticky-transport-bar">
                <span className="sticky-transport-label">Read aloud</span>
                <div className="transport-bar" aria-label="Read aloud transport" role="toolbar">
                  <button
                    aria-label="Previous sentence"
                    className="transport-button"
                    disabled={!canUseSpeechTransport}
                    title="Previous sentence"
                    type="button"
                    onClick={speech.previous}
                  >
                    <PreviousIcon />
                  </button>
                  <button
                    aria-label={transportAction.ariaLabel}
                    className={`transport-button transport-button-primary ${
                      transportAction.active ? 'transport-button-active' : ''
                    }`}
                    disabled={!canUseSpeechTransport}
                    title={transportAction.title}
                    type="button"
                    onClick={transportAction.onClick}
                  >
                    {transportAction.icon}
                  </button>
                  <button
                    aria-label="Next sentence"
                    className="transport-button"
                    disabled={!canUseSpeechTransport}
                    title="Next sentence"
                    type="button"
                    onClick={speech.next}
                  >
                    <NextIcon />
                  </button>
                  <button
                    aria-label="Stop read aloud"
                    className="transport-button transport-button-quiet"
                    disabled={!canUseSpeechTransport || (!speech.isSpeaking && !speech.isPaused)}
                    title="Stop read aloud"
                    type="button"
                    onClick={speech.stop}
                  >
                    <StopIcon />
                  </button>
                </div>
                <div className="sticky-transport-actions">
                  <button
                    aria-controls="settings-drawer"
                    aria-expanded={settingsOpen}
                    className="ghost-button app-toolbar-button sticky-settings-button"
                    type="button"
                    onClick={() => setSettingsOpen((current) => !current)}
                  >
                    <SettingsIcon />
                    <span>Settings</span>
                  </button>
                  <ControlsOverflow
                    currentSentenceLabel={currentSentenceLabel}
                    preferredVoice={settings.preferred_voice}
                    speechRate={settings.speech_rate}
                    voiceChoices={speech.voiceChoices}
                    onPreferredVoiceChange={(nextVoice) =>
                      setSettings((currentSettings) => ({
                        ...currentSettings,
                        preferred_voice: nextVoice,
                      }))
                    }
                    onSpeechRateChange={(nextRate) =>
                      setSettings((currentSettings) => ({
                        ...currentSettings,
                        speech_rate: nextRate,
                      }))
                    }
                  />
                </div>
              </div>
            </section>

            <section className="card reader-card">
              <header className="reader-toolbar">
                <div className="reader-toolbar-main">
                  <h2 id={readerTitleId}>{selectedDocument.title}</h2>
                  <div className="reader-meta-row" role="list" aria-label="Reader metadata">
                    {readerMetadata.map((item) => (
                      <span key={item} className="status-chip reader-meta-chip" role="listitem">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                {(activeMode === 'simplified' || activeMode === 'summary') && !view ? (
                  <button disabled={transformBusy} type="button" onClick={() => handleGenerate(activeMode)}>
                    {transformBusy ? 'Working…' : `Create ${activeMode}`}
                  </button>
                ) : null}
              </header>

              {viewLoading ? <p className="placeholder">Loading view…</p> : null}
              {selectedDocument && !view && !viewLoading && (activeMode === 'simplified' || activeMode === 'summary') ? (
                <p className="placeholder placeholder-inline">
                  {activeMode === 'simplified'
                    ? 'No simplified view yet. Create simplified when you want it.'
                    : 'No summary yet. Create summary when you want it.'}
                </p>
              ) : null}
              {view ? (
                <ReaderSurface
                  labelledBy={readerTitleId}
                  blocks={renderBlocks}
                  activeSentenceIndex={speech.currentSentenceIndex}
                  settings={settings}
                  onSelectSentence={speech.jumpTo}
                />
              ) : null}
            </section>
          </>
        ) : (
          <section className="card empty-state-card stack-gap">
            <div className="section-header">
              <p className="eyebrow">Ready when you are</p>
              <h2>{emptyStateTitle}</h2>
              <p>{emptyStateDescription}</p>
            </div>
            <div className="empty-state-steps" role="list" aria-label="How to begin">
              <div className="empty-state-step" role="listitem">
                <strong>1. Add or reopen something</strong>
                <span>Paste text, choose a file, import a public article link, or reopen a saved document from the library.</span>
              </div>
              <div className="empty-state-step" role="listitem">
                <strong>2. Read in calmer view</strong>
                <span>Reflowed opens first so spacing and line breaks stay easier to scan.</span>
              </div>
              <div className="empty-state-step" role="listitem">
                <strong>3. Open Settings only if needed</strong>
                <span>Theme and layout stay available from the Settings button.</span>
              </div>
            </div>
          </section>
        )}
      </main>
      <SettingsPanel
        key={`settings-${settingsOpen ? 'open' : 'closed'}-${activeDocumentId ?? 'empty'}`}
        activeMode={activeMode}
        hasDocument={hasActiveDocument}
        open={settingsOpen}
        settings={settings}
        summaryDetail={summaryDetail}
        onActiveModeChange={handleSetActiveMode}
        onClose={() => setSettingsOpen(false)}
        onChange={setSettings}
        onSummaryDetailChange={setSummaryDetail}
      />
    </div>
  )
}
