export interface PortableEntityDigest {
  entity_type: string
  entity_key: string
  entity_id: string | null
  updated_at: string
  payload_digest: string
  source_document_id?: string | null
  metadata: Record<string, unknown>
}

export interface AttachmentRef {
  id: string
  source_document_id: string
  file_name: string
  media_type?: string | null
  relative_path: string
  logical_key?: string | null
  content_digest?: string | null
  byte_size?: number | null
  updated_at?: string | null
  metadata?: Record<string, unknown>
}

export interface WorkspaceExportManifest {
  format_version: string
  schema_version: string
  device_id: string
  exported_at: string
  latest_change_id?: string | null
  change_event_count: number
  entity_counts: Record<string, number>
  entities: PortableEntityDigest[]
  attachments: AttachmentRef[]
  warnings: string[]
}

export interface WorkspaceMergeOperation {
  entity_type: string
  entity_key: string
  entity_id?: string | null
  remote_entity_id?: string | null
  decision: 'import_remote' | 'skip_equal' | 'keep_local' | 'prefer_remote'
  reason: string
  local_updated_at?: string | null
  remote_updated_at?: string | null
  local_digest?: string | null
  remote_digest?: string | null
}

export interface WorkspaceMergePreview {
  operations: WorkspaceMergeOperation[]
  summary: Record<string, number>
}

export interface WorkspaceImportPreviewSummary {
  source_kind: 'zip' | 'manifest'
  format_version: string
  schema_version: string
  device_id: string
  exported_at: string
  latest_change_id?: string | null
  change_event_count: number
  entity_counts: Record<string, number>
  attachment_count: number
  bundled_attachment_count: number
  missing_attachment_paths: string[]
  learning_pack_count: number
  missing_learning_pack_paths: string[]
  bundle_coverage_available: boolean
  warnings: string[]
}

export interface WorkspaceImportPreview {
  dry_run: boolean
  applied: boolean
  can_apply: boolean
  apply_blockers: string[]
  restorable_entity_counts: Record<string, number>
  backup: WorkspaceImportPreviewSummary
  merge_preview: WorkspaceMergePreview
}

export interface WorkspaceIntegrityReport {
  ok: boolean
  checked_at: string
  schema_version: string
  quick_check: string
  counts: Record<string, number>
  issues: Array<Record<string, unknown>>
  last_repair_at?: string | null
}

export interface WorkspaceImportApplyResult {
  dry_run: boolean
  applied: boolean
  imported_counts: Record<string, number>
  skipped_counts: Record<string, number>
  conflict_counts: Record<string, number>
  operations: WorkspaceMergeOperation[]
  warnings: string[]
  blockers: string[]
  integrity?: WorkspaceIntegrityReport | null
}
