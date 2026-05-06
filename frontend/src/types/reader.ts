import type { DocumentView as GeneratedDocumentView } from '../generated/openapi'
import type { SummaryDetail, ViewMode } from './base'

export interface ViewBlock {
  id: string
  kind: 'heading' | 'paragraph' | 'list_item' | 'quote'
  text: string
  level?: number | null
  metadata?: Record<string, unknown>
}

export type DocumentView = GeneratedDocumentView

export interface ReadingCompleteResult {
  document_id: string
  mode: ViewMode
  sentence_index: number
  sentence_count: number
  completed_at: string
}

export interface ReaderSettings {
  font_preset: 'system' | 'atkinson' | 'comic'
  text_size: number
  line_spacing: number
  line_width: number
  contrast_theme: 'soft' | 'high'
  focus_mode: boolean
  preferred_voice: string
  speech_rate: number
}

export interface AccessibilitySnapshot {
  font_preset?: ReaderSettings['font_preset'] | null
  text_size?: number | null
  line_spacing?: number | null
  line_width?: number | null
  contrast_theme?: ReaderSettings['contrast_theme'] | null
  focus_mode?: boolean | null
  preferred_voice?: string | null
  speech_rate?: number | null
}

export interface ReaderSessionState {
  mode: ViewMode
  sentence_index: number
  summary_detail?: SummaryDetail | null
  accessibility_snapshot?: AccessibilitySnapshot | null
  updated_at: string
}

export interface HealthResponse {
  ok: boolean
  openai_configured: boolean
}
