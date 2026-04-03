import { useEffect, useRef, useState } from 'react'

import type { ReaderSettings } from '../types'

interface VoiceChoice {
  id: string
  label: string
  name: string
}

interface ControlsOverflowAction {
  label: string
  onSelect: () => void
}

interface ControlsOverflowProps {
  actions?: ControlsOverflowAction[]
  contrastTheme: ReaderSettings['contrast_theme']
  preferredVoice: string
  speechRate: number
  voiceChoices: VoiceChoice[]
  onContrastThemeChange: (value: ReaderSettings['contrast_theme']) => void
  onPreferredVoiceChange: (value: string) => void
  onSpeechRateChange: (value: number) => void
}

const contrastThemeOptions: Array<{
  label: string
  value: ReaderSettings['contrast_theme']
}> = [
  {
    label: 'Light',
    value: 'soft',
  },
  {
    label: 'Dark',
    value: 'high',
  },
]

function MoreIcon() {
  return (
    <svg
      aria-hidden="true"
      className="transport-icon"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="6" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="18" cy="12" r="1.8" />
    </svg>
  )
}

export function ControlsOverflow({
  actions = [],
  contrastTheme,
  preferredVoice,
  speechRate,
  voiceChoices,
  onContrastThemeChange,
  onPreferredVoiceChange,
  onSpeechRateChange,
}: ControlsOverflowProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: MouseEvent | PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className={`controls-overflow ${open ? 'controls-overflow-open' : ''}`}>
      <button
        aria-expanded={open}
        aria-label="More reading controls"
        className="transport-button transport-button-overflow"
        title="More reading controls"
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <MoreIcon />
      </button>

      {open ? (
        <div className="controls-overflow-panel" role="group" aria-label="More reading controls">
          {actions.length ? (
            <div className="controls-overflow-action-list" role="group" aria-label="Reader quick actions">
              {actions.map((action) => (
                <button
                  key={action.label}
                  className="ghost-button controls-overflow-action-button"
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    action.onSelect()
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}

          <div className="controls-overflow-theme" role="group" aria-label="Reading theme">
            <span className="controls-overflow-section-label">Theme</span>
            <div className="controls-overflow-theme-options">
              {contrastThemeOptions.map((option) => (
                <button
                  key={option.value}
                  aria-label={`${option.label} theme`}
                  aria-pressed={contrastTheme === option.value}
                  className={
                    contrastTheme === option.value
                      ? 'controls-overflow-theme-button controls-overflow-theme-button-active'
                      : 'controls-overflow-theme-button'
                  }
                  type="button"
                  onClick={() => onContrastThemeChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label className="controls-overflow-field controls-overflow-field-inline">
            <span className="controls-overflow-section-label">Voice</span>
            <select
              value={preferredVoice}
              onChange={(event) => onPreferredVoiceChange(event.target.value)}
            >
              {voiceChoices.map((voiceChoice) => (
                <option key={voiceChoice.id} value={voiceChoice.name}>
                  {voiceChoice.label}
                </option>
              ))}
            </select>
          </label>

          <label className="controls-overflow-field controls-overflow-field-stack">
            <div className="controls-overflow-field-head">
              <span className="controls-overflow-section-label">Rate</span>
              <strong className="controls-overflow-inline-value">{speechRate.toFixed(2)}x</strong>
            </div>
            <input
              aria-label="Rate"
              type="range"
              min={0.7}
              max={1.4}
              step={0.05}
              value={speechRate}
              onChange={(event) => onSpeechRateChange(Number(event.target.value))}
            />
          </label>
        </div>
      ) : null}
    </div>
  )
}
