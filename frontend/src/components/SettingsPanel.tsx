import { useEffect, useState } from 'react'

import type { ReaderSettings, SummaryDetail, ViewMode } from '../types'

type SettingsSection = 'view' | 'appearance' | 'layout'

interface SettingsPanelProps {
  open: boolean
  hasDocument: boolean
  activeMode: ViewMode
  settings: ReaderSettings
  summaryDetail: SummaryDetail
  onClose: () => void
  onChange: (nextSettings: ReaderSettings) => void
  onActiveModeChange: (mode: ViewMode) => void
  onSummaryDetailChange: (detail: SummaryDetail) => void
}

const fontPresetOptions: Array<{
  label: string
  shortLabel: string
  value: ReaderSettings['font_preset']
}> = [
  {
    label: 'Readable default',
    shortLabel: 'Readable default',
    value: 'system',
  },
  {
    label: 'Atkinson',
    shortLabel: 'Atkinson',
    value: 'atkinson',
  },
  {
    label: 'Comic Sans',
    shortLabel: 'Comic Sans',
    value: 'comic',
  },
]

const contrastThemeOptions: Array<{
  label: string
  value: ReaderSettings['contrast_theme']
}> = [
  {
    label: 'Sepia',
    value: 'soft',
  },
  {
    label: 'Charcoal',
    value: 'high',
  },
]

const viewModeOptions: Array<{
  label: string
  value: ViewMode
}> = [
  {
    label: 'Original',
    value: 'original',
  },
  {
    label: 'Reflowed',
    value: 'reflowed',
  },
  {
    label: 'Simplified',
    value: 'simplified',
  },
  {
    label: 'Summary',
    value: 'summary',
  },
]

const summaryDetailOptions: SummaryDetail[] = ['short', 'balanced', 'detailed']

const sectionLabels: Record<SettingsSection, string> = {
  view: 'View',
  appearance: 'Appearance',
  layout: 'Layout',
}

export function SettingsPanel({
  open,
  hasDocument,
  activeMode,
  settings,
  summaryDetail,
  onClose,
  onChange,
  onActiveModeChange,
  onSummaryDetailChange,
}: SettingsPanelProps) {
  const availableSections: SettingsSection[] = hasDocument
    ? ['view', 'appearance', 'layout']
    : ['appearance', 'layout']
  const [activeSection, setActiveSection] = useState<SettingsSection>(hasDocument ? 'view' : 'appearance')

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

  function update<K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) {
    onChange({ ...settings, [key]: value })
  }

  if (!open) {
    return null
  }

  const currentSection = availableSections.includes(activeSection) ? activeSection : availableSections[0]
  const activeSectionLabel = sectionLabels[currentSection]

  return (
    <div className="settings-drawer-layer" role="presentation">
      <button
        aria-label="Close settings"
        className="settings-drawer-backdrop"
        type="button"
        onClick={onClose}
      />
      <aside aria-labelledby="settings-drawer-title" aria-modal="true" className="settings-drawer" id="settings-drawer" role="dialog">
        <div className="settings-drawer-header">
          <div className="section-header section-header-compact">
            <h2 id="settings-drawer-title">Settings</h2>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="settings-drawer-body stack-gap">
          <div className="settings-drawer-tabs" role="tablist" aria-label="Settings sections">
            {availableSections.map((section) => (
              <button
                key={section}
                aria-controls={`settings-panel-${section}`}
                aria-selected={currentSection === section}
                className={
                  currentSection === section
                    ? 'settings-section-tab settings-section-tab-active'
                    : 'settings-section-tab'
                }
                id={`settings-tab-${section}`}
                role="tab"
                type="button"
                onClick={() => setActiveSection(section)}
              >
                {sectionLabels[section]}
              </button>
            ))}
          </div>

          <section
            aria-labelledby={`settings-tab-${currentSection}`}
            className="settings-drawer-section settings-drawer-section-compact stack-gap"
            id={`settings-panel-${currentSection}`}
            role="tabpanel"
          >
            <div className="section-header section-header-compact">
              <h3>{activeSectionLabel}</h3>
            </div>

            {currentSection === 'view' ? (
              <>
                <div className="settings-row stack-gap">
                  <div className="settings-row-header">
                    <span className="settings-row-title">Document view</span>
                  </div>
                  <div className="settings-segmented settings-segmented-wrap" role="group" aria-label="Document view">
                    {viewModeOptions.map((option) => (
                      <button
                        key={option.value}
                        aria-label={`${option.label} view`}
                        aria-pressed={activeMode === option.value}
                        className={
                          activeMode === option.value
                            ? 'settings-segment-button settings-segment-button-active'
                            : 'settings-segment-button'
                        }
                        type="button"
                        onClick={() => onActiveModeChange(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activeMode === 'summary' ? (
                  <label className="field settings-row">
                    <div className="field-label-row">
                      <span>Summary detail</span>
                    </div>
                    <select
                      aria-label="Summary detail"
                      value={summaryDetail}
                      onChange={(event) => onSummaryDetailChange(event.target.value as SummaryDetail)}
                    >
                      {summaryDetailOptions.map((option) => (
                        <option key={option} value={option}>
                          {option[0].toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </>
            ) : null}

            {currentSection === 'appearance' ? (
              <>
                <div className="settings-row stack-gap">
                  <div className="settings-row-header">
                    <span className="settings-row-title">Theme</span>
                  </div>
                  <div className="settings-segmented" role="group" aria-label="App theme">
                    {contrastThemeOptions.map((option) => (
                      <button
                        key={option.value}
                        aria-label={`${option.label} app theme`}
                        aria-pressed={settings.contrast_theme === option.value}
                        className={
                          settings.contrast_theme === option.value
                            ? 'settings-segment-button settings-segment-button-active'
                            : 'settings-segment-button'
                        }
                        type="button"
                        onClick={() => update('contrast_theme', option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-row stack-gap">
                  <div className="settings-row-header">
                    <span className="settings-row-title">Font</span>
                  </div>
                  <div className="settings-segmented settings-segmented-wrap" role="group" aria-label="App font">
                    {fontPresetOptions.map((option) => (
                      <button
                        key={option.value}
                        aria-label={`${option.label} font`}
                        aria-pressed={settings.font_preset === option.value}
                        className={
                          settings.font_preset === option.value
                            ? 'settings-segment-button settings-segment-button-active'
                            : 'settings-segment-button'
                        }
                        type="button"
                        onClick={() => update('font_preset', option.value)}
                      >
                        {option.shortLabel}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {currentSection === 'layout' ? (
              <>
                <div className="settings-slider-stack">
                  <label className="field settings-slider-field">
                    <div className="field-label-row">
                      <span>Text size</span>
                      <strong className="inline-value">{settings.text_size}px</strong>
                    </div>
                    <input
                      type="range"
                      min={16}
                      max={36}
                      value={settings.text_size}
                      onChange={(event) => update('text_size', Number(event.target.value))}
                    />
                  </label>

                  <label className="field settings-slider-field">
                    <div className="field-label-row">
                      <span>Line spacing</span>
                      <strong className="inline-value">{settings.line_spacing.toFixed(1)}</strong>
                    </div>
                    <input
                      type="range"
                      min={1.2}
                      max={2.6}
                      step={0.1}
                      value={settings.line_spacing}
                      onChange={(event) => update('line_spacing', Number(event.target.value))}
                    />
                  </label>

                  <label className="field settings-slider-field">
                    <div className="field-label-row">
                      <span>Line width</span>
                      <strong className="inline-value">{settings.line_width}ch</strong>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={100}
                      value={settings.line_width}
                      onChange={(event) => update('line_width', Number(event.target.value))}
                    />
                  </label>
                </div>

                <label className="settings-toggle-row">
                  <span className="settings-row-title">Focus mode</span>
                  <input
                    checked={settings.focus_mode}
                    type="checkbox"
                    onChange={(event) => update('focus_mode', event.target.checked)}
                  />
                </label>
              </>
            ) : null}
          </section>
        </div>

        <p className="small-note settings-drawer-note">Saved on this device.</p>
      </aside>
    </div>
  )
}
