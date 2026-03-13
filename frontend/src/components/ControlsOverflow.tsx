import { useEffect, useRef, useState } from 'react'

interface VoiceChoice {
  id: string
  label: string
  name: string
}

interface ControlsOverflowProps {
  currentSentenceLabel: string
  preferredVoice: string
  speechRate: number
  voiceChoices: VoiceChoice[]
  onPreferredVoiceChange: (value: string) => void
  onSpeechRateChange: (value: number) => void
}

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
  currentSentenceLabel,
  preferredVoice,
  speechRate,
  voiceChoices,
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
          <label className="field">
            <span>Voice</span>
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

          <label className="field">
            <div className="field-label-row">
              <span>Rate</span>
              <strong className="inline-value">{speechRate.toFixed(2)}x</strong>
            </div>
            <input
              type="range"
              min={0.7}
              max={1.4}
              step={0.05}
              value={speechRate}
              onChange={(event) => onSpeechRateChange(Number(event.target.value))}
            />
          </label>

          <div className="controls-overflow-meta stack-gap">
            <span className="status-chip">{currentSentenceLabel}</span>
            <p className="small-note">Shortcuts: Alt+Left, Alt+Right, or Space.</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
