import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import App from './App'

import type {
  DocumentRecord,
  DocumentView,
  KnowledgeGraphSnapshot,
  KnowledgeNodeDetail,
  RecallNoteRecord,
  RecallNoteSearchHit,
  ReaderSettings,
  RecallRetrievalHit,
  StudyCardRecord,
  StudyOverview,
} from './types'

const documents: DocumentRecord[] = [
  {
    id: 'doc-search',
    title: 'Search target only',
    source_type: 'paste',
    created_at: '2026-03-12T00:00:00Z',
    updated_at: '2026-03-12T00:00:02Z',
    available_modes: ['original', 'reflowed'],
    progress_by_mode: {},
  },
  {
    id: 'doc-reader',
    title: 'Reader stays here',
    source_type: 'paste',
    created_at: '2026-03-12T00:00:00Z',
    updated_at: '2026-03-12T00:00:01Z',
    available_modes: ['original', 'reflowed'],
    progress_by_mode: {},
  },
]

const views: Record<string, DocumentView> = {
  'doc-search:original': {
    mode: 'original',
    detail_level: 'default',
    title: 'Search target only',
    blocks: [{ id: 'search-original-1', kind: 'paragraph', text: 'Search original sentence one. Search original sentence two.' }],
    generated_by: 'local',
    cached: false,
    source_hash: 'search-original-hash',
    updated_at: '2026-03-12T00:00:00Z',
  },
  'doc-search:reflowed': {
    mode: 'reflowed',
    detail_level: 'default',
    title: 'Search target only',
    blocks: [
      {
        id: 'search-1',
        kind: 'paragraph',
        text: 'Search sentence one. Search sentence two.',
        metadata: {
          sentence_count: 2,
          sentence_metadata_version: '1',
          sentence_texts: ['Search sentence one.', 'Search sentence two.'],
        },
      },
    ],
    variant_metadata: {
      sentence_metadata_version: '1',
      variant_id: 'variant-doc-search-reflowed',
    },
    generated_by: 'local',
    cached: false,
    source_hash: 'search-hash',
    updated_at: '2026-03-12T00:00:00Z',
  },
  'doc-reader:original': {
    mode: 'original',
    detail_level: 'default',
    title: 'Reader stays here',
    blocks: [{ id: 'reader-original-1', kind: 'paragraph', text: 'Original reader sentence one. Original reader sentence two.' }],
    generated_by: 'local',
    cached: false,
    source_hash: 'reader-original-hash',
    updated_at: '2026-03-12T00:00:00Z',
  },
  'doc-reader:reflowed': {
    mode: 'reflowed',
    detail_level: 'default',
    title: 'Reader stays here',
    blocks: [
      {
        id: 'reader-1',
        kind: 'paragraph',
        text: 'Reader sentence one. Reader sentence two.',
        metadata: {
          sentence_count: 2,
          sentence_metadata_version: '1',
          sentence_texts: ['Reader sentence one.', 'Reader sentence two.'],
        },
      },
    ],
    variant_metadata: {
      sentence_metadata_version: '1',
      variant_id: 'variant-doc-reader-reflowed',
    },
    generated_by: 'local',
    cached: false,
    source_hash: 'reader-hash',
    updated_at: '2026-03-12T00:00:00Z',
  },
}

const recallDocuments = documents.map((document, index) => ({
  id: document.id,
  title: document.title,
  source_type: document.source_type,
  file_name: document.source_type === 'paste' ? null : `${document.id}.txt`,
  source_locator: document.id === 'doc-search' ? 'https://example.com/search-target' : null,
  created_at: document.created_at,
  updated_at: document.updated_at,
  available_modes: document.available_modes,
  chunk_count: index + 2,
}))

const recallGraph: KnowledgeGraphSnapshot = {
  nodes: [
    {
      id: 'node-knowledge-graphs',
      label: 'Knowledge Graphs',
      node_type: 'concept',
      description: 'Knowledge Graphs support Study Cards.',
      confidence: 0.9,
      mention_count: 2,
      document_count: 1,
      status: 'suggested',
      aliases: ['Graphs'],
      source_document_ids: ['doc-search'],
    },
    {
      id: 'node-study-cards',
      label: 'Study Cards',
      node_type: 'concept',
      description: 'Study Cards stay grounded in source chunks.',
      confidence: 0.86,
      mention_count: 1,
      document_count: 1,
      status: 'confirmed',
      aliases: [],
      source_document_ids: ['doc-search'],
    },
  ],
  edges: [
    {
      id: 'edge-graph-supports-card',
      source_id: 'node-knowledge-graphs',
      source_label: 'Knowledge Graphs',
      target_id: 'node-study-cards',
      target_label: 'Study Cards',
      relation_type: 'supports',
      provenance: 'inferred',
      confidence: 0.84,
      status: 'suggested',
      evidence_count: 1,
      source_document_ids: ['doc-search'],
      excerpt: 'Knowledge Graphs support Study Cards.',
    },
  ],
  document_count: 2,
  pending_nodes: 1,
  pending_edges: 1,
  confirmed_nodes: 1,
  confirmed_edges: 0,
}

const nodeDetail: KnowledgeNodeDetail = {
  node: recallGraph.nodes[0],
  mentions: [
    {
      id: 'mention-1',
      source_document_id: 'doc-search',
      document_title: 'Search target only',
      text: 'Knowledge Graphs',
      entity_type: 'concept',
      confidence: 0.9,
      block_id: 'search-1',
      chunk_id: 'doc-search:chunk:0',
      excerpt: 'Knowledge Graphs support Study Cards.',
    },
  ],
  outgoing_edges: [recallGraph.edges[0]],
  incoming_edges: [],
}

const retrievalHits: RecallRetrievalHit[] = [
  {
    id: 'chunk:doc-search:chunk:0',
    hit_type: 'chunk',
    source_document_id: 'doc-search',
    document_title: 'Search target only',
    title: 'Search target only',
    score: 0.91,
    excerpt: 'Search sentence one. Search sentence two.',
    reasons: ['keyword chunk match', 'lexical overlap'],
    chunk_id: 'doc-search:chunk:0',
  },
  {
    id: 'node:node-knowledge-graphs',
    hit_type: 'node',
    source_document_id: 'doc-search',
    document_title: 'Search target only',
    title: 'Knowledge Graphs',
    score: 0.88,
    excerpt: 'Knowledge Graphs support Study Cards.',
    reasons: ['lexical overlap', 'graph label match'],
    node_id: 'node-knowledge-graphs',
  },
  {
    id: 'note:note-search-1',
    hit_type: 'note',
    source_document_id: 'doc-search',
    document_title: 'Search target only',
    title: 'Search sentence one. Search sentence two.',
    score: 0.86,
    excerpt: 'Useful search note.',
    reasons: ['saved note match', 'note text overlap'],
    note_id: 'note-search-1',
    note_anchor: {
      source_document_id: 'doc-search',
      variant_id: 'variant-doc-search-reflowed',
      block_id: 'search-1',
      sentence_start: 0,
      sentence_end: 1,
      global_sentence_start: 0,
      global_sentence_end: 1,
      anchor_text: 'Search sentence one. Search sentence two.',
      excerpt_text: 'Search sentence one. Search sentence two.',
    },
  },
]

const studyOverview: StudyOverview = {
  due_count: 1,
  new_count: 1,
  scheduled_count: 0,
  review_event_count: 0,
  next_due_at: '2026-03-13T00:20:00Z',
}

const studyCards: StudyCardRecord[] = [
  {
    id: 'card-1',
    source_document_id: 'doc-search',
    document_title: 'Search target only',
    prompt: 'What do Knowledge Graphs support?',
    answer: 'Study Cards',
    card_type: 'relation',
    source_spans: [{ excerpt: 'Knowledge Graphs support Study Cards.' }],
    scheduling_state: { due_at: '2026-03-13T00:20:00Z', review_count: 0 },
    due_at: '2026-03-13T00:20:00Z',
    review_count: 0,
    status: 'new',
    last_rating: null,
  },
]

function makeRecallNote(
  id: string,
  documentId: string,
  variantId: string,
  blockId: string,
  sentenceStart: number,
  sentenceEnd: number,
  globalSentenceStart: number,
  globalSentenceEnd: number,
  anchorText: string,
  excerptText: string,
  bodyText?: string | null,
): RecallNoteRecord {
  return {
    id,
    anchor: {
      source_document_id: documentId,
      variant_id: variantId,
      block_id: blockId,
      sentence_start: sentenceStart,
      sentence_end: sentenceEnd,
      global_sentence_start: globalSentenceStart,
      global_sentence_end: globalSentenceEnd,
      anchor_text: anchorText,
      excerpt_text: excerptText,
    },
    body_text: bodyText ?? null,
    created_at: '2026-03-13T00:00:00Z',
    updated_at: '2026-03-13T00:00:00Z',
  }
}

const baseRecallNotesByDocument: Record<string, RecallNoteRecord[]> = {
  'doc-search': [
    makeRecallNote(
      'note-search-1',
      'doc-search',
      'variant-doc-search-reflowed',
      'search-1',
      0,
      1,
      0,
      1,
      'Search sentence one. Search sentence two.',
      'Search sentence one. Search sentence two.',
      'Useful search note.',
    ),
  ],
  'doc-reader': [
    makeRecallNote(
      'note-reader-1',
      'doc-reader',
      'variant-doc-reader-reflowed',
      'reader-1',
      1,
      1,
      1,
      1,
      'Reader sentence two.',
      'Reader sentence one. Reader sentence two.',
      'Return to sentence two.',
    ),
  ],
}

const settings: ReaderSettings = {
  font_preset: 'system',
  text_size: 22,
  line_spacing: 1.7,
  line_width: 72,
  contrast_theme: 'soft',
  focus_mode: false,
  preferred_voice: 'default',
  speech_rate: 1,
}

const localServiceUnavailableMessage =
  'Could not reach the local service at 127.0.0.1:8000. Retry after the backend is running again.'

let recallNotesByDocument: Record<string, RecallNoteRecord[]> = {}

const {
  createRecallNoteMock,
  decideRecallGraphEdgeMock,
  decideRecallGraphNodeMock,
  deleteRecallNoteMock,
  deleteDocumentRecordMock,
  fetchDocumentsMock,
  fetchDocumentViewMock,
  fetchRecallDocumentMock,
  fetchRecallDocumentsMock,
  fetchRecallGraphMock,
  fetchRecallGraphNodeMock,
  fetchRecallNotesMock,
  fetchRecallStudyCardsMock,
  fetchRecallStudyOverviewMock,
  generateRecallStudyCardsMock,
  importUrlDocumentMock,
  retrieveRecallMock,
  reviewRecallStudyCardMock,
  saveProgressMock,
  saveSettingsMock,
  searchRecallNotesMock,
  updateRecallNoteMock,
  mockSpeechState,
} =
  vi.hoisted(() => {
    const createRecallNoteMock = vi.fn()
    const decideRecallGraphEdgeMock = vi.fn()
    const decideRecallGraphNodeMock = vi.fn()
    const deleteRecallNoteMock = vi.fn()
    const deleteDocumentRecordMock = vi.fn<(documentId: string) => Promise<void>>()
    const fetchDocumentsMock = vi.fn<(query?: string) => Promise<DocumentRecord[]>>()
    const fetchDocumentViewMock = vi.fn<
      (documentId: string, mode: string, detailLevel?: string) => Promise<DocumentView>
    >()
    const fetchRecallDocumentMock = vi.fn()
    const fetchRecallDocumentsMock = vi.fn()
    const fetchRecallGraphMock = vi.fn()
    const fetchRecallGraphNodeMock = vi.fn()
    const fetchRecallNotesMock = vi.fn()
    const fetchRecallStudyCardsMock = vi.fn()
    const fetchRecallStudyOverviewMock = vi.fn()
    const generateRecallStudyCardsMock = vi.fn()
    const importUrlDocumentMock = vi.fn<(url: string) => Promise<DocumentRecord>>()
    const retrieveRecallMock = vi.fn()
    const reviewRecallStudyCardMock = vi.fn()
    const saveProgressMock = vi.fn()
    const saveSettingsMock = vi.fn<(nextSettings: ReaderSettings) => Promise<ReaderSettings>>()
    const searchRecallNotesMock = vi.fn()
    const updateRecallNoteMock = vi.fn()

    return {
      createRecallNoteMock,
      decideRecallGraphEdgeMock,
      decideRecallGraphNodeMock,
      deleteRecallNoteMock,
      deleteDocumentRecordMock,
      fetchDocumentsMock,
      fetchDocumentViewMock,
      fetchRecallDocumentMock,
      fetchRecallDocumentsMock,
      fetchRecallGraphMock,
      fetchRecallGraphNodeMock,
      fetchRecallNotesMock,
      fetchRecallStudyCardsMock,
      fetchRecallStudyOverviewMock,
      generateRecallStudyCardsMock,
      importUrlDocumentMock,
      retrieveRecallMock,
      reviewRecallStudyCardMock,
      saveProgressMock,
      saveSettingsMock,
      searchRecallNotesMock,
      updateRecallNoteMock,
      mockSpeechState: {
        isSupported: true,
        isSpeaking: false,
        isPaused: false,
        currentSentenceIndex: 0,
        voiceChoices: [{ id: 'default', label: 'Default voice', name: 'default' }],
        start: vi.fn(),
        stop: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        previous: vi.fn(),
        next: vi.fn(),
        jumpTo: vi.fn(),
      },
    }
  })

vi.mock('./api', () => ({
  buildRecallExportUrl: vi.fn((documentId: string) => `/api/recall/documents/${documentId}/export.md`),
  createRecallNote: createRecallNoteMock,
  decideRecallGraphEdge: decideRecallGraphEdgeMock,
  decideRecallGraphNode: decideRecallGraphNodeMock,
  deleteRecallNote: deleteRecallNoteMock,
  deleteDocumentRecord: deleteDocumentRecordMock,
  fetchHealth: vi.fn(async () => ({ ok: true, openai_configured: false })),
  fetchRecallDocument: fetchRecallDocumentMock,
  fetchRecallDocuments: fetchRecallDocumentsMock,
  fetchRecallGraph: fetchRecallGraphMock,
  fetchRecallGraphNode: fetchRecallGraphNodeMock,
  fetchRecallNotes: fetchRecallNotesMock,
  fetchSettings: vi.fn(async () => settings),
  fetchRecallStudyCards: fetchRecallStudyCardsMock,
  fetchRecallStudyOverview: fetchRecallStudyOverviewMock,
  generateRecallStudyCards: generateRecallStudyCardsMock,
  saveSettings: saveSettingsMock,
  fetchDocuments: fetchDocumentsMock,
  fetchDocumentView: fetchDocumentViewMock,
  importUrlDocument: importUrlDocumentMock,
  importTextDocument: vi.fn(),
  importFileDocument: vi.fn(),
  generateDocumentView: vi.fn(),
  retrieveRecall: retrieveRecallMock,
  reviewRecallStudyCard: reviewRecallStudyCardMock,
  searchRecallNotes: searchRecallNotesMock,
  searchRecall: vi.fn(),
  saveProgress: saveProgressMock,
  updateRecallNote: updateRecallNoteMock,
}))

vi.mock('./hooks/useSpeech', () => ({
  useSpeech: vi.fn(() => mockSpeechState),
}))

afterEach(() => {
  cleanup()
})

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  })
  const store = new Map<string, string>()
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
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
    },
  })
  recallNotesByDocument = structuredClone(baseRecallNotesByDocument)
  createRecallNoteMock.mockReset()
  fetchDocumentsMock.mockReset()
  fetchDocumentViewMock.mockReset()
  fetchRecallDocumentMock.mockReset()
  fetchRecallDocumentsMock.mockReset()
  fetchRecallGraphMock.mockReset()
  fetchRecallGraphNodeMock.mockReset()
  fetchRecallNotesMock.mockReset()
  fetchRecallStudyCardsMock.mockReset()
  fetchRecallStudyOverviewMock.mockReset()
  generateRecallStudyCardsMock.mockReset()
  decideRecallGraphEdgeMock.mockReset()
  decideRecallGraphNodeMock.mockReset()
  deleteRecallNoteMock.mockReset()
  deleteDocumentRecordMock.mockReset()
  importUrlDocumentMock.mockReset()
  retrieveRecallMock.mockReset()
  reviewRecallStudyCardMock.mockReset()
  saveProgressMock.mockReset()
  saveSettingsMock.mockReset()
  searchRecallNotesMock.mockReset()
  updateRecallNoteMock.mockReset()
  window.history.pushState({}, '', '/reader')
  deleteDocumentRecordMock.mockImplementation(async (documentId: string) => {
    void documentId
  })
  importUrlDocumentMock.mockImplementation(async () => ({
    id: 'doc-web',
    title: 'Imported web article',
    source_type: 'web',
    created_at: '2026-03-13T00:00:00Z',
    updated_at: '2026-03-13T00:00:01Z',
    available_modes: ['original', 'reflowed'],
    progress_by_mode: {},
  }))
  fetchDocumentsMock.mockImplementation(async (query = '') =>
    query ? documents.filter((document) => document.title.toLowerCase().includes(query.toLowerCase())) : documents,
  )
  fetchDocumentViewMock.mockImplementation(async (documentId: string, mode: string) => views[`${documentId}:${mode}`])
  fetchRecallDocumentsMock.mockImplementation(async () => recallDocuments)
  fetchRecallDocumentMock.mockImplementation(async (documentId: string) => {
    const document = recallDocuments.find((candidate) => candidate.id === documentId)
    if (!document) {
      throw new Error('Document not found.')
    }
    return document
  })
  fetchRecallNotesMock.mockImplementation(async (documentId: string) => recallNotesByDocument[documentId] ?? [])
  fetchRecallGraphMock.mockImplementation(async () => recallGraph)
  fetchRecallGraphNodeMock.mockImplementation(async () => nodeDetail)
  fetchRecallStudyOverviewMock.mockImplementation(async () => studyOverview)
  fetchRecallStudyCardsMock.mockImplementation(async () => studyCards)
  generateRecallStudyCardsMock.mockImplementation(async () => ({
    generated_count: 1,
    total_count: studyCards.length,
  }))
  decideRecallGraphNodeMock.mockImplementation(async () => ({
    ...recallGraph.nodes[0],
    status: 'confirmed',
  }))
  decideRecallGraphEdgeMock.mockImplementation(async () => ({
    ...recallGraph.edges[0],
    status: 'confirmed',
    provenance: 'manual',
  }))
  retrieveRecallMock.mockImplementation(async (query: string) => (query ? retrievalHits : []))
  reviewRecallStudyCardMock.mockImplementation(async (cardId: string) => ({
    ...studyCards[0],
    id: cardId,
    review_count: 1,
    status: 'scheduled',
    last_rating: 'good',
  }))
  createRecallNoteMock.mockImplementation(async (documentId: string, payload: { anchor: RecallNoteRecord['anchor']; body_text?: string | null }) => {
    const nextNote = {
      id: `note-${documentId}-${(recallNotesByDocument[documentId]?.length ?? 0) + 1}`,
      anchor: payload.anchor,
      body_text: payload.body_text ?? null,
      created_at: '2026-03-13T00:10:00Z',
      updated_at: '2026-03-13T00:10:00Z',
    }
    recallNotesByDocument[documentId] = [nextNote, ...(recallNotesByDocument[documentId] ?? [])]
    return nextNote
  })
  updateRecallNoteMock.mockImplementation(async (noteId: string, payload: { body_text?: string | null }) => {
    const [documentId, existingNote] =
      Object.entries(recallNotesByDocument)
        .flatMap(([candidateDocumentId, notes]) =>
          notes
            .filter((note) => note.id === noteId)
            .map((note) => [candidateDocumentId, note] as const),
        )[0] ?? []
    if (!documentId || !existingNote) {
      throw new Error('Note not found.')
    }
    const updatedNote = {
      ...existingNote,
      body_text: payload.body_text ?? null,
      updated_at: '2026-03-13T00:15:00Z',
    }
    recallNotesByDocument[documentId] = recallNotesByDocument[documentId].map((note) =>
      note.id === noteId ? updatedNote : note,
    )
    return updatedNote
  })
  deleteRecallNoteMock.mockImplementation(async (noteId: string) => {
    recallNotesByDocument = Object.fromEntries(
      Object.entries(recallNotesByDocument).map(([documentId, notes]) => [
        documentId,
        notes.filter((note) => note.id !== noteId),
      ]),
    )
  })
  searchRecallNotesMock.mockImplementation(async (query: string, limit = 20, documentId?: string | null) => {
    void limit
    const normalized = query.toLowerCase()
    return Object.entries(recallNotesByDocument)
      .filter(([candidateDocumentId]) => !documentId || candidateDocumentId === documentId)
      .flatMap(([, notes]) => notes)
      .filter((note) =>
        `${note.anchor.anchor_text} ${note.anchor.excerpt_text} ${note.body_text ?? ''}`
          .toLowerCase()
          .includes(normalized),
      )
      .map<RecallNoteSearchHit>((note) => ({
        ...note,
        document_title: recallDocuments.find((document) => document.id === note.anchor.source_document_id)?.title ?? 'Saved note',
        score: 0.91,
      }))
  })
  saveProgressMock.mockImplementation(async () => ({ ok: true }))
  saveSettingsMock.mockImplementation(async (nextSettings: ReaderSettings) => nextSettings)
  Object.defineProperty(window, 'confirm', {
    configurable: true,
    value: vi.fn(() => true),
  })
  mockSpeechState.isSupported = true
  mockSpeechState.isSpeaking = false
  mockSpeechState.isPaused = false
  mockSpeechState.currentSentenceIndex = 0
  mockSpeechState.voiceChoices = [{ id: 'default', label: 'Default voice', name: 'default' }]
  mockSpeechState.start.mockReset()
  mockSpeechState.stop.mockReset()
  mockSpeechState.pause.mockReset()
  mockSpeechState.resume.mockReset()
  mockSpeechState.previous.mockReset()
  mockSpeechState.next.mockReset()
  mockSpeechState.jumpTo.mockReset()
})

async function ensureLibraryOpen() {
  const librarySection = screen.getByRole('heading', { name: 'Source library', level: 2 }).closest('section')
  expect(librarySection).not.toBeNull()

  const showButton = within(librarySection as HTMLElement).queryByRole('button', { name: 'Show' })
  if (showButton) {
    fireEvent.click(showButton)
  }
  await waitFor(() => {
    expect(within(librarySection as HTMLElement).getByRole('button', { name: 'Hide' })).toBeInTheDocument()
  })
}

async function ensureImportPanelOpen() {
  const importSection = screen.getByRole('heading', { name: 'Add source', level: 2 }).closest('section')
  expect(importSection).not.toBeNull()

  const importButton = within(importSection as HTMLElement).queryByRole('button', { name: 'Show' })
  if (importButton) {
    fireEvent.click(importButton)
  }
  await waitFor(() => {
    expect(screen.getByPlaceholderText('Paste text here')).toBeInTheDocument()
  })
}

function renderRecallApp(path = '/') {
  window.history.pushState({}, '', path)
  render(<App />)
}

test('app lands on Recall by default and normalizes the URL to /recall', async () => {
  renderRecallApp('/')

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
  })

  expect(screen.getByRole('heading', { name: 'Recall', level: 1 })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Source library', level: 2 })).toBeInTheDocument()
  expect(fetchRecallDocumentsMock).toHaveBeenCalled()
})

test('Recall shows unavailable states when its initial API loads fail', async () => {
  fetchRecallDocumentsMock.mockRejectedValueOnce(new Error(localServiceUnavailableMessage))
  fetchRecallGraphMock.mockRejectedValueOnce(new Error(localServiceUnavailableMessage))
  fetchRecallStudyOverviewMock.mockRejectedValueOnce(new Error(localServiceUnavailableMessage))
  fetchRecallStudyCardsMock.mockRejectedValueOnce(new Error(localServiceUnavailableMessage))

  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByText(localServiceUnavailableMessage)).toBeInTheDocument()
  })

  expect(screen.getAllByText('Library unavailable').length).toBeGreaterThan(0)
  await waitFor(() => {
    expect(screen.getAllByText('Graph unavailable').length).toBeGreaterThan(0)
    expect(screen.getByText('Study unavailable')).toBeInTheDocument()
  })
  expect(screen.getAllByRole('button', { name: 'Retry loading' }).length).toBeGreaterThan(0)
})

test('Recall retry recovers after a transient initial load failure', async () => {
  fetchRecallDocumentsMock.mockRejectedValueOnce(new Error(localServiceUnavailableMessage))
  fetchRecallGraphMock.mockRejectedValueOnce(new Error(localServiceUnavailableMessage))
  fetchRecallStudyOverviewMock.mockRejectedValueOnce(new Error(localServiceUnavailableMessage))
  fetchRecallStudyCardsMock.mockRejectedValueOnce(new Error(localServiceUnavailableMessage))

  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByText(localServiceUnavailableMessage)).toBeInTheDocument()
  })

  fireEvent.click(screen.getAllByRole('button', { name: 'Retry loading' })[0])

  await waitFor(() => {
    expect(screen.getAllByText('2 source documents').length).toBeGreaterThan(0)
  })

  await waitFor(() => {
    expect(screen.getByText('2 visible nodes')).toBeInTheDocument()
    expect(screen.getByText('2 cards')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open in Reader' })).toBeInTheDocument()
  })
})

test('Recall hybrid retrieval shows graph-aware hits and keeps export on the selected document', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Document detail', level: 2 })).toBeInTheDocument()
  })

  fireEvent.change(screen.getByRole('searchbox', { name: 'Search saved knowledge' }), {
    target: { value: 'Search sentence' },
  })

  await waitFor(() => {
    expect(retrieveRecallMock).toHaveBeenCalledWith('Search sentence')
  })

  expect(screen.getByText('graph label match')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Export Markdown' })).toHaveAttribute(
    'href',
    '/api/recall/documents/doc-search/export.md',
  )
})

test('Recall graph shows node detail and lets the user confirm an inferred edge', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Graph', selected: false })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Graph' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Node detail', level: 2 })).toBeInTheDocument()
  })

  expect(screen.getAllByText('Knowledge Graphs support Study Cards.').length).toBeGreaterThan(0)
  fireEvent.click(screen.getAllByRole('button', { name: 'Confirm' })[0])

  await waitFor(() => {
    expect(decideRecallGraphEdgeMock).toHaveBeenCalledWith('edge-graph-supports-card', 'confirmed')
  })
})

test('Recall study queue shows an active card and records a review after revealing the answer', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Study', selected: false })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Study' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Active card', level: 2 })).toBeInTheDocument()
  })

  expect(screen.getAllByText('What do Knowledge Graphs support?').length).toBeGreaterThan(0)
  fireEvent.click(screen.getByRole('button', { name: 'Show answer' }))
  expect(screen.getByText('Study Cards')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Good' }))

  await waitFor(() => {
    expect(reviewRecallStudyCardMock).toHaveBeenCalledWith('card-1', 'good')
  })
})

test('Recall handoff opens the selected document in Reader', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Open in Reader' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Open in Reader' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
  })

  expect(window.location.search).toContain('document=doc-search')
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })
})

test('returning from Reader restores the prior Recall section', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Graph', selected: false })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Graph' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Graph', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Node detail', level: 2 })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Reader' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
    expect(screen.getByRole('tab', { name: 'Reader', selected: true })).toBeInTheDocument()
  })

  window.history.back()
  window.dispatchEvent(new PopStateEvent('popstate'))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('tab', { name: 'Graph', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Node detail', level: 2 })).toBeInTheDocument()
  })
})

test('Recall retrieval note hits open the Notes section with the selected note', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('searchbox', { name: 'Search saved knowledge' })).toBeInTheDocument()
  })

  fireEvent.change(screen.getByRole('searchbox', { name: 'Search saved knowledge' }), {
    target: { value: 'Useful search note' },
  })

  await waitFor(() => {
    expect(retrieveRecallMock).toHaveBeenCalledWith('Useful search note')
  })

  fireEvent.click(screen.getByText('Useful search note.').closest('button')!)

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Notes', selected: true })).toBeInTheDocument()
  })

  expect(screen.getByRole('heading', { name: 'Note detail', level: 2 })).toBeInTheDocument()
  expect(screen.getByDisplayValue('Useful search note.')).toBeInTheDocument()
})

test('Recall notes search and Open in Reader restore the anchored sentence range', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Notes', selected: false })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Notes' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Note detail', level: 2 })).toBeInTheDocument()
  })

  fireEvent.change(screen.getByRole('searchbox', { name: 'Search notes' }), {
    target: { value: 'Useful search note' },
  })

  await waitFor(() => {
    expect(searchRecallNotesMock).toHaveBeenCalledWith('Useful search note', 20, 'doc-search')
  })

  fireEvent.click(screen.getByRole('button', { name: 'Open in Reader' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
  })

  expect(window.location.search).toContain('document=doc-search')
  expect(window.location.search).toContain('sentenceStart=0')
  expect(window.location.search).toContain('sentenceEnd=1')

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Search sentence one.' })).toHaveClass('reader-sentence-anchored')
  })
  expect(screen.getByRole('button', { name: 'Search sentence two.' })).toHaveClass('reader-sentence-anchored')
})

test('Recall notes can be edited and deleted from the Notes tab', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Notes', selected: false })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Notes' }))

  await waitFor(() => {
    expect(screen.getByDisplayValue('Useful search note.')).toBeInTheDocument()
  })

  fireEvent.change(screen.getByRole('textbox', { name: 'Note text' }), {
    target: { value: 'Updated note text.' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

  await waitFor(() => {
    expect(updateRecallNoteMock).toHaveBeenCalledWith('note-search-1', {
      body_text: 'Updated note text.',
    })
  })

  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

  await waitFor(() => {
    expect(deleteRecallNoteMock).toHaveBeenCalledWith('note-search-1')
  })

  await waitFor(() => {
    expect(screen.getByText('Note deleted.')).toBeInTheDocument()
  })
})

test('library selection updates the reader and search does not replace the active document', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  await ensureLibraryOpen()
  await waitFor(() => {
    expect(screen.getByTitle('Reader stays here')).toBeInTheDocument()
  })
  fireEvent.click(screen.getByTitle('Reader stays here'))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Reader stays here', level: 2 })).toBeInTheDocument()
  })

  await ensureLibraryOpen()
  await waitFor(() => {
    expect(screen.getByTitle('Search target only')).toBeInTheDocument()
  })
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), {
    target: { value: 'Search target' },
  })

  await waitFor(() => {
    expect(screen.getByTitle('Search target only')).toBeInTheDocument()
  })

  expect(screen.getByRole('heading', { name: 'Reader stays here', level: 2 })).toBeInTheDocument()
})

test('Reader shows a service unavailable state when initial document loading fails', async () => {
  fetchDocumentsMock.mockRejectedValueOnce(new Error(localServiceUnavailableMessage))

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Reader is temporarily unavailable', level: 2 })).toBeInTheDocument()
  })

  expect(screen.getByText(localServiceUnavailableMessage)).toBeInTheDocument()
  expect(screen.getByPlaceholderText('Paste text here')).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: 'Retry loading' }).length).toBeGreaterThan(0)
  expect(screen.queryByRole('heading', { name: 'Open a source to start reading', level: 2 })).not.toBeInTheDocument()
})

test('Reader note capture saves a source-linked note and keeps normal jump behavior outside note mode', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Add note' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Add note' }))
  fireEvent.click(screen.getByRole('button', { name: 'Search sentence one.' }))

  expect(mockSpeechState.jumpTo).not.toHaveBeenCalled()

  fireEvent.click(screen.getByRole('button', { name: 'Search sentence two.' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Optional note' }), {
    target: { value: 'Second saved note.' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Save note' }))

  await waitFor(() => {
    expect(createRecallNoteMock).toHaveBeenCalledWith(
      'doc-search',
      expect.objectContaining({
        anchor: expect.objectContaining({
          block_id: 'search-1',
          sentence_start: 0,
          sentence_end: 1,
          variant_id: 'variant-doc-search-reflowed',
        }),
        body_text: 'Second saved note.',
      }),
    )
  })

  await waitFor(() => {
    expect(screen.getAllByText('2 notes').length).toBeGreaterThan(0)
  })

  fireEvent.click(screen.getByRole('button', { name: 'Search sentence one.' }))

  expect(mockSpeechState.jumpTo).toHaveBeenCalledWith(0)
})

test('settings stay off the page until the settings drawer is opened and default to Appearance without a document', async () => {
  fetchDocumentsMock.mockImplementation(async () => [])

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })

  expect(screen.queryByRole('dialog', { name: 'Settings' })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Appearance', level: 3 })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Settings' }))

  const settingsDrawer = screen.getByRole('dialog', { name: 'Settings' })
  const sections = within(settingsDrawer).getByRole('tablist', { name: 'Settings sections' })
  expect(within(sections).queryByRole('tab', { name: 'View' })).not.toBeInTheDocument()
  expect(within(sections).getByRole('tab', { name: 'Appearance', selected: true })).toBeInTheDocument()
  expect(within(sections).getByRole('tab', { name: 'Layout', selected: false })).toBeInTheDocument()
  expect(within(settingsDrawer).getByRole('heading', { name: 'Appearance', level: 3 })).toBeInTheDocument()
  expect(within(settingsDrawer).queryByRole('heading', { name: 'Layout', level: 3 })).not.toBeInTheDocument()
  expect(within(settingsDrawer).getByRole('group', { name: 'App theme' })).toBeInTheDocument()
})

test('there is no standalone top appearance bar in either empty or active reading states', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })

  expect(screen.queryByRole('heading', { name: 'App appearance', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'App and reading settings', level: 2 })).not.toBeInTheDocument()

  expect(screen.queryByRole('heading', { name: 'App appearance', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'App and reading settings', level: 2 })).not.toBeInTheDocument()
})

test('settings drawer defaults to View when a document is open and changing view updates the reader immediately', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  await ensureLibraryOpen()
  await waitFor(() => {
    expect(screen.getByTitle('Reader stays here')).toBeInTheDocument()
  })
  fireEvent.click(screen.getByTitle('Reader stays here'))

  await waitFor(() => {
    expect(screen.getByRole('article', { name: 'Reader stays here' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Settings' }))

  const settingsDrawer = screen.getByRole('dialog', { name: 'Settings' })
  const sections = within(settingsDrawer).getByRole('tablist', { name: 'Settings sections' })

  expect(within(sections).getByRole('tab', { name: 'View', selected: true })).toBeInTheDocument()
  expect(within(sections).getByRole('tab', { name: 'Appearance', selected: false })).toBeInTheDocument()
  expect(within(sections).getByRole('tab', { name: 'Layout', selected: false })).toBeInTheDocument()
  expect(within(settingsDrawer).getByRole('heading', { name: 'View', level: 3 })).toBeInTheDocument()
  expect(within(settingsDrawer).getByRole('group', { name: 'Document view' })).toBeInTheDocument()

  fireEvent.click(within(settingsDrawer).getByRole('button', { name: 'Original view' }))

  await waitFor(() => {
    expect(screen.getByText('Original reader sentence one.')).toBeInTheDocument()
  })

  const readerHeader = screen.getByRole('heading', { name: 'Reader stays here', level: 2 }).closest('header')
  expect(readerHeader).not.toBeNull()
  expect(within(readerHeader as HTMLElement).getByText('Original')).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'View', level: 3 })).toBeInTheDocument()
})

test('theme labels show Sepia and Charcoal while persisting soft/high values', async () => {
  fetchDocumentsMock.mockImplementation(async () => [])

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Settings' }))

  const appThemeGroup = within(screen.getByRole('dialog', { name: 'Settings' })).getByRole('group', {
    name: 'App theme',
  })
  expect(within(appThemeGroup).getByRole('button', { name: 'Sepia app theme' })).toBeInTheDocument()
  expect(within(appThemeGroup).getByRole('button', { name: 'Charcoal app theme' })).toBeInTheDocument()

  fireEvent.click(within(appThemeGroup).getByRole('button', { name: 'Charcoal app theme' }))

  await waitFor(() => {
    expect(saveSettingsMock).toHaveBeenLastCalledWith(expect.objectContaining({ contrast_theme: 'high' }))
  })
})

test('theme switching still changes the whole app shell from inside the settings drawer', async () => {
  fetchDocumentsMock.mockImplementation(async () => [])

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })

  const appShell = document.querySelector('.app-shell')
  expect(appShell).not.toBeNull()
  expect(appShell).toHaveClass('theme-soft')

  fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
  fireEvent.click(
    within(screen.getByRole('dialog', { name: 'Settings' })).getByRole('button', {
      name: 'Charcoal app theme',
    }),
  )

  await waitFor(() => {
    expect(saveSettingsMock).toHaveBeenLastCalledWith(expect.objectContaining({ contrast_theme: 'high' }))
  })

  expect(appShell).toHaveClass('theme-high')
})

test('sidebar uses compact import and library wording while preserving the same actions', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Add source', level: 2 })).toBeInTheDocument()
  })

  expect(screen.getByRole('heading', { name: 'Source library', level: 2 })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Import text' })).toBeInTheDocument()
  expect(screen.getByText('Choose file')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Web page' })).toBeInTheDocument()
  expect(screen.getByPlaceholderText('Search saved sources')).toBeInTheDocument()
  expect(screen.queryByText('Info')).not.toBeInTheDocument()
})

test('web page import stays behind a compact disclosure and imports into the reader', async () => {
  importUrlDocumentMock.mockImplementation(async () => {
    const webDocument: DocumentRecord = {
      id: 'doc-web',
      title: 'Imported web article',
      source_type: 'web',
      created_at: '2026-03-13T00:00:00Z',
      updated_at: '2026-03-13T00:00:01Z',
      available_modes: ['original', 'reflowed'],
      progress_by_mode: {},
    }
    fetchDocumentsMock.mockImplementation(async (query = '') =>
      query ? [webDocument].filter((document) => document.title.toLowerCase().includes(query.toLowerCase())) : [webDocument, ...documents],
    )
    fetchDocumentViewMock.mockImplementation(async (documentId: string, mode: string) => {
      if (documentId === 'doc-web' && mode === 'reflowed') {
        return {
          mode: 'reflowed',
          detail_level: 'default',
          title: 'Imported web article',
          blocks: [{ id: 'web-1', kind: 'paragraph', text: 'Imported web sentence one. Imported web sentence two.' }],
          generated_by: 'local',
          cached: false,
          source_hash: 'web-hash',
          updated_at: '2026-03-13T00:00:01Z',
        }
      }
      return views[`${documentId}:${mode}`]
    })
    return webDocument
  })

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  expect(screen.queryByLabelText('Article URL')).not.toBeInTheDocument()

  await ensureImportPanelOpen()
  fireEvent.click(screen.getByRole('button', { name: 'Web page' }))
  fireEvent.change(screen.getByLabelText('Article URL'), {
    target: { value: 'example.com/article' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Import link' }))

  await waitFor(() => {
    expect(importUrlDocumentMock).toHaveBeenCalledWith('example.com/article')
  })

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Imported web article', level: 2 })).toBeInTheDocument()
  })

  await ensureLibraryOpen()
  expect(screen.getByTitle('Imported web article')).toBeInTheDocument()
  expect(screen.getByText(/WEB •/)).toBeInTheDocument()
})

test('web page import shows a bounded error without breaking the rest of the import panel', async () => {
  importUrlDocumentMock.mockRejectedValueOnce(new Error('Only public webpage articles are supported here.'))

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  await ensureImportPanelOpen()
  fireEvent.click(screen.getByRole('button', { name: 'Web page' }))
  fireEvent.change(screen.getByLabelText('Article URL'), {
    target: { value: 'https://example.com/app' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Import link' }))

  await waitFor(() => {
    expect(screen.getByText('Only public webpage articles are supported here.')).toBeInTheDocument()
  })

  expect(screen.getByRole('button', { name: 'Import text' })).toBeInTheDocument()
  expect(screen.getByText('Choose file')).toBeInTheDocument()
})

test('active reading collapses import by default and lets the user expand it on demand', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  await ensureLibraryOpen()
  fireEvent.click(screen.getByTitle('Reader stays here'))

  const importSection = screen.getByRole('heading', { name: 'Add source', level: 2 }).closest('section')
  expect(importSection).not.toBeNull()

  await waitFor(() => {
    expect(within(importSection as HTMLElement).getByRole('button', { name: 'Show' })).toBeInTheDocument()
  })

  expect(screen.getByRole('heading', { name: 'Add source', level: 2 })).toBeInTheDocument()
  expect(screen.queryByPlaceholderText('Paste text here')).not.toBeInTheDocument()

  await ensureImportPanelOpen()
  expect(screen.getByPlaceholderText('Paste text here')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Web page' })).toBeInTheDocument()
})

test('active reading collapses the library by default and lets the user expand it on demand', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  const librarySection = screen.getByRole('heading', { name: 'Source library', level: 2 }).closest('section')
  expect(librarySection).not.toBeNull()
  expect(within(librarySection as HTMLElement).getByRole('button', { name: 'Show' })).toBeInTheDocument()
  expect(screen.queryByPlaceholderText('Search saved sources')).not.toBeInTheDocument()

  await ensureLibraryOpen()
  expect(screen.getByPlaceholderText('Search saved sources')).toBeInTheDocument()
})

test('no-document mode shows a compact onboarding shell instead of full reader chrome', async () => {
  fetchDocumentsMock.mockImplementation(async () => [])

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Open a source to start reading', level: 2 })).toBeInTheDocument()
  })

  expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'App and reading settings', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Read aloud', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByText('Current document')).not.toBeInTheDocument()
})

test('reader hero uses Recall-first copy instead of standalone reader branding', async () => {
  fetchDocumentsMock.mockImplementation(async () => [])

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Reconnect what you already saved.', level: 1 })).toBeInTheDocument()
  })

  expect(
    screen.getByText(
      'Inspect shared source documents, validate graph suggestions, retrieve grounded context, and study from local source-backed cards.',
    ),
  ).toBeInTheDocument()
  expect(screen.queryByText('Accessible Reader')).not.toBeInTheDocument()
  expect(screen.queryByText('Read clearly. Keep your place.')).not.toBeInTheDocument()
})

test('reader area keeps one visible title and uses the compact header as the article label', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  await ensureLibraryOpen()
  fireEvent.click(screen.getByTitle('Reader stays here'))

  await waitFor(() => {
    expect(screen.getByRole('article', { name: 'Reader stays here' })).toBeInTheDocument()
  })

  expect(screen.getAllByRole('heading', { name: 'Reader stays here' })).toHaveLength(1)
  expect(screen.queryByText('Current document')).not.toBeInTheDocument()
  expect(screen.queryByText('Reading surface')).not.toBeInTheDocument()
})

test('reader header keeps the AI create action and metadata when a summary view has not been generated yet', async () => {
  const aiDocument: DocumentRecord = {
    ...documents[1],
    available_modes: ['original', 'reflowed', 'summary'],
  }

  fetchDocumentsMock.mockImplementation(async () => [aiDocument])
  fetchDocumentViewMock.mockImplementation(async (documentId: string, mode: string) => {
    if (documentId === aiDocument.id && mode === 'summary') {
      return undefined as unknown as DocumentView
    }

    return views[`${documentId}:${mode}`]
  })

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('article', { name: 'Reader stays here' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
  fireEvent.click(within(screen.getByRole('dialog', { name: 'Settings' })).getByRole('button', { name: 'Summary view' }))
  fireEvent.click(within(screen.getByRole('dialog', { name: 'Settings' })).getByRole('button', { name: 'Close' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Create summary' })).toBeInTheDocument()
  })

  const readerHeader = screen.getByRole('heading', { name: 'Reader stays here', level: 2 }).closest('header')
  expect(readerHeader).not.toBeNull()
  expect(within(readerHeader as HTMLElement).getByText('Summary')).toBeInTheDocument()
  expect(within(readerHeader as HTMLElement).queryByText('AI generated')).not.toBeInTheDocument()
  expect(within(readerHeader as HTMLElement).queryByText('Local')).not.toBeInTheDocument()
  expect(screen.getByText(/No summary yet/i)).toBeInTheDocument()
})

test('reader header keeps metadata minimal and only adds AI generated or cached when true', async () => {
  const aiDocument: DocumentRecord = {
    ...documents[1],
    available_modes: ['original', 'reflowed', 'summary'],
  }
  const summaryView: DocumentView = {
    mode: 'summary',
    detail_level: 'balanced',
    title: 'Reader stays here',
    blocks: [{ id: 'summary-1', kind: 'paragraph', text: 'Short AI summary.' }],
    generated_by: 'openai',
    cached: true,
    source_hash: 'summary-hash',
    updated_at: '2026-03-12T00:00:00Z',
  }

  fetchDocumentsMock.mockImplementation(async () => [aiDocument])
  fetchDocumentViewMock.mockImplementation(async (documentId: string, mode: string) => {
    if (documentId === aiDocument.id && mode === 'summary') {
      return summaryView
    }

    return views[`${documentId}:${mode}`]
  })

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('article', { name: 'Reader stays here' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
  fireEvent.click(within(screen.getByRole('dialog', { name: 'Settings' })).getByRole('button', { name: 'Summary view' }))

  await waitFor(() => {
    expect(screen.getByText('Short AI summary.')).toBeInTheDocument()
  })

  const readerHeader = screen.getByRole('heading', { name: 'Reader stays here', level: 2 }).closest('header')
  expect(readerHeader).not.toBeNull()
  expect(within(readerHeader as HTMLElement).getByText('Summary')).toBeInTheDocument()
  expect(within(readerHeader as HTMLElement).getByText('AI generated')).toBeInTheDocument()
  expect(within(readerHeader as HTMLElement).getByText('Cached')).toBeInTheDocument()
  expect(within(readerHeader as HTMLElement).queryByText('Local')).not.toBeInTheDocument()
})

test('main reading controls keep only transport visible and move secondary items into overflow', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Search sentence one.' })).toBeInTheDocument()
  })

  expect(screen.queryByRole('heading', { name: 'View', level: 3 })).not.toBeInTheDocument()
  expect(screen.queryByRole('group', { name: 'Document view' })).not.toBeInTheDocument()
  expect(screen.queryByText('Sentence 1 of 2')).not.toBeInTheDocument()
  expect(screen.queryByText('Tips')).not.toBeInTheDocument()
  expect(screen.queryByRole('combobox', { name: 'Voice' })).not.toBeInTheDocument()
  expect(screen.getByLabelText('Read aloud controls')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'More reading controls' }))

  const overflow = screen.getByRole('group', { name: 'More reading controls' })
  expect(within(overflow).getByText('Sentence 1 of 2')).toBeInTheDocument()
  expect(within(overflow).getByRole('combobox', { name: 'Voice' })).toBeInTheDocument()
  expect(within(overflow).getByText(/Shortcuts: Alt\+Left, Alt\+Right, or Space\./i)).toBeInTheDocument()
  expect(within(overflow).queryByRole('combobox', { name: 'Summary detail' })).not.toBeInTheDocument()
})

test('deleting an inactive document removes only that library item', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Search sentence one.' })).toBeInTheDocument()
  })

  await ensureLibraryOpen()

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'More actions for Reader stays here' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'More actions for Reader stays here' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

  await waitFor(() => {
    expect(deleteDocumentRecordMock).toHaveBeenCalledWith('doc-reader')
  })

  expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  expect(window.confirm).toHaveBeenCalledWith('Delete "Reader stays here" from this device?')
})

test('deleting the active document falls back to the newest remaining document', async () => {
  deleteDocumentRecordMock.mockImplementation(async (documentId: string) => {
    expect(documentId).toBe('doc-reader')
    fetchDocumentsMock.mockImplementation(async () => [documents[0]])
  })

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  await ensureLibraryOpen()
  await waitFor(() => {
    expect(screen.getByTitle('Reader stays here')).toBeInTheDocument()
  })
  fireEvent.click(screen.getByTitle('Reader stays here'))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Reader stays here', level: 2 })).toBeInTheDocument()
  })

  await ensureLibraryOpen()
  fireEvent.click(screen.getByRole('button', { name: /More actions for Reader stays here/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  expect(mockSpeechState.stop).toHaveBeenCalled()
})

test('summary detail lives inside the settings drawer view section only when summary is active', async () => {
  const summaryDocument: DocumentRecord = {
    ...documents[1],
    available_modes: ['original', 'reflowed', 'summary'],
  }

  fetchDocumentsMock.mockImplementation(async () => [summaryDocument])

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Reader sentence one.' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Settings' }))

  const settingsDrawer = screen.getByRole('dialog', { name: 'Settings' })
  expect(within(settingsDrawer).queryByRole('combobox', { name: 'Summary detail' })).not.toBeInTheDocument()

  fireEvent.click(within(settingsDrawer).getByRole('button', { name: 'Summary view' }))

  expect(within(settingsDrawer).getByRole('combobox', { name: 'Summary detail' })).toBeInTheDocument()
  expect(within(settingsDrawer).getByRole('group', { name: 'Document view' })).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'More reading controls' }))
  expect(within(screen.getByRole('group', { name: 'More reading controls' })).queryByRole('combobox', { name: 'Summary detail' })).not.toBeInTheDocument()
})

test('speech controls expose labeled transport buttons and start playback from the main toggle', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Search sentence one.' })).toBeInTheDocument()
  })

  const startButton = screen.getByRole('button', { name: 'Start read aloud' })
  expect(startButton).toHaveAttribute('title', 'Start read aloud')
  expect(screen.getByRole('button', { name: 'Previous sentence' })).toHaveAttribute('title', 'Previous sentence')
  expect(screen.getByRole('button', { name: 'Next sentence' })).toHaveAttribute('title', 'Next sentence')
  expect(screen.getByRole('button', { name: 'Stop read aloud' })).toHaveAttribute('title', 'Stop read aloud')

  fireEvent.click(startButton)

  expect(mockSpeechState.start).toHaveBeenCalledTimes(1)
})

test('speech controls switch the main transport button to pause while playback is active', async () => {
  mockSpeechState.isSpeaking = true

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Search sentence one.' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Pause read aloud' }))

  expect(mockSpeechState.pause).toHaveBeenCalledTimes(1)
})

test('reader progress saves include summary detail and accessibility snapshot metadata', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  await waitFor(() => {
    expect(saveProgressMock).toHaveBeenCalledWith(
      'doc-search',
      'reflowed',
      0,
      expect.objectContaining({
        summaryDetail: 'balanced',
        accessibilitySnapshot: expect.objectContaining({
          contrast_theme: 'soft',
          focus_mode: false,
          font_preset: 'system',
          line_spacing: 1.7,
          line_width: 72,
          preferred_voice: 'default',
          speech_rate: 1,
          text_size: 22,
        }),
      }),
    )
  })
})
