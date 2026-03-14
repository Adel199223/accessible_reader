import { describe, expect, it } from 'vitest'

import { buildDebugHitLabel, buildDebugTabLabel, buildDebugViewModel } from './debugState'
import type { BrowserDebugSnapshot, RecallRetrievalHit } from './contracts'


const noteHit: RecallRetrievalHit = {
  document_title: 'Saved browser article',
  excerpt: 'Helpful note.',
  hit_type: 'note',
  id: 'note:1',
  note_anchor: null,
  note_id: 'note-1',
  reasons: ['saved note match'],
  score: 0.87,
  source_document_id: 'doc-web-1',
  title: 'Helpful note',
}


const snapshot: BrowserDebugSnapshot = {
  backendBaseUrl: 'http://127.0.0.1:8000',
  promptVisible: false,
  state: {
    context: {
      metaDescription: 'Saved page description.',
      pageExcerpt: 'Saved page excerpt.',
      pageTitle: 'Saved browser article',
      pageUrl: 'https://example.com/article',
      selectionText: 'Selected sentence.',
    },
    error: null,
    response: {
      hits: [noteHit],
      matched_document: {
        document_title: 'Saved browser article',
        source_document_id: 'doc-web-1',
        source_locator: 'https://example.com/article',
      },
      page_fingerprint: 'fingerprint-1',
      query: 'Selected sentence.',
      should_prompt: false,
      summary: 'Recall already knows this saved page.',
      suppression_reasons: [],
      trigger_mode: 'selection',
    },
  },
  tab: {
    active: true,
    id: 7,
    title: 'Saved browser article',
    url: 'https://example.com/article',
  },
}


describe('debug state helpers', () => {
  it('formats inspectable tabs and retrieval hits for the debug view', () => {
    expect(buildDebugTabLabel(snapshot.tab)).toBe('Active • Saved browser article • https://example.com/article')
    expect(buildDebugHitLabel(noteHit)).toBe('NOTE • Helpful note • Saved browser article')
  })

  it('builds a note-capable view model for exact saved-page matches', () => {
    expect(buildDebugViewModel(snapshot)).toEqual(
      expect.objectContaining({
        backendLabel: 'Backend: http://127.0.0.1:8000',
        canSaveNote: true,
        matchedDocumentLabel: 'Exact saved-page match: Saved browser article • https://example.com/article',
        noteStatus: 'Save the current selection to "Saved browser article".',
        promptLabel: 'Prompt visibility: quiet',
        queryLabel: 'Query: Selected sentence.',
        selectionLabel: 'Selected sentence.',
        status: 'Recall already knows this saved page.',
        suppressionLabel: 'Suppression: none',
        tabLabel: 'Active • Saved browser article • https://example.com/article',
      }),
    )
  })

  it('falls back to unavailable copy before a snapshot exists', () => {
    expect(buildDebugViewModel(null)).toEqual(
      expect.objectContaining({
        canSaveNote: false,
        matchedDocumentLabel: 'Exact saved-page match: unavailable',
        status: 'Select an inspectable browser tab to load Recall debug state.',
      }),
    )
  })
})
