import { beforeEach, expect, test } from 'vitest'

import { loadReaderSession, readerSessionStorageKey, resolveReaderSession, saveReaderSession } from './readerSession'

import type { DocumentRecord } from '../types'

function makeDocument(
  id: string,
  available_modes: DocumentRecord['available_modes'],
): DocumentRecord {
  return {
    id,
    title: id,
    source_type: 'paste',
    created_at: '2026-03-12T00:00:00Z',
    updated_at: '2026-03-12T00:00:00Z',
    available_modes,
    progress_by_mode: {},
  }
}

beforeEach(() => {
  const store = new Map<string, string>()
  const localStorageMock = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
  }

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: localStorageMock,
  })
})

test('saveReaderSession round-trips through localStorage', () => {
  saveReaderSession({
    documentId: 'doc-2',
    mode: 'original',
    summaryDetail: 'detailed',
  })

  expect(loadReaderSession()).toEqual({
    documentId: 'doc-2',
    mode: 'original',
    summaryDetail: 'detailed',
  })
})

test('loadReaderSession falls back to defaults when storage is invalid', () => {
  window.localStorage.setItem(readerSessionStorageKey, '{not json')

  expect(loadReaderSession()).toEqual({
    documentId: null,
    mode: 'reflowed',
    summaryDetail: 'balanced',
  })
})

test('resolveReaderSession restores the saved document and mode when available', () => {
  const documents = [
    makeDocument('doc-1', ['original', 'reflowed']),
    makeDocument('doc-2', ['original', 'reflowed', 'summary']),
  ]

  expect(
    resolveReaderSession(documents, {
      documentId: 'doc-2',
      mode: 'summary',
      summaryDetail: 'detailed',
    }),
  ).toEqual({
    document: documents[1],
    documentId: 'doc-2',
    mode: 'summary',
    summaryDetail: 'detailed',
  })
})

test('resolveReaderSession falls back to the first document in reflowed mode when the saved document is missing', () => {
  const documents = [
    makeDocument('doc-1', ['original', 'reflowed']),
    makeDocument('doc-2', ['original', 'reflowed', 'summary']),
  ]

  expect(
    resolveReaderSession(documents, {
      documentId: 'missing-doc',
      mode: 'summary',
      summaryDetail: 'short',
    }),
  ).toEqual({
    document: documents[0],
    documentId: 'doc-1',
    mode: 'reflowed',
    summaryDetail: 'short',
  })
})

test('resolveReaderSession preserves the current document while the library is filtered', () => {
  const currentDocument = makeDocument('doc-2', ['original', 'reflowed'])
  const documents = [makeDocument('doc-1', ['original', 'reflowed'])]

  expect(
    resolveReaderSession(
      documents,
      {
        documentId: 'doc-2',
        mode: 'original',
        summaryDetail: 'balanced',
      },
      {
        currentDocument,
        preserveCurrentWhenFiltered: true,
      },
    ),
  ).toEqual({
    document: currentDocument,
    documentId: 'doc-2',
    mode: 'original',
    summaryDetail: 'balanced',
  })
})
