import type { ReaderSettings } from '../types'


export const defaultReaderSettings: ReaderSettings = {
  font_preset: 'system',
  text_size: 22,
  line_spacing: 1.7,
  line_width: 72,
  contrast_theme: 'soft',
  focus_mode: false,
  preferred_voice: 'default',
  speech_rate: 1,
}

export function fontPresetToStack(fontPreset: ReaderSettings['font_preset']) {
  if (fontPreset === 'atkinson') {
    return '"Atkinson Hyperlegible Next", "Atkinson Hyperlegible", "Trebuchet MS", "Segoe UI", sans-serif'
  }
  if (fontPreset === 'comic') {
    return '"Comic Sans MS", "Trebuchet MS", "Segoe UI", sans-serif'
  }
  return '"Atkinson Hyperlegible Next", "Atkinson Hyperlegible", "Segoe UI", "Verdana", sans-serif'
}
