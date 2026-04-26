import assert from 'node:assert/strict'
import test from 'node:test'

import {
  deleteRecallNoteAuditArtifacts,
  isRecallNoteAuditArtifact,
} from './cleanup_recall_note_audit_artifacts.mjs'

function makeSourceHarnessNote(overrides = {}) {
  return {
    anchor: {
      anchor_text: 'Source note for Example',
      excerpt_text: 'Manual note attached to Example.',
      kind: 'source',
      source_document_id: 'doc-example',
    },
    body_text: 'Stage stage902-lane library-native personal note 1777199381646',
    document_title: 'Example',
    id: 'note-harness',
    updated_at: '2026-04-26T10:29:41.708605+00:00',
    ...overrides,
  }
}

test('cleanup matcher only accepts source-attached harness notes', () => {
  const sourceHarnessNote = makeSourceHarnessNote()
  const sentenceHarnessNote = {
    ...sourceHarnessNote,
    anchor: {
      ...sourceHarnessNote.anchor,
      kind: 'sentence',
    },
    id: 'note-sentence',
  }
  const personalUserNote = {
    ...sourceHarnessNote,
    body_text: 'My actual personal note about Stage stage902 planning.',
    id: 'note-user',
  }

  assert.equal(isRecallNoteAuditArtifact(sourceHarnessNote), true)
  assert.equal(isRecallNoteAuditArtifact(sentenceHarnessNote), false)
  assert.equal(isRecallNoteAuditArtifact(personalUserNote), false)
})

test('cleanup apply reports delete failures without broadening the matcher', async () => {
  const originalFetch = globalThis.fetch
  const sourceHarnessNote = makeSourceHarnessNote()
  const userNote = makeSourceHarnessNote({
    body_text: 'My actual personal note about Stage stage902 planning.',
    id: 'note-user',
  })
  const fetchCalls = []

  globalThis.fetch = async (url, init = {}) => {
    fetchCalls.push({ method: init.method ?? 'GET', url: String(url) })
    if (String(url).includes('/api/recall/notes/search')) {
      return {
        ok: true,
        json: async () => [sourceHarnessNote, userNote],
      }
    }
    if (String(url).includes('/api/recall/notes/note-harness')) {
      return {
        ok: false,
        status: 500,
      }
    }
    throw new Error(`Unexpected fetch: ${url}`)
  }

  try {
    const result = await deleteRecallNoteAuditArtifacts({ baseUrl: 'http://example.test' })
    assert.equal(result.matchedCount, 1)
    assert.equal(result.deletedCount, 0)
    assert.equal(result.deleteFailures.length, 1)
    assert.equal(result.deleteFailures[0].id, 'note-harness')
    assert.equal(fetchCalls.some((call) => call.url.includes('note-user')), false)
  } finally {
    globalThis.fetch = originalFetch
  }
})
