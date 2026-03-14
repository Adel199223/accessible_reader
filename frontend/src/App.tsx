import { useEffect, useState, type CSSProperties } from 'react'

import {
  fetchHealth,
  fetchSettings,
  importFileDocument,
  importTextDocument,
  importUrlDocument,
  saveSettings,
} from './api'
import { ImportPanel } from './components/ImportPanel'
import { RecallShellFrame } from './components/RecallShellFrame'
import { RecallWorkspace } from './components/RecallWorkspace'
import { ReaderWorkspace } from './components/ReaderWorkspace'
import { WorkspaceDialogFrame } from './components/WorkspaceDialogFrame'
import { WorkspaceSearchDialog } from './components/WorkspaceSearchDialog'
import {
  buildAppHref,
  parseAppRoute,
  type AppRoute,
  type AppSection,
  type RecallWorkspaceFocusRequest,
  type RecallSection,
  type WorkspaceSection,
} from './lib/appRoute'
import { defaultReaderSettings, fontPresetToStack } from './lib/readerTheme'
import type { HealthResponse, ReaderSettings } from './types'
import type { WorkspaceHeroProps } from './components/WorkspaceHero'


function syncRouteFromLocation(setRoute: (route: AppRoute) => void) {
  const nextRoute = parseAppRoute(window.location)
  const expectedHref = buildAppHref(nextRoute.path, nextRoute.documentId, {
    sentenceEnd: nextRoute.sentenceEnd,
    sentenceStart: nextRoute.sentenceStart,
  })
  const currentHref = `${window.location.pathname}${window.location.search}`
  if (currentHref !== expectedHref) {
    window.history.replaceState({}, '', expectedHref)
  }
  setRoute(nextRoute)
}

const defaultShellHero: WorkspaceHeroProps = {
  eyebrow: 'Recall',
  title: 'Reconnect what you already saved.',
  description:
    'Inspect shared source documents, validate graph suggestions, retrieve grounded context, and study from local source-backed cards.',
  metrics: [
    { label: 'Loading library…' },
    { label: 'Loading graph…', tone: 'muted' },
    { label: 'Loading study…', tone: 'muted' },
  ],
}


export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => parseAppRoute(window.location))
  const [activeRecallSection, setActiveRecallSection] = useState<RecallSection>('library')
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [shellHero, setShellHero] = useState<WorkspaceHeroProps>(defaultShellHero)
  const [settings, setSettings] = useState<ReaderSettings>(defaultReaderSettings)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [addSourceOpen, setAddSourceOpen] = useState(false)
  const [addSourceBusy, setAddSourceBusy] = useState(false)
  const [addSourceError, setAddSourceError] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchSessionToken, setSearchSessionToken] = useState(0)
  const [recallFocusRequest, setRecallFocusRequest] = useState<RecallWorkspaceFocusRequest | null>(null)

  useEffect(() => {
    syncRouteFromLocation(setRoute)

    function handlePopState() {
      setRoute(parseAppRoute(window.location))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

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
    if (!settingsLoaded) {
      return
    }
    const timeout = window.setTimeout(() => {
      void saveSettings(settings).catch(() => undefined)
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [settings, settingsLoaded])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (!searchOpen) {
          setSearchSessionToken((current) => current + 1)
          setSearchOpen(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen])

  function navigate(
    path: AppSection,
    documentId?: string | null,
    options?: {
      sentenceEnd?: number | null
      sentenceStart?: number | null
    },
  ) {
    const href = buildAppHref(path, documentId, options)
    window.history.pushState({}, '', href)
    setRoute(parseAppRoute(window.location))
  }

  function openRecallSection(section: RecallSection, options?: Omit<RecallWorkspaceFocusRequest, 'section' | 'token'>) {
    setActiveRecallSection(section)
    setRecallFocusRequest({
      section,
      token: Date.now(),
      ...options,
    })
    if (route.path !== 'recall') {
      navigate('recall')
    }
  }

  function handleRequestNewSource() {
    setAddSourceError(null)
    setAddSourceOpen(true)
    if (route.path !== 'reader') {
      navigate('reader')
    }
  }

  function handleOpenSearch() {
    if (!searchOpen) {
      setSearchSessionToken((current) => current + 1)
      setSearchOpen(true)
    }
  }

  async function handleImportText(title: string, text: string) {
    setAddSourceBusy(true)
    setAddSourceError(null)
    try {
      const importedDocument = await importTextDocument(text, title || undefined)
      setAddSourceOpen(false)
      navigate('reader', importedDocument.id)
    } catch (error) {
      setAddSourceError(error instanceof Error ? error.message : 'Could not import pasted text.')
    } finally {
      setAddSourceBusy(false)
    }
  }

  async function handleImportFile(file: File) {
    setAddSourceBusy(true)
    setAddSourceError(null)
    try {
      const importedDocument = await importFileDocument(file)
      setAddSourceOpen(false)
      navigate('reader', importedDocument.id)
    } catch (error) {
      setAddSourceError(error instanceof Error ? error.message : 'Could not import that file.')
    } finally {
      setAddSourceBusy(false)
    }
  }

  async function handleImportUrl(url: string) {
    setAddSourceBusy(true)
    setAddSourceError(null)
    try {
      const importedDocument = await importUrlDocument(url)
      setAddSourceOpen(false)
      navigate('reader', importedDocument.id)
    } catch (error) {
      setAddSourceError(error instanceof Error ? error.message : 'Could not import that webpage.')
    } finally {
      setAddSourceBusy(false)
    }
  }

  const appStyle = {
    ['--app-font-family' as string]: fontPresetToStack(settings.font_preset),
  } as CSSProperties

  function handleSelectWorkspaceSection(section: WorkspaceSection) {
    if (section === 'reader') {
      navigate('reader')
      return
    }
    setActiveRecallSection(section)
    if (route.path !== 'recall') {
      navigate('recall')
    }
  }

  const activeWorkspaceSection: WorkspaceSection = route.path === 'reader' ? 'reader' : activeRecallSection

  return (
    <div
      className={`app-shell ${settings.contrast_theme === 'high' ? 'theme-high' : 'theme-soft'} ${
        settings.focus_mode && route.path === 'reader' ? 'focus-mode' : ''
      }`}
      style={appStyle}
    >
      <RecallShellFrame
        activeSection={activeWorkspaceSection}
        hero={shellHero}
        headerActions={
          <>
            <button className="shell-nav-button" type="button" onClick={handleOpenSearch}>
              Search
              <span className="shell-nav-hint">Ctrl+K</span>
            </button>
            <button className="shell-nav-button shell-nav-button-active" type="button" onClick={handleRequestNewSource}>
              New
            </button>
          </>
        }
        layoutMode={route.path === 'reader' ? 'reader' : 'default'}
        onSelectSection={handleSelectWorkspaceSection}
      >
        {route.path === 'recall' ? (
          <RecallWorkspace
            focusRequest={recallFocusRequest}
            section={activeRecallSection}
            onSectionChange={setActiveRecallSection}
            onShellHeroChange={setShellHero}
            onOpenReader={(documentId, options) => navigate('reader', documentId, options)}
          />
        ) : (
          <ReaderWorkspace
            key={`reader-${route.documentId ?? 'session'}-${route.sentenceStart ?? 'none'}-${route.sentenceEnd ?? 'none'}`}
            health={health}
            onShellHeroChange={setShellHero}
            onOpenRecallNotes={(documentId, noteId) => openRecallSection('notes', { documentId, noteId })}
            onRequestNewSource={handleRequestNewSource}
            routeDocumentId={route.documentId}
            routeSentenceEnd={route.sentenceEnd}
            routeSentenceStart={route.sentenceStart}
            settings={settings}
            onSettingsChange={setSettings}
          />
        )}
      </RecallShellFrame>
      <WorkspaceDialogFrame
        description="Capture local text, files, or public article links from anywhere in Recall."
        onClose={() => {
          setAddSourceError(null)
          setAddSourceOpen(false)
        }}
        open={addSourceOpen}
        title="Add source"
        wide
      >
        {addSourceError ? (
          <div className="inline-error" role="alert">
            <p>{addSourceError}</p>
          </div>
        ) : null}
        <ImportPanel
          busy={addSourceBusy}
          description="Bring local text, files, or public article links into Recall."
          helperText="TXT, Markdown, HTML, DOCX, text-based PDF, and public article links."
          onImportFile={handleImportFile}
          onImportText={handleImportText}
          onImportUrl={handleImportUrl}
          title="New source"
        />
      </WorkspaceDialogFrame>
      <WorkspaceSearchDialog
        key={`workspace-search-${searchSessionToken}`}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenGraph={(nodeId) => openRecallSection('graph', { nodeId })}
        onOpenNote={(documentId, noteId) => openRecallSection('notes', { documentId, noteId })}
        onOpenReader={(documentId, options) => navigate('reader', documentId, options)}
        onOpenStudy={(cardId) => openRecallSection('study', { cardId })}
      />
    </div>
  )
}
