export type ViewMode = 'original' | 'reflowed' | 'simplified' | 'summary'
export type SummaryDetail = 'short' | 'balanced' | 'detailed'

export interface ViewBlock {
  id: string
  kind: 'heading' | 'paragraph' | 'list_item' | 'quote'
  text: string
  level?: number | null
}

export interface DocumentView {
  mode: ViewMode
  detail_level: 'default' | SummaryDetail
  title: string
  blocks: ViewBlock[]
  generated_by: 'local' | 'openai'
  cached: boolean
  source_hash: string
  model?: string | null
  updated_at: string
}

export interface DocumentRecord {
  id: string
  title: string
  source_type: string
  file_name?: string | null
  created_at: string
  updated_at: string
  available_modes: ViewMode[]
  progress_by_mode: Partial<Record<ViewMode, number>>
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

export interface HealthResponse {
  ok: boolean
  openai_configured: boolean
}
