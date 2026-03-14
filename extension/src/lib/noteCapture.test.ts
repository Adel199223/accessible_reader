import { describe, expect, it } from 'vitest'

import { buildBrowserNoteCaptureState, getReaderAnchorOptionsFromHit, getReaderAnchorOptionsFromNote } from './noteCapture'
import type { BrowserContextResponse, RecallNoteRecord, RecallRetrievalHit } from './contracts'


const matchedResponse: BrowserContextResponse = {
  hits: [],
  matched_document: {
    document_title: 'Saved browser article',
    source_document_id: 'doc-web-1',
    source_locator: 'https://example.com/articles/saved',
  },
  page_fingerprint: 'fingerprint-1',
  query: '',
  should_prompt: false,
  summary: 'Recall already knows this saved page.',
  suppression_reasons: [],
  trigger_mode: 'page',
}

const note: RecallNoteRecord = {
  id: 'note-1',
  anchor: {
    anchor_text: 'Saved sentence.',
    block_id: 'block-1',
    excerpt_text: 'Saved sentence.',
    global_sentence_end: 4,
    global_sentence_start: 3,
    sentence_end: 0,
    sentence_start: 0,
    source_document_id: 'doc-web-1',
    variant_id: 'variant-1',
  },
  body_text: 'Useful note.',
  created_at: '2026-03-13T00:00:00Z',
  updated_at: '2026-03-13T00:00:00Z',
}


describe('note capture helpers', () => {
  it('only enables browser note capture for exact saved-page matches with a selection', () => {
    expect(buildBrowserNoteCaptureState(null, 'Selected sentence.')).toEqual({
      canCapture: false,
      message: 'Notes are available only when this exact public page is already saved in Recall.',
      selectionText: 'Selected sentence.',
    })

    expect(buildBrowserNoteCaptureState(matchedResponse, '   ')).toEqual({
      canCapture: false,
      message: 'This page matches "Saved browser article". Select text on the page to save a note.',
      selectionText: '',
    })

    expect(buildBrowserNoteCaptureState(matchedResponse, '  Selected sentence.  ')).toEqual({
      canCapture: true,
      message: 'Save the current selection to "Saved browser article".',
      selectionText: 'Selected sentence.',
    })
  })

  it('builds reader anchor options for note hits and saved notes', () => {
    const hit: RecallRetrievalHit = {
      card_id: null,
      chunk_id: null,
      document_title: 'Saved browser article',
      excerpt: 'Saved sentence.',
      hit_type: 'note',
      id: 'note:note-1',
      node_id: null,
      note_anchor: note.anchor,
      note_id: note.id,
      reasons: ['saved note match'],
      score: 0.91,
      source_document_id: 'doc-web-1',
      title: 'Saved sentence.',
    }

    expect(getReaderAnchorOptionsFromHit(hit)).toEqual({ sentenceEnd: 4, sentenceStart: 3 })
    expect(getReaderAnchorOptionsFromNote(note)).toEqual({ sentenceEnd: 4, sentenceStart: 3 })
  })
})
