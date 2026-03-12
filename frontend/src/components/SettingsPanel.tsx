import type { ReaderSettings } from '../types'

interface SettingsPanelProps {
  open: boolean
  settings: ReaderSettings
  onToggle: () => void
  onChange: (nextSettings: ReaderSettings) => void
}

export function SettingsPanel({ open, settings, onToggle, onChange }: SettingsPanelProps) {
  function update<K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) {
    onChange({ ...settings, [key]: value })
  }

  return (
    <section className={`card settings-panel ${open ? 'settings-panel-open' : ''}`}>
      <div className="settings-header">
        <div>
          <h2>Reading settings</h2>
          <p>Saved locally through the backend so the app reopens the same way.</p>
        </div>
        <button className="ghost-button" type="button" onClick={onToggle}>
          {open ? 'Hide' : 'Show'}
        </button>
      </div>
      {open ? (
        <div className="settings-grid">
          <label className="field">
            <span>Font preset</span>
            <select
              value={settings.font_preset}
              onChange={(event) => update('font_preset', event.target.value as ReaderSettings['font_preset'])}
            >
              <option value="system">System readable</option>
              <option value="atkinson">Atkinson if available</option>
              <option value="comic">Comic Sans fallback</option>
            </select>
          </label>
          <label className="field">
            <span>Text size</span>
            <input
              type="range"
              min={16}
              max={36}
              value={settings.text_size}
              onChange={(event) => update('text_size', Number(event.target.value))}
            />
          </label>
          <label className="field">
            <span>Line spacing</span>
            <input
              type="range"
              min={1.2}
              max={2.6}
              step={0.1}
              value={settings.line_spacing}
              onChange={(event) => update('line_spacing', Number(event.target.value))}
            />
          </label>
          <label className="field">
            <span>Line width</span>
            <input
              type="range"
              min={50}
              max={100}
              value={settings.line_width}
              onChange={(event) => update('line_width', Number(event.target.value))}
            />
          </label>
          <label className="field">
            <span>Contrast</span>
            <select
              value={settings.contrast_theme}
              onChange={(event) =>
                update('contrast_theme', event.target.value as ReaderSettings['contrast_theme'])
              }
            >
              <option value="soft">Soft</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="field field-checkbox">
            <input
              checked={settings.focus_mode}
              type="checkbox"
              onChange={(event) => update('focus_mode', event.target.checked)}
            />
            <span>Focus mode</span>
          </label>
        </div>
      ) : null}
    </section>
  )
}
