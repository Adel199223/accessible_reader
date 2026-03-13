import { useEffect, useState, type CSSProperties } from 'react'

import { fetchHealth, fetchSettings, saveSettings } from './api'
import { RecallWorkspace } from './components/RecallWorkspace'
import { ReaderWorkspace } from './components/ReaderWorkspace'
import { buildAppHref, parseAppRoute, type AppRoute, type AppSection } from './lib/appRoute'
import { defaultReaderSettings, fontPresetToStack } from './lib/readerTheme'
import type { HealthResponse, ReaderSettings } from './types'


function syncRouteFromLocation(setRoute: (route: AppRoute) => void) {
  const nextRoute = parseAppRoute(window.location)
  const expectedHref = buildAppHref(nextRoute.path, nextRoute.documentId)
  const currentHref = `${window.location.pathname}${window.location.search}`
  if (currentHref !== expectedHref) {
    window.history.replaceState({}, '', expectedHref)
  }
  setRoute(nextRoute)
}


export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => parseAppRoute(window.location))
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [settings, setSettings] = useState<ReaderSettings>(defaultReaderSettings)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

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

  function navigate(path: AppSection, documentId?: string | null) {
    const href = buildAppHref(path, documentId)
    window.history.pushState({}, '', href)
    setRoute(parseAppRoute(window.location))
  }

  const appStyle = {
    ['--app-font-family' as string]: fontPresetToStack(settings.font_preset),
  } as CSSProperties

  return (
    <div
      className={`app-shell ${settings.contrast_theme === 'high' ? 'theme-high' : 'theme-soft'} ${
        settings.focus_mode && route.path === 'reader' ? 'focus-mode' : ''
      }`}
      style={appStyle}
    >
      <header className="shell-header">
        <div className="shell-brand">
          <p className="eyebrow">Local knowledge workspace</p>
          <h1>Recall</h1>
          <p>Search what you saved, reopen it in Reader, and keep the flow local-first.</p>
        </div>
        <nav className="shell-nav" aria-label="Primary">
          <button
            aria-current={route.path === 'recall' ? 'page' : undefined}
            className={route.path === 'recall' ? 'shell-nav-button shell-nav-button-active' : 'shell-nav-button'}
            type="button"
            onClick={() => navigate('recall')}
          >
            Recall
          </button>
          <button
            aria-current={route.path === 'reader' ? 'page' : undefined}
            className={route.path === 'reader' ? 'shell-nav-button shell-nav-button-active' : 'shell-nav-button'}
            type="button"
            onClick={() => navigate('reader')}
          >
            Reader
          </button>
        </nav>
      </header>

      <main className="shell-main">
        {route.path === 'recall' ? (
          <RecallWorkspace onOpenReader={(documentId) => navigate('reader', documentId)} />
        ) : (
          <ReaderWorkspace
            key={`reader-${route.documentId ?? 'session'}`}
            health={health}
            routeDocumentId={route.documentId}
            settings={settings}
            onSettingsChange={setSettings}
          />
        )}
      </main>
    </div>
  )
}
