import { startTransition, useDeferredValue, useEffect, useState, type CSSProperties } from 'react'

import {
  fetchDocumentView,
  fetchDocuments,
  fetchHealth,
  fetchSettings,
  generateDocumentView,
  importFileDocument,
  importTextDocument,
  saveProgress,
  saveSettings,
} from './api'
import { ImportPanel } from './components/ImportPanel'
import { LibraryPane } from './components/LibraryPane'
import { ReaderSurface } from './components/ReaderSurface'
import { SettingsPanel } from './components/SettingsPanel'
import { useSpeech } from './hooks/useSpeech'
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

const viewModes: ViewMode[] = ['original', 'reflowed', 'simplified', 'summary']

function fontPresetToStack(fontPreset: ReaderSettings['font_preset']) {
  if (fontPreset === 'atkinson') {
    return '"Atkinson Hyperlegible", "Trebuchet MS", "Segoe UI", sans-serif'
  }
  if (fontPreset === 'comic') {
    return '"Comic Sans MS", "Trebuchet MS", "Segoe UI", sans-serif'
  }
  return '"Segoe UI", "Verdana", sans-serif'
}

export default function App() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [settings, setSettings] = useState<ReaderSettings>(defaultSettings)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [search, setSearch] = useState('')
  const [documentsLoading, setDocumentsLoading] = useState(true)
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)
  const [activeMode, setActiveMode] = useState<ViewMode>('reflowed')
  const [summaryDetail, setSummaryDetail] = useState<SummaryDetail>('balanced')
  const [view, setView] = useState<DocumentView | null>(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewError, setViewError] = useState<string | null>(null)
  const [importBusy, setImportBusy] = useState(false)
  const [transformBusy, setTransformBusy] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const deferredSearch = useDeferredValue(search)

  async function loadDocuments(nextQuery = deferredSearch, preferredDocumentId?: string | null) {
    setDocumentsLoading(true)
    try {
      const loadedDocuments = await fetchDocuments(nextQuery)
      setDocuments(loadedDocuments)
      const nextActive =
        preferredDocumentId && loadedDocuments.some((document) => document.id === preferredDocumentId)
          ? preferredDocumentId
          : loadedDocuments[0]?.id ?? null
      startTransition(() => {
        setActiveDocumentId(nextActive)
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
    void loadDocuments(deferredSearch, activeDocumentId)
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
  }, [activeDocumentId, activeMode, summaryDetail])

  const selectedDocument = documents.find((document) => document.id === activeDocumentId) ?? null
  const initialSentenceIndex = selectedDocument?.progress_by_mode[activeMode] ?? 0
  const { blocks: renderBlocks, flatSentences } = buildRenderableBlocks(view)

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
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
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
      await loadDocuments(deferredSearch, importedDocument.id)
      startTransition(() => {
        setActiveMode('reflowed')
      })
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
      await loadDocuments(deferredSearch, importedDocument.id)
      startTransition(() => {
        setActiveMode('reflowed')
      })
    } catch (error) {
      setViewError(error instanceof Error ? error.message : 'Could not import that file.')
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
    } catch (error) {
      setViewError(error instanceof Error ? error.message : `Could not generate ${mode}.`)
    } finally {
      setTransformBusy(false)
    }
  }

  const appStyle = {
    ['--app-font-family' as string]: fontPresetToStack(settings.font_preset),
  } as CSSProperties

  return (
    <div
      className={`app-shell ${settings.contrast_theme === 'high' ? 'theme-high' : 'theme-soft'} ${
        settings.focus_mode ? 'focus-mode' : ''
      }`}
      style={appStyle}
    >
      <aside className="sidebar">
        <div className="sidebar-inner">
          <header className="page-header">
            <p className="eyebrow">Accessible Reader</p>
            <h1>Local-first reading assistant</h1>
            <p>
              Local parsing first. Edge read aloud first. AI only when you ask for
              <strong> Simplify</strong> or <strong>Summary</strong>.
            </p>
          </header>
          <ImportPanel busy={importBusy} onImportFile={handleImportFile} onImportText={handleImportText} />
          <LibraryPane
            activeDocumentId={activeDocumentId}
            documents={documents}
            loading={documentsLoading}
            searchValue={search}
            onSearchChange={setSearch}
            onSelect={(documentId) => {
              speech.stop()
              startTransition(() => {
                setActiveDocumentId(documentId)
                setActiveMode('reflowed')
              })
            }}
          />
          <div className="card stack-gap">
            <div className="section-header">
              <h2>Roadmap note</h2>
              <p>Local TTS is intentionally deferred. Browser-native Edge voices are the shipped path.</p>
            </div>
            {health?.openai_configured ? (
              <p className="status-chip status-good">OpenAI transforms available</p>
            ) : (
              <p className="status-chip status-muted">
                OpenAI transforms disabled until OPENAI_API_KEY is configured
              </p>
            )}
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <SettingsPanel
          open={settingsOpen}
          settings={settings}
          onToggle={() => setSettingsOpen((current) => !current)}
          onChange={setSettings}
        />

        <section className="card controls-card stack-gap">
          <div className="toolbar">
            <div className="mode-tabs" role="tablist" aria-label="Document modes">
              {viewModes.map((mode) => (
                <button
                  key={mode}
                  className={activeMode === mode ? 'mode-tab mode-tab-active' : 'mode-tab'}
                  type="button"
                  onClick={() => {
                    speech.stop()
                    startTransition(() => {
                      setActiveMode(mode)
                    })
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
            <div className="toolbar-actions">
              {activeMode === 'summary' ? (
                <label className="field inline-field">
                  <span>Detail</span>
                  <select
                    value={summaryDetail}
                    onChange={(event) => setSummaryDetail(event.target.value as SummaryDetail)}
                  >
                    <option value="short">Short</option>
                    <option value="balanced">Balanced</option>
                    <option value="detailed">Detailed</option>
                  </select>
                </label>
              ) : null}
              <label className="field inline-field">
                <span>Voice</span>
                <select
                  value={settings.preferred_voice}
                  onChange={(event) =>
                    setSettings((currentSettings) => ({
                      ...currentSettings,
                      preferred_voice: event.target.value,
                    }))
                  }
                >
                  {speech.voiceChoices.map((voiceChoice) => (
                    <option key={voiceChoice.id} value={voiceChoice.name}>
                      {voiceChoice.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field inline-field">
                <span>Rate</span>
                <input
                  type="range"
                  min={0.7}
                  max={1.4}
                  step={0.05}
                  value={settings.speech_rate}
                  onChange={(event) =>
                    setSettings((currentSettings) => ({
                      ...currentSettings,
                      speech_rate: Number(event.target.value),
                    }))
                  }
                />
              </label>
            </div>
          </div>

          <div className="speech-controls">
            <button disabled={!speech.isSupported || flatSentences.length === 0} type="button" onClick={() => speech.start()}>
              Start
            </button>
            <button disabled={!speech.isSpeaking || speech.isPaused} type="button" onClick={speech.pause}>
              Pause
            </button>
            <button disabled={!speech.isPaused} type="button" onClick={speech.resume}>
              Resume
            </button>
            <button disabled={!speech.isSpeaking && flatSentences.length === 0} type="button" onClick={speech.stop}>
              Stop
            </button>
            <button disabled={flatSentences.length === 0} type="button" onClick={speech.previous}>
              Previous sentence
            </button>
            <button disabled={flatSentences.length === 0} type="button" onClick={speech.next}>
              Next sentence
            </button>
          </div>

          <div className="status-row">
            <span className="status-chip">
              Sentence {flatSentences.length === 0 ? 0 : speech.currentSentenceIndex + 1} of {flatSentences.length}
            </span>
            {view?.generated_by === 'openai' ? (
              <span className="status-chip status-muted">
                {view.mode} via {view.model ?? 'OpenAI'}{view.cached ? ' (cached)' : ''}
              </span>
            ) : (
              <span className="status-chip status-muted">Local deterministic view</span>
            )}
            <span className="status-chip status-muted">Alt+Left / Alt+Right or Space</span>
          </div>
        </section>

        {viewError ? <p className="inline-error">{viewError}</p> : null}

        <section className="card reader-card">
          {selectedDocument ? (
            <header className="reader-toolbar">
              <div>
                <p className="eyebrow">Current document</p>
                <h2>{selectedDocument.title}</h2>
              </div>
              {(activeMode === 'simplified' || activeMode === 'summary') && !view ? (
                <button disabled={transformBusy} type="button" onClick={() => handleGenerate(activeMode)}>
                  {transformBusy ? 'Working…' : `Create ${activeMode}`}
                </button>
              ) : null}
            </header>
          ) : (
            <header className="reader-toolbar">
              <div>
                <p className="eyebrow">Current document</p>
                <h2>Import something to start</h2>
              </div>
            </header>
          )}

          {viewLoading ? <p className="placeholder">Loading view…</p> : null}
          {!selectedDocument && !viewLoading ? (
            <p className="placeholder">Paste text or import a file to populate the library.</p>
          ) : null}
          {selectedDocument && !view && !viewLoading && (activeMode === 'simplified' || activeMode === 'summary') ? (
            <div className="placeholder stack-gap">
              <p>
                {activeMode === 'simplified'
                  ? 'This simplified view has not been generated yet.'
                  : 'This summary view has not been generated yet.'}
              </p>
              <p className="small-note">
                AI only runs when you choose it. The original and reflowed views are always local.
              </p>
            </div>
          ) : null}
          {view ? (
            <ReaderSurface
              title={view.title}
              blocks={renderBlocks}
              activeSentenceIndex={speech.currentSentenceIndex}
              settings={settings}
              onSelectSentence={speech.jumpTo}
            />
          ) : null}
        </section>
      </main>
    </div>
  )
}
