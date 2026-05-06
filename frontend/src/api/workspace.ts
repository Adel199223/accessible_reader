import type {
  WorkspaceExportManifest,
  WorkspaceImportApplyResult,
  WorkspaceImportPreview,
} from '../types'
import { buildApiUrl, request } from './core'

export function buildWorkspaceExportUrl() {
  return buildApiUrl('/api/workspace/export.zip')
}

export function fetchWorkspaceExportManifest() {
  return request<WorkspaceExportManifest>('/api/workspace/export.manifest.json')
}

export function previewWorkspaceImport(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request<WorkspaceImportPreview>('/api/workspace/import-preview', {
    method: 'POST',
    body: formData,
  })
}

export function applyWorkspaceImport(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('restore_confirmation', 'restore-missing-items')
  return request<WorkspaceImportApplyResult>('/api/workspace/import-apply', {
    method: 'POST',
    body: formData,
  })
}
