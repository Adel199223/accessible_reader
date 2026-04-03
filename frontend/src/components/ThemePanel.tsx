import { useEffect } from 'react'

import type { ReaderSettings } from '../types'

interface ThemePanelProps {
  open: boolean
  settings: ReaderSettings
  onClose: () => void
  onChange: (nextSettings: ReaderSettings) => void
}

const contrastThemeOptions: Array<{
  description: string
  label: string
  value: ReaderSettings['contrast_theme']
}> = [
  {
    description: 'A brighter reading surface for daytime scanning.',
    label: 'Light',
    value: 'soft',
  },
  {
    description: 'A dimmer charcoal surface for lower-glare reading.',
    label: 'Dark',
    value: 'high',
  },
]

export function ThemePanel({ open, settings, onClose, onChange }: ThemePanelProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) {
    return null
  }

  function updateTheme(nextTheme: ReaderSettings['contrast_theme']) {
    onChange({ ...settings, contrast_theme: nextTheme })
  }

  return (
    <div className="theme-panel-layer" role="presentation">
      <button
        aria-label="Close theme panel"
        className="theme-panel-backdrop"
        type="button"
        onClick={onClose}
      />
      <aside aria-labelledby="theme-panel-title" aria-modal="true" className="theme-panel" id="theme-panel" role="dialog">
        <div className="theme-panel-header">
          <div className="section-header section-header-compact">
            <h2 id="theme-panel-title">Theme</h2>
            <p>Choose the reading contrast that feels best right now.</p>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="theme-panel-body stack-gap">
          <div className="theme-choice-grid" role="group" aria-label="Reading theme">
            {contrastThemeOptions.map((option) => (
              <button
                key={option.value}
                aria-label={`${option.label} theme`}
                aria-pressed={settings.contrast_theme === option.value}
                className={
                  settings.contrast_theme === option.value
                    ? 'theme-choice-button theme-choice-button-active'
                    : 'theme-choice-button'
                }
                type="button"
                onClick={() => updateTheme(option.value)}
              >
                <strong>{option.label}</strong>
                <span>{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="small-note theme-panel-note">Applied across Recall on this device.</p>
      </aside>
    </div>
  )
}
