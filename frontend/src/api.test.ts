import { afterEach, expect, test, vi } from 'vitest'

import {
  buildRecallExportUrl,
  buildRecallLearningPackExportUrl,
  buildLibraryCollectionLearningPackExportUrl,
  buildWorkspaceExportUrl,
  applyWorkspaceImport,
  fetchLibraryCollectionOverview,
  completeRecallDocumentReading,
  fetchDocuments,
  fetchHighlightReviewInbox,
  fetchLibraryReadingQueue,
  fetchRecallDocumentPreview,
  importBatchDocuments,
  fetchLibrarySettings,
  previewBatchImport,
  previewWorkspaceImport,
  saveLibrarySettings,
  updateRecallNoteReviewState,
} from './api'
import type { LibrarySettings } from './types'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

function buildJsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
}

test('request normalizes local-service network failures into actionable copy', async () => {
  const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
  vi.stubGlobal('fetch', fetchMock)

  await expect(fetchDocuments()).rejects.toEqual(
    expect.objectContaining({
      kind: 'network',
      message:
        'Could not reach the local service at 127.0.0.1:8000. Retry after the backend is running again.',
      name: 'ApiRequestError',
      status: null,
    }),
  )
})

test('fetchRecallDocumentPreview prefixes relative asset URLs with the configured API base', async () => {
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test/base/')
  const fetchMock = vi.fn().mockResolvedValue(
    buildJsonResponse({
      asset_url: '/api/recall/documents/doc-preview/preview/asset?updated_at=2026-03-27T08%3A00%3A00Z',
      document_id: 'doc-preview',
      kind: 'image',
      source: 'html-inline-image',
      updated_at: '2026-03-27T08:00:00Z',
    }),
  )
  vi.stubGlobal('fetch', fetchMock)

  await expect(fetchRecallDocumentPreview('doc-preview')).resolves.toMatchObject({
    asset_url: 'https://api.example.test/base/api/recall/documents/doc-preview/preview/asset?updated_at=2026-03-27T08%3A00%3A00Z',
    document_id: 'doc-preview',
  })
  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.example.test/base/api/recall/documents/doc-preview/preview',
    undefined,
  )
  expect(buildRecallExportUrl('doc-preview')).toBe(
    'https://api.example.test/base/api/recall/documents/doc-preview/export.md',
  )
  expect(buildRecallLearningPackExportUrl('doc-preview')).toBe(
    'https://api.example.test/base/api/recall/documents/doc-preview/learning-export.md',
  )
  expect(buildLibraryCollectionLearningPackExportUrl('collection:learning')).toBe(
    'https://api.example.test/base/api/recall/library/collections/collection%3Alearning/learning-export.zip',
  )
  expect(buildWorkspaceExportUrl()).toBe('https://api.example.test/base/api/workspace/export.zip')
})

test('fetchRecallDocumentPreview leaves relative asset URLs unchanged without an API base', async () => {
  vi.stubEnv('VITE_API_BASE_URL', '')
  const fetchMock = vi.fn().mockResolvedValue(
    buildJsonResponse({
      asset_url: '/api/recall/documents/doc-preview/preview/asset?updated_at=2026-03-27T08%3A00%3A00Z',
      document_id: 'doc-preview',
      kind: 'image',
      source: 'html-inline-image',
      updated_at: '2026-03-27T08:00:00Z',
    }),
  )
  vi.stubGlobal('fetch', fetchMock)

  await expect(fetchRecallDocumentPreview('doc-preview')).resolves.toMatchObject({
    asset_url: '/api/recall/documents/doc-preview/preview/asset?updated_at=2026-03-27T08%3A00%3A00Z',
    document_id: 'doc-preview',
  })
  expect(fetchMock).toHaveBeenCalledWith('/api/recall/documents/doc-preview/preview', undefined)
  expect(buildRecallExportUrl('doc-preview')).toBe('/api/recall/documents/doc-preview/export.md')
  expect(buildRecallLearningPackExportUrl('doc-preview')).toBe(
    '/api/recall/documents/doc-preview/learning-export.md',
  )
  expect(buildLibraryCollectionLearningPackExportUrl('collection:learning')).toBe(
    '/api/recall/library/collections/collection%3Alearning/learning-export.zip',
  )
  expect(buildWorkspaceExportUrl()).toBe('/api/workspace/export.zip')
})

test('fetchLibraryCollectionOverview reads collection workspace overview', async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    buildJsonResponse({
      id: 'collection:learning',
      name: 'Learning',
      parent_id: null,
      path: [{ id: 'collection:learning', name: 'Learning' }],
      direct_document_ids: ['doc-parent'],
      descendant_document_ids: ['doc-parent', 'doc-child'],
      direct_document_count: 1,
      descendant_document_count: 2,
      child_collection_count: 1,
      memory_counts: { notes: 1, graph_nodes: 1, study_cards: 2 },
      study_counts: { new: 1, due: 1, scheduled: 0, unscheduled: 0, reviewed: 0, total: 2 },
      reading_summary: {
        total_sources: 2,
        unread_sources: 1,
        in_progress_sources: 1,
        completed_sources: 0,
        last_read_at: '2026-03-13T00:30:00Z',
      },
      resume_sources: [
        {
          id: 'doc-child',
          title: 'Child source',
          source_type: 'paste',
          mode: 'reflowed',
          sentence_index: 1,
          sentence_count: 3,
          progress_percent: 67,
          membership: 'descendant',
          updated_at: '2026-03-13T00:30:00Z',
        },
      ],
      highlight_review_items: [
        {
          note_id: 'note-child',
          note_kind: 'sentence',
          source_document_id: 'doc-child',
          source_title: 'Child source',
          anchor_text: 'Important sentence.',
          excerpt_preview: 'Important sentence.',
          body_preview: 'Remember this.',
          global_sentence_start: 1,
          global_sentence_end: 1,
          membership: 'descendant',
          updated_at: '2026-03-13T00:31:00Z',
        },
      ],
      recent_sources: [],
      recent_activity: [],
    }),
  )
  vi.stubGlobal('fetch', fetchMock)

  await expect(fetchLibraryCollectionOverview('collection:learning')).resolves.toMatchObject({
    id: 'collection:learning',
    descendant_document_count: 2,
    memory_counts: { notes: 1, graph_nodes: 1, study_cards: 2 },
    reading_summary: { unread_sources: 1, in_progress_sources: 1 },
    resume_sources: [expect.objectContaining({ id: 'doc-child', progress_percent: 67 })],
    highlight_review_items: [expect.objectContaining({ note_id: 'note-child' })],
  })
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/recall/library/collections/collection%3Alearning/overview',
    undefined,
  )
})

test('fetchLibraryReadingQueue reads scoped queue rows and completion posts mode', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(
      buildJsonResponse({
        dry_run: true,
        scope: 'all',
        state: 'in_progress',
        learning_filter: 'covered',
        collection_id: 'collection:learning',
        summary: {
          total_sources: 2,
          unread_sources: 1,
          in_progress_sources: 1,
          completed_sources: 0,
        },
        learning_summary: {
          needs_review_sources: 1,
          uncovered_sources: 1,
          covered_sources: 1,
          study_prompt_sources: 1,
          graph_gap_sources: 1,
        },
        rows: [
          {
            id: 'doc-child',
            title: 'Child source',
            source_type: 'paste',
            state: 'in_progress',
            mode: 'reflowed',
            sentence_index: 1,
            sentence_count: 3,
            progress_percent: 67,
            last_read_at: '2026-03-13T00:30:00Z',
            updated_at: '2026-03-13T00:29:00Z',
            membership: 'descendant',
            collection_paths: [[{ id: 'collection:learning', name: 'Learning' }]],
            note_count: 2,
            highlight_count: 1,
            highlight_review_counts: {
              total: 2,
              needs_review: 1,
              covered: 1,
              reviewed: 1,
              dismissed: 0,
              graph_covered: 0,
              ungraphed: 1,
            },
            study_counts: { new: 1, due: 0, total: 1 },
          },
        ],
      }),
    )
    .mockResolvedValueOnce(
      buildJsonResponse({
        document_id: 'doc-child',
        mode: 'reflowed',
        sentence_index: 2,
        sentence_count: 3,
        completed_at: '2026-03-13T00:32:00Z',
      }),
    )
  vi.stubGlobal('fetch', fetchMock)

  await expect(
    fetchLibraryReadingQueue({
      collectionId: 'collection:learning',
      learningFilter: 'covered',
      limit: 10,
      state: 'in_progress',
    } as Parameters<typeof fetchLibraryReadingQueue>[0] & { learningFilter: 'covered' }),
  ).resolves.toMatchObject({
    collection_id: 'collection:learning',
    learning_filter: 'covered',
    rows: [expect.objectContaining({ id: 'doc-child', progress_percent: 67 })],
  })
  await expect(completeRecallDocumentReading('doc-child', 'reflowed')).resolves.toMatchObject({
    document_id: 'doc-child',
    sentence_index: 2,
  })
  expect(fetchMock).toHaveBeenNthCalledWith(
    1,
    '/api/recall/library/reading-queue?collection_id=collection%3Alearning&state=in_progress&learning_filter=covered&limit=10',
    undefined,
  )
  expect(fetchMock).toHaveBeenNthCalledWith(
    2,
    '/api/recall/documents/doc-child/reading/complete',
    {
      body: JSON.stringify({ mode: 'reflowed' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    },
  )
})

test('fetchHighlightReviewInbox reads scoped review rows and note review-state patching', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(
      buildJsonResponse({
        scope: 'all',
        state: 'covered',
        reading_state: 'in_progress',
        learning_filter: 'covered',
        collection_id: 'collection:learning',
        source_document_id: null,
        summary: {
          total_items: 2,
          needs_review_items: 1,
          uncovered_items: 1,
          covered_items: 1,
          reviewable_covered_items: 1,
          reviewed_items: 1,
          dismissed_items: 0,
        },
        reviewable_study_card_ids: ['card-note-child'],
        rows: [
          {
            note_id: 'note-child',
            note_kind: 'sentence',
            source_document_id: 'doc-child',
            source_title: 'Child source',
            anchor_text: 'Important sentence.',
            excerpt_preview: 'Important sentence.',
            body_preview: 'Remember this.',
            global_sentence_start: 1,
            global_sentence_end: 1,
            membership: 'descendant',
            collection_paths: [[{ id: 'collection:learning', name: 'Learning' }]],
            review_state: 'reviewed',
            reviewed_at: '2026-03-13T00:33:00Z',
            dismissed_at: null,
            study_covered: true,
            study_card_id: 'card-note-child',
            updated_at: '2026-03-13T00:33:00Z',
          },
        ],
      }),
    )
    .mockResolvedValueOnce(
      buildJsonResponse({
        id: 'note-child',
        anchor: {
          source_document_id: 'doc-child',
          variant_id: 'variant-doc-child',
          block_id: 'child-1',
          sentence_start: 1,
          sentence_end: 1,
          global_sentence_start: 1,
          global_sentence_end: 1,
          anchor_text: 'Important sentence.',
          excerpt_text: 'Important sentence.',
        },
        body_text: 'Remember this.',
        review_state: 'dismissed',
        reviewed_at: null,
        dismissed_at: '2026-03-13T00:34:00Z',
        study_covered: true,
        study_card_id: 'card-note-child',
        created_at: '2026-03-13T00:31:00Z',
        updated_at: '2026-03-13T00:34:00Z',
      }),
    )
  vi.stubGlobal('fetch', fetchMock)

  await expect(
    fetchHighlightReviewInbox({
      collectionId: 'collection:learning',
      learningFilter: 'covered',
      limit: 5,
      readingState: 'in_progress',
      state: 'covered',
    }),
  ).resolves.toMatchObject({
    reviewable_study_card_ids: ['card-note-child'],
    summary: { covered_items: 1, needs_review_items: 1, reviewable_covered_items: 1 },
    rows: [expect.objectContaining({ note_id: 'note-child', study_card_id: 'card-note-child' })],
  })
  await expect(
    updateRecallNoteReviewState('note-child', { review_state: 'dismissed' }),
  ).resolves.toMatchObject({
    id: 'note-child',
    review_state: 'dismissed',
    dismissed_at: '2026-03-13T00:34:00Z',
  })
  expect(fetchMock).toHaveBeenNthCalledWith(
    1,
    '/api/recall/library/highlight-review-inbox?collection_id=collection%3Alearning&state=covered&reading_state=in_progress&learning_filter=covered&limit=5',
    undefined,
  )
  expect(fetchMock).toHaveBeenNthCalledWith(
    2,
    '/api/recall/notes/note-child/review-state',
    {
      body: JSON.stringify({ review_state: 'dismissed' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    },
  )
})

test('fetchRecallDocumentPreview preserves absolute asset URLs', async () => {
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test/base/')
  const fetchMock = vi.fn().mockResolvedValue(
    buildJsonResponse({
      asset_url: 'https://cdn.example.test/previews/doc-preview.jpg',
      document_id: 'doc-preview',
      kind: 'image',
      source: 'html-inline-image',
      updated_at: '2026-03-27T08:00:00Z',
    }),
  )
  vi.stubGlobal('fetch', fetchMock)

  await expect(fetchRecallDocumentPreview('doc-preview')).resolves.toMatchObject({
    asset_url: 'https://cdn.example.test/previews/doc-preview.jpg',
    document_id: 'doc-preview',
  })
  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.example.test/base/api/recall/documents/doc-preview/preview',
    undefined,
  )
})

test('previewWorkspaceImport posts backup files to import preview', async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    buildJsonResponse({
      dry_run: true,
      applied: false,
      can_apply: true,
      apply_blockers: [],
      restorable_entity_counts: {},
      backup: {
        source_kind: 'zip',
        format_version: '1',
        schema_version: 'test',
        device_id: 'desktop-local',
        exported_at: '2026-04-28T12:00:00Z',
        change_event_count: 1,
        entity_counts: {},
        attachment_count: 0,
        bundled_attachment_count: 0,
        missing_attachment_paths: [],
        learning_pack_count: 0,
        missing_learning_pack_paths: [],
        bundle_coverage_available: true,
        warnings: [],
      },
      merge_preview: {
        operations: [],
        summary: {},
      },
    }),
  )
  vi.stubGlobal('fetch', fetchMock)

  const backupFile = new File(['zip'], 'workspace.zip', { type: 'application/zip' })
  await expect(previewWorkspaceImport(backupFile)).resolves.toMatchObject({
    dry_run: true,
    applied: false,
  })
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/workspace/import-preview',
    expect.objectContaining({
      method: 'POST',
      body: expect.any(FormData),
    }),
  )
})

test('applyWorkspaceImport posts guarded backup restore requests', async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    buildJsonResponse({
      dry_run: false,
      applied: true,
      imported_counts: { source_document: 1 },
      skipped_counts: {},
      conflict_counts: {},
      operations: [],
      warnings: [],
      blockers: [],
      integrity: null,
    }),
  )
  vi.stubGlobal('fetch', fetchMock)

  const backupFile = new File(['zip'], 'workspace.zip', { type: 'application/zip' })
  await expect(applyWorkspaceImport(backupFile)).resolves.toMatchObject({
    applied: true,
    imported_counts: { source_document: 1 },
  })
  const formData = fetchMock.mock.calls[0]?.[1]?.body as FormData
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/workspace/import-apply',
    expect.objectContaining({
      method: 'POST',
      body: expect.any(FormData),
    }),
  )
  expect(formData.get('restore_confirmation')).toBe('restore-missing-items')
})

test('previewBatchImport posts local archive files with format and item bounds', async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    buildJsonResponse({
      dry_run: true,
      applied: false,
      source_format: 'url_list',
      max_items: 12,
      rows: [],
      collection_suggestions: [],
      summary: {
        total_count: 0,
        ready_count: 0,
        duplicate_count: 0,
        invalid_count: 0,
        unsupported_count: 0,
        skipped_count: 0,
      },
    }),
  )
  vi.stubGlobal('fetch', fetchMock)

  const importFile = new File(['https://example.com/a'], 'links.txt', { type: 'text/plain' })
  await expect(previewBatchImport(importFile, 'url_list', 12)).resolves.toMatchObject({
    dry_run: true,
    max_items: 12,
  })
  const formData = fetchMock.mock.calls[0]?.[1]?.body as FormData
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/documents/import-batch-preview',
    expect.objectContaining({
      method: 'POST',
      body: expect.any(FormData),
    }),
  )
  expect(formData.get('file')).toBe(importFile)
  expect(formData.get('source_format')).toBe('url_list')
  expect(formData.get('max_items')).toBe('12')
})

test('importBatchDocuments posts selected rows with explicit local import confirmation', async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    buildJsonResponse({
      dry_run: false,
      applied: true,
      source_format: 'url_list',
      max_items: 25,
      rows: [],
      collections: [],
      summary: {
        total_count: 0,
        imported_count: 0,
        reused_count: 0,
        skipped_count: 0,
        failed_count: 0,
        collection_created_count: 0,
        collection_updated_count: 0,
      },
    }),
  )
  vi.stubGlobal('fetch', fetchMock)

  const importFile = new File(['https://example.com/a'], 'links.txt', { type: 'text/plain' })
  await expect(importBatchDocuments(importFile, 'auto', 25, ['batch-ready-1'], true)).resolves.toMatchObject({
    applied: true,
  })
  const formData = fetchMock.mock.calls[0]?.[1]?.body as FormData
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/documents/import-batch',
    expect.objectContaining({
      method: 'POST',
      body: expect.any(FormData),
    }),
  )
  expect(formData.get('file')).toBe(importFile)
  expect(formData.get('source_format')).toBe('auto')
  expect(formData.get('selected_item_ids_json')).toBe('["batch-ready-1"]')
  expect(formData.get('create_collections')).toBe('true')
  expect(formData.get('import_confirmation')).toBe('import-selected-sources')
})

test('library settings read and save through the Library settings API', async () => {
  const payload: LibrarySettings = {
    custom_collections: [
      {
        id: 'collection:reading',
        name: 'Reading',
        document_ids: ['doc-1'],
        origin: 'manual',
        source_format: null,
        created_at: '2026-04-28T10:00:00Z',
        updated_at: '2026-04-28T10:00:00Z',
      },
    ],
  }
  const fetchMock = vi.fn().mockImplementation(async () => buildJsonResponse(payload))
  vi.stubGlobal('fetch', fetchMock)

  await expect(fetchLibrarySettings()).resolves.toEqual(payload)
  await expect(saveLibrarySettings(payload)).resolves.toEqual(payload)

  expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/recall/library/settings', undefined)
  expect(fetchMock).toHaveBeenNthCalledWith(
    2,
    '/api/recall/library/settings',
    expect.objectContaining({
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
    }),
  )
})
