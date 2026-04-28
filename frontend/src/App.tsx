import { useCallback, useDeferredValue, useEffect, useRef, useState, type CSSProperties, type SetStateAction } from 'react'

import {
  fetchDocuments,
  fetchHealth,
  fetchSettings,
  importFileDocument,
  importTextDocument,
  importUrlDocument,
  retrieveRecall,
  saveSettings,
  searchRecallNotes,
} from './api'
import { ImportPanel } from './components/ImportPanel'
import { RecallShellFrame } from './components/RecallShellFrame'
import { RecallWorkspace } from './components/RecallWorkspace'
import { ReaderWorkspace } from './components/ReaderWorkspace'
import type { SourceWorkspaceFrameState } from './components/SourceWorkspaceFrame'
import { WorkspaceDialogFrame } from './components/WorkspaceDialogFrame'
import { WorkspaceSearchDialog } from './components/WorkspaceSearchDialog'
import {
  buildAppHref,
  defaultRecallWorkspaceContinuityState,
  parseAppRoute,
  shouldOpenRecallBrowseDrawerByDefault,
  type AppRoute,
  type AppSection,
  type RecallLibrarySurface,
  type SourceWorkspaceTab,
  type WorkspaceDockContext,
  type WorkspaceDockTarget,
  type WorkspaceRecentItem,
  type RecallWorkspaceContinuityState,
  type RecallWorkspaceFocusRequest,
  type RecallSection,
  type WorkspaceSection,
} from './lib/appRoute'
import { defaultReaderSettings, fontPresetToStack } from './lib/readerTheme'
import {
  defaultWorkspaceSearchSessionState,
  getWorkspaceSearchResultKeys,
  type WorkspaceSearchSessionState,
} from './lib/workspaceSearch'
import type { HealthResponse, ReaderSettings } from './types'
import type { WorkspaceHeroProps } from './components/WorkspaceHero'


function syncRouteFromLocation(setRoute: (route: AppRoute) => void) {
  const nextRoute = parseAppRoute(window.location)
  const expectedHref = buildAppHref(nextRoute.path, nextRoute.documentId, {
    recallSection: nextRoute.recallSection,
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
  compact: true,
  eyebrow: 'Recall',
  title: 'Reconnect what you already saved.',
  description: 'Search, reopen, validate, and study from one local workspace.',
  metrics: [
    { label: 'Loading library…' },
    { label: 'Loading graph…', tone: 'muted' },
    { label: 'Loading study…', tone: 'muted' },
  ],
}

function resolveVisibleRecallSection(section: RecallSection): Exclude<RecallSection, 'notes'> {
  return section === 'notes' ? 'library' : section
}

function mapWorkspaceSectionToSourceTab(section: WorkspaceSection): SourceWorkspaceTab {
  if (section === 'library') {
    return 'overview'
  }
  return section
}

function mapRecallSectionToSourceTab(section: RecallSection): SourceWorkspaceTab {
  if (section === 'library') {
    return 'overview'
  }
  return section
}

function AddLauncherIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M8 3.25v9.5M3.25 8h9.5" />
    </svg>
  )
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => parseAppRoute(window.location))
  const [activeRecallSection, setActiveRecallSection] = useState<RecallSection>(() =>
    resolveVisibleRecallSection(parseAppRoute(window.location).recallSection),
  )
  const recallContinuityStateRef = useRef<RecallWorkspaceContinuityState>(defaultRecallWorkspaceContinuityState)
  const [recallContinuityState, setRecallContinuityState] = useState<RecallWorkspaceContinuityState>(
    defaultRecallWorkspaceContinuityState,
  )
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [shellHero, setShellHero] = useState<WorkspaceHeroProps>(defaultShellHero)
  const [settings, setSettings] = useState<ReaderSettings>(defaultReaderSettings)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [addSourceOpen, setAddSourceOpen] = useState(false)
  const [addSourceBusy, setAddSourceBusy] = useState(false)
  const [addSourceError, setAddSourceError] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [workspaceSearchSession, setWorkspaceSearchSession] = useState<WorkspaceSearchSessionState>(
    defaultWorkspaceSearchSessionState,
  )
  const [recallFocusRequest, setRecallFocusRequest] = useState<RecallWorkspaceFocusRequest | null>(null)
  const [shellContext, setShellContext] = useState<WorkspaceDockContext | null>(null)
  const [shellSourceWorkspace, setShellSourceWorkspace] = useState<SourceWorkspaceFrameState | null>(null)
  const [supportChromeOpen, setSupportChromeOpen] = useState(false)
  const [recentItems, setRecentItems] = useState<WorkspaceRecentItem[]>([])
  const lastRecentItemKeyRef = useRef<string | null>(null)
  const recallSnapshotBeforeReaderRef = useRef<{
    continuityState: RecallWorkspaceContinuityState
    section: RecallSection
  } | null>(null)
  const deferredWorkspaceSearchQuery = useDeferredValue(workspaceSearchSession.query)

  const updateRecallContinuityState = useCallback((action: SetStateAction<RecallWorkspaceContinuityState>) => {
    const nextState =
      typeof action === 'function'
        ? (action as (current: RecallWorkspaceContinuityState) => RecallWorkspaceContinuityState)(recallContinuityStateRef.current)
        : action
    recallContinuityStateRef.current = nextState
    setRecallContinuityState(nextState)
  }, [])

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
    if (route.path !== 'reader' || !route.documentId) {
      return
    }
    updateRecallContinuityState((current) => ({
      ...current,
      sourceWorkspace: {
        ...current.sourceWorkspace,
        activeDocumentId: route.documentId,
        activeTab: 'reader',
        memorySearchQuery:
          current.sourceWorkspace.activeDocumentId === route.documentId ? current.sourceWorkspace.memorySearchQuery : '',
        mode: 'focused',
        readerAnchor:
          route.sentenceStart !== null && route.sentenceEnd !== null
            ? {
                sentenceEnd: route.sentenceEnd,
                sentenceStart: route.sentenceStart,
              }
            : current.sourceWorkspace.activeDocumentId === route.documentId
              ? current.sourceWorkspace.readerAnchor
              : null,
      },
    }))
  }, [route.documentId, route.path, route.sentenceEnd, route.sentenceStart])

  useEffect(() => {
    if (route.path !== 'recall') {
      return
    }
    const recallSnapshot = recallSnapshotBeforeReaderRef.current
    if (recallSnapshot) {
      recallSnapshotBeforeReaderRef.current = null
      setActiveRecallSection(recallSnapshot.section)
      setRecallFocusRequest(null)
      updateRecallContinuityState(recallSnapshot.continuityState)
      return
    }
    if (route.recallSection === 'notes') {
      setActiveRecallSection('library')
      updateRecallContinuityState((current) => ({
        ...current,
        library: {
          ...current.library,
          activeSurface: 'notebook',
        },
        sourceWorkspace: {
          ...current.sourceWorkspace,
          activeDocumentId: current.notes.selectedDocumentId ?? current.sourceWorkspace.activeDocumentId,
          activeTab: 'notes',
          mode: 'browse',
        },
      }))
      return
    }
    setActiveRecallSection(route.recallSection)
  }, [route.path, route.recallSection, updateRecallContinuityState])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (!searchOpen) {
          setSearchOpen(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen])

  const navigate = useCallback((
    path: AppSection,
    documentId?: string | null,
    options?: {
      recallSection?: RecallSection | null
      sentenceEnd?: number | null
      sentenceStart?: number | null
    },
  ) => {
    if (path === 'reader' && route.path === 'recall' && !recallSnapshotBeforeReaderRef.current) {
      recallSnapshotBeforeReaderRef.current = {
        continuityState: recallContinuityStateRef.current,
        section: activeRecallSection,
      }
    }
    if (path === 'reader') {
      setRecallFocusRequest(null)
    } else if (path === 'recall') {
      recallSnapshotBeforeReaderRef.current = null
    }
    const href = buildAppHref(path, documentId, options)
    const currentHref = `${window.location.pathname}${window.location.search}`
    if (currentHref === href) {
      setRoute(parseAppRoute(window.location))
      return
    }
    window.history.pushState({}, '', href)
    setRoute(parseAppRoute(window.location))
  }, [activeRecallSection, route.path])

  const syncRecallSectionRoute = useCallback((section: RecallSection) => {
    if (route.path !== 'recall') {
      return
    }
    const href = buildAppHref('recall', null, { recallSection: section })
    const currentHref = `${window.location.pathname}${window.location.search}`
    if (currentHref === href) {
      return
    }
    window.history.replaceState({}, '', href)
    setRoute(parseAppRoute(window.location))
  }, [route.path])

  const handleRecallSectionChange = useCallback((section: RecallSection) => {
    setActiveRecallSection(section)
    syncRecallSectionRoute(section)
  }, [syncRecallSectionRoute])

  const openRecallSection = useCallback((section: RecallSection, options?: Omit<RecallWorkspaceFocusRequest, 'section' | 'token'>) => {
    const resolvedSection = resolveVisibleRecallSection(section)
    const resolvedLibrarySurface: RecallLibrarySurface | null =
      options?.librarySurface ??
      (section === 'notes' || options?.noteId ? 'notebook' : resolvedSection === 'library' ? 'home' : null)
    const resolvedSourceTab: SourceWorkspaceTab | null =
      options?.sourceTab ??
      (section === 'notes' || options?.noteId
        ? 'notes'
        : resolvedSection === 'library' && options?.documentId
          ? 'overview'
          : null)
    const resolvedBrowseDrawerSection =
      resolvedSection === 'library' && resolvedLibrarySurface === 'notebook' ? 'notes' : resolvedSection
    const hasFocusedTarget = Boolean(
      !options?.newNote && (options?.documentId || options?.noteId || options?.nodeId || options?.cardId),
    )
    handleRecallSectionChange(resolvedSection)
    updateRecallContinuityState((current) => ({
      ...current,
      browseDrawers: {
        ...current.browseDrawers,
        [resolvedBrowseDrawerSection]: shouldOpenRecallBrowseDrawerByDefault(
          resolvedBrowseDrawerSection,
          hasFocusedTarget,
        ),
      },
      library:
        resolvedSection === 'library' && resolvedLibrarySurface
          ? {
              ...current.library,
              activeSurface: resolvedLibrarySurface,
            }
          : current.library,
      sourceWorkspace: {
        ...current.sourceWorkspace,
        activeDocumentId: options?.documentId ?? current.sourceWorkspace.activeDocumentId,
        activeTab: resolvedSourceTab ?? mapRecallSectionToSourceTab(resolvedSection),
        memorySearchFocusToken: options?.sourceMemorySearchFocus ? Date.now() : current.sourceWorkspace.memorySearchFocusToken,
        memorySearchQuery:
          options?.documentId && options.documentId !== current.sourceWorkspace.activeDocumentId
            ? ''
            : current.sourceWorkspace.memorySearchQuery,
        mode: hasFocusedTarget ? 'focused' : 'browse',
      },
      study:
        resolvedSection === 'study'
          ? {
            ...current.study,
            activeCardId: options?.cardId ?? current.study.activeCardId,
            collectionFilter: 'all',
            filter: options?.documentId ? 'all' : current.study.filter,
              questionSearchQuery:
                options?.documentId && options.documentId === current.study.sourceScopeDocumentId
                  ? current.study.questionSearchQuery
                  : '',
              scheduleDrilldown: 'all',
              sourceScopeDocumentId: options?.documentId ?? null,
            }
          : current.study,
    }))
    setRecallFocusRequest({
      section: resolvedSection,
      librarySurface: resolvedLibrarySurface,
      sourceTab: resolvedSourceTab,
      token: Date.now(),
      ...options,
    })
    if (route.path !== 'recall') {
      navigate('recall', null, { recallSection: resolvedSection })
    }
  }, [handleRecallSectionChange, navigate, route.path, updateRecallContinuityState])

  const handleOpenReader = useCallback(
    (
      documentId: string,
      options?: {
        returnNoteId?: string | null
        returnToNotebook?: boolean | null
        sentenceEnd?: number | null
        sentenceStart?: number | null
      },
    ) => {
      const { returnNoteId, returnToNotebook, sentenceEnd, sentenceStart } = options ?? {}
      if (route.path === 'recall') {
        const continuitySnapshot =
          returnToNotebook === true
            ? {
                ...recallContinuityStateRef.current,
                library: {
                  ...recallContinuityStateRef.current.library,
                  activeSurface: 'notebook' as RecallLibrarySurface,
                  selectedDocumentId: documentId,
                },
                notes: {
                  ...recallContinuityStateRef.current.notes,
                  selectedDocumentId: documentId,
                  selectedNoteId: returnNoteId ?? recallContinuityStateRef.current.notes.selectedNoteId,
                },
                sourceWorkspace: {
                  ...recallContinuityStateRef.current.sourceWorkspace,
                  activeDocumentId: documentId,
                  activeTab: 'notes' as SourceWorkspaceTab,
                },
              }
            : recallContinuityStateRef.current
        recallSnapshotBeforeReaderRef.current = {
          continuityState: continuitySnapshot,
          section: activeRecallSection,
        }
      }
      navigate('reader', documentId, { sentenceEnd, sentenceStart })
    },
    [activeRecallSection, navigate, route.path],
  )

  const handleOpenRecallGraph = useCallback(
    (documentId: string) => {
      openRecallSection('graph', { documentId })
    },
    [openRecallSection],
  )

  const handleOpenRecallLibrary = useCallback(
    (documentId: string, options?: { focusMemorySearch?: boolean | null }) => {
      openRecallSection('library', {
        documentId,
        librarySurface: 'home',
        sourceMemorySearchFocus: options?.focusMemorySearch ?? false,
        sourceTab: 'overview',
      })
    },
    [openRecallSection],
  )

  const handleOpenRecallNotes = useCallback(
    (documentId: string, noteId?: string | null) => {
      openRecallSection('library', { documentId, librarySurface: 'notebook', noteId, sourceTab: 'notes' })
    },
    [openRecallSection],
  )

  const handleOpenRecallNotebook = useCallback(
    (options?: { documentId?: string | null; newNote?: boolean | null; noteId?: string | null }) => {
      const nextFocusRequest: Omit<RecallWorkspaceFocusRequest, 'section' | 'token'> = {
        librarySurface: 'notebook',
      }
      const wantsNotebookDraft = options?.newNote === true
      const hasExplicitTarget = options?.documentId !== undefined || options?.noteId !== undefined || wantsNotebookDraft

      if (options?.documentId !== undefined) {
        nextFocusRequest.documentId = options.documentId
      }
      if (options?.noteId !== undefined) {
        nextFocusRequest.noteId = options.noteId
      }
      if (options?.newNote !== undefined) {
        nextFocusRequest.newNote = options.newNote
      }
      if (hasExplicitTarget) {
        nextFocusRequest.sourceTab = 'notes'
      }

      openRecallSection('library', nextFocusRequest)
    },
    [openRecallSection],
  )

  const handleOpenRecallStudy = useCallback(
    (documentId: string) => {
      openRecallSection('study', { documentId })
    },
    [openRecallSection],
  )

  const handleOpenGraphResult = useCallback(
    (nodeId: string | null) => {
      openRecallSection('graph', { nodeId: nodeId ?? undefined })
    },
    [openRecallSection],
  )

  const handleOpenStudyResult = useCallback(
    (cardId: string | null) => {
      openRecallSection('study', { cardId: cardId ?? undefined })
    },
    [openRecallSection],
  )

  function handleRequestNewSource() {
    setAddSourceError(null)
    setAddSourceOpen(true)
  }

  function handleOpenSearch() {
    if (!searchOpen) {
      setSearchOpen(true)
    }
  }

  function handleWorkspaceSearchQueryChange(query: string) {
    setWorkspaceSearchSession((current) => ({
      ...current,
      error: null,
      loading: Boolean(query.trim()) || (!query.trim() && searchOpen),
      query,
    }))
  }

  function handleSelectWorkspaceSearchResult(resultKey: string) {
    setWorkspaceSearchSession((current) => ({
      ...current,
      selectedResultKey: resultKey,
    }))
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
      const activeSourceDocumentId =
        recallContinuityState.sourceWorkspace.activeDocumentId ?? route.documentId ?? recallContinuityState.library.selectedDocumentId
      if (activeSourceDocumentId) {
        updateRecallContinuityState((current) => ({
          ...current,
          sourceWorkspace: {
            ...current.sourceWorkspace,
            activeDocumentId: activeSourceDocumentId,
            activeTab: 'reader',
            mode: 'focused',
          },
        }))
        navigate('reader', activeSourceDocumentId, recallContinuityState.sourceWorkspace.readerAnchor ?? undefined)
        return
      }
      navigate('reader')
      return
    }
    const resolvedSection = resolveVisibleRecallSection(section)
    handleRecallSectionChange(resolvedSection)
    updateRecallContinuityState((current) => ({
      ...current,
      browseDrawers: {
        ...current.browseDrawers,
        [resolvedSection]: shouldOpenRecallBrowseDrawerByDefault(resolvedSection),
      },
      library:
        resolvedSection === 'library'
          ? {
              ...current.library,
              activeSurface: 'home',
            }
          : current.library,
      sourceWorkspace: {
        ...current.sourceWorkspace,
        activeTab: resolvedSection === 'library' ? current.sourceWorkspace.activeTab : mapWorkspaceSectionToSourceTab(resolvedSection),
        mode: 'browse',
      },
    }))
    if (route.path !== 'recall') {
      navigate('recall', null, { recallSection: resolvedSection })
    }
  }

  function handleActivateDockTarget(target: WorkspaceDockTarget) {
    if (target.section === 'reader') {
      if (!target.documentId) {
        return
      }
      navigate('reader', target.documentId, {
        sentenceEnd: target.sentenceEnd,
        sentenceStart: target.sentenceStart,
      })
      return
    }

    openRecallSection(target.section, {
      cardId: target.cardId,
      documentId: target.documentId,
      nodeId: target.nodeId,
      noteId: target.noteId,
    })
  }

  useEffect(() => {
    const recentItem = shellContext?.recentItem
    if (!recentItem) {
      return
    }
    if (recentItem.key === lastRecentItemKeyRef.current) {
      return
    }
    lastRecentItemKeyRef.current = recentItem.key
    setRecentItems((currentItems) => [recentItem, ...currentItems.filter((item) => item.key !== recentItem.key)].slice(0, 6))
  }, [shellContext])

  useEffect(() => {
    if (shellSourceWorkspace) {
      return
    }
    setSupportChromeOpen(false)
  }, [shellSourceWorkspace])

  const visibleRecallSection = resolveVisibleRecallSection(activeRecallSection)
  const activeWorkspaceSection: WorkspaceSection = route.path === 'reader' ? 'reader' : visibleRecallSection
  const searchSurfaceVisible = searchOpen || (route.path === 'recall' && activeRecallSection === 'library')
  const shellLayoutMode: 'default' | 'home' | 'reader' =
    route.path === 'reader' ? 'reader' : visibleRecallSection === 'library' ? 'home' : 'default'

  useEffect(() => {
    const trimmedQuery = deferredWorkspaceSearchQuery.trim()
    if (!trimmedQuery) {
      if (!searchOpen) {
        setWorkspaceSearchSession((current) => ({
          ...current,
          error: null,
          hits: [],
          loading: false,
          notes: [],
          sourceResults: [],
        }))
        return
      }

      let active = true
      setWorkspaceSearchSession((current) => ({
        ...current,
        error: null,
        loading: true,
      }))

      void fetchDocuments('')
        .then((documents) => {
          if (!active) {
            return
          }
          setWorkspaceSearchSession((current) => ({
            ...current,
            error: null,
            hits: [],
            loading: false,
            notes: [],
            recentDocuments: documents.slice(0, 8),
            sourceResults: [],
          }))
        })
        .catch((loadError) => {
          if (!active) {
            return
          }
          setWorkspaceSearchSession((current) => ({
            ...current,
            error: loadError instanceof Error ? loadError.message : 'Could not load recent sources.',
            hits: [],
            loading: false,
            notes: [],
            recentDocuments: [],
            sourceResults: [],
          }))
        })

      return () => {
        active = false
      }
    }

    if (!searchSurfaceVisible) {
      return
    }

    let active = true
    setWorkspaceSearchSession((current) => ({
      ...current,
      error: null,
      loading: true,
    }))

    void Promise.all([
      fetchDocuments(trimmedQuery),
      searchRecallNotes(trimmedQuery, 8, null),
      retrieveRecall(trimmedQuery, 8),
    ])
      .then(([sourceResults, notes, hits]) => {
        if (!active) {
          return
        }
        setWorkspaceSearchSession((current) => ({
          ...current,
          error: null,
          hits,
          loading: false,
          notes,
          sourceResults: sourceResults.slice(0, 8),
        }))
      })
      .catch((loadError) => {
        if (!active) {
          return
        }
        setWorkspaceSearchSession((current) => ({
          ...current,
          error: loadError instanceof Error ? loadError.message : 'Could not search your workspace yet.',
          hits: [],
          loading: false,
          notes: [],
          sourceResults: [],
        }))
      })

    return () => {
      active = false
    }
  }, [deferredWorkspaceSearchQuery, searchOpen, searchSurfaceVisible])

  useEffect(() => {
    const activeKeys = getWorkspaceSearchResultKeys(workspaceSearchSession, {
      includeRecentDocuments: searchOpen && !workspaceSearchSession.query.trim(),
    })
    if (!activeKeys.length) {
      if (workspaceSearchSession.selectedResultKey !== null) {
        setWorkspaceSearchSession((current) => ({
          ...current,
          selectedResultKey: null,
        }))
      }
      return
    }

    if (!workspaceSearchSession.selectedResultKey || !activeKeys.includes(workspaceSearchSession.selectedResultKey)) {
      setWorkspaceSearchSession((current) => ({
        ...current,
        selectedResultKey: activeKeys[0],
      }))
    }
  }, [searchOpen, workspaceSearchSession])

  return (
    <div
      className={`app-shell ${settings.contrast_theme === 'high' ? 'theme-high' : 'theme-soft'} ${
        settings.focus_mode && route.path === 'reader' ? 'focus-mode' : ''
      }`}
      style={appStyle}
    >
      <RecallShellFrame
        activeSection={activeWorkspaceSection}
        currentContext={shellContext}
        hero={shellHero}
        headerActions={
          shellLayoutMode === 'home' ? undefined : (
            <>
              <button aria-label="Search" className="shell-nav-button" type="button" onClick={handleOpenSearch}>
                Search
                <span className="shell-nav-hint">Ctrl+K</span>
              </button>
              <button
                aria-label="Add"
                className="shell-nav-button shell-nav-button-active shell-nav-button-add"
                type="button"
                onClick={handleRequestNewSource}
              >
                <span className="shell-nav-button-leading" aria-hidden="true">
                  <AddLauncherIcon />
                </span>
                Add
              </button>
            </>
          )
        }
        layoutMode={shellLayoutMode}
        onActivateTarget={handleActivateDockTarget}
        onSelectSection={handleSelectWorkspaceSection}
        onToggleSupportChrome={() => setSupportChromeOpen((current) => !current)}
        recentItems={recentItems}
        sourceWorkspace={shellSourceWorkspace}
        supportChromeOpen={supportChromeOpen}
      >
        {route.path === 'recall' ? (
          <RecallWorkspace
            continuityState={recallContinuityState}
            focusRequest={recallFocusRequest}
            onContinuityStateChange={updateRecallContinuityState}
            onOpenNotebook={handleOpenRecallNotebook}
            onShellContextChange={setShellContext}
            onSectionChange={handleRecallSectionChange}
            onShellHeroChange={setShellHero}
            onOpenSearch={handleOpenSearch}
            onRequestNewSource={handleRequestNewSource}
            onShellSourceWorkspaceChange={setShellSourceWorkspace}
            onOpenReader={handleOpenReader}
            settings={settings}
            section={visibleRecallSection}
          />
        ) : (
          <ReaderWorkspace
            key={`reader-${route.documentId ?? 'session'}-${route.sentenceStart ?? 'none'}-${route.sentenceEnd ?? 'none'}`}
            health={health}
            onOpenRecallGraph={handleOpenRecallGraph}
            onOpenRecallLibrary={handleOpenRecallLibrary}
            onShellHeroChange={setShellHero}
            onShellContextChange={setShellContext}
            onShellSourceWorkspaceChange={setShellSourceWorkspace}
            onOpenRecallNotes={handleOpenRecallNotes}
            onOpenRecallStudy={handleOpenRecallStudy}
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
        closeDisabled={addSourceBusy}
        description="Choose one local-first way to bring a source into Recall without leaving your current workspace."
        eyebrow="Add to Recall"
        onClose={() => {
          setAddSourceError(null)
          setAddSourceOpen(false)
        }}
        open={addSourceOpen}
        title="Add content"
        variant="entry"
        wide
      >
        {addSourceError ? (
          <div className="inline-error" role="alert">
            <p>{addSourceError}</p>
          </div>
        ) : null}
        <ImportPanel
          busy={addSourceBusy}
          helperText="TXT, Markdown, HTML, DOCX, text-based PDF, and public article links."
          onImportFile={handleImportFile}
          onImportText={handleImportText}
          onImportUrl={handleImportUrl}
          showHeader={false}
        />
      </WorkspaceDialogFrame>
      <WorkspaceSearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenGraph={handleOpenGraphResult}
        onOpenNote={handleOpenRecallNotes}
        onOpenReader={handleOpenReader}
        onOpenStudy={handleOpenStudyResult}
        onQueryChange={handleWorkspaceSearchQueryChange}
        onSelectResult={handleSelectWorkspaceSearchResult}
        searchSession={workspaceSearchSession}
      />
    </div>
  )
}
